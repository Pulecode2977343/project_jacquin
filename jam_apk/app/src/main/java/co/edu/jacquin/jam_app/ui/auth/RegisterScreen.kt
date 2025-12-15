package co.edu.jacquin.jam_app.ui.auth

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import co.edu.jacquin.jam_app.R
import co.edu.jacquin.jam_app.ui.JamBottomItem
import co.edu.jacquin.jam_app.ui.JamSignature

/**
 * RegisterScreen con HEADER LOGO igual a Login/Home.
 * - Logo hr: logo_hr_jam
 * - Top padding consistente: 124.dp (tu estándar)
 */
@Composable
fun RegisterScreen(
    onBackClick: () -> Unit,
    onRegisterSubmit: (fullName: String, email: String, phone10: String, password: String) -> Unit,
    onLoginClick: () -> Unit,
    onTermsClick: () -> Unit,
    onDataPolicyClick: () -> Unit,
    onHomeClick: () -> Unit = {},
    onAboutClick: () -> Unit = {},
    onCoursesClick: () -> Unit = {},
    onContactClick: () -> Unit = {},
    onSpecialClick: () -> Unit = {},
    isSubmitting: Boolean = false,
    termsAccepted: Boolean? = null,
    onTermsAcceptedChange: ((Boolean) -> Unit)? = null,
    dataPolicyAccepted: Boolean? = null,
    onDataPolicyAcceptedChange: ((Boolean) -> Unit)? = null,
) {
    val bgGradient = Brush.verticalGradient(colors = listOf(Color(0xFF00346A), Color(0xFF000814)))
    val glassOuter = Brush.verticalGradient(colors = listOf(Color(0x26FFFFFF), Color(0x0AFFFFFF)))
    val glassInner = Brush.verticalGradient(colors = listOf(Color(0x18FFFFFF), Color(0x06FFFFFF)))

    val buttonBrushEnabled = Brush.horizontalGradient(colors = listOf(Color(0xFFFFA25A), Color(0xFFFF6F91)))
    val buttonBrushDisabled = Brush.horizontalGradient(
        colors = listOf(Color(0xFFFFA25A).copy(alpha = 0.35f), Color(0xFFFF6F91).copy(alpha = 0.35f))
    )

    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

    var showPass by remember { mutableStateOf(false) }
    var showConfirmPass by remember { mutableStateOf(false) }
    var inlineError by remember { mutableStateOf<String?>(null) }

    var acceptTermsLocal by remember { mutableStateOf(false) }
    var acceptPolicyLocal by remember { mutableStateOf(false) }
    val acceptTerms = termsAccepted ?: acceptTermsLocal
    val acceptPolicy = dataPolicyAccepted ?: acceptPolicyLocal

    fun setAcceptTerms(value: Boolean) { onTermsAcceptedChange?.invoke(value) ?: run { acceptTermsLocal = value } }
    fun setAcceptPolicy(value: Boolean) { onDataPolicyAcceptedChange?.invoke(value) ?: run { acceptPolicyLocal = value } }
    fun clearError() { inlineError = null }

    val passRules = RegisterPasswordRules.evaluate(password)
    val passwordsMatch by remember { derivedStateOf { confirmPassword.isEmpty() || confirmPassword == password } }

    Box(modifier = Modifier.fillMaxSize().background(bgGradient)) {
        Column(modifier = Modifier.fillMaxSize().padding(horizontal = 18.dp)) {

            // HEADER: Back + Logo (igual estructura de Login/Home)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 124.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBackClick) {
                    Icon(Icons.Filled.ArrowBack, contentDescription = "Atrás", tint = Color(0xFFEAF2FF))
                }

                Spacer(modifier = Modifier.width(8.dp))

                androidx.compose.foundation.Image(
                    painter = painterResource(id = R.drawable.logo_hr_jam),
                    contentDescription = "JAM",
                    modifier = Modifier
                        .height(32.dp)
                        .weight(1f)
                )

                Spacer(modifier = Modifier.width(48.dp)) // balance visual del IconButton
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Glass card padre (scroll interno)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f, fill = true)
                    .background(glassOuter, RoundedCornerShape(30.dp))
                    .border(1.dp, Color.White.copy(alpha = 0.14f), RoundedCornerShape(30.dp))
                    .padding(2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(28.dp))
                        .background(glassInner, RoundedCornerShape(28.dp))
                        .border(0.6.dp, Color.White.copy(alpha = 0.22f), RoundedCornerShape(28.dp))
                        .verticalScroll(rememberScrollState())
                        .padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text("Regístrate para acceder a JAM", color = Color(0xFFEAF2FF), fontSize = 14.sp)

                    JamField(
                        value = fullName,
                        onValueChange = { fullName = it; clearError() },
                        label = "Nombre completo",
                        leading = { Icon(Icons.Filled.Person, null, tint = Color.White.copy(alpha = 0.85f)) },
                        keyboardType = KeyboardType.Text
                    )

                    JamField(
                        value = email,
                        onValueChange = { email = it; clearError() },
                        label = "Correo electrónico",
                        leading = { Icon(Icons.Filled.Email, null, tint = Color.White.copy(alpha = 0.85f)) },
                        keyboardType = KeyboardType.Email
                    )

                    JamField(
                        value = phone,
                        onValueChange = { input ->
                            phone = input.filter { it.isDigit() }.take(10)
                            clearError()
                        },
                        label = "Teléfono (10 dígitos)",
                        leading = { Icon(Icons.Filled.Phone, null, tint = Color.White.copy(alpha = 0.85f)) },
                        keyboardType = KeyboardType.Phone
                    )

                    JamPasswordField(
                        value = password,
                        onValueChange = { password = it; clearError() },
                        label = "Contraseña",
                        isVisible = showPass,
                        onToggleVisible = { showPass = !showPass }
                    )

                    JamPasswordField(
                        value = confirmPassword,
                        onValueChange = { confirmPassword = it; clearError() },
                        label = "Confirmar contraseña",
                        isVisible = showConfirmPass,
                        onToggleVisible = { showConfirmPass = !showConfirmPass }
                    )

                    PasswordStrengthCard(passRules = passRules)

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
                            text = "Acepto los términos y condiciones",
                            onLinkClick = onTermsClick
                        )
                        LegalRowMiniCheckbox(
                            checked = acceptPolicy,
                            onCheckedChange = { setAcceptPolicy(it); clearError() },
                            text = "Acepto el tratamiento de datos personales",
                            onLinkClick = onDataPolicyClick
                        )
                    }

                    if (inlineError != null) {
                        Text(inlineError ?: "", color = Color(0xFFFFB4B4), fontSize = 12.sp)
                    }

                    Button(
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
                                return@Button
                            }
                            onRegisterSubmit(fullName.trim(), email.trim(), phone.trim(), password)
                        },
                        enabled = !isSubmitting,
                        modifier = Modifier.fillMaxWidth().height(54.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                        shape = RoundedCornerShape(999.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .clip(RoundedCornerShape(999.dp))
                                .background(if (!isSubmitting) buttonBrushEnabled else buttonBrushDisabled)
                                .border(1.dp, Color.White.copy(alpha = 0.20f), RoundedCornerShape(999.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = if (isSubmitting) "Creando..." else "Crear cuenta",
                                color = Color.White,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
                        Text("¿Ya tienes cuenta? ", color = Color.White.copy(alpha = 0.78f), fontSize = 12.sp)
                        Text(
                            "Inicia sesión aquí",
                            color = Color(0xFFBFE7FF),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.clickable { onLoginClick() }
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                }
            }

            JamSignature(
                showNavIcons = true,
                selectedItem = JamBottomItem.Home,
                onHomeClick = onHomeClick,
                onAboutClick = onAboutClick,
                onCoursesClick = onCoursesClick,
                onContactClick = onContactClick,
                onSpecialClick = onSpecialClick,
                modifier = Modifier.fillMaxWidth().padding(top = 10.dp, bottom = 10.dp)
            )
        }
    }
}

