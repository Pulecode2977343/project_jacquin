# 📋 TASK: Jacquin — Desarrollo 2026-02-18

| Acción / Requerimiento | Estado | Nota |
| :--- | :---: | :--- |
| **Aplicar Reglas Maestras del Agente** | ✅ | TASK.md y technical/Repositorio.md creados. |
| **Debugging Mission Logic** | ✅ | Integrado en `About.jsx` via API `getMissionValues`. |
| **Events Component Fixes** | ✅ | Estilos corregidos, filtros funcionales y responsive. |
| **About Component Connection** | ✅ | Componente creado y conectado a API `getAboutCards`. |
| **Refactorización Hero Component** | ✅ | Solo tagline + botón CTA (sin badge, sin título). |
| **Header Spacing** | ✅ | Padding inferior en `.logo-links` para separación visual. |
| **Documentación Técnica** | ✅ | `ARCHITECTURE.md` con flowcharts, ERD y requisitos. |
| **Documentación Brandbook** | ✅ | `technical/brandbook-jacquin.json` con fuentes y paleta oficial. |
| **Configuración Autónoma Túnel** | ✅ | Token `lsw34loontpx` + script de inicio `iniciar_tunel.bat`. |
| **Inicio Autónomo Proyecto** | ✅ | Script `iniciar_proyecto.bat` con `npm start`. |
| **Corrección Fuentes — Brandbook** | ✅ | Fuentes 100% del brandbook oficial: **HelveticaNeue** (Cond. Bold + Light) + **Marion Regular**. Archivos TTF/OTF locales, sin CDN externo. |
| **Sistema SPA React** | ✅ | Migración a React + Vite (`web_page/pages/src/`). Componentes: Hero, Header, Navbar, Events, Programs, About, Login. |
| **API Service Centralizado** | ✅ | `services/api.js` con métodos para auth, usuarios, eventos, académico. |
| **Configuración Header Maestro** | ✅ | Componente centralizado con sincronización automática entre React y estático. |
| **Limpieza de Proyecto** | ✅ | Eliminación del archivo `index.html` deprecado en la raíz de `web_page`. |
| **Gestión de Skills de Agente** | ✅ | Registro y vinculación de la habilidad `header-manager` en el sistema global. |
| **Migración Footer Micro-Frontend** | ✅ | Footer unificado en React + Inyección en Dashboards. Reemplazo de Vanilla CSS. |
| **Update Enrollment Logic** | ✅ | Sincronización en tiempo real vía Custom Events + Lógica de vigencia inteligente. |
| **Fix Upload Avatares** | ✅ | Nueva ruta dinámica con `PathHelper`, refresh automático `Date.now()` en vista perfil. |
| **Micro-frontend Footer React** | ✅ | Componente React standalone montado vía IIFE en estáticos HTML. Script PS1 listo. |
| **Resolución LFS Git & Builds** | ✅ | Limpieza de `assets (2).zip` > 100MB de caché Git. Empaquetado de producción de React inyectado. |
| **Auditoría de Seguridad — Módulo Programas** | ✅ | 7 vulnerabilidades confirmadas (3 reportadas + 4 halladas). Build `24022026SECAUDIT`. |
| **Remediación de Seguridad — Módulo Programas** | ✅ | `session_start()` + guard rol 1 · Extractor Base64→PNG · `LOCK_EX` · `0755` · Cache headers ETag/304 · Endpoint duplicado desactivado (410) · Validación payload. Build `24022026SECFIX`. |
| **Migración Base64 → Archivo Físico** | ✅ | `programs.json`: 858 KB → 5 KB (−99.4%). `program_1768517168737` migrado a `public/uploads/programs/`. |
| **Pruebas de Estrés — Módulo Programas** | ✅ | 37/37 tests · 9 bloques (auth, payload, base64, concurrencia, caché, duplicado, permisos, integridad, carga). Build `24022026STRESS`. Bug extra detectado y corregido (`range(0,-1)` vs `[]`). |
| **Documentación Auditoría de Seguridad** | ✅ | `REPORTE_2026-02-24.html` · 3 entradas en `BUILD_PROJECT.html` · 7 entradas VULN en `ERROR_LOG.html`. |
| **Reconexión Flujo Inscripción — Sección Programas** | ✅ | Modal roto por conflicto Vanilla JS ↔ React SPA. Solución: `ProgramModal.jsx` + `ScheduleModal.jsx` + `AuthPromptModal.jsx`. Recovery post-login vía `location.state`. Campo `c.name` → `c.course_name` corregido. Build `24022026ENROLL`. |
| **Corrección BOM en suite `_test_programs_flow.php`** | ✅ | `ltrim($body, "\xEF\xBB\xBF")` en `http_get` y `http_post`. Resultado: 60/61 PASS. B9 = observación de seguridad (`request_enrollment.php` sin validación de sesión). |
| **Fix imagen rota en panel admin programas** | ✅ | `resolveAdminImageUrl()` en `admin_programs.js`. Prefija `ApiService.BASE_URL` para rutas `public/uploads/`. |
| **Auditoría Flujo de Datos — Multi-rol** | ✅ | Diagnóstico completo de cruces entre Admin/Docente/Estudiante. 4 cambios aplicados. Build `25022026AUDIT`. |
| **CAMBIO 1 — Fix cupo horario** | ✅ | `s.max_capacity` → `s.quota` en `admin_academic_schedules.js`. La barra de cupo ya muestra el porcentaje correcto. |
| **CAMBIO 2 — Chips de horario en perfil de estudiante** | ✅ | `user_profile_modal.js` tab Courses: chips día+hora, línea de profesor, indicador de color por estado. |
| **CAMBIO 3 — Mensaje horario pendiente en dashboard** | ✅ | `dashboard.js`: flag `hasSchedules` + bloque naranja "Horario pendiente de asignación" cuando inscripción activa sin horario. |
| **CAMBIO 4 — Suite `_test_data_consistency.php`** | ✅ | 5 bloques (C1-C5): inscripciones sin horario, docentes sin asignar, conflictos de horario por alumno/docente, vista cruzada Admin. Resultado: 12/13 PASS, 1 FAIL (Erick Pertuz Joya sin horario), 3 WARN (47 registros enrollment_schedules huérfanos). |
| **Auditoría Gestión Académica Multi-rol — Build 25022026ACAD** | ✅ | 4 Fases implementadas. Ver detalle abajo. |
| **FASE 1 — ScheduleModal inteligente** | ✅ | Horarios llenos: badge ROJO + disabled + reordenados al final. Barra de cupo (inscritos/cupo) + chip "X cupos libres" por opción de horario. |
| **FASE 2a — Aprobación automática de horario** | ✅ | `admin_handle_enrollment.php`: al aprobar, INSERT en `enrollment_schedules` si el enrollment tiene `schedule_id`. Transacción atómica + rollback en error. |
| **FASE 2b — Overview admin con ocupación** | ✅ | Nuevo endpoint `admin_get_academic_stats.php`. Tarjetas de curso muestran: inscritos activos, # horarios, % ocupación con barra de color. Botón "Ver estudiantes" por horario en tab Horarios. Función `viewScheduleStudents()`. |
| **FASE 3 — Vista semanal Docente** | ✅ | `teacher_academic.js`: nueva tab "Mi Semana" con grilla Lun-Dom de horarios propios. Clic en bloque → lista de estudiantes de ese horario (`showScheduleStudentsList()`). |
| **FASE 4 — Panel colaborador + limpieza BD** | ✅ | `get_academic_overview.php` (solo lectura, cualquier rol). `dashboard.js`: `loadCollaboratorStats()` inyecta disponibilidad de programas + próximos eventos en panel colaborador. `admin_clean_orphans.php`. 47 enrollment_schedules huérfanos eliminados. Tests: 13/14 PASS. |
| **Teacher-per-schedule en perfiles y dashboard** | ✅ | `get_user_details.php`: `teacher_name` añadido a cada `schedules[]`. `user_profile_modal.js`: chips de horario muestran `día · hora · Prof. X`. `dashboard.js`: slot del día muestra apellido del profesor. Build `25022026TEACHER`. |
| **Restauración Header — Resolución conflictos git** | ✅ | 4 conflictos de merge sin resolver (`<<<<<<< HEAD`) en `style.css` corregidos. Piano tiles restaurados (`105×60px`, neumórfico `9px 9px 16px #1b324d`). Botones Ingresa/Inscríbete: `border-radius: 50px`, neumórfico. Animación `emergencyPulse` restaurada. Build `27022026HEADER`. |
| **Header transparente con scroll-reveal** | ✅ | `style.css`: header base `background: transparent` en todos los breakpoints. `padding-top: 0` en `body>main` y `.jam-main-content` para overlay sobre hero. Glassmorfismo azul aparece al hacer scroll (`.header.scrolled`). |
| **Ajustes visuales de layout desktop** | ✅ | `.logo-links`: layout flex restaurado (`display: flex; justify-content: space-between`), `padding: 0 12%`. `.btns-log-reg`: `padding: 20px 12% 5px`. Piano tiles: `margin-bottom: -3px` en icono. Sombras neumórficas solo en hover. |
| **Flash naranja en botones auth** | ✅ | `@keyframes btnGleam` en `.btn-register::before` y `.btn-login::before`. Gradiente `rgba(231,140,59,0.12)` diagonal 105°, loop 5s desfasado 2.5s. `overflow: hidden` para contener el destello. `z-index` para que pase detrás del texto. |
| **Hover naranja en letras auth** | ✅ | `.btn-register:hover .link-login` y `.btn-login:hover .link-register` con `color: var(--color-acento-naranja)`. |
| **Header-manager sync** | ✅ | `npm run build:header` ejecutado. Bundle `react-header.bundle.js` (772.5kb) actualizado. 1 warning no crítico (`duplicate-object-key` en `api.js`). |
| **Hero Carousel — Admin-managed Media** | ✅ | Carrusel fullscreen en `Hero.jsx`: hasta 4 slides (imagen URL / YouTube / Google Drive / Vimeo / .mp4). Transición derecha→izquierda. Carga perezosa de iframes (src vacío hasta que el slide es activo). Fallback a `hero-banner.jpg` si no hay slides. CSS en `hero.css`. Endpoints: `site_config.php` (GET) + `admin_site_config.php` (POST) con key `hero_slides` (JSON). Tab "Hero Carrusel" integrado en modal `openContentManager()` de `admin_content.js`. |

