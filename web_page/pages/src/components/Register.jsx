import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ApiService from '../services/api';
import BackgroundBubbles from './BackgroundBubbles';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        idCourse: ''
    });
    const [courses, setCourses] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showLoginHint, setShowLoginHint] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        ApiService.getCourses()
            .then(res => {
                if (res.success && res.data) {
                    setCourses(res.data);
                    // Preseleccionar curso si viene de la sección de programas
                    const pendingTitle = sessionStorage.getItem('pending_enrollment_title');
                    if (pendingTitle) {
                        const match = res.data.find(c =>
                            c.course_name.toLowerCase().includes(pendingTitle.toLowerCase()) ||
                            pendingTitle.toLowerCase().includes(c.course_name.toLowerCase())
                        );
                        if (match) {
                            setFormData(prev => ({ ...prev, idCourse: String(match.id_course) }));
                        }
                    }
                }
            })
            .catch(() => { });
    }, []);

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
            const result = await ApiService.register({
                fullName: formData.fullName,
                email: formData.email,
                nPhone: formData.phone,
                password: formData.password,
                idCourse: formData.idCourse ? Number(formData.idCourse) : null
            });

            if (result.success) {
                setMessage('¡Registro exitoso! Redirigiendo al login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                const msg = result.message || 'Error en el registro';
                setMessage(msg);
                setIsError(true);
                // Si el correo ya existe, ofrecer ir al login
                if (msg.includes('ya está registrado') || msg.includes('ya registrado') || msg.includes('email')) {
                    setShowLoginHint(true);
                }
            }
        } catch (error) {
            setMessage('Error de conexión');
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="main-login-container" style={{ animation: 'fadeIn 1s ease-out' }}>
            <BackgroundBubbles />
            <section className="login-card" style={{ maxWidth: '650px', transform: 'scale(0.95)', animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
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
                        <label htmlFor="idCourse">Curso de Interés</label>
                        <div className="input-wrapper">
                            <i className="bi bi-music-note-beamed input-icon"></i>
                            <select
                                id="idCourse"
                                name="idCourse"
                                className="form-input-glass"
                                value={formData.idCourse}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecciona un curso</option>
                                {courses.map(c => (
                                    <option key={c.id_course} value={c.id_course}>
                                        {c.course_name}
                                    </option>
                                ))}
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
                                Acepto la <Link to="/politicas">Política de Tratamiento de Datos</Link>.
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

                    {showLoginHint && (
                        <p style={{ textAlign: 'center', marginTop: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" style={{ color: 'var(--color-acento-naranja)', fontWeight: 'bold' }}>
                                Inicia sesión aquí
                            </Link>
                            {sessionStorage.getItem('pending_enrollment') && ' para continuar con tu inscripción.'}
                        </p>
                    )}
                </form>
            </section>
        </main>
    );
};

export default Register;
