# Documentación Técnica Integral - Academia Musical JACQUIN 🎶

Este documento consolida toda la ingeniería y diseño del sistema para su exportación a PDF.

---

## 1. Informe de Evaluación de Requerimientos
> Archivo original: `6_Requirements_Evaluation_Report.md`

El sistema demuestra una madurez alta en la lógica de control académica y una arquitectura sólida en el backend basada en PHP nativo.

### Matriz de Cumplimiento
| Requerimiento | Estado | Observación |
| :--- | :--- | :--- |
| **Autenticación** | ✅ Cumplido | Implementado vía `login.php` y `auth_helper.php`. |
| **Inscripciones** | ✅ Cumplido | Lógica robusta en `admin_enroll_student.php`. |
| **Seguridad** | ✅ Cumplido | Uso de `PDO` y manejo de sesiones. |
| **Inventario** | ⚠️ Parcial | Requiere mayor integración visual en el frontend. |

---

## 2. Vista General de la Arquitectura
> Archivo original: `0_Architecture_Overview.md`

### Stack Tecnológico
- **Frontend**: HTML5, CSS3, JavaScript.
- **Backend**: PHP 8.
- **Base de Datos**: MySQL / MariaDB.

```mermaid
graph TD
    Client[Cliente] <--> Web[Frontend]
    Web <--> API[Backend PHP]
    API <--> DB[(MySQL)]
```

---

## 3. Diagrama de Entidad Relación (BD)
> Archivo original: `1_Entity_Relationship_Diagram.md`

```mermaid
erDiagram
    USUARIO ||--o{ ENROLLMENTS : "realiza"
    USUARIO ||--o{ COURSES : "dicta"
    COURSES ||--o{ SCHEDULE : "tiene"
    COURSES ||--o{ ENROLLMENTS : "incluye"

    USUARIO {
        int id_usuario PK
        string full_name
        int id_rol FK
    }
    COURSES {
        int id_course PK
        string course_name
    }
```

---

## 4. Casos de Uso
> Archivo original: `3_Use_Cases.md`

```mermaid
graph LR
    subgraph Actores
        Est[Estudiante]
        Doc[Docente]
        Adm[Administrador]
    end
    
    subgraph Casos_Uso
        UC1((Inscribirse))
        UC2((Subir Tarea))
        UC3((Gestionar Pianos))
    end

    Est --> UC1
    Est --> UC2
    Doc --> UC2
    Adm --> UC3
```

---

## 5. Diagramas de Secuencia
> Archivo original: `5_Sequence_Diagrams.md`

```mermaid
sequenceDiagram
    actor S as Estudiante
    participant W as Web
    participant API as API
    participant DB as DB

    S->>W: Selecciona tarea
    W->>API: POST /submit_task.php
    API->>DB: INSERT submission
    DB-->>API: Success
    API-->>W: 200 OK
```

---
*Firma: Equipo de Ingeniería Antigravity AI*
