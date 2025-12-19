document.addEventListener('DOMContentLoaded', () => {
    // 0. Security Check
    if (!window.ApiService || !window.ApiService.isAuthenticated()) return;
    const user = window.ApiService.getSession();
    if (user.id_rol != 1) return;

    loadTeachers();
    loadCourses();

    // 1. Create Course Handler
    document.getElementById('createCourseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            const res = await fetch('http://127.0.0.1:8080/jacquin_api/public/create_course.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if(result.success) {
                alert('Curso creado correctamente');
                e.target.reset();
                loadCourses();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error al crear curso');
        }
    });

    // 2. Assign Schedule Handler
    document.getElementById('assignScheduleForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch('http://127.0.0.1:8080/jacquin_api/public/assign_schedule.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if(result.success) {
                alert('Horario asignado correctamente');
                e.target.reset();
                loadCourses();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error al asignar horario');
        }
    });
});

async function loadTeachers() {
    try {
        // Use ApiService instead of direct fetch
        const res = await ApiService.getUsers();
        
        if(res.success && res.data) {
            const select = document.getElementById('teacherSelect');
            const teachers = res.data.filter(u => u.id_rol == 2);
            
            select.innerHTML = '<option value="">Selecciona Profesor</option>' + 
                teachers.map(t => `<option value="${t.id_usuario}">${t.full_name}</option>`).join('');
            
            // Auto-select from URL if present
            const params = new URLSearchParams(window.location.search);
            const preTeacher = params.get('teacher_id');
            if(preTeacher && document.querySelector(`#teacherSelect option[value="${preTeacher}"]`)) {
                select.value = preTeacher;
                // Scroll creating course into view
                 document.getElementById('createCourseForm').scrollIntoView({behavior: 'smooth'});
            }

            if(teachers.length === 0) {
                 // Fallback
                 res.data.forEach(u => {
                    select.innerHTML += `<option value="${u.id_usuario}">[Rol ${u.id_rol}] ${u.full_name}</option>`;
                 });
            }
        }
    } catch (e) {
        console.error('Error loading teachers', e);
    }
}

async function loadCourses() {
    try {
        const res = await ApiService.getCourses();
        const list = document.getElementById('courseList');
        const select = document.getElementById('courseSelect');

        if(res.success && res.data) {
            const courses = res.data;
            
            // Update Select
            select.innerHTML = '<option value="">Selecciona Curso</option>' + 
                courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

            // Update List
            list.innerHTML = courses.map(c => `
                <div class="course-item">
                    <div style="display:flex; justify-content:space-between;">
                        <strong style="color:var(--color-acento-naranja); font-size:1.1rem;">${c.name}</strong>
                        <span style="color:white; opacity:0.7; font-size:0.9rem;">Prof: ${c.teacher_name || 'Sin asignar'}</span>
                    </div>
                    <p style="color:var(--color-humo-gris); font-size:0.9rem; margin:5px 0;">${c.description || ''}</p>
                    
                    <div style="margin-top:10px;">
                        ${c.schedules && c.schedules.length > 0 
                            ? c.schedules.map(s => 
                                `<span class="schedule-badge">
                                    <i class="bi bi-clock"></i> ${s.day_of_week}: ${formatTime(s.start_time)} - ${formatTime(s.end_time)}
                                 </span>`
                              ).join(' ')
                            : '<span style="color:gray; font-size:0.8rem;">Sin horarios asignados</span>'
                        }
                    </div>
                </div>
            `).join('');
        } else {
             // Handle empty or error
             list.innerHTML = '<div style="color:white; padding:1rem;">No hay cursos creados.</div>';
             select.innerHTML = '<option value="">No hay cursos disponibles</option>';
        }
    } catch (e) {
        console.error(e);
        document.getElementById('courseList').innerHTML = 'Error de conexión.';
    }
}

function formatTime(timeString) {
    if(!timeString) return '';
    // timeString is HH:MM:SS
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
}
