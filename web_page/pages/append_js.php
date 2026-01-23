<?php
$content = file_get_contents('c:/xampp/htdocs/jacquin_web/pages/js/dashboard_append.txt');
file_put_contents('c:/xampp/htdocs/jacquin_web/pages/js/dashboard.js', $content, FILE_APPEND);
echo "Appended successfully.";
?>