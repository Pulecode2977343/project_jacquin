/**
 * Admin Professors Logic
 * Handles filtering and displaying users with Role 2 (Docente)
 */

document.addEventListener("DOMContentLoaded", async () => {
    // Security check (redundant but safe)
    if (!window.ApiService || !window.ApiService.isAuthenticated()) return;
    const user = window.ApiService.getSession();
    if (user.id_rol != 1) return;

    loadProfessors();
});

async function loadProfessors() {
    const tableBody = document.querySelector("#professors-table tbody");
    if(!tableBody) return; // verification

    const response = await ApiService.getUsers(); // Reusing existing API call

    if (response.success && response.data) {
        // Filter for Role 2 (Docente)
        const professors = response.data.filter(u => u.id_rol == 2);
        
        if(professors.length > 0) {
            tableBody.innerHTML = ""; // Clear loading
            professors.forEach(p => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${p.id_usuario}</td>
                    <td>
                        <div style="font-weight:bold;">${p.full_name}</div>
                        <div style="font-size:0.8rem; opacity:0.7;">Docente</div>
                    </td>
                    <td>${p.email}</td>
                    <td>
                        <button class="btn-action" onclick="goToAssign('${p.id_usuario}')" title="Asignar Curso">
                            <i class="bi bi-journal-plus"></i> Asignar
                        </button>
                        <button class="btn-action" onclick="deleteProfessor(${p.id_usuario}, '${p.full_name}')" style="margin-left:5px; border-color:#e74c3c; color:#e74c3c;" title="Eliminar Profesor">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; padding: 2rem;">
                        <i class="bi bi-info-circle" style="font-size: 2rem; display: block; margin-bottom: 10px; color: var(--color-acento-naranja);"></i>
                        No hay profesores registrados (Rol 2).<br>
                        <small style="opacity: 0.7;">Vaya a la sección <b>Usuarios</b> y cambie el rol a "Docente" para verlos aquí.</small>
                    </td>
                </tr>`;
        }

    } else {
        tableBody.innerHTML = `<tr><td colspan="4">Error cargando datos.</td></tr>`;
    }
}

window.deleteProfessor = async function(userId, userName) {
    if (!confirm(`¿Eliminar al profesor "${userName}"?\n\nEsta acción es irreversible.`)) return;
    
    // Reuse admin_users logic via ApiService
    const result = await ApiService.deleteUser(userId);
    if (result.success) {
        alert("Profesor eliminado correctamente");
        loadProfessors(); // Reload this table
        // Optional: Reload main user table if needed, calling loadUsers() if available globally
    } else {
        alert("Error: " + result.message);
    }
};

window.goToAssign = function(userId) {
    window.location.href = `admin_academic.html?teacher_id=${userId}`;
};
