import localforage from 'https://cdn.skypack.dev/localforage';


let openSnpDt= {}

openSnpDt.getPgsIds = async()=>{

    Array.from(new Set( traitFiles.flatMap(x => x[type])
            .sort().filter(e => e.length).map(JSON.stringify)), JSON.parse)
}

async function full_users() { // includes ancestry, familtyTree, and 23and me genotype data
    let dt = await localforage.getItem('openSnpUsers');
    if (dt == null ) {
      let openSnpUsers = (await (await fetch('https://corsproxy.io/?https://opensnp.org/users.json')).json());
          dt =  localforage.setItem('openSnpUsers', openSnpUsers);
        }
      return dt
    }

// let users = full_users()
// console.log("users" ,users)


function getUsers(data){
    // filter users without 23andme/ancestry data
 let arr = []
 data.filter(row => row.genotypes.length >0).map(dt => {
         let innerObj = {};
         innerObj["name"] = dt["name"];
         innerObj["id"] = dt["id"];
         innerObj["genotypes"] = [];
         arr.push(innerObj)
         // keep user with one or more 23andme files
         dt.genotypes.map(i=>{
          if (dt.genotypes.length > 0 && i.filetype == "23andme"){
               innerObj.genotypes.push(i)
            } 
     })
   })
 let arr2 = arr.filter(x=> x.genotypes.length != 0)
   return arr2
 }

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


export{openSnpDt}