import React from 'react';
import { Link } from 'react-router-dom';
import JamLogo from './JamLogo';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="jam-footer">
            <div className="jam-footer-bg"></div>
            <div className="jam-footer-content">
                <div className="jam-footer-brand">
                    <div className="footer-logo">
                        <Link to="/" onClick={() => window.scrollTo(0, 0)}>
                            <JamLogo width={200} height="auto" color="white" />
                        </Link>
                    </div>
                    <p className="brand-desc">
                        Donde la pasión se encuentra con la excelencia. Formando la próxima generación de artistas integrales en un entorno inspirador y profesional.
                    </p>
                    <div className="jam-status-badge">
                        <span className="pulse-dot"></span>
                        <span>Matrículas Abiertas 2026</span>
                    </div>
                </div>

                <div className="jam-footer-col">
                    <h3>Descubre</h3>
                    <ul className="jam-footer-links">
                        <li><a href="#programas" className="hover-link">Nuestros Programas</a></li>
                        <li><a href="#eventos" className="hover-link">Agenda de Eventos</a></li>
                        <li><a href="#nosotros" className="hover-link">Sobre Nosotros</a></li>
                        <li><a href="galeria.html" className="hover-link">Galería Multimedia</a></li>
                    </ul>
                </div>

                <div className="jam-footer-col">
                    <h3>Comunidad</h3>
                    <ul className="jam-footer-links">
                        <li><a href="login.html" className="hover-link"><i className="bi bi-person-circle"></i> Portal Estudiantes</a></li>
                        <li><a href="registro.html" className="hover-link"><i className="bi bi-pencil-square"></i> Inscripciones</a></li>
                        <li><a href="terminos.html" className="hover-link">Términos y Condiciones</a></li>
                        <li><a href="politicas.html" className="hover-link">Política de Privacidad</a></li>
                    </ul>
                </div>

                <div className="jam-footer-col contact-col">
                    <h3>Conectemos</h3>
                    <div className="contact-info">
                        <div className="contact-item">
                            <div className="icon-box"><i className="bi bi-geo-alt-fill"></i></div>
                            <div>
                                <span className="label">Visítanos</span>
                                <span className="value">Calle 29 # 5A - 33, Santa Marta</span>
                            </div>
                        </div>
                        <div className="contact-item">
                            <div className="icon-box"><i className="bi bi-whatsapp"></i></div>
                            <div>
                                <span className="label">Escríbenos</span>
                                <span className="value">+57 304 232 8575</span>
                            </div>
                        </div>
                    </div>

                    <div className="social-links-premium">
                        <a href="https://www.facebook.com/academiamusicaljacquin" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                        <a href="https://www.instagram.com/academiamusicaljacquin" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
                        <a href="https://www.tiktok.com/@academiamusicaljacquin" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i className="bi bi-tiktok"></i></a>
                        <a href="https://wa.me/573042328575" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="bi bi-whatsapp"></i></a>
                    </div>
                </div>
            </div>

            <div className="jam-footer-bottom">
                <div className="copyright">
                    &copy; {currentYear} <strong>Jacquin Academia Musical</strong>. <span className="rights">Todos los derechos reservados.</span>
                </div>
                <div className="footer-bottom-links">
                    <a href="contactanos.html">Soporte</a>
                    <span className="separator">•</span>
                    <a href="#programas">Mapa del Sitio</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
