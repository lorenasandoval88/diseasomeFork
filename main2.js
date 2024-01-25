import {get23,getUserUrls,filterUrls} from "./get23.js"
import { parsePGS, loadScore, getPGSTxts, getPGSTxtsHm,
     getOneCategory, getPGSIds,  fetchAll2,  getPGSidsForOneTraitCategory,
     getPGSidsForOneTraitLabel,} from "./getPgs.js"
import {  Match2 } from "./match.js"
console.log("main.js")

//-------------------------------------------------------------------------
// INPUT DATA

// 23andme data
let users = await filterUrls()
let userUrls = (users.slice(0,8)).map(x => x["genotype.download_url"])
console.log("userUrls", userUrls)

// save all trait files and score file metadata in local storage
let traitFiles = (await fetchAll2('https://www.pgscatalog.org/rest/trait/all')).flatMap(x => x)
let scoringFiles = (await fetchAll2('https://corsproxy.io/?https://www.pgscatalog.org/rest/score/all')).flatMap(x => x)

//---------------------------------------------------------------
// make traits and subset scoring files by trait
// let categories = Array.from(new Set(traitFiles.flatMap(x => x["trait_categories"]).sort().filter(e => e.length).map(JSON.stringify)), JSON.parse)
// console.log("traits", categories)

// let traitCategory = "Cancer"
// console.log("traitCategory", traitCategory)
let varMin = 5
let varMax = 50
// /// get pgs ids for one trait (cancer)
// let trait = "type 2 diabetes mellitus"
// let traitResults = await getPGSidsForOneTraitLabel(trait, traitFiles,scoringFiles, varMin, varMax)
// console.log("traitResults",traitResults)
//----------------------------------------------------------------------
//let categoryData = await getCategoriesData(categories, traitFiles,scoringFiles)
// let categoryResults = await getPGSidsForOneTraitCategory(traitCategory,traitFiles, scoringFiles, varMin, varMax)
// console.log("categoryResults",categoryResults)//.map(x=>x.id))//PGSids[trait].map(x=>x.id))

let label = "type 2 diabetes mellitus"
let results = await getPGSIds("traitLabels", label, traitFiles, scoringFiles, varMin, varMax)
console.log("results",results)
//let PGStexts = await getPGSTxts(results.map(x=>x.id))
let PGStextsHm = await getPGSTxtsHm(results.map(x=>x.id))

let PGS = PGStextsHm.slice(1,2)
//console.log("PGStexts",PGStexts)
console.log("PGStextsHm",PGStextsHm)

//---------------------------------------------------
// let PGStexts = await getPGSTxts(categoryResults.map(x=>x.id))//PGSids[trait].map(x=>x.id))
// let PGS = PGStexts.slice(1,2)
// console.log("PGStexts",PGStexts)

// get 23 and me users, removing thise that don't pass QC
//let { my23Txts } = await get23(userUrls)
let my23Txts = await get23(userUrls)
console.log("my23Txts", my23Txts)


//-----------------------------------------------------------------------
// MATCHING

function PRS_fun(matrix){
    let PRS =[]
    for (let i=0; i<matrix.my23.length; i++){
        console.log("---------------------------")
        console.log("processing user #...",i)

        for(let j=0; j<matrix.PGS.length; j++){
            let input = { "pgs":matrix.PGS[j], "my23":matrix.my23[i]}
            let res = Match2(input)
                PRS.push(res)
                console.log("processing PGS #...",matrix.PGS[j].id)
        }
    }

    return PRS
}
// data object defined here ----------------------------
let data = {}

// data["PGS"] = PGS
// data["my23"] = my23Txts
// let PRS = PRS_fun(data)
// data["PRS"] = PRS

// console.log("data",data )




export{PRS_fun}