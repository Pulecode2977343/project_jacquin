<?php
require_once 'config/connection.php';

try {
    // Migrate existing enrollments to enrollment_schedules
    $result = $pdo->exec("
        INSERT IGNORE INTO enrollment_schedules (enrollment_id, schedule_id) 
        SELECT id_enrollment, schedule_id 
        FROM enrollments 
        WHERE schedule_id IS NOT NULL
    ");
    echo "Migration complete. Rows affected: " . $result . "\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>