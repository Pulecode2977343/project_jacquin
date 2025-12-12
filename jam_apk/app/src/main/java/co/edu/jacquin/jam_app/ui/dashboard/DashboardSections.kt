package co.edu.jacquin.jam_app.ui.dashboard

import co.edu.jacquin.jam_app.domain.UserRole

/**
 * Secciones lógicas de dashboard según el rol.
 *
 * No dependemos de recursos (R.string / R.drawable) todavía
 * para evitar errores mientras maquetamos la navegación.
 */
enum class DashboardSection(
    val route: String,
    val label: String,
    val allowedRoles: Set<UserRole>
) {
    // --- Estudiante ---
    STUDENT_COURSES(
        route = "student/courses",
        label = "Mis cursos",
        allowedRoles = setOf(UserRole.STUDENT)
    ),
    STUDENT_PROGRESS(
        route = "student/progress",
        label = "Mi progreso",
        allowedRoles = setOf(UserRole.STUDENT)
    ),
    STUDENT_MESSAGES(
        route = "student/messages",
        label = "Mensajes del profe",
        allowedRoles = setOf(UserRole.STUDENT)
    ),

    // --- Profesor ---
    TEACHER_GROUPS(
        route = "teacher/groups",
        label = "Mis grupos",
        allowedRoles = setOf(UserRole.TEACHER)
    ),
    TEACHER_TASKS(
        route = "teacher/tasks",
        label = "Tareas publicadas",
        allowedRoles = setOf(UserRole.TEACHER)
    ),
    TEACHER_MESSAGES(
        route = "teacher/messages",
        label = "Mensajes de alumnos",
        allowedRoles = setOf(UserRole.TEACHER)
    ),

    // --- Admin ---
    ADMIN_METRICS(
        route = "admin/metrics",
        label = "Métricas",
        allowedRoles = setOf(UserRole.ADMIN)
    ),
    ADMIN_USERS(
        route = "admin/users",
        label = "Gestión de usuarios",
        allowedRoles = setOf(UserRole.ADMIN)
    ),
    ADMIN_COURSES(
        route = "admin/courses",
        label = "Gestión de cursos",
        allowedRoles = setOf(UserRole.ADMIN)
    ),
    ADMIN_CONTACTS(
        route = "admin/contacts",
        label = "Contactos (Contáctanos)",
        allowedRoles = setOf(UserRole.ADMIN)
    ),
    ADMIN_MESSAGES(
        route = "admin/messages",
        label = "Mensajes a estudiantes",
        allowedRoles = setOf(UserRole.ADMIN)
    );
}
