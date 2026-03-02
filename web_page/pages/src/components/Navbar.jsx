import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ApiService from '../services/api';

const Navbar = ({ staticPage = false }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleNavClick = (anchor) => (e) => {
        const isHome = location.pathname === '/' || location.pathname === '/index.html' || location.pathname === '';

        if (isHome) {
            e.preventDefault();
            const id = anchor.replace('#', '');
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        } else if (staticPage) {
            // En modo estático, si no estamos en el root, redirigir
            window.location.href = '/' + anchor;
        } else {
            // En la SPA, navegar al root con el hash
            navigate('/' + anchor);
        }
    };

    useEffect(() => {
        setIsAuthenticated(ApiService.isAuthenticated());
    }, [location]);

    const renderAuthLinks = () => {
        if (isAuthenticated) {
            return (
                <>
                    <li className="mobile-only">
                        {staticPage
                            ? <a className="navbar-link btn-bubble-mobile" href="/dashboard" title="Mi Panel">
                                <i className="bi bi-speedometer2"></i>
                                <span className="txt-menu">Mi Panel</span>
                            </a>
                            : <Link className="navbar-link btn-bubble-mobile" to="/dashboard" title="Mi Panel">
                                <i className="bi bi-speedometer2"></i>
                                <span className="txt-menu">Mi Panel</span>
                            </Link>
                        }
                    </li>
                    <li className="mobile-only">
                        {staticPage
                            ? <a className="navbar-link btn-bubble-mobile" href="/dashboard" title="Mi Perfil">
                                <i className="bi bi-person-circle"></i>
                                <span className="txt-menu">Mi Perfil</span>
                            </a>
                            : <Link className="navbar-link btn-bubble-mobile" to="/dashboard" title="Mi Perfil">
                                <i className="bi bi-person-circle"></i>
                                <span className="txt-menu">Mi Perfil</span>
                            </Link>
                        }
                    </li>
                    <li className="mobile-only">
                        <a className="navbar-link btn-bubble-mobile" href="#" onClick={(e) => { e.preventDefault(); ApiService.logout(); window.location.reload(); }} title="Cerrar Sesión">
                            <i className="bi bi-box-arrow-right"></i>
                            <span className="txt-menu">Salir</span>
                        </a>
                    </li>
                </>
            );
        } else {
            return (
                <>
                    <li className="mobile-only">
                        {staticPage
                            ? <a className="navbar-link btn-bubble-mobile" href="/login" title="Ingresa">
                                <i className="bi bi-box-arrow-in-right"></i>
                                <span className="txt-menu">Ingresa</span>
                            </a>
                            : <Link className="navbar-link btn-bubble-mobile" to="/login" title="Ingresa">
                                <i className="bi bi-box-arrow-in-right"></i>
                                <span className="txt-menu">Ingresa</span>
                            </Link>
                        }
                    </li>
                    <li className="mobile-only">
                        {staticPage
                            ? <a className="navbar-link btn-bubble-mobile" href="/registro" title="Inscríbete">
                                <i className="bi bi-pencil-square"></i>
                                <span className="txt-menu">Inscríbete</span>
                            </a>
                            : <Link className="navbar-link btn-bubble-mobile" to="/registro" title="Inscríbete">
                                <i className="bi bi-pencil-square"></i>
                                <span className="txt-menu">Inscríbete</span>
                            </Link>
                        }
                    </li>
                </>
            );
        }
    };

    return (
        <ul className="navbar-list" id="navbarList">
            <li>
                <a className="navbar-link" href="/#hero" onClick={handleNavClick('#hero')} title="Inicio">
                    <i className="bi bi-house-door"></i>
                    <span className="txt-menu">Inicio</span>
                </a>
            </li>
            <li>
                <a className="navbar-link" href="/#nosotros" onClick={handleNavClick('#nosotros')} title="Nosotros">
                    <i className="bi bi-people"></i>
                    <span className="txt-menu">Nosotros</span>
                </a>
            </li>
            <li>
                <a className="navbar-link" href="/#programas" onClick={handleNavClick('#programas')} title="Programas">
                    <i className="bi bi-music-note-list"></i>
                    <span className="txt-menu">Programas</span>
                </a>
            </li>
            <li>
                <a className="navbar-link" href="/#eventos" onClick={handleNavClick('#eventos')} title="Eventos">
                    <i className="bi bi-calendar-event"></i>
                    <span className="txt-menu">Eventos</span>
                </a>
            </li>
            <li>
                {staticPage
                    ? <a className="navbar-link" href="/contactanos">
                        <i className="bi bi-telephone"></i>
                        <span className="txt-menu">Contáctanos</span>
                    </a>
                    : <Link className="navbar-link" to="/contactanos">
                        <i className="bi bi-telephone"></i>
                        <span className="txt-menu">Contáctanos</span>
                    </Link>
                }
            </li>
            {renderAuthLinks()}
        </ul>
    );
};

export default Navbar;
