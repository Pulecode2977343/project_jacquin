package co.edu.jacquin.jam_app.ui.dashboard

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Analytics
import androidx.compose.material.icons.outlined.AutoGraph
import androidx.compose.material.icons.outlined.Campaign
import androidx.compose.material.icons.outlined.ContactMail
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.LibraryMusic
import androidx.compose.material.icons.outlined.ManageAccounts
import androidx.compose.material.icons.outlined.MarkEmailUnread
import androidx.compose.material.icons.outlined.School
import androidx.compose.material.icons.outlined.TaskAlt
import androidx.compose.ui.graphics.vector.ImageVector
import co.edu.jacquin.jam_app.domain.UserRole

enum class DashboardSection(
    val route: String,
    val label: String,
    val subtitle: String,
    val icon: ImageVector,
    val allowedRoles: Set<UserRole>
) {
    // -----------------------
    // Student
    // -----------------------
    STUDENT_COURSES(
        route = "student/courses",
        label = "Mis cursos",
        subtitle = "Accede a tus clases, horarios y materiales",
        icon = Icons.Outlined.LibraryMusic,
        allowedRoles = setOf(UserRole.Student)
    ),
    STUDENT_PROGRESS(
        route = "student/progress",
        label = "Progreso",
        subtitle = "Mira avances, asistencia y logros",
        icon = Icons.Outlined.AutoGraph,
        allowedRoles = setOf(UserRole.Student)
    ),
    STUDENT_MESSAGES(
        route = "student/messages",
        label = "Mensajes",
        subtitle = "Comunidad, profesores y avisos",
        icon = Icons.Outlined.MarkEmailUnread,
        allowedRoles = setOf(UserRole.Student)
    ),

    // -----------------------
    // Teacher
    // -----------------------
    TEACHER_GROUPS(
        route = "teacher/groups",
        label = "Grupos",
        subtitle = "Gestiona estudiantes y grupos",
        icon = Icons.Outlined.Groups,
        allowedRoles = setOf(UserRole.Teacher)
    ),
    TEACHER_TASKS(
        route = "teacher/tasks",
        label = "Tareas",
        subtitle = "Publica tareas, recursos y materiales",
        icon = Icons.Outlined.TaskAlt,
        allowedRoles = setOf(UserRole.Teacher)
    ),
    TEACHER_MESSAGES(
        route = "teacher/messages",
        label = "Mensajes",
        subtitle = "Mensajes con estudiantes",
        icon = Icons.Outlined.MarkEmailUnread,
        allowedRoles = setOf(UserRole.Teacher)
    ),

    // -----------------------
    // Admin
    // -----------------------
    ADMIN_METRICS(
        route = "admin/metrics",
        label = "Métricas",
        subtitle = "KPIs y actividad general",
        icon = Icons.Outlined.Analytics,
        allowedRoles = setOf(UserRole.Admin)
    ),
    ADMIN_USERS(
        route = "admin/users",
        label = "Usuarios",
        subtitle = "Roles, permisos y control de acceso",
        icon = Icons.Outlined.ManageAccounts,
        allowedRoles = setOf(UserRole.Admin)
    ),
    ADMIN_COURSES(
        route = "admin/courses",
        label = "Cursos",
        subtitle = "Crear y administrar cursos",
        icon = Icons.Outlined.School,
        allowedRoles = setOf(UserRole.Admin)
    ),
    ADMIN_CONTACTS(
        route = "admin/contacts",
        label = "Contáctanos",
        subtitle = "Bandeja de mensajes públicos",
        icon = Icons.Outlined.ContactMail,
        allowedRoles = setOf(UserRole.Admin)
    ),
    ADMIN_MESSAGES(
        route = "admin/messages",
        label = "Comunicados",
        subtitle = "Enviar anuncios a estudiantes",
        icon = Icons.Outlined.Campaign,
        allowedRoles = setOf(UserRole.Admin)
    ),

    // ✅ NUEVO: Eventos + Noticias + Reels
    ADMIN_EVENTS_NEWS(
        route = "admin/events",
        label = "Eventos y noticias",
        subtitle = "Publica reels, eventos y comunicados estilo feed",
        icon = Icons.Outlined.MarkEmailUnread,
        allowedRoles = setOf(UserRole.Admin)
    );

    companion object {
        fun sectionsFor(role: UserRole): List<DashboardSection> =
            entries.filter { role in it.allowedRoles }
    }
}
