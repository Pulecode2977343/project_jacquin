/**
 * Admin Content Manager
 * Gestiona las tarjetas "Sobre Nosotros" y contenido dinámico
 */

(function () {
    'use strict';

    let aboutCards = [];
    let currentEditingCard = null;

    // ==========================================
    // INITIALIZATION
    // ==========================================

    window.openContentManager = function () {
        // Remove existing modal if any
        const existingModal = document.getElementById('content-manager-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'content-manager-modal';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.92); z-index:10001; display:flex; justify-content:center; align-items:flex-start; padding:20px; overflow-y:auto; opacity:0; transition:opacity 0.3s;';

        modal.innerHTML = `
            <div style="background:#1a1a1a; width:95%; max-width:1100px; border-radius:20px; padding:0; border:1px solid #333; box-shadow:0 25px 80px rgba(0,0,0,0.6); position:relative; margin:20px 0; transform:scale(0.95); transition:transform 0.3s;">
                <!-- Header -->
                <div style="background:linear-gradient(135deg, rgba(155, 89, 182, 0.3), rgba(142, 68, 173, 0.3)); padding:25px 30px; border-radius:20px 20px 0 0; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
                    <div>
                        <h2 style="color:white; margin:0; font-size:1.5rem; font-weight:500; display:flex; align-items:center; gap:12px;">
                            <i class="bi bi-layout-text-window-reverse" style="color:var(--color-acento-naranja);"></i>
                            Gestión de Contenido Web
                        </h2>
                        <p style="color:#888; margin:5px 0 0 0; font-size:0.9rem;">Administra las tarjetas "Sobre Nosotros" de la página principal</p>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <button onclick="window.openAddAboutCardModal()" style="background:linear-gradient(135deg, #9b59b6, #8e44ad); color:white; border:none; padding:10px 20px; border-radius:10px; cursor:pointer; font-size:0.9rem; font-weight:600; display:flex; align-items:center; gap:8px;">
                            <i class="bi bi-plus-circle"></i> Nueva Tarjeta
                        </button>
                        <button onclick="document.getElementById('content-manager-modal').remove()" style="background:rgba(255,255,255,0.05); border:1px solid #444; color:white; width:40px; height:40px; border-radius:10px; cursor:pointer; font-size:1.2rem; display:flex; align-items:center; justify-content:center;">
                            &times;
                        </button>
                    </div>
                </div>
                
                <!-- Navigation Tabs -->
                <div style="display:flex; background:#111; padding:0 30px;">
                    <button onclick="window.switchContentTab('cards')" id="tab-cards" style="padding:15px 25px; background:rgba(155,89,182,0.15); border:none; border-bottom:3px solid #9b59b6; color:white; font-weight:600; cursor:pointer; transition:all 0.2s;">
                        <i class="bi bi-card-text"></i> Tarjetas "Sobre Nosotros"
                    </button>
                    <button onclick="window.switchContentTab('mission')" id="tab-mission" style="padding:15px 25px; background:transparent; border:none; border-bottom:3px solid transparent; color:#888; font-weight:600; cursor:pointer; transition:all 0.2s;">
                        <i class="bi bi-star-fill"></i> Misión y Valores
                    </button>
                </div>

                <!-- Content Area -->
                <div id="content-tab-cards" style="padding:25px 30px; max-height:calc(85vh - 180px); overflow-y:auto;">
                    <div id="content-manager-cards-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
                        <div style="color:#888; text-align:center; padding:3rem; grid-column:1/-1;">
                            <i class="bi bi-hourglass-split" style="font-size:2.5rem; animation:pulse 1.5s infinite;"></i>
                            <p style="margin-top:15px;">Cargando tarjetas...</p>
                        </div>
                    </div>
                </div>

                <div id="content-tab-mission" style="padding:25px 30px; max-height:calc(85vh - 180px); overflow-y:auto; display:none;">
                    <!-- Mission Section -->
                    <div style="background:rgba(255,255,255,0.03); padding:25px; border-radius:15px; border:1px solid #333; margin-bottom:25px;">
                        <h3 style="color:white; margin:0 0 15px 0; font-size:1.1rem; border-bottom:1px solid #333; padding-bottom:10px;">
                            <i class="bi bi-pencil-square" style="color:#2ecc71;"></i> Nuestra Misión
                        </h3>
                        <div class="form-group">
                            <label>Texto de la Misión</label>
                            <textarea id="admin-mission-desc" class="form-control" rows="3" style="resize:vertical;"></textarea>
                        </div>
                        <button onclick="window.saveMissionOnly()" class="btn-module" style="width:auto; padding:8px 25px; margin-top:10px; background:var(--color-acento-azul); color:white;">
                            Actualizar Misión
                        </button>
                    </div>

                    <!-- Values Section -->
                    <div style="background:rgba(255,255,255,0.03); padding:25px; border-radius:15px; border:1px solid #333;">
                        <h3 style="color:white; margin:0 0 15px 0; font-size:1.1rem; border-bottom:1px solid #333; padding-bottom:10px;">
                            <i class="bi bi-gem" style="color:#f1c40f;"></i> Valores de la Institución
                        </h3>
                        <div id="admin-values-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
                            <!-- Values injected via JS -->
                        </div>
                    </div>
                </div>
                
                <!-- Footer Tips -->
                <div style="padding:20px 30px; border-top:1px solid #333; background:rgba(0,0,0,0.3); border-radius:0 0 20px 20px;">
                    <div style="display:flex; align-items:flex-start; gap:15px; flex-wrap:wrap;">
                        <i class="bi bi-lightbulb" style="color:#2ecc71; font-size:1.2rem;"></i>
                        <div style="flex:1; min-width:200px;">
                            <p style="color:#888; font-size:0.85rem; margin:0; line-height:1.5;">
                                <strong style="color:#2ecc71;">Tips:</strong> 
                                Las tarjetas aparecen en "Sobre Nosotros". Use imágenes de alta calidad (800x600px). 
                                Cambie el orden editando el número. Las inactivas no se muestran públicamente.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.querySelector('div').style.transform = 'scale(1)';
        }, 10);

        // Close on overlay click
        modal.addEventListener('click', function (e) {
            if (e.target === modal) modal.remove();
        });

        // Load cards into modal
        loadAboutCardsIntoModal();
    };

    // Load cards specifically into the modal grid
    async function loadAboutCardsIntoModal() {
        const grid = document.getElementById('content-manager-cards-grid');
        if (!grid) return;

        try {
            const response = await ApiService.getAboutCardsAdmin();

            if (response.success && response.data) {
                aboutCards = response.data;
                renderCardsInModalGrid(response.data, grid);
            } else {
                grid.innerHTML = `
                    <div style="color:#e74c3c; text-align:center; padding:2rem; grid-column:1/-1;">
                        <i class="bi bi-exclamation-triangle" style="font-size:2rem;"></i>
                        <p>Error cargando tarjetas: ${response.message || 'Error desconocido'}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading about cards:', error);
            grid.innerHTML = `
                <div style="color:#e74c3c; text-align:center; padding:2rem; grid-column:1/-1;">
                    <i class="bi bi-exclamation-triangle" style="font-size:2rem;"></i>
                    <p>Error de conexión</p>
                </div>
            `;
        }
    }

    // Render cards in modal grid with enhanced styling
    function renderCardsInModalGrid(cards, grid) {
        if (!cards || cards.length === 0) {
            grid.innerHTML = `
                <div style="color:#888; text-align:center; padding:3rem; grid-column:1/-1;">
                    <i class="bi bi-inbox" style="font-size:3rem; opacity:0.5;"></i>
                    <p style="margin:15px 0;">No hay tarjetas configuradas</p>
                    <button onclick="window.openAddAboutCardModal()" style="background:linear-gradient(135deg, #9b59b6, #8e44ad); color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:600;">
                        <i class="bi bi-plus-circle"></i> Crear Primera Tarjeta
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = cards.map(card => `
            <div class="content-card-item" data-id="${card.id}" style="
                background: ${card.image_url ? `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.9)), url('${card.image_url}')` : 'linear-gradient(135deg, rgba(40,40,40,0.9), rgba(30,30,30,0.95))'};
                background-size: cover;
                background-position: center;
                border-radius: 16px;
                border: 1px solid ${card.is_active ? 'rgba(46, 204, 113, 0.25)' : 'rgba(231, 76, 60, 0.25)'};
                padding: 20px;
                position: relative;
                transition: all 0.3s ease;
                cursor: default;
            ">
                <!-- Status Badges -->
                <div style="display:flex; gap:8px; margin-bottom:15px;">
                    <span style="
                        background: ${card.is_active ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)'};
                        color: ${card.is_active ? '#2ecc71' : '#e74c3c'};
                        padding: 5px 12px;
                        border-radius: 20px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        border: 1px solid ${card.is_active ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'};
                    ">${card.is_active ? '● Activo' : '○ Inactivo'}</span>
                    <span style="
                        background: rgba(147, 182, 238, 0.15);
                        color: var(--color-acento-azul);
                        padding: 5px 12px;
                        border-radius: 20px;
                        font-size: 0.75rem;
                        border: 1px solid rgba(147, 182, 238, 0.3);
                    ">Orden: ${card.display_order}</span>
                </div>
                
                <!-- Icon & Content -->
                <div style="margin-bottom:15px;">
                    <div style="width:50px; height:50px; background:rgba(155,89,182,0.2); border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:12px;">
                        <i class="bi ${card.icon || 'bi-star'}" style="font-size:1.5rem; color:#9b59b6;"></i>
                    </div>
                    <h4 style="color:white; margin:0 0 5px 0; font-size:1.1rem; font-weight:600;">${escapeHtml(card.title)}</h4>
                    <p style="color:#aaa; font-size:0.85rem; margin:0;">${escapeHtml(card.subtitle || '')}</p>
                </div>
                
                <!-- Description Preview -->
                <p style="color:#777; font-size:0.8rem; line-height:1.5; margin:0 0 15px 0; max-height:45px; overflow:hidden;">
                    ${escapeHtml((card.description || '').substring(0, 80))}${card.description && card.description.length > 80 ? '...' : ''}
                </p>
                
                <!-- Actions -->
                <div style="display:flex; gap:8px;">
                    <button onclick="window.openEditAboutCardModal(${card.id})" style="
                        flex:1; background:rgba(155,89,182,0.15); border:1px solid rgba(155,89,182,0.3); 
                        color:#9b59b6; padding:10px; border-radius:8px; cursor:pointer; font-size:0.85rem; font-weight:500;
                        display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.2s;
                    " onmouseover="this.style.background='rgba(155,89,182,0.3)'" onmouseout="this.style.background='rgba(155,89,182,0.15)'">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button onclick="window.toggleAboutCardStatus(${card.id}, ${card.is_active ? 0 : 1})" style="
                        background:${card.is_active ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)'}; 
                        border:1px solid ${card.is_active ? 'rgba(231,76,60,0.3)' : 'rgba(46,204,113,0.3)'};
                        color:${card.is_active ? '#e74c3c' : '#2ecc71'}; 
                        padding:10px 12px; border-radius:8px; cursor:pointer; transition:all 0.2s;
                    " title="${card.is_active ? 'Desactivar' : 'Activar'}">
                        <i class="bi ${card.is_active ? 'bi-eye-slash' : 'bi-eye'}"></i>
                    </button>
                    <button onclick="window.deleteAboutCard(${card.id})" style="
                        background:rgba(231,76,60,0.1); border:1px solid rgba(231,76,60,0.3);
                        color:#e74c3c; padding:10px 12px; border-radius:8px; cursor:pointer; transition:all 0.2s;
                    " title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ==========================================
    // LOAD ABOUT CARDS
    // ==========================================

    async function loadAboutCardsAdmin() {
        // Check for modal grid first, then section grid
        const modalGrid = document.getElementById('content-manager-cards-grid');
        const sectionGrid = document.getElementById('about-cards-admin-grid');
        const grid = modalGrid || sectionGrid;

        if (!grid) return;

        grid.innerHTML = `
            <div style="color: #888; text-align: center; padding: 2rem; grid-column: 1 / -1;">
                <i class="bi bi-hourglass-split" style="font-size: 2rem; animation: pulse 1.5s infinite;"></i>
                <p>Cargando tarjetas...</p>
            </div>
        `;

        try {
            const response = await ApiService.getAboutCardsAdmin();

            if (response.success && response.data) {
                aboutCards = response.data;
                // Use modal renderer if in modal, else use section renderer
                if (modalGrid) {
                    renderCardsInModalGrid(response.data, modalGrid);
                } else {
                    renderAboutCardsGrid(response.data);
                }
            } else {
                grid.innerHTML = `
                    <div style="color: #e74c3c; text-align: center; padding: 2rem; grid-column: 1 / -1;">
                        <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                        <p>Error cargando tarjetas: ${response.message || 'Error desconocido'}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading about cards:', error);
            grid.innerHTML = `
                <div style="color: #e74c3c; text-align: center; padding: 2rem; grid-column: 1 / -1;">
                    <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                    <p>Error de conexión</p>
                </div>
            `;
        }
    }

    // ==========================================
    // RENDER CARDS GRID
    // ==========================================

    function renderAboutCardsGrid(cards) {
        const grid = document.getElementById('about-cards-admin-grid');
        if (!grid) return;

        if (!cards || cards.length === 0) {
            grid.innerHTML = `
                <div style="color: #888; text-align: center; padding: 2rem; grid-column: 1 / -1;">
                    <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                    <p>No hay tarjetas configuradas</p>
                    <button onclick="window.openAddAboutCardModal()" class="btn-module" style="margin-top: 15px;">
                        <i class="bi bi-plus-circle"></i> Crear Primera Tarjeta
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = cards.map(card => `
            <div class="admin-about-card" data-id="${card.id}" style="
                background: ${card.image_url ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('${card.image_url}')` : 'rgba(255,255,255,0.05)'};
                background-size: cover;
                background-position: center;
                border-radius: 15px;
                border: 1px solid ${card.is_active ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'};
                padding: 1.5rem;
                position: relative;
                transition: all 0.3s ease;
            ">
                <!-- Status Badge -->
                <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 8px;">
                    <span style="
                        background: ${card.is_active ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)'};
                        color: ${card.is_active ? '#2ecc71' : '#e74c3c'};
                        padding: 4px 10px;
                        border-radius: 12px;
                        font-size: 0.75rem;
                        font-weight: bold;
                    ">${card.is_active ? 'Activo' : 'Inactivo'}</span>
                    <span style="
                        background: rgba(147, 182, 238, 0.2);
                        color: var(--color-acento-azul);
                        padding: 4px 10px;
                        border-radius: 12px;
                        font-size: 0.75rem;
                    ">#${card.display_order}</span>
                </div>

                <!-- Icon & Title -->
                <div style="margin-top: 25px;">
                    <i class="bi ${card.icon || 'bi-star'}" style="font-size: 2rem; color: var(--color-acento-naranja);"></i>
                    <h4 style="color: white; margin: 10px 0 5px 0; font-size: 1.1rem;">${escapeHtml(card.title)}</h4>
                    <p style="color: #aaa; font-size: 0.85rem; margin: 0;">${escapeHtml(card.subtitle || '')}</p>
                </div>

                <!-- Description Preview -->
                <p style="color: #888; font-size: 0.8rem; margin-top: 10px; line-height: 1.4; max-height: 60px; overflow: hidden;">
                    ${escapeHtml((card.description || '').substring(0, 100))}${card.description && card.description.length > 100 ? '...' : ''}
                </p>

                <!-- Actions -->
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button onclick="window.openEditAboutCardModal(${card.id})" class="btn-module" style="
                        margin: 0; flex: 1; padding: 8px; font-size: 0.85rem; background: transparent; border: 1px solid var(--color-acento-azul);
                    "><i class="bi bi-pencil"></i> Editar</button>
                    <button onclick="window.toggleAboutCardStatus(${card.id}, ${card.is_active ? 0 : 1})" class="btn-module" style="
                        margin: 0; padding: 8px; font-size: 0.85rem; background: transparent; border: 1px solid ${card.is_active ? '#e74c3c' : '#2ecc71'};
                        color: ${card.is_active ? '#e74c3c' : '#2ecc71'};
                    "><i class="bi ${card.is_active ? 'bi-eye-slash' : 'bi-eye'}"></i></button>
                    <button onclick="window.deleteAboutCard(${card.id})" class="btn-module" style="
                        margin: 0; padding: 8px; font-size: 0.85rem; background: transparent; border: 1px solid #e74c3c; color: #e74c3c;
                    "><i class="bi bi-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    // ==========================================
    // MODAL: ADD/EDIT CARD
    // ==========================================

    window.openAddAboutCardModal = function () {
        currentEditingCard = null;
        showCardModal({
            title: '',
            subtitle: '',
            icon: 'bi-star',
            description: '',
            image_url: '',
            is_active: 1
        }, 'Crear Nueva Tarjeta');
    };

    window.openEditAboutCardModal = function (cardId) {
        const card = aboutCards.find(c => c.id == cardId);
        if (card) {
            currentEditingCard = card;
            showCardModal(card, 'Editar Tarjeta');
        }
    };

    function showCardModal(card, modalTitle) {
        // Remove existing modal if any
        const existingModal = document.getElementById('about-card-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'about-card-modal';
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-card" style="max-width: 600px;">
                <button onclick="this.closest('.modal-overlay').remove()" style="
                    position: absolute; top: 15px; right: 15px; background: transparent;
                    border: none; color: #888; font-size: 1.5rem; cursor: pointer;
                ">&times;</button>

                <h2 style="color: white; margin-bottom: 1.5rem;">
                    <i class="bi bi-card-heading"></i> ${modalTitle}
                </h2>

                <form id="about-card-form" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="form-group">
                        <label>Título *</label>
                        <input type="text" class="form-control" name="title" required value="${escapeHtml(card.title || '')}">
                    </div>

                    <div class="form-group">
                        <label>Subtítulo</label>
                        <input type="text" class="form-control" name="subtitle" value="${escapeHtml(card.subtitle || '')}">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label>Icono (clase Bootstrap Icons)</label>
                            <input type="text" class="form-control" name="icon" value="${escapeHtml(card.icon || 'bi-star')}" placeholder="bi-star">
                            <small style="color: #888;">Ej: bi-heart, bi-people, bi-building</small>
                        </div>
                        <div class="form-group">
                            <label>Orden</label>
                            <input type="number" class="form-control" name="display_order" value="${card.display_order || 1}" min="1">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Descripción</label>
                        <textarea class="form-control" name="description" rows="4" style="resize: vertical;">${escapeHtml(card.description || '')}</textarea>
                    </div>

                    <div class="form-group">
                        <label>Imagen de Fondo</label>
                        <div style="display: flex; gap: 10px; align-items: flex-start;">
                            <div style="flex: 1;">
                                <input type="text" class="form-control" name="image_url" value="${escapeHtml(card.image_url || '')}" placeholder="URL de imagen o subir archivo">
                                <input type="file" id="about-card-image-upload" accept="image/*" style="margin-top: 10px;">
                            </div>
                            <div id="about-card-image-preview" style="
                                width: 100px; height: 80px; border-radius: 10px; overflow: hidden;
                                background: ${card.image_url ? `url('${card.image_url}')` : '#333'};
                                background-size: cover; background-position: center;
                                border: 1px solid #444; flex-shrink: 0;
                            "></div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" name="is_active" ${card.is_active ? 'checked' : ''} style="width: 20px; height: 20px;">
                            <span>Tarjeta activa (visible en la página)</span>
                        </label>
                    </div>

                    <button type="submit" class="btn btn-login" style="width: 100%; margin-top: 10px;">
                        <i class="bi bi-check-circle"></i> ${currentEditingCard ? 'Guardar Cambios' : 'Crear Tarjeta'}
                    </button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Image upload handler
        const fileInput = document.getElementById('about-card-image-upload');
        const imageUrlInput = modal.querySelector('input[name="image_url"]');
        const imagePreview = document.getElementById('about-card-image-preview');

        fileInput.addEventListener('change', async function (e) {
            const file = e.target.files[0];
            if (!file) return;

            // Show loading
            imagePreview.innerHTML = '<i class="bi bi-hourglass-split" style="color: #888; font-size: 1.5rem; display: flex; justify-content: center; align-items: center; height: 100%;"></i>';

            try {
                const result = await ApiService.uploadAboutCardImage(file);
                if (result.success) {
                    imageUrlInput.value = result.url;
                    imagePreview.innerHTML = '';
                    imagePreview.style.backgroundImage = `url('${result.url}')`;
                    Swal.fire({
                        icon: 'success',
                        title: 'Imagen subida',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2000
                    });
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                Swal.fire('Error', error.message || 'Error subiendo imagen', 'error');
                imagePreview.innerHTML = '';
            }
        });

        // Form submit handler
        modal.querySelector('#about-card-form').addEventListener('submit', async function (e) {
            e.preventDefault();

            const formData = new FormData(e.target);
            const cardData = {
                title: formData.get('title'),
                subtitle: formData.get('subtitle'),
                icon: formData.get('icon') || 'bi-star',
                description: formData.get('description'),
                image_url: formData.get('image_url'),
                display_order: parseInt(formData.get('display_order')) || 1,
                is_active: formData.get('is_active') ? 1 : 0
            };

            if (!cardData.title.trim()) {
                Swal.fire('Error', 'El título es obligatorio', 'error');
                return;
            }

            try {
                let result;
                if (currentEditingCard) {
                    cardData.id = currentEditingCard.id;
                    result = await ApiService.updateAboutCard(cardData);
                } else {
                    result = await ApiService.createAboutCard(cardData);
                }

                if (result.success) {
                    Swal.fire({
                        icon: 'success',
                        title: currentEditingCard ? 'Tarjeta actualizada' : 'Tarjeta creada',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2000
                    });
                    modal.remove();
                    loadAboutCardsAdmin();
                } else {
                    throw new Error(result.message || result.error);
                }
            } catch (error) {
                Swal.fire('Error', error.message || 'Error guardando tarjeta', 'error');
            }
        });

        // Close on overlay click
        modal.addEventListener('click', function (e) {
            if (e.target === modal) modal.remove();
        });
    }

    // ==========================================
    // TOGGLE STATUS & DELETE
    // ==========================================

    window.toggleAboutCardStatus = async function (cardId, newStatus) {
        try {
            const result = await ApiService.updateAboutCard({
                id: cardId,
                is_active: newStatus
            });

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: newStatus ? 'Tarjeta activada' : 'Tarjeta desactivada',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000
                });
                loadAboutCardsAdmin();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            Swal.fire('Error', error.message || 'Error actualizando estado', 'error');
        }
    };

    window.deleteAboutCard = async function (cardId) {
        const confirm = await Swal.fire({
            title: '¿Eliminar tarjeta?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirm.isConfirmed) return;

        try {
            const result = await ApiService.deleteAboutCard(cardId);

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Tarjeta eliminada',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000
                });
                loadAboutCardsAdmin();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            Swal.fire('Error', error.message || 'Error eliminando tarjeta', 'error');
        }
    };

    // ==========================================
    // UTILITIES
    // ==========================================

    // --- NEW TAB SYSTEM ---
    window.switchContentTab = function (tab) {
        document.getElementById('content-tab-cards').style.display = tab === 'cards' ? 'block' : 'none';
        document.getElementById('content-tab-mission').style.display = tab === 'mission' ? 'block' : 'none';

        // Update tab styling
        const tabCards = document.getElementById('tab-cards');
        const tabMission = document.getElementById('tab-mission');

        if (tab === 'cards') {
            tabCards.style.background = 'rgba(155,89,182,0.15)';
            tabCards.style.borderColor = '#9b59b6';
            tabCards.style.color = 'white';
            tabMission.style.background = 'transparent';
            tabMission.style.borderColor = 'transparent';
            tabMission.style.color = '#888';
        } else {
            tabMission.style.background = 'rgba(46, 204, 113, 0.1)';
            tabMission.style.borderColor = '#2ecc71';
            tabMission.style.color = 'white';
            tabCards.style.background = 'transparent';
            tabCards.style.borderColor = 'transparent';
            tabCards.style.color = '#888';
            loadMissionValuesAdmin();
        }
    };

    let currentMissionValues = null;

    async function loadMissionValuesAdmin() {
        const grid = document.getElementById('admin-values-grid');
        const missionText = document.getElementById('admin-mission-desc');

        grid.innerHTML = '<p style="color:#888; text-align:center; grid-column:1/-1;">Cargando...</p>';

        try {
            const response = await ApiService.getMissionValues();
            if (response.success) {
                currentMissionValues = response.data;
                missionText.value = response.data.mission.description;

                grid.innerHTML = response.data.values.map(val => `
                    <div style="background:#222; padding:15px; border-radius:12px; border:1px solid #444; display:flex; flex-direction:column; gap:12px;">
                        <div style="display:flex; gap:12px; align-items:flex-start;">
                            <div class="value-image-preview" data-id="${val.id}" style="
                                width:80px; height:60px; border-radius:8px; overflow:hidden;
                                background: ${val.image_url ? `url('${val.image_url}')` : '#333'};
                                background-size:cover; background-position:center; border:1px solid #444; flex-shrink:0; cursor:pointer;
                            " onclick="window.triggerValueImageUpload(this)" title="Cambiar imagen">
                                ${!val.image_url ? '<i class="bi bi-image" style="color:#555; display:flex; justify-content:center; align-items:center; height:100%;"></i>' : ''}
                            </div>
                            <div style="flex:1;">
                                <div class="form-group" style="margin-bottom:8px;">
                                    <input type="text" class="form-control value-title" data-id="${val.id}" value="${escapeHtml(val.title)}" placeholder="Título" style="font-weight:600;">
                                </div>
                                <div class="form-group">
                                    <input type="text" class="form-control value-desc" value="${escapeHtml(val.description)}" placeholder="Descripción corta" style="font-size:0.9rem;">
                                </div>
                            </div>
                        </div>
                        
                        <div style="display:flex; gap:10px; align-items:center;">
                            <div class="form-group" style="flex:2; margin:0;">
                                <input type="text" class="form-control value-icon" value="${escapeHtml(val.icon)}" placeholder="Icono (ej: bi-star)">
                            </div>
                            <div class="form-group" style="flex:3; margin:0;">
                                <input type="text" class="form-control value-image-url" value="${escapeHtml(val.image_url || '')}" placeholder="URL de imagen">
                            </div>
                            <button onclick="window.saveSingleValue(this)" style="background:#2ecc71; border:none; color:white; border-radius:8px; width:45px; height:38px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;" onmouseover="this.style.background='#27ae60'" onmouseout="this.style.background='#2ecc71'" title="Guardar cambios">
                                <i class="bi bi-save"></i>
                            </button>
                        </div>
                        <input type="file" class="value-image-file" style="display:none;" accept="image/*" onchange="window.handleValueImageUpload(this)">
                    </div>
                `).join('');
            }
        } catch (e) {
            console.error(e);
        }
    }

    window.triggerValueImageUpload = function (div) {
        div.parentElement.parentElement.querySelector('.value-image-file').click();
    };

    window.handleValueImageUpload = async function (input) {
        const file = input.files[0];
        if (!file) return;

        const parent = input.parentElement;
        const preview = parent.querySelector('.value-image-preview');
        const urlInput = parent.querySelector('.value-image-url');

        preview.innerHTML = '<i class="bi bi-hourglass-split" style="color:#888; display:flex; justify-content:center; align-items:center; height:100%;"></i>';

        try {
            const res = await ApiService.uploadAboutCardImage(file);
            if (res.success) {
                urlInput.value = res.url;
                preview.style.backgroundImage = `url('${res.url}')`;
                preview.innerHTML = '';
            } else {
                Swal.fire('Error', res.message, 'error');
                preview.innerHTML = '';
            }
        } catch (e) {
            Swal.fire('Error', 'No se pudo subir la imagen', 'error');
            preview.innerHTML = '';
        }
    };

    window.saveMissionOnly = async function () {
        const desc = document.getElementById('admin-mission-desc').value;
        try {
            const res = await ApiService.updateMissionValues({
                mission: { title: 'Nuestra Misión', description: desc }
            });
            if (res.success) Swal.fire({ icon: 'success', title: 'Misión actualizada', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        } catch (e) { /* error toast */ }
    };

    window.saveSingleValue = async function (btn) {
        const parent = btn.parentElement.parentElement;
        const id = parent.querySelector('.value-title').dataset.id;
        const title = parent.querySelector('.value-title').value;
        const desc = parent.querySelector('.value-desc').value;
        const icon = parent.querySelector('.value-icon').value;
        const imageUrl = parent.querySelector('.value-image-url').value;

        try {
            const res = await ApiService.updateMissionValues({
                values: [{ id, title, description: desc, icon, image_url: imageUrl }]
            });
            if (res.success) Swal.fire({ icon: 'success', title: 'Valor actualizado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        } catch (e) { /* error toast */ }
    };

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

})();
