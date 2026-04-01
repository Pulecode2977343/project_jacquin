<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';
require_once __DIR__ . '/helpers/auth_helper.php';
require_once __DIR__ . '/helpers/audit_helper.php';
require_once __DIR__ . '/config/mail_helper.php';

validateAdmin();

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id_usuario'])) {
    echo json_encode(['success' => false, 'message' => 'ID de usuario requerido']);
    exit;
}

$id = $data['id_usuario'];
$fullName = $data['full_name'];
$email = $data['email'];
$phone = $data['n_phone'];
$roleId = $data['id_rol'];
$avatarAction = $data['avatar_action'] ?? 'keep'; 
$avatarUrl = $data['avatar_url'] ?? null;

try {
    $stmtOld = $pdo->prepare("SELECT * FROM usuario WHERE id_usuario = ?");
    $stmtOld->execute([$id]);
    $oldUser = $stmtOld->fetch(PDO::FETCH_ASSOC);

    if (!$oldUser) {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
        exit;
    }

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
        $changes = [];
        if ($oldUser['full_name'] != $fullName) $changes[] = "Nombre a $fullName";
        if ($oldUser['email'] != $email) $changes[] = "Email a $email";
        if ($oldUser['n_phone'] != $phone) $changes[] = "Teléfono a $phone";
        
        if ($oldUser['id_rol'] != $roleId) {
            $stmtRol = $pdo->prepare("SELECT nombre_rol FROM rol WHERE id_rol = ?");
            $stmtRol->execute([$roleId]);
            $roleName = $stmtRol->fetchColumn() ?: "ID $roleId";
            $changes[] = "Rol a $roleName";
        }
        
        if ($avatarAction !== 'keep') $changes[] = "Avatar actualizado";

        if (count($changes) > 0) {
            // Auditoría
            logAudit($pdo, 'update', 'user', $id, ['changes' => $changes, 'target_user' => $fullName]);
            
            try {
                $subject = "Actualización de Perfil - JACQUIN";
                $body = "Hola $fullName, se ha actualizado tu perfil:<br><ul>";
                foreach ($changes as $c) $body .= "<li>$c</li>";
                $body .= "</ul>";
                sendEmailNotification($oldUser['email'], $subject, $body); 
            } catch (Exception $mailEx) {
                error_log("Mail Error: " . $mailEx->getMessage());
            }
        }

        echo json_encode(['success' => true, 'message' => 'Usuario actualizado']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error SQL: ' . $e->getMessage()]);
}