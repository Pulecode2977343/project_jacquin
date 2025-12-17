class Footer extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Jacquin Academia Musical</h4>
                    <p>Formando artistas integrales con pasión y excelencia.</p>
                    <div class="footer-info-extra">
                        <p><i class="bi bi-clock"></i> Lun - Vie: 3pm - 6pm</p>
                        <p><i class="bi bi-clock"></i> Sáb: 9am - 12pm</p>
                        <p><i class="bi bi-geo-alt"></i> Santa Marta, Calle 29 # 5A - 33</p>
                    </div>
                </div>
                
                <div class="footer-section">
                    <h4>Contáctanos</h4>
                    <ul class="contact-list">
                        <li>
                            <i class="bi bi-telephone"></i> 
                            <span>+57 304 232 8575</span>
                        </li>
                        <li>
                            <i class="bi bi-envelope"></i> 
                            <span>adminadmin@jacquin.com.co</span>
                        </li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h4>Síguenos</h4>
                    <div class="social-icons">
                        <a href="https://www.facebook.com/academiamusicaljacquin/?locale=es_LA" target="_blank" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                        <a href="https://www.instagram.com/academiamusicaljacquin/?hl=es-la" target="_blank" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
                        <a href="https://www.tiktok.com/@academiamusicaljacquin" target="_blank" aria-label="TikTok"><i class="bi bi-tiktok"></i></a>
                        <a href="https://wa.me/573042328575" target="_blank" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>
                    </div>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Jacquin Academia Musical. Todos los derechos reservados.</p>
                <div class="footer-links">
                    <a href="terms.html">Términos</a>
                    <a href="dataPolicy.html">Privacidad</a>
                    <a href="contactanos.html">Soporte</a>
                </div>
            </div>
        </footer>
        `;
    }
}

customElements.define('jam-footer', Footer);
