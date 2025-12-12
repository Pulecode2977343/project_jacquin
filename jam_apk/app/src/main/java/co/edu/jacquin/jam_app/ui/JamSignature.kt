package co.edu.jacquin.jam_app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.LibraryMusic
import androidx.compose.material.icons.outlined.MailOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

@Composable
fun JamSignature(
    modifier: Modifier = Modifier,
    showNavIcons: Boolean = false,
    onHomeClick: () -> Unit = {},
    onAboutClick: () -> Unit = {},
    onCoursesClick: () -> Unit = {},
    onContactClick: () -> Unit = {}
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        if (showNavIcons) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(24.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                // Home
                Icon(
                    imageVector = Icons.Outlined.Home,
                    contentDescription = "Inicio",
                    tint = Color(0xFF000000).copy(alpha = 0.40f),
                    modifier = Modifier
                        .size(20.dp)
                        .wrapContentSize()
                )

                // Nosotros
                Icon(
                    imageVector = Icons.Outlined.Info,
                    contentDescription = "Nosotros",
                    tint = Color(0xFF000000).copy(alpha = 0.40f),
                    modifier = Modifier
                        .size(20.dp)
                        .wrapContentSize()
                )

                // Cursos
                Icon(
                    imageVector = Icons.Outlined.LibraryMusic,
                    contentDescription = "Cursos",
                    tint = Color(0xFF000000).copy(alpha = 0.40f),
                    modifier = Modifier
                        .size(20.dp)
                        .wrapContentSize()
                )

                // Contáctanos
                Icon(
                    imageVector = Icons.Outlined.MailOutline,
                    contentDescription = "Contáctanos",
                    tint = Color(0xFF000000).copy(alpha = 0.40f),
                    modifier = Modifier
                        .size(20.dp)
                        .wrapContentSize()
                )
            }
        }

        Text(
            text = "Diseñado con el poder de Visionary Code Team",
            style = MaterialTheme.typography.labelSmall,
            color = Color(0xFF777777).copy(alpha = 0.35f), // humo/sombra
            textAlign = TextAlign.Center,
        )
    }
}
