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

        let objectStore = db.createObjectStore('users', { keyPath: 'email' });

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
            spinner.style.display = 'block'

            let data = {
                email: email_input.value,
                password: password_input.value
            }

            return loginUser(data)


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
            signupUser(data)
            
            
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

function match(a,b){
    return a == b
}

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
        loggedIn(res)
    }
    transaction.onerror = () => { console.log('There was an error, try again!'); }
}
async function lookupUserInDB(data) {
    console.log("looking for the user in the DB")
    let email_id = data.email;
    let result = {};
    let objectStore = DB.transaction('users').objectStore('users');
    return new Promise(function(resolve, reject){
        let request = objectStore.get(email_id);
        request.onsuccess = function(){
            resolve(request.result);
        }
    });
}
function lookupUserInJSON(res) {
    // check if the user is in the db
    // if not add him/her
    let email_id = res.email;
    // use a transaction
    let objectStore = DB.transaction('users').objectStore('users').index('users');
    
    objectStore.openCursor().onsuccess = function (e) {
        // assign the current cursor
        let cursor = e.target.result;
        
        if (cursor) {
            if (cursor.value.email == email_id) {
                found = true
                return updateToken(res)
            }
            else {
                cursor.continue();
            }
        }
        // Update token
        else {
            return addNewUser(res)
        }
    }

}

function loggedIn(res) {
    spinner.style.display = 'none'

    let role = res.roles
    let email_id = res.email
    localStorage.setItem(`${role}`, JSON.stringify(email_id));
    switch (role) {
        case "user":
            relocation("user_page")
            break
        case "parking_officer":
            relocation("parking_officer")
            break
        case "admin":
            relocation("admin_page")
            break
    }
}
async function loginUser(data){
    let myPromise  = lookupUserInDB(data)
    myPromise.then(function(result){
        console.log("Finished looking up in the db")
        if(result){
            if(match(data.password, result.password)){
                // login user
            }
            else{
                // invalid login
            }
        }
        else{
            // Not in the DB
            console.log("User not found in the db")
            throw "err"
        }
    })
    myPromise.catch((error) => function(){
        console.log("catched :)")
    })

}
function signupUser(data){
    addNewUser(data)
}