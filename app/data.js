import {  oneTrait,  oneTraitSubset} from '../sdk/oneTrait.js'
import {  my23Dt, PGS23} from '../main.js'




let calcData = { // a global variable that is not shared by data.js
                }

// add pgs scores to global variable --------------------------------------------------------------
const input2 = document.getElementById('myNum')

input2.addEventListener("change",async function (e) {
    oneTraitSubset.dt = await oneTrait.functions.getTraitScoreFiles()
    let pgs = []
    oneTraitSubset.dt.pgsIds.map( (x,i) => {
        pgs.push(oneTraitSubset.dt.scoreTxt[i])
    })
    calcData.pgs = pgs
    console.log("oneTraitSubset.dt ", oneTraitSubset.dt)

});

//  add 23andMe data to global variable --------------------------------------------------------------
PGS23.load23(my23Div) // create 23andMe file textarea

// save 23andMe data to global variable
const inputMy23 = document.getElementById('file23andMeInput')
inputMy23.addEventListener("change",async function (e) {
    let my23 = []
    my23.push(my23Dt)

    calcData.my23= my23
        console.log("calcData: ", calcData)

    })

