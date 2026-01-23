package co.edu.jacquin.jam_app.data.remote.dto

data class AdminUserListResponse(
    val success: Boolean,
    val data: List<UserDto>? = null, // Reutilizamos UserDto
    val message: String? = null
)

data class UpdateRoleRequest(
    val id_usuario: Int,
    val id_rol: Int
)
