<?php
// register.php
ob_start();
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);

header('Content-Type: application/json');

// Limpiar cualquier output previo
if (ob_get_length()) ob_clean();

try {
    // Configuración
    require_once __DIR__ . '/config/cors.php';
    require_once __DIR__ . '/config/connection.php';
    // Load env first if needed
    if (file_exists(__DIR__ . '/config/env_loader.php')) {
        require_once __DIR__ . '/config/env_loader.php';
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // Leer JSON Input
    $input = json_decode(file_get_contents('php://input'), true);

    // Si viene por FormData (lo cual register.js no parece usar, pero por si acaso)
    if (!$input) {
        $input = $_POST;
    }

    $fullName = $input['fullName'] ?? '';
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $phone = $input['nPhone'] ?? '';

    // Validaciones básicas
    if (empty($fullName) || empty($email) || empty($password)) {
        throw new Exception('Faltan datos obligatorios');
    }

    // Validar si usuario ya existe
    $stmtCheck = $pdo->prepare("SELECT id_usuario FROM usuario WHERE email = ?");
    $stmtCheck->execute([$email]);
    if ($stmtCheck->rowCount() > 0) {
        throw new Exception('El correo electrónico ya está registrado.');
    }

    // Hash Password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Rol por defecto: 4 (Estudiante)
    $defaultRole = 4;

    // Insertar Usuario
    $sql = "INSERT INTO usuario (full_name, email, password, n_phone, id_rol) VALUES (?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);

    if ($stmt->execute([$fullName, $email, $hashedPassword, $phone, $defaultRole])) {
        $newUserId = $pdo->lastInsertId();
        $idCourse = $input['idCourse'] ?? null;

        // 1. Create PRE-ENROLLMENT if course selected
        if ($idCourse && is_numeric($idCourse)) {
            $enrollStmt = $pdo->prepare("INSERT INTO enrollments (student_id, course_id, status) VALUES (?, ?, 'Pre-inscrito')");
            $enrollStmt->execute([$newUserId, $idCourse]);

            // Get Course Name for email
            $cStmt = $pdo->prepare("SELECT course_name FROM courses WHERE id_course = ?");
            $cStmt->execute([$idCourse]);
            $course = $cStmt->fetch(PDO::FETCH_ASSOC);
            $courseName = $course ? $course['course_name'] : "Programa seleccionado";
        }

        // 2. SEND NOTIFICATIONS
        try {
            require_once __DIR__ . '/services/EmailService.php';
            $emailService = new EmailService();

            // Welcome Email
            $emailService->sendWelcomeEmail($email, $fullName);

            // Specific Pre-enrollment Emails
            if ($idCourse) {
                $emailService->sendPreEnrollmentConfirmationStudent($email, $fullName, $courseName);
                $emailService->sendPreEnrollmentNotificationAdmin($fullName, $email, $courseName, $phone);
            }
        } catch (Exception $emailError) {
            error_log("Error enviando emails en registro: " . $emailError->getMessage());
        }

        // 3. AUDIT LOG
        try {
            require_once __DIR__ . '/helpers/audit_helper.php';
            logAudit($pdo, 'register', 'user', $newUserId, [
                'full_name' => $fullName,
                'email' => $email,
                'course_interested' => $courseName ?? 'None'
            ]);
        } catch (Exception $auditError) {
            error_log("Error en auditoría durante registro: " . $auditError->getMessage());
        }

        echo json_encode(['success' => true, 'message' => 'Usuario registrado exitosamente']);
    } else {
        throw new Exception('Error al guardar en base de datos');
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
ob_end_flush();
