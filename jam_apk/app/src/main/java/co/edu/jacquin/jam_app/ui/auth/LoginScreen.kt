package co.edu.jacquin.jam_app.ui.auth

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material.icons.materialIcon
import androidx.compose.material.icons.materialPath
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import co.edu.jacquin.jam_app.data.remote.dto.UserDto
import co.edu.jacquin.jam_app.ui.JamHorizontalLogo
import co.edu.jacquin.jam_app.ui.JamSignature
import co.edu.jacquin.jam_app.ui.JamBottomItem
import kotlinx.coroutines.delay

@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onBackClick: () -> Unit = {},
    onRegisterClick: () -> Unit = {},
    onForgotPasswordClick: () -> Unit = {},
    onLoginSuccess: (UserDto) -> Unit = {},

    // Signature nav (igual que HomeScreen)
    signatureSelectedItem: JamBottomItem = JamBottomItem.Home,
    onHomeClick: () -> Unit = {},
    onAboutClick: () -> Unit = {},
    onCoursesClick: () -> Unit = {},
    onContactClick: () -> Unit = {},
    onSpecialClick: () -> Unit = {}
) {
    val state by viewModel.uiState.collectAsState()

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    // ✅ cuando el VM confirme login, navegamos
    LaunchedEffect(state.isLoggedIn, state.user) {
        val u = state.user
        if (state.isLoggedIn && u != null) onLoginSuccess(u)
    }

    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        delay(50)
        visible = true
    }

    val backgroundGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF00346A), Color(0xFF000814))
    )
    val innerGlassGradient = Brush.verticalGradient(listOf(Color(0x1FFFFFFF), Color(0x05FFFFFF)))
    val outerGlassGradient = Brush.verticalGradient(listOf(Color(0x26FFFFFF), Color(0x0AFFFFFF)))

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundGradient)
    ) {
        // Header fijo: back + logo
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 14.dp, end = 18.dp, top = 22.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBackClick) {
                Icon(
                    imageVector = Icons.Filled.ArrowBack,
                    contentDescription = "Volver",
                    tint = Color(0xFFE0ECFF)
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            JamHorizontalLogo(modifier = Modifier.height(44.dp))
        }

        AnimatedVisibility(
            visible = visible,
            enter = fadeIn(tween(420)) + slideInVertically(tween(420)) { it / 10 },
            exit = fadeOut(tween(220)) + slideOutVertically(tween(220)) { it / 10 }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp).padding(bottom = 72.dp)
            ) {
                Spacer(modifier = Modifier.height(120.dp))

                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(30.dp),
                    color = Color.Transparent
                ) {
                    Box(
                        modifier = Modifier
                            .background(outerGlassGradient, RoundedCornerShape(30.dp))
                            .border(1.dp, Color.White.copy(alpha = 0.14f), RoundedCornerShape(30.dp))
                            .padding(2.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(28.dp))
                                .background(innerGlassGradient, RoundedCornerShape(28.dp))
                                .border(0.5.dp, Color.White.copy(alpha = 0.28f), RoundedCornerShape(28.dp))
                                .padding(22.dp)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .verticalScroll(rememberScrollState()),
                                verticalArrangement = Arrangement.spacedBy(14.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "Iniciar sesión",
                                    style = MaterialTheme.typography.headlineSmall,
                                    color = Color.White
                                )

                                JamUnderlinedTextField(
                                    value = email,
                                    onValueChange = {
                                        email = it
                                        if (state.error != null) viewModel.clearError()
                                    },
                                    label = "Correo electrónico",
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                                    leadingIcon = {
                                        Icon(Icons.Outlined.Email, null, tint = Color(0xFFB0C4DE))
                                    }
                                )

                                JamUnderlinedPasswordField(
                                    value = password,
                                    onValueChange = {
                                        password = it
                                        if (state.error != null) viewModel.clearError()
                                    },
                                    label = "Contraseña",
                                    visible = passwordVisible,
                                    onToggleVisibility = { passwordVisible = !passwordVisible }
                                )

                                // ✅ 3rem aprox
                                Spacer(modifier = Modifier.height(48.dp))

                                if (!state.error.isNullOrBlank()) {
                                    Text(
                                        text = state.error!!,
                                        color = Color(0xFFFF6B81),
                                        style = MaterialTheme.typography.bodySmall,
                                        textAlign = TextAlign.Center,
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                }

                                JamPrimaryGlassButton(
                                    text = if (state.isLoading) "Iniciando..." else "Iniciar sesión",
                                    enabled = !state.isLoading && email.isNotBlank() && password.isNotBlank(),
                                    showLoader = state.isLoading,
                                    onClick = { viewModel.login(email.trim(), password) }
                                )

                                Spacer(modifier = Modifier.height(10.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    TextButton(
                                        onClick = onRegisterClick,
                                        enabled = !state.isLoading,
                                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text("Registrarme", color = Color(0xFFCCF9FF), fontWeight = FontWeight.SemiBold)
                                    }

                                    TextButton(
                                        onClick = onForgotPasswordClick,
                                        enabled = !state.isLoading,
                                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            "Recuperar contraseña",
                                            color = Color(0xFFB0C4DE),
                                            fontSize = 12.sp,
                                            maxLines = 1,
                                            softWrap = false
                                        )
                                    }
                                }

                                Text(
                                    text = "Al continuar aceptas nuestros términos y políticas.",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Color(0xFFBCC6DC),
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .alpha(0.9f)
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.weight(1f))
            }
        }

        JamSignature(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 8.dp),
            showNavIcons = true,
            selectedItem = JamBottomItem.Home, // ✅ mantiene Home activo (Special nunca se queda activo)
            onHomeClick = onHomeClick,
            onAboutClick = onAboutClick,
            onCoursesClick = onCoursesClick,
            onContactClick = onContactClick,
            onSpecialClick = onSpecialClick
        )

        // Robust Error Overlay
        if (state.isConnectionError) {
            JamConnectionErrorOverlay(
                onRetry = { viewModel.clearError() }
            )
        }
    }
}

