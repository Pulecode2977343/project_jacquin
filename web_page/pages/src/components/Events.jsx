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
                    const sorted = res.data.sort((a, b) => b.id_event - a.id_event);
                    setEvents(sorted);
                    setFilteredEvents(sorted);
                } else {
                    console.error("Invalid events data format:", res);
                    setError("Formato de datos inválido");
                }
            } catch (err) {
                console.error("Error fetching events:", err);
                setError("Error al cargar eventos");
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        if (!Array.isArray(events)) return;

        const filtered = events.filter(event => {
            if (!event) return false;
            const title = event.title ? String(event.title).toLowerCase() : '';
            const desc = event.description ? String(event.description).toLowerCase() : '';
            const matchesText = title.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());

            const eventType = event.event_type ? String(event.event_type) : '';
            const matchesType = filterType === 'all' || eventType === filterType;
            return matchesText && matchesType;
        });
        setFilteredEvents(filtered);
    }, [searchTerm, filterType, events]);

    const getEventIcon = (type) => {
        const safeType = type ? String(type) : '';
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
            const date = new Date(String(dateStr) + 'T00:00:00');
            return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            return String(dateStr);
        }
    };

    if (loading) return null;

    if (error) {
        return (
            <section id="eventos" className="events-section">
                <div className="container">
                    <div className="alert alert-danger">No se pudieron cargar los eventos.</div>
                </div>
            </section>
        );
    }

    return (
        <section id="eventos" className="events-section">
            <div className="container">
                <div className="section-header">
                    <span className="section-badge ripple">Agenda Cultural</span>
                    <h2 className="section-title">Próximos <span className="text-secondary">Encuentros</span></h2>
                    <div className="event-filters">
                        <div className="search-box">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Buscar evento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">Todos los tipos</option>
                            <option value="concierto">Conciertos</option>
                            <option value="recital">Recitales</option>
                            <option value="taller">Talleres</option>
                            <option value="masterclass">Masterclass</option>
                        </select>
                    </div>
                </div>

                <div className="events-carousel-container">
                    {filteredEvents.length > 0 ? (
                        <>
                            <Swiper
                                modules={[Navigation, Pagination, Autoplay]}
                                spaceBetween={20}
                                slidesPerView={1}
                                loop={filteredEvents.length > 3}
                                autoplay={{ delay: 5000, disableOnInteraction: false }}
                                navigation={{ nextEl: '.events-next', prevEl: '.events-prev' }}
                                pagination={{ clickable: true, dynamicBullets: true }}
                                breakpoints={{
                                    480: { slidesPerView: 1.2 },
                                    768: { slidesPerView: 2.2 },
                                    1024: { slidesPerView: 3.2 },
                                    1366: { slidesPerView: 4 },
                                    1600: { slidesPerView: 5 }
                                }}
                                className="events-swiper"
                            >
                                {filteredEvents.map(event => {
                                    if (!event || typeof event !== 'object') return null;
                                    return (
                                        <SwiperSlide key={event.id_event || Math.random()}>
                                            <div
                                                className="program-card event-card-styled"
                                                onClick={() => window.showEventDetail && window.showEventDetail(event.id_event)}
                                                style={{ backgroundImage: `url(${event.image_url || '/images/hero-banner.jpg'})` }}
                                            >
                                                <div className="program-overlay"></div>
                                                <div className="program-content">
                                                    <div className="program-icon"><i className={`bi ${getEventIcon(event.event_type)}`}></i></div>
                                                    <h3>{String(event.title)}</h3>
                                                    <p>{formatDate(event.event_date)}</p>
                                                    {Number(event.is_featured) === 1 && (
                                                        <div className="featured-badge">
                                                            <i className="bi bi-star-fill"></i>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                            <div className="swiper-button-prev events-prev"></div>
                            <div className="swiper-button-next events-next"></div>
                        </>
                    ) : (
                        <div className="no-events-found">
                            <i className="bi bi-calendar-x"></i>
                            <h4>No se encontraron eventos</h4>
                            <p>Intenta ajustar tus filtros de búsqueda.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Events;
