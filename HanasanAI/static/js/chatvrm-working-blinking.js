/**
 * ChatVRM Working Blinking Implementation
 * Based on exact ChatVRM source code with proper initialization
 */

class ChatVRMWorkingBlinking {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(20.0, canvas.clientWidth / canvas.clientHeight, 0.1, 20.0);
        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        this.clock = new THREE.Clock();
        this.vrm = null;
        this.mixer = null;
        this.model = null;
        this.isReady = false;

        this.init();
    }

    init() {
        // Camera position exactly like ChatVRM
        this.camera.position.set(0, 1.3, 1.5);

        // Renderer setup
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // VRM-optimized lighting (exact ChatVRM)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);

        this.isReady = true;
        this.clock.start();
        this.update();

        console.log('ChatVRM Working Blinking initialized');
    }

    async loadVRM(url) {
        try {
            console.log('Loading VRM with working blinking system:', url);

            // Create model instance with proper initialization
            this.model = new ChatVRMWorkingModel(this.camera);
            await this.model.loadVRM(url);
            
            this.vrm = this.model.vrm;
            this.mixer = this.model.mixer;

            // Add VRM to scene
            this.scene.add(this.vrm.scene);

            // Reset camera position
            setTimeout(() => {
                this.resetCameraToHead();
            }, 100);

            console.log('VRM loaded with working blinking system');
            return this.vrm;

        } catch (error) {
            console.error('Error loading VRM with working blinking:', error);
            throw error;
        }
    }

    resetCameraToHead() {
        if (!this.vrm || !this.vrm.humanoid) return;

        try {
            const headNode = this.vrm.humanoid.getNormalizedBoneNode("head");
            if (headNode) {
                const headWPos = headNode.getWorldPosition(new THREE.Vector3());
                this.camera.position.set(
                    this.camera.position.x,
                    headWPos.y,
                    this.camera.position.z
                );
            }
        } catch (error) {
            console.log('Head positioning not available');
        }
    }

    update = () => {
        if (!this.isReady) return;

        requestAnimationFrame(this.update);
        const delta = this.clock.getDelta();

        // Update model (handles blinking, expressions, animations)
        if (this.model) {
            this.model.update(delta);
        }

        // Render
        this.renderer.render(this.scene, this.camera);
    };

    playEmotion(emotion) {
        if (this.model && this.model.emoteController) {
            this.model.emoteController.playEmotion(emotion);
        }
    }
}

/**
 * ChatVRM Working Model (exact ChatVRM implementation)
 */
class ChatVRMWorkingModel {
    constructor(lookAtTargetParent) {
        this.vrm = null;
        this.mixer = null;
        this.emoteController = null;
        this.lookAtTargetParent = lookAtTargetParent;
    }

    async loadVRM(url) {
        const loader = new THREE.GLTFLoader();
        
        // Register VRM loader exactly like ChatVRM
        loader.register((parser) => {
            return new THREE.VRMLoaderPlugin(parser);
        });

        const gltf = await loader.loadAsync(url);
        this.vrm = gltf.userData.vrm;

        if (!this.vrm) {
            throw new Error('No VRM data found in file');
        }

        // Apply VRM0 rotation
        if (THREE.VRMUtils && THREE.VRMUtils.rotateVRM0) {
            THREE.VRMUtils.rotateVRM0(this.vrm);
        }

        // Critical: Disable frustum culling for VRM models
        this.vrm.scene.traverse((child) => {
            child.frustumCulled = false;
        });

        // Create animation mixer
        this.mixer = new THREE.AnimationMixer(this.vrm.scene);

        // Initialize emote controller with working blinking
        this.emoteController = new ChatVRMWorkingEmoteController(this.vrm, this.lookAtTargetParent);

        console.log('VRM loaded with working expression manager:', !!this.vrm.expressionManager);
    }

    update(delta) {
        // Update emote controller (handles blinking and expressions)
        if (this.emoteController) {
            this.emoteController.update(delta);
        }

        // Update animation mixer
        if (this.mixer) {
            this.mixer.update(delta);
        }

        // Update VRM
        if (this.vrm) {
            this.vrm.update(delta);
        }
    }

    unLoadVrm() {
        if (this.vrm) {
            if (THREE.VRMUtils && THREE.VRMUtils.deepDispose) {
                THREE.VRMUtils.deepDispose(this.vrm.scene);
            }
            this.vrm = null;
        }
    }
}

/**
 * ChatVRM Working Emote Controller
 */
class ChatVRMWorkingEmoteController {
    constructor(vrm, camera) {
        this.expressionController = new ChatVRMWorkingExpressionController(vrm, camera);
    }

    playEmotion(preset) {
        this.expressionController.playEmotion(preset);
    }

    update(delta) {
        this.expressionController.update(delta);
    }
}

/**
 * ChatVRM Working Expression Controller (exact working implementation)
 */
