// Notifications Settings JavaScript
class NotificationsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupNotificationToggles();
        this.loadSettings();
    }

    setupNotificationToggles() {
        // New response notifications
        const newResponseToggle = document.getElementById('newResponseToggle');
        if (newResponseToggle) {
            newResponseToggle.addEventListener('click', () => {
                this.toggleNewResponseNotifications();
            });
        }

        // Email notifications
        const emailNotificationsToggle = document.getElementById('emailNotificationsToggle');
        if (emailNotificationsToggle) {
            emailNotificationsToggle.addEventListener('click', () => {
                this.toggleEmailNotifications();
            });
        }

        // Push notifications
        const pushNotificationsToggle = document.getElementById('pushNotificationsToggle');
        if (pushNotificationsToggle) {
            pushNotificationsToggle.addEventListener('click', () => {
                this.togglePushNotifications();
            });
        }

        // Sound notifications
        const soundNotificationsToggle = document.getElementById('soundNotificationsToggle');
        if (soundNotificationsToggle) {
            soundNotificationsToggle.addEventListener('click', () => {
                this.toggleSoundNotifications();
            });
        }
    }

    toggleNewResponseNotifications() {
        const toggle = document.getElementById('newResponseToggle');
        const isEnabled = toggle.classList.contains('active');
        
        if (isEnabled) {
            toggle.classList.remove('active');
            localStorage.setItem('newResponseNotifications', 'false');
        } else {
            toggle.classList.add('active');
            localStorage.setItem('newResponseNotifications', 'true');
        }
        
        this.saveNotificationSettingsToBackend({
            new_response: !isEnabled
        });
        
        this.showSuccessMessage(isEnabled ? 'New response notifications disabled' : 'New response notifications enabled');
    }

    toggleEmailNotifications() {
        const toggle = document.getElementById('emailNotificationsToggle');
        const isEnabled = toggle.classList.contains('active');
        
        if (isEnabled) {
            toggle.classList.remove('active');
            localStorage.setItem('emailNotifications', 'false');
        } else {
            toggle.classList.add('active');
            localStorage.setItem('emailNotifications', 'true');
        }
        
        this.saveNotificationSettingsToBackend({
            email: !isEnabled
        });
        
        this.showSuccessMessage(isEnabled ? 'Email notifications disabled' : 'Email notifications enabled');
    }

    togglePushNotifications() {
        const toggle = document.getElementById('pushNotificationsToggle');
        const isEnabled = toggle.classList.contains('active');
        
        if (isEnabled) {
            toggle.classList.remove('active');
            localStorage.setItem('pushNotifications', 'false');
        } else {
            toggle.classList.add('active');
            localStorage.setItem('pushNotifications', 'true');
            // Request permission for push notifications
            this.requestPushPermission();
        }
        
        this.saveNotificationSettingsToBackend({
            push: !isEnabled
        });
        
        this.showSuccessMessage(isEnabled ? 'Push notifications disabled' : 'Push notifications enabled');
    }

    toggleSoundNotifications() {
        const toggle = document.getElementById('soundNotificationsToggle');
        const isEnabled = toggle.classList.contains('active');
        
        if (isEnabled) {
            toggle.classList.remove('active');
            localStorage.setItem('soundNotifications', 'false');
        } else {
            toggle.classList.add('active');
            localStorage.setItem('soundNotifications', 'true');
        }
        
        this.saveNotificationSettingsToBackend({
            sound: !isEnabled
        });
        
        this.showSuccessMessage(isEnabled ? 'Sound notifications disabled' : 'Sound notifications enabled');
    }

    async requestPushPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                this.showErrorMessage('Push notification permission denied');
                const toggle = document.getElementById('pushNotificationsToggle');
                toggle.classList.remove('active');
                localStorage.setItem('pushNotifications', 'false');
            }
        }
    }

    async saveNotificationSettingsToBackend(settings) {
        try {
            const response = await fetch('/api/user-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    notifications_enabled: settings.new_response !== undefined ? settings.new_response : true,
                    email_notifications: settings.email,
                    push_notifications: settings.push,
                    sound_notifications: settings.sound
                })
            });
            
            if (!response.ok) {
                console.error('Failed to save notification settings to backend');
            }
        } catch (error) {
            console.error('Error saving notification settings:', error);
        }
    }

    loadSettings() {
        // Load new response notifications
        const newResponseEnabled = localStorage.getItem('newResponseNotifications') !== 'false';
        const newResponseToggle = document.getElementById('newResponseToggle');
        if (newResponseToggle) {
            if (newResponseEnabled) {
                newResponseToggle.classList.add('active');
            } else {
                newResponseToggle.classList.remove('active');
            }
        }

        // Load email notifications
        const emailEnabled = localStorage.getItem('emailNotifications') !== 'false';
        const emailToggle = document.getElementById('emailNotificationsToggle');
        if (emailToggle) {
            if (emailEnabled) {
                emailToggle.classList.add('active');
            } else {
                emailToggle.classList.remove('active');
            }
        }

        // Load push notifications
        const pushEnabled = localStorage.getItem('pushNotifications') === 'true';
        const pushToggle = document.getElementById('pushNotificationsToggle');
        if (pushToggle) {
            if (pushEnabled) {
                pushToggle.classList.add('active');
            } else {
                pushToggle.classList.remove('active');
            }
        }

        // Load sound notifications
        const soundEnabled = localStorage.getItem('soundNotifications') !== 'false';
        const soundToggle = document.getElementById('soundNotificationsToggle');
        if (soundToggle) {
            if (soundEnabled) {
                soundToggle.classList.add('active');
            } else {
                soundToggle.classList.remove('active');
            }
        }
    }

    showSuccessMessage(message) {
        this.showMessage(message, '#10b981');
    }

    showErrorMessage(message) {
        this.showMessage(message, '#ef4444');
    }

    showMessage(message, color) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'toast-message';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
            font-size: 14px;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    document.body.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NotificationsManager();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);