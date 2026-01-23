package co.edu.jacquin.jam_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class RecoveryResetPasswordRequest(
    @SerializedName("email") val email: String,
    @SerializedName("code") val code: String,
    @SerializedName("new_password") val newPassword: String
)
