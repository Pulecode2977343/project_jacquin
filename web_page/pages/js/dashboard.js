/**
 * Dashboard Logic
 * Handles Role-Based Access Control (RBAC) and UI population.
 */

document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. Auth Check
    if (!ApiService.isAuthenticated()) {
        window.location.href = "login.html";
        return;
    }

    const user = ApiService.getSession();
    console.log("Dashboard User:", user);

    // 2. Populate User Widget
    const roleNames = {
        1: "Administrador",
        2: "Docente",
        3: "Estudiante",
        4: "Aspirante"
    };

    const userNameEl = document.getElementById("user-name");
    const userRoleEl = document.getElementById("user-role");
    const userWidget = document.getElementById("user-widget");

    if (userNameEl && user) {
        userNameEl.textContent = user.full_name || user.email;
        userRoleEl.textContent = roleNames[user.id_rol] || "Usuario";
        userWidget.style.display = "block"; // Show widget
    }

    // 3. RBAC: Module Visibility
    // Default: Hide protected modules (already hidden in HTML via style="display:none")
    // We only need to SHOW what they are allowed to see.

    const modAdmin = document.getElementById("mod-admin");
    const modProfes = document.getElementById("mod-profesores");
    const modEstudiantes = document.getElementById("mod-estudiantes");
    const modInteresados = document.getElementById("mod-interesados");

    const roleId = parseInt(user.id_rol);

    switch (roleId) {
        case 1: // ADMIN
            show(modAdmin);
            show(modProfes);
            show(modEstudiantes);
            show(modInteresados);
            break;

        case 2: // DOCENTE
            show(modProfes);
            break;

        case 3: // ESTUDIANTE
            show(modEstudiantes);
            break;
            
        default: // ASPIRANTE / GUEST
            show(modInteresados);
            break;
    }

    // Link Modules to Real Pages
    if (modAdmin) {
        modAdmin.onclick = () => window.location.href = "admin_users.html";
        modAdmin.style.cursor = "pointer";
    }

    if (modProfes) {
        modProfes.onclick = () => window.location.href = "profesores.html";
        modProfes.style.cursor = "pointer";
    }

    if (modEstudiantes) {
        modEstudiantes.onclick = () => window.location.href = "estudiantes.html";
        modEstudiantes.style.cursor = "pointer";
    }

    if (modInteresados) {
        // Keep or redirect to contact? Let's redirect to contact for now as "Consultar"
        modInteresados.onclick = () => window.location.href = "contactanos.html";
        modInteresados.style.cursor = "pointer";
    }
});

function show(element) {
    if (element) {
        element.style.display = "flex"; // Restore display (flex for bento cards)
    }
}

// Override the generic 'accesoModulo' if needed, or stick to script.js logic.
// Ideally, we replace the onclicks with logic here, but keeping legacy compatibility for now.
