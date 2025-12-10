package co.edu.jacquin.jam_app.data.remote.dto

// Respuesta genérica de la API JAM
data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T? = null
)
