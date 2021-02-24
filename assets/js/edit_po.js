//UI variables 
const editForm = document.getElementById("edit-form") //The form at the top
 //input text field
 const officerFName = document.getElementById("officer-fName");
 const officerLName = document.getElementById("officer-lName");
 const officerEmail = document.getElementById("officer-Email");
 const officerPassword = document.getElementById("officer-pass");
 const officerPhone = document.getElementById("officer-phone");
 const officerCompany = document.getElementById("officer-company");
 const officerRole = document.getElementById("role");

const urlParams = new URLSearchParams(window.location.search);
const COMP = urlParams.get("company");
const EMAIL = urlParams.get("email");


//DBUser
var DBUser;


document.addEventListener('DOMContentLoaded', () => {
    console.log(COMP);
    officerCompany.value = COMP;
    officerEmail.value = EMAIL;
    officerRole.value = "parking_officer";
   

    let TasksDBUser = indexedDB.open('users', 2);


    TasksDBUser.onerror = function() {
            console.log('There was an error');
        }
   
    TasksDBUser.onsuccess = function() {
        console.log('Database Ready');

   
        DBUser = TasksDBUser.result;

     
    }


    editForm.addEventListener('submit', updatePO);

    function updatePO(e) {
        e.preventDefault();
      
        var transaction = DBUser.transaction(['users'],"readwrite");
        var objectStore = transaction.objectStore('users');
        var request = objectStore.get(EMAIL);
        
        request.onsuccess = function(e) {
            let poInputs = {
                company: officerCompany.value,
                email: EMAIL,
                name: officerFName.value + " " + officerLName.value,
                password:officerPassword.value,
                phone_no: officerPhone.value,
                plate_number: "",
                role: officerRole.value
            }
        
            var objRequest = objectStore.put(poInputs);
        
            objRequest.onsuccess = function(e){
                console.log('Success in updating record');
        };
    }

        history.back();
    }




});