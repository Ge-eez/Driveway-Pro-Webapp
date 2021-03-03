let form_input = document.querySelectorAll('.form-group .form-control')
form_input.forEach(element => {
    element.addEventListener('focus', function() {
        hideValidate(element);
    });
});
function showValidate(input) {
    let thisAlert = input.parentElement;

    thisAlert.classList.add('alert-validate');
}

function hideValidate(input) {
    let thisAlert = input.parentElement;

    thisAlert.classList.remove('alert-validate');
};
function validate(input) {
    if (input.getAttribute('type') == 'email' || input.getAttribute('name') == 'email') {
        if (input.value.trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
            return false;
        }
    } else {
        if (window.getComputedStyle(input.parentElement, null).display == 'block' && input.value.trim() == '') {
            return false;
        }
    }
}