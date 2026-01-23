# Sistema de Cargos y Funciones - Academia Jacquín

## 📋 Descripción General
Sistema que permite al administrador crear, editar, ocultar o eliminar cargos institucionales con sus respectivas funciones, y asignarlos a usuarios específicos (Colaboradores, Profesores o Administradores).

---

## 🎭 CARGOS PREDEFINIDOS Y SUS FUNCIONES

### 1. 👨‍🏫 PROFESOR / DOCENTE
| # | Función | Descripción |
|---|---------|-------------|
| 1 | Planificar clases | Elaborar planes de estudio y contenido pedagógico para cada sesión |
| 2 | Impartir clases | Dictar clases presenciales según horario asignado |
| 3 | Evaluar estudiantes | Registrar calificaciones, observaciones y progreso de alumnos |
| 4 | Tomar asistencia | Registrar asistencia diaria de estudiantes en cada sesión |
| 5 | Comunicar con padres | Informar a acudientes sobre progreso y comportamiento |
| 6 | Crear material didáctico | Desarrollar recursos educativos para las clases |
| 7 | Participar en reuniones | Asistir a reuniones docentes y de coordinación |
| 8 | Reportar incidencias | Notificar problemas de disciplina, infraestructura o recursos |
| 9 | Capacitación continua | Participar en talleres y formación profesional |
| 10 | Supervisar ensayos | Dirigir prácticas musicales individuales o grupales |

---

### 2. 📋 SECRETARIO / RECEPCIONISTA
| # | Función | Descripción |
|---|---------|-------------|
| 1 | Atención al público | Recibir y orientar a visitantes, padres y estudiantes |
| 2 | Gestión de llamadas | Atender, filtrar y direccionar llamadas telefónicas |
| 3 | Agendar citas | Programar reuniones y citas con directivos o docentes |
| 4 | Gestión documental | Archivar, organizar y custodiar documentos institucionales |
| 5 | Matrículas | Recibir y procesar documentos de inscripción |
| 6 | Facturación básica | Generar recibos de pago y controlar mensualidades |
| 7 | Correspondencia | Recibir, clasificar y distribuir correo físico y electrónico |
| 8 | Registro de visitantes | Llevar control de ingreso/salida de personas |
| 9 | Suministros de oficina | Controlar inventario de papelería y solicitar reposición |
| 10 | Comunicados internos | Difundir circulares y avisos a la comunidad |
| 11 | Actualizar carteleras | Mantener actualizadas las carteleras informativas |
| 12 | Apoyo administrativo | Asistir en tareas administrativas diversas |

---

### 3. 📦 LOGÍSTICA
| # | Función | Descripción |
|---|---------|-------------|
| 1 | Gestión de inventario | Controlar stock de instrumentos, equipos y materiales |
| 2 | Montaje de eventos | Coordinar logística para conciertos y presentaciones |
| 3 | Transporte de equipos | Organizar traslado de instrumentos y equipos |
| 4 | Mantenimiento de instrumentos | Coordinar reparación y afinación de instrumentos |
| 5 | Compras y adquisiciones | Gestionar compra de materiales y suministros |
| 6 | Control de préstamos | Registrar préstamos de instrumentos a estudiantes |
| 7 | Proveedores | Mantener relación con proveedores y cotizaciones |
| 8 | Almacenamiento | Organizar y supervisar bodegas y espacios de almacén |
| 9 | Programación de recursos | Asignar aulas, equipos y recursos para clases/eventos |
| 10 | Reportes de inventario | Generar informes periódicos de existencias |
| 11 | Recepción de mercancía | Verificar y registrar ingresos de productos |
| 12 | Etiquetado y codificación | Mantener sistema de identificación de activos |

---

### 4. 🧹 SERVICIOS GENERALES
| # | Función | Descripción |
|---|---------|-------------|
| 1 | Limpieza de instalaciones | Mantener aseo de aulas, baños y áreas comunes |
| 2 | Desinfección | Aplicar protocolos de desinfección sanitaria |
| 3 | Recolección de basuras | Vaciar papeleras y disponer residuos correctamente |
| 4 | Mantenimiento básico | Reparaciones menores (bombillos, chapas, etc.) |
| 5 | Jardinería | Cuidado de plantas y áreas verdes |
| 6 | Cafetería | Preparar y servir bebidas/refrigerios cuando aplique |
| 7 | Apertura/cierre | Abrir y cerrar instalaciones según horario |
| 8 | Vigilancia interna | Reportar situaciones anómalas de seguridad |
| 9 | Mensajería | Realizar diligencias y entregas externas |
| 10 | Apoyo en eventos | Colaborar en montaje y logística de eventos |
| 11 | Control de llaves | Custodiar y entregar llaves de espacios |
| 12 | Reporte de daños | Informar desperfectos que requieran reparación |

