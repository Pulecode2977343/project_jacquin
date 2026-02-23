// ==========================================
// HOME EVENTS CAROUSEL & DETAIL OVERLAY
// ==========================================

// Load and display events in Swiper carousel
// Load and display events in Swiper carousel
// Global state for events
window.allEvents = [];
window.eventsSwiperInstance = null;

// Load and display events in Swiper carousel
async function loadEventsCarousel() {
    const ApiService = window.ApiService;
    const res = await ApiService.getEvents();

    // Cache events for filtering
    if (res.success && res.data) {
        window.allEvents = res.data.sort((a, b) => b.id_event - a.id_event); // Newest first
    }

    renderEventCards(window.allEvents);
    setupEventFilters();
}

function setupEventFilters() {
    const searchInput = document.getElementById('event-search');
    const filterSelect = document.getElementById('event-filter-type');

    if (!searchInput || !filterSelect) return;

    const filterEvents = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filterType = filterSelect.value; // 'all' or specific type

        const filtered = window.allEvents.filter(event => {
            const matchesText = event.title.toLowerCase().includes(searchTerm) ||
                (event.description && event.description.toLowerCase().includes(searchTerm));
            const matchesType = filterType === 'all' || event.event_type === filterType;

            return matchesText && matchesType;
        });

        renderEventCards(filtered);
    };

    searchInput.addEventListener('input', filterEvents);
    filterSelect.addEventListener('change', filterEvents);
}

