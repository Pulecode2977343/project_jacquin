package co.edu.jacquin.jam_app.data.repository

import co.edu.jacquin.jam_app.core.JamResult
import co.edu.jacquin.jam_app.data.remote.JamApiService
import co.edu.jacquin.jam_app.data.remote.dto.LoginRequest
import co.edu.jacquin.jam_app.data.remote.dto.RegisterRequest
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
                    val safeMsg = response.message
                        ?.takeIf { it.isNotBlank() }
                        ?: "Usuario o contraseña incorrectos. Intenta de nuevo."
                    JamResult.Error(safeMsg)
                }
            } catch (e: Exception) {
                val safeMsg = e.message
                    ?.takeIf { it.isNotBlank() }
                    ?: "Error de conexión con el servidor"
                JamResult.Error(safeMsg)
            }
        }
    }

    suspend fun register(fullName: String, email: String, phone: String, password: String): JamResult<String> {
        return withContext(Dispatchers.IO) {
            try {
                val response = api.register(
                    RegisterRequest(
                        fullName = fullName,
                        email = email,
                        nPhone = phone,
                        password = password
                    )
                )

                if (response.success == true) {
                    JamResult.Success(response.message ?: "Usuario registrado correctamente.")
                } else {
                    val safeMsg = response.error
                        ?: response.message
                        ?: "No se pudo registrar el usuario. Intenta de nuevo."
                    JamResult.Error(safeMsg)
                }
            } catch (e: Exception) {
                val safeMsg = e.message
                    ?.takeIf { it.isNotBlank() }
                    ?: "Error de conexión con el servidor"
                JamResult.Error(safeMsg)
            }
        }
    }
}
