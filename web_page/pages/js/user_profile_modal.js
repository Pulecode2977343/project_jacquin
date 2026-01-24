/**
 * Shared User Profile Modal Logic
 * Centralizes the unified tabbed modal for user management across different pages.
 */

window.openProfile = async function (userId) {
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
        if (window.showToast) showToast("No se pudo cargar la información del usuario", "error");
        return;
    }

    const currentUser = ApiService.getSession();
    let modal = document.getElementById("user-profile-modal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "user-profile-modal";
        modal.className = "modal-overlay";
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 8, 20, 0.7); z-index: 10000;
            display: none; justify-content: center; align-items: center;
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            transition: all 0.3s ease;
        `;
        document.body.appendChild(modal);
    }

    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };

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
                        <img src="${user.avatar_url || '../assets/images/default_avatar.svg'}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='../assets/images/default_avatar.svg'">
                    </div>
                    <div>
                        <h2 style="margin: 0; color: white; font-size: 1.6rem; font-weight: 600;">${user.full_name}</h2>
                        <div style="display: flex; gap: 10px; align-items: center; margin-top: 8px;">
                            <span style="background: rgba(147, 182, 238, 0.2); color: var(--color-acento-azul); padding: 4px 12px; border-radius: 30px; font-size: 0.7rem; font-weight: 700;">${getRoleName(user.id_rol)}</span>
                            <span style="color: rgba(255,255,255,0.4); font-size: 0.75rem;">ID: ${user.id_usuario || user.id}</span>
                        </div>
                    </div>
                </div>
                <button onclick="document.getElementById('user-profile-modal').style.display='none'" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer;"><i class="bi bi-x-lg"></i></button>
            </div>

            <div style="background: rgba(0,0,0,0.2); display: flex; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 0 20px;">
                <button onclick="switchUserTab('info')" id="tab-btn-info" class="modal-tab-btn active">Información</button>
                ${(user.id_rol == 2 || user.id_rol == 1) ? `<button onclick="switchUserTab('courses')" id="tab-btn-courses" class="modal-tab-btn">${user.id_rol == 2 ? 'Horario de Clases' : 'Cursos Asignados'}</button>` : ''}
                ${(currentUser.id_rol == 1 || user.id_rol == 5 || user.id_rol == 2) ? `<button onclick="switchUserTab('position')" id="tab-btn-position" class="modal-tab-btn">Cargo e Id</button>` : ''}
                ${(currentUser.id_rol == 1 && (user.id_rol == 2 || user.id_rol == 3 || user.id_rol == 4)) ? `<button onclick="switchUserTab('academic')" id="tab-btn-academic" class="modal-tab-btn">Gestión Académica</button>` : ''}
            </div>

            <div id="modal-tab-content" style="padding: 35px; max-height: 60vh; overflow-y: auto;" class="custom-scroll">
                <div style="text-align: center; color: rgba(255,255,255,0.3); padding: 40px;">Cargando contenido...</div>
            </div>

            <div style="padding: 20px 35px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: flex-end; align-items: center; gap: 15px;">
                <div style="margin-right: auto; font-size: 0.8rem; color: rgba(255,255,255,0.2);">Panel de Gestión Institucional</div>
                ${currentUser.id_rol == 1 && (user.id_usuario || user.id) != currentUser.id_usuario ? `
                    <button onclick="deleteUserDirectlyModal(${user.id_usuario || user.id}, '${user.full_name.replace(/'/g, "\\'")}')" style="background: rgba(231, 76, 60, 0.1); color: #ff7675; border: 1px solid rgba(231, 76, 60, 0.3); padding: 10px 20px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">Eliminar Usuario</button>
                ` : ''}
                <button onclick="document.getElementById('user-profile-modal').style.display='none'" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 10px 25px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">Cerrar</button>
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
            .info-field-group input::placeholder {
                color: rgba(255,255,255,0.3);
            }
            .info-field-group select option {
                background: #1a2a3a;
                color: white;
            }
            .custom-scroll::-webkit-scrollbar { width: 6px; }
            .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
            .custom-scroll::-webkit-scrollbar-thumb { background: rgba(147, 182, 238, 0.3); border-radius: 10px; }
            .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(147, 182, 238, 0.5); }
        </style>
    `;

    window.currentModalUser = user;
    window.currentModalUserId = (user.id_usuario || user.id);
    modal.style.display = "flex";
    switchUserTab('info');
};

