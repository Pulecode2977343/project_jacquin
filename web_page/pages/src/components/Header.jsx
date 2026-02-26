import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import JamLogo from './JamLogo';
import Navbar from './Navbar';
import ApiService from '../services/api';
import AvatarHelper from '../helpers/AvatarHelper';

const Header = ({ staticPage = false }) => {
    const [isScrolled, setIsScrolled] = useState(staticPage);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogoClick = (e) => {
        e.preventDefault();
        const isHome = location.pathname === '/' || location.pathname === '/index.html' || location.pathname === '';

        if (isHome) {
            console.log("%c🎹 JACQUIN Academia Musical - Modo Maestro Activado", "color: #93B6EE; font-weight: bold; font-size: 14px;");
            document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
        } else if (staticPage) {
            window.location.href = '/';
        } else {
            navigate('/');
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(staticPage || window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Initial Auth Check
        const session = ApiService.getSession();
        if (session) {
            setIsAuthenticated(true);
            setUser(session);

            // Persistencia del Chat: Inyectar widget si el usuario está autenticado
            if (!document.getElementById('jchat-script')) {
                const script = document.createElement('script');
                script.id = 'jchat-script';
                script.src = 'js/messaging_widget.js';
                script.async = true;
                script.onload = () => {
                    if (window.JChat) window.JChat.init();
                };
                document.body.appendChild(script);
            }
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        ApiService.logout();
        setIsAuthenticated(false);
        setUser(null);
    };

    const renderAuthButtons = () => {
        if (isAuthenticated && user) {
            const roleName = user.id_rol === 1 ? 'Admin' : (user.id_rol === 2 ? 'Profesor' : 'Estudiante');
            const avatarUrl = AvatarHelper.getUrl(user.avatar_url) || 'assets/images/avatars/default_avatar.svg';
            const cleanName = user.full_name.split(' ')[0];
            const initials = AvatarHelper.getInitials(user.full_name);

            return (
                <>
                    <div className="user-profile-glass" onClick={() => window.location.href = 'gestion.html'}>
                        <div className="user-text-info">
                            <span className="user-name">{cleanName}</span>
                            <span className="user-role">{roleName}</span>
                        </div>
                        <div className="user-avatar-wrapper">
                            <img src={avatarUrl} alt="Avatar" onError={(e) => AvatarHelper.handleError(e.target)} />
                            <div className="avatar-initials" style={{ display: 'none' }}>{initials}</div>
                        </div>
                    </div>
                    <div className="action-buttons-wrapper">
                        <button className="btn-ghost" onClick={handleLogout}>
                            Salir <i className="bi bi-box-arrow-right"></i>
                        </button>
                        <button className="btn-primary-action" onClick={() => window.location.href = 'gestion.html'}>
                            Mi Panel
                        </button>
                    </div>
                </>
            );
        }

        return (
            <>
                <button className="btn btn-register">
                    {staticPage
                        ? <a href="/login" className="link link-login">Ingresa</a>
                        : <Link to="/login" className="link link-login">Ingresa</Link>
                    }
                </button>
                <button className="btn btn-login">
                    {staticPage
                        ? <a href="/registro" className="link link-register">Inscríbete</a>
                        : <Link to="/registro" className="link link-register">Inscríbete</Link>
                    }
                </button>
            </>
        );
    };

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="btns-log-reg" id="authButtons">
                {renderAuthButtons()}
            </div>

            <div className="logo-links">
                <div className="logo" id="logo">
                    <a href="/" onClick={handleLogoClick}>
                        <JamLogo width={239} height="auto" color="white" staticPage={staticPage} />
                    </a>
                </div>

                <input type="checkbox" className="menuToggle" id="menuToggle" />
                <label htmlFor="menuToggle" className="hamb-btn">
                    <span className="hamb-line"></span>
                </label>

                <nav className="navbar" id="navBar">
                    <Navbar staticPage={staticPage} />
                </nav>
            </div>
        </header>
    );
};

export default Header;
