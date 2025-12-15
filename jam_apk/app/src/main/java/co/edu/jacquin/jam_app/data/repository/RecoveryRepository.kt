package co.edu.jacquin.jam_app.data.repository

import co.edu.jacquin.jam_app.data.remote.JamApiService
import co.edu.jacquin.jam_app.data.remote.dto.RecoveryEmailRequest
import co.edu.jacquin.jam_app.data.remote.dto.RecoveryGenericResponse
import co.edu.jacquin.jam_app.data.remote.dto.RecoveryResetPasswordRequest
import co.edu.jacquin.jam_app.data.remote.dto.RecoveryVerifyCodeRequest

class RecoveryRepository(
    private val api: JamApiService
) {
    suspend fun requestCode(email: String): RecoveryGenericResponse {
        val responseBody = api.requestRecoveryCode(RecoveryEmailRequest(email.trim()))
        val rawJson = responseBody.string() // Lee el contenido real (HTML, texto, JSON)
        try {
            return com.google.gson.Gson().fromJson(rawJson, RecoveryGenericResponse::class.java)
        } catch (e: Exception) {
            // Si falla el parseo, lanzamos error con el contenido RAW para que el usuario lo vea
            throw Exception("Respuesta inválida del servidor: $rawJson")
        }
    }

    suspend fun verifyCode(email: String, code: String): RecoveryGenericResponse {
        return api.verifyRecoveryCode(RecoveryVerifyCodeRequest(email.trim(), code.trim()))
    }

    suspend fun resetPassword(email: String, code: String, newPassword: String): RecoveryGenericResponse {
        return api.resetPassword(
            RecoveryResetPasswordRequest(
                email = email.trim(),
                code = code.trim(),
                newPassword = newPassword
            )
        )
    }
}
