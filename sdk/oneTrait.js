import { allTraits} from './allTraits.js'
import localforage from 'https://cdn.skypack.dev/localforage';

console.log("------------------")
console.log("oneTrait.js loaded")
let trait = "Cancer"
const e = document.getElementById('myTrait2')

e.addEventListener("click", function (e) {
    console.log(" e.value", e.value)
});

let oneTraitDb = localforage.createInstance({
    name: "oneTraitDb",
    storeName: "scoreFiles"
})

let oneTraitDb2 = localforage.createInstance({
    name: "oneTraitDb",
    storeName: "traitFiles2"
})

let oneTrait = {
    functions: {},
    dt: {},

}
let oneTraitSubset = {
    functions: {},
    dt: {},

}

let pgsIds = []
allTraits.dt.traits.map(x => {
    if (trait.includes(x.trait)) {
        pgsIds.push(x.ids)
    }
}).flatMap(x => x)

//biuld object for one trait
oneTrait.dt = await getTraitFiles(trait)

//biuld object for one trait filtered by variant number
/*execute a function when someone clicks in the document:*/
const input2 = document.getElementById('myNum')
input2.addEventListener("click", function (e) {
    // closeAllLists(e.target);
    oneTraitSubset.dt = getscoreFiles2()
    console.log("oneTraitSubset.dt", oneTraitSubset.dt)
    console.log("click3")
    //div.hidden = false      
    // div2.innerHTML = `Found ${oneTraitSubset.dt.scoreFiles.length} scoring files for "${myTrait2.value}"`
    // select2.parentNode.appendChild(div2)

});



async function getTraitFiles(trait) {
    let arr = []
    var obj = {}
    let scores = await getscoreFiles(pgsIds[0])
    // get trait files that match selected trait from drop down
    allTraits.dt.traits.map(x => {
        if (trait.includes(x.trait)) {

            obj["pgsIds"] = x.ids
            obj["traitFiles"] = x.traitFiles
            obj["scoreFiles"] = scores
            obj["trait"] = x.trait
        }
    })
    return obj
}


async function getscoreFiles(pgsIds) {
    var scores = []
    let i = 0
    while (i < pgsIds.length) {
        let url = `https://www.pgscatalog.org/rest/score/${pgsIds[i]}`
        let cachedData = await oneTraitDb.getItem(url);
        //console.log("cachedData",cachedData)
        if (cachedData !== null) {
            scores.push(cachedData)

        } else if (cachedData == null) {
            let notCachedData =
                await (fetch(url)).then(function (response) {
                    return response.json()
                }).then(function (response) {
                    return response
                }).catch(function (ex) {
                    console.log("There has been an error: ", ex)
                })


            oneTraitDb.setItem(url, notCachedData);
            scores.push(notCachedData)
        }
        i += 1
    }
    return scores
}



//.sort().filter(e => e.length).map(JSON.stringify)), JSON.parse)
//console.log("traits2--------------------",traits2)

function getscoreFiles2() {
    let obj = {}
    let scores = oneTrait.dt.scoreFiles
    let trait = oneTrait.dt.trait
    let num = document.getElementById("myNum").value
    // filter scores by the number of variant in a file
    console.log("scores", scores)
    let scores2 = scores.filter(x => x.variants_number < num)
    obj["scoreFiles"] = scores2
    obj["trait"] = trait
    obj["variant_limit"] = num
    return obj
}



