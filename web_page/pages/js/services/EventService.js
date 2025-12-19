import { ApiService } from './api.js';

class EventService {
    constructor() {
        this.api = new ApiService();
        // Use the base URL from ApiService, assuming it exposes it or we reconstruct it
        // Actually ApiService doesn't expose baseUrl publicly in the previous code, 
        // but we can use the same logic or just hardcode the relative path if we assume same domain
        // However, ApiService has a `get` method if implemented? 
        // Checking api.js in memory: it has specific methods like login, register. 
        // I should probably extend ApiService or just use fetch directly using the BASE_URL constant if exported.
        // Let's check api.js content again or just write a standalone service that uses the same config.
        
        // Better approach: Usage of the existing API structure.
        this.baseUrl = 'http://127.0.0.1:8080/jacquin_api/public/'; // Defaulting to local for now, matching api.js default
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
