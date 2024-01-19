import localforage from 'https://cdn.skypack.dev/localforage';
import pako from 'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.esm.mjs'

let pgsCatalogDb = localforage.createInstance({ name: "pgsCatalogDb", storeName: "allTraitAndScoreFiles"})
let scoresTxtDb = localforage.createInstance({ name: "scoresTxtDb",  storeName: "scoreFiles"})

// create PGS obj and data --------------------------
async function parsePGS(id, txt){
    let obj = {
        id: id
    }
    obj.txt = txt
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
    //const indInt=obj.cols.map((c,i)=>c.match(/_pos/g)?i:null).filter(x=>x)
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
    // */
    // parse metadata
    obj.meta.txt.filter(r => (r[1] != '#')).forEach(aa => {
        aa = aa.slice(1).split('=')
        obj.meta[aa[0]] = aa[1]
        //debugger
    })
    return obj
}

async function loadScore(entry='PGS000004',build=37,range){
    let txt = ""
    entry = "PGS000000".slice(0,-entry.length)+entry
    // https://ftp.ebi.ac.uk/pub/databases/spot/pgs/scores/PGS000004/ScoringFiles/Harmonized/PGS000004_hmPOS_GRCh37.txt.gz
    const url = `https://ftp.ebi.ac.uk/pub/databases/spot/pgs/scores/${entry}/ScoringFiles/Harmonized/${entry}_hmPOS_GRCh${build}.txt.gz`//
 
    if(range){
        if(typeof(range)=='number'){
            range=[0,range]
        }
        //debugger
 
        txt= pako.inflate(await (await fetch(url,{
            headers:{
                'content-type': 'multipart/byteranges',
                'range': `bytes=${range.join('-')}`,
            }
        })).arrayBuffer(),{to:'string'})
    }else{
        txt = pako.inflate(await (await fetch(url)).arrayBuffer(),{to:'string'})
    }
    // Check if PGS catalog FTP site is down-----------------------
       let response
       response = await fetch(url) // testing url 'https://httpbin.org/status/429'
       if (response?.ok) {
           ////console.log('Use the response here!');
         } else {
        txt = `:( Error loading PGS file. HTTP Response Code: ${response?.status}`
        document.getElementById('pgsTextArea').value = txt
         }
    return txt
}

//---------------------------------------------------------------
//Run PGS catalog API calls using pgsIDs and cache
async function getScoreFiles(ids) {
    let data = await Promise.all(ids.map(async (id, i) => {
        let score
        score = await scoresTxtDb.getItem(id)

        if (score == null) {
            console.log("score == null", score == null)
            score = parsePGS(id, await loadScore(id))
            console.log(id)
            scoresTxtDb.setItem(id, score);
        }
        return score
    }))
    return data
}

//---------------------------------------------------------------
// get all score and trait files
async function fetchAll2(url, maxPolls = null) {
    const allResults = []
    const counts = (await (await (fetch(url))).json())
    if (maxPolls == null) maxPolls = Infinity

    // loop throught the pgs catalog API to get all files using "offset"
    for (let i = 0; i < Math.ceil(counts.count / 100); i++) { //4; i++) { //maxPolls; i++) {
        let offset = i * 100
        let queryUrl = `${url}?limit=100&offset=${offset}`
        // get trait files and scoring files from indexDB if the exist
        let cachedData = await pgsCatalogDb.getItem(queryUrl);

        // cach url and data 
        if (cachedData !== null) {
            allResults.push(cachedData)

        } else if (cachedData == null) {
            let notCachedData = (await (await fetch(queryUrl)).json()).results
            pgsCatalogDb.setItem(queryUrl, notCachedData);
            allResults.push(notCachedData)
        }
        if (allResults.length > 40) {
            break
        }
    }
    return allResults
}

//---------------------------------------------------------------
//let traitFiles = (await fetchAll2('https://www.pgscatalog.org/rest/trait/all')).flatMap(x => x)
//let scoringFiles = (await fetchAll2('https://corsproxy.io/?https://www.pgscatalog.org/rest/score/all')).flatMap(x => x)

// suset pgsIds by trait and by EFO and by synonym
async function getPGSbyTrait(trait, traitFiles,scoringFiles) {
    let traitFilesArr = []
    let pgsIds = []
     // get trait files that match selected trait from drop down
    traitFiles.map(tfile => {
        if (trait.includes(tfile["trait_categories"][0])) {
            traitFilesArr.push(tfile)
        }
    })
    if (traitFilesArr.length != 0) {
        pgsIds.push(traitFilesArr.flatMap(x => x.associated_pgs_ids).sort().filter((v, i) => traitFilesArr.flatMap(x => x.associated_pgs_ids).sort().indexOf(v) == i))
    }
    let pgsIds2 = pgsIds.flatMap(x => x)
    let pgsInfo = pgsIds2.map(id=> { // pgs variant number info
    let result = scoringFiles.filter(obj => {
        return obj.id === id
      })
      return result[0]
    })

    let obj = {}
    obj["traitCategory"] = trait
    obj["count"] = pgsIds2.length
    obj["pgsIds"] = pgsIds2
    obj["pgsInfo"] = pgsInfo
    obj["traitFiles"] = traitFilesArr
    return obj
}
// get PGS info--------------------------------------
 async function getPGSidsForAllTraits(traits, traitFiles,scoringFiles) {
    let obj = {}
    traits.map(async x => {
      //console.log("trait",x)
        let res =   getPGSbyTrait(x, traitFiles,scoringFiles) 
        res.then((res) => {
            obj[x] = res;
            //console.log("res",res)
        })
    })
    return obj
}
async function getPGSidsForOneTrait(traitData,trait,traits, traitFiles,scoringFiles) {
    let obj = {}
    let traitData2 = traitData[trait].pgsInfo
    console.log("traitData[trait].pgsInfo",traitData[trait].pgsInfo)
            .filter( x =>  x.variants_number < 1000 & x.variants_number > 120)
            .map( x => x.id)
    obj["Ids"] = traitData2
    obj["allTraits"] = traitData
    return obj
}
// Get pgs scores in text format----------------------------------------
//Run PGS catalog API calls using pgsIDs and cache
async function getPGSTxts(ids) {
    let data = await Promise.all(ids.map(async (id, i) => {
        let score = await scoresTxtDb.getItem(id)

        if (score == null) {
           // console.log("score == null", score == null)
            score = parsePGS(id, await loadScore(id))
            //console.log(id)
            scoresTxtDb.setItem(id, score);
        }
        return score
    }))
    return data
}




export{
    getPGSTxts,
    parsePGS,
    loadScore,
    fetchAll2,
    getScoreFiles,
    getPGSbyTrait,
    getPGSidsForAllTraits,
    getPGSidsForOneTrait
}