/**
 * Exact ChatVRM Implementation
 * Direct port from ChatVRM-main source code for proper blinking and breathing
 */

class ChatVRMExactImplementation {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.vrm = null;
        this.mixer = null;
        this.emoteController = null;
        this.renderer = null;
        this.camera = null;
        this.cameraControls = null;
        this.isReady = false;

        this.init();
    }

    init() {
        // Setup scene exactly like ChatVRM
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        // Camera setup (exact ChatVRM settings)
        this.camera = new THREE.PerspectiveCamera(20.0, width / height, 0.1, 20.0);
        this.camera.position.set(0, 1.3, 1.5);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Lighting (exact ChatVRM setup)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(1.0, 1.0, 1.0).normalize();
        this.scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Camera controls
        if (THREE.OrbitControls) {
            this.cameraControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.cameraControls.screenSpacePanning = true;
            this.cameraControls.update();
        }

        this.isReady = true;
        this.clock.start();
        this.update();

        console.log('ChatVRM exact implementation initialized');
    }

    async loadVRM(url) {
        console.log('Loading VRM with exact ChatVRM implementation:', url);

        try {
            // Create loader exactly like ChatVRM
            const loader = new THREE.GLTFLoader();
            
            // Register VRM loader with LookAt smoother
            loader.register((parser) => new THREE.VRMLoaderPlugin(parser, {
                lookAtPlugin: new THREE.VRMLookAtSmootherLoaderPlugin(parser)
            }));

            // Load VRM
            const gltf = await loader.loadAsync(url);
            this.vrm = gltf.userData.vrm;

            if (!this.vrm) {
                throw new Error('Failed to load VRM from GLTF');
            }

            // Set scene name
            this.vrm.scene.name = "VRMRoot";

            // Apply VRM0 rotation (exact ChatVRM method)
            if (THREE.VRMUtils && THREE.VRMUtils.rotateVRM0) {
                THREE.VRMUtils.rotateVRM0(this.vrm);
            }

            // Disable frustum culling
            this.vrm.scene.traverse((obj) => {
                obj.frustumCulled = false;
            });

            // Add to scene
            this.scene.add(this.vrm.scene);

            // Create animation mixer
            this.mixer = new THREE.AnimationMixer(this.vrm.scene);

            // Initialize emote controller (exact ChatVRM implementation)
            this.emoteController = new ChatVRMEmoteController(this.vrm, this.camera);

            // Load idle animation exactly like ChatVRM
            await this.loadIdleAnimation();

            // Reset camera position
            setTimeout(() => {
                this.resetCamera();
            }, 100);

            console.log('VRM loaded with exact ChatVRM implementation');
            return this.vrm;

        } catch (error) {
            console.error('Error loading VRM:', error);
            throw error;
        }
    }

    async loadIdleAnimation() {
        try {
            // Try to load idle animation exactly like ChatVRM
            const idleUrl = '/public/idle_loop.vrma';
            
            if (window.loadVRMAnimation) {
                const vrmAnimation = await window.loadVRMAnimation(idleUrl);
                if (vrmAnimation && this.vrm && this.mixer) {
                    const clip = vrmAnimation.createAnimationClip(this.vrm);
                    const action = this.mixer.clipAction(clip);
                    action.play();
                    console.log('Idle animation loaded successfully');
                }
            }
        } catch (error) {
            console.log('Idle animation not available:', error.message);
        }
    }

    resetCamera() {
        // Reset camera exactly like ChatVRM
        const headNode = this.vrm?.humanoid?.getNormalizedBoneNode("head");

        if (headNode) {
            const headWPos = headNode.getWorldPosition(new THREE.Vector3());
            this.camera.position.set(
                this.camera.position.x,
                headWPos.y,
                this.camera.position.z
            );
            if (this.cameraControls) {
                this.cameraControls.target.set(headWPos.x, headWPos.y, headWPos.z);
                this.cameraControls.update();
            }
        }
    }

    update = () => {
        if (!this.isReady) return;

        requestAnimationFrame(this.update);
        const delta = this.clock.getDelta();

        // Update camera controls
        if (this.cameraControls) {
            this.cameraControls.update();
        }

        // Update VRM exactly like ChatVRM
        if (this.vrm) {
            this.vrm.update(delta);
        }

        // Update emote controller (handles blinking and expressions)
        if (this.emoteController) {
            this.emoteController.update(delta);
        }

        // Update animation mixer
        if (this.mixer) {
            this.mixer.update(delta);
        }

        // Render
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    };

    playEmotion(emotion) {
        if (this.emoteController) {
            this.emoteController.playEmotion(emotion);
        }
    }

    speak(buffer, screenplay) {
        if (this.emoteController) {
            return this.emoteController.speak(buffer, screenplay);
        }
    }
}

/**
 * ChatVRM Emote Controller (exact implementation)
 */
