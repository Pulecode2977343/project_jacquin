package co.edu.jacquin.jam_app.ui.common

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.ExperimentalAnimationApi
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.core.tween
import androidx.compose.runtime.*

@OptIn(ExperimentalAnimationApi::class)
@Composable
fun JamScreenTransition(
    content: @Composable () -> Unit
) {
    var visible by remember { mutableStateOf(false) }

    // Cuando la pantalla entra en composición, activamos la animación
    LaunchedEffect(Unit) {
        visible = true
    }

    AnimatedVisibility(
        visible = visible,
        enter = fadeIn(
            animationSpec = tween(
                durationMillis = 450
            )
        ) + slideInVertically(
            // Entra desde un poquito abajo
            initialOffsetY = { fullHeight -> fullHeight / 8 }
        ),
        exit = fadeOut(
            animationSpec = tween(
                durationMillis = 300
            )
        ) + slideOutVertically(
            // Se va un poquito hacia arriba
            targetOffsetY = { fullHeight -> -fullHeight / 10 }
        )
    ) {
        content()
    }
}
