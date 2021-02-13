const parkingOfficer = document.querySelector(".officers-list");
const addBtn = document.getElementById("add-btn");
const cancelIcon = document.getElementById("cancel");
const form = document.getElementById("pop-up");

//form inputs
const officerFName = document.getElementById("officer-fName");
const officerLName = document.getElementById("officer-lName");
const officerEmail = document.getElementById("officer-Email");
const officerPhone = document.getElementById("officer-phone");
const officerSex = document.getElementById("officer-sex");

function openLink(e, id){
    var i,tab_content,tablinks;
    tab_content = document.getElementsByClassName("tab-content");
    for(i = 0; i<tab_content.length; i++){
        tab_content[i].style.display = 'none';
    }
    
    tablinks = document.getElementsByClassName("tab-links");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(id).style.display = "block";
    e.currentTarget.className += " active";
}

// parking officer part

addBtn.addEventListener('click',function(btn){
    
    form.style.display = "block";
    btn.currentTarget.disabled = "true"

});
cancelIcon.addEventListener('click',function(){
    form.style.display = "none";
    document.getElementById("add-btn").removeAttribute("disabled");
});

form.addEventListener('submit', add_parking_officer)
var i = 0;
function add_parking_officer(e){
    e.preventDefault(); 
    i++;
    form.style.display = "none";
    document.getElementById("add-btn").removeAttribute("disabled");
    display_parking_officer();

}

function display_parking_officer(){
    console.log(i);
    let listItem = `
            <ul class="list-inline row list-item">
                <li class="col-1 ml-0 pl-5 ">
                    <input class="input-group" type="checkbox" value="" id="selectAll" />
                </li>
                <li class="col-2">Mintesnot Bezabhi</li>
                <li class="col-2 ">0924316299</li>
                <li class="col-3">mintesnotbezabhi99@gmail.com</li>
                <li class="col-2">Male</li>
                <li class="col-2 ">
                    <i class="fa fa-remove mr-2"></i>  &nbsp;<a href="#"><i class="fa fa-edit"></i> </a>
                </li>
            </ul>`;
            parkingOfficer.innerHTML += listItem;
}

