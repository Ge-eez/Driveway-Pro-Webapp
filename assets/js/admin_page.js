const companyList = document.querySelector(".company-list");
const userList = document.querySelector(".user-list");
const accountList = document.querySelector('.account-list')
const companyAddBtn = document.getElementById("company-add-btn");
const userAddBtn = document.getElementById("user-add-btn");
const companyCancelIcon = document.getElementById("company-cancel");
const userCancelIcon = document.getElementById("user-cancel");
const companyForm = document.getElementById("company-pop-up");
const userForm = document.getElementById("user-pop-up");
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

const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userPhone = document.getElementById('user-number');
const userPlate = document.getElementById('user-plate');
const userPassword = document.getElementById('user-password');
const userRole = document.getElementById('user-role');
const userCompany = document.getElementById('user-company');


//company profil data text
const companyText = document.getElementById("companyText");
const emailText = document.getElementById("emailText");

const adminName = document.getElementById('name')
const phoneNumber = document.getElementById('phone')

let DBforUser;
let DBforCompany;
let DBforAccount;
document.addEventListener("DOMContentLoaded", () => {
    userDB().then(function(result){
        DBforUser = result;
        displayProfile();
        display_users();
    })
    
    companyDB().then(function(result){
        DBforCompany = result;
        display_companies();
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
    if (id === "profile") {
        document.getElementById(id).style.display = "flex";
        return;
    }
    document.getElementById(id).style.display = "block";
    e.currentTarget.className += " active";
}
// profile part

companyForm.addEventListener('submit', add_company)
userForm.addEventListener('submit', add_user)
var i = 0;

function add_company(e) {
    e.preventDefault();

    let poDB = DBforCompany.transaction("companies", 'readwrite')
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
    result.onsuccess = () => {
        console.log("company added successfully")
    }
    result.onerror = (e) => { console.log(e) }
    poDB.oncomplete = () => {
        console.log("new company added");
        companyList.innerHTML = "";
        display_companies();
    }

    companyForm.style.display = "none";
    document.getElementById("add-btn").removeAttribute("disabled");

}

function add_user(e) {
    e.preventDefault();

    let poDB = DBforUser.transaction("users", 'readwrite')
    let objStore = poDB.objectStore('users');

    let poInputs = {
        name: userName.value,
        email: companyEmail.value,
        password: userPassword.value,
        company: userCompany.value,
        plate_number: userPlate.value,
        role: userRole.value,
        phone_no: userPhone.value
    }

    let result = objStore.add(poInputs);
    result.onsuccess = () => {
        console.log("user added successfully")
    }
    result.onerror = (e) => { console.log(e) }
    poDB.oncomplete = () => {
        console.log("new user added");
        companyList.innerHTML = "";
        display_companies();
    }

    companyForm.style.display = "none";
    document.getElementById("user-add-btn").removeAttribute("disabled");

}

function display_companies() {

    let store = DBforCompany.transaction(['companies'], 'readwrite').objectStore('companies');
    store.openCursor().onsuccess = function(e) {
        let cursor = e.target.result;
        if (cursor) {
            let listItem = `
            <ul  class="list-inline row list-item mt-0 " myAtr =${cursor.value.email}>
                <li class="col-1 ml-0 pl-5 ">
                <input class="input-group" type="checkbox" onclick="onSelect(event)" value="" name="Clist" />
                </li>
                <li class="col-2">${cursor.value.name}</li>
                <li class="col-2 ">${cursor.value.email}</li>
                <li class="col-3">${cursor.value.charge}</li>
                <li class="col-2">${cursor.value.latitude}, ${cursor.value.longitude}</li>
                <li class="col-2 delete-item">
                    <i class="fa fa-remove mr-2"></i>
                </li>
            </ul>`;
            companyList.innerHTML += listItem;
            cursor.continue();
        }
    }

}

function display_users() {

    let store = DBforUser.transaction(['users'], 'readwrite').objectStore('users');
    store.openCursor().onsuccess = function(e) {
        let cursor = e.target.result;
        if (cursor) {
            if (cursor.value.email != keyEmail.slice(1, keyEmail.length - 1)) {
                let listItem = `
            <ul  class="list-inline row list-item mt-0 " myAtr =${cursor.value.email}>
                <li class="col-1 ml-0 pl-5 ">
                <input class="input-group" type="checkbox" onclick="onSelect(event)" value="" name="Ulist" />
                </li>
                <li class="col-2">${cursor.value.name}</li>
                <li class="col-2 ">${cursor.value.email}</li>
                <li class="col-3">${cursor.value.phone_no}</li>
                <li class="col-2">${cursor.value.role}</li>
                <li class="col-2 delete-item">
                    <i class="fa fa-remove mr-2"></i>  
                </li>
            </ul>`;
                userList.innerHTML += listItem;
            }
            cursor.continue();
        }
    }

}

function displayProfile() {
    let userStore = DBforUser.transaction("users").objectStore("users");
    userStore.openCursor().onsuccess = function(e) {
        let cursor = e.target.result;
        if (cursor) {
            if (cursor.value.email == keyEmail.slice(1, keyEmail.length - 1)) {

                companyText.appendChild(document.createTextNode(cursor.value.name));
                adminName.value = cursor.value.name
                emailText.appendChild(document.createTextNode(cursor.value.email));
                phoneNumber.value = cursor.value.phone_no
                return;
            }

            cursor.continue();
        }

    }
}
function display_account() {

    let store = DBforAccount.transaction(['account'], 'readwrite').objectStore('account');
    store.openCursor().onsuccess = function(e) {
        let cursor = e.target.result;
        if (cursor) {
            let listItem = `
            <ul  class="list-inline row list-item mt-0 " myAtr =${cursor.value.date}>
                
                <li class="col-3">${cursor.value.user_email}</li>
                <li class="col-3">${cursor.value.company_email}</li>
                <li class="col-3">${cursor.value.amount} Birr</li>
                <li class="col-3">${cursor.value.date} </li>
            </ul>`;
                accountList.innerHTML += listItem;
            
            cursor.continue();
        }
    }

}
formUpdate.addEventListener('submit', updateProfile);

function updateProfile() {
    let transaction = DBforUser.transaction(['users'], 'readwrite');
    let objectStore = transaction.objectStore('users');
    let sliced = keyEmail.slice(1, keyEmail.length - 1)
    let request = objectStore.get(sliced);


    request.onsuccess = function() {
        let updateData = {
            company: "",
            password: request.result.password,
            plate_number: "",
            role: "admin",
            email: keyEmail.slice(1, keyEmail.length - 1),
            name: adminName.value,
            phone_no: phoneNumber.value,

        }
        let updateTable = objectStore.put(updateData);
        updateTable.onsuccess = function() {
            console.log("done")
        }
    }
}


// parking officer part

companyAddBtn.addEventListener('click', function(btn) {

    companyForm.style.display = "block";
    btn.currentTarget.disabled = "true"

});
companyCancelIcon.addEventListener('click', function() {
    companyForm.style.display = "none";
    document.getElementById("company-add-btn").removeAttribute("disabled");
});
userAddBtn.addEventListener('click', function(btn) {

    userForm.style.display = "block";
    btn.currentTarget.disabled = "true"

});
userCancelIcon.addEventListener('click', function() {
    userForm.style.display = "none";
    document.getElementById("user-add-btn").removeAttribute("disabled");
});
const selectAllUsersBox = document.getElementById("selectAllUsers");
const selectAllCompaniesBox = document.getElementById("selectAllCompanies");

selectAllUsersBox.addEventListener('click', selection)
selectAllCompaniesBox.addEventListener('click', selection)

function selection(e) {
    let checkboxes;
    let the_target = (e.target)
    if (the_target.id == 'selectAllCompanies') {
        checkboxes = document.getElementsByName('Clist')
    } else if (the_target.id == 'selectAllUsers') {
        checkboxes = document.getElementsByName('Ulist')
    }
    if (the_target.checked) {
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


// remove
userList.addEventListener('click', removeUser);
companyList.addEventListener('click', removeCompany);

function removeUser(e) {
    if (e.target.parentElement.classList.contains('delete-item')) {
        if (confirm('Are You Sure about that ?')) {

            let taskID = e.target.parentElement.parentElement.getAttribute('myAtr');
            // use a transaction
            let transaction = DBforUser.transaction(['users'], 'readwrite');
            let objectStore = transaction.objectStore('users');
            objectStore.delete(taskID);

            transaction.oncomplete = () => {
                e.target.parentElement.parentElement.remove();
            }

        }
    }
}

function removeCompany(e) {
    if (e.target.parentElement.classList.contains('delete-item')) {
        if (confirm('Are You Sure about that ?')) {

            let taskID = e.target.parentElement.parentElement.getAttribute('myAtr');
            // use a transaction
            let transaction = DBforCompany.transaction(['users'], 'readwrite');
            let objectStore = transaction.objectStore('users');
            objectStore.delete(taskID);

            transaction.oncomplete = () => {
                e.target.parentElement.parentElement.remove();
            }

        }
    }
}