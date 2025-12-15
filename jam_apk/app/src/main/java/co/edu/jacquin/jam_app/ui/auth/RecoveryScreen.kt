package co.edu.jacquin.jam_app.ui.auth

import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.outlined.Email
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
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import co.edu.jacquin.jam_app.ui.JamBottomItem
import co.edu.jacquin.jam_app.ui.JamHorizontalLogo
import co.edu.jacquin.jam_app.ui.JamSignature
import kotlinx.coroutines.launch

@Composable
fun RecoveryScreen(
    viewModel: RecoveryViewModel,
    onBackClick: () -> Unit = {},
    onGoLogin: () -> Unit = {},
    onGoRegister: () -> Unit = {},
    onRecoveryFinished: () -> Unit = {}, // cuando actualiza contraseña con éxito
    // Signature
    onHomeClick: () -> Unit = {},
    onAboutClick: () -> Unit = {},
    onCoursesClick: () -> Unit = {},
    onContactClick: () -> Unit = {},
    onEventsClick: () -> Unit = {}
) {
    val ui by viewModel.uiState.collectAsState()

    val backgroundGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF00346A), Color(0xFF000814))
    )
    val innerGlassGradient = Brush.verticalGradient(
        colors = listOf(Color(0x1FFFFFFF), Color(0x05FFFFFF))
    )
    val outerGlassGradient = Brush.verticalGradient(
        colors = listOf(Color(0x26FFFFFF), Color(0x0AFFFFFF))
    )

    val scroll = rememberScrollState()
    val scope = rememberCoroutineScope()

    // Si backend confirmó que ya actualizó, regresamos a login
    LaunchedEffect(ui.message) {
        if (ui.message?.contains("actualizado", ignoreCase = true) == true ||
            ui.message?.contains("Contraseña", ignoreCase = true) == true &&
            ui.step == RecoveryStep.NewPassword && !ui.isLoading && ui.error == null
        ) {
            // dejamos al usuario ver el snackbar/feedback en MainActivity
        }
    }

    var newPwd by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }
    var pwdVisible by remember { mutableStateOf(false) }
    var confirmVisible by remember { mutableStateOf(false) }

    val pwdState by remember { derivedStateOf { RecoveryPasswordRules.evaluate(newPwd) } }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundGradient)
    ) {
        // Header fijo
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 14.dp, end = 18.dp, top = 54.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBackClick) {
                Icon(
                    imageVector = Icons.Filled.ArrowBack,
                    contentDescription = "Volver",
                    tint = Color(0xFFE0ECFF)
                )
            }
            Spacer(Modifier.width(8.dp))
            JamHorizontalLogo(modifier = Modifier.height(44.dp))
        }

        // Glass
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(top = 200.dp, bottom = 96.dp),
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
                            .verticalScroll(scroll),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Text(
                            text = "Recuperar contraseña",
                            style = MaterialTheme.typography.headlineSmall,
                            color = Color.White
                        )

                        when (ui.step) {
                            RecoveryStep.EnterEmail -> {
                                Text(
                                    text = "Ingresa tu correo. Te enviaremos un código de verificación.",
                                    color = Color(0xFFB0C4DE),
                                    style = MaterialTheme.typography.bodyMedium
                                )

                                UnderlineField(
                                    value = ui.email,
                                    onValueChange = viewModel::setEmail,
                                    label = "Correo electrónico",
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                                    leadingIcon = {
                                        Icon(
                                            imageVector = Icons.Outlined.Email,
                                            contentDescription = null,
                                            tint = Color(0xFFB0C4DE)
                                        )
                                    }
                                )

                                if (ui.userNotFound) {
                                    Surface(
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(18.dp),
                                        color = Color.White.copy(alpha = 0.06f)
                                    ) {
                                        Column(
                                            modifier = Modifier.padding(14.dp),
                                            verticalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            Text(
                                                text = "No encontramos una cuenta con ese correo.",
                                                color = Color.White,
                                                fontWeight = FontWeight.SemiBold
                                            )
                                            Text(
                                                text = "¡Únete a la familia académica JACQUIN! Puedes crear tu cuenta en segundos.",
                                                color = Color(0xFFB0C4DE),
                                                style = MaterialTheme.typography.bodySmall
                                            )
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.End
                                            ) {
                                                TextButton(onClick = onGoRegister) {
                                                    Text("Ir a registrarme", color = Color(0xFFCCF9FF))
                                                }
                                            }
                                        }
                                    }
                                }

                                PrimaryGlassButton(
                                    text = if (ui.isLoading) "Enviando..." else "Enviar código",
                                    enabled = !ui.isLoading,
                                    showLoader = ui.isLoading,
                                    onClick = { viewModel.requestCode() }
                                )

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "¿Ya tienes cuenta?",
                                        color = Color(0xFFB0C4DE),
                                        fontSize = 13.sp
                                    )
                                    Spacer(Modifier.width(6.dp))
                                    TextButton(onClick = onGoLogin) {
                                        Text("Inicia sesión", color = Color(0xFFCCF9FF), fontWeight = FontWeight.SemiBold)
                                    }
                                }
                            }

                            RecoveryStep.EnterCode -> {
                                Text(
                                    text = "Te enviamos un código al correo. Ingresa el código para continuar.",
                                    color = Color(0xFFB0C4DE),
                                    style = MaterialTheme.typography.bodyMedium
                                )

                                CodeField(
                                    value = ui.code,
                                    onValueChange = viewModel::setCode
                                )

                                PrimaryGlassButton(
                                    text = if (ui.isLoading) "Verificando..." else "Verificar código",
                                    enabled = !ui.isLoading,
                                    showLoader = ui.isLoading,
                                    onClick = { viewModel.verifyCode() }
                                )

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    TextButton(onClick = { viewModel.goToEmail() }, enabled = !ui.isLoading) {
                                        Text("Cambiar correo", color = Color(0xFFB0C4DE))
                                    }
                                    TextButton(
                                        onClick = { viewModel.requestCode() },
                                        enabled = !ui.isLoading
                                    ) {
                                        Text("Reenviar código", color = Color(0xFFCCF9FF), fontWeight = FontWeight.SemiBold)
                                    }
                                }
                            }

                            RecoveryStep.NewPassword -> {
                                Text(
                                    text = "Crea una nueva contraseña. Recomendamos una contraseña fuerte.",
                                    color = Color(0xFFB0C4DE),
                                    style = MaterialTheme.typography.bodyMedium
                                )

                                PasswordField(
                                    value = newPwd,
                                    onValueChange = { newPwd = it },
                                    label = "Nueva contraseña",
                                    visible = pwdVisible,
                                    onToggleVisibility = { pwdVisible = !pwdVisible }
                                )

                                PasswordStrengthCardCompact(state = pwdState)

                                PasswordField(
                                    value = confirm,
                                    onValueChange = { confirm = it },
                                    label = "Confirmar contraseña",
                                    visible = confirmVisible,
                                    onToggleVisibility = { confirmVisible = !confirmVisible }
                                )

                                if (confirm.isNotBlank() && newPwd != confirm) {
                                    Text(
                                        text = "Las contraseñas no coinciden.",
                                        color = Color(0xFFFF6B81),
                                        style = MaterialTheme.typography.bodySmall
                                    )
                                }

                                PrimaryGlassButton(
                                    text = if (ui.isLoading) "Actualizando..." else "Actualizar contraseña",
                                    enabled = !ui.isLoading,
                                    showLoader = ui.isLoading,
                                    onClick = {
                                        viewModel.resetPassword(
                                            newPassword = newPwd,
                                            confirm = confirm,
                                            pwdStrong = pwdState.isStrong
                                        )
                                    }
                                )

                                if (!ui.isLoading && ui.error == null && ui.message != null) {
                                    // feedback + botón para volver a login
                                    Surface(
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(18.dp),
                                        color = Color.White.copy(alpha = 0.06f)
                                    ) {
                                        Column(
                                            modifier = Modifier.padding(14.dp),
                                            verticalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            Text(
                                                text = ui.message ?: "Contraseña actualizada.",
                                                color = Color.White,
                                                fontWeight = FontWeight.SemiBold
                                            )
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.End
                                            ) {
                                                TextButton(onClick = {
                                                    onRecoveryFinished()
                                                    onGoLogin()
                                                }) {
                                                    Text("Ir a iniciar sesión", color = Color(0xFFCCF9FF))
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if (ui.codeExpired) {
                            Surface(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(18.dp),
                                color = Color.White.copy(alpha = 0.06f)
                            ) {
                                Column(
                                    modifier = Modifier.padding(14.dp),
                                    verticalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text(
                                        text = "El código expiró.",
                                        color = Color.White,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        text = "Vuelve a ingresar tu correo para solicitar un nuevo código.",
                                        color = Color(0xFFB0C4DE),
                                        style = MaterialTheme.typography.bodySmall
                                    )
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.End
                                    ) {
                                        TextButton(onClick = { viewModel.goToEmail() }) {
                                            Text("Solicitar nuevo código", color = Color(0xFFCCF9FF))
                                        }
                                    }
                                }
                            }
                        }

                        if (!ui.error.isNullOrBlank()) {
                            Text(
                                text = ui.error!!,
                                color = Color(0xFFFF6B81),
                                style = MaterialTheme.typography.bodySmall,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }

                        if (!ui.message.isNullOrBlank() && ui.error.isNullOrBlank()) {
                            Text(
                                text = ui.message!!,
                                color = Color(0xFFCCF9FF),
                                style = MaterialTheme.typography.bodySmall,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }
            }
        }

        // Signature overlay
        JamSignature(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 8.dp),
            showNavIcons = true,
            selectedItem = JamBottomItem.Home,
            onHomeClick = onHomeClick,
            onAboutClick = onAboutClick,
            onCoursesClick = onCoursesClick,
            onContactClick = onContactClick,
            onSpecialClick = onEventsClick
        )
    }
}


/* ========= UI pieces ========= */

@Composable
private fun UnderlineField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    keyboardOptions: KeyboardOptions,
    leadingIcon: (@Composable () -> Unit)? = null
) {
    val underlineBrush = Brush.horizontalGradient(
        colors = listOf(Color(0xFF00F0FF), Color(0xFFB022FF))
    )

    Column(Modifier.fillMaxWidth()) {
        TextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth().height(56.dp),
            singleLine = true,
            label = { Text(label) },
            leadingIcon = leadingIcon,
            keyboardOptions = keyboardOptions,
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Transparent,
                unfocusedContainerColor = Color.Transparent,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                cursorColor = Color(0xFF00F0FF),
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                focusedLabelColor = Color(0xFFCCF9FF),
                unfocusedLabelColor = Color(0xFFB0C4DE)
            )
        )
        Spacer(Modifier.height(4.dp))
        Box(Modifier.fillMaxWidth().height(1.dp).background(underlineBrush))
    }
}

