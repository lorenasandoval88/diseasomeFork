


getPgsIds = async()=>{

    Array.from(new Set( traitFiles.flatMap(x => x[type])
            .sort().filter(e => e.length).map(JSON.stringify)), JSON.parse)
}