import localforage from 'https://cdn.skypack.dev/localforage';
import { pgs } from './pgs.js'
let pgsCatalog = { pgsIds: {} }
let pgsScores
localforage.config({
    driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE, localforage.WEBSQL],
    name: 'localforage'});
//---------------------------------------------------------------

let pgsCatalogDb = localforage.createInstance({
    name: "pgsCatalogDb", storeName: "allTraitAndScoreFiles"})
let scoresTxtDb = localforage.createInstance({
    name: "scoresTxtDb",  storeName: "scoreFiles"})

// save all trait files and score file metadata in local storage
pgsCatalog.traitFiles = (await fetchAll2('https://www.pgscatalog.org/rest/trait/all')).flatMap(x => x)
pgsCatalog.scoringFiles = (await fetchAll2('https://corsproxy.io/?https://www.pgscatalog.org/rest/score/all')).flatMap(x => x)

// make traits and subset scoring files by trait
let traits = Array.from(new Set(pgsCatalog.traitFiles.flatMap(x => x["trait_categories"]).sort().filter(e => e.length).map(JSON.stringify)), JSON.parse)
pgsCatalog.pgsIds["byTrait"] = traits.map(x => getPGSbyTrait(x))
console.log("pgsCatalog", pgsCatalog)
//---------------------------------------------------------------

// get parsed scoring files
let num = 50
let bioPgsIds = (pgsCatalog.pgsIds.byTrait[5].pgsInfo.filter( x =>  x.variants_number < 314 & x.variants_number > 280)
).map( x => x.id)
console.log("bioPgsIds",bioPgsIds)
pgsScores = await getScoreFiles2(bioPgsIds)
console.log("newFile.js pgsScores", pgsScores)
//console.log("newFile.js pgsScores: get parsed scoring files", pgsScores)

//---------------------------------------------------------------
//Run PGS catalog API calls using pgsIDs and cache
async function getScoreFiles2(ids) {
    let data = await Promise.all(ids.map(async (id, i) => {
        let score
        score = await scoresTxtDb.getItem(id)

        if (score == null) {
            console.log("score == null", score == null)
            score = pgs.parsePGS(id, await pgs.loadScore(id))
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
// suset pgsIds by trait and by EFO and by synonym
function getPGSbyTrait(trait) {
    let traitFilesArr = []
    let pgsIds = []
    // get trait files that match selected trait from drop down
    pgsCatalog.traitFiles.map(tfile => {
        if (trait.includes(tfile["trait_categories"][0])) {
            traitFilesArr.push(tfile)
        }
    })
    if (traitFilesArr.length != 0) {
        pgsIds.push(traitFilesArr.flatMap(x => x.associated_pgs_ids).sort().filter((v, i) => traitFilesArr.flatMap(x => x.associated_pgs_ids).sort().indexOf(v) == i))
    }
    let pgsIds2 = pgsIds.flatMap(x => x)
    let pgsInfo = pgsIds2.map(id=> { // pgs variant number info
    let result = pgsCatalog.scoringFiles.filter(obj => {
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

export {
    pgsCatalog,
    pgsScores
}
