package co.edu.jacquin.jam_app.data.repository

import co.edu.jacquin.jam_app.data.remote.JamApiService
import co.edu.jacquin.jam_app.data.remote.dto.UserDto
import co.edu.jacquin.jam_app.data.remote.dto.UpdateRoleRequest

class AdminRepository(private val api: JamApiService) {

    suspend fun getUsers(): List<UserDto> {
        return try {
            val response = api.getUsers()
            if (response.success && response.data != null) {
                response.data
            } else {
                throw Exception(response.message ?: "Error desconocido al obtener usuarios")
            }
        } catch (e: Exception) {
            throw Exception("Fallo al cargar usuarios: ${e.localizedMessage}")
        }
    }

    suspend fun updateUserRole(userId: Int, newRoleId: Int): String {
        return try {
            val response = api.updateUserRole(UpdateRoleRequest(userId, newRoleId))
            if (response.success == true) {
                response.message ?: "Rol actualizado"
            } else {
                throw Exception(response.message ?: "No se pudo actualizar el rol")
            }
        } catch (e: Exception) {
            throw Exception("Error de conexión: ${e.localizedMessage}")
        }
    }
}
