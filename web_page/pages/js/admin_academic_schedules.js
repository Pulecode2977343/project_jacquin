document.addEventListener('DOMContentLoaded', () => {
    // 0. Security Check
    if (!window.ApiService || !window.ApiService.isAuthenticated()) return;
    const user = window.ApiService.getSession();
    if (user.id_rol != 1) return;

    loadTeachers();
    loadCourses();

    // 1. Create Course Handler
    const createCourseForm = document.getElementById('createCourseForm');
    if (createCourseForm) {
        createCourseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            try {
                const res = await fetch(`${ApiService.BASE_URL}create_course.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if (result.success) {
                    Swal.fire({
                        title: "¡Éxito!",
                        text: 'Curso creado correctamente',
                        icon: "success",
                        background: '#1a1a1a',
                        color: '#fff'
                    });
                    e.target.reset();
                    loadCourses();
                } else {
                    Swal.fire({
                        title: "Error",
                        text: result.message,
                        icon: "error",
                        background: '#1a1a1a',
                        color: '#fff'
                    });
                }
            } catch (error) {
                console.error(error);
                Swal.fire({
                    title: "Error",
                    text: 'Error al crear curso',
                    icon: "error",
                    background: '#1a1a1a',
                    color: '#fff'
                });
            }
        });
    }

    // 2. Assign Schedule Handler
    const assignScheduleForm = document.getElementById('assignScheduleForm');
    if (assignScheduleForm) {
        assignScheduleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            try {
                const res = await fetch(`${ApiService.BASE_URL}assign_schedule.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if (result.success) {
                    Swal.fire({
                        title: "¡Éxito!",
                        text: 'Horario asignado correctamente',
                        icon: "success",
                        background: '#1a1a1a',
                        color: '#fff'
                    });
                    e.target.reset();
                    loadCourses();
                } else {
                    Swal.fire({
                        title: "Error",
                        text: result.message,
                        icon: "error",
                        background: '#1a1a1a',
                        color: '#fff'
                    });
                }
            } catch (error) {
                console.error(error);
                Swal.fire({
                    title: "Error",
                    text: 'Error al asignar horario',
                    icon: "error",
                    background: '#1a1a1a',
                    color: '#fff'
                });
            }
        });
    }
});

async function loadTeachers() {
    const teacherSelect = document.getElementById('teacherSelect');
    if (!teacherSelect) return; // Skip if element doesn't exist on this page

    try {
        const res = await ApiService.getUsers();
        if (res.success && res.data) {
            const teachers = res.data.filter(u => u.id_rol == 2);
            teacherSelect.innerHTML = '<option value="">Selecciona Docente</option>' +
                teachers.map(t => `<option value="${t.id_usuario}">${t.full_name}</option>`).join('');
        }
    } catch (e) {
        console.error('Error loading teachers', e);
    }
}

