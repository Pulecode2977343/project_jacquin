// ==========================================
// Dashboard Logic (V7 - ID Fixes)
// Handles Role-Based Access Control and Modules
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {
    // Helper to resolve paths based on current location (root vs pages/)
    function resolvePath(path) {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('/') || path.startsWith('../')) return path;
        // If we are in /pages/ and path implies root-relative (like assets/...), go up one level
        if (window.location.pathname.includes('/pages/')) {
            return '../' + path;
        }
        return path;
    }

    let sessionUser = ApiService.getSession();
    if (!sessionUser) {
        window.location.href = "login.html";
        return;
    }

    // AUTO-SYNC: Verify user ID matches DB (Efficient: runs once per hour or if ID missing)
    const now = Date.now();
    const lastSync = localStorage.getItem('last_session_sync') || 0;

    if (sessionUser.email && (now - lastSync > 3600000 || !sessionUser.id_usuario)) {
        fetch(`${API_CONFIG.BASE_URL}get_user_by_email.php?email=${encodeURIComponent(sessionUser.email)}`)
            .then(res => res.json())
            .then(syncData => {
                if (syncData.success && syncData.user) {
                    localStorage.setItem('last_session_sync', now);
                    const realId = syncData.user.id_usuario;
                    const realRole = syncData.user.id_rol;
                    if (sessionUser.id_usuario != realId || sessionUser.id_rol != realRole) {
                        console.log("[SESSION SYNC] Updating session data.");
                        sessionUser.id_usuario = realId;
                        sessionUser.id_rol = syncData.user.id_rol;
                        sessionUser.full_name = syncData.user.full_name;
                        sessionUser.avatar_url = syncData.user.avatar_url;
                        ApiService.saveSession(sessionUser);
                    }
                }
            })
            .catch(e => console.log("[SESSION SYNC] Background sync failed."));
    }

    // 1. Setup UI based on Role
    const roleId = parseInt(sessionUser.id_rol);
    const userId = sessionUser.id_usuario;
    const userName = sessionUser.full_name;

    // Header Greeting (Personalized Title)
    const titleEl = document.getElementById("dashboard-header-title");
    if (titleEl) {
        const firstName = userName.split(" ")[0]; // Extract first name
        titleEl.textContent = `Hola ${firstName}`;
    }

    // Legacy/Header greeting if exists
    const greetingEl = document.getElementById("header-greeting");
    if (greetingEl) greetingEl.textContent = `Hola, ${userName}`;

    // Elements - CORRECTED IDs based on gestion.html
    const modAdminInventory = document.getElementById("mod-inventory"); // Corrected ID
    const modAdminUsers = document.getElementById("mod-profesores"); // This is the "Usuarios" card
    const modAcademic = document.getElementById("mod-academic"); // Cursos / Notas
    const modEvents = document.getElementById("mod-events");     // Eventos
    const modPositions = document.getElementById("mod-positions"); // Cargos
    const modStudentCourses = document.getElementById("mod-student-courses"); // Student Card

    // Legacy fallback (User Widget)
    const userWidget = document.getElementById("user-widget");

    // Default Hidden
    if (modAdminInventory) modAdminInventory.style.display = "none";
    if (modAdminUsers) modAdminUsers.style.display = "none";
    if (modStudentCourses) modStudentCourses.style.display = "none";

    // NEW: Programs Card
    const modPrograms = document.getElementById("mod-programs");
    if (modPrograms) modPrograms.style.display = "none";
    if (modPositions) modPositions.style.display = "none";
    if (modAcademic) modAcademic.style.display = "none"; // Hide by default

    // Filter Logic
    switch (roleId) {
        case 1: // Admin
            if (modAdminInventory) modAdminInventory.style.display = "flex";
            const modHero = document.getElementById("mod-hero");
            if (modHero) modHero.style.display = "flex";
            if (modEvents) modEvents.style.display = "flex";

            // Show Programs Card for Admin
            if (modPrograms) {
                modPrograms.style.display = "flex";
                modPrograms.onclick = () => window.location.href = "admin_programs.html";
                modPrograms.style.cursor = "pointer";
            }

            if (modAdminUsers) {
                modAdminUsers.style.display = "flex";
                // Admin Action: Go to Users Page
                modAdminUsers.onclick = () => window.location.href = "admin_users.html";
                modAdminUsers.style.cursor = "pointer";
            }
            if (modAcademic) {
                modAcademic.style.display = "flex";
                // Admin has Manage Courses here
                // Handled in link modules
            }
            // Admin Check Pending Requests
            if (window.checkPendingRequests) window.checkPendingRequests();

            const modRequests = document.getElementById("mod-requests");
            if (modRequests) {
                modRequests.style.display = "flex";
                modRequests.style.cursor = "pointer";
            }

            // Show Content Web Module for Admin
            const modContent = document.getElementById("mod-content");
            if (modContent) {
                modContent.style.display = "flex";
                modContent.style.cursor = "pointer";
            }

            // Show Positions Card for Admin
            if (modPositions) {
                modPositions.style.display = "flex";
                modPositions.onclick = () => window.location.href = "admin_positions.html";
                modPositions.style.cursor = "pointer";
            }

            // Dispatch evento para notificar que el dashboard de admin está cargado
            document.dispatchEvent(new CustomEvent('dashboard-role-loaded', { detail: { role: 1 } }));
            break;

        case 2: // Docente
            console.log("[TEACHER CASE] Entered for roleId:", roleId, "userId:", userId);
            // Show Teacher Profile Card
            const modTeacherMain = document.getElementById("mod-teacher-main");
            if (modTeacherMain) {
                modTeacherMain.style.display = "flex";
                document.getElementById("teacher-user-name").textContent = userName;
                document.getElementById("teacher-user-role").textContent = "Docente";
                const teacherAvatar = document.getElementById("teacher-avatar");
                if (teacherAvatar) {
                    teacherAvatar.src = resolvePath(sessionUser.avatar_url || 'assets/images/default_avatar.svg');
                }
            }

            // Show Teacher Courses Card
            const modTeacherCourses = document.getElementById("mod-teacher-courses");
            if (modTeacherCourses) {
                modTeacherCourses.style.display = "flex";
                fetchTeacherCourses(userId);
            }

            // Hide Admin/Student Items
            if (modAdminInventory) modAdminInventory.style.display = "none";
            if (modAdminUsers) modAdminUsers.style.display = "none";
            if (modStudentCourses) modStudentCourses.style.display = "none";

            // Dispatch evento para notificar que el dashboard de docente está cargado
            document.dispatchEvent(new CustomEvent('dashboard-role-loaded', { detail: { role: 2 } }));
            break;

        case 3: // Estudiante
        case 4: // Aspirante (Legacy)
            console.log("[STUDENT CASE] Entered for roleId:", roleId, "userId:", userId);
            // Show Student Profile Card
            const modStudentMain = document.getElementById("mod-student-main");
            if (modStudentMain) {
                modStudentMain.style.display = "flex";
                // Populate user info
                document.getElementById("dashboard-user-name").textContent = userName;
                document.getElementById("dashboard-user-role").textContent = getRoleName(roleId);
                const avatarEl = document.getElementById("dashboard-avatar");
                if (avatarEl) {
                    avatarEl.src = resolvePath(sessionUser.avatar_url || 'assets/images/default_avatar.svg');
                }
            }

            // Show Courses Card
            console.log("[STUDENT CASE] modStudentCourses element:", modStudentCourses);
            if (modStudentCourses) {
                modStudentCourses.style.display = "flex";
                fetchStudentCourses(userId);
            } else {
                console.log("[STUDENT CASE] ERROR: modStudentCourses not found!");
            }
            // Hide Admin Items
            if (modAdminInventory) modAdminInventory.style.display = "none";
            if (modAdminUsers) modAdminUsers.style.display = "none";

            // Dispatch evento para notificar que el dashboard de estudiante está cargado
            document.dispatchEvent(new CustomEvent('dashboard-role-loaded', { detail: { role: roleId } }));
            break;

        case 5: // Colaborador
            const modCollaboratorMain = document.getElementById("mod-collaborator-main");
            if (modCollaboratorMain) {
                modCollaboratorMain.style.display = "flex";

                // Populate info
                document.getElementById("collaborator-user-name").textContent = userName;
                document.getElementById("collaborator-user-role").textContent = getRoleName(roleId);
                const colAvatar = document.getElementById("collaborator-avatar");
                if (colAvatar) {
                    colAvatar.src = resolvePath(sessionUser.avatar_url || 'assets/images/default_avatar.svg');
                }
            }

            // Hide Admin/Teacher/Student Items explicitly if needed (though defaults should hide them)
            if (modAdminInventory) modAdminInventory.style.display = "none";
            if (modAdminUsers) modAdminUsers.style.display = "none";

            // Dispatch event
            document.dispatchEvent(new CustomEvent('dashboard-role-loaded', { detail: { role: roleId } }));
            break;
    }

    // Link Modules (Navigation)
    if (modAcademic) {
        modAcademic.onclick = (e) => {
            if (roleId === 1) {
                if (window.openCourseManagement) {
                    window.openCourseManagement();
                } else {
                    console.error("openCourseManagement not found");
                    showToast("Error: Módulo académico no cargado.", "error");
                }
            } else {
                const section = document.getElementById('section-academic');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
            }
        };
        modAcademic.style.cursor = "pointer";
    }

    // NOTE: mod-profesores (modAdminUsers) is handled in Switch for Admin.
    // Use this block only for Non-Admin who might see it?
    // If students see "mod-profesores" as "Docentes Directory", handle it here.
    // Assuming mod-profesores is ONLY for Admin based on "Administrar Estudiantes".

    if (modEvents) {
        modEvents.onclick = () => {
            if (window.openEventsManager) {
                window.openEventsManager();
            } else {
                console.error("Events Manager not loaded");
            }
        };
        modEvents.style.cursor = "pointer";
    }

    // 2. User Widget & Logout
    if (userWidget) {
        userWidget.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="window.openMyProfile()">
                <div style="text-align:right; display:none; @media(min-width:768px){display:block;}">
                    <div style="font-weight:bold; color:white;">${userName.split(" ")[0]}</div>
                    <div style="font-size:0.75rem; color:var(--color-acento-azul);">${getRoleName(roleId)}</div>
                </div>
                <img src="${resolvePath(sessionUser.avatar_url || 'assets/images/default_avatar.svg')}" 
                     id="dashboard-avatar"
                     style="width:40px; height:40px; border-radius:50%; border:2px solid var(--color-acento-azul); object-fit:cover;">
            </div>
        `;
    }

    // 3. Load Dynamic Content (Directory/Academic) for Admins only
    if (roleId === 1) {
        if (document.getElementById("section-directory")) {
            loadUsers();
        }
        if (document.getElementById("section-academic")) {
            loadCourses();
        }
    }

    // 4. Mobile/Tablet Logout Fallback
    const logoutExisting = document.getElementById("btn-logout-fallback");
    if (!logoutExisting) {
        const fab = document.createElement("button");
        fab.id = "btn-logout-fallback";
        fab.innerHTML = '<i class="bi bi-box-arrow-right"></i>';
        fab.style.position = "fixed";
        fab.style.bottom = "20px";
        fab.style.left = "20px";
        fab.style.zIndex = "9999";
        fab.style.background = "#e74c3c";
        fab.style.color = "white";
        fab.style.border = "none";
        fab.style.borderRadius = "50%";
        fab.style.width = "50px";
        fab.style.height = "50px";
        fab.style.fontSize = "1.5rem";
        fab.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
        fab.style.cursor = "pointer";
        fab.title = "Cerrar Sesión";
        fab.onclick = async () => {
            if (await showConfirm("¿Deseas cerrar tu sesión actual?")) window.ApiService.logout();
        };
        document.body.appendChild(fab);
    }

    // Global Access to trigger updates (Avatar)
    window.triggerAvatarUpload = function () {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Call API
                const res = await ApiService.uploadAvatar(userId, file);
                if (res.success) {
                    showToast("Tu foto de perfil ha sido actualizada.", "success");
                    // Update Local Session & UI
                    sessionUser.avatar_url = res.data; // URL
                    ApiService.saveSession(sessionUser);
                    const avatarUrl = res.data.startsWith('http') ? res.data : (ApiService.BASE_URL + res.data);
                    document.getElementById("dashboard-avatar").src = avatarUrl + "?t=" + new Date().getTime();
                } else {
                    showToast("No pudimos actualizar la foto: " + res.message, "error");
                }
            }
        };
        input.click();
    };
    // AUTO-FIX: Responsive Tablet Width Check & Force Redraw
    function checkViewportWidth() {
        const width = window.innerWidth;
        const grid = document.querySelector('.dashboard-grid');

        // Ensure viewport meta is correct (Force mobile mode)
        let meta = document.querySelector('meta[name="viewport"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = "viewport";
            document.head.appendChild(meta);
        }
        if (meta.content !== "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no") {
            meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
        }

        if (width >= 768 && width <= 1300 && grid) {
            // Force 100% width specifically
            grid.style.width = "100%";
            grid.style.maxWidth = "100vw";
            grid.style.marginRight = "0";
            grid.style.marginLeft = "0";

            // Force Layout Recalculation (Hide/Show)
            if (!grid.dataset.fixed) {
                grid.style.display = 'none';
                void grid.offsetHeight; // Trigger reflow via property access
                grid.style.display = 'flex'; // Restore to flex
                grid.dataset.fixed = "true";
            }
        }
    }

    // Listen for resize and orientation change
    window.addEventListener('resize', () => {
        const grid = document.querySelector('.dashboard-grid');
        if (grid) delete grid.dataset.fixed; // Allow re-fix
        checkViewportWidth();
    });

    window.addEventListener('orientationchange', () => {
        const grid = document.querySelector('.dashboard-grid');
        if (grid) delete grid.dataset.fixed;
        setTimeout(checkViewportWidth, 100);
        setTimeout(checkViewportWidth, 600); // Wait for rotation animation
    });

    // Initial check immediate and delayed
    checkViewportWidth();
    setTimeout(checkViewportWidth, 500);

    // 5. Handle External Navigation Actions (Profile / Security)
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action === 'profile') {
        setTimeout(() => {
            if (window.openMyProfile) window.openMyProfile();
        }, 800);
    } else if (action === 'security') {
        setTimeout(() => {
            if (window.openMyProfile) {
                window.openMyProfile();
                setTimeout(() => {
                    if (window.switchProfileTab) window.switchProfileTab('security');
                }, 300);
            }
        }, 800);
    }

});

// ==========================================
// STUDENT COURSES LOGIC
// ==========================================
async function fetchStudentCourses(userId) {
    const container = document.getElementById("student-courses-list");
    if (!container) return;

    container.innerHTML = `
        <div style="text-align:center; padding:40px;">
            <div class="spinner-border text-info" role="status"></div>
            <p style="color:#aaa; margin-top:10px;">Cargando tus cursos...</p>
        </div>`;

    try {
        let res = await ApiService.getUserDetails(userId);

        // Retry logic for session sync if needed
        if (!res.success || !res.data || !res.data.enrolled || res.data.enrolled.length === 0) {
            const session = ApiService.getSession();
            if (session && session.email) {
                try {
                    const syncRes = await fetch(`/jacquin_api/get_user_by_email.php?email=${encodeURIComponent(session.email)}`);
                    const syncData = await syncRes.json();
                    if (syncData.success && syncData.user) {
                        res = await ApiService.getUserDetails(syncData.user.id_usuario);
                    }
                } catch (e) { console.log("[STUDENT SYNC] Failed."); }
            }
        }

        if (res.success && res.data && res.data.enrolled && res.data.enrolled.length > 0) {
            const courses = res.data.enrolled;
            const daysBase = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const dayLabels = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

            const groupedByCourse = {};
            courses.forEach(c => {
                if (!groupedByCourse[c.id_course]) {
                    groupedByCourse[c.id_course] = {
                        id_course: c.id_course,
                        name: c.name,
                        teacher: c.teacher_name || 'Sin asignar',
                        byDay: {}
                    };
                    daysBase.forEach(d => groupedByCourse[c.id_course].byDay[d] = []);
                }

                if (c.schedules && c.schedules.length > 0) {
                    c.schedules.forEach(s => {
                        const day = s.day_of_week || 'Sin asignar';
                        if (groupedByCourse[c.id_course].byDay[day]) {
                            groupedByCourse[c.id_course].byDay[day].push({
                                id: s.id_schedule,
                                time: s.start_time,
                                endTime: s.end_time
                            });
                        }
                    });
                }
            });

            container.innerHTML = Object.values(groupedByCourse).map((course, idx) => {
                const accordionId = `student-accordion-${course.id_course}-${idx}`;

                return `
                <div style="background:rgba(255,255,255,0.02); border-radius:16px; margin-bottom:15px; border: 1px solid rgba(255,255,255,0.05); overflow:hidden;">
                    <div onclick="toggleStudentCourse('${accordionId}', this)" 
                         style="padding:20px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <div style="width:45px; height:45px; background:linear-gradient(135deg, rgba(52,152,219,0.2), rgba(52,152,219,0.05)); border-radius:12px; display:flex; align-items:center; justify-content:center;">
                                <i class="bi bi-music-note-beamed" style="color:var(--color-acento-azul); font-size:1.2rem;"></i>
                            </div>
                            <div>
                                <span style="color:white; font-weight:600; font-size:1.1rem; display:block;">${course.name}</span>
                                <span style="color:rgba(255,255,255,0.4); font-size:0.8rem;">Prof: ${course.teacher}</span>
                            </div>
                        </div>
                        <i class="bi bi-chevron-down chevron" style="color:rgba(255,255,255,0.3); transition:all 0.3s ease;"></i>
                    </div>
                    
                    <div id="${accordionId}" style="display:none; padding:0 20px 20px 20px; border-top:1px solid rgba(255,255,255,0.05);">
                        <div style="margin-top:15px;">
                            <div style="font-size: 0.8rem; color: var(--color-acento-azul); margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                                <i class="bi bi-calendar3"></i> Tu Horario Semanal <span style="opacity:0.6;">(Click para ver tus compañeros)</span>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">
                                ${daysBase.map((day, dIdx) => `
                                    <div style="text-align: center;">
                                        <div style="font-size: 0.7rem; color: var(--color-acento-azul); background: rgba(52, 152, 219, 0.1); padding: 5px; border-radius: 6px; font-weight: 700; margin-bottom: 8px;">
                                            ${dayLabels[dIdx]}
                                        </div>
                                        ${course.byDay[day].length > 0 ? course.byDay[day].sort((a, b) => a.time.localeCompare(b.time)).map(s => `
                                            <div onclick="showStudentScheduleClassmates(${s.id}, '${course.name.replace(/'/g, "\\'")}', '${day} ${ApiService.formatTime(s.time)}')"
                                                 style="background: linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(52, 152, 219, 0.05)); padding: 10px 5px; border-radius: 8px; margin-bottom: 6px; border: 1px solid rgba(52, 152, 219, 0.3); cursor: pointer; transition: all 0.2s;" onmouseover="this.style.transform='scale(1.05)'; this.style.borderColor='var(--color-acento-azul)'" onmouseout="this.style.transform='scale(1)'; this.style.borderColor='rgba(52, 152, 219, 0.3)'">
                                                <div style="font-size: 0.75rem; color: white; font-weight: 700;">${ApiService.formatTime(s.time)}</div>
                                                <div style="font-size: 0.6rem; color: rgba(255,255,255,0.4);">${ApiService.formatTime(s.endTime)}</div>
                                            </div>
                                        `).join('') : `
                                            <div style="height: 50px; border: 1px dashed rgba(255,255,255,0.05); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.05);">
                                                <i class="bi bi-dash-lg"></i>
                                            </div>
                                        `}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        } else {
            container.innerHTML = `
                <div style="text-align:center; padding:50px; background:rgba(255,255,255,0.02); border-radius:15px; color:#666; border:1px dashed rgba(255,255,255,0.1);">
                    <i class="bi bi-music-note-list" style="font-size:3rem; color:rgba(255,255,255,0.1); display:block; margin-bottom:15px;"></i>
                    <p style="margin:0; font-size:1.1rem;">No tienes cursos inscritos.</p>
                    <p style="font-size:0.85rem; opacity:0.7;">Explora nuestra oferta y comienza tu viaje musical.</p>
                </div>`;
        }
    } catch (e) {
        console.error('Error fetching student courses:', e);
        container.innerHTML = '<p style="color:#e74c3c; text-align:center;">Error al cargar tus cursos.</p>';
    }
}

// Helpers para el dashboard del estudiante
window.toggleStudentCourse = function (id, el) {
    const target = document.getElementById(id);
    const isHidden = target.style.display === 'none';
    target.style.display = isHidden ? 'block' : 'none';
    el.querySelector('.chevron').style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    el.parentElement.style.background = isHidden ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)';
};

window.showStudentScheduleClassmates = async function (scheduleId, courseName, timeLabel) {
    Swal.fire({
        title: 'Cargando Compañeros...',
        html: '<div class="spinner-border text-info" role="status"></div>',
        showConfirmButton: false,
        background: '#1a1a2e',
        color: '#fff'
    });

    try {
        const res = await ApiService.getAcademicData('get_schedule_students', { schedule_id: scheduleId });
        if (res.success && res.data) {
            const students = res.data;
            let html = `
                <div style="text-align: left; max-height: 400px; overflow-y: auto; padding-right: 5px;">
                    <p style="color:rgba(255,255,255,0.5); font-size: 0.9rem; margin-bottom: 20px;">
                        Curso: <strong style="color:white;">${courseName}</strong><br>
                        Horario: <strong style="color:var(--color-acento-azul);">${timeLabel}</strong>
                    </p>
                    ${students.length <= 1 ? '<p style="text-align:center; padding:20px; color:#888;">No tienes compañeros inscritos aún en este horario.</p>' : `
                        <div style="display: grid; gap: 8px;">
                            ${students.map((s, i) => `
                                <div style="display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                                    <div style="width: 35px; height: 35px; border-radius: 50%; overflow: hidden; border: 1px solid rgba(255,255,255,0.2);">
                                        <img src="${s.avatar_url ? (s.avatar_url.startsWith('http') ? s.avatar_url : ApiService.BASE_URL + s.avatar_url) : 'assets/images/default_avatar.svg'}" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                    <div style="flex:1;">
                                        <div style="color:white; font-size:0.95rem; font-weight:600;">${s.full_name}</div>
                                        <div style="color:rgba(255,255,255,0.4); font-size:0.75rem;">Compañero</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>`;

            Swal.fire({
                title: 'Mis Compañeros',
                html: html,
                width: '500px',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#3498db',
                background: '#1a1a2e',
                color: '#fff'
            });
        }
    } catch (e) {
        Swal.fire('Error', 'No se pudieron cargar los compañeros', 'error');
    }
}

// ==========================================
// TEACHER COURSES LOGIC
// ==========================================
async function fetchTeacherCourses(userId) {
    const container = document.getElementById("teacher-courses-list");
    const countBadge = document.getElementById("teacher-courses-count");
    if (!container) return;

    container.innerHTML = `
        <div style="text-align:center; padding:40px;">
            <div class="spinner-border text-warning" role="status"></div>
            <p style="color:#aaa; margin-top:10px;">Cargando tus cursos...</p>
        </div>`;

    try {
        const res = await ApiService.getUserDetails(userId);
        if (res.success && res.data && res.data.teaching && res.data.teaching.length > 0) {
            const courses = res.data.teaching;
            if (countBadge) countBadge.textContent = `${courses.length} curso${courses.length > 1 ? 's' : ''}`;

            const daysBase = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const dayLabels = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

            container.innerHTML = courses.map((course, idx) => {
                const byDay = {};
                daysBase.forEach(d => byDay[d] = []);

                let totalSlots = 0;
                if (course.schedules && course.schedules.length > 0) {
                    course.schedules.forEach(s => {
                        const day = s.day_of_week || 'Sin asignar';
                        if (byDay[day]) {
                            byDay[day].push({
                                id: s.id_schedule,
                                time: s.start_time,
                                endTime: s.end_time,
                                students: s.student_count || 0,
                                quota: s.quota || 15
                            });
                            totalSlots++;
                        }
                    });
                }

                const accordionId = `teacher-accordion-${course.id_course}-${idx}`;

                return `
                <div style="background:rgba(255,255,255,0.02); border-radius:16px; margin-bottom:15px; border: 1px solid rgba(255,255,255,0.05); overflow:hidden;">
                    <div onclick="toggleTeacherCourse('${accordionId}', this)" 
                         style="padding:20px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <div style="width:45px; height:45px; background:linear-gradient(135deg, rgba(230,126,34,0.2), rgba(230,126,34,0.05)); border-radius:12px; display:flex; align-items:center; justify-content:center;">
                                <i class="bi bi-music-note-beamed" style="color:var(--color-acento-naranja); font-size:1.2rem;"></i>
                            </div>
                            <div>
                                <span style="color:white; font-weight:600; font-size:1.1rem; display:block;">${course.name}</span>
                                <span style="color:rgba(255,255,255,0.4); font-size:0.8rem;">Click para ver horarios</span>
                            </div>
                        </div>
                        <i class="bi bi-chevron-down chevron" style="color:rgba(255,255,255,0.3); transition:all 0.3s ease;"></i>
                    </div>
                    
                    <div id="${accordionId}" style="display:none; padding:0 20px 20px 20px; border-top:1px solid rgba(255,255,255,0.05);">
                        <div style="margin-top:15px;">
                            <div style="font-size: 0.8rem; color: #2ecc71; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                                <i class="bi bi-calendar3"></i> Horario Semanal <span style="opacity:0.6;">(Click en un horario para ver alumnos)</span>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">
                                ${daysBase.map((day, dIdx) => `
                                    <div style="text-align: center;">
                                        <div style="font-size: 0.7rem; color: var(--color-acento-azul); background: rgba(52, 152, 219, 0.1); padding: 5px; border-radius: 6px; font-weight: 700; margin-bottom: 8px;">
                                            ${dayLabels[dIdx]}
                                        </div>
                                        ${byDay[day].length > 0 ? byDay[day].sort((a, b) => a.time.localeCompare(b.time)).map(s => `
                                            <div onclick="showTeacherScheduleStudents(${s.id}, '${course.name.replace(/'/g, "\\'")}', '${day} ${ApiService.formatTime(s.time)}')"
                                                 style="background: linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(52, 152, 219, 0.05)); padding: 10px 5px; border-radius: 8px; margin-bottom: 6px; border: 1px solid rgba(52, 152, 219, 0.3); cursor: pointer; transition: all 0.2s;" onmouseover="this.style.transform='scale(1.05)'; this.style.borderColor='var(--color-acento-azul)'" onmouseout="this.style.transform='scale(1)'; this.style.borderColor='rgba(52, 152, 219, 0.3)'">
                                                <div style="font-size: 0.75rem; color: white; font-weight: 700;">${ApiService.formatTime(s.time)}</div>
                                                <div style="font-size: 0.65rem; color: rgba(255,255,255,0.5);">${ApiService.formatTime(s.endTime)}</div>
                                                <div style="margin-top: 5px; font-size: 0.6rem; background: rgba(0,0,0,0.3); border-radius: 4px; padding: 2px; color: var(--color-acento-naranja);">
                                                    ${s.students}/${s.quota} <i class="bi bi-people-fill"></i>
                                                </div>
                                            </div>
                                        `).join('') : `
                                            <div style="height: 60px; border: 1px dashed rgba(255,255,255,0.05); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.1);">
                                                <i class="bi bi-dash-lg"></i>
                                            </div>
                                        `}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        } else {
            container.innerHTML = `
                <div style="text-align:center; padding:50px; background:rgba(255,255,255,0.02); border-radius:15px; color:#666; border:1px dashed rgba(255,255,255,0.1);">
                    <i class="bi bi-journal-x" style="font-size:3rem; color:rgba(255,255,255,0.1); display:block; margin-bottom:15px;"></i>
                    <p style="margin:0; font-size:1.1rem;">No tienes cursos asignados.</p>
                    <p style="font-size:0.85rem; opacity:0.7;">Contacta a administración para tu asignación.</p>
                </div>`;
            if (countBadge) countBadge.textContent = '0 cursos';
        }
    } catch (e) {
        console.error('Error fetching teacher courses:', e);
        container.innerHTML = '<p style="color:#e74c3c; text-align:center;">Error al conectar con el servidor académico.</p>';
    }
}

// Helpers para el dashboard del profesor
window.toggleTeacherCourse = function (id, el) {
    const target = document.getElementById(id);
    const isHidden = target.style.display === 'none';
    target.style.display = isHidden ? 'block' : 'none';
    el.querySelector('.chevron').style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    el.parentElement.style.background = isHidden ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)';
};

window.showTeacherScheduleStudents = async function (scheduleId, courseName, timeLabel) {
    Swal.fire({
        title: 'Cargando Estudiantes...',
        html: '<div class="spinner-border text-info" role="status"></div>',
        showConfirmButton: false,
        background: '#1a1a2e',
        color: '#fff'
    });

    try {
        const res = await ApiService.getAcademicData('get_schedule_students', { schedule_id: scheduleId });
        if (res.success && res.data) {
            const students = res.data;
            let html = `
                <div style="text-align: left; max-height: 400px; overflow-y: auto; padding-right: 5px;">
                    <p style="color:rgba(255,255,255,0.5); font-size: 0.9rem; margin-bottom: 20px;">
                        Curso: <strong style="color:white;">${courseName}</strong><br>
                        Horario: <strong style="color:var(--color-acento-azul);">${timeLabel}</strong>
                    </p>
                    ${students.length === 0 ? '<p style="text-align:center; padding:20px; color:#888;">No hay alumnos inscritos.</p>' : `
                        <div style="display: grid; gap: 8px;">
                            ${students.map((s, i) => `
                                <div style="display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.05); padding:10px 15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                                    <div style="color:var(--color-acento-azul); font-weight:700; width: 20px;">${i + 1}</div>
                                    <div style="width: 35px; height: 35px; border-radius: 50%; overflow: hidden; border: 1px solid rgba(255,255,255,0.2);">
                                        <img src="${s.avatar_url ? (s.avatar_url.startsWith('http') ? s.avatar_url : ApiService.BASE_URL + s.avatar_url) : '../assets/images/default_avatar.svg'}" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                    <div style="flex:1;">
                                        <div style="color:white; font-size:0.95rem; font-weight:600;">${s.full_name}</div>
                                        <div style="color:rgba(255,255,255,0.4); font-size:0.75rem;">${s.email || 'Sin correo'}</div>
                                    </div>
                                    <button onclick="Swal.close(); window.openProfile(${s.id_usuario}, 'academic')" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:var(--color-acento-azul); width:35px; height:35px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='rgba(147,182,238,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                                        <i class="bi bi-eye"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>`;

            Swal.fire({
                title: 'Alumnos Inscritos',
                html: html,
                width: '550px',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#3498db',
                background: '#1a1a2e',
                color: '#fff',
                didOpen: () => {
                    // Ensure profile modal is ready if needed
                }
            });
        } else {
            Swal.fire('Atención', res.message || 'No se pudieron recuperar los alumnos.', 'warning');
        }
    } catch (e) {
        console.error("Student list error:", e);
        Swal.fire('Error', 'Error interno al procesar la lista.', 'error');
    }
};

// Teacher Course Detail Overlay
function openTeacherCourseOverlay(course) {
    let overlay = document.getElementById('teacher-course-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'teacher-course-overlay';
        overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10002; display:flex; justify-content:center; align-items:center; opacity:0; transition:opacity 0.3s;";
        overlay.onclick = (e) => { if (e.target === overlay) closeTeacherCourseOverlay(); };
        document.body.appendChild(overlay);
    }

    // Build schedule list with student counts
    let scheduleHtml = '<div style="color:#666; font-style:italic;">No hay horarios registrados.</div>';
    if (course.schedules && course.schedules.length > 0) {
        scheduleHtml = course.schedules.map(s => `
            <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:8px; margin-bottom:8px; border-left:3px solid var(--color-acento-naranja);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <span style="font-weight:bold; color:var(--color-acento-naranja);">${s.day_of_week}</span>
                        <span style="color:white; margin-left:10px;">${ApiService.formatTime(s.start_time)} - ${ApiService.formatTime(s.end_time)}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="color:#888; font-size:0.85rem;"><i class="bi bi-people"></i> ${s.student_count}/${s.quota}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    overlay.innerHTML = `
        <div style="background:#1e1e1e; width:90%; max-width:500px; border-radius:15px; overflow:hidden; border:1px solid #333; box-shadow:0 0 40px rgba(0,0,0,0.5); transform:scale(0.9); transition:transform 0.3s;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg, rgba(230, 126, 34, 0.8), rgba(211, 84, 0, 0.8)); padding:25px; color:white; position:relative;">
                <button onclick="closeTeacherCourseOverlay()" style="position:absolute; top:15px; right:15px; background:none; border:none; color:white; font-size:1.5rem; cursor:pointer; opacity:0.7;">&times;</button>
                <h2 style="margin:0 0 5px 0; font-size:1.5rem;">${course.name}</h2>
                <p style="margin:0; opacity:0.8; font-size:0.9rem;"><i class="bi bi-people-fill"></i> ${course.total_students} alumno${course.total_students !== 1 ? 's' : ''} en total</p>
            </div>
            
            <!-- Content -->
            <div style="padding:25px;">
                <h4 style="color:white; margin:0 0 15px 0; font-size:1rem;"><i class="bi bi-calendar-week"></i> Mis Horarios</h4>
                ${scheduleHtml}
                
                <div style="margin-top:20px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.1);">
                    <button onclick="window.contactAdmin('${course.name}')" style="width:100%; background:var(--color-acento-naranja); color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:bold;">
                        <i class="bi bi-envelope"></i> Reportar Inconsistencia
                    </button>
                </div>
            </div>
        </div>
    `;

    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.style.opacity = '1';
        overlay.querySelector('div').style.transform = 'scale(1)';
    }, 10);
}

window.closeTeacherCourseOverlay = function () {
    const overlay = document.getElementById('teacher-course-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 300);
    }
};

// Contact Admin Function
window.contactAdmin = function (courseName = '') {
    const user = ApiService.getSession();
    const subject = courseName
        ? `Reporte de Inconsistencia - ${courseName}`
        : 'Contacto desde Panel Docente';

    Swal.fire({
        title: '<i class="bi bi-envelope-paper"></i> Contactar Administración',
        html: `
            <div style="text-align:left; color:#333;">
                <p style="margin-bottom:15px;">Envía un mensaje al equipo administrativo.</p>
                <label style="display:block; margin-bottom:5px; font-weight:bold;">Asunto:</label>
                <input id="swal-subject" class="swal2-input" value="${subject}" style="margin:0 0 15px 0; width:100%;">
                <label style="display:block; margin-bottom:5px; font-weight:bold;">Mensaje:</label>
                <textarea id="swal-message" class="swal2-textarea" placeholder="Describe el problema o consulta..." style="margin:0; width:100%; height:120px;"></textarea>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: 'var(--color-acento-naranja)',
        preConfirm: () => {
            const subjectVal = document.getElementById('swal-subject').value;
            const messageVal = document.getElementById('swal-message').value;
            if (!messageVal.trim()) {
                Swal.showValidationMessage('Por favor escribe un mensaje');
                return false;
            }
            return { subject: subjectVal, message: messageVal };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            // Send to backend
            const res = await ApiService.sendContactMessage({
                name: user.full_name,
                email: user.email,
                subject: result.value.subject,
                message: result.value.message,
                source: 'teacher_dashboard'
            });

            if (res.success) {
                showToast('Mensaje enviado correctamente. Recibirás respuesta pronto.', 'success');
            } else {
                showToast('Error al enviar: ' + (res.message || 'Intenta de nuevo'), 'error');
            }
        }
    });
};

// Course Detail Overlay
function openCourseDetailOverlay(course) {
    let overlay = document.getElementById('course-detail-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'course-detail-overlay';
        overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10002; display:flex; justify-content:center; align-items:center; opacity:0; transition:opacity 0.3s;";
        overlay.onclick = (e) => { if (e.target === overlay) closeCourseOverlay(); };
        document.body.appendChild(overlay);
    }

    // Build schedule list
    let scheduleHtml = '<div style="color:#666; font-style:italic;">No hay horarios registrados.</div>';
    if (course.schedules && course.schedules.length > 0) {
        scheduleHtml = course.schedules.map(s => `
            <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:8px; margin-bottom:8px; border-left:3px solid var(--color-acento-azul);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:bold; color:var(--color-acento-azul);">${s.day_of_week}</span>
                    <span style="color:white;">${ApiService.formatTime(s.start_time)} - ${ApiService.formatTime(s.end_time)}</span>
                </div>
            </div>
        `).join('');
    }

    overlay.innerHTML = `
        <div style="background:#1e1e1e; width:90%; max-width:450px; border-radius:15px; overflow:hidden; border:1px solid #333; box-shadow:0 0 40px rgba(0,0,0,0.5); transform:scale(0.9); transition:transform 0.3s;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg, #1e3c72, #2a5298); padding:25px; color:white; position:relative;">
                <button onclick="closeCourseOverlay()" style="position:absolute; top:15px; right:15px; background:none; border:none; color:white; font-size:1.5rem; cursor:pointer; opacity:0.7;">&times;</button>
                <h2 style="margin:0 0 5px 0; font-size:1.5rem;">${course.name}</h2>
                <p style="margin:0; opacity:0.8; font-size:0.9rem;"><i class="bi bi-person-video3"></i> Prof. ${course.teacher_name || 'Por asignar'}</p>
            </div>
            
            <!-- Content -->
            <div style="padding:25px;">
                <h4 style="color:white; margin:0 0 15px 0; font-size:1rem;"><i class="bi bi-calendar-week"></i> Mis Horarios</h4>
                ${scheduleHtml}
                
                <div style="margin-top:20px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.1);">
                    <p style="color:#888; font-size:0.85rem; margin:0;"><i class="bi bi-info-circle"></i> Si necesitas cambiar de horario, contacta a administración.</p>
                </div>
            </div>
        </div>
    `;

    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.style.opacity = '1';
        overlay.querySelector('div').style.transform = 'scale(1)';
    }, 10);
}

