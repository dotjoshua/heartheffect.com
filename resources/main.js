var last_date_loaded = "9999-01-01";
var posts_buffer_size = 10;
var current_page;

window.onload = function() {
    load_pages();

    if ("onhashchange" in window) {
        window.addEventListener("hashchange", on_hash_change);
    }

    var search_timer;
    select("id", "search_input").js_object.addEventListener("keyup", function(e) {
        if (search_timer != undefined) {
            clearTimeout(search_timer);
        }

        if (e.srcElement.value.length > 2) {
            search_timer = setTimeout(function() {
                window.location.hash = "2/search/" + e.srcElement.value;
            }, 500);
        } else if (e.srcElement.value.length == 2) {
            open_page("blog_page");
        }
    });
};

function open_page(page_div_id) {
    if (select("id", page_div_id) == undefined) {
        alert("Page does not exist.", "Oops!");
        return;
    }

    if (current_page == page_div_id) {
        return;
    }

    var prefix = "1/";
    var suffix = "";
    if (page_div_id == "search_page") {
        prefix = "2/";
        var url_contents = window.location.hash.split("/");
        suffix = "/" + url_contents[url_contents.length - 1];
    } else if (page_div_id == "post_page") {
        prefix = "3/";
        url_contents = window.location.hash.split("/");
        suffix = "/" + url_contents[url_contents.length - 1];
    }

    current_page = page_div_id;

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

    window.location.hash = prefix + page_div_id.substring(0, page_div_id.length - 5) + suffix;
}

function load_pages() {
    send_request({
        url: "utilities/get_pages.php",
        callback: function(response) {
            var pages = [];
            for (var i in response) {
                var page = {};
                page.location = response[i];
                page.name = response[i].replace(/_/g, ' ').substring(2, response[i].lastIndexOf("."));
                page.div_name = response[i].substring(2, response[i].lastIndexOf(".")) + "_page";
                pages[response[i].substring(0, 1)] = page;
            }

            for (i in pages) {
                var request = new XMLHttpRequest();
                request.open("GET", "pages/" + pages[i].location, false);
                request.send();
                pages[i].content = request.responseText;

                var page_divs = create_page_divs(pages[i]);
                select("id", "nav").js_object.appendChild(page_divs[0]);
                select("id", "content").js_object.appendChild(page_divs[1]);
            }

            on_hash_change();
            while (load_posts(last_date_loaded));
        }
    });

    var hidden_pages = [{"div_name": "post_page", "content": ""}];
    for (var i in hidden_pages) {
        var page_divs = create_page_divs(hidden_pages[i]);
        select("id", "content").js_object.appendChild(page_divs[1]);
    }

    function create_page_divs(page_data) {
        var nav_div = document.createElement("div");
        nav_div.id = "nav_" + page_data.div_name;
        nav_div.innerHTML = page_data.name;
        nav_div.className = "nav_item";
        nav_div.setAttribute("page_div", page_data.div_name);
        nav_div.addEventListener("click", function(e) {
            open_page(this.getAttribute("page_div"));
            sparks_animation(e);
        });

        var page_div = document.createElement("div");
        page_div.className = "page transparent display_none";
        page_div.id = page_data.div_name;
        page_div.innerHTML = page_data.content;

        return [nav_div, page_div];
    }
}

function open_post(post_id) {
    send_request({
        url: "utilities/get_post_by_id.php",
        data: {post_id: post_id},
        callback: function(response) {
            if (response.length == 0) {
                alert("This post does not exist. It may have been deleted, or your link may be incomplete.", "Ah!",
                    {
                        button_text: ":(",
                        show_cancel: false,
                        button_callback: function() {
                            open_page("blog_page");
                            close_alert();
                        }});
            } else {
                add_posts_to_element(response, select("id", "post_page"));
            }
        }
    });
}

function load_posts(date) {
    send_request({
        url:  "utilities/get_posts.php",
        data: {"date": date},
        callback: function(new_posts) {
            var blog_page = select("id", "blog_page");
            add_posts_to_element(new_posts, blog_page);

            if (new_posts.length == 0 || posts_buffer_size < 1) {
                var post_div = document.createElement('div');
                post_div.className = "no_more_posts";
                post_div.innerHTML = "No more posts.";
                blog_page.js_object.appendChild(post_div);

                posts_buffer_size = 10;
            } else {
                last_date_loaded = new_posts[new_posts.length - 1].date.substr(0, 10);
                load_posts(last_date_loaded);
            }
        }
    });
}

