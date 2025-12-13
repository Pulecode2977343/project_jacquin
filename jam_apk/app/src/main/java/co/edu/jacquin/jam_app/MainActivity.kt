package co.edu.jacquin.jam_app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.lifecycle.ViewModelProvider
import co.edu.jacquin.jam_app.data.remote.RetrofitClient
import co.edu.jacquin.jam_app.data.repository.AuthRepository
import co.edu.jacquin.jam_app.ui.SplashScreen
import co.edu.jacquin.jam_app.ui.auth.AuthViewModel
import co.edu.jacquin.jam_app.ui.auth.AuthViewModelFactory
import co.edu.jacquin.jam_app.ui.auth.LoginScreen
import co.edu.jacquin.jam_app.ui.auth.RegisterScreen
import co.edu.jacquin.jam_app.ui.home.HomeScreen
import co.edu.jacquin.jam_app.ui.theme.JAM_appTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch


class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val api = RetrofitClient.api
        val authRepository = AuthRepository(api)
        val authViewModelFactory = AuthViewModelFactory(authRepository)
        val authViewModel = ViewModelProvider(
            this,
            authViewModelFactory
        )[AuthViewModel::class.java]

        setContent {
            JAM_appTheme {
                val uiState by authViewModel.uiState.collectAsState()

                var showSplash by remember { mutableStateOf(true) }
                var showLogin by remember { mutableStateOf(false) }
                var showRegister by remember { mutableStateOf(false) }
                var showDashboard by remember { mutableStateOf(false) }

                val snackbarHostState = remember { SnackbarHostState() }
                val scope = rememberCoroutineScope()


                LaunchedEffect(Unit) {
                    delay(2500L)
                    showSplash = false
                }

                // ✅ Si el registro fue OK, volvemos a Login y mostramos snackbar
                LaunchedEffect(uiState.registerSuccess) {
                    if (uiState.registerSuccess) {
                        showRegister = false
                        showLogin = true
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

                        showRegister -> {
                            RegisterScreen(
                                onBackClick = {
                                    showRegister = false
                                    showLogin = true
                                },
                                isSubmitting = uiState.isRegistering,
                                onRegisterSubmit = { fullName, email, phone, password ->
                                    authViewModel.register(fullName, email, phone, password)
                                },
                                onLoginClick = {
                                    showRegister = false
                                    showLogin = true
                                }
                            )
                        }

                        showLogin -> {
                            LoginScreen(
                                viewModel = authViewModel,
                                onBackClick = { showLogin = false },
                                onRegisterClick = {
                                    showLogin = false
                                    showRegister = true
                                },
                                onForgotPasswordClick = {
                                    scope.launch {
                                        snackbarHostState.showSnackbar("Recuperación: en construcción 🙂")
                                    }
                                }
                            )
                        }

                        else -> {
                            HomeScreen(
                                isLoggedIn = uiState.isLoggedIn,
                                onLoginClick = { showLogin = true },
                                onDashboardClick = { showDashboard = true },   // ✅ requerido
                                onCoursesClick = { showLogin = true },
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
