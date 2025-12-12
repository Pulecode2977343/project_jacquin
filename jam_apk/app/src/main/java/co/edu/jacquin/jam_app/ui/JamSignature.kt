package co.edu.jacquin.jam_app.ui

import co.edu.jacquin.jam_app.R
import androidx.compose.foundation.background
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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

enum class JamBottomItem { Home, About, Special, Courses, Contact }

@Composable
fun JamSignature(
    modifier: Modifier = Modifier,
    showNavIcons: Boolean = false,
    selectedItem: JamBottomItem = JamBottomItem.Home,
    onHomeClick: () -> Unit = {},
    onAboutClick: () -> Unit = {},
    onCoursesClick: () -> Unit = {},
    onContactClick: () -> Unit = {},
    onSpecialClick: () -> Unit = {},
) {
    val activeColor = Color(0xFF00F0FF)                       // neón activo
    val inactiveColor = Color(0xFFCCF9FF).copy(alpha = 0.65f) // cian suave

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(
                Brush.verticalGradient(
                    colors = listOf(Color(0xFF001226), Color(0xFF000814))
                )
            )
            .padding(start = 16.dp, end = 16.dp, top = 4.dp, bottom = 0.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        if (showNavIcons) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically,
            ) {
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

                // ✅ ESPECIAL = “Panel” (cuando hay sesión, lo usas para volver al dashboard)
                JamBottomNavItem(
                    icon = { tint ->
                        Icon(
                            painter = painterResource(id = R.drawable.ic_treble_clef_christmas),
                            contentDescription = "Panel JAM",
                            tint = Color.Unspecified,           // ✅ NO tintar: conserva navideño
                            modifier = Modifier.size(38.dp)
                        )
                    },
                    isSelected = selectedItem == JamBottomItem.Special,
                    activeColor = activeColor,
                    inactiveColor = inactiveColor,
                    onClick = onSpecialClick
                )

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
        modifier = Modifier.clickable(onClick = onClick)
    ) {
        icon(tint)

        Box(
            modifier = Modifier
                .width(18.dp)
                .height(2.dp)
                .background(if (isSelected) activeColor else Color.Transparent)
        )
    }
}