function renderEventCards(eventsList) {
    const wrapper = document.getElementById('events-carousel-wrapper');
    const container = wrapper.closest('.events-swiper');

    // Destroy existing swiper if it exists to avoid conflicts
    if (window.eventsSwiperInstance) {
        window.eventsSwiperInstance.destroy(true, true);
        window.eventsSwiperInstance = null;
    }

    if (!eventsList || eventsList.length === 0) {
        wrapper.innerHTML = `
            <div class="swiper-slide no-events-slide" style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:300px; width:100%; cursor:default;">
                <div style="background:rgba(255,255,255,0.05); padding:30px; border-radius:50%; margin-bottom:20px;">
                    <i class="bi bi-calendar-x" style="font-size: 2.5rem; color: var(--humo-gris, #888);"></i>
                </div>
                <h4 style="color:white; margin-bottom:10px; font-weight:600;">No se encontraron eventos</h4>
                <p style="color:#888; text-align:center; max-width:300px;">
                    Intenta ajustar tus filtros de búsqueda.
                </p>
            </div>
        `;

        // Setup a dummy swiper just to hold the layout if needed, or just hide controls
        if (container) {
            container.querySelectorAll('.swiper-button-next, .swiper-button-prev, .swiper-pagination').forEach(el => el.style.display = 'none');
        }
        return;
    }

    // Limit to 7 if showing all, otherwise show all matches
    // (Optional: remove limit if filtering? Let's keep it for 'all' but maybe relaxing it is better for UX filtering)
    // Let's show all filtered results.
    const displayEvents = eventsList;

    // Generate event cards
    wrapper.innerHTML = displayEvents.map(event => `
        <div class="swiper-slide">
            <div class="program-card event-card-styled" data-event-id="${event.id_event}" style="background-image: url('${event.image_url || 'images/hero-banner.jpg'}');">
                <div class="program-overlay"></div>
                <div class="program-content">
                    <div class="program-icon"><i class="bi ${getEventIcon(event.event_type)}"></i></div>
                    <h3>${event.title}</h3>
                    <p>${event.event_date ? formatDate(event.event_date) : 'Próximamente'}</p>
                    
                    ${event.is_featured == 1 ? `
                    <div style="position:absolute; top:15px; right:15px; background:var(--naranja-neon, #e67e22); color:white; padding:4px 10px; border-radius:15px; font-size:0.7rem; font-weight:bold; box-shadow:0 0 10px rgba(230,126,34,0.5);">
                        <i class="bi bi-star-fill"></i>
                    </div>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    // Ensure controls are visible
    if (container) {
        container.querySelectorAll('.swiper-button-next, .swiper-button-prev, .swiper-pagination').forEach(el => el.style.display = 'flex');
        container.querySelectorAll('.swiper-button-next, .swiper-button-prev').forEach(el => el.style.removeProperty('display'));
        container.querySelector('.swiper-pagination').style.removeProperty('display');
    }

    // Initialize Swiper
    window.eventsSwiperInstance = new Swiper('.events-swiper', {
        effect: 'slide',
        grabCursor: true,
        centeredSlides: false, // Changed to false to align left typically, or keep centered if preferred design
        spaceBetween: 20,
        slidesPerView: 1,
        initialSlide: 0,
        loop: eventsList.length > 3, // Only loop if enough items
        speed: 600,

        navigation: {
            nextEl: '.events-swiper .swiper-button-next',
            prevEl: '.events-swiper .swiper-button-prev',
        },

        pagination: {
            el: '.events-swiper .swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },

        breakpoints: {
            480: { slidesPerView: 1.2, spaceBetween: 15 },
            768: { slidesPerView: 2.2, spaceBetween: 20 },
            1024: { slidesPerView: 3.2, spaceBetween: 20 },
            1366: { slidesPerView: 4, spaceBetween: 25 },
            1600: { slidesPerView: 5, spaceBetween: 30 }
        },

        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },

        on: {
            init: function (swiper) {
                const container = document.querySelector('.events-swiper');
                container.onclick = (e) => {
                    const card = e.target.closest('.event-card-styled');
                    if (card && card.dataset.eventId) {
                        showEventDetail(parseInt(card.dataset.eventId));
                    }
                };
            }
        }
    });
}

function getEventIcon(type) {
    const icons = {
        'concierto': 'bi-music-note-beamed',
        'recital': 'bi-mic',
        'taller': 'bi-tools',
        'masterclass': 'bi-easel',
        'presentacion': 'bi-people',
        'otro': 'bi-calendar-event'
    };
    return icons[type] || 'bi-calendar-event';
}

// Show event detail overlay
window.showEventDetail = async function (eventId) {
    const res = await ApiService.getEvents();
    if (!res.success) return;

    const event = res.data.find(e => e.id_event === eventId);
    if (!event) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'event-detail-overlay';
    overlay.className = 'modal-overlay';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.95)', zIndex: '10000',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        opacity: '0', transition: 'opacity 0.3s'
    });

    // Build media content
    let mediaHtml = '';
    if (event.media_type === 'video_youtube' && event.media_url) {
        const videoId = extractYouTubeID(event.media_url);
        mediaHtml = `
            <div style="margin:20px 0;">
                <iframe width="100%" height="400" style="border-radius:12px;" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    } else if (event.media_type === 'video_nativo' && event.media_url) {
        mediaHtml = `
            <div style="margin:20px 0;">
                <video controls style="width:100%; max-height:400px; border-radius:12px;">
                    <source src="${event.media_url}" type="video/mp4">
                    Tu navegador no soporta video HTML5.
                </video>
            </div>
        `;
    } else if (event.media_type === 'pdf' && event.media_url) {
        mediaHtml = `
            <div style="margin:20px 0;">
                <embed src="${event.media_url}" type="application/pdf" width="100%" height="500px" style="border-radius:12px;" />
                <p style="text-align:center; margin-top:10px;">
                    <a href="${event.media_url}" target="_blank" style="color:var(--color-acento-azul);">
                        <i class="bi bi-download"></i> Descargar PDF
                    </a>
                </p>
            </div>
        `;
    } else if (event.media_type === 'ppt' && event.media_url) {
        mediaHtml = `
            <div style="margin:20px 0;">
                <iframe src="https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + '/' + event.media_url)}" 
                    width="100%" height="500px" frameborder="0" style="border-radius:12px;">
                </iframe>
                <p style="text-align:center; margin-top:10px;">
                    <a href="${event.media_url}" target="_blank" style="color:var(--color-acento-azul);">
                        <i class="bi bi-download"></i> Descargar Presentación
                    </a>
                </p>
            </div>
        `;
    }

    overlay.innerHTML = `
        <div style="background:#1a1a1a; padding:0; border-radius:16px; width:95%; max-width:800px; max-height:90vh; overflow-y:auto; box-shadow:0 30px 60px rgba(0,0,0,0.8); border:1px solid #333;">
            <div style="position:relative;">
                ${event.image_url ? `<img src="${event.image_url}" style="width:100%; height:300px; object-fit:cover; border-radius:16px 16px 0 0;">` : ''}
                <button onclick="this.closest('.modal-overlay').remove()" style="position:absolute; top:15px; right:15px; background:rgba(0,0,0,0.7); border:none; color:white; width:40px; height:40px; border-radius:50%; font-size:1.5rem; cursor:pointer; display:flex; align-items:center; justify-content:center;">&times;</button>
                ${event.is_featured ? '<div style="position:absolute; top:15px; left:15px; background:#e67e22; color:white; padding:8px 15px; border-radius:20px; font-size:0.85rem; font-weight:bold;"><i class="bi bi-star-fill"></i> Destacado</div>' : ''}
            </div>
            
            <div style="padding:30px;">
                <div style="display:inline-block; background:rgba(52, 152, 219, 0.2); color:var(--color-acento-azul); border:1px solid rgba(52, 152, 219, 0.3); padding:5px 15px; border-radius:20px; font-size:0.85rem; margin-bottom:15px; font-weight:600; text-transform:uppercase;">
                    ${formatEventType(event.event_type)}
                </div>
                
                <h2 style="color:white; margin:0 0 20px 0;">${event.title}</h2>
                
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:20px;">
                    ${event.event_date ? `
                        <div style="display:flex; align-items:center; gap:10px; color:#aaa;">
                            <i class="bi bi-calendar3" style="font-size:1.2rem; color:var(--color-acento-azul);"></i>
                            <div>
                                <div style="font-size:0.75rem; color:#666;">Fecha</div>
                                <div style="color:white;">${formatDate(event.event_date)}</div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${event.event_time ? `
                        <div style="display:flex; align-items:center; gap:10px; color:#aaa;">
                            <i class="bi bi-clock" style="font-size:1.2rem; color:var(--color-acento-azul);"></i>
                            <div>
                                <div style="font-size:0.75rem; color:#666;">Hora</div>
                                <div style="color:white;">${ApiService.formatTime(event.event_time)}</div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${event.location ? `
                        <div style="display:flex; align-items:center; gap:10px; color:#aaa;">
                            <i class="bi bi-geo-alt" style="font-size:1.2rem; color:var(--color-acento-azul);"></i>
                            <div>
                                <div style="font-size:0.75rem; color:#666;">Ubicación</div>
                                <div style="color:white;">${event.location}</div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div style="display:flex; align-items:center; gap:10px; color:#aaa;">
                        <i class="bi bi-ticket-perforated" style="font-size:1.2rem; color:var(--color-acento-azul);"></i>
                        <div>
                            <div style="font-size:0.75rem; color:#666;">Entrada</div>
                            <div style="color:white;">${event.cost > 0 ? '$' + formatCurrency(event.cost) + ' COP' : 'Libre'}</div>
                        </div>
                    </div>
                </div>
                
                ${event.description ? `
                    <div style="margin-top:25px; padding-top:20px; border-top:1px solid #333;">
                        <h4 style="color:var(--color-acento-azul); margin-bottom:10px;">Descripción</h4>
                        <p style="color:#ccc; line-height:1.6;">${event.description}</p>
                    </div>
                ` : ''}

                <div style="margin-top: 30px; text-align: center;">
                    <button onclick="handleTicketRequest(${event.id_event}, '${event.title.replace(/'/g, "\\'")}')" 
                        style="background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); color: white; border: none; padding: 14px 35px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 10px 25px rgba(230, 126, 34, 0.3); transition: transform 0.2s;"
                        onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <i class="bi bi-ticket-perforated-fill"></i> Solicitar Entradas / Info
                    </button>
                    <p style="color:#666; font-size:0.8rem; margin-top:10px;">*Serás redirigido a contacto para verificar cupos.</p>
                </div>
                
                ${mediaHtml}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.style.opacity = '1');

    // Close on background click
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
};

// Custom Ticket Overlay Helper
function createTicketOverlay(contentHtml, onClose = null) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay ticket-modal';
    // Inline styles for glassmorphism
    overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:20000; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(8px); opacity:0; transition:opacity 0.3s;";

    overlay.innerHTML = `
        <div style="background:linear-gradient(145deg, #1a2533, #151b26); border:1px solid rgba(255,255,255,0.1); width:90%; max-width:450px; border-radius:24px; box-shadow:0 25px 50px rgba(0,0,0,0.5); overflow:hidden; transform:scale(0.95); transition:transform 0.3s; position:relative;">
            <button class="close-modal-btn" style="position:absolute; top:15px; right:15px; background:transparent; border:none; color:#aaa; font-size:1.5rem; cursor:pointer; z-index:2;">&times;</button>
            <div style="padding:40px 30px;">
                ${contentHtml}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Animation
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.querySelector('div').style.transform = 'scale(1)';
    });

    // Close Logic
    const close = () => {
        overlay.style.opacity = '0';
        overlay.querySelector('div').style.transform = 'scale(0.95)';
        setTimeout(() => {
            overlay.remove();
            if (onClose) onClose();
        }, 300);
    };

    overlay.querySelector('.close-modal-btn').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };

    return { overlay, close };
}

