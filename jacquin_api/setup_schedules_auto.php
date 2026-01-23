<?php
include 'config/connection.php';

echo "<h1>Generando Horarios Automáticos...</h1>";

try {
    // 1. Limpiar tabla actual (Opcional, pero recomendado para evitar duplicados masivos)
    $pdo->exec("TRUNCATE TABLE schedules");
    echo "<p>- Tabla 'schedules' limpiada.</p>";

    // 2. Obtener cursos
    $stmt = $pdo->query("SELECT id_course, course_name FROM courses");
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($courses) == 0) {
        die("No hay cursos para generar horarios.");
    }

    echo "<p>- Encontrados " . count($courses) . " cursos.</p>";

    // Definición de Bloques
    $slotsWeek = [
        ['start' => '15:00:00', 'end' => '15:45:00'],
        ['start' => '15:45:00', 'end' => '16:30:00'],
        ['start' => '16:30:00', 'end' => '17:15:00'],
        ['start' => '17:15:00', 'end' => '18:00:00']
    ];

    $slotsSat = [
        ['start' => '09:00:00', 'end' => '09:45:00'],
        ['start' => '09:45:00', 'end' => '10:30:00'],
        ['start' => '10:30:00', 'end' => '11:15:00'],
        ['start' => '11:15:00', 'end' => '12:00:00']
    ];

    $daysWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    $quota = 15;
    $count = 0;

    $sql = "INSERT INTO schedules (id_course, day, time_start, time_end, quota) VALUES (?, ?, ?, ?, ?)";
    $insert = $pdo->prepare($sql);

    foreach ($courses as $course) {
        $courseId = $course['id_course'];

        // Lunes a Viernes
        foreach ($daysWeek as $day) {
            foreach ($slotsWeek as $slot) {
                $insert->execute([$courseId, $day, $slot['start'], $slot['end'], $quota]);
                $count++;
            }
        }

        // Sábados
        foreach ($slotsSat as $slot) {
            $insert->execute([$courseId, 'Sábado', $slot['start'], $slot['end'], $quota]);
            $count++;
        }
    }

    echo "<h3>¡Éxito! Se generaron $count horarios.</h3>";
    echo "<p>Configuración: L-V (15:00-18:00) y Sab (09:00-12:00), sesiones de 45m, cupo 15.</p>";

} catch (Exception $e) {
    echo "<h3>Error Crítico: " . $e->getMessage() . "</h3>";
}
?>