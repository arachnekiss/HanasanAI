// ChatVRM-main compatible VRM Animation Loader
import * as THREE from './libs/three.module.js';
import { GLTFLoader } from './libs/GLTFLoader.js';
import { VRMAnimationLoaderPlugin } from './libs/VRMAnimationLoaderPlugin.js';

// Create loader with VRMAnimationLoaderPlugin registered (ChatVRM approach)
const loader = new GLTFLoader();
loader.register((parser) => new VRMAnimationLoaderPlugin(parser));

export async function loadVRMAnimation(url) {
  try {
    const gltf = await loader.loadAsync(url);
    
    const vrmAnimations = gltf.userData.vrmAnimations;
    const vrmAnimation = vrmAnimations ? vrmAnimations[0] : undefined;
    
    return vrmAnimation || null;
  } catch (error) {
    console.warn('VRM Animation loading failed:', error);
    return null;
  }
}

// ChatVRM-style model class for animation management
export class VRMModel {
  constructor() {
    this.vrm = null;
    this.mixer = null;
    this.currentAction = null;
  }
  
  setVRM(vrm) {
    this.vrm = vrm;
    this.mixer = new THREE.AnimationMixer(vrm.scene);
  }
  
  async loadAnimation(vrmAnimation) {
    if (!this.vrm || !this.mixer) {
      throw new Error("VRM must be loaded first");
    }
    
    // Stop current animation
    if (this.currentAction) {
      this.currentAction.stop();
    }
    
    // Create and play new animation clip (ChatVRM method)
    const clip = vrmAnimation.createAnimationClip(this.vrm);
    this.currentAction = this.mixer.clipAction(clip);
    this.currentAction.reset().play();
    
    console.log(`Playing VRM animation: ${clip.name}, duration: ${clip.duration}s`);
    return this.currentAction;
  }
  
  update(deltaTime) {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
    if (this.vrm) {
      this.vrm.update(deltaTime);
    }
  }
}