package co.edu.jacquin.jam_app.ui

import co.edu.jacquin.jam_app.R
import androidx.compose.foundation.background
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Call
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.LibraryMusic
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp

enum class JamBottomItem {
    Home,
    About,
    Special,
    Courses,
    Contact
}

@Composable
fun JamSignature(
    modifier: Modifier = Modifier,
    showNavIcons: Boolean = false,
    selectedItem: JamBottomItem = JamBottomItem.Home,   // 🔹 estado activo
    onHomeClick: () -> Unit = {},
    onAboutClick: () -> Unit = {},
    onCoursesClick: () -> Unit = {},
    onContactClick: () -> Unit = {},
    onSpecialClick: () -> Unit = {},                    // ícono central
) {
    val activeColor = Color(0xFF00F0FF)                       // neón activo
    val inactiveColor = Color(0xFFCCF9FF).copy(alpha = 0.65f) // cian suave

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF001226),
                        Color(0xFF000814)
                    )
                )
            )
            .padding(
                start = 16.dp,
                end = 16.dp,
                top = 4.dp,
                bottom = 0.dp
            ),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        if (showNavIcons) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                // HOME
                JamBottomNavItem(
                    icon = { tint ->
                        Icon(
                            imageVector = Icons.Outlined.Home,
                            contentDescription = "Inicio",
                            tint = tint,
                            modifier = Modifier.size(30.dp)
                        )
                    },
                    isSelected = selectedItem == JamBottomItem.Home,
                    activeColor = activeColor,
                    inactiveColor = inactiveColor,
                    onClick = onHomeClick
                )

                // NOSOTROS (multiusuarios)
                JamBottomNavItem(
                    icon = { tint ->
                        Icon(
                            imageVector = Icons.Outlined.Groups,
                            contentDescription = "Nosotros",
                            tint = tint,
                            modifier = Modifier.size(30.dp)
                        )
                    },
                    isSelected = selectedItem == JamBottomItem.About,
                    activeColor = activeColor,
                    inactiveColor = inactiveColor,
                    onClick = onAboutClick
                )

                // ESPECIAL (clave de sol navideña personalizada)
                JamBottomNavItem(
                    icon = { _: Color ->
                        Image(
                            painter = painterResource(id = R.drawable.ic_treble_clef_christmas),
                            contentDescription = "Especial JAM (clave de sol navideña)",
                            modifier = Modifier
                                .size(36.dp)              // un pelín más grande para destacar
                                .clickable(onClick = onSpecialClick)
                        )
                    },
                    isSelected = selectedItem == JamBottomItem.Special,
                    activeColor = activeColor,
                    inactiveColor = inactiveColor,
                    onClick = onSpecialClick
                )

                // CURSOS
                JamBottomNavItem(
                    icon = { tint ->
                        Icon(
                            imageVector = Icons.Outlined.LibraryMusic,
                            contentDescription = "Cursos",
                            tint = tint,
                            modifier = Modifier.size(30.dp)
                        )
                    },
                    isSelected = selectedItem == JamBottomItem.Courses,
                    activeColor = activeColor,
                    inactiveColor = inactiveColor,
                    onClick = onCoursesClick
                )

                // CONTACTO (teléfono)
                JamBottomNavItem(
                    icon = { tint ->
                        Icon(
                            imageVector = Icons.Outlined.Call,
                            contentDescription = "Contáctanos",
                            tint = tint,
                            modifier = Modifier.size(30.dp)
                        )
                    },
                    isSelected = selectedItem == JamBottomItem.Contact,
                    activeColor = activeColor,
                    inactiveColor = inactiveColor,
                    onClick = onContactClick
                )
            }
        }

        Text(
            text = "Diseñado con el poder de Visionary Code Team",
            style = MaterialTheme.typography.labelSmall,
            color = Color(0xFFA49999).copy(alpha = 0.35f),
            textAlign = TextAlign.Center,
        )
    }
}

@Composable
private fun JamBottomNavItem(
    icon: @Composable (Color) -> Unit,
    isSelected: Boolean,
    activeColor: Color,
    inactiveColor: Color,
    onClick: () -> Unit
) {
    val tint = if (isSelected) activeColor else inactiveColor

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(2.dp),
        modifier = Modifier
            .clickable(onClick = onClick)
    ) {
        icon(tint)

        // Indicador inferior (barra pequeña)
        Box(
            modifier = Modifier
                .width(18.dp)
                .height(2.dp)
                .background(
                    color = if (isSelected) activeColor else Color.Transparent
                )
        )
    }
}
