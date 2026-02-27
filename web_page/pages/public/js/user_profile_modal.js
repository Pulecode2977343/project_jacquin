/**
 * Shared User Profile Modal Logic
 * Centralizes the unified tabbed modal for user management across different pages.
 */

// Cargar componente de logo
const logoMembreteScript = document.createElement('script');
logoMembreteScript.src = 'js/components/logo_membrete.js';
document.head.appendChild(logoMembreteScript);

window.closeProfileModal = function () {
    const modal = document.getElementById("user-profile-modal");
    if (!modal) return;
    modal.style.opacity = "0";
    setTimeout(() => {
        modal.style.display = "none";
    }, 300);
};

window.openPositionDocument = async function (positionId, positionName, userName) {
    if (window.showToast) showToast("Generando documento oficial...", "info");

    try {
        const res = await ApiService.getPositionFunctions(positionId);
        if (!res.success) throw new Error(res.message);

        const functions = res.data || [];
        const date = new Date().toLocaleDateString();

        let docModal = document.getElementById("position-doc-modal");
        if (!docModal) {
            docModal = document.createElement("div");
            docModal.id = "position-doc-modal";
            docModal.className = "modal-overlay";
            docModal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 5, 10, 0.9); z-index: 110000;
                display: flex; justify-content: center; align-items: center;
                opacity: 0; transition: opacity 0.3s ease; backdrop-filter: blur(10px);
            `;
            document.body.appendChild(docModal);
        }

        docModal.innerHTML = `
            <div style="width: 95%; max-width: 800px; height: 90vh; background: white; border-radius: 10px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); animation: zoomIn 0.3s ease-out;">
                <div style="background: #1a2a3a; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; color: white;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="bi bi-file-earmark-pdf-fill" style="color: #ff7675; font-size: 1.4rem;"></i>
                        <span style="font-weight: 600; font-size: 0.95rem;">Manual de Funciones - ${positionName}</span>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.printPositionDoc()" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 15px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem;">
                            <i class="bi bi-printer"></i> Imprimir / PDF
                        </button>
                        <button onclick="document.getElementById('position-doc-modal').style.opacity='0'; setTimeout(()=>document.getElementById('position-doc-modal').style.display='none', 300)" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; margin-left: 10px;">&times;</button>
                    </div>
                </div>
                
                <div id="printable-doc-area" style="flex: 1; overflow-y: auto; padding: 60px; background: #e0e0e0; display: flex; justify-content: center;">
                    <div class="paper-sheet" style="width: 100%; max-width: 210mm; background: linear-gradient(135deg, #f5f3e8 0%, #ebe7d7 50%, #f2eede 100%); padding: 50px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); color: #333; font-family: 'Poppins', sans-serif; min-height: 297mm; position: relative; text-align: left; background-image: url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" /%3E%3C/filter%3E%3Crect width=\"100\" height=\"100\" filter=\"url(%23noise)\" opacity=\"0.03\" /%3E%3C/svg%3E'), linear-gradient(135deg, #f5f3e8 0%, #ebe7d7 50%, #f2eede 100%);">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1a2a3a; padding-bottom: 20px; margin-bottom: 40px;">
                            <div style="text-align: left;">
                                <logo-membrete color="#223F61" width="239" height="58" show-subtitle="true"></logo-membrete>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: 700; font-size: 0.9rem; color: #1a2a3a;">DOC-HR-FUNC-${positionId}</div>
                                <div style="color: #777; font-size: 0.75rem;">Fecha: ${date}</div>
                            </div>
                        </div>

                        <div style="margin-bottom: 40px;">
                            <h1 style="font-size: 1.8rem; margin: 0; color: #1a2a3a; font-weight: 300;">MANUAL DE RESPONSABILIDADES</h1>
                            <div style="width: 60px; height: 4px; background: #ac8421; margin-top: 10px;"></div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 50px;">
                            <div style="border-left: 3px solid #f0f0f0; padding-left: 20px;">
                                <label style="display: block; font-size: 0.65rem; color: #999; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Nombre del Cargo</label>
                                <div style="font-weight: 700; font-size: 1.2rem; color: #1a2a3a;">${positionName}</div>
                            </div>
                            <div style="border-left: 3px solid #f0f0f0; padding-left: 20px;">
                                <label style="display: block; font-size: 0.65rem; color: #999; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Funcionario Asignado</label>
                                <div style="font-weight: 700; font-size: 1.2rem; color: #1a2a3a;">${userName}</div>
                            </div>
                        </div>

                        <div style="margin-bottom: 60px;">
                            <h2 style="font-size: 1rem; color: #1a2a3a; margin-bottom: 25px; font-weight: 800; border-bottom: 1px solid #eee; padding-bottom: 15px;">FUNCIONES ESPEC\u00cdFICAS</h2>
                            <div style="display: flex; flex-direction: column; gap: 20px;">
                                ${functions.length > 0 ? functions.map((f, i) => `
                                    <div style="display: flex; gap: 20px;">
                                        <div style="flex: 0 0 30px; height: 30px; background: #1a2a3a; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;">${i + 1}</div>
                                        <div style="flex: 1; font-size: 0.95rem; line-height: 1.6; color: #444;">${f.description}</div>
                                    </div>
                                `).join('') : '<div style="color: #999; font-style: italic;">No hay funciones registradas para este cargo.</div>'}
                            </div>
                        </div>

                        <div style="margin-top: 100px; display: grid; grid-template-columns: 1fr 1fr; gap: 100px;">
                            <div style="text-align: center;">
                                <div style="border-bottom: 1px solid #1a2a3a; margin-bottom: 15px; height: 60px; display: flex; align-items: flex-end; justify-content: center; color: rgba(0,0,0,0.1); font-style: italic; font-size: 0.8rem;">Firma Digital Verificada</div>
                                <div style="font-size: 0.85rem; font-weight: 700; color: #1a2a3a;">${userName}</div>
                                <div style="font-size: 0.7rem; color: #777; text-transform: uppercase;">Firma del Funcionario</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="border-bottom: 1px solid #1a2a3a; margin-bottom: 15px; height: 60px;"></div>
                                <div style="font-size: 0.85rem; font-weight: 700; color: #1a2a3a;">DIRECCI\u00d3N ADMINISTRATIVA</div>
                                <div style="font-size: 0.7rem; color: #777; text-transform: uppercase;">Sello de Validaci\u00f3n Acad\u00e9mica</div>
                            </div>
                        </div>

                        <div style="position: absolute; bottom: 50px; left: 50px; right: 50px; text-align: center; font-size: 0.65rem; color: #bbb; border-top: 1px solid #f9f9f9; padding-top: 20px; font-weight: 500;">
                            JACQUIN ACADEMIA MUSICAL &copy; 2026 - DOCUMENTO DE USO INTERNO PRIVADO
                        </div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @media print {
                    body * { visibility: hidden !important; }
                    #position-doc-modal, #position-doc-modal * { visibility: visible !important; }
                    #position-doc-modal { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; background: white !important; }
                    #printable-doc-area { padding: 0 !important; background: white !important; }
                    .paper-sheet { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
                    button { display: none !important; }
                }
            </style>
        `;

        docModal.style.display = "flex";
        requestAnimationFrame(() => docModal.style.opacity = "1");

    } catch (e) {
        console.error(e);
        if (window.showToast) showToast("Error al cargar funciones: " + e.message, "error");
    }
};

window.printPositionDoc = function () { window.print(); };

window.openProfile = async function (userId, initialTab = 'info') {
    if (!userId) return console.error("openProfile: No userId provided");

    let user = null;
    if (window.allUsers && Array.isArray(window.allUsers)) {
        user = window.allUsers.find(u => (u.id_usuario || u.id) == userId);
    }

    if (!user) {
        try {
            const res = await ApiService.getUserDetails(userId);
            if (res.success && res.data) {
                user = res.data.profile || res.data.user_info || res.data.details;
            }
        } catch (e) {
            console.error("Error fetching user details:", e);
        }
    }

    if (!user) {
        if (window.showToast) showToast("No se pudo cargar la informaci\u00f3n del usuario", "error");
        return;
    }

    const currentUser = ApiService.getSession();
    let modal = document.getElementById("user-profile-modal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "user-profile-modal";
        document.body.appendChild(modal);
    }

    // Enforce styles and reset opacity
    modal.className = "modal-overlay";
    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0, 8, 20, 0.85) !important;
        z-index: 100000 !important;
        display: none;
        opacity: 0;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        transition: opacity 0.3s ease;
    `;

    // Handle background click (with small timeout to avoid initial bubbling)
    setTimeout(() => {
        modal.onclick = (e) => {
            if (e.target === modal) window.closeProfileModal();
        };
    }, 100);

    modal.innerHTML = `
        <div class="modal-card" style="
            width: 95%; max-width: 850px; padding: 0; overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(25, 47, 72, 0.95);
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: fadeInModal 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            color: var(--color-blanco-neutro);
            font-family: var(--font-principal);
        ">
            <div style="background: linear-gradient(135deg, var(--color-principal-azul), #1a324b); padding: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: var(--color-acento-azul); filter: blur(80px); opacity: 0.2; pointer-events: none;"></div>
                <div style="display: flex; align-items: center; gap: 20px; position: relative; z-index: 1;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid rgba(147, 182, 238, 0.3); background: rgba(0,0,0,0.3);" id="modal-avatar-container">
                        <img src="${ApiService.getAvatarUrl(user.avatar_url)}" alt="Avatar de ${user.full_name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='assets/images/avatars/default_avatar.svg'">
                    </div>
                    <div>
                        <h2 style="margin: 0; color: white; font-size: 1.6rem; font-weight: 600;">${user.full_name}</h2>
                        <div style="display: flex; gap: 10px; align-items: center; margin-top: 8px;">
                            <span style="background: rgba(147, 182, 238, 0.2); color: var(--color-acento-azul); padding: 4px 12px; border-radius: 30px; font-size: 0.7rem; font-weight: 700;">${getRoleName(user.id_rol)}</span>
                            <span style="color: rgba(255,255,255,0.4); font-size: 0.75rem;">ID: ${user.id_usuario || user.id}</span>
                        </div>
                    </div>
                </div>
                <button onclick="window.closeProfileModal()" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer;"><i class="bi bi-x-lg"></i></button>
            </div>

            <div style="background: rgba(0,0,0,0.2); display: flex; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 0 20px;">
                ${(currentUser.id_rol == 1 || (user.id_usuario || user.id) == currentUser.id_usuario) ? `
                    <button onclick="switchUserTab('info')" id="tab-btn-info" class="modal-tab-btn">Informaci\u00f3n</button>
                    <button onclick="switchUserTab('security')" id="tab-btn-security" class="modal-tab-btn">Seguridad</button>
                ` : ''}
                
                ${((currentUser.id_rol == 1 || (user.id_usuario || user.id) == currentUser.id_usuario) && (user.id_rol == 2 || user.id_rol == 1)) ? `
                    <button onclick="switchUserTab('courses')" id="tab-btn-courses" class="modal-tab-btn">${user.id_rol == 2 ? 'Horario de Clases' : 'Cursos Asignados'}</button>
                ` : ''}
                
                ${(currentUser.id_rol == 1 || (user.id_usuario || user.id) == currentUser.id_usuario) ? `
                    <button onclick="switchUserTab('position')" id="tab-btn-position" class="modal-tab-btn">Cargo e Id</button>
                ` : ''}
                
                ${(currentUser.id_rol == 1 || (currentUser.id_rol == 2 && user.id_rol == 3)) ? `
                    <button onclick="switchUserTab('academic')" id="tab-btn-academic" class="modal-tab-btn">${currentUser.id_rol == 2 ? 'Progreso Estudiante' : 'Gesti\u00f3n Acad\u00e9mica'}</button>
                ` : ''}
            </div>

            <div id="modal-tab-content" style="padding: 35px; max-height: 60vh; overflow-y: auto;" class="custom-scroll">
                <div style="text-align: center; color: rgba(255,255,255,0.3); padding: 40px;">Cargando contenido...</div>
            </div>

            <div style="padding: 20px 35px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; align-items: center; gap: 15px;">
                <div style="margin-right: auto; font-size: 0.8rem; color: rgba(255,255,255,0.15);">M\u00f3dulo de Gesti\u00f3n Acad\u00e9mica</div>
                ${currentUser.id_rol == 1 && (user.id_usuario || user.id) != currentUser.id_usuario ? `
                    <button onclick="window.deleteUser(${user.id_usuario || user.id}, '${user.full_name.replace(/'/g, "\\'")}')" style="background: rgba(231, 76, 60, 0.1); color: #ff7675; border: 1px solid rgba(231, 76, 60, 0.3); padding: 10px 20px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">Eliminar Usuario</button>
                ` : ''}
                <button onclick="window.closeProfileModal()" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 10px 25px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">Cerrar</button>
            </div>
        </div>
        <style>
            @keyframes fadeInModal { from { opacity: 0; transform: scale(0.95) translateY(20px); filter: blur(10px); } to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); } }
            .modal-tab-btn { background: none; border: none; color: rgba(255,255,255,0.4); padding: 18px 30px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.3s ease; }
            .modal-tab-btn:hover { color: white; background: rgba(255,255,255,0.03); }
            .modal-tab-btn.active { color: var(--color-acento-azul); border-bottom-color: var(--color-acento-azul); background: rgba(147, 182, 238, 0.08); }
            
            .info-field-group { margin-bottom: 20px; }
            .info-field-group label { 
                display: block; 
                color: rgba(255,255,255,0.4); 
                font-size: 0.75rem; 
                text-transform: uppercase; 
                margin-bottom: 8px; 
                font-weight: 600; 
                letter-spacing: 0.5px; 
            }
            .info-field-group input, 
            .info-field-group select { 
                width: 100%;
                background: rgba(0,0,0,0.3) !important; 
                border: 1px solid rgba(255,255,255,0.1) !important; 
                color: white !important;
                border-radius: 10px !important;
                padding: 12px 15px !important;
                font-size: 0.95rem;
                transition: all 0.3s ease;
                outline: none;
            }
            .info-field-group input:focus, 
            .info-field-group select:focus {
                border-color: var(--color-acento-azul) !important;
                box-shadow: 0 0 15px rgba(147, 182, 238, 0.15) !important;
            }
            .custom-scroll::-webkit-scrollbar { width: 6px; }
            .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
            .custom-scroll::-webkit-scrollbar-thumb { background: rgba(147, 182, 238, 0.3); border-radius: 10px; }
        </style>
    `;

    window.currentModalUser = user;
    window.currentModalUserId = (user.id_usuario || user.id);

    // Show modal
    modal.style.display = "flex";
    requestAnimationFrame(() => {
        modal.style.opacity = "1";
    });

    // Auto-determine best tab
    let tabToOpen = initialTab;
    if (currentUser.id_rol == 2 && user.id_rol == 3) {
        tabToOpen = 'academic';
    } else if (currentUser.id_rol != 1 && (user.id_usuario || user.id) != currentUser.id_usuario) {
        tabToOpen = 'academic';
    }

    switchUserTab(tabToOpen);
};

window.switchUserTab = async function (tab) {
    const content = document.getElementById('modal-tab-content');
    if (!content) return;

    const user = window.currentModalUser;
    const currentUser = ApiService.getSession();
    const canEdit = currentUser.id_rol == 1 || (currentUser.id_usuario || currentUser.id) == (user.id_usuario || user.id);

    // Update active tab UI
    document.querySelectorAll('.modal-tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-btn-${tab}`);
    if (activeBtn) activeBtn.classList.add('active');

    content.innerHTML = '<div style="text-align:center; padding:50px;"><div class="spinner-border text-primary" role="status"></div></div>';

    try {
        if (tab === 'info') {
            content.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; animation: fadeInModal 0.3s ease-out;">
                    <div>
                        <div class="info-field-group">
                            <label>Nombre Completo</label>
                            <input type="text" id="edit-full-name" value="${user.full_name}" class="form-control" ${!canEdit ? 'readonly' : ''}>
                        </div>
                        <div class="info-field-group">
                            <label>Correo Electr\u00f3nico</label>
                            <input type="email" id="edit-email" value="${user.email || ''}" class="form-control" ${currentUser.id_rol != 1 ? 'readonly' : ''}>
                        </div>
                        <div class="info-field-group">
                            <label>Tel\u00e9fono</label>
                            <input type="text" id="edit-phone" value="${user.n_phone || ''}" class="form-control" ${!canEdit ? 'readonly' : ''}>
                        </div>
                    </div>
                    <div>
                        <div class="info-field-group">
                            <label>Rol</label>
                            <select id="edit-role" class="form-control" ${currentUser.id_rol != 1 ? 'disabled' : ''}>
                                <option value="1" ${user.id_rol == 1 ? 'selected' : ''}>Administrador</option>
                                <option value="2" ${user.id_rol == 2 ? 'selected' : ''}>Docente</option>
                                <option value="3" ${user.id_rol == 3 ? 'selected' : ''}>Estudiante</option>
                                <option value="4" ${user.id_rol == 4 ? 'selected' : ''}>Aspirante</option>
                                <option value="5" ${user.id_rol == 5 ? 'selected' : ''}>Colaborador</option>
                            </select>
                        </div>
                        <div class="info-field-group" style="margin-top:20px;">
                            <label>Configuraci\u00f3n</label>
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                ${canEdit ? `
                                    <div onclick="triggerAvatarUploadInModal()" style="padding: 12px 15px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.2s;" onmouseover="this.style.borderColor='var(--color-acento-azul)'; this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(0,0,0,0.2)'">
                                        <i class="bi bi-camera" style="color: var(--color-acento-azul); font-size: 1.1rem;"></i>
                                        <span style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Actualizar Avatar</span>
                                    </div>
                                    <button onclick="updateProfileFromModal()" style="width:100%; background: linear-gradient(135deg, var(--color-acento-azul), #5a9fd4); border: none; padding: 12px; border-radius: 10px; color: #081d33; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                        <i class="bi bi-check2-circle"></i> Guardar Cambios
                                    </button>
                                ` : `
                                    <div style="padding: 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; color: rgba(255,255,255,0.3); font-size: 0.8rem; text-align: center;">
                                        Vista de solo lectura para el perfil de usuario.
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (tab === 'courses') {
            const res = await ApiService.getUserDetails(user.id_usuario || user.id);
            if (res.success) {
                const isTeacher = user.id_rol == 2;
                const courses = isTeacher ? (res.data.teaching || []) : (res.data.enrolled || []);

                if (courses.length === 0) {
                    content.innerHTML = `<div style="text-align:center; padding:40px; color:rgba(255,255,255,0.3);">No hay ${isTeacher ? 'materias asignadas' : 'cursos inscritos'}.</div>`;
                } else {
                    content.innerHTML = `
                        <div style="display: grid; gap: 10px;">
                            ${courses.map(c => {
                        const idToUse = isTeacher ? c.id_course : c.id_enrollment;
                        const actionFn = isTeacher ? 'unassignTeacherFromCourse' : 'unenrollUserFromCourse';
                        const btnTitle = isTeacher ? 'Remover asignaci\u00f3n de docente' : 'Desvincular del curso';

                        const statusColor = c.status === 'Activo' ? '#2ecc71' : (c.status === 'Pendiente' ? '#ff9f43' : 'rgba(255,255,255,0.3)');
                        const scheduleChips = !isTeacher && c.schedules && c.schedules.length > 0
                            ? c.schedules.map(sch => {
                                const fmt = t => (t || '').substring(0, 5);
                                const profLabel = sch.teacher_name && sch.teacher_name !== 'Por asignar'
                                    ? ` · <i class="bi bi-person-fill" style="opacity:.7;"></i> ${sch.teacher_name}`
                                    : ` · <span style="color:rgba(255,159,67,0.7);">Sin docente</span>`;
                                return `<span style="background:rgba(52,152,219,0.12); color:var(--color-acento-azul); padding:3px 10px; border-radius:20px; font-size:0.72rem; border:1px solid rgba(52,152,219,0.2); display:inline-flex; align-items:center; gap:4px;"><i class="bi bi-clock"></i>${sch.day_of_week} ${fmt(sch.start_time)}-${fmt(sch.end_time)}${profLabel}</span>`;
                            }).join('')
                            : (!isTeacher ? `<span style="color:rgba(255,159,67,0.7); font-size:0.75rem;"><i class="bi bi-exclamation-triangle" style="margin-right:4px;"></i>Sin horario asignado</span>` : '');

                        const teacherLine = !isTeacher && (!c.schedules || c.schedules.length === 0)
                            ? (c.teacher_name && c.teacher_name !== 'Por asignar'
                                ? `<div style="color:rgba(255,255,255,0.35); font-size:0.75rem; margin-top:3px;"><i class="bi bi-person" style="margin-right:4px;"></i>${c.teacher_name}</div>`
                                : `<div style="color:rgba(255,159,67,0.4); font-size:0.75rem; margin-top:3px;"><i class="bi bi-person" style="margin-right:4px;"></i>Docente pendiente</div>`)
                            : '';

                        return `
                                    <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); border-left: 3px solid ${statusColor};">
                                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                            <div style="flex:1;">
                                                <div style="color:white; font-weight:600;">${c.name}</div>
                                                ${isTeacher
                                ? `<div style="color:rgba(255,255,255,0.3); font-size:0.75rem; margin-top:2px;">${(c.schedules || []).length} horario(s) · ${c.total_students || 0} estudiante(s)</div>`
                                : teacherLine
                            }
                                                ${!isTeacher ? `<div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:5px;">${scheduleChips}</div>` : ''}
                                            </div>
                                            <div style="display:flex; gap:10px; align-items:center; margin-left:10px;">
                                                <span style="color:${statusColor}; font-size:0.78rem; font-weight:600; white-space:nowrap;">${c.status || 'Activo'}</span>
                                                ${currentUser.id_rol == 1 ? `
                                                    <button onclick="${actionFn}(${idToUse}, ${user.id_usuario || user.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer; padding:5px;" title="${btnTitle}">
                                                        <i class="bi bi-trash"></i>
                                                    </button>
                                                ` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `;
                    }).join('')}
                        </div>
                    `;
                }
            }
        } else if (tab === 'academic') {
            const targetUserId = user.id_usuario || user.id;
            const isTeacher = user.id_rol == 2;

            if (isTeacher) {
                // TEACHER ACADEMIC
                const res = await ApiService.getCourses();
                const allCourses = res.success ? res.data : [];
                const teaching = allCourses.filter(c => (c.teacher_id == targetUserId));

                content.innerHTML = `
                    <div style="animation: fadeInModal 0.3s ease-out;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding: 18px 22px; background: linear-gradient(135deg, rgba(39, 174, 96, 0.15), rgba(39, 174, 96, 0.05)); border-radius: 15px; border-left: 4px solid #27ae60;">
                            <i class="bi bi-person-video3" style="font-size: 1.8rem; color: #27ae60;"></i>
                            <div>
                                <div style="color: white; font-weight: 700; font-size: 1.1rem;">Carga Docente</div>
                                <div style="color: rgba(255,255,255,0.5); font-size: 0.8rem;">Gestiona las materias asignadas a este profesor</div>
                            </div>
                        </div>

                        <div style="margin-bottom: 30px;">
                            <h4 style="color: white; margin-bottom: 15px; font-size: 0.9rem; display: flex; align-items: center; gap: 10px;">
                                <i class="bi bi-journal-check" style="color: #27ae60;"></i> 
                                Materias Actuales
                            </h4>
                            <div style="display: grid; gap: 10px;">
                                ${teaching.map(c => `
                                    <div style="background: rgba(255,255,255,0.03); padding: 15px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <div style="color: white; font-weight: 600;">${c.name}</div>
                                        </div>
                                        <button onclick="unassignTeacherFromCourse(${c.id_course}, ${targetUserId})" style="background: rgba(231, 76, 60, 0.1); color: #ff7675; border: 1px solid rgba(231, 76, 60, 0.3); padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; cursor: pointer;">Remover</button>
                                    </div>
                                `).join('') || '<div style="color:rgba(255,255,255,0.2); font-style:italic;">Sin materias asignadas</div>'}
                            </div>
                        </div>
                    </div>
                `;
            } else if (currentUser.id_rol == 1 && user.id_rol == 3) {
                // ADMIN VIEWING STUDENT — inscripciones + horarios
                const detailsRes = await ApiService.getUserDetails(targetUserId);
                const enrolled = (detailsRes.success && detailsRes.data && detailsRes.data.enrolled) ? detailsRes.data.enrolled : [];

                const fmt = t => (t || '').substring(0, 5);
                const statusColor = s => s === 'Activo' ? '#2ecc71' : s === 'Pendiente' ? '#ff9f43' : '#e74c3c';
                const statusBg = s => s === 'Activo' ? 'rgba(46,204,113,0.12)' : s === 'Pendiente' ? 'rgba(255,159,67,0.12)' : 'rgba(231,76,60,0.12)';

                content.innerHTML = `
                    <div style="animation: fadeInModal 0.3s ease-out;">
                        <div style="display:flex;align-items:center;gap:15px;margin-bottom:20px;padding:16px 20px;background:rgba(147,182,238,0.06);border-radius:14px;border-left:4px solid var(--color-acento-azul);">
                            <i class="bi bi-journal-bookmark-fill" style="font-size:1.6rem;color:var(--color-acento-azul);"></i>
                            <div>
                                <div style="color:white;font-weight:700;font-size:1rem;">Inscripciones Académicas</div>
                                <div style="color:rgba(255,255,255,0.45);font-size:0.78rem;">${enrolled.length} curso${enrolled.length !== 1 ? 's' : ''} registrado${enrolled.length !== 1 ? 's' : ''}</div>
                            </div>
                        </div>

                        ${enrolled.length > 0 ? `
                        <div style="display:grid;gap:12px;">
                            ${enrolled.map(c => {
                    const schChips = (c.schedules && c.schedules.length > 0)
                        ? c.schedules.map(s => {
                            const prof = s.teacher_name && s.teacher_name !== 'Por asignar'
                                ? `<span style="color:rgba(255,200,100,0.75);margin-left:4px;"><i class="bi bi-person-fill" style="font-size:0.6rem;"></i> ${s.teacher_name}</span>`
                                : `<span style="color:rgba(255,159,67,0.6);margin-left:4px;">Sin docente</span>`;
                            return `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(147,182,238,0.1);border:1px solid rgba(147,182,238,0.18);border-radius:20px;padding:3px 10px;font-size:0.72rem;color:rgba(221,221,221,0.85);">
                                            <i class="bi bi-clock" style="font-size:0.65rem;opacity:0.6;"></i>
                                            <strong>${s.day_of_week}</strong> ${fmt(s.start_time)}–${fmt(s.end_time)}${prof}
                                        </span>`;
                        }).join(' ')
                        : `<span style="color:rgba(255,255,255,0.25);font-size:0.75rem;font-style:italic;">Sin horario asignado</span>`;

                    return `
                                 <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:16px 18px;">
                                     <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                                         <div style="color:white;font-weight:700;font-size:0.95rem;">${c.course_name || c.name || '—'}</div>
                                         <div style="display:flex; gap:8px; align-items:center;">
                                             <span style="background:${statusBg(c.status)};color:${statusColor(c.status)};border:1px solid ${statusColor(c.status)}44;padding:3px 10px;border-radius:20px;font-size:0.68rem;font-weight:800;text-transform:uppercase;">${c.status}</span>
                                             
                                             ${currentUser.id_rol == 1 ? `
                                                 <button onclick="window.assignStudentSchedule(${c.id_enrollment}, ${c.id_course}, '${(c.course_name || c.name || '').replace(/'/g, "\\'")}')" 
                                                         title="Asignar/Editar Horarios" 
                                                         style="background:rgba(52, 152, 219, 0.15); border:1px solid rgba(52, 152, 219, 0.3); color:#3498db; width:30px; height:30px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;">
                                                     <i class="bi bi-calendar-check"></i>
                                                 </button>
                                                 <button onclick="window.unenrollStudentAdmin(${c.id_enrollment}, ${c.id_course}, '${(c.course_name || c.name || '').replace(/'/g, "\\'")}')" 
                                                         title="Desinscribir" 
                                                         style="background:rgba(231, 76, 60, 0.15); border:1px solid rgba(231, 76, 60, 0.3); color:#e74c3c; width:30px; height:30px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;">
                                                     <i class="bi bi-person-dash"></i>
                                                 </button>
                                             ` : ''}
                                         </div>
                                     </div>
                                     <div style="display:flex;flex-wrap:wrap;gap:5px;">${schChips}</div>
                                 </div>`;
                }).join('')}
                        </div>
                        ` : `<div style="text-align:center;padding:50px;color:rgba(255,255,255,0.2);"><i class="bi bi-inbox" style="font-size:2rem;display:block;margin-bottom:10px;"></i>Este estudiante no tiene inscripciones registradas.</div>`}
                    </div>
                `;

            } else if (currentUser.id_rol == 2 && user.id_rol == 3) {
                // TEACHER VIEWING STUDENT
                const tasksRes = await ApiService.getAcademicData('get_my_assignments', { student_id: targetUserId });
                const tasks = tasksRes.success ? tasksRes.data : [];

                content.innerHTML = `
                    <div style="animation: fadeInModal 0.3s ease-out;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding: 18px 22px; background: rgba(147, 182, 238, 0.05); border-radius: 15px; border-left: 4px solid var(--color-acento-azul);">
                            <i class="bi bi-journal-text" style="font-size: 1.8rem; color: var(--color-acento-azul);"></i>
                            <div>
                                <div style="color: white; font-weight: 700; font-size: 1.1rem;">Actividades del Estudiante</div>
                                <div style="color: rgba(255,255,255,0.5); font-size: 0.8rem;">Revisa las entregas y el estado de sus tareas</div>
                            </div>
                        </div>

                        ${tasks.length > 0 ? `
                            <div style="display: grid; gap: 15px;">
                                ${tasks.map(t => {
                    const statusColors = { 'pending': '#ff9f43', 'submitted': '#3498db', 'graded': '#2ecc71' };
                    const statusLabels = { 'pending': 'Pendiente', 'submitted': 'Enviado', 'graded': 'Calificado' };
                    const status = t.submission_status || 'pending';

                    return `
                                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 20px;">
                                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                                <div>
                                                    <div style="color: white; font-weight: 700; font-size: 1.05rem;">${t.title}</div>
                                                    <div style="color: var(--color-acento-azul); font-size: 0.8rem; font-weight: 600; margin-top: 3px;">${t.course_name}</div>
                                                </div>
                                                <span style="background: ${statusColors[status]}22; color: ${statusColors[status]}; padding: 4px 12px; border-radius: 30px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">${statusLabels[status]}</span>
                                            </div>
                                            
                                            ${status !== 'pending' ? `
                                                <div style="background: rgba(0,0,0,0.2); border-radius: 10px; padding: 12px; margin-top: 15px;">
                                                    <div style="color: rgba(255,255,255,0.4); font-size: 0.75rem; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">Entrega del Alumno</div>
                                                    ${t.submission_url ? `
                                                        <a href="${t.submission_url.startsWith('http') ? t.submission_url : ApiService.BASE_URL + t.submission_url}" target="_blank" style="display: flex; align-items: center; gap: 8px; color: #4facfe; text-decoration: none; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600;">
                                                            <i class="bi bi-link-45deg"></i> Ver Trabajo Enviado
                                                        </a>
                                                    ` : ''}
                                                    ${t.submission_text ? `<p style="color: rgba(255,255,255,0.7); font-size: 0.85rem; margin: 0; line-height: 1.4;">"${t.submission_text}"</p>` : ''}
                                                </div>
                                            ` : '<div style="color: rgba(255,255,255,0.2); font-size: 0.8rem; font-style: italic; margin-top: 10px;">El estudiante a\u00fan no ha realizado esta entrega.</div>'}

                                            ${status === 'graded' ? `
                                                <div style="display: flex; align-items: center; gap: 10px; margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
                                                    <div style="background: rgba(46, 204, 113, 0.1); color: #2ecc71; padding: 5px 15px; border-radius: 10px; font-weight: 800; font-size: 1rem;">Nota: ${t.grade}</div>
                                                </div>
                                            ` : (status === 'submitted' ? `
                                                <div style="margin-top: 15px; text-align: right;">
                                                    <button onclick="TeacherAcademic.openModal(); window.closeProfileModal()" style="background: var(--color-acento-azul); color: #081d33; border: none; padding: 8px 15px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer;">Calificar ahora</button>
                                                </div>
                                            ` : '')}
                                        </div>
                                    `;
                }).join('')}
                            </div>
                        ` : '<div style="text-align: center; padding: 50px; color: rgba(255,255,255,0.2);">No hay actividades asignadas.</div>'}
                    </div>
                `;
            }
        } else if (tab === 'position') {
            const res = await ApiService.getUserPositions(user.id_usuario || user.id);
            if (res.success) {
                const assignments = res.data || [];

                // Marcar notificaciones de cargos como vistas si el usuario ve su propio perfil
                const session = ApiService.getSession();
                const viewedId = String(user.id_usuario || user.id);
                if (session && String(session.id_usuario) === viewedId) {
                    fetch(`${ApiService.BASE_URL}get_position_notifications.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: viewedId })
                    }).catch(() => { });
                }

                content.innerHTML = `
                    <div style="animation: fadeInModal 0.3s ease-out;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding: 18px 22px; background: rgba(231, 140, 59, 0.05); border-radius: 15px; border-left: 4px solid var(--color-acento-naranja);">
                            <i class="bi bi-briefcase" style="font-size: 1.8rem; color: var(--color-acento-naranja);"></i>
                            <div>
                                <div style="color: white; font-weight: 700; font-size: 1.1rem;">Cargos y Perfil Laboral</div>
                                <div style="color: rgba(255,255,255,0.5); font-size: 0.8rem;">Consulta tus funciones y responsabilidades institucionales</div>
                            </div>
                        </div>

                        <div style="display: grid; gap: 15px;">
                            ${assignments.length > 0 ? assignments.map(a => `
                                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s;" onmouseover="this.style.borderColor='var(--color-acento-azul)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'">
                                    <div style="display: flex; align-items: center; gap: 20px;">
                                        <div style="width: 50px; height: 50px; background: rgba(147, 182, 238, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                                            ${a.icon || '\ud83d\udc64'}
                                        </div>
                                        <div>
                                            <div style="color: white; font-weight: 700; font-size: 1.05rem;">${a.position_name}</div>
                                            <div style="color: rgba(255,255,255,0.3); font-size: 0.8rem;">Asignado el ${new Date(a.assigned_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <button onclick="window.openPositionDocument(${a.position_id}, '${a.position_name}', '${user.full_name}')" style="background: rgba(147, 182, 238, 0.1); color: var(--color-acento-azul); border: 1px solid rgba(147, 182, 238, 0.2); padding: 10px 18px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                        <i class="bi bi-file-earmark-text"></i> Ver Funciones
                                    </button>
                                </div>
                            `).join('') : `
                                <div style="text-align: center; padding: 40px; background: rgba(0,0,0,0.1); border-radius: 15px; border: 1px dashed rgba(255,255,255,0.1);">
                                    <i class="bi bi-info-circle" style="font-size: 2rem; color: rgba(255,255,255,0.1); display: block; margin-bottom: 10px;"></i>
                                    <div style="color: rgba(255,255,255,0.2); font-size: 0.9rem;">No hay cargos espec\u00edficos asignados a este perfil.</div>
                                </div>
                            `}
                        </div>
                    </div>
                `;
            }
        } else if (tab === 'security') {
            content.innerHTML = `
                <div style="animation: fadeInModal 0.3s ease-out; max-width: 500px; margin: 0 auto;">
                    <div style="background: rgba(231, 76, 60, 0.05); border-left: 4px solid #e74c3c; padding: 15px 20px; border-radius: 10px; margin-bottom: 25px;">
                        <div style="color: white; font-weight: 700; font-size: 0.95rem; margin-bottom: 5px;">Seguridad de la Cuenta</div>
                        <div style="color: rgba(255,255,255,0.4); font-size: 0.8rem;">Te recomendamos cambiar tu contrase\u00f1a peri\u00f3dicamente para proteger tu informaci\u00f3n acad\u00e9mica.</div>
                    </div>

                    <form onsubmit="handleModalPasswordChange(event)" id="modal-password-form">
                        <div class="info-field-group">
                            <label>Contrase\u00f1a Actual</label>
                            <input type="password" name="currentPassword" required placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022">
                        </div>
                        <div class="info-field-group">
                            <label>Nueva Contrase\u00f1a</label>
                            <input type="password" name="newPassword" required placeholder="M\u00ednimo 8 caracteres">
                            <small style="color: rgba(255,255,255,0.2); font-size: 0.7rem; margin-top: 5px; display: block;">Usa may\u00fasculas, n\u00fameros y s\u00edmbolos para mayor seguridad.</small>
                        </div>
                        <div class="info-field-group">
                            <label>Confirmar Nueva Contrase\u00f1a</label>
                            <input type="password" name="confirmPassword" required placeholder="Repite la nueva contrase\u00f1a">
                        </div>
                        
                        <button type="submit" style="width: 100%; background: linear-gradient(135deg, #e74c3c, #c0392b); border: none; padding: 12px; border-radius: 10px; color: white; font-weight: 700; cursor: pointer; margin-top: 10px; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px;">
                            <i class="bi bi-shield-lock"></i> Actualizar Credenciales
                        </button>
                    </form>
                </div>
            `;
        }
    } catch (e) {
        console.error("switchUserTab Error:", e);
        content.innerHTML = '<div style="color:red; padding:20px;">Error al cargar datos de la pesta\u00f1a.</div>';
    }
};

function getRoleName(id) {
    const roles = { 1: 'Administrador', 2: 'Docente', 3: 'Estudiante', 4: 'Aspirante', 5: 'Colaborador' };
    return roles[id] || 'Usuario';
}

function triggerAvatarUploadInModal() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const res = await ApiService.uploadAvatar(window.currentModalUserId, file);
        if (res.success) {
            if (window.showToast) showToast("Avatar actualizado correctamente", "success");
            else Swal.fire("\u00c9xito", "Avatar actualizado", "success");

            // Refresh modal avatar
            const avatarContainer = document.getElementById('modal-avatar-container');
            if (avatarContainer) {
                const img = avatarContainer.querySelector('img');
                if (img) img.src = ApiService.getAvatarUrl(res.data.avatar_url) + '?t=' + Date.now();
            }
            if (typeof loadUsers === 'function') loadUsers();
        } else {
            if (window.showToast) showToast("Error al subir imagen", "error");
            else Swal.fire("Error", res.message || "Error al subir imagen", "error");
        }
    };
    input.click();
}

window.openMyProfile = function () {
    const user = ApiService.getSession();
    if (user) {
        window.openProfile(user.id_usuario, 'info');
    } else {
        console.error("No active session found for openMyProfile");
    }
};

window.handleModalPasswordChange = async function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const user = ApiService.getSession();

    if (data.newPassword !== data.confirmPassword) {
        if (window.showToast) showToast("Las contrase\u00f1as no coinciden", "error");
        return;
    }

    if (data.newPassword.length < 8) {
        if (window.showToast) showToast("La nueva contrase\u00f1a debe tener al menos 8 caracteres", "warning");
        return;
    }

    try {
        const res = await ApiService.changePassword(user.id_usuario, data.currentPassword, data.newPassword);
        if (res.success) {
            if (window.showToast) showToast("Contrase\u00f1a actualizada con \u00e9xito", "success");
            e.target.reset();
        } else {
            if (window.showToast) showToast(res.message || "Error al cambiar contrase\u00f1a", "error");
        }
    } catch (err) {
        if (window.showToast) showToast("Error de conexi\u00f3n", "error");
    }
};

window.updateProfileFromModal = async function () {
    const sessionUser = ApiService.getSession();
    const targetUserId = window.currentModalUserId;
    const fullName = document.getElementById('edit-full-name').value;
    const email = document.getElementById('edit-email').value;
    const phone = document.getElementById('edit-phone').value;
    const roleSelect = document.getElementById('edit-role');
    const roleId = roleSelect ? roleSelect.value : (sessionUser.id_rol);

    if (!fullName) {
        if (window.showToast) showToast("El nombre es requerido", "warning");
        return;
    }

    try {
        let result;

        if (sessionUser.id_rol == 1) {
            result = await ApiService.adminUpdateUserFull({
                id_usuario: targetUserId,
                full_name: fullName,
                email: email,
                n_phone: phone,
                id_rol: roleId,
                avatar_action: 'keep'
            });
        } else {
            const response = await fetch(`${ApiService.BASE_URL}update_profile.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: targetUserId,
                    full_name: fullName,
                    n_phone: phone
                })
            });
            result = await response.json();
        }

        if (result.success) {
            if (window.showToast) showToast("Perfil actualizado correctamente", "success");
            else Swal.fire("\u00c9xito", "Perfil actualizado", "success");

            if (sessionUser && (sessionUser.id_usuario == targetUserId)) {
                sessionUser.full_name = fullName;
                sessionUser.n_phone = phone;
                if (sessionUser.id_rol == 1) {
                    sessionUser.email = email;
                }
                ApiService.saveSession(sessionUser);

                const nameEl = document.getElementById('dashboard-user-name') || document.getElementById('teacher-user-name');
                if (nameEl) nameEl.textContent = fullName;
            } else {
                if (typeof loadUsers === 'function') loadUsers();
            }

            window.closeProfileModal();
        } else {
            if (window.showToast) showToast(result.message || "Error al actualizar", "error");
            else Swal.fire("Error", result.message || "Error al actualizar", "error");
        }
    } catch (e) {
        console.error("Error updating profile:", e);
        if (window.showToast) showToast("Error de conexi\u00f3n al actualizar perfil", "error");
        else Swal.fire("Error", "Error de conexi\u00f3n al actualizar perfil", "error");
    }
};

// ─── Funciones globales para botones inline en el modal de perfil ─────────────

window.unassignTeacherFromCourse = async function (courseId, teacherId) {
    const confirm = await Swal.fire({
        title: '¿Remover asignación?',
        text: 'El docente dejará de estar asignado a este curso.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, remover',
        cancelButtonText: 'Cancelar',
        background: 'rgba(20,20,40,0.97)',
        color: '#fff',
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: 'rgba(255,255,255,0.1)'
    });
    if (!confirm.isConfirmed) return;

    const result = await ApiService.unassignTeacherFromCourse(teacherId, courseId);
    if (result.success) {
        if (window.showToast) showToast('Docente removido del curso', 'success');
        else Swal.fire({ title: 'Listo', icon: 'success', timer: 1500, background: 'rgba(20,20,40,0.97)', color: '#fff' });
        // Refrescar la pestaña actual del modal
        const activeTab = document.querySelector('.modal-tab-btn.active');
        if (activeTab) activeTab.click();
    } else {
        if (window.showToast) showToast(result.message || 'Error al remover docente', 'error');
        else Swal.fire({ title: 'Error', text: result.message, icon: 'error', background: 'rgba(20,20,40,0.97)', color: '#fff' });
    }
};

window.unenrollUserFromCourse = async function (enrollmentId, userId) {
    const confirm = await Swal.fire({
        title: '¿Desvincular del curso?',
        text: 'La inscripción del estudiante será cancelada.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, desvincular',
        cancelButtonText: 'Cancelar',
        background: 'rgba(20,20,40,0.97)',
        color: '#fff',
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: 'rgba(255,255,255,0.1)'
    });
    if (!confirm.isConfirmed) return;

    const result = await ApiService.unenrollStudent(enrollmentId);
    if (result.success) {
        if (window.showToast) showToast('Estudiante desvinculado del curso', 'success');
        else Swal.fire({ title: 'Listo', icon: 'success', timer: 1500, background: 'rgba(20,20,40,0.97)', color: '#fff' });
        const activeTab = document.querySelector('.modal-tab-btn.active');
        if (activeTab) activeTab.click();
    } else {
        if (window.showToast) showToast(result.message || 'Error al desvincular estudiante', 'error');
        else Swal.fire({ title: 'Error', text: result.message, icon: 'error', background: 'rgba(20,20,40,0.97)', color: '#fff' });
    }
};
