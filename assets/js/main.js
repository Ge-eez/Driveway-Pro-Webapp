let okay = document.getElementById("okay")
let radios = document.getElementsByName("textEditor")
function pop_up_answer(e){
    let chosen;
    let link;
    for (let index = 0; index < radios.length; index++) {
        if(radios[index].checked) {
            chosen = radios[index].id
        }
        
    }

    let current_location = location.href
    // If it's loading locally
    if((current_location).includes(".html")){
        chosen += ".html"
        current_location = current_location.slice(0, -10)
    }
    // If it's loading from live server
    else if(current_location.includes("127.0.0.1")){
        chosen += ".html"
    }
    link = current_location + chosen
    location.href = link

}
okay.addEventListener('click', pop_up_answer)
document.addEventListener("DOMContentLoaded", function () {

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