window.closeCourseOverlay = function () {
    const overlay = document.getElementById('course-detail-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 300);
    }
};

function getRoleName(id) {
    switch (id) {
        case 1: return "Admin";
        case 2: return "Docente";
        case 3: return "Estudiante";
        case 5: return "Colaborador";
        default: return "Usuario";
    }
}

// ==========================================
// PROFILE MODAL (Enhanced with Tabs & Security)
// ==========================================
/**
 * PRE-REQUISITE: window.openMyProfile is now handled globally in user_profile_modal.js
 * to ensure the Premium Unified Modal is used consistently.
 */

window.handleProfileUpdate = async function (e) {
    e.preventDefault();
    const form = e.target;
    const user = ApiService.getSession();
    const fullName = form.fullName.value;
    const nPhone = form.nPhone.value;

    const res = await ApiService.updateProfile(user.id_usuario, fullName, nPhone);
    if (res.success) {
        user.full_name = fullName;
        user.n_phone = nPhone;
        ApiService.saveSession(user);
        await showToast("¡Perfil actualizado con éxito!", "success");
        window.location.reload();
    } else {
        showToast("Hubo un problema al actualizar: " + res.message, "error");
    }
};

window.handlePasswordChange = async function (e) {
    e.preventDefault();
    const form = e.target;
    const user = ApiService.getSession();
    const current = form.currentPassword.value;
    const newVal = form.newPassword.value;
    const confirm = form.confirmPassword.value;

    if (newVal !== confirm) return showToast("Las contraseñas no coinciden.", "warning");
    if (newVal.length < 8) return showToast("La nueva contraseña debe tener al menos 8 caracteres.", "warning");

    const res = await ApiService.changePassword(user.id_usuario, current, newVal);
    if (res.success) {
        await showToast("Contraseña modificada exitosamente.", "success");
        form.reset();
        switchProfileTab('info');
    } else {
        showToast("Error al cambiar contraseña: " + res.message, "error");
    }
};

