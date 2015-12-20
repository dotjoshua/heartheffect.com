window.onload = function() {
    load_pages();

    if ("onhashchange" in window) {
        window.addEventListener("hashchange", on_hash_change);
    }

    on_hash_change();
    load_posts(0, 10);
};

function open_page(page_div_id) {
    if (select("id", page_div_id) == undefined) {
        alert("Page does not exist.", "Oops!");
        return;
    }

    var pages = select("class", "page");
    for (var i in pages) {
        pages[i].add_class("transparent");
        pages[i].add_class("display_none");
    }

    setTimeout(function() {
        select("id", page_div_id).remove_class("display_none");
        setTimeout(function() {
            select("id", page_div_id).remove_class("transparent");
        }, 10);
    }, 500);

    window.location.hash = "1/" + page_div_id.substring(0, page_div_id.length - 5);
}

function load_pages() {
    var pages = get_pages();

    for (var i in pages) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "pages/" + pages[i][0], false);
        xhttp.send();

        var page_div = document.createElement('div');
        page_div.className = "page transparent display_none";
        page_div.id = pages[i][2];
        page_div.innerHTML = xhttp.responseText;
        select("id", "content").js_object.appendChild(page_div);
    }
}

function get_pages() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "utilities/get_pages.php", false);
    xhttp.send();
    var response = JSON.parse(xhttp.responseText);

    var pages = [];
    for (var key in response) {
        pages[response[key].substring(0, 1)] =
            [
                response[key],
                response[key].replace(/_/g, ' ').substring(2, response[key].lastIndexOf(".")),
                response[key].substring(2, response[key].lastIndexOf(".")) + "_page"
            ];
    }
    return pages;
}

function alert(message, title, button, cancel, button_callback, cancel_callback) {
    message = (message == null) ? "" : message;
    title = (title == null) ? "" : title;
    button = (button == null) ? "ok" : button;
    button_callback = (button_callback == null) ? function() {close_alert()} : button_callback;
    cancel_callback = (cancel_callback == null) ? function() {close_alert()} : cancel_callback;
    cancel = (cancel == null) ? false : cancel;


    select("id", "alert_message").js_object.innerHTML = message;
    select("id", "alert_title").js_object.innerHTML = title;
    select("id", "alert_button").js_object.innerHTML = button;
    if (cancel) {
        select("id", "alert_cancel").remove_class("display_none");
    } else {
        select("id", "alert_cancel").add_class("display_none");
    }

    select("id", "alert_container").remove_class("display_none");
    setTimeout(function() {
        select("id", "alert_container").remove_class("transparent");
    }, 10);

    select("id", "alert_button").js_object.onclick = button_callback;
    select("id", "alert_cancel").js_object.onclick = cancel_callback;
}

function close_alert() {
    select("id", "alert_container").add_class("transparent");
    setTimeout(function() {
        select("id", "alert_container").add_class("display_none");
    }, 500);
}

function select(method, selector) {
    if (method == "id") {
        var js_object = document.getElementById(selector);
        return js_object == undefined ? undefined : ƪ(js_object);
    }

    if (method == "class") {
        var elements = [];
        var js_objects = document.getElementsByClassName(selector);

        for (var i in js_objects) {
            elements.push(ƪ(js_objects[i]));
        }

        return elements;
    }
}

function ƪ(js_object) {
    this.js_object = js_object;
    this.classes = this.js_object.className == undefined ? [] : this.js_object.className.split(" ");

    this.add_class = function (class_name) {
        if (this.classes.indexOf(class_name) == -1) {
            this.classes.push(class_name);
        }
        this.js_object.className = this.classes.join(" ");
    };

    this.remove_class = function(class_name) {
        if (this.classes.indexOf(class_name) != -1) {
            this.classes.splice(this.classes.indexOf(class_name), 1);
        }
        this.js_object.className = this.classes.join(" ");
    };
    return this;
}

function on_hash_change() {
    if (location.href.indexOf('#') != -1) {
        if (location.href[location.href.indexOf('#') + 1] == "1" ) {
            open_page(location.href.substring(location.href.indexOf("#") + 3) + "_page");
        }
    } else {
        open_page("home_page");
    }
}

function load_posts(start_id, number) {
    var new_posts = get_posts(start_id, number);
    var blog_page = select("id", "blog_page");

    for (var i in new_posts) {
        var post_div = document.createElement('div');
        post_div.className = "post";
        post_div.id = "post_" + new_posts[i].id;
        blog_page.js_object.appendChild(post_div);

        var title_div = document.createElement('div');
        title_div.className = "post_title";
        title_div.innerHTML = new_posts[i].title;
        post_div.appendChild(title_div);

        var content_div = document.createElement('div');
        content_div.className = "post_content";
        content_div.innerHTML = new_posts[i].content;
        post_div.appendChild(content_div);

        var author_div = document.createElement('div');
        author_div.className = "post_author";
        author_div.innerHTML = new_posts[i].author;
        post_div.appendChild(author_div);

        var date_div = document.createElement('div');
        date_div.className = "post_date";
        date_div.innerHTML = new_posts[i].date;
        post_div.appendChild(date_div);
    }

    if (new_posts.length < number) {
        post_div = document.createElement('div');
        post_div.id = "no_more_posts";
        post_div.innerHTML = "No more posts.";
        blog_page.js_object.appendChild(post_div);
    }
}

function get_posts(start_id, number) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "utilities/get_posts.php?start_id=" + start_id + "&number=" + number, false);
    xhttp.send();
    return JSON.parse(xhttp.responseText);
}

function search_posts(query) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "utilities/search_posts.php?query=" + query, false);
    xhttp.send();
    return JSON.parse(xhttp.responseText);
}