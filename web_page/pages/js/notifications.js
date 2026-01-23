/**
 * notifications.js
 * Sistema de Notificaciones y Alertas para Dashboard
 */

window.NotificationSystem = {
    async init() {
        const session = ApiService.getSession();
        if (!session) return;

        // Comprobar acciones pendientes
        await this.checkPendingActions(session.id_usuario, session.id_rol);
    },

    async checkPendingActions(userId, roleId) {
        try {
            const result = await ApiService.getPendingActions(userId, roleId);

            if (result.success && result.has_alerts) {
                this.displayBadges(result.badges);
                this.displayToastAlerts(result.alerts);
            }
        } catch (error) {
            console.error("Error checking pending actions:", error);
        }
    },

    displayBadges(badges) {
        // Academic Badge (Para profesor o estudiante)
        if (badges.academic > 0) {
            this.addBadgeToElement('#btn-academic-management', badges.academic);
            this.addBadgeToElement('.teacher-academic-card', badges.academic);
        }

        // Compliance Badge (Para todos)
        if (badges.compliance > 0) {
            this.addBadgeToElement('#btn-admin-compliance', badges.compliance);
        }
    },

    addBadgeToElement(selector, count) {
        const element = document.querySelector(selector);
        if (!element) return;

        // Remover badge previo si existe
        const existingBadge = element.querySelector('.notification-badge');
        if (existingBadge) existingBadge.remove();

        // Crear nuevo badge
        const badge = document.createElement('div');
        badge.className = 'notification-badge';
        badge.textContent = count > 9 ? '9+' : count;

        // El elemento debe tener position: relative
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }

        element.appendChild(badge);
    },

    displayToastAlerts(alerts) {
        // Mostrar solo la primera alerta para no abrumar
        if (alerts.length === 0) return;

        const firstAlert = alerts[0];
        const iconMap = {
            'warning': 'warning',
            'info': 'info',
            'danger': 'error'
        };

        setTimeout(() => {
            Swal.fire({
                icon: iconMap[firstAlert.type] || 'info',
                title: 'Notificación',
                text: firstAlert.message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 6000,
                timerProgressBar: true
            });
        }, 1500); // Delay para que no aparezca inmediatamente al cargar
    }
};

// Auto-init cuando el DOM esté listo y después de que el dashboard cargue
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => NotificationSystem.init(), 2000);
    });
} else {
    setTimeout(() => NotificationSystem.init(), 2000);
}
