package co.edu.jacquin.jam_app.ui.contact

data class ContactUiState(
    val isSending: Boolean = false,
    val successMessage: String? = null,
    val error: String? = null
)
