document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const mensajeRespuesta = document.getElementById('mensaje-respuesta');

    // Verificamos que el formulario exista para evitar errores
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // 1. Evita que la página se recargue

            // 2. Capturar los datos del HTML
            const fullName = document.getElementById('full-name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // 3. Lógica para separar Nombre y Apellido
            const nameParts = fullName.trim().split(' ');
            const nombre = nameParts[0];
            const apellido = nameParts.slice(1).join(' ') || 'Pendiente'; // Si no pone apellido, guarda 'Pendiente'

            // 4. Preparar el paquete de datos (JSON)
            // Las claves (izquierda) deben coincidir con lo que espera tu Backend
            const datosUsuario = {
                nombre: nombre,
                apellido: apellido,
                correo_electronico: email,
                contrasena: password
                // El backend asigna id_rol: 3 automáticamente
            };

            try {
                // 5. Enviar los datos a la API
                const response = await fetch('http://localhost:3000/api/empleados', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datosUsuario)
                });

                const result = await response.json();

                // 6. Mostrar el resultado al usuario
                if (response.ok) {
                    mensajeRespuesta.textContent = '¡Registro Exitoso! Usuario guardado.';
                    mensajeRespuesta.style.color = 'green';
                    registerForm.reset(); // Limpia el formulario
                } else {
                    mensajeRespuesta.textContent = 'Error: ' + (result.status || 'No se pudo guardar');
                    mensajeRespuesta.style.color = 'red';
                }

            } catch (error) {
                console.error('Error de conexión:', error);
                mensajeRespuesta.textContent = 'Error: No se pudo conectar con el servidor.';
                mensajeRespuesta.style.color = 'red';
            }
        });
    }
});