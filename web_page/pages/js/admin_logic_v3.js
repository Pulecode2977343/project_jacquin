/**
 * Admin Logic - VERSION 3.0 (Fresh File)
 * Fixes corruption issues by using a new filename.
 */

console.log("Admin Users Logic V3 Loaded Successfully");

document.addEventListener("DOMContentLoaded", async () => {
    if (!ApiService.isAuthenticated()) {
        window.location.href = "login.html";
        return;
    }
    const user = ApiService.getSession();
    if (user.id_rol != 1) {
        console.warn("Acceso denegado: Usuario no es admin.");
        return;
    }
    await loadUsers();

    const searchInput = document.getElementById("user-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => filterUsers(e.target.value));
    }
});

let allUsers = [];

async function loadUsers() {
    console.log("Loading users via V3...");
    const tableBody = document.querySelector("#users-table tbody");
    if (!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#aaa;">Cargando usuarios...</td></tr>';

    // Explicitly call getUsers
    const response = await ApiService.getUsers();

    if (response.success && response.data) {
        allUsers = response.data;
        renderUsers(allUsers);
    } else {
        console.error("Load Failed:", response);
        tableBody.innerHTML = `<tr><td colspan="5" style="color:#e74c3c; text-align:center;">Error: ${response.message || 'No se pudieron cargar usuarios'}</td></tr>`;
    }
}

function renderUsers(users) {
    const tableBody = document.querySelector("#users-table tbody");
    tableBody.innerHTML = "";
    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#aaa;">No se encontraron resultados.</td></tr>';
        return;
    }
    users.forEach(u => {
        const row = document.createElement("tr");
        row.style.background = "rgba(255,255,255,0.02)";
        row.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
        row.innerHTML = `
            <td style="padding:15px;">${u.id_usuario}</td>
            <td style="padding:15px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${u.avatar_url || 'assets/images/default_avatar.svg'}" style="width:30px; height:30px; border-radius:50%; margin-right:10px; object-fit:cover;">
                    <span style="color:white; font-weight:500;">${u.full_name}</span>
                </div>
            </td>
            <td style="padding:15px; color:#ccc;">${u.email}</td>
            <td style="padding:15px;"><span class="role-badge role-${u.id_rol}">${getRoleName(u.id_rol)}</span></td>
            <td style="padding:15px;">
                <div style="display:flex; gap:8px;">
                    <button class="btn-action" onclick="openManageUserModal(${u.id_usuario}, '${u.full_name.replace(/'/g, "\\'")}', ${u.id_rol})" title="Gestionar Cursos">
                        <i class="bi bi-gear-fill"></i>
                    </button>
                    <button class="btn-action" onclick="openRoleModal(${u.id_usuario}, '${u.full_name.replace(/'/g, "\\'")}', ${u.id_rol})" title="Editar Perfil">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn-action" onclick="deleteUser(${u.id_usuario}, '${u.full_name.replace(/'/g, "\\'")}')" style="border-color: #e74c3c; color: #e74c3c;" title="Eliminar Usuario">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function filterUsers(query) {
    const lowerQuery = query.toLowerCase();
    const filtered = allUsers.filter(u =>
        u.full_name.toLowerCase().includes(lowerQuery) ||
        u.email.toLowerCase().includes(lowerQuery) ||
        u.id_usuario.toString().includes(lowerQuery)
    );
    renderUsers(filtered);
}

function getRoleName(id) {
    const map = { 1: "Admin", 2: "Docente", 3: "Estudiante", 4: "Aspirante", 5: "Colaborador" };
    return map[id] || "Desc.";
}

// Global functions for HTML access
window.openRoleModal = function (userId) {
    openEditUserModal(userId);
};

window.openEditUserModal = async function (userId) {
    const res = await ApiService.getUsers();
    // Refresh allUsers if possible, or use existing
    const user = allUsers.find(u => u.id_usuario == userId) || {};
    const detailsRes = await ApiService.getUserDetails(userId);
    const fullUser = detailsRes.success ? detailsRes.data.profile : user;

    let modal = document.getElementById("user-editor-modal");
    if (modal) modal.remove();

    modal = document.createElement("div");
    modal.id = "user-editor-modal";
    modal.className = "modal-overlay";
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10005; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px);";
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    const roles = [{ id: 1, name: "Admin" }, { id: 2, name: "Docente" }, { id: 3, name: "Estudiante" }, { id: 4, name: "Aspirante" }, { id: 5, name: "Colaborador" }];
    const avatar = fullUser.avatar_url || 'assets/images/default_avatar.svg';

    modal.innerHTML = `
        <div style="background:#1e1e1e; padding:0; border-radius:15px; width:90%; max-width:500px; box-shadow:0 20px 50px rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); overflow:hidden;">
            <div style="background:#2c3e50; padding:15px; border-bottom:1px solid rgba(255,255,255,0.1);">
                <h3 style="color:white; margin:0; font-size:1.1rem;">Editar Usuario</h3>
            </div>
            <div style="padding:20px; max-height:70vh; overflow-y:auto;">
                <form onsubmit="handleUserUpdate(event, ${userId})">
                    <!-- Avatar Section -->
                    <div style="display:flex; gap:15px; margin-bottom:15px; align-items:center;">
                        <img src="${avatar}" style="width:60px; height:60px; border-radius:50%; object-fit:cover;">
                        <div style="flex:1;">
                            <label style="color:#aaa; font-size:0.8rem;">Avatar URL</label>
                            <input type="text" name="avatar_url" value="${fullUser.avatar_url || ''}" style="width:100%; padding:8px; background:#222; border:1px solid #444; color:white; border-radius:4px;">
                        </div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                        <div>
                            <label style="color:#aaa; font-size:0.8rem;">Nombre</label>
                            <input type="text" name="full_name" value="${fullUser.full_name}" required style="width:100%; padding:8px; background:#222; border:1px solid #444; color:white; border-radius:4px;">
                        </div>
                        <div>
                            <label style="color:#aaa; font-size:0.8rem;">Rol</label>
                            <select name="id_rol" style="width:100%; padding:8px; background:#222; border:1px solid #444; color:white; border-radius:4px;">
                                ${roles.map(r => `<option value="${r.id}" ${fullUser.id_rol == r.id ? 'selected' : ''}>${r.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div style="margin-bottom:15px;">
                        <label style="color:#aaa; font-size:0.8rem;">Email</label>
                        <input type="email" name="email" value="${fullUser.email}" required style="width:100%; padding:8px; background:#222; border:1px solid #444; color:white; border-radius:4px;">
                    </div>
                    
                    <div style="margin-bottom:15px;">
                       <label style="color:#aaa; font-size:0.8rem;"><input type="checkbox" name="delete_avatar"> Eliminar Avatar Actual</label>
                    </div>

                    <div style="text-align:right;">
                        <button type="button" onclick="document.getElementById('user-editor-modal').remove()" style="padding:8px 15px; background:none; border:1px solid #555; color:white; border-radius:4px; margin-right:5px; cursor:pointer;">Cancelar</button>
                        <button type="submit" style="padding:8px 20px; background:#27ae60; border:none; color:white; border-radius:4px; cursor:pointer;">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.handleUserUpdate = async function (e, userId) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updateData = {
        id_usuario: userId,
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        n_phone: formData.get('n_phone'),
        id_rol: formData.get('id_rol'),
        avatar_url: formData.get('avatar_url'),
        avatar_action: formData.get('delete_avatar') ? 'delete' : (formData.get('avatar_url') ? 'update' : 'keep')
    };

    Swal.fire({
        title: "¿Guardar cambios?",
        text: "Se actualizará la información del perfil.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#27ae60',
        cancelButtonColor: '#444',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
        background: '#1a1a1a',
        color: '#fff'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const res = await ApiService.adminUpdateUserFull(updateData);
            if (res.success) {
                Swal.fire({
                    title: "¡Actualizado!",
                    text: "Usuario actualizado correctamente.",
                    icon: "success",
                    background: '#1a1a1a',
                    color: '#fff'
                });
                document.getElementById('user-editor-modal').remove();
                loadUsers();
            } else {
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
};

window.deleteUser = async function (userId, userName) {
    Swal.fire({
        title: `¿Eliminar a ${userName}?`,
        text: "Esta acción es irreversible.",
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
            const res = await ApiService.deleteUser(userId);
            if (res.success) {
                Swal.fire({
                    title: "¡Eliminado!",
                    text: "El usuario ha sido eliminado.",
                    icon: "success",
                    background: '#1a1a1a',
                    color: '#fff'
                });
                loadUsers();
            } else {
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
};

// ==========================================
// COURSE MANAGEMENT (ENROLL)
// ==========================================

window.openManageUserModal = async function (userId, userName) {
    const detailsRes = await ApiService.getUserDetails(userId);
    if (!detailsRes.success) return alert("Error cargando detalles");

    const enrollments = detailsRes.data.enrolled || [];

    let modal = document.getElementById("manage-user-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "manage-user-modal";
        modal.className = "modal-overlay";
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10000; display:flex; justify-content:center; align-items:center;";
        modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; }
        document.body.appendChild(modal);
    }

    const enrollHtml = enrollments.map(e => `
        <div style="background:#333; padding:10px; margin-bottom:5px; border-radius:5px; display:flex; justify-content:space-between;">
            <span>${e.name} <small>(${e.schedules[0] ? e.schedules[0].day_of_week : '?'})</small></span>
            <button onclick="manageUnenroll(${e.id_enrollment}, ${userId}, '${userName}')" style="color:red; background:none; border:none; cursor:pointer;">X</button>
        </div>
    `).join('') || '<div style="color:#666;">Sin inscripciones</div>';

    modal.innerHTML = `
        <div style="background:#1e1e1e; padding:20px; border-radius:10px; width:90%; max-width:600px;">
            <h2 style="color:white; margin-top:0;">${userName}</h2>
            <div style="margin:20px 0;">
                <h4 style="color:#aaa;">Cursos</h4>
                ${enrollHtml}
            </div>
            <div style="border-top:1px solid #333; padding-top:20px;">
                <h4 style="color:white;">Inscribir</h4>
                <div id="enroll-form-container">
                    <button onclick="loadEnrollForm(${userId}, '${userName}')" style="width:100%; padding:10px; background:#3498db; color:white; border:none; border-radius:5px; cursor:pointer;">Seleccionar Curso</button>
                </div>
            </div>
        </div>
    `;
    modal.style.display = "flex";
};

window.manageUnenroll = async function (eid, uid, uname) {
    if (!confirm("¿Desinscribir?")) return;
    await ApiService.unenrollStudent(eid);
    openManageUserModal(uid, uname);
};

window.loadEnrollForm = async function (userId, userName) {
    const container = document.getElementById("enroll-form-container");
    container.innerHTML = "Cargando...";

    const coursesRes = await ApiService.getCourses();
    if (!coursesRes.success) { container.innerHTML = "Error cursos"; return; }

    container.innerHTML = `
        <select id="course-select" style="width:100%; padding:10px; background:#222; color:white; border:1px solid #444; margin-bottom:10px;">
            <option value="">Selecciona Curso</option>
            ${coursesRes.data.map(c => `<option value="${c.id_course}">${c.name}</option>`).join('')}
        </select>
        <div id="schedule-container"></div>
    `;

    document.getElementById("course-select").onchange = async (e) => {
        const cid = e.target.value;
        const div = document.getElementById("schedule-container");
        if (!cid) { div.innerHTML = ""; return; }

        div.innerHTML = "Cargando horarios...";
        const sRes = await ApiService.getSchedules(cid);
        const scheds = sRes.success ? sRes.data : [];

        // Load Teachers for Filter
        const tRes = await ApiService.getTeachers();
        const teachers = tRes.success ? tRes.data : [];

        // Build Filter
        let filterHtml = "";
        if (teachers.length > 0) {
            filterHtml = `
            <div style="margin-bottom:10px;">
                <label style="color:#aaa; font-size:0.8rem;">Filtrar / Asignar Docente:</label>
                <select id="t-filter" style="width:100%; padding:8px; background:#111; color:white; border:1px solid #444;">
                    <option value="ALL">-- Ver Todos --</option>
                    ${teachers.map(t => `<option value="${t.id_usuario}">${t.full_name}</option>`).join('')}
                </select>
            </div>`;
        }

        div.innerHTML = `
            ${filterHtml}
            <select id="sched-select" style="width:100%; padding:10px; background:#222; color:white; border:1px solid #444; margin-bottom:10px;"></select>
            <button onclick="doEnroll(${userId}, ${cid}, '${userName}')" style="width:100%; padding:10px; background:#2ecc71; color:white; border:none; border-radius:5px; cursor:pointer;">Confirmar</button>
        `;

        const renderScheds = (fid) => {
            const sel = document.getElementById("sched-select");
            let list = scheds;
            let targetName = "";

            if (fid !== 'ALL') {
                list = scheds.filter(s => s.teacher_id == fid || !s.teacher_id);
                const t = teachers.find(x => x.id_usuario == fid);
                if (t) targetName = t.full_name;
            }

            if (list.length === 0) {
                sel.innerHTML = "<option>No hay horarios</option>";
                return;
            }

            sel.innerHTML = list.map(s => {
                const avail = 15 - (s.enrolled_count || 0);
                const isFull = avail <= 0;
                let txt = `${s.day_of_week} ${ApiService.formatTime(s.start_time)}`;
                let style = "";

                if (!s.teacher_id && fid !== 'ALL') {
                    txt += ` ➝ Asignar a ${targetName}`;
                    style = "color:orange; font-weight:bold;";
                } else {
                    txt += ` (Prof: ${s.teacher_name})`;
                }

                txt += isFull ? " (LLENO)" : ` [Cupos: ${avail}]`;

                return `<option value="${s.id_schedule}" ${isFull ? 'disabled' : ''} style="${style}">${txt}</option>`;
            }).join('');
        };

        renderScheds('ALL');

        const tf = document.getElementById("t-filter");
        if (tf) tf.onchange = (ev) => renderScheds(ev.target.value);
    };
};

window.doEnroll = async function (uid, cid, uname) {
    const sid = document.getElementById("sched-select").value;
    const tf = document.getElementById("t-filter");
    const tid = tf ? tf.value : 'ALL';

    if (!sid) {
        return Swal.fire({
            title: "Atención",
            text: "Selecciona un horario",
            icon: "info",
            background: '#1a1a1a',
            color: '#fff'
        });
    }

    if (tid !== 'ALL') {
        // Auto assign
        await ApiService.assignTeacher(tid, sid);
    }

    const r = await ApiService.enrollStudent(uid, cid, sid);
    if (r.success) {
        Swal.fire({
            title: "¡Éxito!",
            text: "Usuario inscrito correctamente.",
            icon: "success",
            background: '#1a1a1a',
            color: '#fff'
        });
        openManageUserModal(uid, uname);
    } else {
        Swal.fire({
            title: "Error",
            text: r.message,
            icon: "error",
            background: '#1a1a1a',
            color: '#fff'
        });
    }
};
