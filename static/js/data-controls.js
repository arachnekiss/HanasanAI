// Data Controls Settings JavaScript
class DataControlsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupChatHistoryToggle();
        this.setupDeleteAllChats();
        this.loadSettings();
    }

    setupChatHistoryToggle() {
        const chatHistoryToggle = document.getElementById('chatHistoryToggle');
        if (chatHistoryToggle) {
            chatHistoryToggle.addEventListener('click', () => {
                this.toggleChatHistory();
            });
        }
    }

    setupDeleteAllChats() {
        const deleteBtn = document.getElementById('deleteAllChatsBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.showDeleteConfirmation();
            });
        }
    }

    toggleChatHistory() {
        const toggle = document.getElementById('chatHistoryToggle');
        const isEnabled = toggle.classList.contains('active');
        
        if (isEnabled) {
            toggle.classList.remove('active');
            localStorage.setItem('chatHistoryEnabled', 'false');
        } else {
            toggle.classList.add('active');
            localStorage.setItem('chatHistoryEnabled', 'true');
        }
        
        this.showSuccessMessage(isEnabled ? 'Chat history saving disabled' : 'Chat history saving enabled');
    }

    showDeleteConfirmation() {
        const confirmed = confirm('Are you sure you want to delete all chat history? This action cannot be undone.');
        if (confirmed) {
            this.deleteAllChats();
        }
    }

    async deleteAllChats() {
        try {
            const response = await fetch('/delete_all_chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccessMessage('All chat history deleted successfully');
                // Refresh page to reflect changes
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                this.showErrorMessage('Failed to delete chat history: ' + result.message);
            }
        } catch (error) {
            console.error('Error deleting chats:', error);
            this.showErrorMessage('Failed to delete chat history');
        }
    }

    loadSettings() {
        const chatHistoryEnabled = localStorage.getItem('chatHistoryEnabled');
        const toggle = document.getElementById('chatHistoryToggle');
        
        if (toggle) {
            if (chatHistoryEnabled === 'false') {
                toggle.classList.remove('active');
            } else {
                toggle.classList.add('active');
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
    new DataControlsManager();
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