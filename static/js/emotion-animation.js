// Emotion-triggered VRM Animation System
// Based on ChatVRM emotion detection and animation mapping

class EmotionAnimationController {
  constructor() {
    this.currentEmotion = 'neutral';
    this.isAnimating = false;
    
    // Emotion to animation mapping
    this.emotionToAnimation = {
      neutral: "idle_loop.vrma",
      happy: "idle_loop.vrma", // Can be replaced with happy dance
      joyful: "idle_loop.vrma", // Can be replaced with excited dance
      angry: "idle_loop.vrma",  // Can be replaced with angry gesture
      surprised: "idle_loop.vrma",
      sad: "idle_loop.vrma",
      greeting: "idle_loop.vrma" // Can be replaced with wave animation
    };
    
    // Emotion to facial expression mapping
    this.emotionToExpression = {
      neutral: null,
      happy: 'joy',
      joyful: 'joy',
      angry: 'angry',
      surprised: 'surprised', 
      sad: 'sorrow',
      greeting: 'joy'
    };
  }

  // Detect emotion from AI response text
  detectEmotion(text) {
    const emotionKeywords = {
      happy: ['happy', 'glad', 'pleased', 'wonderful', 'great', 'awesome', '!', '😊', '😄'],
      joyful: ['excited', 'amazing', 'fantastic', 'brilliant', 'excellent', '!!', '🎉'],
      angry: ['angry', 'frustrated', 'annoyed', 'mad', 'furious', 'upset'],
      surprised: ['wow', 'amazing', 'incredible', 'unbelievable', 'surprising', '!?', '😮'],
      sad: ['sad', 'sorry', 'disappointed', 'unfortunately', 'regret', '😢'],
      greeting: ['hello', 'hi', 'hey', 'greetings', 'welcome', 'nice to meet']
    };

    const lowerText = text.toLowerCase();
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return emotion;
        }
      }
    }
    
    return 'neutral';
  }

  // Apply emotion animation and expression
  async applyEmotion(emotion, vrm, mixer) {
    if (!vrm || !mixer) return;
    
    this.currentEmotion = emotion;
    
    try {
      // Apply facial expression
      this.applyFacialExpression(emotion, vrm);
      
      // Play emotion animation if available
      await this.playEmotionAnimation(emotion, vrm, mixer);
      
      console.log(`Applied emotion: ${emotion}`);
    } catch (error) {
      console.log('Emotion application failed:', error);
    }
  }

  // Apply facial expression based on emotion
  applyFacialExpression(emotion, vrm) {
    if (!vrm.expressionManager && !vrm.blendShapeProxy) return;
    
    const expressionManager = vrm.expressionManager || vrm.blendShapeProxy;
    const expressionName = this.emotionToExpression[emotion];
    
    // Reset all expressions
    const allExpressions = ['joy', 'angry', 'sorrow', 'surprised', 'fun'];
    allExpressions.forEach(expr => {
      try {
        expressionManager.setValue(expr, 0);
      } catch (e) {
        // Expression not available on this model
      }
    });
    
    // Apply target expression
    if (expressionName) {
      try {
        expressionManager.setValue(expressionName, 1.0);
        console.log(`Applied facial expression: ${expressionName}`);
      } catch (error) {
        console.log(`Expression ${expressionName} not available on this model`);
      }
    }
  }

  // Play emotion-specific animation
  async playEmotionAnimation(emotion, vrm, mixer) {
    const animationFile = this.emotionToAnimation[emotion];
    if (!animationFile || animationFile === "idle_loop.vrma") {
      return; // Use current idle animation
    }
    
    try {
      // Import animation loader
      const { loadVRMAnimation } = await import('./libs/VRMAnimationLoaderPlugin.js');
      
      // Load emotion animation
      const vrmAnimation = await loadVRMAnimation(`/static/vrm-animations/${animationFile}`);
      if (vrmAnimation) {
        const clip = vrmAnimation.createAnimationClip(vrm);
        if (clip && clip.tracks.length > 0) {
          const action = mixer.clipAction(clip);
          action.setLoop(THREE.LoopOnce);
          action.reset().play();
          
          // Return to idle after animation
          action.onFinish = () => {
            this.returnToIdle(vrm, mixer);
          };
          
          this.isAnimating = true;
          console.log(`Playing emotion animation: ${animationFile}`);
        }
      }
    } catch (error) {
      console.log('Emotion animation loading failed:', error);
    }
  }

  // Return to idle animation and neutral expression
  returnToIdle(vrm, mixer) {
    this.isAnimating = false;
    
    // Reset to neutral expression
    this.applyFacialExpression('neutral', vrm);
    
    // Continue idle animation (should already be playing)
    console.log('Returned to idle state');
  }

  // Get current emotion state
  getCurrentEmotion() {
    return this.currentEmotion;
  }
  
  // Check if currently playing emotion animation
  isPlayingEmotion() {
    return this.isAnimating;
  }
}

// Global emotion controller instance
window.emotionController = new EmotionAnimationController();

// Export for use in other modules
export default EmotionAnimationController;