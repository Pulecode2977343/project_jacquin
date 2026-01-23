<?php
/**
 * Script para corregir horarios con día "Domingo" 
 * La escuela no programa clases los domingos
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/connection.php';

try {
    // 1. Ver cuántos registros tienen "Domingo"
    $checkStmt = $pdo->query("SELECT * FROM schedules WHERE day = 'Domingo'");
    $domingos = $checkStmt->fetchAll(PDO::FETCH_ASSOC);

    $count = count($domingos);

    if ($count > 0) {
        // 2. Actualizar todos los "Domingo" a "Lunes"
        $updateStmt = $pdo->prepare("UPDATE schedules SET day = 'Lunes' WHERE day = 'Domingo'");
        $updateStmt->execute();

        echo json_encode([
            'success' => true,
            'message' => "Se corrigieron $count horarios de Domingo a Lunes",
            'affected_records' => $domingos
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'No hay horarios con día Domingo para corregir'
        ]);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>