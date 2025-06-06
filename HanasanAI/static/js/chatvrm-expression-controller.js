/**
 * ChatVRM Expression Controller
 * Based on ChatVRM-main/src/features/emoteController/expressionController.ts
 */

class ExpressionController {
    constructor(vrm, camera) {
        this._vrm = vrm;
        this._camera = camera;
        this._expressionManager = vrm.expressionManager;
        this._currentEmotion = "neutral";
        this._currentLipSync = null;
        
        // Initialize AutoBlink if expression manager exists
        if (this._expressionManager && window.AutoBlink) {
            this._autoBlink = new window.AutoBlink(this._expressionManager);
        }
        
        console.log('ExpressionController initialized with expression manager:', !!this._expressionManager);
    }

    playEmotion(preset) {
        if (!this._expressionManager) {
            console.warn('No expression manager available');
            return;
        }

        // Clear current emotion if not neutral
        if (this._currentEmotion !== "neutral") {
            this._expressionManager.setValue(this._currentEmotion, 0);
        }

        // If setting to neutral, enable auto blink
        if (preset === "neutral") {
            if (this._autoBlink) {
                this._autoBlink.setEnable(true);
            }
            this._currentEmotion = preset;
            return;
        }

        // Disable auto blink for expressions and get wait time
        const waitTime = this._autoBlink ? this._autoBlink.setEnable(false) : 0;
        this._currentEmotion = preset;
        
        // Apply expression after waiting for eyes to open
        setTimeout(() => {
            if (this._expressionManager) {
                this._expressionManager.setValue(preset, 1);
                console.log('Applied expression:', preset);
            }
        }, waitTime * 1000);
    }

    lipSync(preset, value) {
        if (!this._expressionManager) return;

        // Clear previous lip sync
        if (this._currentLipSync) {
            this._expressionManager.setValue(this._currentLipSync.preset, 0);
        }

        this._currentLipSync = {
            preset: preset,
            value: value
        };
    }

    update(delta) {
        // Update auto blink
        if (this._autoBlink) {
            this._autoBlink.update(delta);
        }

        // Update lip sync
        if (this._currentLipSync && this._expressionManager) {
            // Adjust lip sync intensity based on current emotion
            const weight = this._currentEmotion === "neutral" 
                ? this._currentLipSync.value * 0.5 
                : this._currentLipSync.value * 0.25;
            
            this._expressionManager.setValue(this._currentLipSync.preset, weight);
        }
    }

    // Map emotion names to VRM expression presets
    getVRMExpression(emotion) {
        const emotionMap = {
            'happy': 'happy',
            'joy': 'happy',
            'sad': 'sad',
            'angry': 'angry',
            'surprised': 'surprised',
            'fear': 'sad',
            'neutral': 'neutral'
        };
        
        return emotionMap[emotion.toLowerCase()] || 'neutral';
    }
}

// Export for use in other scripts
window.ExpressionController = ExpressionController;