// ==========================================
// DYNAMIC LOADERS
// ==========================================

async function loadUsers() {
    const container = document.getElementById("directory-container");
    if (!container) return;

    container.innerHTML = '<div style="color:white; text-align:center;">Cargando directorio...</div>';

    const res = await ApiService.getUsers();
    if (res.success) {
        const users = res.data;
        const teachers = users.filter(u => u.id_rol == 2);

        container.innerHTML = teachers.map(t => `
            <div class="card-glass" style="text-align:center;">
                <img src="${t.avatar_url ? (t.avatar_url.startsWith('http') ? t.avatar_url : ApiService.BASE_URL + t.avatar_url) : 'assets/images/default_avatar.svg'}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:10px;">
                <h4 style="color:white; margin:0;">${t.full_name}</h4>
                <p style="color:#aaa;">Docente</p>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<div style="color:#666;">No disponible para tu rol.</div>';
    }
}

async function loadCourses() {
    const container = document.getElementById("academic-container");
    if (!container) return;

    const res = await ApiService.getCourses();
    if (res.success) {
        container.innerHTML = res.data.map(c => {
            const pendingBadge = (c.pending_count > 0 && ApiService.getSession().id_rol == 1)
                ? `<div style="position:absolute; top:10px; right:10px; background:#e74c3c; color:white; font-size:0.75rem; font-weight:bold; padding:2px 8px; border-radius:10px; box-shadow:0 2px 5px rgba(0,0,0,0.3); z-index:2;">${c.pending_count} Solicitud${c.pending_count > 1 ? 'es' : ''}</div>`
                : '';

            return `
             <div class="card-glass glow-hover" onclick="showCourseModal(${c.id_course}, '${c.name.replace(/'/g, "\\'")}', '${c.description.replace(/'/g, "\\'")}')" style="cursor:pointer; position:relative;">
                ${pendingBadge}
                <div style="height:120px; background:#333; margin:-1.5rem -1.5rem 1rem -1.5rem; border-radius:20px 20px 0 0; overflow:hidden;">
                    <img src="${c.image_url || 'assets/piano.jpg'}" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <h3 style="color:white; margin-bottom:10px;">${c.name}</h3>
                <p style="color:#aaa; font-size:0.9rem; line-height:1.4;">${c.description.substring(0, 80)}...</p>
             </div>
        `}).join('');
    }
}

// [window.openCourseManagement moved to admin_shared_academic.js]

window.showCourseModal = async function (id, name, desc) {
    const session = ApiService.getSession();
    const isStudent = session.id_rol == 3;

    try {
        const schedRes = await ApiService.getSchedules(id);
        const schedules = schedRes.success ? schedRes.data : [];

        const modalId = "course-detail-modal";
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = document.createElement("div");
            modal.id = modalId;
            modal.className = "modal-overlay";
            modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10000; display:flex; justify-content:center; align-items:center;";
            document.body.appendChild(modal);
        }

        const schedHtml = schedules.map(s => `
        <div style="background:rgba(255,255,255,0.05); padding:10px; margin-bottom:5px; border-radius:5px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong style="color:var(--color-acento-naranja);">${s.day}</strong>
                <span style="color:white; margin-left:10px;">${ApiService.formatTime(s.time_start)} - ${ApiService.formatTime(s.time_end)}</span>
                <div style="font-size:0.8rem; color:#888;">Prof: ${s.teacher_name || 'TBA'}</div>
            </div>
            ${isStudent ? `<button onclick="requestEnroll(${id}, ${s.id_schedule})" style="background:var(--color-acento-azul); color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Seleccionar</button>` : ''}
        </div>
    `).join('');

        modal.innerHTML = `
        <div style="background:#1e1e1e; padding:30px; border-radius:15px; width:90%; max-width:600px; max-height:80vh; overflow-y:auto; border:1px solid #333;">
            <button onclick="document.getElementById('${modalId}').style.display='none'" style="float:right; background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
            <h2 style="color:white; margin-top:0;">${name}</h2>
            <p style="color:#ccc; line-height:1.6; margin-bottom:20px;">${desc}</p>
            
            <h4 style="color:var(--color-acento-azul);">Horarios Disponibles</h4>
            <div style="margin-bottom:20px;">
                ${schedHtml || '<div style="color:#666;">No hay horarios definidos para este curso.</div>'}
            </div>
            
            ${isStudent ? `
                <p style="color:#888; font-size:0.75rem; text-align:center; line-height:1.4; border-top:1px solid #333; padding-top:15px;">
                    <i class="bi bi-info-circle"></i> Los docentes son asignados por la administración según el horario elegido.
                </p>
            ` : ''}
        </div>
    `;
        modal.style.display = "flex";
    } catch (error) {
        console.error("Error showing course modal:", error);
        showToast("No se pudieron cargar los horarios en este momento.", "error");
    }
};

window.requestEnroll = async function (courseId, scheduleId) {
    if (!(await showConfirm("¿Confirmar este horario para tu inscripción?"))) return;

    const user = ApiService.getSession();
    const res = await ApiService.requestEnrollment(user.id_usuario, courseId, scheduleId);

    if (res.success) {
        await showToast("Tu solicitud ha sido enviada con éxito.", "success");
        const m = document.getElementById("course-detail-modal");
        if (m) m.style.display = 'none';
        window.location.reload();
    } else {
        showToast("No se pudo procesar la solicitud: " + res.message, "error");
    }
};

// ==========================================
// NOTE: fetchStudentCourses is defined earlier in the file (line ~246) and uses res.data.enrolled
// This duplicate was causing bugs - DO NOT RE-ADD


window.editEnrollment = function (idEnrollment, courseId, name) {
    // Reuse showCourseModal logic for students to select a NEW schedule
    window.showCourseModal(courseId, name, "Selecciona tu nuevo horario preferido.");
};

window.cancelEnrollment = async function (idEnrollment, name) {
    if (!(await showConfirm(`¿Estás seguro de que deseas cancelar tu inscripción en ${name}?`))) return;

    const res = await ApiService.unenrollStudent(idEnrollment);
    if (res.success) {
        await showToast("Inscripción cancelada correctamente.", "success");
        window.location.reload();
    } else {
        showToast("Error al cancelar: " + res.message, "error");
    }
};


// ==========================================
// ADMIN: COURSE MANAGEMENT UI
// ==========================================

// [window.openCourseManagement moved to admin_shared_academic.js]

// [window.openCourseDetails moved to admin_shared_academic.js]

// Global definition to avoid scope issues
// [window.switchTab moved to admin_shared_academic.js]

// [window.processRequest moved to admin_shared_academic.js]

// [window.unenrollStudentAdmin moved to admin_shared_academic.js]

// [window.assignTeacherModal moved to admin_shared_academic.js]

// [window.editSchedule moved to admin_shared_academic.js]




// HERO IMAGE MANAGER (Visual Cropper)
// ==========================================

// [window.assignStudentSchedule moved to admin_shared_academic.js]

window.openHeroManager = function () {
    const modalId = "hero-manager-modal";
    let modal = document.getElementById(modalId);

    // Config vars
    let cropX = 0, cropY = 0, scale = 1, minScale = 1;
    let dragStart = { x: 0, y: 0 };
    let isDragging = false;
    let imgWidth = 0, imgHeight = 0;

    // Viewport Size (16:9 fixed)
    const VP_W = 480;
    const VP_H = 270;

    if (!modal) {
        modal = document.createElement("div");
        modal.id = modalId;
        modal.className = "modal-overlay";
        Object.assign(modal.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.9)', zIndex: '10000',
            display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: '0', transition: 'opacity 0.3s'
        });
        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.style.opacity = '1');
    }

    const currentSrc = "images/hero-banner.jpg?t=" + new Date().getTime();

    modal.innerHTML = `
        <div style="background:#1a1a1a; padding:0; border-radius:16px; width:95%; max-width:550px; overflow:hidden; box-shadow:0 30px 60px rgba(0,0,0,0.8); border:1px solid #333;">
             <div style="padding:20px 25px; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center; background:#222;">
                <h3 style="color:white; margin:0; font-size:1.1rem; display:flex; align-items:center; gap:10px;">
                    <i class="bi bi-crop" style="color:var(--color-acento-azul)"></i> Editor de Portada
                </h3>
                <button onclick="document.getElementById('${modalId}').style.display='none'" style="background:none; border:none; color:#777; font-size:1.5rem; cursor:pointer;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#777'">&times;</button>
            </div>
            <div style="padding:25px; background:#111; text-align:center;">
                <div id="crop-container" style="width: ${VP_W}px; height: ${VP_H}px; margin: 0 auto; background: #000; border: 2px solid var(--color-acento-azul); border-radius: 8px; overflow: hidden; position: relative; cursor: grab; box-shadow: 0 0 20px rgba(0,0,0,0.5); box-sizing: content-box;">
                    <div id="crop-instruction" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#555; pointer-events:none; z-index:10;"><i class="bi bi-arrows-move"></i> Arrastra para ajustar</div>
                    <img id="crop-target" src="${currentSrc}" style="transform-origin:top left; position:absolute; top:0; left:0; pointer-events:none; user-select:none;">
                </div>
                <div id="crop-controls" style="margin-top:20px; display:none; align-items:center; justify-content:center; gap:15px;">
                    <i class="bi bi-zoom-in" style="color:#777"></i>
                    <input type="range" id="crop-zoom" min="1" max="3" step="0.01" value="1" style="width:200px; accent-color:var(--color-acento-azul);">
                </div>
                <input type="file" id="hero-upload-input" accept="image/*" style="display:none;">
                <div style="margin-top:25px; display:flex; gap:10px; justify-content:center;">
                    <button onclick="document.getElementById('hero-upload-input').click()" style="background:#333; color:#ccc; border:1px solid #444; padding:10px 20px; border-radius:50px; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:0.9rem;" onmouseover="this.style.background='#444';this.style.color='white'" onmouseout="this.style.background='#333';this.style.color='#ccc'"><i class="bi bi-image"></i> Elegir Otra Foto</button>
                    <button id="btn-save-hero" onclick="uploadHero()" disabled style="background:var(--color-acento-azul); color:white; border:none; padding:10px 30px; border-radius:50px; font-weight:bold; cursor:pointer; opacity:0.5; pointer-events:none; box-shadow:0 4px 15px rgba(52, 152, 219, 0.3); display:flex; align-items:center; gap:8px; font-size:0.9rem;"><i class="bi bi-check-lg"></i> Guardar Recorte</button>
                </div>
            </div>
             <div style="padding:15px; background:#1a1a1a; border-top:1px solid #333; text-align:center;">
                <p style="margin:0; font-size:0.8rem; color:#666;"><i class="bi bi-info-circle"></i> Sube y ajusta manualmente.</p>
            </div>
        </div>
    `;

    // --- LOGIC ---
    const imgEl = document.getElementById('crop-target');
    const container = document.getElementById('crop-container');
    const zoomSlider = document.getElementById('crop-zoom');
    const btnSave = document.getElementById('btn-save-hero');
    const instructions = document.getElementById('crop-instruction');
    const controls = document.getElementById('crop-controls');

    // File Input Handler
    document.getElementById('hero-upload-input').onchange = function (e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function (evt) {
                imgEl.src = evt.target.result;
                imgEl.onload = function () { initCropper(); }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    function initCropper() {
        imgWidth = imgEl.naturalWidth;
        imgHeight = imgEl.naturalHeight;
        const scaleW = VP_W / imgWidth;
        const scaleH = VP_H / imgHeight;
        minScale = Math.max(scaleW, scaleH);
        scale = minScale;
        cropX = (VP_W - (imgWidth * scale)) / 2;
        cropY = (VP_H - (imgHeight * scale)) / 2;
        updateTransform();
        zoomSlider.min = minScale;
        zoomSlider.max = minScale * 3;
        zoomSlider.value = scale;
        controls.style.display = "flex";
        instructions.style.display = "block";
        btnSave.disabled = false;
        btnSave.style.opacity = "1";
        btnSave.style.pointerEvents = "auto";
    }

    function updateTransform() {
        const maxX = 0;
        const minX = VP_W - (imgWidth * scale);
        const maxY = 0;
        const minY = VP_H - (imgHeight * scale);
        if (cropX > maxX) cropX = maxX;
        if (cropX < minX) cropX = minX;
        if (cropY > maxY) cropY = maxY;
        if (cropY < minY) cropY = minY;
        imgEl.style.transform = `translate(${cropX}px, ${cropY}px) scale(${scale})`;
    }

    container.onmousedown = (e) => { isDragging = true; dragStart = { x: e.clientX - cropX, y: e.clientY - cropY }; container.style.cursor = "grabbing"; instructions.style.display = "none"; };
    window.onmousemove = (e) => { if (!isDragging) return; cropX = e.clientX - dragStart.x; cropY = e.clientY - dragStart.y; updateTransform(); };
    window.onmouseup = () => { isDragging = false; container.style.cursor = "grab"; };
    zoomSlider.oninput = (e) => { scale = parseFloat(e.target.value); updateTransform(); };



    window.uploadHero = async function () {
        const input = document.getElementById('hero-upload-input');
        const btn = document.getElementById('btn-save-hero');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="bi bi-cloud-arrow-up-fill"></i> Procesando...`;
        btn.disabled = true;

        const file = input.files[0];
        const payload = {
            crop_x: -cropX / scale,
            crop_y: -cropY / scale,
            crop_w: VP_W / scale,
            crop_h: VP_H / scale
        };

        if (!file) return;

        try {
            const res = await ApiService.updateHeroImage(file, payload);
            if (res.success) {
                modal.style.display = "none";
                await showToast("¡Portada actualizada con éxito!", "success");
            } else {
                await showToast("Error: " + res.message, "error");
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        } catch (e) {
            console.error(e);
            await showToast("Error de red", "error");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };
};

// ==========================================
// ADMIN ALERTS & INDICATORS
// ==========================================
window.checkPendingRequests = async function () {
    const session = ApiService.getSession();
    if (!session || session.id_rol != 1) return;

    try {
        const res = await ApiService.getPendingEnrollments();

        if (res.success) {
            const requests = res.data;
            const count = requests.length;

            // 1. Update Badge on Academic Card
            const modAcademic = document.getElementById("mod-academic");
            if (modAcademic) {
                const existing = modAcademic.querySelector(".admin-badge");
                if (existing) existing.remove();

                if (count > 0) {
                    const badge = document.createElement("div");
                    badge.className = "admin-badge";
                    badge.style.cssText = `
                        position: absolute; top: 12px; right: 12px;
                        background: linear-gradient(135deg, #ff9f43, #ee5253);
                        color: white; min-width: 26px; height: 26px; border-radius: 13px;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 0.75rem; font-weight: 900; 
                        border: 2px solid rgba(255,255,255,0.4);
                        padding: 0 6px; box-shadow: 0 8px 20px rgba(238, 82, 83, 0.5);
                        animation: badge-float 3s infinite ease-in-out; z-index: 10;
                        pointer-events: none; text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                    `;
                    badge.innerHTML = count;
                    modAcademic.style.position = "relative";
                    modAcademic.appendChild(badge);
                }
            }

            // 2. Smart Persistent Notification (Top Banner) - MOUNTED IN CONTAINER
            let alertBar = document.getElementById("admin-smart-alert");
            const container = document.getElementById("admin-alert-container");

            if (count > 0 && container) {
                if (!alertBar) {
                    alertBar = document.createElement("div");
                    alertBar.id = "admin-smart-alert";
                    // RELATIVE POSITIONING
                    alertBar.style.cssText = `
                        display: inline-flex; align-items: center; gap: 15px;
                        background: rgba(26, 26, 26, 0.7); backdrop-filter: blur(20px);
                        border: 1px solid rgba(255, 159, 67, 0.4); padding: 10px 30px;
                        border-radius: 100px; color: white; margin: 0 auto;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 10px rgba(255, 159, 67, 0.1);
                        font-size: 0.95rem; opacity: 0; transform: translateY(-20px);
                        transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
                    `;
                    container.innerHTML = ""; // Clear just in case
                    container.appendChild(alertBar);

                    // Trigger animation
                    requestAnimationFrame(() => {
                        alertBar.style.opacity = "1";
                        alertBar.style.transform = "translateY(0)";
                    });
                }
                const pendientes = requests.filter(r => r.status === 'Pendiente').length;
                const pre = requests.filter(r => r.status === 'Pre-inscrito').length;

                alertBar.innerHTML = `
                    <div style="position:relative; display:flex; align-items:center; justify-content:center;">
                        <div style="background:#ff9f43; width:10px; height:10px; border-radius:50%;"></div>
                        <div style="position:absolute; background:#ff9f43; width:10px; height:10px; border-radius:50%; animation: pulse-alert 2s infinite;"></div>
                    </div>
                    <span style="letter-spacing:0.5px; color:#eee;">Tienes <strong style="color:#ff9f43; font-size:1.1rem;">${count}</strong> solicitudes por revisar</span>
                    <div style="width:1px; height:20px; background:rgba(255,255,255,0.1); margin:0 5px;"></div>
                    <button onclick="openPendingRequestsCenter()" style="background:#ff9f43; color:black; border:none; padding:6px 18px; border-radius:50px; font-weight:800; cursor:pointer; font-size:0.75rem; text-transform:uppercase; transition:0.3s; box-shadow:0 4px 10px rgba(255, 159, 67, 0.3);" onmouseover="this.style.transform='scale(1.08)';this.style.background='white'" onmouseout="this.style.transform='scale(1)';this.style.background='#ff9f43'">Abrir Centro</button>
                `;
            } else if (alertBar) {
                alertBar.style.opacity = "0";
                alertBar.style.transform = "translateY(-20px)";
                setTimeout(() => alertBar.remove(), 600);
            }
        }
    } catch (error) {
        console.error("Error al verificar solicitudes:", error);
    }
};

// Duplicated checkPendingRequests removed

window.openPendingRequestsCenter = async function () {
    // DIRECT REDIRECT to Course List (Management)
    // The user prefers to see badges on the course cards instead of a separate list.
    if (window.openCourseManagement) {
        window.openCourseManagement();
    } else {
        const section = document.getElementById('section-academic');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
};

if (!document.getElementById("dashboard-extras-css")) {
    const style = document.createElement("style");
    style.id = "dashboard-extras-css";
    style.innerHTML = `
        @keyframes pulse-alert {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes badge-float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-3px) scale(1.05); }
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// STUDENT ENROLLMENT LOGIC
// ==========================================
window.openEnrollmentModal = async function () {
    // Check if modal exists
    let modal = document.getElementById('student-enroll-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'student-enroll-modal';
        modal.className = 'modal-overlay';
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10001; display:flex; justify-content:center; align-items:center; opacity:0; transition:opacity 0.3s;";
        modal.onclick = (e) => { if (e.target === modal) closeEnrollModal(); };

        modal.innerHTML = `
            <div style="background:#1a1a1a; width:90%; max-width:450px; border-radius:16px; padding:25px; border:1px solid #333; box-shadow:0 20px 50px rgba(0,0,0,0.6); transform:scale(0.9); transition:transform 0.3s; position:relative; max-height:90vh; overflow-y:auto;">
                <button onclick="closeEnrollModal()" style="position:absolute; top:12px; right:12px; background:rgba(255,255,255,0.05); border:none; color:white; font-size:1.2rem; cursor:pointer; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center;">&times;</button>
                
                <h3 style="color:white; margin:0 0 8px 0; font-size:1.25rem;">Inscribir Nuevo Curso</h3>
                <p style="color:#888; font-size:0.85rem; margin:0 0 20px 0;">Selecciona el curso y horario de tu preferencia.</p>
                
                <div id="enroll-step-1">
                    <label style="color:#ccc; display:block; margin-bottom:8px; font-size:0.9rem;">Cursos disponibles:</label>
                    <select id="enroll-course-select" class="form-control" style="background:#222; border:1px solid #444; color:white; padding:12px; border-radius:10px; margin-bottom:15px; width:100%; font-size:0.95rem; outline:none;">
                        <option value="">Cargando...</option>
                    </select>
                    <button onclick="enrollNextStep()" style="width:100%; background:var(--color-acento-azul); color:white; border:none; padding:14px; border-radius:10px; font-weight:600; cursor:pointer; font-size:0.95rem; display:flex; align-items:center; justify-content:center; gap:8px;">
                        Siguiente <i class="bi bi-arrow-right"></i>
                    </button>
                </div>

                <div id="enroll-step-2" style="display:none;">
                    <label style="color:#ccc; display:block; margin-bottom:8px; font-size:0.9rem;">
                        Horarios disponibles <span style="color:#888; font-weight:400;">(puedes seleccionar varios)</span>
                    </label>
                    <div id="enroll-schedules-list" style="max-height:250px; overflow-y:auto; margin-bottom:12px; padding-right:5px; background:rgba(0,0,0,0.2); border-radius:10px; padding:8px;">
                        <div style="color:#666; font-style:italic;">Selecciona un curso primero.</div>
                    </div>
                    <div id="enroll-selected-count" style="display:none; color:#2ecc71; font-size:0.85rem; margin-bottom:12px;">
                        <i class="bi bi-check2-circle"></i> <span>0</span> horario(s) seleccionado(s)
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button onclick="enrollPrevStep()" style="flex:1; background:#333; color:white; border:1px solid #444; padding:12px; border-radius:10px; cursor:pointer; font-size:0.9rem;">
                            <i class="bi bi-arrow-left"></i> Atrás
                        </button>
                        <button id="btn-confirm-student-enroll" onclick="submitMultipleEnrollments()" style="flex:2; background:linear-gradient(135deg, #2ecc71, #27ae60); color:white; border:none; padding:12px; border-radius:10px; cursor:pointer; font-size:0.95rem; font-weight:600; display:flex; align-items:center; justify-content:center; gap:6px;">
                            <i class="bi bi-check-circle"></i> Confirmar
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add close logic
        window.closeEnrollModal = () => {
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.9)'; // Effect
            setTimeout(() => modal.style.display = 'none', 300);
        };
    }

    // Reset
    document.getElementById('enroll-step-1').style.display = 'block';
    document.getElementById('enroll-step-2').style.display = 'none';

    // Show
    modal.style.display = 'flex';
    // Small delay for animation
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('div').style.transform = 'scale(1)';
    }, 10);

    // Load Courses
    const select = document.getElementById('enroll-course-select');
    select.innerHTML = '<option value="">Cargando...</option>';

    try {
        const res = await ApiService.getCourses();
        if (res.success && res.data) {
            select.innerHTML = '<option value="">-- Selecciona un curso --</option>' +
                res.data.map(c => `<option value="${c.id_course}">${c.name}</option>`).join('');
        } else {
            select.innerHTML = '<option value="">Error al cargar cursos</option>';
        }
    } catch (e) {
        console.error(e);
        select.innerHTML = '<option value="">Error de conexión</option>';
    }
};

