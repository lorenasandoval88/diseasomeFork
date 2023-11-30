import plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist/+esm';
import pako from 'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.esm.mjs'
import localforage from 'https://cdn.skypack.dev/localforage';
import *as JSZip from 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.9.1/jszip.min.js'; 


let pgs = {date:Date()}

pgs.loadScript=async(url)=>{
    let s = document.createElement('script')
    s.src=url
    return document.head.appendChild(s)
}

pgs.plotAllMatchByPos=(data,div2)=>{ 
    const indEffect_allele = data.pgs.cols.indexOf('effect_allele')
    //div2.style.height = '350px'
    const indChr = data.pgs.cols.indexOf('hm_chr')
    const indPos = data.pgs.cols.indexOf('hm_pos')
    let indOther_allele = data.pgs.cols.indexOf('other_allele')
    if (indOther_allele == -1) {
        indOther_allele = data.pgs.cols.indexOf('hm_inferOtherAllele')
    }
    const x = data.pgsMatchMy23.map(xi => {
        return `Chr${xi.at(-1)[indChr]}.${xi.at(-1)[indPos]}:${xi.at(-1)[indOther_allele]}>${xi.at(-1)[indEffect_allele]}
		<br> <a href="#" target="_blank">${xi[0][0]}</a>`
    })
    const y = data.calcRiskScore
    const z = data.aleles
    const ii = [...Array(y.length)].map((_, i) => i)
    let trace0 = {
        y: ii.map(i => i + 1),
        x: y,
        mode: 'markers',
        type: 'scatter',
        text: x,
        marker: {
            size: 6,
            color: 'navy',
            line: {
                color: 'navy',
                width: 1
            }
        },
       
    }
      div2.innerHTML = ""
    //setTimeout(_=>{
    plotly.newPlot(div2, [trace0], {
        //title:`${data.pgs.meta.trait_mapped}, PRS ${Math.round(data.PRS*1000)/1000}`
        title: `<i style="color:navy">  risk scores for ${data.calcRiskScore.length} ${data.pgs.meta.trait_reported}, PRS ${Math.round(data.PRS*1000)/1000}</i>
			  <br><a href="${'https://doi.org/' + data.pgs.meta.citation.match(/doi\:.*$/)[0]}" target="_blank"style="font-size:x-small">${data.pgs.meta.citation}</a>`,
        yaxis: {
            title: '<span style="font-size:medium">variant i sorted by chromosome and position</span>',
            linewidth: 1,
                mirror: true,
                rangemode: "tozero",
        },
        xaxis: {
            title: '<span style="font-size:large">βi</span><span style="font-size:medium">, effect size (or beta) of variant i</span>',
            linewidth: 1,
            mirror: true
        },
        height: 600,
        width: 450
    })
    return div2
}

