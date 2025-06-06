// VRM Chat Integration - Emotion-based character reactions
class VRMChatIntegration {
  constructor() {
    this.isInitialized = false;
    this.currentEmotion = 'neutral';
    this.lastInteractionTime = Date.now();
    this.init();
  }

  async init() {
    // Wait for VRM character to be loaded
    if (!window.vrmEmotionSystem) {
      setTimeout(() => this.init(), 500);
      return;
    }

    this.isInitialized = true;
    console.log('VRM Chat Integration initialized');
    
    // Set up chat input monitoring
    this.setupChatMonitoring();
    
    // Set up voice input monitoring
    this.setupVoiceMonitoring();
    
    // Set up idle behavior
    this.setupIdleBehavior();
  }

  setupChatMonitoring() {
    // Monitor chat input for emotion analysis
    const chatInput = document.querySelector('#message-input');
    const sendButton = document.querySelector('#send-button');
    
    if (chatInput) {
      // React to typing
      chatInput.addEventListener('input', (e) => {
        this.onUserTyping(e.target.value);
      });
      
      // React to message sending
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.onUserMessage(e.target.value);
        }
      });
    }
    
    if (sendButton) {
      sendButton.addEventListener('click', () => {
        const message = chatInput?.value;
        if (message) {
          this.onUserMessage(message);
        }
      });
    }
    
    // Monitor AI responses for appropriate reactions
    this.observeChatResponses();
  }

  setupVoiceMonitoring() {
    // Monitor voice input if available
    const voiceButton = document.querySelector('#voice-button');
    if (voiceButton) {
      voiceButton.addEventListener('click', () => {
        this.onVoiceStart();
      });
    }
  }

  setupIdleBehavior() {
    // Return to idle animation after period of inactivity
    setInterval(() => {
      const timeSinceLastInteraction = Date.now() - this.lastInteractionTime;
      
      // Return to idle after 10 seconds of inactivity
      if (timeSinceLastInteraction > 10000 && this.currentEmotion !== 'neutral') {
        this.playCharacterEmotion('neutral');
      }
      
      // Random idle variations every 30-60 seconds
      if (timeSinceLastInteraction > 30000 && Math.random() < 0.1) {
        const idleVariations = ['neutral', 'show', 'pose'];
        const randomIdle = idleVariations[Math.floor(Math.random() * idleVariations.length)];
        this.playCharacterEmotion(randomIdle);
      }
    }, 5000);
  }

  observeChatResponses() {
    // Use MutationObserver to watch for new chat messages
    const chatContainer = document.querySelector('#chat-container');
    if (!chatContainer) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && 
                node.classList?.contains('ai-message')) {
              const messageText = node.textContent || '';
              this.onAIResponse(messageText);
            }
          });
        }
      });
    });

    observer.observe(chatContainer, {
      childList: true,
      subtree: true
    });
  }

  async onUserTyping(text) {
    if (!this.isInitialized || !text.trim()) return;
    
    // Show anticipation while user is typing
    if (text.length > 5 && this.currentEmotion === 'neutral') {
      this.playCharacterEmotion('show'); // Show interest
    }
  }

  async onUserMessage(message) {
    if (!this.isInitialized) return;
    
    this.lastInteractionTime = Date.now();
    
    // Analyze user message emotion and react
    try {
      const emotionData = await this.analyzeMessageEmotion(message);
      
      // React to user's emotion with appropriate character response
      let reactionEmotion = this.getReactionEmotion(emotionData.emotion);
      await this.playCharacterEmotion(reactionEmotion);
      
      console.log(`User emotion: ${emotionData.emotion}, Character reaction: ${reactionEmotion}`);
      
    } catch (error) {
      console.log('Error analyzing user message:', error);
    }
  }

  async onAIResponse(responseText) {
    if (!this.isInitialized) return;
    
    this.lastInteractionTime = Date.now();
    
    // Analyze AI response and show appropriate emotion
    try {
      const emotionData = await this.analyzeMessageEmotion(responseText);
      await this.playCharacterEmotion(emotionData.emotion);
      
      // Start lip sync if available
      this.startLipSyncForResponse(responseText);
      
    } catch (error) {
      console.log('Error analyzing AI response:', error);
    }
  }

  onVoiceStart() {
    if (!this.isInitialized) return;
    
    this.lastInteractionTime = Date.now();
    this.playCharacterEmotion('greeting'); // Show attention to voice input
  }

  async analyzeMessageEmotion(text) {
    try {
      const response = await fetch('/api/analyze-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          input_type: 'text'
        })
      });

      if (!response.ok) {
        throw new Error('Emotion analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.log('Emotion analysis error:', error);
      return { emotion: 'neutral', intensity: 0.5 };
    }
  }

  getReactionEmotion(userEmotion) {
    // Map user emotions to appropriate character reactions
    const reactionMap = {
      'happy': 'happy',
      'excited': 'excited', 
      'sad': 'greeting', // Comforting response
      'angry': 'greeting', // Calming response
      'surprised': 'surprised',
      'greeting': 'greeting',
      'victory': 'victory',
      'dance': 'dance',
      'exercise': 'exercise',
      'neutral': 'neutral'
    };
    
    return reactionMap[userEmotion] || 'neutral';
  }

  async playCharacterEmotion(emotion) {
    if (!window.vrmEmotionSystem) return;
    
    try {
      await window.vrmEmotionSystem.playEmotionAnimation(emotion);
      this.currentEmotion = emotion;
    } catch (error) {
      console.log('Error playing character emotion:', error);
    }
  }

  async startLipSyncForResponse(text) {
    if (!window.currentExpressionController) return;
    
    // Try to use Web Speech API for TTS with audio-based lip sync
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      // Create audio element to capture speech synthesis
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      utterance.onstart = () => {
        // Start simple lip sync animation
        this.simulateLipSyncFromText(text);
      };
      
      utterance.onend = () => {
        // Stop lip sync
        window.currentExpressionController.lipSync('aa', 0);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback to text-based simulation
      this.simulateLipSyncFromText(text);
    }
  }

  simulateLipSyncFromText(text) {
    if (!window.currentExpressionController) return;
    
    const words = text.split(' ');
    const duration = words.length * 250; // Speaking duration
    
    let currentTime = 0;
    const interval = setInterval(() => {
      if (currentTime >= duration) {
        clearInterval(interval);
        window.currentExpressionController.lipSync('aa', 0);
        return;
      }
      
      // Simulate mouth movement with vowel patterns
      const vowelPatterns = ['aa', 'ee', 'oh', 'aa'];
      const patternIndex = Math.floor((currentTime / 200) % vowelPatterns.length);
      const intensity = 0.4 + Math.random() * 0.3;
      
      window.currentExpressionController.lipSync(vowelPatterns[patternIndex], intensity);
      currentTime += 100;
    }, 100);
  }

  // Manual emotion triggers for testing
  triggerEmotion(emotion) {
    this.playCharacterEmotion(emotion);
  }

  // Test all animations
  async testAllAnimations() {
    const emotions = ['neutral', 'happy', 'excited', 'greeting', 'victory', 'dance', 'exercise', 'show', 'spin', 'pose'];
    
    for (let i = 0; i < emotions.length; i++) {
      await this.playCharacterEmotion(emotions[i]);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds between animations
    }
    
    // Return to neutral
    await this.playCharacterEmotion('neutral');
  }
}

// Initialize VRM Chat Integration when page loads
window.addEventListener('load', () => {
  window.vrmChatIntegration = new VRMChatIntegration();
});

// Export for manual testing
window.testVRMEmotion = (emotion) => {
  if (window.vrmChatIntegration) {
    window.vrmChatIntegration.triggerEmotion(emotion);
  }
};

window.testAllVRMAnimations = () => {
  if (window.vrmChatIntegration) {
    window.vrmChatIntegration.testAllAnimations();
  }
};