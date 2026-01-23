require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/connection.php';

header('Content-Type: application/json');

try {
$stmt = $pdo->query("SELECT * FROM events ORDER BY event_date ASC");
$events = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'data' => $events]);

} catch (PDOException $e) {
echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>