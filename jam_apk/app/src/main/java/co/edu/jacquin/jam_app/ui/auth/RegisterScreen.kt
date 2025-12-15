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
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.ClickableText
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material.icons.materialIcon
import androidx.compose.material.icons.materialPath
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import co.edu.jacquin.jam_app.ui.JamBottomItem
import co.edu.jacquin.jam_app.ui.JamHorizontalLogo
import co.edu.jacquin.jam_app.ui.JamSignature
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Register con la MISMA UI que Login + mejoras:
 * - Bloque de recomendaciones con menos espacio entre líneas
 * - Flecha/indicador de scroll: se oculta al hacer scroll o al tocarla (baja al final)
 */
@Composable
fun RegisterScreen(
    onBackClick: () -> Unit,
    onRegisterSubmit: (fullName: String, email: String, phone10: String, password: String) -> Unit,
    onLoginClick: () -> Unit,
    onTermsClick: () -> Unit,
    onDataPolicyClick: () -> Unit,

    // Signature nav
    signatureSelectedItem: JamBottomItem = JamBottomItem.Home,
    onHomeClick: () -> Unit = {},
    onAboutClick: () -> Unit = {},
    onCoursesClick: () -> Unit = {},
    onContactClick: () -> Unit = {},
    onSpecialClick: () -> Unit = {},

    isSubmitting: Boolean = false,
    serverError: String? = null,
    termsAccepted: Boolean? = null,
    onTermsAcceptedChange: ((Boolean) -> Unit)? = null,
    dataPolicyAccepted: Boolean? = null,
    onDataPolicyAcceptedChange: ((Boolean) -> Unit)? = null,
) {
    val backgroundGradient = Brush.verticalGradient(colors = listOf(Color(0xFF00346A), Color(0xFF000814)))
    val innerGlassGradient = Brush.verticalGradient(listOf(Color(0x1FFFFFFF), Color(0x05FFFFFF)))
    val outerGlassGradient = Brush.verticalGradient(listOf(Color(0x26FFFFFF), Color(0x0AFFFFFF)))

    var fullName by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var phone by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var confirmPassword by rememberSaveable { mutableStateOf("") }

    var passwordVisible by rememberSaveable { mutableStateOf(false) }
    var confirmVisible by rememberSaveable { mutableStateOf(false) }

    var inlineError by rememberSaveable { mutableStateOf<String?>(null) }

    var acceptTermsLocal by rememberSaveable { mutableStateOf(false) }
    var acceptPolicyLocal by rememberSaveable { mutableStateOf(false) }
    val acceptTerms = termsAccepted ?: acceptTermsLocal
    val acceptPolicy = dataPolicyAccepted ?: acceptPolicyLocal

    fun setAcceptTerms(value: Boolean) { onTermsAcceptedChange?.invoke(value) ?: run { acceptTermsLocal = value } }
    fun setAcceptPolicy(value: Boolean) { onDataPolicyAcceptedChange?.invoke(value) ?: run { acceptPolicyLocal = value } }
    fun clearError() { inlineError = null }

    val passRules = RegisterPasswordRules.evaluate(password)
    val passwordsMatch by remember { derivedStateOf { confirmPassword.isEmpty() || confirmPassword == password } }
    val canSubmit by remember {
        derivedStateOf {
            !isSubmitting &&
                fullName.trim().length >= 3 &&
                email.contains("@") && email.contains(".") &&
                phone.length == 10 &&
                passRules.allOk &&
                confirmPassword.isNotBlank() &&
                passwordsMatch &&
                acceptTerms && acceptPolicy
        }
    }

    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        delay(50)
        visible = true
    }

    val scope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundGradient)
    ) {
        // Header fijo: back + logo (igual a Login)
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
                    .padding(horizontal = 24.dp)
                    .padding(bottom = 100.dp) // (Si se cruza con Signature, aumenta o migra a Scaffold)
            ) {
                Spacer(modifier = Modifier.height(110.dp))

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
                        val formScroll = rememberScrollState()
                        var hideFormScrollHint by rememberSaveable { mutableStateOf(false) }
                        LaunchedEffect(formScroll.value) {
                            if (formScroll.value > 10) hideFormScrollHint = true
                        }
                        val canScrollMore by remember {
                            derivedStateOf { formScroll.maxValue > 0 && formScroll.value < (formScroll.maxValue - 10) }
                        }

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
                                    .verticalScroll(formScroll),
                                verticalArrangement = Arrangement.spacedBy(14.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "Crear cuenta",
                                    style = MaterialTheme.typography.headlineSmall,
                                    color = Color.White
                                )

                                JamUnderlinedTextField(
                                    value = fullName,
                                    onValueChange = { fullName = it; clearError() },
                                    label = "Nombre completo",
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text, imeAction = ImeAction.Next),
                                    leadingIcon = { Icon(Icons.Filled.Person, null, tint = Color(0xFFB0C4DE)) }
                                )

                                JamUnderlinedTextField(
                                    value = email,
                                    onValueChange = { email = it; clearError() },
                                    label = "Correo electrónico",
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                                    leadingIcon = { Icon(Icons.Outlined.Email, null, tint = Color(0xFFB0C4DE)) }
                                )

                                JamUnderlinedTextField(
                                    value = phone,
                                    onValueChange = { input ->
                                        phone = input.filter { it.isDigit() }.take(10)
                                        clearError()
                                    },
                                    label = "Teléfono (10 dígitos)",
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Next),
                                    leadingIcon = { Icon(Icons.Filled.Phone, null, tint = Color(0xFFB0C4DE)) }
                                )

                                JamUnderlinedPasswordField(
                                    value = password,
                                    onValueChange = { password = it; clearError() },
                                    label = "Contraseña",
                                    visible = passwordVisible,
                                    onToggleVisibility = { passwordVisible = !passwordVisible }
                                )

                                PasswordStrengthCard(passRules = passRules)

                                JamUnderlinedPasswordField(
                                    value = confirmPassword,
                                    onValueChange = { confirmPassword = it; clearError() },
                                    label = "Confirmar contraseña",
                                    visible = confirmVisible,
                                    onToggleVisibility = { confirmVisible = !confirmVisible }
                                )

                                AnimatedVisibility(
                                    visible = !passwordsMatch,
                                    enter = fadeIn(tween(150)),
                                    exit = fadeOut(tween(150))
                                ) {
                                    Text("Las contraseñas no coinciden.", color = Color(0xFFFFB4B4), fontSize = 12.sp)
                                }

                                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                    LegalRowMiniCheckbox(
                                        checked = acceptTerms,
                                        onCheckedChange = { setAcceptTerms(it); clearError() },
                                        linkText = "términos y condiciones",
                                        onLinkClick = onTermsClick
                                    )
                                    LegalRowMiniCheckbox(
                                        checked = acceptPolicy,
                                        onCheckedChange = { setAcceptPolicy(it); clearError() },
                                        linkText = "tratamiento de datos personales",
                                        onLinkClick = onDataPolicyClick
                                    )
                                }

                                if (inlineError != null || serverError != null) {
                                    Text(
                                        text = inlineError ?: serverError.orEmpty(),
                                        color = Color(0xFFFF6B81),
                                        style = MaterialTheme.typography.bodySmall,
                                        textAlign = TextAlign.Center,
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                }

                                JamPrimaryGlassButton(
                                    text = if (isSubmitting) "Creando..." else "Crear cuenta",
                                    enabled = !isSubmitting,
                                    showLoader = isSubmitting,
                                    onClick = {
                                        val validation = validateRegister(
                                            fullName = fullName,
                                            email = email,
                                            phone10 = phone,
                                            password = password,
                                            confirmPassword = confirmPassword,
                                            acceptTerms = acceptTerms,
                                            acceptPolicy = acceptPolicy
                                        )
                                        if (validation != null) {
                                            inlineError = validation
                                            return@JamPrimaryGlassButton
                                        }
                                        onRegisterSubmit(fullName.trim(), email.trim(), phone.trim(), password)
                                    }
                                )

                                Spacer(modifier = Modifier.height(4.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("¿Ya tienes cuenta? ", color = Color.White.copy(alpha = 0.78f), fontSize = 12.sp)
                                    Text(
                                        "Inicia sesión aquí",
                                        color = Color(0xFFCCF9FF),
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(999.dp))
                                            .clickable { onLoginClick() }
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
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

                                Spacer(modifier = Modifier.height(8.dp))
                            }

                            // 👇 Flecha + indicación de scroll (se oculta al hacer scroll o al tocarla)
                            androidx.compose.animation.AnimatedVisibility(
                                visible = !hideFormScrollHint && canScrollMore,
                                enter = fadeIn(tween(180)),
                                exit = fadeOut(tween(180)),
                                modifier = Modifier
                                    .align(Alignment.BottomCenter)
                                    .padding(bottom = 6.dp)
                            ) {
                                ScrollHintDown(
                                    text = "Desliza para ver más",
                                    onClick = {
                                        hideFormScrollHint = true
                                        scope.launch { formScroll.animateScrollTo(formScroll.maxValue) }
                                    }
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
            selectedItem = signatureSelectedItem,
            onHomeClick = onHomeClick,
            onAboutClick = onAboutClick,
            onCoursesClick = onCoursesClick,
            onContactClick = onContactClick,
            onSpecialClick = onSpecialClick
        )
    }
}

/* ---------- Scroll hint pill ---------- */

@Composable
private fun ScrollHintDown(
    text: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(999.dp))
            .background(Color.Black.copy(alpha = 0.28f))
            .border(1.dp, Color.White.copy(alpha = 0.22f), RoundedCornerShape(999.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onClick() }
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Icon(
            imageVector = Icons.Filled.KeyboardArrowDown,
            contentDescription = null,
            tint = Color(0xFFCCF9FF)
        )
        Text(text, color = Color.White.copy(alpha = 0.92f), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
    }
}

/* ---------- Underlined fields (mismo estilo Login) ---------- */

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
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Next),
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

