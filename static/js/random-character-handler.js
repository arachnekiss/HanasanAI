// Random Character Selection Handler
export function initRandomCharacterButton() {
  const randomBtn = document.getElementById('randomCharacterBtn');
  
  if (!randomBtn) {
    console.log('Random character button not found');
    return;
  }

  randomBtn.addEventListener('click', async () => {
    try {
      console.log('Triggering random character selection...');
      
      // Import random selection system
      const { RandomSelection } = await import('./random-selection.js');
      const randomSelector = new RandomSelection();
      
      // Generate new random session
      const newSession = randomSelector.setRandomSession();
      console.log('New random session:', newSession);
      
      // Show loading state
      randomBtn.disabled = true;
      randomBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="animate-spin">
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
        </svg>
      `;
      
      // Reload the page to apply new character and background
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.log('Random selection error:', error);
      randomBtn.disabled = false;
      randomBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L13.09 8.26L19 7L17.74 13.09L22 14L15.74 16.09L17 22L10.91 20.74L10 24L8.09 17.74L2 19L3.26 12.91L0 12L6.26 9.91L5 4L11.09 5.26L12 2Z"/>
        </svg>
      `;
    }
  });
  
  console.log('Random character button initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRandomCharacterButton);
} else {
  initRandomCharacterButton();
}