import { useEffect, useState, useRef, useCallback } from 'react';

const SLIDE_INTERVAL = 7000; // 7 segundos entre slides

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
const SlideMedia = ({ slide, isActive }) => {
    const iframeRef = useRef(null);
    const videoRef = useRef(null);
    const videoInfo = parseVideoUrl(slide.url);

    // Carga perezosa de iframes: solo asigna src cuando el slide es activo
    useEffect(() => {
        if (!iframeRef.current) return;
        if (isActive) {
            const dataSrc = iframeRef.current.getAttribute('data-src');
            if (dataSrc && iframeRef.current.src !== dataSrc) {
                iframeRef.current.src = dataSrc;
            }
        } else {
            // Pausa el video removiendo src al salir
            iframeRef.current.src = '';
        }
    }, [isActive]);

    // Control de video nativo
    useEffect(() => {
        if (!videoRef.current) return;
        if (isActive) {
            videoRef.current.play().catch(() => {});
        } else {
            videoRef.current.pause();
        }
    }, [isActive]);

    if (videoInfo?.type === 'youtube') {
        const embedSrc = `https://www.youtube.com/embed/${videoInfo.id}?autoplay=1&mute=1&loop=1&playlist=${videoInfo.id}&controls=0&rel=0&modestbranding=1&playsinline=1`;
        return (
            <iframe
                ref={iframeRef}
                className="hero-carousel-iframe"
                src=""
                data-src={embedSrc}
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={slide.label || 'Hero video'}
            />
        );
    }

    if (videoInfo?.type === 'gdrive') {
        const embedSrc = `https://drive.google.com/file/d/${videoInfo.id}/preview`;
        return (
            <iframe
                ref={iframeRef}
                className="hero-carousel-iframe"
                src=""
                data-src={embedSrc}
                allow="autoplay"
                allowFullScreen
                title={slide.label || 'Hero video'}
            />
        );
    }

    if (videoInfo?.type === 'vimeo') {
        const embedSrc = `https://player.vimeo.com/video/${videoInfo.id}?autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0`;
        return (
            <iframe
                ref={iframeRef}
                className="hero-carousel-iframe"
                src=""
                data-src={embedSrc}
                allow="autoplay; fullscreen"
                allowFullScreen
                title={slide.label || 'Hero video'}
            />
        );
    }

    if (videoInfo?.type === 'video') {
        return (
            <video
                ref={videoRef}
                className="hero-bg-img"
                src={slide.url}
                muted
                loop
                playsInline
                preload="none"
            />
        );
    }

    // Imagen por defecto
    return (
        <img
            src={slide.url}
            alt={slide.label || 'Jacquin Academia Musical'}
            className="hero-bg-img"
            loading="lazy"
        />
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

    // ── Auto-avance ───────────────────────────────────────────────────────
    useEffect(() => {
        if (slides.length < 2) return;
        timerRef.current = setInterval(nextSlide, SLIDE_INTERVAL);
        return () => clearInterval(timerRef.current);
    }, [nextSlide, slides.length]);

    // ── Scroll + carga de configuración ──────────────────────────────────
    useEffect(() => {
        const handleScroll = () => {
            const heroHeight = document.querySelector('.hero-section')?.offsetHeight || 0;
            setScrolled(window.scrollY > heroHeight * 0.3);
        };
        window.addEventListener('scroll', handleScroll);

        const baseUrl = window.ApiService?.baseUrl || '/api/';
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
                        setSlides(active.slice(0, 4));
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
                                idx === prevIdx   ? 'leaving' : ''
                            ].join(' ')}
                        >
                            <SlideMedia slide={slide} isActive={idx === activeIdx} />
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
