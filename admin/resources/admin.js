var timer;
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
        matchBrackets: true,
        mode:  "htmlmixed",
        indentUnit: 4
    });
    editor.setOption("theme", "lesser-dark");
    editor.setSize("100%", "100%");
    editor.on("change", function(instance) {
        select("id", "preview_post_content").js_object.innerHTML = instance.getValue();
    });

    select("id", "action_select").js_object.addEventListener("change", function(e) {
        if (e.target.value == "edit_post") {
            if (editor.getValue() != "") {
                alert("You have unpublished changes. Are you sure you want to continue?", "Ah!",
                    {
                        button_text: "Yes, I'm sure.",
                        show_cancel: true,
                        button_callback: function() {
                            update_editor_context(e.target.value);
                            close_alert();
                        },
                        cancel_callback: function() {
                            e.target.value = "new_post";
                            close_alert();
                        }
                    }
                );
            } else {
                update_editor_context(e.target.value);
            }
        } else {
            update_editor_context(e.target.value);
        }
    });

    select("id", "post_select").js_object.addEventListener("change", function() { get_selected_post() });
    select("id", "delete_button").js_object.addEventListener("click", function() { delete_current_post() });
    select("id", "image_button").js_object.addEventListener("click", function() { manage_images() });

    select("id", "action_button").js_object.addEventListener("click", function() {
        if (select("id", "action_select").js_object.value == "edit_post") {
            update_current_post();
        } else {
            create_new_post();
        }
    });

    select("id", "author_select").js_object.addEventListener("change", on_author_change);

    select("id", "title_input").js_object.addEventListener("keyup", on_title_change);

    select("id", "month_select").js_object.addEventListener("change", on_date_change);
    select("id", "day_select").js_object.addEventListener("change", on_date_change);
    select("id", "year_select").js_object.addEventListener("change", on_date_change);

    select("id", "style_editor").js_object.addEventListener("keydown", function(e) {
        if (e.keyCode == 9) {
            e.preventDefault();
            var s = e.srcElement.selectionStart;
            e.srcElement.value = e.srcElement.value.substring(0, e.srcElement.selectionStart)
                + "\t" + e.srcElement.value.substring(e.srcElement.selectionEnd);
            e.srcElement.selectionEnd = s + 1;
        }
    });

    select("id", "style_editor").js_object.addEventListener("keyup", function(e) {
        select("id", "preview_style").js_object.innerHTML =
            e.srcElement.value.replace(/<current_post_id>/g, 0);
    });

    on_date_change();
    update_editor_context();
}

function on_date_change() {
    select("id", "preview_post_date").js_object.innerHTML = new Date(
        select("id", "year_select").js_object.value,
        parseInt(select("id", "month_select").js_object.value) - 1,
        select("id", "day_select").js_object.value).toLocaleDateString();
}

function on_author_change() {
    var author_select = select("id", "author_select").js_object;
    var image = author_select.value != "" ? "../resources/authors/" + author_select.value + ".png" : "";
    select("id", "preview_post_author").js_object.setAttribute("style", "background-image: url(" + image + ");");
}

function on_title_change() {
    select("id", "preview_post_title").js_object.innerHTML = select("id", "title_input").js_object.value;
}

function manage_images() {
    var outer_div = document.createElement("div");

    var image_viewer = document.createElement("div");
    image_viewer.id = "image_viewer";

    send_request({
        url: "utilities/get_images.php",
        callback: function(images) {
            for (var i = 0; i < images.length; i++) {
                var image = document.createElement("div");
                image.setAttribute("style", "background: url(../images/" + images[i]["image_url"]
                    + "); background-size: cover;");
                image.setAttribute("url", "http://heartheffect.com/images/" + images[i]["image_url"]);
                image.className = "image_icon";
                image_viewer.appendChild(image);
            }
            outer_div.appendChild(image_viewer);

            var image_url = document.createElement("input");
            image_url.id = "image_url";
            image_url.setAttribute("readonly", "");
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

            alert(outer_div.outerHTML, "Images",
                {
                    button_text: "upload",
                    show_cancel: true,
                    button_callback: function() {
                        upload_image(manage_images);
                    },
                    cancel_button_text: "done"
                }
            );

            select("id", "image_viewer").js_object.addEventListener("click", function(e) {
                if (e.srcElement.className == "image_icon") {
                    var image_icons = select("class", "image_icon");
                    for (var i = 0; i < image_icons.length; i++) {
                        image_icons[i].remove_class("image_icon_selected");
                    }
                    e.srcElement.className += " image_icon_selected";

                    select("id", "image_url").js_object.value = e.srcElement.getAttribute("url");
                }
            });

            select("id", "image_url").js_object.addEventListener("click", function(e) {
                e.target.setSelectionRange(0, e.target.value.length);
            });

            if (select("class", "image_icon") != []) {
                select("class", "image_icon")[0].js_object.click();
            }

            refresh_token();
        }
    });
}

