<?php

require_once dirname(__DIR__,2)."/middleware/admin_auth.php";
require_once dirname(__DIR__,2)."/config/db.php";

requireAdminAuth();

$users = $conn->query("SELECT COUNT(*) FROM usuario")->fetchColumn();
$cursos = $conn->query("SELECT COUNT(*) FROM curso")->fetchColumn();
$contact = $conn->query("SELECT COUNT(*) FROM contact_messages")->fetchColumn();

echo json_encode([
    "success" => true,
    "stats" => [
        "usuarios" => $users,
        "cursos" => $cursos,
        "contact_messages" => $contact,
    ]
]);
