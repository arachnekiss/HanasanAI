// Official ChatVRM VRMA Animation System
// Based on ChatVRM-animate-main/src/lib/VRMAnimation

// Array chunking utility
function arrayChunk(array, every) {
  const N = array.length;
  const ret = [];
  let current = [];
  let remaining = 0;

  for (let i = 0; i < N; i++) {
    const el = array[i];

    if (remaining <= 0) {
      remaining = every;
      current = [];
      ret.push(current);
    }

    current.push(el);
    remaining--;
  }

  return ret;
}

// VRM Animation class implementation
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

    tracks.push(...this.createHumanoidTracks(vrm));

    if (vrm.expressionManager != null) {
      tracks.push(...this.createExpressionTracks(vrm.expressionManager));
    }

    if (vrm.lookAt != null) {
      const track = this.createLookAtTrack("lookAtTargetParent.quaternion");

      if (track != null) {
        tracks.push(track);
      }
    }

    return new THREE.AnimationClip("Clip", this.duration, tracks);
  }

  createHumanoidTracks(vrm) {
    const humanoid = vrm.humanoid;
    const metaVersion = vrm.meta.metaVersion;
    const tracks = [];

    for (const [name, origTrack] of this.humanoidTracks.rotation.entries()) {
      const nodeName = humanoid.getNormalizedBoneNode(name)?.name;

      if (nodeName != null) {
        const track = new THREE.VectorKeyframeTrack(
          `${nodeName}.quaternion`,
          origTrack.times,
          origTrack.values.map((v, i) =>
            metaVersion === "0" && i % 2 === 0 ? -v : v
          )
        );
        tracks.push(track);
      }
    }

    for (const [name, origTrack] of this.humanoidTracks.translation.entries()) {
      const nodeName = humanoid.getNormalizedBoneNode(name)?.name;

      if (nodeName != null) {
        const animationY = this.restHipsPosition.y;
        const humanoidY =
          humanoid.getNormalizedAbsolutePose().hips?.position?.[1];
        const scale = humanoidY / animationY;

        const track = origTrack.clone();
        track.values = track.values.map(
          (v, i) => (metaVersion === "0" && i % 3 !== 1 ? -v : v) * scale
        );
        track.name = `${nodeName}.position`;
        tracks.push(track);
      }
    }

    return tracks;
  }

  createExpressionTracks(expressionManager) {
    const tracks = [];

    for (const [name, origTrack] of this.expressionTracks.entries()) {
      const trackName = expressionManager.getExpressionTrackName(name);

      if (trackName != null) {
        const track = origTrack.clone();
        track.name = trackName;
        tracks.push(track);
      }
    }

    return tracks;
  }

  createLookAtTrack(trackName) {
    if (this.lookAtTrack == null) {
      return null;
    }

    const track = this.lookAtTrack.clone();
    track.name = trackName;
    return track;
  }
}

// VRM Animation Loader Plugin
export class VRMAnimationLoaderPlugin {
  constructor(parser, options) {
    this.parser = parser;
  }

  get name() {
    return "VRMC_vrm_animation";
  }

  async afterRoot(gltf) {
    const defGltf = gltf.parser.json;
    const defExtensionsUsed = defGltf.extensionsUsed;

    if (
      defExtensionsUsed == null ||
      defExtensionsUsed.indexOf(this.name) == -1
    ) {
      return;
    }

    const defExtension = defGltf.extensions?.[this.name];

    if (defExtension == null) {
      return;
    }

    const nodeMap = this._createNodeMap(defExtension);
    const worldMatrixMap = await this._createBoneWorldMatrixMap(
      gltf,
      defExtension
    );

    const hipsNode = defExtension.humanoid.humanBones["hips"]?.node;
    if (hipsNode != null) {
      const hips = await gltf.parser.getDependency("node", hipsNode);
      const restHipsPosition = hips.getWorldPosition(new THREE.Vector3());

      const clips = gltf.animations;
      const animations = clips.map((clip, iAnimation) => {
        const defAnimation = defGltf.animations[iAnimation];

        const animation = this._parseAnimation(
          clip,
          defAnimation,
          nodeMap,
          worldMatrixMap
        );
        animation.restHipsPosition = restHipsPosition;

        return animation;
      });

      gltf.userData.vrmAnimations = animations;
    }
  }

  _createNodeMap(defExtension) {
    const humanoidIndexToName = new Map();
    const expressionsIndexToName = new Map();
    let lookAtIndex = null;

    // humanoid
    const humanBones = defExtension.humanoid?.humanBones;

    if (humanBones) {
      Object.entries(humanBones).forEach(([name, bone]) => {
        const { node } = bone;
        humanoidIndexToName.set(node, name);
      });
    }

    // expressions
    const preset = defExtension.expressions?.preset;

    if (preset) {
      Object.entries(preset).forEach(([name, expression]) => {
        const { node } = expression;
        expressionsIndexToName.set(node, name);
      });
    }

    const custom = defExtension.expressions?.custom;

    if (custom) {
      Object.entries(custom).forEach(([name, expression]) => {
        const { node } = expression;
        expressionsIndexToName.set(node, name);
      });
    }

    // lookAt
    lookAtIndex = defExtension.lookAt?.node ?? null;

    return { humanoidIndexToName, expressionsIndexToName, lookAtIndex };
  }

