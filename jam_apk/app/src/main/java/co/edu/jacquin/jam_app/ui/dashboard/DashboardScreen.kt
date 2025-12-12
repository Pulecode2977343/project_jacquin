package co.edu.jacquin.jam_app.ui.dashboard

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.outlined.Logout
import androidx.compose.material.icons.outlined.PersonOutline
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import co.edu.jacquin.jam_app.domain.UserRole
import co.edu.jacquin.jam_app.ui.JamBottomItem
import co.edu.jacquin.jam_app.ui.JamHorizontalLogo
import co.edu.jacquin.jam_app.ui.JamSignature

@Composable
fun DashboardScreen(
    userRole: UserRole,
    userName: String,
    onBackClick: () -> Unit,

    // Navegación interna del dashboard (pantallas por rol)
    onNavigateToRoute: (String) -> Unit = {},

    // Cuenta
    onLogoutClick: () -> Unit = {},
    onProfileClick: () -> Unit = {},
    onSecurityClick: () -> Unit = {},

    // Público (enfoque 1: NO cierra sesión)
    onGoHome: () -> Unit = {},
    onGoAbout: () -> Unit = {},
    onGoCourses: () -> Unit = {},   // oferta pública
    onGoContact: () -> Unit = {},
) {
    val backgroundGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF00346A), Color(0xFF000814))
    )

    val glassCard = Brush.verticalGradient(
        colors = listOf(Color(0x1FFFFFFF), Color(0x05FFFFFF))
    )
    val glassBorder = Color.White.copy(alpha = 0.18f)

    val roleTitle = userRole.label

    var drawerOpen by remember { mutableStateOf(false) }
    BackHandler(enabled = drawerOpen) { drawerOpen = false }

    val roleSections by remember(userRole) {
        derivedStateOf {
            try {
                DashboardSection.sectionsFor(userRole)
            } catch (_: Throwable) {
                DashboardSection.entries.filter { userRole in it.allowedRoles }
            }
        }
    }

    Scaffold(
        containerColor = Color.Transparent,
        bottomBar = {
            JamSignature(
                showNavIcons = true,
                selectedItem = JamBottomItem.Special,
                onHomeClick = onGoHome,
                onAboutClick = onGoAbout,
                onCoursesClick = onGoCourses,
                onContactClick = onGoContact,
                onSpecialClick = { /* ya estás en panel */ }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(backgroundGradient)
                .padding(innerPadding)
        ) {
            // =========================
            // HEADER
            // =========================
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp)
                    .padding(top = 24.dp)
                    .align(Alignment.TopCenter)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    IconButton(onClick = onBackClick, modifier = Modifier.size(40.dp)) {
                        Icon(
                            imageVector = Icons.Filled.ArrowBack,
                            contentDescription = "Volver",
                            tint = Color(0xFFE0ECFF)
                        )
                    }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        JamHorizontalLogo()
                    }

                    JamUserAvatar(
                        userName = userName,
                        onClick = { drawerOpen = true }
                    )
                }
            }

            // =========================
            // CONTENIDO
            // =========================
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(top = 96.dp)
                    .padding(horizontal = 24.dp)
                    .padding(bottom = 92.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text(
                    text = "Dashboard · $roleTitle",
                    color = Color(0xFFCCF9FF),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold
                )

                Text(
                    text = userName,
                    color = Color.White,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                Text(
                    text = "Elige una sección para empezar.",
                    color = Color(0xFFB0C4DE),
                    style = MaterialTheme.typography.bodyMedium
                )

                Spacer(modifier = Modifier.height(4.dp))

                roleSections.forEach { section ->
                    JamDashboardGlassItem(
                        title = section.label,
                        subtitle = section.subtitle,
                        icon = section.icon,
                        glassGradient = glassCard,
                        glassBorder = glassBorder,
                        onClick = { onNavigateToRoute(section.route) }
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))
            }

            // =========================
            // DRAWER (más alto con offsets guardados)
            // =========================
            JamRightDrawer(
                open = drawerOpen,
                onDismiss = { drawerOpen = false },
                glassBorder = glassBorder,
                topOffset = 80.dp,     // ✅ guardado
                bottomOffset = 40.dp,  // ✅ guardado
                widthFraction = 0.84f
            ) {
                // Header drawer
                Row(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    JamUserAvatar(userName = userName, size = 44.dp, onClick = {})
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = userName,
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(text = roleTitle, color = Color(0xFFB0C4DE), fontSize = 12.sp)
                    }
                }

                // ✅ Menú por rol (Teacher listo)
                when (userRole) {
                    UserRole.Teacher -> {
                        DrawerTitle("Cuenta")

                        JamDrawerItem("Mi perfil", Icons.Outlined.PersonOutline) {
                            drawerOpen = false
                            onProfileClick()
                        }

                        JamDrawerItem("Seguridad", Icons.Outlined.Settings) {
                            drawerOpen = false
                            onSecurityClick()
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        DrawerTitle("Profesor")

                        JamDrawerItem(
                            label = DashboardSection.TEACHER_GROUPS.label,
                            icon = DashboardSection.TEACHER_GROUPS.icon
                        ) {
                            drawerOpen = false
                            onNavigateToRoute(DashboardSection.TEACHER_GROUPS.route)
                        }

                        JamDrawerItem(
                            label = DashboardSection.TEACHER_TASKS.label,
                            icon = DashboardSection.TEACHER_TASKS.icon
                        ) {
                            drawerOpen = false
                            onNavigateToRoute(DashboardSection.TEACHER_TASKS.route)
                        }

                        JamDrawerItem(
                            label = DashboardSection.TEACHER_MESSAGES.label,
                            icon = DashboardSection.TEACHER_MESSAGES.icon
                        ) {
                            drawerOpen = false
                            onNavigateToRoute(DashboardSection.TEACHER_MESSAGES.route)
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        DrawerTitle("Explorar")

                        // Enfoque 1: navegar a oferta pública sin cerrar sesión
                        JamDrawerItem("Oferta de cursos", DashboardSection.TEACHER_TASKS.icon) {
                            drawerOpen = false
                            onGoCourses()
                        }

                        JamDrawerItem("Contáctanos", DashboardSection.TEACHER_MESSAGES.icon) {
                            drawerOpen = false
                            onGoContact()
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        JamDrawerItem(
                            label = "Cerrar sesión",
                            icon = Icons.Outlined.Logout,
                            isDanger = true
                        ) {
                            drawerOpen = false
                            onLogoutClick()
                        }
                    }

                    UserRole.Admin -> {
                        DrawerTitle("Cuenta")

                        JamDrawerItem("Mi perfil", Icons.Outlined.PersonOutline) {
                            drawerOpen = false; onProfileClick()
                        }
                        JamDrawerItem("Seguridad", Icons.Outlined.Settings) {
                            drawerOpen = false; onSecurityClick()
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        DrawerTitle("Administración")

                        JamDrawerItem(
                            label = DashboardSection.ADMIN_METRICS.label,
                            icon = DashboardSection.ADMIN_METRICS.icon
                        ) {
                            drawerOpen = false
                            onNavigateToRoute(DashboardSection.ADMIN_METRICS.route)
                        }

                        JamDrawerItem(
                            label = DashboardSection.ADMIN_USERS.label,
                            icon = DashboardSection.ADMIN_USERS.icon
                        ) {
                            drawerOpen = false
                            onNavigateToRoute(DashboardSection.ADMIN_USERS.route)
                        }

                        JamDrawerItem(
                            label = DashboardSection.ADMIN_COURSES.label,
                            icon = DashboardSection.ADMIN_COURSES.icon
                        ) {
                            drawerOpen = false
                            onNavigateToRoute(DashboardSection.ADMIN_COURSES.route)
                        }

                        JamDrawerItem(
                            label = DashboardSection.ADMIN_CONTACTS.label,
                            icon = DashboardSection.ADMIN_CONTACTS.icon
                        ) {
                            drawerOpen = false
                            onNavigateToRoute(DashboardSection.ADMIN_CONTACTS.route)
                        }

                        JamDrawerItem(
                            label = DashboardSection.ADMIN_MESSAGES.label,
                            icon = DashboardSection.ADMIN_MESSAGES.icon
                        ) {
                            drawerOpen = false
                            onNavigateToRoute(DashboardSection.ADMIN_MESSAGES.route)
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        JamDrawerItem(
                            label = "Cerrar sesión",
                            icon = Icons.Outlined.Logout,
                            isDanger = true
                        ) {
                            drawerOpen = false; onLogoutClick()
                        }
                    }

                    UserRole.Student -> {
                        DrawerTitle("Cuenta")

                        JamDrawerItem("Mi perfil", Icons.Outlined.PersonOutline) {
                            drawerOpen = false; onProfileClick()
                        }
                        JamDrawerItem("Cambiar clave", Icons.Outlined.Settings) {
                            drawerOpen = false; onSecurityClick()
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        DrawerTitle("Estudiante")

                        JamDrawerItem(
                            label = DashboardSection.STUDENT_COURSES.label,
                            icon = DashboardSection.STUDENT_COURSES.icon
                        ) {
                            drawerOpen = false
                            onNavigateToRoute(DashboardSection.STUDENT_COURSES.route)
                        }

                        JamDrawerItem(
                            label = DashboardSection.STUDENT_PROGRESS.label,
                            icon = DashboardSection.STUDENT_PROGRESS.icon
                        ) {
                            drawerOpen = false
                            onNavigateToRoute(DashboardSection.STUDENT_PROGRESS.route)
                        }

                        JamDrawerItem(
                            label = DashboardSection.STUDENT_MESSAGES.label,
                            icon = DashboardSection.STUDENT_MESSAGES.icon
                        ) {
                            drawerOpen = false
                            onNavigateToRoute(DashboardSection.STUDENT_MESSAGES.route)
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        JamDrawerItem(
                            label = "Cerrar sesión",
                            icon = Icons.Outlined.Logout,
                            isDanger = true
                        ) {
                            drawerOpen = false; onLogoutClick()
                        }
                    }
                }
            }
        }
    }
}

/* =========================
   Drawer (pegado a la derecha, sin margen)
   ========================= */

@Composable
private fun JamRightDrawer(
    open: Boolean,
    onDismiss: () -> Unit,
    glassBorder: Color,
    topOffset: Dp,
    bottomOffset: Dp,
    widthFraction: Float,
    content: @Composable ColumnScope.() -> Unit
) {
    val interaction = remember { MutableInteractionSource() }
    val shape = RoundedCornerShape(topStart = 28.dp, bottomStart = 28.dp)

    AnimatedVisibility(
        visible = open,
        enter = fadeIn(tween(160)),
        exit = fadeOut(tween(140))
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.82f))
                .clickable(interactionSource = interaction, indication = null) { onDismiss() }
        )
    }

    AnimatedVisibility(
        visible = open,
        enter = slideInHorizontally(tween(220)) { it } + fadeIn(tween(220)),
        exit = slideOutHorizontally(tween(180)) { it } + fadeOut(tween(150))
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(top = topOffset, bottom = bottomOffset, end = 0.dp) // ✅ pegado derecha
            ) {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .fillMaxWidth(widthFraction)
                        .fillMaxHeight()
                        .clip(shape)
                        .border(1.dp, glassBorder.copy(alpha = 0.22f), shape)
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color(0xF20A1C33), Color(0xF2020B18))
                            )
                        )
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(
                                        Color.White.copy(alpha = 0.10f),
                                        Color.White.copy(alpha = 0.04f)
                                    )
                                )
                            )
                            .border(0.5.dp, Color.White.copy(alpha = 0.16f), shape)
                    )

                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(PaddingValues(horizontal = 16.dp, vertical = 16.dp))
                            .verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        content()
                    }
                }
            }
        }
    }
}

