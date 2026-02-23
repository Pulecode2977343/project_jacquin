/**
 * footer-mount.jsx — Entry point para el micro-frontend del Footer React
 *
 * Compilado por esbuild como bundle standalone (IIFE).
 * Se carga en todas las páginas HTML estáticas.
 *
 * Uso en HTML:
 *   <div id="react-footer-root"></div>
 *   <script src="/js/react-footer.bundle.js"></script>
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Footer from './components/Footer';

const rootEl = document.getElementById('react-footer-root');
if (rootEl) {
    createRoot(rootEl).render(
        <BrowserRouter>
            <Footer />
        </BrowserRouter>
    );
}
