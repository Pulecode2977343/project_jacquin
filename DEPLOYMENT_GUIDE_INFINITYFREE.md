# 🚀 Guía de Despliegue - Jacquin Academia Musical en InfinityFree

## Requisitos Previos
- ✅ Cuenta de InfinityFree creada
- ✅ Cliente FTP (FileZilla recomendado)
- ✅ Navegador con acceso a cPanel

---

## PASO 1: Configuración Inicial en InfinityFree

### 1.1 Crear cuenta y obtener credenciales
1. Ve a https://infinityfree.net
2. Crea tu cuenta gratuita
3. Elige tu subdominio (ej: `jacquin.epizy.com` o usa dominio personalizado)
4. Anota las credenciales que recibirás por email:
   - FTP Host
   - FTP Username
   - FTP Password
   - MySQL Host
   - MySQL Database Name
   - MySQL Username
   - MySQL Password

---

## PASO 2: Preparar Base de Datos

### 2.1 Exportar base de datos local
1. Abre phpMyAdmin en XAMPP: http://localhost/phpmyadmin
2. Selecciona la base de datos `jacquin_db`
3. Click en "Exportar"
4. Selecciona "Método personalizado"
5. **IMPORTANTE**: En "Estructura", desmarca "Añadir DROP TABLE"
6. Click en "Continuar" para descargar el archivo SQL

### 2.2 Crear base de datos en InfinityFree
1. Ingresa al cPanel de InfinityFree
2. Ve a "MySQL Databases"
3. Crea una nueva base de datos (InfinityFree le agregará un prefijo automáticamente)
4. Anota el nombre completo (ej: `ifdb_12345_jacquin`)

### 2.3 Importar base de datos
1. En cPanel, abre "phpMyAdmin"
2. Selecciona tu base de datos creada
3. Click en "Importar"
4. Sube el archivo SQL exportado
5. Click en "Continuar"

---

## PASO 3: Configurar Archivos de Conexión

### 3.1 Archivo de configuración para producción
Crea el archivo `jacquin_api/config/connection.php` con este contenido:

```php
<?php
// Production Database Configuration for InfinityFree
$host = 'sqlXXX.infinityfree.com'; // Reemplaza con tu host MySQL
$dbname = 'ifdb_XXXXX_jacquin';    // Reemplaza con tu nombre de BD
$username = 'ifdb_XXXXX';          // Reemplaza con tu usuario MySQL
$password = 'TU_PASSWORD_AQUI';    // Reemplaza con tu contraseña

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    
    // Legacy mysqli for compatibility
    $conn = new mysqli($host, $username, $password, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    $conn->set_charset("utf8mb4");
    
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>
```

**⚠️ IMPORTANTE**: Nunca subas este archivo a Git con credenciales reales.

---

## PASO 4: Ajustar Rutas en Código

### 4.1 Actualizar API Base URL
En `web_page/pages/js/services/api.js`, la configuración actual ya detecta automáticamente la ruta, pero verifica que en producción use:

```javascript
// La detección automática debería funcionar, pero si hay problemas:
BASE_URL: "/jacquin_api/"  // o "../jacquin_api/" según estructura
```

### 4.2 Verificar estructura de carpetas en servidor
En InfinityFree, tu estructura debe ser:
```
htdocs/
├── jacquin_api/           (carpeta de API)
│   ├── config/
│   ├── public/
│   ├── get_events.php
│   └── ...
└── jacquin_web/           (carpeta web)
    └── pages/
        ├── index.html
        ├── js/
        └── css/
```

---

## PASO 5: Subir Archivos vía FTP

### 5.1 Configurar FileZilla
1. Abre FileZilla
2. Host: `ftpupload.net`
3. Usuario: El que te dio InfinityFree
4. Contraseña: La que configuraste
5. Puerto: 21
6. Click en "Conexión rápida"

### 5.2 Subir carpetas
1. Navega a `htdocs` en el lado derecho (servidor)
2. **Sube estas carpetas desde tu proyecto local:**
   - `D:\Documentos\GitHub\project_jacquin\jacquin_api` → `htdocs/jacquin_api`
   - `D:\Documentos\GitHub\project_jacquin\web_page` → `htdocs/jacquin_web`

### 5.3 Archivos a NO subir
- ❌ `node_modules/`
- ❌ `.git/`
- ❌ Archivos de configuración local con credenciales
- ❌ Carpeta `vendor/` si existe (subirla puede dar problemas)

---

## PASO 6: Configurar Variables de Entorno (Opcional)

Si usas Brevo u otros servicios:
1. Crea `.env` en el servidor (vía FTP o File Manager)
2. Agrega tus claves API

---

## PASO 7: Pruebas Finales

### 7.1 Verificar API
Visita: `http://tudominio.epizy.com/jacquin_api/index.php`
Deberías ver: "Jacquin API working..."

### 7.2 Verificar base de datos
Visita: `http://tudominio.epizy.com/jacquin_api/get_events.php`
Deberías ver JSON con eventos

### 7.3 Abrir página principal
Visita: `http://tudominio.epizy.com/jacquin_web/pages/index.html`
La página debería cargar completamente con datos

---

## ⚠️ Problemas Comunes en InfinityFree

### 1. Error 403 Forbidden
- Solución: Verifica permisos de carpetas (755) y archivos (644)

### 2. Error de conexión a BD
- Solución: Verifica que usas el host correcto (sqlXXX.infinityfree.com)
- InfinityFree NO permite conexiones remotas a MySQL

### 3. Archivos no se ven
- Solución: Verifica que estén en `htdocs/`
- El índice por defecto debe ser `index.html` o `index.php`

### 4. CORS Errors
- Solución: El archivo `config/cors.php` ya está configurado correctamente

---

## 🔐 Seguridad en Producción

### Archivos que DEBES proteger:
1. `jacquin_api/config/connection.php` - Nunca en Git
2. `.env` si lo usas
3. Credenciales de Brevo

### Recomendaciones:
- ✅ Usa `.htaccess` para proteger carpetas sensibles
- ✅ Cambia contraseñas de MySQL regularmente
- ✅ Mantén backups de la base de datos
- ✅ Actualiza phpMyAdmin si es posible

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en cPanel → Error Logs
2. Verifica phpMyAdmin para errores de base de datos
3. Usa Chrome DevTools (F12) para errores de frontend

---

## ✅ Checklist Final

- [ ] Base de datos creada e importada en InfinityFree
- [ ] Archivo connection.php configurado con credenciales correctas
- [ ] Carpetas jacquin_api y jacquin_web subidas vía FTP
- [ ] Permisos de archivos configurados correctamente
- [ ] API responde correctamente (/jacquin_api/index.php)
- [ ] Página principal carga con datos (/jacquin_web/pages/index.html)
- [ ] Login funciona correctamente
- [ ] Registro de usuarios funciona
- [ ] Eventos se muestran en la página

---

**¡Felicidades! Tu sitio está en vivo 🎉🎹**
