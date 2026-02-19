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
            this.initializeScrollEffect(); // New scroll effect

            // Prevent Zoom on double tap key elements
            document.addEventListener('dblclick', function (event) {
                event.preventDefault();
            }, { passive: false });
        }

        initializeScrollEffect() {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    this.classList.add('scrolled');
                    // Also add to internal header for safety
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

                // Track menu state BEFORE click to prevent race condition
                let menuWasOpen = false;

                // Capture the state before any click toggles it
                document.addEventListener('mousedown', () => {
                    menuWasOpen = menuToggle ? menuToggle.checked : false;
                });

                // Close menu when clicking on a nav link
                navLinks.forEach(link => {
                    link.addEventListener('click', () => {
                        if (menuToggle && menuToggle.checked) {
                            menuToggle.checked = false;
                        }
                    });
                });

                // Close menu when clicking outside (only if it was already open)
                document.addEventListener('click', (e) => {
                    // Only close if menu was already open before this click
                    if (!menuWasOpen) return;

                    if (menuToggle && menuToggle.checked) {
                        // Check if click was inside the hamburger button or its label
                        const clickedHamb = hambBtn && (hambBtn.contains(e.target) || e.target === hambBtn);
                        // Check if click was inside the menuToggle checkbox
                        const clickedToggle = menuToggle && (menuToggle.contains(e.target) || e.target === menuToggle);
                        // Check if click was inside navbar
                        const clickedNavbar = navbar && navbar.contains(e.target);

                        // Close only if clicked outside all menu elements
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
                    <a href="index.html">
                        <jam-logo width="239" height="auto" color="white"></jam-logo>
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
            // Ensure ApiService is available (it should be since it's loaded in scripts)
            const isAuthenticated = window.ApiService && window.ApiService.isAuthenticated();

            if (isAuthenticated) {
                const user = window.ApiService.getSession();
                // Fallback for role name
                const roleName = user.id_rol == 1 ? 'Admin' : (user.id_rol == 2 ? 'Profesor' : 'Estudiante');

                // FIX: Use AvatarHelper for URL and add error handling
                const avatarUrl = window.AvatarHelper
                    ? window.AvatarHelper.getUrl(user.avatar_url)
                    : (user.avatar_url || 'assets/images/default_avatar.svg');

                const cleanName = user.full_name.split(' ')[0]; // First name only for headers
                const initials = cleanName.substring(0, 2).toUpperCase();

                // Logic for "Back to Dashboard" vs just "Dashboard"
                const isDashboard = window.location.pathname.includes('gestion.html');
                const dashBtnText = isDashboard ? 'Mi Panel' : 'Volver a Mi Panel';

                // User Info HTML (Avatar CLICK triggers Profile Drawer)
                const avatarAction = isDashboard ? 'window.openMyProfile()' : "window.location.href='gestion.html'";

                return `
                <div class="user-profile-glass" onclick="${avatarAction}">
                    <div class="user-text-info">
                        <span class="user-name">${cleanName}</span>
                        <span class="user-role">${roleName}</span>
                    </div>
                    <div class="user-avatar-wrapper">
                        <img src="${avatarUrl}" alt="Avatar" onerror="if(window.AvatarHelper) window.AvatarHelper.handleError(this)">
                        <div class="avatar-initials" style="display:none; width:100%; height:100%; justify-content:center; align-items:center; background:var(--color-acento-azul); color:white; font-weight:bold; font-size: 0.9rem;">${initials}</div>
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
                    <a href="newUser.html" class="link link-register">Inscríbete</a>
                </button>
            `;

            }
        }

        initializeLogoSound() {
            // Initialize Audio Context
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
        }
    }

    customElements.define('jam-header', Header);

})();
