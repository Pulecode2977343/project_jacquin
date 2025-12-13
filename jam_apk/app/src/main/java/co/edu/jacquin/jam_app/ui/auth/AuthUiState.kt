package co.edu.jacquin.jam_app.ui.auth

import co.edu.jacquin.jam_app.data.remote.dto.UserDto

data class AuthUiState(
    val isLoading: Boolean = false,
    val isLoggedIn: Boolean = false,
    val user: UserDto? = null,
    val error: String? = null,

    // Register flow
    val isRegistering: Boolean = false,
    val registerSuccess: Boolean = false,
    val registerMessage: String? = null
)