window.switchUserTab = async function (tab) {
    const content = document.getElementById('modal-tab-content');
    const user = window.currentModalUser;
    const currentUser = ApiService.getSession();

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
                            <input type="text" id="edit-full-name" value="${user.full_name}" class="form-control">
                        </div>
                        <div class="info-field-group">
                            <label>Correo Electrónico</label>
                            <input type="email" id="edit-email" value="${user.email || ''}" class="form-control">
                        </div>
                        <div class="info-field-group">
                            <label>Teléfono</label>
                            <input type="text" id="edit-phone" value="${user.n_phone || ''}" class="form-control">
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
                            <label>Gestión de Identidad</label>
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                <div onclick="triggerAvatarUploadInModal()" style="padding: 12px 15px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.2s;" onmouseover="this.style.borderColor='var(--color-acento-azul)'; this.style.background='rgba(0,0,0,0.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(0,0,0,0.2)'">
                                    <i class="bi bi-camera" style="color: var(--color-acento-azul); font-size: 1.1rem;"></i>
                                    <span style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Actualizar Avatar</span>
                                </div>
                                <button onclick="updateProfileFromModal()" style="width:100%; background: linear-gradient(135deg, var(--color-acento-azul), #5a9fd4); border: none; padding: 12px; border-radius: 10px; color: #081d33; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                    <i class="bi bi-check2-circle"></i> Guardar Cambios
                                </button>
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
                        const btnTitle = isTeacher ? 'Remover asignación de docente' : 'Desvincular del curso';

                        return `
                                    <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            <div>
                                                <div style="color:white; font-weight:600;">${c.name}</div>
                                                ${isTeacher ? `<div style="color:rgba(255,255,255,0.3); font-size:0.75rem; margin-top:2px;">Materia Principal</div>` : ''}
                                            </div>
                                            <div style="display:flex; gap:10px; align-items:center;">
                                                <span style="color:rgba(255,255,255,0.4); font-size:0.8rem;">${c.status || 'Activo'}</span>
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
                // TEACHER ACADEMIC MANAGEMENT
                const res = await ApiService.getCourses();
                const allCourses = res.success ? res.data : [];
                const teaching = allCourses.filter(c => c.teacher_id == targetUserId);
                const available = allCourses.filter(c => c.teacher_id != targetUserId && c.name !== 'Instalaciones');

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
                                <span style="background: rgba(39, 174, 96, 0.2); color: #27ae60; padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700;">${teaching.length}</span>
                            </h4>
                            ${teaching.length > 0 ? `
                                <div style="display: grid; gap: 10px;">
                                    ${teaching.map(c => `
                                        <div style="background: rgba(255,255,255,0.03); padding: 15px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center;">
                                            <div>
                                                <div style="color: white; font-weight: 600;">${c.name}</div>
                                                <div style="color: rgba(255,255,255,0.4); font-size: 0.75rem;">ID: ${c.id_course}</div>
                                            </div>
                                            <button onclick="unassignTeacherFromCourse(${c.id_course}, ${targetUserId})" style="background: rgba(231, 76, 60, 0.1); color: #ff7675; border: 1px solid rgba(231, 76, 60, 0.3); padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='rgba(231, 76, 60, 0.2)'" onmouseout="this.style.background='rgba(231, 76, 60, 0.1)'">Remover</button>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `<div style="text-align:center; padding:20px; color:rgba(255,255,255,0.2); border:1px dashed rgba(255,255,255,0.1); border-radius:12px;">Sin materias asignadas</div>`}
                        </div>

                        <h4 style="color: white; margin-bottom: 15px; font-size: 0.9rem; display: flex; align-items: center; gap: 10px;">
                            <i class="bi bi-plus-circle-fill" style="color: var(--color-acento-azul);"></i> 
                            Asignar Nueva Materia
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
                            ${available.map(c => `
                                <div onclick="assignTeacherToCourse(${c.id_course}, ${targetUserId}, '${c.name.replace(/'/g, "\\'")}')" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 15px; border-radius: 12px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.borderColor='var(--color-acento-azul)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)'; this.style.transform='translateY(0)'">
                                    <div style="color: white; font-weight: 500; font-size: 0.85rem; margin-bottom: 8px;">${c.name}</div>
                                    <div style="color: var(--color-acento-azul); font-size: 0.7rem; font-weight: 700;"><i class="bi bi-plus-lg"></i> Asignar</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                // STUDENT ACADEMIC MANAGEMENT (Existing Logic)
                const detailRes = await ApiService.getUserDetails(targetUserId);
                const allCoursesRes = await ApiService.getCourses();

                const enrolled = detailRes.success ? (detailRes.data.enrolled || []) : [];
                const allCourses = allCoursesRes.success ? allCoursesRes.data : [];
                const enrolledIds = enrolled.map(e => e.id_course);
                const availableCourses = allCourses.filter(c => !enrolledIds.includes(c.id_course) && c.name !== 'Instalaciones');

                content.innerHTML = `
                    <div style="animation: fadeInModal 0.3s ease-out;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding: 18px 22px; background: linear-gradient(135deg, rgba(52, 152, 219, 0.15), rgba(52, 152, 219, 0.05)); border-radius: 15px; border-left: 4px solid #3498db;">
                            <i class="bi bi-mortarboard" style="font-size: 1.8rem; color: #3498db;"></i>
                            <div>
                                <div style="color: white; font-weight: 700; font-size: 1.1rem;">Gestión Académica</div>
                                <div style="color: rgba(255,255,255,0.5); font-size: 0.8rem;">Administra inscripciones y cursos del usuario</div>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 30px;">
                            <h4 style="color: white; margin-bottom: 15px; font-size: 0.9rem; display: flex; align-items: center; gap: 10px;">
                                <i class="bi bi-bookmark-check-fill" style="color: var(--color-acento-azul);"></i> 
                                Plan de Aprendizaje
                                <span style="background: rgba(147, 182, 238, 0.2); color: var(--color-acento-azul); padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700;">${enrolled.length} cursos</span>
                            </h4>
                            ${enrolled.length > 0 ? `
                                <div style="display: grid; gap: 12px;">
                                    ${enrolled.map(e => `
                                        <div style="background: rgba(255,255,255,0.03); border-radius: 14px; border: 1px solid rgba(255,255,255,0.06); overflow: hidden;">
                                            <div onclick="toggleEnrollmentAccordion(${e.id_enrollment}, ${e.id_course}, ${targetUserId})" style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                                                <div style="display: flex; align-items: center; gap: 12px;">
                                                    <i class="bi bi-journal-bookmark" style="color: var(--color-acento-azul); font-size: 1.2rem;"></i>
                                                    <div>
                                                        <div style="color: white; font-weight: 600;">${e.name}</div>
                                                        <div style="color: rgba(255,255,255,0.4); font-size: 0.75rem;">Click para gestionar horarios</div>
                                                    </div>
                                                </div>
                                                <div style="display: flex; align-items: center; gap: 10px;">
                                                    <i class="bi bi-chevron-down" id="chevron-${e.id_enrollment}" style="color: rgba(255,255,255,0.4); transition: transform 0.3s;"></i>
                                                </div>
                                            </div>
                                            <div id="accordion-content-${e.id_enrollment}" style="display: none; padding: 0 20px 20px 20px; border-top: 1px solid rgba(255,255,255,0.05);">
                                                <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.3);">Cargando horarios...</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `<div style="text-align: center; padding: 25px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; color: rgba(255,255,255,0.2);">Sin inscripciones activas</div>`}
                        </div>

                        <h4 style="color: white; margin-bottom: 15px; font-size: 0.9rem; display: flex; align-items: center; gap: 10px;">
                            <i class="bi bi-plus-circle-fill" style="color: var(--color-acento-naranja);"></i> 
                            Inscribir en Nuevo Curso
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
                            ${availableCourses.map(c => `
                                <div onclick="enrollUserInCourse(${targetUserId}, ${c.id_course}, '${c.name.replace(/'/g, "\\'")}')" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 18px; border-radius: 14px; cursor: pointer; transition: 0.25s;" onmouseover="this.style.borderColor='var(--color-acento-naranja)'; this.style.transform='translateY(-3px)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)'; this.style.transform='translateY(0)'">
                                    <div style="color: white; font-weight: 600; font-size: 0.95rem; margin-bottom: 12px;">${c.name}</div>
                                    <div style="color: var(--color-acento-naranja); font-size: 0.75rem; font-weight: 700;"><i class="bi bi-plus-lg"></i> Inscribir</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        } else if (tab === 'position') {
            const targetUserId = user.id_usuario || user.id;

            // 1. Fetch current positions and all available positions
            const [userPositionsRes, allPositionsRes] = await Promise.all([
                ApiService.getUserPositions(targetUserId),
                ApiService.getPositions()
            ]);

            const current = userPositionsRes.success ? userPositionsRes.data : [];
            const allPositions = allPositionsRes.success ? allPositionsRes.data : [];
            const currentIds = current.map(p => p.position_id);
            const available = allPositions.filter(p => !currentIds.includes(p.id_position));

            content.innerHTML = `
                <div style="animation: fadeInModal 0.3s ease-out;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding: 18px 22px; background: linear-gradient(135deg, rgba(155, 89, 182, 0.15), rgba(155, 89, 182, 0.05)); border-radius: 15px; border-left: 4px solid #9b59b6;">
                        <i class="bi bi-person-badge" style="font-size: 1.8rem; color: #9b59b6;"></i>
                        <div>
                            <div style="color: white; font-weight: 700; font-size: 1.1rem;">Estructura de Cargos</div>
                            <div style="color: rgba(255,255,255,0.5); font-size: 0.8rem;">Define la jerarquía e identificación institucional</div>
                        </div>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h4 style="color: white; margin-bottom: 15px; font-size: 0.9rem; display: flex; align-items: center; gap: 10px;">
                            <i class="bi bi-award" style="color: #9b59b6;"></i> 
                            Cargos Asignados
                        </h4>
                        ${current.length > 0 ? `
                            <div style="display: grid; gap: 10px;">
                                ${current.map(p => `
                                    <div style="background: rgba(255,255,255,0.03); padding: 15px 20px; border-radius: 12px; border: 1px solid rgba(155, 89, 182, 0.2); display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <div style="color: white; font-weight: 600;">${p.position_name}</div>
                                            <div style="color: rgba(255,255,255,0.4); font-size: 0.75rem;">Asignado el: ${new Date(p.assigned_at).toLocaleDateString()}</div>
                                        </div>
                                        ${currentUser.id_rol == 1 ? `
                                            <button onclick="removeUserPosition(${p.id}, ${targetUserId})" style="background: none; color: #ff7675; border: 1px solid rgba(231, 76, 60, 0.3); padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; cursor: pointer;">Remover</button>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : `<div style="text-align:center; padding:20px; color:rgba(255,255,255,0.2); border:1px dashed rgba(255,255,255,0.1); border-radius:12px;">Sin cargos asignados</div>`}
                    </div>

                    ${currentUser.id_rol == 1 ? `
                        <h4 style="color: white; margin-bottom: 15px; font-size: 0.9rem; display: flex; align-items: center; gap: 10px;">
                            <i class="bi bi-plus-circle" style="color: #9b59b6;"></i> 
                            Disponible para Asignar
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
                            ${available.map(p => `
                                <div onclick="assignPositionToUser(${p.id_position}, ${targetUserId}, '${p.name.replace(/'/g, "\\'")}')" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(155, 89, 182, 0.1); padding: 15px; border-radius: 12px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.borderColor='#9b59b6'; this.style.background='rgba(155, 89, 182, 0.05)'" onmouseout="this.style.borderColor='rgba(155, 89, 182, 0.1)'; this.style.background='rgba(255,255,255,0.04)'">
                                    <div style="color: white; font-weight: 500; font-size: 0.85rem; margin-bottom: 5px;">${p.name}</div>
                                    <div style="color: #9b59b6; font-size: 1.2rem;"><i class="bi bi-plus-square-dotted"></i></div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }
    } catch (e) {
        console.error(e);
        content.innerHTML = '<div style="color:red; text-align:center;">Error al cargar.</div>';
    }
};

window.updateProfileFromModal = async function () {
    const user = window.currentModalUser;
    const name = document.getElementById('edit-full-name').value;
    const email = document.getElementById('edit-email').value;
    const phone = document.getElementById('edit-phone').value;
    const role = document.getElementById('edit-role').value;

    const res = await ApiService.adminUpdateUserFull({
        id_usuario: user.id_usuario || user.id,
        full_name: name, email, n_phone: phone, id_rol: role
    });

    if (res.success) {
        if (window.showToast) showToast("Perfil actualizado", "success");
        openProfile(user.id_usuario || user.id);
    } else {
        if (window.showToast) showToast(res.message, "error");
    }
};

window.enrollUserInCourse = async function (userId, courseId, courseName) {
    try {
        // Primero obtener horarios disponibles del curso
        const schedulesRes = await ApiService.getSchedules(courseId);
        const schedules = schedulesRes.success ? schedulesRes.data : [];

        if (schedules.length === 0) {
            if (window.showToast) showToast(`El curso "${courseName}" no tiene horarios disponibles.`, "warning");
            return;
        }

        // Si solo hay un horario, inscribir directamente
        if (schedules.length === 1) {
            const res = await ApiService.enrollStudent(userId, courseId, schedules[0].id_schedule);
            if (res.success) {
                if (window.showToast) showToast(`Inscrito en ${courseName}`, "success");
                switchUserTab('academic');
            } else {
                if (window.showToast) showToast(res.message, "error");
            }
            return;
        }

        // Si hay múltiples horarios, mostrar selector
        const scheduleOptions = {};
        schedules.forEach(s => {
            const dayName = normalizeDay(s.day || s.day_of_week || 'Sin día');
            const timeStart = ApiService.formatTime ? ApiService.formatTime(s.time_start) : s.time_start;
            const timeEnd = ApiService.formatTime ? ApiService.formatTime(s.time_end) : s.time_end;
            scheduleOptions[s.id_schedule] = `${dayName} (${timeStart} - ${timeEnd})`;
        });

        if (window.Swal) {
            const { value: selectedScheduleId } = await Swal.fire({
                title: `Seleccionar Horario`,
                text: `Elige un horario para ${courseName}:`,
                input: 'select',
                inputOptions: scheduleOptions,
                inputPlaceholder: 'Selecciona un horario',
                showCancelButton: true,
                confirmButtonText: 'Inscribir',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#E67E22',
                cancelButtonColor: '#555',
                background: '#1a1a2e',
                color: '#ffffff',
                width: '380px',
                didOpen: () => {
                    // Aplicar estilos al popup
                    const popup = Swal.getPopup();
                    if (popup) {
                        popup.style.overflow = 'hidden';
                        popup.style.padding = '25px';
                    }
                    // Aplicar estilos al contenedor del input
                    const inputContainer = popup.querySelector('.swal2-input-label, .swal2-select');
                    // Aplicar estilos al select
                    const input = Swal.getInput();
                    if (input) {
                        input.style.cssText = `
                            width: calc(100% - 24px) !important;
                            max-width: 330px !important;
                            box-sizing: border-box !important;
                            background: rgba(0,0,0,0.4) !important;
                            border: 1px solid rgba(255,255,255,0.2) !important;
                            color: white !important;
                            border-radius: 10px !important;
                            padding: 12px 15px !important;
                            margin: 15px auto !important;
                            display: block !important;
                            font-size: 0.9rem !important;
                        `;
                    }
                }
            });

            if (!selectedScheduleId) return;

            const res = await ApiService.enrollStudent(userId, courseId, selectedScheduleId);
            if (res.success) {
                if (window.showToast) showToast(`Inscrito en ${courseName}`, "success");
                switchUserTab('academic');
            } else {
                if (window.showToast) showToast(res.message, "error");
            }
        } else {
            // Fallback sin SweetAlert
            const scheduleId = schedules[0].id_schedule;
            const res = await ApiService.enrollStudent(userId, courseId, scheduleId);
            if (res.success) {
                if (window.showToast) showToast(`Inscrito en ${courseName}`, "success");
                switchUserTab('academic');
            } else {
                if (window.showToast) showToast(res.message, "error");
            }
        }
    } catch (e) {
        console.error(e);
        if (window.showToast) showToast("Error al inscribir usuario", "error");
    }
};

window.unenrollUserFromCourse = async function (enrollmentId, userId) {
    if (await showConfirm('¿Estás seguro de desinscribir a este usuario del curso?')) {
        try {
            const res = await ApiService.unenrollStudent(enrollmentId);
            if (res.success) {
                showToast("Usuario desinscrito correctamente", "success");
                switchUserTab('academic');
            } else {
                showToast(res.message || "Error al desinscribir", "error");
            }
        } catch (e) {
            console.error(e);
            if (window.showToast) showToast("Error al desinscribir usuario", "error");
        }
    }
};

window.deleteUserDirectlyModal = async function (uid, uname) {
    if (await showConfirm(`¿Eliminar permanentemente a ${uname}? Esta acción es irreversible.`)) {
        const res = await ApiService.deleteUser(uid);
        if (res.success) {
            showToast("Usuario eliminado correctamente", "success");
            const modal = document.getElementById('user-profile-modal');
            if (modal) modal.style.display = 'none';

            // Refresh underlying lists if they exist
            if (window.loadUsers) window.loadUsers();
            if (window.loadDirectory) window.loadDirectory();
            if (window.loadAdmins) window.loadAdmins();
        } else {
            showToast(res.message || "Error al eliminar usuario", "error");
        }
    }
};

// === TEACHER ASSIGNMENT HELPERS ===

window.unassignTeacherFromCourse = async function (courseId, teacherId) {
    if (!(await showConfirm("¿Deseas remover a este docente de la materia?"))) return;

    try {
        const res = await ApiService.updateCourseTeacher(courseId, null);
        if (res.success) {
            showToast("Docente removido", "success");
            switchUserTab('academic');
        } else {
            showToast(res.message, "error");
        }
    } catch (e) {
        showToast("Error al remover docente", "error");
    }
};

window.assignTeacherToCourse = async function (courseId, teacherId, courseName) {
    if (!(await showConfirm(`¿Asignar a este docente la materia ${courseName}?`))) return;

    try {
        const res = await ApiService.updateCourseTeacher(courseId, teacherId);
        if (res.success) {
            showToast("Docente asignado", "success");
            switchUserTab('academic');
        } else {
            showToast(res.message, "error");
        }
    } catch (e) {
        showToast("Error al asignar docente", "error");
    }
};

// === POSITION ASSIGNMENT HELPERS ===

window.assignPositionToUser = async function (positionId, userId, positionName) {
    if (!(await showConfirm(`¿Asignar el cargo de ${positionName} a este usuario?`))) return;

    const currentUser = ApiService.getSession();
    try {
        const res = await ApiService.assignPosition(userId, positionId, currentUser.id_usuario);
        if (res.success) {
            showToast("Cargo asignado", "success");
            switchUserTab('position');
        } else {
            showToast(res.message, "error");
        }
    } catch (e) {
        showToast("Error al asignar cargo", "error");
    }
};

window.removeUserPosition = async function (assignmentId, userId) {
    if (!(await showConfirm("¿Remover esta asignación de cargo?"))) return;

    try {
        const res = await ApiService.removePositionAssignment(assignmentId);
        if (res.success) {
            showToast("Cargo removido", "success");
            switchUserTab('position');
        } else {
            showToast(res.message, "error");
        }
    } catch (e) {
        showToast("Error al remover cargo", "error");
    }
};

function getRoleName(id) {
    const map = { 1: "Admin", 2: "Docente", 3: "Estudiante", 4: "Aspirante", 5: "Colaborador" };
    return map[id] || "Desc.";
}

window.triggerAvatarUploadInModal = function () {
    let input = document.getElementById("avatar-upload-input-modal");
    if (!input) {
        input = document.createElement("input");
        input.type = "file";
        input.id = "avatar-upload-input-modal";
        input.accept = "image/*";
        input.style.display = "none";
        document.body.appendChild(input);

        input.onchange = async (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const res = await ApiService.uploadAvatar(window.currentModalUserId, file);
                if (res.success) {
                    if (window.showToast) showToast("Avatar actualizado", "success");
                    const container = document.getElementById("modal-avatar-container");
                    if (container) container.innerHTML = `<img src="${res.data}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    if (window.loadDirectory) window.loadDirectory();
                    if (window.loadUsers) window.loadUsers();
                } else {
                    if (window.showToast) showToast(res.message, "error");
                }
            }
        };
    }
    input.click();
};

function normalizeDay(day) {
    const map = { 'monday': 'Lunes', 'tuesday': 'Martes', 'wednesday': 'Miércoles', 'thursday': 'Jueves', 'friday': 'Viernes', 'saturday': 'Sábado', 'sunday': 'Domingo' };
    return map[(day || '').toLowerCase()] || day;
}

// Acordeón para mostrar/ocultar horarios de un curso inscrito
window.toggleEnrollmentAccordion = async function (enrollmentId, courseId, userId) {
    const content = document.getElementById(`accordion-content-${enrollmentId}`);
    const chevron = document.getElementById(`chevron-${enrollmentId}`);

    if (!content) return;

    if (content.style.display === 'none' || content.style.display === '') {
        // Expandir
        content.style.display = 'block';
        if (chevron) chevron.style.transform = 'rotate(180deg)';

        // Cargar horarios
        content.innerHTML = '<div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.3);"><div class="spinner-border spinner-border-sm" role="status"></div> Cargando horarios...</div>';

        try {
            // Obtener horarios del enrollment y horarios disponibles del curso
            const [enrolledSchedulesRes, availableSchedulesRes] = await Promise.all([
                ApiService.getEnrollmentSchedules(enrollmentId),
                ApiService.getSchedules(courseId)
            ]);

            const enrolledSchedules = enrolledSchedulesRes.success ? enrolledSchedulesRes.data : [];
            const allSchedules = availableSchedulesRes.success ? availableSchedulesRes.data : [];

            content.innerHTML = `
                <div style="padding-top: 15px;">
                    <!-- Vista Semanal Interactiva -->
                    <div style="margin-bottom: 20px;">
                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                            <i class="bi bi-calendar-week"></i> Horario Semanal 
                            <span style="font-size: 0.7rem; color: rgba(46, 204, 113, 0.7);">(Click en un día para agregar)</span>
                        </div>
                        ${renderWeeklyScheduleView(enrolledSchedules, enrollmentId, userId, allSchedules, courseId)}
                    </div>
                    
                    <!-- Botón Desinscribir -->
                    <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; margin-top: 15px; display: flex; justify-content: flex-end;">
                        <button onclick="unenrollUserFromCourse(${enrollmentId}, ${userId})" style="background: rgba(231, 76, 60, 0.1); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.3); padding: 8px 14px; border-radius: 8px; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 6px;" onmouseover="this.style.background='rgba(231, 76, 60, 0.2)'" onmouseout="this.style.background='rgba(231, 76, 60, 0.1)'">
                            <i class="bi bi-x-lg"></i> Desinscribir del Curso
                        </button>
                    </div>
                </div>
            `;
        } catch (e) {
            console.error(e);
            content.innerHTML = '<div style="color: #e74c3c; text-align: center; padding: 20px;">Error al cargar horarios</div>';
        }
    } else {
        // Colapsar
        content.style.display = 'none';
        if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
};

// Renderizar vista semanal de horarios con días clickeables
function renderWeeklyScheduleView(schedules, enrollmentId, userId, availableSchedules, courseId) {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Agrupar horarios actuales por día
    const byDay = {};
    days.forEach(d => byDay[d] = []);

    schedules.forEach(s => {
        const day = normalizeDay(s.day_of_week || s.day || '');
        if (byDay[day]) {
            byDay[day].push(s);
        }
    });

    // Agrupar horarios disponibles por día
    const availableByDay = {};
    days.forEach(d => availableByDay[d] = []);

    const enrolledIds = schedules.map(s => s.id_schedule);
    (availableSchedules || []).forEach(s => {
        if (!enrolledIds.includes(s.id_schedule)) {
            const day = normalizeDay(s.day_of_week || s.day || '');
            if (availableByDay[day]) {
                availableByDay[day].push(s);
            }
        }
    });

    return `
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px;">
            ${days.map(day => {
        const hasSchedules = byDay[day].length > 0;
        const hasAvailable = availableByDay[day].length > 0;

        return `
                <div style="text-align: center;">
                    <!-- Día header - clickeable si hay horarios disponibles -->
                    <div onclick="${hasAvailable ? `showDaySchedulePicker('${day}', ${enrollmentId}, ${courseId}, ${userId})` : ''}" 
                         style="font-size: 0.65rem; color: ${hasAvailable ? 'var(--color-acento-azul)' : 'rgba(255,255,255,0.4)'}; margin-bottom: 6px; font-weight: 600; cursor: ${hasAvailable ? 'pointer' : 'default'}; padding: 4px; border-radius: 4px; transition: all 0.2s; ${hasAvailable ? 'background: rgba(52, 152, 219, 0.1);' : ''}" 
                         ${hasAvailable ? `onmouseover="this.style.background='rgba(52, 152, 219, 0.2)'" onmouseout="this.style.background='rgba(52, 152, 219, 0.1)'"` : ''}
                         title="${hasAvailable ? 'Click para agregar horario' : 'Sin horarios disponibles'}">
                        ${day.substring(0, 3).toUpperCase()}
                        ${hasAvailable ? '<i class="bi bi-plus-circle" style="font-size: 0.5rem; margin-left: 2px;"></i>' : ''}
                    </div>
                    
                    <!-- Horarios asignados -->
                    ${hasSchedules ? byDay[day].map(s => `
                        <div style="background: linear-gradient(135deg, rgba(52, 152, 219, 0.3), rgba(52, 152, 219, 0.1)); padding: 8px 4px; border-radius: 6px; margin-bottom: 4px; position: relative; border: 1px solid rgba(52, 152, 219, 0.3);">
                            <div style="font-size: 0.7rem; color: white; font-weight: 600;">${ApiService.formatTime ? ApiService.formatTime(s.time_start || s.start_time) : (s.time_start || s.start_time)}</div>
                            <div style="font-size: 0.6rem; color: rgba(255,255,255,0.5);">${ApiService.formatTime ? ApiService.formatTime(s.time_end || s.end_time) : (s.time_end || s.end_time)}</div>
                            <button onclick="event.stopPropagation(); removeScheduleBlock(${enrollmentId}, ${s.schedule_id}, ${userId})" style="position: absolute; top: -5px; right: -5px; background: #e74c3c; border: none; width: 16px; height: 16px; border-radius: 50%; color: white; font-size: 0.6rem; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Eliminar este horario">×</button>
                        </div>
                    `).join('') : `
                        <!-- Slot vacío - clickeable si hay disponibles -->
                        <div onclick="${hasAvailable ? `showDaySchedulePicker('${day}', ${enrollmentId}, ${courseId}, ${userId})` : ''}" 
                             style="background: ${hasAvailable ? 'rgba(46, 204, 113, 0.05)' : 'rgba(255,255,255,0.02)'}; padding: 12px 4px; border-radius: 6px; border: 1px dashed ${hasAvailable ? 'rgba(46, 204, 113, 0.3)' : 'rgba(255,255,255,0.1)'}; cursor: ${hasAvailable ? 'pointer' : 'default'}; transition: all 0.2s;"
                             ${hasAvailable ? `onmouseover="this.style.background='rgba(46, 204, 113, 0.15)'; this.style.borderColor='rgba(46, 204, 113, 0.5)'" onmouseout="this.style.background='rgba(46, 204, 113, 0.05)'; this.style.borderColor='rgba(46, 204, 113, 0.3)'"` : ''}>
                            <div style="font-size: 0.65rem; color: ${hasAvailable ? '#2ecc71' : 'rgba(255,255,255,0.2)'};">
                                ${hasAvailable ? '<i class="bi bi-plus"></i>' : '-'}
                            </div>
                        </div>
                    `}
                    
                    <!-- Botón adicional para agregar más si ya tiene horarios -->
                    ${hasSchedules && hasAvailable ? `
                        <div onclick="showDaySchedulePicker('${day}', ${enrollmentId}, ${courseId}, ${userId})" 
                             style="background: rgba(46, 204, 113, 0.1); padding: 6px 4px; border-radius: 6px; margin-top: 4px; cursor: pointer; border: 1px dashed rgba(46, 204, 113, 0.3); transition: all 0.2s;"
                             onmouseover="this.style.background='rgba(46, 204, 113, 0.2)'" 
                             onmouseout="this.style.background='rgba(46, 204, 113, 0.1)'">
                            <div style="font-size: 0.55rem; color: #2ecc71;"><i class="bi bi-plus"></i></div>
                        </div>
                    ` : ''}
                </div>
            `}).join('')}
        </div>
    `;
}

// Mostrar popup con horarios disponibles para un día específico
window.showDaySchedulePicker = async function (day, enrollmentId, courseId, userId) {
    try {
        // Obtener horarios del curso
        const schedulesRes = await ApiService.getSchedules(courseId);
        const allSchedules = schedulesRes.success ? schedulesRes.data : [];

        // Obtener horarios ya asignados
        const enrolledRes = await ApiService.getEnrollmentSchedules(enrollmentId);
        const enrolledSchedules = enrolledRes.success ? enrolledRes.data : [];
        const enrolledIds = enrolledSchedules.map(s => s.id_schedule);

        // Filtrar solo horarios del día seleccionado que no estén asignados
        const daySchedules = allSchedules.filter(s => {
            const schedDay = normalizeDay(s.day_of_week || s.day || '');
            return schedDay === day && !enrolledIds.includes(s.id_schedule);
        });

        if (daySchedules.length === 0) {
            if (window.showToast) showToast(`No hay horarios disponibles para ${day}`, "info");
            return;
        }

        // Crear opciones para el selector
        const scheduleOptions = {};
        daySchedules.forEach(s => {
            const timeStart = ApiService.formatTime ? ApiService.formatTime(s.start_time || s.time_start) : (s.start_time || s.time_start);
            const timeEnd = ApiService.formatTime ? ApiService.formatTime(s.end_time || s.time_end) : (s.end_time || s.time_end);
            scheduleOptions[s.id_schedule] = `${timeStart} - ${timeEnd}`;
        });

        if (window.Swal) {
            const { value: selectedScheduleId } = await Swal.fire({
                title: `<i class="bi bi-calendar-plus" style="color: #2ecc71;"></i> ${day}`,
                html: `<div style="color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-bottom: 10px;">Selecciona un horario para agregar:</div>`,
                input: 'select',
                inputOptions: scheduleOptions,
                inputPlaceholder: 'Elige un horario',
                showCancelButton: true,
                confirmButtonText: '<i class="bi bi-plus-lg"></i> Agregar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#2ecc71',
                cancelButtonColor: '#555',
                background: '#1a1a2e',
                color: '#ffffff',
                width: '350px',
                didOpen: () => {
                    const input = Swal.getInput();
                    if (input) {
                        input.style.cssText = `
                            width: calc(100% - 24px) !important;
                            max-width: 300px !important;
                            background: rgba(0,0,0,0.4) !important;
                            border: 1px solid rgba(46, 204, 113, 0.3) !important;
                            color: white !important;
                            border-radius: 10px !important;
                            padding: 12px 15px !important;
                            margin: 10px auto !important;
                            display: block !important;
                        `;
                    }
                }
            });

            if (!selectedScheduleId) return;

            // Agregar el horario
            await addScheduleToEnrollment(enrollmentId, parseInt(selectedScheduleId), userId, courseId);
        }
    } catch (e) {
        console.error(e);
        if (window.showToast) showToast("Error cargando horarios", "error");
    }
};


// Agregar un horario a un enrollment existente
window.addScheduleToEnrollment = async function (enrollmentId, scheduleId, userId, courseId) {
    try {
        // Verificar conflictos primero
        const conflictRes = await checkScheduleConflicts(userId, scheduleId);
        if (conflictRes.hasConflict) {
            if (window.Swal) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Conflicto de Horario',
                    html: `Este horario se cruza con:<br><strong>${conflictRes.conflictWith}</strong>`,
                    confirmButtonColor: '#E67E22',
                    background: '#1a1a2e',
                    color: '#ffffff'
                });
            } else {
                showToast('Conflicto: ' + conflictRes.conflictWith, 'warning');
            }
            return;
        }

        // Agregar horario al enrollment
        const res = await ApiService.addScheduleToEnrollment(enrollmentId, scheduleId);
        if (res.success) {
            if (window.showToast) showToast("Horario agregado al plan", "success");
            // Recargar acordeón
            const content = document.getElementById(`accordion-content-${enrollmentId}`);
            if (content) content.style.display = 'none';
            toggleEnrollmentAccordion(enrollmentId, courseId, userId);
        } else {
            if (window.showToast) showToast(res.message || "Error al agregar horario", "error");
        }
    } catch (e) {
        console.error(e);
        if (window.showToast) showToast("Error de conexión", "error");
    }
};

// Eliminar un bloque de horario específico del enrollment
window.removeScheduleBlock = async function (enrollmentId, scheduleId, userId) {
    if (!await showConfirm('¿Eliminar este bloque de horario?')) return;

    try {
        const res = await ApiService.removeScheduleFromEnrollment(enrollmentId, scheduleId);
        if (res.success) {
            if (window.showToast) showToast("Horario eliminado", "success");
            switchUserTab('academic');
        } else {
            if (window.showToast) showToast(res.message || "Error al eliminar", "error");
        }
    } catch (e) {
        console.error(e);
        if (window.showToast) showToast("Error de conexión", "error");
    }
};

// Verificar conflictos de horario para un usuario
async function checkScheduleConflicts(userId, newScheduleId) {
    try {
        // Obtener el horario que queremos agregar
        const scheduleRes = await ApiService.getScheduleById ?
            await ApiService.getScheduleById(newScheduleId) :
            { success: false };

        if (!scheduleRes.success) {
            return { hasConflict: false }; // No podemos verificar, permitir
        }

        const newSchedule = scheduleRes.data;

        // Obtener todos los enrollments del usuario
        const userRes = await ApiService.getUserDetails(userId);
        if (!userRes.success) return { hasConflict: false };

        const enrollments = userRes.data.enrolled || [];

        // Verificar cada enrollment
        for (const enrollment of enrollments) {
            const enrolledSchedulesRes = await ApiService.getEnrollmentSchedules(enrollment.id_enrollment);
            if (!enrolledSchedulesRes.success) continue;

            for (const existingSchedule of enrolledSchedulesRes.data) {
                // Mismo día?
                const newDay = normalizeDay(newSchedule.day_of_week || newSchedule.day);
                const existingDay = normalizeDay(existingSchedule.day_of_week || existingSchedule.day);

                if (newDay === existingDay) {
                    // Verificar solapamiento de tiempo
                    const newStart = newSchedule.time_start || newSchedule.start_time;
                    const newEnd = newSchedule.time_end || newSchedule.end_time;
                    const existStart = existingSchedule.time_start || existingSchedule.start_time;
                    const existEnd = existingSchedule.time_end || existingSchedule.end_time;

                    if (timesOverlap(newStart, newEnd, existStart, existEnd)) {
                        return {
                            hasConflict: true,
                            conflictWith: `${enrollment.name} - ${existingDay} ${existStart}`
                        };
                    }
                }
            }
        }

        return { hasConflict: false };
    } catch (e) {
        console.error('Error checking conflicts:', e);
        return { hasConflict: false };
    }
}

// Verificar si dos rangos de tiempo se solapan
function timesOverlap(start1, end1, start2, end2) {
    const toMinutes = (t) => {
        if (!t) return 0;
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    const s1 = toMinutes(start1), e1 = toMinutes(end1);
    const s2 = toMinutes(start2), e2 = toMinutes(end2);

    return (s1 < e2 && e1 > s2);
}
