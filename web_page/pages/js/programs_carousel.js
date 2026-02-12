// ==========================================
// PROGRAMS CAROUSEL (Swiper with Coverflow)
// ==========================================

// Default Data (Fallback)
const DEFAULT_PROGRAM_DETAILS = {
    'program_d1': {
        title: 'Percusión',
        subtitle: 'Ritmo y Energía',
        icon: 'bi-music-note-beamed',
        description: 'Siente el ritmo en tu cuerpo. Aprende batería, percusión latina y sinfónica. Desarrolla tu coordinación, tempo y musicalidad en un ambiente dinámico.',
        features: ['Batería acústica y electrónica', 'Percusión latina (Congas, Bongos)', 'Lectura rítmica avanzada', 'Independencia de extremidades'],
        image: 'images/programs/percussion.png'
    },
    'program_d2': {
        title: 'Guitarra',
        subtitle: 'Acústica y Eléctrica',
        icon: 'bi-guitar',
        description: 'Domina las cuerdas con nuestra metodología integral. Desde acordes básicos hasta solos complejos de rock, jazz y blues. Aprenderás técnica, lectura musical e improvisación.',
        features: ['Lectura de partituras y tablaturas', 'Técnica de púa y dedos (Fingerstyle)', 'Improvisación y teoría aplicada', 'Ensambles y presentaciones en vivo'],
        image: 'images/programs/guitar.png'
    },
    'program_d3': {
        title: 'Piano',
        subtitle: 'Clásico y Moderno',
        icon: 'bi-grid-3x3-gap',
        description: 'Descubre el poder del piano. Nuestro programa abarca desde la elegancia de la música clásica hasta la versatilidad del pop y jazz moderno. Desarrolla tu oído y técnica.',
        features: ['Técnica pianística avanzada', 'Repertorio clásico y contemporáneo', 'Acompañamiento y armonía', 'Lectura a primera vista'],
        image: 'images/programs/piano.png'
    },
    'program_d4': {
        title: 'Voz',
        subtitle: 'Técnica Vocal',
        icon: 'bi-mic',
        description: 'Tu voz es tu instrumento más poderoso. Aprende a controlarla, proyectarla y cuidarla. Trabajamos respiración, afinación, rango vocal y expresión escénica.',
        features: ['Respiración y apoyo diafragmático', 'Vocalización y afinación', 'Interpretación y estilo', 'Salud vocal y cuidado'],
        image: 'images/programs/voice.png'
    },
    'program_d5': {
        title: 'Senior\'s',
        subtitle: 'Adulto Mayor',
        icon: 'bi-person-hearts',
        description: 'Nunca es tarde para aprender música. Un programa diseñado especialmente para adultos mayores, enfocado en el disfrute, la memoria y la socialización a través del arte.',
        features: ['Repertorio de música de antaño', 'Estimulación cognitiva y memoria', 'Clases grupales e individuales', 'Ambiente relajado y social'],
        image: 'images/programs/seniors.png'
    },
    'program_d6': {
        title: 'Shows',
        subtitle: 'Presentaciones',
        icon: 'bi-ticket-perforated',
        description: 'La música cobra vida en el escenario. Preparamos a nuestros estudiantes para brillar en conciertos reales, perdiendo el miedo escénico y ganando confianza profesional.',
        features: ['Montaje de repertorio en vivo', 'Expresión corporal y escénica', 'Manejo de equipo de sonido', 'Conciertos semestrales'],
        image: 'images/programs/shows.png'
    },
    'program_d7': {
        title: 'Exploración',
        subtitle: 'Iniciación Musical',
        icon: 'bi-balloon',
        description: 'El primer paso para los más pequeños. Un acercamiento lúdico a la música donde los niños descubren ritmos, melodías e instrumentos mientras juegan y se divierten.',
        features: ['Rítmica dalcroze y juegos musicales', 'Exploración de instrumentos Orff', 'Canto y movimiento', 'Desarrollo auditivo temprano'],
        image: 'images/programs/exploration.png'
    },
    'program_d8': {
        title: 'Psicomúsica',
        subtitle: 'Bienestar y Terapia',
        icon: 'bi-heart-pulse',
        description: 'La música como herramienta de sanación y crecimiento personal. Sesiones enfocadas en el bienestar emocional, relajación y desarrollo de habilidades a través del sonido.',
        features: ['Musicoterapia activa y receptiva', 'Relajación y mindfulness sonoro', 'Expresión emocional', 'Desarrollo de habilidades sociales'],
        image: 'images/programs/psychomusic.png'
    }
};

