import React, { useRef, useCallback } from 'react';
import logoSrc from '../assets/logo_hr_jam.png';
import pianoSrc from '../assets/piano.svg';


/**
 * JamLogo - Jacquin Academia Musical
 *
 * Estrategia híbrida:
 * - El logo PNG se renderiza a la izquierda (letras)
 * - El piano SVG se renderiza a la derecha (teclas interactivas)
 * - Los efectos de piano (hover + sonido) se aplican con divs overlay
 *   posicionados exactamente sobre cada tecla del SVG del piano
 *
 * Notas de logoSound.js: F(349.23), G(392.00), A(440.00), B(493.88)
 * Oscilador: sine, gain: 0.1, duración: 350ms, trigger: mouseenter
 */

const PIANO_NOTES = {
    key1: 349.23, // F
    key2: 392.00, // G
    key3: 440.00, // A
    key4: 493.88, // B
};

// Posición de cada tecla como % del ancho/alto del SVG Piano (viewBox 62x52)
// Las 4 teclas blancas están en el Piano.svg
const KEY_AREAS = [
    { key: 'key1', left: '0%', width: '21%' },    // Primera tecla (x=0-13)
    { key: 'key2', left: '24%', width: '21%' },   // Segunda tecla (x=15-28)
    { key: 'key3', left: '48%', width: '24%' },   // Tercera tecla (x=30-45)
    { key: 'key4', left: '76%', width: '24%' },   // Cuarta tecla (x=47-62)
];

const JamLogo = ({ width = '100%', height = 'auto', color, className = '', staticPage = false }) => {
    const audioCtxRef = useRef(null);

    const getAudioCtx = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtxRef.current;
    }, []);

    const playNote = useCallback((frequency) => {
        try {
            const ctx = getAudioCtx();
            // resume() desbloquea el AudioContext suspendido por política de autoplay
            const play = () => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = frequency;
                gain.gain.value = 0.1;
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                setTimeout(() => osc.stop(), 350);
            };
            if (ctx.state === 'suspended') {
                ctx.resume().then(play);
            } else {
                play();
            }
        } catch (e) { /* Audio no disponible */ }
    }, [getAudioCtx]);

    const handleKeyEnter = (noteKey) => (e) => {
        // Sombra gris sutil interna — no desborda los bordes de la tecla
        e.currentTarget.style.background = 'rgba(60, 60, 60, 0.22)';
        e.currentTarget.style.borderRadius = '2px';
        playNote(PIANO_NOTES[noteKey]);
    };

    const handleKeyLeave = (e) => {
        e.currentTarget.style.background = 'transparent';
    };

    return (
        <div
            className={`jam-logo-container ${className}`}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '4px',
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                lineHeight: 0,
            }}
        >
            {/* Logo PNG — letras */}
            <img
                src={logoSrc}
                alt="Jacquin Academia Musical"
                style={{ height: '100%', width: 'auto', display: 'block', flexShrink: 0 }}
                draggable={false}
            />

            {/* Piano SVG — teclas visibles */}
            <div
                style={{
                    position: 'relative',
                    display: 'inline-block',
                    height: '100%',
                    width: 'auto',
                    flexShrink: 0,
                }}
            >
                <img
                    src={pianoSrc}
                    alt="Piano keys"
                    style={{ height: '100%', width: 'auto', display: 'block' }}
                    draggable={false}
                />

                {/* Overlays invisibles sobre cada tecla de piano */}
                {KEY_AREAS.map(({ key, left, width: kw }) => (
                    <div
                        key={key}
                        title={`Tecla ${key.replace('key', '')}`}
                        onMouseEnter={handleKeyEnter(key)}
                        onMouseLeave={handleKeyLeave}
                        style={{
                            position: 'absolute',
                            top: '0',
                            left,
                            width: kw,
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'box-shadow 0.15s ease',
                            zIndex: 2,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default JamLogo;
