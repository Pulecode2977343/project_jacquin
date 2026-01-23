CREATE TABLE IF NOT EXISTS events (
    id_event INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE,
    event_time TIME,
    event_type ENUM('concierto', 'recital', 'taller', 'masterclass', 'presentacion', 'otro') DEFAULT 'otro',
    location VARCHAR(255),
    cost DECIMAL(10,2) DEFAULT 0.00,
    
    -- Media principal
    image_url VARCHAR(500),
    
    -- Media adicional
    media_type ENUM('imagen', 'video_youtube', 'video_nativo', 'pdf', 'ppt', 'ninguno') DEFAULT 'ninguno',
    media_url VARCHAR(500),
    
    -- Metadata
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_date (event_date DESC),
    INDEX idx_featured (is_featured, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
