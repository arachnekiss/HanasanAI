// VRM Boot Module - Using local modules to fix CDN import failures
import * as THREE from '/static/js/libs/three.module.js';
import { GLTFLoader } from '/static/js/libs/GLTFLoader.js';
import { OrbitControls } from '/static/js/libs/OrbitControls.js';
import { VRM, VRMLoaderPlugin, VRMUtils } from '/static/js/libs/three-vrm.module.js';
import { VRMAnimationLoaderPlugin, loadVRMAnimation } from '/static/js/libs/VRMAnimationLoaderPlugin.js';

import initVRM from '/static/js/vrm-character-final.js';

console.log('Three.js and VRM modules loaded');
console.log('Three.js version:', THREE.REVISION);

// Retry mechanism for canvas initialization
function tryInitVRM(attempt = 1) {
  const canvas = document.getElementById('vrm-canvas');
  if (canvas) {
    console.log('Canvas found, size:', canvas.clientWidth, 'x', canvas.clientHeight);
    try {
      // Initialize VRM with imported dependencies including animation plugin
      initVRM({ THREE, GLTFLoader, OrbitControls, VRM, VRMLoaderPlugin, VRMUtils, VRMAnimationLoaderPlugin, loadVRMAnimation });
      console.log('VRM Character system initialized successfully');
    } catch (error) {
      console.error('VRM initialization failed:', error);
    }
  } else if (attempt <= 5) {
    console.warn(`VRM canvas not found, retrying... (attempt ${attempt})`);
    const delay = 100 * Math.pow(2, attempt);  // 100ms, 200ms, 400ms, 800ms, 1600ms
    setTimeout(() => tryInitVRM(attempt + 1), delay);
  } else {
    console.error("VRM canvas not found after multiple attempts - check HTML template");
  }
}

// Use multiple initialization strategies for reliability
if (document.readyState !== 'loading') {
  // DOM is already ready
  console.log('DOM already ready, starting VRM initialization');
  tryInitVRM();
} else {
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting VRM initialization');
    tryInitVRM();
  });
}

// Backup: use window.onload as fallback
window.addEventListener('load', () => {
  // Only try if we haven't successfully initialized yet
  if (!window.currentVRM) {
    console.log('Window loaded, attempting VRM initialization as fallback');
    tryInitVRM();
  }
});