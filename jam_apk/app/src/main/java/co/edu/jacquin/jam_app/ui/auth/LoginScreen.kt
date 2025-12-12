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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import co.edu.jacquin.jam_app.data.remote.dto.UserDto
import co.edu.jacquin.jam_app.ui.JamHorizontalLogo
import co.edu.jacquin.jam_app.ui.JamSignature
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import co.edu.jacquin.jam_app.ui.common.JamScreenTransition // lo dejamos por si luego lo usas

@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onBackClick: () -> Unit = {}
) {
    val state by viewModel.uiState.collectAsState()

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    // Para animación de entrada
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        visible = true
    }

    // Fondo JAM
    val backgroundGradient = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF00346A),
            Color(0xFF000814)
        )
    )

    // Capa interna del glass (muy transparente)
    val innerGlassGradient = Brush.verticalGradient(
        colors = listOf(
            Color(0x1FFFFFFF), // ~12% blanco
            Color(0x05FFFFFF)  // ~2% blanco
        )
    )

    // Halo externo para dar sensación de grosor
    val outerGlassGradient = Brush.verticalGradient(
        colors = listOf(
            Color(0x26FFFFFF), // ~15% blanco
            Color(0x00FFFFFF)
        )
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundGradient)
            .padding(horizontal = 24.dp)
    ) {
        // Header fijo
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 24.dp)
                .align(Alignment.TopCenter),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            JamHorizontalLogo()

            IconButton(onClick = onBackClick) {
                Icon(
                    imageVector = Icons.Filled.ArrowBack,
                    contentDescription = "Volver",
                    tint = Color(0xFFE0ECFF)
                )
            }
        }

        // Contenido animado (card + textos + campos)
        AnimatedVisibility(
            visible = visible,
            modifier = Modifier.align(Alignment.TopCenter),
            enter = fadeIn(animationSpec = tween(600)) +
                    slideInVertically(
                        animationSpec = tween(600),
                        initialOffsetY = { it / 8 } // entra desde un poco abajo
                    ),
            exit = fadeOut(animationSpec = tween(300)) +
                    slideOutVertically(
                        animationSpec = tween(300),
                        targetOffsetY = { it / 8 }
                    )
        ) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 96.dp, bottom = 72.dp),
                color = Color.Transparent
            ) {
                Box(
                    modifier = Modifier
                        .background(
                            brush = outerGlassGradient,
                            shape = RoundedCornerShape(30.dp)
                        )
                        .border(
                            width = 1.dp,
                            color = Color.White.copy(alpha = 0.14f),
                            shape = RoundedCornerShape(30.dp)
                        )
                        .padding(2.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(28.dp))
                            .background(
                                brush = innerGlassGradient,
                                shape = RoundedCornerShape(28.dp)
                            )
                            .border(
                                width = 0.5.dp,
                                color = Color.White.copy(alpha = 0.28f),
                                shape = RoundedCornerShape(28.dp)
                            )
                            .padding(22.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .verticalScroll(rememberScrollState()),
                            verticalArrangement = Arrangement.spacedBy(20.dp),
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

                            // Campo correo underlined
                            JamUnderlinedTextField(
                                value = email,
                                onValueChange = { email = it },
                                label = "Correo electrónico",
                                keyboardOptions = KeyboardOptions(
                                    keyboardType = KeyboardType.Email
                                ),
                                leadingIcon = {
                                    Icon(
                                        imageVector = Icons.Outlined.Email,
                                        contentDescription = "Email",
                                        tint = Color(0xFFB0C4DE)
                                    )
                                }
                            )

                            // Campo contraseña underlined con icono de visibilidad
                            JamUnderlinedPasswordField(
                                value = password,
                                onValueChange = { password = it },
                                label = "Contraseña",
                                visible = passwordVisible,
                                onToggleVisibility = { passwordVisible = !passwordVisible }
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            // Mensaje de error entre contraseña y botón
                            if (state.error != null) {
                                Text(
                                    text = state.error ?: "",
                                    color = Color(0xFFFF6B81),
                                    style = MaterialTheme.typography.bodySmall,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.fillMaxWidth()
                                )
                                Spacer(modifier = Modifier.height(10.dp))
                            } else {
                                Spacer(modifier = Modifier.height(4.dp))
                            }

                            // Botón glass brillante
                            JamPrimaryGlassButton(
                                text = if (state.isLoading) "Conectando..." else "Iniciar sesión",
                                enabled = !state.isLoading,
                                onClick = {
                                    viewModel.login(email.trim(), password)
                                },
                                showLoader = state.isLoading
                            )

                            Text(
                                text = "Al continuar aceptas nuestros términos y políticas.",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color(0xFFBCC6DC),
                                textAlign = TextAlign.Center,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 4.dp)
                                    .alpha(0.9f)
                            )
                        }
                    }
                }
            }
        }

        // Mensaje de bienvenida cuando ya está logueado
        val user: UserDto? = state.user
        if (state.isLoggedIn && user != null) {
            Column(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 40.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Bienvenido, ${user.full_name}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFFCCF9FF)
                )
                Text(
                    text = "Rol ID: ${user.id_rol}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFFB0C4DE)
                )
            }
        }

        // Firma “Diseñado y creado…”
        JamSignature(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 8.dp)
        )
    }
}

