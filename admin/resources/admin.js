var auth = null;
var editor = null;

window.onload = function() {

    //debug:
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

    editor = CodeMirror.fromTextArea(select("id", "editor_textarea").js_object, {
        lineNumbers: true,
        styleActiveLine: true,
        matchBrackets: true
    });
    editor.setOption("theme", "lesser-dark");
    editor.setSize("100%", "100%");

    select("id", "action_select").js_object.addEventListener("change", function(e) {
        if (e.target.value == "edit_post") {
            if (editor.getValue() != "") {
                alert("You have unpublished changes. Are you sure you want to continue?",
                    "Ah!",
                    "Yes, I'm sure.",
                    true,
                    function() {
                        update_editor_context(e.target.value);
                        close_alert();
                    },
                    function() {
                        e.target.value = "new_post";
                        update_editor_context(e.target.value);
                        close_alert();
                    }
                );
            } else {
                update_editor_context(e.target.value);
            }
        } else {
            update_editor_context(e.target.value);
        }
    });
}

function update_editor_context(value) {
    var toggle_on_edit_divs = select("class", "toggle_on_edit");
    for (var i = 0; i < toggle_on_edit_divs.length; i++) {
        if (value == "edit_post") {
            toggle_on_edit_divs[i].remove_class("display_none");
        } else {
            toggle_on_edit_divs[i].add_class("display_none");
        }
    }

    var lock_on_edit_divs = select("class", "lock_on_edit");
    for (i = 0; i < lock_on_edit_divs.length; i++) {
        if (value == "edit_post") {
            lock_on_edit_divs[i].add_class("locked_select");
        } else {
            lock_on_edit_divs[i].remove_class("locked_select");
        }
    }
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
        select("id", "preview_window").js_object.setAttribute("style",
            "top: " + middle_percent + "%; height: " + (100- middle_percent) + "%");
    }
}