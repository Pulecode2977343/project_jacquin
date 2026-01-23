package co.edu.jacquin.jam_app.data.remote.dto

data class RegisterResponse(
    val success: Boolean? = null,
    val message: String? = null,
    val error: String? = null
) {
    fun bestMessage(): String =
        message?.takeIf { it.isNotBlank() }
            ?: error?.takeIf { it.isNotBlank() }
            ?: "Ocurrió un problema. Intenta nuevamente."
}
