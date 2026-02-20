/**
 * Academic Management Module
 * Consolidated logic for Courses, Schedules, and Enrollments.
 */

const AcademicManager = {
    // State
    courses: [],
    pendingGroups: {},

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
            const [coursesRes, pendingRes] = await Promise.all([
                ApiService.getCourses(),
                ApiService.getPendingEnrollments()
            ]);

            if (coursesRes.success) {
                // Ensure we handle 'Instalaciones' exclusion if needed, or keep all
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
            <div class="modal-card-container custom-scroll">
                <div class="modal-header-row">
                    <div>
                        <h2 style="color:white; margin:0; font-size:1.8rem; font-weight:300;">Gestión Académica</h2>
                        <p style="color:rgba(255,255,255,0.4); margin:5px 0 0 0;">Selecciona una materia para gestionar inscritos y horarios.</p>
                    </div>
                    <button class="btn-close-modal" onclick="document.getElementById('${this.modalId}').style.display='none'"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="courses-grid">${coursesListHtml}</div>
            </div>
        `;

        // Close on outside click
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };

        modal.style.display = "flex";
    },

    buildCourseCard(c, pCount, hasAction) {
        return `
        <div onclick="openCourseDetails(${c.id_course}, '${c.name.replace(/'/g, "\\'")}')" 
             class="admin-course-card"
             style="border-color:${hasAction ? 'rgba(255, 159, 67, 0.4)' : 'rgba(255,255,255,0.05)'}; 
                    border-left-color:${hasAction ? '#ff9f43' : 'var(--color-acento-azul)'};">
            
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div class="course-title">${c.name}</div>
                    <div class="course-subtitle">ID: ${c.id_course} | DOCENTE: <span style="color: var(--color-acento-azul);">${c.teacher_name || 'SIN ASIGNAR'}</span></div>
                </div>
                ${hasAction ? `
                    <div class="pending-badge">${pCount}</div>
                ` : '<i class="bi bi-chevron-right" style="color:#444;"></i>'}
            </div>
        </div>
        `;
    },

    injectStyles() {
        if (document.getElementById('academic-manager-styles')) return;
        const style = document.createElement('style');
        style.id = 'academic-manager-styles';
        style.textContent = `
            .modal-card-container {
                background:#141414; padding:35px; border-radius:30px; width:95%; max-width:700px; 
                max-height:85vh; overflow-y:auto; border:1px solid rgba(255,255,255,0.1); 
                box-shadow:0 50px 100px rgba(0,0,0,0.9);
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
            <div class="modal-card-container custom-scroll" style="max-width:800px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                    <div>
                        <h2 style="color:white; margin:0; font-size:1.8rem;">${courseName}</h2>
                        <p style="color:rgba(255,255,255,0.4); margin:5px 0 0 0;">Gestión de alumnos y programación.</p>
                    </div>
                     <div style="display:flex; gap:10px;">
                        <button onclick="editCourseBasicInfo(${courseId}, '${courseName.replace(/'/g, "\\'")}', '${(info.description || '').replace(/'/g, "\\'")}', ${info.price || 0})" class="btn-back-top">
                            <i class="bi bi-pencil-square"></i> Editar
                        </button>
                         <button onclick="AcademicManager.closeDetails()" class="btn-close-modal">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>

                <!-- Tabs -->
                <div style="display:flex; gap:15px; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
                    <button id="btn-tab-enrollments" onclick="switchTab('tab-enrollments')" style="background:none; border:none; color:white; font-size:1rem; cursor:pointer; padding:5px 10px;">Inscritos (${students.length})</button>
                    <button id="btn-tab-schedules" onclick="switchTab('tab-schedules')" style="background:none; border:none; color:#777; font-size:1rem; cursor:pointer; padding:5px 10px;">Horarios (${schedules.length})</button>
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
        const teachers = (res.success && res.data) ? res.data.filter(u => u.id_rol == 2) : [];
        const { value: selectedId } = await Swal.fire({
            title: 'Asignar Docente',
            input: 'select',
            inputOptions: Object.fromEntries(teachers.map(t => [t.id_usuario, t.full_name])),
            inputValue: teacherId,
            showCancelButton: true
        });
        if (selectedId) this.confirmTeacherChange(courseId, selectedId);
    },

    async confirmTeacherChange(courseId, teacherId) {
        const res = await ApiService.updateCourseTeacher(courseId, teacherId);
        if (res.success) { Swal.fire('Actualizado', '', 'success'); this.loadCourses(); this.openOverview(); }
        else Swal.fire('Error', res.message, 'error');
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
        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const title = scheduleId ? 'Editar Horario' : 'Nuevo Horario';

        // Helper to create valid HTML for Swal
        const html = `
            <div style="text-align:left;">
                <label style="display:block; margin-bottom:5px; color:#aaa;">Día</label>
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
            title: '¿Desasignar Docente?',
            text: "El horario volverá a estado PENDIENTE.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, desasignar'
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
        if ((await Swal.fire({ title: '¿Desinscribir?', text: 'Esta acción es irreversible.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' })).isConfirmed) {
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
        alert("Esta función está siendo optimizada. Por favor use 'Horarios' para ver disponibilidad general.");
    },

    async editCourseBasicInfo(id, name, desc, price) {
        const { value: formValues } = await Swal.fire({
            title: 'Editar Curso',
            html: `
                <input id="swal-input1" class="swal2-input" placeholder="Nombre" value="${name}">
                <textarea id="swal-input2" class="swal2-textarea" placeholder="Descripción">${desc}</textarea>
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

            btnEn.style.background = isActiveEn ? 'var(--color-acento-azul)' : 'none';
            btnEn.style.color = isActiveEn ? '#121212' : '#777';
            btnEn.style.boxShadow = isActiveEn ? '0 0 10px rgba(52, 152, 219, 0.3)' : 'none';

            btnSc.style.background = isActiveSc ? 'var(--color-acento-azul)' : 'none';
            btnSc.style.color = isActiveSc ? '#121212' : '#777';
            btnSc.style.boxShadow = isActiveSc ? '0 0 10px rgba(52, 152, 219, 0.3)' : 'none';
        }
    },

    async unassignSingleTeacher(scheduleId, teacherId, courseId, courseName) {
        if ((await Swal.fire({
            title: '¿Remover docente?',
            text: "Se desasignará solo a este docente del horario.",
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
        if (!students || students.length === 0) return '<div style="text-align:center; padding:40px; color:rgba(255,255,255,0.3); font-style:italic;">No hay estudiantes inscritos aún.</div>';

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
                <button onclick="editSchedule(null, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" style="background:var(--color-acento-azul); border:none; padding:10px 25px; border-radius:30px; color:white; font-weight:600; box-shadow:0 5px 15px rgba(52, 152, 219, 0.4); cursor:pointer;">
                    <i class="bi bi-plus-lg"></i> Agregar Primer Horario
                </button>
            </div>`;

        return `
            <div style="text-align:right; margin-bottom:15px;">
                <button onclick="editSchedule(null, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" style="background:rgba(52, 152, 219, 0.15); border:1px solid rgba(52, 152, 219, 0.3); color:#3498db; padding:8px 20px; border-radius:20px; font-weight:600; cursor:pointer; transition:0.3s;">
                    <i class="bi bi-plus-circle"></i> Nuevo Horario
                </button>
            </div>
    ${schedules.map(s => {
            const hasTeachers = s.teachers && s.teachers.length > 0;
            const teacherNames = hasTeachers ? s.teachers.map(t => t.name).join(', ') : 'Sin asignar';
            const currentTeacherIds = hasTeachers ? JSON.stringify(s.teachers.map(t => t.id)) : '[]';
            const enrolled = s.enrolled_count || 0;
            const capacity = s.max_capacity || 0; // Assuming max_capacity exists or default to 0
            const progress = capacity > 0 ? (enrolled / capacity) * 100 : 0;
            const progressColor = progress >= 100 ? '#e74c3c' : (progress >= 80 ? '#f1c40f' : '#2ecc71');

            return `
                <div class="admin-course-card" style="background: linear-gradient(145deg, rgba(20, 20, 20, 0.6) 0%, rgba(30, 30, 30, 0.4) 100%); border-left: 4px solid ${hasTeachers ? '#3498db' : '#95a5a6'}; margin-bottom:15px; padding:20px; border-radius:15px; border:1px solid rgba(255,255,255,0.05); box-shadow:0 5px 20px rgba(0,0,0,0.3);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div style="flex-grow:1;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div class="course-title" style="font-size:1.2rem; color:#fff; text-shadow:0 0 10px rgba(52, 152, 219, 0.3);">${s.day}</div>
                                <span style="background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:5px; font-size:0.8rem; color:#ccc;">${ApiService.formatTime(s.time_start)} - ${ApiService.formatTime(s.time_end)}</span>
                            </div>
                            


                            <div style="margin-top:12px;">
                                <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:rgba(255,255,255,0.4); margin-bottom:4px;">
                                    <span>Cupos: ${enrolled} / ${capacity}</span>
                                    <span>${Math.round(progress)}%</span>
                                </div>
                                <div style="width:100%; height:4px; background:rgba(255,255,255,0.1); border-radius:2px; overflow:hidden;">
                                    <div style="width:${Math.min(progress, 100)}%; height:100%; background:${progressColor}; box-shadow:0 0 10px ${progressColor}; transition:width 0.5s;"></div>
                                </div>
                            </div>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:8px; margin-left:20px;">
                            <button onclick="editSchedule(${s.id_schedule}, ${courseId}, '${courseName.replace(/'/g, "\\'")}', '${s.day}', '${s.time_start}', '${s.time_end}')" style="background:rgba(255,255,255,0.05); border:none; color:#fff; width:36px; height:36px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button onclick="assignTeacherModal(${s.id_schedule}, ${courseId}, '${courseName.replace(/'/g, "\\'")}', ${currentTeacherIds})" style="background:rgba(52, 152, 219, 0.1); border:none; color:#3498db; width:36px; height:36px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s; box-shadow:0 0 10px rgba(52, 152, 219, 0.1);" onmouseover="this.style.background='rgba(52, 152, 219, 0.2)'" onmouseout="this.style.background='rgba(52, 152, 219, 0.1)'">
                                <i class="bi bi-person-plus"></i>
                            </button>
                             ${hasTeachers ? `
                                <button onclick="unassignTeacherSchedule(${s.id_schedule}, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" style="background:rgba(231, 76, 60, 0.1); border:none; color:#e74c3c; width:36px; height:36px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='rgba(231, 76, 60, 0.2)'" onmouseout="this.style.background='rgba(231, 76, 60, 0.1)'" title="Desasignar TODOS">
                                    <i class="bi bi-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                     ${hasTeachers ? `
                        <div style="margin-top:15px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.05);">
                             <div style="font-size:0.75rem; color:rgba(255,255,255,0.3); margin-bottom:8px; letter-spacing:1px; text-transform:uppercase;">Docentes Asignados</div>
                             <div style="display:flex; flex-direction:column; gap:8px;">
                                ${s.teachers.map(t => `
                                    <div style="background:rgba(20, 20, 20, 0.6); border:1px solid rgba(255,255,255,0.05); padding:8px 12px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                                        <div style="display:flex; align-items:center; gap:10px;">
                                            <div style="width:30px; height:30px; background:rgba(255,255,255,0.1); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#aaa; font-size:0.9rem;">
                                                <i class="bi bi-person"></i>
                                            </div>
                                            <span style="color:#eee; font-size:0.9rem;">${t.name}</span>
                                        </div>
                                        <button onclick="unassignSingleTeacher(${s.id_schedule}, ${t.id}, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" title="Remover Docente" style="background:rgba(231, 76, 60, 0.1); color:#e74c3c; border:none; width:30px; height:30px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s;" onmouseover="this.style.background='rgba(231, 76, 60, 0.2)'" onmouseout="this.style.background='rgba(231, 76, 60, 0.1)'">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                `).join('')}
                             </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('')
            }
`;
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
