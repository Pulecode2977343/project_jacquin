import React from 'react';
import { Link } from 'react-router-dom';
import JamLogo from './JamLogo';
import EnrollmentStatusBadge from './EnrollmentStatusBadge';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="jam-footer">
            <div className="jam-footer-bg"></div>
            <div className="jam-footer-content">
                <div className="jam-footer-brand">
                    <div className="footer-logo">
                        <Link to="/" onClick={() => window.scrollTo(0, 0)}>
                            <JamLogo width={300} height="auto" color="white" />
                        </Link>
                    </div>
                    <p className="brand-desc">
                        Donde la pasión se encuentra con la excelencia. Formando la próxima generación de artistas integrales en un entorno inspirador y profesional.
                    </p>
                    <EnrollmentStatusBadge />
                </div>

                <div className="jam-footer-col">
                    <h3>Descubre</h3>
                    <ul className="jam-footer-links">
                        <li><a href="/#programas" className="hover-link">Nuestros Programas</a></li>
                        <li><a href="/#eventos" className="hover-link">Agenda de Eventos</a></li>
                        <li><a href="/#nosotros" className="hover-link">Sobre Nosotros</a></li>
                        <li><a href="/#galeria" className="hover-link">Galería Multimedia</a></li>
                    </ul>
                </div>

                <div className="jam-footer-col">
                    <h3>Comunidad</h3>
                    <ul className="jam-footer-links">
                        <li><Link to="/login" className="hover-link"><i className="bi bi-person-circle"></i> Portal Estudiantes</Link></li>
                        <li><Link to="/registro" className="hover-link"><i className="bi bi-pencil-square"></i> Inscripciones</Link></li>
                        <li><Link to="/terms" className="hover-link">Términos y Condiciones</Link></li>
                        <li><Link to="/politicas" className="hover-link">Política de Privacidad</Link></li>
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
                    <div className="image-disclaimer" style={{ fontSize: '0.75rem', marginTop: '5px', opacity: 0.7, fontWeight: 300 }}>
                        Anexo: Las imágenes utilizadas en este sitio web son propiedad exclusiva de Jacquin Academia Musical o cuentan con las debidas licencias y derechos de uso.
                    </div>
                </div>
                <div className="footer-bottom-links">
                    <Link to="/contactanos">Soporte</Link>
                    <span className="separator">•</span>
                    <Link to="/#programas">Mapa del Sitio</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
