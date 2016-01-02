<?php

require "database.php";
require "auth.php";

if (!is_numeric($_GET["start_id"])) {
    echo "Invalid start_id";
    exit;
}

if (!is_numeric($_GET["number"])) {
    echo "Invalid number";
    exit;
}

echo query("SELECT * FROM Posts WHERE id > ".$_GET['start_id']." LIMIT ".$_GET['number']."", $DB_PASSWD, false);