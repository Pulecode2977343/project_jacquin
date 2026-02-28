import React, { useEffect, useState } from 'react';

const Hero = () => {
    const [scrolled, setScrolled] = useState(false);
    const [config, setConfig] = useState({
        hero_tagline: "Donde la pasión se convierte en arte",
        hero_cta_text: "Descubre Nuestros Programas"
    });

    useEffect(() => {
        // Fetch site config
        const fetchConfig = async () => {
            try {
                const response = await fetch(`${window.ApiService.baseUrl}site_config.php`);
                const data = await response.json();
                if (data.success) {
                    setConfig({
                        hero_tagline: data.hero_tagline,
                        hero_cta_text: data.hero_cta_text
                    });
                }
            } catch (error) {
                console.error("Error fetching hero config:", error);
            }
        };
        fetchConfig();

        const handleScroll = () => {
            const heroHeight = document.querySelector('.hero-section')?.offsetHeight || 0;
            if (window.scrollY > heroHeight * 0.3) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section id="hero" className={`hero-section ${scrolled ? 'scrolled' : ''}`}>
            {/* Imagen de fondo */}
            <div className="hero-bg-wrapper">
                <img
                    src="/assets/images/hero/hero-banner.jpg"
                    alt="Piano de cola — Jacquin Academia Musical"
                    className="hero-bg-img"
                />
            </div>

            <div className="hero-overlay"></div>

            <div className="hero-content">
                {/* Tagline dinámico */}
                <p className="hero-tagline">
                    {config.hero_tagline}
                </p>

                {/* CTA dinámico */}
                <a href="#programas" className="hero-cta">
                    {config.hero_cta_text}
                    <i className="bi bi-arrow-down"></i>
                </a>
            </div>

            {/* Indicador de scroll */}
            <div className="hero-scroll-indicator" onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}>
                <i className="bi bi-mouse"></i>
                <div className="scroll-arrows">
                    <span className="bi bi-chevron-compact-down"></span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