pgs.Match2=async(data, progressReport)=>{
    // extract harmonized data from PGS entry first
  // extract harmonized data from PGS entry first
  const indChr = data.pgs.cols.indexOf('hm_chr')
  const indPos = data.pgs.cols.indexOf('hm_pos')
  const indOther_allele = data.pgs.cols.indexOf('other_allele')
  const indEffect_allele = data.pgs.cols.indexOf('effect_allele')
  const indGenotype = data.my23.cols.indexOf('genotype')

      // match
      let dtMatch = []

    const n = data.pgs.dt.length
    //console.log(data.pgs.id,"n", n)

    //let progressCalc = document.getElementById('progressCalc')
    //progressCalc.hidden = false
    let i = 0
    let j = 0 //index of last match, the nex can match will have to be beyond this point since both pgs and 23and me are sorted by chr/position
    //let matchFloor=0 // to advance the earliest match as it advances
    function funMatch(i = 0, matchFloor = 0) {
        if (i < n) {
              let r = data.pgs.dt[i]

            //also filter 23 and me variants if they don't match pgs alt or effect allele 
            let regexPattern = new RegExp([r[indEffect_allele], r[indOther_allele]].join('|'))

            if (dtMatch.length > 0) {
                matchFloor = dtMatch.at(-1)[0][4]
                //console.log(matchFloor)
            }
            let dtMatch_i = data.my23.dt.filter(myr => (myr[2] == r[indPos]))
                .filter(myr => (myr[1] == r[indChr]))
            // remove 23 variants that don't match pgs effect or other allele    
                .filter(myr => regexPattern.test(myr[indGenotype])) 
            //let dtMatch_i = data.my23.dt.slice(matchFloor).filter(myr=>(myr[2] == r[indPos])).filter(myr=>(myr[1] == r[indChr]))


            if (dtMatch_i.length > 0) {
                dtMatch.push(dtMatch_i.concat([r]))
            }
            //progressCalc.value = 100 * i / n
            setTimeout(() => {
                funMatch(i + 1)
            }, 0)
        } else {
            data.pgsMatchMy23 = dtMatch
            let calcRiskScore = []
            let alleles = []
            // calculate Risk
            let logR = 0
            // log(0)=1
            let ind_effect_weight = data.pgs.cols.indexOf('effect_weight')
            dtMatch.forEach((m, i) => {
                calcRiskScore[i] = 0
                // default no risk
                alleles[i] = 0
                // default no alele
                let mi = m[0][3].match(/^[ACGT]{2}$/)
                // we'll only consider duplets in the 23adme report
                if (mi) {
                    //'effect_allele', 'other_allele', 'effect_weight'
                    mi = mi[0]
                    // 23andme match
                    let pi = m.at(-1)
                    //pgs match
                    let alele = pi[indEffect_allele]
                    let L = mi.match(RegExp(alele, 'g'))
                    // how many, 0,1, or 2
                    if (L) {
                        L = L.length
                        calcRiskScore[i] = L * pi[ind_effect_weight]
                        alleles[i] = L
                    }
                }
            })
            data.alleles = alleles
            data.calcRiskScore = calcRiskScore
            let weight_idx = data.pgs.cols.indexOf('effect_weight')
            let weights = data.pgs.dt.map(row => row[weight_idx])
            // warning: no matches found!
            if (calcRiskScore.length == 0) { 
                data.PRS = "there are no matches :-("
                data.QC = false
                data.QCtext = 'there are no matches :-('
                //console.log('there are no matches :-(',data.PRS)
            }else if (calcRiskScore.reduce((a, b) => Math.max(a, b)) > 100) { //&&(calcRiskScore.reduce((a,b)=>Math.max(a,b))<=1)){ // hazard ratios?
                data.PRS = Math.exp(calcRiskScore.reduce((a, b) => a + b))
		        data.QC = false
                data.QCtext = 'these are large betas :-('
                //console.log('these are large betas :-(',weights)
            } else if (weights.reduce((a, b) => Math.min(a, b)) > -0.00002 ) {
                data.PRS = Math.exp(calcRiskScore.reduce((a, b) => a + b))
                data.QC = false
                data.QCtext = 'these are not betas :-('
                //console.log('these are not betas :-(',weights) 
            }  else{
                data.PRS = Math.exp(calcRiskScore.reduce((a, b) => a + b))
                data.QC = true
                data.QCtext = ''
            }
        }
    }
    funMatch()
  return data
}

pgs.loadScore=async(entry='PGS000004',build=37,range)=>{
    let txt = ""
    
        entry = "PGS000000".slice(0,-entry.length)+entry

    ////console.log(entry)
    // https://ftp.ebi.ac.uk/pub/databases/spot/pgs/scores/PGS000004/ScoringFiles/Harmonized/PGS000004_hmPOS_GRCh37.txt.gz
    const url = `https://ftp.ebi.ac.uk/pub/databases/spot/pgs/scores/${entry}/ScoringFiles/Harmonized/${entry}_hmPOS_GRCh${build}.txt.gz`//
 
    if(range){
        if(typeof(range)=='number'){
            range=[0,range]
        }
        //debugger
 
        txt= pako.inflate(await (await fetch(url,{
            headers:{
                'content-type': 'multipart/byteranges',
                'range': `bytes=${range.join('-')}`,
            }
        })).arrayBuffer(),{to:'string'})
        
        //debugger
    }else{
        txt = pako.inflate(await (await fetch(url)).arrayBuffer(),{to:'string'})

    }
    // Check if PGS catalog FTP site is down-----------------------
       let response
       response = await fetch(url) // testing url 'https://httpbin.org/status/429'
       if (response?.ok) {
           ////console.log('Use the response here!');
         } else {
        txt = `:( Error loading PGS file. HTTP Response Code: ${response?.status}`
        document.getElementById('pgsTextArea').value = txt
         }
   //-------------------------------------------------------
    return txt
}

