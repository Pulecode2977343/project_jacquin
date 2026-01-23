package co.edu.jacquin.jam_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class RegisterRequest(
    @SerializedName("full_name") val fullName: String,
    @SerializedName("email") val email: String,
    @SerializedName("n_phone") val nPhone: String,
    @SerializedName("password") val password: String
)
