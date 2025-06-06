// ChatVRM-style Natural Idle Pose System
import * as THREE from './libs/three.module.js';

export class ChatVRMIdlePose {
  constructor(vrm) {
    this.vrm = vrm;
    this.time = 0;
    this.breathingPhase = 0;
    this.microMovementPhase = 0;
    
    // Apply initial natural pose
    this.applyNaturalIdlePose();
  }

  applyNaturalIdlePose() {
    if (!this.vrm.humanoid) return;

    try {
      // Get all bone nodes
      const hips = this.vrm.humanoid.getNormalizedBoneNode('hips');
      const spine = this.vrm.humanoid.getNormalizedBoneNode('spine');
      const chest = this.vrm.humanoid.getNormalizedBoneNode('chest');
      const head = this.vrm.humanoid.getNormalizedBoneNode('head');
      const neck = this.vrm.humanoid.getNormalizedBoneNode('neck');
      
      // Arms
      const leftShoulder = this.vrm.humanoid.getNormalizedBoneNode('leftShoulder');
      const rightShoulder = this.vrm.humanoid.getNormalizedBoneNode('rightShoulder');
      const leftUpperArm = this.vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
      const rightUpperArm = this.vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
      const leftLowerArm = this.vrm.humanoid.getNormalizedBoneNode('leftLowerArm');
      const rightLowerArm = this.vrm.humanoid.getNormalizedBoneNode('rightLowerArm');
      const leftHand = this.vrm.humanoid.getNormalizedBoneNode('leftHand');
      const rightHand = this.vrm.humanoid.getNormalizedBoneNode('rightHand');

      // Apply natural standing pose - ChatVRM style
      if (hips) {
        hips.rotation.set(0, 0, 0);
        hips.position.set(0, 0, 0);
      }

      if (spine) {
        spine.rotation.set(0, 0, 0);
      }

      if (chest) {
        chest.rotation.set(0, 0, 0);
      }

      if (neck) {
        neck.rotation.set(0, 0, 0);
      }

      if (head) {
        head.rotation.set(0, 0, 0);
      }

      // Natural arm pose - arms hanging down naturally
      if (leftShoulder) {
        leftShoulder.rotation.set(0, 0, 0);
      }
      if (rightShoulder) {
        rightShoulder.rotation.set(0, 0, 0);
      }

      if (leftUpperArm) {
        // Left arm hanging naturally at side
        leftUpperArm.rotation.set(0, 0, 0.2); // Slight outward angle
      }
      if (rightUpperArm) {
        // Right arm hanging naturally at side
        rightUpperArm.rotation.set(0, 0, -0.2); // Slight outward angle
      }

      if (leftLowerArm) {
        // Slight natural bend in elbow
        leftLowerArm.rotation.set(0, 0, 0.1);
      }
      if (rightLowerArm) {
        // Slight natural bend in elbow
        rightLowerArm.rotation.set(0, 0, -0.1);
      }

      if (leftHand) {
        leftHand.rotation.set(0, 0, 0);
      }
      if (rightHand) {
        rightHand.rotation.set(0, 0, 0);
      }

      // Update the scene
      this.vrm.scene.updateMatrixWorld(true);
      console.log('ChatVRM natural idle pose applied successfully');

    } catch (error) {
      console.log('Error applying natural pose:', error);
    }
  }

  update(delta) {
    if (!this.vrm.humanoid) return;

    this.time += delta;
    this.breathingPhase += delta * 0.5; // Slow breathing
    this.microMovementPhase += delta * 0.2; // Very slow micro movements

    // Very subtle breathing animation
    const breathOffset = Math.sin(this.breathingPhase) * 0.005;
    
    const chest = this.vrm.humanoid.getNormalizedBoneNode('chest');
    if (chest) {
      // Preserve the base rotation and add breathing
      chest.rotation.x = breathOffset;
    }

    const spine = this.vrm.humanoid.getNormalizedBoneNode('spine');
    if (spine) {
      spine.rotation.x = breathOffset * 0.3;
    }

    // Extremely subtle head movement
    const head = this.vrm.humanoid.getNormalizedBoneNode('head');
    if (head) {
      const headSway = Math.sin(this.microMovementPhase) * 0.002;
      head.rotation.y = headSway;
    }

    // Keep arms in natural position - prevent any unwanted movement
    this.maintainArmPose();
  }

  maintainArmPose() {
    if (!this.vrm.humanoid) return;

    const leftUpperArm = this.vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
    const rightUpperArm = this.vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
    const leftLowerArm = this.vrm.humanoid.getNormalizedBoneNode('leftLowerArm');
    const rightLowerArm = this.vrm.humanoid.getNormalizedBoneNode('rightLowerArm');

    // Lock arms in natural hanging position
    if (leftUpperArm) {
      leftUpperArm.rotation.set(0, 0, 0.2);
    }
    if (rightUpperArm) {
      rightUpperArm.rotation.set(0, 0, -0.2);
    }
    if (leftLowerArm) {
      leftLowerArm.rotation.set(0, 0, 0.1);
    }
    if (rightLowerArm) {
      rightLowerArm.rotation.set(0, 0, -0.1);
    }
  }
}

// Simple manual idle animation creator
export function createIdleAnimation(vrm) {
  const tracks = [];
  const duration = 4.0; // 4 second loop
  
  if (!vrm.humanoid) return null;

  // Create keyframes for breathing animation
  const times = [0, 1, 2, 3, 4];
  
  // Chest breathing
  const chest = vrm.humanoid.getNormalizedBoneNode('chest');
  if (chest) {
    const chestValues = [
      0, 0, 0.003, // Start
      0, 0, 0.005, // Inhale
      0, 0, 0.003, // Peak
      0, 0, -0.002, // Exhale
      0, 0, 0.003  // Return
    ];
    
    const chestTrack = new THREE.VectorKeyframeTrack(
      `${chest.name}.rotation`,
      times,
      chestValues
    );
    tracks.push(chestTrack);
  }

  // Spine breathing
  const spine = vrm.humanoid.getNormalizedBoneNode('spine');
  if (spine) {
    const spineValues = [
      0, 0, 0.001,
      0, 0, 0.002,
      0, 0, 0.001,
      0, 0, -0.001,
      0, 0, 0.001
    ];
    
    const spineTrack = new THREE.VectorKeyframeTrack(
      `${spine.name}.rotation`,
      times,
      spineValues
    );
    tracks.push(spineTrack);
  }

  // Keep arms locked in natural position
  const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
  if (leftUpperArm) {
    const armValues = [
      0, 0, 0.2,
      0, 0, 0.2,
      0, 0, 0.2,
      0, 0, 0.2,
      0, 0, 0.2
    ];
    
    const leftArmTrack = new THREE.VectorKeyframeTrack(
      `${leftUpperArm.name}.rotation`,
      times,
      armValues
    );
    tracks.push(leftArmTrack);
  }

  const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
  if (rightUpperArm) {
    const armValues = [
      0, 0, -0.2,
      0, 0, -0.2,
      0, 0, -0.2,
      0, 0, -0.2,
      0, 0, -0.2
    ];
    
    const rightArmTrack = new THREE.VectorKeyframeTrack(
      `${rightUpperArm.name}.rotation`,
      times,
      armValues
    );
    tracks.push(rightArmTrack);
  }

  return new THREE.AnimationClip('ChatVRM_Idle', duration, tracks);
}