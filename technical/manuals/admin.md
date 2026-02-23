# 🛠️ Manual del Administrador — JACQUIN Academia Musical

Este manual detalla todas las funciones que un administrador puede realizar en el panel de gestión.

## 1. Gestión de Usuarios
- **Directorio de Usuarios**: Ubicado en el módulo "Usuarios". Permite ver a todos los registrados (Estudiantes, Docentes, Colaboradores).
- **Cambio de Roles**: Puedes ascender a un estudiante a docente o colaborador.
- **Edición de Perfiles**: Corregir nombres o teléfonos desde la vista de detalles.
- **Eliminación**: Capacidad para dar de baja cuentas inactivas.

## 2. Gestión Académica (Cursos y Horarios)
- **Creación de Cursos**: Define nombre, descripción y asocia una imagen de portada.
- **Asignación de Horarios**: Cada curso puede tener múltiples franjas horarias.
- **Asignación de Docentes**: Vincula a un docente específico con un horario de clase.
- **Control de Cupos**: Establece un límite de estudiantes por horario (por defecto 15).

## 3. Control de Inscripciones
- **Solicitudes Pendientes**: Cuando un estudiante solicita un curso, aparecerá una notificación roja en el módulo académico.
- **Aprobación/Rechazo**: Revisa el horario solicitado por el estudiante y confirma su cupo.
- **Matrícula Directa**: El administrador puede inscribir a un estudiante manualmente sin que este lo solicite.

## 4. Gestión de Eventos
- **Creación de Eventos**: Ubicado en el módulo "Eventos". Permite promocionar seminarios, conciertos o talleres.
- **Carga de Imágenes**: Se recomienda usar imágenes de formato 16:9.
- **Tickets**: Los usuarios pueden solicitar entradas, las cuales se registran en la base de datos para control de aforo.

## 5. Gestión de Programas (Main Web)
- **Programas de la Home**: Administra el contenido dinámico que ven los visitantes en la sección "Programas".
- **JSON dinámico**: Los cambios se guardan en `get_programs_json.php` para carga ultrarrápida en la landing.

## 6. Inventario de Instrumentos
- **Control de Existencias**: Registro de instrumentos de la academia.
- **Estado**: Seguir el rastro de instrumentos en mantenimiento o disponibles para alumnos.

## 7. Personalización (Hero Banner)
- **Actualización de Portada**: Capacidad para cambiar la imagen principal (Hero) de la web.
- **Herramienta de Recorte**: Incluye un sistema para ajustar la imagen a la resolución óptima.

---
*Documentación generada por Antigravity AI — 2026*
