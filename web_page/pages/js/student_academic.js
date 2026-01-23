/**
 * student_academic.js  
 * Vista de Tareas y Notas para Estudiantes
 */

window.StudentAcademic = {
    session: null,

    init() {
        this.session = ApiService.getSession();
        if (!this.session || this.session.id_rol != 3) return; // Solo estudiantes

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
            <div class="modal-content glass-effect" style="max-width: 1000px; width: 95%; height: 85vh; display:flex; flex-direction:column; padding:0;">
                <div class="modal-header">
                    <h2 style="margin:0;"><i class="fas fa-book-reader"></i> Mis Tareas y Notas</h2>
                    <button class="close-modal-btn" onclick="StudentAcademic.closeModal()"><i class="fas fa-times"></i></button>
                </div>
                
                <div class="modal-body" style="flex:1; overflow-y:auto; padding: 20px;">
                    <!-- Tabs -->
                    <div class="tab-container">
                        <button class="tab-btn active" data-tab="assignments">Tareas Pendientes</button>
                        <button class="tab-btn" data-tab="notes">Mis Notas</button>
                    </div>

                    <!-- Tab Content: Tareas -->
                    <div id="tab-student-assignments" class="tab-content active">
                        <div id="student-assignments-content">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>

                    <!-- Tab Content: Notas -->
                    <div id="tab-student-notes" class="tab-content">
                        <div id="student-notes-content">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Event listeners para tabs
        modal.querySelectorAll('.tab-btn').forEach(btn => {
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
        document.querySelectorAll('#student-academic-modal .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        document.querySelectorAll('#student-academic-modal .tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-student-${tabName}`);
        });
    },

    async loadAssignments() {
        const container = document.getElementById('student-assignments-content');
        container.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const result = await ApiService.getAcademicData('get_my_assignments', {
                student_id: this.session.id_usuario
            });

            if (result.success && result.data) {
                this.renderAssignments(result.data);
            } else {
                container.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align:center; padding:40px;">No tienes tareas asignadas.</p>';
            }
        } catch (error) {
            container.innerHTML = '<p style="color: #FF5252;">Error cargando tareas.</p>';
        }
    },

    renderAssignments(assignments) {
        const container = document.getElementById('student-assignments-content');

        if (assignments.length === 0) {
            container.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align:center; padding:40px;">No tienes tareas asignadas.</p>';
            return;
        }

        // Separar por estado
        const pending = assignments.filter(a => !a.submission_status || a.submission_status === 'pending');
        const submitted = assignments.filter(a => a.submission_status === 'submitted' || a.submission_status === 'graded');

        let html = '';

        if (pending.length > 0) {
            html += '<h3 style="color: var(--color-acento-naranja); margin-bottom: 15px;">Pendientes</h3>';
            html += pending.map(a => this.renderAssignmentCard(a, 'pending')).join('');
        }

        if (submitted.length > 0) {
            html += '<h3 style="color: var(--color-acento-azul); margin-top: 30px; margin-bottom: 15px;">Entregadas</h3>';
            html += submitted.map(a => this.renderAssignmentCard(a, 'submitted')).join('');
        }

        container.innerHTML = html;
    },

    renderAssignmentCard(assignment, status) {
        const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
        const isOverdue = dueDate && dueDate < new Date() && status === 'pending';

        const statusColor = {
            'pending': isOverdue ? '#FF5252' : 'var(--color-acento-naranja)',
            'submitted': 'var(--color-acento-azul)',
            'graded': '#4CAF50'
        }[assignment.submission_status || 'pending'];

        return `
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid ${statusColor};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: white;">${assignment.title}</h4>
                        <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem; margin: 5px 0;">
                            <i class="fas fa-book"></i> ${assignment.course_name}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        ${assignment.submission_status === 'graded' && assignment.grade ?
                `<div style="background: #4CAF50; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold;">
                                Nota: ${assignment.grade}
                            </div>` :
                `<div class="badge ${isOverdue ? 'inactive' : 'active'}">
                                ${isOverdue ? 'Vencida' : (assignment.submission_status === 'submitted' ? 'Entregada' : 'Pendiente')}
                            </div>`
            }
                    </div>
                </div>

                <p style="color: rgba(255,255,255,0.7); margin: 10px 0;">${assignment.description || 'Sin descripción'}</p>

                ${dueDate ? `
                    <div style="color: ${isOverdue ? '#FF5252' : 'rgba(255,255,255,0.5)'}; font-size: 0.85rem; margin: 10px 0;">
                        <i class="fas fa-clock"></i> Vence: ${dueDate.toLocaleDateString()} ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                ` : ''}

                ${assignment.media_url ? `
                    <div style="margin-top: 10px;">
                        <a href="${assignment.media_url}" target="_blank" style="color: var(--color-acento-azul); text-decoration: underline;">
                            <i class="fas fa-paperclip"></i> Ver material adjunto
                        </a>
                    </div>
                ` : ''}

                ${assignment.feedback ? `
                    <div style="margin-top: 15px; padding: 10px; background: rgba(147, 182, 238, 0.1); border-left: 3px solid var(--color-acento-azul); border-radius: 5px;">
                        <strong style="color: var(--color-acento-azul);">Retroalimentación del docente:</strong>
                        <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8);">${assignment.feedback}</p>
                    </div>
                ` : ''}

                ${status === 'pending' && !isOverdue ? `
                    <button class="btn-primary" onclick="StudentAcademic.submitAssignment(${assignment.id})" style="margin-top: 15px;">
                        <i class="fas fa-upload"></i> Entregar Tarea
                    </button>
                ` : ''}
            </div>
        `;
    },

    submitAssignment(assignmentId) {
        Swal.fire({
            title: 'Entregar Tarea',
            html: `
                <div style="text-align:left;">
                    <label>URL de tu trabajo (Google Drive, GitHub, etc.)</label>
                    <input type="text" id="swal-submission-url" class="swal2-input" placeholder="https://...">
                    
                    <label>Comentarios (opcional)</label>
                    <textarea id="swal-submission-text" class="swal2-textarea" placeholder="Agrega cualquier nota para el profesor..."></textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Entregar',
            preConfirm: () => {
                const url = document.getElementById('swal-submission-url').value;
                if (!url) {
                    Swal.showValidationMessage('Debes proporcionar una URL');
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
                // Aquí debería ir una llamada a la API para guardar la entrega
                // Por ahora simulamos éxito
                Swal.fire('Entregado', 'Tu tarea ha sido enviada correctamente', 'success');
                this.loadAssignments(); // Recargar
            }
        });
    },

    async loadNotes() {
        const container = document.getElementById('student-notes-content');
        container.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const result = await ApiService.getAcademicData('get_my_notes', {
                student_id: this.session.id_usuario
            });

            if (result.success && result.data) {
                this.renderNotes(result.data);
            } else {
                container.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align:center; padding:40px;">No tienes notas registradas.</p>';
            }
        } catch (error) {
            container.innerHTML = '<p style="color: #FF5252;">Error cargando notas.</p>';
        }
    },

    renderNotes(notes) {
        const container = document.getElementById('student-notes-content');

        if (notes.length === 0) {
            container.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align:center; padding:40px;">No tienes notas registradas.</p>';
            return;
        }

        container.innerHTML = notes.map(note => `
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid var(--color-acento-azul);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: white;">
                            <i class="fas fa-book"></i> ${note.course_name}
                        </h4>
                        <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin: 5px 0;">
                            Por ${note.teacher_name} - ${new Date(note.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    ${note.score ? `
                        <div style="background: linear-gradient(135deg, var(--color-acento-azul), var(--color-acento-naranja)); color: white; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 1.1rem;">
                            ${note.score}
                        </div>
                    ` : ''}
                </div>

                <div style="margin-top: 10px; padding: 10px; background: rgba(147, 182, 238, 0.1); border-radius: 5px;">
                    <div style="color: rgba(255,255,255,0.6); font-size: 0.8rem; margin-bottom: 5px; text-transform: uppercase;">
                        ${note.note_type}
                    </div>
                    <p style="margin: 0; color: rgba(255,255,255,0.9);">${note.comment || 'Sin comentarios'}</p>
                </div>
            </div>
        `).join('');
    }
};

// Auto-init: Sistema mejorado sin condiciones de carrera
document.addEventListener('DOMContentLoaded', () => {
    // Intentar inicialización inmediata
    StudentAcademic.init();

    // También escuchar evento personalizado para reintentar cuando el dashboard termine de cargar
    document.addEventListener('dashboard-role-loaded', (e) => {
        if (e.detail && e.detail.role === 3) { // Rol 3 = Estudiante
            console.log('[StudentAcademic] Reintentando inicialización después de dashboard-role-loaded');
            StudentAcademic.init();
        }
    });
});
