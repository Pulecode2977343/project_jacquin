import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Events from './components/Events';
import Programs from './components/Programs';
import About from './components/About';
import Login from './components/Login';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import ContactUs from './components/ContactUs';
import CookieBanner from './components/CookieBanner';
import Terms from './components/Terms';
import Privacy from './components/Privacy';

// Hace scroll al elemento cuyo id coincide con el hash de la URL (#eventos, #programas, etc.)
// Usa polling porque algunos componentes (Events, Programs) cargan datos asíncronamente
// y devuelven null mientras loading=true, por lo que el id aún no existe en el DOM.
function HashScroller() {
    const { hash } = useLocation();
    useEffect(() => {
        if (!hash) return;
        const id = hash.slice(1);
        let lastPos = -1;
        let attempts = 0;
        const MAX_ATTEMPTS = 50; // 5 segundos

        const tryScroll = () => {
            const el = document.getElementById(id);
            if (el) {
                const headerOffset = 90;
                const rect = el.getBoundingClientRect();
                const currentTop = rect.top + window.pageYOffset;

                // Solo desplazar si la posición ha cambiado significativamente (ej: cargó contenido arriba)
                // o si es el primer intento
                if (Math.abs(currentTop - lastPos) > 10) {
                    window.scrollTo({
                        top: currentTop - headerOffset,
                        behavior: 'smooth'
                    });
                    lastPos = currentTop;
                }

                // Continuar monitoreando por si cargan más cosas arriba (como Events/Programs)
                if (attempts < MAX_ATTEMPTS) {
                    attempts++;
                    setTimeout(tryScroll, 150);
                }
            } else {
                // Si el elemento no existe aún (ej: About cargando), esperar
                if (attempts < MAX_ATTEMPTS) {
                    attempts++;
                    setTimeout(tryScroll, 100);
                }
            }
        };

        tryScroll();
    }, [hash]);
    return null;
}

function App() {
    return (
        <Router>
            <div className="App">
                <Header />
                <HashScroller />
                <main className="jam-main-content">
                    <Routes>
                        <Route path="/" element={
                            <>
                                <Hero />
                                <Events />
                                <Programs />
                                <About />
                            </>
                        } />
                        <Route path="/login" element={<Login />} />
                        <Route path="/registro" element={<Register />} />
                        <Route path="/reset" element={<ResetPassword />} />
                        <Route path="/contactanos" element={<ContactUs />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/terminos" element={<Navigate to="/terms" replace />} />
                        <Route path="/politicas" element={<Privacy />} />
                    </Routes>
                </main>
                <Footer />
                <CookieBanner />
            </div>
        </Router>
    );
}

export default App;