window.enrollNextStep = async function () {
    const courseId = document.getElementById('enroll-course-select').value;
    if (!courseId) return showToast("Por favor selecciona un curso", "warning");

    const container = document.getElementById('enroll-schedules-list');
    const countDiv = document.getElementById('enroll-selected-count');
    container.innerHTML = '<div style="color:#aaa; text-align:center; padding:20px;"><i class="bi bi-hourglass-split"></i> Cargando horarios...</div>';
    countDiv.style.display = 'none';

    // Store courseId for submission
    window._enrollCourseId = courseId;

    document.getElementById('enroll-step-1').style.display = 'none';
    document.getElementById('enroll-step-2').style.display = 'block';

    try {
        const result = await ApiService.getSchedules(courseId);

        if (result.success && result.data && result.data.length > 0) {
            container.innerHTML = result.data.map(s => {
                const quota = s.quota || 15;
                const enrolled = s.enrolled_count || 0;
                const available = quota - enrolled;
                const isFull = available <= 0;

                return `
                    <label class="schedule-checkbox-label" style="
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 10px 12px;
                        margin-bottom: 6px;
                        background: ${isFull ? 'rgba(231, 76, 60, 0.1)' : 'rgba(255,255,255,0.03)'};
                        border: 1px solid ${isFull ? 'rgba(231, 76, 60, 0.3)' : 'rgba(255,255,255,0.08)'};
                        border-radius: 10px;
                        cursor: ${isFull ? 'not-allowed' : 'pointer'};
                        transition: all 0.2s;
                        opacity: ${isFull ? '0.6' : '1'};
                    ">
                        <input type="checkbox" 
                            class="enroll-schedule-cb"
                            value="${s.id_schedule}" 
                            ${isFull ? 'disabled' : ''}
                            style="width:18px; height:18px; accent-color:#2ecc71; cursor:${isFull ? 'not-allowed' : 'pointer'};">
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <span style="color:var(--color-acento-azul); font-weight:600; font-size:0.9rem;">${s.day}</span>
                                    <span style="color:#888; margin:0 6px;">•</span>
                                    <span style="color:white; font-size:0.9rem;">${s.time_start ? ApiService.formatTime(s.time_start) : ''} - ${s.time_end ? ApiService.formatTime(s.time_end) : ''}</span>
                                </div>
                                ${isFull
                        ? '<span style="background:#e74c3c; color:white; padding:2px 8px; border-radius:10px; font-size:0.7rem; font-weight:600;">LLENO</span>'
                        : `<span style="color:#2ecc71; font-size:0.8rem; font-weight:500;">${available} cupos</span>`
                    }
                            </div>
                            <div style="font-size:0.75rem; color:#666; margin-top:3px;">${s.teacher_name || 'Docente por asignar'}</div>
                        </div>
                    </label>
                `;
            }).join('');

            // Add event listeners for checkboxes
            container.querySelectorAll('.enroll-schedule-cb').forEach(cb => {
                cb.addEventListener('change', updateEnrollCount);
            });

            // Add hover effects
            container.querySelectorAll('.schedule-checkbox-label').forEach(label => {
                const input = label.querySelector('input');
                if (!input.disabled) {
                    label.addEventListener('mouseenter', () => {
                        label.style.background = 'rgba(46, 204, 113, 0.1)';
                        label.style.borderColor = 'rgba(46, 204, 113, 0.3)';
                    });
                    label.addEventListener('mouseleave', () => {
                        label.style.background = 'rgba(255,255,255,0.03)';
                        label.style.borderColor = 'rgba(255,255,255,0.08)';
                    });
                }
            });

        } else {
            container.innerHTML = '<div style="color:#888; text-align:center; padding:20px;"><i class="bi bi-calendar-x" style="font-size:1.5rem; display:block; margin-bottom:8px;"></i>No hay horarios disponibles para este curso.</div>';
        }
    } catch (e) {
        console.error('Error loading schedules:', e);
        container.innerHTML = '<div style="color:#e74c3c; text-align:center; padding:15px;"><i class="bi bi-exclamation-triangle"></i> Error al cargar horarios. Intenta de nuevo.</div>';
    }
};

