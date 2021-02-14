const parkingOfficer = document.querySelector(".officers-list");
const addBtn = document.getElementById("add-btn");
const cancelIcon = document.getElementById("cancel");
const form = document.getElementById("pop-up");
const keyEmail = localStorage.getItem('admin');
const email = "super@admin.com";
const formUpdate = document.getElementById("update-profile");

//form inputs
const companyInput = document.getElementById("company");
const emailInput = document.getElementById("inputEmail");
const latitudeInput = document.getElementById("latitude");
const longtiudeInput = document.getElementById("longtiude");
const chargeInput = document.getElementById("charge");
const slotsInput = document.getElementById("slots");
// 
const officerFName = document.getElementById("officer-fName");
const officerLName = document.getElementById("officer-lName");
const officerEmail = document.getElementById("officer-Email");
const officerPhone = document.getElementById("officer-phone");
const officerSex = document.getElementById("officer-sex");
//company profil data text
const companyText = document.getElementById("companyText");
const emailText = document.getElementById("emailText");
const locationText = document.getElementById("locationText");
const chargeText = document.getElementById("chargeText");
const slotsText = document.getElementById("slotsText");

let DB;
document.addEventListener("DOMContentLoaded",()=>{
    let userDB = indexedDB.open("users",2)
    userDB.onsuccess = function(){
        DB = userDB.result;
        displayProfile();
        display_companies();
    }    
    userDB.onupgradeneeded = function(e){
        
        let db = e.target.result;
        let objectStore = db.createObjectStore('parkingOfficer', { keyPath: 'companyEmail' });
        objectStore.createIndex('parkingOfficer', ['name','companyEamil'], { unique: true });
        console.log("created store");
    }

   
});


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
    document.getElementById(id).style.display = "block";
    e.currentTarget.className += " active";
}
// profile part
 
form.addEventListener('submit', add_parking_officer)
var i = 0;
function add_parking_officer(e){
    e.preventDefault(); 
    
    let poDB = DB.transaction(["parkingOfficer"],'readwrite')
    let objStore = poDB.objectStore('parkingOfficer');
    
    let poInputs = {
        name: officerFName.value + " " + officerLName.value,
        phoneNumber: officerPhone.value,
        sex: officerSex.value,
        companyEmail: officerEmail.value
    }

    let result = objStore.add(poInputs);
    result.onsuccess = ()=>{}
    result.onerror = (e)=>{console.log(e)}
    poDB.oncomplete = ()=>{
        console.log("new task added");
        parkingOfficer.innerHTML = "";
        display_companies();
    }

    form.style.display = "none";
    document.getElementById("add-btn").removeAttribute("disabled");
   
}
function display_companies(){
    let store = DB.transaction(['companies']).objectStore('companies');
    store.openCursor().onsuccess = function(e){
        let cursor = e.target.result;
        if(cursor){
            let listItem = `
            <ul class="list-inline row list-item">
                <li class="col-1 ml-0 pl-5 ">
                    <input class="input-group" type="checkbox" value="" id="selectAll" />
                </li>
                <li class="col-2">${cursor.value.name}</li>
                <li class="col-2 ">${cursor.value.email}</li>
                <li class="col-3">${cursor.value.companyEmail}</li>
                <li class="col-2">${cursor.value.sex}</li>
                <li class="col-2 ">
                    <i class="fa fa-remove mr-2"></i>  &nbsp;<a href="#"><i class="fa fa-edit"></i> </a>
                </li>
            </ul>`;
            parkingOfficer.innerHTML += listItem;
            cursor.continue();
        }
    }

}

function displayProfile(){
    let userStore = DB.transaction("users").objectStore("users");
    userStore.openCursor().onsuccess = function(e){
        let cursor = e.target.result;
        if(cursor){       
            if( cursor.value.email == keyEmail.slice(1,keyEmail.length-1)){
               
                companyText.appendChild(document.createTextNode(cursor.value.name));
                emailText.appendChild(document.createTextNode(cursor.value.email));
                return;
            }
            
            cursor.continue();
        }
       
    }
}

formUpdate.addEventListener('submit',updateProfile);

function updateProfile(){
    let userStore = DB.transaction(["companies"],"readwrite").objectStore("companies");
    let request = userStore.get(keyEmail);
    

    request.onsuccess = function(){
        let updateData = {
            name: companyInput.value,
            email: keyEmail.slice(1,keyEmail.length-1),
            opens_at: 8,
            closes_at: 8,
            password: "We respect privacy",
            charge: chargeInput.value,
            slots: slotsInput.value,
            active_slots:"",
            latitude: latitudeInput.value,
            longitude: longtiudeInput.value
            
        }
        let updateTable = userStore.put(updateData);
        updateTable.onsuccess = function(){
            location.reload();
            console.log("done")
        }
    }
}


// parking officer part

addBtn.addEventListener('click',function(btn){
    
    form.style.display = "block";
    btn.currentTarget.disabled = "true"

});
cancelIcon.addEventListener('click',function(){
    form.style.display = "none";
    document.getElementById("add-btn").removeAttribute("disabled");
});



