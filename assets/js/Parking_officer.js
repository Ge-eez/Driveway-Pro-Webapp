//declare UI variables 
const plateInput = document.querySelector("#plateInput")
const parkBtn = document.querySelector("#parkbtn")
const modals = document.querySelector(".modal-body")
const act_tab = document.querySelector("#activeTicketsTab")
const plateDis = document.querySelector("#plateDisplay")
const ticketDis = document.querySelector("#displayTickets")
const strtTimeDis = document.querySelector("#strTime")
const exitPlateInput = document.querySelector("#ExitPlateInput")
const exitUserBtn = document.querySelector("#ExitUserBtn")
var count = false;

let DB;

document.addEventListener("DOMContentLoaded", () => {
    let TicketDB = indexedDB.open("Tickets", 1)
    act_tab.addEventListener("click", actTab);
    parkBtn.addEventListener("click", parkUser);
    strtTimeDis.innerHTML = currentTime()
    exitUserBtn.addEventListener("click", exitUser)


    TicketDB.onerror = function () {
        console.log("there was an error")
    }
    TicketDB.onsuccess = function () {
        console.log("database ready")
        DB = TicketDB.result;

    }

    const ticketData = [
        { active: "true", plate_Number: "B50286", StartTime: "4:50", endTime: "5:40", price: 25 },
        { active: "true", plate_Number: "B50286", StartTime: "4:50", endTime: "5:40", price: 25 },
        { active: "true", plate_Number: "B50286", StartTime: "4:50", endTime: "5:40", price: 25 }
    ]
    TicketDB.onupgradeneeded = function (e) {
        let db = e.target.result;

        let objectStore = db.createObjectStore("Tickets", { keyPath: 'id', autoIncrement: true })

        objectStore.createIndex('active', 'active', { unique: false });
        objectStore.createIndex('plate_Number', 'plate_Number', { unique: true });
        objectStore.createIndex('StartTime', 'StartTime', { unique: false });
        objectStore.createIndex('endTime', 'endTime', { unique: false });
        objectStore.createIndex('price', 'price', { unique: false });


        objectStore.transaction.oncomplete = function (e) {
            // Store values in the newly created objectStore.
            var objectStore = db.transaction("Tickets", "readwrite").objectStore("Tickets");
            ticketData.forEach(function (company) {
                objectStore.add(company);
            });
        };
        console.log(`Its ready`);

    }
    function parkUser() {
        var regex = /^([A-Z a-z][0-9]{5})+$/;
        var OK = regex.exec(plateInput.value);
        if (!OK) {
            console.error(plateInput.value + 'Proper plate number');
        } 
        if (plateInput.value === "" || !OK) {

            plateInput.style.borderColor = "red";

            return;
        }
        alterModal("#prkModal", plateInput.value ,currentTime());
        plateInput.style.borderColor = "";
        newTicket = {
            active: "true", plate_Number: plateInput.value, StartTime: currentTime(), endTime: "--:--", price: "$$.$$"
        }
        var objectStore = DB.transaction("Tickets", "readwrite").objectStore("Tickets");



        objectStore.transaction.oncomplete = function (e) {
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
    function actTab() {

        function displayData() {
            var objectStore = DB.transaction("Tickets", "readonly").objectStore('Tickets');

            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.active === "true") {
                        displayTickets(cursor.value.plate_Number)
                        //console.log(cursor.value.plate_Number)
                        cursor.continue();
                    } else if (cursor.value.active === "false") {
                        cursor.continue();
                    } else {
                        console.log('Entries all displayed.');
                    }
                }

            };
        }
        ticketDis.innerHTML = ""
        displayData()
    }
    function displayTickets(plateNum) {

        const li = document.createElement("li");

        li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center")

        var btn = document.createElement("BUTTON");   // Create a <button> element
        btn.innerHTML = "details";                   // Insert text
        btn.addEventListener("click", ticketDetail)
        btn.classList.add("btn", "btn-primary")
        const span = document.createElement("span")
        span.innerHTML = plateNum
        span.classList.add("span")
        li.appendChild(document.createTextNode("Plate Number: "))
        li.appendChild(span)
        li.appendChild(btn);
        ticketDis.appendChild(li)
        ticketDis.appendChild(document.createElement("br"))
        function ticketDetail(e) {
            var a = e.currentTarget.parentNode.querySelector(".span").innerHTML;
            var objectStore = DB.transaction("Tickets", "readonly").objectStore('Tickets');

            objectStore.openCursor().onsuccess = async function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.plate_Number == a) {
                        alterModal("#try", a, cursor.value.StartTime)
                        $('#activeTicketsModal').modal('show');
                    } else {
                        cursor.continue();
                    }
                }

            };


        }
    }


    function exitUser(){
        var objectStore = DB.transaction("Tickets", "readwrite").objectStore('Tickets');
        price()
        objectStore.openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                if (cursor.value.plate_Number === exitPlateInput.value) {
                    const updateData = cursor.value;

                    updateData.active = "false";
                    updateData.endTime = currentTime();
                    updateData.price = price(cursor.value.StartTime, cursor.value.endTime) + " Br";
                    const request = cursor.update(updateData);
                    request.onsuccess = function(){
                        alterModal("#extModal", cursor.value.plate_Number, cursor.value.StartTime, cursor.value.endTime, cursor.value.price)
                        $('#exitModal').modal('show');    
                    }
                    
                    
                    //displayTickets(cursor.value.plate_Number)
                    //console.log(cursor.value.plate_Number)
                    cursor.continue();
                }else {
                    
                    cursor.continue();
                }
            }

        };
    }




});

function alterModal(a, b, c , d = "--:--", f = "$$.$$") {
    document.querySelector(a).innerHTML = ""
    const ticketDetails = document.createElement("li")
    ticketDetails.appendChild(document.createTextNode("plate number :" + " " + b))
    ticketDetails.appendChild(document.createElement("br"))
    ticketDetails.appendChild(document.createTextNode("Starting Time :" + " " + c))
    ticketDetails.appendChild(document.createElement("br"))
    ticketDetails.appendChild(document.createTextNode("ending Time :" + " " + d))
    ticketDetails.appendChild(document.createElement("br"))
    ticketDetails.appendChild(document.createTextNode("Spot : " + " " + "5"))
    ticketDetails.appendChild(document.createElement("br"))
    ticketDetails.appendChild(document.createTextNode("Price : " + " " + f))
    ticketDetails.appendChild(document.createElement("br"))

    document.querySelector(a).appendChild(ticketDetails)





}

function currentTime() {
    let today = new Date();

    let minute;
    if (today.getMinutes() < 10) {
        minute = "0" + today.getMinutes()
    } else {
        minute = today.getMinutes()
    }
    /*AM PM time today.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) */
    let dateText =
        today.getHours() +
        ":" +
        minute;
    return (dateText);
}
function price(strTi = "21:53",endTi = "23:02"){
       a = strTi.replace(":" , ".")
       b = endTi.replace(":" , ".")
       return(((b - a).toFixed(2) * 10.0).toFixed(2));
        



}


function openLink(e, id) {
    var i, tab_content, tablinks;
    tab_content = document.getElementsByClassName("tab-content");
    for (i = 0; i < tab_content.length; i++) {
        tab_content[i].style.display = 'none';
    }

    tablinks = document.getElementsByClassName("tab-links");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(id).style.display = "flex";
    e.currentTarget.className += " active";
}