function add_posts_to_element(posts, elem, snippet) {
    snippet = (snippet == undefined) ? false : snippet;

    for (var i in posts) {
        var post_div = document.createElement('div');
        post_div.className = "post";
        post_div.id = "post_" + posts[i].id;
        post_div.setAttribute("num", posts[i].id);
        elem.js_object.appendChild(post_div);

        var author_div = document.createElement('div');
        author_div.className = "post_author";
        author_div.setAttribute("style", "background-image: url(./resources/authors/" + posts[i].author + ".png);");
        post_div.appendChild(author_div);

        var title_div = document.createElement('div');
        title_div.className = "post_title";
        title_div.innerHTML = posts[i].title;
        post_div.appendChild(title_div);
        title_div.addEventListener("click", function(e) {
            window.location.hash = "3/post/" + e.target.parentNode.getAttribute("num");
        });

        var date_div = document.createElement('div');
        date_div.className = "post_date";
        date_div.innerHTML = new Date(posts[i].date.substr(0, 10)).toLocaleDateString();
        post_div.appendChild(date_div);

        var style = posts[i].style.replace(/<current_post_id>/g, posts[i].id);
        var style_elem = document.createElement("style");
        style_elem.innerHTML = style;

        var content_div = document.createElement('div');
        content_div.className = "post_content";
        content_div.innerHTML = posts[i].content;
        if (snippet) {
            content_div.innerHTML = content_div.innerText.substr(0, 140).replace(/<\/br>/g, ' ').trim() + "...";
        }
        content_div.appendChild(style_elem);
        post_div.appendChild(content_div);

        posts_buffer_size--;
    }
}

function on_hash_change() {
    if (location.href.indexOf('#') != -1) {
        if (location.href[location.href.indexOf('#') + 1] == "1") {
            open_page(location.href.substring(location.href.indexOf("#") + 3) + "_page");
        } else if (location.href[location.href.indexOf('#') + 1] == "2") {
            open_page("search_page");
            if (current_page == "search_page") {
                var url_contents = window.location.hash.split("/");
                search_posts(url_contents[url_contents.length - 1]);
            }
        } else if (location.href[location.href.indexOf('#') + 1] == "3") {
            select("id", "post_page").js_object.innerHTML = "";

            open_page("post_page");
            if (current_page == "post_page") {
                url_contents = window.location.hash.split("/");
                open_post(url_contents[url_contents.length - 1]);
            }
        }
    } else {
        open_page("home_page");
    }
}

function sparks_animation(e) {
    var spark_divs = [];

    for (var i = 0; i < 10; i++) {
        var spark_div = document.createElement("div");
        spark_divs[i] = spark_div;
        spark_div.className = "spark";
        spark_div.x = e.clientX;
        spark_div.y = e.clientY;
        spark_div.velocity_x = Math.random() - 0.5;
        spark_div.velocity_y = Math.random() - 0.6;
        spark_div.rotation = 0;
        spark_div.rotation_velocity = (Math.random() - 0.5) * 10;
        spark_div.offset_x = spark_div.offset_y = 0;
        spark_div.setAttribute("style", "top: " + e.clientY + "px; left: " + e.clientX + "px;");
        select("id", "animation_elements").js_object.appendChild(spark_div);
    }

    setTimeout(function() {
        for (var i = 0; i < 10; i++) {
            select("id", "animation_elements").js_object.removeChild(spark_divs[i]);
            spark_divs[i] = undefined;
        }
    }, 10000);

    requestAnimationFrame(function() { update_spark_location(spark_divs) });
}

function update_spark_location(spark_divs) {
    for (var i = 0; i < 10; i++) {
        if (spark_divs[i] == undefined) break;
        spark_divs[i].offset_x += spark_divs[i].velocity_x;
        spark_divs[i].offset_y += spark_divs[i].velocity_y;
        spark_divs[i].rotation += spark_divs[i].rotation_velocity;
        spark_divs[i].rotation %= 360;
        spark_divs[i].setAttribute("style", "top: " + spark_divs[i].y + "px; left: " + spark_divs[i].x
            + "px; transform: translateX(" + spark_divs[i].offset_x + "px) translateY("
            + spark_divs[i].offset_y + "px) rotateZ(" + spark_divs[i].rotation + "deg);")
    }

    if (spark_divs[0] != undefined) {
        requestAnimationFrame(function() { update_spark_location(spark_divs) });
    }
}

function search_posts(query) {
    send_request({
        url: "utilities/search_posts.php",
        data: {query: query},
        callback: function(response) {
            select("id", "search_page").js_object.innerHTML = "";
            if (response.length == 0) {
                var no_items = document.createElement("div");
                no_items.className = "no_more_posts";
                no_items.innerText = "No results matched your search :(";
                select("id", "search_page").js_object.appendChild(no_items);
            } else {
                add_posts_to_element(response, select("id", "search_page"), true);
            }
        }
    });
}