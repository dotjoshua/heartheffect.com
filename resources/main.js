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

function on_hash_change() {
    if (location.href.indexOf('#') != -1) {
        if (location.href[location.href.indexOf('#') + 1] == "1" ) {
            open_page(location.href.substring(location.href.indexOf("#") + 3) + "_page");
        }
    } else {
        open_page("home_page");
    }
}