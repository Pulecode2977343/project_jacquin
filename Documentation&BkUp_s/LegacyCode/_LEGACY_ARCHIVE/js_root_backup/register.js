// Register Logic
document.addEventListener('DOMContentLoaded', () => {
    // Password Toggle Logic (Added)
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('bi-eye');
            this.classList.toggle('bi-eye-slash');
        });
    }

    const registerForm = document.getElementById('register-form');
    const mensajeRespuesta = document.getElementById('mensaje-respuesta');
    const courseSelect = document.getElementById('course');

    async function populateCourseList() {
        if (!courseSelect) return;
        const res = await ApiService.getCourses();
        if (!res.success) return;

        const firstOption = courseSelect.options[0];
        courseSelect.innerHTML = '';
        courseSelect.appendChild(firstOption);

        res.data.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id_course;
            option.textContent = c.name;
            courseSelect.appendChild(option);
        });

        // Try pre-select after populating
        applyPreSelection();
    }

    // NEW: Pre-select course based on pending intent (Universal & Dynamic)
    function applyPreSelection() {
        const pendingTitle = sessionStorage.getItem('pending_enrollment_title');
        const pendingId = sessionStorage.getItem('pending_enrollment');

        if (!courseSelect || (!pendingTitle && !pendingId)) return;

        // Priorize title match for dynamic/future courses
        const searchTerm = (pendingTitle || "").toLowerCase();
        console.log("Iniciando búsqueda universal para:", searchTerm || pendingId);

        const options = Array.from(courseSelect.options);

        // 1. Try to find by specific text match (Dynamic support)
        let found = null;
        if (searchTerm) {
            found = options.find(opt => {
                const optText = opt.text.toLowerCase();
                return optText === searchTerm || optText.includes(searchTerm) || searchTerm.includes(optText);
            });
        }

        // 2. Fallback to technical ID mapping (Legacy support)
        if (!found && pendingId) {
            const idMap = {
                'program_d1': 'percusión', 'program_d2': 'guitarra',
                'program_d3': 'piano', 'program_d4': 'voz',
                'program_d5': 'seniors', 'program_d6': 'shows',
                'program_d7': 'exploración', 'program_d8': 'psicomúsica'
            };
            const mappedName = idMap[pendingId.toLowerCase()];
            if (mappedName) {
                found = options.find(opt => opt.text.toLowerCase().includes(mappedName));
            }
        }

        if (found) {
            courseSelect.value = found.value;
            console.log("Pre-selección exitosa:", found.text);
            courseSelect.style.border = "2px solid var(--color-acento-azul)";
            setTimeout(() => courseSelect.style.border = "", 2000);
        }
    }

    // NEW: Update intent if user changes selection manually
    if (courseSelect) {
        courseSelect.addEventListener('change', () => {
            const selectedText = courseSelect.options[courseSelect.selectedIndex].text;
            if (selectedText && courseSelect.value !== "") {
                console.log("Actualizando intención de inscripción a:", selectedText);
                sessionStorage.setItem('pending_enrollment_title', selectedText);

                // Also update the ID if we can find it in the programs
                const stored = localStorage.getItem('jacquin_programs');
                if (stored) {
                    const programs = JSON.parse(stored);
                    const foundKey = Object.keys(programs).find(k => programs[k].title === selectedText);
                    if (foundKey) sessionStorage.setItem('pending_enrollment', foundKey);
                }
            }
        });
    }

    // Ejecutar inicialización dinámica y pre-selección
    populateCourseList();
    setTimeout(applyPreSelection, 200);

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Prepare User Data
            const fullName = document.getElementById('full-name').value;
            const email = document.getElementById('email').value;
            const nPhone = document.getElementById('phone')?.value || "";
            const password = document.getElementById('password').value;

            // 1. Basic Validation
            if (!fullName || !email || !password) {
                mensajeRespuesta.textContent = 'Complete todos los campos obligatorios.';
                mensajeRespuesta.style.color = 'var(--color-acento-naranja)';
                return;
            }

            // 2. Advanced Password Validation (Intelligent Suggestions)
            const passwordRegex = {
                length: password.length >= 8,
                upper: /[A-Z]/.test(password),
                lower: /[a-z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
            };

            if (!Object.values(passwordRegex).every(Boolean)) {
                let errorMsg = "La contraseña debe ser más segura: ";
                if (!passwordRegex.length) errorMsg += "mínimo 8 caracteres, ";
                if (!passwordRegex.upper) errorMsg += "una mayúscula, ";
                if (!passwordRegex.number) errorMsg += "un número, ";
                if (!passwordRegex.special) errorMsg += "un carácter especial (!@#$...), ";

                mensajeRespuesta.textContent = errorMsg.slice(0, -2) + ".";
                mensajeRespuesta.style.color = 'var(--color-acento-naranja)';

                // Visual highlight
                const pInput = document.getElementById('password');
                pInput.style.border = "1px solid var(--color-acento-naranja)";
                pInput.focus();
                return;
            }

            const userData = {
                fullName: fullName,
                email: email,
                nPhone: nPhone,
                password: password,
                idCourse: document.getElementById('course').value
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