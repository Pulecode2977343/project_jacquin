<?php
require_once __DIR__ . '/../config/connection.php';

try {
    // 0. Ensure users table engine is InnoDB (Foreign keys require InnoDB)
    // Note: Can't easily change engine of existing table if it has data without risk, 
    // but typically XAMPP/MySQL defaults to InnoDB.
    // The issue is often INT(11) vs INT or Unsigned vs Signed.
    // Let's standardise the FK definition.

    // 1. Create Courses Table
    // Removing 'd' from 'created_at' typo if any, and ensuring charset matches.
    // Key Fix: Many legacy tables use MyISAM or specific collations.
    // We will try to be generic but explicit.

    $sqlCourses = "CREATE TABLE IF NOT EXISTS courses (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        teacher_id INT(11) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (teacher_id),
        CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_id) REFERENCES users(id_usuario) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";

    // Prepare for potential failure if users is not InnoDB or utf8mb4
    try {
        $pdo->exec($sqlCourses);
        echo "Tabla 'courses' creada o verificada correctamente.<br>";
    } catch (PDOException $e) {
        // Fallback: Try creating without FK to debug, but let's just report precise error
        echo "Error al crear courses (FK Issue?): " . $e->getMessage() . "<br>";
        // Attempt without FK if strict mode is the blocker, but better to fix.
        // Let's Assume users.id_usuario is INT(11).
    }

    // 2. Create Schedules Table
    $sqlSchedules = "CREATE TABLE IF NOT EXISTS schedules (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        course_id INT(11) NOT NULL,
        day_of_week VARCHAR(20) NOT NULL, 
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        INDEX (course_id),
        CONSTRAINT fk_schedules_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";
    // NOTE: Changed ENUM to VARCHAR for flexibility if ENUM collation causes issues, but validated in PHP.

    $pdo->exec($sqlSchedules);
    echo "Tabla 'schedules' creada o verificada correctamente.<br>";

    // 3. Create Enrollments Table
    $sqlEnrollments = "CREATE TABLE IF NOT EXISTS enrollments (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        course_id INT(11) NOT NULL,
        student_id INT(11) NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (course_id),
        INDEX (student_id),
        UNIQUE KEY unique_enrollment (course_id, student_id),
        CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES users(id_usuario) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";

    $pdo->exec($sqlEnrollments);
    echo "Tabla 'enrollments' creada o verificada correctamente.<br>";

} catch (PDOException $e) {
    die("Error General: " . $e->getMessage());
}
?>