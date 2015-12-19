<?php

require('auth.php');

$servername = "localhost";
$username = "ruffles_joshua";

$conn = new mysqli($servername, $username, $DB_PASSWD);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Connected successfully";