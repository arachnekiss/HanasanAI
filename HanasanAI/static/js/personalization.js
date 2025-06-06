// Personalization Settings JavaScript
class PersonalizationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupLanguageToggle();
        this.setupThemeToggle();
        this.setupCustomInstructions();
        this.loadSettings();
        this.loadCustomInstructions();
    }

    setupLanguageToggle() {
        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.addEventListener('change', (e) => {
                const selectedLanguage = e.target.value;
                this.changeLanguage(selectedLanguage);
            });
        }
    }

    setupThemeToggle() {
        const themeButtons = document.querySelectorAll('.theme-option');
        themeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                this.changeTheme(theme);
            });
        });
    }

    setupCustomInstructions() {
        const customInstructionsBtn = document.getElementById('customInstructionsBtn');
        const modal = document.getElementById('customInstructionsModal');
        const closeBtn = document.getElementById('closeModal');
        const saveBtn = document.getElementById('saveInstructions');
        const cancelBtn = document.getElementById('cancelInstructions');

        if (customInstructionsBtn) {
            customInstructionsBtn.addEventListener('click', () => {
                this.openCustomInstructionsModal();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeCustomInstructionsModal();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCustomInstructions();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeCustomInstructionsModal();
            });
        }

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeCustomInstructionsModal();
                }
            });
        }
    }

    changeLanguage(language) {
        localStorage.setItem('language', language);
        
        // Update UI immediately
        if (window.updatePageTranslations) {
            window.updatePageTranslations();
        }
        
        // Update language toggle UI
        this.updateLanguageUI(language);
        
        // Show success message
        this.showSuccessMessage('Language updated successfully!');
    }

    changeTheme(theme) {
        localStorage.setItem('theme', theme);
        
        // Apply theme immediately
        this.applyTheme(theme);
        
        // Update theme UI
        this.updateThemeUI(theme);
        
        // Show success message
        this.showSuccessMessage('Theme updated successfully!');
    }

    applyTheme(theme) {
        const body = document.body;
        const html = document.documentElement;
        
        // Remove existing theme classes
        body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        html.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const actualTheme = prefersDark ? 'dark' : 'light';
            body.classList.add(`theme-${actualTheme}`);
            html.classList.add(`theme-${actualTheme}`);
        } else {
            body.classList.add(`theme-${theme}`);
            html.classList.add(`theme-${theme}`);
        }
    }

    updateLanguageUI(language) {
        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.value = language;
        }
    }

    updateThemeUI(theme) {
        const themeButtons = document.querySelectorAll('.theme-option');
        themeButtons.forEach(button => {
            if (button.dataset.theme === theme) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    async openCustomInstructionsModal() {
        const modal = document.getElementById('customInstructionsModal');
        const aboutYouTextarea = document.getElementById('aboutYou');
        const responseStyleTextarea = document.getElementById('responseStyle');
        
        // Load existing instructions from database
        try {
            const response = await fetch('/api/custom-instructions');
            if (response.ok) {
                const instructions = await response.json();
                if (aboutYouTextarea) aboutYouTextarea.value = instructions.about_you || '';
                if (responseStyleTextarea) responseStyleTextarea.value = instructions.response_style || '';
                
                // Update preview text
                this.updateCustomInstructionsPreview(instructions.about_you || '');
            }
        } catch (error) {
            console.error('Failed to load custom instructions:', error);
        }
        
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeCustomInstructionsModal() {
        const modal = document.getElementById('customInstructionsModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    async saveCustomInstructions() {
        const aboutYouTextarea = document.getElementById('aboutYou');
        const responseStyleTextarea = document.getElementById('responseStyle');
        
        const instructions = {
            about_you: aboutYouTextarea ? aboutYouTextarea.value : '',
            response_style: responseStyleTextarea ? responseStyleTextarea.value : ''
        };
        
        try {
            const response = await fetch('/api/custom-instructions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(instructions)
            });
            
            if (response.ok) {
                // Update preview text
                this.updateCustomInstructionsPreview(instructions.about_you);
                this.closeCustomInstructionsModal();
                this.showSuccessMessage('Custom instructions saved successfully!');
            } else {
                this.showErrorMessage('Failed to save custom instructions');
            }
        } catch (error) {
            console.error('Failed to save custom instructions:', error);
            this.showErrorMessage('Failed to save custom instructions');
        }
    }

    updateCustomInstructionsPreview(aboutYou) {
        const preview = document.getElementById('customInstructionsPreview');
        if (preview) {
            if (aboutYou && aboutYou.trim()) {
                const shortPreview = aboutYou.length > 80 ? aboutYou.substring(0, 80) + '...' : aboutYou;
                preview.textContent = shortPreview;
            } else {
                preview.textContent = 'Tell HanasanAI about your preferences and context...';
            }
        }
    }

    async loadCustomInstructions() {
        try {
            const response = await fetch('/api/custom-instructions');
            if (response.ok) {
                const instructions = await response.json();
                this.updateCustomInstructionsPreview(instructions.about_you || '');
            }
        } catch (error) {
            console.error('Error saving custom instructions:', error);
        }
    }

    loadSettings() {
        // Load language setting
        const savedLanguage = localStorage.getItem('language') || 'en';
        this.updateLanguageUI(savedLanguage);
        
        // Load theme setting
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.updateThemeUI(savedTheme);
        this.applyTheme(savedTheme);
        
        // Load custom instructions
        this.loadCustomInstructions();
    }

    loadCustomInstructions() {
        const savedInstructions = localStorage.getItem('customInstructions');
        const customInstructionsBtn = document.getElementById('customInstructionsBtn');
        
        if (savedInstructions && customInstructionsBtn) {
            const instructions = JSON.parse(savedInstructions);
            const hasInstructions = instructions.aboutYou || instructions.responseStyle;
            
            if (hasInstructions) {
                customInstructionsBtn.classList.add('has-content');
                // Update button text to show it has content
                const buttonText = customInstructionsBtn.querySelector('.settings-label');
                if (buttonText && !buttonText.textContent.includes('✓')) {
                    buttonText.textContent += ' ✓';
                }
            }
        }
    }

    showSuccessMessage(message) {
        // Create and show a temporary success message
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
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(successDiv);
            }, 300);
        }, 2000);
    }

    showErrorMessage(message) {
        // Create and show a temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(errorDiv);
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PersonalizationManager();
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
    
    .theme-option.active {
        border-color: #10b981 !important;
        background: rgba(16, 185, 129, 0.1) !important;
    }
    
    .has-content {
        border-left: 3px solid #10b981 !important;
    }
`;
document.head.appendChild(style);