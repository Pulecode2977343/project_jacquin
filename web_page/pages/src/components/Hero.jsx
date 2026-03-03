import { useEffect, useState, useRef, useCallback } from 'react';

const SLIDE_INTERVAL = 7000; // 7 segundos entre slides (si no hay video con volumen activado)

// ─── Utilidad: detectar tipo de media ───────────────────────────────────────
const parseVideoUrl = (url) => {
    if (!url) return null;
    // YouTube: watch?v=, youtu.be/, embed/
    const ytMatch = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) return { type: 'youtube', id: ytMatch[1] };
    // Google Drive: drive.google.com/file/d/{id}/...
    const gdMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (gdMatch) return { type: 'gdrive', id: gdMatch[1] };
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1] };
    // Archivo de video directo
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return { type: 'video', src: url };
    return null;
};

// ─── Componente de media para cada slide ────────────────────────────────────
const SlideMedia = ({ slide, isActive, onVolumeChange }) => {
    const iframeRef = useRef(null);
    const videoRef = useRef(null);
    const [muted, setMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState("0:00");
    const [duration, setDuration] = useState("0:00");

    const videoInfo = parseVideoUrl(slide.url);
    const isLive = slide.is_live === true;

    // Carga perezosa de iframes
    useEffect(() => {
        if (!iframeRef.current) return;
        if (isActive) {
            const dataSrc = iframeRef.current.getAttribute('data-src');
            if (dataSrc && iframeRef.current.src !== dataSrc) {
                iframeRef.current.src = dataSrc;
            }
        } else {
            iframeRef.current.src = '';
        }
    }, [isActive]);

    // Control de video nativo y barra de progreso
    useEffect(() => {
        if (!videoRef.current) return;
        if (isActive) {
            videoRef.current.play().catch(() => { });
        } else {
            videoRef.current.pause();
        }
    }, [isActive]);

    // Actualizar progreso
    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const cur = videoRef.current.currentTime;
        const dur = videoRef.current.duration;
        setProgress((cur / dur) * 100);

        const format = (s) => {
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return `${m}:${sec < 10 ? '0' : ''}${sec}`;
        };
        setCurrentTime(format(cur));
        setDuration(dur ? format(dur) : "0:00");
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        const newState = !videoRef.current.muted;
        videoRef.current.muted = newState;
        setMuted(newState);
        // Notificar si volumen fue activado (unmuted)
        if (!newState && onVolumeChange) {
            onVolumeChange(true);
        }
    };

    const handleSeek = (e) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        const newTime = (e.target.value / 100) * videoRef.current.duration;
        videoRef.current.currentTime = newTime;
        setProgress(e.target.value);
    };

    const handleVolume = (e) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        const vol = parseFloat(e.target.value);
        videoRef.current.volume = vol;
        videoRef.current.muted = vol === 0;
        setMuted(vol === 0);
        // Notificar si volumen fue activado (vol > 0)
        if (vol > 0 && onVolumeChange) {
            onVolumeChange(true);
        }
    };

    const isVideoType = videoInfo?.type === 'video';

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {isLive && (
                <div className="hero-live-badge">
                    <span className="bt-dot"></span> EN VIVO
                </div>
            )}

            {videoInfo?.type === 'youtube' && (
                <iframe
                    ref={iframeRef}
                    className="hero-carousel-iframe"
                    src=""
                    data-src={`https://www.youtube.com/embed/${videoInfo.id}?autoplay=1&mute=1&loop=1&playlist=${videoInfo.id}&controls=0&rel=0&modestbranding=1&playsinline=1`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={slide.label || 'Hero video'}
                />
            )}

            {videoInfo?.type === 'gdrive' && (
                <iframe
                    ref={iframeRef}
                    className="hero-carousel-iframe"
                    src=""
                    data-src={`https://drive.google.com/file/d/${videoInfo.id}/preview`}
                    allow="autoplay"
                    allowFullScreen
                    title={slide.label || 'Hero video'}
                />
            )}

            {videoInfo?.type === 'vimeo' && (
                <iframe
                    ref={iframeRef}
                    className="hero-carousel-iframe"
                    src=""
                    data-src={`https://player.vimeo.com/video/${videoInfo.id}?autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0`}
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    title={slide.label || 'Hero video'}
                />
            )}

            {isVideoType && (
                <>
                    <video
                        ref={videoRef}
                        className="hero-bg-img"
                        src={slide.url}
                        muted={muted}
                        loop
                        playsInline
                        preload="auto"
                        onTimeUpdate={handleTimeUpdate}
                    />
                    {/* Controles para video nativo */}
                    {isActive && (
                        <div className="hero-video-controls" onClick={e => e.stopPropagation()}>
                            <input
                                type="range"
                                className="hero-ctrl-seek-bar"
                                value={progress || 0}
                                onChange={handleSeek}
                            />
                            <div className="hero-ctrl-bottom">
                                <div className="hero-ctrl-volume">
                                    <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.1rem' }}>
                                        <i className={`bi bi-volume-${muted ? 'mute' : 'up'}-fill`}></i>
                                    </button>
                                    <input
                                        type="range"
                                        className="hero-ctrl-vol-slider"
                                        min="0" max="1" step="0.1"
                                        defaultValue={muted ? 0 : 0.25}
                                        onChange={handleVolume}
                                    />
                                </div>
                                <div className="hero-ctrl-time">
                                    {currentTime} / {duration}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {!videoInfo && (
                <img
                    src={slide.url}
                    alt={slide.label || 'Jacquin Academia Musical'}
                    className="hero-bg-img"
                    loading="lazy"
                />
            )}
        </div>
    );
};

// ─── Componente principal Hero ───────────────────────────────────────────────
const Hero = () => {
    const [scrolled, setScrolled] = useState(false);
    const [config, setConfig] = useState({
        hero_tagline: "Donde la pasión se convierte en arte",
        hero_cta_text: "Descubre Nuestros Programas"
    });
    const [slides, setSlides] = useState([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [prevIdx, setPrevIdx] = useState(null);
    const [transitioning, setTransitioning] = useState(false);
    const [volumeActivated, setVolumeActivated] = useState(false);
    const timerRef = useRef(null);

    // ── Navegación de slides ──────────────────────────────────────────────
    const goToSlide = useCallback((idx) => {
        if (transitioning) return;
        setTransitioning(true);
        setPrevIdx(prev => prev === null ? activeIdx : prev);
        setActiveIdx(idx);
        setTimeout(() => {
            setPrevIdx(null);
            setTransitioning(false);
        }, 750);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeIdx, transitioning]);

    const nextSlide = useCallback(() => {
        if (slides.length < 2) return;
        goToSlide((activeIdx + 1) % slides.length);
    }, [activeIdx, slides.length, goToSlide]);

    const prevSlide = useCallback(() => {
        if (slides.length < 2) return;
        goToSlide((activeIdx - 1 + slides.length) % slides.length);
    }, [activeIdx, slides.length, goToSlide]);

    // ── Resetear estado de volumen al cambiar slide ───────────────────────
    useEffect(() => {
        setVolumeActivated(false);
    }, [activeIdx]);

    // ── Auto-avance ───────────────────────────────────────────────────────
    useEffect(() => {
        if (slides.length < 2) return;

        const currentSlide = slides[activeIdx];
        const isVideoWithVolumeOn = currentSlide && !currentSlide.is_live && volumeActivated;

        // No avanzar si:
        // 1. El slide es un Live Stream
        // 2. Es un video con volumen activado por el usuario
        if (currentSlide?.is_live || isVideoWithVolumeOn) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = setInterval(nextSlide, SLIDE_INTERVAL);
        return () => clearInterval(timerRef.current);
    }, [nextSlide, slides.length, activeIdx, slides, volumeActivated]);

    // ── Scroll + carga de configuración ──────────────────────────────────
    useEffect(() => {
        const handleScroll = () => {
            const heroHeight = document.querySelector('.hero-section')?.offsetHeight || 0;
            setScrolled(window.scrollY > heroHeight * 0.3);
        };
        window.addEventListener('scroll', handleScroll);

        const baseUrl = window.ApiService?.baseUrl || '/jacquin_api/';
        fetch(`${baseUrl}site_config.php`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setConfig({
                        hero_tagline: data.hero_tagline || "Donde la pasión se convierte en arte",
                        hero_cta_text: data.hero_cta_text || "Descubre Nuestros Programas"
                    });
                    if (Array.isArray(data.hero_slides)) {
                        const active = data.hero_slides.filter(s => s.active && s.url);
                        setSlides(active.slice(0, 5));
                    }
                }
            })
            .catch(err => console.error("Error fetching hero config:", err));

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // ── Render ─────────────────────────────────────────────────────────────
    const hasCarousel = slides.length > 0;

    return (
        <section id="hero" className={`hero-section ${scrolled ? 'scrolled' : ''}`}>

            {/* Fondo: carrusel o imagen estática de respaldo */}
            {hasCarousel ? (
                <div className="hero-carousel-track">
                    {slides.map((slide, idx) => (
                        <div
                            key={idx}
                            className={[
                                'hero-carousel-slide',
                                idx === activeIdx ? 'active' : '',
                                idx === prevIdx ? 'leaving' : ''
                            ].join(' ')}
                        >
                            <SlideMedia slide={slide} isActive={idx === activeIdx} onVolumeChange={setVolumeActivated} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="hero-bg-wrapper">
                    <img
                        src="/assets/images/hero/hero-banner.jpg"
                        alt="Piano de cola — Jacquin Academia Musical"
                        className="hero-bg-img"
                    />
                </div>
            )}

            <div className="hero-overlay"></div>

            {/* Contenido principal — estático sobre el carrusel */}
            <div className="hero-content">
                {/* Tagline: cambia por slide, re-anima con key */}
                {/* Tagline: solo muestra si hay texto (por slide o global en modo estático) */}
                {(() => {
                    const text = hasCarousel
                        ? (slides[activeIdx]?.label || '')
                        : config.hero_tagline;
                    return text
                        ? <p key={`tagline-${activeIdx}`} className="hero-tagline hero-tagline-animated">{text}</p>
                        : null;
                })()}

                {/* CTA: siempre el mismo, configurable globalmente */}
                <a href="#programas" className="hero-cta">
                    {config.hero_cta_text}
                    <i className="bi bi-arrow-down"></i>
                </a>
            </div>

            {/* Controles del carrusel (solo si hay >1 slide) */}
            {slides.length > 1 && (
                <>
                    <button
                        className="hero-carousel-btn hero-carousel-prev"
                        onClick={prevSlide}
                        aria-label="Slide anterior"
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>
                    <button
                        className="hero-carousel-btn hero-carousel-next"
                        onClick={nextSlide}
                        aria-label="Siguiente slide"
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>
                    <div className="hero-carousel-dots">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                className={`hero-dot ${idx === activeIdx ? 'active' : ''}`}
                                onClick={() => goToSlide(idx)}
                                aria-label={`Slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Indicador de scroll */}
            <div
                className="hero-scroll-indicator"
                onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
            >
                <i className="bi bi-mouse"></i>
                <div className="scroll-arrows">
                    <span className="bi bi-chevron-compact-down"></span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
