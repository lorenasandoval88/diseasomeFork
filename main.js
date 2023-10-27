console.log("----------------------------")
console.log("main.js loaded")
import { pgs} from './pgs.js'
import {JSZip} from "./dependencies.js";
import { allTraits} from './sdk/allTraits.js'

// This library uses ES6 modules

let PGS23 = {
    // a global variable that is not shared by main.js
    data: {}
}
PGS23.loadPGS = async (i=1) => {
   // startng with a default pgs 
   let div = PGS23.divPGS
   div.innerHTML = `<b style="color:maroon">A)</b> PGS # <input id="pgsID" value=${i} size=5 > <button id='btLoadPgs'>load</button><span id="showLargeFile" hidden=true><input id="checkLargeFile"type="checkbox">large file (under development)</span> 
   <span id="summarySpan" hidden=true>[<a id="urlPGS" href='' target="_blank">FTP</a>][<a id="catalogEntry" href="https://www.pgscatalog.org/score/${"PGS000000".slice(0, -JSON.stringify(i).length) + JSON.stringify(i)}" target="_blank">catalog</a>][<a id="pgsBuild" href="https://github.com/lorenasandoval88/diseasomes/pgs/?id=4" target="_blank">build</a>]<span id="largeFile"></span><br><span id="trait_mapped">...</span>, <span id="dataRows">...</span> variants, [<a id="pubDOI" target="_blank">Reference</a>], [<a href="#" id="objJSON">JSON</a>].</span>
   <p><textarea id="pgsTextArea" style="background-color:black;color:lime" cols=60 rows=5>...</textarea></p>`;
  
   div.querySelector('#pgsID').onkeyup = (evt=>{
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
            let data = document.getElementById("PGS23calc").PGS23data
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
            cleanObj.info = cleanObj.txt.match(/^[^\n]*/)[0]
            delete cleanObj.txt
            PGS23.data.pgs = cleanObj
            div.querySelector('#summarySpan').hidden = false
        }
    };
    div.querySelector("#objJSON").onclick = evt => {
        let cleanObj = structuredClone(PGS23.pgsObj)
        cleanObj.info = cleanObj.txt.match(/^[^\n]*/)[0]
        delete cleanObj.txt
        PGS23.saveFile(JSON.stringify(cleanObj), cleanObj.meta.pgs_id + '.json')
    }
}

