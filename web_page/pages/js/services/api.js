/**
 * API Service Client
 * Centralizes all communication with the backend API.
 * Handles Authentication, Token Management, and Error Parsing.
 */

const API_CONFIG = {
    // URL del Túnel Ngrok (Actual)
    BASE_URL: "https://coincidental-zoe-fermentatively.ngrok-free.dev/jacquin_api/public/",
    
    // URL Local (Descomentar si estás en la misma red y usas XAMPP/WAMP)
    // BASE_URL: "http://192.168.0.16/jacquin_api/public/", 

    HEADERS: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
};

const ApiService = {

    // ==========================================
    // CONTACT
    // ==========================================

    async sendContactMessage(data) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}contact.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error enviando mensaje." };
        }
    },

    // ==========================================
    // AUTHENTICATION
    // ==========================================

    /**
     * Login User
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<object>} Response data
     */
    async login(email, password) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}login.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            // Store Session if successful
            if (data.success && (data.user || data.data)) {
                const user = data.user || data.data;
                this.saveSession(user);
            }
            return data;
        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, message: "Error de conexión con el servidor." };
        }
    },

    /**
     * Register New User
     * @param {object} userData { fullName, email, nPhone, password }
     */
    async register(userData) {
        try {
            // Map keys to API expectation if needed (snake_case vs camelCase)
            const payload = {
                full_name: userData.fullName,
                email: userData.email,
                n_phone: userData.nPhone,
                password: userData.password
            };

            const response = await fetch(`${API_CONFIG.BASE_URL}register.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (error) {
            console.error("Register Error:", error);
            return { success: false, message: "Error al registrar usuario." };
        }
    },

    logout() {
        localStorage.removeItem("jam_user_session");
        window.location.href = "login.html";
    },

    // ==========================================
    // RECOVERY
    // ==========================================

    async requestRecoveryCode(email) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}recover.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ email })
            });
            
            // Note: PHP might return raw text or JSON depending on implementation. 
            // JamApiService says it returns ResponseBody but likely JSON for app logic.
            // We'll try to parse JSON, fallback to text if fails.
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch {
                return { success: response.ok, message: text };
            }
        } catch (error) {
            return { success: false, message: "Error de red." };
        }
    },

    async verifyRecoveryCode(email, code) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}verify_code.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ email, code })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error verificando código." };
        }
    },

    async resetPassword(email, code, newPassword) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}reset_password.php`, {
                method: "POST",
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ email, code, new_password: newPassword })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error reseteando contraseña." };
        }
    },

    // ==========================================
    // ADMIN
    // ==========================================

    /**
     * Get All Users (Admin Only)
     */
    async getUsers() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}admin_get_users.php`, {
                method: "GET",
                headers: API_CONFIG.HEADERS
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: "Error obteniendo usuarios." };
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
