// Resuelve paths de imágenes: rutas subidas via API → prefija BASE_URL
function resolveAdminImageUrl(img) {
    if (!img) return 'assets/images/hero/hero-banner.jpg';
    if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('assets/')) return img;
    if (img.startsWith('public/uploads/') || img.startsWith('uploads/')) {
        const base = window.ApiService ? window.ApiService.BASE_URL : '/jacquin_api/';
        return base + img;
    }
    return 'assets/' + img.replace(/^\//, '');
}

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (window.ApiService && !window.ApiService.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    loadPrograms();

    // Form Submit
    document.getElementById('programForm').addEventListener('submit', handleProgramSave);
});

// Original Default Data (Backup)
const DEFAULT_PROGRAMS = {
    'percussion': {
        title: 'Percusi\u00f3n',
        subtitle: 'Ritmo y Energ\u00eda',
        icon: 'bi-music-note-beamed',
        description: 'Siente el ritmo en tu cuerpo. Aprende bater\u00eda, percusi\u00f3n latina y sinf\u00f3nica. Desarrolla tu coordinaci\u00f3n, tempo y musicalidad en un ambiente din\u00e1mico.',
        features: ['Bater\u00eda ac\u00fastica y electr\u00f3nica', 'Percusi\u00f3n latina (Congas, Bongos)', 'Lectura r\u00edtmica avanzada', 'Independencia de extremidades'],
        image: 'images/programs/percussion.png'
    },
    'guitarra': {
        title: 'Guitarra',
        subtitle: 'Ac\u00fastica y El\u00e9ctrica',
        icon: 'bi-guitar',
        description: 'Domina las cuerdas con nuestra metodolog\u00eda integral. Desde acordes b\u00e1sicos hasta solos complejos de rock, jazz y blues. Aprender\u00e1s t\u00e9cnica, lectura musical e improvisaci\u00f3n.',
        features: ['Lectura de partituras y tablaturas', 'T\u00e9cnica de p\u00faa y dedos (Fingerstyle)', 'Improvisaci\u00f3n y teor\u00eda aplicada', 'Ensambles y presentaciones en vivo'],
        image: 'images/programs/guitar.png'
    },
    'piano': {
        title: 'Piano',
        subtitle: 'Cl\u00e1sico y Moderno',
        icon: 'bi-grid-3x3-gap',
        description: 'Descubre el poder del piano. Nuestro programa abarca desde la elegancia de la m\u00fasica cl\u00e1sica hasta la versatilidad del pop y jazz moderno. Desarrolla tu o\u00eddo y t\u00e9cnica.',
        features: ['T\u00e9cnica pian\u00edstica avanzada', 'Repertorio cl\u00e1sico y contempor\u00e1neo', 'Acompa\u00f1amiento y armon\u00eda', 'Lectura a primera vista'],
        image: 'images/programs/piano.png'
    },
    'voz': {
        title: 'Voz',
        subtitle: 'T\u00e9cnica Vocal',
        icon: 'bi-mic',
        description: 'Tu voz es tu instrumento m\u00e1s poderoso. Aprende a controlarla, proyectarla y cuidarla. Trabajamos respiraci\u00f3n, afinaci\u00f3n, rango vocal y expresi\u00f3n esc\u00e9nica.',
        features: ['Respiraci\u00f3n y apoyo diafragm\u00e1tico', 'Vocalizaci\u00f3n y afinaci\u00f3n', 'Interpretaci\u00f3n y estilo', 'Salud vocal y cuidado'],
        image: 'images/programs/voice.png'
    },
    'seniors': {
        title: 'Senior\'s',
        subtitle: 'Adulto Mayor',
        icon: 'bi-person-hearts',
        description: 'Nunca es tarde para aprender m\u00fasica. Un programa dise\u00f1ado especialmente para adultos mayores, enfocado en el disfrute, la memoria y la socializaci\u00f3n a trav\u00e9s del arte.',
        features: ['Repertorio de m\u00fasica de anta\u00f1o', 'Estimulaci\u00f3n cognitiva y memoria', 'Clases grupales e individuales', 'Ambiente relajado y social'],
        image: 'images/programs/seniors.png'
    },
    'shows': {
        title: 'Shows',
        subtitle: 'Presentaciones',
        icon: 'bi-ticket-perforated',
        description: 'La m\u00fasica cobra vida en el escenario. Preparamos a nuestros estudiantes para brillar en conciertos reales, perdiendo el miedo esc\u00e9nico y ganando confianza profesional.',
        features: ['Montaje de repertorio en vivo', 'Expresi\u00f3n corporal y esc\u00e9nica', 'Manejo de equipo de sonido', 'Conciertos semestrales'],
        image: 'images/programs/shows.png'
    },
    'exploration': {
        title: 'ExploraciÃ³n',
        subtitle: 'IniciaciÃ³n Musical',
        icon: 'bi-balloon',
        description: 'El primer paso para los mÃ¡s pequeÃ±os. Un acercamiento lÃºdico a la mÃºsica donde los niÃ±os descubren ritmos, melodÃ­as e instrumentos mientras juegan y se divierten.',
        features: ['RÃ­tmica dalcroze y juegos musicales', 'ExploraciÃ³n de instrumentos Orff', 'Canto y movimiento', 'Desarrollo auditivo temprano'],
        image: 'images/programs/exploration.png'
    },
    'psychomusic': {
        title: 'Psicom\u00fasica',
        subtitle: 'Bienestar y Terapia',
        icon: 'bi-heart-pulse',
        description: 'La m\u00fasica como herramienta de sanaci\u00f3n y crecimiento personal. Sesiones enfocadas en el bienestar emocional, relajaci\u00f3n y desarrollo de habilidades a trav\u00e9s del sonido.',
        features: ['Musicoterapia activa y receptiva', 'Relajaci\u00f3n y mindfulness sonoro', 'Expresi\u00f3n emocional', 'Desarrollo de habilidades sociales'],
        image: 'images/programs/psychomusic.png'
    }
};

