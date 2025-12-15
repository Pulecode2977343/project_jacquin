package co.edu.jacquin.jam_app.ui.about

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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import co.edu.jacquin.jam_app.ui.JamBottomItem
import co.edu.jacquin.jam_app.ui.JamHorizontalLogo
import co.edu.jacquin.jam_app.ui.JamSignature

@Composable
fun AboutScreen(
    onBackClick: () -> Unit = {},
    onHomeClick: () -> Unit = {},
    onAboutClick: () -> Unit = {},
    onCoursesClick: () -> Unit = {},
    onContactClick: () -> Unit = {},
    onEventsClick: () -> Unit = {}
) {
    val backgroundGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF00346A), Color(0xFF000814))
    )
    val innerGlassGradient = Brush.verticalGradient(
        colors = listOf(Color(0x1FFFFFFF), Color(0x05FFFFFF))
    )
    val outerGlassGradient = Brush.verticalGradient(
        colors = listOf(Color(0x26FFFFFF), Color(0x0AFFFFFF))
    )

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

        // Card glass
        val scroll = rememberScrollState()

        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(top = 124.dp, bottom = 96.dp), // espacio para signature overlay
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
                            text = "Nosotros",
                            style = MaterialTheme.typography.headlineSmall,
                            color = Color.White
                        )

                        Text(
                            text = "Jacquin Academia Musical nace para formar músicos con enfoque humano, disciplina artística y visión profesional.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color(0xFFB0C4DE),
                            textAlign = TextAlign.Start
                        )

                        InfoBlock(
                            title = "Misión",
                            body = "Impulsar el talento musical con metodologías modernas, acompañamiento cercano y experiencias reales de escenario."
                        )

                        InfoBlock(
                            title = "Visión",
                            body = "Ser una academia referente en la región por su excelencia pedagógica, innovación y comunidad creativa."
                        )

                        InfoBlock(
                            title = "Valores",
                            body = "Disciplina • Respeto • Pasión • Trabajo en equipo • Creatividad • Integridad."
                        )

                        InfoBlock(
                            title = "¿Qué ofrece la Academia?",
                            body = "Clases por niveles, formación por instrumentos, teoría musical, ensambles, preparación para presentaciones y seguimiento académico."
                        )

                        Text(
                            text = "Próximo paso: conectar esta sección con contenido administrable desde el panel (eventos/noticias y comunicados).",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFFBCC6DC),
                            textAlign = TextAlign.Start
                        )
                    }
                }
            }
        }

        // Signature overlay: About activo
        JamSignature(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 8.dp),
            showNavIcons = true,
            selectedItem = JamBottomItem.About,
            onHomeClick = onHomeClick,
            onAboutClick = { /* ya estás aquí */ },
            onCoursesClick = onCoursesClick,
            onContactClick = onContactClick,
            onSpecialClick = onEventsClick
        )
    }
}

@Composable
private fun InfoBlock(
    title: String,
    body: String
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 92.dp),
        shape = RoundedCornerShape(22.dp),
        color = Color.White.copy(alpha = 0.06f)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(
                text = title,
                color = Color.White,
                style = MaterialTheme.typography.titleMedium
            )
            Text(
                text = body,
                color = Color(0xFFB0C4DE),
                style = MaterialTheme.typography.bodySmall,
                textAlign = TextAlign.Start
            )
        }
    }
}
