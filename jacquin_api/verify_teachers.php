<?php
include_once 'config/connection.php';
header('Content-Type: text/plain');

echo "--- Teachers (Role 2) ---\n";
$stmt = $pdo->query("SELECT id_usuario, full_name FROM usuario WHERE id_rol = 2");
$teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($teachers);

echo "\n--- Course Teachers ---\n";
$stmt2 = $pdo->query("SELECT id_course, course_name, teacher_id FROM courses");
$courses = $stmt2->fetchAll(PDO::FETCH_ASSOC);
print_r($courses);

echo "\n--- Schedule Teachers ---\n";
$stmt3 = $pdo->query("SELECT id_schedule, id_course, teacher_id FROM schedules WHERE teacher_id IS NOT NULL");
print_r($stmt3->fetchAll(PDO::FETCH_ASSOC));
?>