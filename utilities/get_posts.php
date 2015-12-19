<?php

require('auth.php');

if (!is_numeric($_GET["start_id"])) {
    echo "Invalid start_id";
    exit;
}

if (!is_numeric($_GET["number"])) {
    echo "Invalid number";
    exit;
}

$servername = "localhost";
$username = "ruffles_joshua";
$db_name = "ruffles_hearth_effect";

$conn = new mysqli($servername, $username, $DB_PASSWD, $db_name);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$result = mysqli_query($conn, "SELECT * FROM Posts WHERE id > ".$_GET['start_id']." LIMIT ".$_GET['number']);

$response = array();
while($row = $result->fetch_array(MYSQL_ASSOC)) {
    $response[] = $row;
}
echo json_encode($response);

$result->close();
$conn->close();