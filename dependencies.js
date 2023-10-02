//let math = require('https://cdnjs.cloudflare.com/ajax/libs/mathjs/1.5.2/math.min.js')
import plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist/+esm';
//let  pako= require('https://cdnjs.cloudflare.com/ajax/libs/pako/1.0.11/pako.min.js')
import localforage from 'https://cdn.skypack.dev/localforage';
let updateCount = 0;
const dbName = "localforage"
localforage.config({
    driver: [
        localforage.INDEXEDDB,
        localforage.LOCALSTORAGE,
        localforage.WEBSQL
    ],
    name: 'localforage'
});



let endpointStore = localforage.createInstance({
    name: dbName,
    storeName: "endpointStore"
})

function clearCache(){
    endpointStore.clear();
}

export{
  //  math,
   // pako,
    plotly,
    localforage,
    clearCache,
    endpointStore
}