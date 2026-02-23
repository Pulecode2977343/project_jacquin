<?php
/**
 * Obtener usuarios elegibles para asignación de cargos
 * Solo devuelve: Administradores (1), Docentes (2) y Colaboradores (5)
 */
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/connection.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    // Roles elegibles: Admin (1), Docente (2), Colaborador (5)
    $stmt = $pdo->query("
        SELECT 
            u.id_usuario,
            u.full_name,
            u.email,
            u.id_rol,
            r.nombre_rol as rol_name
        FROM usuario u
        JOIN rol r ON u.id_rol = r.id_rol
        ORDER BY u.full_name ASC
    ");

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $users]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>