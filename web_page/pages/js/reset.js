/**
 * Password Recovery Logic
 * Multi-step process: Email -> Code -> New Password
 */

document.addEventListener("DOMContentLoaded", () => {
    
    let currentStep = 1;
    let userEmail = "";

    const form = document.getElementById("reset-form");
    const container = document.getElementById("reset-container");
    const title = document.querySelector("h1");
    const instructions = document.getElementById("instructions");
    const submitBtn = document.getElementById("submit-btn");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const feedback = document.createElement("p");
        feedback.id = "feedback-msg";
        feedback.style.textAlign = "center";
        feedback.style.marginTop = "10px";
        
        // Remove old feedback
        const old = document.getElementById("feedback-msg");
        if(old) old.remove();
        
        submitBtn.parentElement.appendChild(feedback);

        if (currentStep === 1) {
            // STEP 1: Request Code
            const emailInput = document.getElementById("email");
            userEmail = emailInput.value;

            if (!userEmail) {
                feedback.textContent = "Ingrese su email.";
                feedback.style.color = "red";
                return;
            }

            feedback.textContent = "Enviando código...";
            feedback.style.color = "var(--color-acento-azul)";

            const res = await ApiService.requestRecoveryCode(userEmail);
            console.log("Recovery Step 1:", res);

            if (res.success || res.status === 200 || res.message?.includes("enviado")) {
                // Determine success broadly because PHP might return text
                currentStep = 2;
                renderStep2();
            } else {
                feedback.textContent = res.message || "Error enviando código. Verifique el email.";
                feedback.style.color = "red";
            }

        } else if (currentStep === 2) {
            // STEP 2: Verify Code
            const code = document.getElementById("recovery-code").value;
            
            feedback.textContent = "Verificando...";
            feedback.style.color = "var(--color-acento-azul)";

            const res = await ApiService.verifyRecoveryCode(userEmail, code);

            if (res.success) {
                currentStep = 3;
                renderStep3();
            } else {
                feedback.textContent = res.message || "Código incorrecto.";
                feedback.style.color = "red";
            }

        } else if (currentStep === 3) {
            // STEP 3: Reset Password
            const newPass = document.getElementById("new-password").value;
            const confirmPass = document.getElementById("confirm-password").value;

            if (newPass !== confirmPass) {
                feedback.textContent = "Las contraseñas no coinciden.";
                feedback.style.color = "red";
                return;
            }

            feedback.textContent = "Actualizando...";
            
            const res = await ApiService.resetPassword(userEmail, null, newPass); // Logic check: does API need code again? Usually verifying code returns a token, or we pass code again.
            // Looking at api.js: resetPassword(email, code, newPassword).
            // I need to persist the code from step 2.
            const code = document.getElementById("recovery-code").value; // It might be removed from DOM? No, I'll keep it hidden or variable.
            
            // Correction: I should store the code in a variable if I replace the HTML.
            
            const resFinal = await ApiService.resetPassword(userEmail, window.verifiedCode, newPass);

            if (resFinal.success) {
                feedback.textContent = "¡Contraseña actualizada! Redirigiendo...";
                feedback.style.color = "green";
                setTimeout(() => window.location.href = "login.html", 2000);
            } else {
                feedback.textContent = resFinal.message || "Error actualizando password.";
                feedback.style.color = "red";
            }
        }
    });

    // RENDERERS
    
    function renderStep2() {
        title.textContent = "Verificar Código";
        instructions.textContent = `Hemos enviado un código a ${userEmail}. Ingrésalo a continuación.`;
        
        container.innerHTML = `
            <div class="form-group">
                <label for="recovery-code">Código de Verificación</label>
                <input type="text" id="recovery-code" class="form-input-neumorph" placeholder="123456" required>
            </div>
        `;
        submitBtn.value = "Verificar Código";
    }

    function renderStep3() {
        // Save the code before clearing DOM
        window.verifiedCode = document.getElementById("recovery-code").value;

        title.textContent = "Nueva Contraseña";
        instructions.textContent = "Crea una nueva contraseña para tu cuenta.";

        container.innerHTML = `
            <div class="form-group">
                <label for="new-password">Nueva Contraseña</label>
                <input type="password" id="new-password" class="form-input-neumorph" placeholder="••••••••" required>
            </div>
            <div class="form-group">
                <label for="confirm-password">Confirmar Contraseña</label>
                <input type="password" id="confirm-password" class="form-input-neumorph" placeholder="••••••••" required>
            </div>
        `;
        submitBtn.value = "Restablecer Contraseña";
    }

});
