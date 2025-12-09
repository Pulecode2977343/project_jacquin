// 1. "Escuchar" cuando todo el HTML se haya cargado
document.addEventListener('DOMContentLoaded', () => {

  // 2. Seleccionar el formulario por el ID que le dimos
  const loginForm = document.getElementById('login-form');
  
  // 3. Seleccionar el párrafo donde mostraremos los mensajes
  const mensajeRespuesta = document.getElementById('mensaje-respuesta');

  // 4. Añadir un "escuchador" para el evento 'submit' (cuando el usuario da "Ingresar")
  loginForm.addEventListener('submit', async (event) => {
    
    // 5. ¡CRÍTICO! Evita que el formulario se envíe de la forma tradicional (recargando la página)
    event.preventDefault(); 

    // 6. Seleccionar y obtener los valores de los inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // 7. Crear el objeto de datos que enviaremos a la API
    // (Debe coincidir con lo que espera tu API: correo_electronico y contrasena)
    const data = {
      correo_electronico: email,
      contrasena: password
    };

    // 8. Usar 'fetch' para enviar los datos a la API (igual que en React)
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST', // Usamos POST para login
        headers: {
          'Content-Type': 'application/json' // Le decimos a la API que enviaremos JSON
        },
        body: JSON.stringify(data) // Convertimos nuestro objeto JS a un string JSON
      });

      // 9. Convertir la respuesta de la API a JSON
      const result = await response.json();

      // 10. Comprobar si la autenticación fue exitosa o no
      if (response.ok) {
        // response.ok es 'true' si el status es 200-299 (¡Éxito!)
        mensajeRespuesta.textContent = result.mensaje; // "Autenticación satisfactoria"
        mensajeRespuesta.style.color = 'green';
        
        // Opcional: Redirigir al usuario a una página de "bienvenida"
        // window.location.href = 'dashboard.html'; 
      } else {
        // El status fue 401 (Error en autenticación) o 400
        mensajeRespuesta.textContent = result.mensaje; // "Error en la autenticación"
        mensajeRespuesta.style.color = 'red';
      }

    } catch (error) {
      // Error de red (ej: la API no está corriendo)
      console.error('Error en la conexión:', error);
      mensajeRespuesta.textContent = 'Error: No se pudo conectar con el servidor.';
      mensajeRespuesta.style.color = 'red';
    }
  });
});