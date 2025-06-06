// Voice Settings JavaScript
class VoiceSettingsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupVoiceLanguageToggle();
        this.loadSettings();
    }

    setupVoiceLanguageToggle() {
        const languageToggle = document.getElementById('voiceLanguageToggle');
        if (languageToggle) {
            languageToggle.addEventListener('change', (e) => {
                this.changeVoiceLanguage(e.target.value);
            });
        }
    }

    changeVoiceLanguage(language) {
        localStorage.setItem('voiceLanguage', language);
        
        // Save to backend
        this.saveVoiceSettingsToBackend(language);
        
        this.showSuccessMessage('Voice language updated successfully!');
    }

    async saveVoiceSettingsToBackend(language) {
        try {
            const response = await fetch('/api/user-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    voice_language: language
                })
            });
            
            if (!response.ok) {
                console.error('Failed to save voice settings to backend');
            }
        } catch (error) {
            console.error('Error saving voice settings:', error);
        }
    }

    loadSettings() {
        const savedLanguage = localStorage.getItem('voiceLanguage') || 'en';
        const languageToggle = document.getElementById('voiceLanguageToggle');
        
        if (languageToggle) {
            languageToggle.value = savedLanguage;
        }
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
            font-size: 14px;
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (successDiv.parentNode) {
                    document.body.removeChild(successDiv);
                }
            }, 300);
        }, 2000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VoiceSettingsManager();
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