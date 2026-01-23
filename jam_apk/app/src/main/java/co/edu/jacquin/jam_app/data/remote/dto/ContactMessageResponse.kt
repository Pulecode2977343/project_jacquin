package co.edu.jacquin.jam_app.data.remote.dto

/**
 * Respuesta típica del backend:
 *  - success: true/false (a veces null)
 *  - message: string
 *  - error: string
 */
data class ContactMessageResponse(
    val success: Boolean? = null,
    val message: String? = null,
    val error: String? = null
) {
    fun bestMessage(): String =
        message?.takeIf { it.isNotBlank() }
            ?: error?.takeIf { it.isNotBlank() }
            ?: "No fue posible enviar tu mensaje. Intenta nuevamente."
}
