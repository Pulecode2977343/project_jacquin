# Contexto del Proyecto: JACQUIN Academia Musical

## Descripción General
Plataforma web para una academia de música de Santa Marta que incluye:
- **Landing Page:** Diseño moderno, carruseles, modales informativos (Glassmorphism + Neumorphism).
- **Backend:** PHP nativo (sin frameworks) con base de datos MySQL (`jam_db`).
- **Portal de Estudiantes/Profesores:** Login, perfil, descarga de manuales de funciones (PDF generado dinámicamente).
- **Hosting:** Desplegado en InfinityFree (producción) y entorno local XAMPP.

## Identidad Visual (Brandbook)
### Tipografía
- **Principal (Texto):** `Poppins` (Light, Regular, Medium, SemiBold, Bold, ExtraBold, Black).
- **Decorativa (Títulos/Detalles):** `Lancelot` (Regular).

### Paleta de Colores
- **🔵 Azul Principal:** `#223F61` (Base de la interfaz)
- **🟠 Naranja Acento:** `#E78C3B` (Botones y destacados)
- **🔥 Naranja Neón:** `#f97316` / `#ff6b35` (Brillos y Logo Institucional)
- **💧 Azul Acento:** `#93B6EE` (Subtítulos e iconos)
- **🟣 Púrpura Neón:** `#8e44ad` (Gradientes y detalles)
- **⚪ Blanco Neutro:** `#dddddd` (Texto principal)

## Estructura Técnica y Enlaces Simbólicos (Espejo)
Para evitar duplicidad de archivos y problemas de sincronización con Git vs XAMPP, el proyecto usa **Junctions (Enlaces Simbólicos)** en el entorno de desarrollo local.

### ⚠️ Importante: Configuración Local
El código fuente "real" vive en `D:\Documentos\GitHub\project_jacquin`.
XAMPP (`C:\xampp\htdocs`) no tiene copias de los archivos, sino **enlaces** que apuntan al repositorio.

**Mapeo de Carpetas (Junctions):**
1. **Frontend:** `C:\xampp\htdocs\jacquin_web` ➡️ `...\project_jacquin\web_page`
2. **Backend:** `C:\xampp\htdocs\jacquin_api` ➡️ `...\project_jacquin\jacquin_api`

Esto permite editar en la carpeta de GitHub y ver los cambios reflejados instantáneamente en `localhost` sin copiar archivos.

## Estado Actual (Enero 2026)
- **Login:** Reparado error 500 por conflicto de drivers (MySQLi vs PDO).
- **Componente Logo:** Implementado `<logo-membrete>` SVG dinámico color naranja.
- **Eventos:** Corregido bug donde eventos válidos no se mostraban por conexión DB errónea.
- **Zrok:** Script `INICIAR_ZROK.bat` configurado para acceso remoto rápido.

## Notas para el Futuro Desarrollador/IA
1. **Conexión DB Local:** `jacquin_api/config/connection.php` local está configurado para XAMPP (`root`, sin pass). NO SOBRESCRIBIR con la config de producción al subir.
2. **Git:** La rama principal es `main`.
3. **Despliegue:** Al subir a producción (InfinityFree), asegurar que `connection.php` use las credenciales del hosting (`sql311...`).
