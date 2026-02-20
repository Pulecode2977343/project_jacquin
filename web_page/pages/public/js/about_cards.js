/**
 * About Cards Dynamic Loader
 * Loads cards from API and renders them with premium visual styles
 * Includes modal overlay with image gallery functionality
 */

(function () {

    // Load and render about cards on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', async () => {
        const container = document.getElementById('about-cards-container');
        if (container) {
            loadAboutCards(container);
        }

        // Also load Mission and Values
        loadMissionAndValues();
    });

    async function loadAboutCards(container) {
        try {
            const apiBase = (window.ApiService && API_CONFIG) ? API_CONFIG.BASE_URL : '../../jacquin_api/';
            const response = await fetch(apiBase + 'get_about_cards.php');
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                renderAboutCards(container, result.data);
            } else {
                container.innerHTML = '<p style="color:#888; text-align:center;">Cargando información...</p>';
            }
        } catch (error) {
            console.error('Error loading about cards:', error);
        }
    }

    async function loadMissionAndValues() {
        const missionText = document.getElementById('mission-description-text');
        const valuesGrid = document.getElementById('main-values-grid');

        if (!missionText && !valuesGrid) return;

        try {
            const apiBase = (window.ApiService && API_CONFIG) ? API_CONFIG.BASE_URL : '../../jacquin_api/';
            const response = await fetch(apiBase + 'get_mission_values.php');
            const result = await response.json();

            if (result.success && result.data) {
                // Update Mission
                if (missionText && result.data.mission) {
                    missionText.textContent = result.data.mission.description;
                }

                // Update Values
                if (valuesGrid && result.data.values.length > 0) {
                    valuesGrid.innerHTML = result.data.values.map(val => `
                        <div class="value-item" style="background-image: url('${val.image_url || 'images/values/default.png'}');">
                            <div class="value-item-overlay"></div>
                            <div class="value-item-shine"></div>
                            <div class="value-item-content">
                                <i class="bi ${val.icon}"></i>
                                <h4>${val.title}</h4>
                                <p>${val.description}</p>
                            </div>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading mission and values:', error);
        }
    }

    function renderAboutCards(container, cards) {
        container.innerHTML = cards.map(card => `
            <div class="about-card about-card-premium" 
                 onclick="openAboutModal(${card.id_card})"
                 data-card-id="${card.id_card}"
                 style="background-image: url('${card.image_url || 'images/about/default.jpg'}');">
                <div class="about-card-overlay"></div>
                <div class="about-card-shine"></div>
                <div class="about-card-content">
                    <i class="bi ${card.icon} about-card-icon"></i>
                    <h3>${card.title}</h3>
                    <p class="about-card-subtitle">${card.subtitle || ''}</p>
                </div>
            </div>
        `).join('');

        // Store cards data for modal use
        window._aboutCardsData = cards;
    }

    // Open Modal with card details
    window.openAboutModal = async function (cardId) {
        const cards = window._aboutCardsData || [];
        const card = cards.find(c => c.id_card === cardId);
        if (!card) return;

        // Check if this is the "Nuestro Equipo" card
        const isTeamCard = card.title && card.title.toLowerCase().includes('equipo');

        // Create modal
        const overlay = document.createElement('div');
        overlay.className = 'about-modal-overlay';

        if (isTeamCard) {
            // SPECIAL MODAL FOR TEAM - Text above, team cards below
            overlay.innerHTML = `
                <div class="about-modal about-modal-team">
                    <button class="about-modal-close" onclick="this.closest('.about-modal-overlay').remove()">&times;</button>
                    
                    <div class="about-modal-content" style="padding-top: 50px;">
                        <div class="about-modal-header">
                            <i class="bi ${card.icon}"></i>
                            <div>
                                <h2>${card.title}</h2>
                                <span class="about-modal-subtitle">${card.subtitle || ''}</span>
                            </div>
                        </div>
                        <p class="about-modal-description">${card.description || ''}</p>
                    </div>
                    
                    <div class="team-cards-modal-grid" id="team-modal-grid">
                        <div style="text-align: center; color: #888; grid-column: 1/-1; padding: 30px;">
                            <i class="bi bi-hourglass-split" style="font-size: 1.5rem; display: block; margin-bottom: 10px;"></i>
                            Cargando equipo...
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Animation in
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                overlay.querySelector('.about-modal').style.transform = 'scale(1)';
            });

            // Load team members
            try {
                const apiBase = (window.ApiService && API_CONFIG) ? API_CONFIG.BASE_URL : '../../jacquin_api/';
                const response = await fetch(apiBase + 'get_team_members.php');
                const result = await response.json();
                const grid = document.getElementById('team-modal-grid');

                if (result.success && result.data.length > 0) {
                    grid.innerHTML = result.data.map(member => {
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
                            <div class="team-card-mini" style="background-image: url('${member.avatar_url || 'assets/images/default_avatar.svg'}');">
                                <div class="team-card-mini-overlay"></div>
                                <div class="team-card-mini-shine"></div>
                                <div class="team-card-mini-info">
                                    <h4>${member.full_name}</h4>
                                    <span class="team-card-mini-role" style="background: ${badgeColor};">
                                        <i class="bi ${badgeIcon}"></i> ${member.role_name}
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    grid.innerHTML = '<div style="text-align: center; color: #888; grid-column: 1/-1; padding: 30px;">Próximamente conocerás a nuestro equipo</div>';
                }
            } catch (error) {
                console.error('Error loading team:', error);
                document.getElementById('team-modal-grid').innerHTML = '<div style="text-align: center; color: #e74c3c; grid-column: 1/-1; padding: 30px;">Error al cargar el equipo</div>';
            }

        } else {
            // STANDARD MODAL WITH IMAGE
            let allImages = [];
            if (card.image_url) allImages.push(card.image_url);
            if (card.images && Array.isArray(card.images)) {
                allImages = allImages.concat(card.images);
            }

            const hasMultipleImages = allImages.length > 1;
            let currentImageIndex = 0;

            overlay.innerHTML = `
                <div class="about-modal">
                    <button class="about-modal-close" onclick="this.closest('.about-modal-overlay').remove()">&times;</button>
                    
                    <div class="about-modal-image-container">
                        <img id="about-modal-img" src="${allImages[0] || 'images/about/default.jpg'}" alt="${card.title}">
                        ${hasMultipleImages ? `
                            <button class="about-modal-nav about-modal-prev" onclick="event.stopPropagation(); aboutModalPrev()">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                            <button class="about-modal-nav about-modal-next" onclick="event.stopPropagation(); aboutModalNext()">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                            <div class="about-modal-dots" id="about-modal-dots"></div>
                        ` : ''}
                    </div>
                    
                    <div class="about-modal-content">
                        <div class="about-modal-header">
                            <i class="bi ${card.icon}"></i>
                            <div>
                                <h2>${card.title}</h2>
                                <span class="about-modal-subtitle">${card.subtitle || ''}</span>
                            </div>
                        </div>
                        <p class="about-modal-description">${card.description || ''}</p>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Animation in
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                overlay.querySelector('.about-modal').style.transform = 'scale(1)';
            });

            // Image navigation functions
            if (hasMultipleImages) {
                renderDots();

                window.aboutModalPrev = function () {
                    currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
                    updateImage();
                };

                window.aboutModalNext = function () {
                    currentImageIndex = (currentImageIndex + 1) % allImages.length;
                    updateImage();
                };

                function updateImage() {
                    document.getElementById('about-modal-img').src = allImages[currentImageIndex];
                    renderDots();
                }

                function renderDots() {
                    const dotsContainer = document.getElementById('about-modal-dots');
                    if (dotsContainer) {
                        dotsContainer.innerHTML = allImages.map((_, i) =>
                            `<span class="about-modal-dot ${i === currentImageIndex ? 'active' : ''}" onclick="event.stopPropagation(); aboutModalGoTo(${i})"></span>`
                        ).join('');
                    }
                }

                window.aboutModalGoTo = function (index) {
                    currentImageIndex = index;
                    updateImage();
                };
            }
        }

        // Close on background click
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };
    };

})();
