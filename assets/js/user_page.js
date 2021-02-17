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
document.addEventListener('DOMContentLoaded', () => {
    let CompanyDB = indexedDB.open("companies", 1);
    CompanyDB.onsuccess = function () {
        console.log('Database Ready');
        DB = CompanyDB.result;
    };

    let UserDB = indexedDB.open("users", 1);
    UserDB.onsuccess = function () {
        console.log('Database Ready');
        db = UserDB.result;

    };

    if (!localStorage.getItem("user")) {
        console.log(`Login`);
        let arrayOfBreaks = [];
        for (let index = 0; index < 2; index++) {
            const br = document.createElement('p');
            br.className = 'detailsBreak';
            br.innerHTML = '<br>';
            arrayOfBreaks.push(br);                    
        }

        const info = document.createElement('a');
        info.className = 'details';
        info.innerHTML = '<p>You must first login to access this page :) Thank you</p>';

        const infoBtn = document.createElement('div');
        infoBtn.className = 'parkHereContainer';
        infoBtn.innerHTML = '<a class="parkHere">Log in</a>';

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

    parkBtn.addEventListener("click", park);
    function park(e) {
        let objectStoreUser = db.transaction("users").objectStore("users");
        let userPlate = 0; 
        objectStoreUser.get(localStorage.getItem("user")).onsuccess = function() { }
        objectStoreUser.openCursor().onsuccess = function(e) {
            let cursor = e.target.result;

            userPlate = cursor.value.plate_number;
        }
        // Latitude/longitude spherical geodesy formulae & scripts (c) Chris Veness 2002-2011                   - www.movable-type.co.uk/scripts/latlong.html 
        // where R is earth’s radius (mean radius = 6,371km);
        // note that angles need to be in radians to pass to trig functions!
        navigator.geolocation.getCurrentPosition(locationHandler);
        
        function locationHandler(position){
            while(nearbylists.firstChild) { nearbylists.removeChild(nearbylists.firstChild) }

            let objectStore = DB.transaction("companies").objectStore("companies");
            
            objectStore.openCursor().onsuccess = function(e) {
                let cursor = e.target.result;
                
                if (cursor) {
                    const written_content = document.createElement('div');
                    written_content.className = 'written_content';

                    const timerDemo = document.createElement('p');
                    timerDemo.className = 'timer_demo';

                    const li = document.createElement('li');
                    li.className = 'nearby_collections';

                    const link = document.createElement('a');
                    link.className = 'details';
                    link.innerHTML = '<a style="color: #7CB9E8">more details</a>';

                    const parkHere = document.createElement('div');
                    parkHere.className = 'parkHereContainer';
                    parkHere.innerHTML = '<a class="parkHere">Park Here</a>';


                    const parkContent = document.createElement('div');
                    parkContent.className = 'park_content';

                    const ticketContent = document.createElement('div');
                    ticketContent.className = 'ticket_content';

                    const closingContent = document.createElement('div');
                    closingContent.className = 'closing_content';
                    
                    let lat = position.coords.latitude;
                    let lng = position.coords.longitude;

                    let R = 6371; // km
                    let dLat = (cursor.value.latitude - lat).toRad();
                    let dLon = (cursor.value.longitude - lng).toRad();
                    let lat1 = position.coords.latitude.toRad();
                    let lat2 = cursor.value.latitude.toRad();

                    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
                    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                    let distance = R * c;

                    let hoursNow = new Date();
                    let hourNow = hoursNow.getHours();

                    let closingHour = cursor.value.closes_at.includes('PM') || cursor.value.closes_at.includes('pm') || cursor.value.closes_at.includes('Pm') || cursor.value.closes_at.includes('pM') ? cursor.value.closes_at.match(/\d+/g).map(Number)[0] + 12 : cursor.value.closes_at.match(/\d+/g).map(Number)[0];

                    // Identify nearby parking place within a distance of 5 km
                    if (distance <= 5 && (cursor.value.active_slots > 0) && ((closingHour - hourNow) >= 1)) {
                        // Create text node and append it
                        li.setAttribute('data-email', cursor.value.email);
                        li.setAttribute('data-name', `Company: ${cursor.value.name}`);
                        li.setAttribute('data-closes_at', `Parking place closes at: ${cursor.value.closes_at}`);
                        li.setAttribute('data-charge', `Charges per hour: ${cursor.value.charge} Birr`);
                        li.setAttribute('data-active_slots', `Current parking slots available: ${cursor.value.active_slots}`);
                        li.appendChild(document.createTextNode(cursor.value.name));
                        li.appendChild(document.createTextNode(cursor.value.email));

                        written_content.appendChild(li);       
                        li.appendChild(link);
                        nearbylists.appendChild(written_content);   
                        written_content.appendChild(parkHere);

                        nearbylists.style.height = '100vh';
                        nearbylists.style.padding = '0'; 

                        map.style.display = 'none';
                        parkBtn.style.display = 'none';
                        getdir.style.padding = '0';            

                        parkHere.addEventListener('click', parkHereTimer); 
                        function parkHereTimer(e) {                      
                            if (e.target.parentElement.parentElement.firstChild.classList.contains('nearby_collections')) {                         
                                const exit = document.createElement('div');
                                exit.className = 'exit';
                                exit.innerHTML = '<a class="parkHere" style="font-size: 1.2rem">Done Parking</a>';   

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

                                // Assign to the UI [p]
                                timerDemo.innerHTML = `Start time: ${h} : ${m} : ${s} ${am_pm }`;                                
                                
                                let companyEmail = (e.target.parentElement.parentElement.firstChild.getAttribute('data-email'));
                                let companyName = (e.target.parentElement.parentElement.firstChild.getAttribute('data-name'));
                                let companyClosesAt = (e.target.parentElement.parentElement.firstChild.getAttribute('data-closes_at'));
                                let companyCharge = (e.target.parentElement.parentElement.firstChild.getAttribute('data-charge'));
                                let companyActiveSlots = (e.target.parentElement.parentElement.firstChild.getAttribute('data-active_slots'));
                                // console.log(companyActiveSlots);
                                let current = `8:30:04`.match(/\d+/g).map(Number);
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

                                if (closes - currently <= 0.30) {
                                    let arrayOfBreaks = [];
                                    for (let index = 0; index < 2; index++) {
                                        const br = document.createElement('p');
                                        br.className = 'detailsBreak';
                                        br.innerHTML = '<br>';
                                        arrayOfBreaks.push(br);                    
                                    }
                                    const notify = document.createElement('a');
                                    notify.className = 'details';
                                    notify.innerHTML = '<p>You have less than 30 minutes to unpark your vehicle please respect the companys closing hour</p>';

                                    const notifyBtn = document.createElement('div');
                                    notifyBtn.className = 'parkHereContainer';
                                    notifyBtn.innerHTML = '<a class="parkHere">Log in</a>';

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

                                var transaction = DB.transaction(["companies"], "readwrite");
                                var slotsChecker = transaction.objectStore("companies");
                                var req = slotsChecker.openCursor();
                                req.onerror = function(event) {
                                    console.log("An error occured");
                                };

                                req.onsuccess = function(event) {
                                    var cursor = event.target.result;
                                    if(cursor){
                                        if(cursor.value.email === companyEmail){//we find by id an user we want to update
                                            // var company = {};
                                            // company.active_slots -= 1;

                                            // var res = cursor.update(company);
                                            // res.onsuccess = function(e){
                                            //     console.log("update success!!");
                                            // }
                                            // res.onerror = function(e){
                                            //     console.log("update failed!!");
                                            // }
                                        }
                                        cursor.continue();
                                    }
                                }
                                // console.log(companyActiveSlots);

                                let arrayOfBreaks = [];
                                for (let index = 0; index < 5; index++) {
                                    const br = document.createElement('p');
                                    br.className = 'detailsBreak';
                                    br.innerHTML = '<br>';
                                    arrayOfBreaks.push(br);                    
                                }

                                nearbylists.innerHTML = '';

                                nearbylists.appendChild(parkContent);
                                parkContent.style.display = 'flex';
                                parkContent.style.flexDirection = 'column';
                                parkContent.style.textAlign = 'center';
                                parkContent.style.margin = '4rem';
                                parkContent.style.fontSize = '1.2rem';

                                parkContent.appendChild(document.createTextNode(companyName));
                                parkContent.appendChild(arrayOfBreaks[0]);
                                parkContent.appendChild(document.createTextNode(`Your plate Number: ${userPlate}`));
                                parkContent.appendChild(arrayOfBreaks[1]);                                    
                                parkContent.appendChild(document.createTextNode(companyCharge));
                                parkContent.appendChild(arrayOfBreaks[2]);
                                parkContent.appendChild(document.createTextNode(companyClosesAt)); 
                                parkContent.appendChild(arrayOfBreaks[3]); 
                                parkContent.appendChild(timerDemo);
                                parkContent.appendChild(arrayOfBreaks[4]);
                                parkContent.appendChild(exit);

                                exit.addEventListener('click', userTicket) 
                                function userTicket(e) {
                                    if (e.target.parentElement.parentElement.parentElement.classList.contains('nearbylists')) { 
                                        const done = document.createElement('div');
                                        done.className = 'done parkHereContainer';
                                        done.innerHTML = '<a class="parkHere" style="font-size: 1.2rem">Exit</a>';
                                        
                                        var now = new Date();
                                        var hour = now.getHours();
                                        var min = now.getMinutes();
                                        var sec = now.getSeconds();
                                        let x = companyCharge.match(/\d+/g).map(Number);
                                        let charge = Number(`${x[0]}.${x[1]}`);
                                        let price = ((hour-startHour)*charge) + ((min - startMin)*(charge/60)) + ((sec - startSec)*(charge/3600));
                                        
                                        const endTime = document.createElement('div');
                                        endTime.className = 'endTime';
                                        endTime.innerHTML = `End time: ${hour} : ${min} : ${sec} ${am_pm }`; 

                                        let arrayOfBreaks = [];
                                        for (let index = 0; index < 7; index++) {
                                            const br = document.createElement('p');
                                            br.className = 'detailsBreak';
                                            br.innerHTML = '<br>';
                                            arrayOfBreaks.push(br);                    
                                        }

                                        nearbylists.innerHTML = '';

                                        nearbylists.appendChild(ticketContent);
                                        ticketContent.style.display = 'flex';
                                        ticketContent.style.flexDirection = 'column';
                                        ticketContent.style.textAlign = 'center';
                                        ticketContent.style.margin = '4rem';
                                        ticketContent.style.fontSize = '1.2rem';

                                        const infoDone = document.createElement('div');
                                        infoDone.className = 'done';
                                        infoDone.innerHTML = '<p>Please make sure to show this page to the parking officer :) Thank you for using our service</p>';

                                        infoDone.style.fontSize = '1.5rem';

                                        ticketContent.appendChild(infoDone);
                                        ticketContent.appendChild(arrayOfBreaks[0]);
                                        ticketContent.appendChild(document.createTextNode(companyName));
                                        ticketContent.appendChild(arrayOfBreaks[1]);
                                        ticketContent.appendChild(document.createTextNode(`Your plate Number: ${userPlate}`));
                                        ticketContent.appendChild(arrayOfBreaks[2]);                                    
                                        ticketContent.appendChild(document.createTextNode(`Your total price is ${price.toFixed(2)} Birr`));
                                        ticketContent.appendChild(arrayOfBreaks[3]);
                                        ticketContent.appendChild(timerDemo);
                                        ticketContent.appendChild(arrayOfBreaks[4]);
                                        ticketContent.appendChild(endTime);
                                        ticketContent.appendChild(arrayOfBreaks[5]);
                                        ticketContent.appendChild(done);

                                        done.onclick = function() {   
                                            ticketContent.innerHTML = '';  

                                            const closingInfo = document.createElement('div');
                                            closingInfo.className = 'done';
                                            closingInfo.innerHTML = '<p>Drive Way Pro</p>';

                                            closingInfo.style.fontSize = '4rem';
                                            closingInfo.style.textAlign = 'center';
                                            closingInfo.style.margin = '1.5rem';
                                            
                                            nearbylists.appendChild(closingContent);
                                            closingContent.appendChild(closingInfo);

                                        }

                                    }
                                }

                            }
                        }

                    }
                    cursor.continue();                
                    
            
                }
                
            }
        }
    
    }

    nearbylists.addEventListener('click', details);

    function details(e) {
        if (e.target.parentElement.classList.contains('details')) {
                let arrayOfBreaks = [];
                for (let index = 0; index < 4; index++) {
                    const br = document.createElement('p');
                    br.className = 'detailsBreak';
                    br.innerHTML = '<br>';
                    arrayOfBreaks.push(br);                    
                }  

                let dataName = (e.target.parentElement.parentElement.getAttribute('data-name'));
                let dataCharge = (e.target.parentElement.parentElement.getAttribute('data-charge'));
                let dataClosesAt = (e.target.parentElement.parentElement.getAttribute('data-closes_at'));
                let dataActiveSlots = (e.target.parentElement.parentElement.getAttribute('data-active_slots'));

                modal_content.appendChild(document.createTextNode(dataName));
                modal_content.appendChild(arrayOfBreaks[0]);
                modal_content.appendChild(document.createTextNode(dataCharge));
                modal_content.appendChild(arrayOfBreaks[1]);
                modal_content.appendChild(document.createTextNode(dataClosesAt));
                modal_content.appendChild(arrayOfBreaks[2]);
                modal_content.appendChild(document.createTextNode(dataActiveSlots));
                modal_content.appendChild(arrayOfBreaks[3]);

                modal.style.display = "block";

                span.onclick = function() {
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

    }


});
