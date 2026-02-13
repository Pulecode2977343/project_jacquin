# Diagrama de Entidad Relación (ERD) - Academia Musical JACQUIN

Este documento detalla la estructura de la base de datos del sistema, utilizando la notación de Mermaid para representar las tablas y sus relaciones.

```mermaid
erDiagram
    USUARIO ||--o{ ENROLLMENTS : "realiza"
    USUARIO ||--o{ ACADEMIC_NOTES : "recibe/dicta"
    USUARIO ||--o{ STUDENT_SUBMISSIONS : "entrega"
    USUARIO ||--o{ COURSES : "dicta"
    ROLES ||--o{ USUARIO : "define"
    COURSES ||--o{ SCHEDULE : "tiene"
    COURSES ||--o{ ENROLLMENTS : "pertenece"
    COURSES ||--o{ COURSE_ASSIGNMENTS : "contiene"
    SCHEDULE ||--o{ ENROLLMENTS : "asignado_en"
    ENROLLMENTS ||--o{ ENROLLMENT_SCHEDULES : "se_divide_en"
    SCHEDULE ||--o{ ENROLLMENT_SCHEDULES : "vincula"
    COURSE_ASSIGNMENTS ||--o{ STUDENT_SUBMISSIONS : "genera"

    USUARIO {
        int id_usuario PK
        string full_name
        string email
        string password_hash
        int id_rol FK
        string avatar_url
        datetime created_at
    }

    ROLES {
        int id_rol PK
        string role_name
    }

    COURSES {
        int id_course PK
        string course_name
        string description
        int teacher_id FK
        boolean is_active
    }

    SCHEDULE {
        int id_schedule PK
        int course_id FK
        string day_of_week
        time start_time
        time end_time
        string room
    }

    ENROLLMENTS {
        int id_enrollment PK
        int student_id FK
        int course_id FK
        int schedule_id FK
        string status
    }

    ENROLLMENT_SCHEDULES {
        int enrollment_id FK
        int schedule_id FK
    }

    COURSE_ASSIGNMENTS {
        int id PK
        int course_id FK
        string title
        string description
        datetime due_date
        boolean is_active
    }

    STUDENT_SUBMISSIONS {
        int id PK
        int assignment_id FK
        int student_id FK
        text submission_text
        string submission_url
        float grade
        text feedback
        string status
        datetime submitted_at
    }

    ACADEMIC_NOTES {
        int id PK
        int student_id FK
        int course_id FK
        int teacher_id FK
        text note_content
        boolean is_private_admin
        datetime created_at
    }

    EVENTS {
        int id_event PK
        string title
        text description
        date event_date
        time event_time
        string event_type
        string location
        string cost
        string image_url
        boolean is_featured
        boolean is_active
    }

    INVENTORY {
        int id_item PK
        string item_name
        text description
        string serial_number
        string status
        string location
        date last_maintenance
    }
```

## Descripción de Relaciones Clave

1.  **USUARIO - ENROLLMENTS**: Un usuario (estudiante) puede tener múltiples inscripciones a diferentes cursos.
2.  **COURSES - SCHEDULE**: Un curso puede tener uno o múltiples horarios asignados (ej. Lunes y Miércoles).
3.  **ENROLLMENT_SCHEDULES**: Tabla intermedia que maneja la relación de muchos a muchos entre una inscripción específica y los horarios exactos asistidos, permitiendo flexibilidad si un alumno solo asiste a una parte de los horarios del curso.
4.  **USUARIO (Docente) - COURSES**: Un usuario con rol de docente es asignado a dictar uno o varios cursos.
5.  **COURSE_ASSIGNMENTS - STUDENT_SUBMISSIONS**: Cada tarea creada en un curso puede recibir múltiples entregas (una por cada estudiante inscrito).
