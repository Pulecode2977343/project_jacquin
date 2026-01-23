package co.edu.jacquin.jam_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class RecoveryEmailRequest(
    @SerializedName("email") val email: String
)
