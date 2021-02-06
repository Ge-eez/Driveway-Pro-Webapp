const backend = "https://parking-spot-finder-api.herokuapp.com/auth/loginCompany"
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

document.addEventListener("DOMContentLoaded", function () {
    /*==================================================================
    [ DB ]*/

    let CompanyDB = indexedDB.open("companies", 1);
    CompanyDB.onsuccess = function (event) {
        console.log('Database Ready');
        DB = TasksDB.result;
        displayTaskList();

    };
    CompanyDB.onerror = function (event) {
        console.log('There was an error');
    };
    CompanyDB.onupgradeneeded = function (e) {
        let db = e.target.result;

        let objectStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });

        objectStore.createIndex('tasknamez', ['date', 'taskname'], { unique: false });

        console.log('Database ready and fields created!');
    }
    

    /*==================================================================
    [ Validate ]*/
    let input = document.querySelectorAll('.validate-input .input100');
    let email_input = document.querySelector("#email")
    let password_input = document.querySelector("#password")
    let loggingIn = true;
    let signingUp = true;

    let validate_form = document.querySelector('.validate-form')
    validate_form.addEventListener('submit', function (e) {
        e.preventDefault();

        let check = true;
        for (var i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }
        // If a company is logging in
        if (loggingIn && check) {

            let data = {
                email: email_input.value,
                password: password_input.value
            }

            $.post(backend, data, function (data, status) {
                let results = JSON.stringify(data);
                let res = JSON.parse(results)
                console.log(res)
            })


        }

        // If a company is signing up
        else if (signingUp && check) {
            console.log("Registering company...")
        }
        else {
            console.log("Edit your input")

        }
        return check;
    });


    let name = document.querySelector('.name');
    let charge = document.querySelector('.charge');
    let floor = document.querySelector('.floor');
    let slots = document.querySelector('.slots-per-floor');
    let forgot = document.querySelector('.password');
    let getBackLI = document.querySelector('.get-back');
    let getBackSU = document.querySelector('.get-back-sign-up');
    let password = document.querySelector('.password-box');
    let forgotPassword = document.querySelector('.forgot-password');
    let loginButton = document.querySelector('.login100-form-btn');
    let signup = document.querySelector('.sign-up');

    forgot.addEventListener('click', function () {
        hider(name, charge, floor, slots, password, forgotPassword, getBackSU, signup)
        shower(getBackLI)
        loginButton.textContent = ("Verify");
        loggingIn = false;
        signingUp = false;
    });

    signup.addEventListener('click', function () {
        hider(forgotPassword, signup)
        shower(name, charge, floor, slots, getBackSU)
        loginButton.textContent = ("Signup");
        loggingIn = false;
        signingUp = true;
        clearForm(...input)
    });
    
    getBackLI.addEventListener('click', function () {
        hider(name, charge, floor, slots, getBackLI)
        shower(password, forgotPassword, signup)
        loginButton.textContent = ("Login");
        loggingIn = true;
        signingUp = false;
        clearForm(...input)
    });

    getBackSU.addEventListener('click', function () {
        hider(name, charge, floor, slots, getBackSU)
        shower(password, forgotPassword, signup)
        loginButton.textContent = ("Login");
        loggingIn = true;
        signingUp = false;
        clearForm(...input)
    })
});