@Composable
private fun DrawerTitle(text: String) {
    Text(
        text = text,
        color = Color(0xFFCCF9FF),
        fontSize = 12.sp,
        modifier = Modifier.alpha(0.9f)
    )
    Spacer(modifier = Modifier.height(8.dp))
}

/* =========================
   Drawer item (onClick al final)
   ========================= */

@Composable
private fun JamDrawerItem(
    label: String,
    icon: ImageVector,
    isDanger: Boolean = false,
    onClick: () -> Unit
) {
    val tint = if (isDanger) Color(0xFFFF6B81) else Color(0xFFCCF9FF)

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Color.White.copy(alpha = if (isDanger) 0.10f else 0.08f))
            .border(1.dp, Color.White.copy(alpha = 0.16f), RoundedCornerShape(14.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onClick() }
            .padding(horizontal = 12.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = tint,
            modifier = Modifier.size(20.dp)
        )
        Text(
            text = label,
            color = if (isDanger) Color(0xFFFFA3B0) else Color.White,
            fontSize = 14.sp,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

/* =========================
   Avatar
   ========================= */

@Composable
private fun JamUserAvatar(
    userName: String,
    size: Dp = 40.dp,
    onClick: () -> Unit
) {
    val initials = remember(userName) { initialsFromName(userName) }

    val ring = Brush.horizontalGradient(
        colors = listOf(Color(0xCCFEA36A), Color(0xCCFF6B6B))
    )

    Box(
        modifier = Modifier
            .size(size)
            .clip(CircleShape)
            .background(Color.White.copy(alpha = 0.10f))
            .border(1.dp, Color.White.copy(alpha = 0.22f), CircleShape)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(2.dp)
                .clip(CircleShape)
                .background(ring)
                .alpha(0.28f)
        )

        Text(
            text = initials,
            color = Color.White,
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp
        )
    }
}

private fun initialsFromName(name: String): String {
    val parts = name.trim().split(" ").filter { it.isNotBlank() }
    return when {
        parts.isEmpty() -> "U"
        parts.size == 1 -> parts[0].take(1).uppercase()
        else -> (parts[0].take(1) + parts[1].take(1)).uppercase()
    }
}

/* =========================
   Glass card (sección)
   ========================= */

@Composable
private fun JamDashboardGlassItem(
    title: String,
    subtitle: String,
    icon: ImageVector,
    glassGradient: Brush,
    glassBorder: Color,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(22.dp))
            .background(glassGradient)
            .border(1.dp, glassBorder, RoundedCornerShape(22.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            Color(0xFF00F0FF).copy(alpha = 0.62f),
                            Color(0x0000F0FF)
                        )
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(imageVector = icon, contentDescription = title, tint = Color(0xFF00346A))
        }

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                color = Color.White,
                fontWeight = FontWeight.SemiBold,
                fontSize = 16.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = subtitle,
                color = Color(0xFFB0C4DE),
                fontSize = 12.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}
