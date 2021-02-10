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
let floor_input = document.querySelector('#floor')
let slots_input = document.querySelector('#slots-per-floor')

let spinner = document.querySelector('.fa-spinner')

function makeRequest(method, url, data) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        if (method == "POST" && data) {
            xhr.send(data);
        } else {
            xhr.send();
        }
    });
}
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
    current_location = current_location.splice(current_location.length - 2, 1)
    console.log(current_location)

    link = (current_location).join('/') + "/" + chosen
    console.log(link)
    location.href = link
    console.log(current_location)
}