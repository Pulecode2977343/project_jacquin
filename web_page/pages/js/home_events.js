import EventService from './services/EventService.js';

document.addEventListener('DOMContentLoaded', async () => {
    const eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid) return;

    const eventService = new EventService();
    
    // Show loader or skeleton if needed
    eventsGrid.innerHTML = '<div class="loader" style="text-align:center; color:white; width:100%;">Cargando eventos...</div>';

    const response = await eventService.getAllEvents();

    if (response.success && response.data && response.data.length > 0) {
        eventsGrid.innerHTML = ''; // Clear loader
        
        response.data.forEach(event => {
            const card = createEventCard(event);
            eventsGrid.appendChild(card);
        });

        // Re-initialize Tilt if using vanilla-tilt.js and it's not observing new elements automatically
        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(document.querySelectorAll(".event-card"), {
                max: 25,
                speed: 400
            });
        }
        
    } else {
        eventsGrid.innerHTML = `
            <div class="no-events">
                <i class="bi bi-calendar-x"></i>
                <h3>No hay eventos programados</h3>
                <p>Vuelve pronto para conocer nuestra agenda.</p>
            </div>
        `;
    }
});

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.setAttribute('data-tilt', '');

    const date = new Date(event.event_date);
    const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    // Multimedia Logic
    let mediaContent = '';
    if (event.is_live == 1) {
        mediaContent = `
            <div class="live-indicator">
                <span class="pulse-dot"></span> EN VIVO
            </div>
            ${event.stream_url ? `<a href="${event.stream_url}" target="_blank" class="live-btn">Ver Transmisión <i class="bi bi-play-circle"></i></a>` : ''}
        `;
    } else if (event.video_url) {
        // Simple YouTube Embed Parsing
        let videoId = '';
        if (event.video_url.includes('youtube.com') || event.video_url.includes('youtu.be')) {
            const url = new URL(event.video_url);
            if (url.hostname === 'youtu.be') {
                videoId = url.pathname.slice(1);
            } else {
                videoId = url.searchParams.get('v');
            }
        }
        
        if (videoId) {
            mediaContent = `
                <div class="video-container">
                    <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            `;
        }
    }

    card.innerHTML = `
        <span class="event-date">
            <i class="bi bi-calendar-event"></i> ${dateStr}
        </span>
        ${event.is_live == 1 ? '<span class="badge-live">🔴 EN VIVO</span>' : ''}
        
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        
        ${mediaContent}

        <div class="event-details">
            <div class="event-detail-item">
                <i class="bi bi-clock"></i>
                <span>${timeStr}</span>
            </div>
            <div class="event-detail-item">
                <i class="bi bi-geo-alt"></i>
                <span>${event.location}</span>
            </div>
            <div class="event-detail-item">
                <i class="bi bi-ticket-perforated"></i>
                <span>Entrada Libre</span>
            </div>
        </div>
    `;

    return card;
}
