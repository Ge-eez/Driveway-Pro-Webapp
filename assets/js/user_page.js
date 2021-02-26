const parkBtn = document.querySelector('.parkButton');
const nearbylists = document.querySelector('.nearbylists');
const display = document.querySelector('.display');
const getdir = document.querySelector('.getdir');
const map = document.querySelector('#myMap');
const modal = document.getElementById("myModal");
const span = document.getElementsByClassName("close")[0];
const modal_content = document.querySelector(".content");
const page_wrapper = document.querySelector(".page-wrapper");


let DB;
let db;
let DBAccount;
// let DBTicket;
document.addEventListener('DOMContentLoaded', () => {
    // Open working databases
    let CompanyDB = indexedDB.open("companies", 2);
    CompanyDB.onsuccess = function () {
        console.log('Database Ready');
        DB = CompanyDB.result;
    };

    let UserDB = indexedDB.open("users", 2);
    UserDB.onsuccess = function () {
        console.log('Database Ready');
        db = UserDB.result;

    };

    // let ticketsDB = indexedDB.open("Tickets", 1);
    // ticketsDB.onsuccess = function () {
    //     console.log('Database Ready');
    //     DBTicket = ticketsDB.result;

    // };

    let accountDB = indexedDB.open("account", 2);
    accountDB.onsuccess = function () {
        console.log('Database Ready');
        DBAccount = accountDB.result;

    };

    // Check for user login before user accessing page
    if (!localStorage.getItem("user")) {
        console.log(`Login`);
        let arrayOfBreaks = [];
        for (let index = 0; index < 2; index++) {
            const br = document.createElement('p');
            br.className = 'detailsBreak';
            br.innerHTML = '<br>';
            br.style.maxHeight = '0.5rem';
            arrayOfBreaks.push(br);                    
        }

        // Display a modal with message for user to login and direct to user login page
        const info = document.createElement('a');
        info.className = 'details';
        info.innerHTML = '<p>You must first login to access this page :) Thank you</p>';

        const infoBtn = document.createElement('div');
        infoBtn.className = 'buttonContainer';
        infoBtn.innerHTML = '<a class="parkButton login100-form-btn button-load text-light" href="./user_login.html">Log in</a>';

        modal_content.appendChild(info);
        modal_content.appendChild(arrayOfBreaks[0]);
        modal_content.appendChild(infoBtn);
        modal_content.appendChild(arrayOfBreaks[1]);

        modal.style.display = "block";
        modal.style.position = "absolute";
        modal.style.zIndex = "1000";

        span.onclick = function() {
            modal.style.display = "none";
            modal_content.innerHTML = '';
            window.history.back();
        }

        infoBtn.onclick = function() {
            modal.style.display = "none";
            modal_content.innerHTML = '';
            window.history.back();
        }
    }

    // Nearby parking places functionality
    parkBtn.addEventListener("click", park);
    function park(e) {
        // Work on users database to track basic user's information
        let objectStoreUser = db.transaction("users").objectStore("users");
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

            let objectStore = DB.transaction("companies").objectStore("companies");
            
            objectStore.openCursor().onsuccess = function(e) {  
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

                    // Latitude/longitude spherical formula where R is earth’s radius (mean radius = 6,371km);
                    // note that angles need to be in radians to pass to trig functions
                    let lat = position.coords.latitude;
                    let lng = position.coords.longitude;

                    let R = 6371; // km
                    let dLat = (cursor.value.latitude - lat)* Math.PI / 180;
                    let dLon = (cursor.value.longitude - lng)* Math.PI / 180;
                    let lat1 = position.coords.latitude* Math.PI / 180;
                    let lat2 = cursor.value.latitude * Math.PI / 180;

                    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
                    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                    let distance = R * c;

                    // Display companies to users only within their working hours
                    let hoursNow = new Date();
                    let hourNow = hoursNow.getHours();

                    let closingHour = cursor.value.closes_at.includes('PM') || cursor.value.closes_at.includes('pm') || cursor.value.closes_at.includes('Pm') || cursor.value.closes_at.includes('pM') ? cursor.value.closes_at.match(/\d+/g).map(Number)[0] + 12 : cursor.value.closes_at.match(/\d+/g).map(Number)[0];

                    let openingHour = cursor.value.opens_at.includes('AM') || cursor.value.opens_at.includes('am') || cursor.value.opens_at.includes('Am') || cursor.value.opens_at.includes('aM') ? cursor.value.opens_at.match(/\d+/g).map(Number)[0] : cursor.value.opens_at.match(/\d+/g).map(Number)[0];

                    // Display nearby parking places within a distance of 5kms, avaiable parking spots and working hours
                    if (distance <= 5 && (cursor.value.active_slots > 0) && ((closingHour - hourNow) >= 1) && ((hourNow - openingHour) >= 0)) {
                        // Keep track of the number of displayed companies
                        let count = 0;
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
                                let today = new Date();
                                let h = today.getHours();
                                let m = today.getMinutes();
                                let s = today.getSeconds();
                                let startHour = h;
                                let startMin = m;
                                let startSec = s;
                                //get the AM / PM value 
                                let am_pm = h > 12 ? 'PM' : 'AM';
                                // Convert the hour to 12 format 
                                h = h % 12 || 12;
                                let start = `${h} : ${m} : ${s} ${am_pm }`;

                                // Assign starting time to the UI
                                timerStart.innerHTML = `Start time: ${start}`;                                
                                
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

                                // Keep track of current time to notify user on the company's closing hour
                                let timeCurrent = new Date();
                                let hourCurrent = timeCurrent.getHours();
                                hourCurrent = hourCurrent % 12 || 12;

                                let current = `${hourCurrent}:${timeCurrent.getMinutes()}:${timeCurrent.getSeconds()}`.match(/\d+/g).map(Number);
                                let closesAt = companyClosesAt.match(/\d+/g).map(Number);
                                let closes = 0;

                                if (closesAt.length === 1) {
                                    closes = Number(`${closesAt[0]}.${0}.${0}`);
                                } else if (closesAt.length === 2) {
                                    closes = Number(`${closesAt[0]}.${closesAt[1]}.${0}`);
                                } else {
                                    closes = Number(`${closesAt[0]}.${closesAt[1]}.${closesAt[2]}`);
                                }
                                let currently = Number(`${current[0]}.${current[1]}.${current[2]}`);

                                // If there is 30 minutes or less time for company's clsoing hour notify user
                                if (closes - currently <= 0.30) {
                                    let arrayOfBreaks = [];
                                    for (let index = 0; index < 2; index++) {
                                        const br = document.createElement('p');
                                        br.className = 'detailsBreak';
                                        br.innerHTML = '<br>';
                                        br.style.maxHeight = '0.5rem';
                                        arrayOfBreaks.push(br);                    
                                    }
                                    // Display a modal to notify user, to move their vehicle within 30 minutes
                                    const notify = document.createElement('a');
                                    notify.className = 'details';
                                    notify.innerHTML = `<p>You have less than 30 minutes to move your vehicle. Please respect the company's working hour. Thank you</p>`;

                                    const notifyBtn = document.createElement('div');
                                    notifyBtn.className = 'buttonContainer';
                                    notifyBtn.innerHTML = '<a class="parkButton login100-form-btn button-load text-light">Close</a>';

                                    modal_content.appendChild(notify);
                                    modal_content.appendChild(arrayOfBreaks[0]);
                                    modal_content.appendChild(notifyBtn);
                                    modal_content.appendChild(arrayOfBreaks[1]);

                                    modal.style.display = "block";
                                    modal.style.position = "absolute";
                                    modal.style.zIndex = "1000";

                                    span.onclick = function() {
                                        modal.style.display = "none";
                                        modal_content.innerHTML = '';
                                    }

                                    notifyBtn.onclick = function() {
                                        modal.style.display = "none";
                                        modal_content.innerHTML = '';
                                    }

                                    window.onclick = function(event) {
                                        if (event.target == modal) {
                                            modal.style.display = "none";
                                            modal_content.innerHTML = '';
                                        }
                                    }
                                }

                                // Update compaines database to alter the active slots of the company
                                let transaction = DB.transaction(["companies"], "readwrite");
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

                                // let ticketsTransaction = DBTicket.transaction(["Tickets"], "readwrite");
                                // let ticketsUpdate = ticketsTransaction.objectStore("Tickets");
                                // let ticketAdd = ticketsUpdate.get(companyEmail);

                                // ticketAdd.onsuccess = function() {                                           
                                //     let ticketData = {
                                //         active: "true",
                                //         plate_Number: userPlate,
                                //         StartTime: start,
                                //         endTime: "--:--",
                                //         price: "$$.$$"
                                //     }                                    

                                //     let updateTickets = ticketsUpdate.add(ticketData);
                                //     updateTickets.onsuccess = function() {
                                //         console.log("done tickets added");
                                //     }
                                // }

                                // ticketAdd.onerror = function() {
                                //     console.log("An error occured");
                                // };

                                let arrayOfBreaks = [];
                                for (let index = 0; index < 5; index++) {
                                    const br = document.createElement('p');
                                    br.className = 'detailsBreak';
                                    br.innerHTML = '<br>';
                                    br.style.maxHeight = '0.5rem';
                                    arrayOfBreaks.push(br);                    
                                }

                                nearbylists.innerHTML = '';

                                nearbylists.appendChild(parkContent);

                                // Display basic information of the company, user and starting time of the vehicle parked 
                                parkContent.appendChild(document.createTextNode(companyName));
                                parkContent.appendChild(arrayOfBreaks[0]);   
                                parkContent.appendChild(document.createTextNode(`Your plate Number: ${userPlate}`));
                                parkContent.appendChild(arrayOfBreaks[1]);                                    
                                parkContent.appendChild(document.createTextNode(companyCharge));
                                parkContent.appendChild(arrayOfBreaks[2]);
                                parkContent.appendChild(document.createTextNode(companyClosesAt)); 
                                parkContent.appendChild(arrayOfBreaks[3]); 
                                parkContent.appendChild(timerStart);
                                parkContent.appendChild(arrayOfBreaks[4]);
                                parkContent.appendChild(exit);

                                // Done parking functionality
                                exit.addEventListener('click', userTicket) 
                                function userTicket(e) {
                                    if (e.target.parentElement.parentElement.parentElement.classList.contains('nearbylists')) { 
                                        const done = document.createElement('div');
                                        done.className = 'done buttonContainer';
                                        done.innerHTML = '<a class="parkButton singleButton login100-form-btn button-load text-light" href="./index.html">Exit</a>';
                                        
                                        // Keep track of the ended time
                                        var now = new Date();
                                        var hour = now.getHours();
                                        var min = now.getMinutes();
                                        var sec = now.getSeconds();

                                        // Calculate the price based on the time and company's charge per hour
                                        let x = companyCharge.match(/\d+/g).map(Number);
                                        let charge = Number(`${x[0]}.${x[1]}`);
                                        let price = ((hour-startHour)*charge) + ((min - startMin)*(charge/60)) + ((sec - startSec)*(charge/3600));
                                        hour = hour % 12 || 12;
                                        let end = `${hour} : ${min} : ${sec} ${am_pm }`;
                                        
                                        const endTime = document.createElement('div');
                                        endTime.className = 'endTime';
                                        endTime.innerHTML = `End time: ${end}`; 

                                        let arrayOfBreaks = [];
                                        for (let index = 0; index < 7; index++) {
                                            const br = document.createElement('p');
                                            br.className = 'detailsBreak';
                                            br.innerHTML = '<br>';
                                            br.style.maxHeight = '0.5rem';
                                            arrayOfBreaks.push(br);                    
                                        }

                                        nearbylists.innerHTML = '';

                                        nearbylists.appendChild(ticketContent);

                                        const infoDone = document.createElement('div');
                                        infoDone.className = 'done';
                                        infoDone.innerHTML = '<p>Please make sure to show this page to the parking officer before exiting :) Thank you for using our service</p>';

                                        timerStart.style.margin = "0";

                                        // Display basic information of company, user, ended time, price
                                        ticketContent.appendChild(infoDone);
                                        ticketContent.appendChild(arrayOfBreaks[0]);
                                        ticketContent.appendChild(document.createTextNode(companyName));
                                        ticketContent.appendChild(arrayOfBreaks[1]);
                                        ticketContent.appendChild(document.createTextNode(`Your plate Number: ${userPlate}`));
                                        ticketContent.appendChild(arrayOfBreaks[2]);                                    
                                        ticketContent.appendChild(document.createTextNode(`Your total price is ${price.toFixed(2)} Birr`));
                                        ticketContent.appendChild(arrayOfBreaks[3]);
                                        ticketContent.appendChild(timerStart);
                                        ticketContent.appendChild(arrayOfBreaks[4]);
                                        ticketContent.appendChild(endTime);
                                        ticketContent.appendChild(arrayOfBreaks[5]);
                                        ticketContent.appendChild(done);

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

                                        // Exit functionality
                                        done.onclick = function() {   
                                            ticketContent.innerHTML = '';  
                                            
                                            // Update company's database of active slots
                                            let transactionActive = DB.transaction(["companies"], "readwrite");
                                            let activeSlotsUpdate = transactionActive.objectStore("companies");
                                            let requestAdd = activeSlotsUpdate.get(companyEmail);

                                            // Add on the active slots of the company by one
                                            requestAdd.onsuccess = function() {
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

                                                let updateTable = activeSlotsUpdate.put(updateData);
                                                updateTable.onsuccess = function() {
                                                    console.log("done active slots updated");
                                                }
                                            }

                                            requestAdd.onerror = function() {
                                                console.log("An error occured");
                                            };

                                            // let transactionTicketsUpdate = ticketDB.transaction(["Tickets"], "readwrite");
                                            // let ticketsUpdated = transactionTicketsUpdate.objectStore("Tickets");
                                            // let ticketUpdate = ticketsUpdated.get(companyEmail);

                                            // ticketUpdate.onsuccess = function() {                                           
                                            //     let ticketDataUpdate = {
                                            //         active: "false",
                                            //         plate_Number: userPlate,
                                            //         StartTime: start,
                                            //         endTime: end,
                                            //         price: price.toFixed(2)
                                            //     }
                                                
                                            //     let updatedTickets = ticketsUpdated.put(ticketDataUpdate);
                                            //     console.log(updatedTickets);
                                            //     updatedTickets.onsuccess = function() {
                                            //         console.log("done ticket updated");
                                            //     }
                                            // }

                                            // ticketUpdate.onerror = function() {
                                            //     console.log("An error occured");
                                            // };

                                        }   

                                        activeSlotsCompany -= 1;

                                    }
                                }

                            }
                        }

                        // If there are no nearby places to display notify user
                        if (count === 0) {
                            let arrayOfBreaks = [];
                            for (let index = 0; index < 2; index++) {
                                const br = document.createElement('p');
                                br.className = 'detailsBreak';
                                br.innerHTML = '<br>';
                                br.style.maxHeight = '0.5rem';
                                arrayOfBreaks.push(br);                    
                            }
                            // Display a modal with content notifying user couldn't display nearby places currently
                            const info = document.createElement('a');
                            info.className = 'details';
                            info.innerHTML = '<p>There are no nearby parking places currently available :( <br> Sorry for the inconvenience.</p>';

                            const infoBtn = document.createElement('div');
                            infoBtn.className = 'buttonContainer';
                            infoBtn.innerHTML = '<a class="parkButton login100-form-btn button-load text-light">Ok</a>';

                            modal_content.appendChild(info);
                            modal_content.appendChild(arrayOfBreaks[0]);
                            modal_content.appendChild(infoBtn);
                            modal_content.appendChild(arrayOfBreaks[1]);

                            modal.style.display = "block";
                            modal.style.position = "absolute";
                            modal.style.zIndex = "1000";

                            span.onclick = function() {
                                modal.style.display = "none";
                                modal_content.innerHTML = '';
                            }

                            infoBtn.onclick = function() {
                                modal.style.display = "none";
                                modal_content.innerHTML = '';
                            }

                        }
                        
                    } 
                    cursor.continue();                     

                }   
            }            
        }
    }
    

    nearbylists.addEventListener('click', details);
    // more details functioanlity
    function details(e) {
        if (e.target.parentElement.classList.contains('details')) {
                let arrayOfBreaks = [];
                for (let index = 0; index < 4; index++) {
                    const br = document.createElement('p');
                    br.className = 'detailsBreak';
                    br.innerHTML = '<br>';
                    br.style.maxHeight = '0.5rem';
                    arrayOfBreaks.push(br);                    
                }  

                let dataName = (e.target.parentElement.parentElement.getAttribute('data-name'));
                let dataCharge = (e.target.parentElement.parentElement.getAttribute('data-charge'));
                let dataClosesAt = (e.target.parentElement.parentElement.getAttribute('data-closes_at'));
                let dataActiveSlots = (e.target.parentElement.parentElement.getAttribute('data-active_slots'));

                // Display a modal with current basic information of the company from the database
                modal_content.appendChild(document.createTextNode(dataName));
                modal_content.appendChild(arrayOfBreaks[0]);
                modal_content.appendChild(document.createTextNode(dataCharge));
                modal_content.appendChild(arrayOfBreaks[1]);
                modal_content.appendChild(document.createTextNode(dataClosesAt));
                modal_content.appendChild(arrayOfBreaks[2]);
                modal_content.appendChild(document.createTextNode(dataActiveSlots));
                modal_content.appendChild(arrayOfBreaks[3]);

                modal.style.display = "block";

                // Close the modal when x button is clicked
                span.onclick = function() {
                    modal.style.display = "none";
                    modal_content.innerHTML = '';
                }

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
