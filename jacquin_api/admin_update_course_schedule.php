<?php
include_once 'helpers/cors_helper.php';
handleCors();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

include_once 'config/connection.php';
require_once 'helpers/auth_helper.php';
require_once 'helpers/audit_helper.php';
require_once 'helpers/conflict_helper.php';

validateAdmin();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->course_id) || !isset($data->day) || !isset($data->time_start) || !isset($data->time_end)) {
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
    exit;
}

// --- NORMALIZACIÓN Y VALIDACIÓN DE HORAS ACTIVAS ---
$day = $data->day;
$startTime = $data->time_start;
$endTime = $data->time_end;

// Normalizar a HH:mm:ss para comparaciones seguras de cadenas
if (strlen($startTime) == 5) $startTime .= ":00";
if (strlen($endTime) == 5) $endTime .= ":00";

// Soporte para índices numéricos (1-6) para máxima compatibilidad de codificación
$dayInput = $data->day;
$daysTable = [
    1 => 'Lunes', 
    2 => 'Martes', 
    3 => 'Mi' . "\xc3\xa9" . 'rcoles', 
    4 => 'Jueves', 
    5 => 'Viernes', 
    6 => 'S' . "\xc3\xa1" . 'bado'
];

if (is_numeric($dayInput) && isset($daysTable[(int)$dayInput])) {
    $day = $daysTable[(int)$dayInput];
} else {
    $day = $dayInput;
    // Fallback de normalización robusta para strings
    if (stripos($day, 'iercoles') !== false) $day = 'Miercoles';
    elseif (stripos($day, 'abado') !== false) $day = 'Sabado';
}

$isWeekday = in_array($day, ['Lunes', 'Martes', 'Miércoles', 'Miercoles', 'Jueves', 'Viernes']);
$isSaturday = ($day === 'Sábado' || $day === 'Sabado');
if ($isWeekday) {
    // 15:00:00 <= $startTime y $endTime <= 18:00:00
    if ($startTime < '15:00:00' || $endTime > '18:00:00') {
        echo json_encode(["success" => false, "message" => "De Lunes a Viernes solo se permiten horarios entre las 15:00 y las 18:00."]);
        exit;
    }
} elseif ($isSaturday) {
    if ($startTime < '09:00:00' || $endTime > '12:00:00') {
        echo json_encode(["success" => false, "message" => "Los Sábados solo se permiten horarios entre las 09:00 y las 12:00."]);
        exit;
    }
} else {
    echo json_encode(["success" => false, "message" => "Solo se permiten registros de Lunes a Sábado en las horas activas."]);
    exit;
}

if ($startTime >= $endTime) {
    echo json_encode(["success" => false, "message" => "La hora de inicio debe ser menor a la hora de fin."]);
    exit;
}
// ------------------------------------

try {
    $quota = isset($data->quota) ? intval($data->quota) : 15;
    // Handle id_docente or id_usuario depending on what frontend sends
    $teacherId = !empty($data->id_docente) ? intval($data->id_docente) : ( !empty($data->id_usuario) ? intval($data->id_usuario) : null );

    // --- TEACHER CONFLICT CHECK ---
    if ($teacherId) {
        $excludeId = (isset($data->id_schedule) && $data->id_schedule > 0) ? (int)$data->id_schedule : 0;
        
        // Usamos el índice numérico para la validación de conflictos (más seguro)
        $dayIndex = (int)$data->day; 
        
        $conflict = checkTeacherTimeConflict($pdo, (int)$teacherId, $dayIndex, $startTime, $endTime, $excludeId);
        
        if ($conflict['status'] === 'error') {
            echo json_encode(["success" => false, "message" => $conflict['message']]);
            exit;
        }
    }

    if (isset($data->id_schedule) && $data->id_schedule > 0) {
        // UPDATE
        $dayIndex = (int)$data->day;
        $stmt = $pdo->prepare("UPDATE schedules SET day_of_week = ?, start_time = ?, end_time = ?, max_students = ?, teacher_id = ? WHERE id_schedule = ?");
        $stmt->execute([$dayIndex, $startTime, $endTime, $quota, $teacherId, $data->id_schedule]);

        // Sync with schedule_teachers junction table (Modern mapping)
        $pdo->prepare("DELETE FROM schedule_teachers WHERE id_schedule = ?")->execute([$data->id_schedule]);
        if ($teacherId) {
            $pdo->prepare("INSERT INTO schedule_teachers (id_schedule, id_teacher) VALUES (?, ?)")->execute([$data->id_schedule, $teacherId]);
        }

        // Audit Log
        logAudit($pdo, 'update', 'schedule', $data->id_schedule, [
            'course_id' => $data->course_id,
            'day' => $day,
            'time' => $startTime . ' - ' . $endTime,
            'quota' => $quota
        ]);

        echo json_encode(["success" => true, "message" => "Horario actualizado."]);
    } else {
        // INSERT
        // PERSISTENCIA: Usamos el índice numérico directamente para el ENUM (1=Lunes, 2=Martes, 3=Miércoles, etc.)
        // Esto evita errores de acentos y codificación al 100%.
        $dayIndex = (int)$data->day; 

        $stmt = $pdo->prepare("INSERT INTO schedules (course_id, day_of_week, start_time, end_time, max_students, teacher_id) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$data->course_id, $dayIndex, $startTime, $endTime, $quota, $teacherId]);
        $newId = $pdo->lastInsertId();

        if ($teacherId && $newId) {
            $pdo->prepare("INSERT INTO schedule_teachers (id_schedule, id_teacher) VALUES (?, ?)")->execute([$newId, $teacherId]);
        }

        // Audit Log
        logAudit($pdo, 'create', 'schedule', $newId, [
            'course_id' => $data->course_id,
            'day' => $day,
            'time' => $startTime . ' - ' . $endTime,
            'quota' => $quota
        ]);

        echo json_encode([
            "success" => true, 
            "message" => "Nuevo horario creado.",
            "debug" => [
                "raw_day" => $dayInput,
                "is_numeric" => is_numeric($dayInput),
                "processed_day" => $day,
                "startTime" => $startTime,
                "endTime" => $endTime
            ]
        ]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
}
?>