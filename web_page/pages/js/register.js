// Register Logic
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const mensajeRespuesta = document.getElementById('mensaje-respuesta');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Prepare User Data
            const fullName = document.getElementById('full-name').value;
            const email = document.getElementById('email').value;
            const nPhone = document.getElementById('phone')?.value || ""; // Handle phone if present
            const password = document.getElementById('password').value;

            // Simple Validation
            if (!fullName || !email || !password) {
                mensajeRespuesta.textContent = 'Complete todos los campos obligatorios.';
                mensajeRespuesta.style.color = 'var(--color-acento-naranja)';
                return;
            }

            const userData = {
                fullName: fullName,
                email: email,
                nPhone: nPhone,
                password: password
            };

            mensajeRespuesta.textContent = 'Registrando...';
            mensajeRespuesta.style.color = '#ccc';

            try {
                const result = await ApiService.register(userData);

                if (result.success) {
                    mensajeRespuesta.textContent = '¡Registro Exitoso! Redirigiendo...';
                    mensajeRespuesta.style.color = '#2ecc71';
                    registerForm.reset();
                    
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 2000);
                } else {
                    mensajeRespuesta.textContent = result.message || 'Error al registrar.';
                    mensajeRespuesta.style.color = 'var(--color-acento-naranja)';
                }
            } catch (error) {
                console.error('Register Error:', error);
                mensajeRespuesta.textContent = 'Error de conexión.';
                mensajeRespuesta.style.color = 'red';
            }
        });
    }
});