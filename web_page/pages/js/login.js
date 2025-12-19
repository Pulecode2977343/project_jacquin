// Login Logic
document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('login-form');
    const mensajeRespuesta = document.getElementById('mensaje-respuesta');

    // Password Toggle Logic
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", () => {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);

            togglePassword.classList.toggle("bi-eye");
            togglePassword.classList.toggle("bi-eye-slash");
        });
    }

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Clear previous messages
        mensajeRespuesta.textContent = 'Procesando...';
        mensajeRespuesta.style.color = '#ccc';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            mensajeRespuesta.textContent = 'Por favor complete todos los campos';
            mensajeRespuesta.style.color = 'var(--color-acento-naranja)';
            return;
        }

        try {
            const result = await ApiService.login(email, password);

            if (result.success) {
                mensajeRespuesta.textContent = "¡Bienvenido!";
                mensajeRespuesta.style.color = '#2ecc71'; // Green

                // Save Session
                if (result.user) {
                    ApiService.saveSession(result.user);
                }

                // Redirect to dashboard logic
                setTimeout(() => {
                    window.location.href = 'gestion.html';
                }, 1000);
            } else {
                mensajeRespuesta.textContent = result.message || "Credenciales incorrectas";
                mensajeRespuesta.style.color = 'var(--color-acento-naranja)';
            }
        } catch (error) {
            console.error("Login Error:", error);
            mensajeRespuesta.textContent = "Error de conexión";
        }
    });
});