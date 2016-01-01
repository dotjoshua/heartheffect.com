<?php

function query($sql, $db_passwd, $no_response) {
    $servername = "localhost";
    $username = "ruffles_joshua";
    $db_name = "ruffles_hearth_effect";

    $conn = new mysqli($servername, $username, $db_passwd, $db_name);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $result = mysqli_query($conn, $sql);
    if ($no_response) return "";

    $response = array();
    while($row = $result->fetch_array(MYSQL_ASSOC)) {
        $response[] = $row;
    }
    $result->close();
    $conn->close();

    return json_encode($response);
}