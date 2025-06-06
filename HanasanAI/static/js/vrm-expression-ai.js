// AI-Driven VRM Expression System (ChatVRM-Style)

// Emotion detection from AI responses
function detectEmotion(text) {
  const emotionPatterns = {
    happy: /\b(happy|joy|excited|glad|cheerful|delighted|pleased|wonderful|amazing|great|excellent|fantastic|awesome|love|smile|laugh)\b/i,
    sad: /\b(sad|sorry|upset|disappointed|regret|unfortunately|terrible|awful|tragedy|cry|tears|sorrow)\b/i,
    angry: /\b(angry|mad|furious|annoyed|frustrated|irritated|outraged|rage|hate|damn|stupid|ridiculous)\b/i,
    surprised: /\b(surprised|shocked|amazed|astonished|incredible|unbelievable|wow|omg|really|seriously)\b/i,
    neutral: /\b(okay|alright|understand|think|know|perhaps|maybe|consider|information|data|analysis)\b/i
  };

  let maxScore = 0;
  let detectedEmotion = 'neutral';

  for (const [emotion, pattern] of Object.entries(emotionPatterns)) {
    const matches = (text.match(pattern) || []).length;
    if (matches > maxScore) {
      maxScore = matches;
      detectedEmotion = emotion;
    }
  }

  return detectedEmotion;
}

// Apply AI-driven expression to VRM character
function applyAIExpression(responseText) {
  if (!window.currentVRM || !window.currentVRM.expressionManager) {
    console.warn('VRM not available for expression');
    return;
  }

  const emotion = detectEmotion(responseText);
  console.log('Detected emotion:', emotion, 'from text:', responseText.substring(0, 100) + '...');

  // Clear all expressions first
  const allExpressions = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'relaxed', 'blink'];
  allExpressions.forEach(expr => {
    try {
      window.currentVRM.expressionManager.setValue(expr, 0);
    } catch (e) {
      // Expression might not exist in this VRM
    }
  });

  // Apply detected emotion
  try {
    window.currentVRM.expressionManager.setValue(emotion, 1.0);
    console.log(`Applied ${emotion} expression`);
  } catch (e) {
    console.warn(`Expression ${emotion} not available, using neutral`);
    window.currentVRM.expressionManager.setValue('neutral', 1.0);
  }

  // Auto-reset to neutral after 4 seconds
  setTimeout(() => {
    if (window.currentVRM && window.currentVRM.expressionManager) {
      try {
        window.currentVRM.expressionManager.setValue(emotion, 0);
        window.currentVRM.expressionManager.setValue('neutral', 1.0);
      } catch (e) {
        // Fail silently
      }
    }
  }, 4000);
}

// Enhanced lip sync with emotion consideration
function startEnhancedLipSync(text, emotion = 'neutral') {
  if (!window.currentVRM || !window.currentVRM.expressionManager) return null;

  // Basic viseme patterns for different vowel sounds
  const visemeSequence = ['aa', 'ih', 'ou', 'ee', 'oh', 'aa'];
  let visemeIndex = 0;
  let speechDuration = Math.max(text.length * 50, 2000); // Estimate speech duration

  const lipSyncInterval = setInterval(() => {
    if (window.currentVRM && window.currentVRM.expressionManager) {
      // Clear previous visemes
      visemeSequence.forEach(v => {
        try {
          window.currentVRM.expressionManager.setValue(v, 0);
        } catch (e) {}
      });

      // Apply current viseme with intensity based on emotion
      let intensity = 0.7;
      if (emotion === 'happy') intensity = 0.9;
      if (emotion === 'sad') intensity = 0.5;
      if (emotion === 'angry') intensity = 0.8;

      try {
        window.currentVRM.expressionManager.setValue(visemeSequence[visemeIndex], intensity);
      } catch (e) {}

      visemeIndex = (visemeIndex + 1) % visemeSequence.length;
    }
  }, 180);

  // Stop lip sync after estimated speech duration
  setTimeout(() => {
    clearInterval(lipSyncInterval);
    if (window.currentVRM && window.currentVRM.expressionManager) {
      visemeSequence.forEach(v => {
        try {
          window.currentVRM.expressionManager.setValue(v, 0);
        } catch (e) {}
      });
    }
  }, speechDuration);

  return lipSyncInterval;
}

// Body gesture system for emotions
function applyEmotionalGesture(emotion) {
  if (!window.currentVRM || !window.currentVRM.humanoid) return;

  try {
    const head = window.currentVRM.humanoid.getNormalizedBoneNode('head') || window.currentVRM.humanoid.getRawBoneNode('head');
    
    if (head) {
      // Reset head rotation
      head.rotation.set(0, 0, 0);
      
      switch (emotion) {
        case 'happy':
          // Slight upward tilt and small nod
          head.rotation.x = -0.1;
          setTimeout(() => {
            if (head) head.rotation.x = -0.05;
          }, 500);
          break;
          
        case 'sad':
          // Downward tilt
          head.rotation.x = 0.15;
          break;
          
        case 'surprised':
          // Quick backward tilt
          head.rotation.x = -0.2;
          setTimeout(() => {
            if (head) head.rotation.x = -0.05;
          }, 300);
          break;
          
        case 'angry':
          // Slight forward tilt
          head.rotation.x = 0.1;
          break;
      }
    }
  } catch (error) {
    console.log('Gesture application failed:', error);
  }
}

// Main function to handle AI response with full VRM reaction
window.handleAIResponseWithVRM = function(responseText) {
  if (!responseText || !window.currentVRM) return;

  const emotion = detectEmotion(responseText);
  
  // Apply facial expression
  applyAIExpression(responseText);
  
  // Apply body gesture
  applyEmotionalGesture(emotion);
  
  // Start enhanced lip sync
  startEnhancedLipSync(responseText, emotion);
  
  console.log(`VRM reaction applied for emotion: ${emotion}`);
};

// Export functions for external use
window.detectEmotion = detectEmotion;
window.applyAIExpression = applyAIExpression;
window.startEnhancedLipSync = startEnhancedLipSync;
window.applyEmotionalGesture = applyEmotionalGesture;

console.log('VRM AI Expression system loaded');