<?php

require_once "../../utilities/database.php";
require_once "../../utilities/auth.php";
require_once "auth.php";

echo query("SELECT * FROM Images", $DB_PASSWD, false);