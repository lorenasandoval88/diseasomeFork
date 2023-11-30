import {  pgs} from "../pgs.js"
import {  data} from "../sdk/openSnp.js"
import {  pgsCatalog,  pgsScores} from "../pgsScores.js"

let matches = {}
let matches2 = {}

// pgs scoring files 
console.log("pgsScores", pgsScores)
console.log("data", data)

let dt2 = {}
dt2.pgs = data.pgs[0]
dt2.my23 = data.my23[1]

let myPromise2 = new Promise(async (resolve, reject) => {
  // "Producing Code" (May take some time)
  var time = 9000 // 9 seconds
  matches2.results2 = await pgs.Match2(dt2);
  setTimeout(() => {
    resolve("success$$$$$$$$$$$$$")
    reject("failed$$$$$$$$$$$$$$$$")
  }, time)
})
// 6 different cancers (pgs scores), 3 people
// "Consuming Code" (Must wait for a fulfilled Promise)
myPromise2.then((message) => {
  console.log("message:",message,".then: matches2.results2.PRS:", matches2.results2.PRS)
}).catch((message) => {
  console.log("message:",message, ".catch: matches2.results2.PRS:", matches2.results2.PRS)
})

//function getMatches(data) {
//  let results
  // data.pgs.map(async (x, idx) => {
  //     let dt = {}
  //     dt.pgs = x
  //     dt.my23 = data.my23[0] // try with one 23and me file first
  //     console.log("---------data.pgs[idx].id",data.pgs[idx].id)

  //     let myPromise = new Promise(async (resolve, reject) => {
  //       // "Producing Code" (May take some time)
  //       var time2 = 9000 // 9 seconds
  //       setTimeout( async () => {
  //         console.log("data.pgs[idx].id",data.pgs[idx].id)
  //         matches[data.pgs[idx].id] = await pgs.Match2(dt)
  //         console.log("matches:",matches)
  //         resolve("success");
  //         reject("failed")
  //       }, time2)

  //     })
 
  //     // "Consuming Code" (Must wait for a fulfilled Promise)
  //     myPromise.then((message) => {
  //       console.log("message:",message,".then: matches.results2.PRS:", matches)
  //     }).catch((message) => {
  //       console.log("message:",message, ".catch: matches.results2.PRS:", matches)
  //     })
  // })
//}
const sleep = (milliSeconds) => {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve()
    }, milliSeconds)
  })
}

let obj={}

const getPRS = async () => {
let testObj = {}
testObj.pgs = data.pgs
testObj.my23 = data.my23[1]

  for (let i = 0; i < testObj.pgs.length; i++) {
    let time = testObj.pgs[i].dt.length/30
    console.log("time", time)
    let dt = {}
    dt.pgs = testObj.pgs[i]
    dt.my23 = testObj.my23 // try with one 23and me file first      
    let results = await pgs.Match2(dt)
      //await sleep(time)
      obj[data.pgs[i].id] = results
      console.log("results for", data.pgs[i].id,":",results)
  }
}
 new Promise((resolve, _reject) => {
  setTimeout(async () => {
    await getPRS()
    console.log("obj",obj)
    resolve()
  }, 10000)
  console.log("obj2",obj)
})

let obj2={}
const getPRS2 = async () => {
  let testObj = {}
  testObj.pgs = data.pgs
  testObj.my23 = data.my23[1]
  console.log("testObj",testObj)
for (let i = 0; i < testObj.pgs.length; i++) {
  let dt = {}
  dt.pgs = testObj.pgs[i]
  dt.my23 = testObj.my23 // try with one 23and me file first    
let promiseA = new Promise( async (resolve, reject) => {

 return resolve( obj2[testObj.pgs[i].id] = await pgs.Match2(dt));
});
// At this point, "promiseA" is already settled.
promiseA.then((val) => 
console.log("asynchronous logging has obj2:", obj2));
console.log("immediate logging");
    }
}
getPRS2()
// function getMatches(data) {
//     let results
//     data.pgs.map(async (x, idx) => {
//         let dt = {}
//         dt.pgs = x
//         dt.my23 = data.my23[0] // try with one 23and me file first
//         results = await pgs.Match2(dt)
//         matches[data.pgs[idx].id] = await pgs.Match2(dt)
//         console.log("results", results);

//     })

// }

// getMatches(data)
// console.log("matches", matches);
