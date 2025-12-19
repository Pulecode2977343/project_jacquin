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

let allUsers = []; 

window.loadDirectory = async function() {
    const listAdmins = document.getElementById("list-admins");
    const listTeachers = document.getElementById("list-teachers");
    const listUsers = document.getElementById("list-users"); // Students/Others

    if(!listAdmins) return;

    // Show loading
    const loadingHTML = '<div style="text-align:center; padding:20px; color:#aaa;">Cargando...</div>';
    listAdmins.innerHTML = loadingHTML;
    listTeachers.innerHTML = loadingHTML;
    listUsers.innerHTML = loadingHTML;

    const response = await ApiService.getUsers(); 
    if (response.success && response.data) {
        allUsers = response.data;

        // separate
        const admins = allUsers.filter(u => u.id_rol == 1);
        const teachers = allUsers.filter(u => u.id_rol == 2);
        const others = allUsers.filter(u => u.id_rol != 1 && u.id_rol != 2);

        renderList(listAdmins, admins, "bi-shield-lock");
        renderList(listTeachers, teachers, "bi-person-video3");
        renderList(listUsers, others, "bi-people");
    } else {
        listAdmins.innerHTML = `<div style="color:red; padding:20px;">Error: ${response.message || "Fallo de conexión"}</div>`;
        console.error("Directory Load Error:", response);
    }
};

function renderList(container, users, icon) {
    if(users.length === 0) {
        container.innerHTML = '<div style="opacity:0.5; text-align:center; padding:20px;">Vacío</div>';
        return;
    }
    
    container.innerHTML = "";
    users.forEach(u => {
        const item = document.createElement("div");
        item.className = "directory-item";
        item.onclick = () => openProfile(u.id_usuario);
        item.innerHTML = `
            <i class="bi ${icon}" style="color:var(--color-acento-azul);"></i>
            <span>${u.full_name}</span>
        `;
        container.appendChild(item);
    });
}

// ================= MODAL LOGIC =================

