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
        return api.requestRecoveryCode(RecoveryEmailRequest(email.trim()))
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
