/**
 * SweetAlert2 Adapter (Replaces Glass Toast)
 * Wraps Swal.fire to provide the requested "Elegant Overlay" style.
 * Maintains window.showToast signature for compatibility.
 */

(function () {
    // 1. Alert / Notification Overlay
    window.showToast = function (message, type = 'info') {
        let title = 'Notificación';
        let confirmBtnColor = 'var(--color-acento-azul, #3498db)';

        if (type === 'success') { title = '¡Excelente!'; confirmBtnColor = '#2ecc71'; }
        else if (type === 'error') { title = '¡Error!'; confirmBtnColor = '#e74c3c'; }
        else if (type === 'warning') { title = '¡Atención!'; confirmBtnColor = '#f39c12'; }

        if (typeof Swal !== 'undefined') {
            return Swal.fire({
                title: title,
                text: message,
                icon: type,
                confirmButtonText: 'Entendido',
                confirmButtonColor: confirmBtnColor,
                background: '#1a1a1a',
                color: '#ffffff',
                backdrop: `rgba(0,0,0,0.8) blur(5px)`,
                customClass: { popup: 'jacquin-swal-popup' }
            });
        }
        console.warn("Swal fallback:", message);
        alert(message);
    };

    // 2. Confirmation Overlay (Replaces browser confirm)
    window.showConfirm = function (message, confirmText = 'Aceptar', cancelText = 'Cancelar') {
        if (typeof Swal !== 'undefined') {
            return Swal.fire({
                title: 'Confirmación',
                text: message,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: confirmText,
                cancelButtonText: cancelText,
                confirmButtonColor: 'var(--color-acento-azul, #3498db)',
                cancelButtonColor: '#444',
                background: '#1a1a1a',
                color: '#ffffff',
                backdrop: `rgba(0,0,0,0.8) blur(8px)`,
                customClass: { popup: 'jacquin-swal-popup' }
            }).then((result) => result.isConfirmed);
        }
        return Promise.resolve(confirm(message));
    };

    // Inject CSS for custom class if not present
    if (!document.getElementById('jacquin-swal-style')) {
        const style = document.createElement('style');
        style.id = 'jacquin-swal-style';
        style.innerHTML = `
            .jacquin-swal-popup {
                border: 1px solid rgba(255,255,255,0.1) !important;
                border-radius: 20px !important;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5) !important;
                font-family: inherit !important;
            }
            .swal2-container {
                z-index: 200000 !important; /* Ensure it's above everything (profile modal is 100000) */
            }
        `;
        document.head.appendChild(style);
    }
})();