@Composable
private fun CodeField(
    value: String,
    onValueChange: (String) -> Unit
) {
    val underlineBrush = Brush.horizontalGradient(
        colors = listOf(Color(0xFF00F0FF), Color(0xFFB022FF))
    )

    Column(Modifier.fillMaxWidth()) {
        TextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth().height(56.dp),
            singleLine = true,
            label = { Text("Código") },
            placeholder = { Text("Ej: 123456", color = Color.White.copy(alpha = 0.55f)) },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color.Transparent,
                unfocusedContainerColor = Color.Transparent,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                cursorColor = Color(0xFF00F0FF),
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                focusedLabelColor = Color(0xFFCCF9FF),
                unfocusedLabelColor = Color(0xFFB0C4DE)
            )
        )
        Spacer(Modifier.height(4.dp))
        Box(Modifier.fillMaxWidth().height(1.dp).background(underlineBrush))
    }
}

@Composable
private fun PasswordField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    visible: Boolean,
    onToggleVisibility: () -> Unit
) {
    val underlineBrush = Brush.horizontalGradient(
        colors = listOf(Color(0xFF00F0FF), Color(0xFFB022FF))
    )

    Column(Modifier.fillMaxWidth()) {
        TextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth().height(56.dp),
            singleLine = true,
            label = { Text(label) },
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
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                cursorColor = Color(0xFF00F0FF),
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                focusedLabelColor = Color(0xFFCCF9FF),
                unfocusedLabelColor = Color(0xFFB0C4DE)
            )
        )
        Spacer(Modifier.height(4.dp))
        Box(Modifier.fillMaxWidth().height(1.dp).background(underlineBrush))
    }
}

