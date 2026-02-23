/**
 * Admin Positions Manager
 * Gestión de Cargos y Funciones
 */

let currentPositions = [];
let currentUser = null;
let eligibleUsers = [];

// Mapeo de nombres de cargos a iconos de Bootstrap
const positionIcons = {
    'Profesor': 'bi-mortarboard-fill',
    'Secretario': 'bi-clipboard-data-fill',
    'Logística': 'bi-box-seam-fill',
    'Servicios Generales': 'bi-tools',
    'default': 'bi-person-badge-fill'
};

function getPositionIcon(position) {
    // Si el icono ya es una clase de Bootstrap Icons
    if (position.icon && position.icon.startsWith('bi-')) {
        return `<i class="bi ${position.icon}"></i>`;
    }
    // Buscar por nombre
    const iconClass = positionIcons[position.name] || positionIcons['default'];
    return `<i class="bi ${iconClass}"></i>`;
}


// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar sesión
    currentUser = ApiService.getSession();
    if (!currentUser || currentUser.id_rol != 1) {
        window.location.href = 'dashboard.html';
        return;
    }

    await loadPositions();
    await loadEligibleUsers();
});

// Cargar cargos
async function loadPositions() {
    const contentEl = document.getElementById('positions-content');

    try {
        const result = await ApiService.getPositions(true);

        if (result.success) {
            currentPositions = result.data;
            renderPositions();
        } else {
            contentEl.innerHTML = `
                <div class="loading-container">
                    <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: var(--accent-red);"></i>
                    <p style="margin-top: 15px;">Error cargando cargos: ${result.message}</p>
                </div>
            `;
        }
    } catch (e) {
        console.error(e);
        contentEl.innerHTML = `
            <div class="loading-container">
                <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: var(--accent-red);"></i>
                <p style="margin-top: 15px;">Error de conexión</p>
            </div>
        `;
    }
}

// Cargar usuarios elegibles
async function loadEligibleUsers() {
    try {
        const result = await ApiService.getEligibleUsers();
        if (result.success) {
            eligibleUsers = result.data;
        }
    } catch (e) {
        console.error('Error loading eligible users:', e);
    }
}

// Renderizar grid de cargos
function renderPositions() {
    const contentEl = document.getElementById('positions-content');

    let html = '<div class="positions-grid">';

    // Tarjetas de cargos existentes
    currentPositions.forEach(pos => {
        const isHidden = pos.is_visible == 0;

        html += `
            <div class="position-card ${isHidden ? 'hidden-card' : ''}" onclick="openPositionDetail(${pos.id_position})" style="${isHidden ? 'opacity: 0.5;' : ''}">
                ${pos.is_predefined ? '<div class="predefined-badge"><i class="bi bi-shield-check"></i> Predefinido</div>' : ''}
                <span class="position-icon">${getPositionIcon(pos)}</span>
                <div class="position-name">${escapeHtml(pos.name)}</div>
                <div class="position-description">${escapeHtml(pos.description || 'Sin descripción')}</div>
                <div class="position-stats">
                    <span class="stat-badge">
                        <i class="bi bi-list-check"></i> ${pos.functions_count || 0} funciones
                    </span>
                    <span class="stat-badge users">
                        <i class="bi bi-people-fill"></i> ${pos.assigned_users_count || 0} asignados
                    </span>
                </div>
                ${isHidden ? '<div style="margin-top: 10px; font-size: 0.7rem; color: var(--accent-red);"><i class="bi bi-eye-slash"></i> Oculto</div>' : ''}
            </div>
        `;
    });

    // Tarjeta para crear nuevo
    html += `
        <div class="position-card create-card" onclick="openCreatePositionModal()">
            <span class="position-icon"><i class="bi bi-plus-circle"></i></span>
            <div class="position-name">Crear Nuevo Cargo</div>
        </div>
    `;

    html += '</div>';
    contentEl.innerHTML = html;
}

