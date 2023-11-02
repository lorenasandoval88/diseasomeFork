console.log("------------------")

console.log("calc.js loaded")

import {  oneTrait,  oneTraitSubset} from '../sdk/oneTrait.js'


var makeButton = function () {

    if (document.getElementById("button2") == null) {

        var button = document.createElement('button');
        button.innerHTML = 'Open PRS Calculator';
        button.id = "button2"
               // <h5>Polygenic Risk Score Calculator</h5>

        button.onclick = function () {

            (async () => {

                //let pgs23 = await import('http://127.0.0.1:5501/main.js')
                //pgs23 = await import(location.href+'/export.js')
                pgs23 = await import('https://episphere.github.io/diseasome/main.js')

                let ids = oneTraitSubset.dt.pgsIds
                ids.map((id, i) => {
                   pgs23.ui2(id, oneTraitSubset.dt.scoreTxt[i])
                    }
                )

            })()

            return false;
        };
        document.getElementById("pgsDiv").appendChild(button);
    }
};

document.getElementById('my23Div').addEventListener('change', makeButton);
