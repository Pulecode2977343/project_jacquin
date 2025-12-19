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

    const modProfes = document.getElementById("mod-profesores"); // Now "Users"
    const modEvents = document.getElementById("mod-events");
    const modAcademic = document.getElementById("mod-academic");
    const modInteresados = document.getElementById("mod-interesados");

    const roleId = parseInt(user.id_rol);

    switch (roleId) {
        case 1: // ADMIN
            show(modProfes);
            show(modEvents);
            show(modAcademic);
            show(modInteresados);
            
            // Show the combined Admin Container
            const adminContainer = document.getElementById("admin-modules-container");
            if(adminContainer) adminContainer.style.display = "block";
            break;

        case 2: // DOCENTE
            show(modProfes);
            // Docentes might need access to Academic too? For now, stick to original.
            break;

        case 3: // ESTUDIANTE
            // Currently no dedicated module for students in this dashboard
            break;
            
        default: // ASPIRANTE / GUEST
            show(modInteresados);
            break;
    }

    // Link Modules to Real Pages
    
    if (modProfes) {
        if (roleId === 1) {
            // Admin: Scroll to Users Directory
            modProfes.onclick = () => {
                const section = document.getElementById('section-directory');
                if(section) section.scrollIntoView({ behavior: 'smooth' });
            };
        } else {
            // Others (Docentes): Go to external page or their view
            // Assuming simplified view for now or same logic
             modProfes.onclick = () => {
                const section = document.getElementById('section-directory'); // They can see it too (read only logic inside)
                if(section) section.scrollIntoView({ behavior: 'smooth' });
            };
        }
        modProfes.style.cursor = "pointer";
    }

    if (modEvents) {
        modEvents.onclick = () => {
            const section = document.getElementById('section-events');
            if(section) section.scrollIntoView({ behavior: 'smooth' });
        };
        modEvents.style.cursor = "pointer";
    }

    if (modAcademic) {
        modAcademic.onclick = () => {
            const section = document.getElementById('section-academic');
            if(section) section.scrollIntoView({ behavior: 'smooth' });
        };
        modAcademic.style.cursor = "pointer";
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
