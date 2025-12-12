package co.edu.jacquin.jam_app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.lifecycle.ViewModelProvider
import androidx.compose.runtime.*
import androidx.navigation.compose.*
import kotlinx.coroutines.delay
import co.edu.jacquin.jam_app.data.remote.RetrofitClient
import co.edu.jacquin.jam_app.data.repository.AuthRepository
import co.edu.jacquin.jam_app.domain.UserRole
import co.edu.jacquin.jam_app.ui.SplashScreen
import co.edu.jacquin.jam_app.ui.auth.AuthViewModel
import co.edu.jacquin.jam_app.ui.auth.AuthViewModelFactory
import co.edu.jacquin.jam_app.ui.auth.LoginScreen
import co.edu.jacquin.jam_app.ui.dashboard.DashboardScreen
import co.edu.jacquin.jam_app.ui.home.HomeScreen
import co.edu.jacquin.jam_app.ui.theme.JAM_appTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val api = RetrofitClient.api
        val authRepository = AuthRepository(api)
        val factory = AuthViewModelFactory(authRepository)
        val authViewModel = ViewModelProvider(this, factory)[AuthViewModel::class.java]

        setContent {
            JAM_appTheme {
                val navController = rememberNavController()
                val state by authViewModel.uiState.collectAsState()

                val isLoggedIn = state.isLoggedIn && state.user != null
                val userName = state.user?.full_name.orEmpty()
                val userRole = remember(state.user?.id_rol) {
                    when (state.user?.id_rol) {
                        1 -> UserRole.Admin
                        2 -> UserRole.Teacher
                        3 -> UserRole.Student
                        else -> UserRole.Student
                    }
                }

                NavHost(navController = navController, startDestination = "splash") {

                    composable("splash") {
                        SplashScreen()
                        LaunchedEffect(Unit) {
                            delay(2500L)
                            navController.navigate("home") {
                                popUpTo("splash") { inclusive = true }
                            }
                        }
                    }

                    composable("home") {
                        HomeScreen(
                            isLoggedIn = isLoggedIn,
                            onLoginClick = { navController.navigate("login") },
                            onDashboardClick = { navController.navigate("dashboard") },
                            onCoursesClick = { navController.navigate("courses") },
                            onAboutClick = { navController.navigate("about") },
                            onContactClick = { navController.navigate("contact") }
                        )
                    }

                    composable("login") {
                        LoginScreen(
                            viewModel = authViewModel,
                            onBackClick = { navController.popBackStack() },
                            onLoginSuccess = {
                                navController.navigate("dashboard") {
                                    popUpTo("login") { inclusive = true }
                                }
                            }
                        )
                    }

                    composable("dashboard") {
                        // si no hay sesión, no dejamos entrar
                        LaunchedEffect(isLoggedIn) {
                            if (!isLoggedIn) {
                                navController.navigate("login") {
                                    popUpTo("dashboard") { inclusive = true }
                                }
                            }
                        }

                        if (isLoggedIn) {
                            DashboardScreen(
                                userRole = userRole,
                                userName = userName,
                                onBackClick = { navController.popBackStack() },

                                onLogoutClick = {
                                    authViewModel.logout()
                                    navController.navigate("home") {
                                        popUpTo("home") { inclusive = true }
                                    }
                                },

                                // navegación pública (sesión persiste)
                                onGoHome = { navController.navigate("home") },
                                onGoAbout = { navController.navigate("about") },
                                onGoCourses = { navController.navigate("courses") },
                                onGoContact = { navController.navigate("contact") }
                            )
                        }
                    }

                    // placeholders públicos (por ahora)
                    composable("about") { SimplePublicPlaceholder(title = "Nosotros") { navController.popBackStack() } }
                    composable("courses") { SimplePublicPlaceholder(title = "Cursos") { navController.popBackStack() } }
                    composable("contact") { SimplePublicPlaceholder(title = "Contáctanos") { navController.popBackStack() } }
                }
            }
        }
    }
}

@Composable
private fun SimplePublicPlaceholder(title: String, onBack: () -> Unit) {
    // Puedes reemplazar esto luego por tus pantallas reales.
    // Lo dejo mínimo para que el flujo compile y puedas probar el “enfoque 1”.
    androidx.compose.material3.Text(text = title)
}
