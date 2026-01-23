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
import androidx.compose.runtime.saveable.rememberSaveableStateHolder
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
import co.edu.jacquin.jam_app.ui.legal.JamLegalScreen
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

                val adminViewModel = ViewModelProvider(
                    this,
                    co.edu.jacquin.jam_app.ui.admin.AdminViewModelFactory(co.edu.jacquin.jam_app.data.repository.AdminRepository(api))
                )[co.edu.jacquin.jam_app.ui.admin.AdminViewModel::class.java]

                setContent {
            JAM_appTheme {
                val uiState by authViewModel.uiState.collectAsState()
                
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
                
                // Admin screens
                var showAdminUsers by remember { mutableStateOf(false) }

                var showLegalTerms by remember { mutableStateOf(false) }
                var showLegalPolicy by remember { mutableStateOf(false) }
                var legalReturnTo by rememberSaveable { mutableStateOf("home") }

                val snackbarHostState = remember { SnackbarHostState() }
                val scope = rememberCoroutineScope()
                val saveableStateHolder = rememberSaveableStateHolder()

                fun goHome() {
                    showLogin = false
                    showRegister = false
                    showDashboard = false
                    showContact = false
                    showEvents = false
                    showAbout = false
                    showCourses = false
                    showRecovery = false
                    showAdminUsers = false
                }

                fun goLogin() {
                    goHome() // reset all first
                    showLogin = true
                }

                fun goRegister() {
                    goHome()
                    showRegister = true
                }

                fun goDashboard() {
                    goHome()
                    showDashboard = true
                }

                fun goContact() {
                    goHome()
                    showContact = true
                }

                fun goEvents() {
                    goHome()
                    showEvents = true
                }

                fun goAbout() {
                    goHome()
                    showAbout = true
                }

                fun goCourses() {
                    goHome()
                    showCourses = true
                }

                fun goRecovery() {
                    goHome()
                    showRecovery = true
                }

                fun goAdminUsers() {
                    goHome()
                    showAdminUsers = true
                }
                
                // ... (mantener funciones legales igual, solo añadir reset admin) ...
                fun goLegalTerms(from: String) {
                    legalReturnTo = from
                    goHome() // reset
                    showLegalTerms = true
                }

                fun goLegalPolicy(from: String) {
                    legalReturnTo = from
                    goHome() // reset
                    showLegalPolicy = true
                }

                fun backFromLegal() {
                    showLegalTerms = false
                    showLegalPolicy = false
                    when (legalReturnTo) {
                        "register" -> showRegister = true
                        "contact" -> showContact = true
                        else -> goHome()
                    }
                }

                LaunchedEffect(Unit) {
                    delay(2500L)
                    showSplash = false
                }

                LaunchedEffect(uiState.registerSuccess) {
                    if (uiState.registerSuccess) {
                        goLogin()
                        snackbarHostState.showSnackbar(
                            uiState.registerMessage ?: "Cuenta creada. Inicia sesión."
                        )
                        authViewModel.consumeRegisterSuccess()
                    }
                }
                
                // Feedback de admin actions
                val adminState by adminViewModel.uiState.collectAsState()
                LaunchedEffect(adminState.successMessage) {
                    adminState.successMessage?.let { msg ->
                        snackbarHostState.showSnackbar(msg)
                        adminViewModel.clearMessages()
                    }
                }

                Scaffold(
                    snackbarHost = { SnackbarHost(snackbarHostState) }
                ) { _ ->
                    when {
                        showSplash -> SplashScreen()
                        
                        showAdminUsers -> {
                            co.edu.jacquin.jam_app.ui.admin.AdminUsersScreen(
                                viewModel = adminViewModel,
                                onBackClick = { goDashboard() }
                            )
                        }

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
                                onAboutClick = { },
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
                                onCoursesClick = { },
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
                                onRecoveryFinished = { },
                                onHomeClick = { goHome() },
                                onAboutClick = { goAbout() },
                                onCoursesClick = { goCourses() },
                                onContactClick = { goContact() },
                                onEventsClick = { goEvents() }
                            )
                        }

                        showLegalTerms -> {
                            JamLegalScreen(
                                title = "Términos y condiciones",
                                body = JamLegalLorem.termsAndConditions,
                                onBack = { backFromLegal() },
                                onAccepted = {
                                    termsAccepted = true
                                    backFromLegal()
                                }
                            )
                        }

                        showLegalPolicy -> {
                            JamLegalScreen(
                                title = "Tratamiento de datos personales",
                                body = JamLegalLorem.dataPolicy,
                                onBack = { backFromLegal() },
                                onAccepted = {
                                    dataPolicyAccepted = true
                                    backFromLegal()
                                }
                            )
                        }

                        showRegister -> {
                            saveableStateHolder.SaveableStateProvider("register") {
                                RegisterScreen(
                                    onBackClick = { goLogin() },
                                    onRegisterSubmit = { fullName, email, phone, password ->
                                        authViewModel.register(fullName, email, phone, password)
                                    },
                                    onLoginClick = { goLogin() },
                                    onTermsClick = { goLegalTerms("register") },
                                    onDataPolicyClick = { goLegalPolicy("register") },
                                    signatureSelectedItem = co.edu.jacquin.jam_app.ui.JamBottomItem.Home,
                                    onHomeClick = { goHome() },
                                    onAboutClick = { goAbout() },
                                    onCoursesClick = { goCourses() },
                                    onContactClick = { goContact() },
                                    onSpecialClick = { goEvents() },
                                    isSubmitting = uiState.isRegistering,
                                    serverError = uiState.error,
                                    termsAccepted = termsAccepted,
                                    onTermsAcceptedChange = { termsAccepted = it },
                                    dataPolicyAccepted = dataPolicyAccepted,
                                    onDataPolicyAcceptedChange = { dataPolicyAccepted = it }
                                )
                            }
                        }

                        showLogin -> {
                            LoginScreen(
                                viewModel = authViewModel,
                                onBackClick = { goHome() },
                                onRegisterClick = { goRegister() },
                                onForgotPasswordClick = { goRecovery() },
                                onHomeClick = { goHome() },
                                onAboutClick = { goAbout() },
                                onCoursesClick = { goCourses() },
                                onContactClick = { goContact() },
                                onSpecialClick = { goEvents() },
                                onLoginSuccess = { goDashboard() }
                            )
                        }

                        showContact -> {
                            saveableStateHolder.SaveableStateProvider("contact") {
                                ContactScreen(
                                    viewModel = contactViewModel,
                                    prefilledEmail = uiState.user?.email,
                                    onBackClick = { goHome() },
                                    onTermsClick = { goLegalTerms("contact") },
                                    onDataPolicyClick = { goLegalPolicy("contact") },
                                    onSentSuccess = {
                                        if (uiState.isLoggedIn) goDashboard() else goHome()
                                    },
                                    onHomeClick = { goHome() },
                                    onAboutClick = { goAbout() },
                                    onCoursesClick = { goCourses() },
                                    onContactClick = { goContact() },
                                    onSpecialClick = { goEvents() },
                                    termsAccepted = termsAccepted,
                                    onTermsAcceptedChange = { termsAccepted = it },
                                    dataPolicyAccepted = dataPolicyAccepted,
                                    onDataPolicyAcceptedChange = { dataPolicyAccepted = it }
                                )
                            }
                        }

                        showDashboard -> {
                            val user = uiState.user
                            if (uiState.isLoggedIn && user != null) {
                                val role = when (user.id_rol) {
                                    1 -> UserRole.Admin // Admin
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
                                    onNavigateToRoute = { route -> 
                                        if (route == co.edu.jacquin.jam_app.ui.dashboard.DashboardSection.ADMIN_USERS.route) {
                                            goAdminUsers()
                                        }
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
                                onEventsClick = { goEvents() }
                            )
                        }
                    }
                }
            }
        }
    }
}
