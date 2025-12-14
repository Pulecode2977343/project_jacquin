package co.edu.jacquin.jam_app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModelProvider
import co.edu.jacquin.jam_app.data.remote.RetrofitClient
import co.edu.jacquin.jam_app.data.repository.AuthRepository
import co.edu.jacquin.jam_app.domain.UserRole
import co.edu.jacquin.jam_app.ui.SplashScreen
import co.edu.jacquin.jam_app.ui.auth.AuthViewModel
import co.edu.jacquin.jam_app.ui.auth.AuthViewModelFactory
import co.edu.jacquin.jam_app.ui.auth.LoginScreen
import co.edu.jacquin.jam_app.ui.auth.RegisterScreen
import co.edu.jacquin.jam_app.ui.dashboard.DashboardScreen
import co.edu.jacquin.jam_app.ui.home.HomeScreen
import co.edu.jacquin.jam_app.ui.theme.JAM_appTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private enum class RootScreen { Home, Login, Register, Dashboard }

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val api = RetrofitClient.api
        val authRepository = AuthRepository(api)
        val authViewModelFactory = AuthViewModelFactory(authRepository)
        val authViewModel = ViewModelProvider(this, authViewModelFactory)[AuthViewModel::class.java]

        setContent {
            JAM_appTheme {
                val uiState by authViewModel.uiState.collectAsState()

                val snackbarHostState = remember { SnackbarHostState() }
                val scope = rememberCoroutineScope()

                var showSplash by rememberSaveable { mutableStateOf(true) }
                var screen by rememberSaveable { mutableStateOf(RootScreen.Home) }

                // Splash timer
                LaunchedEffect(Unit) {
                    delay(2500L)
                    showSplash = false

                    // Si el usuario ya está logueado en memoria (misma sesión), abre dashboard
                    if (uiState.isLoggedIn && uiState.user != null) {
                        screen = RootScreen.Dashboard
                    }
                }

                // Si el registro fue OK, volvemos a Login y mostramos snackbar
                LaunchedEffect(uiState.registerSuccess) {
                    if (uiState.registerSuccess) {
                        screen = RootScreen.Login
                        snackbarHostState.showSnackbar(
                            uiState.registerMessage ?: "Cuenta creada. Inicia sesión."
                        )
                        authViewModel.consumeRegisterSuccess()
                    }
                }

                Scaffold(
                    snackbarHost = { SnackbarHost(snackbarHostState) }
                ) { _ ->
                    when {
                        showSplash -> {
                            SplashScreen()
                        }

                        screen == RootScreen.Register -> {
                            RegisterScreen(
                                onBackClick = { screen = RootScreen.Login },
                                isSubmitting = uiState.isRegistering,
                                onRegisterSubmit = { fullName, email, phone, password ->
                                    authViewModel.register(fullName, email, phone, password)
                                },
                                onLoginClick = { screen = RootScreen.Login }
                            )
                        }

                        screen == RootScreen.Login -> {
                            LoginScreen(
                                viewModel = authViewModel,
                                onBackClick = { screen = RootScreen.Home },
                                onRegisterClick = { screen = RootScreen.Register },
                                onForgotPasswordClick = {
                                    scope.launch {
                                        snackbarHostState.showSnackbar("Recuperación: en construcción 🙂")
                                    }
                                },
                                onLoginSuccess = {
                                    screen = RootScreen.Dashboard
                                }
                            )
                        }

                        screen == RootScreen.Dashboard -> {
                            val user = uiState.user
                            if (user == null) {
                                // Fallback seguro: si no hay usuario, vuelve a Home
                                screen = RootScreen.Home
                            } else {
                                val role = when (user.id_rol) {
                                    1 -> UserRole.Admin
                                    2 -> UserRole.Teacher
                                    3 -> UserRole.Student
                                    else -> UserRole.Student
                                }

                                DashboardScreen(
                                    userRole = role,
                                    userName = user.full_name,
                                    onBackClick = { screen = RootScreen.Home },
                                    onLogoutClick = {
                                        authViewModel.logout()
                                        screen = RootScreen.Home
                                    },
                                    onGoHome = { screen = RootScreen.Home },
                                    onGoCourses = { screen = RootScreen.Home }
                                )
                            }
                        }

                        else -> {
                            HomeScreen(
                                isLoggedIn = uiState.isLoggedIn,
                                onLoginClick = { screen = RootScreen.Login },
                                onDashboardClick = {
                                    screen = if (uiState.isLoggedIn && uiState.user != null) {
                                        RootScreen.Dashboard
                                    } else {
                                        RootScreen.Login
                                    }
                                },
                                onCoursesClick = { screen = RootScreen.Login },
                                onAboutClick = { /* TODO */ },
                                onContactClick = { /* TODO */ }
                            )
                        }
                    }
                }
            }
        }
    }
}
