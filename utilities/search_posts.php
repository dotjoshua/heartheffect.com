<?php

require "database.php";
require "auth.php";

$query = preg_replace("/[^a-zA-Z0-9]+/", "", $_GET["query"]);

echo query("SELECT DISTINCT id, title, content, author, date FROM Posts WHERE content LIKE '%".$query."%' OR title LIKE'%".$query."%'", $DB_PASSWD, false);