// Global accessor for current data (used by Modals)
let programDetails = {};

async function renderProgramsCarousel() {
    // 1. Try to fetch from Server (Source of Truth)
    if (window.ApiService) {
        const serverData = await ApiService.getProgramsJson();
        if (serverData && Object.keys(serverData).length > 0) {
            programDetails = serverData;
        } else {
            // Fallback to defaults if server empty
            console.warn("Server programs empty, strictly using fallback.");
            programDetails = DEFAULT_PROGRAM_DETAILS;
        }
    } else {
        // Fallback if API not available
        programDetails = DEFAULT_PROGRAM_DETAILS;
    }

    const wrapper = document.querySelector('.programs-swiper .swiper-wrapper');
    const keys = Object.keys(programDetails);

    // Clear static HTML
    wrapper.innerHTML = '';

    if (keys.length === 0) {
        wrapper.innerHTML = '<div class="swiper-slide"><div style="color:white;text-align:center;padding:50px;">No hay programas disponibles.</div></div>';
        return;
    }

    keys.forEach(key => {
        const p = programDetails[key];
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        // Note: data-tilt might need re-initialization if using VanillaTilt.js dynamically, 
        // but for now we render structure.
        slide.innerHTML = `
                <div class="program-card" onclick="openProgramModal('${key}')" 
                     style="background-image: url('${p.image || 'assets/default.png'}');">
                <div class="program-overlay"></div>
                <div class="program-content">
                    <div class="program-icon"><i class="bi ${p.icon}"></i></div>
                    <h3>${p.title}</h3>
                    <p>${p.subtitle}</p>
                </div>
            </div>
        `;
        wrapper.appendChild(slide);
    });

    // Re-init VanillaTilt if library is available
    if (window.VanillaTilt) {
        window.VanillaTilt.init(document.querySelectorAll(".program-card"), {
            max: 15,
            speed: 400,
            glare: true,
            "max-glare": 0.2,
        });
    }

    initProgramsCarousel(keys.length);

    // Recover any pending enrollment intent after programs are loaded
    recoverEnrollmentIntent();
}

