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
