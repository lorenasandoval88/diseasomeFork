import {
  allTraits
} from './sdk/allTraits.js'
import {
  oneTrait,
  oneTraitSubset
} from './sdk/oneTrait.js'
//  TRAIT DROPDOWN --------------------------------------------------------------
// populate trait drop down from oneTrait obj list
var select = document.getElementById("myTrait2");
// create div to list trait info (number of scores)
let div = document.createElement('div');
div.id = 'trait2'


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
    div.innerHTML = `Found ${oneTrait.dt.pgsIds.length} scoring files for "${myTrait2.value}"`
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
    div.innerHTML = `Found ${dt[0].pgsIds.length} scoring files for "${myTrait2.value}"`
    select.parentNode.appendChild(div)
  }
});


// VARIANT NUMBER DROPDOWN --------------------------------------------------------------
// select variant number from second dropdown
var select2 = document.getElementById("myNum");
let div2 = document.createElement('div');
div2.id = 'num2'
/*list trait data when someone clicks the num dropdown:*/
select2.addEventListener("click", function (e) {
  if (oneTraitSubset.dt.scoreFiles != undefined) {
    div2.innerHTML = `Found ${oneTraitSubset.dt.scoreFiles.length} scoring files for "${myTrait2.value}" with less than or equal to ${select2.value} SNPs`
    select2.parentNode.appendChild(div2)
  }
});
