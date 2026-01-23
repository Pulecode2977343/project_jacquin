package co.edu.jacquin.jam_app.data.remote.dto

import com.google.gson.annotations.SerializedName

/**
 * Request esperado por backend contact.php:
 *  - full_name
 *  - email
 *  - n_phone
 *  - message
 *  - accept_terms
 */
data class ContactMessageRequest(
    @SerializedName("full_name") val fullName: String,
    @SerializedName("email") val email: String,
    @SerializedName("n_phone") val nPhone: String,
    @SerializedName("message") val message: String,
    @SerializedName("accept_terms") val acceptTerms: Boolean
)
