package co.edu.jacquin.jam_app.data.remote.dto

// Usuario según la respuesta actual del login
data class UserDto(
    val id_usuario: Int,
    val full_name: String,
    val email: String,
    val id_rol: Int
)
