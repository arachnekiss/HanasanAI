// ChatVRM-style VRM Animation Loader - Complete Implementation
import * as THREE from './libs/three.module.js';

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
    
    // Create humanoid tracks
    tracks.push(...this.createHumanoidTracks(vrm));
    
    // Create expression tracks
    if (vrm.expressionManager) {
      tracks.push(...this.createExpressionTracks(vrm.expressionManager));
    }
    
    return new THREE.AnimationClip("VRMAnimation", this.duration, tracks);
  }

  createHumanoidTracks(vrm) {
    const humanoid = vrm.humanoid;
    const metaVersion = vrm.meta?.metaVersion || "1.0";
    const tracks = [];

    if (!humanoid) return tracks;

    // Process rotation tracks
    for (const [boneName, origTrack] of this.humanoidTracks.rotation) {
      const boneNode = humanoid.getNormalizedBoneNode(boneName);
      
      if (boneNode) {
        // Convert quaternion values for VRM 0.x compatibility
        const values = Array.from(origTrack.values);
        if (metaVersion === "0") {
          // Apply VRM 0.x coordinate conversion
          for (let i = 0; i < values.length; i += 4) {
            values[i] = -values[i];     // -x
            values[i + 2] = -values[i + 2]; // -z
          }
        }
        
        const track = new THREE.QuaternionKeyframeTrack(
          `${boneNode.name}.quaternion`,
          origTrack.times,
          values
        );
        tracks.push(track);
      }
    }

    // Process translation tracks
    for (const [boneName, origTrack] of this.humanoidTracks.translation) {
      const boneNode = humanoid.getNormalizedBoneNode(boneName);
      
      if (boneNode) {
        // Scale and convert translation values
        const animationY = this.restHipsPosition.y;
        const humanoidY = humanoid.getNormalizedAbsolutePose().hips?.position?.[1] || 1;
        const scale = animationY !== 0 ? humanoidY / animationY : 1;
        
        const values = Array.from(origTrack.values);
        for (let i = 0; i < values.length; i += 3) {
          if (metaVersion === "0") {
            values[i] = -values[i] * scale;     // -x
            values[i + 1] = values[i + 1] * scale; // y
            values[i + 2] = -values[i + 2] * scale; // -z
          } else {
            values[i] *= scale;
            values[i + 1] *= scale;
            values[i + 2] *= scale;
          }
        }
        
        const track = new THREE.VectorKeyframeTrack(
          `${boneNode.name}.position`,
          origTrack.times,
          values
        );
        tracks.push(track);
      }
    }

    return tracks;
  }

  createExpressionTracks(expressionManager) {
    const tracks = [];
    
    for (const [expressionName, origTrack] of this.expressionTracks) {
      const trackName = expressionManager.getExpressionTrackName?.(expressionName) || 
                       `expressions.${expressionName}.weight`;
      
      const track = new THREE.NumberKeyframeTrack(
        trackName,
        origTrack.times,
        origTrack.values
      );
      tracks.push(track);
    }
    
    return tracks;
  }
}

export class VRMAnimationLoaderPlugin {
  constructor(parser) {
    this.parser = parser;
    this.name = "VRMC_vrm_animation";
  }

  async afterRoot(gltf) {
    const json = gltf.parser.json;
    const extensionsUsed = json.extensionsUsed;

    if (!extensionsUsed || extensionsUsed.indexOf(this.name) === -1) {
      return;
    }

    const extension = json.extensions?.[this.name];
    if (!extension) {
      return;
    }

    // Create node map for humanoid bones
    const nodeMap = this.createNodeMap(extension);
    
    // Get hips position for scaling
    const hipsNodeIndex = extension.humanoid?.humanBones?.hips?.node;
    let restHipsPosition = new THREE.Vector3(0, 1, 0);
    
    if (hipsNodeIndex !== undefined) {
      const hipsNode = await gltf.parser.getDependency("node", hipsNodeIndex);
      if (hipsNode) {
        restHipsPosition = hipsNode.getWorldPosition(new THREE.Vector3());
      }
    }

    const clips = gltf.animations || [];
    const animations = clips.map((clip, index) => {
      const animation = this.parseAnimation(clip, json.animations[index], nodeMap, extension);
      animation.restHipsPosition = restHipsPosition;
      return animation;
    });

    gltf.userData.vrmAnimations = animations;
  }

  createNodeMap(extension) {
    const humanoidIndexToName = new Map();
    const expressionsIndexToName = new Map();

    // Map humanoid bone indices to names
    if (extension.humanoid?.humanBones) {
      for (const [boneName, boneInfo] of Object.entries(extension.humanoid.humanBones)) {
        humanoidIndexToName.set(boneInfo.node, boneName);
      }
    }

    // Map expression indices to names
    if (extension.expressions) {
      for (const [expressionName, expressionInfo] of Object.entries(extension.expressions)) {
        if (expressionInfo.node !== undefined) {
          expressionsIndexToName.set(expressionInfo.node, expressionName);
        }
      }
    }

    return {
      humanoidIndexToName,
      expressionsIndexToName,
      lookAtIndex: null
    };
  }

  parseAnimation(clip, animationDef, nodeMap, extension) {
    const animation = new VRMAnimation();
    animation.duration = clip.duration;

    if (!animationDef.channels) {
      return animation;
    }

    // Process each animation channel
    animationDef.channels.forEach((channel, channelIndex) => {
      const { node, path } = channel.target;
      const track = clip.tracks[channelIndex];

      if (node === undefined || !track) {
        return;
      }

      // Check if this is a humanoid bone
      const boneName = nodeMap.humanoidIndexToName.get(node);
      if (boneName) {
        if (path === "rotation") {
          animation.humanoidTracks.rotation.set(boneName, {
            times: track.times,
            values: track.values
          });
        } else if (path === "translation") {
          animation.humanoidTracks.translation.set(boneName, {
            times: track.times,
            values: track.values
          });
        }
      }

      // Check if this is an expression
      const expressionName = nodeMap.expressionsIndexToName.get(node);
      if (expressionName && path === "weights") {
        animation.expressionTracks.set(expressionName, {
          times: track.times,
          values: track.values
        });
      }
    });

    return animation;
  }
}

export async function loadVRMAnimation(url) {
  try {
    const loader = new THREE.GLTFLoader();
    loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
    
    const gltf = await loader.loadAsync(url);
    
    const vrmAnimations = gltf.userData.vrmAnimations;
    if (vrmAnimations && vrmAnimations.length > 0) {
      console.log('VRM Animation loaded successfully:', vrmAnimations[0]);
      return vrmAnimations[0];
    }
    
    // Fallback: try to parse as regular GLTF animation
    if (gltf.animations && gltf.animations.length > 0) {
      console.log('Fallback: Using GLTF animation');
      const animation = new VRMAnimation();
      animation.duration = gltf.animations[0].duration;
      
      // Convert GLTF tracks to VRM format
      gltf.animations[0].tracks.forEach(track => {
        // Try to map track names to VRM bone names
        const trackName = track.name;
        if (trackName.includes('Hips')) {
          if (track instanceof THREE.QuaternionKeyframeTrack) {
            animation.humanoidTracks.rotation.set('hips', {
              times: track.times,
              values: track.values
            });
          } else if (track instanceof THREE.VectorKeyframeTrack) {
            animation.humanoidTracks.translation.set('hips', {
              times: track.times,
              values: track.values
            });
          }
        }
        // Add more bone mappings as needed
      });
      
      return animation;
    }
    
    return null;
  } catch (error) {
    console.error('VRM Animation loading failed:', error);
    return null;
  }
}