import { allTraits} from './sdk/allTraits.js'
import { oneTrait,oneTraitSubset} from './sdk/oneTrait.js'

//  TRAIT DROPDOWN --------------------------------------------------------------
// populate trait drop down from oneTrait obj list
  var select = document.getElementById("myTrait2");
// create div to list trait info (number of scores)
let div = document.createElement('div');
div.id = 'trait2'


/*execute a function when someone clicks trait drop down:*/
select.addEventListener("click", function (e) {
  let options  = allTraits.dt.traits.map( x => x.trait).sort()

// populate trait dropdown
  for(var i = 0; i < options.length; i++) {
    var opt = options[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    select.appendChild(el);
}

  let pgsIds = []
  allTraits.dt.traits.map(x => {
      if (select.value.includes(x.trait)) {
          pgsIds.push(x.ids)
      }
  }).flatMap(x => x)

    div.innerHTML = `Found ${pgsIds[0].length} scoring files for "${myTrait2.value}"`
    select.parentNode.appendChild(div)

});

// VARIANT NUMBER DROPDOWN --------------------------------------------------------------
// populate trait drop down from oneTrait obj list
var select2 = document.getElementById("myNum");

let div2 = document.createElement('div');
div2.id = 'num2'

/*execute a function when someone clicks in the document:*/
select2.addEventListener("click", function (e) {

    div2.innerHTML = `Found ${oneTraitSubset.dt.scoreFiles.length} scoring files for "${myTrait2.value}"`
    select2.parentNode.appendChild(div2)

});