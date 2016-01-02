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

    select("id", "post_select").js_object.addEventListener("change", get_selected_post);
    select("id", "delete_button").js_object.addEventListener("click", delete_current_post);

    select("id", "action_button").js_object.addEventListener("click", function() {
        if (select("id", "action_select").js_object.value == "edit_post") {
            update_current_post();
        } else {
            create_new_post();
        }
    });

    update_editor_context();
}

function get_selected_post() {
    var post = get_posts(select("id", "post_select").js_object.value - 1, 1)[0];
    var date_info = post.date.split(" ")[0].split("-");

    select("id", "year_select").js_object.value = date_info[0];
    select("id", "month_select").js_object.value = date_info[1];
    select("id", "day_select").js_object.value = date_info[2];
    select("id", "title_input").js_object.value = post.title;
    select("id", "author_select").js_object.value = post.author;
    select("id", "category_select").js_object.value = post.category;
    select("id", "tags_input").js_object.value = post.tags;
    editor.setValue(post.content);
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

    if (value == "edit_post") {
        var post_select = select("id", "post_select");
        var posts = get_posts_info();

        post_select.js_object.innerHTML = "";

        for (i = 0; i < posts.length; i++) {
            var new_option = document.createElement("option");
            new_option.setAttribute("value", posts[i].id);
            new_option.innerHTML = posts[i].title;
            post_select.js_object.appendChild(new_option);
        }

        get_selected_post();

        select("id", "action_button").js_object.innerHTML = "update";
    } else {
        editor.setValue("");
        select("id", "title_input").js_object.value = "";
        select("id", "month_select").js_object.value = ("0" + new Date().getMonth() + 1).slice(-2);
        select("id", "day_select").js_object.value = ("0" + new Date().getDate()).slice(-2);
        select("id", "year_select").js_object.value = new Date().getFullYear();
        select("id", "author_select").js_object.value = "";
        select("id", "tags_input").js_object.value = "";
        select("id", "category_select").js_object.value = "";
        select("id", "action_button").js_object.innerHTML = "publish";
    }
}

function update_current_post() {
    if (!is_ready()) return;

    alert("Are you sure you want to save changes?", "Just making sure...", "yes", true, function() {
        var date = select("id", "year_select").js_object.value
            + "-" + select("id", "month_select").js_object.value
            + "-" + select("id", "day_select").js_object.value;

        post("utilities/update_post.php", {
            "auth": auth,
            "post_id": select("id", "post_select").js_object.value,
            "title": select("id", "title_input").js_object.value,
            "author": select("id", "author_select").js_object.value,
            "category": select("id", "category_select").js_object.value,
            "tags": select("id", "tags_input").js_object.value,
            "date": date,
            "content": editor.getValue()
        }, false);
        alert("Your changes are now live.", "Success!");
    });
}

function create_new_post() {
    if (!is_ready()) return;

    alert("Are you sure you want to publish this post?", "Just making sure...", "yes", true, function() {
        var date = select("id", "year_select").js_object.value
            + "-" + select("id", "month_select").js_object.value
            + "-" + select("id", "day_select").js_object.value;

        post("utilities/create_post.php", {
            "auth": auth,
            "title": select("id", "title_input").js_object.value,
            "author": select("id", "author_select").js_object.value,
            "category": select("id", "category_select").js_object.value,
            "tags": select("id", "tags_input").js_object.value,
            "date": date,
            "content": editor.getValue()
        }, false);

        select("id", "action_select").js_object.value = "edit_post";
        update_editor_context("edit_post");

        alert("Your changes are now live.", "Success!");
    });
}

function delete_current_post() {
    alert("Are you sure you want to delete this post? This cannot be undone.",
            "Ah!", "yes, delete this post", true, function() {
        post("utilities/delete_post.php", {
            "auth": auth,
            "post_id": select("id", "post_select").js_object.value
        }, false);
        update_editor_context("edit_post");
        alert("The post has been deleted.", "Success!");
    });
}

function is_ready() {
    var items_to_fix = document.createElement("ul");

    if (select("id", "author_select").js_object.value == "") {
        var item = document.createElement("li");
        item.innerHTML = "'author' is unselected";
        items_to_fix.appendChild(item);
    }

    if (select("id", "title_input").js_object.value == "") {
        item = document.createElement("li");
        item.innerHTML = "'post title' is empty";
        items_to_fix.appendChild(item);
    }

    if (editor.getValue() == "") {
        item = document.createElement("li");
        item.innerHTML = "there is no content";
        items_to_fix.appendChild(item);
    }


    if (items_to_fix.childElementCount == 0) {
        return true;
    } else {
        alert(items_to_fix.outerHTML, "Hold up...");
    }
}

function get_posts_info() {
    return get("utilities/get_posts_info.php", {});
}

function get_posts(date) {
    return get("../utilities/get_posts.php", {"date": date});
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