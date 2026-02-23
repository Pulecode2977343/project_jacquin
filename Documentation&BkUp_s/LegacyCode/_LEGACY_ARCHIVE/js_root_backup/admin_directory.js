/**
 * Admin Directory Logic
 * Unified script for managing Admins, Teachers, and Users in a 3-column view.
 */

document.addEventListener("DOMContentLoaded", async () => {
    if (!window.ApiService || !window.ApiService.isAuthenticated()) return;
    const user = window.ApiService.getSession();
    if (user.id_rol != 1) return;

    loadDirectory();
});

window.allUsers = [];
// allUsers used to be declared here; removed to avoid SyntaxError with 'let' redeclaration.

window.loadDirectory = async function () {
    const listAdmins = document.getElementById("list-admins");
    const listTeachers = document.getElementById("list-teachers");
    const listUsers = document.getElementById("list-users"); // Students/Others

    if (!listAdmins) return;

    // Show loading
    const loadingHTML = '<div style="text-align:center; padding:20px; color:#aaa;">Cargando...</div>';
    listAdmins.innerHTML = loadingHTML;
    listTeachers.innerHTML = loadingHTML;
    listUsers.innerHTML = loadingHTML;

    const response = await ApiService.getUsers();
    if (response.success && response.data) {
        window.allUsers = response.data;
        // allUsers = response.data; // Removed redundant/unsafe assignment

        // separate
        const admins = window.allUsers.filter(u => u.id_rol == 1);
        const teachers = window.allUsers.filter(u => u.id_rol == 2);
        const others = window.allUsers.filter(u => u.id_rol != 1 && u.id_rol != 2);

        renderList(listAdmins, admins, "bi-shield-lock");
        renderList(listTeachers, teachers, "bi-person-video3");
        renderList(listUsers, others, "bi-people");
    } else {
        listAdmins.innerHTML = `<div style="color:red; padding:20px;">Error: ${response.message || "Fallo de conexión"}</div>`;
        console.error("Directory Load Error:", response);
    }
};

function renderList(container, users, icon) {
    if (users.length === 0) {
        container.innerHTML = '<div style="opacity:0.5; text-align:center; padding:20px;">Vacío</div>';
        return;
    }

    container.innerHTML = "";
    users.forEach(u => {
        const item = document.createElement("div");
        item.className = "directory-item";
        item.onclick = () => openProfile(u.id_usuario);

        const alertHtml = (u.alert_count && u.alert_count > 0)
            ? `<i class="bi bi-exclamation-circle-fill" style="color:var(--color-acento-naranja); font-size:0.9rem; margin-left:auto; animation:pulse-alert 2s infinite;" title="Acción Requerida: Asignar Docente"></i>`
            : '';

        item.innerHTML = `
            <i class="bi ${icon}" style="color:var(--color-acento-azul);"></i>
            <span>${u.full_name}</span>
            ${alertHtml}
        `;
        container.appendChild(item);
    });
}


// ================= MODAL LOGIC (Shared in user_profile_modal.js) =================
// Note: openProfile, switchUserTab, etc. are now in js/user_profile_modal.js



// Student Enrollment UI
window.enrollStudentDirect = async function (user) {
    const coursesContainer = document.getElementById("modal-courses");
    coursesContainer.innerHTML = '<div style="color:#aaa;">Cargando cursos disponibles...</div>';

    try {
        const res = await ApiService.getCourses();
        if (res.success && res.data) {
            const courses = res.data;

            // Step 1: Select Course
            renderCourseSelector(coursesContainer, courses, "Siguiente: Elegir Horario", (courseId) => {
                const selectedCourse = courses.find(c => c.id == courseId);

                if (!selectedCourse || !selectedCourse.schedules || selectedCourse.schedules.length === 0) {
                    showToast("Este curso no tiene horarios disponibles.", "warning");
                    return;
                }

                // Step 2: Select Schedule
                renderScheduleSelector(coursesContainer, selectedCourse, async (scheduleId) => {
                    const enrollRes = await ApiService.enrollStudent(user.id_usuario, courseId, scheduleId);
                    if (enrollRes.success) {
                        await showToast("Inscripción exitosa.", "success");
                        openProfile(user.id_usuario);
                    } else {
                        showToast(enrollRes.message, "error");
                        openProfile(user.id_usuario);
                    }
                }, () => openProfile(user.id_usuario));

            }, () => openProfile(user.id_usuario));

        } else {
            showToast("No se pudieron cargar los cursos", "error");
            openProfile(user.id_usuario);
        }
    } catch (e) {
        console.error(e);
        showToast("Error de conexión", "error");
        openProfile(user.id_usuario);
    }
};

