package co.edu.jacquin.jam_app.core

// Resultado genérico para llamadas a la API y repositorios
sealed class JamResult<out T> {
    data class Success<T>(val data: T) : JamResult<T>()
    data class Error(val message: String) : JamResult<Nothing>()
    object Loading : JamResult<Nothing>()
}
