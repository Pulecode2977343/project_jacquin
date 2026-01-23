/**
 * team_cards.js
 * Carga dinámicamente las tarjetas del equipo (Profesores y Administradores)
 * Estilo premium consistente con el resto del proyecto
 */

(function () {
    document.addEventListener('DOMContentLoaded', loadTeamCards);

    async function loadTeamCards() {
        const container = document.getElementById('team-cards-grid');
        if (!container) return;

        try {
            const response = await fetch('/jacquin_api/get_team_members.php');
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                renderTeamCards(container, result.data);
            } else {
                container.innerHTML = `
                    <div style="text-align: center; color: #888; grid-column: 1/-1; padding: 40px;">
                        <i class="bi bi-people" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>
                        Próximamente conocerás a nuestro equipo
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading team members:', error);
            container.innerHTML = `
                <div style="text-align: center; color: #e74c3c; grid-column: 1/-1; padding: 40px;">
                    <i class="bi bi-exclamation-triangle" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>
                    Error al cargar el equipo
                </div>
            `;
        }
    }

    function renderTeamCards(container, members) {
        container.innerHTML = members.map(member => {
            // Color del badge según rol
            let badgeColor = 'var(--color-acento-azul)';
            let badgeIcon = 'bi-person-badge';

            if (member.id_rol == 1) {
                badgeColor = 'var(--color-acento-naranja)';
                badgeIcon = 'bi-shield-check';
            } else if (member.id_rol == 2) {
                badgeColor = 'var(--color-acento-azul)';
                badgeIcon = 'bi-mortarboard';
            }

            return `
                <div class="team-card-premium">
                    <div class="team-card-shine"></div>
                    <div class="team-card-avatar">
                        <img src="${member.avatar_url || '/jacquin_web/pages/assets/images/default_avatar.svg'}" 
                             alt="${member.full_name}"
                             onerror="this.src='/jacquin_web/pages/assets/images/default_avatar.svg'">
                    </div>
                    <div class="team-card-info">
                        <h4>${member.full_name}</h4>
                        <span class="team-card-role" style="background: ${badgeColor};">
                            <i class="bi ${badgeIcon}"></i> ${member.role_name}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }
})();
