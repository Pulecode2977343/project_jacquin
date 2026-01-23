package co.edu.jacquin.jam_app.data.repository

import co.edu.jacquin.jam_app.core.JamResult
import co.edu.jacquin.jam_app.data.remote.JamApiService
import co.edu.jacquin.jam_app.data.remote.dto.LoginRequest
import co.edu.jacquin.jam_app.data.remote.dto.RegisterRequest
import co.edu.jacquin.jam_app.data.remote.dto.RegisterResponse
import co.edu.jacquin.jam_app.data.remote.dto.UserDto
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.IOException

class AuthRepository(
    private val api: JamApiService
) {

    suspend fun login(email: String, password: String): JamResult<UserDto> {
        return withContext(Dispatchers.IO) {
            try {
                val response = api.login(LoginRequest(email.trim(), password))
                val user = response.bestUser()

                if (response.success == true && user != null) {
                    JamResult.Success(user)
                } else {
                    JamResult.Error(response.bestMessage())
                }
            } catch (e: Exception) {
                handleException(e)
            }
        }
    }

    suspend fun register(
        fullName: String,
        email: String,
        phone: String,
        password: String
    ): JamResult<String> {
        return withContext(Dispatchers.IO) {
            try {
                val response: RegisterResponse = api.register(
                    RegisterRequest(
                        fullName = fullName.trim(),
                        email = email.trim(),
                        nPhone = phone.trim(),
                        password = password
                    )
                )

                if (response.success == true) {
                    JamResult.Success(response.bestMessage())
                } else {
                    JamResult.Error(response.bestMessage())
                }
            } catch (e: Exception) {
                handleException(e)
            }
        }
    }

    private fun <T> handleException(e: Exception): JamResult<T> {
        return when (e) {
            is java.net.ConnectException,
            is java.net.SocketTimeoutException,
            is java.net.UnknownHostException -> {
                JamResult.Error("CONNECTION_ERROR")
            }
            is IOException -> {
                JamResult.Error("No se pudo conectar con el servidor. Verifica tu red.")
            }
            else -> {
                JamResult.Error(e.message?.takeIf { it.isNotBlank() } ?: "Error inesperado.")
            }
        }
    }
}