@Composable
private fun PrimaryGlassButton(
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

/* ========= Password strength (compact) ========= */

private object RecoveryPasswordRules {
    data class State(
        val hasMinLen: Boolean,
        val hasUpper: Boolean,
        val hasLower: Boolean,
        val hasDigit: Boolean,
        val hasSpecial: Boolean
    ) {
        val score: Int get() = listOf(hasMinLen, hasUpper, hasLower, hasDigit, hasSpecial).count { it }
        val isStrong: Boolean get() = score == 5
        val label: String
            get() = when (score) {
                0, 1 -> "Débil"
                2, 3 -> "Media"
                4 -> "Buena"
                else -> "Fuerte"
            }
        val labelColor: Color
            get() = when (score) {
                0, 1 -> Color(0xFFFF6B81)
                2, 3 -> Color(0xFFB0C4DE)
                else -> Color(0xFF00F0FF)
            }
    }

    fun evaluate(password: String): State {
        val p = password
        return State(
            hasMinLen = p.length >= 6,
            hasUpper = p.any { it.isUpperCase() },
            hasLower = p.any { it.isLowerCase() },
            hasDigit = p.any { it.isDigit() },
            hasSpecial = p.any { !it.isLetterOrDigit() }
        )
    }
}

@Composable
private fun PasswordStrengthCardCompact(state: RecoveryPasswordRules.State) {
    val cardShape = RoundedCornerShape(18.dp)
    val border = Color.White.copy(alpha = 0.16f)
    val bg = Brush.verticalGradient(listOf(Color.White.copy(alpha = 0.10f), Color.White.copy(alpha = 0.05f)))

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(cardShape)
            .background(bg, cardShape)
            .border(1.dp, border, cardShape)
            .padding(horizontal = 14.dp, vertical = 10.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "Contraseña segura",
                color = Color.White,
                fontWeight = FontWeight.SemiBold,
                fontSize = 13.sp,
                modifier = Modifier.weight(1f)
            )
            Text(
                text = state.label,
                color = state.labelColor,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp
            )
        }
        RuleRow("Mínimo 6 caracteres", state.hasMinLen)
        RuleRow("1 mayúscula (A-Z)", state.hasUpper)
        RuleRow("1 minúscula (a-z)", state.hasLower)
        RuleRow("1 número (0-9)", state.hasDigit)
        RuleRow("1 especial (!@#…)", state.hasSpecial)
    }
}

@Composable
private fun RuleRow(text: String, ok: Boolean) {
    val dot = if (ok) Color(0xFF00F0FF) else Color(0xFFFF6B81)
    val txt = if (ok) Color.White else Color(0xFFB0C4DE)

    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(RoundedCornerShape(99.dp))
                .background(dot)
        )
        Spacer(Modifier.width(8.dp))
        Text(
            text = text,
            color = txt,
            fontSize = 11.sp,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}