pgs.getArrayBuffer=async(range=[0,1000],url='https://ftp.ncbi.nih.gov/snp/organisms/human_9606/VCF/00-All.vcf.gz')=>{
    return await (await (fetch(url,{
        headers: {
                'content-type': 'multipart/byteranges',
                'range': `bytes=${range.join('-')}`,
            }
    }))).arrayBuffer()
}

// create PGS obj and data
pgs.parsePGS=async(id, txt)=>{
    let obj = {
        id: id
    }
    obj.txt = txt
    let rows = obj.txt.split(/[\r\n]/g)
    let metaL = rows.filter(r => (r[0] == '#')).length
    obj.meta = {
        txt: rows.slice(0, metaL)
    }
    obj.cols = rows[metaL].split(/\t/g)
    obj.dt = rows.slice(metaL + 1).map(r => r.split(/\t/g))
    if (obj.dt.slice(-1).length == 1) {
        obj.dt.pop(-1)
    }
    // parse numerical types
    //const indInt=obj.cols.map((c,i)=>c.match(/_pos/g)?i:null).filter(x=>x)
    const indInt = [obj.cols.indexOf('chr_position'), obj.cols.indexOf('hm_pos')]
    const indFloat = [obj.cols.indexOf('effect_weight'), obj.cols.indexOf('allelefrequency_effect')]
    const indBol = [obj.cols.indexOf('hm_match_chr'), obj.cols.indexOf('hm_match_pos')]

    // /* this is the efficient way to do it, but for large files it has memory issues
    obj.dt = obj.dt.map(r => {
        // for each data row
        indFloat.forEach(ind => {
            r[ind] = parseFloat(r[ind])
        })
        indInt.forEach(ind => {
            r[ind] = parseInt(r[ind])
        })
        indBol.forEach(ind => {
            r[ind] = (r[11] == 'True') ? true : false
        })
        return r
    })
    // */
    // parse metadata
    obj.meta.txt.filter(r => (r[1] != '#')).forEach(aa => {
        aa = aa.slice(1).split('=')
        obj.meta[aa[0]] = aa[1]
        //debugger
    })
    return obj
}

pgs.textArea = async (entry='PGS000004',build=37,range=20000)=>{
    let ta = document.createElement('textarea'); //DOM.element('textarea');
    ta.value = 'loading, please wait ...'
    ta.style="width:100%;color:lime;background-color:black;height:20em;font-size:small"
    // find file size
    if(typeof(entry)=='number'){
        entry = entry.toString()
        entry = "PGS000000".slice(0,-entry.length)+entry
    }
    let response = await fetch(`https://ftp.ebi.ac.uk/pub/databases/spot/pgs/scores/${entry}/ScoringFiles/Harmonized/${entry}_hmPOS_GRCh${build}.txt.gz`,{method:'HEAD'})
    let fz = response.headers.get('Content-Length')
    pgs.loadScore(entry,build,range).then(txt=>{
        if(txt.length>range){
            // find file size
            txt = txt.replace(/\n[^\n]*$/,`\n... (total size ${fz})`)
        }
        ta.value=txt
    })
    return ta;
}

//pgs.url='https://www.pgscatalog.org/rest/'
pgs.url='https://script.google.com/macros/s/AKfycbw1lC7UPcj34J06v_HWACyFJAPSoDB7VMI-KWbpb0mfuh9wccHPPFdbMdxGlUeyqDFM/exec?'

pgs.get=async(q='score/PGS000004?format=json')=>{ // PGS API call
    const url = pgs.url+encodeURIComponent(q)
    //return (await fetch(url)).json()
    let y
    if(pgs.localforage){
        y = await pgs.localforage.getItem(url)
    }
    if(!y){
        y = await (await fetch(url)).json()
        pgs.localforage.setItem(url,y)
    }
    return y
}

