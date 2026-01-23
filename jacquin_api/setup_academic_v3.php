<?php
require_once __DIR__ . '/../config/connection.php';

try {
    // 0. FORCE USERS TABLE TO INNODB (Fixes FK Issue if using MyISAM)
    // This is safe if the table is already InnoDB.
    $pdo->exec("ALTER TABLE users ENGINE=InnoDB");
    echo "Tabla 'users' convertida/verificada como InnoDB.<br>";

    // Also Ensure id_usuario is INT(11) (Just to be sure, though usually it is)
    // $pdo->exec("ALTER TABLE users MODIFY id_usuario INT(11) NOT NULL AUTO_INCREMENT"); 

    // 1. Create Courses Table
    $sqlCourses = "CREATE TABLE IF NOT EXISTS courses (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        teacher_id INT(11) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (teacher_id),
        CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_id) REFERENCES users(id_usuario) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";

    $pdo->exec($sqlCourses);
    echo "Tabla 'courses' creada o verificada correctamente.<br>";

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
    echo "Error Detallado: " . $e->getMessage();
}
?>