---

## 🖥️ DISEÑO DE LA INTERFAZ

### Panel Principal: "Cargos y Funciones"

```
┌──────────────────────────────────────────────────────────────────────┐
│  🏢 CARGOS Y FUNCIONES                                    [+ Nuevo] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ 👨‍🏫 Profesor │  │ 📋 Secretario│  │ 📦 Logística │  │ 🧹 Servicios│ │
│  │  10 funciones│  │  12 funciones│  │  12 funciones│  │ 12 funciones│ │
│  │  3 asignados │  │  1 asignado  │  │  0 asignados │  │ 2 asignados │ │
│  │ [Gestionar]  │  │ [Gestionar]  │  │ [Gestionar]  │  │ [Gestionar] │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐                                   │
│  │ ⚙️ Cargo    │  │ ➕ Crear    │                                   │
│  │  Personaliz.│  │  Nuevo Cargo │                                   │
│  │  5 funciones│  │              │                                   │
│  │ [Gestionar]  │  │  [Crear]    │                                   │
│  └─────────────┘  └─────────────┘                                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Modal: Gestionar Cargo

```
┌──────────────────────────────────────────────────────────────────────┐
│  👨‍🏫 PROFESOR                                              [×]       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  📋 Funciones del Cargo:                                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ☑️ Planificar clases                                           │ │
│  │ ☑️ Impartir clases                                             │ │
│  │ ☑️ Evaluar estudiantes                                         │ │
│  │ ☑️ Tomar asistencia                                            │ │
│  │ ☐ Comunicar con padres (opcional)                              │ │
│  │ ☑️ Crear material didáctico                                    │ │
│  │ ... más funciones ...                                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  👥 Usuarios Asignados:                                             │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ • María García (Docente)                          [Remover]    │ │
│  │ • Carlos López (Colaborador)                      [Remover]    │ │
│  │ • Ana Martínez (Docente)                          [Remover]    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ➕ Asignar a Usuario:                                              │
│  ┌────────────────────────────────┐                                 │
│  │ Seleccionar usuario... ▼       │  [Asignar]                     │
│  │ ├─ 👤 Juan Pérez (Admin)       │                                 │
│  │ ├─ 👤 María García (Docente)   │                                 │
│  │ ├─ 👤 Pedro Ruiz (Colaborador) │                                 │
│  │ └─ 👤 Laura Díaz (Docente)     │                                 │
│  └────────────────────────────────┘                                 │
│                                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                   │
│  │ 📝 Editar   │ │ 👁️ Ocultar  │ │ 🗑️ Eliminar │                   │
│  └─────────────┘ └─────────────┘ └─────────────┘                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Modal: Crear Nuevo Cargo

```
┌──────────────────────────────────────────────────────────────────────┐
│  ➕ CREAR NUEVO CARGO                                       [×]      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Nombre del Cargo *                                                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Ej: Coordinador Académico                                      │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  Icono (emoji)                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 🎓                                                              │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  📋 Definir Funciones:                                              │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ + Agregar función                                              │ │
│  │ ┌──────────────────────────────────────────────────────┐      │ │
│  │ │ Supervisar horarios de docentes            [Quitar]  │      │ │
│  │ └──────────────────────────────────────────────────────┘      │ │
│  │ ┌──────────────────────────────────────────────────────┐      │ │
│  │ │ Aprobar solicitudes de permisos            [Quitar]  │      │ │
│  │ └──────────────────────────────────────────────────────┘      │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  👤 Asignar a Usuario (opcional):                                   │
│  ┌────────────────────────────────┐                                 │
│  │ Seleccionar usuario... ▼       │                                 │
│  └────────────────────────────────┘                                 │
│                                                                      │
│                                            [Cancelar] [✓ Crear Cargo]│
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔔 NOTIFICACIÓN EN DASHBOARD

Cuando un usuario recibe una asignación de cargo, verá en su dashboard:

```
┌──────────────────────────────────────────────────────────────────────┐
│  🔔 NUEVA NOTIFICACIÓN                                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🎉 ¡Se te ha asignado un nuevo cargo!                              │
│                                                                      │
│  Has sido designado como:                                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │   👨‍🏫 PROFESOR                                                  │ │
│  │   Asignado por: Admin Principal                                │ │
│  │   Fecha: 21 de Enero, 2026                                     │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│                         [Ver Mis Funciones]                          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Vista de "Mis Funciones" para el Usuario