PGS23.load23 = async () => {
    let div = PGS23.div23
    div.innerHTML =
        `<hr><b style="color:maroon">B)</b> Download <a href= "genome_Dorothy_Wolf_v4_Full_20170525101345.txt" download="genome_Dorothy_Wolf_v4_Full_20170525101345.txt">female </a> or <a href= "genome_Chad_Wrye_v5_Full_20220921063742.txt" download="genome_Chad_Wrye_v5_Full_20220921063742.txt">male </a> 
        public 23andme file from the <a id="PGP" href="https://my.pgp-hms.org/public_genetic_data?data_type=23andMe" target="_blank">Personal Genome Project (PGP)</a> and <input type="file" id="file23andMeInput">

    <br><span hidden=true id="my23hidden" style="font-size:small">
		 <span style="color:maroon" id="my23Info"></span> (<span id="my23variants"></span> variants) [<a href='#' id="json23">JSON</a>].
	</span>
	<p><textarea id="my23TextArea" style="background-color:black;color:lime" cols=60 rows=5>...</textarea></p>`
    div.querySelector('#file23andMeInput').onchange = evt => {
        function UI23(my23) {
            // user interface
            div.querySelector("#my23hidden").hidden = false
            div.querySelector("#my23Info").innerText = my23.info
            div.querySelector("#my23variants").innerText = my23.dt.length
            div.querySelector("#json23").onclick = _ => {
                PGS23.saveFile(JSON.stringify(my23), my23.info.replace(/\.[^\.]+$/, '') + '.json')
            }
            PGS23.data.my23 = my23
        }
        div.querySelector("#my23TextArea").value = '... loading'
        let readTxt = new FileReader()
        let readZip = new FileReader()
        readTxt.onload = ev => {

            let txt = ev.target.result;

            // Check for build 37 on 23andMe file
            let build37 = []
            let otherBuild = []
            let rows = txt.split(/[\r\n]+/g)
            let n = rows.filter(r => (r[0] == '#')).length
            for (var i = 0; i < n; i++) {
                if (rows[i].match(/(?:build 37)(.*)/)) {
                    build37.push(rows[i]);
                } else if(rows[i].match(/(?:build )(.*)/)){
                    otherBuild.push(rows[i]);
                }
            }
            if(build37.length > 0){
                div.querySelector("#my23TextArea").value = txt.slice(0, 10000).replace(/[^\r\n]+$/, '') + '\n\n .................. \n\n' + txt.slice(-300).replace(/^[^\r\n]+/, '')
                UI23(parse23(txt, evt.target.files[0].name))
            }else{
                div.querySelector("#my23TextArea").value = `ERROR: please load 23andMe file with reference build 37 \nFrom file: "${otherBuild}"`
            }
        }

        readZip.onload = ev => {
            let zip = new JSZip()
            zip.loadAsync(ev.target.result).then(zip => {
                let fnametxt = Object.getOwnPropertyNames(zip.files)[0]
                zip.file(fnametxt).async('string').then(txt => {
                    div.querySelector("#my23TextArea").value = txt.slice(0, 10000).replace(/[^\r\n]+$/, '') + '\n\n .................. \n\n' + txt.slice(-300).replace(/^[^\r\n]+/, '')
                    UI23(parse23(txt, evt.target.files[0].name))
                })
            })
        }

        if (evt.target.files[0].name.match(/\.txt$/)) {
            readTxt.readAsText(evt.target.files[0])
        } else if (evt.target.files[0].name.match(/\.zip$/)) {
            readZip.readAsArrayBuffer(evt.target.files[0])
        } else {
            console.error(`wrong file type, neither .txt nor .zip: "${evt.target.files[0].name}"`)
        }
    }
}

PGS23.loadCalc = async () => {

    let div = PGS23.divCalc
    div.innerHTML = `<hr>
	<b style="color:maroon">C)</b> Polygenic Risk Score (PRS)
	<p><button id="buttonCalculateRisk">Calculate Risk</button>
    <span id="hidenCalc" hidden=true>[<a href="#" id="matchesJSON">matches</a>][<a href="#" id="riskCalcScoreJSON">calculation</a>]</span> 
    <input id="progressCalc" type="range" value=0 hidden=false>
    </p>
	<textarea id="my23CalcTextArea" style="background-color:black;color:lime" cols=60 rows=5>...</textarea>

	<div id="plotRiskDiv" style="height:300px;">

    <hr><div>If you want to see the current state of the two data objects try <code>data = document.getElementById("PGS23calc").PGS23data</code> in the browser console</div><hr>
    <div id="errorDiv"></div>

    <div id="tabulateAllMatchByEffectDiv"></div>
    <div style="height:250px;" id="pieChartDiv">...</div>
    <div style="height:300px;" id="plotAllMatchByEffectDiv">...</div>
    </div>
	`
    div.querySelector('#matchesJSON').onclick = evt => {

        let data = document.getElementById("PGS23calc").PGS23data
        PGS23.saveFile(JSON.stringify(data.pgsMatchMy23), data.my23.info.slice(0, -4) + '_match_PGS_calcRiskScore' + data.pgs.id + '.json')

    }
    div.querySelector('#riskCalcScoreJSON').onclick = evt => {
        let data = document.getElementById("PGS23calc").PGS23data
        PGS23.saveFile(JSON.stringify(data.calcRiskScore), data.my23.info.slice(0, -4) + '_individual_RiskScores' + data.pgs.id + '.json')

    }
    div.querySelector('#buttonCalculateRisk').onclick = evt => {
        let hidenCalc = div.querySelector('#hidenCalc')
        let my23TextArea = div.querySelector('#my23CalcTextArea')
        my23CalcTextArea.value = '...'
        hidenCalc.hidden = true
        let data = document.getElementById("PGS23calc").PGS23data

        if (!data.pgs) {
            my23CalcTextArea.value += '\n... no PGS entry selected, please do that in A.'
        }
        if (!data.my23) {
            my23CalcTextArea.value += '\n... no 23andme report provided, please do that in B.'
        }
        if ((!!data.my23) & (!!data.pgs)) {
            my23CalcTextArea.value = `... looking for matches between ${data.my23.dt.length} genomic positions 
            and ${data.pgs.dt.length} ${data.pgs.meta.trait_mapped} variants (PGS#${data.pgs.id}). \n...`
            document.querySelector('#buttonCalculateRisk').disabled = true
            document.querySelector('#buttonCalculateRisk').style.color = 'silver'
            data.pgsMatchMy23 = []
            PGS23.Match2(data)
        }
    }

}

