<?php
ob_start();
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json');

if (ob_get_length()) ob_clean();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['id_usuario']) || !isset($input['full_name'])) {
        throw new Exception('Faltan datos obligatorios');
    }

    $userId = $input['id_usuario'];
    $fullName = trim($input['full_name']);
    $phone = trim($input['n_phone'] ?? '');

    if(empty($fullName)) {
        throw new Exception('El nombre no puede estar vacío');
    }

    // Actualizar
    $sql = "UPDATE usuario SET full_name = ?, n_phone = ? WHERE id_usuario = ?";
    $stmt = $pdo->prepare($sql);
    
    if($stmt->execute([$fullName, $phone, $userId])) {
        // Auditoría
        require_once __DIR__ . '/helpers/audit_helper.php';
        logAudit($pdo, 'update_profile', 'usuario', $userId, [
            'new_full_name' => $fullName,
            'new_phone' => $phone
        ]);

        echo json_encode(['success' => true, 'message' => 'Perfil actualizado']);
    } else {
        throw new Exception('Error al actualizar en la base de datos');
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
ob_end_flush();
