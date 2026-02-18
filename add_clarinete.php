<?php
require_once 'jacquin_api/config/connection.php';
try {
    // Check if Clarinete exists
    $stmt = $pdo->prepare("SELECT id_course FROM courses WHERE course_name = ?");
    $stmt->execute(['Clarinete']);
    if ($stmt->fetch()) {
        echo "Course 'Clarinete' already exists.\n";
    } else {
        $stmt = $pdo->prepare("INSERT INTO courses (course_name, description, image_url) VALUES (?, ?, ?)");
        $stmt->execute(['Clarinete', 'Aprende a tocar el clarinete con expertos.', 'clarinete.jpg']);
        echo "Course 'Clarinete' added successfully.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
