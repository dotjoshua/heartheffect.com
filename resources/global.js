function alert(message, title, properties) {
    properties = (properties == null) ? {} : properties;
    message = (message == null) ? "" : message;
    title = (title == null) ? "" : title;

    var button_text = properties.button_text;
    var show_cancel = properties.show_cancel;
    var button_callback = properties.button_callback;
    var cancel_callback = properties.cancel_callback;
    var cancel_button_text = properties.cancel_button_text;

    button_text = (button_text == undefined) ? "ok" : button_text;
    button_callback = (button_callback == undefined) ? function() {close_alert()} : button_callback;
    cancel_callback = (cancel_callback == undefined) ? function() {close_alert()} : cancel_callback;
    show_cancel = (show_cancel == undefined) ? false : show_cancel;
    cancel_button_text = (cancel_button_text == undefined) ? "cancel" : cancel_button_text;

    document.activeElement.blur();

    select("id", "alert_message").js_object.innerHTML = message;
    select("id", "alert_title").js_object.innerHTML = title;
    select("id", "alert_button").js_object.innerHTML = button_text;
    select("id", "alert_cancel").js_object.innerHTML = cancel_button_text;
    if (show_cancel) {
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

    select("id", "content").add_class("blurred");
}

function close_alert() {
    select("id", "alert_container").add_class("transparent");
    setTimeout(function() {
        select("id", "alert_container").add_class("display_none");
    }, 500);

    select("id", "content").remove_class("blurred");
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

function get(url, data, json_parse, callback) {
    if (json_parse == undefined) json_parse = true;
    if (callback == undefined) callback = function(result) {};

    var param_string =  "?";
    var prefix = "";
    for (var property in data) {
        if (data.hasOwnProperty(property)) {
            param_string += prefix + property + "=" + encodeURIComponent(data[property]);
        }
        prefix = "&";
    }

    var request = new XMLHttpRequest();
    request.open("GET", url + param_string, true);
    request.onloadend = function() {
        if (json_parse) {
            var result;
            try {
                result = JSON.parse(request.responseText);
            } catch (ex) {
                result = {"error": request.responseText};
            }
            callback(result);
        } else {
            callback(request.responseText);
        }
    };
    request.send();
}

function post(url, data, json_parse, callback) {
    if (json_parse == undefined) json_parse = true;
    if (callback == undefined) callback = function(result) {};

    var request = new XMLHttpRequest();
    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.onloadend = function() {
        if (json_parse) {
            var result;
            try {
                result = JSON.parse(request.responseText);
            } catch (ex) {
                result = {"error": request.responseText};
            }
            callback(result);
        } else {
            callback(request.responseText);
        }
    };
    request.send(JSON.stringify(data));
}
