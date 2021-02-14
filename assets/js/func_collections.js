if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Client side db feature will not be available.");
}
let DB;
let input = document.querySelectorAll('.validate-input .input100');
let email_input = document.querySelector("#email")
let password_input = document.querySelector("#password")

let name_input = document.querySelector("#name")
let phone_input = document.querySelector("#phone_number")
let plate_input = document.querySelector('#plate_number')


let charge_input = document.querySelector("#charge")
let location_input = document.querySelector('#location')
let slots_input = document.querySelector('#slots-per-floor')

let spinner = document.querySelector('.fa-spinner')

let validate_form = document.querySelector('.validate-form')
    
function validate(input) {
    if (input.getAttribute('type') == 'email' || input.getAttribute('name') == 'email') {
        if (input.value.trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
            return false;
        }
    }
    else {
        if (window.getComputedStyle(input.parentElement, null).display == 'block' && input.value.trim() == '') {
            return false;
        }
    }
}

function showValidate(input) {
    let thisAlert = input.parentElement;

    thisAlert.classList.add('alert-validate');
}

function hideValidate(input) {
    let thisAlert = input.parentElement;

    thisAlert.classList.remove('alert-validate');
};
function hider(...elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = 'none'
    };
}
function shower(...elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = 'block'
    };
}

function clearForm(...elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].value = ''
    };
}

let form_input = document.querySelectorAll('.validate-form .input100')
form_input.forEach(element => {
    element.addEventListener('focus', function () {
        hideValidate(element);
    });
});

function relocation(chosen) {

    let current_location = location.href
    // If it's loading locally
    if ((current_location).includes(".html")) {
        chosen += ".html"
    }
    current_location = (current_location.split('/'))
    current_location.pop()

    link = (current_location).join('/') + "/" + chosen
    location.href = link
}
function match(a, b) {
    return a == b
}
function invalidLogin() {
    alert("TRY AGAIN WRONG CREDENTIALS")
    clearForm()
}