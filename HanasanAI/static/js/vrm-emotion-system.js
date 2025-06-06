// Complete VRM Emotion and Animation System
import * as THREE from './libs/three.module.js';

// Animation mapping for emotions
const EMOTION_ANIMATIONS = {
  'neutral': 'idle_loop.vrma',
  'happy': '愛包ダンスホール.vrma',
  'excited': 'うでぶんぶん.vrma',
  'greeting': '挨拶.vrma',
  'victory': 'Vサイン.vrma',
  'exercise': '屈伸運動.vrma',
  'show': '全身を見せる.vrma',
  'spin': '回る.vrma',
  'shoot': '撃つ.vrma',
  'pose': 'モデルポーズ.vrma',
  'devil': 'デビルじゃないもん.vrma',
  'funny': 'パイパイ仮面でどうかしらん_.vrma',
  'dance': 'シカ色デイズ.vrma'
};

// Facial expressions for emotions
const EMOTION_EXPRESSIONS = {
  'neutral': 'neutral',
  'happy': 'happy',
  'excited': 'happy',
  'greeting': 'happy',
  'victory': 'happy',
  'exercise': 'neutral',
  'show': 'happy',
  'spin': 'happy',
  'shoot': 'neutral',
  'pose': 'neutral',
  'devil': 'angry',
  'funny': 'fun',
  'dance': 'happy',
  'sad': 'sad',
  'angry': 'angry',
  'surprised': 'surprised'
};

export class VRMEmotionSystem {
  constructor(vrm, mixer, expressionController) {
    this.vrm = vrm;
    this.mixer = mixer;
    this.expressionController = expressionController;
    this.currentEmotion = 'neutral';
    this.currentAction = null;
    this.animationCache = new Map();
    
    console.log('VRM Emotion System initialized');
  }

  async analyzeEmotion(text, inputType = 'text') {
    try {
      const response = await fetch('/api/analyze-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          input_type: inputType
        })
      });

      if (!response.ok) {
        throw new Error('Emotion analysis failed');
      }

      const result = await response.json();
      console.log('Emotion analyzed:', result);
      
      return {
        emotion: result.emotion || 'neutral',
        intensity: result.intensity || 0.5,
        animation: result.animation || 'idle_loop.vrma'
      };
    } catch (error) {
      console.log('Emotion analysis error:', error);
      return { emotion: 'neutral', intensity: 0.5, animation: 'idle_loop.vrma' };
    }
  }

  async loadVRMAnimation(animationFile) {
    if (this.animationCache.has(animationFile)) {
      return this.animationCache.get(animationFile);
    }

    try {
      // Official ChatVRM VRMA Animation implementation
      const { loadVRMAnimation } = await import('./chatvrm-vrma-animation.js');
      
      console.log(`Loading VRMA file: /static/vrma/${animationFile}`);
      
      const vrmAnimation = await loadVRMAnimation(`/static/vrma/${animationFile}`);
      
      if (vrmAnimation) {
        console.log(`Official ChatVRM VRMA loaded: ${animationFile}, duration: ${vrmAnimation.duration}s`);
        this.animationCache.set(animationFile, vrmAnimation);
        return vrmAnimation;
      } else {
        console.log(`No ChatVRM VRMA animations found in ${animationFile}`);
        return null;
      }
      
    } catch (error) {
      console.log(`VRM Animation loading failed for ${animationFile}:`, error);
      return null;
    }
  }

  async playEmotionAnimation(emotion, intensity = 1.0) {
    const animationFile = EMOTION_ANIMATIONS[emotion] || 'idle_loop.vrma';
    const expression = EMOTION_EXPRESSIONS[emotion] || 'neutral';
    
    console.log(`Playing emotion: ${emotion}, animation: ${animationFile}, expression: ${expression}`);

    // Apply facial expression
    if (this.expressionController) {
      this.expressionController.playEmotion(expression);
    }

    // Load and play animation using official ChatVRM VRMA system
    const vrmAnimation = await this.loadVRMAnimation(animationFile);
    
    if (vrmAnimation && window.vrmAnimationManager) {
      try {
        // Use official ChatVRM VRM Animation Manager
        const success = await window.vrmAnimationManager.playAnimation(vrmAnimation, {
          returnToIdle: emotion !== 'neutral'
        });
        
        if (success) {
          this.currentEmotion = emotion;
          console.log(`Playing VRM animation: ${vrmAnimation.constructor.name}, duration: ${vrmAnimation.duration}s`);
          return true;
        }
      } catch (error) {
        console.log('ChatVRM VRMA playback error:', error);
        return false;
      }
    }
    
    return false;
  }

  async reactToInput(inputText, inputType = 'text') {
    const emotionData = await this.analyzeEmotion(inputText, inputType);
    await this.playEmotionAnimation(emotionData.emotion, emotionData.intensity);
    return emotionData;
  }

  // Lip sync for voice output
  startLipSync(audioBuffer) {
    if (this.expressionController) {
      // Simulate lip sync by analyzing audio volume
      const audioContext = new AudioContext();
      audioContext.decodeAudioData(audioBuffer.slice(0), (decodedData) => {
        const duration = decodedData.duration;
        const sampleRate = decodedData.sampleRate;
        const channelData = decodedData.getChannelData(0);
        
        // Simple volume-based lip sync
        const frameSize = Math.floor(sampleRate / 30); // 30 FPS
        let currentFrame = 0;
        
        const lipSyncInterval = setInterval(() => {
          const start = currentFrame * frameSize;
          const end = Math.min(start + frameSize, channelData.length);
          
          if (start >= channelData.length) {
            clearInterval(lipSyncInterval);
            this.expressionController.lipSync('aa', 0);
            return;
          }
          
          // Calculate volume for this frame
          let volume = 0;
          for (let i = start; i < end; i++) {
            volume += Math.abs(channelData[i]);
          }
          volume = volume / (end - start);
          
          // Apply lip sync
          this.expressionController.lipSync('aa', volume * 3); // Amplify for visibility
          currentFrame++;
        }, 1000 / 30);
      });
    }
  }

  // Get current emotion state
  getCurrentEmotion() {
    return this.currentEmotion;
  }

  // Manual emotion trigger for testing
  triggerEmotion(emotion) {
    this.playEmotionAnimation(emotion);
  }
}

// Emotion detection keywords
const EMOTION_KEYWORDS = {
  'happy': ['happy', 'joy', 'excited', 'great', 'awesome', 'wonderful', 'fantastic', '😊', '😄', '😃'],
  'sad': ['sad', 'unhappy', 'depressed', 'down', 'blue', 'crying', '😢', '😭', '☹️'],
  'angry': ['angry', 'mad', 'furious', 'annoyed', 'irritated', '😠', '😡', '🤬'],
  'surprised': ['surprised', 'shocked', 'amazed', 'wow', 'omg', '😮', '😲', '🤯'],
  'greeting': ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon'],
  'victory': ['victory', 'win', 'success', 'yes', 'awesome', 'great job'],
  'dance': ['dance', 'music', 'party', 'fun', 'celebrate'],
  'exercise': ['exercise', 'workout', 'fitness', 'stretch', 'movement']
};

// Simple emotion detection fallback
export function detectEmotionFromText(text) {
  const lowerText = text.toLowerCase();
  
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return emotion;
      }
    }
  }
  
  return 'neutral';
}