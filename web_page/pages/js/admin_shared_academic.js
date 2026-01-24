/**
 * Shared Academic Management Logic
 * Moved from dashboard.js to be accessible from admin_users.html and gestion.html
 */

window.openCourseManagement = async function () {
    const res = await ApiService.getCourses();
    if (!res.success) return showToast("Error cargando cursos.", "error");

    let pendingGroups = {};
    const pendingRes = await ApiService.getPendingEnrollments();
    if (pendingRes.success && pendingRes.data) {
        pendingRes.data.forEach(r => {
            if (!pendingGroups[r.course_id]) pendingGroups[r.course_id] = 0;
            pendingGroups[r.course_id]++;
        });
    }

    const validCourses = res.data.filter(c => c.name !== 'Instalaciones');

    const courses = validCourses.sort((a, b) => {
        const aCount = pendingGroups[a.id_course] || 0;
        const bCount = pendingGroups[b.id_course] || 0;
        return bCount - aCount;
    });

    const modalId = "admin-courses-modal";
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement("div");
        modal.id = modalId;
        modal.className = "modal-overlay";
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,8,20,0.8); z-index:20002; display:flex; justify-content:center; align-items:center; opacity:0; transition:opacity 0.3s; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);";
        document.body.appendChild(modal);

        const style = document.createElement('style');
        style.textContent = `
            #admin-courses-modal * { font-family: 'Outfit', sans-serif !important; }
            .admin-academic-card:hover { border-color: var(--color-acento-azul) !important; background: rgba(255,255,255,0.08) !important; }
        `;
        document.head.appendChild(style);
    }

    const coursesListHtml = courses.map(c => {
        const pCount = pendingGroups[c.id_course] || 0;
        const hasAction = pCount > 0;

        return `
        <div onclick="openCourseDetails(${c.id_course}, '${c.name.replace(/'/g, "\\'")}')" 
             style="background:rgba(255,255,255,0.04); padding:20px; margin-bottom:12px; border-radius:15px; cursor:pointer; 
                    border:1px solid ${hasAction ? 'rgba(255, 159, 67, 0.4)' : 'rgba(255,255,255,0.05)'}; 
                    border-left:5px solid ${hasAction ? '#ff9f43' : 'var(--color-acento-azul)'}; 
                    position:relative; transition:0.3s; box-shadow:${hasAction ? '0 0 20px rgba(255, 159, 67, 0.1)' : 'none'}"
             onmouseover="this.style.background='rgba(255,255,255,0.07)'; this.style.transform='translateX(5px)'"
             onmouseout="this.style.background='rgba(255,255,255,0.04)'; this.style.transform='translateX(0)'">
            
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="color:white; font-weight:700; font-size:1.1rem; margin-bottom:4px;">${c.name}</div>
                    <div style="color:rgba(255,255,255,0.4); font-size:0.8rem;">ID: ${c.id_course} | DOCENTE: <span style="color: var(--color-acento-azul); font-weight: 600;">${c.teacher_name || 'SIN ASIGNAR'}</span></div>
                </div>
                ${hasAction ? `
                    <div title="Solicitudes Pendientes" style="width:32px; height:32px; border-radius:50%; background:#ff9f43; display:flex; justify-content:center; align-items:center; color:black; font-weight:900; font-size:0.85rem; box-shadow:0 0 15px rgba(255, 159, 67, 0.6); animation: pulse-alert 2s infinite; border: 2px solid rgba(255,255,255,0.2);">
                        ${pCount}
                    </div>
                ` : '<i class="bi bi-chevron-right" style="color:#444;"></i>'}
            </div>
        </div>
    `;
    }).join('') || '<div style="color:#666; text-align:center; padding:40px;">No hay cursos registrados.</div>';

    modal.innerHTML = `
        <div style="background:#141414; padding:35px; border-radius:30px; width:95%; max-width:700px; max-height:85vh; overflow-y:auto; border:1px solid rgba(255,255,255,0.1); box-shadow:0 50px 100px rgba(0,0,0,0.9);" class="custom-scroll">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:30px;">
                <div>
                    <h2 style="color:white; margin:0; font-size:1.8rem; font-weight:300;">Gestión Académica</h2>
                    <p style="color:rgba(255,255,255,0.4); margin:5px 0 0 0;">Selecciona una materia para gestionar inscritos y horarios.</p>
                </div>
                <button onclick="document.getElementById('${modalId}').style.opacity='0'; setTimeout(()=>document.getElementById('${modalId}').style.display='none', 300)" style="background:rgba(255,255,255,0.05); border:none; color:white; width:40px; height:40px; border-radius:50%; font-size:1.5rem; cursor:pointer;">&times;</button>
            </div>
            <div style="margin-bottom:20px;">${coursesListHtml}</div>
            <div style="text-align:center; padding-top:20px; border-top:1px solid rgba(255,255,255,0.05);">
                <button onclick="document.getElementById('${modalId}').style.opacity='0'; setTimeout(()=>document.getElementById('${modalId}').style.display='none', 300)" style="background:#333; color:white; border:none; padding:10px 40px; border-radius:50px; font-weight:bold; cursor:pointer;">Cerrar Panel</button>
            </div>
        </div>
    `;

    modal.onclick = function (e) {
        if (e.target === modal) {
            modal.style.opacity = '0';
            setTimeout(() => modal.style.display = 'none', 300);
        }
    };

    modal.style.display = "flex";
    setTimeout(() => modal.style.opacity = "1", 10);
};

