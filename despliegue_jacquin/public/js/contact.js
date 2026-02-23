/**
 * Contact Form Logic
 */

// Auto-fill message logic (Robust execution)
(function initContactPrefill() {
    const applyPrefill = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const reservaEvento = urlParams.get('reserva');

        if (reservaEvento) {
            const contactForm = document.querySelector("form.contactanos") || document.getElementById("contact-form");
            if (contactForm) {
                const msgArea = contactForm.querySelector("textarea[name='mensaje']") || contactForm.querySelector("textarea");
                if (msgArea) {
                    // Check if already filled to avoid overwrite if user typing (rare case on load)
                    if (!msgArea.value.includes(reservaEvento)) {
                        msgArea.value = `Hola, me gustaría adquirir entradas para "${reservaEvento}". Quisiera saber más detalles y disponibilidad.`;

                        // Visual cue for user
                        msgArea.style.transition = "all 0.3s";
                        msgArea.style.boxShadow = "0 0 15px rgba(52, 152, 219, 0.5)";
                        msgArea.style.borderColor = "#3498db";

                        // Scroll to form slightly delayed to ensure rendering
                        setTimeout(() => {
                            contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            msgArea.focus();
                        }, 500);
                    }
                    return true;
                }
            }
        }
        return false;
    };

    // Try immediately
    if (!applyPrefill()) {
        // Try on DOMContentLoaded
        document.addEventListener("DOMContentLoaded", applyPrefill);
        // Try on Window Load (backup for slow styles/scripts)
        window.addEventListener("load", applyPrefill);
    }

    // Auth Pre-fill logic
    const prefillAuth = () => {
        const contactForm = document.querySelector("form.contactanos");
        if (contactForm && window.ApiService && ApiService.isAuthenticated()) {
            const user = ApiService.getSession();
            const nameInp = contactForm.querySelector("input[name='nombre']");
            const mailInp = contactForm.querySelector("input[name='email']");
            
            if (nameInp && !nameInp.value) nameInp.value = user.full_name;
            if (mailInp && !mailInp.value) mailInp.value = user.email;
        }
    };
    document.addEventListener("DOMContentLoaded", prefillAuth);
})();

document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.querySelector("form.contactanos");

    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector("button[type='submit']");
            const originalText = btn.textContent;
            btn.textContent = "Enviando...";
            btn.disabled = true;

            const formData = {
                nombre: contactForm.querySelector("input[name='nombre']").value,
                email: contactForm.querySelector("input[name='email']").value,
                telefono: contactForm.querySelector("input[name='telefono']").value,
                mensaje: contactForm.querySelector("textarea[name='mensaje']").value,
                origen: contactForm.querySelector("select[name='origen']").value
            };

            // Basic Validation
            if (!formData.nombre || !formData.email || !formData.mensaje) {
                showStatusOverlay("Por favor completa los campos obligatorios.", "warning");
                btn.textContent = originalText;
                btn.disabled = false;
                return;
            }

            try {
                const result = await ApiService.sendContactMessage(formData);

                if (result.success || result.status === 200) {
                    showStatusOverlay("¡Gracias! Tu mensaje ha sido enviado exitosamente. Nos pondremos en contacto pronto.", "success");
                    contactForm.reset();
                    // Reset visual cues
                    const msgArea = contactForm.querySelector("textarea[name='mensaje']");
                    if (msgArea) {
                        msgArea.style.boxShadow = "none";
                        msgArea.style.borderColor = "";
                    }
                } else {
                    showStatusOverlay("Error: " + (result.message || "No se pudo enviar el mensaje."), "error");
                }
            } catch (error) {
                console.error(error);
                showStatusOverlay("Error de conexión. Por favor intenta más tarde.", "error");
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }
});

/**
 * Modern Status Overlay
 */
function showStatusOverlay(message, type = "success") {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
        display: flex; justify-content: center; align-items: center;
        z-index: 99999; opacity: 0; transition: opacity 0.3s;
    `;

    const icon = type === "success" ? "bi-check-circle" : (type === "warning" ? "bi-exclamation-triangle" : "bi-exclamation-circle");
    const color = type === "success" ? "#2ecc71" : (type === "warning" ? "#f1c40f" : "#e74c3c");

    overlay.innerHTML = `
        <div style="background: linear-gradient(145deg, #1a2533, #151b26); border: 1px solid rgba(255,255,255,0.1); 
                    padding: 40px; border-radius: 24px; text-align: center; max-width: 400px; width: 90%;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.5); transform: scale(0.9); transition: transform 0.3s;">
            <i class="bi ${icon}" style="font-size: 4rem; color: ${color}; margin-bottom: 20px; display: block;"></i>
            <h3 style="color: white; margin-bottom: 15px;">${type === "success" ? "¡Listo!" : "Atención"}</h3>
            <p style="color: #ccc; line-height: 1.6; margin-bottom: 25px;">${message}</p>
            <button id="close-status-btn" style="
                background: white; color: #111; border: none; padding: 12px 35px; 
                border-radius: 30px; font-weight: bold; cursor: pointer; font-size: 1rem;
                transition: transform 0.2s;">
                Entendido
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Animation
    requestAnimationFrame(() => {
        overlay.style.opacity = "1";
        overlay.querySelector('div').style.transform = "scale(1)";
    });

    const close = () => {
        overlay.style.opacity = "0";
        overlay.querySelector('div').style.transform = "scale(0.9)";
        setTimeout(() => overlay.remove(), 300);
    };

    overlay.querySelector('#close-status-btn').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
}
