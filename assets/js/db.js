let userDB = () => {
    return new Promise(function(resolve, reject) {
        let UserDB = indexedDB.open("users", 2);
        UserDB.onsuccess = function() {
            console.log('Database Ready');
            resolve(UserDB.result);
        }
        UserDB.onupgradeneeded = function(e) {
            let db = e.target.result;
    
            let objectStore = db.createObjectStore('users', { keyPath: 'email' });
    
            objectStore.createIndex('users', ['name', 'email'], { unique: true });
    
            console.log('Database ready and fields created!');
        }
        
    UserDB.onerror = function(event) {
        console.log('There was an error');
    };
    });
}
let companyDB = () => {
    return new Promise(function(resolve, reject) {
        let CompanyDB = indexedDB.open("companies", 2);
        CompanyDB.onsuccess = function() {
            console.log('Database Ready');
            resolve(CompanyDB.result);
        }
        CompanyDB.onupgradeneeded = function(e) {
            let db = e.target.result;
            
            let objectStore = db.createObjectStore('companies', { keyPath: 'email' });

            objectStore.createIndex('companies', ['name', 'email'], { unique: true });
    
            console.log('Database ready and fields created!');
        }
        
        CompanyDB.onerror = function(event) {
            console.log('There was an error');
    };
    });
}
let accountDB = () => {
    return new Promise(function(resolve, reject){
        let AccountDB = indexedDB.open("account", version);
        AccountDB.onsuccess = function (event) {
            console.log('Database Ready');
            resolve(AccountDB.result);
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
    
    })
}
let ticketDB = () => {
    return new Promise(function(resolve, reject){
        let TicketDB = indexedDB.open("Tickets", 2)
        TicketDB.onerror = function () {
            console.log("there was an error")
        }
        TicketDB.onsuccess = function () {
            console.log("database ready")
            resolve(TicketDB.result);
    
        }
        TicketDB.onupgradeneeded = function (e) {
            let db = e.target.result;
    
            let objectStore = db.createObjectStore("Tickets", { keyPath: 'id', autoIncrement: true })
    
            objectStore.createIndex('active', 'active', { unique: false });
            objectStore.createIndex('plate_Number', 'plate_Number', { unique: true });
            objectStore.createIndex('StartTime', 'StartTime', { unique: false });
            objectStore.createIndex('endTime', 'endTime', { unique: false });
            objectStore.createIndex('price', 'price', { unique: false });
    
            // const ticketData = [
            //     { active: "true", plate_Number: "B50286", StartTime: "4:50", endTime: "5:40", price: 25 },
            //     { active: "true", plate_Number: "B50286", StartTime: "4:50", endTime: "5:40", price: 25 },
            //     { active: "true", plate_Number: "B50286", StartTime: "4:50", endTime: "5:40", price: 25 }
            // ]
            // objectStore.transaction.oncomplete = function (e) {
            //     // Store values in the newly created objectStore.
            //     var objectStore = db.transaction("Tickets", "readwrite").objectStore("Tickets");
            //     ticketData.forEach(function (company) {
            //         objectStore.add(company);
            //     });
            // };
            console.log(`Its ready`);
    
        }
    
    })
}