// Abrir modal para crear nuevo cargo
async function openCreatePositionModal() {
    const { value: formValues } = await Swal.fire({
        title: '<i class="bi bi-plus-circle" style="color: #e67e22;"></i> Nuevo Cargo',
        html: `
            <div style="text-align: left; padding: 10px 0;">
                <label style="display: block; margin-bottom: 5px; color: rgba(255,255,255,0.7); font-size: 0.85rem;">Nombre del Cargo *</label>
                <input type="text" id="swal-name" class="swal2-input" placeholder="Ej: Coordinador Académico" style="margin: 0 0 15px 0; width: 100%;">
                
                <label style="display: block; margin-bottom: 5px; color: rgba(255,255,255,0.7); font-size: 0.85rem;">Icono (emoji)</label>
                <input type="text" id="swal-icon" class="swal2-input" placeholder="👤" value="👤" style="margin: 0 0 15px 0; width: 100%;">
                
                <label style="display: block; margin-bottom: 5px; color: rgba(255,255,255,0.7); font-size: 0.85rem;">Descripción</label>
                <textarea id="swal-description" class="swal2-textarea" placeholder="Descripción breve del cargo..." style="margin: 0; width: 100%; min-height: 80px;"></textarea>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-check-lg"></i> Crear Cargo',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e67e22',
        cancelButtonColor: '#555',
        background: '#1a1a2e',
        color: '#ffffff',
        width: '450px',
        preConfirm: () => {
            const name = document.getElementById('swal-name').value.trim();
            if (!name) {
                Swal.showValidationMessage('El nombre es obligatorio');
                return false;
            }
            return {
                name: name,
                icon: document.getElementById('swal-icon').value.trim() || '👤',
                description: document.getElementById('swal-description').value.trim(),
                created_by: currentUser.id_usuario
            };
        }
    });

    if (formValues) {
        try {
            const result = await ApiService.createPosition(formValues);

            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Cargo Creado!',
                    text: 'Ahora puedes agregar funciones y asignar usuarios.',
                    confirmButtonColor: '#2ecc71',
                    background: '#1a1a2e',
                    color: '#ffffff'
                });

                await loadPositions();

                // Abrir detalle del nuevo cargo
                if (result.id) {
                    openPositionDetail(result.id);
                }
            } else {
                showError(result.message);
            }
        } catch (e) {
            showError('Error creando cargo');
        }
    }
}

// Inyectar estilos para las pestañas
const tabsStyles = document.createElement('style');
tabsStyles.innerHTML = `
    .pos-tabs { display: flex; gap: 5px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px; }
    .pos-tab { padding: 10px 20px; cursor: pointer; color: rgba(255,255,255,0.5); font-weight: 600; font-size: 0.9rem; transition: all 0.3s; border-bottom: 2px solid transparent; }
    .pos-tab:hover { color: white; background: rgba(255,255,255,0.02); }
    .pos-tab.active { color: var(--accent-blue); border-bottom: 2px solid var(--accent-blue); background: rgba(52, 152, 219, 0.05); }
    .tab-content { display: none; animation: fadeIn 0.3s ease; }
    .tab-content.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
`;
document.head.appendChild(tabsStyles);

// Función global para cambiar pestañas
window.switchPositionTab = function (tabName) {
    document.querySelectorAll('.pos-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    document.getElementById('tab-btn-' + tabName).classList.add('active');
    document.getElementById('tab-content-' + tabName).classList.add('active');
};

// Abrir detalle de un cargo con Pestañas
async function openPositionDetail(positionId) {
    const position = currentPositions.find(p => p.id_position == positionId);
    if (!position) return;

    // Cargar funciones y usuarios asignados
    const [functionsRes, usersRes] = await Promise.all([
        ApiService.getPositionFunctions(positionId),
        ApiService.getPositionUsers(positionId)
    ]);

    const functions = functionsRes.success ? functionsRes.data : [];
    const assignedUsers = usersRes.success ? usersRes.data : [];

    // Generar HTML de funciones
    const functionsHtml = functions.length > 0 ?
        functions.map((f, idx) => `
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="background: rgba(52, 152, 219, 0.1); color: var(--accent-blue); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold;">${idx + 1}</div>
                <span style="flex: 1; font-size: 0.9rem; line-height: 1.4;">${escapeHtml(f.description)}</span>
                <button onclick="event.stopPropagation(); deleteFunction(${f.id_function}, ${positionId})" 
                    style="background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.2); color: var(--accent-red); cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s;"
                    onmouseover="this.style.background='rgba(231, 76, 60, 0.2)'" onmouseout="this.style.background='rgba(231, 76, 60, 0.1)'"
                    title="Eliminar función">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `).join('') :
        '<div style="text-align: center; padding: 30px; border: 2px dashed rgba(255,255,255,0.1); border-radius: 12px; color: rgba(255,255,255,0.4);"><i class="bi bi-list-check" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>No hay funciones definidas</div>';

    // Generar HTML de usuarios asignados
    const usersHtml = assignedUsers.length > 0 ?
        assignedUsers.map(u => `
            <div style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: 10px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #3498db, #2980b9); display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 600; color: white;">
                    ${u.full_name.charAt(0).toUpperCase()}
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 0.95rem; font-weight: 500;">${escapeHtml(u.full_name)}</div>
                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.5); display: flex; gap: 5px; align-items: center;">
                        <span style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">${u.rol_name || 'Usuario'}</span>
                        <span><i class="bi bi-calendar"></i> ${new Date(u.assigned_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <button onclick="event.stopPropagation(); removeUserAssignment(${u.id}, ${positionId})"
                    style="background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); color: var(--accent-red); padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 500; transition: all 0.2s;"
                    onmouseover="this.style.background='rgba(231, 76, 60, 0.2)'" onmouseout="this.style.background='rgba(231, 76, 60, 0.1)'">
                    <i class="bi bi-person-dash"></i> Remover
                </button>
            </div>
        `).join('') :
        '<div style="text-align: center; padding: 30px; border: 2px dashed rgba(255,255,255,0.1); border-radius: 12px; color: rgba(255,255,255,0.4);"><i class="bi bi-people" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>Sin usuarios asignados</div>';

    // Selector de usuarios para asignar
    const availableUsers = eligibleUsers.filter(u => !assignedUsers.some(au => au.user_id == u.id_usuario));
    const userOptions = availableUsers.map(u => `<option value="${u.id_usuario}">${u.full_name} (${u.rol_name})</option>`).join('');

    await Swal.fire({
        title: `<div style="display:flex; align-items:center; gap:15px; justify-content:center;">${getPositionIcon(position)} <span>${escapeHtml(position.name)}</span></div>`,
        html: `
            <div style="text-align: left; max-height: 70vh; overflow-y: auto; overflow-x: hidden; padding: 0 5px;">
                <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-bottom: 25px; text-align: center; max-width: 80%; margin-left: auto; margin-right: auto;">
                    ${escapeHtml(position.description || 'Gestiona las funciones y el personal asignado a este cargo.')}
                </p>
                
                <div class="pos-tabs">
                    <div class="pos-tab active" id="tab-btn-functions" onclick="switchPositionTab('functions')">
                        <i class="bi bi-list-check"></i> Funciones (${functions.length})
                    </div>
                    <div class="pos-tab" id="tab-btn-users" onclick="switchPositionTab('users')">
                        <i class="bi bi-people-fill"></i> Usuarios Asignados (${assignedUsers.length})
                    </div>
                </div>

                <!-- Tab Funciones -->
                <div id="tab-content-functions" class="tab-content active">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h4 style="margin: 0; font-size: 1rem; color: white;">Lista de Funciones</h4>
                        <button onclick="addFunctionPrompt(${positionId})" style="background: linear-gradient(135deg, var(--accent-green), #27ae60); border: none; color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; box-shadow: 0 4px 15px rgba(46, 204, 113, 0.2);">
                            <i class="bi bi-plus-lg"></i> Agregar Función
                        </button>
                    </div>
                    <div id="functions-list">${functionsHtml}</div>
                </div>

                <!-- Tab Usuarios -->
                <div id="tab-content-users" class="tab-content">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h4 style="margin: 0; font-size: 1rem; color: white;">Personal Actual</h4>
                        <button onclick="assignUserPrompt(${positionId})" style="background: linear-gradient(135deg, var(--accent-blue), #2980b9); border: none; color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.2);">
                            <i class="bi bi-person-plus-fill"></i> Asignar Usuario
                        </button>
                    </div>
                    <div id="users-list">${usersHtml}</div>
                    
                    ${availableUsers.length === 0 ? `
                        <div style="margin-top: 20px; background: rgba(46, 204, 113, 0.05); border-radius: 12px; padding: 15px; border: 1px solid rgba(46, 204, 113, 0.15); text-align: center;">
                            <i class="bi bi-check-circle" style="color: var(--accent-green); font-size: 1.5rem; display: block; margin-bottom: 5px;"></i>
                            <span style="color: var(--accent-green); font-size: 0.9rem;">Todos los usuarios elegibles ya tienen este cargo asignado.</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `,
        showCloseButton: true,
        showConfirmButton: false,
        width: '700px',
        background: '#1a1a2e',
        color: '#ffffff',
        footer: `
            <div style="display: flex; gap: 12px; justify-content: center; width: 100%;">
                <button onclick="editPositionModal(${positionId})" class="swal-footer-btn edit">
                    <i class="bi bi-pencil-square"></i> Editar Cargo
                </button>
                <button onclick="togglePositionVisibility(${positionId}, ${position.is_visible})" class="swal-footer-btn ${position.is_visible ? 'hide' : 'show'}">
                    <i class="bi bi-${position.is_visible ? 'eye-slash' : 'eye'}"></i> ${position.is_visible ? 'Ocultar' : 'Mostrar'}
                </button>
                ${!position.is_predefined ? `
                    <button onclick="deletePositionConfirm(${positionId})" class="swal-footer-btn delete">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                ` : ''}
            </div>
        `
    });
}

// Prompt para asignar usuario
async function assignUserPrompt(positionId) {
    const position = currentPositions.find(p => p.id_position == positionId);
    if (!position) return;

    // Obtener usuarios actuales para filtrar
    const usersRes = await ApiService.getPositionUsers(positionId);
    const assignedUsers = usersRes.success ? usersRes.data : [];

    // Filtrar disponibles
    const availableUsers = eligibleUsers.filter(u => !assignedUsers.some(au => au.user_id == u.id_usuario));

    if (availableUsers.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'No hay usuarios disponibles',
            text: 'Todos los usuarios elegibles (Docentes, Admins, Colaboradores) ya tienen este cargo.',
            background: '#1a1a2e',
            color: '#fff'
        });
        return;
    }

    const { value: userId } = await Swal.fire({
        title: 'Asignar Usuario a Cargo',
        html: `
            <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-bottom: 20px;">
                Selecciona el usuario al que deseas asignar el cargo de <strong>${escapeHtml(position.name)}</strong>.
            </p>
            <select id="swal-user-select" class="swal2-select" style="display: flex; width: 80%; margin: 0 auto; background: #2a2a3e; color: white; border: 1px solid #444;">
                ${availableUsers.map(u => `<option value="${u.id_usuario}">${u.full_name} (${u.rol_name})</option>`).join('')}
            </select>
        `,
        showCancelButton: true,
        confirmButtonText: 'Asignar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3498db',
        padding: '2em',
        background: '#1a1a2e',
        color: '#ffffff',
        preConfirm: () => {
            return document.getElementById('swal-user-select').value;
        }
    });

    if (userId) {
        assignUserToPosition(positionId, userId);
    }
}

