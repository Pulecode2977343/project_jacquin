/**
 * Admin Users Logic - Phase 1 Redesign
 * Features:
 * - Modern table render with avatars
 * - Role-based filters (5 roles)
 * - Stats counters
 * - Search functionality
 */

console.log("Admin Users v4.1 Loaded");

// Safe global declaration
window.allUsers = window.allUsers || [];
let currentRoleFilter = 'all';

// ====================================
// MIGRACIÓN REACT: Función de retorno
// ====================================
function getReturnURL() {
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get('return_to');
    return returnTo || '/dashboard'; // Por defecto volver a dashboard
}

// Exportar función global para botones de volver
window.goBack = function() {
    const returnURL = getReturnURL();
    if (returnURL.startsWith('/')) {
        // React SPA route
        window.location.href = returnURL;
    } else {
        window.location.href = returnURL;
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    if (!ApiService.isAuthenticated()) {
        window.location.href = "login.html";
        return;
    }
    const user = ApiService.getSession();
    if (user.id_rol != 1) {
        // PERMITIR carga en el dashboard (gestion.html) para uso de funciones compartidas (Directorio)
        if (window.location.pathname.includes('gestion.html')) {
            console.log("Admin Users logic loaded in Dashboard context (Role " + user.id_rol + ")");
            // No auto-init full table, wait for dashboard.js to call loadUsers()
            return;
        }

        console.warn("Acceso denegado: Usuario no es admin.");
        window.location.href = "index.html";
        return;
    }

    await loadUsers();
    setupEventListeners();
});

function setupEventListeners() {
    // Search
    const searchInput = document.getElementById("user-search");
    if (searchInput) {
        searchInput.addEventListener("input", () => applyFilters());
    }

    // Role filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRoleFilter = btn.dataset.role;
            applyFilters();
        });
    });
}

async function loadUsers() {
    const tableBody = document.querySelector("#users-table tbody");
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr class="loading-row">
            <td colspan="5">
                <div class="loading-spinner"></div>
                <div style="margin-top: 15px;">Cargando usuarios...</div>
            </td>
        </tr>
    `;

    const response = await ApiService.getUsers();

    if (response.success && response.data) {
        window.allUsers = response.data;
        updateStats();
        applyFilters();
    } else {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:40px;">
                    <i class="bi bi-exclamation-triangle" style="font-size:2rem; color:#e74c3c; display:block; margin-bottom:10px;"></i>
                    <div style="color:#e74c3c;">Error: ${response.message || 'No se pudieron cargar usuarios'}</div>
                </td>
            </tr>
        `;
    }
}

function updateStats() {
    const total = window.allUsers.length;
    const students = window.allUsers.filter(u => u.id_rol == 3 || u.id_rol == 4).length;
    const teachers = window.allUsers.filter(u => u.id_rol == 2).length;

    const totalEl = document.getElementById('stat-total');
    const studentsEl = document.getElementById('stat-students');
    const teachersEl = document.getElementById('stat-teachers');

    if (totalEl) totalEl.textContent = total;
    if (studentsEl) studentsEl.textContent = students;
    if (teachersEl) teachersEl.textContent = teachers;
}

function applyFilters() {
    const searchQuery = document.getElementById('user-search')?.value?.toLowerCase() || '';

    let filtered = window.allUsers;

    // Role filter
    if (currentRoleFilter !== 'all') {
        filtered = filtered.filter(u => u.id_rol == currentRoleFilter);
    }

    // Search filter
    if (searchQuery) {
        filtered = filtered.filter(u => {
            const name = (u.full_name || '').toLowerCase();
            const email = (u.email || '').toLowerCase();
            const id = (u.id_usuario || '').toString();
            return name.includes(searchQuery) || email.includes(searchQuery) || id.includes(searchQuery);
        });
    }

    renderUsers(filtered);
}

