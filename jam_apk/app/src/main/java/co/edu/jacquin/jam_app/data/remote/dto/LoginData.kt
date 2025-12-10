package co.edu.jacquin.jam_app.data.remote.dto

// Lo que devuelve tu API al hacer login
data class LoginData(
    val user: UserDto,
    val token: String?,      // si manejas token/JWT, si no puedes dejarlo como String?
    val role_name: String?   // "admin", "profesor", "estudiante" (opcional)
)