// Update selection count
function updateEnrollCount() {
    const countDiv = document.getElementById('enroll-selected-count');
    const checked = document.querySelectorAll('.enroll-schedule-cb:checked').length;
    if (checked > 0) {
        countDiv.style.display = 'block';
        countDiv.querySelector('span').textContent = checked;
    } else {
        countDiv.style.display = 'none';
    }
}

window.enrollPrevStep = function () {
    document.getElementById('enroll-step-1').style.display = 'block';
    document.getElementById('enroll-step-2').style.display = 'none';
};

window.submitMultipleEnrollments = async function () {
    const courseId = window._enrollCourseId;
    const checkedBoxes = document.querySelectorAll('.enroll-schedule-cb:checked');
    const scheduleIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));

    if (scheduleIds.length === 0) {
        return showToast("Por favor selecciona al menos un horario", "warning");
    }

    const confirmMsg = scheduleIds.length === 1
        ? "¿Confirmas tu inscripción en este horario?"
        : `¿Confirmas tu inscripción en ${scheduleIds.length} horarios?`;

    if (!await showConfirm(confirmMsg, "Sí, inscribirme", "Cancelar")) return;

    const user = ApiService.getSession();
    const btn = document.getElementById('btn-confirm-student-enroll');

    // Disable button and show loading
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Procesando...';

    let successCount = 0;
    let errors = [];

    // Process each schedule enrollment
    for (const scheduleId of scheduleIds) {
        try {
            const res = await ApiService.enrollStudent(user.id_usuario, courseId, scheduleId);
            if (res.success) {
                successCount++;
            } else {
                errors.push(res.message || 'Error desconocido');
            }
        } catch (e) {
            errors.push(e.message || 'Error de conexión');
        }
    }

    // Re-enable button
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-circle"></i> Confirmar';

    // Show results
    if (successCount > 0) {
        const msg = successCount === 1
            ? "¡Inscripción enviada con éxito!"
            : `¡${successCount} inscripciones enviadas con éxito!`;
        await showToast(msg, "success");
        closeEnrollModal();
        if (window.fetchStudentCourses) window.fetchStudentCourses(user.id_usuario);
    }

    if (errors.length > 0) {
        showToast(`${errors.length} error(es): ${errors[0]}`, "error");
    }
};

