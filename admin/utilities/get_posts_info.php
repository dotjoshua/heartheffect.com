<?php

require_once "../../utilities/database.php";
require_once "../../utilities/auth.php";

echo query("SELECT id, title FROM Posts ORDER BY date DESC, id DESC", $DB_PASSWD, false);