---
## 📋 TASK: Hero Carousel v2 — 28 Feb 2026

| Acción / Requerimiento | Estado | Nota |
| :--- | :---: | :--- |
| **[HERO-01] Botón "Subir archivo" embebido en el campo URL** | ✅ | Botón integrado en el input con icono de nube. |
| **[HERO-02] Subida de archivo local al servidor** | ✅ | Endpoint `admin_upload_hero_media.php` funcional. Guarda en `public/uploads/hero/`. |
| **[HERO-03] Botón de ayuda — Requisitos de media (info pill)** | ✅ | Info-pill con tooltip hover indicando formatos, pesos y resoluciones. |
| **[HERO-04] Quinto slide — Transmisión en vivo (Live Stream)** | ✅ | Slot 5 dedicado con badge ROJO. El auto-avance se detiene al llegar al Live para priorizar la transmisión. |
| **[HERO-05] Controles de volumen para videos y streaming** | ✅ | Overlay con icono mute y slider de volumen para videos nativos. |
| **[HERO-06] Slider de reproducción para videos nativos** | ✅ | Barra de progreso `seek-bar` con tiempo actual/total funcional. |
| **[HERO-07] Ajuste backend `admin_upload_hero_media.php`** | ✅ | Validaciones de MIME y tamaño de archivo (5MB/50MB) implementadas. |
| **[HERO-08] Lógica inteligente de carrusel con videos** | ✅ | 7 seg intervalo. Volumen inicial 25%. Detecta activación volumen → bloquea auto-advance. Documentación admin integrada. |
| **[HERO-09] QA y build de producción** | ⏳ | Probar: imagen 7seg automático · video mudo 7seg → siguiente · video con volumen BLOQUEADO hasta fin · livestream bloqueado. `npm run build`. Commit y push. |

