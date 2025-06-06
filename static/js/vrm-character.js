// ChatVRM-style VRM Character System with Animation
export default function init({ THREE, GLTFLoader, OrbitControls, VRM, VRMLoaderPlugin, VRMUtils }) {
  // Global animation clock
  const animationClock = new THREE.Clock();
  
  const container = document.getElementById('avatarContainer');
  const canvas = document.getElementById('vrm-canvas');
  
  if (!container || !canvas) {
    console.error('Avatar DOM elements missing');
    return;
  }

  console.log('Setting up VRM character system...');

  // Renderer + Scene setup
  const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    alpha: true, 
    antialias: true 
  });
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 20);
  camera.position.set(0, 1.3, 2.5); // 더 멀리 위치

  // Optimize for mobile performance
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  
  window.addEventListener('resize', resize);
  resize();

  // Lighting
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));

  // Controls (ChatVRM style) - proper orbit control setup
  const controls = new OrbitControls(camera, canvas);
  controls.screenSpacePanning = true;
  controls.target.set(0, 1.3, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.enableRotate = true;
  controls.minDistance = 1.0;
  controls.maxDistance = 5.0;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;
  controls.update();

  // Always select random character and background on page load
  // Get lists from Flask template variables
  const vrms = window.vrmList || ['annie.vrm'];
  const wps = window.wpList || ['default.jpg'];
  
  // Random selection every time (no session storage to allow fresh selection)
  const selectedVRM = vrms[Math.floor(Math.random() * vrms.length)];
  const selectedBG = wps[Math.floor(Math.random() * wps.length)];
  
  console.log('Using session VRM:', selectedVRM);
  console.log('Using session wallpaper:', selectedBG);

  // Background as a large sphere to prevent character disappearing
  const textureLoader = new THREE.TextureLoader();
  const bgUrl = `/static/wallpaper/${selectedBG}`;
  console.log('Loading background from:', bgUrl);
  
  // Use scene.background instead of geometry to prevent floating background
  textureLoader.load(
    bgUrl,
    (texture) => {
      scene.background = texture;
      console.log('Background loaded successfully');
    },
    undefined,
    (error) => {
      console.warn('Background loading failed, using solid color:', error);
      scene.background = new THREE.Color(0x202020);
    }
  );

  // VRM Loading
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  
  console.log('Loading VRM model:', selectedVRM);
  const modelUrl = `/static/character/${selectedVRM}`;
  console.log('Loading VRM from:', modelUrl);
  
  loader.load(
    modelUrl,
    async (gltf) => {
      try {
        console.log('GLTF loaded, converting to VRM...');
        
        // Get VRM from userData or convert from GLTF
        let vrm = gltf.userData.vrm;
        if (!vrm) {
          vrm = await VRM.from(gltf);
        }
        
        if (!vrm) {
          throw new Error('Failed to create VRM from GLTF');
        }
        
        window.currentVRM = vrm;
        scene.add(vrm.scene);
        
        // Apply VRM0 rotation if needed
        if (VRMUtils && VRMUtils.rotateVRM0) {
          VRMUtils.rotateVRM0(vrm);
        }
        
        // Disable frustum culling (ChatVRM approach)
        vrm.scene.traverse((obj) => {
          obj.frustumCulled = false;
        });
        
        // Create animation mixer immediately after VRM is in scene
        const mixer = new THREE.AnimationMixer(vrm.scene);
        window.currentMixer = mixer;
        
        // Load and apply idle animation
        setTimeout(async () => {
          try {
            console.log('Loading ChatVRM idle animation...');
            
            // Load idle animation using standard GLTF loader
            const gltfLoader = new THREE.GLTFLoader();
            const gltf = await gltfLoader.loadAsync('/static/idle_loop.vrma');
            
            console.log('VRMA file loaded:', gltf);
            console.log('Available animations:', gltf.animations?.length || 0);
            
            if (gltf.animations && gltf.animations.length > 0) {
              const clip = gltf.animations[0];
              console.log('Animation clip found:', clip.name, 'duration:', clip.duration);
              console.log('Animation tracks:', clip.tracks.length);
              
              // Create action and attach to VRM scene root
              const action = mixer.clipAction(clip, vrm.scene);
              action.reset().setLoop(THREE.LoopRepeat).play();
              
              console.log('ChatVRM idle animation successfully playing');
            } else {
              console.log('No animations found in VRMA file, using manual pose');
              window.applyManualPose(vrm);
            }
          } catch (error) {
            console.log('Animation loading failed:', error);
            window.applyManualPose(vrm);
          }
        }, 300);
        
        // ChatVRM-style natural pose application
        window.applyManualPose = function(vrm) {
          try {
            // Apply ChatVRM's natural arm positioning
            const rightUpperArm = vrm.humanoid?.getNormalizedBoneNode("rightUpperArm");
            const leftUpperArm = vrm.humanoid?.getNormalizedBoneNode("leftUpperArm");
            const rightLowerArm = vrm.humanoid?.getNormalizedBoneNode("rightLowerArm");
            const leftLowerArm = vrm.humanoid?.getNormalizedBoneNode("leftLowerArm");
            
            // Natural shoulder position - arms hanging down
            if (rightUpperArm) {
              rightUpperArm.rotation.set(0.2, 0, -0.15);
            }
            if (leftUpperArm) {
              leftUpperArm.rotation.set(0.2, 0, 0.15);
            }
            
            // Slight elbow bend for natural look
            if (rightLowerArm) {
              rightLowerArm.rotation.set(0, 0, 0.1);
            }
            if (leftLowerArm) {
              leftLowerArm.rotation.set(0, 0, -0.1);
            }
            
            // Apply slight forward lean to torso for more natural stance
            const spine = vrm.humanoid?.getNormalizedBoneNode("spine");
            if (spine) {
              spine.rotation.set(0.05, 0, 0);
            }
            
            vrm.scene.updateMatrixWorld(true);
            console.log('Applied ChatVRM-style natural pose');
          } catch (error) {
            console.log('Pose application error:', error);
          }
        };
        
        // Camera positioning for proper waist-up view
        setTimeout(() => {
          const hipsNode = vrm.humanoid?.getNormalizedBoneNode("hips");
          const headNode = vrm.humanoid?.getNormalizedBoneNode("head");
          
          if (hipsNode && headNode) {
            const hipsPos = hipsNode.getWorldPosition(new THREE.Vector3());
            const headPos = headNode.getWorldPosition(new THREE.Vector3());
            
            // Calculate center point between hips and head for waist-up view
            const centerY = (hipsPos.y + headPos.y) / 2;
            
            // Set camera and controls target
            camera.position.set(0, centerY, 2.5);
            controls.target.set(0, centerY, 0);
            controls.update();
            console.log('Camera positioned for waist-up view:', { centerY, hipsY: hipsPos.y, headY: headPos.y });
          }
        }, 300);
        
        console.log('VRM character loaded successfully');
        
        // Apply neutral pose (exit T-pose) with multiple attempts
        setTimeout(() => {
          applyNeutralPose(vrm);
        }, 100);
        
        setTimeout(() => {
          applyNeutralPose(vrm);
        }, 300);
        
        setTimeout(() => {
          applyNeutralPose(vrm);
          
          // Set initial neutral expression
          if (vrm.expressionManager) {
            vrm.expressionManager.setValue('neutral', 1.0);
          }
          
          // Start idle animations
          startIdleAnimations(vrm);
        }, 500);
        
      } catch (error) {
        console.error('VRM conversion failed:', error);
      }
    },
    (progress) => {
      console.log('Loading progress:', Math.round((progress.loaded / progress.total) * 100) + '%');
    },
    (error) => {
      console.error('VRM load error:', error);
    }
  );

  // Start animation loop after initialization
  animate();

  // Global expression helper
  window.setExpression = (name, val = 1) => {
    if (window.currentVRM?.expressionManager) {
      // Reset other expressions
      const expressions = ['neutral', 'happy', 'angry', 'sad', 'surprised', 'relaxed'];
      expressions.forEach(expr => {
        window.currentVRM.expressionManager.setValue(expr, 0);
      });
      
      // Set target expression
      window.currentVRM.expressionManager.setValue(name, val);
      console.log(`Expression set: ${name} (${val})`);
      
      // Auto-reset after 2 seconds
      setTimeout(() => {
        if (window.currentVRM?.expressionManager) {
          window.currentVRM.expressionManager.setValue(name, 0);
          window.currentVRM.expressionManager.setValue('neutral', 1.0);
        }
      }, 2000);
    } else {
      console.warn('VRM not loaded or expression manager unavailable');
    }
  };

  // Apply neutral pose using ChatVRM approach - minimal changes only
  function applyNeutralPose(vrm) {
    try {
      if (vrm.humanoid) {
        console.log('Starting ChatVRM-style pose application...');
        
        // ChatVRM approach: only apply VRMUtils.rotateVRM0 and let idle animation handle pose
        if (VRMUtils && VRMUtils.rotateVRM0) {
          VRMUtils.rotateVRM0(vrm);
          console.log('Applied VRM0 rotation');
        }
        
        // Don't manually manipulate bone rotations - let the VRM system handle natural pose
        // This prevents the "arms up" issue caused by manual bone manipulation
        
        console.log('ChatVRM-style pose application completed');
      }
    } catch (error) {
      console.log('Neutral pose application failed:', error);
    }
  }
  
  // Start idle animations (breathing and blinking) - ChatVRM style
  function startIdleAnimations(vrm) {
    if (!vrm.expressionManager) return;
    
    let blinkTimer = 0;
    let breathTimer = 0;
    let idleTimer = 0;
    const baseY = vrm.scene.position.y;
    
    function idleLoop() {
      if (!window.currentVRM) return;
      
      const deltaTime = 0.016; // ~60fps
      blinkTimer += deltaTime;
      breathTimer += deltaTime;
      idleTimer += deltaTime;
      
      // Natural blinking (every 2-4 seconds)
      if (blinkTimer > 2 + Math.random() * 2) {
        if (window.currentVRM.expressionManager) {
          window.currentVRM.expressionManager.setValue('blink', 1.0);
          setTimeout(() => {
            if (window.currentVRM?.expressionManager) {
              window.currentVRM.expressionManager.setValue('blink', 0.0);
            }
          }, 120);
        }
        blinkTimer = 0;
      }
      
      // ChatVRM-style breathing animation - gentle vertical movement
      const breathCycle = Math.sin(breathTimer * 1.2) * 0.003;
      window.currentVRM.scene.position.y = baseY + breathCycle;
      
      // Subtle idle movement - slight swaying
      const idleSway = Math.sin(idleTimer * 0.3) * 0.001;
      window.currentVRM.scene.position.x = idleSway;
      
      // Chest breathing animation using bone rotation
      try {
        if (window.currentVRM.humanoid) {
          const chest = window.currentVRM.humanoid.getNormalizedBoneNode('chest') || window.currentVRM.humanoid.getRawBoneNode('chest');
          if (chest) {
            const breathRotation = Math.sin(breathTimer * 1.2) * 0.008;
            chest.rotation.x = breathRotation;
          }
          
          // Head slight movement for liveliness
          const head = window.currentVRM.humanoid.getNormalizedBoneNode('head') || window.currentVRM.humanoid.getRawBoneNode('head');
          if (head) {
            const headMovement = Math.sin(idleTimer * 0.4) * 0.003;
            head.rotation.y = headMovement;
          }
          
          // Natural movement only - no forced arm positioning
        }
      } catch (error) {
        // Silent fail for bone animation
      }
      
      // Update VRM if needed
      if (window.currentVRM.update) {
        window.currentVRM.update(deltaTime);
      }
      
      // Update animation mixer for idle animations
      if (window.currentMixer) {
        window.currentMixer.update(deltaTime);
      }
      
      setTimeout(idleLoop, 16);
    }
    
    idleLoop();
    console.log('ChatVRM-style idle animations started');
  }
  
  // Lip sync for speech simulation
  window.startLipSync = function() {
    if (!window.currentVRM || !window.currentVRM.expressionManager) return;
    
    const visemes = ['aa', 'ih', 'ou', 'ee', 'oh'];
    let visemeIndex = 0;
    
    const lipSyncInterval = setInterval(() => {
      if (window.currentVRM && window.currentVRM.expressionManager) {
        // Clear previous viseme
        visemes.forEach(v => {
          try {
            window.currentVRM.expressionManager.setValue(v, 0);
          } catch(e) {}
        });
        
        // Apply current viseme
        try {
          window.currentVRM.expressionManager.setValue(visemes[visemeIndex], 0.8);
        } catch(e) {}
        visemeIndex = (visemeIndex + 1) % visemes.length;
      }
    }, 200);
    
    window.stopLipSync = function() {
      clearInterval(lipSyncInterval);
      if (window.currentVRM && window.currentVRM.expressionManager) {
        visemes.forEach(v => {
          try {
            window.currentVRM.expressionManager.setValue(v, 0);
          } catch(e) {}
        });
      }
    };
    
    return lipSyncInterval;
  };
  
  // Animation timing handled by main clock
  
  // Rendering loop with proper delta time
  function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = animationClock.getDelta();
    
    // Update controls
    controls.update();
    
    // Update VRM
    if (window.currentVRM && window.currentVRM.update) {
      window.currentVRM.update(deltaTime);
    }
    
    // Critical: Update animation mixer with delta time
    if (window.currentMixer) {
      window.currentMixer.update(deltaTime);
    }
    
    // Render scene
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Initialize emotion animation system
  async function initializeEmotionSystem() {
    try {
      const EmotionController = await import('./emotion-animation.js');
      window.emotionController = new EmotionController.default();
      console.log('Emotion animation system initialized');
    } catch (error) {
      console.log('Emotion system initialization failed:', error);
    }
  }
  
  // Process AI response for emotion and apply animations
  window.processAIEmotion = function(responseText) {
    if (window.emotionController && window.currentVRM && window.currentMixer) {
      const emotion = window.emotionController.detectEmotion(responseText);
      window.emotionController.applyEmotion(emotion, window.currentVRM, window.currentMixer);
    }
  };
  
  // Initialize emotion system
  initializeEmotionSystem();
  
  console.log('VRM character system with emotion animations initialized');
  
  return {
    scene,
    camera,
    renderer,
    controls,
    applyNeutralPose,
    startIdleAnimations,
    processAIEmotion: window.processAIEmotion
  };
}