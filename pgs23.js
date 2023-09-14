(async()=>{
    pgs23 = await import('https://github.com/epishpere/riskome/export.js')
    //pgs23 = await import('http://127.0.0.1:5500/export.js')
    if(typeof(define)!='undefined'){
        define(pgs23)
    }
})()
