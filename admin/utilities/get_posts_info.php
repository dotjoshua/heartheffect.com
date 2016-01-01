<?php

require "../../utilities/database.php";
require "../../utilities/auth.php";

echo query("SELECT id, title FROM Posts", $DB_PASSWD, false);