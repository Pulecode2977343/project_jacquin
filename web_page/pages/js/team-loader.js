document.addEventListener('DOMContentLoaded', () => {
    loadTeamMembers();
});

async function loadTeamMembers() {
    const gridContainer = document.getElementById('team-grid');
    if (!gridContainer) return;

    try {
        if (typeof ApiService === 'undefined') {
            console.error("ApiService no está cargado. Asegúrate de incluir api.js");
            gridContainer.innerHTML = '<p style="color:red; text-align:center;">Error de configuración: ApiService no encontrado.</p>';
            return;
        }

        // 1. Petición a la API real (Backend PHP)
        // Usamos getUsers que ya trae todos los usuarios, luego filtramos por rol docente/admin
        const response = await ApiService.getUsers();

        if (!response.success) {
            throw new Error(response.message || 'Error al conectar con el servidor');
        }

        // 2. Filtrar lista (Administradores y Docentes)
        // Rol 1: Admin, Rol 2: Docente
        const members = response.data.filter(u => u.id_rol == 1 || u.id_rol == 2);

        // 3. Limpiar el contenedor
        gridContainer.innerHTML = '';

        if (members.length === 0) {
            gridContainer.innerHTML = '<p style="text-align:center; color: #aaa;">No hay miembros del equipo visibles.</p>';
            return;
        }

        // 4. Recorrer la lista y crear tarjetas
        members.forEach(member => {
            // Construir URL de avatar segura
            const avatarUrl = member.avatar_url
                ? (member.avatar_url.startsWith('http') ? member.avatar_url : ApiService.BASE_URL + member.avatar_url)
                : 'assets/images/default_avatar.svg';

            // Mapeo de roles
            const roleName = member.id_rol == 1 ? 'Directivo / Admin' : 'Docente';

            // Creamos el HTML de la tarjeta
            const cardHTML = `
                <div class="member-card">
                    <div class="member-avatar">
                         <img src="${avatarUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" onerror="this.src='../assets/images/default_avatar.svg'">
                    </div>
                    <h3 class="member-name">${member.full_name}</h3>
                    <div class="member-role">${roleName}</div>
                    <p class="member-email">${member.email}</p>
                </div>
            `;

            // 5. Inyectar en el grid
            gridContainer.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (error) {
        console.error(error);
        gridContainer.innerHTML = `
            <p style="color: var(--naranja-neon); text-align: center; grid-column: 1/-1;">
                No se pudo cargar la información del equipo. ${error.message}
            </p>
        `;
    }
}