@Composable
private fun JamConnectionErrorOverlay(onRetry: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.6f))
            .clickable(enabled = false) {}, // Block clicks
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .padding(32.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(Brush.verticalGradient(listOf(Color(0xCC1A1A2E), Color(0xCC16213E))))
                .border(1.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(24.dp))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.CloudOff, // Requires importing Icons.Default.CloudOff or similar
                    contentDescription = null,
                    tint = Color(0xFFFF6B6B),
                    modifier = Modifier.size(48.dp)
                )
                Text(
                    text = "Servidor no disponible",
                    style = MaterialTheme.typography.titleMedium,
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "No pudimos conectar con el servidor (modo pruebas).\nVerifica tu túnel Ngrok o tu conexión a internet.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFFB0C4DE),
                    textAlign = TextAlign.Center
                )
                Button(
                    onClick = onRetry,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4ECCA3)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Reintentar", color = Color.Black, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

/* ---------- Underlined fields ---------- */

@Composable
private fun JamUnderlinedTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    leadingIcon: (@Composable () -> Unit)? = null
) {
    val underlineBrush = Brush.horizontalGradient(listOf(Color(0xFF00F0FF), Color(0xFFB022FF)))
    Column(modifier = modifier.fillMaxWidth()) {
        TextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth().height(56.dp),
            label = { Text(label) },
            singleLine = true,
            leadingIcon = leadingIcon,
            keyboardOptions = keyboardOptions,
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Transparent,
                unfocusedContainerColor = Color.Transparent,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                cursorColor = Color(0xFF00F0FF),
                focusedLabelColor = Color(0xFFCCF9FF),
                unfocusedLabelColor = Color(0xFFB0C4DE),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            )
        )
        Spacer(modifier = Modifier.height(4.dp))
        Box(Modifier.fillMaxWidth().height(1.dp).background(underlineBrush))
    }
}