window.openProfile = async function(userId) {
    const user = allUsers.find(u => u.id_usuario == userId);
    if (!user) return;

    const currentUser = ApiService.getSession();
    const modal = document.getElementById("user-profile-modal");
    
    // Populate Info
    document.getElementById("modal-name").textContent = user.full_name;
    document.getElementById("modal-email").textContent = user.email;
    document.getElementById("modal-role").textContent = getRoleName(user.id_rol);
    document.getElementById("modal-id").textContent = "ID: " + user.id_usuario;

    // --- ACTIONS (Left Column) ---
    const actionsContainer = document.getElementById("modal-actions");
    actionsContainer.innerHTML = "";

    // 0. EDIT AVATAR (For Admin)
    const btnAvatar = createBtn("Editar Foto", "bi-camera", () => {
        // Trigger hidden file input
        let input = document.getElementById("avatar-upload-input");
        if(!input) {
            input = document.createElement("input");
            input.type = "file";
            input.id = "avatar-upload-input";
            input.accept = "image/*";
            input.style.display = "none";
            document.body.appendChild(input);
            
            input.onchange = async (e) => {
                if(e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    // Show loading on avatar
                    const avatarContainer = document.getElementById("modal-avatar");
                    avatarContainer.innerHTML = '<div class="spinner-border text-light" role="status"></div>'; // Bootstrap spinner if avail, else just text
                    
                    const res = await ApiService.uploadAvatar(user.id_usuario, file);
                    if(res.success) {
                        // Update Avatar View
                        // In a real app we'd construct the full URL. Assuming `uploads/avatars/` path provided by backend is correct relative to page
                         avatarContainer.innerHTML = `<img src="${res.data}" style="width:100%; height:100%; object-fit:cover;">`;
                    } else {
                        alert("Error: " + res.message);
                        avatarContainer.innerHTML = '<i class="bi bi-person-bounding-box"></i>';
                    }
                }
            };
        }
        input.click();
    });
    btnAvatar.style.fontSize = "0.85rem"; 
    btnAvatar.style.padding = "8px";
    actionsContainer.appendChild(btnAvatar);

    // 1. CHANGE ROLE (Common)
    if(user.id_usuario != currentUser.id_usuario) {
        actionsContainer.appendChild(createBtn("Cambiar Rol", "bi-person-gear",  () => changeRoleDirect(user)));
    }

    // 2. TEACHER ACTIONS
    if(user.id_rol == 2) {
        actionsContainer.appendChild(createBtn("Asignar Curso", "bi-journal-plus", () => {
             closeModal();
            goToAssign(user.id_usuario);
        }));
    }

    // 3. STUDENT ACTIONS (Enroll)
    if(user.id_rol == 3) {
        const btnEnroll = createBtn("Suscribir Curso", "bi-bookmark-plus", () => {
             enrollStudentDirect(user);
        });
        btnEnroll.style.background = "var(--color-acento-azul)";
        btnEnroll.style.color = "#111"; // Highlighted
        actionsContainer.appendChild(btnEnroll);
    }

    // ... (rest of function) ...


    // 4. DELETE
    if(user.id_usuario != currentUser.id_usuario) {
        actionsContainer.appendChild(createBtn("Eliminar", "bi-trash", () => deleteUserDirect(user), true));
    }

    // Show Modal
    modal.style.display = "flex";

    // --- ACADEMIC CONTENT (Right Column) ---
    const coursesContainer = document.getElementById("modal-courses");
    coursesContainer.innerHTML = '<div style="color:#aaa; font-size:0.9rem;">Cargando...</div>';

    // Fetch Details
    try {
        const detailRes = await ApiService.getUserDetails(userId);
        
        if(detailRes.success && detailRes.data) {
            coursesContainer.innerHTML = "";
            const { teaching, enrolled, functions, user_info } = detailRes.data;
            let hasContent = false;

            // Update Avatar if fresh data available
            if(user_info && user_info.avatar_url) {
                const avatarContainer = document.getElementById("modal-avatar");
                if(avatarContainer) {
                     avatarContainer.innerHTML = `<img src="${user_info.avatar_url}" style="width:100%; height:100%; object-fit:cover;">`;
                }
            }

            // A. Teaching / Enrolled Courses
            // Combined logic: show schedules
            const relevantCourses = [...teaching, ...enrolled];
            
            if(relevantCourses.length > 0) {
                hasContent = true;
                coursesContainer.innerHTML += '<h4 style="color:white; margin:0 0 10px 0; font-size:1rem;">Cursos y Horarios</h4>';
                relevantCourses.forEach(c => {
                    const roleLabel = teaching.includes(c) ? "Docente" : "Estudiante";
                    const color = teaching.includes(c) ? "#e67e22" : "#3498db";
                    coursesContainer.appendChild(createCourseCard(c, roleLabel, color));
                });
            }

            // Separator & Functions (If NOT Student and Has Perms)
            // (User asked to omit functions for students)
            if(user.id_rol != 3) {
                 if(relevantCourses.length > 0) {
                     coursesContainer.innerHTML += '<div class="content-divider"></div>';
                 }

                 if(functions.length > 0) {
                     hasContent = true;
                     coursesContainer.innerHTML += '<h4 style="color:white; margin:0 0 10px 0; font-size:1rem;">Funciones Asignadas</h4>';
                     functions.forEach(f => {
                         // Render function logic (same as before)
                         const isPermanent = f.type === 'Permanente';
                         const badgeColor = isPermanent ? '#2ecc71' : '#f39c12';
                         const timeInfo = isPermanent ? 'Indefinido' : `${f.start_date} - ${f.end_date}`;
                         
                         const div = document.createElement("div");
                         div.innerHTML = `
                             <div style="background:rgba(255,255,255,0.05); padding:8px 10px; border-radius:6px; margin-bottom:5px; border-left:3px solid ${badgeColor};">
                                 <div style="color:#ddd; font-weight:500; font-size:0.95rem;">${f.description}</div>
                                 <div style="font-size:0.75rem; color:#888; margin-top:3px;">${timeInfo}</div>
                             </div>
                         `;
                         coursesContainer.appendChild(div);
                     });
                 }
            }

            // Empty State
            if(!hasContent) {
                 coursesContainer.innerHTML = `
                    <div style="text-align:center; padding:20px; color:#666; font-style:italic; border:1px dashed #444; border-radius:10px;">
                        Aún no se han asignado cursos o funciones.
                        ${user.id_rol == 3 ? '<br><span style="font-size:0.8rem; color:var(--color-acento-azul)">¡Suscribe un curso para empezar!</span>' : ''}
                    </div>
                 `;
            }

        } else {
            // Show specific error if available
            const msg = detailRes.message || "Error al cargar datos.";
            coursesContainer.innerHTML = `<div style="color:red; font-size:0.9rem;">${msg}</div>`;
        }
    } catch (e) {
        console.error(e);
        coursesContainer.innerHTML = '';
    }
};