window.handleTicketRequest = async function (id_event, title) {
    const ApiService = window.ApiService;

    if (ApiService.isAuthenticated()) {
        const user = ApiService.getSession();
        const content = `
            <div style="text-align:center;">
                <div style="width:70px; height:70px; background:rgba(46, 204, 113, 0.1); color:#2ecc71; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:2.5rem;">
                    <i class="bi bi-person-check"></i>
                </div>
                <h3 style="color:white; margin:0 0 10px;">¡Hola, ${user.full_name.split(' ')[0]}!</h3>
                <p style="color:#ccc; margin-bottom:20px; line-height:1.6; font-size:0.95rem;">
                    ¿Deseas solicitar entradas para <strong>"${title}"</strong>?<br>
                    <span style="font-size:0.9rem; color:#888;">Usaremos tus datos registrados para agilizar el proceso.</span>
                </p>
                <button id="btn-confirm-express" style="width:100%; padding:14px; background:linear-gradient(135deg, #2ecc71, #27ae60); color:white; border:none; border-radius:12px; font-weight:bold; cursor:pointer; font-size:1rem; box-shadow:0 5px 15px rgba(46,204,113,0.3); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    Confirmar Reserva Express
                </button>
                <button class="close-modal-link" style="background:none; border:none; color:#666; margin-top:15px; cursor:pointer; text-decoration:underline;">Cancelar</button>
            </div>
        `;

        const { overlay, close } = createTicketOverlay(content);

        overlay.querySelector('#btn-confirm-express').onclick = async () => {
            const btn = overlay.querySelector('#btn-confirm-express');
            btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Procesando...';
            btn.disabled = true;

            const res = await ApiService.requestTicket({
                id_event,
                id_user: user.id_usuario,
                guest_name: user.full_name,
                guest_email: user.email
            });

            close();

            // Mensaje de éxito/error usando el mismo sistema de overlay
            createTicketOverlay(`
                <div style="text-align:center;">
                    <i class="bi ${res.success ? 'bi-check-circle-fill' : 'bi-exclamation-triangle'}" style="font-size:3.5rem; color:${res.success ? '#2ecc71' : '#e74c3c'}; margin-bottom:20px; display:block;"></i>
                    <h3 style="color:white; margin-bottom:10px;">${res.success ? '¡Reserva Exitosa!' : 'Atención'}</h3>
                    <p style="color:#ccc; line-height:1.5;">${res.message}</p>
                    <button id="btn-close-final" style="margin-top:25px; padding:12px 40px; background:white; color:#111; border:none; border-radius:30px; font-weight:bold; cursor:pointer;">Entendido</button>
                </div>
            `);

            document.body.addEventListener('click', function closeFin(e) {
                if (e.target.id === 'btn-close-final') {
                    const finalModal = document.querySelector('.ticket-modal');
                    if (finalModal) finalModal.remove();
                    document.body.removeEventListener('click', closeFin);
                }
            });
        };

        overlay.querySelector('.close-modal-link').onclick = close;

    } else {
        // Guest Flow (Redirection)
        const content = `
            <div style="text-align:center;">
                <div style="width:70px; height:70px; background:rgba(52, 152, 219, 0.1); color:var(--color-acento-azul); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:2.5rem;">
                    <i class="bi bi-info-circle"></i>
                </div>
                <h3 style="color:white; margin:0 0 15px;">Información de Reserva</h3>
                <p style="color:#ccc; margin-bottom:20px; line-height:1.6; font-size: 0.95rem;">
                    Para adquirir entradas o inscribirte a <strong>"${title}"</strong>, necesitamos coordinar contigo directamente debido a la disponibilidad de cupos.
                </p>
                <p style="color:#888; font-size:0.9rem; margin-bottom:25px;">
                    A continuación te redirigiremos a nuestro formulario de contacto con tu solicitud ya preparada.
                </p>
                <button id="btn-redirect-contact" style="width:100%; padding:14px; background:linear-gradient(135deg, #3498db, #2980b9); color:white; border:none; border-radius:12px; font-weight:bold; cursor:pointer; font-size:1rem; box-shadow:0 5px 15px rgba(52,152,219,0.3); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    Continuar a Contacto <i class="bi bi-arrow-right"></i>
                </button>
                <button class="close-modal-link" style="background:none; border:none; color:#666; margin-top:15px; cursor:pointer; text-decoration:underline;">Cancelar</button>
            </div>
        `;

        const { overlay, close } = createTicketOverlay(content);

        overlay.querySelector('#btn-redirect-contact').onclick = () => {
            close();
            window.location.href = `contactanos.html?reserva=${encodeURIComponent(title)}`;
        };

        overlay.querySelector('.close-modal-link').onclick = close;
    }
};

// Helper functions
function formatEventType(type) {
    const types = {
        'concierto': 'Concierto',
        'recital': 'Recital',
        'taller': 'Taller',
        'masterclass': 'Masterclass',
        'presentacion': 'Presentación',
        'otro': 'Evento'
    };
    return types[type] || 'Evento';
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO').format(amount);
}

function extractYouTubeID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadEventsCarousel);
