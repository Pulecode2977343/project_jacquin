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

// Debug log
file_put_contents(__DIR__ . "/debug_update.log", "[" . date('Y-m-d H:i:s') . "] Data: " . json_encode($data) . "\n", FILE_APPEND);

if (!isset($data['id_usuario'])) {
    echo json_encode(['success' => false, 'message' => 'ID de usuario requerido']);
    exit;
}

$id = intval($data['id_usuario']);
$fullName = $data['full_name'] ?? '';
$email = $data['email'] ?? '';
$phone = $data['n_phone'] ?? '';
$address = $data['address'] ?? null;
$roleId = isset($data['id_rol']) ? intval($data['id_rol']) : null;
$avatarAction = $data['avatar_action'] ?? 'keep'; 
$avatarUrl = $data['avatar_url'] ?? null;

if (!$roleId) {
    echo json_encode(['success' => false, 'message' => 'Rol inválido o no proporcionado']);
    exit;
}

try {
    $stmtOld = $pdo->prepare("SELECT * FROM usuario WHERE id_usuario = ?");
    $stmtOld->execute([$id]);
    $oldUser = $stmtOld->fetch(PDO::FETCH_ASSOC);

    if (!$oldUser) {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
        exit;
    }

    $query = "UPDATE usuario SET full_name = ?, email = ?, n_phone = ?, address = ?, id_rol = ?";
    $params = [$fullName, $email, $phone, $address, $roleId];

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
        if ($oldUser['address'] != $address) $changes[] = "Dirección a $address";
        
        if (intval($oldUser['id_rol']) !== $roleId) {
            $stmtRol = $pdo->prepare("SELECT descripcion FROM rol WHERE id_rol = ?");
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

        // Actualizar sesión si el usuario se está editando a sí mismo
        if (isset($_SESSION['user_id']) && intval($_SESSION['user_id']) === $id) {
            $_SESSION['full_name'] = $fullName;
            $_SESSION['id_rol'] = $roleId;
            if (isset($_SESSION['user'])) {
                $_SESSION['user']['full_name'] = $fullName;
                $_SESSION['user']['id_rol'] = $roleId;
                $_SESSION['user']['email'] = $email;
                $_SESSION['user']['n_phone'] = $phone;
                $_SESSION['user']['address'] = $address;
            }
        }

        echo json_encode(['success' => true, 'message' => 'Usuario actualizado e integrado en sesión']);
    } else {
        $error = $stmt->errorInfo();
        file_put_contents(__DIR__ . "/debug_update.log", "[" . date('Y-m-d H:i:s') . "] Execute Error: " . json_encode($error) . "\n", FILE_APPEND);
        echo json_encode(['success' => false, 'message' => 'Error al actualizar en la base de datos']);
    }

} catch (PDOException $e) {
    file_put_contents(__DIR__ . "/debug_update.log", "[" . date('Y-m-d H:i:s') . "] PDO Error: " . $e->getMessage() . "\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Error SQL: ' . $e->getMessage()]);
}