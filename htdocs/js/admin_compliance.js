/**
 * admin_compliance.js
 * Gestión de Cumplimientos y Recordatorios
 */

window.AdminCompliance = {
    init() {
        // Solo para admin
        const session = ApiService.getSession();
        if (!session || session.id_rol != 1) return;

        this.renderAdminButton();
        this.injectModal();
        this.loadComplianceItems();
    },

    renderAdminButton() {
        const grid = document.querySelector('.admin-grid');
        if (!grid) return;

        // Verificar si ya existe
        if (document.getElementById('btn-admin-compliance')) return;

        const card = document.createElement('div');
        card.className = 'admin-card';
        card.id = 'btn-admin-compliance';
        card.onclick = () => this.openModal();
        card.innerHTML = `
            <div class="icon-container" style="background: linear-gradient(135deg, #FF512F 0%, #DD2476 100%);">
                <i class="fas fa-clipboard-check"></i>
            </div>
            <h3>Cumplimientos</h3>
            <p>Gestionar documentos y videos requeridos</p>
        `;

        // Insertar después de la tarjeta de contenido web (o al final)
        grid.appendChild(card);
    },

    injectModal() {
        if (document.getElementById('compliance-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'compliance-modal';
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-content glass-effect" style="max-width: 900px; width: 95%; height: 85vh; display:flex; flex-direction:column; padding:0;">
                <div class="modal-header" style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-size:1.5rem;"><i class="fas fa-clipboard-check" style="color:#DD2476; margin-right:10px;"></i> Gestión de Cumplimientos</h2>
                    <button class="close-modal-btn" onclick="AdminCompliance.closeModal()"><i class="fas fa-times"></i></button>
                </div>
                
                <div class="modal-body" style="flex:1; overflow-y:auto; padding: 20px;">
                    <button class="btn-primary" onclick="AdminCompliance.showCreateForm()" style="margin-bottom: 20px;">
                        <i class="fas fa-plus"></i> Nuevo Cumplimiento
                    </button>

                    <div id="compliance-list" class="compliance-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                        <!-- Items rendered here -->
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    openModal() {
        const modal = document.getElementById('compliance-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.loadComplianceItems();
        }
    },

    closeModal() {
        document.getElementById('compliance-modal').style.display = 'none';
    },

    async loadComplianceItems() {
        const listContainer = document.getElementById('compliance-list');
        listContainer.innerHTML = '<div class="loading-spinner"></div>';

        const result = await ApiService.adminGetComplianceItems();
        if (result.success && result.data) {
            this.renderList(result.data);
        } else {
            listContainer.innerHTML = '<p style="color:rgba(255,255,255,0.5);">Error cargando datos.</p>';
        }
    },

    renderList(items) {
        const container = document.getElementById('compliance-list');
        if (items.length === 0) {
            container.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:rgba(255,255,255,0.5); padding: 40px;">No hay cumplimientos creados aún.</p>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="compliance-item-card" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; position:relative;">
                <div class="badge ${item.is_active == 1 ? 'active' : 'inactive'}" style="position:absolute; top:10px; right:10px; font-size:0.7rem; padding: 2px 8px; border-radius:10px; background:${item.is_active == 1 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 82, 82, 0.2)'}; color:${item.is_active == 1 ? '#4CAF50' : '#FF5252'}; border:1px solid ${item.is_active == 1 ? '#4CAF50' : '#FF5252'};">
                    ${item.is_active == 1 ? 'Activo' : 'Inactivo'}
                </div>
                <h4 style="margin: 0 0 5px 0; padding-right: 60px;">${item.title}</h4>
                <p style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${item.description || 'Sin descripción'}
                </p>
                <div style="font-size: 0.8rem; margin-bottom: 15px;">
                    <span style="background:rgba(255,255,255,0.1); padding: 2px 6px; border-radius:4px;"><i class="fas fa-users"></i> ${item.target_role.toUpperCase()}</span>
                    <span style="background:rgba(255,255,255,0.1); padding: 2px 6px; border-radius:4px; margin-left:5px;"><i class="fas fa-${this.getIconForType(item.media_type)}"></i> ${item.media_type}</span>
                </div>
                <div class="actions" style="display:flex; gap:10px;">
                    <button class="btn-sm btn-outline" onclick="AdminCompliance.editItem(${item.id})">Editar</button>
                    <button class="btn-sm btn-danger" onclick="AdminCompliance.deleteItem(${item.id})">Borrar</button>
                </div>
            </div>
        `).join('');
    },

    getIconForType(type) {
        const icons = { 'document': 'file-alt', 'video': 'video', 'image': 'image', 'link': 'link' };
        return icons[type] || 'file';
    },

    showCreateForm() {
        // Simple SweetAlert or Custom Overlay for Form
        // Using SweetAlert approach for speed if available, else custom simple logic
        // Let's assume we build a form html and throw it into a Swal

        const formHtml = `
            <div style="text-align:left;">
                <label>Título</label>
                <input type="text" id="swal-comp-title" class="swal2-input" placeholder="Ej: Política de Datos">
                
                <label>Descripción</label>
                <textarea id="swal-comp-desc" class="swal2-textarea" placeholder="Detalles..."></textarea>
                
                <label>Tipo</label>
                <select id="swal-comp-type" class="swal2-select" style="width:100%; margin:10px 0;">
                    <option value="document">Documento</option>
                    <option value="video">Video</option>
                    <option value="image">Imagen</option>
                    <option value="link">Enlace</option>
                </select>

                <label>URL del Recurso</label>
                <input type="text" id="swal-comp-url" class="swal2-input" placeholder="https://...">

                <label>Rol Objetivo</label>
                <select id="swal-comp-role" class="swal2-select" style="width:100%; margin:10px 0;">
                    <option value="all">Todos</option>
                    <option value="teacher">Profesores</option>
                    <option value="student">Estudiantes</option>
                </select>

                <label>Fecha Límite (Opcional)</label>
                <input type="date" id="swal-comp-date" class="swal2-input">
            </div>
        `;

        Swal.fire({
            title: 'Nuevo Cumplimiento',
            html: formHtml,
            showCancelButton: true,
            confirmButtonText: 'Crear',
            preConfirm: () => {
                return {
                    title: document.getElementById('swal-comp-title').value,
                    description: document.getElementById('swal-comp-desc').value,
                    media_type: document.getElementById('swal-comp-type').value,
                    media_url: document.getElementById('swal-comp-url').value,
                    target_role: document.getElementById('swal-comp-role').value,
                    due_date: document.getElementById('swal-comp-date').value
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const resp = await ApiService.adminComplianceAction('create', result.value);
                if (resp.success) {
                    Swal.fire('Creado', 'El cumplimiento ha sido creado', 'success');
                    this.loadComplianceItems();
                } else {
                    Swal.fire('Error', resp.message, 'error');
                }
            }
        });
    },

    async deleteItem(id) {
        const confirm = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, borrar'
        });

        if (confirm.isConfirmed) {
            await ApiService.adminComplianceAction('delete', { id });
            this.loadComplianceItems();
            Swal.fire('Borrado', 'El elemento ha sido eliminado', 'success');
        }
    },

    async editItem(id) {
        // Primero obtener los datos del ítem actual
        const result = await ApiService.adminGetComplianceItems();
        if (!result.success || !result.data) {
            Swal.fire('Error', 'No se pudieron cargar los datos del cumplimiento', 'error');
            return;
        }

        // Buscar el ítem específico
        const item = result.data.find(i => i.id == id);
        if (!item) {
            Swal.fire('Error', 'Cumplimiento no encontrado', 'error');
            return;
        }

        // Construir formulario pre-poblado
        const formHtml = `
            <div style="text-align:left;">
                <label>Título</label>
                <input type="text" id="swal-comp-title" class="swal2-input" value="${item.title}" placeholder="Ej: Política de Datos">
                
                <label>Descripción</label>
                <textarea id="swal-comp-desc" class="swal2-textarea" placeholder="Detalles...">${item.description || ''}</textarea>
                
                <label>Tipo</label>
                <select id="swal-comp-type" class="swal2-select" style="width:100%; margin:10px 0;">
                    <option value="document" ${item.media_type === 'document' ? 'selected' : ''}>Documento</option>
                    <option value="video" ${item.media_type === 'video' ? 'selected' : ''}>Video</option>
                    <option value="image" ${item.media_type === 'image' ? 'selected' : ''}>Imagen</option>
                    <option value="link" ${item.media_type === 'link' ? 'selected' : ''}>Enlace</option>
                </select>

                <label>URL del Recurso</label>
                <input type="text" id="swal-comp-url" class="swal2-input" value="${item.media_url || ''}" placeholder="https://...">

                <label>Rol Objetivo</label>
                <select id="swal-comp-role" class="swal2-select" style="width:100%; margin:10px 0;">
                    <option value="all" ${item.target_role === 'all' ? 'selected' : ''}>Todos</option>
                    <option value="teacher" ${item.target_role === 'teacher' ? 'selected' : ''}>Profesores</option>
                    <option value="student" ${item.target_role === 'student' ? 'selected' : ''}>Estudiantes</option>
                </select>

                <label>Estado</label>
                <select id="swal-comp-active" class="swal2-select" style="width:100%; margin:10px 0;">
                    <option value="1" ${item.is_active == 1 ? 'selected' : ''}>Activo</option>
                    <option value="0" ${item.is_active == 0 ? 'selected' : ''}>Inactivo</option>
                </select>

                <label>Fecha Límite (Opcional)</label>
                <input type="date" id="swal-comp-date" class="swal2-input" value="${item.due_date || ''}">
            </div>
        `;

        Swal.fire({
            title: 'Editar Cumplimiento',
            html: formHtml,
            showCancelButton: true,
            confirmButtonText: 'Guardar Cambios',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const title = document.getElementById('swal-comp-title').value.trim();
                if (!title) {
                    Swal.showValidationMessage('El título es requerido');
                    return false;
                }
                return {
                    id: id,
                    title: title,
                    description: document.getElementById('swal-comp-desc').value,
                    media_type: document.getElementById('swal-comp-type').value,
                    media_url: document.getElementById('swal-comp-url').value,
                    target_role: document.getElementById('swal-comp-role').value,
                    is_active: parseInt(document.getElementById('swal-comp-active').value),
                    due_date: document.getElementById('swal-comp-date').value
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const resp = await ApiService.adminComplianceAction('update', result.value);
                if (resp.success) {
                    Swal.fire('Actualizado', 'El cumplimiento ha sido actualizado correctamente', 'success');
                    this.loadComplianceItems();
                } else {
                    Swal.fire('Error', resp.message || 'No se pudo actualizar', 'error');
                }
            }
        });
    }
};

// Auto-init via event listener or direct call if script loaded late
document.addEventListener('DOMContentLoaded', () => {
    // Wait for session check
    setTimeout(() => AdminCompliance.init(), 1000);
});
