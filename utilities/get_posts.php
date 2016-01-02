<?php

require "database.php";
require "auth.php";

$date = preg_replace("/[^a-zA-Z0-9-]+/", "", $_GET["date"]);

echo query("SELECT id, title, date from posts WHERE date = (SELECT date FROM (SELECT * from posts ORDER BY date DESC) as all_posts WHERE date < DATE('".$date."') LIMIT 1)", $DB_PASSWD, false);