class Footer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <footer class="jam-footer">
            <div class="jam-footer-bg"></div> <!-- Nuevo: Fondo animado independiente -->
            <div class="jam-footer-content">
                <!-- Columna 1: Marca e Identidad -->
                <div class="jam-footer-brand">
                <div class="footer-logo">
                        <img src="logo_hr_jam.svg" alt="Academia Musical JACQUIN" class="footer-logo-img" style="height: 40px; width: auto; filter: brightness(0) invert(1);">
                    </div>
                    <p class="brand-desc">
                        Donde la pasión se encuentra con la excelencia. Formando la próxima generación de artistas integrales en un entorno inspirador y profesional.
                    </p>
                    <div class="jam-status-badge">
                        <span class="pulse-dot"></span>
                        <span>Matrículas Abiertas 2026</span>
                    </div>
                </div>

                <!-- Columna 2: Navegación -->
                <div class="jam-footer-col">
                    <h3>Descubre</h3>
                    <ul class="jam-footer-links">
                        <li><a href="index.html#programas" class="hover-link">Nuestros Programas</a></li>
                        <li><a href="index.html#eventos" class="hover-link">Agenda de Eventos</a></li>
                        <li><a href="index.html#nosotros" class="hover-link">Sobre Nosotros</a></li>
                        <li><a href="galeria.html" class="hover-link">Galería Multimedia</a></li>
                    </ul>
                </div>

                <!-- Columna 3: Estudiantes y Legal -->
                <div class="jam-footer-col">
                    <h3>Comunidad</h3>
                    <ul class="jam-footer-links">
                        <li><a href="login.html" class="hover-link"><i class="bi bi-person-circle"></i> Portal Estudiantes</a></li>
                        <li><a href="registro.html" class="hover-link"><i class="bi bi-pencil-square"></i> Inscripciones</a></li>
                        <li><a href="terminos.html" class="hover-link">Términos y Condiciones</a></li>
                        <li><a href="politicas.html" class="hover-link">Política de Privacidad</a></li>
                    </ul>
                </div>

                <!-- Columna 4: Contacto y Social -->
                <div class="jam-footer-col contact-col">
                    <h3>Conectemos</h3>
                    <div class="contact-info">
                        <div class="contact-item">
                            <div class="icon-box"><i class="bi bi-geo-alt-fill"></i></div>
                            <div>
                                <span class="label">Visítanos</span>
                                <span class="value">Calle 29 # 5A - 33, Santa Marta</span>
                            </div>
                        </div>
                        <div class="contact-item">
                            <div class="icon-box"><i class="bi bi-whatsapp"></i></div>
                            <div>
                                <span class="label">Escríbenos</span>
                                <span class="value">+57 304 232 8575</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="social-links-premium">
                        <a href="https://www.facebook.com/academiamusicaljacquin" target="_blank" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                        <a href="https://www.instagram.com/academiamusicaljacquin" target="_blank" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
                        <a href="https://www.tiktok.com/@academiamusicaljacquin" target="_blank" aria-label="TikTok"><i class="bi bi-tiktok"></i></a>
                        <a href="https://wa.me/573042328575" target="_blank" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>
                    </div>
                </div>
            </div>

            <div class="jam-footer-bottom">
                <div class="copyright">
                    &copy; ${new Date().getFullYear()} <strong>Jacquin Academia Musical</strong>. <span class="rights">Todos los derechos reservados.</span>
                </div>
                <div class="footer-bottom-links">
                    <a href="contactanos.html">Soporte</a>
                    <span class="separator">•</span>
                    <a href="index.html#programas">Mapa del Sitio</a>
                </div>
            </div>
        </footer>
        `;
    }
}

customElements.define('jam-footer', Footer);
