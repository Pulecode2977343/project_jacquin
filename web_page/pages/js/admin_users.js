/**
 * Admin Logic
 * Handles User Listing and Role Updates
 */

document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. Security Check
    if (!ApiService.isAuthenticated()) {
        window.location.href = "login.html";
        return;
    }
    const user = ApiService.getSession();
    if (user.id_rol != 1) {
        alert("Acceso denegado. Solo administradores.");
        window.location.href = "gestion.html";
        return;
    }

    // 2. Load Users
    loadUsers();
});

async function loadUsers() {
    const tableBody = document.querySelector("#users-table tbody");
    const response = await ApiService.getUsers();

    if (response.success && response.data) {
        tableBody.innerHTML = ""; // Clear loading
        response.data.forEach(u => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${u.id_usuario}</td>
                <td>${u.full_name}</td>
                <td>${u.email}</td>
                <td><span class="role-badge role-${u.id_rol}">${getRoleName(u.id_rol)}</span></td>
                <td>
                    <button class="btn-action" onclick="changeRole(${u.id_usuario}, '${u.full_name}')">
                        <i class="bi bi-pencil"></i> Editar Rol
                    </button>
                    <button class="btn-action" onclick="deleteUser(${u.id_usuario}, '${u.full_name}')" style="margin-left: 10px; border-color: #e74c3c; color: #e74c3c;">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        tableBody.innerHTML = `<tr><td colspan="5">Error: ${response.message || 'No se pudieron cargar usuarios'}</td></tr>`;
    }
}

function getRoleName(id) {
    const map = { 1: "Admin", 2: "Docente", 3: "Estudiante", 4: "Aspirante" };
    return map[id] || "Desc.";
}

window.changeRole = async function(userId, userName) {
    const newRole = prompt(`Ingrese el ID del nuevo rol para ${userName}:\n1: Admin\n2: Docente\n3: Estudiante`);
    
    if (newRole && ["1","2","3"].includes(newRole)) {
        const result = await ApiService.updateUserRole(userId, newRole);
        if (result.success) {
            alert("Rol actualizado correctamente");
            loadUsers(); // Refresh
        } else {
            alert("Error: " + result.message);
        }
    } else if (newRole) {
        alert("ID de rol inválido.");
    }
};

window.deleteUser = async function(userId, userName) {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${userName}"?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }
    
    const result = await ApiService.deleteUser(userId);
    if (result.success) {
        alert("Usuario eliminado correctamente");
        loadUsers(); // Refresh
    } else {
        alert("Error: " + result.message);
    }
};
