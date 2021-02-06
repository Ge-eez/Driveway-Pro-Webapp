const BACKEND_LOGIN = "https://parking-spot-finder-api.herokuapp.com/auth/login"
const BACKEND_SIGNUP = "https://parking-spot-finder-api.herokuapp.com/auth/signup"
document.addEventListener("DOMContentLoaded", function () {

    /*==================================================================
    [ DB ]*/

    let UserDB = indexedDB.open("users", 1);
    UserDB.onsuccess = function (event) {
        console.log('Database Ready');
        DB = TasksDB.result;
        displayTaskList();

    };
    UserDB.onerror = function (event) {
        console.log('There was an error');
    };
    UserDB.onupgradeneeded = function (e) {
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
    let name_input = document.querySelector("#name")
    let phone_input = document.querySelector("#phone_number")
    let plate_input = document.querySelector('#plate_number')

    let validate_form = document.querySelector('.validate-form')
    validate_form.addEventListener('submit', function (e) {
        e.preventDefault();
        let loggingIn = true;
        let signingUp = true;
        let check = true;

        for (var i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }
        // If a user is logging in
        if (loggingIn && check) {
            let data = {
                email: email_input.value,
                password: password_input.value
            }

            $.post(BACKEND_LOGIN, data, function (data, status) {
                let results = JSON.stringify(data);
                let res = JSON.parse(results)
                console.log(res)
                
                if(status == 200){
                    addNewUser()
                }
            })
            

        }
        // If a user is signing up
        else if (signingUp && check) {
            let data = {
                email: email_input.value,
                password: password_input.value,
                name: name_input.value,
                phone_no: phone_input.value,
                plate_number: plate_input.value
            }
            $.post(BACKEND_SIGNUP, data, function (data, status) {
                let results = JSON.stringify(data);
                let res = JSON.parse(results)
                console.log(res)
            })
        }

        // If input is wrong
        else {
            console.log("Edit your input")

        }
        return check;
    });



    let name = document.querySelector('.name');
    let phone_number = document.querySelector('.phone_number');
    let plate_number = document.querySelector('.plate_number');
    let forgot = document.querySelector('.password');
    let getBackLI = document.querySelector('.get-back');
    let getBackSU = document.querySelector('.get-back-sign-up');
    let password = document.querySelector('.password-box');
    let forgotPassword = document.querySelector('.forgot-password');
    let loginButton = document.querySelector('.login100-form-btn')
    let signup = document.querySelector('.sign-up')

    forgot.addEventListener('click', function () {
        hider(name, phone_number, plate_number, password, forgotPassword, getBackSU, signup)
        shower(getBackLI)
        loginButton.textContent = ("Verify");
        loggingIn = false;
        signingUp = false;
    });

    signup.addEventListener('click', function () {
        hider(forgotPassword, signup)
        shower(name, phone_number, plate_number, getBackSU)
        loginButton.textContent = ("Signup");
        loggingIn = false;
        signingUp = true;
        clearForm(...input)
    });

    getBackLI.addEventListener('click', function () {
        hider(name, phone_number, plate_number, getBackLI)
        shower(password, forgotPassword, signup)
        loginButton.textContent = ("Login");
        loggingIn = true;
        signingUp = false;
        clearForm(...input)
    })
    getBackSU.addEventListener('click', function () {
        hider(name, phone_number, plate_number, getBackSU)
        shower(password, forgotPassword, signup)
        loginButton.textContent = ("Login");
        loggingIn = true;
        signingUp = false;
        clearForm(...input)
    })

});


// DB operations

function addNewUser(e){
    // Using Index DB
    console.log("Yass")
}
