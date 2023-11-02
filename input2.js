import { openSnpDt} from '../sdk/openSnp.js'

import {  allTraits} from './sdk/allTraits.js'
import {  oneTrait,  oneTraitSubset} from './sdk/oneTrait.js'



//  TRAIT DROPDOWN --------------------------------------------------------------
// populate trait drop down from oneTrait obj list
var select = document.getElementById("myTrait");
// create div to list trait info (number of scores)
let div = document.createElement('div');
div.id = 'myTrait3'




  // populate trait dropdown
  select.addEventListener("click", function (e) {
  let options = allTraits.dt.traits.map(x => x.trait).sort()
  for (var i = 0; i < options.length; i++) {
    var opt = options[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
  }
  if (oneTrait.dt.pgsIds != undefined) {
    div.innerHTML = `Found ${oneTrait.dt.pgsIds.length} scoring files for "${myTrait.value}"`
    select.parentNode.appendChild(div)
  }
});


/*list trait data when someone clicks trait drop down:*/
select.addEventListener("click", function (e) {
  let dt = allTraits.dt.traits.filter(x => {
    if (select.value.includes(x.trait)) {
         return x
    }
})
  if (dt[0] != undefined) {
    div.innerHTML = `Found ${dt[0].pgsIds.length} scoring files for "${myTrait.value}"`
    select.parentNode.appendChild(div)
  }
});

/*populate oneTrait object when someone selects trait:*/
//const input1 = document.getElementById('myTrait')
select.addEventListener("change",async function (e) {
    var el = document.getElementById('myTrait')
    let trait2 = el.value
    oneTrait.dt =  (await oneTrait.functions.getTraitFiles(trait2))

    console.log("oneTrait.dt", oneTrait.dt)

});


// VARIANT NUMBER DROPDOWN --------------------------------------------------------------
// select variant number from second dropdown
var select2 = document.getElementById("myNum");
let div2 = document.createElement('div');
div2.id = 'myNum2'
/*list trait data when someone clicks the num dropdown:*/
select2.addEventListener("change", function (e) {
  let subset = oneTrait.dt.scoreFiles.filter(x => x.variants_number < select2.value)
  if (subset != undefined) {
    div2.innerHTML = `Found ${subset.length} scoring files for "${myTrait.value}" with less than or equal to ${select2.value} SNPs`
    select2.parentNode.appendChild(div2)
  }
});

// OPENSNP 23ANDME DROPDOWN --------------------------------------------------------------
// var select3 = document.getElementById("my23File");

// // populate trait dropdown
// select3.addEventListener("click", function (e) {
//   let options = allTraits.dt.traits.map(x => x.trait).sort()
//   for (var i = 0; i < options.length; i++) {
//     var opt = options[i];
//     var el = document.createElement("option");
//     el.textContent = opt;
//     el.value = opt;
//     select3.appendChild(el);
//   }
//   if (oneTrait.dt.pgsIds != undefined) {
//     div.innerHTML = `Found ${oneTrait.dt.pgsIds.length} scoring files for "${myTrait.value}"`
//     select3.parentNode.appendChild(div)
//   }
// });


// select variant number from second dropdown
// let div3 = document.createElement('div');
// div3.id = 'my23File2'
// /*list trait data when someone clicks the num dropdown:*/
// select3.addEventListener("click", function (e) {
//   if (oneTraitSubset.dt.scoreFiles != undefined) {
//     div3.innerHTML = `Found ${oneTraitSubset.dt.scoreFiles.length} scoring files for "${myTrait.value}" with less than or equal to ${select3.value} SNPs`
//     select3.parentNode.appendChild(div3)
//   }
// });
