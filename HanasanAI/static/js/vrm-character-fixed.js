// ChatVRM-compatible VRM Character System
export default function init({ THREE, GLTFLoader, OrbitControls, VRM, VRMLoaderPlugin, VRMUtils }) {
  const container = document.getElementById('avatarContainer');
  const canvas = document.getElementById('vrm-canvas');
  
  if (!container || !canvas) {
    console.error('Avatar DOM elements missing');
    return;
  }

  console.log('Setting up VRM character system...');

  // Clock for animations
  const clock = new THREE.Clock();
  
  // Renderer setup
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

  // Lighting setup
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

  // VRM Loader
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));

  // Apply ChatVRM natural pose to completely fix T-pose
  function applyNaturalPose(vrm) {
    if (!vrm.humanoid) return;
    
    try {
      // ChatVRM shoulder rotation values for natural arms-down pose
      const rightUpperArm = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
      const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
      
      if (rightUpperArm) {
        // ChatVRM natural arm position - complete T-pose elimination
        rightUpperArm.rotation.setFromEuler(new THREE.Euler(0.3, 0, -1.2, 'XYZ'));
        console.log('Applied right arm natural position');
      }
      if (leftUpperArm) {
        // ChatVRM natural arm position - complete T-pose elimination
        leftUpperArm.rotation.setFromEuler(new THREE.Euler(0.3, 0, 1.2, 'XYZ'));
        console.log('Applied left arm natural position');
      }
      
      // Add subtle elbow bend for realism
      const rightLowerArm = vrm.humanoid.getNormalizedBoneNode("rightLowerArm");
      const leftLowerArm = vrm.humanoid.getNormalizedBoneNode("leftLowerArm");
      
      if (rightLowerArm) {
        rightLowerArm.rotation.set(0, 0, 0.3);
      }
      if (leftLowerArm) {
        leftLowerArm.rotation.set(0, 0, -0.3);
      }
      
      // Natural shoulder positioning
      const rightShoulder = vrm.humanoid.getNormalizedBoneNode("rightShoulder");
      const leftShoulder = vrm.humanoid.getNormalizedBoneNode("leftShoulder");
      
      if (rightShoulder) {
        rightShoulder.rotation.set(0, 0, -0.1);
      }
      if (leftShoulder) {
        leftShoulder.rotation.set(0, 0, 0.1);
      }
      
      // Force immediate update
      vrm.scene.updateMatrixWorld(true);
      
      console.log('Applied ChatVRM natural pose - T-pose eliminated');
    } catch (error) {
      console.log('Pose application error:', error);
    }
  }

  // Load VRM character
  function loadVRMCharacter() {
    const sessionData = JSON.parse(localStorage.getItem('currentSession') || '{}');
    const vrmFile = sessionData.vrm || 'Kurone.vrm';
    const wallpaper = sessionData.wallpaper;

    console.log('Using session VRM:', vrmFile);
    
    if (wallpaper) {
      console.log('Using session wallpaper:', wallpaper);
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
      (gltf) => {
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
        
        // Create animation mixer
        const mixer = new THREE.AnimationMixer(vrm.scene);
        window.currentMixer = mixer;
        
        // Apply natural pose immediately after scene addition
        setTimeout(() => {
          applyNaturalPose(vrm);
        }, 100);
        
        // Apply pose again after a short delay to ensure it sticks
        setTimeout(() => {
          applyNaturalPose(vrm);
        }, 500);
        
        // Try to load idle animation
        setTimeout(async () => {
          try {
            console.log('Loading ChatVRM idle animation...');
            
            const gltfLoader = new THREE.GLTFLoader();
            const gltf = await gltfLoader.loadAsync('/static/idle_loop.vrma');
            
            if (gltf.animations && gltf.animations.length > 0) {
              const clip = gltf.animations[0];
              console.log('Animation clip found:', clip.name, 'duration:', clip.duration);
              
              const action = mixer.clipAction(clip, vrm.scene);
              action.reset().setLoop(THREE.LoopRepeat).play();
              
              console.log('ChatVRM idle animation successfully playing');
            } else {
              console.log('No animations found in VRMA file');
            }
          } catch (error) {
            console.log('Animation loading failed:', error);
          }
        }, 500);
        
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

  // Animation loop with continuous T-pose prevention
  function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    
    // Update controls
    controls.update();
    
    // Update VRM
    if (window.currentVRM && window.currentVRM.update) {
      window.currentVRM.update(deltaTime);
      
      // Continuously enforce natural pose to prevent T-pose reversion
      if (window.currentVRM.humanoid) {
        const rightUpperArm = window.currentVRM.humanoid.getNormalizedBoneNode("rightUpperArm");
        const leftUpperArm = window.currentVRM.humanoid.getNormalizedBoneNode("leftUpperArm");
        
        if (rightUpperArm && rightUpperArm.rotation.z > -0.5) {
          rightUpperArm.rotation.setFromEuler(new THREE.Euler(0.3, 0, -1.2, 'XYZ'));
        }
        if (leftUpperArm && leftUpperArm.rotation.z < 0.5) {
          leftUpperArm.rotation.setFromEuler(new THREE.Euler(0.3, 0, 1.2, 'XYZ'));
        }
      }
    }
    
    // Update animation mixer
    if (window.currentMixer) {
      window.currentMixer.update(deltaTime);
    }
    
    // Render scene
    renderer.render(scene, camera);
  }

  // Start everything
  animate();
  loadVRMCharacter();
  
  console.log('VRM character system with emotion animations initialized');
  
  return {
    scene,
    camera,
    renderer,
    controls,
    loadVRMCharacter
  };
}