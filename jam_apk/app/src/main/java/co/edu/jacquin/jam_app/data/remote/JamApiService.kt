package co.edu.jacquin.jam_app.data.remote

import co.edu.jacquin.jam_app.data.remote.dto.LoginRequest
import co.edu.jacquin.jam_app.data.remote.dto.LoginResponse
import co.edu.jacquin.jam_app.data.remote.dto.RegisterRequest
import co.edu.jacquin.jam_app.data.remote.dto.RegisterResponse
import retrofit2.http.Body
import retrofit2.http.POST

interface JamApiService {

    // Ej: BASE_URL = "http://10.0.2.2:8080/jacquin_api/public/"
    @POST("login.php")
    suspend fun login(@Body body: LoginRequest): LoginResponse

    @POST("register.php")
    suspend fun register(@Body body: RegisterRequest): RegisterResponse
}
