const BACKEND_LOGIN = "https://parking-spot-finder-api.herokuapp.com/auth/login"
const BACKEND_SIGNUP = "https://parking-spot-finder-api.herokuapp.com/auth/signup"
document.addEventListener("DOMContentLoaded", function () {

    /*==================================================================
    [ DB ]*/

    let UserDB = indexedDB.open("users", 1);
    UserDB.onsuccess = function (event) {
        console.log('Database Ready');
        DB = UserDB.result;
        // display

    };
    UserDB.onerror = function (event) {
        console.log('There was an error');
    };
    UserDB.onupgradeneeded = function (e) {
        let db = e.target.result;

        let objectStore = db.createObjectStore('users', { keyPath: 'email'});

        objectStore.createIndex('users', ['name', 'email'], { unique: true });

        console.log('Database ready and fields created!');
    }

    /*==================================================================
    [ Validate ]*/

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
        // If a user is logging in
        if (loggingIn && check) {
            for (var i = 0; i < input.length; i++) {
                if (validate(input[i]) == false) {
                    showValidate(input[i]);
                    check = false;
                }
            }
            let data = {
                email: email_input.value,
                password: password_input.value
            }

            $.post(BACKEND_LOGIN, data, function (data, status) {
                let results = JSON.stringify(data);
                let res = JSON.parse(results)

                if (status == 'success') {
                    lookupUser(res)
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
            console.log(data)
            $.post(BACKEND_SIGNUP, data, function (data, status) {
                let results = JSON.stringify(data);
                let res = JSON.parse(results)

                if (status == "success") {
                    addNewUser(res)
                }
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

function addNewUser(res) {

    // Insert the object into the database 
    let transaction = DB.transaction(['users'], 'readwrite');
    let objectStore = transaction.objectStore('users');

    res.password = "Lol we kinda respect privacy ;)"
    res.status = "First time"

    // res.code = password_input.value;

    let request = objectStore.add(res);
    // on success
    request.onsuccess = () => {
        clearForm(...input)
    }
    transaction.oncomplete = () => {
        console.log('New user added');
        // take user to the user landing page
    }
    transaction.onerror = () => { console.log('There was an error, try again!'); }
}
function lookupUser(res) {
    // check if the user is in the db
    // if not add him/her
    let email_id = res.email;
    // use a transaction
    let objectStore = DB.transaction('users').objectStore('users').index('users');
    
    objectStore.openCursor().onsuccess = function (e) {
        // assign the current cursor
        let cursor = e.target.result;
        let found = false

        if (cursor) {
            if(cursor.value.email == email_id){
                found = true
            }
            else{
                cursor.continue();
            }
        }
        if(!found) addNewUser(res)
        else{
            // Update token
            updateToken(res)
            // Redirect to the landing page
        }
    }

}
function updateToken(res) {

    let email_id = res.email;
    // use a transaction
    let objectStore = DB.transaction(['users'], "readwrite").objectStore('users');
    const objectStoreTitleRequest = objectStore.get(email_id);    
    
    objectStoreTitleRequest.onsuccess = () => {
        const data = objectStoreTitleRequest.result;
      
        data.token = res.token;
      
        const updateTitleRequest = objectStore.put(data);
      
        console.log("The transaction that originated this request is " + updateTitleRequest.transaction);
      
        updateTitleRequest.onsuccess = () => {
            console.log("logged In")
        };
      };
}