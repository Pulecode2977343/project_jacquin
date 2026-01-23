package co.edu.jacquin.jam_app.ui.legal

import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

/**
 * Pantalla legal (reemplaza overlays).
 * - Fondo institucional
 * - Card glass
 * - Botón "Aceptar" deshabilitado hasta llegar al final
 * - Flecha/indicador de scroll: se oculta al hacer scroll o al tocarla (baja al final)
 */
@Composable
fun JamLegalScreen(
    title: String,
    body: String,
    onBack: () -> Unit,
    onAccepted: () -> Unit,
) {
    val backgroundGradient = Brush.verticalGradient(colors = listOf(Color(0xFF00346A), Color(0xFF000814)))
    val innerGlassGradient = Brush.verticalGradient(listOf(Color(0x1FFFFFFF), Color(0x05FFFFFF)))
    val outerGlassGradient = Brush.verticalGradient(listOf(Color(0x26FFFFFF), Color(0x0AFFFFFF)))

    val scroll = rememberScrollState()
    val scope = rememberCoroutineScope()

    var hideScrollHint by remember { mutableStateOf(false) }
    LaunchedEffect(scroll.value) {
        if (scroll.value > 10) hideScrollHint = true
    }

    val canScrollMore by remember {
        derivedStateOf { scroll.maxValue > 0 && scroll.value < (scroll.maxValue - 10) }
    }
    val reachedBottom by remember {
        derivedStateOf { scroll.maxValue == 0 || scroll.value >= (scroll.maxValue - 8) }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundGradient)
            .statusBarsPadding()
    ) {
        // Header fijo
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 14.dp, end = 18.dp, top = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.Filled.ArrowBack,
                    contentDescription = "Volver",
                    tint = Color(0xFFE0ECFF)
                )
            }
            Text(
                text = title,
                color = Color.White,
                fontWeight = FontWeight.SemiBold,
                style = MaterialTheme.typography.titleLarge
            )
        }

        // Contenido
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp)
                .padding(top = 66.dp, bottom = 18.dp)
        ) {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(28.dp),
                color = Color.Transparent
            ) {
                Box(
                    modifier = Modifier
                        .background(outerGlassGradient, RoundedCornerShape(28.dp))
                        .border(1.dp, Color.White.copy(alpha = 0.14f), RoundedCornerShape(28.dp))
                        .padding(2.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(26.dp))
                            .background(innerGlassGradient, RoundedCornerShape(26.dp))
                            .border(0.5.dp, Color.White.copy(alpha = 0.28f), RoundedCornerShape(26.dp))
                            .padding(18.dp)
                    ) {
                        Box(modifier = Modifier.fillMaxWidth()) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .heightIn(min = 320.dp, max = 520.dp)
                                    .verticalScroll(scroll),
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Text(
                                    text = body,
                                    color = Color(0xFFE6EEF9),
                                    style = MaterialTheme.typography.bodyMedium,
                                    lineHeight = 18.sp
                                )
                                Spacer(Modifier.height(8.dp))
                            }

                            androidx.compose.animation.AnimatedVisibility(
                                visible = !hideScrollHint && canScrollMore,
                                enter = fadeIn(tween(180)),
                                exit = fadeOut(tween(180)),
                                modifier = Modifier
                                    .align(Alignment.BottomCenter)
                                    .padding(bottom = 8.dp)
                            ) {
                                ScrollHintDown(
                                    text = "Desliza para llegar al final",
                                    onClick = {
                                        hideScrollHint = true
                                        scope.launch { scroll.animateScrollTo(scroll.maxValue) }
                                    }
                                )
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(14.dp))

            JamLegalAcceptRow(
                enabled = reachedBottom,
                onBack = onBack,
                onAccepted = onAccepted
            )
        }
    }
}

@Composable
private fun JamLegalAcceptRow(
    enabled: Boolean,
    onBack: () -> Unit,
    onAccepted: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        OutlinedButton(
            onClick = onBack,
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(999.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White)
        ) {
            Text("Volver")
        }

        Button(
            onClick = onAccepted,
            modifier = Modifier.weight(1f),
            enabled = enabled,
            shape = RoundedCornerShape(999.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFEA36A))
        ) {
            Text("Aceptar", color = Color.White, fontWeight = FontWeight.SemiBold)
        }
    }
}

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
