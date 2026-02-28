/**
 * Admin Content Manager
 * Gestiona las tarjetas "Sobre Nosotros" y contenido dinÃ¡mico
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
                <div style="display:flex; background:#111; padding:0 30px; border-bottom:1px solid #333;">
                    <button onclick="window.switchContentTab('cards')" id="tab-cards" style="padding:15px 25px; background:rgba(155,89,182,0.15); border:none; border-bottom:3px solid #9b59b6; color:white; font-weight:600; cursor:pointer; transition:all 0.2s;">
                        <i class="bi bi-card-text"></i> Tarjetas "Sobre Nosotros"
                    </button>
                    <button onclick="window.switchContentTab('mission')" id="tab-mission" style="padding:15px 25px; background:transparent; border:none; border-bottom:3px solid transparent; color:#888; font-weight:600; cursor:pointer; transition:all 0.2s;">
                        <i class="bi bi-star-fill"></i> Misión y Valores
                    </button>
                    <button onclick="window.switchContentTab('enrollment')" id="tab-enrollment" style="padding:15px 25px; background:transparent; border:none; border-bottom:3px solid transparent; color:#888; font-weight:600; cursor:pointer; transition:all 0.2s;">
                        <i class="bi bi-check2-circle"></i> Disponibilidad Matrículas
                    </button>
                    <button onclick="window.switchContentTab('portada')" id="tab-portada" style="padding:15px 25px; background:transparent; border:none; border-bottom:3px solid transparent; color:#888; font-weight:600; cursor:pointer; transition:all 0.2s;">
                        <i class="bi bi-image"></i> Hero Portada
                    </button>
                    <button onclick="window.switchContentTab('hero')" id="tab-hero" style="padding:15px 25px; background:transparent; border:none; border-bottom:3px solid transparent; color:#888; font-weight:600; cursor:pointer; transition:all 0.2s;">
                        <i class="bi bi-images"></i> Hero Carrusel
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

                <div id="content-tab-enrollment" style="padding:40px 30px; max-height:calc(85vh - 180px); overflow-y:auto; display:none;">
                    <div style="max-width:600px; margin:0 auto; background:rgba(255,255,255,0.03); padding:35px; border-radius:20px; border:1px solid #333; text-align:center;">
                        <div id="enrollment-status-indicator" style="width:80px; height:80px; border-radius:50%; margin:0 auto 25px; display:flex; align-items:center; justify-content:center; font-size:2.5rem; transition:all 0.3s; background:rgba(46, 204, 113, 0.1); color:#2ecc71; border:2px solid rgba(46, 204, 113, 0.3);">
                            <i class="bi bi-unlock-fill"></i>
                        </div>
                        
                        <h3 id="enrollment-status-text" style="color:white; margin:0 0 10px 0; font-size:1.4rem;">Matrículas Abiertas</h3>
                        <p style="color:#888; margin-bottom:30px;">Controla si los aspirantes pueden realizar su pre-inscripción en la web.</p>
                        
                        <div style="display:flex; flex-direction:column; gap:25px; align-items:center; background:rgba(0,0,0,0.2); padding:30px; border-radius:15px; border:1px solid #444;">
                            <!-- Enrollment Toggle -->
                            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:400px;">
                                <span style="color:white; font-size:1.1rem; font-weight:500;">Estado del Sistema</span>
                                <label class="switch" style="position:relative; display:inline-block; width:60px; height:34px;">
                                    <input type="checkbox" id="enrollment-open-toggle" onchange="window.updateEnrollmentPreview(this.checked)" style="opacity:0; width:0; height:0;">
                                    <span class="slider round" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#333; transition:.4s; border-radius:34px;"></span>
                                </label>
                            </div>
                            
                            <!-- Year Selection -->
                            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:400px;">
                                <div style="text-align:left;">
                                    <span style="color:white; font-size:1.1rem; font-weight:500; display:block;">Año de Vigencia</span>
                                    <small style="color:#666;">Próximo periodo de matrículas</small>
                                </div>
                                <input type="number" id="enrollment-year-input" class="form-control" style="width:100px; text-align:center; font-size:1.2rem; font-weight:bold; background:#111; color:white; border-color:#444;" value="${new Date().getFullYear()}">
                            </div>
                            
                            <button onclick="window.saveEnrollmentConfig()" class="btn-module" style="width:100%; max-width:400px; padding:15px; margin-top:10px; background:linear-gradient(135deg, #2ecc71, #27ae60); color:white; font-weight:bold; font-size:1rem; border:none; box-shadow:0 5px 15px rgba(46, 204, 113, 0.2);">
                                <i class="bi bi-save-fill"></i> Guardar Configuración
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Tab: Hero Portada (imagen fija + textos) -->
                <div id="content-tab-portada" style="padding:25px 30px; max-height:calc(85vh - 180px); overflow-y:auto; display:none;">
                    <!-- Imagen de fondo con recorte 16:9 -->
                    <div style="margin-bottom:25px;">
                        <label style="color:var(--color-acento-azul); display:block; margin-bottom:10px; font-weight:bold; font-size:0.8rem; text-transform:uppercase;">
                            <i class="bi bi-image"></i> 1. Imagen de Fondo (Respaldo 16:9)
                        </label>
                        <p style="color:#555; font-size:0.8rem; margin:0 0 12px 0;">Se muestra cuando no hay carrusel activo. Arrastra para ajustar el encuadre.</p>
                        <div id="cm-crop-container" style="width:384px; height:216px; margin:0 auto; background:#000; border:2px solid #333; border-radius:10px; overflow:hidden; position:relative; cursor:grab; box-sizing:content-box; max-width:100%;">
                            <div id="cm-crop-instruction" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#555; pointer-events:none; z-index:10; text-align:center; font-size:0.9rem; white-space:nowrap;">
                                <i class="bi bi-arrows-move"></i> Arrastra para ajustar
                            </div>
                            <img id="cm-crop-target" style="transform-origin:top left; position:absolute; top:0; left:0; pointer-events:none; user-select:none; max-width:none;">
                        </div>
                        <div id="cm-crop-controls" style="margin-top:10px; display:none; align-items:center; justify-content:center; gap:15px;">
                            <i class="bi bi-zoom-in" style="color:#777;"></i>
                            <input type="range" id="cm-crop-zoom" min="1" max="3" step="0.01" value="1" style="width:200px; accent-color:var(--color-acento-azul);">
                        </div>
                        <input type="file" id="cm-hero-upload-input" accept="image/*" style="display:none;">
                        <div style="margin-top:14px; text-align:center;">
                            <button onclick="document.getElementById('cm-hero-upload-input').click()" style="background:#1a1a1a; color:#ccc; border:1px solid #444; padding:8px 18px; border-radius:50px; cursor:pointer; font-size:0.85rem;">
                                <i class="bi bi-folder2-open"></i> Elegir nueva foto
                            </button>
                        </div>
                    </div>

                    <!-- Textos -->
                    <div style="border-top:1px solid #333; padding-top:20px; margin-bottom:20px;">
                        <label style="color:var(--color-acento-azul); display:block; margin-bottom:14px; font-weight:bold; font-size:0.8rem; text-transform:uppercase;">
                            <i class="bi bi-fonts"></i> 2. Textos de la Portada
                        </label>
                        <div style="margin-bottom:14px;">
                            <label style="color:#888; display:block; margin-bottom:5px; font-size:0.85rem;">Frase Principal (Tagline — imagen fija):</label>
                            <input type="text" id="cm-hero-tagline-input" placeholder="Ej: Donde la pasión se convierte en arte"
                                style="width:100%; padding:10px; background:#111; border:1px solid #444; border-radius:8px; color:white; outline:none; font-size:0.95rem; box-sizing:border-box;">
                        </div>
                        <div>
                            <label style="color:#888; display:block; margin-bottom:5px; font-size:0.85rem;">Texto del Botón (CTA):</label>
                            <input type="text" id="cm-hero-cta-input" placeholder="Ej: Descubre Nuestros Programas"
                                style="width:100%; padding:10px; background:#111; border:1px solid #444; border-radius:8px; color:white; outline:none; font-size:0.95rem; box-sizing:border-box;">
                        </div>
                    </div>

                    <div style="text-align:center; padding-bottom:5px;">
                        <button onclick="window.saveHeroPortada()" style="background:var(--color-acento-azul); color:white; border:none; padding:12px 40px; border-radius:50px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:8px; font-size:1rem; box-shadow:0 4px 15px rgba(52,152,219,0.3);">
                            <i class="bi bi-check-lg"></i> Guardar Portada
                        </button>
                    </div>
                </div>

                <!-- Tab: Hero Carrusel -->
                <div id="content-tab-hero" style="padding:25px 30px; max-height:calc(85vh - 180px); overflow-y:auto; display:none;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
                        <div>
                            <h3 style="color:white; margin:0; font-size:1.1rem;">
                                <i class="bi bi-images" style="color:var(--color-acento-naranja);"></i> Slides del Hero (máx. 4)
                            </h3>
                            <p style="color:#666; font-size:0.82rem; margin:4px 0 0 0;">Soporta imágenes (URL), YouTube, Google Drive, Vimeo o video directo (.mp4).</p>
                        </div>
                        <button onclick="window.saveHeroSlides()" style="background:linear-gradient(135deg, var(--color-acento-naranja), #c0671a); color:white; border:none; padding:10px 22px; border-radius:10px; cursor:pointer; font-weight:600; font-size:0.9rem; display:flex; align-items:center; gap:8px;">
                            <i class="bi bi-save-fill"></i> Guardar Carrusel
                        </button>
                    </div>
                    <!-- Botón CTA global -->
                    <div style="background:rgba(255,255,255,0.03); border:1px solid #333; border-radius:14px; padding:18px 20px; margin-bottom:16px;">
                        <label style="color:#aaa; font-size:0.82rem; display:block; margin-bottom:6px;">
                            <i class="bi bi-cursor-text" style="color:var(--color-acento-naranja);"></i>
                            Texto del botón CTA <span style="color:#666;">(mismo para todos los slides)</span>
                        </label>
                        <input type="text" id="hero-cta-global" class="form-control"
                            placeholder="Ej: Descubre Nuestros Programas"
                            style="background:#111; border-color:#444; color:white; font-size:0.9rem; border-radius:8px; padding:8px 12px; width:100%; box-sizing:border-box;">
                    </div>

                    <div id="hero-slides-grid" style="display:flex; flex-direction:column; gap:16px;">
                        <div style="color:#888; text-align:center; padding:2rem;">
                            <i class="bi bi-hourglass-split" style="font-size:2rem; animation:pulse 1.5s infinite;"></i>
                            <p>Cargando slides...</p>
                        </div>
                    </div>
                    <div style="margin-top:20px; padding:15px 20px; background:rgba(231,140,59,0.06); border:1px solid rgba(231,140,59,0.2); border-radius:12px;">
                        <p style="color:#aaa; font-size:0.82rem; margin:0; line-height:1.6;">
                            <i class="bi bi-lightbulb" style="color:var(--color-acento-naranja);"></i>
                            <strong style="color:var(--color-acento-naranja);">Tips:</strong>
                            Para YouTube pega la URL normal (ej: <em>youtube.com/watch?v=…</em>). Para Google Drive comparte el archivo y pega el enlace.
                            Los slides inactivos no aparecen en el sitio. El orden es de arriba a abajo.
                        </p>
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
                    <p>Error de conexiÃ³n</p>
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
                    ">${card.is_active ? 'â— Activo' : 'â—‹ Inactivo'}</span>
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
                    <p>Error de conexiÃ³n</p>
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
                        <label>T\u00edtulo *</label>
                        <input type="text" class="form-control" name="title" required value="${escapeHtml(card.title || '')}">
                    </div>

                    <div class="form-group">
                        <label>Subt\u00edtulo</label>
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
                        <label>Descripci\u00f3n</label>
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
                            <span>Tarjeta activa (visible en la p\u00e1gina)</span>
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
                Swal.fire('Error', 'El t\u00edtulo es obligatorio', 'error');
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
            title: '\u00bfEliminar tarjeta?',
            text: 'Esta acci\u00f3n no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            confirmButtonText: 'SÃ­, eliminar',
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
        document.getElementById('content-tab-cards').style.display    = tab === 'cards'    ? 'block' : 'none';
        document.getElementById('content-tab-mission').style.display  = tab === 'mission'  ? 'block' : 'none';
        document.getElementById('content-tab-enrollment').style.display = tab === 'enrollment' ? 'block' : 'none';
        document.getElementById('content-tab-portada').style.display  = tab === 'portada'  ? 'block' : 'none';
        document.getElementById('content-tab-hero').style.display     = tab === 'hero'     ? 'block' : 'none';

        const tabCards      = document.getElementById('tab-cards');
        const tabMission    = document.getElementById('tab-mission');
        const tabEnrollment = document.getElementById('tab-enrollment');
        const tabPortada    = document.getElementById('tab-portada');
        const tabHero       = document.getElementById('tab-hero');

        [tabCards, tabMission, tabEnrollment, tabPortada, tabHero].forEach(t => {
            if (t) { t.style.background = 'transparent'; t.style.borderColor = 'transparent'; t.style.color = '#888'; }
        });

        if (tab === 'cards') {
            tabCards.style.background = 'rgba(155,89,182,0.15)';
            tabCards.style.borderColor = '#9b59b6';
            tabCards.style.color = 'white';
        } else if (tab === 'mission') {
            tabMission.style.background = 'rgba(46,204,113,0.1)';
            tabMission.style.borderColor = '#2ecc71';
            tabMission.style.color = 'white';
            loadMissionValuesAdmin();
        } else if (tab === 'enrollment') {
            tabEnrollment.style.background = 'rgba(52,152,219,0.1)';
            tabEnrollment.style.borderColor = 'var(--color-acento-azul)';
            tabEnrollment.style.color = 'white';
            loadEnrollmentConfigAdmin();
        } else if (tab === 'portada') {
            tabPortada.style.background = 'rgba(52,152,219,0.1)';
            tabPortada.style.borderColor = 'var(--color-acento-azul)';
            tabPortada.style.color = 'white';
            loadHeroPortadaTab();
        } else if (tab === 'hero') {
            tabHero.style.background = 'rgba(231,140,59,0.12)';
            tabHero.style.borderColor = 'var(--color-acento-naranja)';
            tabHero.style.color = 'white';
            loadHeroSlidesAdmin();
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
                                    <input type="text" class="form-control value-title" data-id="${val.id}" value="${escapeHtml(val.title)}" placeholder="T\u00edtulo" style="font-weight:600;">
                                </div>
                                <div class="form-group">
                                    <input type="text" class="form-control value-desc" value="${escapeHtml(val.description)}" placeholder="Descripci\u00f3n corta" style="font-size:0.9rem;">
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
                mission: { title: 'Nuestra Misi\u00f3n', description: desc }
            });
            if (res.success) Swal.fire({ icon: 'success', title: 'Misi\u00f3n actualizada', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
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

    // ==========================================
    // ENROLLMENT CONFIG LOGIC
    // ==========================================

    async function loadEnrollmentConfigAdmin() {
        try {
            const response = await ApiService.getEnrollmentStatus();
            if (response.success) {
                const isOpen = response.enrollment_open;
                const year = response.enrollment_year;

                const toggle = document.getElementById('enrollment-open-toggle');
                const yearInput = document.getElementById('enrollment-year-input');

                if (toggle) toggle.checked = isOpen;
                if (yearInput) yearInput.value = year;

                window.updateEnrollmentPreview(isOpen);
            }
        } catch (error) {
            console.error('Error loading enrollment config:', error);
        }
    }

    window.updateEnrollmentPreview = function (isOpen) {
        const indicator = document.getElementById('enrollment-status-indicator');
        const statusText = document.getElementById('enrollment-status-text');
        const slider = document.querySelector('#content-tab-enrollment .slider');

        const yearInput = document.getElementById('enrollment-year-input');
        const yearGroup = yearInput ? yearInput.parentElement : null;

        if (isOpen) {
            indicator.style.background = 'rgba(46, 204, 113, 0.1)';
            indicator.style.color = '#2ecc71';
            indicator.style.borderColor = 'rgba(46, 204, 113, 0.3)';
            indicator.innerHTML = '<i class="bi bi-unlock-fill"></i>';
            statusText.textContent = 'Matrículas Abiertas';
            statusText.style.color = '#2ecc71';
            if (slider) slider.style.backgroundColor = '#2ecc71';

            // Habilitar input de año
            if (yearInput) {
                yearInput.disabled = false;
                yearInput.placeholder = "Ej: 2026";
            }
            if (yearGroup) yearGroup.style.opacity = '1';
        } else {
            indicator.style.background = 'rgba(231, 76, 60, 0.1)';
            indicator.style.color = '#e74c3c';
            indicator.style.borderColor = 'rgba(231, 76, 60, 0.3)';
            indicator.innerHTML = '<i class="bi bi-lock-fill"></i>';
            statusText.textContent = 'Matrículas Cerradas';
            statusText.style.color = '#e74c3c';
            if (slider) slider.style.backgroundColor = '#e74c3c';

            // Deshabilitar input de año si se prefiere dejar vacío al cerrar
            if (yearInput) {
                yearInput.disabled = true;
                yearInput.placeholder = "(Opcional al estar cerrado)";
            }
            if (yearGroup) yearGroup.style.opacity = '0.6';
        }
    };

    window.saveEnrollmentConfig = async function () {
        const isOpen = document.getElementById('enrollment-open-toggle').checked;
        const yearInput = document.getElementById('enrollment-year-input');
        const yearValue = yearInput ? yearInput.value.trim() : "";
        const year = yearValue ? parseInt(yearValue) : null;

        if (isOpen) {
            if (!year || isNaN(year) || year < 2020 || year > 2099) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Año requerido',
                    text: 'Debe especificar una vigencia válida (2020-2099) para abrir las matrículas.',
                    background: '#1a1a1a',
                    color: '#fff'
                });
                return;
            }
        }

        Swal.fire({
            title: 'Guardando...',
            didOpen: () => Swal.showLoading(),
            background: '#1a1a1a',
            color: '#fff'
        });

        try {
            const result = await ApiService.updateEnrollmentStatus(isOpen, year);
            if (result.success) {
                const statusLabel = isOpen ? 'Abiertas' : 'Cerradas';
                const yearLabel = year ? ` para el periodo ${year}` : '';

                Swal.fire({
                    icon: 'success',
                    title: 'Configuración guardada',
                    text: `Matrículas ${statusLabel}${yearLabel}`,
                    background: '#1a1a1a',
                    color: '#fff',
                    timer: 2000,
                    showConfirmButton: false
                });
                // Actualizar badges en otras partes si es necesario
                document.dispatchEvent(new CustomEvent('enrollment-status-updated', {
                    detail: { isOpen, year }
                }));
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            Swal.fire('Error', error.message || 'Error al guardar configuración', 'error');
        }
    };

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==========================================
    // HERO PORTADA ADMIN (imagen fija + textos)
    // ==========================================

    const CM_VP_W = 384;
    const CM_VP_H = 216;
    let cmCropX = 0, cmCropY = 0, cmScale = 1, cmMinScale = 1;
    let cmDragStart = { x: 0, y: 0 };
    let cmIsDragging = false;
    let cmImgWidth = 0, cmImgHeight = 0;
    let cmHasNewFile = false;
    let cmListenersAttached = false;

    async function loadHeroPortadaTab() {
        // Cargar textos actuales
        try {
            const baseUrl = window.ApiService?.baseUrl || '/api/';
            const resp = await fetch(`${baseUrl}site_config.php`);
            const data = await resp.json();
            if (data.success) {
                const tagEl = document.getElementById('cm-hero-tagline-input');
                const ctaEl = document.getElementById('cm-hero-cta-input');
                if (tagEl) tagEl.value = data.hero_tagline || '';
                if (ctaEl) ctaEl.value = data.hero_cta_text || '';
            }
        } catch (e) { /* silent */ }

        // Inicializar cropper con la imagen actual
        const imgEl = document.getElementById('cm-crop-target');
        if (imgEl && !imgEl.src.includes('hero-banner')) {
            imgEl.src = 'images/hero-banner.jpg?t=' + Date.now();
        }
        setupCmCropper(false);
        attachCmListeners();
    }

    function setupCmCropper(isNewFile) {
        const imgEl = document.getElementById('cm-crop-target');
        if (!imgEl) return;
        const init = () => {
            cmImgWidth  = imgEl.naturalWidth;
            cmImgHeight = imgEl.naturalHeight;
            if (!cmImgWidth) return;
            const scaleW = CM_VP_W / cmImgWidth;
            const scaleH = CM_VP_H / cmImgHeight;
            cmMinScale = Math.max(scaleW, scaleH);
            cmScale    = cmMinScale;
            cmCropX    = (CM_VP_W - cmImgWidth  * cmScale) / 2;
            cmCropY    = (CM_VP_H - cmImgHeight * cmScale) / 2;
            updateCmTransform();

            const zoom = document.getElementById('cm-crop-zoom');
            if (zoom) { zoom.min = cmMinScale; zoom.max = cmMinScale * 3; zoom.value = cmScale; }

            const controls = document.getElementById('cm-crop-controls');
            if (controls) controls.style.display = 'flex';
            const instr = document.getElementById('cm-crop-instruction');
            if (instr) instr.style.display = isNewFile ? 'block' : 'none';
            cmHasNewFile = isNewFile;
        };
        if (imgEl.complete && imgEl.naturalWidth > 0) { init(); }
        else { imgEl.onload = init; }
    }

    function attachCmListeners() {
        if (cmListenersAttached) return;
        cmListenersAttached = true;

        const container = document.getElementById('cm-crop-container');
        if (container) {
            container.addEventListener('mousedown', (e) => {
                cmIsDragging = true;
                cmDragStart  = { x: e.clientX - cmCropX, y: e.clientY - cmCropY };
                container.style.cursor = 'grabbing';
            });
        }
        window.addEventListener('mousemove', (e) => {
            if (!cmIsDragging) return;
            cmCropX = e.clientX - cmDragStart.x;
            cmCropY = e.clientY - cmDragStart.y;
            updateCmTransform();
        });
        window.addEventListener('mouseup', () => {
            cmIsDragging = false;
            const c = document.getElementById('cm-crop-container');
            if (c) c.style.cursor = 'grab';
        });

        const zoom = document.getElementById('cm-crop-zoom');
        if (zoom) zoom.addEventListener('input', (e) => { cmScale = parseFloat(e.target.value); updateCmTransform(); });

        const fileInput = document.getElementById('cm-hero-upload-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (!e.target.files?.[0]) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const imgEl = document.getElementById('cm-crop-target');
                    if (imgEl) { imgEl.src = evt.target.result; imgEl.onload = () => setupCmCropper(true); }
                };
                reader.readAsDataURL(e.target.files[0]);
            });
        }
    }

    function updateCmTransform() {
        const imgEl = document.getElementById('cm-crop-target');
        if (!imgEl) return;
        const minX = CM_VP_W - cmImgWidth  * cmScale;
        const minY = CM_VP_H - cmImgHeight * cmScale;
        if (cmCropX > 0)    cmCropX = 0;
        if (cmCropX < minX) cmCropX = minX;
        if (cmCropY > 0)    cmCropY = 0;
        if (cmCropY < minY) cmCropY = minY;
        imgEl.style.transform = `translate(${cmCropX}px, ${cmCropY}px) scale(${cmScale})`;
    }

    window.saveHeroPortada = async function () {
        const tagEl = document.getElementById('cm-hero-tagline-input');
        const ctaEl = document.getElementById('cm-hero-cta-input');

        Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading(), background: '#1a1a1a', color: '#fff' });

        try {
            const configRes = await ApiService.updateSiteConfig({
                hero_tagline:  tagEl?.value.trim() || '',
                hero_cta_text: ctaEl?.value.trim() || ''
            });
            if (!configRes.success) throw new Error(configRes.message);

            const fileInput = document.getElementById('cm-hero-upload-input');
            if (fileInput?.files[0] && cmHasNewFile) {
                const imgRes = await ApiService.updateHeroImage(fileInput.files[0], {
                    crop_x: -cmCropX / cmScale,
                    crop_y: -cmCropY / cmScale,
                    crop_w: CM_VP_W  / cmScale,
                    crop_h: CM_VP_H  / cmScale
                });
                if (!imgRes.success) {
                    Swal.fire('Parcial', 'Textos guardados, pero error en imagen: ' + imgRes.message, 'warning');
                    return;
                }
            }

            Swal.fire({ icon: 'success', title: 'Portada actualizada', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
        } catch (e) {
            Swal.fire('Error', e.message, 'error');
        }
    };

    // ==========================================
    // HERO CAROUSEL ADMIN
    // ==========================================

    function detectMediaType(url) {
        if (!url) return 'image';
        if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
        if (/drive\.google\.com/.test(url))      return 'gdrive';
        if (/vimeo\.com/.test(url))              return 'vimeo';
        if (/\.(mp4|webm|ogg)/i.test(url))       return 'video';
        return 'image';
    }

    function mediaTypeLabel(type) {
        const map = { youtube: 'YouTube', gdrive: 'Google Drive', vimeo: 'Vimeo', video: 'Video (.mp4)', image: 'Imagen' };
        return map[type] || 'Imagen';
    }

    function mediaTypeColor(type) {
        const map = { youtube: '#e74c3c', gdrive: '#4285F4', vimeo: '#1ab7ea', video: '#9b59b6', image: '#2ecc71' };
        return map[type] || '#2ecc71';
    }

    function renderHeroSlideRow(slide, index) {
        const type = detectMediaType(slide.url);
        const color = mediaTypeColor(type);
        const label = mediaTypeLabel(type);
        const isActive = slide.active !== false;

        return `
        <div class="hero-slide-row" data-index="${index}" style="
            background:rgba(255,255,255,0.03); border:1px solid #333; border-radius:14px; padding:18px 20px;
            display:flex; flex-direction:column; gap:12px; transition:border-color 0.2s;">
            <!-- Cabecera del slide -->
            <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="background:#111; border:1px solid #444; color:#aaa; font-size:0.75rem; font-weight:700;
                        width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center;">${index + 1}</span>
                    <span style="background:${color}22; color:${color}; border:1px solid ${color}44;
                        padding:3px 10px; border-radius:20px; font-size:0.75rem; font-weight:600;">${label}</span>
                </div>
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:#aaa; font-size:0.85rem;">
                    <input type="checkbox" class="hero-slide-active" ${isActive ? 'checked' : ''}
                        onchange="window.onHeroSlideActiveChange(${index})"
                        style="width:16px; height:16px; accent-color:var(--color-acento-naranja);">
                    Activo
                </label>
            </div>
            <!-- URL -->
            <div>
                <label style="color:#888; font-size:0.8rem; display:block; margin-bottom:5px;">URL del Media</label>
                <input type="url" class="hero-slide-url form-control" value="${escapeHtml(slide.url || '')}"
                    placeholder="https://youtube.com/watch?v=… · https://drive.google.com/… · https://midominio.com/img.jpg"
                    oninput="window.onHeroSlideUrlChange(${index}, this.value)"
                    style="background:#111; border-color:#444; color:white; font-size:0.85rem; border-radius:8px; padding:8px 12px; width:100%; box-sizing:border-box;">
            </div>
            <!-- Frase del slide -->
            <div>
                <label style="color:#888; font-size:0.8rem; display:block; margin-bottom:5px;">
                    Frase del slide <span style="color:#555;">(aparece en el hero sobre esta imagen/video)</span>
                </label>
                <input type="text" class="hero-slide-label form-control" value="${escapeHtml(slide.label || '')}"
                    placeholder="Ej: Donde la pasión se convierte en arte"
                    style="background:#111; border-color:#444; color:white; font-size:0.85rem; border-radius:8px; padding:8px 12px; width:100%; box-sizing:border-box;">
            </div>
        </div>`;
    }

    let heroSlides = [{url:'', label:'', active:true}, {url:'', label:'', active:false},
                      {url:'', label:'', active:false}, {url:'', label:'', active:false}];

    async function loadHeroSlidesAdmin() {
        const grid = document.getElementById('hero-slides-grid');
        if (!grid) return;

        try {
            const baseUrl = window.ApiService?.baseUrl || '/api/';
            const resp = await fetch(`${baseUrl}site_config.php`);
            const data = await resp.json();

            if (data.success && Array.isArray(data.hero_slides) && data.hero_slides.length > 0) {
                // Rellenar siempre con 4 slots
                heroSlides = Array.from({length: 4}, (_, i) => data.hero_slides[i] || {url:'', label:'', active:false});
            } else {
                heroSlides = Array.from({length: 4}, (_, i) => ({url:'', label:'', active: i === 0}));
            }
            // Cargar CTA global en el input
            const ctaInput = document.getElementById('hero-cta-global');
            if (ctaInput && data.hero_cta_text) ctaInput.value = data.hero_cta_text;
        } catch (e) {
            heroSlides = Array.from({length: 4}, (_, i) => ({url:'', label:'', active: i === 0}));
        }

        renderHeroGrid();
    }

    function renderHeroGrid() {
        const grid = document.getElementById('hero-slides-grid');
        if (!grid) return;
        grid.innerHTML = heroSlides.map((s, i) => renderHeroSlideRow(s, i)).join('');
    }

    window.onHeroSlideUrlChange = function(index, val) {
        heroSlides[index].url = val.trim();
        // Re-renderiza solo la chip de tipo
        const row = document.querySelector(`.hero-slide-row[data-index="${index}"]`);
        if (!row) return;
        const type = detectMediaType(val.trim());
        const color = mediaTypeColor(type);
        const label = mediaTypeLabel(type);
        const chip = row.querySelector('span:nth-child(2)');
        if (chip) {
            chip.style.background = `${color}22`;
            chip.style.color = color;
            chip.style.borderColor = `${color}44`;
            chip.textContent = label;
        }
    };

    window.onHeroSlideActiveChange = function(index) {
        const checkbox = document.querySelector(`.hero-slide-row[data-index="${index}"] .hero-slide-active`);
        if (checkbox) heroSlides[index].active = checkbox.checked;
    };

    window.saveHeroSlides = async function() {
        // Leer valores actuales del DOM
        document.querySelectorAll('.hero-slide-row').forEach((row, i) => {
            const urlEl   = row.querySelector('.hero-slide-url');
            const labelEl = row.querySelector('.hero-slide-label');
            const activeEl = row.querySelector('.hero-slide-active');
            if (urlEl)    heroSlides[i].url    = urlEl.value.trim();
            if (labelEl)  heroSlides[i].label  = labelEl.value.trim();
            if (activeEl) heroSlides[i].active = activeEl.checked;
        });

        // Filtrar slots completamente vacíos
        const toSave = heroSlides.filter(s => s.url !== '');

        // Leer CTA global
        const ctaText = (document.getElementById('hero-cta-global')?.value || '').trim();

        Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading(), background: '#1a1a1a', color: '#fff' });

        try {
            const baseUrl = window.ApiService?.baseUrl || '/api/';
            const token = ApiService.getToken ? ApiService.getToken() : localStorage.getItem('jam_token');
            const payload = { hero_slides: toSave };
            if (ctaText) payload.hero_cta_text = ctaText;

            const resp = await fetch(`${baseUrl}admin_site_config.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await resp.json();
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Carrusel guardado', text: `${toSave.length} slide(s) configurados.`,
                    background: '#1a1a1a', color: '#fff', timer: 2200, showConfirmButton: false });
            } else {
                throw new Error(data.message || 'Error al guardar');
            }
        } catch (e) {
            Swal.fire('Error', e.message, 'error');
        }
    };

})();