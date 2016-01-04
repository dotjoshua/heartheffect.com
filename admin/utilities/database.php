<?php

require_once "../../utilities/database.php";

function check_auth_token($token, $db_passwd) {
    $hashed_token = hash("sha256", $token);

    query("DELETE FROM SessionTokens WHERE UNIX_TIMESTAMP(now()) - UNIX_TIMESTAMP(date_added) > 1800;", $db_passwd, true);
    $token_present = query("SELECT COUNT(1) AS num FROM SessionTokens WHERE hashed_token='".$hashed_token."'", $db_passwd, false);

    if (intval(json_decode($token_present)[0]->num) > 0) {
        query("DELETE FROM SessionTokens WHERE hashed_token='".$hashed_token."'", $db_passwd, true);
        return get_new_token($db_passwd);
    } else {
        return false;
    }
}

function check_password($password, $passwd_hash, $db_passwd) {
    if (hash("sha256", $password) != $passwd_hash) {
        return false;
    } else {
        return get_new_token($db_passwd);
    }
}

function get_new_token($db_passwd) {
    $token = bin2hex(openssl_random_pseudo_bytes(16));
    $hashed_token = hash("sha256", $token);
    query("INSERT INTO SessionTokens (hashed_token, date_added) VALUES ('".$hashed_token."', NOW())", $db_passwd, true);
    return $token;
}