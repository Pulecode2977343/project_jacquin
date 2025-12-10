package co.edu.jacquin.jam_app.ui.auth

import co.edu.jacquin.jam_app.data.remote.dto.UserDto

data class AuthUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val isLoggedIn: Boolean = false,
    val user: UserDto? = null
)
