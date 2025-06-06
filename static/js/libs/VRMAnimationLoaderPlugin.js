// ChatVRM-compatible VRM Animation Loader Plugin
import * as THREE from './three.module.js';

export class VRMAnimationLoaderPlugin {
  constructor(parser) {
    this.parser = parser;
  }

  get name() {
    return "VRMC_vrm_animation";
  }

  async afterRoot(gltf) {
    const defGltf = gltf.parser.json;
    const defExtensionsUsed = defGltf.extensionsUsed;

    if (!defExtensionsUsed || defExtensionsUsed.indexOf(this.name) === -1) {
      return;
    }

    const defExtension = defGltf.extensions?.[this.name];
    if (!defExtension) {
      return;
    }

    const clips = gltf.animations;
    const animations = clips.map((clip, iAnimation) => {
      const defAnimation = defGltf.animations[iAnimation];
      const animation = this._parseAnimation(clip, defAnimation, defExtension);
      return animation;
    });

    gltf.userData.vrmAnimations = animations;
  }

  _parseAnimation(animationClip, defAnimation, defExtension) {
    const result = new VRMAnimation();
    result.duration = animationClip.duration;

    // Process humanoid bone tracks
    const humanBones = defExtension.humanoid?.humanBones || {};
    const nodeToHumanBone = new Map();
    
    Object.entries(humanBones).forEach(([boneName, boneData]) => {
      nodeToHumanBone.set(boneData.node, boneName);
    });

    defAnimation.channels.forEach((channel, iChannel) => {
      const { node, path } = channel.target;
      const origTrack = animationClip.tracks[iChannel];

      if (node == null) return;

      const boneName = nodeToHumanBone.get(node);
      if (boneName) {
        if (path === "translation") {
          result.humanoidTracks.translation.set(boneName, origTrack);
        } else if (path === "rotation") {
          result.humanoidTracks.rotation.set(boneName, origTrack);
        }
      }
    });

    return result;
  }
}

export class VRMAnimation {
  constructor() {
    this.duration = 0.0;
    this.restHipsPosition = new THREE.Vector3();
    this.humanoidTracks = {
      translation: new Map(),
      rotation: new Map(),
    };
    this.expressionTracks = new Map();
    this.lookAtTrack = null;
  }

  createAnimationClip(vrm) {
    const tracks = [];
    
    // Create humanoid rotation tracks
    for (const [boneName, track] of this.humanoidTracks.rotation.entries()) {
      const boneNode = vrm.humanoid?.getNormalizedBoneNode(boneName);
      if (boneNode) {
        const newTrack = track.clone();
        newTrack.name = `${boneNode.name}.quaternion`;
        tracks.push(newTrack);
      }
    }

    // Create humanoid translation tracks
    for (const [boneName, track] of this.humanoidTracks.translation.entries()) {
      const boneNode = vrm.humanoid?.getNormalizedBoneNode(boneName);
      if (boneNode) {
        const newTrack = track.clone();
        newTrack.name = `${boneNode.name}.position`;
        tracks.push(newTrack);
      }
    }

    return new THREE.AnimationClip("VRMAnimation", this.duration, tracks);
  }
}

// Load VRM Animation function matching ChatVRM
export async function loadVRMAnimation(url) {
  const loader = new THREE.GLTFLoader();
  loader.register((parser) => new VRMAnimationLoaderPlugin(parser));

  try {
    const gltf = await loader.loadAsync(url);
    const vrmAnimations = gltf.userData.vrmAnimations;
    return vrmAnimations && vrmAnimations.length > 0 ? vrmAnimations[0] : null;
  } catch (error) {
    console.warn('VRM Animation load failed:', error);
    return null;
  }
}