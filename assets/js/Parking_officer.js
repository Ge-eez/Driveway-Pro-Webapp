//declare UI variables 
const plateInput = document.querySelector("#plateInput")
const parkBtn = document.querySelector("#parkbtn")
const ticketDetailBtn = document.querySelector("#ticketDetails")
const modals = document.querySelector(".modal-body")
const act_tab = document.querySelector("#activeTicketsTab")

let DB;

document.addEventListener("DOMContentLoaded", () => {
    let TicketDB = indexedDB.open("Tickets", 1)
    act_tab.addEventListener("click", actTab);
    parkBtn.addEventListener("click", parkUser);
    ticketDetailBtn.addEventListener("click", ticketDetail)
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
        objectStore.createIndex('plate_Number', 'plate_Number', {unique: true});
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
        if (plateInput.value === "") {
            
            plateInput.style.borderColor = "red";
      
            return;
        }
        alterModal();
        plateInput.style.borderColor = "";
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
            $('#parkModal').modal('show');
            
        };

    
          
    }
    function actTab(){
        
    }
    function ticketDetail(){
        alterModal()
        $('#activeTicketsModal').modal('show');
    }
    currentTime();




});

function alterModal(){
    modals.innerHTML = ""
    const ticketDetails = document.createElement("li")
    ticketDetails.appendChild(document.createTextNode("plate number :" + " " + plateInput.value))
    ticketDetails.appendChild(document.createElement("br"))
    ticketDetails.appendChild(document.createTextNode("Starting Time :" + " " + currentTime() )) 
    ticketDetails.appendChild(document.createElement("br"))
    ticketDetails.appendChild(document.createTextNode("ending Time :" + " " + "--:--" )) 
    ticketDetails.appendChild(document.createElement("br"))
    ticketDetails.appendChild(document.createTextNode("Spot : " + " " + "5" )) 
    ticketDetails.appendChild(document.createElement("br"))
    ticketDetails.appendChild(document.createTextNode("Price : " + " " + "$$.$$" )) 
    ticketDetails.appendChild(document.createElement("br"))

    modals.appendChild(ticketDetails)

    

    
    
}

function currentTime(){
    let today = new Date();
    
    let minute;
    if(today.getMinutes() < 10){
        minute = "0" + today.getMinutes()
    }else{
        minute = today.getMinutes()
    }
    /*AM PM time today.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) */
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