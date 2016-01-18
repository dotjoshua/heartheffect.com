var editor = null;
var token = false;

window.onload = function() {
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
    select("id", "image_button").js_object.addEventListener("click", manage_images);

    select("id", "action_button").js_object.addEventListener("click", function() {
        if (select("id", "action_select").js_object.value == "edit_post") {
            update_current_post();
        } else {
            create_new_post();
        }
    });

    update_editor_context();
}

function manage_images() {
    var outer_div = document.createElement("div");

    var image_viewer = document.createElement("div");
    image_viewer.id = "image_viewer";
    var images = get("utilities/get_images.php", {}, true);
    for (var i = 0; i < images.length; i++) {
        var image = document.createElement("div");
        image.setAttribute("style", "background: url(../images/" + images[i].image_url + "); background-size: cover;");
        image.setAttribute("url", "http://heartheffect.com/images/" + images[i].image_url);
        image.className = "image_icon";
        image_viewer.appendChild(image);
    }
    outer_div.appendChild(image_viewer);

    var image_url = document.createElement("div");
    image_url.id = "image_url";
    outer_div.appendChild(image_url);


    var image_choose = document.createElement("input");
    image_choose.setAttribute("type", "file");
    image_choose.id = "image_choose";
    outer_div.appendChild(image_choose);

    var progress_outer = document.createElement("div");
    progress_outer.id = "progress_outer";
    progress_outer.className = "display_none";
    outer_div.appendChild(progress_outer);

    var progress_inner = document.createElement("div");
    progress_inner.id = "progress_inner";
    progress_outer.appendChild(progress_inner);

    alert(outer_div.outerHTML, "Images", "upload", true, function() {
        upload_image(manage_images);
    }, null, "done");

    select("id", "image_viewer").js_object.addEventListener("click", function(e) {
        if (e.srcElement.className == "image_icon") {
            var image_icons = select("class", "image_icon");
            for (var i = 0; i < image_icons.length; i++) {
                image_icons[i].remove_class("image_icon_selected");
            }
            e.srcElement.className += " image_icon_selected";

            select("id", "image_url").js_object.textContent = e.srcElement.getAttribute("url");
        }
    });

    if (select("class", "image_icon") != []) {
        select("class", "image_icon")[0].js_object.click();
    }
}

function get_selected_post() {
    var post = get_post_by_id(select("id", "post_select").js_object.value)[0];
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

        var response = post("utilities/update_post.php", {
            "token": token,
            "post_id": select("id", "post_select").js_object.value,
            "title": select("id", "title_input").js_object.value,
            "author": select("id", "author_select").js_object.value,
            "category": select("id", "category_select").js_object.value,
            "tags": select("id", "tags_input").js_object.value,
            "date": date,
            "content": editor.getValue()
        }, true);

        if (response["error"] == undefined) {
            token = response["token"];
            alert("Your changes are now live.", "Success!");
        } else {
            alert(response["error"], "Error");
        }
    });
}

function create_new_post() {
    if (!is_ready()) return;

    alert("Are you sure you want to publish this post?", "Just making sure...", "yes", true, function() {
        var date = select("id", "year_select").js_object.value
            + "-" + select("id", "month_select").js_object.value
            + "-" + select("id", "day_select").js_object.value;

        var response = post("utilities/create_post.php", {
            "token": token,
            "title": select("id", "title_input").js_object.value,
            "author": select("id", "author_select").js_object.value,
            "category": select("id", "category_select").js_object.value,
            "tags": select("id", "tags_input").js_object.value,
            "date": date,
            "content": editor.getValue()
        }, true);

        if (response["error"] == undefined) {
            select("id", "action_select").js_object.value = "edit_post";
            update_editor_context("edit_post");

            token = response["token"];
            alert("Your changes are now live.", "Success!");
        } else {
            alert(response["error"], "Error");
        }
    });
}

function delete_current_post() {
    alert("Are you sure you want to delete this post? This cannot be undone.",
            "Ah!", "yes, delete this post", true, function() {
        var response = post("utilities/delete_post.php", {
            "token": token,
            "post_id": select("id", "post_select").js_object.value
        }, true);

        if (response["error"] == undefined) {
            update_editor_context("edit_post");
            token = response["token"];
            alert("The post has been deleted.", "Success!");
        } else {
            alert(response["error"], "Error");
        }
    });
}

function upload_image(callback) {
    var file = document.getElementById("image_choose").files[0];

    if (!file) {
        alert("Select an image first.", "Slow down...");
        return;
    }

    if (file.size > 10000000) {
        alert("This image is a little too big.", "Ehh...");
        return;
    }

    select("id", "progress_outer").remove_class("display_none");
    setTimeout(function() {select("id", "progress_outer").remove_class("transparent")}, 10);

    var request = new XMLHttpRequest();
    request.onloadend = function() {
        var response = JSON.parse(request.responseText);

        if (response["error"] == undefined) {
            token = response["token"];
            callback();
        } else {
            alert(response["error"], "Error");
        }
    };
    request.upload.addEventListener("progress", function() {
        var percent = (event.loaded / event.total * 100);
        select("id", "progress_inner").js_object.setAttribute("style", "width: " + percent + "%");
    }, false);
    request.open("POST", "utilities/upload_image.php", true);
    request.setRequestHeader("X-File-Name", file.name);
    request.setRequestHeader("Content-Type", "application/octet-stream");
    request.setRequestHeader("Token", token);
    request.send(file);
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

function get_post_by_id(post_id) {
    return get("utilities/get_post_by_id.php", {"post_id": post_id});
}

function login(password) {
    var response = post("utilities/get_token.php", {"password": password}, true);
    token = response;
    return !!response;
}

function get_editor(password) {
    var authenticated = login(password);

    if (authenticated) {
        select("id", "content").add_class("transparent");
        setTimeout(function() {
            var content = select("id", "content");
            content.js_object.innerHTML = post("editor.html", {}, false);
            content.remove_class("transparent");
            on_editor_load();
        }, 500);
        close_alert();
    } else {
        alert("That's not the password.", "Oops!");
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