function get_selected_post(callback) {
    var post_id = select("id", "post_select").js_object.value;

    send_request({
        url: "../utilities/get_post_by_id.php",
        data: {post_id: post_id},
        callback: function(response) {
            if (response.error != undefined) {
                alert(response.error, "Error");
                return;
            }

            var post = response[0];
            var date_info = post.date.split(" ")[0].split("-");

            select("id", "year_select").js_object.value = date_info[0];
            select("id", "month_select").js_object.value = date_info[1];
            select("id", "day_select").js_object.value = date_info[2];
            select("id", "title_input").js_object.value = post.title;
            select("id", "author_select").js_object.value = post.author;
            select("id", "category_select").js_object.value = post.category;
            select("id", "tags_input").js_object.value = post.tags;

            editor.setValue(post.content);
            select("id", "style_editor").js_object.value = post.style;
            select("id", "preview_style").js_object.innerHTML = post.style.replace(/<current_post_id>/g, "0");

            on_author_change();
            on_title_change();
            on_date_change();

            refresh_token(callback);
        }
    });
}

function update_editor_context(value, callback) {
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
        send_request({
            url: "utilities/get_posts_info.php",
            callback: function(posts) {
                if (posts.error != undefined) {
                    alert(posts.error, "Error");
                    return;
                }

                var post_select = select("id", "post_select");
                post_select.js_object.innerHTML = "";

                for (i = 0; i < posts.length; i++) {
                    var new_option = document.createElement("option");
                    new_option.setAttribute("value", posts[i].id);
                    new_option.innerHTML = posts[i].title;
                    post_select.js_object.appendChild(new_option);
                }

                select("id", "action_button").js_object.innerHTML = "update";

                get_selected_post(callback);
            }
        });
    } else {
        editor.setValue("");
        select("id", "style_editor").js_object.innerHTML = "#post_<current_post_id> {\n\t\n}";
        select("id", "preview_style").js_object.innerHTML =
            select("id", "style_editor").js_object.value.replace(/<current_post_id>/g, 0);

        select("id", "title_input").js_object.value = "";
        select("id", "month_select").js_object.value = ("0" + (new Date().getMonth() + 1)).slice(-2);
        select("id", "day_select").js_object.value = ("0" + new Date().getDate()).slice(-2);
        select("id", "year_select").js_object.value = new Date().getFullYear();
        select("id", "author_select").js_object.value = "";
        select("id", "tags_input").js_object.value = "";
        select("id", "category_select").js_object.value = "";
        select("id", "action_button").js_object.innerHTML = "publish";

        on_author_change();
        on_title_change();
        on_date_change();
    }
}

function update_current_post() {
    if (!is_ready()) return;

    alert("Are you sure you want to save changes?", "Just making sure...",
        {
            button_text: "yes",
            show_cancel: true,
            button_callback: function () {
                alert("", "Updating...", {show_cancel: false});

                var year = select("id", "year_select").js_object.value;
                var month = select("id", "month_select").js_object.value;
                var day  = select("id", "day_select").js_object.value;

                var time = new Date();
                var hour = time.getUTCHours().toString();
                var minute = time.getUTCMinutes().toString();
                var second = time.getUTCSeconds().toString();

                var date_string = year + "-"
                    + ("0" + month).substr(-2)
                    + "-" + ("0" + day).substr(-2)
                    + " " + ("0" + hour).substr(-2)
                    + ":" + ("0" + minute).substr(-2)
                    + ":" + ("0" + second).substr(-2);

                send_request({
                    post: true,
                    url: "utilities/update_post.php",
                    data: {
                        token: token,
                        post_id: select("id", "post_select").js_object.value,
                        title: select("id", "title_input").js_object.value,
                        author: select("id", "author_select").js_object.value,
                        category: select("id", "category_select").js_object.value,
                        tags: select("id", "tags_input").js_object.value,
                        date: date_string,
                        content: editor.getValue(),
                        style: select("id", "style_editor").js_object.value
                    },
                    callback: function (response) {
                        if (response["error"] == undefined) {
                            set_token(response["token"]);
                            alert("Your changes are now live.", "Success!");
                        } else {
                            alert(response["error"], "Error");
                        }
                    }
                });
            }
        }
    );
}

