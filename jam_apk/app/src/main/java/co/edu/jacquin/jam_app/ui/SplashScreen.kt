@file:OptIn(ExperimentalAnimationGraphicsApi::class)

package co.edu.jacquin.jam_app.ui

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.graphics.ExperimentalAnimationGraphicsApi
import androidx.compose.animation.graphics.res.animatedVectorResource
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.lerp
import co.edu.jacquin.jam_app.R
import kotlinx.coroutines.delay
import android.graphics.drawable.Animatable
import android.widget.ImageView
import androidx.compose.ui.viewinterop.AndroidView



@Composable
fun SplashScreen() {
    val backgroundGradient = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF00346A),
            Color(0xFF000814)
        )
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundGradient)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Piano JAM (con halo y pulso suave) – lo bajas un poco
            JamPianoLogoAnimated(
                modifier = Modifier.offset(y = 30.dp)
            )

            // Letras del logo debajo del piano
            Spacer(modifier = Modifier.height(4.dp))
            JamWordmarkLogo()

            // Línea neón debajo del conjunto logo
            Spacer(modifier = Modifier.height(16.dp))
            JamSplashNeonLine()

            // Textos institucionales
            Text(
                text = "Jacquin Academia Musical",
                style = MaterialTheme.typography.titleMedium,
                color = Color(0xFFCCF9FF),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 16.dp)
            )

            Text(
                text = "Explora tu universo musical",
                style = MaterialTheme.typography.bodyMedium,
                color = Color(0xFFB0C4DE),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 8.dp)
            )
        }
    }
}

/**
 * Piano del logo con:
 * - Halo neón detrás
 * - Pulso suave de escala (latido)
 * (✅ sin AnimatedImageVector, solo Image estático)
 */
@Composable
fun JamPianoLogoAnimated(
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "piano_pulse_outer")

    // Pulso externo (escala “latido”)
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.98f,
        targetValue = 1.02f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1400, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "piano_scale"
    )

    // Halo neón detrás del piano
    val glowAlpha by infiniteTransition.animateFloat(
        initialValue = 0.20f,
        targetValue = 0.55f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1400, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "piano_glow"
    )

    Box(
        modifier = modifier.wrapContentSize(),
        contentAlignment = Alignment.Center
    ) {
        // Halo neón
        Box(
            modifier = Modifier
                .width(200.dp)
                .height(90.dp)
                .alpha(glowAlpha)
                .background(
                    brush = Brush.radialGradient(
                        colors = listOf(
                            Color(0x5500F0FF),
                            Color(0x2200F0FF),
                            Color.Transparent
                        )
                    ),
                    shape = RoundedCornerShape(24.dp)
                )
        )

        // 🔹 Piano ESTÁTICO (no animated-vector)
        Image(
            painter = painterResource(id = R.drawable.piano),
            contentDescription = "Piano JAM",
            modifier = Modifier
                .height(120.dp)
                .scale(scale)
        )
    }
}

/**
 * Letras del logo (wordmark) bajo el piano.
 * Asegúrate de que el recurso exista: jam_logo_wordmark en drawable.
 */
@Composable
fun JamWordmarkLogo(
    modifier: Modifier = Modifier
) {
    Image(
        painter = painterResource(id = R.drawable.jam_logo_wordmark),
        contentDescription = "Logo JAM Jacquin Academia Musical",
        modifier = modifier
            .height(40.dp)
    )
}

/**
 * Línea neón tipo cometa que cruza de lado a lado.
 */
@Composable
fun JamSplashNeonLine(
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "splash_line")

    val progress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 900, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "neon_progress"
    )

    BoxWithConstraints(
        modifier = modifier
            .width(180.dp)
            .height(3.dp)
    ) {
        val trackWidth = maxWidth
        val segmentWidth = trackWidth * 0.45f

        val start = -segmentWidth
        val end = trackWidth
        val offsetX = lerp(start, end, progress)

        // Cometa neón
        Box(
            modifier = Modifier
                .offset(x = offsetX)
                .width(segmentWidth)
                .fillMaxSize()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            Color.Transparent,
                            Color(0x6600F0FF),
                            Color(0xFFFFA94D)
                        )
                    )
                )
        )
    }
}
