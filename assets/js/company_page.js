const parkingOfficer = document.querySelector(".officers-list");
const addBtn = document.getElementById("add-btn");
const cancelIcon = document.getElementById("cancel");
const form = document.getElementById("pop-up");
const keyEmail = localStorage.getItem('company');
const email = "contact@tk.com";
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
const officerPassword = document.getElementById("officer-pass");
const officerPhone = document.getElementById("officer-phone");

const officerRole = document.getElementById("role");
//company profil data text
const companyText = document.getElementById("companyText");
const emailText = document.getElementById("emailText");
const locationText = document.getElementById("locationText");
const chargeText = document.getElementById("chargeText");
const slotsText = document.getElementById("slotsText");

const userInput = document.querySelectorAll('.validate-user-form .form-group .form-control');


let DBCompany;
let DBUser;
let DBforAccount;
document.addEventListener("DOMContentLoaded", () => {
    navigator.geolocation.getCurrentPosition(function(position) {
        latitudeInput.value = position.coords.latitude;
        longtiudeInput.value = position.coords.longitude;
      });
    
      userDB().then(function(result){
        DBUser = result
        display_parking_officer()
    })
    companyDB().then(function(result){
        DBCompany = result
        displayProfile()
    })
    accountDB().then(function(result){
        DBforAccount = result;
        display_account();
    })
});


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
    e.currentTarget.className += " active";
    if (id === "profile") {
        document.getElementById(id).style.display = "flex";
        return;
    }
    document.getElementById(id).style.display = "block";

}
// parking officer

form.addEventListener('submit', function (e) {
    e.preventDefault();
    let check = true;

    for (var i = 0; i < userInput.length; i++) {
        if (validate(userInput[i]) == false) {
            showValidate(userInput[i]);
            check = false;
        }
    }
    if (check) {
        add_parking_officer(e)
    }
    else console.log("Edit your input")
});
function add_parking_officer(e) {
    e.preventDefault();

    let poDB = DBUser.transaction(["users"], 'readwrite')
    let objStore = poDB.objectStore('users');
    let encrypted = CryptoJS.AES.encrypt(officerPassword.value, "Secret").toString();
    let poInputs = {
        company: keyEmail.slice(1, keyEmail.length - 1),
        email: officerEmail.value,
        name: officerFName.value + " " + officerLName.value,
        password: encrypted,
        phone_no: officerPhone.value,
        plate_number: "",
        role: "parking_officer"
    }

    let result = objStore.add(poInputs);
    result.onsuccess = () => {}
    result.onerror = (e) => { alert("This user already exist.") }
    poDB.oncomplete = () => {
        console.log("new task added");

        parkingOfficer.innerHTML = "";
        display_parking_officer();
    }

    form.style.display = "none";
    document.getElementById("add-btn").removeAttribute("disabled");

}

function display_parking_officer() {
    let store = DBUser.transaction(['users']).objectStore('users');

    store.openCursor().onsuccess = function(e) {
        let cursor = e.target.result;
        if (cursor) {
            if (cursor.value.company === keyEmail.slice(1, keyEmail.length - 1) && cursor.value.role === "parking_officer") {
                let listItem = `
                        <ul class="list-inline row list-item mt-0 " myAtr =${cursor.value.email}>
                            <li class="col-2 col-md-1 pl-lg-5 ">
                                <input class="input-group" type="checkbox" onclick="onSelect(event)" value="" name="list" />
                            </li>
                            <li class="col-2 ">${cursor.value.name}</li>
                            <li class="col-2 ">${cursor.value.phone_no}</li>
                            <li  class="col-2 col-md-3 ">${cursor.value.email}</li>
                            <li class="col-2 ">${cursor.value.role}</li>
                            <li class="col-2 delete-item">
                                <i class="fa fa-remove mr-0"></i>  &nbsp;<a href="edit_PO.html?email=${cursor.value.email}&company=${cursor.value.company}"><i class="fa fa-edit"></i> </a>
                            </li>
                        </ul>`;

                parkingOfficer.innerHTML += listItem;

            }
            cursor.continue();

        }
    }

}

