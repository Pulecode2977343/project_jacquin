package co.edu.jacquin.jam_app.ui.auth

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.PersonOutline
import androidx.compose.material.icons.outlined.PhoneAndroid
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material.icons.materialIcon
import androidx.compose.material.icons.materialPath
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.Path
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import co.edu.jacquin.jam_app.ui.JamHorizontalLogo
import co.edu.jacquin.jam_app.ui.JamSignature

@Composable
fun RegisterScreen(
    onBackClick: () -> Unit = {},
    onRegisterSubmit: (fullName: String, email: String, phone: String, password: String) -> Unit = { _, _, _, _ -> },
    onLoginClick: () -> Unit = {},
    onTermsClick: () -> Unit = {},
    onDataPolicyClick: () -> Unit = {},
    isSubmitting: Boolean = false
) {
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }

    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var confirmVisible by remember { mutableStateOf(false) }

    var acceptTerms by remember { mutableStateOf(false) }
    var acceptDataPolicy by remember { mutableStateOf(false) }

    var showError by remember { mutableStateOf(false) }
    var errorText by remember { mutableStateOf<String?>(null) }

    // ✅ NUEVO: si el usuario ya intentó registrarse, mantenemos avisos importantes hasta corregir
    var attemptedSubmit by remember { mutableStateOf(false) }

    val backgroundGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF00346A), Color(0xFF000814))
    )

    val innerGlassGradient = Brush.verticalGradient(
        colors = listOf(Color(0x1FFFFFFF), Color(0x05FFFFFF))
    )
    val outerGlassGradient = Brush.verticalGradient(
        colors = listOf(Color(0x26FFFFFF), Color(0x0AFFFFFF))
    )

    val pwdState by remember(password) { derivedStateOf { PasswordRules.evaluate(password) } }
    val emailValid by remember(email) { derivedStateOf { isEmailValid(email.trim()) } }
    val phoneValid by remember(phone) { derivedStateOf { phone.trim().length >= 7 } }
    val nameValid by remember(fullName) { derivedStateOf { fullName.trim().length >= 3 } }

    val mismatchNow by remember(password, confirmPassword) {
        derivedStateOf { confirmPassword.isNotBlank() && password != confirmPassword }
    }

    // ✅ Aviso persistente (tras intentar enviar)
    val shouldShowMismatchWarning by remember(attemptedSubmit, password, confirmPassword) {
        derivedStateOf {
            mismatchNow ||
                    (attemptedSubmit && password.isNotBlank() && confirmPassword.isBlank()) ||
                    (attemptedSubmit && password.isNotBlank() && password != confirmPassword)
        }
    }

    val canSubmit by remember(
        nameValid, emailValid, phoneValid,
        pwdState.isStrong, acceptTerms, acceptDataPolicy,
        isSubmitting, mismatchNow, confirmPassword
    ) {
        derivedStateOf {
            !isSubmitting &&
                    nameValid &&
                    emailValid &&
                    phoneValid &&
                    pwdState.isStrong &&
                    confirmPassword.isNotBlank() &&
                    !mismatchNow &&
                    acceptTerms &&
                    acceptDataPolicy
        }
    }

    fun clearInlineError() {
        showError = false
        errorText = null
    }

    val visible by remember { mutableStateOf(true) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundGradient)
    ) {
        AnimatedVisibility(
            visible = visible,
            enter = fadeIn(tween(350)),
            exit = fadeOut(tween(200))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp)
            ) {
                Spacer(modifier = Modifier.height(24.dp))

                // Header consistente (Back + logo)
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

                Spacer(modifier = Modifier.height(18.dp))

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
                                verticalArrangement = Arrangement.spacedBy(14.dp), // ✅ un poco más compacto
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "Crear cuenta",
                                    style = MaterialTheme.typography.headlineSmall,
                                    color = Color.White
                                )

                                Text(
                                    text = "Regístrate para acceder a tu panel JAM.",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color(0xFFB0C4DE),
                                    textAlign = TextAlign.Center
                                )

                                JamUnderlinedTextField(
                                    value = fullName,
                                    onValueChange = {
                                        fullName = it
                                        clearInlineError()
                                    },
                                    label = "Nombre completo",
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                                    leadingIcon = {
                                        Icon(
                                            imageVector = Icons.Outlined.PersonOutline,
                                            contentDescription = "Nombre",
                                            tint = Color(0xFFB0C4DE)
                                        )
                                    }
                                )

                                JamUnderlinedTextField(
                                    value = email,
                                    onValueChange = {
                                        email = it
                                        clearInlineError()
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

                                JamUnderlinedTextField(
                                    value = phone,
                                    onValueChange = {
                                        phone = it.filter { ch -> ch.isDigit() || ch == '+' || ch == ' ' }
                                        clearInlineError()
                                    },
                                    label = "Teléfono",
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                    leadingIcon = {
                                        Icon(
                                            imageVector = Icons.Outlined.PhoneAndroid,
                                            contentDescription = "Teléfono",
                                            tint = Color(0xFFB0C4DE)
                                        )
                                    }
                                )

                                JamUnderlinedPasswordField(
                                    value = password,
                                    onValueChange = {
                                        password = it
                                        clearInlineError()
                                    },
                                    label = "Contraseña",
                                    visible = passwordVisible,
                                    onToggleVisibility = { passwordVisible = !passwordVisible }
                                )

                                // ✅ más compacto
                                PasswordStrengthCardCompact(state = pwdState)

                                JamUnderlinedPasswordField(
                                    value = confirmPassword,
                                    onValueChange = {
                                        confirmPassword = it
                                        clearInlineError()
                                    },
                                    label = "Confirmar contraseña",
                                    visible = confirmVisible,
                                    onToggleVisibility = { confirmVisible = !confirmVisible }
                                )

                                // ✅ Aviso persistente (tras intento)
                                if (shouldShowMismatchWarning) {
                                    val msg = when {
                                        confirmPassword.isBlank() -> "Confirma tu contraseña."
                                        else -> "Las contraseñas no coinciden."
                                    }
                                    Text(
                                        text = msg,
                                        color = Color(0xFFFF6B81),
                                        style = MaterialTheme.typography.bodySmall,
                                        textAlign = TextAlign.Center,
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                }

                                // ✅ Checkboxes: menos separación vertical + lineHeight compacto
                                LegalCheckboxRowCompact(
                                    checked = acceptTerms,
                                    onCheckedChange = {
                                        acceptTerms = it
                                        clearInlineError()
                                    },
                                    labelPrefix = "Acepto ",
                                    linkText = "términos y condiciones",
                                    onLinkClick = onTermsClick
                                )

                                LegalCheckboxRowCompact(
                                    checked = acceptDataPolicy,
                                    onCheckedChange = {
                                        acceptDataPolicy = it
                                        clearInlineError()
                                    },
                                    labelPrefix = "Acepto ",
                                    linkText = "tratamiento de datos personales",
                                    onLinkClick = onDataPolicyClick
                                )

                                if (showError && !errorText.isNullOrBlank()) {
                                    Text(
                                        text = errorText!!,
                                        color = Color(0xFFFF6B81),
                                        style = MaterialTheme.typography.bodySmall,
                                        textAlign = TextAlign.Center,
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                }

                                JamPrimaryGlassButton(
                                    text = if (isSubmitting) "Creando cuenta." else "Crear cuenta",
                                    enabled = canSubmit,
                                    onClick = {
                                        attemptedSubmit = true

                                        val err = validateRegister(
                                            fullName = fullName,
                                            email = email,
                                            phone = phone,
                                            pwdState = pwdState,
                                            password = password,
                                            confirmPassword = confirmPassword,
                                            acceptTerms = acceptTerms,
                                            acceptDataPolicy = acceptDataPolicy
                                        )

                                        if (err != null) {
                                            showError = true
                                            errorText = err
                                        } else {
                                            showError = false
                                            errorText = null
                                            onRegisterSubmit(
                                                fullName.trim(),
                                                email.trim(),
                                                phone.trim(),
                                                password
                                            )
                                        }
                                    },
                                    showLoader = isSubmitting
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
                                    Spacer(modifier = Modifier.width(6.dp))
                                    TextButton(
                                        onClick = onLoginClick,
                                        enabled = !isSubmitting,
                                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = "Inicia sesión aquí",
                                            color = Color(0xFFCCF9FF),
                                            fontWeight = FontWeight.SemiBold,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    }
                                }

                                Text(
                                    text = "Tu información se usará únicamente para fines académicos y de comunicación institucional.",
                                    color = Color(0xFFBCC6DC),
                                    style = MaterialTheme.typography.bodySmall,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.alpha(0.9f)
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

/* =========================
   Password card (COMPACT)
   ========================= */

@Composable
private fun PasswordStrengthCardCompact(state: PasswordRules.State) {
    val cardShape = RoundedCornerShape(18.dp)
    val border = Color.White.copy(alpha = 0.16f)
    val bg = Brush.verticalGradient(listOf(Color.White.copy(alpha = 0.10f), Color.White.copy(alpha = 0.05f)))

    val progress by animateFloatAsState(
        targetValue = state.score / 5f,
        animationSpec = tween(220),
        label = "pwdStrength"
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(cardShape)
            .background(bg, cardShape)
            .border(1.dp, border, cardShape)
            .padding(horizontal = 14.dp, vertical = 12.dp), // ✅ menos padding vertical
        verticalArrangement = Arrangement.spacedBy(6.dp)  // ✅ menos espacio entre líneas
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

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(5.dp) // ✅ un poco más fina
                .clip(RoundedCornerShape(99.dp))
                .background(Color.White.copy(alpha = 0.10f))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(progress)
                    .fillMaxSize()
                    .background(state.labelColor.copy(alpha = 0.70f))
            )
        }

        PasswordRuleRowCompact("Mínimo 6 caracteres", state.hasMinLen)
        PasswordRuleRowCompact("1 mayúscula (A-Z)", state.hasUpper)
        PasswordRuleRowCompact("1 minúscula (a-z)", state.hasLower)
        PasswordRuleRowCompact("1 número (0-9)", state.hasDigit)
        PasswordRuleRowCompact("1 especial (!@#…)", state.hasSpecial)
    }
}

@Composable
private fun PasswordRuleRowCompact(text: String, ok: Boolean) {
    val on = Color(0xFF00F0FF)
    val off = Color(0xFFFF6B81)
    val neutral = Color(0xFFB0C4DE)
    val dotColor = if (ok) on else off
    val txtColor = if (ok) Color.White else neutral

    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(8.dp) // ✅ más pequeño
                .clip(RoundedCornerShape(99.dp))
                .background(dotColor.copy(alpha = 0.95f))
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = text,
            color = txtColor,
            fontSize = 11.sp, // ✅ más compacto
            lineHeight = 14.sp,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

/* =========================
   Legal rows (COMPACT)
   ========================= */

@Composable
private fun LegalCheckboxRowCompact(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    labelPrefix: String,
    linkText: String,
    onLinkClick: () -> Unit
) {
    val interaction = remember { MutableInteractionSource() }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 0.dp), // ✅ sin extra
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
        Spacer(modifier = Modifier.width(4.dp)) // ✅ menos espacio

        Row(
            modifier = Modifier
                .weight(1f)
                .clickable(interactionSource = interaction, indication = null) { onCheckedChange(!checked) },
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = labelPrefix,
                color = Color(0xFFB0C4DE),
                fontSize = 12.sp,
                lineHeight = 14.sp
            )
            Text(
                text = linkText,
                color = Color(0xFFCCF9FF),
                fontSize = 12.sp,
                lineHeight = 14.sp,
                fontWeight = FontWeight.SemiBold,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.clickable(
                    interactionSource = interaction,
                    indication = null
                ) { onLinkClick() }
            )
        }
    }
}

/* =========================
   Validation
   ========================= */

private fun validateRegister(
    fullName: String,
    email: String,
    phone: String,
    pwdState: PasswordRules.State,
    password: String,
    confirmPassword: String,
    acceptTerms: Boolean,
    acceptDataPolicy: Boolean
): String? {
    if (fullName.trim().length < 3) return "Escribe tu nombre completo."
    if (!isEmailValid(email.trim())) return "Correo inválido."
    if (phone.trim().length < 7) return "Teléfono inválido."
    if (!pwdState.isStrong) return "Tu contraseña aún no cumple los requisitos."
    if (confirmPassword.isBlank()) return "Confirma tu contraseña."
    if (password != confirmPassword) return "Las contraseñas no coinciden."
    if (!acceptTerms) return "Debes aceptar los términos y condiciones."
    if (!acceptDataPolicy) return "Debes aceptar el tratamiento de datos personales."
    return null
}

private fun isEmailValid(email: String): Boolean {
    val e = email.trim()
    if (e.isEmpty()) return false
    return e.contains("@") && e.contains(".") && e.length >= 6
}

/* =========================
   Underline fields + Button
   ========================= */

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
                // ✅ Ícono FIX: no depende de material-icons-extended
                Icon(
                    imageVector = JamLockIcon,
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

/* =========================
   Password rules engine
   ========================= */

private object PasswordRules {
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
        val hasMinLen = p.length >= 6
        val hasUpper = p.any { it.isUpperCase() }
        val hasLower = p.any { it.isLowerCase() }
        val hasDigit = p.any { it.isDigit() }
        val hasSpecial = p.any { !it.isLetterOrDigit() }
        return State(hasMinLen, hasUpper, hasLower, hasDigit, hasSpecial)
    }
}

/* =========================
   ✅ Lock icon (in-code)
   No depende de material-icons-extended
   ========================= */

private val JamLockIcon: ImageVector by lazy {
    materialIcon(name = "JamLock") {
        materialPath {
            // Shackle
            moveTo(8f, 10f)
            lineTo(8f, 8.2f)
            curveTo(8f, 6.2f, 9.6f, 4.6f, 11.6f, 4.6f)
            curveTo(13.6f, 4.6f, 15.2f, 6.2f, 15.2f, 8.2f)
            lineTo(15.2f, 10f)

            // Body
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

            // Keyhole
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
