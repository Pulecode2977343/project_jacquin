package co.edu.jacquin.jam_app.data.remote

import co.edu.jacquin.jam_app.data.remote.dto.LoginRequest
import co.edu.jacquin.jam_app.data.remote.dto.LoginResponse
import retrofit2.http.Body
import retrofit2.http.POST

interface JamApiService {

    // Endpoint real: http://10.0.2.2:8080/jacquin_api/public/login.php
    @POST("login.php")
    suspend fun login(
        @Body body: LoginRequest
    ): LoginResponse
}
