package co.edu.jacquin.jam_app.ui.legal

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Pantalla/Overlay de Consentimiento de Cookies.
 * Diseñada estilo Glassmorphism (consistente con JamLegalScreen).
 */
@Composable
fun CookieConsentScreen(
    onReject: () -> Unit,
    onCustomize: () -> Unit,
    onAcceptAll: () -> Unit
) {
    // Fondos y gradientes institucionales
    val backgroundGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF00346A).copy(alpha = 0.95f), Color(0xFF000814))
    )
    // Glass gradients
    val outerGlassGradient = Brush.verticalGradient(
        listOf(Color(0x26FFFFFF), Color(0x0AFFFFFF))
    )
    val innerGlassGradient = Brush.verticalGradient(
        listOf(Color(0x1FFFFFFF), Color(0x05FFFFFF))
    )

    // Botón Aceptar con gradiente (estilo premium)
    val acceptButtonBrush = Brush.horizontalGradient(
        colors = listOf(Color(0xFFFEA36A), Color(0xFFFF6F91))
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundGradient)
            .statusBarsPadding()
            .navigationBarsPadding(),
        contentAlignment = Alignment.BottomCenter // Alineado abajo como un bottom sheet/overlay grande
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.Bottom
        ) {
            // Título o Logo opcional arriba (si se desea llenar más pantalla)
            // Por ahora nos centramos en el bloque de consentimiento principal

            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                shape = RoundedCornerShape(28.dp),
                color = Color.Transparent
            ) {
                // Borde Exterior Glass
                Box(
                    modifier = Modifier
                        .background(outerGlassGradient, RoundedCornerShape(28.dp))
                        .border(1.dp, Color.White.copy(alpha = 0.14f), RoundedCornerShape(28.dp))
                        .padding(2.dp)
                ) {
                    // Contenedor Interior Glass
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(26.dp))
                            .background(innerGlassGradient, RoundedCornerShape(26.dp))
                            .border(
                                0.5.dp,
                                Color.White.copy(alpha = 0.28f),
                                RoundedCornerShape(26.dp)
                            )
                            .padding(24.dp)
                    ) {
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "Valoramos tu privacidad 🍪",
                                color = Color.White,
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                                textAlign = TextAlign.Center
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            // Contenido scrollable por si el texto legal es largo
                            Column(
                                modifier = Modifier
                                    .heightIn(max = 200.dp)
                                    .verticalScroll(rememberScrollState())
                            ) {
                                Text(
                                    text = "Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y mostrar contenido personalizado. Puedes aceptar todas las cookies, rechazarlas o configurar tus preferencias.",
                                    color = Color(0xFFE6EEF9), // Texto claro legible
                                    style = MaterialTheme.typography.bodyMedium,
                                    lineHeight = 20.sp,
                                    textAlign = TextAlign.Center
                                )
                            }

                            Spacer(modifier = Modifier.height(24.dp))

                            // --- Botones de Acción ---
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                // 1. Botón Principal: Aceptar Todo
                                Button(
                                    onClick = onAcceptAll,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(50.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color.Transparent
                                    ),
                                    shape = RoundedCornerShape(999.dp),
                                    contentPadding = ButtonDefaults.ContentPadding
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .clip(RoundedCornerShape(999.dp))
                                            .background(acceptButtonBrush),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = "Aceptar todo",
                                            color = Color.White,
                                            fontWeight = FontWeight.SemiBold,
                                            fontSize = 16.sp
                                        )
                                    }
                                }

                                // 2. Botones Secundarios: Personalizar y Rechazar (en fila)
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    OutlinedButton(
                                        onClick = onReject,
                                        modifier = Modifier
                                            .weight(1f)
                                            .height(48.dp),
                                        shape = RoundedCornerShape(999.dp),
                                        colors = ButtonDefaults.outlinedButtonColors(
                                            contentColor = Color(0xFFE6EEF9)
                                        ),
                                        border = androidx.compose.foundation.BorderStroke(
                                            1.dp,
                                            Color.White.copy(alpha = 0.3f)
                                        )
                                    ) {
                                        Text("Rechazar")
                                    }

                                    OutlinedButton(
                                        onClick = onCustomize,
                                        modifier = Modifier
                                            .weight(1f)
                                            .height(48.dp),
                                        shape = RoundedCornerShape(999.dp),
                                        colors = ButtonDefaults.outlinedButtonColors(
                                            contentColor = Color(0xFFE6EEF9)
                                        ),
                                        border = androidx.compose.foundation.BorderStroke(
                                            1.dp,
                                            Color.White.copy(alpha = 0.3f)
                                        )
                                    ) {
                                        Text("Personalizar")
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
