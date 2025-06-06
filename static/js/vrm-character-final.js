// ChatVRM-compatible VRM Character System with T-pose fix
export default function init({ THREE, GLTFLoader, OrbitControls, VRM, VRMLoaderPlugin, VRMUtils, VRMAnimationLoaderPlugin, loadVRMAnimation }) {
  const container = document.getElementById('avatarContainer');
  const canvas = document.getElementById('vrm-canvas');
  
  if (!container || !canvas) {
    console.error('Avatar DOM elements missing');
    return;
  }

  console.log('Setting up VRM character system...');

  const clock = new THREE.Clock();
  
  const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    alpha: true, 
    antialias: true 
  });
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 20);
  camera.position.set(0, 1.3, 2.5);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  
  resize();
  window.addEventListener('resize', resize);

  // Lighting
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Controls
  const controls = new OrbitControls(camera, canvas);
  controls.screenSpacePanning = true;
  controls.target.set(0.0, 1.2, 0.0);
  controls.update();

  // VRM Loader with Animation Plugin
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  loader.register((parser) => new VRMAnimationLoaderPlugin(parser));

  // ChatVRM-style T-pose fix using correct rotation methods
  function fixTPose(vrm) {
    if (!vrm.humanoid) return;
    
    try {
      // Get arm bones
      const rightUpperArm = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
      const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
      
      if (rightUpperArm) {
        // Right arm down - using quaternion rotation
        const rightRotation = new THREE.Euler(0.3, 0, -1.2, 'XYZ');
        rightUpperArm.rotation.copy(rightRotation);
        console.log('Applied right arm natural position');
      }
      
      if (leftUpperArm) {
        // Left arm down - using quaternion rotation
        const leftRotation = new THREE.Euler(0.3, 0, 1.2, 'XYZ');
        leftUpperArm.rotation.copy(leftRotation);
        console.log('Applied left arm natural position');
      }
      
      // Elbow bend
      const rightLowerArm = vrm.humanoid.getNormalizedBoneNode("rightLowerArm");
      const leftLowerArm = vrm.humanoid.getNormalizedBoneNode("leftLowerArm");
      
      if (rightLowerArm) {
        rightLowerArm.rotation.set(0, 0, 0.3);
      }
      if (leftLowerArm) {
        leftLowerArm.rotation.set(0, 0, -0.3);
      }
      
      vrm.scene.updateMatrixWorld(true);
      console.log('ChatVRM T-pose fix applied successfully');
      
    } catch (error) {
      console.log('T-pose fix error:', error);
    }
  }

  // ChatVRM VRMA animation loader
  async function loadVRMAnimation(url) {
    try {
      const gltfLoader = new THREE.GLTFLoader();
      const gltf = await gltfLoader.loadAsync(url);
      
      if (gltf.animations && gltf.animations.length > 0) {
        console.log('VRMA animation loaded:', gltf.animations[0].name);
        return {
          clip: gltf.animations[0],
          duration: gltf.animations[0].duration
        };
      }
      return null;
    } catch (error) {
      console.log('VRMA loading failed:', error);
      return null;
    }
  }

  // Load VRM character with random selection
  async function loadVRMCharacter() {
    // Import and initialize random selection
    const { RandomSelection } = await import('./random-selection.js');
    const randomSelector = new RandomSelection();
    
    // Get random or existing session
    const sessionData = randomSelector.initializeRandomSelection();
    const vrmFile = sessionData.vrm || 'Kurone.vrm';
    const wallpaper = sessionData.wallpaper;

    console.log('Using VRM:', vrmFile);
    console.log('Using wallpaper:', wallpaper);
    
    if (wallpaper) {
      const bgPath = `/static/wallpaper/${wallpaper}`;
      console.log('Loading background from:', bgPath);
      
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(bgPath, 
        (texture) => {
          scene.background = texture;
          console.log('Background loaded successfully');
        },
        undefined,
        (error) => console.log('Background load failed:', error)
      );
    }

    console.log('Loading VRM model:', vrmFile);
    const vrmPath = `/static/character/${vrmFile}`;
    console.log('Loading VRM from:', vrmPath);

    loader.load(
      vrmPath,
      async (gltf) => {
        console.log('GLTF loaded, converting to VRM...');
        
        const vrm = gltf.userData.vrm;
        if (!vrm) {
          console.error('No VRM found in userData');
          return;
        }

        console.log('VRM character loaded successfully');
        
        // Store globally
        window.currentVRM = vrm;
        
        // Apply VRM rotation
        console.log('Starting ChatVRM-style pose application...');
        VRMUtils.rotateVRM0(vrm);
        console.log('Applied VRM0 rotation');
        console.log('ChatVRM-style pose application completed');
        
        // Add to scene
        scene.add(vrm.scene);
        
        // Disable frustum culling
        vrm.scene.traverse((obj) => {
          obj.frustumCulled = false;
        });

        // Initialize complete ChatVRM Expression Controller system
        console.log('Initializing ChatVRM Expression Controller...');
        if (vrm.expressionManager) {
          console.log('Expression manager found:', Object.keys(vrm.expressionManager.expressionMap || {}));
          
          // Create complete ChatVRM expression controller (exact ChatVRM-main)
          window.chatVRMExpressionController = new ChatVRMExpressionController(vrm, camera);
          
          console.log('ChatVRM Expression Controller initialized with auto blink');
        } else {
          console.warn('No expression manager found for blinking');
        }

        // Initialize natural pose system
        fixTPose(vrm);

        // Create animation mixer for VRMA animations
        window.currentMixer = new THREE.AnimationMixer(vrm.scene);
        
        // Load idle animation from ChatVRM
        await loadChatVRMIdleAnimation(vrm, window.currentMixer);
        
        console.log('ChatVRM animation system initialized with idle loop');
        
        // ChatVRM system ready
        console.log('VRM Character system connected');
        console.log('ChatVRM-style idle animations started');
        
        // Position camera for waist-up view
        setTimeout(() => {
          const hipsNode = vrm.humanoid?.getNormalizedBoneNode("hips");
          const headNode = vrm.humanoid?.getNormalizedBoneNode("head");
          
          if (hipsNode && headNode) {
            const hipsY = hipsNode.getWorldPosition(new THREE.Vector3()).y;
            const headY = headNode.getWorldPosition(new THREE.Vector3()).y;
            const centerY = (hipsY + headY) / 2;
            
            camera.position.set(0, centerY + 0.1, 2.5);
            controls.target.set(0, centerY, 0);
            controls.update();
            
            console.log('Camera positioned for waist-up view:', {
              centerY, hipsY, headY
            });
          }
        }, 100);
        
        console.log('VRM Character system connected');
        console.log('ChatVRM-style idle animations started');
      },
      (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        console.log('Loading progress:', `${percent}%`);
      },
      (error) => {
        console.error('VRM load error:', error);
      }
    );
  }

  // ChatVRM Core Blink Class (exact ChatVRM-main implementation)
  class ChatVRMCoreBlink {
    constructor(expressionManager) {
      this.expressionManager = expressionManager;
      this.remainingTime = 0;
      this.isOpen = true;
      this.isAutoBlink = true;

      // Exact ChatVRM-main constants
      this.BLINK_CLOSE_MAX = 0.12;
      this.BLINK_OPEN_MAX = 5;

      console.log('ChatVRM Core Blink ready (exact ChatVRM-main)');
    }

    setEnable(isAuto) {
      this.isAutoBlink = isAuto;
      
      // Return remaining time if eyes are closed
      if (!this.isOpen) {
        return this.remainingTime;
      }
      
      return 0;
    }

    update(delta) {
      // Exact ChatVRM-main logic
      if (this.remainingTime > 0) {
        this.remainingTime -= delta;
        return;
      }

      if (this.isOpen && this.isAutoBlink) {
        this.close();
        return;
      }

      this.open();
    }

    close() {
      this.isOpen = false;
      this.remainingTime = this.BLINK_CLOSE_MAX;
      this.expressionManager.setValue("blink", 1);
      console.log('ChatVRM blink closed');
    }

    open() {
      this.isOpen = true;
      this.remainingTime = this.BLINK_OPEN_MAX;
      this.expressionManager.setValue("blink", 0);
      console.log('ChatVRM blink opened');
    }
  }

  // ChatVRM Auto Look At (exact ChatVRM-main implementation)
  class ChatVRMAutoLookAt {
    constructor(vrm, camera) {
      this.lookAtTarget = new THREE.Object3D();
      camera.add(this.lookAtTarget);

      if (vrm.lookAt) {
        vrm.lookAt.target = this.lookAtTarget;
      }
    }
  }

  // ChatVRM Expression Controller (exact ChatVRM-main implementation)
  class ChatVRMExpressionController {
    constructor(vrm, camera) {
      this.vrm = vrm;
      this.expressionManager = vrm.expressionManager;
      this.currentEmotion = "neutral";
      this.currentLipSync = null;
      
      // Initialize auto look at
      this.autoLookAt = new ChatVRMAutoLookAt(vrm, camera);
      
      if (this.expressionManager) {
        this.autoBlink = new ChatVRMCoreBlink(this.expressionManager);
        console.log('ChatVRM ExpressionController with AutoBlink and AutoLookAt ready');
      }
    }

    playEmotion(preset) {
      if (this.currentEmotion != "neutral") {
        this.expressionManager?.setValue(this.currentEmotion, 0);
      }

      if (preset == "neutral") {
        this.autoBlink?.setEnable(true);
        this.currentEmotion = preset;
        return;
      }

      const t = this.autoBlink?.setEnable(false) || 0;
      this.currentEmotion = preset;
      setTimeout(() => {
        this.expressionManager?.setValue(preset, 1);
        console.log('ChatVRM emotion applied:', preset);
      }, t * 1000);
    }

    lipSync(preset, value) {
      if (this.currentLipSync) {
        this.expressionManager?.setValue(this.currentLipSync.preset, 0);
      }
      this.currentLipSync = {
        preset,
        value,
      };
    }

    update(delta) {
      if (this.autoBlink) {
        this.autoBlink.update(delta);
      }

      if (this.currentLipSync) {
        const weight =
          this.currentEmotion === "neutral"
            ? this.currentLipSync.value * 0.5
            : this.currentLipSync.value * 0.25;
        this.expressionManager?.setValue(this.currentLipSync.preset, weight);
      }
    }
  }

  // ChatVRM VRMA Animation Loader (simplified direct implementation)
  async function loadChatVRMIdleAnimation(vrm, mixer) {
    try {
      console.log('Loading ChatVRM idle animation...');
      
      // Create a simple breathing/idle animation directly
      const idleClip = createChatVRMIdleClip(vrm);
      
      if (idleClip) {
        const action = mixer.clipAction(idleClip);
        action.setLoop(THREE.LoopRepeat);
        action.play();
        console.log('ChatVRM idle animation created and playing');
      }
    } catch (error) {
      console.log('ChatVRM idle animation creation failed:', error);
    }
  }

  // Create ChatVRM-style idle animation clip (breathing and subtle movement)
  function createChatVRMIdleClip(vrm) {
    const tracks = [];
    const duration = 4.0; // 4 second loop
    
    // Get spine bone for breathing animation
    const spineBone = vrm.humanoid?.getNormalizedBoneNode('spine');
    if (spineBone) {
      // Breathing animation - subtle spine movement
      const times = [0, 1, 2, 3, 4];
      const values = [
        0, 0, 0, 1, // Rest
        0, 0.02, 0, 1, // Inhale
        0, 0.01, 0, 1, // Hold
        0, -0.01, 0, 1, // Exhale
        0, 0, 0, 1  // Rest
      ];
      
      const spineTrack = new THREE.QuaternionKeyframeTrack(
        `${spineBone.name}.quaternion`,
        times,
        values
      );
      tracks.push(spineTrack);
    }
    
    // Get chest bone for additional breathing
    const chestBone = vrm.humanoid?.getNormalizedBoneNode('chest');
    if (chestBone) {
      const times = [0, 1.5, 3, 4];
      const values = [
        0, 0, 0, 1,
        0, 0.015, 0, 1,
        0, -0.005, 0, 1,
        0, 0, 0, 1
      ];
      
      const chestTrack = new THREE.QuaternionKeyframeTrack(
        `${chestBone.name}.quaternion`,
        times,
        values
      );
      tracks.push(chestTrack);
    }

    return new THREE.AnimationClip("ChatVRMIdleBreathing", duration, tracks);
  }

  // Create VRM Animation Clip (exact ChatVRM-main implementation)
  function createVRMAnimationClip(vrmAnimation, vrm) {
    const tracks = [];

    // Create humanoid tracks
    const humanoid = vrm.humanoid;
    const metaVersion = vrm.meta.metaVersion;

    for (const [name, origTrack] of vrmAnimation.humanoidTracks.rotation.entries()) {
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

    // Create expression tracks
    if (vrm.expressionManager != null) {
      for (const [name, origTrack] of vrmAnimation.expressionTracks.entries()) {
        const trackName = vrm.expressionManager.getExpressionTrackName(name);

        if (trackName != null) {
          const track = origTrack.clone();
          track.name = trackName;
          tracks.push(track);
        }
      }
    }

    return new THREE.AnimationClip("ChatVRMIdleClip", vrmAnimation.duration, tracks);
  }

  // Make classes available globally
  window.ChatVRMCoreBlink = ChatVRMCoreBlink;
  window.ChatVRMAutoLookAt = ChatVRMAutoLookAt;
  window.ChatVRMExpressionController = ChatVRMExpressionController;
  window.loadChatVRMIdleAnimation = loadChatVRMIdleAnimation;

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    
    controls.update();
    
    // Update ChatVRM Expression Controller (includes auto blink)
    if (window.chatVRMExpressionController) {
      window.chatVRMExpressionController.update(deltaTime);
    }
    
    // Update animation mixer (VRMA animations)
    if (window.currentMixer) {
      window.currentMixer.update(deltaTime);
    }
    
    // Update VRM
    if (window.currentVRM && window.currentVRM.update) {
      window.currentVRM.update(deltaTime);
    }
    
    // Animation system complete
    
    renderer.render(scene, camera);
  }

  // Start system
  animate();
  loadVRMCharacter();
  
  console.log('VRM character system with emotion animations initialized');
  
  return {
    scene,
    camera,
    renderer,
    controls,
    loadVRMCharacter,
    fixTPose: () => window.currentVRM && fixTPose(window.currentVRM)
  };
}