// ChatVRM-style Emotion and Animation Controller
import * as THREE from './libs/three.module.js';

// Constants for blinking
const BLINK_CLOSE_MAX = 0.12; // Time eyes stay closed (seconds)
const BLINK_OPEN_MAX = 5;     // Time eyes stay open (seconds)

export class AutoBlink {
  constructor(expressionManager) {
    this.expressionManager = expressionManager;
    this.remainingTime = 0;
    this.isOpen = true;
    this.isAutoBlink = true;
  }

  setEnable(isAuto) {
    this.isAutoBlink = isAuto;
    
    // If eyes are closed, return time until they open
    if (!this.isOpen) {
      return this.remainingTime;
    }
    return 0;
  }

  update(delta) {
    if (this.remainingTime > 0) {
      this.remainingTime -= delta;
      return;
    }

    if (this.isOpen && this.isAutoBlink) {
      this.close();
      return;
    }

    this.open();
  }

  close() {
    this.isOpen = false;
    this.remainingTime = BLINK_CLOSE_MAX;
    this.expressionManager.setValue('blink', 1);
  }

  open() {
    this.isOpen = true;
    this.remainingTime = BLINK_OPEN_MAX + Math.random() * 3; // Random variation
    this.expressionManager.setValue('blink', 0);
  }
}

export class ExpressionController {
  constructor(vrm) {
    this.vrm = vrm;
    this.expressionManager = vrm.expressionManager;
    this.currentEmotion = 'neutral';
    this.currentLipSync = null;
    
    if (this.expressionManager) {
      this.autoBlink = new AutoBlink(this.expressionManager);
      console.log('AutoBlink system initialized');
    }
    
    // Breathing animation variables
    this.breathingPhase = 0;
    this.breathingIntensity = 0.02;
  }

  playEmotion(preset) {
    if (!this.expressionManager) return;

    // Reset previous emotion
    if (this.currentEmotion !== 'neutral') {
      this.expressionManager.setValue(this.currentEmotion, 0);
    }

    if (preset === 'neutral') {
      this.autoBlink?.setEnable(true);
      this.currentEmotion = preset;
      return;
    }

    // Disable blinking during emotion
    const waitTime = this.autoBlink?.setEnable(false) || 0;
    this.currentEmotion = preset;
    
    setTimeout(() => {
      this.expressionManager.setValue(preset, 1);
      console.log(`Applied emotion: ${preset}`);
    }, waitTime * 1000);
  }

  lipSync(preset, value) {
    if (!this.expressionManager) return;

    if (this.currentLipSync) {
      this.expressionManager.setValue(this.currentLipSync.preset, 0);
    }
    
    this.currentLipSync = { preset, value };
  }

  // Audio-based lip sync for TTS responses following ChatVRM implementation guide
  startAudioLipSync(audioElement) {
    if (!audioElement || !this.expressionManager) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audioElement);
      const analyser = audioContext.createAnalyser();
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      let lipSyncActive = true;
      
      const updateLipSync = () => {
        if (!lipSyncActive || audioElement.ended || audioElement.paused) {
          // Stop lip sync and reset mouth
          this.lipSync('aa', 0);
          return;
        }
        
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume for mouth opening
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avgVolume = sum / bufferLength;
        
        // Map volume to mouth opening (0-1 range)
        const mouthOpen = Math.min(1, avgVolume / 128);
        
        // Use primary 'aa' shape for jaw movement
        this.lipSync('aa', mouthOpen * 0.8);
        
        requestAnimationFrame(updateLipSync);
      };
      
      audioElement.addEventListener('ended', () => {
        lipSyncActive = false;
        this.lipSync('aa', 0);
      });
      
      audioElement.addEventListener('pause', () => {
        lipSyncActive = false;
        this.lipSync('aa', 0);
      });
      
      updateLipSync();
    } catch (error) {
      console.log('Audio lip sync setup failed:', error);
    }
  }

  update(delta) {
    // Update auto blink
    if (this.autoBlink) {
      this.autoBlink.update(delta);
    }

    // Update lip sync
    if (this.currentLipSync && this.expressionManager) {
      const weight = this.currentEmotion === 'neutral' 
        ? this.currentLipSync.value * 0.5 
        : this.currentLipSync.value * 0.25;
      this.expressionManager.setValue(this.currentLipSync.preset, weight);
    }

    // Breathing animation
    this.updateBreathing(delta);
  }

  updateBreathing(delta) {
    if (!this.vrm.humanoid) return;

    this.breathingPhase += delta * 0.3; // Much slower breathing frequency

    const breathOffset = Math.sin(this.breathingPhase) * 0.003; // Extremely small breathing movement
    
    // Apply very subtle breathing to chest only
    const chest = this.vrm.humanoid.getNormalizedBoneNode('chest');
    if (chest) {
      chest.rotation.x = breathOffset;
    }
    
    // Minimal spine movement
    const spine = this.vrm.humanoid.getNormalizedBoneNode('spine');
    if (spine) {
      spine.rotation.x = breathOffset * 0.2;
    }
  }

  // Random micro expressions
  playRandomMicroExpression() {
    if (!this.expressionManager || this.currentEmotion !== 'neutral') return;

    const expressions = ['happy', 'surprised', 'relaxed'];
    const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
    const intensity = 0.1 + Math.random() * 0.2; // Low intensity
    
    this.expressionManager.setValue(randomExpression, intensity);
    
    setTimeout(() => {
      this.expressionManager.setValue(randomExpression, 0);
    }, 500 + Math.random() * 1000);
  }
}

export class IdleAnimationController {
  constructor(vrm) {
    this.vrm = vrm;
    this.time = 0;
    this.microMovementPhase = 0;
  }

  update(delta) {
    if (!this.vrm.humanoid) return;

    this.time += delta;
    this.microMovementPhase += delta * 0.8; // Breathing frequency

    // Very subtle head movement only during breathing
    const head = this.vrm.humanoid.getNormalizedBoneNode('head');
    if (head) {
      const breathSway = Math.sin(this.microMovementPhase) * 0.003; // Extremely small movement
      head.rotation.y = breathSway;
    }

    // DO NOT TOUCH ARMS - let fixTPose handle arm positioning

    // Random micro expressions every 30-60 seconds
    if (this.time > 30 && Math.random() < 0.00002) {
      this.time = 0;
      if (window.currentExpressionController) {
        window.currentExpressionController.playRandomMicroExpression();
      }
    }
  }
}