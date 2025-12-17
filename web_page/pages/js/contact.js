/**
 * Contact Form Logic
 */

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
                alert("Por favor completa los campos obligatorios.");
                btn.textContent = originalText;
                btn.disabled = false;
                return;
            }

            try {
                const result = await ApiService.sendContactMessage(formData);
                
                if (result.success || result.status === 200) {
                    alert("¡Gracias! Tu mensaje ha sido enviado.");
                    contactForm.reset();
                } else {
                    alert("Error: " + (result.message || "No se pudo enviar el mensaje."));
                }
            } catch (error) {
                console.error(error);
                alert("Error de conexión.");
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }
});
