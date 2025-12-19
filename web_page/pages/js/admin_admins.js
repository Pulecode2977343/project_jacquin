/**
 * Admin Administrators Logic
 * Handles filtering and displaying users with Role 1 (Administrador)
 */

document.addEventListener("DOMContentLoaded", async () => {
    // Security check
    if (!window.ApiService || !window.ApiService.isAuthenticated()) return;
    const user = window.ApiService.getSession();
    if (user.id_rol != 1) return;

    loadAdmins();
});

window.loadAdmins = async function() {
    const tableBody = document.querySelector("#admins-table tbody");
    if(!tableBody) return;

    const response = await ApiService.getUsers(); 
    const currentUser = ApiService.getSession();

    if (response.success && response.data) {
        // Filter for Role 1 (Admin)
        const admins = response.data.filter(u => u.id_rol == 1);
        
        if(admins.length > 0) {
            tableBody.innerHTML = ""; 
            admins.forEach(p => {
                const isMe = (p.id_usuario == currentUser.id_usuario);
                const row = document.createElement("tr");
                
                let actions = '';
                if(isMe) {
                    actions = `<span style="font-size:0.8rem; color:var(--color-humo-gris);">(Tú)</span>`;
                } else {
                    actions = `
                        <button class="btn-action" onclick="deleteAdmin(${p.id_usuario}, '${p.full_name}')" style="border-color:#e74c3c; color:#e74c3c;" title="Eliminar Administrador">
                            <i class="bi bi-trash"></i>
                        </button>
                    `;
                }

                row.innerHTML = `
                    <td>${p.id_usuario}</td>
                    <td>
                        <div style="font-weight:bold;">${p.full_name}</div>
                        <div style="font-size:0.8rem; opacity:0.7;">Administrador</div>
                    </td>
                    <td>${p.email}</td>
                    <td>${actions}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay administradores (Error extraño).</td></tr>`;
        }

    } else {
        tableBody.innerHTML = `<tr><td colspan="4">Error cargando datos.</td></tr>`;
    }
};

window.deleteAdmin = async function(userId, userName) {
    if (!confirm(`PELIGRO: ¿Eliminar al ADMINISTRADOR "${userName}"?\n\nEsta acción es irreversible y podría perder acceso al sistema si no hay otros admins.`)) return;
    
    const result = await ApiService.deleteUser(userId);
    if (result.success) {
        alert("Administrador eliminado correctamente");
        loadAdmins(); 
    } else {
        alert("Error: " + result.message);
    }
};
