# Bitácora de Desarrollo - Proyecto Jacquin

## 2026-02-16: Estabilización de Enrutamiento API y Soporte Zrok

### Objetivo
Corregir errores de carga de recursos ("undefined BASE_URL", 502 Bad Gateway) y asegurar que la aplicación funcione correctamente tanto en entorno local (`localhost`) como a través del túnel `zrok`.

### Cambios Realizados

#### 1. Arquitectura de API (`api.js`)
- **Dinámismo en `BASE_URL`**: Se implementó una lógica en `API_CONFIG.BASE_URL` que detecta dinámicamente la profundidad del path actual (si está en raiz `web_page/` o en `pages/`) para construir la ruta relativa correcta hacia `jacquin_api/`.
- **Declaración Segura**: Se cambiaron las declaraciones de `window.API_CONFIG` a `var API_CONFIG` para mejorar la compatibilidad y evitar errores de re-declaración en cargas múltiples.
- **Versiones de Scripts**: Se actualizó la versión de llamada de `api.js` a `v4.4` en todos los archivos HTML principales (`index.html`, `gestion.html`, `admin_users.html`, `login.html`, `registro.html`, `reset.html`) para forzar la actualización de caché en navegadores y proxies.

#### 2. Refactorización de Componentes (`dashboard.js` y `user_profile_modal.js`)
- **Manejo de Avatares**: Se reemplazaron todas las referencias directas a rutas de imágenes (ej: `../assets/...` o URLs relativas simples) por el uso consistente de `ApiService.BASE_URL`.
- **Lógica**:
  ```javascript
  // Antes
  img.src = user.avatar_url;
  
  // Ahora
  const avatarUrl = user.avatar_url.startsWith('http') 
      ? user.avatar_url 
      : (ApiService.BASE_URL + user.avatar_url);
  img.src = avatarUrl;
  ```
  Esto asegura que las imágenes se carguen correctamente independientemente de si el usuario está accediendo desde la raiz o una subcarpeta, y a través del túnel.

#### 3. Limpieza de Código (`gestion.html`)
- Se eliminaron bloques de código duplicados y scripts redundantes que causaban conflictos en la carga del dashboard administrativo.

### Verificación
- **Prueba en Zrok**: Se verificó el acceso a `admin_users.html` a través del túnel público. La lista de usuarios cargó correctamente (10 usuarios), confirmando que la conexión API es estable.
- **Consola**: Se confirmó que `ApiService` y `API_CONFIG` están definidos correctamente en el ámbito global.
- **Perfil de Usuario**: Se verificó mediante análisis de código que `user_profile_modal.js` utiliza correctamente `ApiService.BASE_URL` para la petición `POST` a `update_profile.php`, enviando el payload JSON esperado por el backend (`id_usuario`, `full_name`, `n_phone`). Se confirmó que `gestion.html` carga este script en la versión `v5.0` después de `api.js`.

### Estado Actual
- **Estable**: El dashboard administrativo y la gestión de usuarios son funcionales.
- **Pendiente**: Monitoreo continuo de la estabilidad del túnel Zrok.
