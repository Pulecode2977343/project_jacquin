-- JAM Music Academy - Master Database Schema
-- Version: 2.0 (Robust Design)
-- Date: 2025-12-18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Disable Foreign Key Checks for clean import
SET FOREIGN_KEY_CHECKS=0;

-- ==========================================
-- 1. USUARIOS Y ROLES
-- ==========================================

-- Tabla: Roles
DROP TABLE IF EXISTS `rol`;
CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos Semilla: Roles
INSERT INTO `rol` (`id_rol`, `nombre_rol`) VALUES
(1, 'Administrador'),
(2, 'Docente'),
(3, 'Estudiante');

-- Tabla: Usuarios
DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `n_phone` varchar(20) DEFAULT NULL,
  `id_rol` int(11) NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  KEY `fk_usuario_rol` (`id_rol`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos Semilla: Admin Principal (Password: 123456)
INSERT INTO `usuario` (`id_usuario`, `full_name`, `email`, `password`, `id_rol`, `avatar_url`) VALUES
(1, 'Admin Principal', 'admin@jacquin.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'uploads/avatars/default_admin.png');


-- ==========================================
-- 2. GESTIÓN ACADÉMICA
-- ==========================================

-- Tabla: Cursos
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id_course` int(11) NOT NULL AUTO_INCREMENT,
  `course_name` varchar(100) NOT NULL,
  `description` text,
  `teacher_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_course`),
  KEY `fk_course_teacher` (`teacher_id`),
  CONSTRAINT `fk_course_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: Horarios (Relación 1:N con Cursos)
DROP TABLE IF EXISTS `schedules`;
CREATE TABLE `schedules` (
  `id_schedule` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `day_of_week` enum('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `location` varchar(100) DEFAULT 'Sede Principal',
  PRIMARY KEY (`id_schedule`),
  KEY `fk_schedule_course` (`course_id`),
  CONSTRAINT `fk_schedule_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id_course`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: Inscripciones (Relación N:M Estudiantes <-> Cursos)
DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `id_enrollment` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `enrollment_date` timestamp DEFAULT CURRENT_TIMESTAMP,
  `status` enum('Activo','Completado','Cancelado') DEFAULT 'Activo',
  PRIMARY KEY (`id_enrollment`),
  UNIQUE KEY `unique_enrollment` (`student_id`, `course_id`),
  KEY `fk_enrollment_student` (`student_id`),
  KEY `fk_enrollment_course` (`course_id`),
  CONSTRAINT `fk_enrollment_student` FOREIGN KEY (`student_id`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_enrollment_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id_course`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: Funciones Docentes (Historial)
DROP TABLE IF EXISTS `teacher_functions`;
CREATE TABLE `teacher_functions` (
  `id_function` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL COMMENT 'Ej: Director de Orquesta, Jefe de Cuerdas',
  `description` text,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id_function`),
  KEY `fk_function_teacher` (`teacher_id`),
  CONSTRAINT `fk_function_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 3. EVENTOS Y DIFUSIÓN
-- ==========================================

DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id_event` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `event_date` datetime NOT NULL,
  `location` varchar(150) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_event`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 4. CONTROL DE INVENTARIO
-- ==========================================

DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
  `id_item` int(11) NOT NULL AUTO_INCREMENT,
  `item_name` varchar(100) NOT NULL,
  `category` enum('Instrumento','Equipo de Audio','Mobiliario','Accesorio','Otro') NOT NULL,
  `serial_number` varchar(50) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `status` enum('Disponible','En uso','En reparación','Dañado/Baja') DEFAULT 'Disponible',
  `purchase_date` date DEFAULT NULL,
  `last_updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_item`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Re-enable Foreign Key Checks
SET FOREIGN_KEY_CHECKS=1;
COMMIT;