async function loadCourses() {
    const list = document.getElementById('courseList');
    const select = document.getElementById('courseSelect');
    if (!list && !select) return; // Skip if elements don't exist on this page

    try {
        const res = await ApiService.getCourses();

        if (res.success && res.data) {
            const courses = res.data;
            if (select) {
                select.innerHTML = '<option value="">Selecciona Curso</option>' +
                    courses.map(c => `<option value="${c.id_course}">${c.name}</option>`).join('');
            }

            if (list) {
                list.innerHTML = courses.map(c => `
                    <div class="course-item" style="position:relative;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div>
                                <strong style="color:var(--color-acento-naranja); font-size:1.1rem; display:block;">${c.name}</strong>
                                <div style="margin-top:4px; display:flex; align-items:center; gap:8px;">
                                    <span style="color:white; opacity:0.7; font-size:0.9rem;">Prof: <span style="color:white; font-weight:500;">${c.teacher_name || 'Sin asignar'}</span></span>
                                    <button onclick="openTeacherModal(${c.id_course}, '${c.name.replace(/'/g, "\\'")}', ${c.teacher_id || 'null'})" style="background:none; border:none; color:var(--color-acento-azul); cursor:pointer; padding:0;" title="Cambiar Profesor">
                                        <i class="bi bi-pencil-square"></i>
                                    </button>
                                </div>
                            </div>
                            <button onclick="deleteCourse(${c.id_course}, '${c.name.replace(/'/g, "\\'")}')" style="background:none; border:none; color:#e74c3c; cursor:pointer;" title="Eliminar Curso">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </div>
                        <p style="color:var(--color-humo-gris); font-size:0.9rem; margin:5px 0;">${c.description || ''}</p>
                        <div style="margin-top:10px;">
                            ${c.schedules && c.schedules.length > 0 ? c.schedules.map(s =>
                    `<span class="schedule-badge"><i class="bi bi-clock"></i> ${s.day_of_week}: ${formatTime(s.start_time)} - ${formatTime(s.end_time)}</span>`
                ).join(' ') : '<span style="color:gray; font-size:0.8rem;">Sin horarios asignados</span>'}
                        </div>
                    </div>
                `).join('');
            }
        } else {
            if (list) list.innerHTML = '<div style="color:white; padding:1rem;">No hay cursos creados.</div>';
            if (select) select.innerHTML = '<option value="">No hay cursos disponibles</option>';
        }
    } catch (e) {
        console.error(e);
        const courseList = document.getElementById('courseList');
        if (courseList) courseList.innerHTML = 'Error de conexión.';
    }
}

function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
}

window.deleteCourse = async function (courseId, courseName) {
    Swal.fire({
        title: `¿Eliminar el curso "${courseName}"?`,
        text: "Se borrarán los horarios asociados. Esta acción es irreversible.",
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
            const res = await ApiService.deleteCourse(courseId);
            if (res.success) {
                Swal.fire({
                    title: "¡Eliminado!",
                    text: "Curso eliminado correctamente.",
                    icon: "success",
                    background: '#1a1a1a',
                    color: '#fff'
                });
                loadCourses();
            }
            else {
                Swal.fire({
                    title: "Error",
                    text: res.message,
                    icon: "error",
                    background: '#1a1a1a',
                    color: '#fff'
                });
            }
        }
    });
}

