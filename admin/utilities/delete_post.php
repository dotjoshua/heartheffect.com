<?php

require "../../utilities/database.php";
require "../../utilities/auth.php";
require "auth.php";

$rest_json = file_get_contents("php://input");
$_POST = json_decode($rest_json, true);

if (hash("sha256", $_POST["auth"]) != $PASSWD_HASH) {
    echo "auth_error";
} else {
    echo query("DELETE FROM posts WHERE id=".$_POST['post_id'], $DB_PASSWD, false);
}