import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ApiService from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        if (query.get('error') === 'session_expired') {
            setMessage('Tu sesión ha expirado por inactividad. Por favor ingresa de nuevo.');
            setIsError(true);
        } else if (ApiService.isAuthenticated()) {
            window.location.href = 'gestion.html';
        }
    }, [navigate, location.search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('Procesando...');
        setIsError(false);

        try {
            const result = await ApiService.login(email, password);
            if (result.success) {
                setMessage('¡Bienvenido!');
                ApiService.saveSession(result.user);

                setTimeout(() => {
                    const pendingId = sessionStorage.getItem('pending_enrollment');
                    if (pendingId) {
                        setMessage('¡Bienvenido! Retomando tu inscripción...');
                        navigate('/#programas');
                    } else {
                        window.location.href = 'gestion.html';
                    }
                }, 1000);
            } else {
                setMessage(result.message || 'Credenciales incorrectas');
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
            <section className="login-card">
                <form onSubmit={handleSubmit} id="login-form">
                    <h1 className="login-title">Ingresar</h1>

                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <div className="input-wrapper">
                            <i className="bi bi-envelope input-icon"></i>
                            <input
                                className="form-input-glass"
                                type="email"
                                id="email"
                                placeholder="usuario@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="input-wrapper">
                            <i className="bi bi-lock input-icon"></i>
                            <input
                                className="form-input-glass"
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <i
                                className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'} toggle-password`}
                                onClick={() => setShowPassword(!showPassword)}
                            ></i>
                        </div>
                    </div>

                    <button className="btn-premium-submit" type="submit" disabled={isLoading}>
                        {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
                        <i className="bi bi-arrow-right-short"></i>
                    </button>

                    <p id="mensaje-respuesta" style={{ color: isError ? 'var(--color-acento-naranja)' : (message === '¡Bienvenido!' ? '#2ecc71' : '#ccc') }}>
                        {message}
                    </p>

                    <div className="form-footer">
                        <p>
                            Al ingresar aceptas nuestros
                            <Link to="/terms">Términos</Link> y
                            <Link to="/policy">Política de Datos</Link>.
                        </p>
                    </div>

                    <div className="form-footer option-login">
                        <p>
                            ¿Eres nuevo? <br />
                            <Link to="/registro">¡Regístrate ahora!</Link>
                        </p>
                        <p style={{ marginTop: '15px' }}>
                            <Link to="/reset" style={{ color: 'var(--color-humo-gris)', fontSize: '0.85rem' }}>
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </p>
                    </div>
                </form>
            </section>
        </main>
    );
};

export default Login;
