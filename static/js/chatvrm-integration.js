/**
 * ChatVRM Integration for Main Application
 * Replaces the existing VRM system with complete ChatVRM facial animation support
 */

class ChatVRMIntegration {
    constructor() {
        this.chatVRMSystem = null;
        this.currentVRMFile = null;
        this.currentWallpaper = null;
        this.isInitialized = false;
    }

    async initialize() {
        const canvas = document.getElementById('vrm-canvas');
        if (!canvas) {
            console.error('VRM canvas not found');
            return false;
        }

        // Wait for ChatVRM direct blinking implementation to be available
        if (!window.ChatVRMDirectBlinking) {
            console.error('ChatVRM direct blinking implementation not available');
            return false;
        }

        // Initialize ChatVRM direct blinking implementation
        this.chatVRMSystem = new window.ChatVRMDirectBlinking(canvas);
        this.isInitialized = true;
        
        console.log('ChatVRM integration initialized with exact implementation');
        return true;
    }

    async loadCharacter(vrmFile) {
        if (!this.isInitialized) {
            const success = await this.initialize();
            if (!success) return false;
        }

        try {
            const vrmPath = `/static/character/${vrmFile}`;
            console.log('Loading VRM with ChatVRM system:', vrmPath);
            
            const vrm = await this.chatVRMSystem.loadVRM(vrmPath);
            this.currentVRMFile = vrmFile;
            
            console.log('VRM loaded with facial animations:', !!vrm.expressionManager);
            
            // Store for compatibility with existing code
            window.currentVRM = vrm;
            
            return true;
        } catch (error) {
            console.error('Failed to load VRM:', error);
            return false;
        }
    }

    setEmotion(emotion) {
        if (this.chatVRMSystem) {
            this.chatVRMSystem.playEmotion(emotion);
        }
    }

    playAnimation(animationFile, loop = false) {
        if (this.chatVRMSystem) {
            const animationPath = `/static/vrma/${animationFile}`;
            this.chatVRMSystem.playAnimation(animationPath, loop);
        }
    }

    updateCharacterStatus(status, emotion = 'neutral') {
        // Update character emotion based on status
        this.setEmotion(emotion);
        
        // Update UI status if needed
        const statusElement = document.querySelector('.character-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    loadBackground(wallpaperFile) {
        const avatarContainer = document.getElementById('avatarContainer');
        if (avatarContainer) {
            avatarContainer.style.background = `url('/static/wallpaper/${wallpaperFile}') center center/cover no-repeat`;
            this.currentWallpaper = wallpaperFile;
        }
    }

    getSystemInfo() {
        return {
            initialized: this.isInitialized,
            hasVRM: !!this.currentVRMFile,
            hasExpressionManager: !!(this.chatVRMSystem?.vrm?.expressionManager),
            currentVRM: this.currentVRMFile,
            currentWallpaper: this.currentWallpaper
        };
    }
}

// Initialize global ChatVRM integration
window.chatVRMIntegration = new ChatVRMIntegration();

// Compatibility layer for existing code
window.vrmCharacterSystem = {
    loadCharacter: (vrmFile) => window.chatVRMIntegration.loadCharacter(vrmFile),
    setEmotion: (emotion) => window.chatVRMIntegration.setEmotion(emotion),
    playAnimation: (animationFile, loop) => window.chatVRMIntegration.playAnimation(animationFile, loop)
};

console.log('ChatVRM integration layer loaded');