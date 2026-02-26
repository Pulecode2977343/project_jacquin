/**
 * API Service Client
 * Centralizes all communication with the backend API.
 * Handles Authentication, Token Management, and Error Parsing.
 */

var API_CONFIG = {
    get BASE_URL() {
        const path = window.location.pathname;
        const host = window.location.hostname;
        const url = host === 'localhost' || host === '127.0.0.1' || host.includes('share.zrok.io')
            ? "/jacquin_api/"
            : (path.includes('/pages/') ? "../../jacquin_api/" : "./jacquin_api/");

        console.log(`[ApiService] Host: ${host} | Base URL: ${url}`);
        return url;
    },

    HEADERS: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
};

var ApiService = {
    get BASE_URL() {
        return API_CONFIG.BASE_URL;
    },

    /**
     * Centralized response handler to detect 401 Unauthorized errors
     * and redirect to login automatically.
     */
    async handleResponse(response) {
        let text = "";
        try {
            text = await response.text();
        } catch (e) {
            return { success: false, message: "No se pudo leer la respuesta del servidor." };
        }

        if (response.status === 401) {
            console.warn("[ApiService] Sesión expirada o no autorizada (401).");
            localStorage.removeItem("jam_user_session");
            const path = window.location.pathname;
            if (!path.includes('login.html') && !path.includes('index.html')) {
                window.location.href = "login.html?error=session_expired";
            }
            try {
                const err = JSON.parse(text);
                return { success: false, message: err.message || "Sesión expirada", unauthorized: true };
            } catch (e) {
                return { success: false, message: "Sesión expirada", unauthorized: true };
            }
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            // Si no es JSON, devolvemos el texto para debugging (truncado)
            return {
                success: false,
                message: `Respuesta no válida del servidor (Status ${response.status}): ` + text.substring(0, 100)
            };
        }
    },

    /**
     * Standardizes avatar URL generation across the legacy application.
     */
    getAvatarUrl(avatarPath) {
        if (!avatarPath || avatarPath.trim() === '') {
            return 'assets/images/avatars/default_avatar.svg';
        }

        if (avatarPath.startsWith('http')) {
            return avatarPath;
        }

        // Clean filename from typical prefixes
        let filename = avatarPath;
        const prefixesToRemove = [
            'web_page/pages/uploads/avatars/',
            'web_page/pages/uploads/',
            'public/uploads/avatars/',
            'uploads/avatars/',
            'public/'
        ];

        prefixesToRemove.forEach(prefix => {
            if (filename.includes(prefix)) filename = filename.replace(prefix, '');
        });

        if (filename.startsWith('/')) filename = filename.substring(1);

        // Standard static structure for the backend
        return `${this.BASE_URL}public/uploads/avatars/${filename}`;
    },

    /**
     * Helper to format time to 12h AM/PM
     * @param {string} timeString - "HH:mm:ss" or "HH:mm"
     * @returns {string} - "h:mm AM/PM"
     */
    formatTime(timeString) {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    },

    /**
     * Auth Methods
     */
    async login(email, password) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}login.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ email, password })
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error de conexión en Login." };
        }
    },

    async register(userData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}register.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(userData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error de conexión en Registro." };
        }
    },

    // --- PASSWORD RECOVERY METHODS ---
    async requestRecoveryCode(email) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}recover_request.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ email })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Recovery Request Error:", error);
            throw error;
        }
    },

    async verifyRecoveryCode(email, code) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}recover_verify.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ email, code })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Recovery Verify Error:", error);
            throw error;
        }
    },

    async resetPassword(email, code, newPassword) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}recover_reset.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ email, code, new_password: newPassword })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Reset Password Error:", error);
            throw error;
        }
    },

    async logout() {
        localStorage.removeItem("jam_user_session");
        window.location.href = "index.html";
    },

    /**
     * Get All Users (Admin Only)
     */
    async getUsers() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_get_users.php?t=${Date.now()}`, {
                method: "GET",
                headers: API_CONFIG.HEADERS,
                credentials: 'include'
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error("Networking Error:", error);
            return { success: false, message: `Error de red: ${error.message}` };
        }
    },

    async getTeachers() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_get_teachers.php`, {
                method: "GET",
                headers: API_CONFIG.HEADERS,
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error cargando docentes." };
        }
    },

    async getCourses() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_courses.php`, {
                method: "GET",
                headers: API_CONFIG.HEADERS
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error obteniendo cursos." };
        }
    },

    async getSchedules(courseId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_schedules.php?course_id=${courseId}`, {
                method: "GET",
                headers: API_CONFIG.HEADERS
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error obteniendo horarios." };
        }
    },

    async getUserDetails(userId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_user_details.php?id=${userId}&t=${Date.now()}`, {
                method: "GET",
                headers: API_CONFIG.HEADERS
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error obteniendo detalles." };
        }
    },

    async uploadAvatar(userId, file) {
        try {
            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('avatar_file', file);

            const response = await fetch(`${API_CONFIG.BASE_URL}admin_upload_avatar.php`, {
                method: "POST",
                body: formData
            });

            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error de red subiendo foto." };
        }
    },

    async enrollStudent(studentId, courseId, scheduleIdOrIds) {
        const payload = {
            student_id: studentId,
            course_id: courseId
        };

        if (Array.isArray(scheduleIdOrIds)) {
            payload.schedule_ids = scheduleIdOrIds;
        } else {
            payload.schedule_id = scheduleIdOrIds;
        }

        try {
            const response = await fetch(API_CONFIG.BASE_URL + 'admin_enroll_student.php', {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Error enrolling student:", error);
            return { success: false, message: "Error de conexión" };
        }
    },

    async getPendingEnrollments() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_get_pending_enrollments.php`, {
                headers: API_CONFIG.HEADERS,
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error obteniendo solicitudes." };
        }
    },

    async handleEnrollment(idEnrollment, action) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_handle_enrollment.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ id_enrollment: idEnrollment, action }),
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error procesando solicitud." };
        }
    },

    async requestEnrollment(studentId, courseId, scheduleId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}request_enrollment.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ student_id: studentId, course_id: courseId, schedule_id: scheduleId })
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error solicitando inscripción." };
        }
    },

    async unenrollStudent(enrollmentId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_unenroll_student.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ id_enrollment: enrollmentId }),
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error al eliminar inscripción." };
        }
    },

    async assignTeacher(teacherId, scheduleId) {
        try {
            const payload = { schedule_id: scheduleId };
            if (Array.isArray(teacherId)) {
                payload.teacher_ids = teacherId;
            } else {
                payload.teacher_id = teacherId;
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}admin_assign_teacher.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error asignando docente." };
        }
    },

    async unassignSingleTeacher(scheduleId, teacherId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_assign_teacher.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ action: 'remove_single', schedule_id: scheduleId, teacher_id: teacherId }),
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error desasignando docente." };
        }
    },

    async unassignTeacherFromCourse(teacherId, courseId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_unassign_teacher.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ teacher_id: teacherId, course_id: courseId })
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error desasignando docente." };
        }
    },

    async updateUserRole(id_usuario, id_rol) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_update_role.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ id_usuario: parseInt(id_usuario), id_rol: parseInt(id_rol) })
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error actualizando rol." };
        }
    },

    async deleteUser(id_usuario) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_delete_user.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ id_usuario: parseInt(id_usuario) })
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error eliminando usuario." };
        }
    },

    async updateProfile(id_usuario, full_name, n_phone) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}update_profile.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ id_usuario, full_name, n_phone })
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error actualizando perfil." };
        }
    },

    async changePassword(id_usuario, currentPassword, newPassword) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}change_password.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ id_usuario, currentPassword, newPassword })
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error actualizando contraseña." };
        }
    },

    async getInventory() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_inventory_get.php`, {
                headers: API_CONFIG.HEADERS
            });
            return await this.handleResponse(response);
        } catch (error) {
            return [];
        }
    },

    async addInventoryItem(itemData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_inventory_create.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(itemData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error de conexión." };
        }
    },

    async deleteInventoryItem(id_item) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_inventory_delete.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ id_item })
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error eliminando ítem." };
        }
    },

    async updateHeroImage(file, cropData = null) {
        const formData = new FormData();
        formData.append('hero_image', file);

        if (cropData) {
            formData.append('crop_x', Math.round(cropData.crop_x));
            formData.append('crop_y', Math.round(cropData.crop_y));
            formData.append('crop_w', Math.round(cropData.crop_w));
            formData.append('crop_h', Math.round(cropData.crop_h));
        }

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_upload_hero.php`, {
                method: 'POST',
                body: formData
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Error updates hero:", error);
            return { success: false, message: error.message };
        }
    },

    async updateCourseTeacher(courseId, teacherId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_update_course_teacher.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_id: courseId, teacher_id: teacherId }),
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Error updating course teacher:", error);
            return { success: false, message: "Error de conexión" };
        }
    },

    async adminUpdateUserFull(userData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_update_user_full.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Error updating user:", error);
            return { success: false, message: "Error de conexión" };
        }
    },

    async deleteCourse(courseId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_delete_course.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: courseId }),
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Error deleting course:", error);
            return { success: false, message: "Error de conexión" };
        }
    },

    async getFullCourseDetails(courseId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_get_course_full_details.php?course_id=${courseId}`, {
                headers: API_CONFIG.HEADERS,
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error obteniendo detalles del curso." };
        }
    },

    async getAcademicStats() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_get_academic_stats.php`, {
                headers: API_CONFIG.HEADERS,
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error obteniendo estadísticas académicas." };
        }
    },

    async getAcademicOverview() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_academic_overview.php`, {
                headers: API_CONFIG.HEADERS,
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error obteniendo vista general académica." };
        }
    },

    async getScheduleStudents(scheduleId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_academic_data.php?action=get_schedule_students&schedule_id=${encodeURIComponent(scheduleId)}`, {
                headers: API_CONFIG.HEADERS,
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error obteniendo estudiantes del horario." };
        }
    },

    async updateSchedule(scheduleData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_update_course_schedule.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(scheduleData),
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error actualizando horario." };
        }
    },

    async updateCourse(courseData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_update_course.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(courseData),
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error de conexión." };
        }
    },

    async createCourse(courseData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}create_course.php`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(courseData),
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error al crear curso." };
        }
    },

    saveSession(user) {
        localStorage.setItem("jam_user_session", JSON.stringify(user));
    },

    getSession() {
        const session = localStorage.getItem("jam_user_session");
        return session ? JSON.parse(session) : null;
    },

    isAuthenticated() {
        return !!this.getSession();
    },

    async getEvents() {
        try {
            const url = `${API_CONFIG.BASE_URL}get_events.php`;
            const response = await fetch(url);
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Error fetching events:", error);
            return { success: false, message: error.message };
        }
    },

    async createEvent(formData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_create_event.php`, {
                method: 'POST',
                body: formData
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Error creating event:", error);
            return { success: false, message: error.message };
        }
    },

    async updateEvent(eventId, formData) {
        try {
            formData.append('event_id', eventId);
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_update_event.php`, {
                method: 'POST',
                body: formData
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Error updating event:", error);
            return { success: false, message: error.message };
        }
    },

    async deleteEvent(eventId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_delete_event.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event_id: eventId })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Error deleting event:", error);
            return { success: false, message: error.message };
        }
    },

    async requestTicket(data) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}request_ticket.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(data)
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error solicitando entrada." };
        }
    },

    async sendContactMessage(formData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}contact.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(formData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("Error sending message:", error);
            return { success: false, message: "Error de conexión." };
        }
    },

    async getEnrollmentSchedules(enrollmentId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_enrollment_schedules.php?enrollment_id=${enrollmentId}`, {
                headers: API_CONFIG.HEADERS
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error obteniendo horarios de inscripción." };
        }
    },

    async assignSchedules(enrollmentId, scheduleIds) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_assign_schedules.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ enrollment_id: enrollmentId, schedule_ids: scheduleIds }),
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error asignando horarios." };
        }
    },

    async addScheduleToEnrollment(enrollmentId, scheduleId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_add_schedule_to_enrollment.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ enrollment_id: enrollmentId, schedule_id: scheduleId })
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error agregando horario." };
        }
    },

    async removeScheduleFromEnrollment(enrollmentId, scheduleId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_remove_schedule_from_enrollment.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ enrollment_id: enrollmentId, schedule_id: scheduleId })
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error eliminando horario." };
        }
    },

    async getScheduleById(scheduleId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_schedule_by_id.php?id=${scheduleId}`, {
                headers: API_CONFIG.HEADERS
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error obteniendo horario." };
        }
    },

    async getPositions(includeHidden = false) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_positions.php?include_hidden=${includeHidden}`, {
                headers: API_CONFIG.HEADERS
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error obteniendo cargos." };
        }
    },

    async createPosition(positionData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_positions.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(positionData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error creando cargo." };
        }
    },

    async updatePosition(positionData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_positions.php`, {
                method: "PUT",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(positionData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error actualizando cargo." };
        }
    },

    async getProgramsJson() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_programs_json.php`, {
                headers: API_CONFIG.HEADERS
            });
            return await this.handleResponse(response);
        } catch (error) {
            return null;
        }
    },

    async saveProgramsJson(programsData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_save_programs_json.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                credentials: 'include',
                body: JSON.stringify(programsData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, message: "Error guardando programas." };
        }
    }
};

window.API_CONFIG = API_CONFIG;
