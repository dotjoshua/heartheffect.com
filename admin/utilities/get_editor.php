<?php
require "auth.php";

if (hash("sha256", $_GET["auth"]) != $PASSWD_HASH) {
    echo "auth_error";
} else {
    echo "editor";
}