// MATCH 23andme chromosome and position TO PGS chromosome and position 
PGS23.Match2 = function (data, progressReport) {
    // extract harmonized data from PGS entry first
    const indChr = data.pgs.cols.indexOf('hm_chr')
    const indPos = data.pgs.cols.indexOf('hm_pos')
    const indOther_allele = data.pgs.cols.indexOf('other_allele')
    const indEffect_allele = data.pgs.cols.indexOf('effect_allele')
    const indGenotype = data.my23.cols.indexOf('genotype')

    // match
    let dtMatch = []

    const n = data.pgs.dt.length
    let progressCalc = document.getElementById('progressCalc')
    progressCalc.hidden = false
    let i = 0
    let j = 0 //index of last match, the nex can match will have to be beyond this point since both pgs and 23and me are sorted by chr/position
    //let matchFloor=0 // to advance the earliest match as it advances
    function funMatch(i = 0, matchFloor = 0) {
        if (i < n) {
            let r = data.pgs.dt[i]

            //also filter 23 and me variants if they don't match pgs alt or effect allele 
            let regexPattern = new RegExp([r[indEffect_allele], r[indOther_allele]].join('|'))

            if (dtMatch.length > 0) {
                matchFloor = dtMatch.at(-1)[0][4]
                //console.log(matchFloor)
            }
            let dtMatch_i = data.my23.dt.filter(myr => (myr[2] == r[indPos]))
                .filter(myr => (myr[1] == r[indChr]))
            // remove 23 variants that don't match pgs effect or other allele    
                .filter(myr => regexPattern.test(myr[indGenotype])) 
            //let dtMatch_i = data.my23.dt.slice(matchFloor).filter(myr=>(myr[2] == r[indPos])).filter(myr=>(myr[1] == r[indChr]))


            if (dtMatch_i.length > 0) {
                dtMatch.push(dtMatch_i.concat([r]))
            }
            progressCalc.value = 100 * i / n
            setTimeout(() => {
                funMatch(i + 1)
            }, 0)
        } else {

            data.pgsMatchMy23 = dtMatch
            let calcRiskScore = []
            let alleles = []
            // calculate Risk
            let logR = 0
            // log(0)=1
            let ind_effect_weight = data.pgs.cols.indexOf('effect_weight')
            dtMatch.forEach((m, i) => {
                calcRiskScore[i] = 0
                // default no risk
                alleles[i] = 0
                // default no alele
                let mi = m[0][3].match(/^[ACGT]{2}$/)
                // we'll only consider duplets in the 23adme report
                if (mi) {
                    //'effect_allele', 'other_allele', 'effect_weight'
                    mi = mi[0]
                    // 23andme match
                    let pi = m.at(-1)
                    //pgs match
                    let alele = pi[indEffect_allele]
                    let L = mi.match(RegExp(alele, 'g'))
                    // how many, 0,1, or 2
                    if (L) {
                        L = L.length
                        calcRiskScore[i] = L * pi[ind_effect_weight]
                        alleles[i] = L
                    }
                }
            })
            data.alleles = alleles
            data.calcRiskScore = calcRiskScore
            let weight_idx = data.pgs.cols.indexOf('effect_weight')
            let weights = data.pgs.dt.map(row => row[weight_idx])
            // warning: no matches found!
            if (calcRiskScore.length == 0) { 
                console.log('there are no matches :-(')
                document.getElementById('my23CalcTextArea').value += ` Found ${data.pgsMatchMy23.length} PGS matches to the 23andme report.`
                document.getElementById('plotRiskDiv').hidden = true
                document.getElementById('hidenCalc').hidden = false
                plot.plotAllMatchByEffect4(data = PGS23.data, document.getElementById('errorDiv'),document.getElementById('plotAllMatchByEffectDiv') )          
        // all betas greater than zero
        //} else if (data.pgs.dt[weight_idx].reduce((a, b) => Math.min(a, b)) > -0.00002 ) { //&&(calcRiskScore.reduce((a,b)=>Math.max(a,b))<=1)){ // hazard ratios?
            } else if (weights.reduce((a, b) => Math.min(a, b)) > -0.00002 ) { //&&(calcRiskScore.reduce((a,b)=>Math.max(a,b))<=1)){ // hazard ratios?
                console.log('these are not betas :-(',weights) 
                //console.log('these are not betas :-(',calcRiskScore.map((a) => a)) weights
                document.getElementById('my23CalcTextArea').value += ` Found ${data.pgsMatchMy23.length} PGS matches to the 23andme report.`
                document.getElementById('my23CalcTextArea').value += ` However, these don't look right (betas = false), QAQC FAILED ! ... You could look for another entry for the same trait where betas pass QAQC, maybe give it a try at https://www.pgscatalog.org/search/?q=${data.pgs.meta.trait_mapped.replace(' ','+')}.`
                document.getElementById('plotRiskDiv').hidden = true
                document.getElementById('hidenCalc').hidden = false
                plot.plotAllMatchByEffect4(data = PGS23.data,  document.getElementById('errorDiv'),document.getElementById('plotAllMatchByEffectDiv') )          
                plot.pieChart(PGS23.data)
            // large betas over 100
           // }else if (calcRiskScore.reduce((a, b) => Math.max(a, b)) > 100) { //&&(calcRiskScore.reduce((a,b)=>Math.max(a,b))<=1)){ // hazard ratios?
                console.log('these are large betas :-(',weights)
                document.getElementById('my23CalcTextArea').value += ` Found ${data.pgsMatchMy23.length} PGS matches to the 23andme report.`
                document.getElementById('my23CalcTextArea').value += ` However, these don't look right (betas = false), QAQC FAILED ! ... You could look for another entry for the same trait where betas pass QAQC, maybe give it a try at https://www.pgscatalog.org/search/?q=${data.pgs.meta.trait_mapped.replace(' ','+')}.`
                document.getElementById('plotRiskDiv').hidden = true
                document.getElementById('hidenCalc').hidden = false
                data.PRS = Math.exp(calcRiskScore.reduce((a, b) => a + b))
                plot.plotAllMatchByEffect4(data = PGS23.data, document.getElementById('errorDiv'), document.getElementById('plotAllMatchByEffectDiv') )          
                plot.pieChart(PGS23.data)
            } else {
                data.PRS = Math.exp(calcRiskScore.reduce((a, b) => a + b))
                document.getElementById('my23CalcTextArea').value += ` Polygenic Risk Score, PRS=${Math.round(data.PRS * 1000) / 1000}, calculated from ${data.pgsMatchMy23.length} PGS matches to the 23andme report.`
                //my23CalcTextArea.value+=` ${data.pgsMatchMy23.length} PGS matches to the 23andme report.`
                document.getElementById('plotRiskDiv').hidden = false
                document.getElementById('hidenCalc').hidden = false
                //ploting
                plot.plotAllMatchByEffect4(data = PGS23.data,document.getElementById('errorDiv'), document.getElementById('plotAllMatchByEffectDiv') )          
                plot.pieChart(PGS23.data)
            }
            document.querySelector('#buttonCalculateRisk').disabled = false
            document.querySelector('#buttonCalculateRisk').style.color = 'blue'
        }

    }
    funMatch()
}

