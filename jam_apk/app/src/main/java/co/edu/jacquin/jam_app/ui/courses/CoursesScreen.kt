package co.edu.jacquin.jam_app.ui.courses

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
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import co.edu.jacquin.jam_app.ui.JamBottomItem
import co.edu.jacquin.jam_app.ui.JamHorizontalLogo
import co.edu.jacquin.jam_app.ui.JamSignature

@Composable
fun CoursesScreen(
    onBackClick: () -> Unit = {},
    onHomeClick: () -> Unit = {},
    onAboutClick: () -> Unit = {},
    onCoursesClick: () -> Unit = {},
    onContactClick: () -> Unit = {},
    onEventsClick: () -> Unit = {},
    // En el futuro: onCourseOpen(id) -> navigate detail
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

    var query by remember { mutableStateOf("") }
    val scroll = rememberScrollState()

    // Placeholder local (luego lo conectamos a backend / repo)
    val allCourses = remember {
        listOf(
            CourseCardUi("Guitarra acústica", "Nivel inicial a avanzado. Técnica, ritmo y repertorio."),
            CourseCardUi("Piano", "Lectura, armonía y práctica guiada por niveles."),
            CourseCardUi("Canto", "Respiración, afinación, interpretación y cuidado vocal."),
            CourseCardUi("Batería", "Groove, coordinación, rudimentos y ensamble."),
            CourseCardUi("Teoría musical", "Lenguaje musical, lectura, armonía y entrenamiento auditivo."),
            CourseCardUi("Producción musical", "Grabación, edición, mezcla y fundamentos de audio.")
        )
    }

    val filtered = remember(query, allCourses) {
        val q = query.trim().lowercase()
        if (q.isEmpty()) allCourses
        else allCourses.filter { it.title.lowercase().contains(q) || it.subtitle.lowercase().contains(q) }
    }

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

        // Card glass con scroll interno
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(top = 124.dp, bottom = 96.dp),
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
                            text = "Cursos",
                            style = MaterialTheme.typography.headlineSmall,
                            color = Color.White
                        )

                        Text(
                            text = "Explora la oferta académica. Próximamente: categorías, horarios y detalle por curso.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color(0xFFB0C4DE)
                        )

                        // Search glass
                        TextField(
                            value = query,
                            onValueChange = { query = it },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp),
                            singleLine = true,
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Filled.Search,
                                    contentDescription = "Buscar",
                                    tint = Color.White.copy(alpha = 0.85f)
                                )
                            },
                            placeholder = {
                                Text(
                                    text = "Buscar",
                                    color = Color.White.copy(alpha = 0.55f)
                                )
                            },
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color.White.copy(alpha = 0.10f),
                                unfocusedContainerColor = Color.White.copy(alpha = 0.07f),
                                disabledContainerColor = Color.White.copy(alpha = 0.06f),
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                cursorColor = Color(0xFF00F0FF),
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent
                            ),
                            shape = RoundedCornerShape(18.dp)
                        )

                        if (filtered.isEmpty()) {
                            Text(
                                text = "No hay resultados para “${query.trim()}”.",
                                color = Color(0xFFBCC6DC),
                                style = MaterialTheme.typography.bodySmall
                            )
                        } else {
                            filtered.forEach { c ->
                                CourseCard(
                                    title = c.title,
                                    subtitle = c.subtitle
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Más adelante: inscripción, cupos, modalidad, precio, y vista de detalle.",
                            color = Color(0xFFBCC6DC),
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }
        }

        // Signature overlay: Cursos activo
        JamSignature(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 8.dp),
            showNavIcons = true,
            selectedItem = JamBottomItem.Courses,
            onHomeClick = onHomeClick,
            onAboutClick = onAboutClick,
            onCoursesClick = { /* ya estás aquí */ },
            onContactClick = onContactClick,
            onSpecialClick = onEventsClick
        )
    }
}

private data class CourseCardUi(
    val title: String,
    val subtitle: String
)

@Composable
private fun CourseCard(
    title: String,
    subtitle: String
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 96.dp),
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
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = subtitle,
                color = Color(0xFFB0C4DE),
                style = MaterialTheme.typography.bodySmall,
                lineHeight = 16.sp
            )
            Text(
                text = "Ver más (próximamente)",
                color = Color(0xFFCCF9FF),
                style = MaterialTheme.typography.labelMedium
            )
        }
    }
}
