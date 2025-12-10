package co.edu.jacquin.jam_app.data.repository

import co.edu.jacquin.jam_app.core.JamResult
import co.edu.jacquin.jam_app.data.remote.JamApiService
import co.edu.jacquin.jam_app.data.remote.dto.LoginRequest
import co.edu.jacquin.jam_app.data.remote.dto.UserDto
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AuthRepository(
    private val api: JamApiService
) {

    suspend fun login(email: String, password: String): JamResult<UserDto> {
        return withContext(Dispatchers.IO) {
            try {
                val response = api.login(LoginRequest(email, password))

                if (response.success && response.user != null) {
                    JamResult.Success(response.user)
                } else {
                    JamResult.Error(response.message)
                }
            } catch (e: Exception) {
                JamResult.Error(e.message ?: "Error de conexión con el servidor")
            }
        }
    }
}