// Teacher Assignment UI
window.assignTeacherDirect = async function (user) {
    const coursesContainer = document.getElementById("modal-courses");
    coursesContainer.innerHTML = '<div style="color:#aaa;">Cargando cursos disponibles...</div>';

    try {
        const res = await ApiService.getCourses();
        if (res.success && res.data) {
            const courses = res.data;
            renderCourseSelector(coursesContainer, courses, "Asignar Docente", async (courseId) => {
                const assignRes = await ApiService.assignTeacher(user.id_usuario, courseId);
                if (assignRes.success) {
                    await showToast("¡Docente asignado!", "success");
                    openProfile(user.id_usuario);
                } else {
                    showToast(assignRes.message, "error");
                }
            }, () => openProfile(user.id_usuario));
        } else {
            showToast("No se pudieron cargar los cursos", "error");
            openProfile(user.id_usuario);
        }
    } catch (e) {
        console.error(e);
        showToast("Error de conexión", "error");
        openProfile(user.id_usuario);
    }
};

function renderScheduleSelector(container, course, onConfirm, onCancel) {
    let html = `
        <div style="background:#222; padding:15px; border-radius:10px; border:1px solid #444;">
            <h4 style="color:white; margin-bottom:10px;">Horarios: ${course.name}</h4>
            <p style="font-size:0.85rem; color:#888;">Máximo 15 estudiantes por grupo.</p>
            <select id="schedule-selector" class="form-control" style="width:100%; margin-bottom:15px; background:#333; border:none; color:white; padding:10px;">
                <option value="">-- Elige un Horario --</option>
                ${course.schedules.map(s => {
        const days = { 'Monday': 'Lunes', 'Tuesday': 'Martes', 'Wednesday': 'Miércoles', 'Thursday': 'Jueves', 'Friday': 'Viernes', 'Saturday': 'Sábado', 'Sunday': 'Domingo' };
        const dayName = days[s.day_of_week] || s.day_of_week;
        // Handle id_schedule vs id difference if any
        const sId = s.id_schedule || s.id;
        return `<option value="${sId}">${dayName} ${ApiService.formatTime(s.start_time)} - ${ApiService.formatTime(s.end_time)}</option>`;
    }).join('')}
            </select>
            <div style="display:flex; gap:10px;">
                <button id="btn-confirm-schedule" class="btn-module" style="background:var(--color-acento-azul); color:black;">Confirmar Inscripción</button>
                <button id="btn-cancel-schedule" class="btn-module" style="background:#444;">Cancelar</button>
            </div>
        </div>
    `;
    container.innerHTML = html;

    document.getElementById("btn-cancel-schedule").onclick = onCancel;
    document.getElementById("btn-confirm-schedule").onclick = () => {
        const select = document.getElementById("schedule-selector");
        const val = select.value;
        if (!val) return showToast("Selecciona un horario", "warning");
        onConfirm(val);
    };
}

function renderCourseSelector(container, courses, btnText, onConfirm, onCancel) {
    let html = `
        <div style="background:#222; padding:15px; border-radius:10px; border:1px solid #444;">
            <h4 style="color:white; margin-bottom:10px;">Selecciona un Curso</h4>
            <select id="course-selector" class="form-control" style="width:100%; margin-bottom:15px; background:#333; border:none; color:white; padding:10px;">
                <option value="">-- Elige Curso --</option>
                ${courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
            <div style="display:flex; gap:10px;">
                <button id="btn-confirm-selection" class="btn-module" style="background:var(--color-acento-azul); color:black;">${btnText}</button>
                <button id="btn-cancel-selection" class="btn-module" style="background:#444;">Cancelar</button>
            </div>
        </div>
    `;
    container.innerHTML = html;

    document.getElementById("btn-cancel-selection").onclick = onCancel;
    document.getElementById("btn-confirm-selection").onclick = () => {
        const select = document.getElementById("course-selector");
        const val = select.value;
        if (!val) return showToast("Selecciona un curso", "warning");
        onConfirm(val);
    };
}

