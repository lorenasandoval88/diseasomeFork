//let math = require('https://cdnjs.cloudflare.com/ajax/libs/mathjs/1.5.2/math.min.js')
import plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist/+esm';
import pako from 'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.esm.mjs'
import localforage from 'https://cdn.skypack.dev/localforage';
import *as JSZip from 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.9.1/jszip.min.js'; 
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
    JSZip,
    pako,
    plotly,
    localforage,
    clearCache,
    endpointStore
}
