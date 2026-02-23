document.addEventListener('DOMContentLoaded', async () => {

    // Check Auth and Admin Role (Rol 1)
    if (!ApiService.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    const user = ApiService.getSession();
    if (user.id_rol != 1) {
        Swal.fire({
            title: "Acceso denegado",
            text: "Solo administradores pueden acceder a esta sección.",
            icon: "error",
            background: '#1a1a1a',
            color: '#fff'
        }).then(() => {
            window.location.href = 'gestion.html';
        });
        return;
    }

    const tableBody = document.querySelector("#inventory-table tbody");
    const addForm = document.getElementById("addForm");

    // Load Items
    async function loadInventory() {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">Cargando...</td></tr>';

        const items = await ApiService.getInventory();

        tableBody.innerHTML = ''; // Clear loading

        if (items.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No hay ítems registrados.</td></tr>';
            return;
        }

        items.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong style="color:white;">${item.nombre}</strong><br><small style="color:#aaa;">${item.descripcion || ''}</small></td>
                <td>${item.tipo}</td>
                <td>${item.serial || 'N/A'}</td>
                <td><span class="badge-estado estado-${item.estado}">${item.estado}</span></td>
                <td>
                    <button class="btn-action" onclick="deleteItem(${item.id_item})" title="Eliminar" style="border: 1px solid #e74c3c; color: #e74c3c;">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Add Item
    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newItem = {
            nombre: document.getElementById("nombre").value,
            tipo: document.getElementById("tipo").value,
            serial: document.getElementById("serial").value,
            estado: document.getElementById("estado").value,
            // fecha_adquisicion could be added if input exists
        };

        Swal.fire({
            title: "¿Guardar este ítem?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'var(--color-acento-azul)',
            cancelButtonColor: '#444',
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            background: '#1a1a1a',
            color: '#fff'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const resultApi = await ApiService.addInventoryItem(newItem);
                if (resultApi.success) {
                    Swal.fire({
                        title: "¡Éxito!",
                        text: "Ítem agregado correctamente.",
                        icon: "success",
                        background: '#1a1a1a',
                        color: '#fff'
                    });
                    closeModal();
                    loadInventory();
                    addForm.reset();
                } else {
                    Swal.fire({
                        title: "Error",
                        text: resultApi.message,
                        icon: "error",
                        background: '#1a1a1a',
                        color: '#fff'
                    });
                }
            }
        });
    });

    // Delete Item
    window.deleteItem = async (id) => {
        Swal.fire({
            title: "¿Estás seguro de ELIMINAR este ítem?",
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1a1a1a',
            color: '#fff'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const resultApi = await ApiService.deleteInventoryItem(id);
                if (resultApi.success) {
                    Swal.fire({
                        title: "¡Eliminado!",
                        text: "El ítem ha sido borrado del inventario.",
                        icon: "success",
                        background: '#1a1a1a',
                        color: '#fff'
                    });
                    loadInventory();
                } else {
                    Swal.fire({
                        title: "Error",
                        text: resultApi.message,
                        icon: "error",
                        background: '#1a1a1a',
                        color: '#fff'
                    });
                }
            }
        });
    };

    // Modal Logic
    window.openModal = () => {
        document.getElementById("addModal").style.display = "flex";
    };

    window.closeModal = () => {
        document.getElementById("addModal").style.display = "none";
    };

    // Initial Load
    loadInventory();
});
