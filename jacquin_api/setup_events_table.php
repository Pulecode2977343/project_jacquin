<?php
// Quick script to create events table
require_once 'config/connection.php';

// Drop existing table to ensure clean schema
$conn->query("DROP TABLE IF EXISTS events");

$sql = "CREATE TABLE events (
    id_event INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE,
    event_time TIME,
    event_type ENUM('concierto', 'recital', 'taller', 'masterclass', 'presentacion', 'otro') DEFAULT 'otro',
    location VARCHAR(255),
    cost DECIMAL(10,2) DEFAULT 0.00,
    image_url VARCHAR(500),
    media_type ENUM('imagen', 'video_youtube', 'video_nativo', 'pdf', 'ppt', 'ninguno') DEFAULT 'ninguno',
    media_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (event_date DESC),
    INDEX idx_featured (is_featured, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql)) {
    echo "Table 'events' created successfully or already exists.\n";

    // Check if table has data
    $result = $conn->query("SELECT COUNT(*) as count FROM events");
    $row = $result->fetch_assoc();
    echo "Current events count: " . $row['count'] . "\n";
} else {
    echo "Error creating table: " . $conn->error . "\n";
}
?>