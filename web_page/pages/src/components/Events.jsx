import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ApiService from '../services/api';
import Swal from 'sweetalert2';
import useOutsideClick from '../hooks/useOutsideClick';

const TicketModal = ({ event, onClose }) => {
    const session = ApiService.getSession();
    const [formData, setFormData] = useState({
        nombre: session?.full_name || '',
        email: session?.email || '',
        telefono: session?.n_phone || ''
    });
    const [loading, setLoading] = useState(false);
    const modalRef = useOutsideClick(onClose);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre || !formData.email) {
            Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Nombre y correo son obligatorios.', background: '#1a2f48', color: '#fff', confirmButtonColor: '#E78C3B' });
            return;
        }
        setLoading(true);
        try {
            const result = await ApiService.requestTicket({
                id_event: event.id_event,
                id_user: session?.id_usuario || null,
                guest_name: formData.nombre,
                guest_email: formData.email,
                guest_phone: formData.telefono
            });
            if (result.success) {
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: '¡Gracias por tu interés!',
                    text: result.message || 'Nuestro equipo de coordinación pronto se pondrá en contacto contigo.',
                    background: '#1a2f48',
                    color: '#fff',
                    confirmButtonColor: '#E78C3B'
                });
            } else {
                throw new Error(result.message || 'Error al enviar la solicitud.');
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#1a2f48', color: '#fff', confirmButtonColor: '#d33' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                zIndex: 9999, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                padding: '20px'
            }}
        >
            <div
                ref={modalRef}
                style={{
                    background: 'rgba(13,25,38,0.98)',
                    border: '1px solid rgba(147, 182, 238, 0.2)',
                    borderRadius: '16px', padding: '2rem',
                    width: '100%', maxWidth: '480px',
                    boxShadow: '0 28px 72px rgba(0,0,0,0.6)'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ color: '#E78C3B', margin: '0 0 4px', fontSize: '1.1rem' }}>Reservar entrada</h3>
                        <p style={{ color: 'white', margin: 0, fontWeight: 600, fontSize: '1.2rem' }}>{event.title}</p>
                        {event.event_date && (
                            <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontSize: '0.85rem' }}>
                                <i className="bi bi-calendar3" style={{ marginRight: '6px' }}></i>
                                {new Date(event.event_date + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        )}
                        {event.cost > 0 && (
                            <p style={{ color: '#E78C3B', margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 600 }}>
                                <i className="bi bi-ticket-perforated" style={{ marginRight: '6px' }}></i>
                                ${Number(event.cost).toLocaleString('es-CO')} COP
                            </p>
                        )}
                        {(!event.cost || event.cost == 0) && (
                            <p style={{ color: '#2ecc71', margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 600 }}>
                                <i className="bi bi-ticket-perforated" style={{ marginRight: '6px' }}></i>
                                Entrada libre
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.4rem', cursor: 'pointer', padding: '0', lineHeight: 1 }}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Nombre completo *</label>
                        <div className="input-wrapper">
                            <i className="bi bi-person input-icon"></i>
                            <input type="text" name="nombre" className="form-input-glass" placeholder="Tu nombre y apellido" value={formData.nombre} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Correo electrónico *</label>
                        <div className="input-wrapper">
                            <i className="bi bi-envelope input-icon"></i>
                            <input type="email" name="email" className="form-input-glass" placeholder="ejemplo@correo.com" value={formData.email} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Teléfono</label>
                        <div className="input-wrapper">
                            <i className="bi bi-telephone input-icon"></i>
                            <input type="tel" name="telefono" className="form-input-glass" placeholder="+57 300 000 0000" value={formData.telefono} onChange={handleChange} />
                        </div>
                    </div>

                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', margin: '0', textAlign: 'center' }}>
                        Recibirás un correo de confirmación con los siguientes pasos.
                    </p>

                    <button type="submit" className="btn-premium-submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
                        {loading ? 'ENVIANDO...' : 'RESERVAR ENTRADA'}
                        <i className="bi bi-send"></i>
                    </button>
                </form>
            </div>
        </div>
    );
};

const Events = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

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
        <>
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
                                                backgroundImage: `url(${event.image_url ? (
                                                    event.image_url.startsWith('assets/') ||
                                                        event.image_url.startsWith('uploads/') ||
                                                        event.image_url.startsWith('http') ||
                                                        event.image_url.startsWith('data:')
                                                        ? event.image_url
                                                        : (event.image_url.startsWith('uploads') ? event.image_url : 'assets/' + event.image_url.replace(/^\//, ''))
                                                ) : 'assets/images/hero/hero-banner.jpg'})`,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setSelectedEvent(event)}
                                        >
                                            <div className="about-card-overlay"></div>
                                            <div className="about-card-shine"></div>
                                            <div className="about-card-content">
                                                <i className={`bi ${getEventIcon(event.event_type)} about-card-icon`}></i>
                                                <h3>{event.title}</h3>
                                                <span className="about-card-subtitle">{formatDate(event.event_date)}</span>
                                                <span style={{ display: 'block', marginTop: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', background: 'rgba(231,140,59,0.2)', borderRadius: '20px', padding: '3px 10px', border: '1px solid rgba(231,140,59,0.4)' }}>
                                                    <i className="bi bi-ticket-perforated" style={{ marginRight: '5px' }}></i>
                                                    Reservar entrada
                                                </span>
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

            {selectedEvent && (
                <TicketModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                />
            )}
        </>
    );
};

export default Events;
