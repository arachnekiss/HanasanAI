/**
 * VRM Facial Animation System
 * Implements natural blinking, expressions, and lip-sync for VRM characters
 */

class VRMFacialAnimations {
    constructor(vrm) {
        this.vrm = vrm;
        this.blinkInterval = null;
        this.currentExpression = 'neutral';
        this.isBlinking = false;
        this.lipSyncEnabled = false;
        this.audioContext = null;
        this.analyser = null;
        this.lipSyncData = new Uint8Array(256);
        
        this.init();
    }
    
    init() {
        console.log('Initializing VRM facial animations...');
        this.startAutomaticBlinking();
        this.setupLipSync();
    }
    
    /**
     * Automatic Blinking System
     */
    startAutomaticBlinking() {
        this.scheduleNextBlink();
    }
    
    scheduleNextBlink() {
        // Random interval between 3-7 seconds
        const blinkInterval = (3 + Math.random() * 4) * 1000;
        
        this.blinkInterval = setTimeout(() => {
            this.performBlink();
            this.scheduleNextBlink();
        }, blinkInterval);
    }
    
    performBlink() {
        if (this.isBlinking || !this.vrm?.blendShapeProxy) return;
        
        this.isBlinking = true;
        
        // Close eyes
        this.vrm.blendShapeProxy.setValue('blink', 1.0);
        this.vrm.blendShapeProxy.update();
        
        // Reopen eyes after 100-150ms
        const blinkDuration = 100 + Math.random() * 50;
        setTimeout(() => {
            if (this.vrm?.blendShapeProxy) {
                this.vrm.blendShapeProxy.setValue('blink', 0.0);
                this.vrm.blendShapeProxy.update();
            }
            this.isBlinking = false;
        }, blinkDuration);
    }
    
    /**
     * Expression System
     */
    setExpression(emotion, intensity = 1.0) {
        if (!this.vrm?.blendShapeProxy) return;
        
        // Clear previous expressions
        this.clearAllExpressions();
        
        const expressionMap = {
            'happy': 'joy',
            'sad': 'sorrow', 
            'angry': 'angry',
            'surprised': 'fun', // Using fun as approximation for surprise
            'neutral': null
        };
        
        const blendShapeName = expressionMap[emotion];
        if (blendShapeName) {
            this.vrm.blendShapeProxy.setValue(blendShapeName, intensity);
            this.vrm.blendShapeProxy.update();
        }
        
        this.currentExpression = emotion;
        console.log(`Set expression: ${emotion} (${intensity})`);
    }
    
    clearAllExpressions() {
        if (!this.vrm?.blendShapeProxy) return;
        
        const expressions = ['joy', 'sorrow', 'angry', 'fun'];
        expressions.forEach(expr => {
            this.vrm.blendShapeProxy.setValue(expr, 0.0);
        });
        this.vrm.blendShapeProxy.update();
    }
    
    /**
     * Lip Sync System
     */
    setupLipSync() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            
            console.log('Lip sync audio context initialized');
        } catch (error) {
            console.warn('Could not initialize audio context for lip sync:', error);
        }
    }
    
    enableLipSync(audioElement) {
        if (!this.audioContext || !this.analyser) return false;
        
        try {
            const source = this.audioContext.createMediaElementSource(audioElement);
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            this.lipSyncEnabled = true;
            this.startLipSyncLoop();
            
            console.log('Lip sync enabled for audio element');
            return true;
        } catch (error) {
            console.warn('Could not enable lip sync:', error);
            return false;
        }
    }
    
    startLipSyncLoop() {
        if (!this.lipSyncEnabled || !this.vrm?.blendShapeProxy) return;
        
        const updateLipSync = () => {
            if (!this.lipSyncEnabled) return;
            
            this.analyser.getByteTimeDomainData(this.lipSyncData);
            
            // Calculate volume (RMS)
            let sum = 0;
            for (let i = 0; i < this.lipSyncData.length; i++) {
                const sample = (this.lipSyncData[i] - 128) / 128;
                sum += sample * sample;
            }
            const volume = Math.sqrt(sum / this.lipSyncData.length);
            
            // Apply volume to mouth shapes with smoothing
            const mouthOpenness = Math.min(volume * 3, 1.0); // Amplify and clamp
            
            if (mouthOpenness > 0.1) {
                // Open mouth (A sound)
                this.vrm.blendShapeProxy.setValue('a', mouthOpenness);
                // Add slight variation with other vowels
                this.vrm.blendShapeProxy.setValue('i', mouthOpenness * 0.3);
            } else {
                // Close mouth when silent
                this.vrm.blendShapeProxy.setValue('a', 0);
                this.vrm.blendShapeProxy.setValue('i', 0);
                this.vrm.blendShapeProxy.setValue('u', 0);
                this.vrm.blendShapeProxy.setValue('e', 0);
                this.vrm.blendShapeProxy.setValue('o', 0);
            }
            
            this.vrm.blendShapeProxy.update();
            
            requestAnimationFrame(updateLipSync);
        };
        
        updateLipSync();
    }
    
    disableLipSync() {
        this.lipSyncEnabled = false;
        
        // Close mouth
        if (this.vrm?.blendShapeProxy) {
            const vowels = ['a', 'i', 'u', 'e', 'o'];
            vowels.forEach(vowel => {
                this.vrm.blendShapeProxy.setValue(vowel, 0);
            });
            this.vrm.blendShapeProxy.update();
        }
        
        console.log('Lip sync disabled');
    }
    
    /**
     * Text-to-Emotion Analysis
     */
    analyzeTextEmotion(text) {
        const lowerText = text.toLowerCase();
        
        // Simple keyword-based emotion detection
        const emotionKeywords = {
            'happy': ['happy', 'joy', 'excited', 'great', 'awesome', 'wonderful', 'amazing', '😊', '😄', '😃'],
            'sad': ['sad', 'sorry', 'disappointed', 'upset', 'cry', 'depressed', '😢', '😭', '😞'],
            'angry': ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'hate', '😠', '😡', '🤬'],
            'surprised': ['wow', 'amazing', 'incredible', 'unbelievable', 'shocked', 'surprised', '😲', '😱', '🤯']
        };
        
        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                return emotion;
            }
        }
        
        return 'neutral';
    }
    
    /**
     * React to chat message
     */
    reactToMessage(message, isUserMessage = false) {
        const emotion = this.analyzeTextEmotion(message);
        
        // Set appropriate expression
        this.setExpression(emotion, 0.7);
        
        // Return to neutral after a few seconds
        setTimeout(() => {
            this.setExpression('neutral');
        }, 3000 + Math.random() * 2000);
        
        console.log(`Reacting to message with emotion: ${emotion}`);
    }
    
    /**
     * Handle AI speaking (for TTS)
     */
    startSpeaking(audioElement) {
        console.log('VRM character started speaking');
        this.setExpression('happy', 0.5); // Slight smile when speaking
        
        if (audioElement) {
            this.enableLipSync(audioElement);
            
            // Stop lip sync when audio ends
            audioElement.addEventListener('ended', () => {
                this.stopSpeaking();
            });
        }
    }
    
    stopSpeaking() {
        console.log('VRM character stopped speaking');
        this.disableLipSync();
        this.setExpression('neutral');
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.blinkInterval) {
            clearTimeout(this.blinkInterval);
        }
        
        this.disableLipSync();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        console.log('VRM facial animations destroyed');
    }
}

// Export for use in other modules
window.VRMFacialAnimations = VRMFacialAnimations;