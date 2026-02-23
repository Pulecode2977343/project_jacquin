// cookies-banner.js â€” versiÃ³n con panel modal
document.addEventListener('DOMContentLoaded', () => {
  // --- Crear Banner principal ---
  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-content">
      <p>
        ðŸª Usamos cookies para mejorar su experiencia, analizar el uso del sitio y mostrar contenido relevante.
        Puede aceptar todas, rechazarlas o configurar sus preferencias.
        Consulte nuestra <a href="cookies.html" target="_blank">PolÃ­tica de Cookies</a>.
      </p>
      <div class="cookie-buttons">
        <button id="acceptAll">Aceptar todas</button>
        <button id="settings">Configurar</button>
        <button id="rejectAll" class="reject">Rechazar todas</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  // --- Crear Modal de configuraciÃ³n ---
  const modal = document.createElement('div');
  modal.id = 'cookie-modal';
  modal.className = 'cookie-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>ConfiguraciÃ³n de Cookies</h3>
      <p>
      Elija los tipos de cookies que desea permitir. Puede modificar esta configuraciÃ³n en cualquier momento.  
      Consulte nuestra <a href="cookies.html" target="_blank">PolÃ­tica de Cookies</a> para mÃ¡s informaciÃ³n.
      </p>

      <form id="cookieForm">
        <label><input type="checkbox" id="functional" checked disabled /> Funcionales (necesarias)</label><br>
        <label><input type="checkbox" id="analytics" /> AnalÃ­ticas</label><br>
        <label><input type="checkbox" id="marketing" /> Marketing</label>
      </form>
      <div class="modal-actions">
        <button id="saveSettings">Guardar preferencias</button>
        <button id="cancelSettings" class="cancel">Cancelar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // --- Mostrar banner solo si no hay decisiÃ³n previa ---
  const prefs = JSON.parse(localStorage.getItem('cookie-preferences') || '{}');
  if (!prefs.decision) banner.style.display = 'block';

  // --- Acciones de botones del banner ---
  document.getElementById('acceptAll').addEventListener('click', () => {
    localStorage.setItem('cookie-preferences', JSON.stringify({
      functional: true,
      analytics: true,
      marketing: true,
      decision: true
    }));
    banner.style.display = 'none';
  });

  document.getElementById('rejectAll').addEventListener('click', () => {
    localStorage.setItem('cookie-preferences', JSON.stringify({
      functional: true,
      analytics: false,
      marketing: false,
      decision: true
    }));
    banner.style.display = 'none';
  });

  document.getElementById('settings').addEventListener('click', () => {
    modal.style.display = 'flex';
  });

  // --- Acciones del modal ---
  document.getElementById('saveSettings').addEventListener('click', () => {
    const analytics = document.getElementById('analytics').checked;
    const marketing = document.getElementById('marketing').checked;
    localStorage.setItem('cookie-preferences', JSON.stringify({
      functional: true,
      analytics,
      marketing,
      decision: true
    }));
    modal.style.display = 'none';
    banner.style.display = 'none';
  });

  document.getElementById('cancelSettings').addEventListener('click', () => {
    modal.style.display = 'none';
  });
});