<?php
function filter_pages($var)
{
    return strcmp($var[0], ".");
}
echo json_encode(array_filter(scandir("../pages"), "filter_pages"));