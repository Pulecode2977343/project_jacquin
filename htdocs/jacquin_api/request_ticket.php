<?php
require_once 'config/cors.php';
require_once 'config/connection.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id_event'])) {
        throw new Exception("Falta ID del evento");
    }

    $id_event = $data['id_event'];
    $id_user = $data['id_user'] ?? null;
    $guest_name = $data['guest_name'] ?? 'Anónimo';
    $guest_email = $data['guest_email'] ?? '';
    $guest_phone = $data['guest_phone'] ?? '';

    // Validar datos básicos
    if (!$id_user && (empty($guest_name) || empty($guest_email))) {
        throw new Exception("Se requieren datos de contacto.");
    }

    // 1. Guardar en Base de Datos
    $sql = "INSERT INTO event_reservations (id_event, id_user, guest_name, guest_email, guest_phone) 
            VALUES (:id_event, :id_user, :guest_name, :guest_email, :guest_phone)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id_event' => $id_event,
        ':id_user' => $id_user,
        ':guest_name' => $guest_name,
        ':guest_email' => $guest_email,
        ':guest_phone' => $guest_phone
    ]);

    // 2. Obtener detalles del evento para el correo
    $stmtEv = $pdo->prepare("SELECT title, cost, event_date FROM events WHERE id_event = ?");
    $stmtEv->execute([$id_event]);
    $event = $stmtEv->fetch(PDO::FETCH_ASSOC);

    // 3. Enviar Correo Real con EmailService (Brevo)
    require_once 'services/EmailService.php';
    $emailService = new EmailService();

    // Notificación al Admin (Usando el mensaje del usuario como cuerpo)
    $msg_admin = "Solicitud de entrada para el evento: " . $event['title'] . "\n";
    $msg_admin .= "Costo del evento: " . ($event['cost'] > 0 ? $event['cost'] : 'Libre') . " COP\n";
    $msg_admin .= "Fecha: " . $event['event_date'] . "\n\n";
    $msg_admin .= "Datos del interesado:\n";
    $msg_admin .= "- Nombre: $guest_name\n";
    $msg_admin .= "- Email: $guest_email\n";
    $msg_admin .= "- Teléfono: $guest_phone\n";

    // Enviamos correo al administrador
    $emailService->sendContactEmail($guest_email, $guest_name, $guest_phone, $msg_admin, "Reserva de Evento");

    // Enviamos confirmación al usuario (Ack)
    $emailService->sendContactAckEmail($guest_email, $guest_name);

    echo json_encode(['success' => true, 'message' => 'Gracias por tu interés en participar en nuestro evento. Nuestro equipo de coordinación de eventos y presentaciones pronto se pondrá en contacto contigo.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
