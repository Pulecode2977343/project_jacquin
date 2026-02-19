import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsAuthenticated(ApiService.isAuthenticated());
    }, []);

    const renderAuthLinks = () => {
        if (isAuthenticated) {
            return (
                <>
                    <li className="mobile-only">
                        <Link className="navbar-link btn-bubble-mobile" to="/gestion" title="Mi Panel">
                            <i className="bi bi-speedometer2"></i>
                            <span className="txt-menu">Mi Panel</span>
                        </Link>
                    </li>
                    <li className="mobile-only">
                        <Link className="navbar-link btn-bubble-mobile" to="/gestion?action=profile" title="Mi Perfil">
                            <i className="bi bi-person-circle"></i>
                            <span className="txt-menu">Mi Perfil</span>
                        </Link>
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
                        <Link className="navbar-link btn-bubble-mobile" to="/login" title="Iniciar Sesión">
                            <i className="bi bi-box-arrow-in-right"></i>
                            <span className="txt-menu">Login</span>
                        </Link>
                    </li>
                    <li className="mobile-only">
                        <Link className="navbar-link btn-bubble-mobile" to="/registro" title="Inscríbete">
                            <i className="bi bi-pencil-square"></i>
                            <span className="txt-menu">Registro</span>
                        </Link>
                    </li>
                </>
            );
        }
    };

    return (
        <ul className="navbar-list" id="navbarList">
            <li>
                <Link className="navbar-link" to="/">
                    <span className="txt-menu">Inicio</span>
                    <i className="bi bi-house-door"></i>
                </Link>
            </li>
            <li>
                <a className="navbar-link" href="#eventos">
                    <span className="txt-menu">Eventos</span>
                    <i className="bi bi-calendar-event"></i>
                </a>
            </li>
            <li>
                <a className="navbar-link" href="#programas">
                    <span className="txt-menu">Programas</span>
                    <i className="bi bi-music-note-list"></i>
                </a>
            </li>
            <li>
                <a className="navbar-link" href="#nosotros">
                    <span className="txt-menu">Nosotros</span>
                    <i className="bi bi-people"></i>
                </a>
            </li>
            <li>
                <Link className="navbar-link" to="/contactanos">
                    <span className="txt-menu">Contáctanos</span>
                    <i className="bi bi-telephone"></i>
                </Link>
            </li>
            {renderAuthLinks()}
        </ul>
    );
};

export default Navbar;
