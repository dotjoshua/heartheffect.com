<?php

require "../../utilities/database.php";
require "../../utilities/auth.php";
require "auth.php";

$id = preg_replace("/[^0-9]+/", "", $_GET["post_id"]);

echo query("SELECT * FROM posts WHERE id = ".$id, $DB_PASSWD, false);