function createCourseCard(course, roleLabel, color, onDelete, onAssign, onManageSchedules = null) {
    let schedBadges = '';
    if (course.schedules && course.schedules.length > 0) {
        schedBadges = course.schedules.map(s =>
            `<span style="background:var(--color-acento-azul); color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem; display:inline-block; margin-right:5px; margin-bottom:2px;">
                ${s.day_of_week} ${ApiService.formatTime(s.start_time)}-${ApiService.formatTime(s.end_time)}
             </span>`
        ).join('');
    } else {
        schedBadges = '<span style="color:gray; font-size:0.75rem;">Sin horario</span>';
    }

    const teacherDisplay = course.teacher_name ? `<div style="font-size:0.8rem; color:#aaa; margin-top:2px;"><i class="bi bi-person-video3"></i> ${course.teacher_name}</div>` : '';

    const item = document.createElement("div");
    item.style.background = "rgba(255,255,255,0.05)";
    item.style.padding = "10px";
    item.style.borderRadius = "8px";
    item.style.marginBottom = "8px";
    item.style.display = "flex";
    item.style.justifyContent = "space-between";
    item.style.alignItems = "center";

    // Warning Styling if action needed
    if (onAssign) {
        item.style.border = "1px solid var(--color-acento-naranja)";
        item.style.boxShadow = "0 0 10px rgba(230, 126, 34, 0.1)";
    }

    const infoDiv = document.createElement("div");
    infoDiv.innerHTML = `
        <div style="color:${color}; font-weight:bold; display:flex; align-items:center; gap:5px;">
            ${course.name} ${onAssign ? '<i class="bi bi-exclamation-triangle-fill" style="color:var(--color-acento-naranja); font-size:0.8rem;" title="Requiere Atención"></i>' : ''}
        </div>
        <div style="margin-top:4px;">${schedBadges}</div>
        ${teacherDisplay}
        <div style="color:#666; font-size:0.75rem; margin-top:2px;">${roleLabel}</div>
    `;
    item.appendChild(infoDiv);

    const actionDiv = document.createElement("div");
    actionDiv.style.display = "flex";
    actionDiv.style.flexDirection = "column";
    actionDiv.style.gap = "5px";

    // Manage Multi-Schedule Button (Admin only for students)
    if (onManageSchedules) {
        const schedBtn = document.createElement("button");
        schedBtn.innerHTML = '<i class="bi bi-calendar2-week"></i>';
        schedBtn.title = "Gestionar Horarios";
        schedBtn.style.background = "rgba(155, 89, 182, 0.3)";
        schedBtn.style.color = "#9b59b6";
        schedBtn.style.border = "1px solid #9b59b6";
        schedBtn.style.borderRadius = "5px";
        schedBtn.style.padding = "5px 10px";
        schedBtn.style.cursor = "pointer";
        schedBtn.onclick = onManageSchedules;
        actionDiv.appendChild(schedBtn);
    }

    if (onAssign) {
        const assignBtn = document.createElement("button");
        assignBtn.innerHTML = '<i class="bi bi-person-plus-fill"></i>';
        assignBtn.title = "Asignar Docente";
        assignBtn.style.background = "var(--color-acento-azul)";
        assignBtn.style.color = "white"; // White icon
        assignBtn.style.border = "2px solid rgba(255,255,255,0.2)"; // Stronger border
        assignBtn.style.borderRadius = "5px";
        assignBtn.style.padding = "5px 10px";
        assignBtn.style.cursor = "pointer";
        assignBtn.style.animation = "pulse-alert 2s infinite"; // Add pulse animation
        assignBtn.onclick = onAssign;
        actionDiv.appendChild(assignBtn);
    }

    if (onDelete) {
        const delBtn = document.createElement("button");
        delBtn.innerHTML = '<i class="bi bi-trash"></i>';
        delBtn.title = "Desinscribir";
        delBtn.style.background = "rgba(231, 76, 60, 0.2)";
        delBtn.style.color = "#e74c3c";
        delBtn.style.border = "none";
        delBtn.style.borderRadius = "5px";
        delBtn.style.padding = "5px 10px";
        delBtn.style.cursor = "pointer";
        delBtn.onclick = onDelete;
        actionDiv.appendChild(delBtn);
    }

    item.appendChild(actionDiv);

    return item;
}

// ================= MULTI-SCHEDULE MODAL =================

