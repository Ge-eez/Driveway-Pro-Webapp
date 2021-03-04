document.addEventListener("DOMContentLoaded", function () {

    /*==================================================================
    [ DB ]*/

    // DB = userDB()
    // console.log(DB)
    userDB().then(function (result) {
        DB = result
        // if(DB) migrateData()
    })
    /*==================================================================
    [ Validate ]*/

    let loggingIn = true;
    let signingUp = true;

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
            let encrypted = CryptoJS.AES.encrypt(password_input.value, "Secret").toString();
            let data = {
                email: email_input.value,
                password: encrypted,
                name: name_input.value,
                phone_no: phone_input.value,
                plate_number: plate_input.value
            }
            return signupUser(data)


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

async function addNewUser(data) {

    // Insert the object into the database 
    let transaction = DB.transaction(['users'], 'readwrite');
    let objectStore = transaction.objectStore('users');
    let role;
    let company;
    if (!data.role) role = "user"
    else role = data.role
    if (!data.company) company = ""
    else company = data.company

    let res = UserModel(data.name, data.email, data.plate_number, role, data.password, data.phone_no, company)

    return new Promise(function (resolve, reject) {
        let request = objectStore.add(res);
        request.onsuccess = function () {
            clearForm(...input)
            resolve(request.result);
        }
        transaction.oncomplete = () => {
            console.log('New user added');
            // take user to the user landing page
            let userToJson = addUserToJSON(res)
            userToJson.then(loggedIn(res))
        }
        transaction.onerror = () => { console.log('There was an error, try again!'); }
    });



}
async function addUserToJSON(data) {
    console.log("adding user to JSON")
    return new Promise(function (resolve, reject) {
        function checker() {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', './assets/js/jsonData/user.json', true);
            xhr.onload = function (e) {
                if (this.status == 200) {
                    const users = JSON.parse(this.responseText);
                    users.forEach(user => {
                        if (user.email == data.email) {
                            console.log("file found")
                            return false
                        }
                    })
                }
            }
            xhr.send();
            return true
        }
        result = checker()
        if (result) {
            console.log("File not found so we're creating one....")

            // var textFile = null;
            // function makeTextFile(text) {
            //     var data = new Blob([text], { type: 'text/plain' });

            //     // If we are replacing a previously generated file we need to
            //     // manually revoke the object URL to avoid memory leaks.
            //     if (textFile !== null) {
            //         window.URL.revokeObjectURL(textFile);
            //     }

            //     textFile = window.URL.createObjectURL(data);

            //     resolve(textFile);
            // }
            // makeTextFile("Hey")
        }
    })
}
async function lookupUserInDB(data) {
    console.log("looking for the user in the DB")
    let email_id = data.email;
    let objectStore = DB.transaction('users').objectStore('users');
    return new Promise(function (resolve, reject) {
        let request = objectStore.get(email_id);
        request.onsuccess = function () {
            resolve(request.result);
        }
    });
}
async function lookupUserInJSON(data) {
    console.log("looking for the user in the JSON")
    return new Promise(function (resolve, reject) {
        resolve(readJSON(data))
    });

}
function migrateData() {
    readAllJSON()
}
async function loginUser(data) {
    let myPromiseDB = lookupUserInDB(data)
    try {
        myPromiseDB.then(function (result) {
            console.log("Finished looking up in the db")
            if (result) {
                let password = (CryptoJS.AES.decrypt(result.password, "Secret")).toString(CryptoJS.enc.Utf8);
                if (match(data.password, password)) {
                    // login user
                    console.log("Login")
                    loggedIn(result)
                } else {
                    // invalid login
                    invalidLogin()
                }
            } else {
                // Not in the DB
                console.log("User not found in the db")
                throw "err"
            }
        }).catch(err => {
            lookupUserInJSON(data)
        });
    } catch (err) {
        console.log(`Caught by try/catch ${error}`);
    }

}
async function signupUser(data) {
    await addNewUser(data)
}

function loggedIn(res) {
    spinner.style.display = 'none'

    let role = res.role
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

function readJSON(data) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', './assets/js/jsonData/user.json', true);
    xhr.onload = function (e) {
        if (this.status == 200) {
            const users = JSON.parse(this.responseText);
            users.forEach(user => {
                if (user.email == data.email) {
                    console.log("file found")
                    let toBeAdded = user
                    if (match(toBeAdded.password, data.password)) {
                        toBeAdded.password = CryptoJS.AES.encrypt(password_input.value, "Secret").toString();
                        addNewUser(toBeAdded)
                    } else {
                        invalidLogin()
                    }
                }
            })
        }
    }
    xhr.send();
}
async function addUsers(data) {

    // Insert the object into the database 
    let transaction = DB.transaction(['users'], 'readwrite');
    let objectStore = transaction.objectStore('users');
    let role;
    let company;
    if (!data.role) role = "user"
    else role = data.role
    if (!data.company) company = ""
    else company = data.company

    let res = UserModel(data.name, data.email, data.plate_number, role, data.password, data.phone_no, company)

    return new Promise(function (resolve, reject) {
        let request = objectStore.add(res);
        request.onsuccess = function () {
            clearForm(...input)
            resolve(request.result);
        }
        transaction.oncomplete = () => {
            console.log('New user added');
        }
        transaction.onerror = () => { console.log('There was an error, try again!'); }
    });



}
function readAllJSON() {
    if (DB) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', './assets/js/jsonData/user.json', true);
        xhr.onload = function (e) {
            if (this.status == 200) {
                const users = JSON.parse(this.responseText);
                users.forEach(user => {
                    console.log(`${user.email} found`)
                    let toBeAdded = user
                    toBeAdded.password = CryptoJS.AES.encrypt(password_input.value, "Secret").toString();
                    addUsers(toBeAdded)

                }
                )
            }
        }
        xhr.send();
    }
}