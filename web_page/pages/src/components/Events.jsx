import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ApiService from '../services/api';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await ApiService.getEvents();
                if (res.success && Array.isArray(res.data)) {
                    // Ordenar por fecha o ID descendente
                    const sorted = res.data.sort((a, b) => b.id_event - a.id_event);
                    setEvents(sorted);
                    // No seteamos filteredEvents aquí, dejamos que el useEffect de filtrado lo haga
                } else {
                    console.error("Formato de eventos inválido:", res);
                    setError("No se pudieron cargar los eventos.");
                }
            } catch (err) {
                console.error("Error cargando eventos:", err);
                setError("Error de conexión al cargar eventos.");
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Efecto para filtrar
    useEffect(() => {
        if (!Array.isArray(events)) return;

        const filtered = events.filter(event => {
            if (!event) return false;
            const title = event.title ? String(event.title).toLowerCase() : '';
            const desc = event.description ? String(event.description).toLowerCase() : '';
            const matchesText = title.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());

            const eventType = event.event_type ? String(event.event_type).toLowerCase() : '';
            const matchesType = filterType === 'all' || eventType === filterType.toLowerCase();

            return matchesText && matchesType;
        });
        setFilteredEvents(filtered);
    }, [searchTerm, filterType, events]);

    const getEventIcon = (type) => {
        const safeType = type ? String(type).toLowerCase() : '';
        const icons = {
            'concierto': 'bi-music-note-beamed',
            'recital': 'bi-mic',
            'taller': 'bi-tools',
            'masterclass': 'bi-easel',
            'presentacion': 'bi-people',
            'otro': 'bi-calendar-event'
        };
        return icons[safeType] || 'bi-calendar-event';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Próximamente';
        try {
            // Fix timezone issue by appending time if needed or handling as string
            const date = new Date(dateStr);
            return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
        } catch (e) {
            return String(dateStr);
        }
    };

    if (loading) return null; // O un spinner

    if (error && events.length === 0) {
        return (
            <section id="eventos" className="events-section">
                <div className="container">
                    <div className="events-intro">
                        <h2 className="section-title">Agenda Cultural</h2>
                        <div className="alert alert-warning">{error}</div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="eventos" className="events-section">
            <div className="events-intro">
                <span className="section-badge ripple" style={{ display: 'inline-block', marginBottom: '10px' }}>Agenda Cultural</span>
                <h2>Próximos <span style={{ color: 'var(--color-acento-azul)' }}>Encuentros</span></h2>
                <p>Descubre los conciertos, recitales y talleres que tenemos preparados para ti.</p>
            </div>

            {/* Filtros corregidos con clases de events.css */}
            <div className="events-filters-container">
                <div className="events-search-wrapper">
                    <input
                        type="text"
                        className="events-search-input"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <i className="bi bi-search events-search-icon"></i>
                </div>

                <select
                    className="events-filter-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="all">Todos los eventos</option>
                    <option value="concierto">Conciertos</option>
                    <option value="recital">Recitales</option>
                    <option value="taller">Talleres</option>
                    <option value="masterclass">Masterclass</option>
                </select>
            </div>

            <div className="events-carousel-container" style={{ position: 'relative', padding: '0 50px' }}>
                {filteredEvents.length > 0 ? (
                    <>
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={25}
                            slidesPerView={1}
                            loop={filteredEvents.length > 3}
                            autoplay={{ delay: 5000, disableOnInteraction: false }}
                            navigation={{
                                nextEl: '.events-swiper-button-next',
                                prevEl: '.events-swiper-button-prev'
                            }}
                            pagination={{ clickable: true, dynamicBullets: true }}
                            breakpoints={{
                                640: { slidesPerView: 1 },
                                768: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 },
                                1280: { slidesPerView: 4 }
                            }}
                            className="events-swiper"
                            style={{ paddingBottom: '40px' }}
                        >
                            {filteredEvents.map(event => (
                                <SwiperSlide key={event.id_event || Math.random()}>
                                    <div
                                        className="event-card"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => window.open(`https://wa.me/573001234567?text=Info sobre evento: ${event.title}`, '_blank')}
                                    >
                                        <div className="event-date">{formatDate(event.event_date)}</div>
                                        <h3>{event.title}</h3>
                                        <p>{event.description ? event.description.substring(0, 80) + '...' : 'Sin descripción'}</p>

                                        <div className="event-details">
                                            <div className="event-detail-item">
                                                <i className={`bi ${getEventIcon(event.event_type)}`}></i>
                                                <span>{event.event_type || 'Evento'}</span>
                                            </div>
                                            {event.location && (
                                                <div className="event-detail-item">
                                                    <i className="bi bi-geo-alt"></i>
                                                    <span>{event.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        {Number(event.is_active) === 1 && (
                                            <div style={{ marginTop: '15px', color: 'var(--verde-neon)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                <i className="bi bi-check-circle-fill"></i> Disponible
                                            </div>
                                        )}
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Botones de navegación personalizados y posicionados absolutamente */}
                        <div className="swiper-button-prev events-swiper-button-prev" style={{ color: 'var(--color-acento-naranja)', left: '0' }}></div>
                        <div className="swiper-button-next events-swiper-button-next" style={{ color: 'var(--color-acento-naranja)', right: '0' }}></div>
                    </>
                ) : (
                    <div className="no-events">
                        <i className="bi bi-calendar-x"></i>
                        <h4>No hay eventos encontrados</h4>
                        <p>Intenta con otros términos de búsqueda.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Events;
