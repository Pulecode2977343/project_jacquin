(function () {
    if (customElements.get('jam-header')) return;
    class Header extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.render();
            this.initializeLogoSound();
            this.initializeMobileMenu();
            this.initializeScrollEffect();

            document.addEventListener('dblclick', function (event) {
                event.preventDefault();
            }, { passive: false });
        }

        initializeScrollEffect() {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    this.classList.add('scrolled');
                    const internalHeader = this.querySelector('.header');
                    if (internalHeader) internalHeader.classList.add('scrolled');
                } else {
                    this.classList.remove('scrolled');
                    const internalHeader = this.querySelector('.header');
                    if (internalHeader) internalHeader.classList.remove('scrolled');
                }
            });
        }

        initializeMobileMenu() {
            setTimeout(() => {
                const navLinks = this.querySelectorAll('.navbar-link');
                const menuToggle = document.getElementById('menuToggle');
                const hambBtn = this.querySelector('.hamb-btn');
                const navbar = document.getElementById('navBar');

                let menuWasOpen = false;

                document.addEventListener('mousedown', () => {
                    menuWasOpen = menuToggle ? menuToggle.checked : false;
                });

                navLinks.forEach(link => {
                    link.addEventListener('click', () => {
                        if (menuToggle && menuToggle.checked) {
                            menuToggle.checked = false;
                        }
                    });
                });

                document.addEventListener('click', (e) => {
                    if (!menuWasOpen) return;
                    if (menuToggle && menuToggle.checked) {
                        const clickedHamb = hambBtn && (hambBtn.contains(e.target) || e.target === hambBtn);
                        const clickedToggle = menuToggle && (menuToggle.contains(e.target) || e.target === menuToggle);
                        const clickedNavbar = navbar && navbar.contains(e.target);
                        if (!clickedHamb && !clickedToggle && !clickedNavbar) {
                            menuToggle.checked = false;
                        }
                    }
                });
            }, 100);
        }

        render() {
            this.innerHTML = `
        <header class="header">
            <div class="btns-log-reg" id="authButtons">
                ${this.renderAuthButtons()}
            </div>

            <div class="logo-links">
                <div class="logo" id="logo">
                    <a href="index.html" style="position: relative; display: inline-block; line-height: 0;">
                        <!-- Logo SVG oficial -->
                        <img src="logo_hr_jam.svg" alt="Jacquin Academia Musical" style="width: 239px; height: auto; display: block;" draggable="false">
                        
                        <!-- Teclas interactivas sobre el piano del logo -->
                        <div class="key" data-note="F" style="position: absolute; top: 0; left: 74.1%; width: 5.4%; height: 90%; cursor: pointer; z-index: 2;"></div>
                        <div class="key" data-note="G" style="position: absolute; top: 0; left: 80.3%; width: 5.4%; height: 90%; cursor: pointer; z-index: 2;"></div>
                        <div class="key" data-note="A" style="position: absolute; top: 0; left: 86.6%; width: 6.3%; height: 90%; cursor: pointer; z-index: 2;"></div>
                        <div class="key" data-note="B" style="position: absolute; top: 0; left: 93.3%; width: 6.7%; height: 90%; cursor: pointer; z-index: 2;"></div>
                    </a>
                </div>

                <input type="checkbox" class="menuToggle" id="menuToggle">
                <label for="menuToggle" class="hamb-btn">
                    <span class="hamb-line"></span>
                </label>

                <nav class="navbar" id="navBar">
                    <jam-navbar></jam-navbar>
                </nav>
            </div>
        </header>
        `;
            this.initializeLogoSound();
        }

        renderAuthButtons() {
            const isAuthenticated = window.ApiService && window.ApiService.isAuthenticated();

            if (isAuthenticated) {
                const user = window.ApiService.getSession();
                const roleName = user.id_rol == 1 ? 'Admin' : (user.id_rol == 2 ? 'Profesor' : 'Estudiante');
                const avatarUrl = window.ApiService.getAvatarUrl(user.avatar_url);
                const cleanName = user.full_name ? user.full_name.split(' ')[0] : 'Usuario';

                const isDashboard = window.location.pathname.includes('gestion.html');
                const dashBtnText = isDashboard ? 'Mi Panel' : 'Volver a Mi Panel';
                const avatarAction = isDashboard ? 'window.openMyProfile()' : "window.location.href='gestion.html'";

                return `
                <div class="user-profile-glass" onclick="${avatarAction}">
                    <div class="user-text-info">
                        <span class="user-name">${cleanName}</span>
                        <span class="user-role">${roleName}</span>
                    </div>
                    <div class="user-avatar-wrapper">
                        <img src="${avatarUrl}" alt="Avatar">
                    </div>
                </div>

                <div class="action-buttons-wrapper">
                    <button class="btn-ghost" onclick="window.ApiService.logout(); event.stopPropagation();">
                        Salir <i class="bi bi-box-arrow-right"></i>
                    </button>
                    <button class="btn-primary-action" onclick="window.location.href='gestion.html'">
                        ${dashBtnText}
                    </button>
                </div>
            `;
            } else {
                return `
                <button class="btn btn-register">
                    <a href="login.html" class="link link-login">Iniciar Sesión</a>
                </button>
                <button class="btn btn-login">
                    <a href="registro.html" class="link link-register">Inscríbete</a>
                </button>
            `;
            }
        }

        initializeLogoSound() {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!this.audioCtx) {
                this.audioCtx = new AudioContext();
            }

            const notes = {
                'F': 349.23,
                'G': 392.00,
                'A': 440.00,
                'B': 493.88
            };

            const playNote = (note) => {
                if (this.audioCtx.state === 'suspended') {
                    this.audioCtx.resume();
                }

                const osc = this.audioCtx.createOscillator();
                osc.type = 'sine';
                if (notes[note]) {
                    osc.frequency.value = notes[note];
                    const gain = this.audioCtx.createGain();
                    gain.gain.value = 0.1;
                    osc.connect(gain);
                    gain.connect(this.audioCtx.destination);
                    osc.start();
                    setTimeout(() => {
                        osc.stop();
                    }, 350);
                }
            };

            const keys = this.querySelectorAll('.key');
            keys.forEach(key => {
                key.addEventListener('mouseenter', () => {
                    const note = key.getAttribute('data-note');
                    playNote(note);
                });
            });
        }
    }

    customElements.define('jam-header', Header);
})();
