<?php

require_once "../../utilities/auth.php";
require_once "database.php";
require_once "auth.php";

$rest_json = file_get_contents("php://input");
$_POST = json_decode($rest_json, true);

echo json_encode(check_password($_POST['password'], $PASSWD_HASH, $DB_PASSWD));