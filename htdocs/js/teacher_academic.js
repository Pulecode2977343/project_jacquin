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
        if (!this.session || parseInt(this.session.id_rol) !== 2) return; // Solo docentes

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
            <style>
                #teacher-academic-modal * {
                    font-family: 'Outfit', sans-serif !important;
                }
                .teacher-label {
                    display:block; 
                    margin-bottom: 5px; 
                    color: rgba(255,255,255,0.7);
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                .teacher-select {
                    width:100%; 
                    height: 48px; 
                    background: rgba(0,0,0,0.4) !important; 
                    color: white !important; 
                    border: 1px solid rgba(255,255,255,0.1) !important; 
                    border-radius: 12px !important;
                    padding: 0 15px;
                    outline: none;
                    transition: all 0.3s ease;
                }
                .teacher-select:focus {
                    border-color: var(--color-acento-azul) !important;
                    box-shadow: 0 0 15px rgba(147, 182, 238, 0.1);
                }
                .teacher-table {
                    width:100%; 
                    border-collapse:collapse; 
                    color: white;
                }
                .teacher-table th {
                    background: rgba(255,255,255,0.03);
                    padding: 15px;
                    text-align: left;
                    color: rgba(255,255,255,0.5);
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .teacher-table td {
                    padding: 15px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    color: white;
                }
                .teacher-tab-btn {
                    padding: 12px 25px; 
                    background: none; 
                    border: none; 
                    color: rgba(255,255,255,0.5); 
                    border-bottom: 3px solid transparent; 
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                .teacher-tab-btn.active {
                    color: var(--color-acento-azul);
                    border-bottom-color: var(--color-acento-azul);
                    background: rgba(147, 182, 238, 0.05);
                }
                .teacher-tab-btn:hover:not(.active) {
                    color: white;
                    background: rgba(255,255,255,0.02);
                }
                .teacher-input-dark {
                    background: rgba(0,0,0,0.3) !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    color: white !important;
                    border-radius: 8px !important;
                    padding: 8px 12px !important;
                }
            </style>
            <div class="modal-content glass-effect" style="max-width: 1100px; width: 95%; height: 90vh; display:flex; flex-direction:column; padding:0; background: rgba(10, 25, 41, 0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; box-shadow: 0 50px 100px rgba(0,0,0,0.5);">
                <div class="modal-header" style="padding: 25px 30px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin:0; color: white; font-weight: 300; font-size: 1.8rem;"><i class="fas fa-graduation-cap" style="color: var(--color-acento-azul); margin-right: 15px;"></i> Gestión Académica</h2>
                    <button class="close-modal-btn" onclick="TeacherAcademic.closeModal()" style="background: rgba(255,255,255,0.05); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">&times;</button>
                </div>
                
                <div class="modal-body custom-scroll" style="flex:1; overflow-y:auto; padding: 30px;">
                    <!-- Selector de Curso/Horario -->
                    <div id="course-schedule-selector" style="background: rgba(255,255,255,0.03); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 30px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 0;">
                            <div>
                                <label class="teacher-label">Curso</label>
                                <select id="select-teacher-course" class="teacher-select">
                                    <option value="" style="background: #0a1929;">Seleccione un curso...</option>
                                </select>
                            </div>
                            <div>
                                <label class="teacher-label">Horario</label>
                                <select id="select-teacher-schedule" class="teacher-select" disabled>
                                    <option value="" style="background: #0a1929;">Primero seleccione un curso</option>
                                </select>
                            </div>
                        </div>
                        <div id="selected-info" style="display:none; margin-top: 20px; padding: 15px 20px; background: rgba(147, 182, 238, 0.08); border-left: 4px solid var(--color-acento-azul); border-radius: 12px; animation: fadeIn 0.3s ease;">
                            <span style="color: rgba(255,255,255,0.6); font-size: 0.9rem;">Gestionando:</span>
                            <strong id="info-course-name" style="color: white; margin-left: 10px; font-size: 1.1rem;"></strong>
                            <span style="color: rgba(255,255,255,0.3); margin: 0 10px;">|</span>
                            <span id="info-schedule-details" style="color: var(--color-acento-azul); font-weight: 500;"></span>
                        </div>
                    </div>

                    <!-- Tabs -->
                    <div class="tab-container" style="display: flex; gap: 5px; margin-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <button class="teacher-tab-btn active" data-tab="attendance">Asistencia</button>
                        <button class="teacher-tab-btn" data-tab="assignments">Tareas</button>
                        <button class="teacher-tab-btn" data-tab="notes">Notas</button>
                    </div>

                    <!-- Tab Content: Asistencia -->
                    <div id="tab-attendance" class="tab-content active" style="display: block;">
                        <div id="attendance-content">
                            <div style="text-align:center; padding: 60px; color:rgba(255,255,255,0.2);">
                                <i class="fas fa-calendar-check" style="font-size: 3rem; margin-bottom: 20px; display: block;"></i>
                                Seleccione un curso y horario para tomar asistencia.
                            </div>
                        </div>
                    </div>

                    <!-- Tab Content: Tareas -->
                    <div id="tab-assignments" class="tab-content" style="display: none;">
                        <div id="assignments-content">
                            <button class="btn-primary" onclick="TeacherAcademic.showCreateAssignmentForm()" style="margin-bottom: 25px; padding: 12px 25px; border-radius: 12px; cursor: pointer; background: var(--color-acento-azul); color: #0a1929; border: none; font-weight: 700; display: flex; align-items: center; gap: 10px;" disabled id="btn-new-assignment">
                                <i class="fas fa-plus"></i> Nueva Tarea
                            </button>
                            <div id="assignments-list"></div>
                        </div>
                    </div>

                    <!-- Tab Content: Notas -->
                    <div id="tab-notes" class="tab-content" style="display: none;">
                        <div id="notes-content">
                            <div style="text-align:center; padding: 60px; color:rgba(255,255,255,0.2);">
                                <i class="fas fa-star" style="font-size: 3rem; margin-bottom: 20px; display: block;"></i>
                                Seleccione un curso para gestionar notas.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.onclick = (e) => { if (e.target === modal) this.closeModal(); };

        modal.querySelectorAll('.teacher-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    },

    async openModal() {
        const modal = document.getElementById('teacher-academic-modal');
        if (modal) {
            modal.style.display = 'flex';
            await this.loadTeacherCourses();
            this.setupCourseSelector();
        }
    },

    closeModal() {
        document.getElementById('teacher-academic-modal').style.display = 'none';
        this.selectedCourse = null;
        this.selectedSchedule = null;
    },

    async loadTeacherCourses() {
        const selectCourse = document.getElementById('select-teacher-course');
        try {
            const result = await ApiService.getUserDetails(this.session.id_usuario);
            if (result.success && result.data) {
                const courses = result.data.teaching || [];
                if (courses.length > 0) {
                    this.populateCoursesDropdown(courses);
                    return;
                }
            }

            // Fallback: getCourses
            const res = await ApiService.getCourses();
            if (res.success && res.data) {
                const teacherCourses = res.data.filter(c => c.teacher_id == this.session.id_usuario);
                this.populateCoursesDropdown(teacherCourses);
            }
        } catch (error) {
            console.error('[TeacherAcademic] Error loading courses:', error);
        }
    },

    populateCoursesDropdown(courses) {
        const select = document.getElementById('select-teacher-course');
        if (!select) return;
        select.innerHTML = '<option value="" style="background: #0a1929;">Seleccione un curso...</option>';
        courses.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id_course || c.id;
            opt.textContent = c.name || c.course_name;
            opt.style.background = "#0a1929";
            opt.dataset.courseData = JSON.stringify(c);
            select.appendChild(opt);
        });
    },

    setupCourseSelector() {
        const selectCourse = document.getElementById('select-teacher-course');
        const selectSchedule = document.getElementById('select-teacher-schedule');

        selectCourse.onchange = async (e) => {
            const courseId = e.target.value;
            if (!courseId) {
                selectSchedule.disabled = true;
                selectSchedule.innerHTML = '<option value="" style="background: #0a1929;">Primero seleccione un curso</option>';
                this.selectedCourse = null;
                return;
            }

            this.selectedCourse = JSON.parse(e.target.selectedOptions[0].dataset.courseData);

            const res = await ApiService.getSchedules(courseId);
            if (res.success && res.data && res.data.length > 0) {
                selectSchedule.disabled = false;
                selectSchedule.innerHTML = '<option value="" style="background: #0a1929;">Seleccione un horario...</option>';
                res.data.forEach(s => {
                    const opt = document.createElement('option');
                    opt.value = s.id_schedule;
                    opt.textContent = `${s.day} ${ApiService.formatTime(s.time_start)} - ${ApiService.formatTime(s.time_end)}`;
                    opt.style.background = "#0a1929";
                    opt.dataset.scheduleData = JSON.stringify(s);
                    selectSchedule.appendChild(opt);
                });

                // Show info message
                const msg = `<div style="text-align:center; padding:60px; color:rgba(255,255,255,0.2);"><i class="fas fa-clock" style="font-size: 2.5rem; margin-bottom: 20px; display: block;"></i> Seleccione un horario para ver la información.</div>`;
                document.getElementById('attendance-content').innerHTML = msg;
                document.getElementById('assignments-list').innerHTML = msg;
                document.getElementById('notes-content').innerHTML = msg;
            } else {
                selectSchedule.disabled = true;
                selectSchedule.innerHTML = '<option value="" style="background: #0a1929;">Sin horarios disponibles</option>';
            }
        };

        selectSchedule.onchange = (e) => {
            const sid = e.target.value;
            if (!sid) {
                this.selectedSchedule = null;
                document.getElementById('selected-info').style.display = 'none';
                document.getElementById('btn-new-assignment').disabled = true;
                return;
            }
            this.selectedSchedule = JSON.parse(e.target.selectedOptions[0].dataset.scheduleData);
            document.getElementById('selected-info').style.display = 'block';
            document.getElementById('info-course-name').textContent = this.selectedCourse.name || this.selectedCourse.course_name;
            document.getElementById('info-schedule-details').textContent = `${this.selectedSchedule.day} ${ApiService.formatTime(this.selectedSchedule.time_start)}`;
            document.getElementById('btn-new-assignment').disabled = false;

            this.loadAttendanceTab();
            this.loadAssignmentsTab();
            this.loadNotesTab();
        };
    },

    switchTab(tab) {
        document.querySelectorAll('.teacher-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = c.id === `tab-${tab}` ? 'block' : 'none');
    },

    async loadAttendanceTab() {
        if (!this.selectedSchedule) return;
        const container = document.getElementById('attendance-content');
        container.innerHTML = '<div style="text-align:center; padding:40px;"><div class="loading-spinner"></div><p style="color:rgba(255,255,255,0.5);margin-top:15px;">Cargando estudiantes...</p></div>';

        const res = await ApiService.getAcademicData('get_schedule_students', { schedule_id: this.selectedSchedule.id_schedule || this.selectedSchedule.id });
        if (res.success && res.data) {
            this.renderAttendanceList(res.data);
        } else {
            container.innerHTML = '<p style="text-align:center; padding:40px; color:#e74c3c;"><i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i> No se pudieron cargar los estudiantes.</p>';
        }
    },

    renderAttendanceList(students) {
        const container = document.getElementById('attendance-content');
        const today = new Date().toISOString().split('T')[0];

        let html = `
            <div style="margin-bottom:25px; display:flex; align-items:center; gap:15px; background: rgba(255,255,255,0.03); padding: 15px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); width: fit-content;">
                <label style="color: white; font-weight: 500;">Fecha de clase:</label>
                <input type="date" id="att-date" value="${today}" class="teacher-input-dark">
            </div>
            <div style="background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden;">
                <table class="teacher-table">
                    <thead>
                        <tr>
                            <th style="width: 70%;">Estudiante</th>
                            <th style="text-align:center;">Estado de Asistencia</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        students.forEach(s => {
            html += `
                <tr>
                    <td style="font-weight: 500;">${s.full_name}</td>
                    <td style="text-align:center;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
                            <select class="att-status" data-uid="${s.id_usuario}" style="background:rgba(0,0,0,0.5); color:white; border:1px solid rgba(255,255,255,0.2); padding:8px 12px; border-radius:10px; outline:none; font-size: 0.9rem;">
                                <option value="present" style="background: #0a1929;">Presente</option>
                                <option value="late" style="background: #0a1929;">Tarde</option>
                                <option value="absent" style="background: #0a1929;">Ausente</option>
                                <option value="excused" style="background: #0a1929;">Justificado</option>
                            </select>
                            <button onclick="TeacherAcademic.openStudentDetail(${s.id_usuario}, '${s.full_name}')" style="background: rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.4); width: 35px; height: 35px; border-radius: 8px; cursor:pointer;" title="Ver progreso">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
            <div style="margin-top:25px; text-align: right;">
                <button onclick="TeacherAcademic.saveAttendance()" style="background: linear-gradient(135deg, var(--color-acento-azul), #4facfe); color: #0a1929; border:none; padding:14px 35px; border-radius:12px; cursor:pointer; font-weight:700; font-size: 1rem; box-shadow: 0 10px 20px rgba(79, 172, 254, 0.2); transition: all 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 15px 25px rgba(79, 172, 254, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 20px rgba(79, 172, 254, 0.2)'">
                    <i class="fas fa-check-circle" style="margin-right: 8px;"></i> Guardar Asistencia de Hoy
                </button>
            </div>
        `;
        container.innerHTML = html;
    },

    async saveAttendance() {
        const date = document.getElementById('att-date').value;
        const records = Array.from(document.querySelectorAll('.att-status')).map(sel => ({
            student_id: sel.dataset.uid,
            status: sel.value
        }));

        const res = await ApiService.teacherSaveAttendance({
            schedule_id: this.selectedSchedule.id_schedule || this.selectedSchedule.id,
            date: date,
            students: records
        });

        if (res.success) {
            Swal.fire({ title: '¡Guardado!', text: 'Asistencia registrada con éxito', icon: 'success', background: '#1a1a2e', color: '#fff' });
        } else {
            Swal.fire({ title: 'Error', text: res.message, icon: 'error', background: '#1a1a2e', color: '#fff' });
        }
    },

    async loadAssignmentsTab() {
        if (!this.selectedCourse) return;
        const container = document.getElementById('assignments-list');
        const cid = this.selectedCourse.id_course || this.selectedCourse.id;
        const res = await ApiService.teacherGetAssignments(cid);
        if (res.success && res.data) {
            container.innerHTML = res.data.map(a => `
                <div style="background:rgba(255,255,255,0.03); padding:20px; border-radius:16px; margin-bottom:15px; border-left:5px solid var(--color-acento-naranja); border: 1px solid rgba(255,255,255,0.05); position: relative; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                    <div style="font-weight:700; font-size:1.2rem; color:white; margin-bottom: 8px;">${a.title}</div>
                    <div style="color:rgba(255,255,255,0.6); font-size:0.95rem; line-height: 1.5;">${a.description || 'Sin descripción detallada.'}</div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top:15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05);">
                        <i class="far fa-calendar-alt" style="color: var(--color-acento-azul);"></i>
                        <span style="font-size:0.85rem; color:rgba(255,255,255,0.4);">Fecha Límite:</span>
                        <span style="font-size:0.85rem; color:var(--color-acento-azul); font-weight: 600;">${a.due_date || 'Abierta'}</span>
                    </div>
                </div>
            `).join('') || '<div style="text-align:center; padding:40px; color:rgba(255,255,255,0.2);"><i class="fas fa-tasks" style="font-size: 2.5rem; margin-bottom: 20px; display: block;"></i> No hay tareas para este curso.</div>';
        }
    },

    showCreateAssignmentForm() {
        Swal.fire({
            title: 'Nueva Tarea Académica',
            html: `
                <div style="text-align: left;">
                    <label style="color: #aaa; font-size: 0.8rem; display: block; margin-bottom: 5px;">Título de la Tarea</label>
                    <input id="ta-title" class="swal2-input" placeholder="Ej: Proyecto Final Armonía" style="margin: 0 0 15px 0; width: 100%;">
                    <label style="color: #aaa; font-size: 0.8rem; display: block; margin-bottom: 5px;">Instrucciones</label>
                    <textarea id="ta-desc" class="swal2-textarea" placeholder="Describe los requisitos..." style="margin: 0 0 15px 0; width: 100%; height: 100px;"></textarea>
                    <label style="color: #aaa; font-size: 0.8rem; display: block; margin-bottom: 5px;">Fecha de Entrega</label>
                    <input id="ta-date" type="date" class="swal2-input" style="margin: 0; width: 100%;">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Crear Tarea',
            cancelButtonText: 'Cancelar',
            background: '#1a1a2e',
            color: '#fff',
            confirmButtonColor: '#ff9f43',
            preConfirm: () => ({
                title: document.getElementById('ta-title').value,
                description: document.getElementById('ta-desc').value,
                due_date: document.getElementById('ta-date').value,
                course_id: this.selectedCourse.id_course || this.selectedCourse.id,
                teacher_id: this.session.id_usuario
            })
        }).then(async (result) => {
            if (result.isConfirmed) {
                const res = await ApiService.teacherCreateAssignment(result.value);
                if (res.success) {
                    Swal.fire({ title: '¡Creada!', text: 'La tarea ha sido publicada', icon: 'success', background: '#1a1a2e', color: '#fff' });
                    this.loadAssignmentsTab();
                } else {
                    Swal.fire({ title: 'Error', text: res.message, icon: 'error', background: '#1a1a2e', color: '#fff' });
                }
            }
        });
    },

    async loadNotesTab() {
        if (!this.selectedSchedule) return;
        const container = document.getElementById('notes-content');
        container.innerHTML = '<div style="text-align:center; padding:40px;"><div class="loading-spinner"></div><p style="color:rgba(255,255,255,0.5);margin-top:15px;">Cargando cuadro de notas...</p></div>';

        const cid = this.selectedCourse.id_course || this.selectedCourse.id;
        const sid = this.selectedSchedule.id_schedule || this.selectedSchedule.id;

        const res = await ApiService.getAcademicData('get_schedule_students', { schedule_id: sid });
        const notesRes = await ApiService.teacherGetNotes(cid, sid);

        if (res.success && res.data) {
            let html = `
                <div style="margin-bottom:25px; display:flex; justify-content: space-between; align-items: center;">
                    <h4 style="color: white; margin: 0; font-weight: 500;">Calificaciones del Grupo</h4>
                    <button onclick="TeacherAcademic.showAddNoteForm()" style="background:rgba(255, 159, 67, 0.15); color: #ff9f43; border: 1px solid rgba(255, 159, 67, 0.3); padding:10px 22px; border-radius:10px; cursor:pointer; font-weight:700; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(255, 159, 67, 0.25)'" onmouseout="this.style.background='rgba(255, 159, 67, 0.15)'">
                        <i class="fas fa-plus"></i> Calificar Estudiante
                    </button>
                </div>
                <div style="background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden;">
                    <table class="teacher-table">
                        <thead>
                            <tr>
                                <th style="width: 50%;">Nombre Completo</th>
                                <th style="text-align:center; width: 25%;">Promedio</th>
                                <th style="text-align:center; width: 25%;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            res.data.forEach(s => {
                const sNotes = notesRes.success ? notesRes.data.filter(n => n.student_id == s.id_usuario) : [];
                const avg = sNotes.length > 0 ? (sNotes.reduce((acc, n) => acc + parseFloat(n.score), 0) / sNotes.length).toFixed(1) : '-';

                html += `
                    <tr>
                        <td style="font-weight: 500;">${s.full_name}</td>
                        <td style="text-align:center;">
                            <span style="background: ${avg !== '-' ? 'linear-gradient(135deg, #a8cfee, var(--color-acento-azul))' : 'rgba(255,255,255,0.05)'}; padding: 6px 15px; border-radius: 12px; font-weight:800; color: ${avg !== '-' ? '#0a1929' : 'rgba(255,255,255,0.3)'}; font-size: 1.1rem;">
                                ${avg}
                            </span>
                        </td>
                        <td style="text-align:center;">
                            <button onclick="TeacherAcademic.openStudentDetail(${s.id_usuario}, '${s.full_name}')" style="background: rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; width: 40px; height: 40px; border-radius: 12px; cursor:pointer; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='var(--color-acento-azul)'; this.style.color='var(--color-acento-azul)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.1)'; this.style.color='white'">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table></div>';
            container.innerHTML = html;
        }
    },

    showAddNoteForm() {
        ApiService.getAcademicData('get_schedule_students', { schedule_id: this.selectedSchedule.id_schedule || this.selectedSchedule.id }).then(res => {
            if (!res.success) return;
            Swal.fire({
                title: 'Nueva Calificación',
                html: `
                    <div style="text-align: left;">
                        <label style="color: #aaa; font-size: 0.8rem; display: block; margin-bottom: 5px;">Seleccionar Estudiante</label>
                        <select id="n-st" class="swal2-select" style="width: 100%; margin: 0 0 15px 0;">
                            ${res.data.map(s => `<option value="${s.id_usuario}">${s.full_name}</option>`).join('')}
                        </select>
                        <label style="color: #aaa; font-size: 0.8rem; display: block; margin-bottom: 5px;">Calificación (0-10)</label>
                        <input id="n-sc" type="number" step="0.1" class="swal2-input" placeholder="Ej: 9.5" style="width: 100%; margin: 0 0 15px 0;">
                        <label style="color: #aaa; font-size: 0.8rem; display: block; margin-bottom: 5px;">Tipo de Evaluación</label>
                        <input id="n-tp" class="swal2-input" placeholder="Ej: Examen Final" style="width: 100%; margin: 0;">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Guardar Nota',
                cancelButtonText: 'Cancelar',
                background: '#1a1a2e',
                color: '#fff',
                confirmButtonColor: '#3498db',
                preConfirm: () => ({
                    student_id: document.getElementById('n-st').value,
                    score: document.getElementById('n-sc').value,
                    note_type: document.getElementById('n-tp').value,
                    course_id: this.selectedCourse.id_course || this.selectedCourse.id,
                    schedule_id: this.selectedSchedule.id_schedule || this.selectedSchedule.id
                })
            }).then(async r => {
                if (r.isConfirmed) {
                    const resp = await ApiService.teacherAddNote(r.value);
                    if (resp.success) {
                        Swal.fire({ title: '¡Guardado!', text: 'Calificación registrada', icon: 'success', background: '#1a1a2e', color: '#fff' });
                        this.loadNotesTab();
                    }
                }
            });
        });
    },

    async openStudentDetail(uid, name) {
        if (window.openProfile) {
            // Close the teacher modal first to avoid overlay issues or keep it?
            // Usually, these models are stacked. Let's just open it.
            window.openProfile(uid, 'academic');
        } else {
            this.viewStudentNotesLegacy(uid, name);
        }
    },

    async viewStudentNotesLegacy(uid, name) {
        const cid = this.selectedCourse.id_course || this.selectedCourse.id;
        const sid = this.selectedSchedule.id_schedule || this.selectedSchedule.id;
        const res = await ApiService.teacherGetNotes(cid, sid);
        if (res.success) {
            const sNotes = res.data.filter(n => n.student_id == uid);
            Swal.fire({
                title: `Notas de ${name}`,
                background: '#1a1a2e',
                color: '#fff',
                html: `
                    <div style="text-align: left; max-height: 400px; overflow-y: auto;">
                        ${sNotes.map(n => `
                            <div style="display:flex; justify-content:space-between; align-items: center; margin-bottom:10px; background: rgba(255,255,255,0.03); padding:12px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                                <div style="display: flex; flex-direction: column;">
                                    <span style="font-weight: 700; color: white;">${n.note_type}</span>
                                    <span style="font-size: 0.75rem; color: rgba(255,255,255,0.3);">${new Date(n.created_at).toLocaleDateString()}</span>
                                </div>
                                <strong style="color:var(--color-acento-azul); font-size: 1.4rem; font-weight: 800;">${n.score}</strong>
                            </div>
                        `).join('') || '<p style="text-align:center; padding:20px; color:rgba(255,255,255,0.2);">Sin notas registradas</p>'}
                    </div>
                `,
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#555'
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    TeacherAcademic.init();
    document.addEventListener('dashboard-role-loaded', (e) => {
        if (e.detail && e.detail.role == 2) TeacherAcademic.init();
    });
});
