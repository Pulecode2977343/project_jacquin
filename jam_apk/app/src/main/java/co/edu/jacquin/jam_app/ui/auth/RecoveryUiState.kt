package co.edu.jacquin.jam_app.ui.auth

data class RecoveryUiState(
    val step: RecoveryStep = RecoveryStep.EnterEmail,
    val email: String = "",
    val code: String = "",
    val isLoading: Boolean = false,
    val message: String? = null,
    val error: String? = null,
    val userNotFound: Boolean = false,
    val codeExpired: Boolean = false,
    val verified: Boolean = false
)

enum class RecoveryStep {
    EnterEmail,
    EnterCode,
    NewPassword
}
