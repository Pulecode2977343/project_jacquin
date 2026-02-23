/**
 * API Service Client
 * Centralizes all communication with the backend API.
 * Handles Authentication, Token Management, and Error Parsing.
 */

var API_CONFIG = {
    // Detect subfolder levels to reach /jacquin_api/ correctly
    // URL Base para estructura aplanada (index.html en raíz de web_page)
    // Detect subfolder levels to reach /jacquin_api/ correctly
    get BASE_URL() {
        const path = window.location.pathname;
        const host = window.location.hostname;
        const url = host === 'localhost' || host === '127.0.0.1' || host.includes('share.zrok.io')
            ? "/jacquin_api/"
            : (path.includes('/pages/') ? "../../jacquin_api/" : "../jacquin_api/");

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
            return 'assets/images/default_avatar.svg';
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
            return await response.json();
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
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch (e) {
                return { success: false, message: `Error respuesta: ${text.substring(0, 50)}` };
            }
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
            return await response.json();
        } catch (error) {
            console.error("Recovery Request Error:", error);
            throw error; // Let reset.js handle it in its catch block
        }
    },

    async verifyRecoveryCode(email, code) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}recover_verify.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ email, code })
            });
            return await response.json();
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
            return await response.json();
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
            return await response.json();
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
            return await response.json();
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
            return await response.json();
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
                // Headers auto-set for FormData (multipart)
                body: formData
            });

            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch (e) {
                return { success: false, message: "Error parseando respuesta: " + text.substring(0, 100) };
            }
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

    async handleEnrollment(idEnrollment, action) { // action: 'approve' | 'reject'
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
            // Construct payload based on input type
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
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error("Server Response:", text);
                return { success: false, message: "Error del servidor: " + text.substring(0, 50) };
            }
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

    // ==========================================
    // EVENTS MANAGEMENT
    // ==========================================

    async getEvents() {
        try {
            const url = `${API_CONFIG.BASE_URL}get_events.php`;
            const response = await fetch(url);

            if (!response.ok) {
                const text = await response.text();
                console.error("API Error Response:", text);
                return { success: false, message: `Error ${response.status}: ${text.substring(0, 100)}` };
            }

            return await response.json();
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
            return await response.json();
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
            return await response.json();
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
            return await response.json();
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
            return await response.json();
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
            return await response.json();
        } catch (error) {
            console.error("Error sending message:", error);
            return { success: false, message: "Error de conexión." };
        }
    },

    // ==========================================
    // MULTI-DAY SCHEDULING METHODS
    // ==========================================

    async getEnrollmentSchedules(enrollmentId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_enrollment_schedules.php?enrollment_id=${enrollmentId}`, {
                headers: API_CONFIG.HEADERS
            });
            return await response.json();
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
            return await response.json();
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
            return await response.json();
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
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error eliminando horario." };
        }
    },

    async getScheduleById(scheduleId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_schedule_by_id.php?id=${scheduleId}`, {
                headers: API_CONFIG.HEADERS
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error obteniendo horario." };
        }
    },

    // ==========================================
    // POSITIONS (CARGOS) MANAGEMENT
    // ==========================================

    async getPositions(includeHidden = false) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_positions.php?include_hidden=${includeHidden}`, {
                headers: API_CONFIG.HEADERS
            });
            return await response.json();
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
            return await response.json();
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
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error actualizando cargo." };
        }
    },

    async deletePosition(positionId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_positions.php`, {
                method: "DELETE",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ id_position: positionId })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error eliminando cargo." };
        }
    },

    // Position Functions
    async getPositionFunctions(positionId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_position_functions.php?position_id=${positionId}`, {
                headers: API_CONFIG.HEADERS
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error obteniendo funciones." };
        }
    },

    async addPositionFunction(positionId, description) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_position_functions.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ position_id: positionId, description })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error agregando función." };
        }
    },

    async updatePositionFunction(functionData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_position_functions.php`, {
                method: "PUT",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(functionData)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error actualizando función." };
        }
    },

    async deletePositionFunction(functionId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_position_functions.php`, {
                method: "DELETE",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ id_function: functionId })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error eliminando función." };
        }
    },

    // User Position Assignments
    async getUserPositions(userId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_user_positions.php?user_id=${userId}`, {
                headers: API_CONFIG.HEADERS
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error obteniendo cargos del usuario." };
        }
    },

    async getPositionUsers(positionId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_user_positions.php?position_id=${positionId}`, {
                headers: API_CONFIG.HEADERS
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error obteniendo usuarios del cargo." };
        }
    },

    async assignPosition(userId, positionId, assignedBy) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_user_positions.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ user_id: userId, position_id: positionId, assigned_by: assignedBy })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error asignando cargo." };
        }
    },

    async removePositionAssignment(assignmentId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_user_positions.php`, {
                method: "DELETE",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ id: assignmentId })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error removiendo asignación." };
        }
    },

    // Eligible Users for Position Assignment
    async getEligibleUsers() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_eligible_users.php`, {
                headers: API_CONFIG.HEADERS
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error obteniendo usuarios." };
        }
    },

    // Position Notifications
    async getPositionNotifications(userId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_position_notifications.php?user_id=${userId}`, {
                headers: API_CONFIG.HEADERS
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error obteniendo notificaciones." };
        }
    },

    async markPositionNotified(notificationId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_position_notifications.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ id: notificationId })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error marcando notificación." };
        }
    },

    // ==========================================
    // ABOUT CARDS CRUD (Admin)
    // ==========================================


    async getAboutCardsAdmin() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_about_cards.php`, {
                method: "GET",
                headers: API_CONFIG.HEADERS
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error obteniendo tarjetas." };
        }
    },

    async createAboutCard(cardData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_about_cards.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(cardData)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error creando tarjeta." };
        }
    },

    async updateAboutCard(cardData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_about_cards.php`, {
                method: "PUT",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(cardData)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error actualizando tarjeta." };
        }
    },

    async deleteAboutCard(cardId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_about_cards.php`, {
                method: "DELETE",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ id: cardId })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error eliminando tarjeta." };
        }
    },

    async uploadAboutCardImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_CONFIG.BASE_URL}upload_about_image.php`, {
                method: "POST",
                body: formData
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error subiendo imagen." };
        }
    },

    // ==========================================
    // PROGRAMS JSON BACKEND (Marketing)
    // ==========================================

    async getProgramsJson() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_programs_json.php`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching programs JSON:", error);
            return {};
        }
    },

    async saveProgramsJson(programsData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_save_programs_json.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(programsData)
            });
            return await response.json();
        } catch (error) {
            console.error("Error saving programs JSON:", error);
            return { success: false, message: "Error de conexión." };
        }
    },

    // ==========================================
    // ACADEMIC FEATURES (New)
    // ==========================================

    // NOTIFICATIONS
    async getPendingActions(userId, roleId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}check_pending_actions.php?user_id=${userId}&role_id=${roleId}`);
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error comprobando alertas." };
        }
    },

    // ADMIN COMPLIANCE
    async adminGetComplianceItems() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_compliance_crud.php?action=list`);
            return await response.json();
        } catch (error) { return { success: false }; }
    },

    async adminComplianceAction(action, data) {
        try {
            // action: create | update | delete
            // data includes id if update/delete
            const url = `${API_CONFIG.BASE_URL}admin_compliance_crud.php?action=${action}`;
            const response = await fetch(url, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) { return { success: false, message: "Error conectando con servidor." }; }
    },

    // TEACHER ACADEMIC
    async getAcademicData(action, params = {}) {
        // action: get_roster | get_schedule_students | get_my_assignments | get_my_notes
        try {
            const query = new URLSearchParams({ action, ...params }).toString();
            const response = await fetch(`${API_CONFIG.BASE_URL}get_academic_data.php?${query}`);
            return await response.json();
        } catch (error) { return { success: false, message: "Error obteniendo datos académicos." }; }
    },

    async teacherCreateAssignment(data) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}teacher_assignments.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) { return { success: false, message: "Error creando tarea." }; }
    },

    async teacherSaveAttendance(data) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}teacher_attendance.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) { return { success: false, message: "Error guardando asistencia." }; }
    },

    async teacherGetAttendance(scheduleId, date) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}teacher_attendance.php?schedule_id=${scheduleId}&date=${date}`);
            return await response.json();
        } catch (error) { return { success: false, message: "Error obteniendo asistencia." }; }
    },

    async teacherSaveNote(data) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}teacher_notes.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) { return { success: false, message: "Error guardando nota." }; }
    },

    async teacherGetAssignments(courseId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}teacher_assignments.php?course_id=${courseId}`);
            return await response.json();
        } catch (error) { return { success: false, message: "Error obteniendo tareas." }; }
    },

    async teacherGetNotes(courseId, scheduleId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}teacher_notes.php?course_id=${courseId}&schedule_id=${scheduleId}`);
            return await response.json();
        } catch (error) { return { success: false, message: "Error obteniendo notas." }; }
    },

    async teacherAddNote(data) {
        return this.teacherSaveNote(data);
    },

    // MISSION & VALUES
    async getMissionValues() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_mission_values.php`);
            return await response.json();
        } catch (error) { return { success: false, message: "Error obteniendo misión y valores." }; }
    },

    async updateMissionValues(data) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}update_mission_values.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) { return { success: false, message: "Error actualizando misión y valores." }; }
    },

    async validateScheduleConflict(studentId, newScheduleId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}validate_schedule_conflict.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ student_id: studentId, new_schedule_id: newScheduleId })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error validando conflictos de horario." };
        }
    }
};

window.ApiService = ApiService;
