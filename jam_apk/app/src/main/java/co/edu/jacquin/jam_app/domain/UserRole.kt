package co.edu.jacquin.jam_app.domain

/**
 * Rol de usuario según la tabla `rol` de la BD:
 * 1 = Admin
 * 2 = Profesor
 * 3 = Estudiante
 */
enum class UserRole(val label: String) {
    Admin("Administrador"),
    Teacher("Profesor"),
    Student("Estudiante")
}
