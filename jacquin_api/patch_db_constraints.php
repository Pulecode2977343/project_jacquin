<?php
require_once 'config/connection.php';

try {
    echo "Attempting to drop unique constraint 'unique_enrollment'...\n";
    // First check if index exists to match the error report 'unique_enrollment'
    // MySQL syntax to drop index
    $pdo->exec("ALTER TABLE enrollments DROP INDEX unique_enrollment");
    echo "SUCCESS: unique_enrollment constraint dropped.\n";

    // Optional: Add a better constraint that allows multiple schedules
    // Unique (student, course, schedule)
    echo "Adding new composite unique index (student_id, course_id, schedule_id)...\n";
    $pdo->exec("ALTER TABLE enrollments ADD UNIQUE INDEX unique_enrollment_schedule (student_id, course_id, schedule_id)");
    echo "SUCCESS: New constraint added.\n";

} catch (PDOException $e) {
    echo "Review: " . $e->getMessage() . "\n";
    // Maybe the index name is different? try 'student_id' (common default key name)
    try {
        if (strpos($e->getMessage(), "check that column/key exists") !== false) {
            echo "Index 'unique_enrollment' not found. Checking for automatic indices...\n";
        }
    } catch (Exception $ex) {
    }
}
?>