package co.edu.jacquin.jam_app.ui.home

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.core.tween
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
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.LibraryMusic
import androidx.compose.material.icons.outlined.MailOutline
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import co.edu.jacquin.jam_app.ui.JamBottomItem
import co.edu.jacquin.jam_app.ui.JamHorizontalLogo
import co.edu.jacquin.jam_app.ui.JamSignature
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    isLoggedIn: Boolean,
    onLoginClick: () -> Unit,
    onDashboardClick: () -> Unit,
    onCoursesClick: () -> Unit = {},
    onAboutClick: () -> Unit = {},
    onContactClick: () -> Unit = {}
) {
    val backgroundGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF00346A), Color(0xFF000814))
    )

    val headerGlassGradient = Brush.verticalGradient(
        colors = listOf(Color(0xCC061325), Color(0x99061325))
    )

    val scrollState = rememberScrollState()
    val coroutineScope = rememberCoroutineScope()
    var searchQuery by remember { mutableStateOf("") }

    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }

    val primaryActionText = if (isLoggedIn) "Mi panel" else "Iniciar sesión"
    val primaryActionClick = if (isLoggedIn) onDashboardClick else onLoginClick

    Box(
        modifier = Modifier.fillMaxSize().background(backgroundGradient)
    ) {
        AnimatedVisibility(
            visible = visible,
            enter = fadeIn(tween(700)) + slideInVertically(tween(700)) { it / 10 },
            exit = fadeOut(tween(300)) + slideOutVertically(tween(300)) { it / 10 }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(scrollState)
                    .padding(start = 24.dp, end = 24.dp, top = 210.dp, bottom = 72.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Explora tu universo musical",
                    style = MaterialTheme.typography.titleMedium,
                    color = Color(0xFFCCF9FF)
                )

                Text(
                    text = "Encuentra cursos, talleres, ensambles y recursos para potenciar tu talento.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFFB0C4DE)
                )

                JamHomeGlassCard(
                    title = "Dashboard académico",
                    description = "Accede a tus clases, progreso y materiales.",
                    icon = Icons.Outlined.LibraryMusic,
                    onClick = primaryActionClick
                )

                JamHomeGlassCard(
                    title = "Nosotros",
                    description = "Conoce la historia, misión y equipo de Jacquin Academia Musical.",
                    icon = Icons.Outlined.Info,
                    onClick = onAboutClick
                )

                JamHomeGlassCard(
                    title = "Contáctanos",
                    description = "Escríbenos para matrículas, dudas o soporte académico.",
                    icon = Icons.Outlined.MailOutline,
                    onClick = onContactClick
                )

                Spacer(modifier = Modifier.height(40.dp))
            }
        }

        // HEADER fijo
        Box(
            modifier = Modifier.fillMaxWidth().align(Alignment.TopCenter)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(bottomStart = 26.dp, bottomEnd = 26.dp))
                    .background(headerGlassGradient)
                    .border(1.dp, Color.White.copy(alpha = 0.20f), RoundedCornerShape(bottomStart = 26.dp, bottomEnd = 26.dp))
                    .padding(horizontal = 24.dp, vertical = 40.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    JamHorizontalLogo()
                    Box(modifier = Modifier.size(32.dp))
                }

                TextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier.fillMaxWidth().height(44.dp),
                    placeholder = {
                        Text(
                            text = "Buscar",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFFB0C4DE)
                        )
                    },
                    singleLine = true,
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Outlined.Search,
                            contentDescription = "Buscar",
                            tint = Color(0xFFCCF9FF)
                        )
                    },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color(0x26FFFFFF),
                        unfocusedContainerColor = Color(0x1AFFFFFF),
                        disabledContainerColor = Color.Transparent,
                        cursorColor = Color(0xFF00F0FF),
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                        disabledIndicatorColor = Color.Transparent,
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedPlaceholderColor = Color(0xFFB0C4DE),
                        unfocusedPlaceholderColor = Color(0xFF9FB3D9)
                    )
                )
            }

            // Botón flotante
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp)
                    .align(Alignment.BottomEnd)
                    .offset(y = 16.dp),
                horizontalArrangement = Arrangement.End
            ) {
                JamHomePrimaryButton(
                    text = primaryActionText,
                    onClick = primaryActionClick,
                    modifier = Modifier.fillMaxWidth(0.4f)
                )
            }
        }

        // Firma + nav
        JamSignature(
            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 8.dp),
            showNavIcons = true,
            selectedItem = JamBottomItem.Home,
            onHomeClick = { coroutineScope.launch { scrollState.animateScrollTo(0) } },
            onAboutClick = onAboutClick,
            onCoursesClick = onCoursesClick,
            onContactClick = onContactClick,
            onSpecialClick = primaryActionClick // ✅ Panel o Login según sesión
        )
    }
}

// ---- (helpers igual que tu archivo actual) ----

@Composable
private fun JamHomeGlassCard(
    title: String,
    description: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    val glassCardGradient = Brush.verticalGradient(
        colors = listOf(Color(0x1FFFFFFF), Color(0x05FFFFFF))
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(22.dp))
            .background(glassCardGradient, RoundedCornerShape(22.dp))
            .border(1.dp, Color.White.copy(alpha = 0.18f), RoundedCornerShape(22.dp))
            .clickable(onClick = onClick)
            .padding(16.dp)
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(
                        Brush.radialGradient(
                            colors = listOf(Color(0xFF00F0FF), Color(0x0000F0FF))
                        )
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = icon, contentDescription = title, tint = Color(0xFF00346A))
            }

            Column(
                verticalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.weight(1f)
            ) {
                Text(text = title, style = MaterialTheme.typography.titleMedium, color = Color.White)
                Text(text = description, style = MaterialTheme.typography.bodySmall, color = Color(0xFFB0C4DE))
            }
        }
    }
}

@Composable
private fun JamHomePrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val buttonGradient = Brush.horizontalGradient(
        colors = listOf(Color(0xCCFEA36A), Color(0xCCFF6B6B))
    )
    val highlightGradient = Brush.verticalGradient(
        colors = listOf(Color.White.copy(alpha = 0.5f), Color.Transparent)
    )

    Button(
        onClick = onClick,
        modifier = modifier.height(36.dp).clip(RoundedCornerShape(999.dp)),
        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent, contentColor = Color.White),
        contentPadding = PaddingValues()
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White.copy(alpha = 0.12f), RoundedCornerShape(999.dp))
                .border(1.dp, Color.White.copy(alpha = 0.4f), RoundedCornerShape(999.dp))
                .padding(1.5.dp),
            contentAlignment = Alignment.Center
        ) {
            Box(modifier = Modifier.fillMaxSize().background(buttonGradient, RoundedCornerShape(999.dp))) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(16.dp)
                        .background(
                            highlightGradient,
                            RoundedCornerShape(topStart = 999.dp, topEnd = 999.dp, bottomStart = 40.dp, bottomEnd = 40.dp)
                        )
                        .align(Alignment.TopCenter)
                )

                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(text = text, style = MaterialTheme.typography.labelLarge)
                }
            }
        }
    }
}
