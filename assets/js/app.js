const parkBtn = document.querySelector('.parkButton');
const nearbylists = document.querySelector('.nearbylists');
const map = document.querySelector('#myMap');


let DB;
document.addEventListener('DOMContentLoaded', () => {
    let nearby = indexedDB.open('nearby', 1);
    nearby.onsuccess = function() {
        console.log(`Database is ready`);
        DB = nearby.result;

        console.log(DB);        
    }

    nearby.onerror = function() {
        console.log(`An error occured`);
    }
    
    // let companiesData = JSON.parse(company);
    // alert(companiesData[0].name);
    // alert(companiesData[0].email);
    // alert(companiesData[1].name);
    // alert(companiesData[1].email);

    const companydata = [
        { active: true, charge: 10, closes_at: 12, floor: 1, name: "Eliana", opens_at: 1, rank_per_floor: 4, slots_per_floor: 6, latitude: 9.07, longitude: 38.77 },
        { active: true, charge: 10, closes_at: 12, floor: 0, name: "Tk", opens_at: 1, rank_per_floor: 4, slots_per_floor: 6, latitude: 9.09, longitude: 38.79},
        { active: true, charge: 10, closes_at: 12, floor: 0, name: "Attris", opens_at: 1, rank_per_floor: 4, slots_per_floor: 6, latitude: 9.06, longitude: 38.77}
      ];

    //on upgrade or after version is changed
    nearby.onupgradeneeded = function(e) {
        console.log(`On upgrade`);
        let db = e.target.result;

        let objectStore = db.createObjectStore('nearby', {keyPath:'id', autoIncrement: true});

        objectStore.createIndex('active', 'active', {unique: false});
        objectStore.createIndex('closes_at', 'closes_at', {unique: false});
        objectStore.createIndex('floor', 'floor', {unique: false});
        objectStore.createIndex('name', 'name', {unique: false});
        objectStore.createIndex('opens_at', 'opens_at', {unique: false});
        objectStore.createIndex('rank_per_floor', 'rank_per_floor', {unique: false});
        objectStore.createIndex('slots_per_floor', 'slots_per_floor', {unique: false});


        objectStore.transaction.oncomplete = function(e) {
            // Store values in the newly created objectStore.
            var objectStore = db.transaction("nearby", "readwrite").objectStore("nearby");
            companydata.forEach(function(company) {
              objectStore.add(company);
            });
          };
        console.log(`Its ready`);

    }

    parkBtn.addEventListener("click", park);
    function park(e) {
        console.log('Nearby parking places displayed successfully');
        // Latitude/longitude spherical geodesy formulae & scripts (c) Chris Veness 2002-2011                   - www.movable-type.co.uk/scripts/latlong.html 
        // where R is earth’s radius (mean radius = 6,371km);
        // note that angles need to be in radians to pass to trig functions!
        navigator.geolocation.getCurrentPosition(locationHandler);

        function locationHandler(position){
            while(nearbylists.firstChild) { nearbylists.removeChild(nearbylists.firstChild) }

            let objectStore = DB.transaction("nearby").objectStore("nearby");

            objectStore.openCursor().onsuccess = function(e) {
                let cursor = e.target.result;
                
                if (cursor) {
                    const li = document.createElement('li');
                    li.className = 'nearby_collections';

                    let lat = position.coords.latitude;
                    let lng = position.coords.longitude;
                    console.log(cursor.value.latitude);
                    let R = 6371; // km
                    let dLat = (cursor.value.latitude - lat).toRad();
                    let dLon = (cursor.value.longitude - lng).toRad();
                    let lat1 = position.coords.latitude.toRad();
                    let lat2 = 9.07.toRad();

                    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
                    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                    let distance = R * c;
                    console.log(distance);

                    // Identify nearby parking place within a distance of 5 km
                    if (distance <= 5 && (cursor.value.active === true)) {
                        nearbylists.appendChild(li);   

                        // li.style.display ='block';
                        nearbylists.backgroundColor = '#E76900';
                        li.style.textAlign = 'center';
                        // li.style.backgroundColor = '#E76900';
                        li.style.listStyle = 'none';
                        li.style.fontSize = '3rem';
            
                        // Create text node and append it
                        li.appendChild(document.createTextNode(cursor.value.name));
                        

                    }
                    cursor.continue();                   
                    
            
                }
        // console.log(document.getElementsByClassName('.nearbylists').style.color);
        
        // document.getElementsByClassName('.nearby_collections').style.display ='block';
        // document.getElementsByClassName('.nearby_collections').style.size ='80px';
        // map.style.display = 'none';
        // console.log(document.querySelectorAll('.nearbylists').style.color);      

            
            

                
            }
        }
    
    }


});
