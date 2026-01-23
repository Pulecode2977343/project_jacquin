package co.edu.jacquin.jam_app.data.remote.dto

/**
 * Respuesta del backend para login.php (robusta):
 * - En éxito suele venir: success=true, message, user:{...}
 * - En fallos a veces viene: success=false, error:"..."
 * - Algunos backends devuelven el usuario en "data" en vez de "user"
 */
data class LoginResponse(
    val success: Boolean? = null,
    val message: String? = null,
    val error: String? = null,
    val user: UserDto? = null,
    val data: UserDto? = null,
) {
    fun bestMessage(): String =
        message?.takeIf { it.isNotBlank() }
            ?: error?.takeIf { it.isNotBlank() }
            ?: "Ocurrió un problema. Intenta nuevamente."

    fun bestUser(): UserDto? = user ?: data
}