/* ---------- Password rules card (menos espacio entre líneas) ---------- */

@Composable
private fun PasswordStrengthCard(passRules: RegisterPasswordRules.State) {
    val ok = passRules.allOk
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White.copy(alpha = 0.06f))
            .border(1.dp, Color.White.copy(alpha = 0.10f), RoundedCornerShape(20.dp))
            .padding(horizontal = 14.dp, vertical = 12.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(5.dp)) { // 👈 antes 8.dp
            Text(
                text = if (ok) "Contraseña fuerte ✅" else "Recomendaciones de contraseña",
                color = if (ok) Color(0xFFA7FFD3) else Color.White,
                fontWeight = FontWeight.SemiBold,
                fontSize = 13.sp
            )
            RuleLine("Mínimo 6 caracteres", passRules.minLen)
            RuleLine("Una mayúscula", passRules.upper)
            RuleLine("Una minúscula", passRules.lower)
            RuleLine("Un número", passRules.digit)
            RuleLine("Un caracter especial", passRules.special)
        }
    }
}

@Composable
private fun RuleLine(text: String, ok: Boolean) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(RoundedCornerShape(999.dp))
                .background(if (ok) Color(0xFFA7FFD3) else Color.White.copy(alpha = 0.28f))
        )
        Spacer(modifier = Modifier.width(8.dp)) // 👈 antes 10.dp
        Text(
            text,
            color = Color.White.copy(alpha = if (ok) 0.95f else 0.70f),
            fontSize = 12.sp
        )
    }
}

