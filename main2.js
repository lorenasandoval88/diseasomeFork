import {get23,getUserUrls,filterUrls} from "./get23.js"
import { parsePGS, loadScore, getPGSTxts, getPGSTxtsHm, getPGSIds,  fetchAll2,  getPGSidsForOneTraitCategory,
     getPGSidsForOneTraitLabel,} from "./getPgs.js"
import {  Match2 } from "./match.js"

//-------------------------------------------------------------------------
// INPUT DATA

// 23andme data
let users = await filterUrls()
let userUrls = (users.slice(0,3)).map(x => x["genotype.download_url"])

//---------------------------------------------------------------

let varMin = 5
let varMax = 8

//----------------------------------------------------------------------
// testing one trait, "type 2 diabetes mellitus"
let results = await getPGSIds("traitCategories", "Cancer",  varMin, varMax)
console.log("pgs model scoring files:",results)
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
                console.log("processing PGS model: ",matrix.PGS[j].id)
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