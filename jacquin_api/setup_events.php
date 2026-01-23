require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/connection.php';

try {
// 1. Create Events Table
$sql = "CREATE TABLE IF NOT EXISTS events (
id INT AUTO_INCREMENT PRIMARY KEY,
title VARCHAR(255) NOT NULL,
description TEXT,
event_date DATETIME NOT NULL,
location VARCHAR(255),
image_url VARCHAR(255),
video_url VARCHAR(255) DEFAULT NULL,
stream_url VARCHAR(255) DEFAULT NULL,
is_live BOOLEAN DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

$pdo->exec($sql);
echo "Table 'events' created or already exists.<br>";

// 2. Check if data exists
$stmt = $pdo->query("SELECT COUNT(*) FROM events");
$count = $stmt->fetchColumn();

if ($count == 0) {
// 3. Insert Dummy Data (matching index.html)
$events = [
[
'title' => 'Recital de Piano Clásico',
'description' => 'Nuestros estudiantes avanzados de piano presentarán obras de Mozart, Beethoven y Chopin en una velada
inolvidable.',
'event_date' => '2026-01-15 19:00:00',
'location' => 'Auditorio Principal JACQUIN',
'image_url' => '',
'video_url' => '',
'stream_url' => '',
'is_live' => 0
],
[
'title' => 'Concierto de Guitarra Acústica',
'description' => 'Una noche de melodías suaves y ritmos vibrantes con nuestros talentosos guitarristas.',
'event_date' => '2026-01-22 18:30:00',
'location' => 'Sala de Conciertos',
'image_url' => '',
'video_url' => 'https://www.youtube.com/watch?v=SomeVideoID',
'stream_url' => '',
'is_live' => 0
],
[
'title' => 'Taller de Técnica Vocal',
'description' => 'Masterclass abierta con invitados especiales. Aprende técnicas profesionales de respiración y
proyección vocal.',
'event_date' => '2026-02-05 10:00:00',
'location' => 'Aula 3 - Edificio Principal',
'image_url' => '',
'video_url' => '',
'stream_url' => 'https://youtube.com/live/VideoID',
'is_live' => 1
]
];

$insertSql = "INSERT INTO events (title, description, event_date, location, image_url, video_url, stream_url, is_live)
VALUES (:title, :description, :event_date, :location, :image_url, :video_url, :stream_url, :is_live)";
$stmt = $pdo->prepare($insertSql);

foreach ($events as $event) {
$stmt->execute($event);
}
echo "Dummy data inserted.<br>";
} else {
echo "Table already has data.<br>";
}

} catch (PDOException $e) {
die("Error: " . $e->getMessage());
}
?>