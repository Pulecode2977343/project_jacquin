package co.edu.jacquin.jam_app.data.remote.dto

import com.google.gson.annotations.SerializedName

data class RecoveryVerifyCodeRequest(
    @SerializedName("email") val email: String,
    @SerializedName("code") val code: String
)
