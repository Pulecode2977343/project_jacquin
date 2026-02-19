import { API_CONFIG } from './api.js';

class EventService {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
    }

    async getAllEvents() {
        try {
            const response = await fetch(`${this.baseUrl}get_events.php`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching events:', error);
            return { success: false, message: error.message };
        }
    }
}

export default EventService;
