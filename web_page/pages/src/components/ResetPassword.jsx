import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ApiService from '../services/api';

const ResetPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [strength, setStrength] = useState({ score: 0, status: '-', color: '#eee' });

    const navigate = useNavigate();

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('Enviando código...');
        setIsError(false);

        try {
            const res = await ApiService.requestRecoveryCode(email);
            if (res.success || res.status === 200 || (res.message && res.message.includes("enviado"))) {
                setStep(2);
                setMessage('');
            } else {
                setMessage(res.message || "Error al enviar. Verifique el email.");
                setIsError(true);
            }
        } catch (err) {
            setMessage("Error de conexión.");
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('Verificando...');
        setIsError(false);

        try {
            const res = await ApiService.verifyRecoveryCode(email, code);
            if (res.success) {
                setStep(3);
                setMessage('');
            } else {
                setMessage(res.message || "Código incorrecto.");
                setIsError(true);
            }
        } catch (err) {
            setMessage("Error de conexión.");
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage("Las contraseñas no coinciden.");
            setIsError(true);
            return;
        }

        setIsLoading(true);
        setMessage('Actualizando...');
        setIsError(false);

        try {
            const res = await ApiService.resetPassword(email, code, newPassword);
            if (res.success) {
                setMessage("¡Contraseña actualizada con éxito!");
                setIsError(false);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setMessage(res.message || "Error actualizando contraseña.");
                setIsError(true);
            }
        } catch (err) {
            setMessage("Error de conexión.");
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = (val) => {
        setNewPassword(val);
        let s = 0;
        let status = "";
        let color = "#eee";

        if (val.length >= 8) s += 1;
        if (val.match(/[A-Z]/)) s += 1;
        if (val.match(/[0-9]/)) s += 1;
        if (val.match(/[^A-Za-z0-9]/)) s += 1;

        switch (s) {
            case 0:
            case 1:
                status = "Débil";
                color = "#ff4d4d";
                break;
            case 2:
                status = "Regular";
                color = "#ffa500";
                break;
            case 3:
                status = "Buena";
                color = "#2ecc71";
                break;
            case 4:
                status = "Excelente";
                color = "#3498db";
                break;
            default:
                status = "-";
                color = "#eee";
        }

        if (val.length === 0) {
            setStrength({ score: 0, status: '-', color: '#eee' });
        } else {
            setStrength({ score: s, status, color });
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <form onSubmit={handleEmailSubmit}>
                        <h1 className="login-title">Recuperar Contraseña</h1>
                        <p className="instructions" style={{ textAlign: 'center', color: 'var(--color-humo-gris)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            Ingresa tu correo electrónico registrado y te enviaremos las instrucciones para restablecer tu contraseña.
                        </p>
                        <div className="form-group">
                            <label htmlFor="email">Correo Electrónico</label>
                            <div className="input-wrapper">
                                <i className="bi bi-envelope input-icon"></i>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input-glass"
                                    placeholder="usuario@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button className="btn-premium-submit" type="submit" disabled={isLoading}>
                            {isLoading ? 'ENVIANDO...' : 'ENVIAR INSTRUCCIONES'}
                            <i className="bi bi-send"></i>
                        </button>
                    </form>
                );
            case 2:
                return (
                    <form onSubmit={handleCodeSubmit}>
                        <h1 className="login-title">Verificar Código</h1>
                        <p className="instructions" style={{ textAlign: 'center', color: 'var(--color-humo-gris)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            Hemos enviado un código a <b>{email}</b>.<br />Ingrésalo a continuación.
                        </p>
                        <div className="form-group">
                            <label htmlFor="code">Código de Verificación</label>
                            <div className="input-wrapper">
                                <i className="bi bi-key input-icon"></i>
                                <input
                                    type="text"
                                    id="code"
                                    className="form-input-glass"
                                    placeholder="123456"
                                    maxLength="6"
                                    style={{ letterSpacing: '5px', textAlign: 'center', paddingLeft: '15px' }}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button className="btn-premium-submit" type="submit" disabled={isLoading}>
                            {isLoading ? 'VERIFICANDO...' : 'VERIFICAR CÓDIGO'}
                            <i className="bi bi-check-circle"></i>
                        </button>
                    </form>
                );
            case 3:
                return (
                    <form onSubmit={handlePasswordSubmit}>
                        <h1 className="login-title">Nueva Contraseña</h1>
                        <p className="instructions" style={{ textAlign: 'center', color: 'var(--color-humo-gris)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            Crea una contraseña fuerte para proteger tu cuenta.
                        </p>
                        <div className="form-group">
                            <label htmlFor="newPassword">Nueva Contraseña</label>
                            <div className="input-wrapper">
                                <i className="bi bi-lock input-icon"></i>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="newPassword"
                                    className="form-input-glass"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    required
                                />
                                <i
                                    className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'} toggle-password`}
                                    onClick={() => setShowPassword(!showPassword)}
                                ></i>
                            </div>
                            {/* Strength Meter */}
                            <div style={{ marginTop: '10px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ height: '100%', width: `${strength.score * 25}%`, backgroundColor: strength.color, transition: 'width 0.3s, background 0.3s' }}></div>
                            </div>
                            <p style={{ fontSize: '0.8rem', marginTop: '5px', color: strength.color, textAlign: 'right' }}>Fuerza: {strength.status}</p>
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <div className="input-wrapper">
                                <i className="bi bi-lock-fill input-icon"></i>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    className="form-input-glass"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button className="btn-premium-submit" type="submit" disabled={isLoading}>
                            {isLoading ? 'ACTUALIZANDO...' : 'RESTABLECER CONTRASEÑA'}
                            <i className="bi bi-shield-lock"></i>
                        </button>
                    </form>
                );
            default:
                return null;
        }
    };

    return (
        <main className="main-login-container">
            <section className="login-card">
                {renderStep()}

                <p id="mensaje-respuesta" style={{ color: isError ? 'var(--color-acento-naranja)' : '#2ecc71', textAlign: 'center', marginTop: '15px' }}>
                    {message}
                </p>

                <div className="form-footer option-login">
                    <Link to="/login">Volver al Inicio de Sesión</Link>
                </div>
            </section>
        </main>
    );
};

export default ResetPassword;
