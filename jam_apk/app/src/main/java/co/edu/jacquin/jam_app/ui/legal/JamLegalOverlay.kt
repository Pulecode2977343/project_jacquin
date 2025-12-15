package co.edu.jacquin.jam_app.ui.legal

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
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

/**
 * Overlay legal con MÁS CONTRASTE (menos transparencia).
 *
 * ⚠️ DEPRECADO: usa JamLegalScreen + Navigation (LegalRoutes).
 * - Glass más sólido
 * - Scrim más fuerte
 * - Botón habilitado solo al llegar al final
 */
@Deprecated("Reemplazado por JamLegalScreen + Navigation (LegalRoutes)", level = DeprecationLevel.WARNING)
@Composable
fun JamLegalOverlay(
    title: String,
    content: String,
    onClose: () -> Unit,
    onAccept: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val scroll = rememberScrollState()

    val isAtBottom by remember {
        derivedStateOf { scroll.value >= (scroll.maxValue - 8) }
    }
    val showScrollHint by remember {
        derivedStateOf { scroll.value < 8 && scroll.maxValue > 0 }
    }

    // Más contraste
    val scrimColor = Color(0xE6000814) // antes ~AA, ahora más fuerte

    val outerGlass = Brush.verticalGradient(
        colors = listOf(
            Color(0x55FFFFFF), // más opaco
            Color(0x22FFFFFF)
        )
    )
    val innerGlass = Brush.verticalGradient(
        colors = listOf(
            Color(0x40FFFFFF),
            Color(0x18FFFFFF)
        )
    )

    val contentBg = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF001C3D).copy(alpha = 0.70f),
            Color(0xFF000814).copy(alpha = 0.70f)
        )
    )

    val buttonBrushEnabled = Brush.horizontalGradient(
        colors = listOf(Color(0xFFFFA25A), Color(0xFFFF6F91))
    )
    val buttonBrushDisabled = Brush.horizontalGradient(
        colors = listOf(Color(0xFFFFA25A).copy(alpha = 0.35f), Color(0xFFFF6F91).copy(alpha = 0.35f))
    )

    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { visible = true }

    androidx.compose.animation.AnimatedVisibility(
        visible = visible,
        enter = fadeIn(tween(200)),
        exit = fadeOut(tween(150))
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(scrimColor)
                .clickable(
                    indication = null,
                    interactionSource = remember { MutableInteractionSource() }
                ) { },
            contentAlignment = Alignment.Center
        ) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                color = Color.Transparent,
                shape = RoundedCornerShape(30.dp)
            ) {
                Box(
                    modifier = Modifier
                        .background(outerGlass, RoundedCornerShape(30.dp))
                        .border(1.dp, Color.White.copy(alpha = 0.22f), RoundedCornerShape(30.dp))
                        .padding(2.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(28.dp))
                            .background(innerGlass, RoundedCornerShape(28.dp))
                            .border(0.8.dp, Color.White.copy(alpha = 0.28f), RoundedCornerShape(28.dp))
                            .padding(18.dp)
                    ) {
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(modifier = Modifier.fillMaxWidth()) {
                                Text(
                                    text = title,
                                    color = Color.White,
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 18.sp,
                                    modifier = Modifier
                                        .align(Alignment.Center)
                                        .padding(horizontal = 44.dp),
                                    textAlign = TextAlign.Center
                                )
                                IconButton(
                                    onClick = onClose,
                                    modifier = Modifier.align(Alignment.CenterEnd)
                                ) {
                                    Icon(
                                        imageVector = Icons.Filled.Close,
                                        contentDescription = "Cerrar",
                                        tint = Color(0xFFE0ECFF)
                                    )
                                }
                            }

                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .weight(1f, fill = true)
                                    .clip(RoundedCornerShape(22.dp))
                                    .background(contentBg)
                                    .border(1.dp, Color.White.copy(alpha = 0.18f), RoundedCornerShape(22.dp))
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .verticalScroll(scroll)
                                        .padding(16.dp),
                                    verticalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    Text(
                                        text = content,
                                        color = Color(0xFFF0F6FF),
                                        fontSize = 13.sp,
                                        lineHeight = 18.sp
                                    )
                                    Spacer(modifier = Modifier.height(12.dp))
                                }

                                androidx.compose.animation.AnimatedVisibility(
                                    visible = showScrollHint,
                                    enter = fadeIn(tween(150)),
                                    exit = fadeOut(tween(150)),
                                    modifier = Modifier
                                        .align(Alignment.BottomCenter)
                                        .padding(bottom = 10.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(999.dp))
                                            .background(Color.White.copy(alpha = 0.16f))
                                            .border(1.dp, Color.White.copy(alpha = 0.20f), RoundedCornerShape(999.dp))
                                            .clickable {
                                                scope.launch { scroll.animateScrollTo(scroll.maxValue) }
                                            }
                                            .padding(horizontal = 12.dp, vertical = 8.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Filled.KeyboardArrowDown,
                                            contentDescription = "Ver más",
                                            tint = Color.White.copy(alpha = 0.95f)
                                        )
                                        Text(
                                            text = "Ver más",
                                            color = Color.White.copy(alpha = 0.95f),
                                            fontSize = 12.sp,
                                            modifier = Modifier
                                                .align(Alignment.CenterEnd)
                                                .padding(start = 18.dp)
                                        )
                                    }
                                }
                            }

                            Text(
                                text = if (isAtBottom) "Listo ✅ Puedes aceptar." else "Desliza hasta el final para habilitar “Aceptar”.",
                                color = Color(0xFFBFD3EA),
                                fontSize = 12.sp
                            )

                            Button(
                                onClick = onAccept,
                                enabled = isAtBottom,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color.Transparent,
                                    disabledContainerColor = Color.Transparent
                                ),
                                shape = RoundedCornerShape(999.dp),
                                contentPadding = ButtonDefaults.ContentPadding
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .clip(RoundedCornerShape(999.dp))
                                        .background(if (isAtBottom) buttonBrushEnabled else buttonBrushDisabled)
                                        .border(
                                            1.dp,
                                            Color.White.copy(alpha = if (isAtBottom) 0.26f else 0.12f),
                                            RoundedCornerShape(999.dp)
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "Aceptar",
                                        color = Color.White,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
