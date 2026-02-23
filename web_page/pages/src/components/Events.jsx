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
            const date = new Date(dateStr + 'T00:00:00');
            return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            return String(dateStr);
        }
    };

    if (loading) return null;

    return (
        <section className="events-section" id="eventos">
            <div className="events-intro">
                <h2>Eventos y Presentaciones</h2>
                <p>
                    Descubre nuestros próximos conciertos, recitales y actividades
                    especiales. ¡Únete a la comunidad musical JACQUIN!
                </p>
            </div>

            <div className="events-filters-container">
                <div className="events-search-wrapper">
                    <input
                        type="text"
                        className="events-search-input"
                        placeholder="Buscar evento..."
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
                    <option value="all">Todos los Eventos</option>
                    <option value="concierto">Conciertos</option>
                    <option value="recital">Recitales</option>
                    <option value="taller">Talleres</option>
                    <option value="masterclass">Masterclass</option>
                    <option value="presentacion">Presentaciones</option>
                </select>
            </div>

            <div className="events-carousel-container" style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                {filteredEvents.length > 0 ? (
                    <>
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            effect="slide"
                            grabCursor={true}
                            centeredSlides={false}
                            spaceBetween={20}
                            slidesPerView={1}
                            loop={filteredEvents.length > 3}
                            speed={600}
                            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                            navigation={{
                                nextEl: '.events-next',
                                prevEl: '.events-prev'
                            }}
                            pagination={{ clickable: true, dynamicBullets: true }}
                            breakpoints={{
                                480: { slidesPerView: 1.2, spaceBetween: 15 },
                                768: { slidesPerView: 2.2, spaceBetween: 20 },
                                1024: { slidesPerView: 3.2, spaceBetween: 20 },
                                1366: { slidesPerView: 4, spaceBetween: 25 },
                                1600: { slidesPerView: 5, spaceBetween: 30 }
                            }}
                            className="events-swiper"
                            style={{ paddingBottom: '40px' }}
                        >
                            {filteredEvents.map(event => (
                                <SwiperSlide key={event.id_event || Math.random()}>
                                    <div
                                        className="about-card-premium"
                                        style={{
                                            backgroundImage: `url(${event.image_url ? (event.image_url.startsWith('assets/') || event.image_url.startsWith('http') || event.image_url.startsWith('data:') ? event.image_url : 'assets/' + event.image_url.replace(/^\//, '')) : 'assets/images/hero/hero-banner.jpg'})`
                                        }}
                                        onClick={() => window.open(`https://wa.me/573042328575?text=Información sobre el evento: ${event.title}`, '_blank')}
                                    >
                                        <div className="about-card-overlay"></div>
                                        <div className="about-card-shine"></div>
                                        <div className="about-card-content">
                                            <i className={`bi ${getEventIcon(event.event_type)} about-card-icon`}></i>
                                            <h3>{event.title}</h3>
                                            <span className="about-card-subtitle">{formatDate(event.event_date)}</span>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <div className="events-prev"></div>
                        <div className="events-next"></div>
                    </>
                ) : (
                    <div className="no-events">
                        <i className="bi bi-calendar-x"></i>
                        <h4>No hay eventos encontrados</h4>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Events;
