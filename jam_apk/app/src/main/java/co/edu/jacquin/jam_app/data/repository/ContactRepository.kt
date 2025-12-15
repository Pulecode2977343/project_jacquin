package co.edu.jacquin.jam_app.data.repository

import co.edu.jacquin.jam_app.core.JamResult
import co.edu.jacquin.jam_app.data.remote.JamApiService
import co.edu.jacquin.jam_app.data.remote.dto.ContactMessageRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.IOException

class ContactRepository(
    private val api: JamApiService
) {
    suspend fun sendMessage(
        fullName: String,
        email: String,
        phoneE164: String,
        message: String,
        acceptTerms: Boolean
    ): JamResult<String> {
        return withContext(Dispatchers.IO) {
            try {
                val response = api.sendContactMessage(
                    ContactMessageRequest(
                        fullName = fullName.trim(),
                        email = email.trim(),
                        nPhone = phoneE164.trim(),
                        message = message.trim(),
                        acceptTerms = acceptTerms
                    )
                )

                if (response.success == true) JamResult.Success(response.bestMessage())
                else JamResult.Error(response.bestMessage())
            } catch (e: IOException) {
                JamResult.Error("No se pudo conectar con el servidor. Verifica tu red e intenta de nuevo.")
            } catch (e: Exception) {
                JamResult.Error(e.message?.takeIf { it.isNotBlank() }
                    ?: "Error inesperado. Intenta de nuevo.")
            }
        }
    }
}