@Composable
private fun JamField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    leading: @Composable () -> Unit,
    keyboardType: KeyboardType,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
        label = { Text(label, color = Color.White.copy(alpha = 0.70f)) },
        leadingIcon = leading,
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType, imeAction = ImeAction.Next),
        colors = OutlinedTextFieldDefaults.colors(
            unfocusedContainerColor = Color.White.copy(alpha = 0.06f),
            focusedContainerColor = Color.White.copy(alpha = 0.08f),
            unfocusedBorderColor = Color.White.copy(alpha = 0.10f),
            focusedBorderColor = Color(0xFF79D9FF).copy(alpha = 0.65f),
            cursorColor = Color.White,
            focusedTextColor = Color.White,
            unfocusedTextColor = Color.White.copy(alpha = 0.92f)
        ),
        shape = RoundedCornerShape(18.dp)
    )
}

@Composable
private fun JamPasswordField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    isVisible: Boolean,
    onToggleVisible: () -> Unit,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
        label = { Text(label, color = Color.White.copy(alpha = 0.70f)) },
        trailingIcon = {
            IconButton(onClick = onToggleVisible) {
                Icon(
                    imageVector = if (isVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                    contentDescription = "Mostrar/Ocultar",
                    tint = Color.White.copy(alpha = 0.85f)
                )
            }
        },
        visualTransformation = if (isVisible) VisualTransformation.None else PasswordVisualTransformation(),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Next),
        colors = OutlinedTextFieldDefaults.colors(
            unfocusedContainerColor = Color.White.copy(alpha = 0.06f),
            focusedContainerColor = Color.White.copy(alpha = 0.08f),
            unfocusedBorderColor = Color.White.copy(alpha = 0.10f),
            focusedBorderColor = Color(0xFF79D9FF).copy(alpha = 0.65f),
            cursorColor = Color.White,
            focusedTextColor = Color.White,
            unfocusedTextColor = Color.White.copy(alpha = 0.92f)
        ),
        shape = RoundedCornerShape(18.dp)
    )
}

@Composable
private fun PasswordStrengthCard(passRules: RegisterPasswordRules.State) {
    val ok = passRules.allOk
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White.copy(alpha = 0.06f))
            .border(1.dp, Color.White.copy(alpha = 0.10f), RoundedCornerShape(20.dp))
            .padding(14.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
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
        Spacer(modifier = Modifier.width(10.dp))
        Text(text = text, color = Color.White.copy(alpha = if (ok) 0.95f else 0.70f), fontSize = 12.sp)
    }
}

@Composable
private fun LegalRowMiniCheckbox(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    text: String,
    onLinkClick: () -> Unit,
) {
    Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        MiniCheckbox(checked = checked, onToggle = { onCheckedChange(!checked) })
        Spacer(modifier = Modifier.width(10.dp))
        Text(text = text, color = Color.White.copy(alpha = 0.85f), fontSize = 12.sp, modifier = Modifier.weight(1f))
        Text(
            text = "Ver",
            color = Color(0xFFBFE7FF),
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier
                .clip(RoundedCornerShape(999.dp))
                .clickable(interactionSource = remember { MutableInteractionSource() }, indication = null) { onLinkClick() }
                .padding(horizontal = 10.dp, vertical = 6.dp)
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