function initProgramsCarousel(totalSlides) {
    // Destroy previous instance if exists to avoid memory leaks/bugs
    const container = document.querySelector('.programs-swiper');
    if (container.swiper) container.swiper.destroy(true, true);

    new Swiper('.programs-swiper', {
        effect: 'slide', // Efecto lineal plano solicitado
        grabCursor: true,
        centeredSlides: false, // Inicio desde la izquierda para llenar la línea
        spaceBetween: 20, // Espacio entre tarjetas
        slidesPerView: 1, // Default mobile

        loop: true,
        speed: 600,

        navigation: {
            nextEl: '.programs-swiper .swiper-button-next',
            prevEl: '.programs-swiper .swiper-button-prev',
        },

        pagination: {
            el: '.programs-swiper .swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },

        breakpoints: {
            // Móvil
            480: { slidesPerView: 1.2, spaceBetween: 15 },
            // Tablet Portrait
            768: { slidesPerView: 2.2, spaceBetween: 20 },
            // Tablet Landscape
            1024: { slidesPerView: 3.2, spaceBetween: 20 },
            // Laptop / Desktop Standard
            1366: { slidesPerView: 4, spaceBetween: 25 },
            // Large Screens (Objetivo Usuario: 5 por línea)
            1600: { slidesPerView: 5, spaceBetween: 30 }
        },

        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', renderProgramsCarousel);


// ==========================================
// PROGRAM MODALS LOGIC
// ==========================================

window.openProgramModal = function (programId) {
    const data = programDetails[programId]; // Uses the dynamically loaded data
    if (!data) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.95)', zIndex: '10000',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        opacity: '0', transition: 'opacity 0.3s'
    });

    overlay.innerHTML = `
        <div style="background:#1a1a1a; padding:0; border-radius:16px; width:95%; max-width:700px; max-height:90vh; overflow-y:auto; box-shadow:0 30px 60px rgba(0,0,0,0.8); border:1px solid #333; position:relative;">
            
            <div style="height:250px; background-image:url('${data.image}'); background-size:cover; background-position:center; position:relative;">
                <div style="position:absolute; inset:0; background:linear-gradient(to top, #1a1a1a, transparent);"></div>
                <button onclick="this.closest('.modal-overlay').remove()" style="position:absolute; top:15px; right:15px; background:rgba(0,0,0,0.6); border:none; color:white; width:40px; height:40px; border-radius:50%; font-size:1.5rem; cursor:pointer; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px);">&times;</button>
                <div style="position:absolute; bottom:20px; left:30px;">
                    <div style="display:inline-flex; align-items:center; gap:10px; color:var(--color-acento-naranja); margin-bottom:5px;">
                        <i class="bi ${data.icon}" style="font-size:1.5rem;"></i>
                        <span style="font-weight:bold; letter-spacing:1px; text-transform:uppercase; font-size:0.9rem;">Programa JACQUIN</span>
                    </div>
                    <h2 style="color:white; font-size:2.5rem; margin:0; text-shadow:0 2px 10px rgba(0,0,0,0.8);">${data.title}</h2>
                    <p style="color:#ccc; margin:0; font-size:1.1rem;">${data.subtitle}</p>
                </div>
            </div>

            <div style="padding:30px;">
                <p style="color:#ddd; line-height:1.6; font-size:1.05rem; margin-bottom:25px;">${data.description}</p>
                
                <h4 style="color:var(--color-acento-azul); border-bottom:1px solid #333; padding-bottom:10px; margin-bottom:15px;">Lo que aprenderás:</h4>
                <ul style="list-style:none; padding:0; display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:15px;">
                    ${data.features && data.features.length > 0 ? data.features.map(feat => `
                        <li style="display:flex; align-items:center; gap:10px; color:#bbb;">
                            <i class="bi bi-check-circle-fill" style="color:var(--color-acento-naranja);"></i> ${feat}
                        </li>
                    `).join('') : '<li style="color:#666">Detalles próximamente.</li>'}
                </ul>

                <div style="margin-top:35px; text-align:center;">
                    <button onclick="handleProgramEnrollment('${programId}')" 
                        style="background:var(--color-acento-azul); color:white; border:none; padding:12px 30px; border-radius:30px; font-size:1rem; font-weight:bold; cursor:pointer; transition:all 0.3s; box-shadow:0 10px 20px rgba(52, 152, 219, 0.3);">
                        ¡Inscribirme Ahora!
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Close on background click
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };

    // Animation
    window.requestAnimationFrame(() => {
        overlay.style.opacity = '1';
    });
};

/**
 * Handle Program Enrollment Logic
 */
window.handleProgramEnrollment = async function (programId) {
    const data = programDetails[programId];
    if (window.ApiService && ApiService.isAuthenticated()) {
        // Logged in: Show Scheduling Modal directly
        showSchedulingModal(programId);
    } else {
        // Visitor: Save both ID and Title for universal matching
        if (data && data.title) {
            sessionStorage.setItem('pending_enrollment_title', data.title);
        }
        sessionStorage.setItem('pending_enrollment', programId);
        showAuthRequiredOverlay();
    }

    // Close the program detail modal if open
    const detailOverlay = document.querySelector('.modal-overlay');
    if (detailOverlay && !detailOverlay.classList.contains('auth-required-modal')) {
        detailOverlay.remove();
    }
};

/**
 * NEW: Show scheduling selection for authenticated users
 */
async function showSchedulingModal(programId) {
    const data = programDetails[programId];
    if (!data) return;

    // 1. Get Course ID from DB (Match by Name)
    const coursesRes = await ApiService.getCourses();
    if (!coursesRes.success) return showToast("Error conectando con la base de datos de cursos.", "error");

    const dbCourse = coursesRes.data.find(c => c.name.toLowerCase().includes(data.title.toLowerCase()));
    if (!dbCourse) return showToast("Este curso aún no tiene horarios configurados en el sistema.", "warning");

    // 2. Load Schedules
    const schedRes = await ApiService.getSchedules(dbCourse.id_course);
    const schedules = schedRes.success ? schedRes.data : [];

    // 3. Create Modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    Object.assign(modal.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.9)', zIndex: '20000',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        opacity: '0', transition: 'opacity 0.3s'
    });

    const schedHtml = schedules.map(s => `
        <div style="background:rgba(255,255,255,0.05); padding:15px; margin-bottom:10px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; border:1px solid #333;">
            <div>
                <strong style="color:var(--color-acento-naranja); font-size:1.1rem;">${s.day}</strong>
                <div style="color:white; margin-top:3px;">${ApiService.formatTime(s.time_start)} - ${ApiService.formatTime(s.time_end)}</div>
                <div style="font-size:0.85rem; color:#888;">Profesor: ${s.teacher_name}</div>
            </div>
            <button onclick="confirmEnrollment(${dbCourse.id_course}, ${s.id_schedule}, '${data.title.replace(/'/g, "\\'")}')" 
                style="background:var(--color-acento-azul); color:white; border:none; padding:8px 15px; border-radius:20px; font-weight:bold; cursor:pointer;">
                Seleccionar
            </button>
        </div>
    `).join('') || '<div style="color:#888; text-align:center; padding:20px;">No hay horarios disponibles para inscribirse en este momento.</div>';

    modal.innerHTML = `
        <div style="background:#1a1a1a; padding:30px; border-radius:20px; width:95%; max-width:500px; border:1px solid #333; box-shadow:0 20px 40px rgba(0,0,0,0.5);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="color:white; margin:0;">Elige tu Horario</h3>
                <button onclick="this.closest('.modal-overlay').remove()" style="background:none; border:none; color:#666; font-size:1.5rem; cursor:pointer;">&times;</button>
            </div>
            <p style="color:#aaa; margin-bottom:20px;">Estás a un paso de inscribirte en <strong>${data.title}</strong>. Selecciona el horario que mejor te convenga:</p>
            <div style="max-height:350px; overflow-y:auto; padding-right:5px;">
                ${schedHtml}
            </div>
            <p style="color:#666; font-size:0.75rem; margin-top:20px; text-align:center; line-height:1.4;">
                <i class="bi bi-info-circle"></i> La asignación del docente es gestionada directamente por la administración de la academia de acuerdo al horario seleccionado.
            </p>
        </div>
    `;

    document.body.appendChild(modal);
    window.requestAnimationFrame(() => modal.style.opacity = '1');
}

window.confirmEnrollment = async function (courseId, scheduleId, courseName) {
    const user = ApiService.getSession();
    if (!user) return showToast("Sesión expirada.", "error");

    // Visual loading
    const btn = event.target;
    const oldText = btn.innerText;
    btn.innerText = "Procesando...";
    btn.disabled = true;

    const res = await ApiService.requestEnrollment(user.id_usuario, courseId, scheduleId);

    if (res.success) {
        // Show success and move to dashboard
        btn.innerText = "¡Solicitado!";
        btn.style.background = "#2ecc71";

        await showToast(`¡Excelente elección! Tu solicitud para ${courseName} ha sido recibida. El administrador te contactará pronto para la aprobación final.`, "success");
        window.location.href = 'gestion.html';
    } else {
        showToast("Error: " + res.message, "error");
        btn.innerText = oldText;
        btn.disabled = false;
    }
};

/**
 * Modern Auth Required Overlay for Guests
 */
function showAuthRequiredOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'auth-required-modal';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
        display: flex; justify-content: center; align-items: center;
        z-index: 10001; opacity: 0; transition: opacity 0.3s;
    `;

    overlay.innerHTML = `
        <div style="background: linear-gradient(145deg, #1a2533, #151b26); border: 1px solid rgba(255,255,255,0.1); 
                    padding: 40px; border-radius: 24px; text-align: center; max-width: 450px; width: 90%;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.5); transform: scale(0.9); transition: transform 0.3s;
                    position: relative;">
            
            <button class="close-auth-modal" style="position:absolute; top:15px; right:15px; background:none; border:none; color:#666; font-size:1.5rem; cursor:pointer;">&times;</button>

            <div style="width:70px; height:70px; background:rgba(231, 140, 59, 0.1); color:var(--color-acento-naranja); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:2.5rem;">
                <i class="bi bi-person-lock"></i>
            </div>

            <h3 style="color: white; margin-bottom: 15px; font-size: 1.5rem;">Casi listo para iniciar...</h3>
            <p style="color: #ccc; line-height: 1.6; margin-bottom: 30px;">
                Para inscribirte a nuestros programas, primero debes ser parte de nuestra comunidad.
            </p>

            <div style="display: flex; flex-direction: column; gap: 15px;">
                <button onclick="window.location.href='login.html'" style="
                    background: var(--color-acento-azul); color: white; border: none; padding: 14px; 
                    border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 1rem;
                    transition: transform 0.2s; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);">
                    Iniciar Sesión
                </button>
                
                <button onclick="window.location.href='registro.html'" style="
                    background: transparent; color: white; border: 2px solid rgba(255,255,255,0.1); padding: 12px; 
                    border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 1rem;
                    transition: all 0.2s;">
                    Registrarme ahora
                </button>
            </div>

            <p style="color: #666; font-size: 0.85rem; margin-top: 25px;">
                ¡Descubre tu talento musical con nosotros!
            </p>
        </div>
    `;

    document.body.appendChild(overlay);

    // Animation
    requestAnimationFrame(() => {
        overlay.style.opacity = "1";
        overlay.querySelector('div').style.transform = "scale(1)";
    });

    const close = () => {
        overlay.style.opacity = "0";
        overlay.querySelector('div').style.transform = "scale(0.9)";
        setTimeout(() => overlay.remove(), 300);
    };

    overlay.querySelector('.close-auth-modal').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
}

/**
 * Automagically recover pending enrollment intent on page load
 */
function recoverEnrollmentIntent() {
    const pendingId = sessionStorage.getItem('pending_enrollment');
    const pendingTitle = sessionStorage.getItem('pending_enrollment_title');

    if (pendingId && window.ApiService && ApiService.isAuthenticated()) {
        console.log("Sistema: Recuperando intención para", pendingTitle || pendingId);

        // Find the correct ID if we only have the title
        let finalId = pendingId;
        if (pendingTitle && (!programDetails[finalId])) {
            const keys = Object.keys(programDetails);
            const found = keys.find(k => programDetails[k].title === pendingTitle);
            if (found) finalId = found;
        }

        if (programDetails[finalId]) {
            // If authenticated, go straight to selection layout (schedules)
            showSchedulingModal(finalId);

            // Clear intent to prevent loops
            sessionStorage.removeItem('pending_enrollment');
            sessionStorage.removeItem('pending_enrollment_title');

            // Ensure visibility
            const section = document.getElementById('programas');
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

