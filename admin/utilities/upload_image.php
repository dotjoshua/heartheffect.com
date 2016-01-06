<?php

require_once "../../utilities/database.php";
require_once "../../utilities/auth.php";
require_once "auth.php";
require_once "database.php";

$image = file_get_contents("php://input");
$filename = preg_replace("/[^A-Za-z0-9.-_() ]+/", "", $_SERVER['HTTP_X_FILE_NAME']);

$allowed_extensions = array("tiff", "jpg", "jpeg", "gif", "png", "bmp");
$extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

$token_given = NULL;
foreach (apache_request_headers() as $header => $value) {
    if (strcmp($header, "Token") == 0) {
        $token_given = $value;
    }
}
if (!$token_given) {
    echo json_encode(array("error" => "Authentication error."));
    return;
}

if (!in_array($extension, $allowed_extensions)) {
    echo json_encode(array("error" => "This type of file extension is not allowed. (Talk to Joshua about it maybe?)"));
    return;
}

$token = check_auth_token($token_given, $DB_PASSWD);

if ($token) {
    $image_url = base_convert(strval(time()), 10, 36 ).bin2hex(openssl_random_pseudo_bytes(16)).".".$extension;
    file_put_contents("../../images/" . $image_url, $image);

    query("INSERT INTO Images (image_url, image_low_res_url, image_name) VALUES ('"
        .$image_url."', '', '".$filename."')", $DB_PASSWD, true);

    $response = array(
        "response" => array(
            "image_url" => $image_url,
            "image_low_res_url" => "",
            "image_name" => $filename
        ),
        "token" => $token
    );
    echo json_encode($response);
} else {
    echo json_encode(array("error" => "Authentication error."));
}