// Student Enrollment UI
window.enrollStudentDirect = async function(user) {
    const coursesContainer = document.getElementById("modal-courses");
    coursesContainer.innerHTML = '<div style="color:#aaa;">Cargando cursos disponibles...</div>';
    
    try {
        const res = await ApiService.getCourses();
        if(res.success && res.data) {
            const courses = res.data;
            
            // Build simple UI
            let html = `
                <div style="background:#222; padding:15px; border-radius:10px; border:1px solid #444;">
                    <h4 style="color:white; margin-bottom:10px;">Selecciona un Curso</h4>
                    <select id="enroll-course-select" class="form-control" style="width:100%; margin-bottom:15px; background:#333; border:none; color:white; padding:10px;">
                        <option value="">-- Elige Curso --</option>
                        ${courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                    <div style="display:flex; gap:10px;">
                        <button id="btn-confirm-enroll" class="btn-module" style="background:var(--color-acento-azul); color:black;">Inscribir</button>
                        <button id="btn-cancel-enroll" class="btn-module" style="background:#444;">Cancelar</button>
                    </div>
                </div>
            `;
            coursesContainer.innerHTML = html;

            document.getElementById("btn-cancel-enroll").onclick = () => {
                // Reload profile to show list again
                openProfile(user.id_usuario);
            };

            document.getElementById("btn-confirm-enroll").onclick = async () => {
                const select = document.getElementById("enroll-course-select");
                const courseId = select.value;
                if(!courseId) return alert("Selecciona un curso");

                const enrollRes = await ApiService.enrollStudent(user.id_usuario, courseId);
                if(enrollRes.success) {
                    alert("¡Estudiante inscrito!");
                    openProfile(user.id_usuario); // Refresh
                } else {
                    alert("Error: " + enrollRes.message);
                }
            };

        } else {
            alert("No se pudieron cargar los cursos");
            openProfile(user.id_usuario);
        }
    } catch(e) {
        console.error(e);
        alert("Error de conexión");
    }
};

function createCourseCard(course, roleLabel, color) {
    let schedBadges = '';
    if(course.schedules && course.schedules.length > 0) {
        schedBadges = course.schedules.map(s => 
            `<span style="background:var(--color-acento-azul); color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem; margin-right:5px;">
                ${s.day_of_week} ${s.start_time.slice(0,5)}-${s.end_time.slice(0,5)}
             </span>`
        ).join('');
    } else {
        schedBadges = '<span style="color:gray; font-size:0.75rem;">Sin horario</span>';
    }

    const item = document.createElement("div");
    item.style.background = "rgba(255,255,255,0.05)";
    item.style.padding = "10px";
    item.style.borderRadius = "8px";
    item.style.marginBottom = "8px";
    
    item.innerHTML = `
        <div style="color:${color}; font-weight:bold;">${course.name}</div>
        <div style="margin-top:4px;">${schedBadges}</div>
        <div style="color:#888; font-size:0.8rem; margin-top:2px;">${roleLabel}</div>
    `;
    return item;
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
    
    if(isDanger) {
        btn.style.borderColor = "#e74c3c";
        btn.style.color = "#e74c3c";
    }

    btn.innerHTML = `<i class="bi ${iconClass}"></i> ${text}`;
    btn.onclick = onClick;
    return btn;
}

window.closeModal = function() {
    document.getElementById("user-profile-modal").style.display = "none";
};

// ================= ACTIONS =================

function getRoleName(id) {
    const map = { 1: "Administrador", 2: "Docente", 3: "Estudiante", 4: "Aspirante" };
    return map[id] || "Desconocido";
}

async function changeRoleDirect(targetUser) {
    // Safety check for target being admin
    if(targetUser.id_rol == 1) {
        if(!confirm(`⚠️ PRECAUCIÓN ⚠️\n\nEstás a punto de cambiar el rol de OTRO ADMINISTRADOR (${targetUser.full_name}).\n\nSi le quitas el rol de admin, perderá acceso a este panel.\n¿Estás realmente seguro?`)) {
            return;
        }
    }

    const newRole = prompt(`Cambiar rol a ${targetUser.full_name}:\n1: Admin\n2: Docente\n3: Estudiante\n4: Aspirante`);
    if(newRole && ["1","2","3","4"].includes(newRole)) {
        const result = await ApiService.updateUserRole(targetUser.id_usuario, newRole);
        if(result.success) {
            alert("Rol actualizado");
            closeModal();
            loadDirectory();
        } else {
            alert("Error: " + result.message);
        }
    }
}

async function deleteUserDirect(targetUser) {
    // Safety check for target being admin
    if(targetUser.id_rol == 1) {
        if(!confirm(`⛔ PELIGRO CRÍTICO ⛔\n\nEstás intentando ELIMINAR a otro ADMINISTRADOR (${targetUser.full_name}).\n\nEsta acción es irreversible y podría bloquear el acceso al sistema si no quedan otros administradores.\n\n¿CONFIRMAS esta acción destructiva?`)) {
            return;
        }
    } else {
        if(!confirm(`¿ELIMINAR a ${targetUser.full_name}?\nIrreversible.`)) return;
    }

    const result = await ApiService.deleteUser(targetUser.id_usuario);
    if(result.success) {
        alert("Eliminado");
        closeModal();
        loadDirectory();
    } else {
        alert("Error: " + result.message);
    }
}

// Re-implement goToAssign here or rely on the previous logic if copied
// Re-implement goToAssign to redirect
window.goToAssign = function(userId) {
    window.location.href = `admin_academic.html?teacher_id=${userId}`;
};


// Close modal when clicking outside
window.addEventListener("click", function(event) {
    const modal = document.getElementById("user-profile-modal");
    if (modal && event.target == modal) {
        closeModal();
    }
});
