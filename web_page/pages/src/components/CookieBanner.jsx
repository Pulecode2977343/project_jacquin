import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const accepted = localStorage.getItem('jacquin_cookies_accepted');
        if (!accepted) {
            const timer = setTimeout(() => setShow(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('jacquin_cookies_accepted', 'true');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div
            className="cookie-banner-glass"
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                maxWidth: '380px',
                width: 'calc(100% - 40px)',
                background: 'rgba(11, 19, 33, 0.96)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(147, 182, 238, 0.2)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                zIndex: 10001,
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                <div style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>🍪</div>
                <div>
                    <h4 style={{ color: '#dddddd', margin: '0 0 6px 0', fontSize: '1.05rem', fontFamily: "'Spartan', sans-serif" }}>Usamos Cookies</h4>
                    <p style={{ color: 'rgba(221,221,221,0.65)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                        Utilizamos cookies para mejorar tu experiencia y analizar el tráfico de la academia.
                        <Link to="/politicas" style={{ color: '#93B6EE', textDecoration: 'none', fontWeight: '600', marginLeft: '5px' }}>Leer Política</Link>.
                    </p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => setShow(false)}
                    style={{
                        background: 'transparent',
                        color: 'rgba(221,221,221,0.5)',
                        border: 'none',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                    }}
                >
                    Cerrar
                </button>
                <button
                    onClick={handleAccept}
                    style={{
                        background: 'linear-gradient(135deg, #E78C3B, #c97a2a)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 22px',
                        borderRadius: '10px',
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontFamily: "'Spartan', sans-serif",
                        boxShadow: '0 4px 15px rgba(231,140,59,0.3)'
                    }}
                >
                    Aceptar
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;
