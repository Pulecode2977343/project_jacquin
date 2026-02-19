import React, { useEffect, useState } from 'react';

const Hero = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
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
        <section className={`hero-section ${scrolled ? 'scrolled' : ''}`}>
            {/* Imagen de fondo */}
            <div className="hero-bg-wrapper">
                <img
                    src="/images/hero-banner.jpg"
                    alt="Piano de cola — Jacquin Academia Musical"
                    className="hero-bg-img"
                />
            </div>

            <div className="hero-overlay"></div>

            <div className="hero-content">
                {/* Content matches approved design: Tagline + Button only */}

                {/* Tagline en cursiva — Brandbook: "Donde la pasión se convierte en arte" */}
                <p className="hero-tagline">
                    Donde la pasión se convierte en arte
                </p>

                {/* CTA naranja sólido — exacto al mockup del brandbook */}
                <div className="hero-btns">
                    <a href="#programas" className="hero-cta">
                        Descubre Nuestros Programas
                        <i className="bi bi-chevron-down"></i>
                    </a>
                </div>
            </div>

            {/* Indicador de scroll */}
            <div className="hero-scroll-indicator" onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}>
                <div className="mouse">
                    <div className="wheel"></div>
                </div>
                <div>
                    <span className="m-scroll-arrows a1"></span>
                    <span className="m-scroll-arrows a2"></span>
                    <span className="m-scroll-arrows a3"></span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
