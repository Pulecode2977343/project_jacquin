# Casos de Uso del Sistema - Academia Musical JACQUIN

Este documento identifica a los actores y sus interacciones con el sistema.

## Actores Principales

| Actor | Descripción |
| :--- | :--- |
| **Estudiante** | Persona interesada en aprender música, puede inscribirse, ver sus notas y subir tareas. |
| **Docente** | Profesional encargado de dictar las clases, calificar y gestionar el material académico. |
| **Administrador** | Encargado de la supervisión global, gestión de usuarios, inventario y eventos. |
| **Visitante** | Persona no registrada que solo puede ver la información pública y eventos. |

## Diagrama de Casos de Uso

```mermaid
graph LR
    subgraph Actores
        Est[Estudiante]
        Doc[Docente]
        Adm[Administrador]
        Vis[Visitante]
    end
    
    subgraph Ventanilla_Publica
        UC1((Ver Eventos))
        UC2((Solicitar Info))
        UC3((Registrarse))
    end
    
    subgraph Portal_Academico
        UC4((Inscribirse))
        UC5((Subir Tareas))
        UC6((Ver Notas))
        UC7((Gestionar Agenda))
    end
    
    subgraph Panel_Control
        UC8((Aprobar Cupos))
        UC9((Gestionar Pianos))
        UC10((Publicar Eventos))
        UC11((Reportes))
    end

    Vis --> UC1
    Vis --> UC2
    Vis --> UC3
    
    Est --> UC4
    Est --> UC5
    Est --> UC6
    
    Doc --> UC7
    Doc --> UC6
    
    Adm --> UC8
    Adm --> UC9
    Adm --> UC10
    Adm --> UC11
```

## Detalle de Casos de Uso Críticos

### CU-04: Inscripción a Curso
- **Actor**: Estudiante.
- **Precondición**: Estar autenticado.
- **Flujo**: El estudiante elige un curso, envía solicitud, y queda en espera de aprobación.
- **Postcondición**: El registro cambia a 'Pre-inscrito'.

### CU-09: Gestión de Inventario (Pianos)
- **Actor**: Administrador.
- **Flujo**: El administrador registra nuevos instrumentos, asigna números de serie y verifica el estado de mantenimiento.
- **Importancia**: Crítico para asegurar que los recursos físicos estén disponibles para las clases.
