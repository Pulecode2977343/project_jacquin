
class EventService {
    constructor() {
        // Use the global API_CONFIG if available
        this.baseUrl = (typeof API_CONFIG !== 'undefined') ? API_CONFIG.BASE_URL : '../../jacquin_api/';
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
