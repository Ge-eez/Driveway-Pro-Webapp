//declare UI variables 
const plateInput = document.querySelector("#plateInput")
const parkBtn = document.querySelector("#parkbtn")


let DB;

document.addEventListener("DOMContentLoaded", () => {
    let TicketDB = indexedDB.open("Tickets", 1)
    parkBtn.addEventListener("click", parkUser);
    TicketDB.onerror = function(){
        console.log("there was an error")
    }
    TicketDB.onsuccess = function(){
        console.log("database ready")
        DB = TicketDB.result;

    }
    const ticketData = [
        {active:"true" ,plate_Number:"B50286", StartTime:"4:50", endTime:"5:40", price:25},
        {active:"true" ,plate_Number:"B50286", StartTime:"4:50", endTime:"5:40", price:25},
        {active:"true" ,plate_Number:"B50286", StartTime:"4:50", endTime:"5:40", price:25}
    ]
    TicketDB.onupgradeneeded = function(e){
        let db = e.target.result;

        let objectStore = db.createObjectStore("Tickets", {keyPath:'id', autoIncrement: true})

        objectStore.createIndex('active', 'active', {unique: false});
        objectStore.createIndex('plate_Number', 'plate_Number', {unique: false});
        objectStore.createIndex('StartTime', 'StartTime', {unique: false});
        objectStore.createIndex('endTime', 'endTime', {unique: false});
        objectStore.createIndex('price', 'price', {unique: false});


        objectStore.transaction.oncomplete = function(e) {
            // Store values in the newly created objectStore.
            var objectStore = db.transaction("Tickets", "readwrite").objectStore("Tickets");
            ticketData.forEach(function(company) {
              objectStore.add(company);
            });
          };
        console.log(`Its ready`);

    }
    function parkUser(){
        
        newTicket ={
            active:"true" , plate_Number : plateInput.value , StartTime:currentTime() , endTime:"--:--" , price:"$$.$$"
        }
        var objectStore = DB.transaction("Tickets", "readwrite").objectStore("Tickets");
        
        objectStore.transaction.oncomplete = function(e) {
            // Store values in the newly created objectStore.
            var objectStore = DB.transaction("Tickets", "readwrite").objectStore("Tickets");
            objectStore.add(newTicket);
            /* newTicket.forEach(function(company) {
              objectStore.add(company);
            }); */ 
            plateInput.value = "";
        };

    
          
    }
    currentTime();




});
function currentTime(){
    let today = new Date();
    let minute;
    if(today.getMinutes() < 10){
        minute = "0" + today.getMinutes()
    }else{
        minute = today.getMinutes()
    }
    let dateText =
      today.getHours() +
      ":" +
      minute;
    return(dateText);
}



function openLink(e, id){
    var i,tab_content,tablinks;
    tab_content = document.getElementsByClassName("tab-content");
    for(i = 0; i<tab_content.length; i++){
        tab_content[i].style.display = 'none';
    }
    
    tablinks = document.getElementsByClassName("tab-links");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(id).style.display = "flex";
    e.currentTarget.className += " active";
}