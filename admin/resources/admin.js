var auth = null;

window.onload = function() {
    get_editor("IronMan");
    select("id", "login_field").js_object.addEventListener("keypress", function(e) {
        if (e.keyCode == 13) {
            get_editor(select("id", "login_field").js_object.value);
        }
    });
};

function on_editor_load() {
    select("id", "divider").js_object.addEventListener("mousedown", function(e) {
        e.preventDefault();
        window.addEventListener("mousemove", move_divider);
        window.addEventListener("mouseup", function() {
            window.removeEventListener("mousemove", move_divider);
        });
    });
}

function get_editor(password) {
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
            on_editor_load();
        }, 500);
        close_alert();
    }
}

function move_divider(e) {
    if (e.pageY > 100 && e.pageY < (window.innerHeight - 100)) {
        var middle_percent = (e.pageY / window.innerHeight) * 100;
        select("id", "divider").js_object.setAttribute("style", "top: " + middle_percent + "%");
        select("id", "code_window").js_object.setAttribute("style", "height: " + middle_percent + "%");
        select("id", "preview_window").js_object.setAttribute("style", "top: " + middle_percent + "%; height: " + (100- middle_percent) + "%");
    }
}