---
## 📋 TASK: React SPA Admin Dashboard v3 — 2 Mar 2026

| Acción / Requerimiento | Estado | Nota |
| :--- | :---: | :--- |
| **[ADMIN-DASH-01] Migración SPA completa Dashboard** | ✅ | PrivateRoute, AdminPanel, ProfesorPanel, EstudiantePanel, Dashboard.jsx con routing v7. |
| **[ADMIN-DASH-02] Limpieza referencias legacy gestion.html** | ✅ | 62 archivos auditados. 8 HTML deprecados + 5 JS deprecados eliminados. Header.jsx corregido. |
| **[ADMIN-DASH-03] AdminPanel consolidado (6 módulos)** | ✅ | Usuarios, Programas, Cargos, Contenido Web, Eventos, Almacenamiento. |
| **[ADMIN-DASH-04] Modal AdminContentWeb con 4 tabs** | ✅ | Glassmorphism overlay + tab switcher. AboutCardsTab, MissionValuesTab, EnrollmentTab, HeroCarouselTab. |
| **[ADMIN-DASH-05] Control total del administrador — AboutCardsTab** | ✅ | Edición: Título, Subtítulo, Contenido, Imagen (upload FileReader), Ícono. |
| **[ADMIN-DASH-06] Control total del administrador — MissionValuesTab** | ✅ | Edición: Título, Descripción, Ícono. 4 valores: Excelencia, Pasión, Innovación, Respeto. |
| **[ADMIN-DASH-07] Control total del administrador — EnrollmentTab** | ✅ | Edición: Status (open/closed), Fechas inicio/fin, Mensaje matrículas abiertas/cerradas. |
| **[ADMIN-DASH-08] Control total del administrador — HeroCarouselTab (v3)** | ✅ | Hasta 4 slides. **Nuevos campos**: Mensaje Principal, Texto del Botón, Mensaje del Botón. Media type selector imagen/video. Upload FileReader para ambos. |
| **[ADMIN-DASH-09] HeroCarouselTab avanzado (v4) — Streaming + Metadatos** | ✅ | **Livestream**: Slide 5 dedicado, URL configurable, bloquea carrusel cuando activa. **Metadatos**: Tooltip "i" con tamaño, resolución, duración. **Volumen**: Videos sin sonido por defecto, user puede activar. **Carrusel bloqueado** durante reproducción. |
| **[ADMIN-DASH-10] Integración API backend — HeroCarouselTab** | ✅ | Conectado a `site_config.php` para GET + `admin_site_config.php` para POST. Admin panel ahora muestra imágenes REALES del sitio web. |
