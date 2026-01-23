-- ============================================
-- MÓDULO: CARGOS Y FUNCIONES
-- Academia Jacquín - Sistema de Gestión
-- ============================================

-- Tabla de Cargos
CREATE TABLE IF NOT EXISTS positions (
    id_position INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(20) DEFAULT '👤',
    description VARCHAR(255) DEFAULT NULL,
    is_predefined BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT DEFAULT NULL,
    FOREIGN KEY (created_by) REFERENCES usuario(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Funciones de Cargos
CREATE TABLE IF NOT EXISTS position_functions (
    id_function INT AUTO_INCREMENT PRIMARY KEY,
    position_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (position_id) REFERENCES positions(id_position) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Asignaciones Usuario-Cargo
CREATE TABLE IF NOT EXISTS user_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    position_id INT NOT NULL,
    assigned_by INT DEFAULT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    notified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (position_id) REFERENCES positions(id_position) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    UNIQUE KEY unique_user_position (user_id, position_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES: CARGOS PREDEFINIDOS
-- ============================================

-- 1. Profesor
INSERT INTO positions (name, icon, description, is_predefined) VALUES
('Profesor', '👨‍🏫', 'Docente encargado de impartir clases y evaluar estudiantes', TRUE);

SET @profesor_id = LAST_INSERT_ID();

INSERT INTO position_functions (position_id, description, sort_order) VALUES
(@profesor_id, 'Planificar clases y contenido pedagógico', 1),
(@profesor_id, 'Impartir clases presenciales según horario', 2),
(@profesor_id, 'Evaluar estudiantes y registrar calificaciones', 3),
(@profesor_id, 'Tomar asistencia diaria de estudiantes', 4),
(@profesor_id, 'Comunicar a padres sobre progreso de alumnos', 5),
(@profesor_id, 'Crear material didáctico para las clases', 6),
(@profesor_id, 'Participar en reuniones docentes', 7),
(@profesor_id, 'Reportar incidencias de disciplina o infraestructura', 8),
(@profesor_id, 'Participar en capacitación continua', 9),
(@profesor_id, 'Supervisar ensayos y prácticas musicales', 10);

-- 2. Secretario/Recepcionista
INSERT INTO positions (name, icon, description, is_predefined) VALUES
('Secretario', '📋', 'Personal administrativo de recepción y atención al público', TRUE);

SET @secretario_id = LAST_INSERT_ID();

INSERT INTO position_functions (position_id, description, sort_order) VALUES
(@secretario_id, 'Atención al público, padres y estudiantes', 1),
(@secretario_id, 'Gestión y filtrado de llamadas telefónicas', 2),
(@secretario_id, 'Agendar citas con directivos o docentes', 3),
(@secretario_id, 'Archivar y organizar documentos institucionales', 4),
(@secretario_id, 'Recibir y procesar documentos de matrícula', 5),
(@secretario_id, 'Generar recibos de pago y controlar mensualidades', 6),
(@secretario_id, 'Gestionar correspondencia física y electrónica', 7),
(@secretario_id, 'Llevar registro de visitantes', 8),
(@secretario_id, 'Controlar inventario de suministros de oficina', 9),
(@secretario_id, 'Difundir comunicados internos y circulares', 10),
(@secretario_id, 'Mantener actualizadas las carteleras informativas', 11),
(@secretario_id, 'Apoyar en tareas administrativas diversas', 12);

-- 3. Logística
INSERT INTO positions (name, icon, description, is_predefined) VALUES
('Logística', '📦', 'Encargado de inventario, equipos y recursos de la academia', TRUE);

SET @logistica_id = LAST_INSERT_ID();

INSERT INTO position_functions (position_id, description, sort_order) VALUES
(@logistica_id, 'Controlar inventario de instrumentos y equipos', 1),
(@logistica_id, 'Coordinar montaje de eventos y presentaciones', 2),
(@logistica_id, 'Organizar transporte de instrumentos y equipos', 3),
(@logistica_id, 'Coordinar mantenimiento y afinación de instrumentos', 4),
(@logistica_id, 'Gestionar compras y adquisiciones de materiales', 5),
(@logistica_id, 'Registrar préstamos de instrumentos a estudiantes', 6),
(@logistica_id, 'Mantener relación con proveedores', 7),
(@logistica_id, 'Supervisar bodegas y espacios de almacén', 8),
(@logistica_id, 'Asignar aulas y recursos para clases/eventos', 9),
(@logistica_id, 'Generar reportes periódicos de existencias', 10),
(@logistica_id, 'Verificar y registrar recepción de mercancía', 11),
(@logistica_id, 'Mantener sistema de etiquetado de activos', 12);

-- 4. Servicios Generales
INSERT INTO positions (name, icon, description, is_predefined) VALUES
('Servicios Generales', '🧹', 'Personal de mantenimiento, limpieza y apoyo general', TRUE);

SET @servicios_id = LAST_INSERT_ID();

INSERT INTO position_functions (position_id, description, sort_order) VALUES
(@servicios_id, 'Mantener limpieza de aulas, baños y áreas comunes', 1),
(@servicios_id, 'Aplicar protocolos de desinfección sanitaria', 2),
(@servicios_id, 'Recolectar y disponer correctamente los residuos', 3),
(@servicios_id, 'Realizar mantenimiento básico (bombillos, chapas)', 4),
(@servicios_id, 'Cuidar plantas y áreas verdes', 5),
(@servicios_id, 'Preparar y servir bebidas/refrigerios', 6),
(@servicios_id, 'Abrir y cerrar instalaciones según horario', 7),
(@servicios_id, 'Reportar situaciones anómalas de seguridad', 8),
(@servicios_id, 'Realizar diligencias y mensajería externa', 9),
(@servicios_id, 'Colaborar en montaje de eventos', 10),
(@servicios_id, 'Custodiar y entregar llaves de espacios', 11),
(@servicios_id, 'Informar desperfectos que requieran reparación', 12);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================
CREATE INDEX idx_positions_visible ON positions(is_visible);
CREATE INDEX idx_user_positions_user ON user_positions(user_id);
CREATE INDEX idx_user_positions_position ON user_positions(position_id);
CREATE INDEX idx_user_positions_active ON user_positions(is_active);
CREATE INDEX idx_position_functions_position ON position_functions(position_id);