function ui() {

    let div = document.getElementById('calcDiv')
    var h1= document.createElement('H1');
    h1.innerHTML = "Description";
    div.appendChild(h1)
    div.innerHTML = `
    <br><h5>Individual polygenic risk score calculation (PRS) for 23andme reports, using the PGS Catalog.</h5><span style="font-size:medium;">
	Below you can select, and inspect, <b style="color:maroon">A)</b> the <a href='https://www.pgscatalog.org' target="_blank">PGS Catalog</a> entries with risk scores for a list of genomic variations; and <b style="color:maroon">B)</b> <a href="https://you.23andme.com/tools/data/download" target="_blank">Your 23andMe data download</a>. Once you have both (A) and (B), you can proceed to <b style="color:maroon">C)</b> to calculate your raw polygenic risk score for the trait targeted by the PGS entry based on <br>PRS  =  exp( ∑ ( 𝛽 * z )). Where β is the effect size (or beta) of one variant and z is the number of copies of the effect allele in that 23andme individual.
    </span>
    <hr>
    `
    // recall that PGS23 is only global to the module, it is not exported
    PGS23.divPGS = document.createElement('div');
    div.appendChild(PGS23.divPGS)
    PGS23.divPGS.id = "divPGS"

    PGS23.divPGSPlot = document.createElement('div');
    div.appendChild(PGS23.divPGSPlot)
    PGS23.divPGSPlot.id = "divPGSPlot"

    PGS23.div23 = document.createElement('div');
    div.appendChild(PGS23.div23)
    PGS23.divCalc = document.createElement('div');
    div.appendChild(PGS23.divCalc)
    PGS23.divCalc.id = "PGS23calc"
    PGS23.divCalc.PGS23data = PGS23.data

    div.PGS23 = PGS23
    // mapping the module global variable to the UI ... discuss
    PGS23.div = div
    // for convenience, mapping the in multiple ways
    PGS23.loadPGS()
    PGS23.load23()
    PGS23.loadCalc()
}
function parse23(txt, info) {
    // normally info is the file name
    let obj = {}
    let rows = txt.split(/[\r\n]+/g)
    let n = rows.filter(r => (r[0] == '#')).length
    obj.meta = rows.slice(0, n - 1).join('\r\n')
    obj.cols = rows[n - 1].slice(2).split(/\t/)
    obj.dt = rows.slice(n)
    obj.dt = obj.dt.map((r, i) => {
        r = r.split('\t')
        r[2] = parseInt(r[2])
        // position in the chr
        r[4] = i
        return r
    })
    obj.info = info
    return obj
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




PGS23.saveFile = async function (x, fileName) {
    // x is the content of the file
    // var bb = new Blob([x], {type: 'application/octet-binary'});
    // see also https://github.com/eligrey/FileSaver.js
    var bb = new Blob([x]);
    var url = URL.createObjectURL(bb);
    var a = document.createElement('a');
    a.href = url;
    if (fileName) {
        if (typeof (fileName) == "string") {
            // otherwise this is just a boolean toggle or something of the sort
            a.download = fileName;
        }
        a.click()
        // then download it automatically 
    }
    return a
}




export {
    ui,
    PGS23
}