```
┌──────────────────────────────────────────────────────────────────────┐
│  📋 MIS CARGOS Y FUNCIONES                                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  👨‍🏫 PROFESOR                                                        │
│  ─────────────────────────────────────────────────────────────────  │
│  ✓ Planificar clases                                                │
│  ✓ Impartir clases                                                  │
│  ✓ Evaluar estudiantes                                              │
│  ✓ Tomar asistencia                                                 │
│  ✓ Comunicar con padres                                             │
│  ✓ Crear material didáctico                                         │
│  ✓ Participar en reuniones                                          │
│  ✓ Reportar incidencias                                             │
│  ✓ Capacitación continua                                            │
│  ✓ Supervisar ensayos                                               │
│                                                                      │
│  📦 LOGÍSTICA (cargo adicional)                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  ✓ Gestión de inventario                                            │
│  ✓ Montaje de eventos                                               │
│  ✓ Control de préstamos                                             │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🗃️ ESTRUCTURA DE BASE DE DATOS

### Tabla: `positions` (Cargos)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_position | INT (PK) | ID único del cargo |
| name | VARCHAR(100) | Nombre del cargo |
| icon | VARCHAR(10) | Emoji/icono del cargo |
| is_predefined | BOOLEAN | Si es cargo predefinido del sistema |
| is_visible | BOOLEAN | Si está visible/activo |
| created_at | TIMESTAMP | Fecha de creación |
| created_by | INT (FK) | Usuario que lo creó |

### Tabla: `position_functions` (Funciones de Cargos)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_function | INT (PK) | ID único de la función |
| position_id | INT (FK) | Cargo al que pertenece |
| description | VARCHAR(255) | Descripción de la función |
| is_active | BOOLEAN | Si la función está activa |
| sort_order | INT | Orden de visualización |

### Tabla: `user_positions` (Asignaciones)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | ID único |
| user_id | INT (FK) | Usuario asignado |
| position_id | INT (FK) | Cargo asignado |
| assigned_by | INT (FK) | Admin que hizo la asignación |
| assigned_at | TIMESTAMP | Fecha de asignación |
| is_active | BOOLEAN | Si la asignación está activa |
| notified | BOOLEAN | Si el usuario fue notificado |

---

## 📡 ENDPOINTS API REQUERIDOS

### Cargos
- `GET /api/positions` - Listar todos los cargos
- `POST /api/positions` - Crear nuevo cargo
- `PUT /api/positions/{id}` - Editar cargo
- `DELETE /api/positions/{id}` - Eliminar cargo
- `PUT /api/positions/{id}/visibility` - Ocultar/mostrar cargo

### Funciones
- `GET /api/positions/{id}/functions` - Listar funciones de un cargo
- `POST /api/positions/{id}/functions` - Agregar función
- `PUT /api/functions/{id}` - Editar función
- `DELETE /api/functions/{id}` - Eliminar función

### Asignaciones
- `GET /api/user-positions` - Listar asignaciones
- `POST /api/user-positions` - Asignar cargo a usuario
- `DELETE /api/user-positions/{id}` - Remover asignación
- `GET /api/users/{id}/positions` - Ver cargos de un usuario
- `PUT /api/user-positions/{id}/notify` - Marcar como notificado

---

## ✅ FLUJO DE TRABAJO

1. **Admin accede** a "Cargos y Funciones"
2. **Selecciona** un cargo predefinido o crea uno nuevo
3. **Configura** las funciones del cargo (activar/desactivar)
4. **Asigna** el cargo a uno o más usuarios
5. **El sistema** envía notificación al dashboard del usuario
6. **El usuario** ve la notificación y puede revisar sus funciones
7. **Las funciones** quedan visibles en el perfil del usuario

---

## 🎨 CONSIDERACIONES DE DISEÑO

- Usar el mismo estilo visual del modal de perfil de usuario
- Colores por tipo de cargo (profesor=azul, secretario=verde, etc.)
- Animaciones suaves al expandir/colapsar
- Confirmaciones antes de eliminar
- Toast notifications para feedback inmediato
- Diseño responsive para diferentes pantallas

---

*Documento creado: 21 de Enero, 2026*
*Proyecto: Academia Jacquín - Sistema de Gestión*
