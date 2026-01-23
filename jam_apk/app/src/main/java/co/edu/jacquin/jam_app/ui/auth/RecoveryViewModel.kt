package co.edu.jacquin.jam_app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import co.edu.jacquin.jam_app.data.repository.RecoveryRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class RecoveryViewModel(
    private val repo: RecoveryRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(RecoveryUiState())
    val uiState: StateFlow<RecoveryUiState> = _uiState.asStateFlow()

    fun setEmail(value: String) {
        _uiState.value = _uiState.value.copy(email = value, error = null, message = null, userNotFound = false)
    }

    fun setCode(value: String) {
        // solo dígitos, hasta 6 (ajusta si tu backend usa otro largo)
        val filtered = value.filter { it.isDigit() }.take(6)
        _uiState.value = _uiState.value.copy(code = filtered, error = null, message = null, codeExpired = false)
    }

    fun goToEmail() {
        _uiState.value = RecoveryUiState(step = RecoveryStep.EnterEmail)
    }

    fun goToCode() {
        _uiState.value = _uiState.value.copy(step = RecoveryStep.EnterCode, error = null, message = null)
    }

    fun goToNewPassword() {
        _uiState.value = _uiState.value.copy(step = RecoveryStep.NewPassword, verified = true, error = null, message = null)
    }

    fun requestCode() {
        val email = _uiState.value.email.trim()
        if (email.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "Escribe tu correo.")
            return
        }

        _uiState.value = _uiState.value.copy(isLoading = true, error = null, message = null, userNotFound = false, codeExpired = false)
        viewModelScope.launch {
            try {
                val res = repo.requestCode(email)
                val ok = res.success == true
                if (ok) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        step = RecoveryStep.EnterCode,
                        message = res.message ?: "Te enviamos un código a tu correo."
                    )
                } else {
                    val backendMsg = res.error ?: res.message ?: "No se pudo enviar el código."
                    val notFound =
                        backendMsg.contains("no encontrado", ignoreCase = true) ||
                        backendMsg.contains("no se encuentra", ignoreCase = true) ||
                        backendMsg.contains("not found", ignoreCase = true)

                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = backendMsg,
                        userNotFound = notFound
                    )
                }
            } catch (e: Exception) {
                val msg = getFriendlyErrorMessage(e)
                _uiState.value = _uiState.value.copy(isLoading = false, error = msg)
            }
        }
    }

    fun verifyCode() {
        val email = _uiState.value.email.trim()
        val code = _uiState.value.code.trim()
        if (email.isBlank()) {
            _uiState.value = _uiState.value.copy(step = RecoveryStep.EnterEmail, error = "Escribe tu correo.")
            return
        }
        if (code.length < 4) {
            _uiState.value = _uiState.value.copy(error = "Ingresa el código.")
            return
        }

        _uiState.value = _uiState.value.copy(isLoading = true, error = null, message = null, codeExpired = false)
        viewModelScope.launch {
            try {
                val res = repo.verifyCode(email, code)
                val ok = res.success == true
                if (ok) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        step = RecoveryStep.NewPassword,
                        verified = true,
                        message = res.message ?: "Código verificado."
                    )
                } else {
                    val backendMsg = res.error ?: res.message ?: "Código inválido."
                    val expired =
                        backendMsg.contains("expir", ignoreCase = true) ||
                        backendMsg.contains("expired", ignoreCase = true)
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = backendMsg,
                        codeExpired = expired,
                        step = if (expired) RecoveryStep.EnterEmail else RecoveryStep.EnterCode
                    )
                }
            } catch (e: Exception) {
                val msg = getFriendlyErrorMessage(e)
                _uiState.value = _uiState.value.copy(isLoading = false, error = msg)
            }
        }
    }

    fun resetPassword(
        newPassword: String,
        confirm: String,
        pwdStrong: Boolean
    ) {
        val email = _uiState.value.email.trim()
        val code = _uiState.value.code.trim()

        if (newPassword.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "Escribe la nueva contraseña.")
            return
        }
        if (newPassword != confirm) {
            _uiState.value = _uiState.value.copy(error = "Las contraseñas no coinciden.")
            return
        }
        if (!pwdStrong) {
            _uiState.value = _uiState.value.copy(error = "Tu contraseña aún no cumple los requisitos.")
            return
        }

        _uiState.value = _uiState.value.copy(isLoading = true, error = null, message = null)
        viewModelScope.launch {
            try {
                val res = repo.resetPassword(email, code, newPassword)
                val ok = res.success == true
                if (ok) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        message = res.message ?: "Contraseña actualizada.",
                        error = null
                    )
                } else {
                    val backendMsg = res.error ?: res.message ?: "No se pudo actualizar la contraseña."
                    val expired = backendMsg.contains("expir", ignoreCase = true) ||
                        backendMsg.contains("expired", ignoreCase = true)
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = backendMsg,
                        codeExpired = expired,
                        step = if (expired) RecoveryStep.EnterEmail else RecoveryStep.NewPassword
                    )
                }
            } catch (e: Exception) {
                val msg = getFriendlyErrorMessage(e)
                _uiState.value = _uiState.value.copy(isLoading = false, error = msg)
            }
        }
    }

    fun consumeMessage() {
        _uiState.value = _uiState.value.copy(message = null)
    }

    private fun getFriendlyErrorMessage(e: Exception): String {
        return when {
            // Errores de parseo (HTML en vez de JSON, etc.)
            e is com.google.gson.JsonSyntaxException || 
            e is java.lang.IllegalStateException -> "Problema de comunicación con el servidor. Intenta más tarde."
            
            // Error de conexión (sin internet)
            e.message?.contains("Unable to resolve host", ignoreCase = true) == true -> "No hay conexión a internet."
            
            // Errores explícitos del repositorio (500, timeout)
            e.message?.contains("Fallo Servidor", ignoreCase = true) == true -> "El servidor no responde temporalmente."
            e.message?.contains("timeout", ignoreCase = true) == true -> "La conexión tardó demasiado."
            
            // Fallback
            else -> "Ocurrió un error inesperado. Intenta de nuevo."
        }
    }
}
