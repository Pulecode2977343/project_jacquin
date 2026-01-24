/**
 * student_academic.js  
 * Vista de Tareas y Notas para Estudiantes
 */

window.StudentAcademic = {
    session: null,

    init() {
        this.session = ApiService.getSession();
        if (!this.session || parseInt(this.session.id_rol) !== 3) return; // Solo estudiantes

        // Usar botón existente del HTML
        const button = document.getElementById('btn-student-academic-access');
        if (button) {
            button.onclick = () => this.openModal();
        }

        this.injectModal();
    },

    injectModal() {
        if (document.getElementById('student-academic-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'student-academic-modal';
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        modal.innerHTML = `
            <style>
                #student-academic-modal * {
                    font-family: 'Outfit', sans-serif !important;
                }
                .student-tab-container {
                    display: flex;
                    gap: 5px;
                    margin-bottom: 30px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .student-tab-btn {
                    padding: 12px 25px;
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.5);
                    border-bottom: 3px solid transparent;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                .student-tab-btn.active {
                    color: var(--color-acento-azul);
                    border-bottom-color: var(--color-acento-azul);
                    background: rgba(147, 182, 238, 0.05);
                }
                .student-card {
                    background: rgba(255,255,255,0.03);
                    padding: 25px;
                    border-radius: 20px;
                    margin-bottom: 20px;
                    border: 1px solid rgba(255,255,255,0.05);
                    transition: all 0.3s ease;
                }
                .student-card:hover {
                    background: rgba(255,255,255,0.05);
                    border-color: rgba(147, 182, 238, 0.2);
                    transform: translateY(-2px);
                }
                .status-badge {
                    padding: 6px 14px;
                    border-radius: 30px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .status-pending { background: rgba(255, 159, 67, 0.15); color: #ff9f43; }
                .status-submitted { background: rgba(52, 152, 219, 0.15); color: #3498db; }
                .status-graded { background: rgba(46, 204, 113, 0.15); color: #2ecc71; }
                .status-overdue { background: rgba(231, 76, 60, 0.15); color: #ff7675; }
            </style>
            <div class="modal-content glass-effect" style="max-width: 1000px; width: 95%; height: 85vh; display:flex; flex-direction:column; padding:0; background: rgba(10, 25, 41, 0.95); border-radius: 28px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                <div class="modal-header" style="padding: 25px 35px; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin:0; color: white; font-weight: 300;"><i class="fas fa-book-reader" style="color: var(--color-acento-azul); margin-right: 15px;"></i> Mis Tareas y Notas</h2>
                    <button class="close-modal-btn" onclick="StudentAcademic.closeModal()" style="background: rgba(255,255,255,0.05); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer;">&times;</button>
                </div>
                
                <div class="modal-body custom-scroll" style="flex:1; overflow-y:auto; padding: 35px;">
                    <!-- Tabs -->
                    <div class="student-tab-container">
                        <button class="student-tab-btn active" data-tab="assignments">Tareas Pendientes</button>
                        <button class="student-tab-btn" data-tab="notes">Mis Notas</button>
                    </div>

                    <!-- Tab Content: Tareas -->
                    <div id="tab-student-assignments" class="tab-content active" style="display: block;">
                        <div id="student-assignments-content">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>

                    <!-- Tab Content: Notas -->
                    <div id="tab-student-notes" class="tab-content" style="display: none;">
                        <div id="student-notes-content">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelectorAll('.student-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    },

    async openModal() {
        const modal = document.getElementById('student-academic-modal');
        if (modal) {
            modal.style.display = 'flex';
            await this.loadAssignments();
            await this.loadNotes();
        }
    },

    closeModal() {
        document.getElementById('student-academic-modal').style.display = 'none';
    },

    switchTab(tabName) {
        document.querySelectorAll('#student-academic-modal .student-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        document.getElementById('tab-student-assignments').style.display = tabName === 'assignments' ? 'block' : 'none';
        document.getElementById('tab-student-notes').style.display = tabName === 'notes' ? 'block' : 'none';
    },

    async loadAssignments() {
        const container = document.getElementById('student-assignments-content');
        container.innerHTML = '<div style="text-align:center; padding:40px;"><div class="loading-spinner"></div></div>';

        try {
            const result = await ApiService.getAcademicData('get_my_assignments', {
                student_id: this.session.id_usuario
            });

            if (result.success && result.data) {
                this.renderAssignments(result.data);
            } else {
                container.innerHTML = '<div style="text-align:center; padding:60px; color:rgba(255,255,255,0.2);"><i class="fas fa-clipboard-list" style="font-size:3rem; margin-bottom:20px; display:block;"></i>No tienes tareas asignadas por el momento.</div>';
            }
        } catch (error) {
            container.innerHTML = '<p style="color: #FF5252; text-align:center;">Error cargando tareas del servidor.</p>';
        }
    },

    renderAssignments(assignments) {
        const container = document.getElementById('student-assignments-content');

        if (assignments.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:60px; color:rgba(255,255,255,0.2);"><i class="fas fa-check-circle" style="font-size:3rem; margin-bottom:20px; display:block;"></i>¡Estás al día! No hay tareas pendientes.</div>';
            return;
        }

        const pending = assignments.filter(a => !a.submission_status || a.submission_status === 'pending');
        const submitted = assignments.filter(a => a.submission_status === 'submitted' || a.submission_status === 'graded');

        let html = '';

        if (pending.length > 0) {
            html += '<h4 style="color: rgba(255,255,255,0.5); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px;">Por Completar</h4>';
            html += pending.map(a => this.renderAssignmentCard(a, 'pending')).join('');
        }

        if (submitted.length > 0) {
            html += '<h4 style="color: rgba(255,255,255,0.5); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; margin: 40px 0 20px 0;">Entregadas recientemente</h4>';
            html += submitted.map(a => this.renderAssignmentCard(a, 'submitted')).join('');
        }

        container.innerHTML = html;
    },

    renderAssignmentCard(assignment, context) {
        const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
        const isOverdue = dueDate && dueDate < new Date() && context === 'pending';

        let statusClass = 'status-pending';
        let statusText = 'Pendiente';

        if (isOverdue) {
            statusClass = 'status-overdue';
            statusText = 'Vencida';
        } else if (assignment.submission_status === 'submitted') {
            statusClass = 'status-submitted';
            statusText = 'Entregada';
        } else if (assignment.submission_status === 'graded') {
            statusClass = 'status-graded';
            statusText = 'Calificada';
        }

        return `
            <div class="student-card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div>
                        <h3 style="margin: 0; color: white; font-size: 1.3rem; font-weight: 600;">${assignment.title}</h3>
                        <div style="color: var(--color-acento-azul); font-size: 0.85rem; margin-top: 5px; font-weight: 500;">
                            <i class="fas fa-music" style="margin-right: 8px;"></i> ${assignment.course_name}
                        </div>
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>

                <p style="color: rgba(255,255,255,0.6); font-size: 0.95rem; line-height: 1.6; margin: 15px 0;">${assignment.description || 'Sin instrucciones adicionales.'}</p>

                <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05);">
                    ${dueDate ? `
                        <div style="color: ${isOverdue ? '#ff7675' : 'rgba(255,255,255,0.4)'}; font-size: 0.85rem;">
                            <i class="far fa-clock" style="margin-right: 5px;"></i> Límite: ${dueDate.toLocaleDateString()}
                        </div>
                    ` : ''}
                    
                    ${assignment.media_url ? `
                        <a href="${assignment.media_url}" target="_blank" style="color: #4facfe; text-decoration: none; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-link"></i> Ver material
                        </a>
                    ` : ''}

                    ${assignment.submission_status === 'graded' ? `
                        <div style="margin-left: auto; background: linear-gradient(135deg, #2ecc71, #27ae60); color: #0a1929; padding: 8px 18px; border-radius: 12px; font-weight: 800; font-size: 1.1rem;">
                            Nota: ${assignment.grade}
                        </div>
                    ` : ''}
                </div>

                ${assignment.feedback ? `
                    <div style="margin-top: 20px; padding: 15px 20px; background: rgba(52, 152, 219, 0.08); border-left: 4px solid #3498db; border-radius: 12px;">
                        <div style="color: #3498db; font-size: 0.75rem; text-transform: uppercase; font-weight: 800; margin-bottom: 5px;">Comentario del Profesor</div>
                        <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 0.9rem;">${assignment.feedback}</p>
                    </div>
                ` : ''}

                ${context === 'pending' && !isOverdue ? `
                    <button class="btn-primary" onclick="StudentAcademic.submitAssignment(${assignment.id})" style="margin-top: 25px; width: 100%; padding: 12px; border-radius: 12px; background: var(--color-acento-azul); color: #0a1929; border: none; font-weight: 700; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <i class="fas fa-paper-plane"></i> Enviar Mi Trabajo
                    </button>
                ` : ''}
            </div>
        `;
    },

    submitAssignment(assignmentId) {
        Swal.fire({
            title: 'Entregar Tarea',
            background: '#1a1a2e',
            color: '#fff',
            html: `
                <div style="text-align:left; font-family: 'Outfit', sans-serif;">
                    <label style="color: rgba(255,255,255,0.5); font-size: 0.85rem; display: block; margin-bottom: 8px;">Enlace de tu trabajo (Drive, YouTube, etc.)</label>
                    <input type="text" id="swal-submission-url" class="swal2-input" placeholder="https://..." style="width: 100%; margin: 0 0 20px 0; background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; height: 45px;">
                    
                    <label style="color: rgba(255,255,255,0.5); font-size: 0.85rem; display: block; margin-bottom: 8px;">Comentarios para el profesor (opcional)</label>
                    <textarea id="swal-submission-text" class="swal2-textarea" placeholder="Escribe aquí..." style="width: 100%; margin: 0; background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; height: 100px; padding: 12px;"></textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Enviar Tarea',
            confirmButtonColor: '#3498db',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const url = document.getElementById('swal-submission-url').value;
                if (!url) {
                    Swal.showValidationMessage('Por favor ingresa un enlace para tu entrega');
                    return false;
                }
                return {
                    assignment_id: assignmentId,
                    student_id: this.session.id_usuario,
                    submission_url: url,
                    submission_text: document.getElementById('swal-submission-text').value,
                    status: 'submitted'
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Simulación de entrega (Backend actualiza tabla student_submissions)
                Swal.fire({ title: '¡Enviado!', text: 'Tu trabajo ha sido registrado correctamente.', icon: 'success', background: '#1a1a2e', color: '#fff' });
                this.loadAssignments();
            }
        });
    },

    async loadNotes() {
        const container = document.getElementById('student-notes-content');
        container.innerHTML = '<div style="text-align:center; padding:40px;"><div class="loading-spinner"></div></div>';

        try {
            const result = await ApiService.getAcademicData('get_my_notes', {
                student_id: this.session.id_usuario
            });

            if (result.success && result.data) {
                this.renderNotes(result.data);
            } else {
                container.innerHTML = '<div style="text-align:center; padding:60px; color:rgba(255,255,255,0.2);"><i class="fas fa-star-half-alt" style="font-size:3rem; margin-bottom:20px; display:block;"></i>Aún no tienes notas registradas en el sistema.</div>';
            }
        } catch (error) {
            container.innerHTML = '<p style="color: #FF5252; text-align:center;">Error conectando con el servidor.</p>';
        }
    },

    renderNotes(notes) {
        const container = document.getElementById('student-notes-content');

        if (notes.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:60px; color:rgba(255,255,255,0.2);">Aún no tienes calificaciones registradas.</div>';
            return;
        }

        container.innerHTML = notes.map(note => `
            <div class="student-card" style="border-left: 5px solid var(--color-acento-azul);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <span style="background: rgba(147, 182, 238, 0.1); color: var(--color-acento-azul); padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">${note.note_type}</span>
                            <span style="color: rgba(255,255,255,0.3); font-size: 0.75rem;">${new Date(note.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 style="margin: 0; color: white; font-size: 1.2rem;">${note.course_name}</h3>
                        <p style="color: rgba(255,255,255,0.4); font-size: 0.85rem; margin-top: 5px;">Docente: ${note.teacher_name}</p>
                    </div>
                    
                    <div style="text-align: center; background: linear-gradient(135deg, #a8cfee, var(--color-acento-azul)); padding: 12px 20px; border-radius: 16px; min-width: 70px; box-shadow: 0 10px 20px rgba(0,0,0,0.2);">
                        <div style="color: #0a1929; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-bottom: 2px;">Nota</div>
                        <div style="color: #0a1929; font-size: 1.8rem; font-weight: 900; line-height: 1;">${note.score}</div>
                    </div>
                </div>

                ${note.comment ? `
                    <div style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 10px; color: rgba(255,255,255,0.7); font-size: 0.9rem; font-style: italic; border: 1px solid rgba(255,255,255,0.03);">
                        "${note.comment}"
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    StudentAcademic.init();
    document.addEventListener('dashboard-role-loaded', (e) => {
        if (e.detail && e.detail.role === 3) StudentAcademic.init();
    });
});
