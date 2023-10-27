console.log("calc.js")

var makeButton = function () {
    if (document.getElementById("button2") == null) {

        var button = document.createElement('button');
        button.innerHTML = 'Run pgs calcluations';
        button.id = "button2"
               // <h5>Polygenic Risk Score Calculator</h5>

        button.onclick = function () {
            (async () => {
                //pgs23 = await import('http://127.0.0.1:5501/main.js')
                //pgs23 = await import(location.href+'/export.js')
                pgs23 = await import('https://episphere.github.io/diseasome/main.js')
                pgs23.ui()
            })()
            return false;
        };
        document.getElementById("pgsDiv").appendChild(button);
        console.log(button)
    }
};

document.getElementById('myNum').addEventListener('change', makeButton);
