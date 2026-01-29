# ✅ CHECKLIST DE DESPLIEGUE - Jacquin Academia Musical

## 📋 Antes de Empezar

- [ ] Tengo acceso a mi cuenta de InfinityFree
- [ ] Tengo FileZilla o cliente FTP instalado
- [ ] XAMPP está corriendo en mi computadora local
- [ ] He hecho backup de toda mi base de datos

---

## 🗄️ PASO 1: Base de Datos (30 min aprox)

### Exportar Base de Datos Local
- [ ] Ejecuté el archivo `export_database.bat`
- [ ] Se creó el archivo `.sql` correctamente
- [ ] Abrí el archivo SQL en un editor de texto
- [ ] Verifiqué que NO contenga comandos `DROP TABLE`

### Crear Base de Datos en InfinityFree
- [ ] Ingresé al cPanel de InfinityFree
- [ ] Fui a "MySQL Databases"
- [ ] Creé una nueva base de datos
- [ ] Anoté el nombre completo (ej: `ifdb_12345_jacquin`)
- [ ] Anoté el usuario MySQL (ej: `ifdb_12345`)
- [ ] Anoté la contraseña

### Importar Base de Datos
- [ ] Abrí phpMyAdmin en InfinityFree (desde cPanel)
- [ ] Seleccioné mi base de datos
- [ ] Click en "Importar"
- [ ] Subí el archivo .sql
- [ ] La importación fue exitosa
- [ ] Verifiqué que las tablas se crearon correctamente

**Credenciales Anotadas:**
```
MySQL Host: sql___.infinityfree.com
Database Name: ifdb_____jacquin
Username: ifdb_____
Password: _______________
```

---

## ⚙️ PASO 2: Configurar Archivos (15 min)

### Archivo de Conexión
- [ ] Abrí `jacquin_api/config/connection.TEMPLATE.php`
- [ ] Reemplacé las credenciales con los datos anotados arriba
- [ ] Guardé el archivo como `connection.php` (SIN .TEMPLATE)
- [ ] ⚠️ NO subí este archivo a Git

### Verificar Rutas
- [ ] Revisé que `web_page/pages/js/services/api.js` tenga la detección automática de rutas
- [ ] No necesito modificar nada más

---

## 📤 PASO 3: Subir Archivos vía FTP (45 min - depende de conexión)

### Conectar FTP
- [ ] Abrí FileZilla
- [ ] Configuré la conexión con mis credenciales de InfinityFree:
  - Host: `ftpupload.net`
  - Usuario: (de mi panel InfinityFree)
  - Contraseña: (de mi panel InfinityFree)
  - Puerto: `21`
- [ ] Me conecté exitosamente

### Subir jacquin_api
- [ ] Navegué a `htdocs` en el servidor (panel derecho)
- [ ] Creé carpeta `jacquin_api` si no existe
- [ ] Subí TODO el contenido de `D:\Documentos\GitHub\project_jacquin\jacquin_api\` 
- [ ] **EXCEPTO**:
  - ❌ `.git/`
  - ❌ `node_modules/`
  - ❌ Archivos `.md` (documentación)
- [ ] Subí el archivo `connection.php` configurado (importante!)
- [ ] Subí el archivo `.htaccess` que se creó

### Subir jacquin_web
- [ ] Creé carpeta `jacquin_web` en `htdocs`
- [ ] Subí TODO el contenido de `D:\Documentos\GitHub\project_jacquin\web_page\`
- [ ] **EXCEPTO**:
  - ❌ `.git/`
  - ❌ Archivos `.md`

### Verificar Permisos
- [ ] Click derecho en carpeta `jacquin_api` → Permisos → `755`
- [ ] Click derecho en carpeta `jacquin_web` → Permisos → `755`
- [ ] Los archivos .php tienen permiso `644`

**Tiempo de subida:** ______ minutos

---

## 🧪 PASO 4: Pruebas (15 min)

### Prueba 1: API Básica
- [ ] Visité: `http://midominio.epizy.com/jacquin_api/index.php`
- [ ] Vi el mensaje: "Jacquin API working..."
- [ ] ✅ La API responde

