<?php
require_once __DIR__ . '/../config/connection.php';

try {
    // 1. Create Courses Table
    $sqlCourses = "CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        teacher_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id_usuario) ON DELETE SET NULL
    )";
    $pdo->exec($sqlCourses);
    echo "Tabla 'courses' creada o verificada correctamente.<br>";

    // 2. Create Schedules Table
    // Enforcing ENUM for days to strictly control allowed days
    $sqlSchedules = "CREATE TABLE IF NOT EXISTS schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        day_of_week ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado') NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )";
    $pdo->exec($sqlSchedules);
    echo "Tabla 'schedules' creada o verificada correctamente.<br>";

    // 3. Create Enrollments Table (Many-to-Many: Students <-> Courses)
    $sqlEnrollments = "CREATE TABLE IF NOT EXISTS enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        student_id INT NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id_usuario) ON DELETE CASCADE,
        UNIQUE KEY unique_enrollment (course_id, student_id)
    )";
    $pdo->exec($sqlEnrollments);
    echo "Tabla 'enrollments' creada o verificada correctamente.<br>";

} catch (PDOException $e) {
    die("Error al configurar la base de datos académica: " . $e->getMessage());
}
?>