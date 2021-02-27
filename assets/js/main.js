document.addEventListener("DOMContentLoaded", function () {

    // Money case
    accountDB().then(function(result){
        DB = result
    })

    let who = document.getElementById('who')
    let what = document.getElementById('what')
    let services = document.getElementById('services')
    let elsh = document.getElementById('elsh')
    let ed = document.getElementById('ed')
    let tedy = document.getElementById('tedy')
    let minte = document.getElementById('minte')
    let xhr = new XMLHttpRequest();
    xhr.open('GET', './assets/js/jsonData/index.json', true);
    xhr.onload = function (e) {
        if (this.status == 200) {
            const data = JSON.parse(this.responseText);
            who.innerText = data.who
            what.innerText = data.what
            services.innerText = data.services
            elsh.href = data.Elshadai
            ed.href = data.Eden
            tedy.href = data.Tewodros
            minte.href = data.Mintesnot
        }
    }
    xhr.send();
})