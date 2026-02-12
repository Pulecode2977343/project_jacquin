# Manual Técnico: Academia Musical JACQUIN 🎶
## Todo lo que necesitas saber para gestionar y entender el sistema

---

## 1. ¿Qué es este proyecto?
Es la plataforma digital de la **Academia Musical JACQUIN**. No es solo una web; es un sistema que conecta a estudiantes, profesores y administradores para que la música no pare. 

Aquí gestionamos desde quién enseña qué instrumento hasta el inventario de pianos y las inscripciones a los próximos conciertos. Todo de forma rápida y sin líos.

---

## 2. Las piezas del motor (Arquitectura)
El sistema está dividido en dos grandes bloques que se hablan entre sí:

*   **La Web (Frontend):** Lo que ve el usuario. Está hecha con HTML, CSS y JavaScript puro. Es rápida, limpia y se adapta a cualquier pantalla (PC o móvil).
*   **La API (Backend):** El cerebro que vive en el servidor. Escrito en PHP, se encarga de guardar datos, enviar correos y asegurar que solo los autorizados entren.
*   **Base de Datos:** Un almacén MySQL donde guardamos toda la información de forma segura.

---

## 3. Ponlo a funcionar en 5 pasos (Instalación)
Si quieres tenerlo en tu computadora para probar o desarrollar, sigue este paso a paso:

1.  **Descarga XAMPP:** Instálalo y asegúrate de que use PHP 8 o superior.
2.  **Copia los archivos:** Pon la carpeta del proyecto dentro de `C:/xampp/htdocs/`.
3.  **Importa la Base de Datos:** Entra a `phpMyAdmin`, crea una base de datos nueva y sube el archivo SQL que está en `jacquin_api/database/`.
4.  **Configura la conexión:** Ve a `jacquin_api/config/env.php` (o crea uno basado en el ejemplo) y pon el nombre de tu base de datos y tu usuario de MySQL.
5.  **¡Listo!:** Abre tu navegador en `http://localhost/project_jacquin/web_page` y empieza a navegar.

---

## 4. ¿Dónde está cada cosa? (Estructura)

### 📂 Web Page (Interfaz)
*   **`/pages`**: Aquí están todos los archivos HTML (la cara de la web).
*   **`/js`**: Los scripts que hacen que las cosas se muevan y carguen datos.
*   **`/css`**: El diseño, los colores y las fuentes.
*   **`/uploads`**: Donde se guardan las fotos de los eventos y alumnos.

### 📂 Jacquin API (Servicios)
*   **`/config`**: La llave del sistema. Aquí se configura la base de datos y el correo.
*   **`/helpers`**: Herramientas rápidas para validar datos, enviar mails y **seguridad de acceso (`auth_helper.php`)**.
*   **`admin_*.php`**: Scripts protegidos que solo usa el administrador para gestionar la academia.

---

## 5. Cómo se usa el sistema (Flujos Clave)

### Gestión de Eventos 📅
Cuando hay un concierto nuevo, el administrador va al panel y sube la información. La API guarda la foto en la carpeta de `uploads` y la info en la base de datos. Automáticamente, la página principal muestra el nuevo evento en el carrusel.

### Inscripciones y Usuarios 👤
Los alumnos pueden registrarse y pedir clases. El sistema valida sus datos y, si el administrador lo aprueba, se le asigna un horario y un profesor. Todo queda registrado para que nadie se pierda una nota.

### Seguridad 🔒
El sistema implementa un **Helper de Autenticación (`auth_helper.php`)** que valida en cada petición administrativa que el usuario tenga una sesión activa y el rol de Administrador (`id_rol = 1`). Las contraseñas se almacenan mediante hashes seguros y el acceso al panel está restringido tanto en el Frontend como en el Backend.

---

## 6. Trucos para Desarrolladores
*   **Acceso Externo:** Si necesitas que alguien vea lo que estás haciendo desde fuera, usa el comando `INICIAR_ZROK.bat`. Te dará una URL pública temporal.
*   **Limpieza de Código:** Todo lo que no sea código de la app (documentos, backups) está en el `.gitignore`. Así el repositorio se mantiene ligero y rápido.
*   **Estilo Visual:** Aunque usamos CSS puro, nos inspiramos en sombras suaves, bordes redondeados (18px) y tipografías claras como Inter para que la experiencia sea premium.

---
**Documento creado por el equipo de Antigravity AI para Academia Musical JACQUIN.**
*Mantenlo simple, mantenlo musical.*
