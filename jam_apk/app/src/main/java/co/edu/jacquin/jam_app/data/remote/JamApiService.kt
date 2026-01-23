package co.edu.jacquin.jam_app.data.remote

import co.edu.jacquin.jam_app.data.remote.dto.ContactMessageRequest
import co.edu.jacquin.jam_app.data.remote.dto.ContactMessageResponse
import co.edu.jacquin.jam_app.data.remote.dto.LoginRequest
import co.edu.jacquin.jam_app.data.remote.dto.LoginResponse
import co.edu.jacquin.jam_app.data.remote.dto.RegisterRequest
import co.edu.jacquin.jam_app.data.remote.dto.RegisterResponse
import co.edu.jacquin.jam_app.data.remote.dto.RecoveryEmailRequest
import co.edu.jacquin.jam_app.data.remote.dto.RecoveryGenericResponse
import co.edu.jacquin.jam_app.data.remote.dto.RecoveryResetPasswordRequest
import co.edu.jacquin.jam_app.data.remote.dto.RecoveryVerifyCodeRequest
import retrofit2.http.Body
import retrofit2.http.POST

interface JamApiService {

    // Ej: BASE_URL = "http://10.0.2.2:8080/jacquin_api/public/"
    @POST("login.php")
    suspend fun login(@Body body: LoginRequest): LoginResponse

    @POST("register.php")
    suspend fun register(@Body body: RegisterRequest): RegisterResponse

    @POST("contact.php")
    suspend fun sendContactMessage(@Body body: ContactMessageRequest): ContactMessageResponse

    // ===== Recuperación de contraseña (backend PHP real) =====

    @POST("recover.php")
    suspend fun requestRecoveryCode(@Body body: RecoveryEmailRequest): retrofit2.Response<okhttp3.ResponseBody>

    @POST("verify_code.php")
    suspend fun verifyRecoveryCode(@Body body: RecoveryVerifyCodeRequest): RecoveryGenericResponse

    @POST("reset_password.php")
    suspend fun resetPassword(@Body body: RecoveryResetPasswordRequest): RecoveryGenericResponse

    // ===== ADMIN =====
    @retrofit2.http.GET("admin_get_users.php")
    suspend fun getUsers(): co.edu.jacquin.jam_app.data.remote.dto.AdminUserListResponse

    @POST("admin_update_role.php")
    suspend fun updateUserRole(@Body body: co.edu.jacquin.jam_app.data.remote.dto.UpdateRoleRequest): RecoveryGenericResponse
}
