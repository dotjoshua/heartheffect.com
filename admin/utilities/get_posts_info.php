<?php

require "../../utilities/database.php";
require "../../utilities/auth.php";

echo query("SELECT id, title FROM Posts ORDER BY date DESC, id DESC", $DB_PASSWD, false);