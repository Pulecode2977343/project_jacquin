document.addEventListener('DOMContentLoaded', () => {
    loadTeamMembers();
});

async function loadTeamMembers() {
    const gridContainer = document.getElementById('team-grid');
    
    try {
        // 1. Petición a tu API (Backend)
        const response = await fetch('http://localhost:3000/api/empleados');
        
        if (!response.ok) {
            throw new Error('Error al conectar con el servidor');
        }

        // 2. Convertir a JSON (Lista de usuarios)
        const members = await response.json();

        // 3. Limpiar el mensaje de "Cargando..."
        gridContainer.innerHTML = '';

        // 4. Recorrer la lista y crear tarjetas
        members.forEach(member => {
            // Creamos el HTML de la tarjeta
            const cardHTML = `
                <div class="member-card">
                    <div class="member-avatar">
                        <i class="bi bi-person"></i> <span>${member.nombre.charAt(0)}${member.apellido.charAt(0)}</span>
                    </div>
                    <h3 class="member-name">${member.nombre} ${member.apellido}</h3>
                    <div class="member-role">
                        ${member.id_rol === 1 ? 'Administrador' : 
                          member.id_rol === 2 ? 'Profesor' : 'Estudiante'}
                    </div>
                    <p class="member-email">${member.correo_electronico}</p>
                </div>
            `;
            
            // 5. Inyectar en el grid
            gridContainer.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (error) {
        console.error(error);
        gridContainer.innerHTML = `
            <p style="color: var(--naranja-neon); text-align: center; grid-column: 1/-1;">
                Error al cargar el equipo. Asegúrate de que el backend esté corriendo.
            </p>
        `;
    }
}