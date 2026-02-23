/**
 * header-mount.jsx — Entry point para el micro-frontend del Header React
 *
 * Compilado por esbuild como bundle standalone (IIFE).
 * Se carga en todas las páginas HTML estáticas para reemplazar el Web Component <jam-header>.
 *
 * Uso en HTML:
 *   <div id="react-header-root"></div>
 *   <script src="/js/react-header.bundle.js"></script>
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Header from './components/Header';

const rootEl = document.getElementById('react-header-root');
if (rootEl) {
    createRoot(rootEl).render(
        <BrowserRouter>
            <Header staticPage={true} />
        </BrowserRouter>
    );
}
