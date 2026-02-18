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
- **Corrección Crítica**: Se solucionó un error lógico en `user_profile_modal.js` donde siempre se enviaba el ID del usuario en sesión en lugar del usuario objetivo al editar. Ahora utiliza `window.currentModalUserId`.
- **Refresco de Datos**: Se implementó "cache busting" (`?t=timestamp`) en `ApiService.getUsers()` y se aseguró que la tabla de usuarios se recargue automáticamente tras una edición exitosa.
- **Permisos de Admin**: Se habilitó `adminUpdateUserFull` en el modal de perfil para permitir a administradores cambiar roles y correos electrónicos.
- **UX**: Se restringió la edición de email en el modal para usuarios no administradores, alineando la interfaz con las capacidades del backend actual.

### Correcciones de Estabilidad (Producción)
- **Diagnóstico y Solución de errores 500**: Se identificó que el error se debía a credenciales incorrectas en `connection.php` al momento de desplegar. El usuario corrigió las credenciales.
- **Robustez**: Se mantuvieron los bloques `try-catch` en los endpoints de autenticación (`login.php`, `register.php`, `recover_request.php`) para un mejor manejo de excepciones futuras, pero se revirtió `display_errors` a 0 para seguridad en producción.

### Estado Actual
- **Estable y Funcional**: El sistema está operando correctamente en producción (Zrok/InfinityFree).
- **Funcionalidad Verificada**: El cambio de roles por parte de administradores ha sido confirmado como exitoso por el usuario.

## 2026-02-17: Optimización de Rendimiento y Refinado Estético

### Objetivo
Resolver problemas de "hang" (carga infinita) causados por ineficiencia en la API, corregir errores de referencia en el dashboard y unificar la estética de los componentes administrativos.

### Cambios Realizados

#### 1. Optimización de Backend (API de Cursos)
- **Refactorización de `get_courses.php`**: Se eliminó el problema de "N+1 consultas". La API ahora realiza solo 3 consultas SQL optimizadas para traer cursos, horarios y docentes, reduciendo el riesgo de errores **502 Bad Gateway** en túneles zrok/producción.
- **Integridad de Datos**: Se actualizó `admin_get_pending_enrollments.php` para utilizar la tabla `schedule_teachers`, asegurando que las solicitudes pendientes muestren correctamente los nombres de los docentes.
- **Fix de Desvinculación**: Se corrigió el nombre de la columna (`id_enrollment` a `enrollment_id`) en el endpoint de desinscripción.

#### 2. Estabilización de UI (`dashboard.js`)
- **Fix de ReferenceErrors**: Se corrigieron errores fatales causados por variables no declaradas (`teacherAvatar`, `avatarEl`, `colAvatar`). Ahora se inicializan de forma segura mediante `document.getElementById`.
- **Limpieza de Conflictos**: Se removió `admin_shared_academic.js` de `gestion.html` para evitar colisiones con el nuevo controlador `admin_academic_schedules.js`.

#### 3. Refinado Estético (UI "Digna")
- **Botón de Cierre Premium**: Se rediseñó el botón de cierre de los modales y de SweetAlert2. Ahora es un elemento circular, semi-transparente, con bordes de 1px y efectos de rotación suave en el `hover`, alineado con el Brandbook del proyecto.
- **Consistencia Visual**: Se reemplazaron caracteres de texto por iconos vectoriales (`bi-x-lg`) en los controles de cierre para mayor nitidez.

### Verificación
- **Prueba de Carga**: La respuesta de la API de cursos es ahora instantánea, resolviendo el hang tras el refresco de página.
- **Confirmación de Estética**: El usuario validó la nueva apariencia del botón de cierre.
- **Estado de Sesión**: Se identificó que los errores 401 son temporales por expiración de sesión y se solucionan con un re-login.

### Estado Actual
- **Alta Disponibilidad**: El sistema no presenta hangs críticos al refrescar.
- **UI Premium**: La gestión académica ahora cuenta con una interfaz pulida y consistente.
