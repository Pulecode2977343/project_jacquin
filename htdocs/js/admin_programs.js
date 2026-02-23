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
        title: 'Percusión',
        subtitle: 'Ritmo y Energía',
        icon: 'bi-music-note-beamed',
        description: 'Siente el ritmo en tu cuerpo. Aprende batería, percusión latina y sinfónica. Desarrolla tu coordinación, tempo y musicalidad en un ambiente dinámico.',
        features: ['Batería acústica y electrónica', 'Percusión latina (Congas, Bongos)', 'Lectura rítmica avanzada', 'Independencia de extremidades'],
        image: 'images/programs/percussion.png'
    },
    'guitarra': {
        title: 'Guitarra',
        subtitle: 'Acústica y Eléctrica',
        icon: 'bi-guitar',
        description: 'Domina las cuerdas con nuestra metodología integral. Desde acordes básicos hasta solos complejos de rock, jazz y blues. Aprenderás técnica, lectura musical e improvisación.',
        features: ['Lectura de partituras y tablaturas', 'Técnica de púa y dedos (Fingerstyle)', 'Improvisación y teoría aplicada', 'Ensambles y presentaciones en vivo'],
        image: 'images/programs/guitar.png'
    },
    'piano': {
        title: 'Piano',
        subtitle: 'Clásico y Moderno',
        icon: 'bi-grid-3x3-gap',
        description: 'Descubre el poder del piano. Nuestro programa abarca desde la elegancia de la música clásica hasta la versatilidad del pop y jazz moderno. Desarrolla tu oído y técnica.',
        features: ['Técnica pianística avanzada', 'Repertorio clásico y contemporáneo', 'Acompañamiento y armonía', 'Lectura a primera vista'],
        image: 'images/programs/piano.png'
    },
    'voz': {
        title: 'Voz',
        subtitle: 'Técnica Vocal',
        icon: 'bi-mic',
        description: 'Tu voz es tu instrumento más poderoso. Aprende a controlarla, proyectarla y cuidarla. Trabajamos respiración, afinación, rango vocal y expresión escénica.',
        features: ['Respiración y apoyo diafragmático', 'Vocalización y afinación', 'Interpretación y estilo', 'Salud vocal y cuidado'],
        image: 'images/programs/voice.png'
    },
    'seniors': {
        title: 'Senior\'s',
        subtitle: 'Adulto Mayor',
        icon: 'bi-person-hearts',
        description: 'Nunca es tarde para aprender música. Un programa diseñado especialmente para adultos mayores, enfocado en el disfrute, la memoria y la socialización a través del arte.',
        features: ['Repertorio de música de antaño', 'Estimulación cognitiva y memoria', 'Clases grupales e individuales', 'Ambiente relajado y social'],
        image: 'images/programs/seniors.png'
    },
    'shows': {
        title: 'Shows',
        subtitle: 'Presentaciones',
        icon: 'bi-ticket-perforated',
        description: 'La música cobra vida en el escenario. Preparamos a nuestros estudiantes para brillar en conciertos reales, perdiendo el miedo escénico y ganando confianza profesional.',
        features: ['Montaje de repertorio en vivo', 'Expresión corporal y escénica', 'Manejo de equipo de sonido', 'Conciertos semestrales'],
        image: 'images/programs/shows.png'
    },
    'exploration': {
        title: 'Exploración',
        subtitle: 'Iniciación Musical',
        icon: 'bi-balloon',
        description: 'El primer paso para los más pequeños. Un acercamiento lúdico a la música donde los niños descubren ritmos, melodías e instrumentos mientras juegan y se divierten.',
        features: ['Rítmica dalcroze y juegos musicales', 'Exploración de instrumentos Orff', 'Canto y movimiento', 'Desarrollo auditivo temprano'],
        image: 'images/programs/exploration.png'
    },
    'psychomusic': {
        title: 'Psicomúsica',
        subtitle: 'Bienestar y Terapia',
        icon: 'bi-heart-pulse',
        description: 'La música como herramienta de sanación y crecimiento personal. Sesiones enfocadas en el bienestar emocional, relajación y desarrollo de habilidades a través del sonido.',
        features: ['Musicoterapia activa y receptiva', 'Relajación y mindfulness sonoro', 'Expresión emocional', 'Desarrollo de habilidades sociales'],
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

    currentPrograms = await getPrograms();
    container.innerHTML = '';

    const keys = Object.keys(currentPrograms);
    if (keys.length === 0) {
        container.innerHTML = '<div style="color:#666; font-style:italic;">No hay programas creados.</div>';
        return;
    }

    keys.forEach(key => {
        const p = currentPrograms[key];
        const card = document.createElement('div');
        card.className = 'admin-program-card';
        card.innerHTML = `
            <div style="height:150px; overflow:hidden; position:relative;">
                <img src="${p.image || 'assets/default.png'}" class="program-thumb" style="width:100%; height:100%; object-fit:cover;" alt="${p.title}">
                <button onclick="deleteProgram('${key}')" style="position:absolute; top:10px; right:10px; background:rgba(231,76,60,0.8); color:white; border:none; border-radius:50%; width:30px; height:30px; cursor:pointer;">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="program-info">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <h3 style="color:white; margin:0; font-size:1.2rem;">${p.title}</h3>
                    <i class="bi ${p.icon}" style="color:var(--color-acento-azul); font-size:1.2rem;"></i>
                </div>
                <p style="color:#ccc; font-size:0.9rem; margin-bottom:10px;">${p.subtitle}</p>
                <button class="btn-edit" onclick="openEditModal('${key}')">
                    <i class="bi bi-pencil"></i> Editar
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// === CRUD Logic ===

window.openEditModal = (key) => {
    const p = currentPrograms[key];
    const form = document.getElementById('programForm');

    document.querySelector('#programModal h3').innerText = "Editar Programa";
    document.getElementById('program_id').value = key;

    form.title.value = p.title || '';
    form.subtitle.value = p.subtitle || '';
    form.description.value = p.description || '';
    form.icon.value = p.icon || '';
    form.features.value = p.features ? p.features.join(', ') : '';

    // Image
    document.getElementById('imageBase64').value = p.image || '';
    document.getElementById('preview-img').innerHTML = p.image ? `<img src="${p.image}" class="preview-media">` : 'Sin imagen';
    document.getElementById('imageInput').value = '';

    showModal();
};

window.openCreateModal = () => {
    const form = document.getElementById('programForm');
    document.querySelector('#programModal h3').innerText = "Crear Nuevo Programa";
    document.getElementById('program_id').value = ''; // Empty ID for new

    form.reset();
    document.getElementById('imageBase64').value = '';
    document.getElementById('preview-img').innerHTML = 'Vista previa';

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
        // Allow slightly larger for base64
        if (file.size > 3 * 1024 * 1024) {
            Swal.fire('Error', 'La imagen es demasiado grande. Máximo 3MB.', 'error');
            input.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('preview-img').innerHTML = `<img src="${e.target.result}" class="preview-media">`;
            document.getElementById('imageBase64').value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

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
                title: '¡Guardado!',
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

window.deleteProgram = (key) => {
    Swal.fire({
        title: '¿Eliminar Programa?',
        text: "Esta acción lo borrará de todos los dispositivos.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        background: '#1a1a1a',
        color: '#fff'
    }).then(async (result) => {
        if (result.isConfirmed) {
            delete currentPrograms[key];

            Swal.fire({
                title: 'Eliminando...',
                didOpen: () => Swal.showLoading(),
                background: '#1a1a1a',
                color: '#fff'
            });

            try {
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
                Swal.fire('Error', 'No se pudo eliminar.', 'error');
            }
        }
    });
}

window.resetData = () => {
    Swal.fire({
        title: '¿Restaurar de Fábrica?',
        text: "Se borrarán todos los programas personalizados y volverán los originales.",
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
