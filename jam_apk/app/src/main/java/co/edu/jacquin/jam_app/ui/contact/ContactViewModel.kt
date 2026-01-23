package co.edu.jacquin.jam_app.ui.contact

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import co.edu.jacquin.jam_app.core.JamResult
import co.edu.jacquin.jam_app.data.repository.ContactRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ContactViewModel(
    private val repository: ContactRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ContactUiState())
    val uiState: StateFlow<ContactUiState> = _uiState

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(successMessage = null, error = null)
    }

    fun send(
        fullName: String,
        email: String,
        countryCode: String,
        phoneDigits10: String,
        message: String,
        acceptTerms: Boolean,
        acceptDataPolicy: Boolean
    ) {
        val name = fullName.trim()
        val digits = phoneDigits10.filter { it.isDigit() }.take(10)
        val msg = message.trim()

        if (name.length < 3) {
            _uiState.value = _uiState.value.copy(error = "Escribe tu nombre completo.")
            return
        }
        if (digits.length != 10) {
            _uiState.value = _uiState.value.copy(error = "El número debe tener 10 dígitos.")
            return
        }
        if (msg.length < 10) {
            _uiState.value = _uiState.value.copy(error = "Escribe un mensaje un poco más detallado.")
            return
        }
        if (!acceptTerms) {
            _uiState.value = _uiState.value.copy(error = "Debes aceptar los términos y condiciones.")
            return
        }
        if (!acceptDataPolicy) {
            _uiState.value = _uiState.value.copy(error = "Debes aceptar el tratamiento de datos personales.")
            return
        }

                // Email requerido para contacto (permite responder incluso si el número es extranjero)
        val emailTrim = email.trim()
        val emailRegex = Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
        if (emailTrim.isBlank() || !emailRegex.matches(emailTrim)) {
            _uiState.value = _uiState.value.copy(error = "Escribe un email válido.")
            return
        }


        val code = countryCode.trim().ifBlank { "+57" }
        val normalizedCode = if (code.startsWith("+")) code else "+$code"
        val phoneE164 = normalizedCode + digits

        _uiState.value = _uiState.value.copy(isSending = true, successMessage = null, error = null)

        viewModelScope.launch {
            when (val result = repository.sendMessage(
                fullName = name,
                email = emailTrim,
                phoneE164 = phoneE164,
                message = msg,
                // backend solo valida accept_terms
                acceptTerms = true
            )) {
                is JamResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isSending = false,
                        successMessage = result.data,
                        error = null
                    )
                }
                is JamResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isSending = false,
                        error = result.message
                    )
                }
                JamResult.Loading -> Unit
            }
        }
    }
}
