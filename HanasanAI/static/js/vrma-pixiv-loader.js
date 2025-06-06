// Proper VRMA loader using Pixiv VRM libraries as per implementation guide
import * as THREE from './libs/three.module.js';

// Import VRM plugins - these should be the proper Pixiv libraries
let VRMLoaderPlugin, VRMAnimationLoaderPlugin, createVRMAnimationClip;

try {
  // Try to import from proper VRM libraries
  const vrmModule = await import('./libs/three-vrm.module.js');
  const vrmAnimModule = await import('./libs/three-vrm-animation.module.js');
  
  VRMLoaderPlugin = vrmModule.VRMLoaderPlugin;
  VRMAnimationLoaderPlugin = vrmAnimModule.VRMAnimationLoaderPlugin;
  createVRMAnimationClip = vrmAnimModule.createVRMAnimationClip;
  
  console.log('VRM libraries loaded successfully');
} catch (error) {
  console.log('VRM libraries not found, using fallback system');
}

// Proper VRMA loading function following the implementation guide
export async function loadVRMAnimationProper(url) {
  console.log('Loading VRMA with proper Pixiv loader from:', url);
  
  try {
    // Create GLTFLoader with proper VRM plugin registration
    const { GLTFLoader } = await import('./libs/three.module.js');
    const loader = new GLTFLoader();
    
    // Register VRM plugins as per the guide
    if (VRMLoaderPlugin && VRMAnimationLoaderPlugin) {
      loader.register(parser => new VRMLoaderPlugin(parser));
      loader.register(parser => new VRMAnimationLoaderPlugin(parser));
      console.log('VRM plugins registered successfully');
    } else {
      console.log('VRM plugins not available, using fallback');
      throw new Error('VRM plugins not loaded');
    }
    
    const gltf = await new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          console.log('VRMA file loaded:', gltf);
          console.log('VRM Animations:', gltf.userData.vrmAnimations);
          console.log('GLTF animations:', gltf.animations);
          resolve(gltf);
        },
        (progress) => {
          console.log('VRMA loading progress:', Math.round((progress.loaded / progress.total) * 100) + '%');
        },
        (error) => {
          console.log('VRMA loading error:', error);
          reject(error);
        }
      );
    });
    
    // Extract VRM animation as per guide
    if (gltf.userData.vrmAnimations && gltf.userData.vrmAnimations.length > 0) {
      const vrmAnimation = gltf.userData.vrmAnimations[0];
      console.log(`VRM Animation loaded successfully: duration ${vrmAnimation.duration}s`);
      
      // Return animation object with createAnimationClip method
      return {
        duration: vrmAnimation.duration,
        createAnimationClip: (vrm) => {
          if (createVRMAnimationClip) {
            const clip = createVRMAnimationClip(vrmAnimation, vrm);
            console.log(`Created VRM animation clip with ${clip.tracks.length} tracks`);
            return clip;
          } else {
            console.log('createVRMAnimationClip not available');
            return new THREE.AnimationClip('fallback', 2.0, []);
          }
        }
      };
    } else {
      console.log('No VRM animations found in userData');
      throw new Error('No VRM animations in file');
    }
    
  } catch (error) {
    console.log('VRM Animation loading failed:', error);
    throw error;
  }
}

// Enhanced fallback system that works with the VRM emotion system
export class EnhancedVRMAnimation {
  constructor(type, duration = 2.0) {
    this.duration = duration;
    this.type = type;
    this.tracks = this.createTracks(type, duration);
  }