// Wrapper para asignar usuario (adaptado para recibir userId opcional)
async function assignUserToPosition(positionId, userIdInput = null) {
    let userId = userIdInput;

    // Fallback seguro por si se llama sin argumento (compatibilidad)
    if (!userId) {
        const selectEl = document.getElementById('user-to-assign');
        if (selectEl) {
            userId = selectEl.value;
        }
    }

    if (!userId) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Debes seleccionar un usuario de la lista para continuar.',
            background: '#1a1a2e',
            color: '#ffffff'
        });
        return;
    }

    try {
        const result = await ApiService.assignPosition(userId, positionId, currentUser ? currentUser.id_usuario : null);

        if (result.success) {
            await Swal.fire({
                icon: 'success',
                title: '¡Usuario Asignado!',
                text: 'El cargo ha sido asignado correctamente.',
                timer: 1500,
                showConfirmButton: false,
                background: '#1a1a2e',
                color: '#ffffff'
            });
            openPositionDetail(positionId); // Recargar modal
            loadPositions(); // Actualizar grid fondo
        } else {
            showError(result.message);
        }
    } catch (e) {
        showError('Error asignando usuario');
    }
}

// Agregar función a un cargo
async function addFunctionPrompt(positionId) {
    const { value: description } = await Swal.fire({
        title: 'Nueva Función',
        input: 'text',
        inputPlaceholder: 'Descripción de la función...',
        showCancelButton: true,
        confirmButtonText: 'Agregar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2ecc71',
        background: '#1a1a2e',
        color: '#ffffff',
        inputValidator: (value) => {
            if (!value || !value.trim()) {
                return 'La descripción es obligatoria';
            }
        }
    });

    if (description) {
        const result = await ApiService.addPositionFunction(positionId, description.trim());
        if (result.success) {
            Swal.close();
            await openPositionDetail(positionId);
        } else {
            showError(result.message);
        }
    }
}

