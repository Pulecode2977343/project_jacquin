/**
 * teacher_academic.js
 * Panel de Gestión Académica para Docentes
 */

window.TeacherAcademic = {
    selectedCourse: null,
    selectedSchedule: null,
    session: null,

    init() {
        this.session = ApiService.getSession();
        if (!this.session || this.session.id_rol != 2) return; // Solo docentes

        // Usar botón existente del HTML
        const button = document.getElementById('btn-teacher-academic-access');
        if (button) {
            button.onclick = () => this.openModal();
        }

        this.injectModal();
    },

    injectModal() {
        if (document.getElementById('teacher-academic-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'teacher-academic-modal';
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-content glass-effect" style="max-width: 1100px; width: 95%; height: 90vh; display:flex; flex-direction:column; padding:0;">
                <div class="modal-header">
                    <h2 style="margin:0;"><i class="fas fa-graduation-cap"></i> Gestión Académica</h2>
                    <button class="close-modal-btn" onclick="TeacherAcademic.closeModal()"><i class="fas fa-times"></i></button>
                </div>
                
                <div class="modal-body" style="flex:1; overflow-y:auto; padding: 20px;">
                    <!-- Selector de Curso/Horario -->
                    <div id="course-schedule-selector" style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="display:block; margin-bottom: 5px; color: rgba(255,255,255,0.8);">Curso</label>
                                <select id="select-teacher-course" class="swal2-select" style="width:100%;">
                                    <option value="">Seleccione un curso...</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block; margin-bottom: 5px; color: rgba(255,255,255,0.8);">Horario</label>
                                <select id="select-teacher-schedule" class="swal2-select" style="width:100%;" disabled>
                                    <option value="">Primero seleccione un curso</option>
                                </select>
                            </div>
                        </div>
                        <div id="selected-info" style="display:none; padding: 10px; background: rgba(147, 182, 238, 0.1); border-left: 3px solid var(--color-acento-azul); border-radius: 5px;">
                            <strong id="info-course-name"></strong> - <span id="info-schedule-details"></span>
                        </div>
                    </div>

                    <!-- Tabs -->
                    <div class="tab-container">
                        <button class="tab-btn active" data-tab="attendance">Asistencia</button>
                        <button class="tab-btn" data-tab="assignments">Tareas</button>
                        <button class="tab-btn" data-tab="notes">Notas</button>
                    </div>

                    <!-- Tab Content: Asistencia -->
                    <div id="tab-attendance" class="tab-content active">
                        <div id="attendance-content">
                            <p style="color: rgba(255,255,255,0.5); text-align:center; padding: 40px;">Seleccione un curso y horario para tomar asistencia.</p>
                        </div>
                    </div>

                    <!-- Tab Content: Tareas -->
                    <div id="tab-assignments" class="tab-content">
                        <div id="assignments-content">
                            <button class="btn-primary" onclick="TeacherAcademic.showCreateAssignmentForm()" style="margin-bottom: 20px;" disabled id="btn-new-assignment">
                                <i class="fas fa-plus"></i> Nueva Tarea
                            </button>
                            <div id="assignments-list"></div>
                        </div>
                    </div>

                    <!-- Tab Content: Notas -->
                    <div id="tab-notes" class="tab-content">
                        <div id="notes-content">
                            <p style="color: rgba(255,255,255,0.5); text-align:center; padding: 40px;">Seleccione un curso para gestionar notas.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Cerrar al hacer clic fuera del modal (en el overlay)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log('[TeacherAcademic] Click en overlay, cerrando modal');
                this.closeModal();
            }
        });

        // Event listeners para tabs
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    },

    async openModal() {
        console.log('[TeacherAcademic] Abriendo modal...');
        const modal = document.getElementById('teacher-academic-modal');
        if (modal) {
            modal.style.display = 'flex';
            console.log('[TeacherAcademic] Modal visible, cargando cursos...');
            await this.loadTeacherCourses();
            this.setupCourseSelector();
        } else {
            console.error('[TeacherAcademic] ERROR: Modal no encontrado');
        }
    },

    closeModal() {
        document.getElementById('teacher-academic-modal').style.display = 'none';
        this.selectedCourse = null;
        this.selectedSchedule = null;
    },

    async loadTeacherCourses() {
        console.log('[TeacherAcademic] ==================== INICIO ====================');
        console.log('[TeacherAcademic] ID de usuario:', this.session.id_usuario);
        console.log('[TeacherAcademic] Rol:', this.session.id_rol);

        const selectCourse = document.getElementById('select-teacher-course');

        try {
            // Método 1: getUserDetails
            console.log('[TeacherAcademic] Método 1: getUserDetails...');
            const result = await ApiService.getUserDetails(this.session.id_usuario);
            console.log('[TeacherAcademic] Respuesta completa:', JSON.stringify(result, null, 2));

            if (result.success && result.user) {
                console.log('[TeacherAcademic] result.user.teacher_courses:', result.user.teacher_courses);
                console.log('[TeacherAcademic] result.user.courses:', result.user.courses);

                // Intentar múltiples propiedades
                let courses = result.user.teacher_courses || result.user.courses || [];

                if (courses && courses.length > 0) {
                    console.log('[TeacherAcademic] ✅ Encontrados', courses.length, 'cursos');
                    console.log('[TeacherAcademic] Cursos:', courses);
                    this.populateCoursesDropdown(courses);
                    return;
                }
            }

            // Método 2: getCourses con filtro
            console.log('[TeacherAcademic] Método 2: getCourses...');
            const coursesResult = await ApiService.getCourses();
            console.log('[TeacherAcademic] Respuesta getCourses:', coursesResult);

            if (coursesResult.success && coursesResult.data) {
                console.log('[TeacherAcademic] Total cursos en sistema:', coursesResult.data.length);

                // Filtrar cursos del profesor actual
                const teacherCourses = coursesResult.data.filter(course => {
                    return course.teacher_id == this.session.id_usuario ||
                        course.id_teacher == this.session.id_usuario ||
                        course.id_usuario_teacher == this.session.id_usuario;
                });

                console.log('[TeacherAcademic] Cursos filtrados:', teacherCourses.length);

                if (teacherCourses.length > 0) {
                    console.log('[TeacherAcademic] ✅ Usando cursos filtrados');
                    this.populateCoursesDropdown(teacherCourses);
                    return;
                }

                // FALLBACK: Mostrar todos (temporal para debugging)
                console.warn('[TeacherAcademic] ⚠️ Mostrando todos los cursos (DEBUG)');
                this.populateCoursesDropdown(coursesResult.data);
                return;
            }

            // Sin cursos
            console.error('[TeacherAcademic] ❌ No se encontraron cursos');
            if (selectCourse) {
                selectCourse.innerHTML = '<option value="">Sin cursos - revisar BD</option>';
            }

        } catch (error) {
            console.error('[TeacherAcademic] ❌ Excepción:', error);
            if (selectCourse) {
                selectCourse.innerHTML = '<option value="">Error cargando</option>';
            }
        }
    },

    populateCoursesDropdown(courses) {
        const selectCourse = document.getElementById('select-teacher-course');
        selectCourse.innerHTML = '<option value="">Seleccione un curso...</option>';

        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.name;
            option.dataset.courseData = JSON.stringify(course);
            selectCourse.appendChild(option);
        });
    },

    setupCourseSelector() {
        const selectCourse = document.getElementById('select-teacher-course');
        const selectSchedule = document.getElementById('select-teacher-schedule');

        selectCourse.addEventListener('change', async (e) => {
            const courseId = e.target.value;
            console.log('[TeacherAcademic] Curso seleccionado:', courseId);

            if (!courseId) {
                selectSchedule.disabled = true;
                selectSchedule.innerHTML = '<option value="">Primero seleccione un curso</option>';
                this.selectedCourse = null;
                return;
            }

            const courseData = JSON.parse(e.target.selectedOptions[0].dataset.courseData);
            this.selectedCourse = courseData;
            console.log('[TeacherAcademic] Datos del curso:', courseData);

            // Cargar horarios
            console.log('[TeacherAcademic] Cargando horarios del curso...');
            const result = await ApiService.getSchedules(courseId);
            console.log('[TeacherAcademic] Respuesta de horarios:', result);

            if (result.success && result.data && result.data.length > 0) {
                selectSchedule.disabled = false;
                selectSchedule.innerHTML = '<option value="">Seleccione un horario...</option>';

                result.data.forEach(schedule => {
                    const option = document.createElement('option');
                    option.value = schedule.id;
                    option.textContent = `${schedule.day} ${ApiService.formatTime(schedule.time_start)} - ${ApiService.formatTime(schedule.time_end)}`;
                    option.dataset.scheduleData = JSON.stringify(schedule);
                    selectSchedule.appendChild(option);
                });

                console.log('[TeacherAcademic] Horarios cargados:', result.data.length);

                // Mostrar mensaje instructivo en las tabs
                const instructionMsg = `
                    <div style="background: rgba(147, 182, 238, 0.1); border: 1px solid var(--color-acento-azul); border-radius: 12px; padding: 30px; text-align: center; margin: 40px auto; max-width: 500px;">
                        <i class="fas fa-clock" style="font-size: 3rem; color: var(--color-acento-azul); margin-bottom: 15px;"></i>
                        <h4 style="color: white; margin-bottom: 10px;">Seleccione un horario</h4>
                        <p style="color: rgba(255,255,255,0.7); margin: 0;">
                            Para ver la asistencia, tareas y notas, seleccione uno de los ${result.data.length} horarios disponibles arriba.
                        </p>
                    </div>
                `;

                document.getElementById('attendance-content').innerHTML = instructionMsg;
                document.getElementById('assignments-list').innerHTML = instructionMsg;
                document.getElementById('notes-content').innerHTML = instructionMsg;
            } else {
                console.error('[TeacherAcademic] Error cargando horarios o sin horarios disponibles');
                selectSchedule.disabled = true;
                selectSchedule.innerHTML = '<option value="">No hay horarios disponibles</option>';

                const noScheduleMsg = `
                    <div style="background: rgba(255, 82, 82, 0.1); border: 1px solid #FF5252; border-radius: 12px; padding: 30px; text-align: center; margin: 40px auto; max-width: 500px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #FF5252; margin-bottom: 15px;"></i>
                        <h4 style="color: white; margin-bottom: 10px;">Sin horarios</h4>
                        <p style="color: rgba(255,255,255,0.7); margin: 0;">
                            Este curso no tiene horarios configurados aún.
                        </p>
                    </div>
                `;

                document.getElementById('attendance-content').innerHTML = noScheduleMsg;
                document.getElementById('assignments-list').innerHTML = noScheduleMsg;
                document.getElementById('notes-content').innerHTML = noScheduleMsg;
            }
        });

        selectSchedule.addEventListener('change', (e) => {
            const scheduleId = e.target.value;
            if (!scheduleId) {
                this.selectedSchedule = null;
                document.getElementById('selected-info').style.display = 'none';
                document.getElementById('btn-new-assignment').disabled = true;
                return;
            }

            this.selectedSchedule = JSON.parse(e.target.selectedOptions[0].dataset.scheduleData);

            // Mostrar info
            document.getElementById('info-course-name').textContent = this.selectedCourse.name;
            document.getElementById('info-schedule-details').textContent =
                `${this.selectedSchedule.day} ${ApiService.formatTime(this.selectedSchedule.time_start)} - ${ApiService.formatTime(this.selectedSchedule.time_end)}`;
            document.getElementById('selected-info').style.display = 'block';
            document.getElementById('btn-new-assignment').disabled = false;

            // Recargar contenido de tabs
            this.loadAttendanceTab();
            this.loadAssignmentsTab();
            this.loadNotesTab();
        });
    },

    switchTab(tabName) {
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
    },

    async loadAttendanceTab() {
        if (!this.selectedSchedule) return;

        const container = document.getElementById('attendance-content');
        container.innerHTML = '<div class="loading-spinner"></div>';

        try {
            // Obtener estudiantes del horario
            const studentsResult = await ApiService.getAcademicData('get_schedule_students', {
                schedule_id: this.selectedSchedule.id
            });

            if (!studentsResult.success || !studentsResult.data || studentsResult.data.length === 0) {
                container.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align:center; padding: 40px;">No hay estudiantes inscritos en este horario.</p>';
                return;
            }

            // Fecha de hoy
            const today = new Date().toISOString().split('T')[0];

            // Intentar cargar asistencia existente
            const attendanceResult = await ApiService.teacherGetAttendance(this.selectedSchedule.id, today);
            const existingAttendance = attendanceResult.success ? attendanceResult.data : [];

            this.renderAttendanceChecklist(studentsResult.data, existingAttendance, today);
        } catch (error) {
            container.innerHTML = '<p style="color: #FF5252;">Error cargando estudiantes.</p>';
        }
    },

    renderAttendanceChecklist(students, existingAttendance, date) {
        const container = document.getElementById('attendance-content');

        const html = `
            <div style="margin-bottom: 20px;">
                <label style="color: rgba(255,255,255,0.8);">Fecha:</label>
                <input type="date" id="attendance-date" value="${date}" class="swal2-input" style="width: auto; display: inline-block; margin-left: 10px;">
                <button class="btn-primary" onclick="TeacherAcademic.loadAttendanceForDate()" style="margin-left: 10px;">Cargar</button>
            </div>

            <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px;">
                <table style="width: 100%; color: white; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid rgba(255,255,255,0.1);">
                            <th style="text-align: left; padding: 10px;">Estudiante</th>
                            <th style="text-align: center; padding: 10px;">Presente</th>
                            <th style="text-align: center; padding: 10px;">Ausente</th>
                            <th style="text-align: center; padding: 10px;">Tardanza</th>
                            <th style="text-align: center; padding: 10px;">Justificado</th>
                        </tr>
                    </thead>
                    <tbody id="attendance-table-body">
                        ${students.map(student => {
            const existing = existingAttendance.find(a => a.student_id == student.id_usuario);
            const status = existing ? existing.status : 'present';

            return `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <td style="padding: 10px;">${student.full_name}</td>
                                    <td style="text-align: center;"><input type="radio" name="attendance-${student.id_usuario}" value="present" ${status === 'present' ? 'checked' : ''}></td>
                                    <td style="text-align: center;"><input type="radio" name="attendance-${student.id_usuario}" value="absent" ${status === 'absent' ? 'checked' : ''}></td>
                                    <td style="text-align: center;"><input type="radio" name="attendance-${student.id_usuario}" value="late" ${status === 'late' ? 'checked' : ''}></td>
                                    <td style="text-align: center;"><input type="radio" name="attendance-${student.id_usuario}" value="excused" ${status === 'excused' ? 'checked' : ''}></td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>

                <button class="btn-primary" onclick="TeacherAcademic.saveAttendance()" style="margin-top: 20px;">
                    <i class="fas fa-save"></i> Guardar Asistencia
                </button>
            </div>
        `;

        container.innerHTML = html;
    },

    async loadAttendanceForDate() {
        const date = document.getElementById('attendance-date').value;
        if (!date) return;

        const container = document.getElementById('attendance-content');
        container.innerHTML = '<div class="loading-spinner"></div>';

        const attendanceResult = await ApiService.teacherGetAttendance(this.selectedSchedule.id, date);
        const studentsResult = await ApiService.getAcademicData('get_schedule_students', {
            schedule_id: this.selectedSchedule.id
        });

        if (studentsResult.success) {
            this.renderAttendanceChecklist(
                studentsResult.data,
                attendanceResult.success ? attendanceResult.data : [],
                date
            );
        }
    },

    async saveAttendance() {
        const date = document.getElementById('attendance-date').value;
        const tbody = document.getElementById('attendance-table-body');
        const rows = tbody.querySelectorAll('tr');

        const students = [];
        rows.forEach(row => {
            const radio = row.querySelector('input[type="radio"]:checked');
            if (radio) {
                const studentId = radio.name.replace('attendance-', '');
                students.push({
                    student_id: parseInt(studentId),
                    status: radio.value
                });
            }
        });

        const result = await ApiService.teacherSaveAttendance({
            schedule_id: this.selectedSchedule.id,
            date: date,
            students: students
        });

        if (result.success) {
            Swal.fire('Guardado', 'Asistencia registrada correctamente', 'success');
        } else {
            Swal.fire('Error', result.message, 'error');
        }
    },

    async loadAssignmentsTab() {
        if (!this.selectedCourse) return;

        const container = document.getElementById('assignments-list');
        container.innerHTML = '<div class="loading-spinner"></div>';

        const result = await ApiService.teacherGetAssignments(this.selectedCourse.id);

        if (result.success && result.data) {
            this.renderAssignmentsList(result.data);
        } else {
            container.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No hay tareas creadas aún.</p>';
        }
    },

    renderAssignmentsList(assignments) {
        const container = document.getElementById('assignments-list');

        if (assignments.length === 0) {
            container.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No hay tareas creadas aún.</p>';
            return;
        }

        container.innerHTML = assignments.map(a => `
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid var(--color-acento-naranja);">
                <h4 style="margin: 0 0 5px 0;">${a.title}</h4>
                <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem; margin: 5px 0;">${a.description || 'Sin descripción'}</p>
                <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">
                    Vence: ${a.due_date ? new Date(a.due_date).toLocaleDateString() : 'Sin fecha límite'}
                </div>
            </div>
        `).join('');
    },

    showCreateAssignmentForm() {
        if (!this.selectedCourse) {
            Swal.fire('Error', 'Seleccione un curso primero', 'warning');
            return;
        }

        const formHtml = `
            <div style="text-align:left;">
                <label>Título</label>
                <input type="text" id="swal-assign-title" class="swal2-input" placeholder="Ej: Tarea de Matemáticas">
                
                <label>Descripción</label>
                <textarea id="swal-assign-desc" class="swal2-textarea" placeholder="Instrucciones..."></textarea>
                
                <label>Tipo de Material</label>
                <select id="swal-assign-type" class="swal2-select">
                    <option value="none">Ninguno</option>
                    <option value="document">Documento</option>
                    <option value="video">Video</option>
                    <option value="link">Enlace</option>
                </select>

                <label>URL del Material</label>
                <input type="text" id="swal-assign-url" class="swal2-input" placeholder="https://...">

                <label>Fecha Límite</label>
                <input type="date" id="swal-assign-date" class="swal2-input">
            </div>
        `;

        Swal.fire({
            title: 'Nueva Tarea',
            html: formHtml,
            showCancelButton: true,
            confirmButtonText: 'Crear',
            preConfirm: () => {
                return {
                    course_id: this.selectedCourse.id,
                    teacher_id: this.session.id_usuario,
                    title: document.getElementById('swal-assign-title').value,
                    description: document.getElementById('swal-assign-desc').value,
                    media_type: document.getElementById('swal-assign-type').value,
                    media_url: document.getElementById('swal-assign-url').value,
                    due_date: document.getElementById('swal-assign-date').value
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const resp = await ApiService.teacherCreateAssignment(result.value);
                if (resp.success) {
                    Swal.fire('Creada', 'La tarea ha sido creada', 'success');
                    this.loadAssignmentsTab();
                } else {
                    Swal.fire('Error', resp.message, 'error');
                }
            }
        });
    },

    async loadNotesTab() {
        if (!this.selectedSchedule) {
            const container = document.getElementById('notes-content');
            container.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align:center; padding: 40px;">Seleccione un curso y horario para gestionar notas.</p>';
            return;
        }

        const container = document.getElementById('notes-content');
        container.innerHTML = '<div class="loading-spinner"></div>';

        try {
            // Obtener estudiantes del horario
            const studentsResult = await ApiService.getAcademicData('get_schedule_students', {
                schedule_id: this.selectedSchedule.id
            });

            if (!studentsResult.success || !studentsResult.data || studentsResult.data.length === 0) {
                container.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align:center; padding: 40px;">No hay estudiantes inscritos en este horario.</p>';
                return;
            }

            // Obtener notas existentes
            const notesResult = await ApiService.teacherGetNotes(this.selectedCourse.id, this.selectedSchedule.id);
            const existingNotes = notesResult.success ? notesResult.data : [];

            this.renderNotesInterface(studentsResult.data, existingNotes);
        } catch (error) {
            console.error('Error loading notes:', error);
            container.innerHTML = '<p style="color: #FF5252;">Error cargando estudiantes.</p>';
        }
    },

    renderNotesInterface(students, existingNotes) {
        const container = document.getElementById('notes-content');

        const html = `
            <div style="margin-bottom: 20px;">
                <button class="btn-primary" onclick="TeacherAcademic.showAddNoteForm()" style="margin-bottom: 15px;">
                    <i class="fas fa-plus"></i> Agregar Nota/Calificación
                </button>
            </div>

            <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px;">
                <h4 style="color: #fff; margin-top: 0; margin-bottom: 20px;">
                    <i class="fas fa-chart-line"></i> Listado de Estudiantes
                </h4>
                <table style="width: 100%; color: white; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid rgba(255,255,255,0.1);">
                            <th style="text-align: left; padding: 12px;">Estudiante</th>
                            <th style="text-align: center; padding: 12px;">Notas Registradas</th>
                            <th style="text-align: center; padding: 12px;">Promedio</th>
                            <th style="text-align: center; padding: 12px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(student => {
            const studentNotes = existingNotes.filter(n => n.student_id == student.id_usuario);
            const avg = studentNotes.length > 0
                ? (studentNotes.reduce((sum, n) => sum + parseFloat(n.score || 0), 0) / studentNotes.length).toFixed(1)
                : '-';

            return `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <td style="padding: 12px;">${student.full_name}</td>
                                    <td style="text-align: center; padding: 12px;">${studentNotes.length}</td>
                                    <td style="text-align: center; padding: 12px;">
                                        <span style="background: ${avg !== '-' ? 'linear-gradient(135deg, var(--color-acento-azul), var(--color-acento-naranja))' : 'rgba(255,255,255,0.1)'}; padding: 4px 12px; border-radius: 12px; font-weight: 600;">
                                            ${avg}
                                        </span>
                                    </td>
                                    <td style="text-align: center; padding: 12px;">
                                        <button class="btn-sm btn-outline" onclick="TeacherAcademic.viewStudentNotes(${student.id_usuario}, '${student.full_name}')">
                                            <i class="fas fa-eye"></i> Ver
                                        </button>
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    },

    showAddNoteForm() {
        if (!this.selectedSchedule) {
            Swal.fire('Error', 'Seleccione un horario primero', 'warning');
            return;
        }

        // Obtener estudiantes para el selector
        ApiService.getAcademicData('get_schedule_students', {
            schedule_id: this.selectedSchedule.id
        }).then(result => {
            if (!result.success || !result.data) {
                Swal.fire('Error', 'No se pudieron cargar los estudiantes', 'error');
                return;
            }

            const formHtml = `
                <div style="text-align:left;">
                    <label>Estudiante</label>
                    <select id="swal-note-student" class="swal2-select" style="width:100%;">
                        <option value="">Seleccione un estudiante</option>
                        ${result.data.map(s => `
                            <option value="${s.id_usuario}">${s.full_name}</option>
                        `).join('')}
                    </select>

                    <label style="margin-top: 15px;">Tipo de Evaluación</label>
                    <select id="swal-note-type" class="swal2-select" style="width:100%;">
                        <option value="quiz">Quiz</option>
                        <option value="exam">Examen</option>
                        <option value="assignment">Tarea</option>
                        <option value="participation">Participación</option>
                        <option value="project">Proyecto</option>
                    </select>

                    <label style="margin-top: 15px;">Calificación (0-10)</label>
                    <input type="number" id="swal-note-score" class="swal2-input" min="0" max="10" step="0.1" placeholder="Ej: 8.5">

                    <label style="margin-top: 15px;">Comentarios</label>
                    <textarea id="swal-note-comment" class="swal2-textarea" placeholder="Retroalimentación para el estudiante..."></textarea>
                </div>
            `;

            Swal.fire({
                title: 'Nueva Nota/Calificación',
                html: formHtml,
                showCancelButton: true,
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    const studentId = document.getElementById('swal-note-student').value;
                    const score = document.getElementById('swal-note-score').value;

                    if (!studentId) {
                        Swal.showValidationMessage('Seleccione un estudiante');
                        return false;
                    }
                    if (!score || score < 0 || score > 10) {
                        Swal.showValidationMessage('Ingrese una calificación válida (0-10)');
                        return false;
                    }

                    return {
                        student_id: parseInt(studentId),
                        course_id: this.selectedCourse.id,
                        schedule_id: this.selectedSchedule.id,
                        note_type: document.getElementById('swal-note-type').value,
                        score: parseFloat(score),
                        comment: document.getElementById('swal-note-comment').value
                    };
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const resp = await ApiService.teacherAddNote(result.value);
                    if (resp.success) {
                        Swal.fire('Guardado', 'La nota ha sido registrada correctamente', 'success');
                        this.loadNotesTab();
                    } else {
                        Swal.fire('Error', resp.message || 'No se pudo guardar la nota', 'error');
                    }
                }
            });
        });
    },

    async viewStudentNotes(studentId, studentName) {
        const result = await ApiService.teacherGetNotes(this.selectedCourse.id, this.selectedSchedule.id);
        if (!result.success) {
            Swal.fire('Error', 'No se pudieron cargar las notas', 'error');
            return;
        }

        const studentNotes = result.data.filter(n => n.student_id == studentId);

        if (studentNotes.length === 0) {
            Swal.fire('Sin Notas', `${studentName} no tiene notas registradas aún.`, 'info');
            return;
        }

        const notesHtml = `
            <div style="max-height: 400px; overflow-y: auto;">
                ${studentNotes.map(note => `
                    <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid var(--color-acento-azul);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; text-transform: uppercase;">
                                ${note.note_type}
                            </span>
                            <span style="background: linear-gradient(135deg, var(--color-acento-azul), var(--color-acento-naranja)); padding: 6px 14px; border-radius: 12px; font-weight: 700; font-size: 1.1rem;">
                                ${note.score}
                            </span>
                        </div>
                        ${note.comment ? `
                            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 0.9rem;">
                                <i class="fas fa-comment"></i> ${note.comment}
                            </p>
                        ` : ''}
                        <p style="color: rgba(255,255,255,0.5); margin: 8px 0 0 0; font-size: 0.75rem;">
                            <i class="fas fa-calendar"></i> ${new Date(note.created_at).toLocaleDateString()}
                        </p>
                    </div>
                `).join('')}
            </div>
        `;

        const avg = (studentNotes.reduce((sum, n) => sum + parseFloat(n.score), 0) / studentNotes.length).toFixed(2);

        Swal.fire({
            title: `Notas de ${studentName}`,
            html: `
                <div style="text-align: left;">
                    <div style="background: linear-gradient(135deg, var(--color-acento-azul), var(--color-acento-naranja)); padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                        <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">Promedio General</div>
                        <div style="font-size: 2.5rem; font-weight: 700;">${avg}</div>
                    </div>
                    ${notesHtml}
                </div>
            `,
            width: '600px',
            confirmButtonText: 'Cerrar'
        });
    }
};

// Auto-init: Sistema mejorado sin condiciones de carrera
document.addEventListener('DOMContentLoaded', () => {
    // Intentar inicialización inmediata
    TeacherAcademic.init();

    // También escuchar evento personalizado para reintentar cuando el dashboard termine de cargar
    document.addEventListener('dashboard-role-loaded', (e) => {
        if (e.detail && e.detail.role === 2) { // Rol 2 = Docente
            console.log('[TeacherAcademic] Reintentando inicialización después de dashboard-role-loaded');
            TeacherAcademic.init();
        }
    });
});
