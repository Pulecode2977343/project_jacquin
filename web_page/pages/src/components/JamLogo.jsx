import React, { useRef, useCallback } from 'react';
import logoSrc from '../assets/logo_hr_jam.svg';


/**
 * JamLogo - Jacquin Academia Musical
 *
 * Estrategia híbrida:
 * - El logo se renderiza como imagen SVG estática (fidelidad total al diseño)
 * - Los efectos de piano (hover + sonido) se aplican con divs overlay
 *   posicionados exactamente sobre cada tecla del SVG
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

// Posición de cada tecla como % del ancho/alto del SVG (viewBox 239x58)
// Las 4 teclas blancas están entre x=177 y x=239
const KEY_AREAS = [
    { key: 'key1', left: '74.1%', width: '5.4%' }, // x=177-190 / 239
    { key: 'key2', left: '80.3%', width: '5.4%' }, // x=192-205 / 239
    { key: 'key3', left: '86.6%', width: '6.3%' }, // x=207-222 / 239
    { key: 'key4', left: '93.3%', width: '6.7%' }, // x=223-239 / 239
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
                display: 'inline-block',
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                lineHeight: 0,
            }}
        >
            {/* Logo SVG oficial — fidelidad total */}
            <img
                src={logoSrc}
                alt="Jacquin Academia Musical"
                style={{ width: '100%', height: 'auto', display: 'block' }}
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
                        height: '90%',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.15s ease',
                        zIndex: 2,
                    }}
                />
            ))}
        </div>
    );
};

export default JamLogo;
