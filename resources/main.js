var last_date_loaded = "9999-01-01";
var posts_buffer_size = 10;

window.onload = function() {
    load_pages();

    if ("onhashchange" in window) {
        window.addEventListener("hashchange", on_hash_change);
    }
};

function open_page(page_div_id) {
    if (select("id", page_div_id) == undefined) {
        alert("Page does not exist.", "Oops!");
        return;
    }

    var pages = select("class", "page");
    for (var i in pages) {
        pages[i].add_class("transparent");
    }

    setTimeout(function() {
        var pages = select("class", "page");
        for (var i in pages) {
            pages[i].add_class("display_none");
        }

        select("id", page_div_id).remove_class("display_none");
        setTimeout(function() {
            select("id", page_div_id).remove_class("transparent");
        }, 10);
    }, 500);

    window.location.hash = "1/" + page_div_id.substring(0, page_div_id.length - 5);
}

function load_pages() {
    get("utilities/get_pages.php", {}, true, function(response) {
        var pages = [];
        for (var key in response) {
            pages[response[key].substring(0, 1)] =
                [
                    response[key],
                    response[key].replace(/_/g, ' ').substring(2, response[key].lastIndexOf(".")),
                    response[key].substring(2, response[key].lastIndexOf(".")) + "_page"
                ];
        }

        for (var i in pages) {
            var request = new XMLHttpRequest();
            request.open("GET", "pages/" + pages[i][0], false);
            request.send();

            var nav_div = document.createElement("div");
            nav_div.id = "nav_" + pages[i][2];
            nav_div.innerHTML = pages[i][1];
            nav_div.className = "nav_item";
            nav_div.setAttribute("page_div", pages[i][2]);
            nav_div.addEventListener("click", function() {
                open_page(this.getAttribute("page_div"));
            });
            select("id", "nav").js_object.appendChild(nav_div);

            var page_div = document.createElement("div");
            page_div.className = "page transparent display_none";
            page_div.id = pages[i][2];
            page_div.innerHTML = request.responseText;
            select("id", "content").js_object.appendChild(page_div);
        }

        on_hash_change();
        while (load_posts(last_date_loaded));
    });
}

function load_posts(date) {
    get("utilities/get_posts.php", {"date": date}, true, function(new_posts) {
        var blog_page = select("id", "blog_page");

        for (var i in new_posts) {
            console.log(new_posts[i]);

            var post_div = document.createElement('div');
            post_div.className = "post";
            post_div.id = "post_" + new_posts[i].id;
            blog_page.js_object.appendChild(post_div);

            var author_div = document.createElement('div');
            author_div.className = "post_author";
            author_div.setAttribute("style", "background-image: url(./resources/authors/"
                + new_posts[i].author + ".png);");
            post_div.appendChild(author_div);

            var title_div = document.createElement('div');
            title_div.className = "post_title";
            title_div.innerHTML = new_posts[i].title;
            post_div.appendChild(title_div);

            var content_div = document.createElement('div');
            content_div.className = "post_content";
            content_div.innerHTML = new_posts[i].content;
            post_div.appendChild(content_div);

            var date_div = document.createElement('div');
            date_div.className = "post_date";
            date_div.innerHTML = new_posts[i].date;
            post_div.appendChild(date_div);

            posts_buffer_size--;
        }

        if (new_posts.length == 0 || posts_buffer_size < 1) {
            post_div = document.createElement('div');
            post_div.id = "no_more_posts";
            post_div.innerHTML = "No more posts.";
            blog_page.js_object.appendChild(post_div);

            posts_buffer_size = 10;
            return false;
        } else {
            last_date_loaded = new_posts[new_posts.length - 1].date.substr(0, 10);
            return true;
        }
    });
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