window.openCourseDetails = async function (courseId, courseName) {
    const pendingCenter = document.getElementById("admin-pending-center-modal");
    if (pendingCenter) pendingCenter.remove();

    // Create modal if it doesn't exist (for when called from user_profile_modal or other contexts)
    let modal = document.getElementById("admin-courses-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "admin-courses-modal";
        modal.className = "modal-overlay";
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:20002; display:flex; justify-content:center; align-items:center;";
        document.body.appendChild(modal);
    }
    modal.style.display = "flex";
    modal.style.opacity = "1";
    modal.innerHTML = '<div style="color:white;text-align:center;padding:50px;"><div class="spinner-border text-primary" role="status"></div><p style="margin-top:10px;">Cargando detalles...</p></div>';

    const res = await ApiService.getFullCourseDetails(courseId);
    if (!res.success) {
        showToast("Error cargando detalles: " + res.message, "error");
        window.openCourseManagement();
        return;
    }

    const { students: rawStudents = [], pending: rawPending = [], schedules = [] } = res.data;

    // Deduplicate students by user ID
    const studentMap = new Map();
    rawStudents.forEach(s => {
        const id = s.id_usuario || s.id;
        if (!studentMap.has(id)) {
            studentMap.set(id, { ...s });
        }
    });
    const students = Array.from(studentMap.values());

    // Deduplicate pending requests by user ID
    const pendingMap = new Map();
    rawPending.forEach(p => {
        const id = p.id_usuario || p.id;
        if (!pendingMap.has(id)) {
            pendingMap.set(id, { ...p });
        }
    });
    const pending = Array.from(pendingMap.values());

    const modalContent = `
        <div style="background:#141414; padding:35px; border-radius:30px; width:95%; max-width:800px; max-height:85vh; overflow-y:auto; border:1px solid rgba(255,255,255,0.1); box-shadow:0 50px 100px rgba(0,0,0,0.9);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <div>
                    <h2 style="color:white; margin:0; font-size:1.8rem;">${courseName}</h2>
                    <p style="color:rgba(255,255,255,0.4); margin:5px 0 0 0;">Gestión de alumnos y programación.</p>
                </div>
                <button onclick="closeCourseDetailsModal()" style="background:rgba(255,255,255,0.05); border:none; color:white; padding:8px 20px; border-radius:50px; cursor:pointer;">Cerrar</button>
            </div>
            
            <div style="display:flex; gap:15px; margin-bottom:25px; border-bottom:1px solid #222; padding-bottom:15px;">
                <button onclick="switchTab('tab-enrollments')" id="btn-tab-enrollments" style="background:none; border:none; color:var(--color-acento-azul); font-weight:bold; cursor:pointer; padding:5px 15px; border-radius:5px; transition:0.3s;">Inscritos (${students.length})</button>
                <button onclick="switchTab('tab-schedules')" id="btn-tab-schedules" style="background:none; border:none; color:#555; font-weight:bold; cursor:pointer; padding:5px 15px; border-radius:5px; transition:0.3s;">Horarios (${schedules.length})</button>
            </div>

            <div id="tab-enrollments">
                ${pending.length > 0 ? `
                    <div style="background:rgba(255, 159, 67, 0.05); border:1px solid rgba(255, 159, 67, 0.2); padding:20px; border-radius:15px; margin-bottom:25px;">
                        <h4 style="color:#ff9f43; margin-top:0; font-size:0.9rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:15px;">Solicitudes por revisar (${pending.length})</h4>
                        ${pending.map(p => `
                            <div class="enrollment-request-card">
                                <div class="enrollment-info">
                                    <div style="color:white; font-weight:bold; font-size:1.05rem;">
                                        ${p.full_name} 
                                        ${p.status === 'Pre-inscrito' ? '<span style="background:var(--color-acento-naranja); color:white; font-size:0.6rem; padding:2px 6px; border-radius:4px; vertical-align:middle; margin-left:5px;">PRE</span>' : ''}
                                    </div>
                                    <div style="color:#888; font-size:0.85rem; margin-top:2px;">${p.email}</div>
                                    
                                    ${p.schedule_info
            ? `<div style="color:#aaa; font-size:0.8rem; margin-top:5px; display:flex; align-items:center; gap:5px;"><i class="bi bi-clock"></i> ${p.schedule_info}</div>`
            : `<div style="color:var(--color-acento-naranja); font-size:0.8rem; margin-top:5px; font-weight:bold;"><i class="bi bi-exclamation-triangle"></i> Falta asignar horario</div>`
        }
                                </div>
                                <div class="enrollment-request-actions">
                                    ${!p.schedule_info
            ? `<button onclick="assignStudentSchedule(${p.id_enrollment}, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" class="assign-btn" style="background:#444; color:white; border:none; padding:6px 15px; border-radius:8px; cursor:pointer; font-size:0.8rem; font-weight:bold;">Asignar Horario</button>`
            : `<button onclick="assignStudentSchedule(${p.id_enrollment}, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" style="background:none; border:1px solid #444; color:#aaa; padding:6px 12px; border-radius:8px; cursor:pointer; font-size:0.75rem;" title="Cambiar Horario"><i class="bi bi-pencil"></i></button>`
        }

                                    <button onclick="${!p.schedule_info
            ? `showToast('⚠️ Debes asignar un horario antes de aprobar la inscripción.', 'warning')`
            : `processRequest(${p.id_enrollment}, 'approve', ${courseId}, '${courseName.replace(/'/g, "\\'")}')`}" 
                                        style="background:${!p.schedule_info ? '#333' : '#27ae60'}; color:${!p.schedule_info ? '#777' : 'white'}; border:1px solid ${!p.schedule_info ? '#444' : 'transparent'}; padding:8px 15px; border-radius:8px; cursor:pointer; font-size:0.8rem; font-weight:bold;" 
                                        title="${!p.schedule_info ? 'Asigna un horario primero' : 'Aprobar'}">
                                        <i class="bi bi-check-lg"></i>
                                    </button>
                                    <button onclick="processRequest(${p.id_enrollment}, 'reject', ${courseId}, '${courseName.replace(/'/g, "\\'")}')" style="background:#c0392b; color:white; border:none; padding:8px 15px; border-radius:8px; cursor:pointer; font-size:0.8rem; font-weight:bold;"><i class="bi bi-x-lg"></i></button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <div style="color:rgba(255,255,255,0.4); font-size:0.8rem; margin-bottom:15px; display:flex; align-items:center; gap:8px;">
                    <i class="bi bi-people"></i> ${students.length} estudiante(s) inscrito(s) - Haz clic para ver su horario semanal
                </div>

                <div id="students-accordion-container">
                    ${students.length > 0 ? students.map(e => `
                        <div class="student-accordion-item" data-enrollment-id="${e.id_enrollment}" style="background:rgba(255,255,255,0.02); border:1px solid #222; border-radius:12px; margin-bottom:10px; overflow:hidden;">
                            <div class="student-accordion-header" onclick="toggleStudentAccordion(${e.id_enrollment}, ${courseId})" style="padding:15px 20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='transparent'">
                                <div style="display:flex; align-items:center; gap:15px;">
                                    <i class="bi bi-chevron-right accordion-chevron-${e.id_enrollment}" style="color:#666; transition:transform 0.3s;"></i>
                                    <div>
                                        <div style="color:white; font-weight:600;">${e.full_name}</div>
                                        <div style="color:rgba(255,255,255,0.4); font-size:0.75rem;">${e.email || ''}</div>
                                    </div>
                                </div>
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <i class="bi bi-calendar-week" style="color:rgba(255,255,255,0.3);"></i>
                                    <span style="background:rgba(39, 174, 96, 0.15); color:#27ae60; padding:3px 10px; border-radius:20px; font-size:0.65rem; font-weight:700; text-transform:uppercase;">${e.status}</span>
                                    <button onclick="event.stopPropagation(); unenrollStudentAdmin(${e.id_enrollment}, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" style="background:rgba(231, 76, 60, 0.1); border:none; color:#e74c3c; width:30px; height:30px; border-radius:50%; cursor:pointer; transition:0.3s;" onmouseover="this.style.background='#e74c3c'; this.style.color='white'" onmouseout="this.style.background='rgba(231, 76, 60, 0.1)'; this.style.color='#e74c3c'" title="Desinscribir"><i class="bi bi-trash"></i></button>
                                </div>
                            </div>
                            <div id="student-schedule-${e.id_enrollment}" class="student-schedule-content" style="display:none; padding:10px 20px 20px 20px; border-top:1px solid #222;">
                                <div style="text-align:center; padding:20px; color:#666;"><i class="bi bi-hourglass-split"></i> Cargando horarios...</div>
                            </div>
                        </div>
                    `).join('') : '<div style="color:#444; text-align:center; padding:30px;">No hay estudiantes inscritos aún.</div>'}
                </div>
            </div>

            <div id="tab-schedules" style="display:none;">
                <button onclick="editSchedule(0, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" style="width:100%; padding:15px; background:rgba(255,255,255,0.05); color:white; border:1px dashed #444; border-radius:12px; margin-bottom:20px; cursor:pointer; font-weight:bold; transition:0.3s;" onmouseover="this.style.borderColor='var(--color-acento-azul)'; this.style.color='var(--color-acento-azul)'" onmouseout="this.style.borderColor='#444'; this.style.color='white'">+ Agregar Nuevo Horario</button>
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:15px;">
                    ${schedules.map(s => `
                        <div style="background:rgba(255,255,255,0.03); border:1px solid #222; padding:20px; border-radius:15px; border-left:4px solid var(--color-acento-azul);">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                                <div>
                                    <div style="color:white; font-weight:bold; font-size:1.1rem; text-transform:uppercase;">${s.day}</div>
                                    <div style="color:var(--color-acento-azul); font-size:0.9rem; font-weight:600;">${ApiService.formatTime(s.time_start)} - ${ApiService.formatTime(s.time_end)}</div>
                                </div>
                                <button onclick="editSchedule(${s.id_schedule}, ${courseId}, '${courseName.replace(/'/g, "\\'")}', '${s.day}', '${s.time_start}', '${s.time_end}')" style="background:rgba(255,255,255,0.05); color:#888; border:none; padding:5px 12px; border-radius:50px; cursor:pointer; font-size:0.8rem;">Editar</button>
                            </div>
                            <div style="padding-top:12px; border-top:1px solid #222; display:flex; justify-content:space-between; align-items:center;">
                                <div style="font-size:0.85rem;">
                                    <span style="color:#555; text-transform:uppercase; letter-spacing:1px; font-weight:bold; font-size:0.75rem; display:block; margin-bottom:2px;">Docente Asignado</span>
                                    <span style="color:${s.teacher_name ? 'white' : '#e74c3c'}; font-weight:600;">${s.teacher_name || 'PENDIENTE'}</span>
                                </div>
                                <button onclick="assignTeacherModal(${s.id_schedule}, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" style="background:none; border:1px solid #333; color:white; padding:4px 12px; border-radius:5px; cursor:pointer; font-size:0.75rem;">Cambiar</button>
                            </div>
                        </div>
                    `).join('') || '<div style="color:#444; text-align:center; grid-column:1/-1;">No hay horarios definidos.</div>'}
                </div>
            </div>
        </div>
    `;

    modal.innerHTML = modalContent;

    modal.onclick = function (e) {
        if (e.target === modal) {
            modal.style.opacity = '0';
            setTimeout(() => modal.style.display = 'none', 300);
        }
    };

    setTimeout(() => {
        if (window.switchTab) window.switchTab('tab-enrollments');
    }, 50);
};

window.switchTab = function (tabId) {
    const tabEn = document.getElementById('tab-enrollments');
    const tabSc = document.getElementById('tab-schedules');
    if (!tabEn || !tabSc) return;

    tabEn.style.display = tabId === 'tab-enrollments' ? 'block' : 'none';
    tabSc.style.display = tabId === 'tab-schedules' ? 'block' : 'none';

    const btnEn = document.getElementById('btn-tab-enrollments');
    const btnSc = document.getElementById('btn-tab-schedules');
    if (!btnEn || !btnSc) return;

    if (tabId === 'tab-enrollments') {
        btnEn.style.color = 'var(--color-acento-azul)';
        btnEn.style.background = 'rgba(52, 152, 219, 0.1)';
        btnSc.style.color = '#555';
        btnSc.style.background = 'none';
    } else {
        btnSc.style.color = 'var(--color-acento-azul)';
        btnSc.style.background = 'rgba(52, 152, 219, 0.1)';
        btnEn.style.color = '#555';
        btnEn.style.background = 'none';
    }
};

window.processRequest = async function (id, action, courseId = null, courseName = null, scheduleId = null, teacherId = null) {
    if (action === 'approve' && scheduleId) {
        if (!teacherId || teacherId == 'null' || teacherId == '0') {
            const assignNow = await showConfirm(`Este horario NO tiene un docente asignado.<br><br>¿Deseas asignar uno antes de aprobar?`, "Sí, Asignar", "No, Aprobar así");
            if (assignNow) {
                const assigned = await assignTeacherModal(scheduleId, courseId, courseName);
                if (!assigned) {
                    if (!(await showConfirm("No asignaste docente. ¿Continuar con la aprobación de todas formas?"))) return;
                }
            }
        }
    }

    const confirmMsg = `¿Estás seguro de que deseas ${action === 'approve' ? 'APROBAR' : 'RECHAZAR'} esta solicitud?`;
    if (!(await showConfirm(confirmMsg))) return;

    const res = await ApiService.handleEnrollment(id, action);
    if (res.success) {
        await showToast(res.message || "Solicitud procesada con éxito.", "success");
        if (window.openPendingRequestsCenter) {
            window.openPendingRequestsCenter();
        } else if (courseId && courseName) {
            window.openCourseDetails(courseId, courseName);
        }
    } else {
        showToast("Error: " + res.message, "error");
    }
};

window.unenrollStudentAdmin = async function (enrollmentId, courseId, courseName) {
    if (!(await showConfirm("¿Estás seguro de que deseas desvincular a este estudiante de la materia? Esta acción es irreversible."))) return;
    const res = await ApiService.unenrollStudent(enrollmentId);
    if (res.success) {
        await showToast("Estudiante desvinculado con éxito.", "success");
        window.openCourseDetails(courseId, courseName);
    } else {
        showToast("Error: " + res.message, "error");
    }
};

window.assignTeacherModal = function (scheduleId, courseId, courseName) {
    return new Promise(async (resolve) => {
        const res = await ApiService.getUsers();
        if (!res.success) {
            showToast("Error cargando personal docente.", "error");
            return resolve(false);
        }

        const teachers = res.data.filter(u => u.id_rol == 2);

        const modalId = "assign-teacher-modal";
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = document.createElement("div");
            modal.id = modalId;
            modal.className = "modal-overlay";
            modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:30000; display:flex; justify-content:center; align-items:center; opacity:0; transition:opacity 0.3s;";
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div style="background:#1a1a1a; padding:30px; border-radius:20px; width:90%; max-width:400px; border:1px solid #333; text-align:center;">
                <h3 style="color:white; margin-top:0;">Asignar Docente</h3>
                <p style="color:#666; font-size:0.9rem; margin-bottom:20px;">Selecciona el profesor para este horario.</p>
                
                <select id="select-teacher-final" style="width:100%; padding:12px; background:#222; border:1px solid #444; color:white; border-radius:10px; margin-bottom:25px;">
                    <option value="">-- Sin Asignar / Pendiente --</option>
                    ${teachers.map(t => `<option value="${t.id_usuario}">${t.full_name}</option>`).join('')}
                </select>
                
                <div style="display:flex; gap:10px;">
                    <button id="btn-cancel-assign" style="flex:1; padding:12px; background:#333; color:white; border:none; border-radius:10px; cursor:pointer;">Cancelar</button>
                    <button id="btn-save-assignment" style="flex:1; padding:12px; background:var(--color-acento-azul); color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">Asignar</button>
                </div>
            </div>
        `;
        modal.style.display = "flex";
        setTimeout(() => modal.style.opacity = "1", 10);

        document.getElementById("btn-cancel-assign").onclick = () => {
            modal.remove();
            resolve(false);
        };

        document.getElementById("btn-save-assignment").onclick = async () => {
            const teacherId = document.getElementById("select-teacher-final").value;
            const resAssign = await ApiService.assignTeacher(teacherId, scheduleId);
            if (resAssign.success) {
                await showToast("Docente asignado correctamente.", "success");
                modal.remove();
                if (courseId && courseName) window.openCourseDetails(courseId, courseName);
                resolve(true);
            } else {
                showToast("Error: " + resAssign.message, "error");
            }
        };
    });
};

