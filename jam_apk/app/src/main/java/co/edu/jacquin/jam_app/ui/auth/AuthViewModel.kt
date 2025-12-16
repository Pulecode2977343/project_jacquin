package co.edu.jacquin.jam_app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import co.edu.jacquin.jam_app.core.JamResult
import co.edu.jacquin.jam_app.data.remote.dto.UserDto
import co.edu.jacquin.jam_app.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class AuthViewModel(
    private val repository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState

    fun login(email: String, password: String) {
        _uiState.value = _uiState.value.copy(
            isLoading = true,
            error = null
        )

        viewModelScope.launch {
            when (val result = repository.login(email, password)) {
                is JamResult.Success<UserDto> -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isLoggedIn = true,
                        user = result.data
                    )
                }

                is JamResult.Error -> {
                    val isConnError = result.message == "CONNECTION_ERROR"
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = if (isConnError) null else result.message,
                        isConnectionError = isConnError
                    )
                }

                JamResult.Loading -> Unit
            }
        }
    }

    fun register(fullName: String, email: String, phone: String, password: String) {
        _uiState.value = _uiState.value.copy(
            isRegistering = true,
            registerSuccess = false,
            registerMessage = null,
            error = null,
            isConnectionError = false
        )

        viewModelScope.launch {
            when (val result = repository.register(fullName, email, phone, password)) {
                is JamResult.Success<String> -> {
                    _uiState.value = _uiState.value.copy(
                        isRegistering = false,
                        registerSuccess = true,
                        registerMessage = result.data
                    )
                }

                is JamResult.Error -> {
                    val isConnError = result.message == "CONNECTION_ERROR"
                    _uiState.value = _uiState.value.copy(
                        isRegistering = false,
                        error = if (isConnError) null else result.message,
                        isConnectionError = isConnError
                    )
                }

                JamResult.Loading -> Unit
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null, isConnectionError = false)
    }

    fun consumeRegisterSuccess() {
        _uiState.value = _uiState.value.copy(
            registerSuccess = false,
            registerMessage = null
        )
    }

    fun logout() {
        _uiState.value = AuthUiState()
    }
}