window.handleProfileUpdate = async function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    const user = ApiService.getSession();

    try {
        const response = await fetch('/jacquin_api/update_user_profile.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id_usuario,
                full_name: data.fullName,
                n_phone: data.nPhone
            })
        });
        const result = await response.json();

        if (result.success) {
            showToast("Perfil actualizado correctamente.", "success");
            user.full_name = data.fullName;
            user.n_phone = data.nPhone;
            ApiService.saveSession(user);
            const nameEl = document.getElementById('dashboard-user-name') || document.getElementById('teacher-user-name');
            if (nameEl) nameEl.textContent = user.full_name;
        } else {
            showToast(result.message || "Error al actualizar", "error");
        }
    } catch (e) {
        console.error(e);
        showToast("Error de conexión", "error");
    }
};

window.showDirectoryOnly = function () {
    const dirContainer = document.getElementById('admin-modules-container');
    if (dirContainer) dirContainer.style.display = 'block';

    const dirSection = document.getElementById('section-directory');
    if (dirSection) {
        dirSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        console.log("Directory section not found in this page.");
    }
};

// Start of enrollment logic
window.submitMultipleEnrollments = async function () {
    const courseId = window._enrollCourseId;
    const checkedBoxes = document.querySelectorAll('.enroll-schedule-cb:checked');
    const scheduleIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));

    if (scheduleIds.length === 0) {
        return showToast("Por favor selecciona al menos un horario", "warning");
    }

    const confirmMsg = scheduleIds.length === 1
        ? "¿Confirmas tu inscripción en este horario?"
        : `¿Confirmas tu inscripción en ${scheduleIds.length} horarios?`;

    if (!await showConfirm(confirmMsg, "Sí, inscribirme", "Cancelar")) return;

    const user = ApiService.getSession();
    const btn = document.getElementById('btn-confirm-student-enroll');

    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Procesando...';

    let successCount = 0;
    let errors = [];

    for (const scheduleId of scheduleIds) {
        try {
            const res = await ApiService.enrollStudent(user.id_usuario, courseId, scheduleId);
            if (res.success) {
                successCount++;
            } else {
                errors.push(res.message || 'Error desconocido');
            }
        } catch (e) {
            errors.push(e.message || 'Error de conexión');
        }
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-circle"></i> Confirmar';

    if (successCount > 0) {
        const msg = successCount === 1
            ? "¡Inscripción enviada con éxito!"
            : `¡${successCount} inscripciones enviadas con éxito!`;
        await showToast(msg, "success");
        if (window.closeEnrollModal) window.closeEnrollModal();
        if (window.fetchStudentCourses) window.fetchStudentCourses(user.id_usuario);
    }

    if (errors.length > 0) {
        showToast(`${errors.length} error(es): ${errors[0]}`, "error");
    }
};

