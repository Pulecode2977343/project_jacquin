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
        val response = api.requestRecoveryCode(RecoveryEmailRequest(email.trim()))
        
        // Si hay error (4xx, 5xx), leemos el errorBody
        if (!response.isSuccessful) {
            val errorContent = response.errorBody()?.string() ?: "Error ${response.code()}"
            throw Exception("Fallo Servidor (${response.code()}): $errorContent")
        }

        // Si es exitoso, leemos el body normal
        val rawJson = response.body()?.string() ?: ""
        try {
            return com.google.gson.Gson().fromJson(rawJson, RecoveryGenericResponse::class.java)
        } catch (e: Exception) {
            throw Exception("JSON inválido: $rawJson")
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
