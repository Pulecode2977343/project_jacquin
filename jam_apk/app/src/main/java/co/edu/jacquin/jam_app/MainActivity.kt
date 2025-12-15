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
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModelProvider
import co.edu.jacquin.jam_app.data.remote.RetrofitClient
import co.edu.jacquin.jam_app.data.repository.AuthRepository
import co.edu.jacquin.jam_app.data.repository.ContactRepository
import co.edu.jacquin.jam_app.domain.UserRole
import co.edu.jacquin.jam_app.ui.SplashScreen
import co.edu.jacquin.jam_app.ui.auth.AuthViewModel
import co.edu.jacquin.jam_app.ui.auth.AuthViewModelFactory
import co.edu.jacquin.jam_app.ui.auth.LoginScreen
import co.edu.jacquin.jam_app.ui.auth.RegisterScreen
import co.edu.jacquin.jam_app.ui.contact.ContactScreen
import co.edu.jacquin.jam_app.ui.contact.ContactViewModel
import co.edu.jacquin.jam_app.ui.contact.ContactViewModelFactory
import co.edu.jacquin.jam_app.ui.dashboard.DashboardScreen
import co.edu.jacquin.jam_app.ui.home.HomeScreen
import co.edu.jacquin.jam_app.ui.theme.JAM_appTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val api = RetrofitClient.api

        val authRepository = AuthRepository(api)
        val authViewModel = ViewModelProvider(
            this,
            AuthViewModelFactory(authRepository)
        )[AuthViewModel::class.java]

        val contactRepository = ContactRepository(api)
        val contactViewModel = ViewModelProvider(
            this,
            ContactViewModelFactory(contactRepository)
        )[ContactViewModel::class.java]

        setContent {
            JAM_appTheme {
                val uiState by authViewModel.uiState.collectAsState()

                var showSplash by remember { mutableStateOf(true) }
                var showLogin by remember { mutableStateOf(false) }
                var showRegister by remember { mutableStateOf(false) }
                var showDashboard by remember { mutableStateOf(false) }
                var showContact by remember { mutableStateOf(false) }

                val snackbarHostState = remember { SnackbarHostState() }
                val scope = rememberCoroutineScope()

                fun goHome() {
                    showLogin = false
                    showRegister = false
                    showDashboard = false
                    showContact = false
                }

                fun goLogin() {
                    showRegister = false
                    showDashboard = false
                    showContact = false
                    showLogin = true
                }

                fun goDashboard() {
                    showLogin = false
                    showRegister = false
                    showContact = false
                    showDashboard = true
                }

                fun goContact() {
                    showLogin = false
                    showRegister = false
                    showDashboard = false
                    showContact = true
                }

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
                                onBackClick = { goLogin() },
                                onRegisterSubmit = { fullName, email, phone, password ->
                                    authViewModel.register(fullName, email, phone, password)
                                },
                                onLoginClick = { goLogin() },
                                onTermsClick = {
                                    scope.launch { snackbarHostState.showSnackbar("Términos: en construcción 🙂") }
                                },
                                onDataPolicyClick = {
                                    scope.launch { snackbarHostState.showSnackbar("Política de datos: en construcción 🙂") }
                                },
                                onHomeClick = { goHome() },
                                onAboutClick = {
                                    goHome()
                                    scope.launch { snackbarHostState.showSnackbar("Nosotros: en construcción 🙂") }
                                },
                                onCoursesClick = {
                                    goHome()
                                    scope.launch { snackbarHostState.showSnackbar("Cursos: en construcción 🙂") }
                                },
                                onContactClick = { goContact() },
                                onSpecialClick = {
                                    if (uiState.isLoggedIn && uiState.user != null) goDashboard() else goLogin()
                                },
                                
                                isSubmitting = uiState.isRegistering
                            )
                        }

                        showLogin -> {
                            LoginScreen(
                                viewModel = authViewModel,
                                onBackClick = { goHome() },
                                onRegisterClick = { showLogin = false; showRegister = true },
                                onForgotPasswordClick = {
                                    scope.launch { snackbarHostState.showSnackbar("Recuperación: en construcción 🙂") }
                                },
                                onHomeClick = { goHome() },
                                onAboutClick = {
                                    goHome()
                                    scope.launch { snackbarHostState.showSnackbar("Nosotros: en construcción 🙂") }
                                },
                                onCoursesClick = {
                                    goHome()
                                    scope.launch { snackbarHostState.showSnackbar("Cursos: en construcción 🙂") }
                                },
                                onContactClick = { goContact() },
                                onSpecialClick = {
                                    if (uiState.isLoggedIn && uiState.user != null) goDashboard() else goLogin()
                                },
                                onLoginSuccess = {
                                    // el VM ya guardó user + isLoggedIn, solo cambiamos pantalla
                                    goDashboard()
                                }
                            )
                        }

                        showContact -> {
                            ContactScreen(
                                viewModel = contactViewModel,
                                prefilledEmail = uiState.user?.email,
                                onBackClick = { goHome() },
                                onTermsClick = {
                                    scope.launch { snackbarHostState.showSnackbar("Términos: en construcción 🙂") }
                                },
                                onDataPolicyClick = {
                                    scope.launch { snackbarHostState.showSnackbar("Política de datos: en construcción 🙂") }
                                },
                                onSentSuccess = {
                                    // ✅ si hay sesión, vuelve al panel; si no, vuelve a Home
                                    if (uiState.isLoggedIn && uiState.user != null) goDashboard() else goHome()
                                },

                                // ✅ enlaces del JamSignature (igual patrón que Home)
                                onHomeClick = { goHome() },
                                onAboutClick = {
                                    goHome()
                                    scope.launch { snackbarHostState.showSnackbar("Nosotros: en construcción 🙂") }
                                },
                                onCoursesClick = {
                                    goHome()
                                    scope.launch { snackbarHostState.showSnackbar("Cursos: en construcción 🙂") }
                                },
                                onContactClick = { /* ya estás aquí */ },
                                onSpecialClick = {
                                    if (uiState.isLoggedIn && uiState.user != null) goDashboard() else goLogin()
                                }
                            )
                        }

                        showDashboard -> {
                            val user = uiState.user
                            if (uiState.isLoggedIn && user != null) {
                                val role = when (user.id_rol) {
                                    1 -> UserRole.Admin
                                    2 -> UserRole.Teacher
                                    else -> UserRole.Student
                                }

                                DashboardScreen(
                                    userRole = role,
                                    userName = user.full_name,
                                    onBackClick = { goHome() },
                                    onLogoutClick = {
                                        authViewModel.logout()
                                        goHome()
                                    },
                                    // público (si lo usas dentro del panel)
                                    onGoHome = { goHome() },
                                    onGoAbout = {
                                        goHome()
                                        scope.launch { snackbarHostState.showSnackbar("Nosotros: en construcción 🙂") }
                                    },
                                    onGoCourses = {
                                        goHome()
                                        scope.launch { snackbarHostState.showSnackbar("Cursos: en construcción 🙂") }
                                    },
                                    onGoContact = { goContact() }
                                )
                            } else {
                                goHome()
                            }
                        }

                        else -> {
                            HomeScreen(
                                isLoggedIn = uiState.isLoggedIn,
                                onLoginClick = { goLogin() },
                                onDashboardClick = { if (uiState.isLoggedIn) goDashboard() else goLogin() },
                                onCoursesClick = {
                                    scope.launch { snackbarHostState.showSnackbar("Cursos: en construcción 🙂") }
                                },
                                onAboutClick = {
                                    scope.launch { snackbarHostState.showSnackbar("Nosotros: en construcción 🙂") }
                                },
                                onContactClick = { goContact() }
                            )
                        }
                    }
                }
            }
        }
    }
}
