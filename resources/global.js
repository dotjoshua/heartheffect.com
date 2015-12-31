function alert(message, title, button, cancel, button_callback, cancel_callback) {
    message = (message == null) ? "" : message;
    title = (title == null) ? "" : title;
    button = (button == null) ? "ok" : button;
    button_callback = (button_callback == null) ? function() {close_alert()} : button_callback;
    cancel_callback = (cancel_callback == null) ? function() {close_alert()} : cancel_callback;
    cancel = (cancel == null) ? false : cancel;

    document.activeElement.blur();

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

        for (var i = 0; i < js_objects.length; i++) {
            elements.push(new ƪ(js_objects[i]));
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