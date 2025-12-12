package co.edu.jacquin.jam_app.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import co.edu.jacquin.jam_app.R

@Composable
fun JamHorizontalLogo(
    modifier: Modifier = Modifier,
    contentDescription: String = "Logo JAM – Jacquin Academia Musical"
) {
    Image(
        painter = painterResource(id = R.drawable.logo_hr_jam),
        contentDescription = contentDescription,
        modifier = modifier
            .height(40.dp),           // ajusta si lo quieres más grande
        contentScale = ContentScale.Fit
    )
}

@Composable
fun JamVerticalLogo(
    modifier: Modifier = Modifier,
    contentDescription: String = "Logo vertical JAM – Jacquin Academia Musical"
) {
    Image(
        painter = painterResource(id = R.drawable.logo_vr_jam), // 👈 AQUÍ usamos tu logo_vr_jam
        contentDescription = contentDescription,
        modifier = modifier
            .height(160.dp),         // tamaño para el splash, luego lo ajustamos si quieres
        contentScale = ContentScale.Fit
    )
}
