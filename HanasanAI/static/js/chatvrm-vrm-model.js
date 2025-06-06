// Official ChatVRM VRM Model implementation
// Based on ChatVRM-main/src/features/vrmViewer/model.ts

export class VRMModel {
  constructor() {
    this.vrm = null;
    this.mixer = null;
    this.currentAction = null;
    this.animationClips = new Map();
  }

  setVRM(vrm) {
    this.vrm = vrm;
    
    // Create animation mixer for the VRM scene
    if (vrm.scene) {
      this.mixer = new THREE.AnimationMixer(vrm.scene);
      console.log('VRM Model: Animation mixer created');
    }
  }

  async loadAnimation(vrmAnimation) {
    if (!this.vrm || !this.mixer) {
      console.log('VRM Model: No VRM or mixer available for animation');
      return false;
    }

    try {
      // Create animation clip using official ChatVRM method
      const animationClip = vrmAnimation.createAnimationClip(this.vrm);
      
      if (animationClip.tracks.length === 0) {
        console.log('VRM Model: No tracks in animation clip');
        return false;
      }

      // Stop current animation
      if (this.currentAction) {
        this.currentAction.fadeOut(0.3);
      }

      // Create and configure new action
      const action = this.mixer.clipAction(animationClip);
      action.reset();
      
      // Configure loop behavior
      if (animationClip.name.includes('idle') || animationClip.name.includes('loop')) {
        action.setLoop(THREE.LoopRepeat);
      } else {
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
      }

      // Play animation
      action.fadeIn(0.3);
      action.play();
      
      this.currentAction = action;
      
      console.log(`VRM Model: Playing animation "${animationClip.name}", duration: ${vrmAnimation.duration}s`);
      return true;

    } catch (error) {
      console.log('VRM Model: Animation loading error:', error);
      return false;
    }
  }

  update(deltaTime) {
    // Update animation mixer
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }

    // Update VRM (expressions, spring bones, etc.)
    if (this.vrm) {
      this.vrm.update(deltaTime);
    }
  }

  stopCurrentAnimation() {
    if (this.currentAction) {
      this.currentAction.fadeOut(0.5);
      this.currentAction = null;
    }
  }

  dispose() {
    this.stopCurrentAnimation();
    
    if (this.mixer) {
      this.mixer.uncacheRoot(this.mixer.getRoot());
    }
    
    this.vrm = null;
    this.mixer = null;
    this.animationClips.clear();
  }
}

// Enhanced VRM Animation Integration System
export class VRMAnimationManager {
  constructor(vrmModel) {
    this.vrmModel = vrmModel;
    this.animationQueue = [];
    this.isPlaying = false;
    this.defaultIdleAnimation = null;
  }

  async setDefaultIdleAnimation(animationFile) {
    try {
      const { loadVRMAnimation } = await import('./chatvrm-vrma-animation.js');
      this.defaultIdleAnimation = await loadVRMAnimation(`/static/vrma/${animationFile}`);
      
      if (this.defaultIdleAnimation) {
        console.log('VRM Animation Manager: Default idle animation set');
        this.defaultIdleAnimation.isIdle = true;
        return this.playAnimation(this.defaultIdleAnimation, { returnToIdle: false });
      }
    } catch (error) {
      console.log('VRM Animation Manager: Failed to set default idle:', error);
    }
    return false;
  }

  async playAnimation(vrmAnimation, options = {}) {
    if (!vrmAnimation) return false;

    const success = await this.vrmModel.loadAnimation(vrmAnimation);
    
    if (success) {
      this.isPlaying = true;
      
      // Auto-return to idle after action animations
      if (options.returnToIdle !== false && !vrmAnimation.isIdle) {
        setTimeout(() => {
          this.returnToIdle();
        }, vrmAnimation.duration * 1000);
      }
    }
    
    return success;
  }

  async playAnimationByFile(animationFile, options = {}) {
    try {
      const { loadVRMAnimation } = await import('./chatvrm-vrma-animation.js');
      const vrmAnimation = await loadVRMAnimation(`/static/vrma/${animationFile}`);
      
      if (vrmAnimation) {
        return this.playAnimation(vrmAnimation, options);
      }
    } catch (error) {
      console.log('VRM Animation Manager: Failed to play animation file:', error);
    }
    return false;
  }

  returnToIdle() {
    if (this.defaultIdleAnimation) {
      this.playAnimation(this.defaultIdleAnimation, { returnToIdle: false });
    }
  }

  stop() {
    this.vrmModel.stopCurrentAnimation();
    this.isPlaying = false;
  }

  update(deltaTime) {
    this.vrmModel.update(deltaTime);
  }
}