/* ---------- Legal mini checkbox ---------- */

@Composable
private fun LegalRowMiniCheckbox(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    prefixText: String = "Acepto ",
    linkText: String,
    suffixText: String = "",
    onLinkClick: () -> Unit,
) {
    Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        MiniCheckbox(checked = checked, onToggle = { onCheckedChange(!checked) })
        Spacer(modifier = Modifier.width(10.dp))

        val annotated = remember(prefixText, linkText, suffixText) {
            buildAnnotatedString {
                append(prefixText)
                pushStringAnnotation(tag = "LINK", annotation = "open")
                withStyle(
                    SpanStyle(
                        color = Color(0xFFBFE7FF),
                        fontWeight = FontWeight.SemiBold
                    )
                ) { append(linkText) }
                pop()
                append(suffixText)
            }
        }

        ClickableText(
            modifier = Modifier.weight(1f),
            text = annotated,
            style = LocalTextStyle.current.copy(
                color = Color.White.copy(alpha = 0.85f),
                fontSize = 12.sp
            ),
            onClick = { offset ->
                annotated.getStringAnnotations(tag = "LINK", start = offset, end = offset)
                    .firstOrNull()
                    ?.let { onLinkClick() }
            }
        )
    }
}

@Composable
private fun MiniCheckbox(checked: Boolean, onToggle: () -> Unit) {
    Box(
        modifier = Modifier
            .size(18.dp)
            .clip(RoundedCornerShape(6.dp))
            .background(Color.White.copy(alpha = if (checked) 0.18f else 0.08f))
            .border(1.dp, Color.White.copy(alpha = if (checked) 0.40f else 0.20f), RoundedCornerShape(6.dp))
            .clickable(interactionSource = remember { MutableInteractionSource() }, indication = null) { onToggle() },
        contentAlignment = Alignment.Center
    ) {
        if (checked) {
            Text("✓", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp, textAlign = TextAlign.Center)
        }
    }
}

/* ---------- Validation ---------- */

private fun validateRegister(
    fullName: String,
    email: String,
    phone10: String,
    password: String,
    confirmPassword: String,
    acceptTerms: Boolean,
    acceptPolicy: Boolean,
): String? {
    if (fullName.trim().length < 3) return "Ingresa tu nombre completo."
    if (!email.contains("@") || !email.contains(".")) return "Ingresa un correo válido."
    if (phone10.length != 10) return "El teléfono debe tener 10 dígitos."
    val rules = RegisterPasswordRules.evaluate(password)
    if (!rules.allOk) return "La contraseña no cumple los requisitos."
    if (confirmPassword != password) return "Las contraseñas no coinciden."
    if (!acceptTerms) return "Debes aceptar los términos y condiciones."
    if (!acceptPolicy) return "Debes aceptar el tratamiento de datos."
    return null
}

private object RegisterPasswordRules {
    data class State(
        val minLen: Boolean,
        val upper: Boolean,
        val lower: Boolean,
        val digit: Boolean,
        val special: Boolean,
    ) {
        val allOk: Boolean get() = minLen && upper && lower && digit && special
    }

    fun evaluate(password: String): State {
        val minLen = password.length >= 6
        val upper = password.any { it.isUpperCase() }
        val lower = password.any { it.isLowerCase() }
        val digit = password.any { it.isDigit() }
        val special = password.any { !it.isLetterOrDigit() }
        return State(minLen, upper, lower, digit, special)
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
