import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ApiService from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        course: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('Procesando registro...');
        setIsError(false);

        try {
            // Nota: Aquí se asume que ApiService tiene un método register similar al login
            const result = await ApiService.register({
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                course: formData.course
            });

            if (result.success) {
                setMessage('¡Registro exitoso! Redirigiendo al login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setMessage(result.message || 'Error en el registro');
                setIsError(true);
            }
        } catch (error) {
            setMessage('Error de conexión');
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="main-login-container">
            <section className="login-card" style={{ maxWidth: '600px' }}>
                <h1 className="login-title">Inscripción Aspirante</h1>

                <form onSubmit={handleSubmit} id="register-form">
                    <div className="form-group">
                        <label htmlFor="fullName">Nombre Completo</label>
                        <div className="input-wrapper">
                            <i className="bi bi-person input-icon"></i>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                className="form-input-glass"
                                placeholder="Escribe tu nombre y apellido"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <div className="input-wrapper">
                            <i className="bi bi-envelope input-icon"></i>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input-glass"
                                placeholder="ejemplo@correo.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Número de Teléfono</label>
                        <div className="input-wrapper">
                            <i className="bi bi-telephone input-icon"></i>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                className="form-input-glass"
                                placeholder="+57 318 888 8888"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="input-wrapper">
                            <i className="bi bi-lock input-icon"></i>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className="form-input-glass"
                                placeholder="Crea una contraseña segura"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <i
                                className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'} toggle-password`}
                                onClick={() => setShowPassword(!showPassword)}
                            ></i>
                        </div>
                        <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: '5px', display: 'block', paddingLeft: '10px' }}>
                            Mínimo 8 caracteres, una mayúscula, un número y un símbolo.
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="course">Curso de Interés</label>
                        <div className="input-wrapper">
                            <i className="bi bi-music-note-beamed input-icon"></i>
                            <select
                                id="course"
                                name="course"
                                className="form-input-glass"
                                value={formData.course}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecciona un curso</option>
                                <option value="percusión">Percusión</option>
                                <option value="guitarra">Guitarra (Acústica y Eléctrica)</option>
                                <option value="piano">Piano (Clásico y Moderno)</option>
                                <option value="voz">Voz (Técnica Vocal)</option>
                                <option value="seniors">Senior's (Adulto Mayor)</option>
                                <option value="shows">Shows (Presentaciones en Vivo)</option>
                                <option value="exploración">Exploración (Iniciación Musical)</option>
                                <option value="psicomúsica">Psicomúsica (Bienestar y Terapia)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-footer" style={{ textAlign: 'left', padding: '0 10px' }}>
                        <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px', cursor: 'pointer' }}>
                            <input type="checkbox" required style={{ marginTop: '3px' }} />
                            <span style={{ color: 'var(--color-humo-gris)', fontSize: '0.9rem' }}>
                                He leído y acepto los <Link to="/terms">Términos y Condiciones</Link>.
                            </span>
                        </label>
                        <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                            <input type="checkbox" required style={{ marginTop: '3px' }} />
                            <span style={{ color: 'var(--color-humo-gris)', fontSize: '0.9rem' }}>
                                Acepto la <Link to="/policy">Política de Tratamiento de Datos</Link>.
                            </span>
                        </label>
                    </div>

                    <button type="submit" className="btn-premium-submit" disabled={isLoading}>
                        {isLoading ? 'ENVIANDO...' : 'ENVIAR REGISTRO'}
                        <i className="bi bi-send"></i>
                    </button>

                    <p id="mensaje-respuesta" style={{ color: isError ? 'var(--color-acento-naranja)' : '#2ecc71', textAlign: 'center', marginTop: '15px' }}>
                        {message}
                    </p>
                </form>
            </section>
        </main>
    );
};

export default Register;
