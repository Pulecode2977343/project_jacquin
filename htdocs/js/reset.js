/**
 * Password Recovery Logic
 * Multi-step process: Email -> Code -> New Password (with Strength Meter)
 */

document.addEventListener("DOMContentLoaded", () => {

    let currentStep = 1;
    let userEmail = "";
    let verifiedCode = ""; // Store locally instead of window global

    const form = document.getElementById("reset-form");
    const container = document.getElementById("reset-container");
    const title = document.querySelector("h1");
    const instructions = document.getElementById("instructions");
    const submitBtn = document.getElementById("submit-btn");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // --- CENTRALIZED FEEDBACK HANDLING ---
        let feedback = document.getElementById("feedback-msg");
        if (!feedback) {
            feedback = document.createElement("p");
            feedback.id = "feedback-msg";
            feedback.style.textAlign = "center";
            feedback.style.marginTop = "10px";
            // Insert feedback after the button container to avoid layout shifts
            submitBtn.parentElement.parentElement.appendChild(feedback);
        }
        feedback.textContent = "";

        // --- STEP 1: REQUEST CODE ---
        if (currentStep === 1) {
            const emailInput = document.getElementById("email");
            userEmail = emailInput.value.trim();

            if (!userEmail) {
                showError("Ingrese su email.");
                return;
            }

            setLoading(true, "Enviando código...");

            try {
                const res = await ApiService.requestRecoveryCode(userEmail);
                if (res.success || res.status === 200 || (res.message && res.message.includes("enviado"))) {
                    sessionStorage.setItem("jam_recovery_email", userEmail); // Save Email
                    currentStep = 2;
                    renderStep2();
                    setLoading(false, "Verificar Código");
                } else {
                    setLoading(false, "Enviar Instrucciones");
                    showError(res.message || "Error al enviar. Verifique el email.");
                }
            } catch (err) {
                setLoading(false, "Enviar Instrucciones");
                showError("Error de conexión.");
            }

            // --- STEP 2: VERIFY CODE ---
        } else if (currentStep === 2) {
            const codeInput = document.getElementById("recovery-code");
            const code = codeInput.value.trim();

            if (!code) {
                showError("Ingrese el código.");
                return;
            }

            setLoading(true, "Verificando...");

            try {
                const res = await ApiService.verifyRecoveryCode(userEmail, code);
                if (res.success) {
                    verifiedCode = code; // PERSIST CODE HERE
                    currentStep = 3;
                    renderStep3();
                    // RenderStep3 re-creates DOM, so strength listeners must be attached AFTER
                    attachPasswordStrengthLogic();
                    setLoading(false, "Restablecer Contraseña");
                } else {
                    setLoading(false, "Verificar Código");
                    showError(res.message || "Código incorrecto.");
                }
            } catch (err) {
                setLoading(false, "Verificar Código");
                showError("Error de conexión.");
            }

            // --- STEP 3: RESET PASSWORD ---
        } else if (currentStep === 3) {
            const newPass = document.getElementById("new-password").value;
            const confirmPass = document.getElementById("confirm-password").value;

            if (newPass !== confirmPass) {
                showError("Las contraseñas no coinciden.");
                return;
            }

            if (!verifiedCode) {
                showError("Sesión expirada. Reinicie el proceso.");
                setTimeout(() => window.location.reload(), 2000);
                return;
            }

            setLoading(true, "Actualizando...");

            try {
                const resFinal = await ApiService.resetPassword(userEmail, verifiedCode, newPass);

                if (resFinal.success) {
                    // Clear Session
                    sessionStorage.removeItem("jam_recovery_email");
                    sessionStorage.removeItem("jam_recovery_code");

                    feedback.textContent = resFinal.message || "¡Contraseña actualizada!";
                    feedback.style.color = "var(--verde-neon)";

                    // Success UI
                    container.innerHTML = `
                        <div style="text-align:center; padding: 20px;">
                            <i class="bi bi-check-circle-fill" style="font-size: 3rem; color: var(--verde-neon);"></i>
                            <h3 style="margin: 10px 0;">¡Éxito!</h3>
                            <p>Tu contraseña ha sido restablecida.</p>
                        </div>
                    `;
                    submitBtn.style.display = "none";

                    setTimeout(() => window.location.href = "login.html", 3000);
                } else {
                    setLoading(false, "Restablecer Contraseña");
                    showError(resFinal.message || "Error actualizando password.");
                }
            } catch (err) {
                setLoading(false, "Restablecer Contraseña");
                showError("Error crítico de conexión.");
            }
        }
    });

    // --- HELPERS ---

    function showError(msg) {
        const feedback = document.getElementById("feedback-msg");
        if (feedback) {
            feedback.textContent = msg;
            feedback.style.color = "red";
        }
    }

    function setLoading(isLoading, btnText) {
        submitBtn.disabled = isLoading;
        submitBtn.value = isLoading ? "Procesando..." : btnText;
    }

    // --- RENDERERS ---

    function renderStep2() {
        title.textContent = "Verificar Código";
        instructions.innerHTML = `Hemos enviado un código a <b>${userEmail}</b>.<br>Ingrésalo a continuación.`;

        container.innerHTML = `
            <div class="form-group">
                <label for="recovery-code">Código de Verificación</label>
                <div class="input-wrapper">
                    <i class="bi bi-key input-icon"></i>
                    <input type="text" id="recovery-code" class="form-input-glass" placeholder="123456" maxlength="6" style="letter-spacing: 5px; text-align: center; padding-left: 15px;" required>
                </div>
            </div>
        `;
    }

    function renderStep3() {
        title.textContent = "Nueva Contraseña";
        instructions.textContent = "Crea una contraseña fuerte para proteger tu cuenta.";

        container.innerHTML = `
            <div class="form-group">
                <label for="new-password">Nueva Contraseña</label>
                <div class="input-wrapper">
                    <i class="bi bi-lock input-icon"></i>
                    <input type="password" id="new-password" class="form-input-glass" placeholder="••••••••" required>
                    <i class="bi bi-eye-slash toggle-password"></i>
                </div>
                <!-- Strength Meter -->
                <div style="margin-top: 10px; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <div id="strength-bar" style="height: 100%; width: 0%; transition: width 0.3s, background 0.3s;"></div>
                </div>
                <p id="strength-text" style="font-size: 0.8rem; margin-top: 5px; color: var(--color-humo-gris); text-align: right;">Fuerza: -</p>
            </div>

            <div class="form-group">
                <label for="confirm-password">Confirmar Contraseña</label>
                <div class="input-wrapper">
                    <i class="bi bi-lock-fill input-icon"></i>
                    <input type="password" id="confirm-password" class="form-input-glass" placeholder="••••••••" required>
                    <i class="bi bi-eye-slash toggle-password"></i>
                </div>
            </div>
        `;
    }

    function attachPasswordStrengthLogic() {
        const passwordInput = document.getElementById("new-password");
        const strengthBar = document.getElementById("strength-bar");
        const strengthText = document.getElementById("strength-text");
        const toggles = document.querySelectorAll(".toggle-password");

        // Toggle Password Visibility
        toggles.forEach(icon => {
            icon.addEventListener("click", () => {
                const input = icon.previousElementSibling;
                if (input.type === "password") {
                    input.type = "text";
                    icon.classList.replace("bi-eye-slash", "bi-eye");
                } else {
                    input.type = "password";
                    icon.classList.replace("bi-eye", "bi-eye-slash");
                }
            });
        });

        // Strength Checker
        passwordInput.addEventListener("input", function () {
            const val = passwordInput.value;
            let strength = 0;
            let status = "";
            let color = "#eee";

            if (val.length >= 8) strength += 1;
            if (val.match(/[A-Z]/)) strength += 1;
            if (val.match(/[0-9]/)) strength += 1;
            if (val.match(/[^A-Za-z0-9]/)) strength += 1;

            switch (strength) {
                case 0:
                case 1:
                    status = "Débil";
                    color = "#ff4d4d"; // Red
                    break;
                case 2:
                    status = "Regular";
                    color = "#ffa500"; // Orange
                    break;
                case 3:
                    status = "Buena";
                    color = "#2ecc71"; // Green
                    break;
                case 4:
                    status = "Excelente";
                    color = "#3498db"; // Blue
                    break;
            }

            if (val.length === 0) {
                strengthBar.style.width = "0%";
                strengthText.textContent = "Fuerza: -";
            } else {
                strengthBar.style.width = (strength * 25) + "%";
                strengthBar.style.backgroundColor = color;
                strengthText.textContent = `Fuerza: ${status}`;
                strengthText.style.color = color;
            }
        });
    }

});
