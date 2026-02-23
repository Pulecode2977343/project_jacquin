// ==========================================
// EVENTS MANAGER
// ==========================================
window.openEventsManager = async function () {
    const modalId = "events-manager-modal";
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement("div");
        modal.id = modalId;
        modal.className = "modal-overlay";
        Object.assign(modal.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.9)', zIndex: '10000',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            opacity: '0', transition: 'opacity 0.3s'
        });
        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.style.opacity = '1');

        // Click outside to close (Overlay context)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    modal.style.display = "flex";

    // Load events
    const res = await ApiService.getEvents();
    const events = res.success ? res.data : [];

    const eventsListHtml = events.map(e => `
        <div style="background:rgba(142, 68, 173, 0.2); padding:15px; margin-bottom:10px; border-radius:8px; border-left:4px solid #8e44ad;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div style="flex:1;">
                    <div style="color:white; font-weight:bold; margin-bottom:5px;">${e.title}</div>
                    <div style="color:#aaa; font-size:0.85rem;">${e.event_date || 'Sin fecha'} ${e.event_time ? '• ' + ApiService.formatTime(e.event_time) : ''}</div>
                    <div style="color:#bbb; font-size:0.8rem; margin-top:5px;">${e.event_type} ${e.location ? '• ' + e.location : ''}</div>
                    ${e.is_featured ? '<span style="background:#e67e22; color:white; padding:2px 8px; border-radius:4px; font-size:0.7rem; margin-top:5px; display:inline-block;">DESTACADO</span>' : ''}
                </div>
                ${e.image_url ? `<img src="${e.image_url}" style="width:80px; height:60px; object-fit:cover; border-radius:4px; margin-left:15px;">` : ''}
                <div style="display:flex; gap:8px; margin-left:10px;">
                    <button onclick='editEvent(${JSON.stringify(e).replace(/'/g, "&apos;")})' style="background:#3498db; border:none; color:white; padding:8px 12px; border-radius:4px; cursor:pointer;">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="deleteEventConfirm(${e.id_event})" style="background:#e74c3c; border:none; color:white; padding:8px 12px; border-radius:4px; cursor:pointer;">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('') || '<div style="color:#666; text-align:center; padding:20px;">No hay eventos creados.</div>';

    modal.innerHTML = `
        <div style="background:#1a1a1a; padding:0; border-radius:16px; width:95%; max-width:700px; max-height:90vh; overflow:hidden; box-shadow:0 30px 60px rgba(0,0,0,0.8); border:1px solid #333;">
            <div style="padding:20px 25px; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center; background:#222;">
                <h3 style="color:white; margin:0; font-size:1.2rem; display:flex; align-items:center; gap:10px;">
                    <i class="bi bi-calendar-event" style="color:#8e44ad"></i> Gestión de Eventos
                </h3>
                <button onclick="document.getElementById('${modalId}').style.display='none'" style="background:none; border:none; color:#777; font-size:1.5rem; cursor:pointer;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#777'">&times;</button>
            </div>

            <div style="padding:25px; background:#111; max-height:70vh; overflow-y:auto;">
                <button onclick="showEventForm()" style="width:100%; padding:12px; background:#8e44ad; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; margin-bottom:20px; display:flex; align-items:center; justify-content:center; gap:8px;">
                    <i class="bi bi-plus-circle"></i> Crear Nuevo Evento
                </button>

                <h4 style="color:#8e44ad; margin-bottom:15px;">Eventos Existentes</h4>
                <div id="events-list">${eventsListHtml}</div>
            </div>
        </div>
    `;

    // Delete confirmation
    window.deleteEventConfirm = async function (eventId) {
        Swal.fire({
            title: '¿Eliminar este evento?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1a1a1a',
            color: '#fff'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await ApiService.deleteEvent(eventId);
                if (res.success) {
                    showToast("Evento eliminado exitosamente.", "success");
                    openEventsManager(); // Reload
                } else {
                    showToast("Error: " + res.message, "error");
                }
            }
        });
    };

    // Show create form
    window.showEventForm = function () {
        const formHtml = `
            <div style="background:#1a1a1a; padding:25px; border-radius:12px; width:95%; max-width:600px; max-height:85vh; overflow-y:auto;">
                <h3 style="color:white; margin-top:0;">Crear Evento</h3>
                
                <form id="event-form" style="display:grid; gap:15px;">
                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Título *</label>
                        <input type="text" name="title" required style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                    </div>

                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Descripción</label>
                        <textarea name="description" rows="3" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;"></textarea>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div>
                            <label style="color:#8e44ad; display:block; margin-bottom:5px;">Fecha</label>
                            <input type="date" name="event_date" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                        </div>
                        <div>
                            <label style="color:#8e44ad; display:block; margin-bottom:5px;">Hora</label>
                            <input type="time" name="event_time" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div>
                            <label style="color:#8e44ad; display:block; margin-bottom:5px;">Tipo</label>
                            <select name="event_type" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                                <option value="otro">Otro</option>
                                <option value="concierto">Concierto</option>
                                <option value="recital">Recital</option>
                                <option value="taller">Taller</option>
                                <option value="masterclass">Masterclass</option>
                                <option value="presentacion">Presentación</option>
                            </select>
                        </div>
                        <div>
                            <label style="color:#8e44ad; display:block; margin-bottom:5px;">Costo (COP)</label>
                            <input type="number" name="cost" value="0" min="0" step="1000" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                        </div>
                    </div>

                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Ubicación</label>
                        <input type="text" name="location" placeholder="Ej: Auditorio Principal" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                    </div>

                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Imagen Principal</label>
                        <input type="file" name="image" accept="image/*" id="event-image-input" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                        <div id="image-preview" style="margin-top:10px;"></div>
                    </div>

                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Tipo de Media Adicional</label>
                        <select name="media_type" id="media-type-select" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                            <option value="ninguno">Ninguno</option>
                            <option value="video_youtube">Video de YouTube</option>
                            <option value="video_nativo">Video (MP4)</option>
                            <option value="pdf">PDF</option>
                            <option value="ppt">Presentación (PPT/PPTX)</option>
                        </select>
                    </div>

                    <div id="media-input-container"></div>

                    <div>
                        <label style="display:flex; align-items:center; gap:8px; color:white; cursor:pointer;">
                            <input type="checkbox" name="is_featured" style="width:18px; height:18px;">
                            <span>Destacar en carrusel</span>
                        </label>
                    </div>

                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove();" style="flex:1; padding:12px; background:#444; color:white; border:none; border-radius:8px; cursor:pointer;">Cancelar</button>
                        <button type="submit" style="flex:1; padding:12px; background:#8e44ad; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Crear Evento</button>
                    </div>
                </form>
            </div>
        `;

        const formModal = document.createElement("div");
        formModal.className = "modal-overlay";
        Object.assign(formModal.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.95)', zIndex: '10001',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        });
        formModal.innerHTML = formHtml;
        document.body.appendChild(formModal);

        // Image preview
        document.getElementById('event-image-input').onchange = function (e) {
            if (e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function (evt) {
                    document.getElementById('image-preview').innerHTML = `<img src="${evt.target.result}" style="max-width:200px; border-radius:8px;">`;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        };

        // Media type conditional input
        document.getElementById('media-type-select').onchange = function (e) {
            const container = document.getElementById('media-input-container');
            const type = e.target.value;

            if (type === 'video_youtube') {
                container.innerHTML = `
                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">URL de YouTube</label>
                        <input type="url" name="media_url" placeholder="https://youtube.com/watch?v=..." style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                    </div>
                `;
            } else if (type === 'video_nativo') {
                container.innerHTML = `
                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Archivo de Video (MP4, máx 50MB)</label>
                        <input type="file" name="media_file" accept="video/mp4,video/webm" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                    </div>
                `;
            } else if (type === 'pdf') {
                container.innerHTML = `
                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Archivo PDF (máx 20MB)</label>
                        <input type="file" name="media_file" accept="application/pdf" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                    </div>
                `;
            } else if (type === 'ppt') {
                container.innerHTML = `
                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Presentación PPT/PPTX (máx 20MB)</label>
                        <input type="file" name="media_file" accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                    </div>
                `;
            } else {
                container.innerHTML = '';
            }
        };

        // Form submission
        document.getElementById('event-form').onsubmit = async function (e) {
            e.preventDefault();

            const formData = new FormData(e.target);
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = "Creando...";

            try {
                const res = await ApiService.createEvent(formData);

                if (res.success) {
                    formModal.remove();
                    showToast("¡Evento creado exitosamente!", "success");
                    openEventsManager();
                } else {
                    showToast("Error: " + res.message, "error");
                    btn.disabled = false;
                    btn.textContent = "Crear Evento";
                }
            } catch (err) {
                console.error(err);
                showToast("Error inesperado al crear evento.", "error");
                btn.disabled = false;
                btn.textContent = "Crear Evento";
            }
        };
    };

    // Edit event function
    window.editEvent = function (eventData) {
        const formHtml = `
            <div style="background:#1a1a1a; padding:25px; border-radius:12px; width:95%; max-width:600px; max-height:85vh; overflow-y:auto;">
                <h3 style="color:white; margin-top:0;">Editar Evento</h3>
                
                <form id="event-edit-form" style="display:grid; gap:15px;">
                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Título *</label>
                        <input type="text" name="title" value="${eventData.title || ''}" required style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                    </div>

                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Descripción</label>
                        <textarea name="description" rows="3" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">${eventData.description || ''}</textarea>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div>
                            <label style="color:#8e44ad; display:block; margin-bottom:5px;">Fecha</label>
                            <input type="date" name="event_date" value="${eventData.event_date || ''}" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                        </div>
                        <div>
                            <label style="color:#8e44ad; display:block; margin-bottom:5px;">Hora</label>
                            <input type="time" name="event_time" value="${eventData.event_time || ''}" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div>
                            <label style="color:#8e44ad; display:block; margin-bottom:5px;">Tipo</label>
                            <select name="event_type" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                                <option value="otro" ${eventData.event_type === 'otro' ? 'selected' : ''}>Otro</option>
                                <option value="concierto" ${eventData.event_type === 'concierto' ? 'selected' : ''}>Concierto</option>
                                <option value="recital" ${eventData.event_type === 'recital' ? 'selected' : ''}>Recital</option>
                                <option value="taller" ${eventData.event_type === 'taller' ? 'selected' : ''}>Taller</option>
                                <option value="masterclass" ${eventData.event_type === 'masterclass' ? 'selected' : ''}>Masterclass</option>
                                <option value="presentacion" ${eventData.event_type === 'presentacion' ? 'selected' : ''}>Presentación</option>
                            </select>
                        </div>
                        <div>
                            <label style="color:#8e44ad; display:block; margin-bottom:5px;">Costo (COP)</label>
                            <input type="number" name="cost" value="${eventData.cost || 0}" min="0" step="1000" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                        </div>
                    </div>

                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Ubicación</label>
                        <input type="text" name="location" value="${eventData.location || ''}" placeholder="Ej: Auditorio Principal" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                    </div>

                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Imagen Principal (dejar vacío para mantener actual)</label>
                        ${eventData.image_url ? `<div style="margin-bottom:10px;"><img src="${eventData.image_url}" style="max-width:200px; border-radius:8px;"></div>` : ''}
                        <input type="file" name="image" accept="image/*" id="event-edit-image-input" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                        <div id="edit-image-preview" style="margin-top:10px;"></div>
                    </div>

                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Tipo de Media Adicional</label>
                        <select name="media_type" id="edit-media-type-select" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                            <option value="ninguno" ${eventData.media_type === 'ninguno' ? 'selected' : ''}>Ninguno</option>
                            <option value="video_youtube" ${eventData.media_type === 'video_youtube' ? 'selected' : ''}>Video de YouTube</option>
                            <option value="video_nativo" ${eventData.media_type === 'video_nativo' ? 'selected' : ''}>Video (MP4)</option>
                            <option value="pdf" ${eventData.media_type === 'pdf' ? 'selected' : ''}>PDF</option>
                            <option value="ppt" ${eventData.media_type === 'ppt' ? 'selected' : ''}>Presentación (PPT/PPTX)</option>
                        </select>
                    </div>

                    <div id="edit-media-input-container"></div>

                    <div>
                        <label style="display:flex; align-items:center; gap:8px; color:white; cursor:pointer;">
                            <input type="checkbox" name="is_featured" ${eventData.is_featured ? 'checked' : ''} style="width:18px; height:18px;">
                            <span>Destacar en carrusel</span>
                        </label>
                    </div>

                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button type="button" onclick="this.closest('.modal-overlay').remove();" style="flex:1; padding:12px; background:#444; color:white; border:none; border-radius:8px; cursor:pointer;">Cancelar</button>
                        <button type="submit" style="flex:1; padding:12px; background:#8e44ad; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Actualizar Evento</button>
                    </div>
                </form>
            </div>
        `;

        const formModal = document.createElement("div");
        formModal.className = "modal-overlay";
        Object.assign(formModal.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.95)', zIndex: '10001',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        });
        formModal.innerHTML = formHtml;
        document.body.appendChild(formModal);

        // Image preview
        const imgInput = document.getElementById('event-edit-image-input');
        if (imgInput) {
            imgInput.onchange = function (e) {
                if (e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function (evt) {
                        document.getElementById('edit-image-preview').innerHTML = `<img src="${evt.target.result}" style="max-width:200px; border-radius:8px;">`;
                    };
                    reader.readAsDataURL(e.target.files[0]);
                }
            };
        }

        // Media type conditional input
        const mediaSelect = document.getElementById('edit-media-type-select');
        const updateMediaInput = (type, currentUrl) => {
            const container = document.getElementById('edit-media-input-container');
            if (type === 'video_youtube') {
                container.innerHTML = `
                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">URL de YouTube</label>
                        <input type="url" name="media_url" value="${currentUrl || ''}" placeholder="https://youtube.com/watch?v=..." style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                    </div>
                `;
            } else if (type === 'video_nativo') {
                container.innerHTML = `
                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Archivo de Video (dejar vacío para mantener actual)</label>
                        ${currentUrl ? `<div style="color:#aaa; font-size:0.85rem; margin-bottom:5px;">Actual: ${currentUrl.split('/').pop()}</div>` : ''}
                        <input type="file" name="media_file" accept="video/mp4,video/webm" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                    </div>
                `;
            } else if (type === 'pdf') {
                container.innerHTML = `
                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Archivo PDF (dejar vacío para mantener actual)</label>
                        ${currentUrl ? `<div style="color:#aaa; font-size:0.85rem; margin-bottom:5px;">Actual: ${currentUrl.split('/').pop()}</div>` : ''}
                        <input type="file" name="media_file" accept="application/pdf" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                    </div>
                `;
            } else if (type === 'ppt') {
                container.innerHTML = `
                    <div>
                        <label style="color:#8e44ad; display:block; margin-bottom:5px;">Presentación PPT/PPTX (dejar vacío para mantener actual)</label>
                        ${currentUrl ? `<div style="color:#aaa; font-size:0.85rem; margin-bottom:5px;">Actual: ${currentUrl.split('/').pop()}</div>` : ''}
                        <input type="file" name="media_file" accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" style="width:100%; padding:10px; background:#222; border:1px solid #444; border-radius:6px; color:white;">
                    </div>
                `;
            } else {
                container.innerHTML = '';
            }
        };

        // Initialize media input
        updateMediaInput(eventData.media_type, eventData.media_url);

        if (mediaSelect) {
            mediaSelect.onchange = function (e) {
                updateMediaInput(e.target.value, '');
            };
        }

        // Form submission
        document.getElementById('event-edit-form').onsubmit = async function (e) {
            e.preventDefault();

            const formData = new FormData(e.target);
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = "Actualizando...";

            try {
                const res = await ApiService.updateEvent(eventData.id_event, formData);

                if (res.success) {
                    formModal.remove();
                    showToast("¡Evento actualizado exitosamente!", "success");
                    openEventsManager();
                } else {
                    showToast("Error: " + res.message, "error");
                    btn.disabled = false;
                    btn.textContent = "Actualizar Evento";
                }
            } catch (err) {
                console.error(err);
                showToast("Error inesperado al actualizar.", "error");
                btn.disabled = false;
                btn.textContent = "Actualizar Evento";
            }
        };
    };
};