let currentPrograms = {};

async function getPrograms() {
    if (window.ApiService) {
        const data = await ApiService.getProgramsJson();
        if (data && Object.keys(data).length > 0) return data;
    }
    // Initialize with default if empty
    return JSON.parse(JSON.stringify(DEFAULT_PROGRAMS));
}

async function loadPrograms() {
    const container = document.getElementById('adminProgramsList');
    container.innerHTML = '<div style="text-align: center; color: gray; grid-column: span 3;">Cargando inventario de programas...</div>';

    // Fetch both JSON programs and Database courses for linking
    const [programsJson, coursesDbRes] = await Promise.all([
        getPrograms(),
        ApiService.getCourses()
    ]);

    currentPrograms = programsJson;
    const dbCourses = coursesDbRes.success ? coursesDbRes.data : [];

    // Auto-init AcademicManager if available
    if (window.AcademicManager && !window.AcademicManager._isInitialized) {
        window.AcademicManager.init();
        window.AcademicManager._isInitialized = true;
    }

    container.innerHTML = '';

    const keys = Object.keys(currentPrograms);
    if (keys.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #666; font-style: italic; padding: 40px; grid-column: 1/-1;">No hay programas creados.</div>';
        return;
    }

    for (const key of keys) {
        const p = currentPrograms[key];
        const linkedCourse = dbCourses.find(c => c.course_name.toLowerCase() === p.title.toLowerCase());

        let statsHtml = '';
        if (linkedCourse) {
            statsHtml = `
                <div style="display:flex; gap:12px; margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.05); font-size:0.75rem; color:rgba(255,255,255,0.4);">
                    <span title="Alumnos activos"><i class="bi bi-people-fill" style="color:#2ecc71;"></i> ${linkedCourse.active_count || 0} Alumnos</span>
                    <span title="Horarios configurados"><i class="bi bi-calendar3" style="color:var(--color-acento-azul);"></i> Gestión Académica</span>
                </div>
            `;
        }

        const card = document.createElement('div');
        card.className = 'admin-program-card';
        card.innerHTML = `
            <div style="height:160px; overflow:hidden; position:relative;">
                <img src="${resolveAdminImageUrl(p.image)}" class="program-thumb" style="width:100%; height:100%; object-fit:cover;" alt="${p.title}">
                <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(to bottom, transparent 50%, rgba(15,23,42,0.8));"></div>
                
                <button onclick="deleteProgram('${key}', ${linkedCourse ? linkedCourse.id_course : 'null'})" style="position:absolute; top:12px; right:12px; background:rgba(231,76,60,0.1); color:#e74c3c; border:1px solid rgba(231,76,60,0.3); border-radius:10px; width:34px; height:34px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s; z-index:2; backdrop-filter:blur(4px);" onmouseover="this.style.background='#e74c3c'; this.style.color='white';" onmouseout="this.style.background='rgba(231,76,60,0.1)'; this.style.color='#e74c3c';" title="Eliminar Programa">
                    <i class="bi bi-trash3"></i>
                </button>
                
                <div style="position:absolute; bottom:12px; left:12px;">
                    ${linkedCourse ?
                '<span style="background:#2ecc71; color:#0f172a; font-size:0.6rem; font-weight:800; padding:2px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:0.5px;">Vinculado</span>' :
                '<span style="background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.5); font-size:0.6rem; font-weight:800; padding:2px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:0.5px; border:1px solid rgba(255,255,255,0.1);">Solo Web</span>'
            }
                </div>
            </div>
            <div class="program-info" style="padding:15px 20px 20px 20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <h3 style="color:white; margin:0; font-size:1.15rem; font-weight:700;">${p.title}</h3>
                    <div style="color:var(--color-acento-azul); font-size:1.1rem;">
                        <i class="bi ${p.icon || 'bi-music-note'}"></i>
                    </div>
                </div>
                <p style="color:rgba(255,255,255,0.4); font-size:0.8rem; margin-bottom:12px; line-height:1.3; height: 1.3rem; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${p.subtitle}</p>
                
                ${statsHtml}

                <div style="margin-top:15px;">
                    <button class="btn-edit" onclick="openProgramHub('${key}', ${linkedCourse ? linkedCourse.id_course : 'null'})" style="width:100%; margin-top:0; background:linear-gradient(135deg, rgba(147,182,238,0.1), rgba(147,182,238,0.2)); border:1px solid rgba(147,182,238,0.3); color:#93b6ee; font-weight:700; display:flex; align-items:center; justify-content:center; gap:10px; padding:10px; border-radius:12px; transition:0.3s; cursor:pointer;" onmouseover="this.style.background='var(--color-acento-azul)'; this.style.color='#0f172a';">
                        <i class="bi bi-gear-wide-connected"></i> Gestionar
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    }
}

// Logic to create a database course if it doesn't exist for a program
window.syncCourseDb = async (key) => {
    const p = currentPrograms[key];
    if (!p) return;

    Swal.fire({
        title: 'Vinculando sistema académico...',
        didOpen: () => Swal.showLoading(),
        background: '#1a1a1a',
        color: '#fff'
    });

    try {
        const res = await ApiService.createCourse({
            course_name: p.title,
            description: p.description,
            price: 0 // Default
        });

        if (res.success) {
            Swal.fire({ icon: 'success', title: 'Vinculación Exitosa', text: 'Ahora puedes gestionar horarios y alumnos para este programa.', timer: 2000, background: '#1a1a1a', color: '#fff' });
            loadPrograms();
        } else {
            Swal.fire('Error', res.message, 'error');
        }
    } catch (e) {
        Swal.fire('Error', 'Error de conexión', 'error');
    }
};

// === CRUD Logic ===

// === New Unified Hub Logic ===

window.openProgramHub = async (key, courseId = null) => {
    const p = currentPrograms[key];
    if (!p) return;

    // Set basics in modal header
    document.getElementById('modalMainTitle').innerText = p.title;
    document.getElementById('modalMainSubtitle').innerText = p.subtitle;
    document.getElementById('modalMainIcon').innerHTML = `<i class="bi ${p.icon || 'bi-music-note'}"></i>`;

    // Fill Web Tab Form
    const form = document.getElementById('programForm');
    document.getElementById('program_id').value = key;
    form.title.value = p.title || '';
    form.subtitle.value = p.subtitle || '';
    form.description.value = p.description || '';
    form.icon.value = p.icon || '';
    form.features.value = p.features ? p.features.join(', ') : '';

    // Sync Icon Preview
    document.getElementById('iconPreview').innerHTML = `<i class="bi ${p.icon || 'bi-music-note'}"></i>`;

    // Image Handle
    document.getElementById('imageBase64').value = p.image || '';
    if (p.image) {
        document.getElementById('imagePreview').src = resolveAdminImageUrl(p.image);
        document.getElementById('imagePreviewContainer').style.display = 'block';
        document.getElementById('imagePlaceholder').style.display = 'none';
    } else {
        document.getElementById('imagePreviewContainer').style.display = 'none';
        document.getElementById('imagePlaceholder').style.display = 'block';
    }
    document.getElementById('imageInput').value = '';

    // Switch to first tab
    switchProgramTab('tab-web');

    // Handle Academic Tabs availability
    const btnSched = document.getElementById('btn-tab-schedules');
    const btnStud = document.getElementById('btn-tab-students');

    if (courseId) {
        btnSched.style.display = 'flex';
        btnStud.style.display = 'flex';
        btnSched.onclick = () => { switchProgramTab('tab-schedules'); loadAcademicTab(courseId, p.title); };
        btnStud.onclick = () => { switchProgramTab('tab-students'); loadAcademicTab(courseId, p.title); };

        // Pre-load data in background
        loadAcademicTab(courseId, p.title, false);
    } else {
        btnSched.style.display = 'none';
        btnStud.style.display = 'none';
    }

    showModal();
};

window.switchProgramTab = (tabId) => {
    // Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.color = 'rgba(255,255,255,0.4)';
        btn.style.borderBottomColor = 'transparent';
    });
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.color = 'var(--color-acento-azul)';
        activeBtn.style.borderBottomColor = 'var(--color-acento-azul)';
    }

    // Content
    document.querySelectorAll('.program-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';
};

async function loadAcademicTab(courseId, courseName, switchToLoading = true) {
    const schedulesContainer = document.getElementById('academicSchedulesContent');
    const studentsContainer = document.getElementById('academicStudentsContent');

    if (switchToLoading) {
        const loading = `<div style="text-align:center; padding:100px; color:rgba(255,255,255,0.3);"><i class="bi bi-hourglass-split" style="font-size:3rem; display:block; margin-bottom:15px; animation: pulse 1.5s infinite;"></i>Cargando datos académicos...</div>`;
        schedulesContainer.innerHTML = loading;
        studentsContainer.innerHTML = loading;
    }

    try {
        const res = await ApiService.getFullCourseDetails(courseId);
        if (!res.success) {
            schedulesContainer.innerHTML = `<div style="color:#e74c3c; padding:40px; text-align:center;">${res.message}</div>`;
            return;
        }

        const { schedules, students, pending, info } = res.data;

        // 1. Render Schedules Tab
        renderSchedulesInHub(schedules, courseId, courseName, schedulesContainer);

        // 2. Render Students Tab
        renderStudentsInHub(students, pending, courseId, courseName, studentsContainer);

    } catch (e) {
        console.error(e);
        schedulesContainer.innerHTML = `<div style="color:#e74c3c; padding:40px; text-align:center;">Error de conexión.</div>`;
    }
}

function renderSchedulesInHub(schedules, courseId, courseName, container) {
    if (!schedules || schedules.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:60px; background:rgba(0,0,0,0.2); border-radius:20px; border:2px dashed rgba(255,255,255,0.05);">
                <i class="bi bi-calendar-x" style="font-size:3rem; display:block; margin-bottom:15px; color:rgba(255,255,255,0.1);"></i>
                <p style="color:white; font-weight:600; font-size:1.1rem; margin-bottom:10px;">Sin Horarios Configurados</p>
                <p style="color:rgba(255,255,255,0.4); font-size:0.9rem; margin-bottom:20px;">Víncula este curso a un horario y docente para iniciar.</p>
                <button onclick="AcademicManager.editSchedule(null, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" class="btn" style="background:var(--color-acento-azul); color:#0f172a; font-weight:700; border-radius:10px; padding:10px 25px;">
                    <i class="bi bi-plus-lg"></i> Agregar Primer Horario
                </button>
            </div>
        `;
        return;
    }

    // Reuse or adapt AcademicManager logic? 
    // AcademicManager.generateSchedulesList returns a string for the old modal.
    // I'll use a simplified version for this hub.
    const activeDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Calculate total intensity
    let totalMinutes = 0;
    schedules.forEach(s => {
        const start = s.time_start.split(':').map(Number);
        const end = s.time_end.split(':').map(Number);
        totalMinutes += (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
    });
    const totalHours = (totalMinutes / 60).toFixed(1);

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:rgba(255,255,255,0.03); padding:15px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
            <div>
                <h4 style="color:white; margin:0; font-weight:600;"><i class="bi bi-stopwatch" style="color:var(--color-acento-azul); margin-right:10px;"></i>Planificación Semanal</h4>
                <p style="margin:4px 0 0 0; color:rgba(255,159,67,0.8); font-size:0.75rem; font-weight:700;">Intensidad Total: ${totalHours} hs/semana</p>
            </div>
            <button onclick="AcademicManager.editSchedule(null, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" class="btn" style="background:var(--color-acento-azul); color:#0f172a; border-radius:8px; padding:8px 15px; font-size:0.85rem; font-weight:700;">
                <i class="bi bi-plus-lg"></i> Agregar Bloque
            </button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
    `;

    schedules.forEach(s => {
        html += `
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:15px; position:relative;">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:10px;">
                    <div>
                        <div style="color:var(--color-acento-azul); font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px;">${s.day}</div>
                        <div style="color:white; font-size:1rem; font-weight:600;">${ApiService.formatTime(s.time_start)} - ${ApiService.formatTime(s.time_end)}</div>
                    </div>
                    <div style="display:flex; gap:5px;">
                        <button onclick="AcademicManager.editSchedule(${s.id_schedule}, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" title="Editar" style="background:none; border:none; color:rgba(255,255,255,0.3); cursor:pointer;"><i class="bi bi-pencil"></i></button>
                        <button onclick="deleteSchedule(${s.id_schedule}, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" title="Eliminar" style="background:none; border:none; color:rgba(231,76,60,0.5); cursor:pointer;"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
                
                <div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.05);">
                    <label style="display:block; color:rgba(255,255,255,0.3); font-size:0.7rem; text-transform:uppercase; margin-bottom:5px;">Facultad Asignada</label>
                    <div id="teachers-list-${s.id_schedule}">
                        ${s.teachers && s.teachers.length > 0 ? s.teachers.map(t => `
                            <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(52,152,219,0.1); border-radius:8px; padding:5px 10px; margin-bottom:5px;">
                                <span style="color:#74b9ff; font-size:0.8rem; font-weight:600;"><i class="bi bi-person-fill"></i> ${t.name}</span>
                                <button onclick="window.hubUnassignTeacher(${s.id_schedule}, ${t.id}, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:1.1rem; line-height:1;">&times;</button>
                            </div>
                        `).join('') : `<div style="color:rgba(255,159,67,0.5); font-size:0.75rem; font-style:italic;">Sin docente - Asigna uno</div>`}
                        <button onclick="AcademicManager.assignTeacherModal(${s.id_schedule}, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" style="width:100%; margin-top:5px; background:rgba(255,159,67,0.1); border:1px dashed rgba(255,159,67,0.3); color:#E78C3B; border-radius:8px; padding:6px; cursor:pointer; font-size:0.75rem; font-weight:600;">
                            <i class="bi bi-person-plus"></i> Vincular Docente
                        </button>
                    </div>
                </div>

                <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.4);">Cupos: <strong>${s.enrolled_count}/${s.quota || 15}</strong></div>
                    <div style="width:60px; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                        <div style="width:${Math.min((s.enrolled_count / (s.quota || 15)) * 100, 100)}%; height:100%; background:var(--color-acento-azul);"></div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function renderStudentsInHub(students, pending, courseId, courseName, container) {
    let html = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:25px;">
            <!-- Solicitudes Pendientes -->
            <div style="background:rgba(255,159,67,0.03); border:1px solid rgba(255,159,67,0.1); border-radius:20px; padding:20px;">
                <h4 style="color:#ff9f43; margin:0 0 15px 0; font-size:1.1rem; font-weight:700; display:flex; align-items:center; gap:10px;">
                    <i class="bi bi-clock-history"></i> Por Aprobar (${pending.length})
                </h4>
                <div class="custom-scroll" style="max-height: 400px; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">
                    ${pending.length === 0 ? '<div style="color:rgba(255,255,255,0.2); text-align:center; padding:20px;">No hay solicitudes pendientes.</div>' : pending.map(p => `
                        <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                            <div style="color:white; font-weight:600; font-size:0.9rem;">${p.student_name}</div>
                            <div style="color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:8px;">${p.schedule_info || 'Sin horario seleccionado'}</div>
                            <div style="display:flex; gap:8px;">
                                <button onclick="AcademicManager.handleRequest(${p.id_enrollment}, 'Aprobar', ${courseId}, '${courseName.replace(/'/g, "\\'")}')" style="flex:1; background:#2ecc71; color:#000; border:none; padding:6px; border-radius:6px; font-weight:700; font-size:0.75rem; cursor:pointer;">Aceptar</button>
                                <button onclick="AcademicManager.handleRequest(${p.id_enrollment}, 'Inactivo', ${courseId}, '${courseName.replace(/'/g, "\\'")}')" style="flex:1; background:rgba(231,76,60,0.2); color:#e74c3c; border:1px solid rgba(231,76,60,0.3); padding:6px; border-radius:6px; font-weight:700; font-size:0.75rem; cursor:pointer;">Rechazar</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Listado Activo -->
            <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:20px; padding:20px;">
                <h4 style="color:white; margin:0 0 15px 0; font-size:1.1rem; font-weight:700; display:flex; align-items:center; gap:10px;">
                    <i class="bi bi-person-check-fill" style="color:var(--color-acento-azul);"></i> Alumnos activos (${students.length})
                </h4>
                <div class="custom-scroll" style="max-height: 400px; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">
                    ${students.length === 0 ? '<div style="color:rgba(255,255,255,0.2); text-align:center; padding:20px;">No hay alumnos inscritos.</div>' : students.map(s => {
        const schedulesHtml = s.schedules_assigned && s.schedules_assigned.length > 0
            ? s.schedules_assigned.map(sch => `<span style="background:rgba(52,152,219,0.1); color:#74b9ff; padding:2px 6px; border-radius:4px; font-size:0.65rem;">${sch.day} ${ApiService.formatTime(sch.time_start)}</span>`).join(' ')
            : '<span style="color:#e67e22; font-size:0.65rem;">Sin horario asignado</span>';

        return `
                        <div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(255,255,255,0.05);">
                            <div style="flex:1;">
                                <div style="color:white; font-weight:600; font-size:0.9rem;">${s.student_name}</div>
                                <div style="margin-top:4px; display:flex; flex-wrap:wrap; gap:4px;">${schedulesHtml}</div>
                            </div>
                            <div style="display:flex; gap:8px;">
                                <button onclick="AcademicManager.assignStudentSchedule(${s.id_enrollment}, ${courseId}, '${courseName.replace(/'/g, "\\'")}')" title="Asignar Horario" style="background:none; border:none; color:var(--color-acento-azul); cursor:pointer;"><i class="bi bi-calendar-plus"></i></button>
                                <button onclick="window.hubUnenrollStudent(${s.id_enrollment}, '${s.student_name.replace(/'/g, "\\'")}', ${courseId}, '${courseName.replace(/'/g, "\\'")}')" title="Retirar Alumno" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="bi bi-person-dash"></i></button>
                            </div>
                        </div>
                    `;
    }).join('')}
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

// Logic for deleting a schedule
window.deleteSchedule = async (id, courseId, courseName) => {
    const confirm = await Swal.fire({
        title: '¿Eliminar horario?',
        text: 'Se desvincularán los alumnos inscritos en este bloque. Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#444',
        confirmButtonText: 'Sí, eliminar horario',
        background: '#1a1a1a', color: '#fff'
    });

    if (confirm.isConfirmed) {
        Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading(), background: '#1a1a1a', color: '#fff' });
        const res = await ApiService.deleteSchedule(id);
        if (res.success) {
            Swal.fire({ icon: 'success', title: 'Horario eliminado', timer: 1500, showConfirmButton: false, background: '#1a1a1a', color: '#fff' });
            loadAcademicTab(courseId, courseName);
        } else {
            Swal.fire('Error', res.message, 'error');
        }
    }
};

// Override AcademicManager.openDetails to use our hub if we want to be fully unified
window.openCourseDetails = (id, name) => {
    // Find the program key for this course name
    const key = Object.keys(currentPrograms).find(k => currentPrograms[k].title.toLowerCase() === name.toLowerCase());
    if (key) {
        window.openProgramHub(key, id);
    } else {
        // Fallback to legacy modal if no matching program card (shouldn't happen with our logic)
        AcademicManager.openDetails(id, name);
    }
};

// Academic Action Handlers (Delegated)
window.hubUnassignTeacher = async (scheduleId, teacherId, courseId, courseName) => {
    const confirm = await Swal.fire({
        title: '¿Retirar docente?',
        text: 'El docente ya no tendrá acceso a las listas de este horario.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        background: '#1a1a1a', color: '#fff'
    });

    if (confirm.isConfirmed) {
        const res = await ApiService.unassignSingleTeacher(scheduleId, teacherId);
        if (res.success) {
            Swal.fire({ icon: 'success', title: 'Docente retirado', timer: 1000, showConfirmButton: false, background: '#1a1a1a', color: '#fff' });
            loadAcademicTab(courseId, courseName);
        } else {
            Swal.fire('Error', res.message, 'error');
        }
    }
};

window.hubUnenrollStudent = async (enrollmentId, studentName, courseId, courseName) => {
    const confirm = await Swal.fire({
        title: `¿Eliminar inscripción de ${studentName}?`,
        text: 'Se borrará el registro de este alumno en el curso.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        background: '#1a1a1a', color: '#fff'
    });

    if (confirm.isConfirmed) {
        const res = await ApiService.unenrollStudent(enrollmentId);
        if (res.success) {
            Swal.fire({ icon: 'success', title: 'Alumno eliminado', timer: 1000, showConfirmButton: false, background: '#1a1a1a', color: '#fff' });
            loadAcademicTab(courseId, courseName);
        } else {
            Swal.fire('Error', res.message, 'error');
        }
    }
};

// Global callback for AcademicManager to refresh our view if needed
window.onAcademicUpdate = (courseId, courseName) => {
    loadAcademicTab(courseId, courseName);
};

window.openCreateModal = () => {
    // Reset Header
    document.getElementById('modalMainTitle').innerText = "Crear Nuevo Programa";
    document.getElementById('modalMainSubtitle').innerText = "Define la información comercial de tu nuevo curso.";
    document.getElementById('modalMainIcon').innerHTML = `<i class="bi bi-plus-circle"></i>`;

    // Reset Form
    const form = document.getElementById('programForm');
    form.reset();
    document.getElementById('program_id').value = '';
    document.getElementById('imageBase64').value = '';

    // Reset Visuals
    document.getElementById('iconPreview').innerHTML = `<i class="bi bi-music-note"></i>`;
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('imagePlaceholder').style.display = 'block';

    // Hide Academic Tabs (Only for existing programs)
    document.getElementById('btn-tab-schedules').style.display = 'none';
    document.getElementById('btn-tab-students').style.display = 'none';

    switchProgramTab('tab-web');
    showModal();
}

function showModal() {
    const modal = document.getElementById('programModal');
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.style.opacity = '1');
}

window.closeModal = () => {
    const modal = document.getElementById('programModal');
    modal.style.opacity = '0';
    setTimeout(() => modal.style.display = 'none', 300);
};

window.previewImage = (input) => {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.size > 3 * 1024 * 1024) {
            Swal.fire('Error', 'La imagen es demasiado grande. Máximo 3MB.', 'error');
            input.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreviewContainer').style.display = 'block';
            document.getElementById('imagePlaceholder').style.display = 'none';
            document.getElementById('imageBase64').value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

// Live Icon Preview
document.addEventListener('input', (e) => {
    if (e.target && e.target.name === 'icon') {
        const val = e.target.value.trim() || 'bi-music-note';
        document.getElementById('iconPreview').innerHTML = `<i class="bi ${val}"></i>`;
    }
});

async function handleProgramSave(e) {
    e.preventDefault();

    const form = document.getElementById('programForm');
    const existingKey = document.getElementById('program_id').value;

    // Generate ID for new item or use existing
    const key = existingKey ? existingKey : `program_${Date.now()}`;

    const updatedProgram = {
        title: form.title.value,
        subtitle: form.subtitle.value,
        description: form.description.value,
        icon: form.icon.value || 'bi-music-note',
        features: form.features.value.split(',').map(s => s.trim()).filter(s => s),
        image: document.getElementById('imageBase64').value || 'assets/default_program.png' // Fallback image
    };

    currentPrograms[key] = updatedProgram;

    // Optimistic Update UI
    closeModal();
    Swal.fire({
        title: 'Guardando...',
        text: 'Sincronizando con el servidor...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        background: '#1a1a1a',
        color: '#fff'
    });

    try {
        const res = await ApiService.saveProgramsJson(currentPrograms);
        if (res.success) {
            Swal.fire({
                title: '\u00a1Guardado!',
                text: 'Cambios aplicados en todos los dispositivos.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                background: '#1a1a1a',
                color: '#fff'
            });
            loadPrograms();
        } else {
            throw new Error(res.message);
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo guardar en el servidor: ' + err.message, 'error');
    }
}

window.deleteProgram = (key, courseId = null) => {
    Swal.fire({
        title: '\u00bfEliminar Programa?',
        text: courseId
            ? "Se borrar\u00e1 la informaci\u00f3n web y TODOS los horarios/inscripciones acad\u00e9micas asociadas."
            : "Esta acci\u00f3n borrar\u00e1 la informaci\u00f3n del programa de la web.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'S\u00ed, eliminar todo',
        background: '#1a1a1a',
        color: '#fff'
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Eliminando...',
                didOpen: () => Swal.showLoading(),
                background: '#1a1a1a',
                color: '#fff'
            });

            try {
                // Delete academic course if exists
                if (courseId) {
                    await ApiService.deleteCourse(courseId);
                }

                // Delete from JSON
                delete currentPrograms[key];
                await ApiService.saveProgramsJson(currentPrograms);

                loadPrograms();
                Swal.fire({
                    title: 'Eliminado',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false,
                    background: '#1a1a1a',
                    color: '#fff'
                });
            } catch (e) {
                console.error(e);
                Swal.fire('Error', 'No se pudo completar la eliminaci\u00f3n total.', 'error');
            }
        }
    });
}

window.resetData = () => {
    Swal.fire({
        title: '\u00bfRestaurar de F\u00e1brica?',
        text: "Se borrar\u00e1n todos los programas personalizados y volver\u00e1n los originales.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff3b30',
        cancelButtonColor: '#444',
        confirmButtonText: 'Restaurar todo',
        background: '#1a1a1a',
        color: '#fff'
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'Restaurando...', didOpen: () => Swal.showLoading(), background: '#1a1a1a', color: '#fff' });

            currentPrograms = JSON.parse(JSON.stringify(DEFAULT_PROGRAMS));

            await ApiService.saveProgramsJson(currentPrograms);
            await loadPrograms();

            Swal.fire('Restaurado', 'Datos originales restablecidos en el servidor.', 'success');
        }
    });
};