// Settings Page JavaScript
class SettingsManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Toggle switches
        document.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', this.handleToggle.bind(this));
        });

        // Back button handling
        window.addEventListener('popstate', this.handleBackNavigation.bind(this));
    }

    loadSettings() {
        // Load settings from localStorage
        const settings = this.getStoredSettings();
        
        // Apply loaded settings to UI
        Object.keys(settings).forEach(key => {
            const element = document.getElementById(key);
            if (element && element.classList.contains('toggle-switch')) {
                if (settings[key]) {
                    element.classList.add('active');
                } else {
                    element.classList.remove('active');
                }
            }
        });
    }

    getStoredSettings() {
        const defaultSettings = {
            improveModel: false,
            includeAudio: false,
            includeVideo: false,
            speech: true,
            backgroundMode: false,
            defaultAssistant: false,
            notificationsReplies: true,
            notificationsTasks: true,
            colorScheme: 'dark',
            language: 'english'
        };

        const stored = localStorage.getItem('hanasanai_settings');
        return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    }

    saveSettings(settings) {
        localStorage.setItem('hanasanai_settings', JSON.stringify(settings));
    }

    handleToggle(event) {
        const toggle = event.currentTarget;
        const isActive = toggle.classList.contains('active');
        
        if (isActive) {
            toggle.classList.remove('active');
        } else {
            toggle.classList.add('active');
        }

        // Save setting
        const settingKey = toggle.getAttribute('data-setting');
        if (settingKey) {
            const settings = this.getStoredSettings();
            settings[settingKey] = !isActive;
            this.saveSettings(settings);
        }
    }

    handleBackNavigation(event) {
        // Handle browser back button
        if (event.state && event.state.page) {
            this.navigateToPage(event.state.page);
        }
    }

    navigateToPage(page) {
        // Add navigation animation
        document.body.style.transform = 'translateX(-100%)';
        setTimeout(() => {
            window.location.href = page;
        }, 150);
    }
}

// Global navigation function
function navigateTo(path) {
    // Add slide-out animation
    const container = document.querySelector('.settings-container');
    container.style.transform = 'translateX(-100%)';
    container.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = path;
    }, 200);
}

// Logout function
function logout() {
    if (confirm('정말로 로그아웃하시겠습니까?')) {
        // Clear all stored data
        localStorage.clear();
        sessionStorage.clear();
        
        // Add logout animation
        const container = document.querySelector('.settings-container');
        container.style.transform = 'scale(0.95)';
        container.style.opacity = '0';
        
        setTimeout(() => {
            // Redirect to login or home page
            window.location.href = '/';
        }, 300);
    }
}

// Color scheme functions
function setColorScheme(scheme) {
    const settings = settingsManager.getStoredSettings();
    settings.colorScheme = scheme;
    settingsManager.saveSettings(settings);
    
    // Apply theme
    document.body.className = scheme === 'dark' ? 'dark-theme' : 'light-theme';
    
    // Update UI
    updateColorSchemeUI(scheme);
}

function updateColorSchemeUI(scheme) {
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`[data-scheme="${scheme}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
}

// Language functions
function setLanguage(language) {
    const settings = settingsManager.getStoredSettings();
    settings.language = language;
    settingsManager.saveSettings(settings);
    
    // Update UI
    updateLanguageUI(language);
}

function updateLanguageUI(language) {
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`[data-language="${language}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
}

// Plan management functions
function selectPlan(planType) {
    // Show confirmation
    const planName = planType === 'pro' ? 'HanasanAI Pro' : 'HanasanAI Plus';
    const price = planType === 'pro' ? '₩310,000/월' : '₩29,000/월';
    
    if (confirm(`${planName} (${price})으로 업그레이드하시겠습니까?`)) {
        // Here you would integrate with payment processing
        alert('결제 시스템과 연동이 필요합니다.');
    }
}

function managePlan() {
    // Navigate to plan management
    alert('구독 관리 페이지로 이동합니다.');
}

// Data control functions
function exportData() {
    // Create export job
    alert('데이터 내보내기를 시작합니다. 완료되면 이메일로 알려드리겠습니다.');
}

function archiveCurrentChat() {
    if (confirm('현재 채팅을 보관하시겠습니까?')) {
        alert('채팅이 보관되었습니다.');
    }
}

function deleteAllChats() {
    if (confirm('모든 채팅 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        if (confirm('정말로 모든 채팅을 삭제하시겠습니까?')) {
            // Clear chat history
            localStorage.removeItem('chat_history');
            alert('모든 채팅 기록이 삭제되었습니다.');
        }
    }
}

// External link functions
function openExternalLink(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

// Initialize settings manager
let settingsManager;
document.addEventListener('DOMContentLoaded', () => {
    settingsManager = new SettingsManager();
});

// Export functions for global access
window.navigateTo = navigateTo;
window.logout = logout;
window.setColorScheme = setColorScheme;
window.setLanguage = setLanguage;
window.selectPlan = selectPlan;
window.managePlan = managePlan;
window.exportData = exportData;
window.archiveCurrentChat = archiveCurrentChat;
window.deleteAllChats = deleteAllChats;
window.openExternalLink = openExternalLink;