// Eliminar función
async function deleteFunction(functionId, positionId) {
    const confirm = await Swal.fire({
        title: '¿Eliminar función?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e74c3c',
        background: '#1a1a2e',
        color: '#ffffff'
    });

    if (confirm.isConfirmed) {
        const result = await ApiService.deletePositionFunction(functionId);
        if (result.success) {
            Swal.close();
            await loadPositions();
            await openPositionDetail(positionId);
        } else {
            showError(result.message);
        }
    }
}


// Remover asignación de usuario
async function removeUserAssignment(assignmentId, positionId) {
    const confirm = await Swal.fire({
        title: '¿Remover asignación?',
        text: 'El usuario ya no tendrá este cargo asignado',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, remover',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e74c3c',
        background: '#1a1a2e',
        color: '#ffffff'
    });

    if (confirm.isConfirmed) {
        const result = await ApiService.removePositionAssignment(assignmentId);
        if (result.success) {
            await loadPositions();
            await openPositionDetail(positionId);
        } else {
            showError(result.message);
        }
    }
}

// Editar cargo
async function editPositionModal(positionId) {
    const position = currentPositions.find(p => p.id_position == positionId);
    if (!position) return;

    const { value: formValues } = await Swal.fire({
        title: '<i class="bi bi-pencil" style="color: #3498db;"></i> Editar Cargo',
        html: `
            <div style="text-align: left; padding: 10px 0;">
                <label style="display: block; margin-bottom: 5px; color: rgba(255,255,255,0.7); font-size: 0.85rem;">Nombre</label>
                <input type="text" id="swal-name" class="swal2-input" value="${escapeHtml(position.name)}" style="margin: 0 0 15px 0; width: 100%;">
                
                <label style="display: block; margin-bottom: 5px; color: rgba(255,255,255,0.7); font-size: 0.85rem;">Icono</label>
                <input type="text" id="swal-icon" class="swal2-input" value="${position.icon || '👤'}" style="margin: 0 0 15px 0; width: 100%;">
                
                <label style="display: block; margin-bottom: 5px; color: rgba(255,255,255,0.7); font-size: 0.85rem;">Descripción</label>
                <textarea id="swal-description" class="swal2-textarea" style="margin: 0; width: 100%; min-height: 80px;">${escapeHtml(position.description || '')}</textarea>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-check-lg"></i> Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3498db',
        background: '#1a1a2e',
        color: '#ffffff',
        width: '450px',
        preConfirm: () => ({
            id_position: positionId,
            name: document.getElementById('swal-name').value.trim(),
            icon: document.getElementById('swal-icon').value.trim() || '👤',
            description: document.getElementById('swal-description').value.trim()
        })
    });

    if (formValues) {
        const result = await ApiService.updatePosition(formValues);
        if (result.success) {
            await loadPositions();
            await openPositionDetail(positionId);
        } else {
            showError(result.message);
        }
    }
}

// Ocultar/Mostrar cargo
async function togglePositionVisibility(positionId, currentVisibility) {
    const newVisibility = currentVisibility ? 0 : 1;
    const action = newVisibility ? 'mostrar' : 'ocultar';

    const result = await ApiService.updatePosition({
        id_position: positionId,
        is_visible: newVisibility
    });

    if (result.success) {
        Swal.close();
        await loadPositions();
        showSuccess(`Cargo ${action === 'mostrar' ? 'visible' : 'oculto'}`);
    } else {
        showError(result.message);
    }
}

// Eliminar cargo
async function deletePositionConfirm(positionId) {
    const confirm = await Swal.fire({
        title: '¿Eliminar Cargo?',
        text: 'Se eliminarán todas las funciones y asignaciones asociadas. Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar todo',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e74c3c',
        background: '#1a1a2e',
        color: '#ffffff'
    });

    if (confirm.isConfirmed) {
        const result = await ApiService.deletePosition(positionId);
        if (result.success) {
            Swal.close();
            await loadPositions();
            showSuccess('Cargo eliminado correctamente');
        } else {
            showError(result.message);
        }
    }
}

// Helpers
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#e74c3c',
        background: '#1a1a2e',
        color: '#ffffff'
    });
}

function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: message,
        timer: 2000,
        showConfirmButton: false,
        background: '#1a1a2e',
        color: '#ffffff'
    });
}

// Estilos para botones del footer
const style = document.createElement('style');
style.textContent = `
    .swal-custom-footer {
        border-top: 1px solid rgba(255,255,255,0.05) !important;
        padding-top: 15px !important;
    }
    .swal-footer-btn {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;
    }
    .swal-footer-btn:hover {
        background: rgba(255,255,255,0.1);
    }
    .swal-footer-btn.edit {
        border-color: rgba(52, 152, 219, 0.3);
        color: #3498db;
    }
    .swal-footer-btn.hide {
        border-color: rgba(230, 126, 34, 0.3);
        color: #e67e22;
    }
    .swal-footer-btn.show {
        border-color: rgba(46, 204, 113, 0.3);
        color: #2ecc71;
    }
    .swal-footer-btn.delete {
        border-color: rgba(231, 76, 60, 0.3);
        color: #e74c3c;
    }
`;
document.head.appendChild(style);
