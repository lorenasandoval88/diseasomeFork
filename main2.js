import {get23,getUserUrls,filterUrls} from "./get23.js"
import { parsePGS, loadScore, getPGSTxts, getScoreFiles, getPGSbyTrait,
    fetchAll2, getPGSidsForAllTraits, getPGSidsForOneTrait} from "./getPgs.js"
import {  Match2 } from "./match.js"
console.log("main.js")

//-------------------------------------------------------------------------
// INPUT DATA

// 23andme data
let users = await filterUrls()
let userUrls = (users.slice(0,8)).map(x => x["genotype.download_url"])
console.log("userUrls", userUrls)
let pgsCatalog = {}

// save all trait files and score file metadata in local storage
pgsCatalog.traitFiles = (await fetchAll2('https://www.pgscatalog.org/rest/trait/all')).flatMap(x => x)
pgsCatalog.scoringFiles = (await fetchAll2('https://corsproxy.io/?https://www.pgscatalog.org/rest/score/all')).flatMap(x => x)
//---------------------------------------------------------------
// make traits and subset scoring files by trait
let traits = Array.from(new Set(pgsCatalog.traitFiles.flatMap(x => x["trait_categories"]).sort().filter(e => e.length).map(JSON.stringify)), JSON.parse)
//console.log("traits", traits)

let trait = "Cancer"
console.log("trait", trait)

/// get pgs ids for one trait (cancer)
let PGSids = await getPGSidsForOneTrait(trait, traits, pgsCatalog.traitFiles, pgsCatalog.scoringFiles)
console.log("PGSids",PGSids)

let PGStexts = await getPGSTxts(PGSids.Ids)
let PGS = PGStexts.slice(45,48)
console.log("PGStexts",PGS)

// get 23 and me users, removing thise that don't pass QC
let { my23Txts } = await get23(userUrls)
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

data["PGS"] = PGS
data["my23"] = my23Txts
let PRS = PRS_fun(data)
data["PRS"] = PRS

console.log("data",data )




