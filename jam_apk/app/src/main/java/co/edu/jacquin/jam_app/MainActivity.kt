package co.edu.jacquin.jam_app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
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
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModelProvider
import co.edu.jacquin.jam_app.data.remote.RetrofitClient
import co.edu.jacquin.jam_app.data.repository.AuthRepository
import co.edu.jacquin.jam_app.data.repository.ContactRepository
import co.edu.jacquin.jam_app.data.repository.RecoveryRepository
import co.edu.jacquin.jam_app.domain.UserRole
import co.edu.jacquin.jam_app.ui.SplashScreen
import co.edu.jacquin.jam_app.ui.about.AboutScreen
import co.edu.jacquin.jam_app.ui.auth.AuthViewModel
import co.edu.jacquin.jam_app.ui.auth.AuthViewModelFactory
import co.edu.jacquin.jam_app.ui.auth.LoginScreen
import co.edu.jacquin.jam_app.ui.auth.RecoveryScreen
import co.edu.jacquin.jam_app.ui.auth.RecoveryViewModel
import co.edu.jacquin.jam_app.ui.auth.RecoveryViewModelFactory
import co.edu.jacquin.jam_app.ui.auth.RegisterScreen
import co.edu.jacquin.jam_app.ui.contact.ContactScreen
import co.edu.jacquin.jam_app.ui.contact.ContactViewModel
import co.edu.jacquin.jam_app.ui.contact.ContactViewModelFactory
import co.edu.jacquin.jam_app.ui.courses.CoursesScreen
import co.edu.jacquin.jam_app.ui.dashboard.DashboardScreen
import co.edu.jacquin.jam_app.ui.events.EventsNewsScreen
import co.edu.jacquin.jam_app.ui.home.HomeScreen
import co.edu.jacquin.jam_app.ui.legal.JamLegalLorem
import co.edu.jacquin.jam_app.ui.legal.JamLegalOverlay
import co.edu.jacquin.jam_app.ui.theme.JAM_appTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val api = RetrofitClient.api

        val authViewModel = ViewModelProvider(
            this,
            AuthViewModelFactory(AuthRepository(api))
        )[AuthViewModel::class.java]

        val contactViewModel = ViewModelProvider(
            this,
            ContactViewModelFactory(ContactRepository(api))
        )[ContactViewModel::class.java]

        val recoveryViewModel = ViewModelProvider(
            this,
            RecoveryViewModelFactory(RecoveryRepository(api))
        )[RecoveryViewModel::class.java]

        setContent {
            JAM_appTheme {
                val uiState by authViewModel.uiState.collectAsState()

                // ✅ Consentimientos globales (se reflejan en Register y Contact)
                var termsAccepted by rememberSaveable { mutableStateOf(false) }
                var dataPolicyAccepted by rememberSaveable { mutableStateOf(false) }

                var showSplash by remember { mutableStateOf(true) }
                var showLogin by remember { mutableStateOf(false) }
                var showRegister by remember { mutableStateOf(false) }
                var showDashboard by remember { mutableStateOf(false) }
                var showContact by remember { mutableStateOf(false) }
                var showEvents by remember { mutableStateOf(false) }
                var showAbout by remember { mutableStateOf(false) }
                var showCourses by remember { mutableStateOf(false) }
                var showRecovery by remember { mutableStateOf(false) }

                val snackbarHostState = remember { SnackbarHostState() }
                val scope = rememberCoroutineScope()

                fun goHome() {
                    showLogin = false
                    showRegister = false
                    showDashboard = false
                    showContact = false
                    showEvents = false
                    showAbout = false
                    showCourses = false
                    showRecovery = false
                }

                fun goLogin() {
                    showRegister = false
                    showDashboard = false
                    showContact = false
                    showEvents = false
                    showAbout = false
                    showCourses = false
                    showRecovery = false
                    showLogin = true
                }

                fun goRegister() {
                    showLogin = false
                    showDashboard = false
                    showContact = false
                    showEvents = false
                    showAbout = false
                    showCourses = false
                    showRecovery = false
                    showRegister = true
                }

                fun goDashboard() {
                    showLogin = false
                    showRegister = false
                    showContact = false
                    showEvents = false
                    showAbout = false
                    showCourses = false
                    showRecovery = false
                    showDashboard = true
                }

                fun goContact() {
                    showLogin = false
                    showRegister = false
                    showDashboard = false
                    showEvents = false
                    showAbout = false
                    showCourses = false
                    showRecovery = false
                    showContact = true
                }

                fun goEvents() {
                    showLogin = false
                    showRegister = false
                    showDashboard = false
                    showContact = false
                    showAbout = false
                    showCourses = false
                    showRecovery = false
                    showEvents = true
                }

                fun goAbout() {
                    showLogin = false
                    showRegister = false
                    showDashboard = false
                    showContact = false
                    showEvents = false
                    showCourses = false
                    showRecovery = false
                    showAbout = true
                }

                fun goCourses() {
                    showLogin = false
                    showRegister = false
                    showDashboard = false
                    showContact = false
                    showEvents = false
                    showAbout = false
                    showRecovery = false
                    showCourses = true
                }

                fun goRecovery() {
                    showLogin = false
                    showRegister = false
                    showDashboard = false
                    showContact = false
                    showEvents = false
                    showAbout = false
                    showCourses = false
                    showRecovery = true
                }

                LaunchedEffect(Unit) {
                    delay(2500L)
                    showSplash = false
                }

                // ✅ Registro OK -> vuelve a Login + snackbar
                LaunchedEffect(uiState.registerSuccess) {
                    if (uiState.registerSuccess) {
                        goLogin()
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
                        showSplash -> SplashScreen()

                        showEvents -> {
                            EventsNewsScreen(
                                onBackClick = { goHome() },
                                onHomeClick = { goHome() },
                                onAboutClick = { goAbout() },
                                onCoursesClick = { goCourses() },
                                onContactClick = { goContact() }
                            )
                        }

                        showAbout -> {
                            AboutScreen(
                                onBackClick = { goHome() },
                                onHomeClick = { goHome() },
                                onAboutClick = { /* ya estás aquí */ },
                                onCoursesClick = { goCourses() },
                                onContactClick = { goContact() },
                                onEventsClick = { goEvents() }
                            )
                        }

                        showCourses -> {
                            CoursesScreen(
                                onBackClick = { goHome() },
                                onHomeClick = { goHome() },
                                onAboutClick = { goAbout() },
                                onCoursesClick = { /* ya estás aquí */ },
                                onContactClick = { goContact() },
                                onEventsClick = { goEvents() }
                            )
                        }

                        showRecovery -> {
                            RecoveryScreen(
                                viewModel = recoveryViewModel,
                                onBackClick = { goLogin() },
                                onGoLogin = { goLogin() },
                                onGoRegister = { goRegister() },
                                onRecoveryFinished = { /* opcional */ },
                                onHomeClick = { goHome() },
                                onAboutClick = { goAbout() },
                                onCoursesClick = { goCourses() },
                                onContactClick = { goContact() },
                                onEventsClick = { goEvents() }
                            )
                        }

                        showRegister -> {
                            // Mantener estado del formulario: overlays sin salir de Register
                            var showTerms by remember { mutableStateOf(false) }
                            var showPolicy by remember { mutableStateOf(false) }

                            Box(modifier = Modifier.fillMaxSize()) {
                                RegisterScreen(
                                    onBackClick = { goLogin() },
                                    onRegisterSubmit = { fullName, email, phone, password ->
                                        authViewModel.register(fullName, email, phone, password)
                                    },
                                    onLoginClick = { goLogin() },
                                    onTermsClick = { showTerms = true },
                                    onDataPolicyClick = { showPolicy = true },
                                    // ✅ JamSignature
                                    onHomeClick = { goHome() },
                                    onAboutClick = { goAbout() },
                                    onCoursesClick = { goCourses() },
                                    onContactClick = { goContact() },
                                    onSpecialClick = { goEvents() },
                                    isSubmitting = uiState.isRegistering,
                                    // ✅ consentimientos externos
                                    termsAccepted = termsAccepted,
                                    onTermsAcceptedChange = { termsAccepted = it },
                                    dataPolicyAccepted = dataPolicyAccepted,
                                    onDataPolicyAcceptedChange = { dataPolicyAccepted = it }
                                )

                                if (showTerms) {
                                    JamLegalOverlay(
                                        title = "Términos y condiciones",
                                        content = JamLegalLorem.termsAndConditions,
                                        onClose = { showTerms = false },
                                        onAccept = {
                                            termsAccepted = true
                                            showTerms = false
                                        }
                                    )
                                }

                                if (showPolicy) {
                                    JamLegalOverlay(
                                        title = "Política de tratamiento de datos",
                                        content = JamLegalLorem.dataPolicy,
                                        onClose = { showPolicy = false },
                                        onAccept = {
                                            dataPolicyAccepted = true
                                            showPolicy = false
                                        }
                                    )
                                }
                            }
                        }

                        showLogin -> {
                            LoginScreen(
                                viewModel = authViewModel,
                                onBackClick = { goHome() },
                                onRegisterClick = { goRegister() },
                                onForgotPasswordClick = { goRecovery() },
                                // ✅ JamSignature
                                onHomeClick = { goHome() },
                                onAboutClick = { goAbout() },
                                onCoursesClick = { goCourses() },
                                onContactClick = { goContact() },
                                onSpecialClick = { goEvents() },
                                onLoginSuccess = { goDashboard() }
                            )
                        }

                        showContact -> {
                            var showTerms by remember { mutableStateOf(false) }
                            var showPolicy by remember { mutableStateOf(false) }

                            Box(modifier = Modifier.fillMaxSize()) {
                                ContactScreen(
                                    viewModel = contactViewModel,
                                    prefilledEmail = uiState.user?.email,
                                    onBackClick = { goHome() },
                                    onTermsClick = { showTerms = true },
                                    onDataPolicyClick = { showPolicy = true },
                                    onSentSuccess = {
                                        if (uiState.isLoggedIn && uiState.user != null) goDashboard() else goHome()
                                    },
                                    // ✅ JamSignature
                                    onHomeClick = { goHome() },
                                    onAboutClick = { goAbout() },
                                    onCoursesClick = { goCourses() },
                                    onContactClick = { /* ya estás aquí */ },
                                    onSpecialClick = { goEvents() },
                                    // ✅ consentimientos externos
                                    termsAccepted = termsAccepted,
                                    onTermsAcceptedChange = { termsAccepted = it },
                                    dataPolicyAccepted = dataPolicyAccepted,
                                    onDataPolicyAcceptedChange = { dataPolicyAccepted = it }
                                )

                                if (showTerms) {
                                    JamLegalOverlay(
                                        title = "Términos y condiciones",
                                        content = JamLegalLorem.termsAndConditions,
                                        onClose = { showTerms = false },
                                        onAccept = {
                                            termsAccepted = true
                                            showTerms = false
                                        }
                                    )
                                }

                                if (showPolicy) {
                                    JamLegalOverlay(
                                        title = "Política de tratamiento de datos",
                                        content = JamLegalLorem.dataPolicy,
                                        onClose = { showPolicy = false },
                                        onAccept = {
                                            dataPolicyAccepted = true
                                            showPolicy = false
                                        }
                                    )
                                }
                            }
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
                                    onGoHome = { goHome() },
                                    onGoAbout = { goAbout() },
                                    onGoCourses = { goCourses() },
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
                                onCoursesClick = { goCourses() },
                                onAboutClick = { goAbout() },
                                onContactClick = { goContact() },
                                onEventsClick = { goEvents() } // ✅ Special => Eventos/Noticias
                            )
                        }
                    }
                }
            }
        }
    }
}
