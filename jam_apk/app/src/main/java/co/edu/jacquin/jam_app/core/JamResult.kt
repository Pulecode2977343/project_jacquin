package co.edu.jacquin.jam_app.core

// Resultado genérico para llamadas a la API y repositorios
sealed class JamResult<out T> {
    data class Success<T>(val data: T) : JamResult<T>()

    // ✅ Default seguro: evita crashes si alguien pasa null o ""
    data class Error(
        val message: String = "Usuario o contraseña no registrados. Intenta de nuevo."
    ) : JamResult<Nothing>()

    object Loading : JamResult<Nothing>()
}
