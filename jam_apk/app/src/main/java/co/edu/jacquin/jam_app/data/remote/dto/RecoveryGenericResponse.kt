package co.edu.jacquin.jam_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * DTO genérico para endpoints de recuperación.
 * Backend puede responder success/message o success/error, así que lo dejamos flexible.
 */
data class RecoveryGenericResponse(
    @SerializedName("success") val success: Boolean? = null,
    @SerializedName("message") val message: String? = null,
    @SerializedName("error") val error: String? = null,
    // Opcional: códigos de error estandarizados si los agregas en PHP
    @SerializedName("code") val code: String? = null
)
