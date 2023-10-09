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

async function getItems(endpoint, requestParams = {blobFlag: false, cacheFlag: true, baseUrl: 'https://data.medicaid.gov/api/1/'}) {
    await updateCache();
    const cachedData = await endpointStore.getItem(endpoint);
    if (cachedData !== null) {
        endpointStore.setItem(endpoint, {response: cachedData.response, time: Date.now()});
        return cachedData.response;
    }
    const response = await fetch(`${requestParams.baseUrl}${endpoint}`);
    if (!response.ok){
        throw new Error("An error occurred in the API get Request");
    }
    let responseData;
    if (requestParams.blobFlag) {
        responseData = await response.blob();
    } else {
        responseData = await response.json();
    }
    if (requestParams.cacheFlag) endpointStore.setItem(endpoint, {response: responseData, time: Date.now()});
    return responseData;
}
async function updateCache() {
    if (updateCount < 10000){
        updateCount++;
        return;
    }
    console.log("Cache is being updated")
    for (const key of await endpointStore.keys()) {
        const value = await endpointStore.getItem(key);
        if (Date.now() - value.time > 86400000){
            endpointStore.removeItem(key);
        }
    }
    updateCount = 0;
}

function clearCache(){
    endpointStore.clear();
}

export{
    getItems,
    JSZip,
    pako,
    plotly,
    localforage,
    clearCache,
    endpointStore
}
