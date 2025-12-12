package co.edu.jacquin.jam_app.ui.auth

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.core.tween
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import co.edu.jacquin.jam_app.data.remote.dto.UserDto
import co.edu.jacquin.jam_app.ui.JamHorizontalLogo
import co.edu.jacquin.jam_app.ui.JamSignature

@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onBackClick: () -> Unit = {},
    onLoginSuccess: (UserDto) -> Unit = {},

    // ✅ nuevos callbacks
    onRegisterClick: () -> Unit = {},
    onRecoveryClick: () -> Unit = {}
) {
    val state by viewModel.uiState.collectAsState()

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    // ✅ Cuando el login ya fue exitoso, notificamos una sola vez
    LaunchedEffect(state.isLoggedIn, state.user?.id_usuario) {
        val u = state.user
        if (state.isLoggedIn && u != null) onLoginSuccess(u)
    }

    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }

    val backgroundGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF00346A), Color(0xFF000814))
    )

    val innerGlassGradient = Brush.verticalGradient(
        colors = listOf(Color(0x1FFFFFFF), Color(0x05FFFFFF))
    )

    val outerGlassGradient = Brush.verticalGradient(
        colors = listOf(Color(0x26FFFFFF), Color(0x0AFFFFFF))
    )

    // ✅ Mensaje de error “controlado”
    val displayError = remember(state.error) {
        state.error?.let { normalizeLoginError(it) }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundGradient)
    ) {
        AnimatedVisibility(
            visible = visible,
            enter = fadeIn(tween(450)) + slideInVertically(tween(450)) { it / 10 },
            exit = fadeOut(tween(220)) + slideOutVertically(tween(220)) { it / 10 }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp)
            ) {
                Spacer(modifier = Modifier.height(24.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.Filled.ArrowBack,
                            contentDescription = "Volver",
                            tint = Color(0xFFE0ECFF)
                        )
                    }
                    Spacer(modifier = Modifier.width(6.dp))
                    Box(
                        modifier = Modifier.weight(1f),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        JamHorizontalLogo()
                    }
                }

                Spacer(modifier = Modifier.height(22.dp))

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
                                verticalArrangement = Arrangement.spacedBy(18.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "Bienvenido de nuevo",
                                    style = MaterialTheme.typography.headlineSmall,
                                    color = Color.White
                                )

                                Text(
                                    text = "Inicia sesión para entrar a tu universo musical.",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color(0xFFB0C4DE),
                                    textAlign = TextAlign.Center
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
                                        Icon(
                                            imageVector = Icons.Outlined.Email,
                                            contentDescription = "Email",
                                            tint = Color(0xFFB0C4DE)
                                        )
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

                                // ✅ Error entre contraseña y botón (como lo tenías)
                                if (!displayError.isNullOrBlank()) {
                                    Text(
                                        text = displayError,
                                        color = Color(0xFFFF6B81),
                                        style = MaterialTheme.typography.bodySmall,
                                        textAlign = TextAlign.Center,
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                } else {
                                    Spacer(modifier = Modifier.height(2.dp))
                                }

                                JamPrimaryGlassButton(
                                    text = if (state.isLoading) "Conectando." else "Iniciar sesión",
                                    enabled = !state.isLoading,
                                    onClick = { viewModel.login(email.trim(), password) },
                                    showLoader = state.isLoading
                                )

                                // ✅ NUEVO: acciones debajo del botón
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(top = 2.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    TextButton(
                                        onClick = onRegisterClick,
                                        enabled = !state.isLoading,
                                        colors = ButtonDefaults.textButtonColors(
                                            contentColor = Color(0xFFCCF9FF)
                                        ),
                                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 4.dp)
                                    ) {
                                        Text(
                                            text = "Registrarme",
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    }

                                    TextButton(
                                        onClick = onRecoveryClick,
                                        enabled = !state.isLoading,
                                        colors = ButtonDefaults.textButtonColors(
                                            contentColor = Color(0xFFB0C4DE)
                                        ),
                                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 4.dp)
                                    ) {
                                        Text(text = "Recuperar contraseña")
                                    }
                                }

                                Text(
                                    text = "Al continuar aceptas nuestros términos y políticas.",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Color(0xFFBCC6DC),
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(top = 2.dp)
                                        .alpha(0.9f)
                                )
                            }
                        }
                    }
                }
            }
        }

        JamSignature(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 8.dp)
        )
    }
}

/**
 * Normaliza mensajes del backend para que UX sea consistente.
 * - Credenciales inválidas -> “Usuario o contraseña errados.”
 * - Conectividad -> mensaje amable
 * - Otros -> se deja el texto original (para debug)
 */
