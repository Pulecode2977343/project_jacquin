<?php
/**
 * Update About Cards with Image Paths
 * Run once to update the database with generated images
 */

header("Content-Type: text/html; charset=UTF-8");
include_once 'config/connection.php';

echo "<h2>Actualizando imágenes de About Cards</h2>";

try {
    // Update Historia
    $pdo->exec("UPDATE about_cards SET image_url = 'images/about/historia.jpg' WHERE id_card = 1");
    echo "<p>✅ Historia actualizada</p>";

    // Update Equipo
    $pdo->exec("UPDATE about_cards SET image_url = 'images/about/equipo.jpg' WHERE id_card = 2");
    echo "<p>✅ Equipo actualizado</p>";

    // Update Metodología
    $pdo->exec("UPDATE about_cards SET image_url = 'images/about/metodologia.jpg' WHERE id_card = 3");
    echo "<p>✅ Metodología actualizada</p>";

    // Update Instalaciones with multiple images (JSON array)
    $instalacionesImages = json_encode([
        'images/about/instalaciones_sala_piano.jpg',
        'images/about/instalaciones_estudio.jpg',
        'images/about/instalaciones_ensayo.jpg'
    ]);

    $stmt = $pdo->prepare("UPDATE about_cards SET image_url = 'images/about/instalaciones.jpg', images = ? WHERE id_card = 4");
    $stmt->execute([$instalacionesImages]);
    echo "<p>✅ Instalaciones actualizada (1 principal + 3 adicionales en galería)</p>";

    echo "<h2 style='color:green;'>✅ Todas las imágenes actualizadas!</h2>";
    echo "<p>Recarga la página de inicio para ver los cambios.</p>";

} catch (PDOException $e) {
    echo "<h2 style='color:red;'>❌ Error</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>