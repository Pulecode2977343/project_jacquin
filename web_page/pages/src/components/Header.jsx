import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import JamLogo from './JamLogo';
import Navbar from './Navbar';
import ApiService from '../services/api';
import AvatarHelper from '../helpers/AvatarHelper';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Initial Auth Check
        const session = ApiService.getSession();
        if (session) {
            setIsAuthenticated(true);
            setUser(session);
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
            const avatarUrl = AvatarHelper.getUrl(user.avatar_url) || 'assets/images/default_avatar.svg';
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
                    <Link to="/login" className="link link-login">Iniciar Sesión</Link>
                </button>
                <button className="btn btn-login">
                    <Link to="/registro" className="link link-register">Inscríbete</Link>
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
                    <Link to="/" onClick={() => window.scrollTo(0, 0)}>
                        <JamLogo width={239} height="auto" color="white" />
                    </Link>
                </div>

                <input type="checkbox" className="menuToggle" id="menuToggle" />
                <label htmlFor="menuToggle" className="hamb-btn">
                    <span className="hamb-line"></span>
                </label>

                <nav className="navbar" id="navBar">
                    <Navbar />
                </nav>
            </div>
        </header>
    );
};

export default Header;