private fun normalizeLoginError(raw: String): String {
    val msg = raw.trim().lowercase()

    val looksLikeBadCredentials = listOf(
        "invalid", "incorrect", "unauthorized", "401",
        "credenciales", "credentials",
        "contraseña", "password",
        "usuario", "user"
    ).any { msg.contains(it) } &&
            // si viene un error de red, no lo confundimos con credenciales
            !listOf("timeout", "timed out", "unable to resolve host", "failed to connect", "network").any { msg.contains(it) }

    if (looksLikeBadCredentials) return "Usuario o contraseña errados."

    val looksLikeNetwork = listOf(
        "timeout", "timed out", "unable to resolve host", "failed to connect", "network", "connection"
    ).any { msg.contains(it) }

    if (looksLikeNetwork) return "No pudimos conectar. Verifica tu internet e inténtalo de nuevo."

    return raw
}

/* ---------- underlined fields ---------- */

@Composable
private fun JamUnderlinedTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    leadingIcon: (@Composable () -> Unit)? = null
) {
    val underlineBrush = Brush.horizontalGradient(
        colors = listOf(Color(0xFF00F0FF), Color(0xFFB022FF))
    )

    Column(modifier = modifier.fillMaxWidth()) {
        TextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            label = { Text(label) },
            singleLine = true,
            leadingIcon = leadingIcon,
            keyboardOptions = keyboardOptions,
            textStyle = MaterialTheme.typography.bodyMedium,
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Transparent,
                unfocusedContainerColor = Color.Transparent,
                disabledContainerColor = Color.Transparent,
                errorContainerColor = Color.Transparent,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                disabledIndicatorColor = Color.Transparent,
                errorIndicatorColor = Color.Transparent,
                cursorColor = Color(0xFF00F0FF),
                focusedLabelColor = Color(0xFFCCF9FF),
                unfocusedLabelColor = Color(0xFFB0C4DE),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            )
        )

        Spacer(modifier = Modifier.height(4.dp))
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(underlineBrush))
    }
}

@Composable
private fun JamUnderlinedPasswordField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    visible: Boolean,
    onToggleVisibility: () -> Unit,
    modifier: Modifier = Modifier
) {
    val underlineBrush = Brush.horizontalGradient(
        colors = listOf(Color(0xFF00F0FF), Color(0xFFB022FF))
    )

    Column(modifier = modifier.fillMaxWidth()) {
        TextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            label = { Text(label) },
            singleLine = true,
            leadingIcon = {
                // ✅ mantenemos ícono seguro (no introducimos “Lock” para evitar problemas de dependencia)
                Icon(
                    imageVector = Icons.Outlined.Visibility,
                    contentDescription = "Contraseña",
                    tint = Color(0xFFB0C4DE)
                )
            },
            trailingIcon = {
                IconButton(onClick = onToggleVisibility) {
                    Icon(
                        imageVector = if (visible) Icons.Outlined.VisibilityOff else Icons.Outlined.Visibility,
                        contentDescription = "Mostrar/Ocultar",
                        tint = Color(0xFFB0C4DE)
                    )
                }
            },
            visualTransformation = if (visible) VisualTransformation.None else PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            textStyle = MaterialTheme.typography.bodyMedium,
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Transparent,
                unfocusedContainerColor = Color.Transparent,
                disabledContainerColor = Color.Transparent,
                errorContainerColor = Color.Transparent,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                disabledIndicatorColor = Color.Transparent,
                errorIndicatorColor = Color.Transparent,
                cursorColor = Color(0xFF00F0FF),
                focusedLabelColor = Color(0xFFCCF9FF),
                unfocusedLabelColor = Color(0xFFB0C4DE),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            )
        )

        Spacer(modifier = Modifier.height(4.dp))
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(underlineBrush))
    }
}

/* ---------- botón glass ---------- */

@Composable
private fun JamPrimaryGlassButton(
    text: String,
    enabled: Boolean,
    onClick: () -> Unit,
    showLoader: Boolean
) {
    val buttonGradient = Brush.horizontalGradient(
        colors = listOf(Color(0xCCFEA36A), Color(0xCCFF6B6B))
    )

    Button(
        onClick = onClick,
        enabled = enabled,
        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
        contentPadding = PaddingValues(),
        modifier = Modifier
            .fillMaxWidth()
            .height(52.dp)
            .clip(RoundedCornerShape(999.dp))
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White.copy(alpha = 0.12f), RoundedCornerShape(999.dp))
                .border(1.dp, Color.White.copy(alpha = 0.35f), RoundedCornerShape(999.dp))
                .padding(1.5.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(buttonGradient, RoundedCornerShape(999.dp)),
                contentAlignment = Alignment.Center
            ) {
                if (showLoader) {
                    CircularProgressIndicator(
                        strokeWidth = 2.dp,
                        color = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                } else {
                    Text(text = text, color = Color.White)
                }
            }
        }
    }
}
