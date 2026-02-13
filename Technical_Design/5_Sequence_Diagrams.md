# Diagramas de Secuencia - Academia Musical JACQUIN

Estos diagramas representan la interacción temporal entre los componentes del sistema para procesos críticos.

## 1. Validación de Sesión y Acceso (Middleware)

Este flujo ocurre cada vez que un usuario intenta acceder a una ruta protegida.

```mermaid
sequenceDiagram
    participant U as Usuario/Navegador
    participant A as Helper Auth (PHP)
    participant S as Sesión/Servidor
    participant D as Base de Datos

    U->>A: Petición a ruta /admin (GET/POST)
    A->>S: ¿Existe PHPSESSID activo?
    S-->>A: No
    A-->>U: Redirección a login (401 Unauthorized)
    
    Note right of U: Si hay sesión...
    S-->>A: Sí, Usuario ID: 15
    A->>D: SELECT id_rol FROM usuario WHERE id=15
    D-->>A: id_rol = 1 (Admin)
    A-->>U: Entrega recurso solicitado
```

## 2. Proceso de Entrega de Tarea (Student Assignment)

```mermaid
sequenceDiagram
    actor S as Estudiante
    participant W as Web (Frontend)
    participant API as API (submit_task.php)
    participant DB as Base de Datos

    S->>W: Selecciona tarea y pega link
    W->>API: POST /jacquin_api/submit_task.php
    API->>API: Validar formato y campos
    API->>DB: INSERT INTO student_submissions (...)
    DB-->>API: Success (ID 501)
    API-->>W: Respuesta 200 OK
    W-->>S: Mensaje: "Tarea enviada con éxito"
```
