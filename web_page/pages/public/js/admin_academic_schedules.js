/**
 * Academic Management Module
 * Consolidated logic for Courses, Schedules, and Enrollments.
 */

const AcademicManager = {
    // State
    courses: [],
    pendingGroups: {},
    courseStats: {}, // { courseId: { active_count, pending_count, schedule_count, total_quota } }

    // Config
    modalId: "admin-courses-modal",

    /**
     * Initialize the module
     */
    init() {
        // Expose global functions for HTML attributes (onclick)
        window.openCourseManagement = this.openOverview.bind(this);
        window.openCourseDetails = this.openDetails.bind(this);
        window.loadCourses = this.loadCourses.bind(this); // Compatibility
        window.deleteCourse = this.deleteCourse.bind(this);
        window.openTeacherModal = this.openTeacherModal.bind(this);
        window.confirmTeacherChange = this.confirmTeacherChange.bind(this);

        // Schedule & Request Handlers
        window.handleRequest = this.handleRequest.bind(this);
        window.editSchedule = this.editSchedule.bind(this);
        window.assignTeacherModal = this.assignTeacherModal.bind(this);
        window.assignStudentSchedule = this.assignStudentSchedule.bind(this);
        window.assignStudentSchedule = this.assignStudentSchedule.bind(this);
        window.unassignStudentAdmin = this.unenrollStudentAdmin.bind(this);
        window.unassignTeacherSchedule = this.unassignTeacherSchedule.bind(this);
        window.toggleStudentAccordion = this.toggleStudentAccordion.bind(this);
        window.editCourseBasicInfo = this.editCourseBasicInfo.bind(this);
        window.switchTab = this.switchTab.bind(this);
        window.closeCourseDetailsModal = this.closeDetails.bind(this);
        window.viewScheduleStudents = this.viewScheduleStudents.bind(this);
        window.processRequest = this.handleRequest.bind(this); // alias para backward compat

        this.setupForms();

        // If we are on a page with #courseList (non-modal view), load courses
        if (document.getElementById('courseList')) {
            this.loadCourses();
        }
    },

    /**
     * Security Check
     */
    checkSession() {
        if (!window.ApiService || !window.ApiService.isAuthenticated()) {
            return false;
        }
        const user = window.ApiService.getSession();
        return user && user.id_rol == 1;
    },

    setupForms() {
        const createCourseForm = document.getElementById('createCourseForm');
        if (createCourseForm) {
            createCourseForm.addEventListener('submit', (e) => this.handleCreateCourse(e));
        }
    },

    /**
     * Open the Main Academic Management Modal
     */
    async openOverview() {
        if (!this.checkSession()) {
            return Swal.fire('Acceso Denegado', 'Debes ser administrador.', 'error');
        }

        Swal.fire({
            title: 'Cargando gestión académica...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
            background: '#1a1a1a',
            color: '#fff'
        });

        try {
            await this.refreshData();
            Swal.close();
            this.renderOverviewModal();
        } catch (error) {
            console.error("Error opening overview:", error);
            Swal.fire('Error', 'No se pudieron cargar los datos.', 'error');
        }
    },

    /**
     * Fetch latest data from API
     */
    async refreshData() {
        try {
            const getStats = typeof ApiService.getAcademicStats === 'function'
                ? ApiService.getAcademicStats()
                : Promise.resolve({ success: false, data: {} });

            const [coursesRes, pendingRes, statsRes] = await Promise.all([
                ApiService.getCourses(),
                ApiService.getPendingEnrollments(),
                getStats
            ]);

            if (coursesRes.success) {
                this.courses = coursesRes.data || [];
            } else {
                throw new Error("Failed to load courses");
            }

            this.pendingGroups = {};
            if (pendingRes.success && pendingRes.data) {
                pendingRes.data.forEach(r => {
                    if (!this.pendingGroups[r.course_id]) this.pendingGroups[r.course_id] = 0;
                    this.pendingGroups[r.course_id]++;
                });
            }

            this.courseStats = (statsRes.success && statsRes.data) ? statsRes.data : {};
        } catch (e) {
            console.error("Refresh Data Error", e);
            throw e;
        }
    },

    /**
     * Render the overview modal with course cards
     */
    renderOverviewModal() {
        let modal = document.getElementById(this.modalId);
        if (!modal) {
            modal = document.createElement("div");
            modal.id = this.modalId;
            modal.className = "modal-overlay";
            document.body.appendChild(modal);
            this.injectStyles();
        }

        // Sort: Pending count DESC -> Name ASC
        const sortedCourses = [...this.courses].sort((a, b) => {
            const aCount = this.pendingGroups[a.id_course] || 0;
            const bCount = this.pendingGroups[b.id_course] || 0;
            if (bCount !== aCount) return bCount - aCount;
            return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
        });

        const coursesListHtml = sortedCourses.map(c => {
            const pCount = this.pendingGroups[c.id_course] || 0;
            const hasAction = pCount > 0;
            return this.buildCourseCard(c, pCount, hasAction);
        }).join('') || '<div style="color:#666; text-align:center; padding:40px;">No hay cursos registrados.</div>';

        modal.innerHTML = `
            <div class="modal-card-container custom-scroll" style="background: linear-gradient(135deg, #12161f 0%, #1a2333 100%);">
                <div class="modal-header-row" style="align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 20px;">
                    <div style="display:flex; align-items: center; gap: 15px;">
                        <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(52, 152, 219, 0.15); display:flex; align-items:center; justify-content:center; color: #3498db; font-size: 1.8rem;">
                            <i class="bi bi-journal-bookmark-fill"></i>
                        </div>
                        <div>
                            <h2 style="color:white; margin:0; font-size:1.6rem; font-weight:600; letter-spacing: -0.5px;">Panel Académico</h2>
                            <p style="color:rgba(255,255,255,0.45); margin:4px 0 0 0; font-size: 0.9rem;">Elige un programa musical para ver la lista de sus alumnos, asignar docentes y configurar sus horarios.</p>
                        </div>
                    </div>
                    <button class="btn-close-modal" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); width: 35px; height: 35px; border-radius: 50%; color:#aaa; cursor:pointer;" onclick="document.getElementById('${this.modalId}').style.display='none'">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="courses-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin-top: 25px;">${coursesListHtml}</div>
            </div>
        `;

        // Close on outside click
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };

        modal.style.display = "flex";
    },

    buildCourseCard(c, pCount, hasAction) {
        const st = this.courseStats[c.id_course] || {};
        const activeCount = st.active_count || 0;
        const schedCount = st.schedule_count || 0;
        const totalQuota = st.total_quota || 0;
        const pct = totalQuota > 0 ? Math.min(Math.round((activeCount / totalQuota) * 100), 100) : 0;
        const barColor = pct >= 100 ? '#e74c3c' : pct >= 75 ? '#f1c40f' : '#2ecc71';

        return `
        <div onclick="openCourseDetails(${c.id_course}, '${c.name.replace(/'/g, "\\'")}')"
             class="admin-course-card"
             style="border: 1px solid rgba(255,255,255,0.06); border-top: 5px solid ${hasAction ? '#ff9f43' : '#3498db'};
                    background: rgba(255,255,255,0.03); padding: 22px; border-radius: 18px; cursor:pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display:flex; flex-direction:column; gap:12px;
                    position:relative; overflow:hidden;"
             onmouseover="this.style.background='rgba(255,255,255,0.06)'; this.style.transform='translateY(-5px)'; this.style.borderColor='rgba(52, 152, 219, 0.3)';"
             onmouseout="this.style.background='rgba(255,255,255,0.03)'; this.style.transform='translateY(0)'; this.style.borderColor='rgba(255,255,255,0.06)';">
            
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <h3 style="color:white; margin:0; font-size:1.25rem; font-weight:700; letter-spacing:-0.3px;">${c.name}</h3>
                <div style="display:flex; gap:8px; align-items:center;">
                    ${hasAction ? `<span style="background:rgba(255,159,67,0.15); color:#ff9f43; border:1px solid rgba(255,159,67,0.3); padding:3px 10px; border-radius:20px; font-size:0.75rem; font-weight:700; animation: pulse-alert 2s infinite;">${pCount} PENDIENTE</span>` : ''}
                    <button onclick="event.stopPropagation(); deleteCourse(${c.id_course}, '${c.name.replace(/'/g, "\\'")}')" 
                            style="background:rgba(231, 76, 60, 0.1); border:1px solid rgba(231, 76, 60, 0.3); color:#e74c3c; width:28px; height:28px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;"
                            onmouseover="this.style.background='rgba(231, 76, 60, 0.25)'" onmouseout="this.style.background='rgba(231, 76, 60, 0.1)'" title="Eliminar Curso">
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:5px;">
                <div style="background:rgba(255,255,255,0.03); padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="font-size:0.65rem; color:rgba(255,255,255,0.3); text-transform:uppercase; margin-bottom:4px;">Inscritos</div>
                    <div style="color:#2ecc71; font-weight:700; font-size:1rem; display:flex; align-items:center; gap:6px;">
                        <i class="bi bi-people-fill" style="font-size:0.9rem;"></i> ${activeCount}
                    </div>
                </div>
                <div style="background:rgba(255,255,255,0.03); padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="font-size:0.65rem; color:rgba(255,255,255,0.3); text-transform:uppercase; margin-bottom:4px;">Horarios</div>
                    <div style="color:#3498db; font-weight:700; font-size:1rem; display:flex; align-items:center; gap:6px;">
                        <i class="bi bi-calendar3" style="font-size:0.9rem;"></i> ${schedCount}
                    </div>
                </div>
            </div>

            ${totalQuota > 0 ? `
            <div style="margin-top:auto; padding-top:10px;">
                <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:rgba(255,255,255,0.35); margin-bottom:6px;">
                    <span>Ocupación</span>
                    <span style="color:${barColor}; font-weight:700;">${pct}%</span>
                </div>
                <div style="width:100%; height:4px; background:rgba(255,255,255,0.05); border-radius:4px; overflow:hidden;">
                    <div style="width:${pct}%; height:100%; background:${barColor}; transition:width 0.6s ease;"></div>
                </div>
            </div>` : ''}

            <i class="bi bi-chevron-right" style="position:absolute; bottom:20px; right:20px; color:rgba(255,255,255,0.1); font-size:1.2rem;"></i>
        </div>
        `;
    },

    injectStyles() {
        if (document.getElementById('academic-manager-styles')) return;
        const style = document.createElement('style');
        style.id = 'academic-manager-styles';
        style.textContent = `
            .modal-card-container {
                background: #141414; padding: 40px; border-radius: 24px; width: 98%; max-width: 1380px; 
                min-height: 500px; max-height: 90vh; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1); 
                box-shadow: 0 50px 100px rgba(0,0,0,0.9); transition: all 0.3s ease;
            }
            .modal-header-row { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:30px; }
            .btn-close-modal { 
                background: rgba(255, 255, 255, 0.05); 
                border: 1px solid rgba(255, 255, 255, 0.1); 
                color: white; 
                width: 36px; 
                height: 36px; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                cursor: pointer; 
                transition: all 0.3s ease;
                font-size: 1rem;
            }
            .btn-close-modal:hover { 
                background: rgba(255, 255, 255, 0.15); 
                border-color: rgba(255, 255, 255, 0.3); 
                transform: rotate(90deg);
            }
            .admin-course-card {
                background:rgba(255,255,255,0.04); padding:20px; margin-bottom:12px; border-radius:15px; cursor:pointer; 
                border:1px solid; border-left-width:5px; position:relative; transition:0.3s;
            }
            .admin-course-card:hover { background:rgba(255,255,255,0.08); transform:translateX(5px); }
            .course-title { color:white; font-weight:700; font-size:1.1rem; margin-bottom:4px; }
            .course-subtitle { color:rgba(255,255,255,0.4); font-size:0.8rem; }
            .pending-badge {
                width:32px; height:32px; border-radius:50%; background:#ff9f43; color:black; 
                display:flex; justify-content:center; align-items:center; font-weight:900; font-size:0.85rem;
                box-shadow:0 0 15px rgba(255, 159, 67, 0.6); animation: pulse-alert 2s infinite;
            }
            @keyframes pulse-alert { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }

            /* SweetAlert2 Dark Theme Overrides */
            div:where(.swal2-container) div:where(.swal2-popup) {
                background: #1e1e1e !important;
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #fff !important;
                border-radius: 20px;
            }
            div:where(.swal2-container) .swal2-title { color: #fff !important; }
            div:where(.swal2-container) .swal2-html-container { color: rgba(255, 255, 255, 0.7) !important; }
            div:where(.swal2-container) input.swal2-input, 
            div:where(.swal2-container) textarea.swal2-textarea,
            div:where(.swal2-container) select.swal2-select {
                background: rgba(255, 255, 255, 0.05) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                color: #fff !important;
            }
            div:where(.swal2-container) input.swal2-input:focus {
                box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.5) !important;
                border-color: #3498db !important;
            }
            /* Close Button Override - High Specificity */
            .swal2-container .swal2-popup .swal2-close {
                background: rgba(255, 255, 255, 0.05) !important;
                color: #fff !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 50% !important;
                width: 36px !important;
                height: 36px !important;
                margin-top: 15px !important;
                margin-right: 15px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: all 0.3s ease !important;
                font-size: 1rem !important;
                box-shadow: none !important;
                outline: none !important;
            }
            .swal2-container .swal2-popup .swal2-close:hover {
                background: rgba(231, 76, 60, 0.2) !important;
                color: #e74c3c !important;
                border-color: rgba(231, 76, 60, 0.4) !important;
                transform: rotate(90deg) !important;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Course Details & Tabs
     */
    async openDetails(courseId, courseName) {
        // Implement logic similar to previous admin_shared_academic.js but cleaner
        // ... (We will call this from shared file or reimplement here completely)
        // For now, let's keep the one in shared but point window.openDetails to THIS function if we move it.
        // Wait, the plan was to MOVE duplication. 
        // Let's reimplement openDetails here to be self-contained.

        // Show loading
        let modal = document.getElementById(this.modalId);
        if (!modal) { this.renderOverviewModal(); modal = document.getElementById(this.modalId); }

        modal.innerHTML = '<div style="color:white;text-align:center;padding:50px;"><div class="spinner-border text-primary" role="status"></div><p>Cargando curso...</p></div>';
        modal.style.display = 'flex';

        try {
            const res = await ApiService.getFullCourseDetails(courseId);
            if (!res.success) throw new Error(res.message);

            this.renderDetailsModal(courseId, courseName, res.data);

        } catch (e) {
            console.error("Error loading course details:", e);
            Swal.fire('Error', 'No se pudieron cargar los detalles del curso: ' + e.message, 'error');
            // Removed this.openOverview() to prevent infinite loop
        }
    },

    renderDetailsModal(courseId, courseName, data) {
        if (!data) data = {};
        const { students = [], pending = [], schedules = [], info = {} } = data;

        // Use existing helpers (formatTime)
        // We reuse the HTML structure from previous implementation for familiarity
        // but now it serves as the single source of truth.

        const modal = document.getElementById(this.modalId);

        // Helper to generate students list
        const studentsHtml = this.generateStudentsList(students, courseId, courseName);
        // Helper for pending
        const pendingHtml = this.generatePendingList(pending, courseId, courseName);

        modal.innerHTML = `
            <div class="modal-card-container custom-scroll" style="max-width:1400px; min-height:650px; background: linear-gradient(135deg, #12161f 0%, #1a2333 100%);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 20px;">
                    <div style="display:flex; align-items: center; gap: 15px;">
                         <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(52, 152, 219, 0.15); display:flex; align-items:center; justify-content:center; color: #3498db; font-size: 1.8rem;">
                            <i class="bi bi-music-note-list"></i>
                        </div>
                        <div>
                            <h2 style="color:white; margin:0; font-size:1.6rem; font-weight:600; letter-spacing: -0.5px;">${courseName}</h2>
                            <p style="color:rgba(255,255,255,0.45); margin:4px 0 0 0; font-size: 0.9rem;">Área de trabajo: Aprueba inscripciones y organiza los horarios.</p>
                        </div>
                    </div>
                     <div style="display:flex; gap:10px;">
                         <button onclick="AcademicManager.closeDetails()" class="btn-close-modal" style="background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.3); color: #e74c3c; width: 35px; height: 35px; border-radius: 50%; display:flex; align-items:center; justify-content:center; cursor: pointer;">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>

                <!-- Tabs -->
                <div style="display:flex; gap:20px; margin-bottom:25px; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 12px; width: max-content;">
                    <button id="btn-tab-enrollments" onclick="switchTab('tab-enrollments')" style="background:var(--color-acento-azul); color:#121212; border:none; border-radius: 8px; font-weight:600; font-size:0.95rem; cursor:pointer; padding:8px 20px; transition: 0.2s;">
                        <i class="bi bi-people-fill" style="margin-right: 6px;"></i> Estudiantes Inscritos <span style="background:rgba(0,0,0,0.2); padding: 2px 8px; border-radius: 10px; margin-left:5px;">${students.length}</span>
                    </button>
                    <button id="btn-tab-schedules" onclick="switchTab('tab-schedules')" style="background:transparent; color:#888; border:none; border-radius: 8px; font-weight:600; font-size:0.95rem; cursor:pointer; padding:8px 20px; transition: 0.2s;">
                        <i class="bi bi-calendar-event-fill" style="margin-right: 6px;"></i> Horarios y Docentes <span style="background:rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 10px; margin-left:5px;">${schedules.length}</span>
                    </button>
                </div>

                <div id="tab-enrollments">
                    ${pendingHtml}
                    ${studentsHtml}
                </div>

                <div id="tab-schedules" style="display:none;">
                     ${this.generateSchedulesList(schedules, courseId, courseName)}
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        this.switchTab('tab-enrollments');
    },



    async handleCreateCourse(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd);

        try {
            const result = await ApiService.createCourse(data);
            if (result.success) {
                Swal.fire('Éxito', 'Curso creado', 'success');
                e.target.reset();
                this.loadCourses(); // Refresh list if exists
            } else {
                Swal.fire('Error', result.message, 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'Error de conexión', 'error');
        }
    },

    async loadCourses() {
        const list = document.getElementById('courseList');
        const select = document.getElementById('courseSelect');
        if (!list && !select) return;

        try {
            const res = await ApiService.getCourses();
            if (res.success && res.data) {
                const courses = res.data;
                if (select) {
                    select.innerHTML = '<option value="">Selecciona Curso</option>' + courses.map(c => `<option value="${c.id_course}">${c.name}</option>`).join('');
                }
                if (list) {
                    list.innerHTML = courses.map(c => `<div style="padding:10px; border-bottom:1px solid #333;">${c.name}</div>`).join('');
                }
            }
        } catch (e) { console.error(e); }
    },

    async deleteCourse(id, name) {
        if ((await Swal.fire({ title: `¿Eliminar ${name}?`, text: "Se borrarán los horarios asociados. Esta acción es irreversible.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#e74c3c' })).isConfirmed) {
            const res = await ApiService.deleteCourse(id);
            if (res.success) { Swal.fire('Eliminado', '', 'success'); this.loadCourses(); this.openOverview(); }
            else Swal.fire('Error', res.message, 'error');
        }
    },

    async openTeacherModal(courseId, courseName, teacherId) {
        const res = await ApiService.getUsers();
        if (!res.success) return Swal.fire('Error', 'No se cargaron docentes', 'error');

        const teachers = res.data.filter(u => u.id_rol == 2);

        // Normalize teacherId to a safe array of integers
        let safeCurrentIds = [];
        if (Array.isArray(teacherId)) {
            safeCurrentIds = teacherId.map(id => parseInt(id));
        } else if (typeof teacherId === 'string' && teacherId.includes(',')) {
            safeCurrentIds = teacherId.split(',').map(id => parseInt(id.trim()));
        } else if (teacherId) {
            safeCurrentIds = [parseInt(teacherId)];
        }

        const html = `
            <div style="text-align:left; max-height:300px; overflow-y:auto; border:1px solid rgba(255,255,255,0.1); padding:10px; border-radius:5px; background:rgba(0,0,0,0.2);">
                <div style="font-size:0.9rem; color:#aaa; margin-bottom:10px;">Selecciona uno o varios docentes para el curso:</div>
                ${teachers.map(t => `
                    <label style="display:flex; align-items:center; padding:8px; border-bottom:1px solid rgba(255,255,255,0.1); cursor:pointer;">
                        <input type="checkbox" name="course_teacher_ids[]" value="${t.id_usuario}" ${safeCurrentIds.includes(t.id_usuario) ? 'checked' : ''} style="transform:scale(1.3); margin-right:10px; accent-color:var(--color-acento-azul);">
                        <span style="color:white;">${t.full_name}</span>
                    </label>
                `).join('')}
            </div>
        `;

        const { value: selectedIds } = await Swal.fire({
            title: `Asignar Docentes - ${courseName}`,
            html: html,
            showCancelButton: true,
            confirmButtonColor: '#ff9f43',
            preConfirm: () => {
                const checked = Array.from(document.querySelectorAll('input[name="course_teacher_ids[]"]:checked'));
                if (checked.length === 0) {
                    Swal.showValidationMessage('Debes seleccionar al menos un docente');
                }
                return checked.map(el => parseInt(el.value));
            }
        });

        if (selectedIds) {
            this.confirmTeacherChange(courseId, selectedIds);
        }
    },

    async confirmTeacherChange(courseId, teacherIds) {
        const res = await ApiService.updateCourseTeacher(courseId, teacherIds);
        if (res.success) {
            Swal.fire('Actualizado', '', 'success');
            if (typeof this.loadCourses === 'function') this.loadCourses();
            if (typeof this.openOverview === 'function') this.openOverview();
        } else {
            Swal.fire('Error', res.message, 'error');
        }
    },

    async handleRequest(id, action, courseId, courseName, schedId, teacherId) {
        const actionText = action === 'approve' ? 'Aprobar' : 'Rechazar';
        let htmlContent = action === 'approve'
            ? `<p>¿Seguro que deseas aprobar esta solicitud?</p>`
            : `<p>¿Por qué rechazas esta solicitud?</p><textarea id="reject-reason" class="swal2-textarea" placeholder="Razón..."></textarea>`;

        const result = await Swal.fire({
            title: `${actionText} Solicitud`,
            html: htmlContent,
            icon: action === 'approve' ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonText: `Sí, ${actionText} `,
            confirmButtonColor: action === 'approve' ? '#2ecc71' : '#e74c3c',
            preConfirm: () => {
                if (action === 'reject') return document.getElementById('reject-reason').value || "Sin razón.";
                return "Aprobada";
            }
        });

        if (result.isConfirmed) {
            const res = await ApiService.handleEnrollment(id, action);
            if (res.success) {
                Swal.fire('Procesado', '', 'success');
                this.loadPendingRequests(); // if exists
                this.openDetails(courseId, courseName);
            } else Swal.fire('Error', res.message, 'error');
        }
    },

    editSchedule(scheduleId, courseId, courseName, currentDay = '', currentStart = '', currentEnd = '') {
        const days = ['Lunes', 'Martes', 'Mi\u00e9rcoles', 'Jueves', 'Viernes', 'S\u00e1bado', 'Domingo'];
        const title = scheduleId ? 'Editar Horario' : 'Nuevo Horario';

        // Helper to create valid HTML for Swal
        const html = `
            <div style="text-align:left;">
                <label style="display:block; margin-bottom:5px; color:#aaa;">D\u00eda</label>
                <select id="swal-sched-day" class="swal2-select" style="width:100%; margin:0 0 15px 0; box-sizing:border-box;">
                    ${days.map(d => `<option value="${d}" ${d === currentDay ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div><label style="display:block; margin-bottom:5px; color:#aaa;">Inicio</label><input type="time" id="swal-sched-start" class="swal2-input" style="width:100%; margin:0; box-sizing:border-box;" value="${currentStart}"></div>
                    <div><label style="display:block; margin-bottom:5px; color:#aaa;">Fin</label><input type="time" id="swal-sched-end" class="swal2-input" style="width:100%; margin:0; box-sizing:border-box;" value="${currentEnd}"></div>
                </div>
            </div>
    `;

        Swal.fire({
            title: title,
            html: html,
            showCancelButton: true,
            confirmButtonColor: '#ff9f43',
            preConfirm: () => {
                const day = document.getElementById('swal-sched-day').value;
                const start = document.getElementById('swal-sched-start').value;
                const end = document.getElementById('swal-sched-end').value;
                if (!start || !end) return Swal.showValidationMessage('Horario incompleto');
                return { id_schedule: scheduleId, course_id: courseId, day, time_start: start, time_end: end };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await ApiService.updateSchedule(result.value);
                if (res.success) {
                    Swal.fire('Guardado', '', 'success');
                    this.openDetails(courseId, courseName);
                } else Swal.fire('Error', res.message, 'error');
            }
        });
    },

    async assignTeacherModal(scheduleId, courseId, courseName, currentTeacherIds = []) {
        const res = await ApiService.getUsers();
        if (!res.success) return Swal.fire('Error', 'No se cargaron docentes', 'error');

        const teachers = res.data.filter(u => u.id_rol == 2);

        // Ensure currentTeacherIds is an array (handle null/undefined)
        const safeCurrentIds = Array.isArray(currentTeacherIds) ? currentTeacherIds : [];

        const html = `
    <div style="text-align:left; max-height:300px; overflow-y:auto; border:1px solid rgba(255,255,255,0.1); padding:10px; border-radius:5px; background:rgba(0,0,0,0.2);">
        <div style="font-size:0.9rem; color:#aaa; margin-bottom:10px;">Selecciona uno o varios docentes:</div>
                ${teachers.map(t => `
                    <label style="display:flex; align-items:center; padding:8px; border-bottom:1px solid rgba(255,255,255,0.1); cursor:pointer;">
                        <input type="checkbox" name="teacher_ids[]" value="${t.id_usuario}" ${safeCurrentIds.includes(t.id_usuario) ? 'checked' : ''} style="transform:scale(1.3); margin-right:10px; accent-color:var(--color-acento-azul);">
                        <span style="color:white;">${t.full_name}</span>
                    </label>
                `).join('')}
            </div>
    `;

        const { value: selectedIds } = await Swal.fire({
            title: 'Asignar Docentes',
            html: html,
            showCancelButton: true,
            confirmButtonColor: '#ff9f43',
            preConfirm: () => {
                const checked = Array.from(document.querySelectorAll('input[name="teacher_ids[]"]:checked'));
                if (checked.length === 0) {
                    Swal.showValidationMessage('Debes seleccionar al menos un docente');
                }
                return checked.map(el => el.value);
            }
        });

        if (selectedIds) {
            const resAssign = await ApiService.assignTeacher(selectedIds, scheduleId);

            if (resAssign.success) {
                Swal.fire('Asignado', '', 'success');
                this.openDetails(courseId, courseName);
            } else Swal.fire('Error', resAssign.message, 'error');
        }
    },

    async unassignTeacherSchedule(scheduleId, courseId, courseName) {
        if ((await Swal.fire({
            title: '\u00bfDesasignar Docente?',
            text: "El horario volver\u00e1 a estado PENDIENTE.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'S\u00ed, desasignar'
        })).isConfirmed) {
            const res = await ApiService.assignTeacher('remove', scheduleId);
            if (res.success) {
                Swal.fire('Desasignado', '', 'success');
                this.openDetails(courseId, courseName);
            } else Swal.fire('Error', res.message, 'error');
        }
    },

    async assignStudentSchedule(enrollmentId, courseId, courseName) {
        const res = await ApiService.getSchedules(courseId);
        if (!res.success) return Swal.fire('Error', 'No se cargaron horarios del curso', 'error');

        const schedules = res.data;
        if (schedules.length === 0) return Swal.fire('Aviso', 'Este curso no tiene horarios definidos.', 'warning');

        const existingRes = await ApiService.getEnrollmentSchedules(enrollmentId);
        const existingIds = existingRes.success ? existingRes.data.map(s => s.id_schedule) : [];

        // Build checkbox list
        const html = `
            <div style="text-align:left; max-height:300px; overflow-y:auto;">
                ${schedules.map(s => `
                    <div style="margin-bottom:8px; padding:8px; border:1px solid rgba(255,255,255,0.1); border-radius:5px; background:rgba(255,255,255,0.02);">
                        <label style="display:flex; align-items:center; cursor:pointer;">
                            <input type="checkbox" class="swal-sched-cb" value="${s.id_schedule}" ${existingIds.includes(s.id_schedule) ? 'checked' : ''} style="transform:scale(1.2); margin-right:10px; accent-color:var(--color-acento-azul);">
                            <div>
                                <div style="color:white;"><strong>${s.day}</strong> ${ApiService.formatTime(s.time_start)} - ${ApiService.formatTime(s.time_end)}</div>
                                <div style="font-size:0.8rem; color:#888;">Docente: ${s.teacher_name || 'Sin asignar'}</div>
                            </div>
                        </label>
                    </div>
                `).join('')
            }
            </div>
    `;

        Swal.fire({
            title: 'Asignar Horario a Estudiante',
            html: html,
            showCancelButton: true,
            confirmButtonColor: '#ff9f43',
            preConfirm: () => {
                const checkboxes = document.querySelectorAll('.swal-sched-cb:checked');
                if (checkboxes.length === 0) return Swal.showValidationMessage('Selecciona al menos uno');
                return Array.from(checkboxes).map(c => c.value);
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const resAssign = await ApiService.assignSchedules(enrollmentId, result.value);
                if (resAssign.success) {
                    Swal.fire('Guardado', '', 'success');
                    this.openDetails(courseId, courseName);
                } else Swal.fire('Error', resAssign.message, 'error');
            }
        });
    },

    async unenrollStudentAdmin(enrollmentId, courseId, courseName) {
        if ((await Swal.fire({ title: '\u00bfDesinscribir?', text: 'Esta acci\u00f3n es irreversible.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' })).isConfirmed) {
            const res = await ApiService.unenrollStudent(enrollmentId);
            if (res.success) {
                Swal.fire('Desinscrito', '', 'success');
                this.openDetails(courseId, courseName);
            } else Swal.fire('Error', res.message, 'error');
        }
    },

    toggleStudentAccordion(enrollmentId) {
        // Implementation for the accordion inside the modal
        // This requires the DOM elements to exist, which are rendered in `renderDetailsModal`
        alert("Esta funci\u00f3n est\u00e1 siendo optimizada. Por favor use 'Horarios' para ver disponibilidad general.");
    },

    async editCourseBasicInfo(id, name, desc, price) {
        const { value: formValues } = await Swal.fire({
            title: 'Editar Curso',
            html: `
                <input id="swal-input1" class="swal2-input" placeholder="Nombre" value="${name}">
                <textarea id="swal-input2" class="swal2-textarea" placeholder="Descripci\u00f3n">${desc}</textarea>
                <input id="swal-input3" class="swal2-input" type="number" placeholder="Precio" value="${price}">
            `,
            focusConfirm: false,
            preConfirm: () => {
                return {
                    id_course: id,
                    course_name: document.getElementById('swal-input1').value,
                    description: document.getElementById('swal-input2').value,
                    price: document.getElementById('swal-input3').value
                }
            }
        });

        if (formValues) {
            const res = await ApiService.updateCourse(formValues);
            if (res.success) {
                Swal.fire('Actualizado', '', 'success');
                this.loadCourses(); // update list
                this.openDetails(id, formValues.course_name); // update header
            } else Swal.fire('Error', res.message, 'error');
        }
    },

    switchTab(tab) {
        const tabEn = document.getElementById('tab-enrollments');
        const tabSc = document.getElementById('tab-schedules');
        if (tabEn) tabEn.style.display = tab === 'tab-enrollments' ? 'block' : 'none';
        if (tabSc) tabSc.style.display = tab === 'tab-schedules' ? 'block' : 'none';

        // Update button styles...
        const btnEn = document.getElementById('btn-tab-enrollments');
        const btnSc = document.getElementById('btn-tab-schedules');
        if (btnEn && btnSc) {
            const isActiveEn = tab === 'tab-enrollments';
            const isActiveSc = tab === 'tab-schedules';

            btnEn.style.background = isActiveEn ? 'var(--color-acento-azul)' : 'transparent';
            btnEn.style.color = isActiveEn ? '#121212' : '#888';
            btnEn.style.boxShadow = isActiveEn ? '0 4px 10px rgba(52, 152, 219, 0.3)' : 'none';

            btnSc.style.background = isActiveSc ? 'var(--color-acento-azul)' : 'transparent';
            btnSc.style.color = isActiveSc ? '#121212' : '#888';
            btnSc.style.boxShadow = isActiveSc ? '0 4px 10px rgba(52, 152, 219, 0.3)' : 'none';
        }
    },

    /**
     * Ver estudiantes inscritos en un horario específico
     */
    async viewScheduleStudents(scheduleId, scheduleLabel, courseId, courseName) {
        Swal.fire({ title: 'Cargando...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: '#1a1a1a', color: '#fff' });

        const res = await ApiService.getScheduleStudents(scheduleId);
        Swal.close();

        if (!res.success) {
            return Swal.fire('Error', res.message || 'No se pudieron cargar los estudiantes.', 'error');
        }

        const students = Array.isArray(res.data) ? res.data : [];
        const listHtml = students.length === 0
            ? `<div style="text-align:center; padding:30px; color:rgba(255,255,255,0.4); font-style:italic;">No hay estudiantes en este horario.</div>`
            : students.map(st => `
                <div style="display:flex; align-items:center; gap:12px; padding:12px; background:rgba(255,255,255,0.03); border-radius:10px; border:1px solid rgba(255,255,255,0.05); margin-bottom:8px;">
                    <div style="width:36px; height:36px; background:rgba(52,152,219,0.15); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#3498db; flex-shrink:0;">
                        <i class="bi bi-person"></i>
                    </div>
                    <div style="flex:1; min-width:0;">
                        <div style="color:#fff; font-weight:600; font-size:0.95rem;">${st.full_name || st.student_name || 'Sin nombre'}</div>
                        <div style="color:rgba(255,255,255,0.4); font-size:0.78rem;">${st.email || ''}</div>
                    </div>
                </div>
            `).join('');

        Swal.fire({
            title: `<span style="font-size:1.1rem; color:#3498db;">Horario: ${scheduleLabel}</span>`,
            html: `
                <div style="font-size:0.82rem; color:rgba(255,255,255,0.5); margin-bottom:16px;">
                    <i class="bi bi-people-fill" style="margin-right:6px;"></i>${students.length} estudiante${students.length !== 1 ? 's' : ''} inscrito${students.length !== 1 ? 's' : ''}
                </div>
                <div style="max-height:320px; overflow-y:auto; text-align:left;">
                    ${listHtml}
                </div>
            `,
            showCancelButton: true,
            cancelButtonText: 'Cerrar',
            confirmButtonText: '<i class="bi bi-arrow-left"></i> Volver al curso',
            confirmButtonColor: '#3498db',
            background: '#1a1a1a',
            color: '#fff'
        }).then(r => {
            if (r.isConfirmed) this.openDetails(courseId, courseName);
        });
    },

    async unassignSingleTeacher(scheduleId, teacherId, courseId, courseName) {
        if ((await Swal.fire({
            title: '\u00bfRemover docente?',
            text: "Se desasignar\u00e1 solo a este docente del horario.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c'
        })).isConfirmed) {
            const res = await ApiService.unassignSingleTeacher(scheduleId, teacherId);
            if (res.success) {
                Swal.fire('Removido', '', 'success');
                this.openDetails(courseId, courseName);
            } else {
                Swal.fire('Error', res.message, 'error');
            }
        }
    },

    // --- Helpers ---
    generateStudentsList(students, courseId, courseName) {
        if (!students || students.length === 0) return '<div style="text-align:center; padding:40px; color:rgba(255,255,255,0.3); font-style:italic;">No hay estudiantes inscritos aÃºn.</div>';

        return students.map(s => `
            <div class="admin-course-card" style="border-left: 4px solid ${s.status === 'Activo' ? '#2ecc71' : '#e74c3c'}; background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%); margin-bottom: 12px; padding: 15px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex-grow:1;">
                        <div class="course-title" style="font-size:1.1rem; color:#fff; font-weight:600; text-shadow:0 1px 2px rgba(0,0,0,0.5);">${s.student_name}</div>
                        <div class="course-subtitle" style="font-size:0.85rem; color:rgba(255,255,255,0.5); margin-top:2px;">
                            <i class="bi bi-calendar3" style="margin-right:5px;"></i> Inscrito el: ${s.enrollment_date || 'N/A'}
                        </div>
                        <div style="margin-top:8px; display:flex; gap:5px; flex-wrap:wrap;">
                            ${s.schedules_assigned && s.schedules_assigned.length > 0
                ? s.schedules_assigned.map(sch => `
                                    <span style="background:rgba(52, 152, 219, 0.2); color:#3498db; padding:4px 10px; border-radius:20px; font-size:0.75rem; border:1px solid rgba(52, 152, 219, 0.3); display:inline-flex; align-items:center;">
                                        <i class="bi bi-clock" style="margin-right:4px;"></i> ${sch.day} ${ApiService.formatTime(sch.time_start)}
                                    </span>
                                  `).join('')
                : '<span style="background:rgba(231, 76, 60, 0.15); color:#e74c3c; padding:4px 10px; border-radius:20px; font-size:0.75rem; border:1px solid rgba(231, 76, 60, 0.3);">Sin Horario Asignado</span>'
            }
                        </div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-icon-glass" onclick="assignStudentSchedule(${s.id_enrollment}, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" title="Asignar Horario" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#fff; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:0.3s; cursor:pointer;">
                            <i class="bi bi-calendar-check"></i>
                        </button>
                        <button class="btn-icon-glass" onclick="unenrollStudentAdmin(${s.id_enrollment}, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" title="Desinscribir" style="background:rgba(231,76,60,0.1); border:1px solid rgba(231,76,60,0.3); color:#e74c3c; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:0.3s; cursor:pointer;">
                            <i class="bi bi-person-dash"></i>
                        </button>
                    </div>
                </div>
            </div>
    `).join('');
    },

    generatePendingList(pending, courseId, courseName) {
        if (!pending || pending.length === 0) return '';
        return `
    <div style="background:rgba(255, 159, 67, 0.05); border-radius:15px; padding:15px; margin-bottom:20px; border:1px dashed rgba(255, 159, 67, 0.3);">
        <h5 style="color:#ff9f43; margin:0 0 15px 0; font-size:1rem; display:flex; align-items:center;">
            <i class="bi bi-exclamation-circle" style="margin-right:8px;"></i> Solicitudes Pendientes
        </h5>
                ${pending.map(p => `
                    <div style="background:rgba(0,0,0,0.2); padding:12px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="color:#fff; font-weight:600;">${p.student_name}</div>
                            <div style="font-size:0.8rem; color:rgba(255,255,255,0.5);">Solicitado: ${p.request_date}</div>
                            ${p.id_schedule
                ? `<div style="font-size:0.8rem; color:#aaa; margin-top:3px;"><i class="bi bi-pin-angle"></i> Pref: ${p.day} ${ApiService.formatTime(p.time_start)}</div>`
                : ''}
                        </div>
                        <div style="display:flex; gap:8px;">
                            <button onclick="processRequest(${p.id_enrollment}, 'approve', ${courseId}, '${courseName.replace(/'/g, "\\'")}', ${p.id_schedule || 'null'}, ${p.teacher_id || 'null'})" style="background:#2ecc71; border:none; color:white; width:32px; height:32px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(46, 204, 113, 0.3);"><i class="bi bi-check-lg"></i></button>
                            <button onclick="processRequest(${p.id_enrollment}, 'reject', ${courseId}, '${courseName.replace(/'/g, "\\'")}', null, null)" style="background:#e74c3c; border:none; color:white; width:32px; height:32px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(231, 76, 60, 0.3);"><i class="bi bi-x-lg"></i></button>
                        </div>
                    </div>
                `).join('')
            }
            </div>
    `;
    },

    generateSchedulesList(schedules, courseId, courseName) {
        if (!schedules || schedules.length === 0) return `
            <div style="text-align:center; padding:40px;">
                <div style="font-size:3rem; color:rgba(255,255,255,0.1); margin-bottom:15px;"><i class="bi bi-calendar-x"></i></div>
                <div style="color:rgba(255,255,255,0.4); margin-bottom:20px;">No hay horarios configurados para este curso.</div>
                <button onclick="editSchedule(null, ${courseId}, '${courseName.replace(/'/g, "\\'")}')"
                        style="background:var(--color-acento-azul); border:none; padding:10px 25px; border-radius:30px; color:white; font-weight:600; cursor:pointer;">
                    <i class="bi bi-plus-lg"></i> Agregar Primer Horario
                </button>
            </div>`;

        const DAY_ORDER = ['Lunes', 'Martes', 'Mi\u00e9rcoles', 'Jueves', 'Viernes', 'S\u00e1bado', 'Domingo'];
        const byDay = {};
        DAY_ORDER.forEach(d => { byDay[d] = []; });
        schedules.forEach(s => { const d = s.day || 'Otros'; if (!byDay[d]) byDay[d] = []; byDay[d].push(s); });
        const activeDays = DAY_ORDER.filter(d => byDay[d].length > 0);
        const safeCourseName = courseName.replace(/'/g, "\\'");

        const dayColumns = activeDays.map(day => {
            const slots = byDay[day];
            const slotCards = slots.map(s => {
                const hasTeachers = s.teachers && s.teachers.length > 0;
                const currentTeacherIds = hasTeachers ? JSON.stringify(s.teachers.map(t => t.id)) : '[]';
                const enrolled = s.enrolled_count || 0;
                const capacity = s.quota || 15;
                const pct = capacity > 0 ? Math.min((enrolled / capacity) * 100, 100) : 0;
                const barColor = pct >= 100 ? '#e74c3c' : pct >= 80 ? '#f1c40f' : '#2ecc71';
                const bdr = hasTeachers ? 'rgba(52,152,219,0.4)' : 'rgba(255,255,255,0.06)';

                const teacherChip = hasTeachers
                    ? '<div style="margin:6px 0 4px; display:flex; flex-wrap:wrap; gap:4px; align-items:center;">' +
                    s.teachers.map(t =>
                        '<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(52,152,219,0.12);color:#74b9ff;border:1px solid rgba(52,152,219,0.25);border-radius:20px;padding:1px 6px;font-size:0.65rem;">' +
                        '<i class="bi bi-person-fill" style="font-size:0.6rem;"></i>' + t.name +
                        '<span onclick="unassignSingleTeacher(' + s.id_schedule + ',' + t.id + ',' + courseId + ',\'' + safeCourseName + '\')" style="cursor:pointer;color:rgba(255,100,100,0.6);margin-left:2px;" title="Remover" onmouseover="this.style.color=\'#e74c3c\'" onmouseout="this.style.color=\'rgba(255,100,100,0.6)\'">&times;</span>' +
                        '</span>'
                    ).join('') +
                    '<button onclick="assignTeacherModal(' + s.id_schedule + ',' + courseId + ',\'' + safeCourseName + '\',' + currentTeacherIds + ')" title="Asignar docente" style="background:rgba(52,152,219,0.1);border:none;color:#3498db;width:20px;height:20px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.65rem;" onmouseover="this.style.background=\'rgba(52,152,219,0.22)\'" onmouseout="this.style.background=\'rgba(52,152,219,0.1)\'"><i class="bi bi-person-plus"></i></button>' +
                    '</div>'
                    : '<div style="margin:6px 0 4px;color:rgba(255,159,67,0.55);font-size:0.69rem;display:flex;align-items:center;gap:5px;">' +
                    '<button onclick="assignTeacherModal(' + s.id_schedule + ',' + courseId + ',\'' + safeCourseName + '\',' + currentTeacherIds + ')" title="Asignar docente" style="background:rgba(255,159,67,0.12);border:none;color:rgba(255,159,67,0.85);width:18px;height:18px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.62rem;" onmouseover="this.style.background=\'rgba(255,159,67,0.22)\'" onmouseout="this.style.background=\'rgba(255,159,67,0.12)\'"><i class="bi bi-person-plus"></i></button>' +
                    'Sin docente</div>';

                const viewBtn = enrolled > 0
                    ? '<button onclick="viewScheduleStudents(' + s.id_schedule + ',\'' + day + ' ' + ApiService.formatTime(s.time_start) + '\',' + courseId + ',\'' + safeCourseName + '\')" title="Ver inscritos" style="background:rgba(46,204,113,0.1);border:none;color:#2ecc71;width:22px;height:22px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.68rem;" onmouseover="this.style.background=\'rgba(46,204,113,0.22)\'" onmouseout="this.style.background=\'rgba(46,204,113,0.1)\'"><i class="bi bi-people"></i></button>'
                    : '';

                return '<div onclick="viewScheduleStudents(' + s.id_schedule + ',\'' + day + ' ' + ApiService.formatTime(s.time_start) + '\',' + courseId + ',\'' + safeCourseName + '\')" ' +
                    'style="background:rgba(255,255,255,0.03);border:1px solid ' + bdr + ';border-radius:11px;padding:8px 8px;margin-bottom:7px;transition:all 0.2s;cursor:pointer;" ' +
                    'onmouseover="this.style.borderColor=\'rgba(52,152,219,0.45)\';this.style.background=\'rgba(255,255,255,0.06)\'" ' +
                    'onmouseout="this.style.borderColor=\'' + bdr + '\';this.style.background=\'rgba(255,255,255,0.03)\'">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;gap:3px;">' +
                    '<span style="background:rgba(52,152,219,0.14);color:#74b9ff;border:1px solid rgba(52,152,219,0.2);padding:2px 4px;border-radius:7px;font-size:0.65rem;font-weight:600;white-space:nowrap;">' +
                    ApiService.formatTime(s.time_start) + '&ndash;' + ApiService.formatTime(s.time_end) +
                    '</span>' +
                    '<div style="display:flex;gap:3px;flex-shrink:0;">' +
                    '<button onclick="event.stopPropagation(); editSchedule(' + s.id_schedule + ',' + courseId + ',\'' + safeCourseName + '\',\'' + s.day + '\',\'' + s.time_start + '\',\'' + s.time_end + '\')" title="Editar" style="background:rgba(255,255,255,0.05);border:none;color:rgba(255,255,255,0.45);width:22px;height:22px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.68rem;" onmouseover="this.style.background=\'rgba(255,255,255,0.12)\';this.style.color=\'#fff\'" onmouseout="this.style.background=\'rgba(255,255,255,0.05)\';this.style.color=\'rgba(255,255,255,0.45)\'"><i class="bi bi-pencil"></i></button>' +
                    '</div>' +
                    '</div>' +
                    teacherChip +
                    '<div style="margin-top:5px;">' +
                    '<div style="display:flex;justify-content:space-between;font-size:0.66rem;color:rgba(255,255,255,0.27);margin-bottom:2px;"><span>' + enrolled + '/' + capacity + '</span><span>' + Math.round(pct) + '%</span></div>' +
                    '<div style="width:100%;height:3px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden;"><div style="width:' + pct + '%;height:100%;background:' + barColor + ';transition:width 0.4s;"></div></div>' +
                    '</div>' +
                    '</div>';
            }).join('');

            return '<div style="flex:1; min-width:0;">' +
                '<div style="text-align:center;padding:6px 4px 9px;margin-bottom:8px;border-bottom:2px solid rgba(52,152,219,0.22);">' +
                '<div style="color:#74b9ff;font-weight:700;font-size:0.75rem;letter-spacing:0.5px;text-transform:uppercase;">' + day + '</div>' +
                '<div style="color:rgba(255,255,255,0.2);font-size:0.62rem;margin-top:2px;">' + slots.length + ' horario' + (slots.length !== 1 ? 's' : '') + '</div>' +
                '</div>' +
                slotCards +
                '</div>';
        }).join('');

        return '<div style="display:flex;justify-content:flex-end;margin-bottom:13px;">' +
            '<button onclick="editSchedule(null,' + courseId + ',\'' + safeCourseName + '\')" style="background:rgba(52,152,219,0.14);border:1px solid rgba(52,152,219,0.28);color:#3498db;padding:6px 16px;border-radius:20px;font-size:0.8rem;font-weight:600;cursor:pointer;">' +
            '<i class="bi bi-plus-circle"></i> Nuevo Horario' +
            '</button>' +
            '</div>' +
            '<div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:12px; padding-bottom:15px; align-items:flex-start;">' +
            dayColumns +
            '</div>';
    },

    closeDetails() {
        const modal = document.getElementById(this.modalId);
        if (modal) modal.style.display = 'none';
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    AcademicManager.init();

    // Expose Global Actions for HTML onclick
    window.openCourseDetails = (id, name) => AcademicManager.openDetails(id, name);
    window.openCourseManagement = () => AcademicManager.openOverview();
    window.editCourseBasicInfo = (id, name, desc, price) => AcademicManager.editCourseBasicInfo(id, name, desc, price);
    window.processRequest = (id, act, cId, cName, sId, tId) => AcademicManager.handleRequest(id, act, cId, cName, sId, tId);
    window.assignStudentSchedule = (enrId, cId, cName) => AcademicManager.assignStudentSchedule(enrId, cId, cName);
    window.unenrollStudentAdmin = (enrId, cId, cName) => AcademicManager.unenrollStudentAdmin(enrId, cId, cName);
    window.editSchedule = (sId, cId, cName, day, start, end) => AcademicManager.editSchedule(sId, cId, cName, day, start, end);
    window.assignTeacherModal = (sId, cId, cName) => AcademicManager.assignTeacherModal(sId, cId, cName);
    window.unassignTeacherSchedule = (sId, cId, cName) => AcademicManager.unassignTeacherSchedule(sId, cId, cName);
    window.unassignSingleTeacher = (sId, tId, cId, cName) => {
        if (typeof AcademicManager === 'undefined' || !AcademicManager.unassignSingleTeacher) {
            console.warn('AcademicManager no cargado. Reintentando...', AcademicManager);
            return;
        }
        AcademicManager.unassignSingleTeacher(sId, tId, cId, cName);
    };
    window.switchTab = (t) => AcademicManager.switchTab(t);
    // Updated bind for assignTeacherModal to support extra args
    window.assignTeacherModal = (sId, cId, cName, ids) => AcademicManager.assignTeacherModal(sId, cId, cName, ids);
});