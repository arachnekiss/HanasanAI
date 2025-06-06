// Simplified VRMA loader based on ChatVRM implementation guide
import * as THREE from './libs/three.module.js';

export class SimpleVRMAnimation {
  constructor() {
    this.duration = 0.0;
    this.humanoidTracks = new Map();
    this.expressionTracks = new Map();
  }

  // Create animation clip from VRM animation data
  createAnimationClip(vrm) {
    const tracks = [];
    
    // Process humanoid bone tracks
    for (const [boneName, trackData] of this.humanoidTracks) {
      const boneNode = vrm.humanoid?.getNormalizedBoneNode(boneName);
      if (boneNode) {
        const track = new THREE.QuaternionKeyframeTrack(
          boneNode.name + '.quaternion',
          trackData.times,
          trackData.values
        );
        tracks.push(track);
      }
    }

    // Process expression tracks
    if (vrm.expressionManager) {
      for (const [expressionName, trackData] of this.expressionTracks) {
        const trackName = `expressions.${expressionName}.weight`;
        const track = new THREE.NumberKeyframeTrack(
          trackName,
          trackData.times,
          trackData.values
        );
        tracks.push(track);
      }
    }

    console.log(`Created animation clip with ${tracks.length} tracks, duration: ${this.duration}`);
    return new THREE.AnimationClip("VRMAnimation", this.duration, tracks);
  }
}

// Simple VRMA loader that handles both .vrma and fallback animations
export async function loadVRMAnimation(url) {
  console.log('Loading VRMA from:', url);
  
  try {
    const { GLTFLoader } = await import('./libs/three.module.js');
    
    const loader = new GLTFLoader();
    
    const gltf = await new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          console.log('GLTF animation file loaded successfully');
          resolve(gltf);
        },
        (progress) => {
          // Progress logging
        },
        (error) => {
          console.log('GLTF animation loading error:', error);
          reject(error);
        }
      );
    });
    
    // Try to extract VRM animation data
    const animation = new SimpleVRMAnimation();
    
    if (gltf.animations && gltf.animations.length > 0) {
      const gltfAnimation = gltf.animations[0];
      animation.duration = gltfAnimation.duration;
      
      console.log(`Processing GLTF animation with ${gltfAnimation.tracks.length} tracks`);
      
      // Convert GLTF tracks to VRM format
      gltfAnimation.tracks.forEach(track => {
        const trackName = track.name;
        
        // Parse track name to identify bone and property
        if (trackName.includes('.quaternion')) {
          const boneName = trackName.replace('.quaternion', '');
          
          // Map common bone names to VRM humanoid bone names
          const boneMap = {
            'Hips': 'hips',
            'Spine': 'spine',
            'Chest': 'chest',
            'UpperChest': 'upperChest',
            'Neck': 'neck',
            'Head': 'head',
            'LeftShoulder': 'leftShoulder',
            'LeftUpperArm': 'leftUpperArm',
            'LeftLowerArm': 'leftLowerArm',
            'LeftHand': 'leftHand',
            'RightShoulder': 'rightShoulder',
            'RightUpperArm': 'rightUpperArm',
            'RightLowerArm': 'rightLowerArm',
            'RightHand': 'rightHand',
            'LeftUpperLeg': 'leftUpperLeg',
            'LeftLowerLeg': 'leftLowerLeg',
            'LeftFoot': 'leftFoot',
            'RightUpperLeg': 'rightUpperLeg',
            'RightLowerLeg': 'rightLowerLeg',
            'RightFoot': 'rightFoot'
          };
          
          const vrmBoneName = boneMap[boneName] || boneName.toLowerCase();
          
          animation.humanoidTracks.set(vrmBoneName, {
            times: track.times,
            values: track.values
          });
          
          console.log(`Added rotation track for bone: ${vrmBoneName}`);
        }
        
        // Handle expression tracks
        if (trackName.includes('blendShape') || trackName.includes('expression')) {
          const expressionName = trackName.split('.').pop();
          animation.expressionTracks.set(expressionName, {
            times: track.times,
            values: track.values
          });
          
          console.log(`Added expression track: ${expressionName}`);
        }
      });
      
      console.log(`VRM Animation loaded: ${animation.humanoidTracks.size} bone tracks, ${animation.expressionTracks.size} expression tracks`);
      return animation;
    }
    
    console.log('No animations found in GLTF file');
    return null;
    
  } catch (error) {
    console.log('VRM Animation loading failed:', error);
    
    // Fallback: create a simple idle animation
    console.log('Creating fallback idle animation');
    const fallbackAnimation = new SimpleVRMAnimation();
    fallbackAnimation.duration = 2.0;
    
    // Create simple breathing animation for chest
    const breathingTimes = [0, 1, 2];
    const breathingValues = [
      0, 0, 0, 1,  // neutral
      0.02, 0, 0, 0.9998,  // slight rotation
      0, 0, 0, 1   // back to neutral
    ];
    
    fallbackAnimation.humanoidTracks.set('chest', {
      times: breathingTimes,
      values: breathingValues
    });
    
    console.log('Fallback idle animation created');
    return fallbackAnimation;
  }
}

