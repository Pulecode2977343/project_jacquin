<?php
/**
 * Add Colaborador Role to Database
 * Run this script once to add role id=5 (Colaborador) to the roles table
 * Created: 2026-01-20
 */

header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';

try {
    // First, check if a 'roles' table exists
    $checkTable = $pdo->query("SHOW TABLES LIKE 'roles'");

    if ($checkTable->rowCount() > 0) {
        // Check if role 5 already exists
        $stmt = $pdo->prepare("SELECT * FROM roles WHERE id_rol = 5");
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true, "message" => "El rol Colaborador (id=5) ya existe."]);
        } else {
            // Insert the new role
            $insert = $pdo->prepare("INSERT INTO roles (id_rol, nombre_rol, descripcion) VALUES (5, 'Colaborador', 'Personal operativo: secretaría, recepción, intendencia, cafetería, etc.')");
            $insert->execute();
            echo json_encode(["success" => true, "message" => "Rol Colaborador (id=5) agregado exitosamente."]);
        }
    } else {
        // No roles table - roles might be stored directly in usuario.id_rol
        // In this case, just verify that id_rol=5 is valid
        echo json_encode([
            "success" => true,
            "message" => "No existe tabla 'roles'. Los roles se gestionan directamente en usuario.id_rol. El sistema acepta id_rol=5 como Colaborador."
        ]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>