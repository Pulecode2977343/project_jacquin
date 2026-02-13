# Diagramas de Flujo y Mapas de Proceso - Academia Musical JACQUIN

Este documento describe los procesos núcleo del sistema mediante diagramas de flujo.

## 1. Proceso de Registro e Inscripción de Estudiantes

Este flujo describe desde que el estudiante se registra hasta que el administrador aprueba su cupo y le asigna un horario.

```mermaid
flowchart TD
    A[Estudiante visita la Web] --> B{¿Tiene Cuenta?}
    B -- No --> C[Registro de Usuario]
    B -- Sí --> D[Login]
    C --> D
    D --> E[Explorar Cursos Disponibles]
    E --> F[Enviar Solicitud de Inscripción]
    F --> G[Estado: Pre-inscrito]
    G --> H{Administrador Revisa}
    H -- Rechaza --> I[Notificar al Estudiante]
    H -- Aprueba --> J[Asignar Docente y Horario]
    J --> K[Estado: Activo]
    K --> L[Estudiante accede al Aula Virtual]
```

## 2. Proceso de Gestión de Eventos (Admin)

```mermaid
flowchart LR
    Start([Inicio]) --> Create[Crear Evento en Panel Admin]
    Create --> Upload[Subir Imagen/Media]
    Upload --> Save[(Base de Datos)]
    Save --> Display[Web: Carrusel de Eventos Actualizado]
    Display --> End([Fin])
```

## 3. Mapa de Procesos de Negocio

El sistema se divide en tres macro-procesos:

1.  **Gestión Académica**: Control de cursos, horarios, inscripciones y calificaciones.
2.  **Gestión de Talento y Activos**: Control de docentes e inventario de instrumentos (Pianos).
3.  **Gestión de Comunidad**: Publicación de eventos y comunicación con interesados.

```mermaid
graph TB
    subgraph Estratégicos
        E1[Planeación Académica]
        E2[Gestión de Calidad Musical]
    end
    
    subgraph Operativos
        O1[Admisiones y Registros] --> O2[Desarrollo de Clases]
        O2 --> O3[Evaluación y Seguimiento]
        O3 --> O4[Certificación/Recitales]
    end
    
    subgraph Apoyo
        A1[Gestión de Inventario Pianos]
        A2[Mantenimiento de Plataforma]
        A3[Gestión de Eventos]
    end
```