// Export a function to create basic animations if VRMA files fail
export function createBasicAnimation(type, duration = 2.0) {
  const animation = new SimpleVRMAnimation();
  animation.duration = duration;
  
  const times = [0, duration * 0.5, duration];
  
  switch (type) {
    case 'wave':
    case 'greeting':
      // Wave animation - rotate right upper arm
      animation.humanoidTracks.set('rightUpperArm', {
        times: times,
        values: [
          0, 0, 0, 1,           // neutral
          -0.3, 0, 0, 0.954,    // raised
          0, 0, 0, 1            // back to neutral
        ]
      });
      break;
      
    case 'pose':
    case 'show':
      // Show pose - both arms slightly out
      animation.humanoidTracks.set('rightUpperArm', {
        times: times,
        values: [
          0, 0, 0, 1,
          0, 0, -0.2, 0.98,
          0, 0, 0, 1
        ]
      });
      animation.humanoidTracks.set('leftUpperArm', {
        times: times,
        values: [
          0, 0, 0, 1,
          0, 0, 0.2, 0.98,
          0, 0, 0, 1
        ]
      });
      break;
      
    case 'spin':
      // Full body spin
      animation.humanoidTracks.set('hips', {
        times: [0, duration],
        values: [
          0, 0, 0, 1,           // start
          0, 1, 0, 0            // 180 degree turn
        ]
      });
      break;
      
    case 'dance':
      // Simple dance - arm movements
      const danceTimes = [0, duration * 0.25, duration * 0.5, duration * 0.75, duration];
      animation.humanoidTracks.set('rightUpperArm', {
        times: danceTimes,
        values: [
          0, 0, 0, 1,
          -0.3, 0, 0, 0.954,
          0, 0, 0, 1,
          0, 0, -0.3, 0.954,
          0, 0, 0, 1
        ]
      });
      animation.humanoidTracks.set('leftUpperArm', {
        times: danceTimes,
        values: [
          0, 0, 0, 1,
          0, 0, 0.3, 0.954,
          0, 0, 0, 1,
          -0.3, 0, 0, 0.954,
          0, 0, 0, 1
        ]
      });
      break;
      
    case 'nod':
      // Head nod
      animation.humanoidTracks.set('head', {
        times: times,
        values: [
          0, 0, 0, 1,           // neutral
          -0.087, 0, 0, 0.996,  // nod down
          0, 0, 0, 1            // back to neutral
        ]
      });
      break;
      
    case 'breathing':
    default:
      // Subtle breathing animation
      animation.humanoidTracks.set('chest', {
        times: times,
        values: [
          0, 0, 0, 1,
          0.008, 0, 0, 0.99997,
          0, 0, 0, 1
        ]
      });
      break;
  }
  
  console.log(`Created basic ${type} animation`);
  return animation;
}