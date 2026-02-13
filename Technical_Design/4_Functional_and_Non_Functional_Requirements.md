# Requisitos Funcionales y No Funcionales - Academia Musical JACQUIN

Este documento cataloga las capacidades técnicas y restricciones de calidad del sistema.

## 1. Requisitos Funcionales (RF)

| ID | Nombre | Descripción | Prioridad |
| :--- | :--- | :--- | :--- |
| **RF-01** | Autenticación Segura | El sistema debe permitir el ingreso diferenciado para Estudiantes, Docentes y Admins. | Alta |
| **RF-02** | Inscripción en Línea | Los estudiantes deben poder solicitar cupos en cursos específicos desde su panel. | Alta |
| **RF-03** | Gestión de Horarios | El sistema debe permitir asignar múltiples horas y días a una única inscripción. | Media |
| **RF-04** | Entrega de Tareas | Los alumnos deben poder subir enlaces o descripciones de sus actividades académicas. | Media |
| **RF-05** | Publicación de Eventos | El Administrador debe poder crear eventos con imágenes que se vean en la página principal. | Alta |
| **RF-06** | Control de Inventario | El sistema debe permitir trackear el estado de mantenimiento de los pianos y su ubicación. | Baja |
| **RF-07** | Calificaciones | Los docentes deben poder asignar notas y feedback a las entregas de los alumnos. | Alta |
| **RF-08** | Recuperación de Cuenta | Envío de correos para restablecer contraseñas olvidadas. | Media |

## 2. Requisitos No Funcionales (RNF)

| ID | Categoría | Descripción |
| :--- | :--- | :--- |
| **RNF-01** | **Seguridad** | Las contraseñas deben estar cifradas mediante algoritmos de hash (BCRYPT) en la BD. |
| **RNF-02** | **Disponibilidad** | El sistema debe estar accesible vía Web (XAMPP + Zrok para exposición externa). |
| **RNF-03** | **Usabilidad** | La interfaz debe seguir lineamientos de diseño moderno (bordes de 18px, fuente Inter, modo oscuro/claro premium). |
| **RNF-04** | **Rendimiento** | Las consultas a la base de datos deben resolverse en menos de 500ms para asegurar fluidez. |
| **RNF-05** | **Escalabilidad** | La API debe estar estructurada de forma modular para permitir añadir nuevos módulos (ej. Pagos) sin afectar lo existente. |
| **RNF-06** | **Compatibilidad** | La plataforma debe ser totalmente responsiva (Mobile First) para acceso desde tablets y celulares. |
| **RNF-07** | **Integridad** | El sistema debe validar colisiones de horarios para evitar que un alumno se inscriba en dos clases a la misma hora. |
