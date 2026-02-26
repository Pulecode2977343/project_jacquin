import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ApiService from '../services/api';
import ProgramModal from './ProgramModal';
import ScheduleModal from './ScheduleModal';
import AuthPromptModal from './AuthPromptModal';

// Resuelve URLs de imágenes subidas por admin (public/uploads/) o assets locales
const resolveImageUrl = (img) => {
    if (!img) return 'assets/images/hero/hero-banner.jpg';
    if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('assets/')) return img;
    if (img.startsWith('public/uploads/') || img.startsWith('uploads/')) {
        return ApiService.BASE_URL + img;
    }
    return 'assets/' + img.replace(/^\//, '');
};

const Programs = () => {
    const [programs, setPrograms]       = useState({});
    const [loading, setLoading]         = useState(true);
    const [selectedKey, setSelectedKey] = useState(null);
    // modalStep: null | 'detail' | 'schedule' | 'auth'
    const [modalStep, setModalStep]     = useState(null);

    const location = useLocation();

    // ── Carga inicial de programas ─────────────────────────────────────────────
    useEffect(() => {
        ApiService.getProgramsJson().then(data => {
            if (data && Object.keys(data).length > 0) setPrograms(data);
            setLoading(false);
        });
    }, []);

    // ── Recovery de inscripción pendiente tras login ───────────────────────────
    // Login.jsx navega a '/' con state { recoverEnrollment: true } cuando detecta
    // pending_enrollment en sessionStorage. Este efecto lo retoma sin recargar página.
    useEffect(() => {
        if (!location.state?.recoverEnrollment) return;
        if (Object.keys(programs).length === 0) return; // esperar a que carguen

        const pendingKey   = sessionStorage.getItem('pending_enrollment');
        const pendingTitle = sessionStorage.getItem('pending_enrollment_title') || '';
        let targetKey = null;

        if (pendingKey && programs[pendingKey]) {
            targetKey = pendingKey;
        } else if (pendingTitle) {
            // Buscar por título si la clave ya no coincide
            targetKey = Object.keys(programs).find(k =>
                programs[k].title?.toLowerCase().includes(pendingTitle.toLowerCase())
            ) ?? null;
        }

        if (targetKey) {
            setSelectedKey(targetKey);
            setModalStep('schedule');
        }

        // Limpiar location.state para evitar re-dispararse en renders posteriores
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }, [programs, location.state]);

    // ── Handlers de modales ────────────────────────────────────────────────────
    const openProgram = (key) => {
        setSelectedKey(key);
        setModalStep('detail');
    };

    const handleEnroll = () => {
        if (ApiService.isAuthenticated()) {
            setModalStep('schedule');
        } else {
            // Guardar intent antes de mostrar pantalla de auth
            sessionStorage.setItem('pending_enrollment', selectedKey);
            sessionStorage.setItem('pending_enrollment_title', programs[selectedKey]?.title || '');
            setModalStep('auth');
        }
    };

    const closeAll = () => {
        setSelectedKey(null);
        setModalStep(null);
    };

    const selectedProgram = selectedKey ? programs[selectedKey] : null;
    const keys = Object.keys(programs);

    if (loading) return null;

    return (
        <section className="bento-section" id="programas">
            <div className="section-header">
                <h2>Nuestros Programas</h2>
                <p>Explora tu talento con nuestra metodología personalizada</p>
            </div>

            <div className="programs-carousel" style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    effect="slide"
                    grabCursor={true}
                    centeredSlides={false}
                    spaceBetween={20}
                    slidesPerView={1}
                    loop={keys.length > 3}
                    speed={600}
                    autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                    navigation={{ nextEl: '.programs-next', prevEl: '.programs-prev' }}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    breakpoints={{
                        480:  { slidesPerView: 1.2, spaceBetween: 15 },
                        768:  { slidesPerView: 2.2, spaceBetween: 20 },
                        1024: { slidesPerView: 3.2, spaceBetween: 20 },
                        1366: { slidesPerView: 4,   spaceBetween: 25 },
                        1600: { slidesPerView: 5,   spaceBetween: 30 }
                    }}
                    className="programs-swiper"
                    style={{ paddingBottom: '40px' }}
                >
                    {keys.map(key => {
                        const p = programs[key];
                        return (
                            <SwiperSlide key={key}>
                                <div
                                    className="about-card-premium"
                                    onClick={() => openProgram(key)}
                                    style={{ backgroundImage: `url(${resolveImageUrl(p.image)})`, cursor: 'pointer' }}
                                >
                                    <div className="about-card-overlay"></div>
                                    <div className="about-card-shine"></div>
                                    <div className="about-card-content">
                                        <i className={`bi ${p.icon} about-card-icon`}></i>
                                        <h3>{p.title}</h3>
                                        <span className="about-card-subtitle">{p.subtitle}</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                <div className="programs-prev"></div>
                <div className="programs-next"></div>
            </div>

            {/* ── Modales ── */}
            {modalStep === 'detail' && (
                <ProgramModal
                    program={selectedProgram}
                    programKey={selectedKey}
                    onEnroll={handleEnroll}
                    onClose={closeAll}
                />
            )}

            {modalStep === 'schedule' && (
                <ScheduleModal
                    program={selectedProgram}
                    onClose={closeAll}
                />
            )}

            {modalStep === 'auth' && (
                <AuthPromptModal
                    program={selectedProgram}
                    programKey={selectedKey}
                    onClose={closeAll}
                />
            )}
        </section>
    );
};

export default Programs;