function renderUsers(users) {
    const tableBody = document.querySelector("#users-table tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (!users || !Array.isArray(users)) {
        console.error("renderUsers: Data is not an array", users);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#e74c3c;">Error de datos de usuario.</td></tr>`;
        return;
    }

    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:60px;">
                    <i class="bi bi-inbox" style="font-size:2.5rem; color:rgba(255,255,255,0.2); display:block; margin-bottom:15px;"></i>
                    <div style="color:rgba(255,255,255,0.4);">No se encontraron usuarios</div>
                </td>
            </tr>
        `;
        return;
    }

    users.forEach((u, index) => {
        try {
            if (!u) return;
            const row = document.createElement("tr");
            row.onclick = () => typeof openProfile === 'function' ? openProfile(u.id_usuario) : console.error("openProfile not found");

            const fullName = u.full_name || 'Usuario';
            const email = u.email || 'Sin correo';
            const initials = getInitials(fullName);
            const avatarSrc = ApiService.getAvatarUrl(u.avatar_url);

            const avatarHtml = avatarSrc && !avatarSrc.includes('avatars/default_avatar.svg')
                ? `<img src="${avatarSrc}" alt="Avatar de ${fullName}" title="${fullName}" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex'"> <span style="display:none;">${initials}</span>`
                : initials;

            row.innerHTML = `
                <td><span class="id-badge">#${u.id_usuario || index}</span></td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${avatarHtml}</div>
                        <div class="user-info">
                            <div class="name">${fullName}</div>
                            <div class="email">${email}</div>
                        </div>
                    </div>
                </td>
                <td style="color:rgba(255,255,255,0.5);">${email}</td>
                <td><span class="role-badge role-${u.id_rol}">${getRoleIcon(u.id_rol)} ${getRoleName(u.id_rol)}</span></td>
                <td>
                    <button class="action-btn" onclick="event.stopPropagation(); typeof openProfile === 'function' ? openProfile(${u.id_usuario}) : null" title="Ver Perfil" aria-label="Ver perfil completo de ${fullName}">
                        <i class="bi bi-person-lines-fill"></i> Ver
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        } catch (err) {
            console.error("Error rendering user row at index " + index, err);
        }
    });
}

function getInitials(name) {
    if (!name || typeof name !== 'string') return '??';
    return name.trim().split(' ').filter(n => n).map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function getRoleName(id) {
    const map = {
        1: "Admin",
        2: "Docente",
        3: "Estudiante",
        4: "Aspirante",
        5: "Colaborador"
    };
    return map[id] || "Desconocido";
}

function getRoleIcon(id) {
    const icons = {
        1: '<i class="bi bi-shield-check"></i>',
        2: '<i class="bi bi-person-workspace"></i>',
        3: '<i class="bi bi-mortarboard"></i>',
        4: '<i class="bi bi-hourglass-split"></i>',
        5: '<i class="bi bi-person-badge"></i>'
    };
    return icons[id] || '';
}

// ==========================================
// SHARED MODAL INTEGRATION
// ==========================================

window.deleteUser = async function (userId, userName) {
    if (typeof Swal === 'undefined') {
        if (confirm('\u00bfRealmente desea eliminar a ' + userName + '?')) {
            const res = await ApiService.deleteUser(userId);
            if (res.success) {
                if (window.showToast) showToast("Usuario eliminado", "success");
                loadUsers();
            }
        }
        return;
    }

    const result = await Swal.fire({
        title: '\u00bfEliminar usuario?',
        html: `<p style="color:#aaa;">Se eliminar\u00e1 permanentemente a <strong style="color:white;">${userName}</strong></p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#555',
        confirmButtonText: 'S\u00ed, eliminar',
        cancelButtonText: 'Cancelar',
        background: '#1a1a2e',
        color: '#fff'
    });

    if (!result.isConfirmed) return;

    try {
        const res = await ApiService.deleteUser(userId);
        if (res.success) {
            if (window.showToast) showToast("Usuario eliminado", "success");
            loadUsers();
        } else {
            Swal.fire({
                title: 'Error',
                text: res.message || 'No se pudo eliminar el usuario',
                icon: 'error',
                background: '#1a1a2e',
                color: '#fff'
            });
        }
    } catch (err) {
        console.error("Delete user error:", err);
    }
};

// Reload function for external use
window.loadUsers = loadUsers;