  createTracks(type, duration) {
    const tracks = [];
    const times = [0, duration * 0.5, duration];
    
    switch (type) {
      case 'greeting':
      case 'wave':
        // Right arm wave - more pronounced
        tracks.push(new THREE.QuaternionKeyframeTrack(
          'rightUpperArm.quaternion',
          times,
          [
            0, 0, 0, 1,           // neutral
            -0.4, 0, 0, 0.917,    // raised
            0, 0, 0, 1            // neutral
          ]
        ));
        
        // Slight head turn to look friendly
        tracks.push(new THREE.QuaternionKeyframeTrack(
          'head.quaternion',
          times,
          [
            0, 0, 0, 1,
            0, 0.087, 0, 0.996,
            0, 0, 0, 1
          ]
        ));
        break;
        
      case 'show':
      case 'pose':
        // Both arms out to present
        tracks.push(new THREE.QuaternionKeyframeTrack(
          'rightUpperArm.quaternion',
          times,
          [0, 0, 0, 1, 0, 0, -0.3, 0.954, 0, 0, 0, 1]
        ));
        tracks.push(new THREE.QuaternionKeyframeTrack(
          'leftUpperArm.quaternion',
          times,
          [0, 0, 0, 1, 0, 0, 0.3, 0.954, 0, 0, 0, 1]
        ));
        break;
        
      case 'dance':
        // More complex dance with multiple keyframes
        const danceTimes = [0, duration * 0.25, duration * 0.5, duration * 0.75, duration];
        tracks.push(new THREE.QuaternionKeyframeTrack(
          'rightUpperArm.quaternion',
          danceTimes,
          [
            0, 0, 0, 1,
            -0.4, 0, 0, 0.917,
            0, 0, -0.3, 0.954,
            -0.2, 0, 0.2, 0.96,
            0, 0, 0, 1
          ]
        ));
        tracks.push(new THREE.QuaternionKeyframeTrack(
          'leftUpperArm.quaternion',
          danceTimes,
          [
            0, 0, 0, 1,
            0, 0, 0.4, 0.917,
            0, 0, 0.3, 0.954,
            0.2, 0, -0.2, 0.96,
            0, 0, 0, 1
          ]
        ));
        break;
        
      case 'spin':
        // Full body rotation
        tracks.push(new THREE.QuaternionKeyframeTrack(
          'hips.quaternion',
          [0, duration],
          [0, 0, 0, 1, 0, 1, 0, 0]
        ));
        break;
        
      default:
        // Subtle breathing
        tracks.push(new THREE.QuaternionKeyframeTrack(
          'chest.quaternion',
          times,
          [
            0, 0, 0, 1,
            0.005, 0, 0, 0.999988,
            0, 0, 0, 1
          ]
        ));
    }
    
    return tracks;
  }

  createAnimationClip(vrm) {
    const finalTracks = [];
    
    // Map track names to actual VRM bone nodes
    this.tracks.forEach(track => {
      const boneName = track.name.split('.')[0];
      const property = track.name.split('.')[1];
      
      // Map common names to VRM humanoid bone names
      const boneMap = {
        'rightUpperArm': 'rightUpperArm',
        'leftUpperArm': 'leftUpperArm',
        'rightLowerArm': 'rightLowerArm',
        'leftLowerArm': 'leftLowerArm',
        'head': 'head',
        'chest': 'chest',
        'hips': 'hips',
        'spine': 'spine'
      };
      
      const vrmBoneName = boneMap[boneName];
      if (vrmBoneName && vrm.humanoid) {
        const boneNode = vrm.humanoid.getNormalizedBoneNode(vrmBoneName);
        if (boneNode) {
          const newTrack = new THREE.QuaternionKeyframeTrack(
            boneNode.name + '.' + property,
            track.times,
            track.values
          );
          finalTracks.push(newTrack);
        }
      }
    });
    
    console.log(`Created enhanced animation clip (${this.type}) with ${finalTracks.length} tracks`);
    return new THREE.AnimationClip(`Enhanced_${this.type}`, this.duration, finalTracks);
  }
}

// Main export function that tries proper loading first, then falls back
export async function loadVRMAnimation(url) {
  try {
    // Try proper VRM loading first
    return await loadVRMAnimationProper(url);
  } catch (error) {
    console.log('Proper VRM loading failed, using enhanced fallback');
    
    // Determine animation type from filename
    const filename = url.split('/').pop();
    const typeMap = {
      'idle_loop.vrma': 'breathing',
      '挨拶.vrma': 'greeting',
      'うでぶんぶん.vrma': 'wave',
      '全身を見せる.vrma': 'show',
      '回る.vrma': 'spin',
      'Vサイン.vrma': 'wave',
      '愛包ダンスホール.vrma': 'dance',
      'シカ色デイズ.vrma': 'dance',
      'モデルポーズ.vrma': 'pose'
    };
    
    const animationType = typeMap[filename] || 'breathing';
    return new EnhancedVRMAnimation(animationType, 2.0);
  }
}