### Prueba 2: Conexión a Base de Datos
- [ ] Visité: `http://midominio.epizy.com/jacquin_api/get_events.php`
- [ ] Vi un JSON con la estructura `{"success":true,"data":[...]}`
- [ ] ✅ La base de datos está conectada

### Prueba 3: Página Principal
- [ ] Visité: `http://midominio.epizy.com/jacquin_web/pages/index.html`
- [ ] La página cargó completamente
- [ ] Vi el logo de Jacquin
- [ ] Vi la sección Hero (imagen de fondo)
- [ ] El menú funciona
- [ ] ✅ La página principal funciona

### Prueba 4: Datos Dinámicos
- [ ] En la página principal, vi los eventos cargados desde la BD
- [ ] Los programas se muestran en el carrusel
- [ ] La sección "Sobre Nosotros" carga
- [ ] ✅ Los datos dinámicos funcionan

### Prueba 5: Login/Registro
- [ ] Intenté registrarme con un usuario de prueba
- [ ] Recibí el email de verificación (o apareció mensaje de éxito)
- [ ] Pude hacer login
- [ ] El dashboard/gestión carga correctamente
- [ ] ✅ El sistema de autenticación funciona

---

## 🐛 PASO 5: Solución de Problemas

### Si la API no funciona (Error 500 o 403):
- [ ] Revisé los logs en cPanel → Error Logs
- [ ] Verifiqué que `connection.php` tenga las credenciales correctas
- [ ] Verifiqué permisos de archivos (644) y carpetas (755)
- [ ] Probé acceder a archivos individuales para ver cuál falla

### Si la base de datos no conecta:
- [ ] Revisé que el host sea `sqlXXX.infinityfree.com` (NO localhost)
- [ ] Verifiqué usuario y contraseña en phpMyAdmin
- [ ] Comprobé que el nombre de BD sea exacto (con prefijo `ifdb_`)

### Si aparece "CORS error":
- [ ] Verifiqué que `.htaccess` esté en `jacquin_api/`
- [ ] Revisé que tenga las líneas de Access-Control

### Si la página se ve sin estilos:
- [ ] Revisé la consola del navegador (F12)
- [ ] Verifiqué rutas de archivos CSS en `index.html`
- [ ] Comprobé que las rutas sean relativas, no absolutas

---

## 🎯 PASO 6: Optimizaciones Post-Despliegue

- [ ] Configuré dominio personalizado (si tengo uno)
- [ ] Agregué SSL/HTTPS (InfinityFree lo ofrece gratis)
- [ ] Revisé velocidad en PageSpeed Insights
- [ ] Probé en diferentes navegadores (Chrome, Firefox, Edge)
- [ ] Probé en móvil
- [ ] Pedí a alguien más que probara el sitio

---

## 🔐 PASO 7: Seguridad

- [ ] Cambié las contraseñas por defecto de la BD
- [ ] NO subí archivos con credenciales a Git
- [ ] Activé SSL/HTTPS
- [ ] Configuré backup automático en InfinityFree (si disponible)
- [ ] Documenté todas las credenciales en un lugar seguro (1Password, KeePass, etc.)

---

## 📊 ESTADÍSTICAS DEL DESPLIEGUE

**Fecha de despliegue:** ___ / ___ / ______

**Tiempo total invertido:** _______ horas

**Problemas encontrados:**
1. 
2. 
3. 

**Soluciones aplicadas:**
1. 
2. 
3. 

---

## 🎉 ¡SITIO EN VIVO!

**URL Principal:** http://_______________.epizy.com/jacquin_web/pages/

**URL API:** http://_______________.epizy.com/jacquin_api/

**Panel Admin:** http://_______________.epizy.com/jacquin_web/pages/gestion.html

**Compartir en:**
- [ ] WhatsApp
- [ ] Facebook
- [ ] Instagram
- [ ] Email a clientes

---

**✅ CHECKLIST COMPLETADO** - ¡Felicidades, tu sitio está en producción! 🎹🚀
