package co.edu.jacquin.jam_app.data.remote.dto

// Estructura EXACTA de la respuesta de login.php
data class LoginResponse(
    val success: Boolean,
    val message: String,
    val user: UserDto?
)