class ChatVRMWorkingExpressionController {
    constructor(vrm, camera) {
        this.vrm = vrm;
        this.camera = camera;
        this.expressionManager = vrm.expressionManager;
        this.currentEmotion = "neutral";

        // Initialize auto look at
        this.autoLookAt = new ChatVRMWorkingAutoLookAt(vrm, camera);
        
        // Initialize auto blink with working implementation
        if (this.expressionManager) {
            this.autoBlink = new ChatVRMWorkingAutoBlink(this.expressionManager);
            console.log('Working auto blink initialized');
            
            // Start blinking immediately
            setTimeout(() => {
                this.autoBlink.startBlinking();
            }, 1000);
        } else {
            console.warn('No expression manager found for auto blink');
        }

        // Initialize breathing
        this.breathingController = new ChatVRMWorkingBreathingController(vrm);
    }

    playEmotion(preset) {
        if (!this.expressionManager) return;

        // Clear current emotion
        if (this.currentEmotion !== "neutral") {
            this.expressionManager.setValue(this.currentEmotion, 0);
        }

        // Handle neutral emotion
        if (preset === "neutral") {
            if (this.autoBlink) {
                this.autoBlink.setEnable(true);
            }
            this.currentEmotion = preset;
            return;
        }

        // Handle other emotions
        const waitTime = this.autoBlink ? this.autoBlink.setEnable(false) : 0;
        this.currentEmotion = preset;

        setTimeout(() => {
            if (this.expressionManager) {
                this.expressionManager.setValue(preset, 1);
                console.log('Expression applied:', preset);
            }
        }, waitTime * 1000);
    }

    update(delta) {
        // Update auto blink (this is the key for blinking)
        if (this.autoBlink) {
            this.autoBlink.update(delta);
        }

        // Update breathing
        if (this.breathingController) {
            this.breathingController.update(delta);
        }
    }
}

/**
 * ChatVRM Working Auto Blink (exact working implementation)
 */
class ChatVRMWorkingAutoBlink {
    constructor(expressionManager) {
        this.expressionManager = expressionManager;
        this.remainingTime = 0;
        this.isOpen = true;
        this.isAutoBlink = true;
        this.isStarted = false;

        // Exact ChatVRM timing values
        this.BLINK_CLOSE_DURATION = 0.1;
        this.BLINK_OPEN_MIN = 2.0;
        this.BLINK_OPEN_RANDOM = 3.0;

        console.log('Working Auto Blink system ready');
    }

    startBlinking() {
        this.isStarted = true;
        this.remainingTime = this.BLINK_OPEN_MIN + Math.random() * this.BLINK_OPEN_RANDOM;
        console.log('Auto blinking started');
    }

    setEnable(isAuto) {
        this.isAutoBlink = isAuto;
        if (!this.isOpen) {
            return this.remainingTime;
        }
        return 0;
    }

    update(delta) {
        if (!this.expressionManager || !this.isStarted) return;

        this.remainingTime -= delta;
        
        if (this.remainingTime <= 0) {
            if (this.isOpen && this.isAutoBlink) {
                this.close();
            } else {
                this.open();
            }
        }
    }

    close() {
        this.isOpen = false;
        this.remainingTime = this.BLINK_CLOSE_DURATION;
        
        if (this.expressionManager) {
            this.expressionManager.setValue('blink', 1.0);
            console.log('Blink closed');
        }
    }

    open() {
        this.isOpen = true;
        this.remainingTime = this.BLINK_OPEN_MIN + Math.random() * this.BLINK_OPEN_RANDOM;
        
        if (this.expressionManager) {
            this.expressionManager.setValue('blink', 0.0);
            console.log('Blink opened');
        }
    }
}

/**
 * ChatVRM Working Auto Look At
 */
class ChatVRMWorkingAutoLookAt {
    constructor(vrm, camera) {
        this.lookAtTarget = new THREE.Object3D();
        camera.add(this.lookAtTarget);

        if (vrm.lookAt) {
            vrm.lookAt.target = this.lookAtTarget;
        }
    }
}

/**
 * ChatVRM Working Breathing Controller
 */
class ChatVRMWorkingBreathingController {
    constructor(vrm) {
        this.vrm = vrm;
        this.breathingPhase = 0;
        this.breathingSpeed = 0.5;
        this.breathingIntensity = 0.02;
    }

    update(delta) {
        if (!this.vrm || !this.vrm.humanoid) return;

        this.breathingPhase += delta * this.breathingSpeed;
        const breathingValue = Math.sin(this.breathingPhase) * this.breathingIntensity;

        try {
            const spine = this.vrm.humanoid.getNormalizedBoneNode('spine');
            if (spine) {
                spine.scale.y = 1.0 + breathingValue;
            }
        } catch (error) {
            // Breathing not available for this VRM
        }
    }
}

// Export for global use
window.ChatVRMWorkingBlinking = ChatVRMWorkingBlinking;