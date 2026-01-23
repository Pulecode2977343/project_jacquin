<?php
require_once __DIR__ . '/config/connection.php';

try {
    // Crear hash para la contraseña 'admin123'
    $newPassword = password_hash('admin123', PASSWORD_DEFAULT);

    // Actualizar la contraseña del admin
    $stmt = $pdo->prepare("UPDATE usuario SET password = ? WHERE email = 'visionarycode.team@gmail.com'");
    $stmt->execute([$newPassword]);

    echo "Contraseña actualizada correctamente para visionarycode.team@gmail.com<br>";
    echo "Nueva contraseña: admin123<br>";

    // También crear/actualizar admin@jacquin.edu.co si no existe
    $stmt2 = $pdo->prepare("SELECT id_usuario FROM usuario WHERE email = 'admin@jacquin.edu.co'");
    $stmt2->execute();

    if ($stmt2->rowCount() == 0) {
        // Crear admin
        $stmt3 = $pdo->prepare("INSERT INTO usuario (full_name, email, password, id_rol) VALUES (?, ?, ?, ?)");
        $stmt3->execute(['Administrador JAM', 'admin@jacquin.edu.co', $newPassword, 1]);
        echo "Admin admin@jacquin.edu.co creado correctamente<br>";
    } else {
        // Actualizar password
        $stmt4 = $pdo->prepare("UPDATE usuario SET password = ? WHERE email = 'admin@jacquin.edu.co'");
        $stmt4->execute([$newPassword]);
        echo "Contraseña actualizada para admin@jacquin.edu.co<br>";
    }

    echo "<br>Ambas cuentas ahora tienen la contraseña: admin123";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>