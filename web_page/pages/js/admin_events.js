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
    if (fieldMap[type]) {
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

        reader.onload = function (e) {
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

// Global store for edit access
window.currentEvents = [];

async function loadAdminEvents() {
    const list = document.getElementById('adminEventsList');
    const baseUrl = ApiService.BASE_URL;

    try {
        const response = await fetch(`${baseUrl}get_events.php`);
        const data = await response.json();

        if (data.success && data.data) {
            window.currentEvents = data.data; // Store events
            list.innerHTML = data.data.map(event => `
                <div class="admin-event-item">
                    <div>
                        <strong style="color:white; font-size:1.1rem;">${event.title}</strong>
                        <div style="color:var(--color-humo-gris); font-size:0.8rem;">
                            ${new Date(event.event_date).toLocaleDateString()} | ${event.location || 'Sin ubicación'}
                        </div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="btn-action" style="background: rgba(255, 170, 0, 0.2); color: #ffaa00;" onclick="editEvent(${event.id_event || event.id})">
                             <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteEvent(${event.id_event || event.id})">
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

// === Modal Functions ===
window.openModal = (eventData = null) => {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    const title = document.querySelector('#eventModal h3');
    const btnText = document.getElementById('btnText');

    if (eventData) {
        // Edit Mode
        title.innerText = "Editar Evento";
        btnText.innerText = "Actualizar Evento";

        // Populate fields
        document.getElementById('event_id').value = eventData.id_event || eventData.id;
        document.getElementById('event_type').value = eventData.event_type || 'comunicado';
        setEventType(eventData.event_type || 'comunicado');

        form.title.value = eventData.title;
        form.description.value = eventData.description;
        form.event_date.value = eventData.event_date ? eventData.event_date.replace(' ', 'T').slice(0, 16) : '';
        form.location.value = eventData.location;
        form.video_url.value = eventData.video_url || '';
        form.stream_url.value = eventData.stream_url || '';

        if (eventData.is_live == 1) document.getElementById('is_live').checked = true;
        else document.getElementById('is_live').checked = false;

        // Reset previews
        document.getElementById('preview-img').innerHTML = "Vista previa (Imagen actual mantenida si no se cambia)";
        document.getElementById('preview-video').innerHTML = "Vista previa";

    } else {
        // Create Mode
        title.innerText = "Crear Nuevo Evento";
        btnText.innerText = "Guardar Evento";
        form.reset();
        document.getElementById('event_id').value = '';
        setEventType('comunicado');
        document.getElementById('preview-img').innerHTML = "Vista previa";
        document.getElementById('preview-video').innerHTML = "Vista previa";
    }

    modal.style.display = 'flex';
};

window.closeModal = () => {
    document.getElementById('eventModal').style.display = 'none';
};

window.editEvent = (id) => {
    const event = window.currentEvents.find(e => (e.id_event == id || e.id == id));
    if (event) {
        openModal(event);
    } else {
        showToast("Error: No se encontró la info del evento", "error");
    }
}

window.resetForm = () => {
    // This now serves as the 'New Event' trigger
    openModal(null);
}

// === API Actions ===
async function saveEvent(formData) {
    const btn = document.querySelector('#eventForm button[type="submit"]');
    const originalText = document.getElementById('btnText').innerText;

    btn.disabled = true;
    document.getElementById('btnText').innerText = "Procesando...";

    try {
        const baseUrl = ApiService.BASE_URL;
        const eventId = document.getElementById('event_id').value;

        // Switch between Create and Update endpoints
        const endpoint = eventId ? 'admin_update_event.php' : 'admin_create_event.php';

        if (eventId) formData.append('id', eventId);

        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            closeModal(); // Close first
            const action = eventId ? 'actualizado' : 'creado';
            showToast(`Evento ${action} correctamente`, 'success');
            loadAdminEvents();
        } else {
            showToast('Error: ' + result.message, 'error');
        }

    } catch (error) {
        console.error(error);
        showToast('Error de conexión con el servidor', 'error');
    } finally {
        btn.disabled = false;
        document.getElementById('btnText').innerText = originalText;
    }
}

window.deleteEvent = async (id) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Eliminarás este evento permanentemente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff3b30',
        cancelButtonColor: '#444',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        background: '#1a1a1a',
        color: '#ffffff'
    });

    if (!result.isConfirmed) return;

    try {
        const baseUrl = ApiService.BASE_URL;
        const response = await fetch(`${baseUrl}admin_delete_event.php`, {
            method: 'POST',
            body: JSON.stringify({ id: id })
        });
        const result = await response.json();
        if (result.success) {
            showToast('Evento eliminado correctamente', 'success');
            loadAdminEvents();
        } else {
            showToast('Error al eliminar', 'error');
        }
    } catch (e) {
        showToast('Error de red', 'error');
    }
}
