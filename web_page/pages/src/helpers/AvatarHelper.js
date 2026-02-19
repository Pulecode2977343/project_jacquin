/**
 * AvatarHelper.js
 * Standardizes avatar URL generation across the application.
 */

import { API_CONFIG } from '../services/api.js';

const BASE_URL = API_CONFIG ? API_CONFIG.BASE_URL : '../../jacquin_api/';
const AvatarHelper = {

    /**
     * Generates the full URL for a user avatar.
     * @param {string} avatarPath - The path stored in the database (e.g., "uploads/avatars/file.png" or "http...")
     * @param {string} name - User's full name for generating initials fallback (optional)
     * @returns {string|null} - The full URL or null if no avatar
     */
    getUrl: function (avatarPath) {
        if (!avatarPath || avatarPath.trim() === '') {
            return null;
        }

        // 1. Check for external URL
        if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
            return avatarPath;
        }

        // 2. Cleaning Mechanism for Legacy/Messy Paths
        let filename = avatarPath;

        // Remove typical prefixes recursively to get to the clean filename
        // Order matters: remove longest possible prefixes first
        const prefixesToRemove = [
            'web_page/pages/uploads/avatars/',
            'web_page/pages/uploads/',
            'public/uploads/avatars/',
            'uploads/avatars/',
            'public/'
        ];

        prefixesToRemove.forEach(prefix => {
            if (filename.includes(prefix)) {
                filename = filename.replace(prefix, '');
            }
        });

        // Remove leading slashes
        if (filename.startsWith('/')) filename = filename.substring(1);

        return `${BASE_URL}public/uploads/avatars/${filename}`;
    },

    /**
     * Standard error handler for avatar images.
     * Hides the broken image, shows initials, and optionally triggers a soft session sync.
     * usage: <img onerror="AvatarHelper.handleError(this, 'SessionUser')" ...>
     */
    handleError: function (imgEl, context = null) {
        imgEl.style.display = 'none';
        if (imgEl.nextElementSibling) {
            imgEl.nextElementSibling.style.display = 'flex';
        }

        // Self-Healing: If this is the current user's avatar failing, force a sync
        // We limit this to run only once per session load to avoid loops
        if (!window.hasTriedAvatarSync) {
            console.warn("Avatar failed to load. Attempting session data refresh...");
            window.hasTriedAvatarSync = true;

            if (window.ApiService && window.ApiService.getSession) {
                const session = window.ApiService.getSession();
                if (session && session.email) {
                    // Background fetch to update local storage
                    fetch(`${BASE_URL}get_user_by_email.php?email=${encodeURIComponent(session.email)}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.success && data.user) {
                                // If the avatar URL has changed in DB vs Session, update it
                                if (data.user.avatar_url !== session.avatar_url) {
                                    console.log("Session avatar outdated. Updating...", session.avatar_url, "->", data.user.avatar_url);
                                    session.avatar_url = data.user.avatar_url;
                                    window.ApiService.saveSession(session);
                                    // Retry loading the image if it matches the current user
                                    if (imgEl.id === 'dashboard-avatar') {
                                        imgEl.src = this.getUrl(data.user.avatar_url) + '?retry=' + Date.now();
                                        imgEl.style.display = 'block';
                                        if (imgEl.nextElementSibling) imgEl.nextElementSibling.style.display = 'none';
                                    }
                                }
                            }
                        })
                        .catch(e => console.error("Auto-sync failed", e));
                }
            }
        }
    },

    render: function (avatarPath, name, cssClass = '') {
        const url = this.getUrl(avatarPath);
        const initials = this.getInitials(name);

        if (url) {
            return `<div class="avatar-wrapper ${cssClass}">
                        <img src="${url}" alt="${name}" 
                             onerror="AvatarHelper.handleError(this)">
                        <div class="avatar-initials" style="display:none;">${initials}</div>
                    </div>`;
        } else {
            return `<div class="avatar-wrapper ${cssClass}">
                        <div class="avatar-initials">${initials}</div>
                    </div>`;
        }
    },

    getInitials: function (name) {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
};

export default AvatarHelper;