window.editSchedule = function (scheduleId, courseId, courseName, currentDay = '', currentStart = '', currentEnd = '') {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const title = scheduleId ? 'Editar Horario' : 'Nuevo Horario';

    const modalId = "edit-schedule-modal";
    let modal = document.createElement("div");
    modal.id = modalId;
    modal.className = "modal-overlay";
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:30000; display:flex; justify-content:center; align-items:center; opacity:0; transition:opacity 0.3s;";
    document.body.appendChild(modal);

    modal.innerHTML = `
        <div style="background:#1a1a1a; padding:35px; border-radius:20px; width:90%; max-width:400px; border:1px solid #333;">
            <h3 style="color:white; margin:0 0 25px 0; text-align:center;">${title}</h3>
            
            <div style="margin-bottom:15px;">
                <label style="color:#888; display:block; margin-bottom:8px; font-size:0.85rem;">Día de la semana</label>
                <select id="sched-day-final" style="width:100%; padding:12px; background:#222; border:1px solid #444; color:white; border-radius:10px;">
                    ${days.map(d => `<option value="${d}" ${d === currentDay ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:30px;">
                <div>
                    <label style="color:#888; display:block; margin-bottom:8px; font-size:0.85rem;">Hora Inicio</label>
                    <input type="time" id="sched-start-final" value="${currentStart}" style="width:100%; padding:12px; background:#222; border:1px solid #444; color:white; border-radius:10px;">
                </div>
                <div>
                    <label style="color:#888; display:block; margin-bottom:8px; font-size:0.85rem;">Hora Fin</label>
                    <input type="time" id="sched-end-final" value="${currentEnd}" style="width:100%; padding:12px; background:#222; border:1px solid #444; color:white; border-radius:10px;">
                </div>
            </div>
            
            <div style="display:flex; gap:10px;">
                <button onclick="document.getElementById('${modalId}').remove()" style="flex:1; padding:12px; background:#333; color:white; border:none; border-radius:10px; cursor:pointer;">Cancelar</button>
                <button id="btn-save-sched-final" style="flex:1; padding:12px; background:var(--color-acento-naranja); color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">Guardar</button>
            </div>
        </div>
    `;
    modal.style.display = "flex";
    setTimeout(() => modal.style.opacity = "1", 10);

    document.getElementById("btn-save-sched-final").onclick = async () => {
        const day = document.getElementById("sched-day-final").value;
        const start = document.getElementById("sched-start-final").value;
        const end = document.getElementById("sched-end-final").value;

        if (!start || !end) return showToast("Por favor define el horario completo.", "warning");

        const payload = {
            id_schedule: scheduleId,
            course_id: courseId,
            day: day,
            time_start: start,
            time_end: end
        };

        const resSched = await ApiService.updateSchedule(payload);
        if (resSched.success) {
            await showToast("Horario guardado con éxito.", "success");
            modal.remove();
            window.openCourseDetails(courseId, courseName);
        } else {
            showToast("Error: " + resSched.message, "error");
        }
    };
};

window.assignStudentSchedule = async function (enrollmentId, courseId, courseName) {
    const res = await ApiService.getSchedules(courseId);
    if (!res.success) return showToast("Error cargando horarios", "error");
    const schedules = res.data;

    const existingRes = await ApiService.getEnrollmentSchedules(enrollmentId);
    const existingIds = existingRes.success ? existingRes.data.map(s => s.id_schedule) : [];

    const modalId = "assign-student-sched-modal";
    let modal = document.createElement("div");
    modal.id = modalId;
    modal.className = "modal-overlay";
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:30000; display:flex; justify-content:center; align-items:center; opacity:0; transition:opacity 0.3s;";
    document.body.appendChild(modal);

    modal.innerHTML = `
        <div style="background:#1a1a1a; padding:30px; border-radius:20px; width:90%; max-width:500px; border:1px solid #333; max-height:80vh; display:flex; flex-direction:column;">
            <h3 style="color:white; margin:0 0 10px 0; text-align:center;">Asignar Horario</h3>
            <p style="color:#666; font-size:0.9rem; text-align:center; margin-bottom:20px;">Selecciona el horario para el estudiante.</p>
            
            <div style="overflow-y:auto; flex:1; margin-bottom:20px; padding-right:5px;" class="custom-scroll">
                ${schedules.map(s => `
                    <label style="display:flex; align-items:center; gap:15px; padding:15px; background:rgba(255,255,255,0.03); border:1px solid #333; border-radius:10px; margin-bottom:10px; cursor:pointer; transition:0.2s;">
                        <input type="radio" name="sched_selection" value="${s.id_schedule}" ${existingIds.includes(s.id_schedule) ? 'checked' : ''} style="width:20px; height:20px; accent-color:var(--color-acento-azul);">
                        <div style="flex:1;">
                            <div style="color:white; font-weight:bold;">${s.day}</div>
                            <div style="color:#888; font-size:0.85rem;">${ApiService.formatTime(s.time_start)} - ${ApiService.formatTime(s.time_end)}</div>
                            <div style="color:${s.teacher_name ? '#aaa' : '#e74c3c'}; font-size:0.75rem;">${s.teacher_name ? 'Docente: ' + s.teacher_name : 'Sin Docente'}</div>
                        </div>
                    </label>
                `).join('') || '<div style="color:#666; text-align:center;">No hay horarios disponibles en este curso.</div>'}
            </div>
            
            <div style="display:flex; gap:10px;">
                <button onclick="document.getElementById('${modalId}').remove()" style="flex:1; padding:12px; background:#333; color:white; border:none; border-radius:10px; cursor:pointer;">Cancelar</button>
                <button id="btn-save-student-sched" style="flex:1; padding:12px; background:var(--color-acento-azul); color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">Guardar Asignación</button>
            </div>
        </div>
    `;

    modal.style.display = "flex";
    setTimeout(() => modal.style.opacity = "1", 10);

    setTimeout(() => {
        const saveBtn = document.getElementById("btn-save-student-sched");
        if (!saveBtn) return;

        saveBtn.onclick = async () => {
            const selected = document.querySelector('input[name="sched_selection"]:checked');
            if (!selected) return showToast("Selecciona un horario.", "warning");

            const scheduleId = selected.value;
            saveBtn.disabled = true;
            saveBtn.textContent = "Guardando...";

            try {
                const resAssign = await ApiService.assignSchedules(enrollmentId, [scheduleId]);
                if (resAssign.success) {
                    await showToast("Horario asignado e inscripción completada.", "success");
                    modal.remove();
                    if (window.checkPendingRequests) window.checkPendingRequests();
                    if (window.loadCourses) window.loadCourses();
                    window.openCourseDetails(courseId, courseName);
                } else {
                    showToast("Error: " + resAssign.message, "error");
                    saveBtn.disabled = false;
                    saveBtn.textContent = "Guardar Asignación";
                }
            } catch (error) {
                showToast("Error inesperado al guardar.", "error");
                saveBtn.disabled = false;
                saveBtn.textContent = "Guardar Asignación";
            }
        };
    }, 100);
};

// Helper to close course details modal
window.closeCourseDetailsModal = function () {
    const modal = document.getElementById("admin-courses-modal");
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.style.display = 'none', 300);
    }
};

// Toggle student accordion and load weekly calendar with schedules
window.toggleStudentAccordion = async function (enrollmentId, courseId) {
    const content = document.getElementById(`student-schedule-${enrollmentId}`);
    const chevron = document.querySelector(`.accordion-chevron-${enrollmentId}`);

    if (!content) return;

    // Toggle visibility
    if (content.style.display === 'none' || content.style.display === '') {
        // Expand
        content.style.display = 'block';
        if (chevron) chevron.style.transform = 'rotate(90deg)';

        // Load schedules
        content.innerHTML = '<div style="text-align:center; padding:20px; color:#666;"><i class="bi bi-hourglass-split"></i> Cargando horarios...</div>';

        try {
            const res = await ApiService.getEnrollmentSchedules(enrollmentId);
            const allSchedulesRes = await ApiService.getSchedules(courseId);

            const assignedSchedules = res.success ? res.data : [];
            const allSchedules = allSchedulesRes.success ? allSchedulesRes.data : [];

            // Days of week for calendar
            const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

            // Group schedules by day
            const schedulesByDay = {};
            daysOfWeek.forEach(day => schedulesByDay[day] = []);

            assignedSchedules.forEach(s => {
                if (schedulesByDay[s.day]) {
                    schedulesByDay[s.day].push(s);
                }
            });

            // Build weekly calendar grid
            const calendarHtml = `
                <div style="margin-top:15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <span style="color:white; font-weight:600; font-size:0.9rem;"><i class="bi bi-calendar-week" style="margin-right:8px; color:var(--color-acento-azul);"></i>Horario Semanal</span>
                        <button onclick="editStudentSchedules(${enrollmentId}, ${courseId})" style="background:rgba(255,255,255,0.05); border:1px solid #333; color:white; padding:5px 12px; border-radius:8px; font-size:0.75rem; cursor:pointer;"><i class="bi bi-pencil"></i> Editar</button>
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:8px; text-align:center;">
                        ${daysOfWeek.map(day => {
                const daySchedules = schedulesByDay[day] || [];
                const hasSchedule = daySchedules.length > 0;
                return `
                                <div style="background:${hasSchedule ? 'rgba(52, 152, 219, 0.15)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${hasSchedule ? 'rgba(52, 152, 219, 0.3)' : '#222'}; border-radius:10px; padding:10px 5px; min-height:80px;">
                                    <div style="color:${hasSchedule ? 'var(--color-acento-azul)' : '#555'}; font-size:0.7rem; font-weight:bold; text-transform:uppercase; margin-bottom:8px; letter-spacing:0.5px;">${day.substring(0, 3)}</div>
                                    ${hasSchedule ? daySchedules.map(s => `
                                        <div style="background:rgba(52, 152, 219, 0.2); padding:6px 4px; border-radius:6px; margin-bottom:4px;">
                                            <div style="color:white; font-size:0.7rem; font-weight:600;">${ApiService.formatTime(s.time_start)}</div>
                                            <div style="color:#aaa; font-size:0.6rem;">${ApiService.formatTime(s.time_end)}</div>
                                        </div>
                                    `).join('') : '<div style="color:#444; font-size:0.65rem; padding:10px 0;">—</div>'}
                                </div>
                            `;
            }).join('')}
                    </div>
                    ${assignedSchedules.length === 0 ? '<div style="text-align:center; color:var(--color-acento-naranja); font-size:0.8rem; margin-top:15px; padding:10px; background:rgba(255, 159, 67, 0.1); border-radius:8px;"><i class="bi bi-exclamation-triangle"></i> Este estudiante no tiene horarios asignados</div>' : ''}
                </div>
            `;

            content.innerHTML = calendarHtml;

        } catch (e) {
            console.error(e);
            content.innerHTML = '<div style="color:#e74c3c; text-align:center; padding:20px;">Error cargando horarios</div>';
        }
    } else {
        // Collapse
        content.style.display = 'none';
        if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
};

// Edit student schedules modal
window.editStudentSchedules = async function (enrollmentId, courseId) {
    // Reuse existing assignStudentSchedule function
    if (window.assignStudentSchedule) {
        // Get course name from modal
        const modal = document.getElementById("admin-courses-modal");
        const courseName = modal ? modal.querySelector('h2')?.textContent || 'Curso' : 'Curso';
        await window.assignStudentSchedule(enrollmentId, courseId, courseName);
    }
};
