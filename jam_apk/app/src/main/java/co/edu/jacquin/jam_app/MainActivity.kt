package co.edu.jacquin.jam_app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModelProvider
import co.edu.jacquin.jam_app.data.remote.RetrofitClient
import co.edu.jacquin.jam_app.data.repository.AuthRepository
import co.edu.jacquin.jam_app.ui.auth.AuthViewModel
import co.edu.jacquin.jam_app.ui.auth.AuthViewModelFactory
import co.edu.jacquin.jam_app.ui.auth.LoginScreen
import co.edu.jacquin.jam_app.ui.theme.JAM_appTheme   // 👈 si el nombre del theme es distinto, lo ajustamos luego
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.LaunchedEffect
import kotlinx.coroutines.delay
import co.edu.jacquin.jam_app.ui.SplashScreen
import co.edu.jacquin.jam_app.ui.home.HomeScreen
import co.edu.jacquin.jam_app.ui.auth.LoginScreen


class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // ----- Configurar ViewModel de autenticación -----
        val api = RetrofitClient.api
        val authRepository = AuthRepository(api)
        val authViewModelFactory = AuthViewModelFactory(authRepository)
        val authViewModel = ViewModelProvider(
            this,
            authViewModelFactory
        )[AuthViewModel::class.java]

        // ----- Contenido Compose -----
        setContent {
            JAM_appTheme {   // 👈 ESTE es tu tema real
                var showSplash by remember { mutableStateOf(true) }
                var showLogin by remember { mutableStateOf(false) }

                LaunchedEffect(Unit) {
                    delay(2500L) // 2.5 segundos de splash
                    showSplash = false
                }

                when {
                    showSplash -> {
                        SplashScreen()
                    }

                    showLogin -> {
                        LoginScreen(
                            viewModel = authViewModel,
                            onBackClick = { showLogin = false }  // volver al Home
                        )
                    }

                    else -> {
                        HomeScreen(
                            onLoginClick = { showLogin = true },
                            onCoursesClick = { showLogin = true },   // luego apuntamos a Cursos
                            onAboutClick = { /* TODO: Nosotros */ },
                            onContactClick = { /* TODO: Contáctanos */ }
                        )
                    }
                }
            }
        }
    }
}