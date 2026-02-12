<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Handle CLI vs Web pathing
// Hardcoded XAMPP path for this one-off script
require_once __DIR__ . '/config/connection.php';

// 1. Reset Table (Force Clean State - Requested by User "Assign All")
try {
    // Drop logic ENABLED to fix schema issues
    $pdo->exec("DROP TABLE IF EXISTS schedules");

    // Better: Ensure Table Exists
    $sqlTable = "CREATE TABLE IF NOT EXISTS schedules (
        id_schedule INT AUTO_INCREMENT PRIMARY KEY,
        id_course INT NOT NULL,
        day VARCHAR(20) NOT NULL,
        time_start TIME NOT NULL,
        time_end TIME NOT NULL,
        quota INT DEFAULT 20,
        FOREIGN KEY (id_course) REFERENCES courses(id_course),
        UNIQUE KEY unique_schedule (id_course, day, time_start)
    )";
    $pdo->exec($sqlTable);

} catch (PDOException $e) {
    die(json_encode(["error" => "Table creation failed: " . $e->getMessage()]));
}

// 2. Get All Courses
$courses = [];
try {
    $stmt = $pdo->query("SELECT id_course, course_name FROM courses");
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die(json_encode(["error" => "Courses fetch failed: " . $e->getMessage()]));
}

$schedulesCreated = 0;

// 3. Loop and Assign Schedules
foreach ($courses as $course) {
    $cid = $course['id_course'];

    // Add 3 Default Options (Mon/Wed, Tue/Thu, Sat)
    $defaults = [
        ['Lunes y Miércoles', '10:00:00', '12:00:00'],
        ['Martes y Jueves', '14:00:00', '16:00:00'],
        ['Sábados', '09:00:00', '12:00:00']
    ];

    $stmtInsert = $pdo->prepare("INSERT INTO schedules (id_course, day, time_start, time_end) VALUES (?, ?, ?, ?)");

    foreach ($defaults as $sch) {
        try {
            $stmtInsert->execute([$cid, $sch[0], $sch[1], $sch[2]]);
            $schedulesCreated++;
        } catch (PDOException $ex) {
            // Ignore duplicate errors if they somehow occur
        }
    }
}

echo json_encode([
    "success" => true,
    "message" => "Proceso completado.",
    "schedules_created" => $schedulesCreated,
    "total_courses" => count($courses)
]);
?>