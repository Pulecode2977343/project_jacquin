package co.edu.jacquin.jam_app.ui.contact
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
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.ui.unit.Dp
import androidx.compose.foundation.layout.PaddingValues
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
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.PersonOutline
import androidx.compose.material.icons.outlined.PhoneAndroid
import androidx.compose.material.icons.outlined.Send
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import co.edu.jacquin.jam_app.ui.JamBottomItem
import co.edu.jacquin.jam_app.ui.JamHorizontalLogo
import co.edu.jacquin.jam_app.ui.JamSignature
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private const val SEND_ICON_ROTATION_DEG = -35f // ↗ aprox 1:30

@Composable
fun ContactScreen(
    viewModel: ContactViewModel,
    prefilledEmail: String? = null,
    onBackClick: () -> Unit = {},
    onTermsClick: () -> Unit = {},
    onDataPolicyClick: () -> Unit = {},
    onSentSuccess: () -> Unit = {},
    // Navegación inferior (JamSignature) - igual que HomeScreen
    onHomeClick: () -> Unit = {},
    onAboutClick: () -> Unit = {},
    onCoursesClick: () -> Unit = {},
    onContactClick: () -> Unit = {},
    onSpecialClick: () -> Unit = {},

    // Consentimientos externos (para auto-marcar al aceptar en overlay)
    termsAccepted: Boolean? = null,
    onTermsAcceptedChange: ((Boolean) -> Unit)? = null,
    dataPolicyAccepted: Boolean? = null,
    onDataPolicyAcceptedChange: ((Boolean) -> Unit)? = null,

    headerTopPadding: Dp = 54.dp,
    contentTopSpacer: Dp = 124.dp,
) {
    val state by viewModel.uiState.collectAsState()

    var fullName by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable(prefilledEmail) { mutableStateOf(prefilledEmail ?: "") }
    var countryCode by rememberSaveable { mutableStateOf("+57") }
    var phone by rememberSaveable { mutableStateOf("") } // 10 dígitos
    var message by rememberSaveable { mutableStateOf("") }

    var acceptTermsLocal by rememberSaveable { mutableStateOf(false) }
    var acceptDataPolicyLocal by rememberSaveable { mutableStateOf(false) }

    val acceptTerms = termsAccepted ?: acceptTermsLocal
    val acceptDataPolicy = dataPolicyAccepted ?: acceptDataPolicyLocal

    fun setAcceptTerms(value: Boolean) {
        onTermsAcceptedChange?.invoke(value) ?: run { acceptTermsLocal = value }
    }

    fun setAcceptDataPolicy(value: Boolean) {
        onDataPolicyAcceptedChange?.invoke(value) ?: run { acceptDataPolicyLocal = value }
    }

    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { delay(50); visible = true }

    // Si llegó success: limpiamos y luego navegamos según quien invocó (MainActivity decide)
    LaunchedEffect(state.successMessage) {
        if (!state.successMessage.isNullOrBlank()) {
            fullName = ""
            phone = ""
            message = ""
            delay(650)
            onSentSuccess()
        }
    }

    val backgroundGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF00346A), Color(0xFF000814))
    )
    val innerGlassGradient = Brush.verticalGradient(listOf(Color(0x1FFFFFFF), Color(0x05FFFFFF)))
    val outerGlassGradient = Brush.verticalGradient(listOf(Color(0x26FFFFFF), Color(0x0AFFFFFF)))

    BoxWithConstraints(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundGradient)
    ) {
        val cardMaxHeight = (maxHeight - contentTopSpacer - 98.dp).coerceAtLeast(420.dp)

        // Header fijo
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 14.dp, end = 18.dp, top = headerTopPadding),
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
            ) {
                Spacer(modifier = Modifier.height(contentTopSpacer))

                // ✅ Card fija + scroll interno
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = cardMaxHeight),
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
                            val scrollState = rememberScrollState()
                            val scope = rememberCoroutineScope()
                            var hideScrollHint by remember { mutableStateOf(false) }

                            LaunchedEffect(scrollState.value) {
                                if (scrollState.value > 10) hideScrollHint = true
                            }

                            val canScrollMore by remember {
                                derivedStateOf {
                                    scrollState.maxValue > 0 && scrollState.value < (scrollState.maxValue - 10)
                                }
                            }


                            Box(modifier = Modifier.fillMaxWidth()) {

                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .verticalScroll(scrollState)
                                    .padding(bottom = 18.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "Contáctanos",
                                    style = MaterialTheme.typography.headlineSmall,
                                    color = Color.White
                                )

                                Text(
                                    text = "Envíanos un mensaje y nuestro equipo te responderá lo antes posible.",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Color(0xFFB0C4DE),
                                    textAlign = TextAlign.Center
                                )

                                JamUnderlinedTextField(
                                    value = fullName,
                                    onValueChange = {
                                        fullName = it
                                        if (state.error != null || state.successMessage != null) viewModel.clearMessages()
                                    },
                                    label = "Nombre completo",
                                    modifier = Modifier.fillMaxWidth(),
                                    leadingIcon = {
                                        Icon(Icons.Outlined.PersonOutline, null, tint = Color(0xFFB0C4DE))
                                    }
                                )

                                JamUnderlinedTextField(
                                    value = email,
                                    onValueChange = {
                                        email = it
                                        if (state.error != null || state.successMessage != null) viewModel.clearMessages()
                                    },
                                    label = "Email",
                                    modifier = Modifier.fillMaxWidth(),
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                                    leadingIcon = {
                                        Icon(Icons.Outlined.Email, null, tint = Color(0xFFB0C4DE))
                                    }
                                )

                                CountryCodePhoneRow(
                                    countryCode = countryCode,
                                    onCountryCodeChange = {
                                        countryCode = it
                                        if (state.error != null || state.successMessage != null) viewModel.clearMessages()
                                    },
                                    phoneDigits = phone,
                                    onPhoneChange = {
                                        phone = it.filter { ch -> ch.isDigit() }.take(10)
                                        if (state.error != null || state.successMessage != null) viewModel.clearMessages()
                                    }
                                )

                                JamUnderlinedMultilineField(
                                    value = message,
                                    onValueChange = {
                                        message = it
                                        if (state.error != null || state.successMessage != null) viewModel.clearMessages()
                                    },
                                    label = "Mensaje",
                                    minLines = 4,
                                    maxChars = 800
                                )

                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(start = 2.dp),
                                    verticalArrangement = Arrangement.spacedBy(0.dp)
                                ) {
                                    LegalRowMiniCheckbox(
                                        checked = acceptTerms,
                                        onCheckedChange = {
                                            setAcceptTerms(it)
                                            if (state.error != null || state.successMessage != null) viewModel.clearMessages()
                                        },
                                        labelPrefix = "Acepto ",
                                        linkText = "términos y condiciones",
                                        onLinkClick = onTermsClick
                                    )
                                    LegalRowMiniCheckbox(
                                        checked = acceptDataPolicy,
                                        onCheckedChange = {
                                            setAcceptDataPolicy(it)
                                            if (state.error != null || state.successMessage != null) viewModel.clearMessages()
                                        },
                                        labelPrefix = "Acepto ",
                                        linkText = "tratamiento de datos personales",
                                        onLinkClick = onDataPolicyClick
                                    )
                                }

                                if (!state.error.isNullOrBlank()) {
                                    Text(
                                        text = state.error!!,
                                        color = Color(0xFFFF6B81),
                                        style = MaterialTheme.typography.bodySmall,
                                        textAlign = TextAlign.Center,
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                }

                                if (!state.successMessage.isNullOrBlank()) {
                                    Text(
                                        text = state.successMessage!!,
                                        color = Color(0xFF00F0FF),
                                        style = MaterialTheme.typography.bodySmall,
                                        textAlign = TextAlign.Center,
                                        modifier = Modifier.fillMaxWidth()
                                    )
                                }

                                JamPrimaryGlassButton(
                                    text = if (state.isSending) "Enviando..." else "Enviar mensaje",
                                    enabled = !state.isSending,
                                    showLoader = state.isSending,
                                    leadingIcon = Icons.Outlined.Send,
                                    onClick = {
                                        viewModel.send(
                                            fullName = fullName,
                                            email = email,
                                            countryCode = countryCode,
                                            phoneDigits10 = phone,
                                            message = message,
                                            acceptTerms = acceptTerms,
                                            acceptDataPolicy = acceptDataPolicy
                                        )
                                    }
                                )
                            }

                            // 👇 Flecha + indicación de scroll (se oculta al hacer scroll o al tocarla)
                            androidx.compose.animation.AnimatedVisibility(
                                visible = !hideScrollHint && canScrollMore,
                                enter = fadeIn(tween(180)),
                                exit = fadeOut(tween(180)),
                                modifier = Modifier
                                    .align(Alignment.BottomCenter)
                                    .padding(bottom = 8.dp)
                            ) {
                                ScrollHintDown(
                                    text = "Desliza para ver más",
                                    onClick = {
                                        hideScrollHint = true
                                        scope.launch { scrollState.animateScrollTo(scrollState.maxValue) }
                                    }
                                )
                            }

                            } // Box(form)
                        }
                    }
                }

                Spacer(modifier = Modifier.weight(1f))
            }
        }

        // ✅ Signature SIEMPRE visible también en Contacto
        JamSignature(
            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 8.dp),
            showNavIcons = true,
            selectedItem = JamBottomItem.Contact,
            onHomeClick = onHomeClick,
            onAboutClick = onAboutClick,
            onCoursesClick = onCoursesClick,
            onContactClick = onContactClick,
            onSpecialClick = onSpecialClick
        )
    }
}