window.openTeacherModal = async function (courseId, courseName, currentTeacherId) {
    let modal = document.getElementById('teacher-modal');
    if (modal) modal.remove();
    const res = await ApiService.getUsers();
    const teachers = (res.success && res.data) ? res.data.filter(u => u.id_rol == 2) : [];
    modal = document.createElement('div');
    modal.id = 'teacher-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:10000; display:flex; justify-content:center; align-items:center;";
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
        <div style="background:#1e1e1e; padding:30px; border-radius:15px; width:90%; max-width:400px; border:1px solid rgba(255,255,255,0.1);">
            <h3 style="color:white; margin-top:0;">Gestionar Profesor</h3>
            <p style="color:#aaa;">Curso: <strong style="color:var(--color-acento-naranja);">${courseName}</strong></p>
            <div style="margin:20px 0;">
                <label style="color:white; display:block; margin-bottom:10px;">Seleccionar Docente:</label>
                <select id="modalTeacherSelect" style="width:100%; padding:10px; background:#333; color:white; border:1px solid #555; border-radius:8px;">
                    <option value="">-- Sin Asignar --</option>
                    ${teachers.map(t => `<option value="${t.id_usuario}" ${t.id_usuario == currentTeacherId ? 'selected' : ''}>${t.full_name}</option>`).join('')}
                </select>
            </div>
            <div style="display:flex; gap:10px; justify-content:flex-end;">
                 <button onclick="document.getElementById('teacher-modal').remove()" style="padding:10px 20px; background:none; border:1px solid #555; color:white; border-radius:8px; cursor:pointer;">Cancelar</button>
                 <button onclick="confirmTeacherChange(${courseId})" style="padding:10px 20px; background:var(--color-acento-azul); border:none; color:white; border-radius:8px; cursor:pointer;">Guardar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.confirmTeacherChange = async function (courseId) {
    const select = document.getElementById('modalTeacherSelect');
    const teacherId = select.value || null;
    const modal = document.getElementById('teacher-modal');

    const res = await ApiService.updateCourseTeacher(courseId, teacherId);
    if (res.success) {
        Swal.fire({
            title: "¡Éxito!",
            text: 'Profesor actualizado correctamente.',
            icon: "success",
            background: '#1a1a1a',
            color: '#fff'
        });
        modal.remove();
        loadCourses();
    }
    else {
        Swal.fire({
            title: "Error",
            text: res.message,
            icon: "error",
            background: '#1a1a1a',
            color: '#fff'
        });
        modal.remove();
    }
}

// ==========================================
// PENDING REQUESTS LOGIC
// ==========================================
window.loadPendingRequests = async function () {
    const list = document.getElementById('pendingRequestsList');
    if (!list) return;

    list.innerHTML = '<div style="text-align:center; padding:10px;">Checking requests...</div>';

    try {
        const response = await fetch(`${ApiService.BASE_URL}admin_get_schedule_requests.php`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            list.innerHTML = result.data.map(req => `
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:10px; margin-bottom:10px; border-left:3px solid var(--color-acento-naranja); display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="color:var(--color-acento-naranja); font-weight:bold;">${req.course_name}</div>
                        <div style="color:white; font-size:0.95rem;">${req.student_name}</div>
                        <div style="color:#aaa; font-size:0.85rem; margin-top:3px;">
                            Solicita: <span style="color:white;">${req.requested_day} a las ${formatTime(req.requested_time)}</span>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button onclick="handleRequest(${req.id}, 'approve')" style="background:none; border:none; color:#2ecc71; cursor:pointer; font-size:1.5rem;" title="Aprobar"><i class="bi bi-check-circle-fill"></i></button>
                        <button onclick="handleRequest(${req.id}, 'reject')" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:1.5rem;" title="Rechazar"><i class="bi bi-x-circle-fill"></i></button>
                    </div>
                </div>
            `).join('');
        } else {
            list.innerHTML = '<div style="text-align: center; color: #ccc; padding: 20px;">No hay solicitudes pendientes.</div>';
        }
    } catch (e) {
        console.error(e);
        list.innerHTML = '<div style="color:#e74c3c; padding:10px;">Error cargando solicitudes</div>';
    }
};

window.handleRequest = async function (requestId, action) {
    const actionText = action === 'approve' ? 'Aprobar' : 'Rechazar';

    // Create inputs for response
    let htmlContent = action === 'approve'
        ? `<p>¿Seguro que deseas aprobar esta solicitud? Se creará el horario automáticamente.</p>`
        : `<p>¿Por qué rechazas esta solicitud?</p><textarea id="reject-reason" class="swal2-textarea" placeholder="Razón del rechazo..." style="width:100%;"></textarea>`;

    const result = await Swal.fire({
        title: `${actionText} Solicitud`,
        html: htmlContent,
        icon: action === 'approve' ? 'question' : 'warning',
        showCancelButton: true,
        confirmButtonText: `Sí, ${actionText}`,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: action === 'approve' ? '#2ecc71' : '#e74c3c',
        preConfirm: () => {
            if (action === 'reject') {
                return document.getElementById('reject-reason').value || "Sin razón especificada.";
            }
            return "Solicitud aprobada.";
        }
    });

    if (result.isConfirmed) {
        const responseText = result.value;
        try {
            const apiRes = await fetch(`${ApiService.BASE_URL}admin_handle_schedule_request.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    request_id: requestId,
                    action: action,
                    response_text: responseText
                })
            });
            const apiResult = await apiRes.json();

            if (apiResult.success) {
                Swal.fire('Procesado', apiResult.message, 'success');
                loadPendingRequests();
                loadCourses(); // To refresh schedules counts
            } else {
                Swal.fire('Error', apiResult.message, 'error');
            }
        } catch (e) {
            Swal.fire('Error', 'Error de conexión', 'error');
        }
    }
};

// Auto-load on start
loadPendingRequests();
