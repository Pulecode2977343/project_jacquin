import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

// Datos estáticos de respaldo por si la API falla o está vacía
const STATIC_CARDS = [
    {
        id_card: 'static-1',
        title: "Historia",
        subtitle: "Nuestra Trayectoria",
        icon: "bi-hourglass-split",
        image_url: "assets/images/about/historia.jpg",
        description: "Desde nuestros inicios, hemos formado a cientos de músicos con pasión y excelencia."
    },
    {
        id_card: 'static-2',
        title: "Metodología",
        subtitle: "Enfoque Único",
        icon: "bi-mortarboard",
        image_url: "assets/images/about/metodologia.jpg",
        description: "Combina técnica clásica con pedagogía moderna para un aprendizaje integral."
    },
    {
        id_card: 'static-3',
        title: "Instalaciones",
        subtitle: "Espacios Creativos",
        icon: "bi-building",
        image_url: "assets/images/about/instalaciones.jpg",
        description: "Salas equipadas con instrumentos de primera calidad para inspirar tu arte."
    },
    {
        id_card: 'static-4',
        title: "Equipo",
        subtitle: "Maestros Expertos",
        icon: "bi-people",
        image_url: "assets/images/about/equipo.jpg",
        description: "Músicos profesionales dedicados a guiar tu desarrollo artístico."
    }
];

const STATIC_MISSION = {
    title: "Misión y Visión",
    description: "Formar músicos integrales con valores éticos y estéticos, capaces de impactar positivamente en la sociedad a través de su arte."
};

const STATIC_VALUES = [
    { title: "Excelencia", color: "#223F61" },
    { title: "Pasión", color: "#E78C3B" },
    { title: "Disciplina", color: "#223F61" },
    { title: "Creatividad", color: "#E78C3B" }
];

const About = () => {
    const [activeModal, setActiveModal] = useState(null);
    const [cards, setCards] = useState(STATIC_CARDS);
    const [mission, setMission] = useState(STATIC_MISSION);
    const [values, setValues] = useState(STATIC_VALUES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cardsRes, missionRes] = await Promise.all([
                    ApiService.getAboutCards(),
                    ApiService.getMissionValues()
                ]);

                if (cardsRes.success && Array.isArray(cardsRes.data) && cardsRes.data.length > 0) {
                    setCards(cardsRes.data);
                }

                if (missionRes.success && missionRes.data) {
                    if (missionRes.data.mission) {
                        setMission(missionRes.data.mission);
                    }
                    if (Array.isArray(missionRes.data.values) && missionRes.data.values.length > 0) {
                        setValues(missionRes.data.values);
                    }
                }
            } catch (error) {
                console.error("Error loading About data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const openModal = (card) => {
        setActiveModal(card);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setActiveModal(null);
        document.body.style.overflow = 'auto';
    };

    // Helper para manejar URLs de imágenes (API vs Local)
    const getImageUrl = (url) => {
        if (!url) return 'assets/images/hero/hero-banner.jpg'; // Fallback centralizado

        // Si ya es una URL absoluta o ya usa la nueva ruta de assets, dejarla igual
        if (url.startsWith('http') || url.startsWith('assets/')) return url;

        // Si usa la ruta antigua "images/", redirigir a "assets/images/"
        if (url.startsWith('images/')) return 'assets/' + url;

        // Si viene del backend (uploads), construir ruta relativa o absoluta según config
        if (url.includes('uploads/') || !url.includes('/')) {
            // Si no tiene barras, asumimos que es el nombre de archivo en uploads
            // o si explícitamente dice uploads
            return `jacquin_api/${url}`;
        }

        return url;
    };

    return (
        <section id="nosotros" className="about-section">
            <div className="about-hero">
                <h2>Nuestra Academia</h2>
                <p>
                    En Jacquin Academia Musical, creemos que la música es un lenguaje universal
                    que transforma vidas. Nuestro compromiso es brindar una educación de excelencia
                    en un ambiente inspirador.
                </p>
            </div>

            <div className="about-content">
                {cards.map((card) => (
                    <div
                        key={card.id_card || card.id}
                        className="about-card-premium"
                        style={{ backgroundImage: `url(${getImageUrl(card.image_url)})` }}
                        onClick={() => openModal(card)}
                    >
                        <div className="about-card-overlay"></div>
                        <div className="about-card-shine"></div>

                        <div className="about-card-content">
                            <i className={`bi ${card.icon || 'bi-star'} about-card-icon`}></i>
                            <h3>{card.title}</h3>
                            <span className="about-card-subtitle">{card.subtitle}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Overlay */}
            {activeModal && (
                <div className={`about-modal-overlay ${activeModal ? 'active' : ''}`} style={{ opacity: 1, pointerEvents: 'all' }}>
                    <div className="about-modal" style={{ transform: 'scale(1)' }}>
                        <button className="about-modal-close" onClick={closeModal}>
                            <i className="bi bi-x"></i>
                        </button>

                        <div className="about-modal-image-container">
                            <img src={getImageUrl(activeModal.image_url)} alt={activeModal.title} />
                        </div>

                        <div className="about-modal-content">
                            <div className="about-modal-header">
                                <i className={`bi ${activeModal.icon || 'bi-star'}`}></i>
                                <div>
                                    <h2>{activeModal.title}</h2>
                                    <span className="about-modal-subtitle">{activeModal.subtitle}</span>
                                </div>
                            </div>
                            <p className="about-modal-description">
                                {activeModal.description}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Mission & Vision Section (Dynamic) */}
            <div className="mission-vision">
                <h2>{mission.title || "Misión y Visión"}</h2>
                <p>
                    {mission.description}
                </p>

                <div className="values-grid">
                    {values.map((val, index) => (
                        <div
                            key={index}
                            className="value-item"
                            style={{
                                background: val.image_url ? `url(${getImageUrl(val.image_url)}) center/cover` : (val.color || (index % 2 === 0 ? '#223F61' : '#E78C3B'))
                            }}
                        >
                            <div className="value-item-overlay"></div>
                            <div className="team-card-info" style={{ zIndex: 2, padding: '20px', width: '100%' }}>
                                {val.icon && <i className={`bi ${val.icon}`} style={{ fontSize: '2rem', color: 'white', marginBottom: '10px', display: 'block' }}></i>}
                                <h4>{val.title}</h4>
                                {val.description && <p style={{ fontSize: '0.8rem', color: '#ddd', marginTop: '5px' }}>{val.description.substring(0, 60)}...</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default About;
