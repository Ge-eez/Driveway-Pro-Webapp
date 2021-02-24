
document.addEventListener("DOMContentLoaded", function () {

    // Money case
    let AccountDB = indexedDB.open("account", version);
    AccountDB.onsuccess = function (event) {
        console.log('Database Ready');
        DB = AccountDB.result;
        // display

    };
    AccountDB.onerror = function (event) {
        console.log('There was an error, please upgrade the version of your indexdb in the code');
    };
    AccountDB.onupgradeneeded = function (e) {
        let db = e.target.result;

        let objectStore = db.createObjectStore('account', { keyPath: 'date' });

        objectStore.createIndex('account', ['company_email', 'user_email'], { unique: false });

        console.log('Database ready and fields created!');
    }



    let login_user = document.getElementById("login-btn-user")
    let login_company = document.getElementById("login-btn-company")

    login_user.addEventListener('click', function(e){
        take_user_in('user_login')
    })
    login_company.addEventListener('click', function(e){
        take_user_in('company_login')
    })
    function take_user_in(info) {
        let chosen = info;
        let link;
        let current_location = location.href
        // If it's loading locally
        if ((current_location).includes(".html")) {
            chosen += ".html"
            current_location = current_location.slice(0, -10)
        }
        // If it's loading from live server
        else if (current_location.includes("127.0.0.1")) {
            chosen += ".html"
        }
        link = current_location + chosen
        location.href = link
    }

    let who = document.getElementById('who')
    let what = document.getElementById('what')
    let services = document.getElementById('services')
    let elsh = document.getElementById('elsh')
    let ed = document.getElementById('ed')
    let tedy = document.getElementById('tedy')
    let minte = document.getElementById('minte')
    let xhr = new XMLHttpRequest();
    xhr.open('GET', './assets/js/jsonData/index.json', true);
    xhr.onload = function (e) {
        if (this.status == 200) {
            const data = JSON.parse(this.responseText);
            who.innerText = data.who
            what.innerText = data.what
            services.innerText = data.services
            elsh.href = data.Elshadai
            ed.href = data.Eden
            tedy.href = data.Tewodros
            minte.href = data.Mintesnot
        }
    }
    xhr.send();
})