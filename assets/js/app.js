const parkBtn = document.querySelector('.parkButton');
const nearbylists = document.querySelector('.nearbylists');
const display = document.querySelector('.display');
const getdir = document.querySelector('.getdir');
const map = document.querySelector('#myMap');
const modal = document.getElementById("myModal");
const span = document.getElementsByClassName("close")[0];
const modal_content = document.querySelector(".content");


let DB;
document.addEventListener('DOMContentLoaded', () => {
    let CompanyDB = indexedDB.open("companies", 1);
    CompanyDB.onsuccess = function () {
        console.log('Database Ready');
        DB = CompanyDB.result;
    };

    parkBtn.addEventListener("click", park);
    function park(e) {
        console.log('Nearby parking places displayed successfully');
        // Latitude/longitude spherical geodesy formulae & scripts (c) Chris Veness 2002-2011                   - www.movable-type.co.uk/scripts/latlong.html 
        // where R is earth’s radius (mean radius = 6,371km);
        // note that angles need to be in radians to pass to trig functions!
        navigator.geolocation.getCurrentPosition(locationHandler);
        // DB.transaction("users").objectStore("users").get(localStorage.getItem("user")).onsuccess = function(event) {
        //     console.log(event.target.result.name);
        // }

        function locationHandler(position){
            while(nearbylists.firstChild) { nearbylists.removeChild(nearbylists.firstChild) }

            let objectStore = DB.transaction("companies").objectStore("companies");
            
            objectStore.openCursor().onsuccess = function(e) {
                let cursor = e.target.result;
                
                if (cursor) {
                    const li = document.createElement('li');
                    li.className = 'nearby_collections';

                    const link = document.createElement('a');
                    link.className = 'details';
                    link.innerHTML = '<p>more details</p>';

                    let lat = position.coords.latitude;
                    let lng = position.coords.longitude;
                    console.log(cursor.value.latitude);
                    let R = 6371; // km
                    let dLat = (cursor.value.latitude - lat).toRad();
                    let dLon = (cursor.value.longitude - lng).toRad();
                    let lat1 = position.coords.latitude.toRad();
                    let lat2 = cursor.value.latitude.toRad();

                    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
                    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                    let distance = R * c;
                    console.log(distance);

                    // Identify nearby parking place within a distance of 5 km
                    if (distance <= 5 && (cursor.value.active_slots > 0)) {
                        // Create text node and append it
                        li.setAttribute('data-id', cursor.value.email);
                        li.appendChild(document.createTextNode(cursor.value.name));
                        li.appendChild(document.createTextNode(cursor.value.email));

                        nearbylists.appendChild(li);   
                        li.appendChild(link);

                        nearbylists.style.height = '100vh';
                        nearbylists.style.padding = '0';                        

                        map.style.display = 'none';
                        parkBtn.style.display = 'none';
                        getdir.style.padding = '0';            
                       
                        console.log(cursor.value.name);

                    }
                    cursor.continue();                  
                    
            
                }
                
            }
        }
    
    }

    nearbylists.addEventListener('click', details);

    function details(e) {
        if (e.target.parentElement.classList.contains('details')) {
                // get the task id
                let taskID = (e.target.parentElement.parentElement.getAttribute('data-id'));
                
                modal_content.appendChild(document.createTextNode(taskID));

                // const detail = document.createElement('li');
                // detail.className = 'details_info';
                // detail.appendChild(document.createTextNode(taskID));
                // detail.appendChild(document.createTextNode(taskID));
                // modal_content.appendChild(detail);
                          
                modal_content.style.display = "block";
                modal.style.display = "block";
                // const closeBtn = document.createElement('a');
                // closeBtn.className = 'close';
                // closeBtn.innerHTML = '<span class="close">&times;</span>';               
                
                
                console.log(taskID);

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
