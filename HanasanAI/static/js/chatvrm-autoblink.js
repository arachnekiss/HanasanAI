/**
 * ChatVRM Auto Blink Controller
 * Based on ChatVRM-main/src/features/emoteController/autoBlink.ts
 */

// Blink timing constants
const BLINK_CLOSE_MAX = 0.12; // Time eyes are closed (sec)
const BLINK_OPEN_MAX = 5;     // Time eyes are open (sec)

class AutoBlink {
    constructor(expressionManager) {
        this._expressionManager = expressionManager;
        this._remainingTime = 0;
        this._isOpen = true;
        this._isAutoBlink = true;
        
        console.log('AutoBlink initialized');
    }

    /**
     * Enable/disable auto blinking
     * Returns time until eyes open (for expression timing)
     */
    setEnable(isAuto) {
        this._isAutoBlink = isAuto;
        
        // If eyes are closed, return time until they open
        if (!this._isOpen) {
            return this._remainingTime;
        }
        
        return 0;
    }

    update(delta) {
        if (this._remainingTime > 0) {
            this._remainingTime -= delta;
            return;
        }

        if (this._isOpen && this._isAutoBlink) {
            this.close();
            return;
        }

        this.open();
    }

    close() {
        this._isOpen = false;
        this._remainingTime = BLINK_CLOSE_MAX;
        
        if (this._expressionManager) {
            this._expressionManager.setValue("blink", 1);
        }
    }

    open() {
        this._isOpen = true;
        this._remainingTime = BLINK_OPEN_MAX + Math.random() * 3; // Add randomness
        
        if (this._expressionManager) {
            this._expressionManager.setValue("blink", 0);
        }
    }
}

// Export for use in other scripts
window.AutoBlink = AutoBlink;