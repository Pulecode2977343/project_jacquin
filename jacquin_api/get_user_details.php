<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';

$id_usuario = isset($_GET['id']) ? intval($_GET['id']) : 0;

$result = [
    'user_info' => null,
    'enrolled' => [],
    'teaching' => [],
    'functions' => [],
    'pending' => []
];

if ($id_usuario > 0) {
    try {
        // 1. User Info
        $stmt = $pdo->prepare("SELECT id_usuario, full_name, email, n_phone, avatar_url, id_rol FROM usuario WHERE id_usuario = ?");
        $stmt->execute([$id_usuario]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $result['user_info'] = $user;

            // 2. Enrollments (Student) - MULTI-SCHEDULE SUPPORT
            $stmtEnroll = $pdo->prepare("
                SELECT 
                    e.id_enrollment, 
                    e.course_id as id_course, 
                    c.course_name as course_name, 
                    e.status,
                    s.day,
                    s.time_start,
                    s.time_end,
                    s.id_schedule,
                    u_prof.full_name as teacher_name,
                    u_prof.id_rol as teacher_role
                FROM enrollments e
                LEFT JOIN courses c ON e.course_id = c.id_course
                LEFT JOIN enrollment_schedules es ON e.id_enrollment = es.enrollment_id
                LEFT JOIN schedules s ON es.schedule_id = s.id_schedule
                LEFT JOIN usuario u_prof ON s.teacher_id = u_prof.id_usuario
                WHERE e.student_id = ? AND e.status IN ('Activo', 'Pendiente', 'Pre-inscrito')
                ORDER BY e.id_enrollment DESC, s.day
            ");
            $stmtEnroll->execute([$id_usuario]);
            $enrollRows = $stmtEnroll->fetchAll(PDO::FETCH_ASSOC);

            $enrollMap = [];
            foreach ($enrollRows as $row) {
                $eId = $row['id_enrollment'];

                if (!isset($enrollMap[$eId])) {
                    $tName = $row['teacher_name'];
                    if (!$tName || $row['teacher_role'] == 1) {
                        $tName = 'Por asignar';
                    }

                    $enrollMap[$eId] = [
                        'id_enrollment' => (int) $eId,
                        'id_course' => (int) $row['id_course'],
                        'name' => $row['course_name'],
                        'status' => $row['status'],
                        'teacher_name' => $tName,
                        'id_schedule' => $row['id_schedule'] ? (int) $row['id_schedule'] : null,
                        'schedules' => []
                    ];
                }

                if ($row['id_schedule']) {
                    $exists = false;
                    foreach ($enrollMap[$eId]['schedules'] as $sch) {
                        if ($sch['id_schedule'] == $row['id_schedule']) {
                            $exists = true;
                            break;
                        }
                    }

                    if (!$exists) {
                        $schTeacher = $row['teacher_name'];
                        if (!$schTeacher || $row['teacher_role'] == 1) {
                            $schTeacher = 'Por asignar';
                        }
                        $enrollMap[$eId]['schedules'][] = [
                            'id_schedule' => (int) $row['id_schedule'],
                            'day_of_week' => $row['day'],
                            'start_time' => $row['time_start'],
                            'end_time' => $row['time_end'],
                            'teacher_name' => $schTeacher
                        ];
                    }

                    if (!$enrollMap[$eId]['id_schedule']) {
                        $enrollMap[$eId]['id_schedule'] = (int) $row['id_schedule'];
                    }
                }
            }

            foreach ($enrollMap as $item) {
                if ($item['status'] === 'Activo') {
                    $result['enrolled'][] = $item;
                } else {
                    $result['pending'][] = $item;
                }
            }

            // 3. Teaching (Teacher) - Optimized join and grouping
            if ($user['id_rol'] == 2) {
                $stmtTeach = $pdo->prepare("
                    SELECT 
                        c.id_course,
                        c.course_name,
                        s.id_schedule,
                        s.day,
                        s.time_start,
                        s.time_end,
                        s.quota,
                        (SELECT COUNT(*) FROM enrollment_schedules es 
                         JOIN enrollments e ON es.enrollment_id = e.id_enrollment
                         WHERE es.schedule_id = s.id_schedule AND e.status = 'Activo') as student_count
                    FROM courses c
                    LEFT JOIN schedules s ON c.id_course = s.id_course
                    LEFT JOIN schedule_teachers st ON s.id_schedule = st.id_schedule
                    WHERE c.teacher_id = ? OR s.teacher_id = ? OR st.id_teacher = ?
                    ORDER BY c.course_name ASC, s.day, s.time_start ASC
                ");
                $stmtTeach->execute([$id_usuario, $id_usuario, $id_usuario]);
                $teachingRaw = $stmtTeach->fetchAll(PDO::FETCH_ASSOC);

                $coursesMap = [];
                foreach ($teachingRaw as $t) {
                    $cid = $t['id_course'];
                    if (!isset($coursesMap[$cid])) {
                        $coursesMap[$cid] = [
                            'id_course' => (int) $cid,
                            'name' => $t['course_name'],
                            'schedules' => [],
                            'total_students' => 0
                        ];
                    }

                    if ($t['id_schedule']) {
                        $sCount = (int) $t['student_count'];
                        $coursesMap[$cid]['schedules'][] = [
                            'id_schedule' => (int) $t['id_schedule'],
                            'day_of_week' => $t['day'],
                            'start_time' => $t['time_start'],
                            'end_time' => $t['time_end'],
                            'quota' => (int) $t['quota'],
                            'student_count' => $sCount
                        ];
                        $coursesMap[$cid]['total_students'] += $sCount;
                    }
                }
                $result['teaching'] = array_values($coursesMap);
            }

        }

        echo json_encode(["success" => true, "data" => $result]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "ID requerido."]);
}
?>