@Composable
private fun JamUnderlinedPasswordField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    visible: Boolean,
    onToggleVisibility: () -> Unit
) {
    val underlineBrush = Brush.horizontalGradient(listOf(Color(0xFF00F0FF), Color(0xFFB022FF)))

    Column(Modifier.fillMaxWidth()) {
        TextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth().height(56.dp),
            label = { Text(label) },
            singleLine = true,
            leadingIcon = {
                Icon(imageVector = JamLockIcon, contentDescription = null, tint = Color(0xFFB0C4DE))
            },
            trailingIcon = {
                IconButton(onClick = onToggleVisibility) {
                    Icon(
                        imageVector = if (visible) Icons.Outlined.VisibilityOff else Icons.Outlined.Visibility,
                        contentDescription = null,
                        tint = Color(0xFFB0C4DE)
                    )
                }
            },
            visualTransformation = if (visible) VisualTransformation.None else PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Transparent,
                unfocusedContainerColor = Color.Transparent,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                cursorColor = Color(0xFF00F0FF),
                focusedLabelColor = Color(0xFFCCF9FF),
                unfocusedLabelColor = Color(0xFFB0C4DE),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            )
        )
        Spacer(modifier = Modifier.height(4.dp))
        Box(Modifier.fillMaxWidth().height(1.dp).background(underlineBrush))
    }
}

@Composable
private fun JamPrimaryGlassButton(
    text: String,
    enabled: Boolean,
    showLoader: Boolean,
    onClick: () -> Unit
) {
    val buttonGradient = Brush.horizontalGradient(listOf(Color(0xCCFEA36A), Color(0xCCFF6B6B)))

    Button(
        onClick = onClick,
        enabled = enabled,
        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
        contentPadding = PaddingValues(),
        modifier = Modifier.fillMaxWidth().height(52.dp).clip(RoundedCornerShape(999.dp))
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White.copy(alpha = 0.12f), RoundedCornerShape(999.dp))
                .border(1.dp, Color.White.copy(alpha = 0.35f), RoundedCornerShape(999.dp))
                .padding(1.5.dp)
        ) {
            Box(
                modifier = Modifier.fillMaxSize().background(buttonGradient, RoundedCornerShape(999.dp)),
                contentAlignment = Alignment.Center
            ) {
                if (showLoader) {
                    CircularProgressIndicator(strokeWidth = 2.dp, color = Color.White, modifier = Modifier.size(18.dp))
                } else {
                    Text(text = text, color = Color.White)
                }
            }
        }
    }
}

/* ---------- Lock icon ---------- */
private val JamLockIcon: ImageVector by lazy {
    materialIcon(name = "JamLock") {
        materialPath {
            moveTo(8f, 10f)
            lineTo(8f, 8.2f)
            curveTo(8f, 6.2f, 9.6f, 4.6f, 11.6f, 4.6f)
            curveTo(13.6f, 4.6f, 15.2f, 6.2f, 15.2f, 8.2f)
            lineTo(15.2f, 10f)

            moveTo(7.2f, 10f)
            lineTo(16.8f, 10f)
            curveTo(18.0f, 10f, 19.0f, 11.0f, 19.0f, 12.2f)
            lineTo(19.0f, 18.0f)
            curveTo(19.0f, 19.2f, 18.0f, 20.2f, 16.8f, 20.2f)
            lineTo(7.2f, 20.2f)
            curveTo(6.0f, 20.2f, 5.0f, 19.2f, 5.0f, 18.0f)
            lineTo(5.0f, 12.2f)
            curveTo(5.0f, 11.0f, 6.0f, 10f, 7.2f, 10f)
            close()

            moveTo(12f, 13.2f)
            curveTo(11.0f, 13.2f, 10.2f, 14.0f, 10.2f, 15.0f)
            curveTo(10.2f, 15.8f, 10.7f, 16.5f, 11.4f, 16.8f)
            lineTo(11.4f, 18.2f)
            lineTo(12.6f, 18.2f)
            lineTo(12.6f, 16.8f)
            curveTo(13.3f, 16.5f, 13.8f, 15.8f, 13.8f, 15.0f)
            curveTo(13.8f, 14.0f, 13.0f, 13.2f, 12f, 13.2f)
            close()
        }
    }
}