function create_new_post() {
    if (!is_ready()) return;

    alert("Are you sure you want to publish this post?", "Just making sure...",
        {
            button_text: "yes",
            show_cancel: true,
            button_callback: function() {
                alert("", "Posting...", {show_cancel: false});

                var year = select("id", "year_select").js_object.value;
                var month = select("id", "month_select").js_object.value;
                var day  = select("id", "day_select").js_object.value;

                var time = new Date();
                var hour = time.getUTCHours().toString();
                var minute = time.getUTCMinutes().toString();
                var second = time.getUTCSeconds().toString();

                var date_string = year + "-"
                    + ("0" + month).substr(-2)
                    + "-" + ("0" + day).substr(-2)
                    + " " + ("0" + hour).substr(-2)
                    + ":" + ("0" + minute).substr(-2)
                    + ":" + ("0" + second).substr(-2);

                send_request({
                    post: true,
                    url: "utilities/create_post.php",
                    data: {
                        token: token,
                        title: select("id", "title_input").js_object.value,
                        author: select("id", "author_select").js_object.value,
                        category: select("id", "category_select").js_object.value,
                        tags: select("id", "tags_input").js_object.value,
                        date: date_string,
                        content: editor.getValue(),
                        style: select("id", "style_editor").js_object.value
                    },
                    callback: function (response) {
                        if (response["error"] == undefined) {
                            set_token(response["token"]);

                            select("id", "action_select").js_object.value = "edit_post";
                            update_editor_context("edit_post");

                            alert("Your new post is now live.", "Success!");
                        } else {
                            alert(response["error"], "Error");
                        }
                    }
                });
            }
        }
    );
}

function delete_current_post() {
    alert("Are you sure you want to delete this post? This cannot be undone.", "Ah!",
        {
            button_text: "yes, delete this post",
            show_cancel: true,
            button_callback: function() {
                alert("", "Deleting...", {show_cancel: false});

                send_request({
                    post: true,
                    url: "utilities/delete_post.php",
                    data: {
                        token: token,
                        post_id: select("id", "post_select").js_object.value
                    },
                    callback: function (response) {
                        if (response["error"] == undefined) {
                            set_token(response["token"]);
                            update_editor_context("edit_post", function () {
                                alert("The post has been deleted.", "Success!");
                            });
                        } else {
                            alert(response["error"], "Error");
                        }
                    }
                });
            }
        }
    );
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
            set_token(response["token"]);
            callback();
        } else {
            alert(response["error"], "Error");
        }
    };
    request.upload.addEventListener("progress", function() {
        var percent = (event["loaded"] / event["total"] * 100);
        select("id", "progress_inner").js_object.setAttribute("style", "width: " + percent + "%");
    }, false);
    request.open("POST", "utilities/upload_image.php", true);
    request.setRequestHeader("X-File-Name", file.name);
    request.setRequestHeader("Content-Type", "application/octet-stream");
    request.setRequestHeader("Token", token.toString());
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

function login(password, callback) {
    send_request({
        post: true,
        url: "utilities/get_token.php",
        data: {password: password},
        callback: function(response) {
            if (response.error != undefined) {
                alert(response.error);
            } else {
                set_token(response);
                callback(response);
            }
        }
    });
}

function get_editor(password) {
    login(password, function(response) {
        if (response) {
            select("id", "content").add_class("transparent");
            setTimeout(function() {
                send_request({
                    post: true,
                    url: "editor.html",
                    parse_json: false,
                    callback: function(response) {
                        var content = select("id", "content");
                        content.js_object.innerHTML = response;
                        content.remove_class("transparent");
                        on_editor_load();
                    }
                });
            }, 500);
            close_alert();
        } else {
            alert("That's not the password.", "Oops!");
        }
    });
}

function move_divider(e) {
    if (e.pageY > 100 && e.pageY < (window.innerHeight - 100)) {
        var middle_percent = (e.pageY / window.innerHeight) * 100;
        select("id", "divider").js_object.setAttribute("style", "top: " + middle_percent + "%");
        select("id", "editor_top").js_object.setAttribute("style", "height: " + middle_percent + "%");
        select("id", "editor_bottom").js_object.setAttribute("style",
            "top: " + middle_percent + "%; height: " + (100- middle_percent) + "%");
    }
}

function refresh_token(callback) {
    send_request({
        post: true,
        url: "utilities/refresh_token.php",
        data: {token: token},
        callback: function(response) {
            if (response["error"] == undefined) {
                set_token(response["token"]);
            } else {
                alert(response["error"], "Error");
            }
        }
    });

    if (callback != undefined) {
        callback();
    }
}

function set_token(new_token) {
    token = new_token;
    if (timer != undefined) {
        clearTimeout(timer);
    }
    timer = setTimeout(function() {
        var logout = setTimeout(function() {
            location.reload();
        }, 60000);

        alert("Logging out in 1 minute due to inactivity.", "Alert",
            {
                button_text: "I'm still here",
                show_cancel: false,
                button_callback: function() {
                    close_alert();
                    refresh_token(function() {
                        clearTimeout(logout);
                    });
                }
            }
        );
    }, 1740000);
}
