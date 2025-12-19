/**
 * API Service Client
 * Centralizes all communication with the backend API.
 * Handles Authentication, Token Management, and Error Parsing.
 */

const API_CONFIG = {
    // URL del Túnel Ngrok (Opcional - Para acceso remoto)
    // BASE_URL: "https://coincidental-zoe-fermentatively.ngrok-free.dev/jacquin_api/public/",

    // URL Local (Standard XAMPP Deployment - Unified Structure)
    BASE_URL: "http://localhost:8080/jacquin_api/",

    HEADERS: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
};

const ApiService = {

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

    async logout() {
        localStorage.removeItem("jam_user_session");
        window.location.href = "index.html";
    },

    // ... (omitted methods) ...

    /**
     * Get All Users (Admin Only)
     */
    async getUsers() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_get_users.php`, {
                method: "GET",
                headers: API_CONFIG.HEADERS
            });

            const text = await response.text();

            if (!response.ok) {
                return { success: false, message: `HTTP Error ${response.status}: ${text.substring(0, 50)}...` };
            }

            try {
                return JSON.parse(text);
            } catch (jsonError) {
                console.error("JSON Parse Error:", text);
                return { success: false, message: `Respuesta inválida (No JSON): ${text.substring(0, 50)}...` };
            }
        } catch (error) {
            console.error("Networking Error:", error);
            return { success: false, message: `Error de red: ${error.message}` };
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

    async getUserDetails(userId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}get_user_details.php?id=${userId}`, {
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
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error subiendo foto." };
        }
    },

    async enrollStudent(studentId, courseId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_enroll_student.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ student_id: studentId, course_id: courseId })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error en inscripción." };
        }
    },

    async updateUserRole(id_usuario, id_rol) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_update_role.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ id_usuario: parseInt(id_usuario), id_rol: parseInt(id_rol) })
            });
            return await response.json();
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
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error eliminando usuario." };
        }
    },

    // ==========================================
    // LOCAL STORAGE HELPERS
    // ==========================================

    saveSession(user) {
        localStorage.setItem("jam_user_session", JSON.stringify(user));
    },

    getSession() {
        const session = localStorage.getItem("jam_user_session");
        return session ? JSON.parse(session) : null;
    },

    isAuthenticated() {
        return !!this.getSession();
    }
};

// Export to window for global access
window.ApiService = ApiService;
