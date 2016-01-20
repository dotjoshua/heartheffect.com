<?php

require_once "../../utilities/database.php";
require_once "../../utilities/auth.php";
require_once "auth.php";
require_once "database.php";

$rest_json = file_get_contents("php://input");
$_POST = json_decode($rest_json, true);

$token = check_auth_token($_POST["token"], $DB_PASSWD);

if ($token) {
    $response = array(
        "response" => query("INSERT INTO Posts (title, content, date, author, category, tags) VALUES('"
            .$_POST["title"]."', '"
            .$_POST["content"]."', '"
            .$_POST["date"]."', '"
            .$_POST["author"]."', '"
            .$_POST["category"]."', '"
            .$_POST["tags"]."')", $DB_PASSWD, true),
        "token" => $token
    );
    echo json_encode($response);
} else {
    echo json_encode(array("error" => "Authentication error."));
}