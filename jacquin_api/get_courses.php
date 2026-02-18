<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';

try {
    // 1. Fetch all courses
    $sql = "SELECT c.*, 
                   c.course_name as name,
                   GROUP_CONCAT(DISTINCT u.full_name SEPARATOR ', ') as teacher_name 
            FROM courses c 
            LEFT JOIN schedules s ON c.id_course = s.id_course
            LEFT JOIN schedule_teachers st ON s.id_schedule = st.id_schedule
            LEFT JOIN usuario u ON st.id_teacher = u.id_usuario
            GROUP BY c.id_course
            ORDER BY c.course_name ASC";

    $stmt = $pdo->query($sql);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($courses)) {
        echo json_encode(['success' => true, 'data' => []]);
        exit;
    }

    // 2. Fetch all schedules for these courses in ONE query
    $courseIds = array_column($courses, 'id_course');
    $placeholders = implode(',', array_fill(0, count($courseIds), '?'));
    
    $stmtSched = $pdo->prepare("SELECT s.* FROM schedules s WHERE s.id_course IN ($placeholders)");
    $stmtSched->execute($courseIds);
    $allSchedules = $stmtSched->fetchAll(PDO::FETCH_ASSOC);

    if (empty($allSchedules)) {
        foreach ($courses as &$c) { $c['schedules'] = []; }
        echo json_encode(['success' => true, 'data' => $courses]);
        exit;
    }

    // 3. Fetch all teachers for these schedules in ONE query
    $schedIds = array_column($allSchedules, 'id_schedule');
    $pSched = implode(',', array_fill(0, count($schedIds), '?'));

    $stmtT = $pdo->prepare("
        SELECT st.id_schedule, u.id_usuario as id, u.full_name as name
        FROM schedule_teachers st
        JOIN usuario u ON st.id_teacher = u.id_usuario
        WHERE st.id_schedule IN ($pSched)
    ");
    $stmtT->execute($schedIds);
    $allTeachers = $stmtT->fetchAll(PDO::FETCH_ASSOC);

    // Grouping
    $teachersMap = [];
    foreach ($allTeachers as $t) {
        $teachersMap[$t['id_schedule']][] = ['id' => $t['id'], 'name' => $t['name']];
    }

    $schedulesMap = [];
    foreach ($allSchedules as $s) {
        $s['teachers'] = isset($teachersMap[$s['id_schedule']]) ? $teachersMap[$s['id_schedule']] : [];
        $schedulesMap[$s['id_course']][] = $s;
    }

    foreach ($courses as &$course) {
        $course['schedules'] = isset($schedulesMap[$course['id_course']]) ? $schedulesMap[$course['id_course']] : [];
    }

    echo json_encode(['success' => true, 'data' => $courses]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>