  async _createBoneWorldMatrixMap(gltf, defExtension) {
    // update the entire hierarchy first
    gltf.scene.updateWorldMatrix(false, true);

    const threeNodes = await gltf.parser.getDependencies("node");
    const worldMatrixMap = new Map();

    for (const [boneName, { node }] of Object.entries(
      defExtension.humanoid.humanBones
    )) {
      const threeNode = threeNodes[node];
      worldMatrixMap.set(boneName, threeNode.matrixWorld);

      if (boneName === "hips") {
        worldMatrixMap.set(
          "hipsParent",
          threeNode.parent?.matrixWorld ?? new THREE.Matrix4()
        );
      }
    }

    return worldMatrixMap;
  }

  _parseAnimation(animationClip, defAnimation, nodeMap, worldMatrixMap) {
    const tracks = animationClip.tracks;
    const defChannels = defAnimation.channels;

    const result = new VRMAnimation();
    result.duration = animationClip.duration;

    const _v3A = new THREE.Vector3();
    const _quatA = new THREE.Quaternion();
    const _quatB = new THREE.Quaternion();
    const _quatC = new THREE.Quaternion();

    defChannels.forEach((channel, iChannel) => {
      const { node, path } = channel.target;
      const origTrack = tracks[iChannel];

      if (node == null) {
        return;
      }

      // humanoid
      const boneName = nodeMap.humanoidIndexToName.get(node);
      if (boneName != null) {
        if (path === "translation") {
          const hipsParentWorldMatrix = worldMatrixMap.get("hipsParent");

          const trackValues = arrayChunk(origTrack.values, 3).flatMap((v) =>
            _v3A.fromArray(v).applyMatrix4(hipsParentWorldMatrix).toArray()
          );

          const track = origTrack.clone();
          track.values = new Float32Array(trackValues);

          result.humanoidTracks.translation.set(boneName, track);
        } else if (path === "rotation") {
          const worldMatrix = worldMatrixMap.get(boneName);
          const parentWorldMatrix = worldMatrixMap.get("hipsParent");

          _quatA.setFromRotationMatrix(worldMatrix).normalize().invert();
          _quatB.setFromRotationMatrix(parentWorldMatrix).normalize();

          const trackValues = arrayChunk(origTrack.values, 4).flatMap((q) =>
            _quatC.fromArray(q).premultiply(_quatB).multiply(_quatA).toArray()
          );

          const track = origTrack.clone();
          track.values = new Float32Array(trackValues);

          result.humanoidTracks.rotation.set(boneName, track);
        }
        return;
      }

      // expressions
      const expressionName = nodeMap.expressionsIndexToName.get(node);
      if (expressionName != null) {
        if (path === "translation") {
          const times = origTrack.times;
          const values = new Float32Array(origTrack.values.length / 3);
          for (let i = 0; i < values.length; i++) {
            values[i] = origTrack.values[3 * i];
          }

          const newTrack = new THREE.NumberKeyframeTrack(
            `${expressionName}.weight`,
            times,
            values
          );
          result.expressionTracks.set(expressionName, newTrack);
        }
        return;
      }

      // lookAt
      if (node === nodeMap.lookAtIndex) {
        if (path === "rotation") {
          result.lookAtTrack = origTrack;
        }
      }
    });

    return result;
  }
}

// Official ChatVRM VRMA loader function
export async function loadVRMAnimation(url) {
  try {
    const loader = new THREE.GLTFLoader();
    loader.register((parser) => new VRMAnimationLoaderPlugin(parser));

    const gltf = await loader.loadAsync(url);
    const vrmAnimations = gltf.userData.vrmAnimations;
    
    if (!vrmAnimations || vrmAnimations.length === 0) {
      console.log('No VRM animations found in file:', url);
      return null;
    }
    
    const vrmAnimation = vrmAnimations[0];

    console.log('ChatVRM VRMA Animation loaded:', {
      url,
      duration: vrmAnimation?.duration,
      hasHumanoidTracks: vrmAnimation?.humanoidTracks?.rotation?.size > 0,
      hasExpressionTracks: vrmAnimation?.expressionTracks?.size > 0,
      hasLookAtTrack: vrmAnimation?.lookAtTrack != null
    });

    return vrmAnimation;
  } catch (error) {
    console.log('ChatVRM VRMA loading failed:', error);
    return null;
  }
}