/* ---------- Pieces ---------- */

@Composable
private fun CountryCodePhoneRow(
    countryCode: String,
    onCountryCodeChange: (String) -> Unit,
    phoneDigits: String,
    onPhoneChange: (String) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        CountryCodeChip(
            value = countryCode,
            onValueChange = onCountryCodeChange
        )
        Spacer(Modifier.width(12.dp))
        JamUnderlinedTextField(
            value = phoneDigits,
            onValueChange = onPhoneChange,
            label = "Número (10 dígitos)",
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
            modifier = Modifier.weight(1f),
            leadingIcon = {
                Icon(Icons.Outlined.PhoneAndroid, null, tint = Color(0xFFB0C4DE))
            }
        )
    }
}

@Composable
private fun CountryCodeChip(
    value: String,
    onValueChange: (String) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    val items = remember {
        listOf(
            "+57 (CO)", "+1 (US)", "+52 (MX)", "+34 (ES)", "+54 (AR)", "+56 (CL)", "+51 (PE)", "+58 (VE)"
        )
    }

    val shape = RoundedCornerShape(12.dp)

    Surface(
        shape = shape,
        color = Color.White.copy(alpha = 0.08f),
        tonalElevation = 0.dp,
        modifier = Modifier
            .height(40.dp)
            .width(52.dp)
            .border(1.dp, Color.White.copy(alpha = 0.18f), shape)
            .clickable { expanded = true }
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.padding(horizontal = 6.dp)
        ) {
            Text(
                text = value,
                color = Color.White,
                fontWeight = FontWeight.SemiBold,
                fontSize = 11.sp
            )

            DropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false }
            ) {
                items.forEach { item ->
                    DropdownMenuItem(
                        text = { Text(item) },
                        onClick = {
                            val codeOnly = item.substringBefore(" ").trim()
                            onValueChange(codeOnly)
                            expanded = false
                        }
                    )
                }

                Divider()

                DropdownMenuItem(
                    text = { Text("Otro…") },
                    onClick = { expanded = false }
                )
            }
        }
    }
}

