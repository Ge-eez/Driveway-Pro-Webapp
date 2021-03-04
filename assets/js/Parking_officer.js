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

const clearSt = document.querySelector("#clearStack")
const xbtn = document.querySelector(".remove-item")


var count = false;

const companyName = document.querySelector('#comp-name')
const slotDesc = document.querySelector('#slot-desc')
const poName = document.querySelector('#po-name')

const companyName2 = document.querySelector('#comp-name2')
const slotDesc2 = document.querySelector('#slot-desc2')
const poName2 = document.querySelector('#po-name2')

const companyName3 = document.querySelector('#comp-name3')
const slotDesc3 = document.querySelector('#slot-desc3')
const poName3 = document.querySelector('#po-name3')

const companyName4 = document.querySelector('#comp-name4')
const slotDesc4 = document.querySelector('#slot-desc4')
const poName4 = document.querySelector('#po-name4')

let poKeyEmail = localStorage.getItem('parking_officer');
let companyKeyEmail;
var count = false;

let DBTicket;
let DBUser;
let DBCompany;
let DBAccount;
document.addEventListener("DOMContentLoaded", () => {
    userDB().then(function (result) {
        DBUser = result
        displayName()
    });

    ticketDB().then(function (result) {
        DBTicket = result
    });

    accountDB().then(function (result) {
        DBAccount = result
    });
    if (!poKeyEmail) {
        alert("Login first")
        window.history.back();
    }
    act_tab.addEventListener("click", actTab);
    parkBtn.addEventListener("click", parkUser);
    clearSt.addEventListener("click", clearStack);

    strtTimeDis.innerHTML = currentTime()
    exitUserBtn.addEventListener("click", exitUser)


    function displayName() {

        poKeyEmail = poKeyEmail.slice(1, poKeyEmail.length - 1)
        let transaction = DBUser.transaction(['users'], 'readwrite');
        let objectStore = transaction.objectStore('users');
        let request = objectStore.get(poKeyEmail);
        request.onsuccess = function () {
            companyKeyEmail = request.result.company
            poName.textContent = request.result.name
            poName2.textContent = request.result.name
            poName3.textContent = request.result.name
            poName4.textContent = request.result.name

            companyDB().then(function (result) {
                DBCompany = result
                displayCompany()
            });
        }
        request.onerror = () => {
            alert("Login first")
            window.history.back()
        }
    }
    function displayCompany() {
        let transaction = DBCompany.transaction(['companies'], 'readwrite');
        let objectStore = transaction.objectStore('companies');
        let request = objectStore.get(companyKeyEmail);
        request.onsuccess = function () {
            companyName.textContent = (request.result.name)
            companyName2.textContent = (request.result.name)
            companyName3.textContent = (request.result.name)
            companyName4.textContent = (request.result.name)
            slotDesc.textContent = `${request.result.active_slots}/${request.result.slots}`
            slotDesc2.textContent = `${request.result.active_slots}/${request.result.slots}`
            slotDesc3.textContent = `${request.result.active_slots}/${request.result.slots}`
            slotDesc4.textContent = `${request.result.active_slots}/${request.result.slots}`
        }
        request.onerror = (e) => {
            console.log(e)
        }
    }


    function parkUser() {
        var timein = document.querySelector("#hour")
        var timeinmin = document.querySelector("#minute")
        var endtime = timein.value + ":" + timeinmin.value
        var regex = /^([A-Z a-z][0-9]{5})+$/;
        var OK = regex.exec(plateInput.value);
        
        if (!OK) {
            console.error(plateInput.value + 'Proper plate number');
        }
        if (plateInput.value === "" || !OK ) {

            plateInput.style.borderColor = "red";

            return;
        }

        let transaction = DBCompany.transaction(["companies"], "readwrite");
        let slotsUpdate = transaction.objectStore("companies");
        let requestMinus = slotsUpdate.get(companyKeyEmail);
        requestMinus.onsuccess = function() {
            let active_slots= requestMinus.result.active_slots
            if(active_slots>0){

                alterModal("#prkModal", plateInput.value, currentTime());
                plateInput.style.borderColor = "";
                newTicket = {
                    active: "true", plate_Number: plateInput.value, StartTime: currentTime(), endTime: "--:--", price: "$$.$$"
                }
                var objectStore = DBTicket.transaction("Tickets", "readwrite").objectStore("Tickets");
        
        
                let result = objectStore.add(newTicket)
                result.onsuccess = () => {
        
                    plateInput.value = "";
                    $('#parkModal').modal('show');
                    adjustCompanyDB(-1)
                    
        
                }
                result.onerror = (e) => { console.log(e) }
            }
            else{
                
                alert("No space")

                return;
            }
        }
    }
    function adjustCompanyDB(tag){
        let transaction = DBCompany.transaction(["companies"], "readwrite");
            let slotsUpdate = transaction.objectStore("companies");
            let requestMinus = slotsUpdate.get(companyKeyEmail);
            requestMinus.onsuccess = function() {
                let updateData = {
                    name: requestMinus.result.name,
                    email: requestMinus.result.email,
                    password: requestMinus.result.password,
                    charge: requestMinus.result.charge,
                    slots: requestMinus.result.slots,
                    active_slots: Number(Number(requestMinus.result.active_slots) + tag),
                    opens_at: requestMinus.result.opens_at,
                    closes_at: requestMinus.result.closes_at,
                    latitude: requestMinus.result.latitude,
                    longitude: requestMinus.result.longitude
                }

                let updateTable = slotsUpdate.put(updateData);
                updateTable.onsuccess = function() {
                    console.log("done active slots decreased");
                }
            }

            requestMinus.onerror = function() {
                console.log("An error occured");
            };
    }
    function actTab() {

        function displayData() {
            var objectStore = DBTicket.transaction("Tickets", "readonly").objectStore('Tickets');

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
    document.querySelectorAll('input[type=number]')
        .forEach(e => e.oninput = () => {
            // Always 2 digits
            if (e.value.length >= 2) e.value = e.value.slice(0, 2);
            // 0 on the left (doesn't work on FF)
            if (e.value.length === 1) e.value = '0' + e.value;
            // Avoiding letters on FF
            if (!e.value) e.value = '00';

            return e
        });
       

    function displayTickets(plateNum) {

        const li = document.createElement("li");

        li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center")

        let btn = document.createElement("BUTTON");   // Create a <button> element
        btn.innerHTML = "details";                   // Insert text
        btn.addEventListener("click", ticketDetail)
        btn.classList.add("btn", "btn-primary")
        let exitBtn = document.createElement("BUTTON");   // Create a <button> element
        exitBtn.innerHTML = "X";                   // Insert text
        exitBtn.addEventListener("click", function (e) {
            exitPlateInput.value = plateNum
            openLink(e, 'Exit')
        })
        exitBtn.classList.add("btn", "btn-danger")
        const span = document.createElement("span")
        span.innerHTML = plateNum
        const innerspan = document.createElement("span")
        innerspan.innerHTML = '<a href="#Active_tickets" onclick="openLink(event, \'Exit\')"><i class="fa fa-remove"></i></a>'
        span.classList.add("span")


        li.appendChild(document.createTextNode("Plate Number: "))
        span.appendChild(innerspan)
        li.appendChild(span)
        li.appendChild(btn);

        li.appendChild(exitBtn)
        ticketDis.appendChild(li)
        ticketDis.appendChild(document.createElement("br"))
        function ticketDetail(e) {
            var a = e.currentTarget.parentNode.querySelector(".span").innerHTML;
            var objectStore = DBTicket.transaction("Tickets", "readonly").objectStore('Tickets');

            objectStore.openCursor().onsuccess = async function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.plate_Number == a) {
                        alterModal("#try", a, cursor.value.StartTime,cursor.value.endTime)
                        $('#activeTicketsModal').modal('show');
                    } else {
                        cursor.continue();
                    }
                }

            };


        }

        ticketDis.addEventListener("click", xUserBtn);
        function xUserBtn(e) {
            if (e.target.classList.contains("btn")) {
                console.log(e.target.parentElement.children[0].innerText)
                var a = e.target.parentElement.children[0].innerText;
                var objectStore = DB.transaction("Tickets", "readonly").objectStore('Tickets');

                objectStore.openCursor().onsuccess = async function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        if (cursor.value.plate_Number == a) {
                            alterModal("#try", a, cursor.value.StartTime, cursor.value.endTime)
                            $('#activeTicketsModal').modal('show');
                        } else {
                            cursor.continue();
                        }
                    }

                };


            }


            if (e.target.parentElement.parentElement.parentElement.classList.contains("span")) {
                //console.log(e.target.parentElement.parentElement.parentElement.firstChild)
                var str = e.target.parentElement.parentElement.parentElement.innerText
                exitPlateInput.value = str
                console.log(str)
            }
        }

    }
    function adjustIncome(plate, priced){
        // Update account database
        let transactionAccount = DBAccount.transaction(["account"], "readwrite");
        let accountUpdate = transactionAccount.objectStore("account");
        let accountAdd = accountUpdate.get(companyKeyEmail);
        
        // Added data to the account database
        accountAdd.onsuccess = function() {
            let time = new Date();                                            
            let accountData = {
                date: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`,
                company_email: companyKeyEmail,
                user_email: plate,
                amount: priced
            }

            let updateAccount = accountUpdate.add(accountData);
            updateAccount.onsuccess = function() {
                console.log("done account added");
            }
        }

        accountAdd.onerror = function() {
            console.log("An error occured");
        };
    }

    function exitUser() {
        var objectStore = DBTicket.transaction("Tickets", "readwrite").objectStore('Tickets');

        price()
        objectStore.openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                let entered = exitPlateInput.value
                if (cursor.value.plate_Number === entered && cursor.value.active == 'true') {
                    const updateData = cursor.value;

                    updateData.active = "false";
                    updateData.endTime = currentTime();
                    updateData.price = price(cursor.value.StartTime, cursor.value.endTime) + " Br";
                    const request = cursor.update(updateData);
                    request.onsuccess = function () {
                        exitPlateInput.value = ""
                        alterModal("#extModal", cursor.value.plate_Number, cursor.value.StartTime, cursor.value.endTime, cursor.value.price)
                        $('#exitModal').modal('show');
                        adjustCompanyDB(+1)
                        adjustIncome(entered, updateData.price)
                    }
                    
                    request.onerror = (e) => {
                        console.log(e)
                    }

                } else {

                    cursor.continue();
                }
            }

        };
    }

    function clearStack(){

        var objectStore = DB.transaction("Tickets", "readwrite").objectStore('Tickets');
        objectStore.openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                if (cursor.value.active = "true") {
                    const updateData = cursor.value;
                    updateData.active = "false";
                    
                    const request = cursor.update(updateData);
                    request.onsuccess = function() {

                        console.log("Stack cleared")
                    }
                    cursor.continue();
                }else {

                    cursor.continue();
                }
            }

        };

    }
    


});

function alterModal(a, b, c, d = "--:--", f = "$$.$$") {
    document.querySelector(a).innerHTML = ""
    const ticketDetails = document.createElement("li")
    ticketDetails.appendChild(document.createTextNode("plate number :" + " " + b))
    ticketDetails.appendChild(document.createElement("br"))
    ticketDetails.appendChild(document.createTextNode("Starting Time :" + " " + c))
    ticketDetails.appendChild(document.createElement("br"))
    ticketDetails.appendChild(document.createTextNode("ending Time :" + " " + d))
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
function price(strTi = "21:53", endTi = "23:02") {
    a = strTi.replace(":", ".")
    b = endTi.replace(":", ".")
    return (((b - a).toFixed(2) * 10.0).toFixed(2));




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