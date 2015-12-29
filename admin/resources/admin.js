var auth = null;

window.onload = function() {
    select("id", "login_field").js_object.addEventListener("keypress", function(e) {
        if (e.keyCode == 13) {
            get_editor();
        }
    });
};

function get_editor() {
    var password = select("id", "login_field").js_object.value;
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "utilities/get_editor.php?auth=" + password, false);
    xhttp.send();
    if (xhttp.responseText == "auth_error") {
        alert("That's not the password.", "Oops!");
    } else {
        auth = password;
        select("id", "content").add_class("transparent");
        setTimeout(function() {
            var content = select("id", "content");
            content.js_object.innerHTML = xhttp.responseText;
            content.remove_class("transparent");
        }, 500)
    }
    console.log();
}