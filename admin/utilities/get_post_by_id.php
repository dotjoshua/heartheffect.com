<?php

require_once "../../utilities/database.php";
require_once "../../utilities/auth.php";
require_once "auth.php";

$id = preg_replace("/[^0-9]+/", "", $_GET["post_id"]);

echo query("SELECT * FROM Posts WHERE id = ".$id, $DB_PASSWD, false);