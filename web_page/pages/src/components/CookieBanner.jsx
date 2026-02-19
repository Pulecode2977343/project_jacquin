import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const accepted = localStorage.getItem('jacquin_cookies_accepted');
        if (!accepted) {
            const timer = setTimeout(() => setShow(true), 1000);
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
                maxWidth: '350px',
                width: '90%',
                background: 'rgba(20, 30, 48, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                zIndex: 10000,
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                <div style={{ fontSize: '2rem' }}>🍪</div>
                <div>
                    <h4 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '1rem' }}>Usamos Cookies</h4>
                    <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                        Utilizamos cookies para mejorar tu experiencia y analizar el tráfico.
                        <a href="cookies.html" style={{ color: '#3498db', textDecoration: 'underline', marginLeft: '5px' }}>Leer Política</a>.
                    </p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                    onClick={handleAccept}
                    style={{
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Aceptar
                </button>
                <button
                    onClick={() => setShow(false)}
                    style={{
                        background: 'transparent',
                        color: '#888',
                        border: 'none',
                        padding: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;
