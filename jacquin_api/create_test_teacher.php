<?php
require_once __DIR__ . '/config/connection.php';

try {
    // Crear hash para la contraseña '123456'
    $password = password_hash('123456', PASSWORD_DEFAULT);

    // Insertar o actualizar docente
    $stmt = $pdo->prepare("SELECT id_usuario FROM usuario WHERE email = 'profesor@jacquin.edu.co'");
    $stmt->execute();

    if ($stmt->rowCount() == 0) {
        // Crear docente
        $stmt2 = $pdo->prepare("INSERT INTO usuario (full_name, email, password, id_rol) VALUES (?, ?, ?, ?)");
        $stmt2->execute(['Profesor Demo', 'profesor@jacquin.edu.co', $password, 2]);
        $teacherId = $pdo->lastInsertId();
        echo "Docente creado: profesor@jacquin.edu.co<br>";
        echo "ID: $teacherId<br>";
    } else {
        // Actualizar password
        $stmt3 = $pdo->prepare("UPDATE usuario SET password = ?, id_rol = 2 WHERE email = 'profesor@jacquin.edu.co'");
        $stmt3->execute([$password]);
        $teacherId = $stmt->fetch(PDO::FETCH_COLUMN);
        echo "Docente actualizado: profesor@jacquin.edu.co<br>";
        echo "ID: $teacherId<br>";
    }

    // Asignarle un curso al docente
    $stmt4 = $pdo->prepare("SELECT id FROM courses LIMIT 1");
    $stmt4->execute();
    $courseId = $stmt4->fetch(PDO::FETCH_COLUMN);

    if ($courseId) {
        // Verificar si ya está asignado
        $stmt5 = $pdo->prepare("SELECT id FROM course_teachers WHERE course_id = ? AND teacher_id = ?");
        $stmt5->execute([$courseId, $teacherId]);

        if ($stmt5->rowCount() == 0) {
            $stmt6 = $pdo->prepare("INSERT INTO course_teachers (course_id, teacher_id) VALUES (?, ?)");
            $stmt6->execute([$courseId, $teacherId]);
            echo "Curso asignado al docente<br>";
        }
    }

    echo "<br><strong>Credenciales:</strong><br>";
    echo "Email: profesor@jacquin.edu.co<br>";
    echo "Password: 123456";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>