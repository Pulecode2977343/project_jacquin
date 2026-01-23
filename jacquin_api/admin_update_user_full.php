<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';
require_once __DIR__ . '/config/mail_helper.php';

header('Content-Type: application/json');
error_reporting(0);
ini_set('display_errors', 0);

$data = json_decode(file_get_contents("php://input"), true);
file_put_contents(__DIR__ . '/debug_update_v2.txt', print_r($data, true));
// DEBUG LOG
file_put_contents(__DIR__ . '/debug_update_request.txt', print_r($data, true));

if (!isset($data['id_usuario'])) {
    echo json_encode(['success' => false, 'message' => 'ID de usuario requerido']);
    exit;
}

$id = $data['id_usuario'];
$fullName = $data['full_name'];
$email = $data['email'];
$phone = $data['n_phone'];
$roleId = $data['id_rol'];
$avatarAction = $data['avatar_action'] ?? 'keep'; // keep, delete, update (url provided)
$avatarUrl = $data['avatar_url'] ?? null;

try {
    // 1. Get Old Data for Notification Comparison
    $stmtOld = $pdo->prepare("SELECT * FROM usuario WHERE id_usuario = ?");
    $stmtOld->execute([$id]);
    $oldUser = $stmtOld->fetch(PDO::FETCH_ASSOC);

    if (!$oldUser) {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
        exit;
    }

    // 2. Build Query
    $query = "UPDATE usuario SET full_name = ?, email = ?, n_phone = ?, id_rol = ?";
    $params = [$fullName, $email, $phone, $roleId];

    if ($avatarAction === 'delete') {
        $query .= ", avatar_url = NULL";
    } elseif ($avatarAction === 'update' && $avatarUrl) {
        $query .= ", avatar_url = ?";
        $params[] = $avatarUrl;
    }

    $query .= " WHERE id_usuario = ?";
    $params[] = $id;

    $stmt = $pdo->prepare($query);

    if ($stmt->execute($params)) {
        // 3. Send Notification
        $changes = [];
        if ($oldUser['full_name'] != $fullName)
            $changes[] = "Nombre cambiado a $fullName";
        if ($oldUser['email'] != $email)
            $changes[] = "Email cambiado a $email";
        if ($oldUser['n_phone'] != $phone)
            $changes[] = "Teléfono cambiado a $phone";
        if ($oldUser['id_rol'] != $roleId)
            $changes[] = "Rol actualizado";
        if ($avatarAction !== 'keep')
            $changes[] = "Avatar actualizado";

        if (count($changes) > 0) {
            try {
                $subject = "Actualización de Perfil - JACQUIN";
                $body = "Hola $fullName,<br><br>Un administrador ha actualizado tu perfil:<br><ul>";
                foreach ($changes as $c)
                    $body .= "<li>$c</li>";
                $body .= "</ul><br>Si no reconoces estos cambios, contacta a soporte.";

                sendEmailNotification($oldUser['email'], $subject, $body); // Send to OLD email just in case
                if ($oldUser['email'] != $email) {
                    sendEmailNotification($email, $subject, $body); // And new email
                }
            } catch (Exception $mailEx) {
                // Ignore mail errors, just log them
                error_log("Mail Error: " . $mailEx->getMessage());
            }
        }

        echo json_encode(['success' => true, 'message' => 'Usuario actualizado y notificado']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar DB']);
    }

} catch (PDOException $e) {
    if ($e->getCode() == 23000) { // Integrity constraint (duplicate email)
        echo json_encode(['success' => false, 'message' => 'El email ya está en uso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error SQL: ' . $e->getMessage()]);
    }
}
?>