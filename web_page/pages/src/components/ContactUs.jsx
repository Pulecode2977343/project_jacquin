import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';
import Swal from 'sweetalert2';
import BackgroundBubbles from './BackgroundBubbles';
import ContactTrigger from './ContactTrigger';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: '',
        origen: 'internet',
        terms: false,
        privacy: false
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.nombre || !formData.email || !formData.mensaje) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor completa nombre, email y mensaje.',
                background: '#1a2f48',
                color: '#fff',
                confirmButtonColor: '#E78C3B'
            });
            return;
        }

        if (!formData.terms || !formData.privacy) {
            Swal.fire({
                icon: 'warning',
                title: 'Aviso legal',
                text: 'Debes aceptar los términos y la política de privacidad.',
                background: '#1a2f48',
                color: '#fff',
                confirmButtonColor: '#E78C3B'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await ApiService.sendContactMessage({
                nombre: formData.nombre,
                email: formData.email,
                telefono: formData.telefono,
                mensaje: formData.mensaje,
                origen: formData.origen
            });

            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Mensaje Enviado!',
                    text: 'Gracias por contactarnos. Te responderemos pronto.',
                    background: '#1a2f48',
                    color: '#fff',
                    confirmButtonColor: '#E78C3B'
                });
                setFormData({
                    nombre: '',
                    email: '',
                    telefono: '',
                    mensaje: '',
                    origen: 'internet',
                    terms: false,
                    privacy: false
                });
            } else {
                throw new Error(response.message || 'Error al enviar el mensaje.');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo enviar el mensaje. Intenta de nuevo más tarde.',
                background: '#1a2f48',
                color: '#fff',
                confirmButtonColor: '#d33'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="main-login-container" style={{ animation: 'fadeIn 1s ease-out' }}>
            <BackgroundBubbles />
            <section className="login-card" style={{
                maxWidth: '1100px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '50px',
                alignItems: 'stretch',
                padding: '4rem',
                animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>

                {/* Contact Info Side */}
                <div style={{ flex: '1.2', minWidth: '320px', paddingRight: '30px', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
                    <h2 className="login-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>¡Hablemos!</h2>
                    <p style={{ color: 'var(--color-humo-gris)', lineHeight: '1.6', marginBottom: '3rem' }}>
                        Si buscas asistencia experta, nuestro equipo dedicado está preparado para apoyarte en cada paso del camino.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '25px', transition: 'transform 0.3s' }}>
                            <div style={{
                                width: '60px', height: '60px',
                                background: 'rgba(147, 182, 238, 0.1)',
                                border: '1px solid rgba(147, 182, 238, 0.2)',
                                borderRadius: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                            }}>
                                <i className="bi bi-telephone-outbound" style={{ fontSize: '1.6rem', color: '#93b6ee' }}></i>
                            </div>
                            <div>
                                <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Llámanos</p>
                                <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: 500 }}>+57 304 232 8575</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                            <div style={{
                                width: '60px', height: '60px',
                                background: 'rgba(147, 182, 238, 0.1)',
                                border: '1px solid rgba(147, 182, 238, 0.2)',
                                borderRadius: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                            }}>
                                <i className="bi bi-envelope" style={{ fontSize: '1.6rem', color: '#93b6ee' }}></i>
                            </div>
                            <div>
                                <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</p>
                                <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: 500 }}>admin@jacquin.com.co</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                            <ContactTrigger style={{
                                width: '60px', height: '60px',
                                background: 'rgba(37, 211, 102, 0.1)',
                                border: '1px solid rgba(37, 211, 102, 0.2)',
                                borderRadius: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                            }}>
                                <i className="bi bi-whatsapp" style={{ fontSize: '1.6rem', color: '#25D366' }}></i>
                            </ContactTrigger>
                            <div>
                                <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>WhatsApp</p>
                                <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: 500 }}>+57 304 232 8575</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '4rem' }}>
                        <p style={{ color: 'white', marginBottom: '1rem', fontWeight: 600 }}>Síguenos:</p>
                        <div className="social-icons" style={{ justifyContent: 'flex-start', gap: '20px', display: 'flex' }}>
                            <a href="https://www.facebook.com/academiamusicaljacquin" target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '1.5rem', transition: 'color 0.3s' }}><i className="bi bi-facebook"></i></a>
                            <a href="https://www.tiktok.com/@academiamusicaljacquin" target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '1.5rem', transition: 'color 0.3s' }}><i className="bi bi-tiktok"></i></a>
                            <a href="https://www.instagram.com/academiamusicaljacquin" target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '1.5rem', transition: 'color 0.3s' }}><i className="bi bi-instagram"></i></a>
                            <ContactTrigger style={{ color: 'white', fontSize: '1.5rem', transition: 'color 0.3s' }}>
                                <i className="bi bi-whatsapp"></i>
                            </ContactTrigger>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <form onSubmit={handleSubmit} className="contactanos">
                        <div className="form-group">
                            <label>Tu Nombre</label>
                            <div className="input-wrapper">
                                <i className="bi bi-person input-icon"></i>
                                <input
                                    type="text"
                                    name="nombre"
                                    className="form-input-glass"
                                    placeholder="Nombre completo"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Correo Electrónico</label>
                            <div className="input-wrapper">
                                <i className="bi bi-envelope input-icon"></i>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input-glass"
                                    placeholder="ejemplo@correo.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Teléfono</label>
                            <div className="input-wrapper">
                                <i className="bi bi-telephone input-icon"></i>
                                <input
                                    type="tel"
                                    name="telefono"
                                    className="form-input-glass"
                                    placeholder="Número de contacto"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Mensaje</label>
                            <div className="input-wrapper">
                                <i className="bi bi-chat-dots input-icon" style={{ top: '20px' }}></i>
                                <textarea
                                    name="mensaje"
                                    className="form-input-glass"
                                    rows="4"
                                    placeholder="¿Cómo podemos ayudarte?"
                                    value={formData.mensaje}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>¿Cómo nos conociste?</label>
                            <div className="input-wrapper">
                                <i className="bi bi-search input-icon" style={{ top: '50%', transform: 'translateY(-50%)' }}></i>
                                <select
                                    name="origen"
                                    className="form-input-glass"
                                    value={formData.origen}
                                    onChange={handleChange}
                                >
                                    <option value="internet">Búsqueda en internet</option>
                                    <option value="referencia">Referencia de amigo/familiar</option>
                                    <option value="redes">Redes sociales</option>
                                    <option value="otros">Otros</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn-premium-submit" disabled={loading}>
                            {loading ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
                            <i className="bi bi-send"></i>
                        </button>

                        <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--color-humo-gris)' }}>
                            <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="terms"
                                    style={{ marginTop: '3px' }}
                                    checked={formData.terms}
                                    onChange={handleChange}
                                />
                                <span>Acepto los <Link to="/terms" style={{ color: 'var(--color-acento-azul)', textDecoration: 'none' }}>términos y condiciones</Link>.</span>
                            </label>
                            <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="privacy"
                                    style={{ marginTop: '3px' }}
                                    checked={formData.privacy}
                                    onChange={handleChange}
                                />
                                <span>Acepto la <Link to="/politicas" style={{ color: 'var(--color-acento-azul)', textDecoration: 'none' }}>política de datos</Link>.</span>
                            </label>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
};

export default ContactUs;
