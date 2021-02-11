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
        // displayTaskList();
        
    }

    nearby.onerror = function() {
        console.log(`An error occured`);
    }
    

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
        console.log('Hello there');
        
        // parkBtn.style.display = 'none';
        // return new Promise(() => {
        // var transaction = db.transaction(["nearby"]);
        // var objectStore = transaction.objectStore("nearby");
        // var request = objectStore.get( () => {
        //     if(cursor) {
        //         // Latitude/longitude spherical geodesy formulae & scripts (c) Chris Veness 2002-2011                   - www.movable-type.co.uk/scripts/latlong.html 
        //         // where R is earth’s radius (mean radius = 6,371km);
        //         // note that angles need to be in radians to pass to trig functions!
        //         var R = 6371; // km
        //         var dLat = (cursor.value.latitude - position.coords.latitude).toRad();
        //         var dLon = (cursor.value.longitude - position.coords.longitude).toRad();
        //         var lat1 = position.coords.latitude.toRad();
        //         var lat2 = 9.07.toRad();

        //         var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        //                 Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
        //         var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        //         var d = R * c;

        //         if (d <= 3) {
        //             return cursor.value.name

        //         }

        //     }
            
        // }             
        // );
        // request.onerror = function(e) {
        // // Handle errors!
        // };
        // while(nearbylists.firstChild) { nearbylists.removeChild(nearbylists.firstChild) }

        // let objectStore = db.transaction("nearby").objectStore("nearby");
        // request.onsuccess = function(e) {
        //     // Do something with the request.result!
        //     let cursor = e.target.result;
            
        //     if (cursor) {
        //         const li = document.createElement('li');
        //         li.className = 'nearby_place';
        //         // li.appendChild(document.createTextNode(taskInput.value)); 
                    
                
        //         nearbylists.appendChild(li);      
            
        //         li.setAttribute('data-task-id', cursor.value.id);
        //         // Create text node and append it
        //         li.appendChild(document.createTextNode(cursor.value.name));

        //         cursor.continue();
        //     }
        
        //     console.log("Name for SSN 444-44-4444 is " + request.result.name);
        // };
        // });       

    
        // li.appendChild(document.createTextNode(taskInput.value)); 

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

                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    console.log(cursor.value.latitude);
                    var R = 6371; // km
                    var dLat = (cursor.value.latitude - lat).toRad();
                    var dLon = (cursor.value.longitude - lng).toRad();
                    var lat1 = position.coords.latitude.toRad();
                    var lat2 = 9.07.toRad();

                    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                    var d = R * c;
                    console.log(d);

                    if (d <= 3 && (cursor.value.active === true)) {
                        nearbylists.appendChild(li);   

                        // li.style.display ='block';
                        nearbylists.backgroundColor = '#E76900';
                        li.style.textAlign = 'center';
                        // li.style.backgroundColor = '#E76900';
                        li.style.listStyle = 'none';
                        li.style.fontSize = '3rem';

                
                        // li.setAttribute('data-task-id', cursor.value.id);
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
