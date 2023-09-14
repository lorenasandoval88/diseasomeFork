(async()=>{
    pgs23 = await import('https://github.com/episphere/riskome/export.js')
    //pgs23 = await import('http://127.0.0.1:5500/export.js')
    if(typeof(define)!='undefined'){
        define(pgs23)
    }
})()
