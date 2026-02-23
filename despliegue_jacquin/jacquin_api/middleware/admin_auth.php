<?php

require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/db.php';

function requireAdminAuth() {

    $headers = getallheaders();
    $authHeader = $headers["Authorization"] ?? '';

    if (!str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(["error" => "No autenticado"]);
        exit;
    }

    $token = str_replace('Bearer ', '', $authHeader);

    if ($token !== ADMIN_SECRET_KEY) {
        http_response_code(401);
        echo json_encode(["error" => "Token inválido"]);
        exit;
    }
}