/* ---------- Campos underlined ---------- */

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
        colors = listOf(
            Color(0xFF00F0FF), // JacquinBlueNeon
            Color(0xFFB022FF)  // JacquinPurpleNeon
        )
    )

    Column(
        modifier = modifier.fillMaxWidth()
    ) {
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

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(underlineBrush)
        )
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
        colors = listOf(
            Color(0xFF00F0FF),
            Color(0xFFB022FF)
        )
    )

    Column(
        modifier = modifier.fillMaxWidth()
    ) {
        TextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            label = { Text(label) },
            singleLine = true,
            leadingIcon = {
                Icon(
                    imageVector = Icons.Outlined.Lock,
                    contentDescription = "Contraseña",
                    tint = Color(0xFFB0C4DE)
                )
            },
            trailingIcon = {
                IconButton(onClick = onToggleVisibility) {
                    Icon(
                        imageVector = if (visible)
                            Icons.Outlined.VisibilityOff
                        else
                            Icons.Outlined.Visibility,
                        contentDescription = if (visible)
                            "Ocultar contraseña" else "Mostrar contraseña",
                        tint = Color(0xFFB0C4DE)
                    )
                }
            },
            visualTransformation = if (visible) {
                VisualTransformation.None
            } else {
                PasswordVisualTransformation()
            },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password
            ),
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

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(underlineBrush)
        )
    }
}

/* ---------- Botón glass ---------- */

@Composable
private fun JamPrimaryGlassButton(
    text: String,
    enabled: Boolean,
    onClick: () -> Unit,
    showLoader: Boolean
) {
    val coreGradient = Brush.horizontalGradient(
        colors = listOf(
            Color(0xCCFEA36A),
            Color(0xCCFF6B6B)
        )
    )

    val highlightGradient = Brush.verticalGradient(
        colors = listOf(
            Color.White.copy(alpha = 0.55f),
            Color.Transparent
        )
    )

    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier
            .fillMaxWidth()
            .height(52.dp)
            .clip(RoundedCornerShape(999.dp)),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.Transparent,
            disabledContainerColor = Color.Transparent,
            contentColor = Color.White,
            disabledContentColor = Color(0x80FFFFFF)
        ),
        contentPadding = PaddingValues()
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Color.White.copy(alpha = 0.16f),
                    RoundedCornerShape(999.dp)
                )
                .border(
                    width = 1.dp,
                    color = Color.White.copy(alpha = 0.35f),
                    shape = RoundedCornerShape(999.dp)
                )
                .padding(1.5.dp),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(coreGradient, RoundedCornerShape(999.dp))
            ) {
                // franja de brillo superior
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(22.dp)
                        .background(
                            highlightGradient,
                            RoundedCornerShape(
                                topStart = 999.dp,
                                topEnd = 999.dp,
                                bottomStart = 40.dp,
                                bottomEnd = 40.dp
                            )
                        )
                        .align(Alignment.TopCenter)
                )

                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    if (showLoader) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(22.dp),
                            color = Color.White,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(
                            text = text,
                            style = MaterialTheme.typography.labelLarge
                        )
                    }
                }
            }
        }
    }
}
