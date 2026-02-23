<?php
/**
 * Admin CRUD endpoint for About Cards
 * 
 * Supports:
 * - GET: Retrieve all cards
 * - POST: Create a new card
 * - PUT: Update an existing card
 * - DELETE: Delete a card
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/config/connection.php';

// $pdo is now available from connection.php

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all cards (admin view - includes inactive)
        $stmt = $pdo->query("SELECT * FROM about_cards ORDER BY display_order ASC");
        $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Parse images JSON
        foreach ($cards as &$card) {
            if ($card['images']) {
                $card['images'] = json_decode($card['images'], true);
            } else {
                $card['images'] = [];
            }
        }

        echo json_encode(['success' => true, 'data' => $cards]);
        break;

    case 'POST':
        // Create new card
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['title'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Title is required']);
            exit;
        }

        // Get max display_order
        $stmt = $pdo->query("SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM about_cards");
        $nextOrder = $stmt->fetch()['next_order'];

        $stmt = $pdo->prepare("
            INSERT INTO about_cards (title, subtitle, icon, description, image_url, images, display_order, is_active)
            VALUES (:title, :subtitle, :icon, :description, :image_url, :images, :display_order, :is_active)
        ");

        $images = isset($data['images']) ? json_encode($data['images']) : null;

        $stmt->execute([
            ':title' => $data['title'],
            ':subtitle' => $data['subtitle'] ?? null,
            ':icon' => $data['icon'] ?? 'bi-star',
            ':description' => $data['description'] ?? null,
            ':image_url' => $data['image_url'] ?? null,
            ':images' => $images,
            ':display_order' => $data['display_order'] ?? $nextOrder,
            ':is_active' => isset($data['is_active']) ? (int) $data['is_active'] : 1
        ]);

        $newId = $pdo->lastInsertId();

        echo json_encode([
            'success' => true,
            'message' => 'Card created successfully',
            'id' => $newId
        ]);
        break;

    case 'PUT':
        // Update existing card
        $data = json_decode(file_get_contents('php://input'), true);

        // Handle bulk reorder operation
        if (isset($data['reorder']) && is_array($data['reorder'])) {
            try {
                $pdo->beginTransaction();
                $stmt = $pdo->prepare("UPDATE about_cards SET display_order = :order WHERE id = :id");
                foreach ($data['reorder'] as $item) {
                    $stmt->execute([':order' => $item['order'], ':id' => $item['id']]);
                }
                $pdo->commit();
                echo json_encode(['success' => true, 'message' => 'Order updated successfully']);
                exit;
            } catch (Exception $e) {
                $pdo->rollBack();
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to reorder: ' . $e->getMessage()]);
                exit;
            }
        }

        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Card ID is required']);
            exit;
        }

        // Build dynamic update query
        $fields = [];
        $params = [':id' => $data['id']];

        $allowedFields = ['title', 'subtitle', 'icon', 'description', 'image_url', 'display_order', 'is_active'];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        // Handle images array separately
        if (isset($data['images'])) {
            $fields[] = "images = :images";
            $params[':images'] = json_encode($data['images']);
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'No fields to update']);
            exit;
        }

        $sql = "UPDATE about_cards SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode([
            'success' => true,
            'message' => 'Card updated successfully',
            'affected_rows' => $stmt->rowCount()
        ]);
        break;

    case 'DELETE':
        // Delete card
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Card ID is required']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM about_cards WHERE id = :id");
        $stmt->execute([':id' => $data['id']]);

        echo json_encode([
            'success' => true,
            'message' => 'Card deleted successfully',
            'affected_rows' => $stmt->rowCount()
        ]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}