oneTrait.functions.loadPGS = async (i = 1) => {
    // startng with a default pgs 
    let div = PGS23.divPGS
    div.innerHTML = `<b style="color:maroon">A)</b> PGS # <input id="pgsID" value=${i} size=5 > <button id='btLoadPgs'>load</button><span id="showLargeFile" hidden=true><input id="checkLargeFile"type="checkbox">large file (under development)</span> 
    <span id="summarySpan" hidden=true>[<a id="urlPGS" href='' target="_blank">FTP</a>][<a id="catalogEntry" href="https://www.pgscatalog.org/score/${"PGS000000".slice(0, -JSON.stringify(i).length) + JSON.stringify(i)}" target="_blank">catalog</a>][<a id="pgsBuild" href="https://github.com/lorenasandoval88/diseasomes/pgs/?id=4" target="_blank">build</a>]<span id="largeFile"></span><br><span id="trait_mapped">...</span>, <span id="dataRows">...</span> variants, [<a id="pubDOI" target="_blank">Reference</a>], [<a href="#" id="objJSON">JSON</a>].</span>
    <p><textarea id="pgsTextArea" style="background-color:black;color:lime" cols=60 rows=5>...</textarea></p>`;

    div.querySelector('#pgsID').onkeyup = (evt => {
        document.getElementById("catalogEntry").href = `https://www.pgscatalog.org/score/${"PGS000000".slice(0, -pgsID.value.length) + pgsID.value}`
        if (evt.keyCode == 13) {
            div.querySelector('#btLoadPgs').click()
        }
    })

    PGS23.pgsTextArea = div.querySelector('#pgsTextArea')
    div.querySelector('#btLoadPgs').onclick = async (evt) => {
        document.querySelector('#summarySpan').hidden = true
        PGS23.pgsTextArea.value = '... loading'
        i = parseInt(div.querySelector('#pgsID').value)
        document.getElementById("pgsBuild").href = `https://github.com/lorenasandoval88/diseasomes/?id=${i}`
        let PGSstr = i.toString()
        PGSstr = "PGS000000".slice(0, -PGSstr.length) + PGSstr
        div.querySelector('#urlPGS').href = `https://ftp.ebi.ac.uk/pub/databases/spot/pgs/scores/${PGSstr}/ScoringFiles/Harmonized/`
        //check pgs file size
        let fsize = (await fetch(`https://ftp.ebi.ac.uk/pub/databases/spot/pgs/scores/${PGSstr}/ScoringFiles/Harmonized/${PGSstr}_hmPOS_GRCh37.txt.gz`, {
            method: 'HEAD'
        })).headers.get('Content-Length');
        if ((fsize > 1000000) & (!div.querySelector('#checkLargeFile').checked)) {
            console.log('largeFile processing ...')
            //div.querySelector('#summarySpan').hidden = true
            let data = document.getElementById("PGS23oneTrait").PGS23data
            if (data.pgs) {
                delete data.pgs
            }
            PGS23.pgsTextArea.value += ` ... whoa! ... this is a large PGS entry, over ${Math.floor(fsize / 1000000)}Mb. If you still want to process it please check "large file" above and press load again. Don't do this if you are not ready to wait ...`
            div.querySelector('#summarySpan').hidden = true
            div.querySelector('#showLargeFile').style.backgroundColor = 'yellow'
            div.querySelector('#showLargeFile').style.color = 'red'
            div.querySelector('#showLargeFile').hidden = false
            div.querySelector('#checkLargeFile').checked = false
            setTimeout(_ => {
                div.querySelector('#showLargeFile').style.backgroundColor = ''
                div.querySelector('#showLargeFile').style.color = ''
                //div.querySelector('#summarySpan').hidden = true
            }, 2000)
        } else {
            if (div.querySelector('#checkLargeFile').checked) {
                PGS23.pgsTextArea.value = `... processing large file (this may not work, feature under development). If the wait gets too long, remember you can always reset by reloading the page.`
            }
            div.querySelector('#checkLargeFile').checked = false
            div.querySelector('#showLargeFile').hidden = true
            PGS23.pgsObj = await parsePGS(i)
            div.querySelector('#pubDOI').href = 'https://doi.org/' + PGS23.pgsObj.meta.citation.match(/doi\:.*$/)[0]
            div.querySelector('#trait_mapped').innerHTML = `<span style="color:maroon">${PGS23.pgsObj.meta.trait_mapped}</span>`
            div.querySelector('#dataRows').innerHTML = PGS23.pgsObj.dt.length
            if (PGS23.pgsObj.txt.length < 100000) {
                PGS23.pgsTextArea.value = PGS23.pgsObj.txt
            } else {
                PGS23.pgsTextArea.value = PGS23.pgsObj.txt.slice(0, 100000) + `...\n... (${PGS23.pgsObj.dt.length} variants) ...`
            }
            const cleanObj = structuredClone(PGS23.pgsObj)
            cleanObj.scores = cleanObj.txt.match(/^[^\n]*/)[0]
            delete cleanObj.txt
            PGS23.data.pgs = cleanObj
            div.querySelector('#summarySpan').hidden = false
        }
    };
    div.querySelector("#objJSON").onclick = evt => {
        let cleanObj = structuredClone(PGS23.pgsObj)
        cleanObj.scores = cleanObj.txt.match(/^[^\n]*/)[0]
        delete cleanObj.txt
        PGS23.saveFile(JSON.stringify(cleanObj), cleanObj.meta.pgs_id + '.json')
    }
}


async function parsePGS(i = 1) {
    let obj = {
        id: i
    }
    obj.txt = await pgs.loadScore(i)
    let rows = obj.txt.split(/[\r\n]/g)
    let metaL = rows.filter(r => (r[0] == '#')).length
    obj.meta = {
        txt: rows.slice(0, metaL)
    }
    obj.cols = rows[metaL].split(/\t/g)
    obj.dt = rows.slice(metaL + 1).map(r => r.split(/\t/g))
    if (obj.dt.slice(-1).length == 1) {
        obj.dt.pop(-1)
    }
    // parse numerical types
    const indInt = [obj.cols.indexOf('chr_position'), obj.cols.indexOf('hm_pos')]
    const indFloat = [obj.cols.indexOf('effect_weight'), obj.cols.indexOf('allelefrequency_effect')]
    const indBol = [obj.cols.indexOf('hm_match_chr'), obj.cols.indexOf('hm_match_pos')]

    // /* this is the efficient way to do it, but for large files it has memory issues
    obj.dt = obj.dt.map(r => {
        // for each data row
        indFloat.forEach(ind => {
            r[ind] = parseFloat(r[ind])
        })
        indInt.forEach(ind => {
            r[ind] = parseInt(r[ind])
        })
        indBol.forEach(ind => {
            r[ind] = (r[11] == 'True') ? true : false
        })
        return r
    })

    // parse metadata
    obj.meta.txt.filter(r => (r[1] != '#')).forEach(aa => {
        aa = aa.slice(1).split('=')
        obj.meta[aa[0]] = aa[1]
    })
    return obj
}

console.log("oneTrait:", oneTrait)
console.log("oneTraitSubset:", oneTraitSubset)

export {
    oneTrait,
    oneTraitSubset
}