async function openMultiScheduleModal(course, userId) {
    // Fetch all available schedules for this course
    const schedRes = await ApiService.getSchedules(course.id_course || course.id);
    if (!schedRes.success || !schedRes.data) {
        showToast("Error cargando horarios del curso", "error");
        return;
    }

    const allSchedules = schedRes.data;

    // Get currently assigned schedules for this enrollment
    const enrolledRes = await ApiService.getEnrollmentSchedules(course.id_enrollment);
    const assignedIds = (enrolledRes.success && enrolledRes.data)
        ? enrolledRes.data.map(s => s.id_schedule)
        : [];

    // Create modal
    let modal = document.getElementById('multi-schedule-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'multi-schedule-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); z-index: 10003; display: flex;
        justify-content: center; align-items: center; backdrop-filter: blur(5px);
    `;
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    const days = { 'Monday': 'Lunes', 'Tuesday': 'Martes', 'Wednesday': 'Miércoles', 'Thursday': 'Jueves', 'Friday': 'Viernes', 'Saturday': 'Sábado', 'Sunday': 'Domingo' };

    const scheduleCheckboxes = allSchedules.map(s => {
        const sId = s.id_schedule || s.id;
        const dayName = days[s.day_of_week] || s.day_of_week;
        const isChecked = assignedIds.includes(sId);
        const avail = (s.quota || 15) - (s.enrolled_count || 0);
        const full = avail <= 0 && !isChecked;
        const borderColor = isChecked ? 'rgba(46, 204, 113, 0.3)' : 'rgba(255,255,255,0.1)';

        return `
            <label class="multi-sched-label" data-full="${full}" data-border="${borderColor}" style="
                display: flex; align-items: center; gap: 12px; padding: 12px;
                background: ${isChecked ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255,255,255,0.03)'};
                border: 1px solid ${borderColor};
                border-radius: 8px; margin-bottom: 8px; cursor: ${full ? 'not-allowed' : 'pointer'};
                opacity: ${full ? '0.5' : '1'}; transition: all 0.2s;
            ">
                <input type="checkbox" name="schedule" value="${sId}" 
                    ${isChecked ? 'checked' : ''} ${full ? 'disabled' : ''}
                    style="width: 20px; height: 20px; accent-color: var(--color-acento-azul);">
                <div style="flex: 1;">
                    <div style="color: white; font-weight: 500;">${dayName}</div>
                    <div style="color: #888; font-size: 0.85rem;">${ApiService.formatTime(s.start_time)} - ${ApiService.formatTime(s.end_time)}</div>
                </div>
                <span style="
                    background: ${full ? 'rgba(231, 76, 60, 0.2)' : 'rgba(52, 152, 219, 0.2)'};
                    color: ${full ? '#e74c3c' : 'var(--color-acento-azul)'};
                    padding: 4px 10px; border-radius: 12px; font-size: 0.75rem;
                ">${full ? 'Lleno' : `${avail} disponible${avail !== 1 ? 's' : ''}`}</span>
            </label>
        `;
    }).join('');

    modal.innerHTML = `
        <div style="background: #1a1a1a; width: 90%; max-width: 500px; border-radius: 15px; overflow: hidden; border: 1px solid #333; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);">
            <div style="background: linear-gradient(135deg, rgba(155, 89, 182, 0.8), rgba(142, 68, 173, 0.8)); padding: 25px; color: white;">
                <h2 style="margin: 0 0 5px; font-size: 1.3rem;"><i class="bi bi-calendar2-week"></i> Gestionar Horarios</h2>
                <p style="margin: 0; opacity: 0.8; font-size: 0.9rem;">${course.name}</p>
            </div>
            
            <div style="padding: 25px; max-height: 400px; overflow-y: auto;">
                <p style="color: #888; font-size: 0.9rem; margin: 0 0 15px;">
                    Selecciona los días que el estudiante asistirá a clase:
                </p>
                <div id="schedule-checkboxes">
                    ${scheduleCheckboxes || '<p style="color: #666;">No hay horarios disponibles para este curso.</p>'}
                </div>
            </div>
            
            <div style="padding: 20px; border-top: 1px solid #333; display: flex; gap: 10px;">
                <button onclick="document.getElementById('multi-schedule-modal').remove()" 
                    style="flex: 1; padding: 12px; background: #333; border: none; color: white; border-radius: 8px; cursor: pointer;">
                    Cancelar
                </button>
                <button id="btn-save-schedules" 
                    style="flex: 2; padding: 12px; background: var(--color-acento-azul); border: none; color: white; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    <i class="bi bi-check-circle"></i> Guardar Cambios
                </button>
            </div>
        </div>
    `;

    // Add hover effects after modal is in DOM
    setTimeout(() => {
        modal.querySelectorAll('.multi-sched-label').forEach(label => {
            if (label.dataset.full !== 'true') {
                label.addEventListener('mouseenter', () => {
                    label.style.borderColor = 'var(--color-acento-azul)';
                });
                label.addEventListener('mouseleave', () => {
                    label.style.borderColor = label.dataset.border;
                });
            }
        });
    }, 0);

    document.body.appendChild(modal);

    // Save handler
    document.getElementById('btn-save-schedules').onclick = async () => {
        const checkboxes = modal.querySelectorAll('input[name="schedule"]:checked');
        const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

        if (selectedIds.length === 0) {
            showToast("Debes seleccionar al menos un horario", "warning");
            return;
        }

        try {
            const result = await ApiService.assignSchedules(course.id_enrollment, selectedIds);
            if (result.success) {
                showToast(`Horarios actualizados: ${selectedIds.length} día(s) asignado(s)`, "success");
                modal.remove();
                openProfile(userId);
            } else {
                showToast(result.message || "Error guardando horarios", "error");
            }
        } catch (e) {
            showToast("Error de conexión", "error");
        }
    };
}

function createBtn(text, iconClass, onClick, isDanger = false) {
    const btn = document.createElement("button");
    btn.className = "btn-module";
    btn.style.width = "100%";
    btn.style.marginBottom = "10px";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.gap = "10px";
    btn.style.justifyContent = "center";

    if (isDanger) {
        btn.style.borderColor = "#e74c3c";
        btn.style.color = "#e74c3c";
    }

    btn.innerHTML = `<i class="bi ${iconClass}"></i> ${text}`;
    btn.onclick = onClick;
    return btn;
}

window.closeModal = function () {
    document.getElementById("user-profile-modal").style.display = "none";
};

// ================= ACTIONS =================

function getRoleName(id) {
    const map = { 1: "Administrador", 2: "Docente", 3: "Estudiante", 4: "Aspirante", 5: "Colaborador" };
    return map[id] || "Desconocido";
}

async function changeRoleDirect(targetUser) {
    const { value: newRole } = await Swal.fire({
        title: `Cambiar rol a ${targetUser.full_name} `,
        input: 'select',
        inputOptions: {
            '1': 'Admin',
            '2': 'Docente',
            '3': 'Estudiante',
            '4': 'Aspirante',
            '5': 'Colaborador'
        },
        inputPlaceholder: 'Selecciona un rol',
        showCancelButton: true,
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: 'var(--color-acento-azul)'
    });

    if (newRole) {
        // Redundant check for safety if target is admin
        if (targetUser.id_rol == 1) {
            const confirmAdmin = await Swal.fire({
                title: '¿Estás seguro?',
                text: "Estás quitando privilegios a otro Administrador.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, cambiar',
                background: '#1a1a1a',
                color: '#fff'
            });
            if (!confirmAdmin.isConfirmed) return;
        }

        const result = await ApiService.updateUserRole(targetUser.id_usuario, newRole);
        if (result.success) {
            await showToast("El rol ha sido actualizado correctamente.", "success");
            closeModal();
            loadDirectory();
        } else {
            showToast(result.message, "error");
        }
    }
}

async function deleteUserDirect(targetUser) {
    const isTargetAdmin = targetUser.id_rol == 1;
    const msg = isTargetAdmin
        ? `Estás intentando ELIMINAR a otro ADMINISTRADOR(${targetUser.full_name}). ¿Confirmas esta acción destructiva ? `
        : `¿Eliminar a ${targetUser.full_name}? Esta acción es irreversible.`;

    if (await showConfirm(msg, 'Sí, eliminar', 'Cancelar')) {
        const resultApi = await ApiService.deleteUser(targetUser.id_usuario);
        if (resultApi.success) {
            await showToast("El usuario ha sido borrado del sistema.", "success");
            closeModal();
            loadDirectory();
        } else {
            showToast(resultApi.message, "error");
        }
    }
}

// Re-implement goToAssign here or rely on the previous logic if copied
// Re-implement goToAssign to redirect
window.goToAssign = function (userId) {
    window.location.href = `admin_academic.html ? teacher_id = ${userId} `;
};


// Close modal when clicking outside
window.addEventListener("click", function (event) {
    const modal = document.getElementById("user-profile-modal");
    if (modal && event.target == modal) {
        closeModal();
    }
});
