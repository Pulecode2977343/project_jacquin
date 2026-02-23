class CookieBanner extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Check if already accepted
        if (localStorage.getItem('jacquin_cookies_accepted')) {
            return;
        }

        this.render();
    }

    render() {
        this.innerHTML = `
            <div id="cookie-banner" style="
                position: fixed; bottom: 20px; right: 20px; max-width: 350px; width: 90%;
                background: rgba(20, 30, 48, 0.95); backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;
                padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 10000;
                transform: translateY(100px); opacity: 0; transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                display: flex; flex-direction: column; gap: 15px;
            ">
                <div style="display: flex; align-items: start; gap: 15px;">
                    <div style="font-size: 2rem;">🍪</div>
                    <div>
                        <h4 style="color: white; margin: 0 0 5px 0; font-size: 1rem;">Usamos Cookies</h4>
                        <p style="color: #aaa; font-size: 0.85rem; margin: 0; line-height: 1.4;">
                            Utilizamos cookies para mejorar tu experiencia y analizar el tráfico. 
                            <a href="cookies.html" style="color: var(--color-acento-azul, #3498db); text-decoration: underline;">Leer Política</a>.
                        </p>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button id="btn-cookie-accept" style="
                        background: var(--color-acento-azul, #3498db); color: white; border: none;
                        padding: 8px 16px; border-radius: 20px; font-size: 0.9rem; font-weight: bold;
                        cursor: pointer; transition: transform 0.2s;
                    ">
                        Aceptar
                    </button>
                    <button onclick="document.getElementById('cookie-banner').remove()" style="
                        background: transparent; color: #888; border: none; padding: 8px;
                        cursor: pointer; font-size: 0.9rem;
                    ">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        // Animation In
        setTimeout(() => {
            const banner = this.querySelector('#cookie-banner');
            if (banner) {
                banner.style.transform = 'translateY(0)';
                banner.style.opacity = '1';
            }
        }, 1000);

        // Logic
        this.querySelector('#btn-cookie-accept').addEventListener('click', () => {
            localStorage.setItem('jacquin_cookies_accepted', 'true');
            const banner = this.querySelector('#cookie-banner');
            banner.style.transform = 'translateY(20px)';
            banner.style.opacity = '0';
            setTimeout(() => banner.remove(), 500);
        });
    }
}

customElements.define('jam-cookie-banner', CookieBanner);