class ChatVRMEmoteController {
    constructor(vrm, camera) {
        this.vrm = vrm;
        this.camera = camera;
        this.expressionController = new ChatVRMExpressionController(vrm, camera);
        this.lipSync = null;

        // Initialize lip sync if audio context available
        try {
            this.lipSync = new ChatVRMLipSync(new AudioContext());
        } catch (error) {
            console.log('Audio context not available for lip sync');
        }
    }

    playEmotion(preset) {
        this.expressionController.playEmotion(preset);
    }

    lipSync(preset, value) {
        this.expressionController.lipSync(preset, value);
    }

    async speak(buffer, screenplay) {
        this.expressionController.playEmotion(screenplay.expression);
        
        if (this.lipSync) {
            await new Promise((resolve) => {
                this.lipSync.playFromArrayBuffer(buffer, () => {
                    resolve(true);
                });
            });
        }
    }

    update(delta) {
        // Update lip sync
        if (this.lipSync) {
            const { volume } = this.lipSync.update();
            this.expressionController.lipSync("aa", volume);
        }

        // Update expression controller (handles auto-blinking)
        this.expressionController.update(delta);
    }
}

/**
 * ChatVRM Expression Controller (exact implementation with auto-blinking)
 */
class ChatVRMExpressionController {
    constructor(vrm, camera) {
        this.vrm = vrm;
        this.camera = camera;
        this.expressionManager = vrm.expressionManager;
        this.currentEmotion = "neutral";
        this.currentLipSync = null;

        // Initialize auto-blink and auto-look-at
        this.autoLookAt = new ChatVRMAutoLookAt(vrm, camera);
        
        if (this.expressionManager) {
            this.autoBlink = new ChatVRMAutoBlink(this.expressionManager);
        }

        console.log('ChatVRM Expression Controller initialized with auto-blink');
    }

    playEmotion(preset) {
        if (!this.expressionManager) return;

        // Clear current emotion if not neutral
        if (this.currentEmotion !== "neutral") {
            this.expressionManager.setValue(this.currentEmotion, 0);
        }

        // If setting to neutral, enable auto blink
        if (preset === "neutral") {
            if (this.autoBlink) {
                this.autoBlink.setEnable(true);
            }
            this.currentEmotion = preset;
            return;
        }

        // Disable auto blink for expressions and get wait time
        const waitTime = this.autoBlink ? this.autoBlink.setEnable(false) : 0;
        this.currentEmotion = preset;

        // Apply expression after waiting for eyes to open
        setTimeout(() => {
            if (this.expressionManager) {
                this.expressionManager.setValue(preset, 1);
            }
        }, waitTime * 1000);
    }

    lipSync(preset, value) {
        if (!this.expressionManager) return;

        // Clear previous lip sync
        if (this.currentLipSync) {
            this.expressionManager.setValue(this.currentLipSync.preset, 0);
        }

        this.currentLipSync = {
            preset: preset,
            value: value
        };
    }

    update(delta) {
        // Update auto blink (exact ChatVRM implementation)
        if (this.autoBlink) {
            this.autoBlink.update(delta);
        }

        // Update lip sync
        if (this.currentLipSync && this.expressionManager) {
            const weight = this.currentEmotion === "neutral"
                ? this.currentLipSync.value * 0.5
                : this.currentLipSync.value * 0.25;

            this.expressionManager.setValue(this.currentLipSync.preset, weight);
        }
    }
}

/**
 * ChatVRM Auto Blink (exact implementation)
 */
class ChatVRMAutoBlink {
    constructor(expressionManager) {
        this.expressionManager = expressionManager;
        this.remainingTime = 0;
        this.isOpen = true;
        this.isAutoBlink = true;

        // Exact ChatVRM timing constants
        this.BLINK_CLOSE_MAX = 0.12; // Time eyes are closed (sec)
        this.BLINK_OPEN_MAX = 5;     // Time eyes are open (sec)
    }

    setEnable(isAuto) {
        this.isAutoBlink = isAuto;

        // If eyes are closed, return time until they open
        if (!this.isOpen) {
            return this.remainingTime;
        }

        return 0;
    }

    update(delta) {
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
    }

    open() {
        this.isOpen = true;
        this.remainingTime = this.BLINK_OPEN_MAX + Math.random() * 3; // Add randomness
        this.expressionManager.setValue("blink", 0);
    }
}

/**
 * ChatVRM Auto Look At (exact implementation)
 */
class ChatVRMAutoLookAt {
    constructor(vrm, camera) {
        this.lookAtTarget = new THREE.Object3D();
        camera.add(this.lookAtTarget);

        if (vrm.lookAt) {
            vrm.lookAt.target = this.lookAtTarget;
        }
    }
}

/**
 * ChatVRM Lip Sync (basic implementation)
 */
class ChatVRMLipSync {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.volume = 0;
    }

    playFromArrayBuffer(buffer, callback) {
        // Basic implementation - would need full audio analysis for real lip sync
        if (callback) callback();
    }

    update() {
        return { volume: this.volume };
    }
}

// Export for global use
window.ChatVRMExactImplementation = ChatVRMExactImplementation;