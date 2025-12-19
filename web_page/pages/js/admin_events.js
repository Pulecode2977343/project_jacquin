document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Auth (Admin Only)
    if (!window.ApiService || !window.ApiService.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    const user = window.ApiService.getSession();
    if (user.id_rol != 1) { // Only Admin (Rol 1)
        console.warn("Acceso denegado: Usuario no es admin. Deteniendo script de eventos.");
        return; // Just stop, don't redirect (dashboard.js handles UI)
    }

    // 2. Load Events
    loadAdminEvents();

    // 3. Form Submit Handler
    const form = document.getElementById('eventForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveEvent(new FormData(form));
    });
});

// === UI Logic: Event Types ===
const fieldMap = {
    'comunicado': [],
    'imagen': ['field-image'],
    'video_link': ['field-video-link'],
    'video_upload': ['field-video-upload'],
    'stream': ['field-stream']
};

window.setEventType = (type) => {
    // 1. Update Buttons
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.type-btn[data-type="${type}"]`).classList.add('active');

    // 2. Update Hidden Input
    document.getElementById('event_type').value = type;

    // 3. Toggle Fields
    document.querySelectorAll('.dynamic-field').forEach(field => field.classList.remove('active'));
    
    // Show relevant fields for this type
    if(fieldMap[type]) {
        fieldMap[type].forEach(id => {
            document.getElementById(id).classList.add('active');
        });
    }
}

// Preview Logic
window.previewFile = (input, type) => {
    const container = document.getElementById(`preview-${type}`);
    container.innerHTML = 'Cargando...';
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            if (type === 'img') {
                container.innerHTML = `<img src="${e.target.result}" class="preview-media" />`;
            } else {
                container.innerHTML = `
                    <video class="preview-media" controls>
                        <source src="${e.target.result}" type="video/mp4">
                    </video>`;
            }
        }
        
        reader.readAsDataURL(input.files[0]);
    } else {
        container.innerHTML = 'Vista previa';
    }
}

async function loadAdminEvents() {
    const list = document.getElementById('adminEventsList');
    // Reuse existing Service
    const service = new EventService(); // We might need to import it or make it global
    // Note: EventService in previous step was module based. 
    // admin_events.html loads it as script, so it needs to assign to window or be imported in a module script.
    // Let's assume we change admin_events.html script tag to type="module" or make EventService global.
    // Fixed: I'll use ApiService logic directly if needed, but better to reuse.
    // Let's rely on standard fetch for now to be safe, replicating EventService logic.
    
    const baseUrl = 'http://127.0.0.1:8080/jacquin_api/public/';
    
    try {
        const response = await fetch(`${baseUrl}get_events.php`);
        const data = await response.json();

        if(data.success && data.data) {
            list.innerHTML = data.data.map(event => `
                <div class="admin-event-item">
                    <div>
                        <strong style="color:white; font-size:1.1rem;">${event.title}</strong>
                        <div style="color:var(--color-humo-gris); font-size:0.8rem;">
                            ${new Date(event.event_date).toLocaleDateString()} | ${event.location || 'Sin ubicación'}
                        </div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="btn-action btn-delete" onclick="deleteEvent(${event.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            list.innerHTML = '<div style="color:white; text-align:center;">No hay eventos.</div>';
        }

    } catch (e) {
        console.error(e);
        list.innerHTML = 'Error cargando eventos.';
    }
}

async function saveEvent(formData) {
    const btn = document.querySelector('#eventForm button[type="submit"]');
    const originalText = document.getElementById('btnText').innerText;
    
    btn.disabled = true;
    document.getElementById('btnText').innerText = "Guardando...";

    try {
        const baseUrl = 'http://127.0.0.1:8080/jacquin_api/public/';
        
        // Use create_event.php (updated to handle POST with files)
        const response = await fetch(`${baseUrl}create_event.php`, {
            method: 'POST',
            body: formData // Fetch handles Content-Type for FormData automatically
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Evento guardado correctamente');
            resetForm();
            loadAdminEvents();
        } else {
            alert('Error: ' + result.message);
        }

    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    } finally {
        btn.disabled = false;
        document.getElementById('btnText').innerText = originalText;
    }
}

window.deleteEvent = async (id) => {
    if(!confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
        const baseUrl = 'http://127.0.0.1:8080/jacquin_api/public/';
        const response = await fetch(`${baseUrl}delete_event.php`, {
            method: 'POST',
            body: JSON.stringify({ id: id })
        });
        const result = await response.json();
        if(result.success) {
            loadAdminEvents();
        } else {
            alert('Error al eliminar');
        }
    } catch(e) {
        alert('Error de red');
    }
}

window.resetForm = () => {
    document.getElementById('eventForm').reset();
    document.getElementById('preview-img').innerHTML = "Vista previa";
    document.getElementById('preview-video').innerHTML = "Vista previa";
    setEventType('comunicado');
}
