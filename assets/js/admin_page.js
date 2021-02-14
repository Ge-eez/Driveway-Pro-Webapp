const companyList = document.querySelector(".company-list");
const addBtn = document.getElementById("add-btn");
const cancelIcon = document.getElementById("cancel");
const form = document.getElementById("pop-up");
const keyEmail = localStorage.getItem('admin');
const email = "super@admin.com";
const formUpdate = document.getElementById("update-profile");

//form inputs
const companyPassword = document.getElementById("password");
const latitudeInput = document.getElementById("latitude");
const longtiudeInput = document.getElementById("longtiude");
const chargeInput = document.getElementById("charge");
const slotsInput = document.getElementById("slots");
// 
const companyName = document.getElementById("company-name");
const companyEmail = document.getElementById("company-email");

//company profil data text
const companyText = document.getElementById("companyText");
const emailText = document.getElementById("emailText");

let DBforUser;
let DBforCompany;
document.addEventListener("DOMContentLoaded",()=>{
    let userDB = indexedDB.open("users",2)
    userDB.onsuccess = function(){
        DBforUser = userDB.result;
        displayProfile();
    }    
    userDB.onupgradeneeded = function(e){
        
        console.log("created store");
    }
    let companyDB = indexedDB.open("companies",2)
    companyDB.onsuccess = function(){
        DBforCompany = companyDB.result;
        display_companies();
    }    
    companyDB.onupgradeneeded = function(e){
        
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
 
form.addEventListener('submit', add_company)
var i = 0;
function add_company(e){
    e.preventDefault(); 
    
    let poDB = DBforCompany.transaction(["companies"],'readwrite')
    let objStore = poDB.objectStore('companies');
    
    let poInputs = {
        name: companyName.value,
        email: companyEmail.value,
        password: companyPassword.value,
        charge: chargeInput.value,
        slots: slotsInput.value,
        active_slots: slotsInput.value,
        opens_at: "8AM",
        closes_at: "8PM",
        latitude: latitudeInput.value,
        longitude: longtiudeInput.value
    }

    let result = objStore.add(poInputs);
    result.onsuccess = ()=>{
        console.log("company added successfully")
    }
    result.onerror = (e)=>{console.log(e)}
    poDB.oncomplete = ()=>{
        console.log("new company added");
        companyList.innerHTML = "";
        display_companies();
    }

    form.style.display = "none";
    document.getElementById("add-btn").removeAttribute("disabled");
   
}
function display_companies(){
    
    let store = DBforCompany.transaction(['companies'], 'readwrite').objectStore('companies');
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
                <li class="col-3">${cursor.value.charge}</li>
                <li class="col-2">${cursor.value.latitude}, ${cursor.value.longitude}</li>
                <li class="col-2 ">
                    <i class="fa fa-remove mr-2"></i>  &nbsp;<a href="#"><i class="fa fa-edit"></i> </a>
                </li>
            </ul>`;
            companyList.innerHTML += listItem;
            cursor.continue();
        }
    }

}

function displayProfile(){
    let userStore = DBforUser.transaction("users").objectStore("users");
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
    let userStore = DBforUser.transaction(["users"],"readwrite").objectStore("users");
    let request = userStore.get(keyEmail);
    

    request.onsuccess = function(){
        let updateData = {
            name: companyInput.value,
            email: keyEmail.slice(1,keyEmail.length-1),
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



