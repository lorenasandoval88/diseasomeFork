import { allTraits} from './allTraits.js'
import localforage from 'https://cdn.skypack.dev/localforage';
import { pgs} from '../pgs.js'

console.log("------------------")
console.log("oneTrait.js loaded")

//biuld object for one trait and a subset of of oneTrait by variant number
let oneTraitDb = localforage.createInstance({  name: "oneTraitDb", storeName: "scoreFiles"})
let oneTraitDbSubset = localforage.createInstance({  name: "oneTraitDbSubset", storeName: "scoreFilesTxt"})


let oneTrait = { functions: {},   dt: {}}
let oneTraitSubset = {  functions: {},   dt: {}}

oneTrait.functions.getTraitFiles = async function (trait) {
    var obj = {}
    // get trait files that match selected trait from drop down
    let dt = allTraits.dt.traits.filter(x => {
        if (trait.includes(x.trait)) {
             return x
        }
    })
    let scores =   await oneTrait.functions.getscoreFiles(dt[0].pgsIds)
    obj["trait"] = dt[0].trait
    obj["pgsIds"] = dt[0].pgsIds
    obj["scoreFiles"] = scores
    obj["traitFiles"] = dt[0].traitFiles
    obj["variant_limit"] = "none"
    console.log("oneTrait", obj)
    return  obj
}

oneTrait.functions.getscoreFiles =async function (pgsIds) {
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

//Run PGS catalog API calls using pgsIDs and cache
oneTrait.functions.getTraitScoreFiles = async function () {
    let obj = {}
    let scores =  oneTrait.dt.scoreFiles
    let trait = oneTrait.dt.trait
    let num = document.getElementById("myNum").value
    // filter scores by the number of variant in a file
    let scores2 = scores.filter(x => x.variants_number < num)
    let ids2 = scores2.map(e=> e.id)

    var txts = []
    let i = 0
    while (i < ids2.length) {
        
        let cachedData = await oneTraitDbSubset.getItem(ids2[i]);
        //console.log("cachedData",cachedData)
        if (cachedData !== null) {
            txts.push(cachedData)

        } else if (cachedData == null) {
            let notCachedData =  pgs.parsePGS(ids2[i], await pgs.loadScore(ids2[i]))


            oneTraitDbSubset.setItem(ids2[i], notCachedData);
            txts.push(notCachedData)
        }
        i += 1
    }
    obj["trait"] = trait
    obj["pgsIds"] = ids2
    obj["scoreFiles"] = scores2
    obj["variant_limit"] = num
    obj["scoreTxt"] = txts
    return obj
}


 console.log("oneTrait:", oneTrait)

export {
    oneTrait,
    oneTraitSubset,
}
