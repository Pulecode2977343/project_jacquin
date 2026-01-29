# Contexto del Proyecto: JACQUIN Academia Musical

## Descripción General
Plataforma web para una academia de música que incluye:
- **Landing Page:** Diseño moderno, carruseles, modales informativos.
- **Backend:** PHP nativo (sin frameworks) con base de datos MySQL (`jam_db`).
- **Portal de Estudiantes/Profesores:** Login, perfil, descarga de documentos PDF (funciones del cargo).
- **Hosting:** Desplegado en InfinityFree (producción) y entorno local XAMPP.

## Estructura Técnica Relevante
- **Ruta Local:** `D:\Documentos\GitHub\project_jacquin`
- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (Módulos ES6).
  - Usa `Swiper.js` para carruseles.
  - Componentes Web Components en `web_page/pages/js/components`.
- **Backend:** `jacquin_api/`
  - Configuración DB en `jacquin_api/config/connection.php` (híbrido MySQLi/PDO).
  - Endpoints tipo `login.php`, `get_events.php`.
- **Documentación:**
  - `GUIA_SUBIR_ACTUALIZACION.md`: Pasos para despliegue.
  - `COMPONENTE_LOGO_MEMBRETE.md`: Detalles del logo SVG dinámico.

## Estado Actual (Enero 2026)
- **Funcionalidades Clave:**
  - Login arreglado (reparado error 500 por conflicto PDO/MySQLi).
  - Generación de PDF de funciones con logo institucional SVG (color naranja).
  - Visualización de eventos (manejo de estado vacío mejorado).
  - Acceso remoto para pruebas vía **zrok** (script `INICIAR_ZROK.bat`).

## Notas para el Futuro Desarrollador/IA
1. **Conexión DB Local:** El archivo `connection.php` local está configurado para XAMPP (`root`, sin pass). NO SOBRESCRIBIR con la config de producción al subir, a menos que se sepa lo que se hace.
2. **Git:** La rama principal es `main`.
3. **Zrok:** Se usa un enlace permanente (`lsw34loontpx`) para demostraciones.

## Próximos Pasos (Pendientes/Feedback)
- Revisar feedback de usuarios reales.
- Posibles ajustes en la lógica de inscripción a eventos.
- Optimización de carga de imágenes si es necesario.
