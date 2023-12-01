import {get23,getUserUrls,filterUrls} from "./get23.js"
import { parsePGS, loadScore, getPGSTxts, getScoreFiles, getPGSbyTrait,
    fetchAll2, getPGSidsForAllTraits, getPGSidsForOneTrait} from "./getPgs.js"
import {  Match2 } from "./match.js"
console.log("main.js")

let pgsIds
let results = {}
//-------------------------------------------------------------------------
// 23andme data
let users = await filterUrls()
let userUrls = (users.slice(1000, 1010)).map(x => x["genotype.download_url"])
console.log("userUrls", userUrls)
let pgsCatalog = {
    pgsIds: {
        byTrait: {}
    }
}

// save all trait files and score file metadata in local storage
pgsCatalog.traitFiles = (await fetchAll2('https://www.pgscatalog.org/rest/trait/all')).flatMap(x => x)
pgsCatalog.scoringFiles = (await fetchAll2('https://corsproxy.io/?https://www.pgscatalog.org/rest/score/all')).flatMap(x => x)
//---------------------------------------------------------------
// make traits and subset scoring files by trait
let traits = Array.from(new Set(pgsCatalog.traitFiles.flatMap(x => x["trait_categories"]).sort().filter(e => e.length).map(JSON.stringify)), JSON.parse)
console.log("traits", traits)

let trait = "Cancer"
console.log("trait", trait)

/// get pgs ids for one trait (cancer)
let PGSids = await getPGSidsForOneTrait(trait, traits, pgsCatalog.traitFiles, pgsCatalog.scoringFiles)
console.log("PGSids",PGSids)

let PGStexts = await getPGSTxts(PGSids.Ids)
console.log("PGStexts",PGStexts)

let { my23Txts } = await get23(userUrls)
console.log("my23Txts", my23Txts)

function getPrsOneUser(allPgs, one23) {
    let matches = []
    for(let i=0 ; i < allPgs.length; i++){
        console.log("PGS #...",i)

            let input = {}
            input["my23"] = one23
            input["pgs"] = allPgs[i]
            matches.push(Match2(input))
          //  console.log("matches", matches)
    }
    return matches
}
 function getPrsManyUsers(allPgs, all23) {
   let arr = []
  // console.log("all23", all23)

   for(let i=0; i < all23.length; i++){
    console.log("---------------------------")
    console.log("processing PRS for user #...",i)

        let arr2 = {}
        let PRS =  getPrsOneUser(allPgs,all23[i])
        arr2["PRS"] = PRS
        //arr2["my23Txt"] = all23[i]

        arr.push(arr2)
   }
   return arr
}
// Get PRS results and filter those that pass QC ---------------------------------
//let PRS = getPrsOneUser(PGStexts.slice(30, 31),my23Txts[0])
let PGS = PGStexts.slice(30, 32)
let PRS = getPrsManyUsers(PGS,my23Txts)
let my23 = my23Txts

var filtered_PRS = 
PRS.filter( x =>  (x.PRS).every( el => el.QC ===true)
)

results["PRS"] = filtered_PRS
results["PGS"] = PGS
results["my23"] = my23Txts

  console.log("results", results)
