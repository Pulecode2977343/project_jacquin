package co.edu.jacquin.jam_app.ui.legal

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.style.TextAlign
import co.edu.jacquin.jam_app.ui.JamHorizontalLogo

/**
 * Pantalla de Consentimiento de Cookies (Overlay o Pantalla completa).
 * Mantiene estilo Premium/Glassmorphism.
 */
@Composable
fun CookieConsentScreen(
    onReject: () -> Unit,
    onCustomize: () -> Unit,
    onAcceptAll: () -> Unit
) {
    // Mismos gradientes que JamLegalScreen
    val backgroundGradient = Brush.verticalGradient(colors = listOf(Color(0xFF00346A), Color(0xFF000814)))
    val innerGlassGradient = Brush.verticalGradient(listOf(Color(0x1FFFFFFF), Color(0x05FFFFFF)))
    val outerGlassGradient = Brush.verticalGradient(listOf(Color(0x26FFFFFF), Color(0x0AFFFFFF)))

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundGradient)
            .statusBarsPadding()
            .padding(20.dp),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            modifier = Modifier.fillMaxWidth().wrapContentHeight(),
            shape = RoundedCornerShape(26.dp),
            color = Color.Transparent
        ) {
            Box(
                modifier = Modifier
                    .background(outerGlassGradient, RoundedCornerShape(26.dp))
                    .border(1.dp, Color.White.copy(alpha = 0.14f), RoundedCornerShape(26.dp))
                    .padding(2.dp)
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(24.dp))
                        .background(innerGlassGradient, RoundedCornerShape(24.dp))
                        .border(0.5.dp, Color.White.copy(alpha = 0.28f), RoundedCornerShape(24.dp))
                        .padding(22.dp)
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Header con Logo
                        JamHorizontalLogo(modifier = Modifier.height(38.dp))
                        
                        Text(
                            text = "Tu privacidad es importante",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = Color.White,
                            textAlign = TextAlign.Center
                        )

                        Text(
                            text = "Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y mostrarte contenido personalizado. Puedes aceptar todas, rechazarlas o configurar tus preferencias.",
                            style = MaterialTheme.typography.bodyMedium.copy(fontSize = 14.sp),
                            color = Color(0xFFE0ECFF),
                            textAlign = TextAlign.Center,
                            lineHeight = 20.sp
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        // Botones de acción
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Button(
                                onClick = onAcceptAll,
                                modifier = Modifier.fillMaxWidth().height(48.dp),
                                shape = RoundedCornerShape(999.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color.Transparent
                                ),
                                contentPadding = PaddingValues()
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .background(
                                            Brush.horizontalGradient(listOf(Color(0xFF00F0FF), Color(0xFF0055FF))),
                                            RoundedCornerShape(999.dp)
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text("Aceptar todas", color = Color.White, fontWeight = FontWeight.SemiBold)
                                }
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                OutlinedButton(
                                    onClick = onCustomize,
                                    modifier = Modifier.weight(1f).height(48.dp),
                                    shape = RoundedCornerShape(999.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFCCF9FF)),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.3f))
                                ) {
                                    Text("Personalizar", fontSize = 12.sp)
                                }

                                OutlinedButton(
                                    onClick = onReject,
                                    modifier = Modifier.weight(1f).height(48.dp),
                                    shape = RoundedCornerShape(999.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFFF8A80)),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.3f))
                                ) {
                                    Text("Rechazar solo", fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
