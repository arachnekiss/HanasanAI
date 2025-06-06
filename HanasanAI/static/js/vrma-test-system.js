// VRMA Animation Test System
export function initVRMATestSystem() {
  console.log('Initializing VRMA test system...');
  
  // Test different animations sequentially
  const testAnimations = [
    { emotion: 'greeting', delay: 3000 },
    { emotion: 'happy', delay: 8000 },
    { emotion: 'victory', delay: 13000 },
    { emotion: 'show', delay: 18000 },
    { emotion: 'dance', delay: 23000 }
  ];
  
  testAnimations.forEach(({ emotion, delay }) => {
    setTimeout(() => {
      if (window.vrmEmotionSystem) {
        console.log(`Testing emotion: ${emotion}`);
        window.vrmEmotionSystem.playEmotionAnimation(emotion);
      }
    }, delay);
  });
  
  // Add keyboard controls for manual testing
  document.addEventListener('keydown', (event) => {
    if (!window.vrmEmotionSystem) return;
    
    const keyMap = {
      '1': 'neutral',
      '2': 'greeting',
      '3': 'happy',
      '4': 'victory',
      '5': 'show',
      '6': 'dance',
      '7': 'exercise',
      '8': 'spin'
    };
    
    const emotion = keyMap[event.key];
    if (emotion) {
      console.log(`Manual test - Playing emotion: ${emotion}`);
      window.vrmEmotionSystem.playEmotionAnimation(emotion);
    }
  });
  
  console.log('VRMA test system ready. Press keys 1-8 to test animations.');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initVRMATestSystem, 5000);
  });
} else {
  setTimeout(initVRMATestSystem, 5000);
}