// profile part
function displayProfile() {
    let companyStore = DBCompany.transaction(["companies"]).objectStore("companies");
    companyStore.openCursor().onsuccess = function(e) {
        let cursor = e.target.result;
        if (cursor) {
            if (cursor.value.email == keyEmail.slice(1, keyEmail.length - 1)) {

                companyText.appendChild(document.createTextNode(cursor.value.name));
                companyInput.value = cursor.value.name
                emailText.appendChild(document.createTextNode(cursor.value.email));
                locationText.appendChild(document.createTextNode(cursor.value.latitude + ", " + cursor.value.longitude));
                chargeText.appendChild(document.createTextNode(cursor.value.charge + " Birr"));
                chargeInput.value = cursor.value.charge
                slotsText.appendChild(document.createTextNode(cursor.value.slots));
                slotsInput.value = cursor.value.slots
                return;
            }

            cursor.continue();
        }

    }
}


formUpdate.addEventListener('submit', updateProfile);

function updateProfile() {
    let companyStore = DBCompany.transaction(["companies"], "readwrite").objectStore("companies");
    let request = companyStore.get(keyEmail);

    
     
    request.onsuccess = function() {
        let updateData = {
            name: companyInput.value,
            email: keyEmail.slice(1, keyEmail.length - 1),
            opens_at: 8,
            closes_at: 8,
            password: "We respect privacy",
            charge: chargeInput.value,
            slots: slotsInput.value,
            active_slots: "",
            latitude: latitudeInput.value,
            longitude: longtiudeInput.value

        }
        let updateTable = companyStore.put(updateData);
        updateTable.onsuccess = function() {
            location.reload();
            console.log("done")
        }
    }
}

function display_account() {

    let store = DBforAccount.transaction(['account'], 'readwrite').objectStore('account');
    store.openCursor().onsuccess = function(e) {
        let cursor = e.target.result;
        if (cursor) {
            if(cursor.value.user_email === keyEmail.slice(1, keyEmail.length - 1)){
                let listItem = `
                <ul  class="list-inline row list-item mt-0 " myAtr =${cursor.value.date}>
                    
                    <li class="col-3">${cursor.value.user_email}</li>
                    <li class="col-3">${cursor.value.company_email}</li>
                    <li class="col-3">${cursor.value.amount} Birr</li>
                    <li class="col-3">${cursor.value.date} </li>
                </ul>`;
                    accountList.innerHTML += listItem;
            }
            
            
            cursor.continue();
        }
    }

}
//parking officer create form
addBtn.addEventListener('click', function(btn) {

    form.style.display = "block";
    btn.currentTarget.disabled = "true"

});
cancelIcon.addEventListener('click', function() {
    form.style.display = "none";
    document.getElementById("add-btn").removeAttribute("disabled");
});

//checkbox
const selectAllBox = document.getElementById("select-all");

selectAllBox.onclick = function() {

    let checkboxes = document.getElementsByName('list')
    if (selectAllBox.checked) {
        for (let index = 0; index < checkboxes.length; index++) {

            checkboxes[index].checked = true;
            checkboxes[index].parentElement.parentElement.style.background = "#0a1d57";
            checkboxes[index].parentElement.parentElement.style.color ="#fff";
        }
    } else {
        for (let index = 0; index < checkboxes.length; index++) {
            checkboxes[index].checked = false;
            checkboxes[index].parentElement.parentElement.style.background = "";
            checkboxes[index].parentElement.parentElement.style.color ="#000";
        }
    }

}

function onSelect(event) {
    if (event.target.checked) {
        event.target.parentElement.parentElement.style.background = "#0a1d57"
        event.target.parentElement.parentElement.style.color ="#fff";
    } else {
        event.target.parentElement.parentElement.style.background = ""
        event.target.parentElement.parentElement.style.color ="#000";
    }

}

//action on the officers list

// remove
parkingOfficer.addEventListener('click', removeList);

function removeList(e) {
    if (e.target.parentElement.classList.contains('delete-item')) {
        if (confirm('Are You Sure about that ?')) {

            let taskID = e.target.parentElement.parentElement.getAttribute('myAtr');
            // use a transaction
            let transaction = DBUser.transaction(['users'], 'readwrite');
            let objectStore = transaction.objectStore('users');
            objectStore.delete(taskID);

            transaction.oncomplete = () => {
                e.target.parentElement.parentElement.remove();
            }

        }
    }
}