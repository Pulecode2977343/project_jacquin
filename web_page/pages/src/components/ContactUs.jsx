import React, { useState } from 'react';
import ApiService from '../services/api';
import Swal from 'sweetalert2';

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
        <main className="main-login-container">
            <section className="login-card" style={{ maxWidth: '1000px', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'stretch', padding: '4rem' }}>

                {/* Contact Info Side */}
                <div style={{ flex: '1', minWidth: '300px', paddingRight: '20px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2 className="login-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>¡Hablemos!</h2>
                    <p style={{ color: 'var(--color-humo-gris)', lineHeight: '1.6', marginBottom: '3rem' }}>
                        Si buscas asistencia experta, nuestro equipo dedicado está preparado para apoyarte en cada paso del camino.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '50px', height: '50px', background: 'rgba(147, 182, 238, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="bi bi-telephone-outbound" style={{ fontSize: '1.5rem', color: 'var(--color-acento-azul)' }}></i>
                            </div>
                            <div>
                                <p style={{ color: 'white', margin: 0, fontWeight: 600 }}>Llámanos</p>
                                <span style={{ color: 'var(--color-humo-gris)' }}>+57 304 232 8575</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '50px', height: '50px', background: 'rgba(147, 182, 238, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="bi bi-envelope" style={{ fontSize: '1.5rem', color: 'var(--color-acento-azul)' }}></i>
                            </div>
                            <div>
                                <p style={{ color: 'white', margin: 0, fontWeight: 600 }}>Email</p>
                                <span style={{ color: 'var(--color-humo-gris)' }}>adminadmin@jacquin.com.co</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '50px', height: '50px', background: 'rgba(147, 182, 238, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="bi bi-whatsapp" style={{ fontSize: '1.5rem', color: 'var(--color-acento-azul)' }}></i>
                            </div>
                            <div>
                                <p style={{ color: 'white', margin: 0, fontWeight: 600 }}>WhatsApp</p>
                                <span style={{ color: 'var(--color-humo-gris)' }}>+57 304 232 8575</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '4rem' }}>
                        <p style={{ color: 'white', marginBottom: '1rem', fontWeight: 600 }}>Síguenos:</p>
                        <div className="social-icons" style={{ justifyContent: 'flex-start', gap: '20px', display: 'flex' }}>
                            <a href="#" style={{ color: 'white', fontSize: '1.5rem', transition: 'color 0.3s' }}><i className="bi bi-facebook"></i></a>
                            <a href="#" style={{ color: 'white', fontSize: '1.5rem', transition: 'color 0.3s' }}><i className="bi bi-tiktok"></i></a>
                            <a href="#" style={{ color: 'white', fontSize: '1.5rem', transition: 'color 0.3s' }}><i className="bi bi-twitter-x"></i></a>
                            <a href="#" style={{ color: 'white', fontSize: '1.5rem', transition: 'color 0.3s' }}><i className="bi bi-instagram"></i></a>
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
                                <span>Acepto los <a href="/terminos" target="_blank" rel="noreferrer" style={{ color: 'var(--color-acento-azul)', textDecoration: 'none' }}>términos y condiciones</a>.</span>
                            </label>
                            <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="privacy"
                                    style={{ marginTop: '3px' }}
                                    checked={formData.privacy}
                                    onChange={handleChange}
                                />
                                <span>Acepto la <a href="/politicas" target="_blank" rel="noreferrer" style={{ color: 'var(--color-acento-azul)', textDecoration: 'none' }}>política de datos</a>.</span>
                            </label>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
};

export default ContactUs;
