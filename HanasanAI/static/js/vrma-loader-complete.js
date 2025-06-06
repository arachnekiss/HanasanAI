// Complete ChatVRM VRMA Animation System
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
        // Convert quaternion values for VRM compatibility
        const values = Array.from(origTrack.values);
        if (metaVersion === "0") {
          // Apply VRM 0.x coordinate conversion - invert x and z quaternion components
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
        // Scale translation values
        const animationY = this.restHipsPosition.y;
        const humanoidPose = humanoid.getNormalizedAbsolutePose();
        const humanoidY = humanoidPose.hips?.position?.[1] || 1;
        const scale = animationY !== 0 ? humanoidY / animationY : 1;
        
        const values = Array.from(origTrack.values);
        for (let i = 0; i < values.length; i += 3) {
          if (metaVersion === "0") {
            // Apply VRM 0.x coordinate conversion
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

// VRMC_vrm_animation extension loader
export class VRMAnimationLoaderPlugin {
  constructor(parser) {
    this.parser = parser;
    this.name = "VRMC_vrm_animation";
  }

  async afterRoot(gltf) {
    const json = gltf.parser.json;
    const extensionsUsed = json.extensionsUsed;

    if (!extensionsUsed?.includes(this.name)) {
      return;
    }

    const extension = json.extensions?.[this.name];
    if (!extension) {
      return;
    }

    console.log('VRMC_vrm_animation extension found:', extension);
    
    // Create node mapping
    const nodeMap = this.createNodeMap(extension);
    
    // Get hips position for scaling
    let restHipsPosition = new THREE.Vector3(0, 1, 0);
    const hipsNodeIndex = extension.humanoid?.humanBones?.hips?.node;
    
    if (hipsNodeIndex !== undefined) {
      try {
        const hipsNode = await gltf.parser.getDependency("node", hipsNodeIndex);
        if (hipsNode) {
          restHipsPosition = hipsNode.getWorldPosition(new THREE.Vector3());
        }
      } catch (error) {
        console.log('Could not get hips node:', error);
      }
    }

    const clips = gltf.animations || [];
    const animations = clips.map((clip, index) => {
      const animationDef = json.animations?.[index];
      if (!animationDef) return null;
      
      const animation = this.parseAnimation(clip, animationDef, nodeMap);
      animation.restHipsPosition = restHipsPosition;
      return animation;
    }).filter(Boolean);

    gltf.userData.vrmAnimations = animations;
    console.log('VRM Animations parsed:', animations.length);
  }

  createNodeMap(extension) {
    const humanoidIndexToName = new Map();
    const expressionsIndexToName = new Map();

    // Map humanoid bone indices to names
    if (extension.humanoid?.humanBones) {
      for (const [boneName, boneInfo] of Object.entries(extension.humanoid.humanBones)) {
        if (typeof boneInfo.node === 'number') {
          humanoidIndexToName.set(boneInfo.node, boneName);
        }
      }
    }

    // Map expression indices to names
    if (extension.expressions) {
      for (const [expressionName, expressionInfo] of Object.entries(extension.expressions)) {
        if (typeof expressionInfo.node === 'number') {
          expressionsIndexToName.set(expressionInfo.node, expressionName);
        }
      }
    }

    console.log('Node map created - humanoid bones:', humanoidIndexToName.size, 'expressions:', expressionsIndexToName.size);

    return {
      humanoidIndexToName,
      expressionsIndexToName,
      lookAtIndex: null
    };
  }

  parseAnimation(clip, animationDef, nodeMap) {
    const animation = new VRMAnimation();
    animation.duration = clip.duration;

    if (!animationDef.channels || !animationDef.samplers) {
      return animation;
    }

    console.log('Parsing animation with', animationDef.channels.length, 'channels');

    // Process each animation channel
    animationDef.channels.forEach((channel, channelIndex) => {
      const { node, path } = channel.target;
      const samplerIndex = channel.sampler;
      
      if (node === undefined || samplerIndex === undefined) {
        return;
      }

      const track = clip.tracks[channelIndex];
      if (!track) {
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
          console.log(`Added rotation track for bone: ${boneName}`);
        } else if (path === "translation") {
          animation.humanoidTracks.translation.set(boneName, {
            times: track.times,
            values: track.values
          });
          console.log(`Added translation track for bone: ${boneName}`);
        }
      }

      // Check if this is an expression
      const expressionName = nodeMap.expressionsIndexToName.get(node);
      if (expressionName && path === "weights") {
        animation.expressionTracks.set(expressionName, {
          times: track.times,
          values: track.values
        });
        console.log(`Added expression track for: ${expressionName}`);
      }
    });

    console.log('Animation parsed - rotation tracks:', animation.humanoidTracks.rotation.size, 
                'translation tracks:', animation.humanoidTracks.translation.size,
                'expression tracks:', animation.expressionTracks.size);

    return animation;
  }
}

export async function loadVRMAnimation(url) {
  try {
    console.log('Loading VRMA from:', url);
    
    const loader = new THREE.GLTFLoader();
    loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
    
    const gltf = await loader.loadAsync(url);
    
    const vrmAnimations = gltf.userData.vrmAnimations;
    if (vrmAnimations && vrmAnimations.length > 0) {
      console.log('VRM Animation loaded successfully:', vrmAnimations[0]);
      return vrmAnimations[0];
    }
    
    console.log('No VRM animations found, checking for regular animations');
    
    // Fallback: check if there are regular GLTF animations
    if (gltf.animations && gltf.animations.length > 0) {
      console.log('Found GLTF animations, attempting conversion');
      const animation = new VRMAnimation();
      animation.duration = gltf.animations[0].duration;
      
      // Simple conversion for basic animations
      gltf.animations[0].tracks.forEach(track => {
        const trackName = track.name;
        
        // Try to extract bone name from track name
        if (trackName.includes('Hips') || trackName.includes('hips')) {
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
        const boneMapping = {
          'Spine': 'spine',
          'Chest': 'chest',
          'UpperArm_L': 'leftUpperArm',
          'UpperArm_R': 'rightUpperArm',
          'LowerArm_L': 'leftLowerArm',
          'LowerArm_R': 'rightLowerArm'
        };
        
        for (const [trackBone, vrmBone] of Object.entries(boneMapping)) {
          if (trackName.includes(trackBone)) {
            if (track instanceof THREE.QuaternionKeyframeTrack) {
              animation.humanoidTracks.rotation.set(vrmBone, {
                times: track.times,
                values: track.values
              });
            } else if (track instanceof THREE.VectorKeyframeTrack) {
              animation.humanoidTracks.translation.set(vrmBone, {
                times: track.times,
                values: track.values
              });
            }
            break;
          }
        }
      });
      
      if (animation.humanoidTracks.rotation.size > 0 || animation.humanoidTracks.translation.size > 0) {
        console.log('Converted GLTF animation to VRM format');
        return animation;
      }
    }
    
    console.log('No usable animations found');
    return null;
    
  } catch (error) {
    console.error('VRM Animation loading failed:', error);
    return null;
  }
}