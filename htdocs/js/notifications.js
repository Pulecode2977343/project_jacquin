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
            this.addBadgeToElement('#btn-teacher-management', badges.academic);
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
        if (alerts.length === 0) return;

        // Inyectar estilos si no existen
        if (!document.getElementById('jam-notif-styles')) {
            const style = document.createElement('style');
            style.id = 'jam-notif-styles';
            style.innerHTML = `
                .jam-notif-container {
                    position: fixed; bottom: 40px; right: 40px; z-index: 110000;
                    display: flex; flex-direction: column-reverse; gap: 15px; pointer-events: none;
                }
                .jam-toast {
                    width: 340px; background: rgba(10, 25, 41, 0.9);
                    backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px;
                    padding: 16px 20px; display: flex; align-items: center; gap: 15px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                    transform: translateX(120%); transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
                    pointer-events: auto; position: relative; overflow: hidden;
                    cursor: pointer; user-select: none;
                }
                .jam-toast:hover { transform: scale(1.02); background: rgba(15, 35, 55, 0.95); border-color: rgba(255,255,255,0.15); }
                .jam-toast.show { transform: translateX(0); }
                .jam-toast::before {
                    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
                    width: 4px; background: var(--color-acento-azul);
                }
                .jam-toast.warning::before { background: #f39c12; }
                .jam-toast.danger::before { background: #e74c3c; }
                .jam-toast.success::before { background: #2ecc71; }
                
                .jam-toast-icon {
                    width: 38px; height: 38px; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(147, 182, 238, 0.08); border: 1px solid rgba(147, 182, 238, 0.1);
                    flex-shrink: 0; color: var(--color-acento-azul); font-size: 1.1rem;
                }
                .jam-toast.warning .jam-toast-icon { 
                    background: rgba(243, 156, 18, 0.08); border-color: rgba(243, 156, 18, 0.1); color: #f39c12; 
                }
                .jam-toast.danger .jam-toast-icon { 
                    background: rgba(231, 76, 60, 0.08); border-color: rgba(231, 76, 60, 0.1); color: #e74c3c; 
                }
                .jam-toast.success .jam-toast-icon { 
                    background: rgba(46, 204, 113, 0.08); border-color: rgba(46, 204, 113, 0.1); color: #2ecc71; 
                }

                .jam-toast-content { flex: 1; }
                .jam-toast-title { color: white; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
                .jam-toast-msg { color: rgba(255,255,255,0.5); font-size: 0.8rem; line-height: 1.4; }
                .jam-toast-close {
                    background: rgba(255,255,255,0.03); border: none; color: rgba(255,255,255,0.2);
                    width: 24px; height: 24px; border-radius: 6px; cursor: pointer; font-size: 1rem; 
                    display: flex; align-items: center; justify-content: center; transition: 0.2s;
                }
                .jam-toast-close:hover { background: rgba(255,255,255,0.1); color: white; }
                
                @keyframes progress-drain { from { width: 100%; } to { width: 0%; } }
                .jam-toast-progress {
                    position: absolute; bottom: 0; left: 0; height: 3px;
                    background: rgba(255,255,255,0.1); width: 0;
                }
                .jam-toast.show .jam-toast-progress {
                    animation: progress-drain 6000ms linear forwards;
                }
            `;
            document.head.appendChild(style);
        }

        let container = document.querySelector('.jam-notif-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'jam-notif-container';
            document.body.appendChild(container);
        }

        alerts.forEach((alert, index) => {
            setTimeout(() => {
                const toast = document.createElement('div');
                const typeClass = alert.type || 'info';
                toast.className = `jam-toast ${typeClass}`;

                const iconMap = {
                    'warning': 'bi-exclamation-triangle',
                    'info': 'bi-info-circle',
                    'danger': 'bi-x-circle',
                    'success': 'bi-check2-circle'
                };
                const icon = iconMap[typeClass] || 'bi-bell';

                toast.innerHTML = `
                    <div class="jam-toast-icon"><i class="bi ${icon}"></i></div>
                    <div class="jam-toast-content">
                        <div class="jam-toast-title">${alert.title || 'Notificación'}</div>
                        <div class="jam-toast-msg">${alert.message}</div>
                    </div>
                    <button class="jam-toast-close" onclick="event.stopPropagation(); this.parentElement.classList.remove('show'); setTimeout(()=>this.parentElement.remove(), 600)">&times;</button>
                    <div class="jam-toast-progress"></div>
                `;

                // Add Click Action
                toast.onclick = () => {
                    if (alert.action === 'open_positions') {
                        const sess = ApiService.getSession();
                        if (window.openProfile) window.openProfile(sess.id_usuario, 'position');
                    } else if (alert.action === 'open_academic') {
                        if (window.openAcademicManagement) window.openAcademicManagement();
                        else if (window.openCourseManagement) window.openCourseManagement();
                    }

                    // Remove toast on click
                    toast.classList.remove('show');
                    setTimeout(() => toast.remove(), 600);
                };

                container.appendChild(toast);

                // Trigger animation
                requestAnimationFrame(() => {
                    toast.classList.add('show');
                });

                // Auto-remove
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.classList.remove('show');
                        setTimeout(() => toast.remove(), 600);
                    }
                }, 6000);

            }, index * 200 + 1500); // Stagger entry
        });
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