pgs.getAttr=async(id='PGS000004')=>{ // getting attributes of a PSG entry
    return await pgs.get(`score/${id}?format=json`)
}

pgs.getValues=async(id='PGS000004')=>{ // getting values of a PSG entry by parsing the PSG file
    return await pgs.parse(id)
}

pgs.score={}
//pgs.score.all=async fetch(url='https://www.pgscatalog.org/rest/score/all')

pgs.deblank=(txt)=>{
    return txt.replace(/^[#\s]+/,'').replace(/\s+?/,'')
}
pgs.parse23 = async(txt, info)=>{
    // normally info is the file name
    let obj = {}
    let rows = txt.split(/[\r\n]+/g)
    obj.txt = txt
    obj.info = info

    let n = rows.filter(r => (r[0] == '#')).length
    obj.meta = rows.slice(0, n - 1).join('\r\n')
    obj.cols = rows[n - 1].slice(2).split(/\t/)
    obj.dt = rows.slice(n)
    obj.dt = obj.dt.map((r, i) => {
        r = r.split('\t')
        r[2] = parseInt(r[2])
        // position in the chr
        r[4] = i
        return r
    })
    return obj
}

pgs.prs23textArea = async(txt)=>{
    let ta = document.createElement('textarea'); //DOM.element('textarea');
    ta.value = 'loading, please wait ...'
    ta.style="width:100%;color:lime;background-color:black;height:20em;font-size:small"
    ta.value = txt
  return ta;
}

pgs.parse=async(txt)=>{
    if(!txt){ // sample score file
        txt=await pgs.loadScore('PGS000004')
    }
    if(txt.length<100){
        txt=await pgs.loadScore(txt)
    }
    let arr = txt.split(/\n/).filter(x=>x.length>0) // remove empty rows
    let y={info:pgs.deblank(arr[0])}
    let parm=''
    for(var i = 1;i<arr.length;i++){
        if(arr[i][0]=='#'){
            if(arr[i][1]=='#'){
                parm=pgs.deblank(arr[i])
                y[parm]={}
            }else{
                let av = pgs.deblank(arr[i]).split('=').map(pgs.deblank)
                y[parm][av[0]]=av[1]
            }

            ////console.log(i,arr[i])
        }
        else{
            ////console.log(i)
            break
        }
    }
    ////console.log(i,arr[i])
    y.fields = arr[i].split(/\t/g) // list
    y.values = arr.slice(i+1).map(x=>x.split(/\t/g).map(xi=>parseFloat(xi)?parseFloat(xi):xi))
    return y
}

pgs.info = async(id='PGS000004')=>{
    return await pgs.get(`score/${id}?format=json`)
}
pgs.getRsid = async(x = 'chr1:g.100880328A>T?fields=dbsnp.rsid')=>{
    let url = 'https://myvariant.info/v1/variant/'
    if(typeof(x)=='string'){
        url+=decodeURIComponent(x)
    }else{ // something like [1,100880328,"T","A"]
        url+=`chr${x[0]}:g.${x[1]}${x[3]}>${x[2]}?fields=dbsnp.rsid`
    }
    //return (await fetch(url)).json()
    let y = await (await fetch(url)).json()
    return y.dbsnp.rsid
    // chr1:g.100880328A>T?fields=dbsnp.rsid
    //https://myvariant.info/v1/variant/
}

pgs.ini=()=>{ // act on context, such as search parameters. Not called automatically here.
    pgs.parms={}
    if(location.search.length>3){
        location.search.slice(1).split('&').map(x=>{aa=x.split('=');pgs.parms[aa[0]]=aa[1]})
    }
    if(pgs.parms.id){
        let el = document.getElementById('inputID')
        let bt = document.getElementById('retrieveButton')
        if(el&&bt){
            el.value="PGS000000".slice(0,-pgs.parms.id.length)+pgs.parms.id
            bt.click()
        }
    }
}


export{ pgs}
