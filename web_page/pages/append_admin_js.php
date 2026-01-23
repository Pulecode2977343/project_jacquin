<?php
$content = file_get_contents('c:/xampp/htdocs/jacquin_web/pages/js/admin_academic_schedules_append.txt');
file_put_contents('c:/xampp/htdocs/jacquin_web/pages/js/admin_academic_schedules.js', $content, FILE_APPEND);
echo "Admin JS appended successfully.";
?>