const parkBtn = document.querySelector('.parkButton');
const nearbylists = document.querySelector('.nearbylists');
const display = document.querySelector('.display');
const getdir = document.querySelector('.getdir');
const map = document.querySelector('#myMap');
const modal = document.getElementById("myModal");
const span = document.getElementsByClassName("close")[0];
const modal_content = document.querySelector(".content");
const page_wrapper = document.querySelector(".page-wrapper");

// Close the modal when x button is clicked
span.onclick = function() {
    modal.style.display = "none";
    modal_content.innerHTML = '';
}

let DBUser;
let DBCompany;
let DBAccount;
let DBTicket;
document.addEventListener('DOMContentLoaded', () => {
    // Open working databases
    userDB().then(function(result){
        DBUser = result
    });

    companyDB().then(function(result){
        DBCompany = result
    });

    ticketDB().then(function(result){
        DBTicket = result
    });

    accountDB().then(function(result){
        DBAccount = result
    });  
    
    function notificationModal(...contentInfos) {
        let i = 0;
        contentInfos.forEach(element => {
            modal_content.appendChild(element);
            const breaks = document.createElement('p');
            breaks.className = 'detailsBreak';
            breaks.innerHTML = '<br>';
            breaks.style.maxHeight = '0.5rem';
            modal_content.appendChild(breaks);
            modal.style.display = "block";
            modal.style.zIndex = "1000";
            span.style.display = "none";
            ((contentInfos[i]).type === undefined) ? contentInfos[i].onclick = function(){
                modal.style.display = "none";
                modal_content.innerHTML = '';
            } : 
            i++
        });

    }

    // Check for user login before user accessing page
    if (!localStorage.getItem("user")) {
        console.log(`Login`);
        // Display a modal with message for user to login and direct to user login page
        const info = document.createElement('a');
        info.className = 'details';
        info.innerHTML = '<p>You must first login to access this page :) Thank you</p>';

        const infoBtn = document.createElement('div');
        infoBtn.className = 'buttonContainer';
        infoBtn.innerHTML = '<a class="parkButton login100-form-btn button-load text-light" href="./user_login.html">Log in</a>';

        notificationModal(info,infoBtn);
    }

    
    // Latitude/longitude spherical formula where R is earth’s radius (mean radius = 6,371km);
    // note that angles need to be in radians to pass to trig functions and return the calulated distance
    function distanceCalc(result, pos) {
        let lat = pos.coords.latitude;
        let lng = pos.coords.longitude;

        let R = 6371; // km
        let dLat = (result.value.latitude - lat)* Math.PI / 180;
        let dLon = (result.value.longitude - lng)* Math.PI / 180;
        let lat1 = pos.coords.latitude* Math.PI / 180;
        let lat2 = result.value.latitude * Math.PI / 180;

        let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        let distance = R * c;
        return distance
    }

    // Current time response
    let timeNow = () =>{
        let timeFormat = [];
        return function() {
            let today = new Date();
            let h = today.getHours();
            let m = today.getMinutes();
            let s = today.getSeconds();
            timeFormat.push(`${h} : ${m} : ${s}`);
            //get the AM / PM value 
            let am_pm = h > 12 ? 'PM' : 'AM';
            // Convert the hour to 12 format 
            h = h % 12 || 12;
            h = h < 10 ? `0${h}` : h;
            m = m < 10 ? `0${m}` : m;
            s = s < 10 ? `0${s}` : s;
            timeFormat.push(`${h} : ${m} : ${s} ${am_pm}`);

            return timeFormat;
        }   
    }

    // Checker of company's closing time and current time
    function closingTimeChecker(companyClosesAt, timeCurrent) {
        let current = timeCurrent.match(/\d+/g).map(Number);
        let closesAt = String(companyClosesAt).match(/\d+/g).map(Number);
        let closes = 0;

        if (closesAt.length === 1) {
            closes = Number(`${closesAt[0]}.${0}`);
        } else {
            closes = Number(`${closesAt[0]}.${closesAt[1]}`);
        } 
        let currently = Number(`${current[0]}.${current[1]}`);
        return closes - currently;
    }

    // Decreases an active slot in companies database
    function decreaseActiveSlots(companyEmail, nameCompany, emailCompany, passwordCompany, chargeCompany, slotsCompany,
        activeSlotsCompany,  opensAtCompany, closesAtCompany, latitudeCompany, longitudeCompany) {
        // Update compaines database to alter the active slots of the company
        let transaction = DBCompany.transaction(["companies"], "readwrite");
        let slotsUpdate = transaction.objectStore("companies");
        let requestMinus = slotsUpdate.get(companyEmail);

        // Decrease the active slots of the company by one
        requestMinus.onsuccess = function() {
            let updateData = {
                name: nameCompany,
                email: emailCompany,
                password: passwordCompany,
                charge: chargeCompany,
                slots: slotsCompany,
                active_slots: Number(Number(activeSlotsCompany) - 1),
                opens_at: opensAtCompany,
                closes_at: closesAtCompany,
                latitude: latitudeCompany,
                longitude: longitudeCompany
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

    // Adds a ticket in Tickets database
    function addTicketData(userPlate, start) {
        let dataTicket = {
            active: "true",
            plate_Number: userPlate,
            StartTime: start, 
            endTime: `--:--`, 
            price: `$$.$$`
        }
        let ticketsTransaction = DBTicket.transaction("Tickets", "readwrite").objectStore("Tickets");
        ticketsTransaction.transaction.oncomplete = function (e) {
            let objectStore = DBTicket.transaction("Tickets", "readwrite").objectStore("Tickets");
            objectStore.add(dataTicket);
            console.log(`Updated ticket`);
        };
    }

    // Adds an account in Account database
    function addAccountData(companyEmail, userEmail, price) {
        // Update account database
        let transactionAccount = DBAccount.transaction(["account"], "readwrite");
        let accountUpdate = transactionAccount.objectStore("account");
        let accountAdd = accountUpdate.get(companyEmail);
        
        // Added data to the account database
        accountAdd.onsuccess = function() {
            let time = new Date();                                            
            let accountData = {
                date: `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`,
                company_email: companyEmail,
                user_email: userEmail,
                amount: price.toFixed(2)
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

    // Updated the active slots in companies database
    function increaseActiveSlots(companyEmail, nameCompany, emailCompany, passwordCompany, chargeCompany, slotsCompany,
        activeSlotsCompany,  opensAtCompany, closesAtCompany, latitudeCompany, longitudeCompany) {
        // Update compaines database to alter the active slots of the company
        let transaction = DBCompany.transaction(["companies"], "readwrite");
        let slotsUpdate = transaction.objectStore("companies");
        let requestMinus = slotsUpdate.get(companyEmail);

        // Decrease the active slots of the company by one
        requestMinus.onsuccess = function() {
            let updateData = {
                name: nameCompany,
                email: emailCompany,
                password: passwordCompany,
                charge: chargeCompany,
                slots: slotsCompany,
                active_slots: Number(Number(activeSlotsCompany) + 1),
                opens_at: opensAtCompany,
                closes_at: closesAtCompany,
                latitude: latitudeCompany,
                longitude: longitudeCompany
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

    // Calculates price
    function priceCalc(companyCharge, startHour, startMin, startSec) {
        // Keep track of the ended time
        var now = new Date();
        var hour = now.getHours();
        var min = now.getMinutes();
        var sec = now.getSeconds();

        // Calculate the price based on the time and company's charge per hour
        let x = String(companyCharge).match(/\d+/g).map(Number);
        let charge = Number(`${x[0]}.${x[1]}`);
        let price = ((hour-startHour)*charge) + ((min - startMin)*(charge/60)) + ((sec - startSec)*(charge/3600));
        return price;
    }

    // Display content when park here is clicked
    function displayParkContent(parkContent, ...parkContents) {
        parkContents.forEach(element => {            
            parkContent.appendChild(element);
            const br = document.createElement('p');
            br.className = 'detailsBreak';
            br.innerHTML = '<br>';
            br.style.maxHeight = '0.5rem';
            parkContent.appendChild(br);
            
        });

    }

    // Display content when done parking is clicked\
    function displayTicketContent(ticketContent, ...ticketContents) {
        ticketContents.forEach(element => {            
            ticketContent.appendChild(element);
            const br = document.createElement('p');
            br.className = 'detailsBreak';
            br.innerHTML = '<br>';
            br.style.maxHeight = '0.5rem';
            ticketContent.appendChild(br);
            
        });
    }

    let count = 0;   

    // Nearby parking places functionality
    parkBtn.addEventListener("click", park);
    function park(e) {
        // Work on users database to track basic user's information
        let objectStoreUser = DBUser.transaction("users").objectStore("users");
        let userPlate = 0; 
        let userEmail = '';
        objectStoreUser.get(localStorage.getItem("user")).onsuccess = function() { }
        objectStoreUser.openCursor().onsuccess = function(e) {
            let cursor = e.target.result;

            userPlate = cursor.value.plate_number;
            userEmail = cursor.value.email;
        }
        
        navigator.geolocation.getCurrentPosition(locationHandler);
        
        function locationHandler(position){
            while(nearbylists.firstChild) { nearbylists.removeChild(nearbylists.firstChild) }

            let objectStoreCompany = DBCompany.transaction("companies").objectStore("companies");            
            objectStoreCompany.openCursor().onsuccess = function(e) {  
                let cursor = e.target.result;              
                if (cursor) {
                    // Create html elements
                    const written_content = document.createElement('div');
                    written_content.className = 'written_content';

                    const timerStart = document.createElement('p');
                    timerStart.className = 'timer_start';

                    const li = document.createElement('li');
                    li.className = 'nearby_collections';

                    const link = document.createElement('a');
                    link.className = 'details';
                    link.innerHTML = '<a style="color: #7CB9E8" class="parkButton">more details</a>';

                    const parkHere = document.createElement('div');
                    parkHere.className = 'buttonContainer';
                    parkHere.innerHTML = '<a class="parkButton login100-form-btn button-load text-light">Park Here</a>';

                    const parkContent = document.createElement('div');
                    parkContent.className = 'park_content';

                    const ticketContent = document.createElement('div');
                    ticketContent.className = 'ticket_content';

                    // Display companies to users only within their working hours
                    let hoursNow = new Date();
                    let hourNow = hoursNow.getHours();

                    let closingHour = String(cursor.value.closes_at).toLowerCase().includes('pm') ? String(cursor.value.closes_at).match(/\d+/g).map(Number)[0] + 12 : String(cursor.value.closes_at).match(/\d+/g).map(Number)[0];
                    let openingHour = String(cursor.value.opens_at).toLowerCase().includes('am') ? String(cursor.value.opens_at).match(/\d+/g).map(Number)[0] : String(cursor.value.opens_at).match(/\d+/g).map(Number)[0];

                    // Display nearby parking places within a distance of 5kms, avaiable parking spots and working hours
                    if (distanceCalc(cursor, position) <= 5 && (cursor.value.active_slots > 0) && ((closingHour - hourNow) >= 1) && ((hourNow - openingHour) >= 0)) {
                        // Keep track of the number of displayed companies
                        // let count = 0;
                        count += 1;

                        // Set attributes of the list items with appropriate descriptions
                        li.setAttribute('data-email', cursor.value.email);
                        li.setAttribute('data-name', `Company: ${cursor.value.name}`);
                        li.setAttribute('data-closes_at', `Parking place closes at: ${cursor.value.closes_at}`);
                        li.setAttribute('data-charge', `Charges per hour: ${cursor.value.charge} Birr`);
                        li.setAttribute('data-active_slots', `Current parking slots available: ${cursor.value.active_slots}`);

                        li.setAttribute('emailCompany', cursor.value.email);
                        li.setAttribute('nameCompany', cursor.value.name);
                        li.setAttribute('passwordCompany', cursor.value.password);
                        li.setAttribute('chargeCompany', cursor.value.charge);
                        li.setAttribute('slotsCompany', cursor.value.slots);
                        li.setAttribute('activeSlotsCompany', cursor.value.active_slots);
                        li.setAttribute('opensAtCompany', cursor.value.opens_at);
                        li.setAttribute('closesAtCompany', cursor.value.closes_at);
                        li.setAttribute('latitudeCompany', cursor.value.latitude);
                        li.setAttribute('longitudeCompany', cursor.value.longitude);

                        // Display name and contact information of a company in displaying nearby parking places
                        li.appendChild(document.createTextNode(`Company: ${cursor.value.name}`));
                        li.appendChild(document.createElement('br'));
                        li.appendChild(document.createTextNode(`Contact: ${cursor.value.email}`));

                        link.style.fontSize = '0.8rem';

                        // Display a link with more details of the company and button for parking alongside basic company information
                        written_content.appendChild(li);       
                        li.appendChild(link);
                        nearbylists.appendChild(written_content);   
                        written_content.appendChild(parkHere);

                        nearbylists.style.height = '100vh';
                        nearbylists.style.padding = '0'; 

                        map.style.display = 'none';
                        parkBtn.style.display = 'none';
                        getdir.style.padding = '0';   

                        // Park here functionality
                        parkHere.addEventListener('click', parkHereTimer); 
                        function parkHereTimer(e) {                      
                            if (e.target.parentElement.parentElement.firstChild.classList.contains('nearby_collections')) {  
                                // Done parking button when vehicle is moved from parking place thus parking ended 
                                const exit = document.createElement('div');
                                exit.className = 'exit buttonContainer';
                                exit.innerHTML = '<a class="parkButton singleButton login100-form-btn button-load text-light">Done Parking</a>';   

                                // Record user started parking time
                                let currentTime = timeNow();
                                let startedTime = currentTime()[1].split(":");
                                
                                let startTimer = currentTime()[0].split(":")
                                let startHour = Number(startTimer[0]);
                                let startMin = Number(startTimer[1]);
                                let startSec = Number(startTimer[2].match(/\d+/g).map(Number));

                                let start = `${startedTime[0]}:${startedTime[1]}`;

                                // Assign starting time to the UI
                                timerStart.innerHTML = `Start time: ${currentTime()[1]}`;                                
                                
                                // Target and keep tracj of the company's information from the database
                                let companyEmail = (e.target.parentElement.parentElement.firstChild.getAttribute('data-email'));
                                let companyName = (e.target.parentElement.parentElement.firstChild.getAttribute('data-name'));
                                let companyClosesAt = (e.target.parentElement.parentElement.firstChild.getAttribute('data-closes_at'));
                                let companyCharge = (e.target.parentElement.parentElement.firstChild.getAttribute('data-charge'));

                                let emailCompany = (e.target.parentElement.parentElement.firstChild.getAttribute('emailCompany'));
                                let nameCompany = (e.target.parentElement.parentElement.firstChild.getAttribute('nameCompany'));
                                let passwordCompany = (e.target.parentElement.parentElement.firstChild.getAttribute('passwordCompany'));
                                let chargeCompany = (e.target.parentElement.parentElement.firstChild.getAttribute('chargeCompany'));
                                let slotsCompany = (e.target.parentElement.parentElement.firstChild.getAttribute('slotsCompany'));
                                let activeSlotsCompany = (e.target.parentElement.parentElement.firstChild.getAttribute('activeSlotsCompany'));
                                let opensAtCompany = (e.target.parentElement.parentElement.firstChild.getAttribute('opensAtCompany'));
                                let closesAtCompany = (e.target.parentElement.parentElement.firstChild.getAttribute('closesAtCompany'));
                                let latitudeCompany = (e.target.parentElement.parentElement.firstChild.getAttribute('latitudeCompany'));
                                let longitudeCompany = (e.target.parentElement.parentElement.firstChild.getAttribute('longitudeCompany'));

                                // If there is 30 minutes or less time for company's clsoing hour notify user
                                if (closingTimeChecker(companyClosesAt, currentTime()[1]) <= 0.30) {
                                    // Display a modal to notify user, to move their vehicle within 30 minutes
                                    const notify = document.createElement('a');
                                    notify.className = 'details';
                                    notify.innerHTML = `<p>You have less than 30 minutes to move your vehicle. Please respect the company's working hour. Thank you</p>`;

                                    const notifyBtn = document.createElement('div');
                                    notifyBtn.className = 'buttonContainer';
                                    notifyBtn.innerHTML = '<a class="parkButton login100-form-btn button-load text-light">Close</a>';

                                    notificationModal(notify, notifyBtn);

                                    window.onclick = function(event) {
                                        if (event.target == modal) {
                                            modal.style.display = "none";
                                            modal_content.innerHTML = '';
                                        }
                                    }
                                }

                                // Update compaines database to alter the active slots of the company
                                decreaseActiveSlots(companyEmail, nameCompany, emailCompany, passwordCompany, chargeCompany, slotsCompany,
                                    activeSlotsCompany,  opensAtCompany, closesAtCompany, latitudeCompany, longitudeCompany);

                                // Add basic information to the Tickets database
                                addTicketData(userPlate, start);

                                nearbylists.innerHTML = '';

                                nearbylists.appendChild(parkContent);

                                // Display basic information of the company, user and starting time of the vehicle parked 
                                displayParkContent(parkContent, document.createTextNode(companyName), document.createTextNode(`Your plate Number: ${userPlate}`),
                                    document.createTextNode(companyCharge), document.createTextNode(companyClosesAt), timerStart, exit) ;

                                // Done parking functionality
                                exit.addEventListener('click', userTicket) 
                                function userTicket(e) {
                                    if (e.target.parentElement.parentElement.parentElement.classList.contains('nearbylists')) { 
                                        const done = document.createElement('div');
                                        done.className = 'done buttonContainer';
                                        done.innerHTML = '<a class="parkButton singleButton login100-form-btn button-load text-light" href="./index.html">Exit</a>';
                                                                               
                                        // Keep track of the ended time
                                        let currentTimes = timeNow();
                                        let endedTime = currentTimes()[1].split(":");

                                        // Calculate the price
                                        priceCalc(companyCharge, startHour, startMin, startSec);

                                        let end = `${endedTime[0]}:${endedTime[1]}`;
                                        
                                        const endTime = document.createElement('div');
                                        endTime.className = 'endTime';
                                        endTime.innerHTML = `End time: ${currentTimes()[1]}`; 

                                        nearbylists.innerHTML = '';

                                        nearbylists.appendChild(ticketContent);

                                        const infoDone = document.createElement('div');
                                        infoDone.className = 'done';
                                        infoDone.innerHTML = '<p>Please make sure to show this page to the parking officer before exiting :) Thank you for using our service</p>';

                                        timerStart.style.margin = "0";

                                        // Display basic information of company, user, ended time, price
                                        displayTicketContent(ticketContent, infoDone, document.createTextNode(companyName), document.createTextNode(`Your plate Number: ${userPlate}`),
                                            document.createTextNode(`Your total price is ${priceCalc(companyCharge, startHour, startMin, startSec).toFixed(2)} Birr`), timerStart, endTime, done);

                                        // Update Tickets database appending the end time and price
                                        let ticketsUpdated = DBTicket.transaction("Tickets", "readwrite").objectStore('Tickets');
                                        ticketsUpdated.openCursor().onsuccess = function (event) {
                                            var cursor = event.target.result;
                                            if (cursor) {
                                                const updateData = cursor.value;
                                                updateData.active = "false";
                                                updateData.endTime = end;
                                                updateData.price = priceCalc(companyCharge, startHour, startMin, startSec).toFixed(2);
                                                const request = cursor.update(updateData);
                                                request.onsuccess = function(){
                                                    console.log(`Successfully updated ticket`); 
                                                }
                                                cursor.continue();
                                            }
                                        };

                                        // Add user to account database
                                        addAccountData(companyEmail, userEmail, priceCalc(companyCharge, startHour, startMin, startSec));

                                        // Exit functionality
                                        done.onclick = function() {   
                                            ticketContent.innerHTML = '';  
                                            // Update the active slots in the database
                                            increaseActiveSlots(companyEmail, nameCompany, emailCompany, passwordCompany, chargeCompany, slotsCompany,
                                                activeSlotsCompany,  opensAtCompany, closesAtCompany, latitudeCompany, longitudeCompany);                                         

                                        }   
                                        activeSlotsCompany -= 1;

                                    }
                                }

                            }
                        }

                        // If there are no nearby places to display notify user
                        // if (count === 0) {
                        //     // Display a modal with content notifying user couldn't display nearby places currently
                        //     const info = document.createElement('a');
                        //     info.className = 'details';
                        //     info.innerHTML = '<p>There are no nearby parking places currently available :( <br> Sorry for the inconvenience.</p>';

                        //     const infoBtn = document.createElement('div');
                        //     infoBtn.className = 'buttonContainer';
                        //     infoBtn.innerHTML = '<a class="parkButton login100-form-btn button-load text-light">Ok</a>';

                        //     notificationModal(info, infoBtn);
                        // }
                        
                    } 
                    console.log(count);

                    cursor.continue();                    

                }      
                
            }  
        }   
        
        
    }  
    


    nearbylists.addEventListener('click', details);
    // more details functioanlity
    function details(e) {
        if (e.target.parentElement.classList.contains('details')) {
                let dataName = (e.target.parentElement.parentElement.getAttribute('data-name'));
                let dataCharge = (e.target.parentElement.parentElement.getAttribute('data-charge'));
                let dataClosesAt = (e.target.parentElement.parentElement.getAttribute('data-closes_at'));
                let dataActiveSlots = (e.target.parentElement.parentElement.getAttribute('data-active_slots'));

                // Display a modal with current basic information of the company from the database
                notificationModal(document.createTextNode(dataName), document.createTextNode(dataCharge), document.createTextNode(dataClosesAt), document.createTextNode(dataActiveSlots));
                span.style.display = "block";

                // Close the modal when the area surrounding it is clicked
                window.onclick = function(event) {
                    if (event.target == modal) {
                        modal.style.display = "none";
                        modal_content.innerHTML = '';
                    }
                }

        }

    }


});