/* ---------- Compact legal rows ---------- */

@Composable
private fun LegalRowMiniCheckbox(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    labelPrefix: String,
    linkText: String,
    onLinkClick: () -> Unit
) {
    val interaction = remember { MutableInteractionSource() }
    val shape = RoundedCornerShape(6.dp)

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 1.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(18.dp)
                .clip(shape)
                .background(if (checked) Color(0x2200F0FF) else Color.Transparent)
                .border(1.dp, Color.White.copy(alpha = 0.35f), shape)
                .clickable(interactionSource = interaction, indication = null) {
                    onCheckedChange(!checked)
                },
            contentAlignment = Alignment.Center
        ) {
            if (checked) {
                Icon(
                    imageVector = Icons.Filled.Check,
                    contentDescription = null,
                    tint = Color(0xFF00F0FF),
                    modifier = Modifier.size(13.dp)
                )
            }
        }

        Spacer(modifier = Modifier.width(8.dp))

        Row(
            modifier = Modifier
                .weight(1f)
                .clickable(interactionSource = interaction, indication = null) {
                    onCheckedChange(!checked)
                },
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = labelPrefix,
                color = Color(0xFFB0C4DE),
                fontSize = 12.sp,
                lineHeight = 13.sp
            )
            Text(
                text = linkText,
                color = Color(0xFFCCF9FF),
                fontSize = 12.sp,
                lineHeight = 13.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.clickable(interactionSource = interaction, indication = null) {
                    onLinkClick()
                }
            )
        }
    }
}

/* ---------- Fields + button ---------- */

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

    Column(modifier = modifier) {
        TextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 56.dp),
            label = { Text(label) },
            singleLine = true,
            leadingIcon = leadingIcon,
            keyboardOptions = keyboardOptions,
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
        Box(Modifier.fillMaxWidth().height(1.dp).background(underlineBrush))
    }
}

@Composable
private fun JamUnderlinedMultilineField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    minLines: Int,
    maxChars: Int
) {
    val underlineBrush = Brush.horizontalGradient(listOf(Color(0xFF00F0FF), Color(0xFFB022FF)))
    val v = value.take(maxChars)

    Column(modifier = Modifier.fillMaxWidth()) {
        TextField(
            value = v,
            onValueChange = { onValueChange(it.take(maxChars)) },
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = (minLines * 24).dp),
            label = { Text(label) },
            singleLine = false,
            minLines = minLines,
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
        Box(Modifier.fillMaxWidth().height(1.dp).background(underlineBrush))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
            Text(
                text = "${v.length}/$maxChars",
                color = Color(0xFFB0C4DE),
                fontSize = 11.sp,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
    }
}

@Composable
private fun JamPrimaryGlassButton(
    text: String,
    enabled: Boolean,
    showLoader: Boolean,
    leadingIcon: ImageVector? = null,
    onClick: () -> Unit
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
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        if (leadingIcon != null) {
                            Icon(
                                imageVector = leadingIcon,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier
                                    .size(18.dp)
                                    .rotate(SEND_ICON_ROTATION_DEG)
                            )
                            Spacer(Modifier.width(10.dp))
                        }
                        Text(text = text, color = Color.White, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
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
            tint = Color(0xFFCCF9FF),
            modifier = Modifier.size(18.dp)
        )
        Text(
            text = text,
            color = Color.White.copy(alpha = 0.92f),
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}
