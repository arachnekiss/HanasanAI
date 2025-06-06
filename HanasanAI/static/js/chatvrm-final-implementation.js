/**
 * Final ChatVRM Implementation with Working Blinking
 * Based on exact ChatVRM-main source code with public assets
 */

class ChatVRMFinalImplementation {
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
        // Setup camera position (exact ChatVRM)
        this.camera.position.set(0, 1.3, 1.5);

        // Setup renderer
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Lighting setup (exact ChatVRM)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(1.0, 1.0, 1.0).normalize();
        this.scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        this.isReady = true;
        this.clock.start();
        this.update();

        console.log('ChatVRM Final Implementation initialized');
    }

    async loadVRM(url) {
        console.log('Loading VRM with final ChatVRM implementation:', url);

        try {
            // Create model instance (exact ChatVRM pattern)
            this.model = new ChatVRMModel(this.camera);
            await this.model.loadVRM(url);
            
            this.vrm = this.model.vrm;
            this.mixer = this.model.mixer;

            // Add VRM to scene
            this.scene.add(this.vrm.scene);

            // Load idle animation from public assets
            await this.loadIdleAnimation();

            // Reset camera position
            setTimeout(() => {
                this.resetCamera();
            }, 100);

            console.log('VRM loaded with blinking and expressions');
            return this.vrm;

        } catch (error) {
            console.error('Error loading VRM:', error);
            throw error;
        }
    }

    async loadIdleAnimation() {
        try {
            // Load idle animation from public assets
            const idleUrl = '/public/idle_loop.vrma';
            await this.model.loadAnimation(idleUrl);
            console.log('Idle animation loaded from public assets');
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
 * ChatVRM Model (exact implementation from ChatVRM-main)
 */
class ChatVRMModel {
    constructor(lookAtTargetParent) {
        this.vrm = null;
        this.mixer = null;
        this.emoteController = null;
        this.lookAtTargetParent = lookAtTargetParent;
        this.lipSync = null;

        // Initialize lip sync if audio context available
        try {
            this.lipSync = new ChatVRMBasicLipSync(new AudioContext());
        } catch (error) {
            console.log('Audio context not available');
        }
    }

    async loadVRM(url) {
        const loader = new THREE.GLTFLoader();
        
        // Register VRM loader exactly like ChatVRM
        loader.register((parser) => new THREE.VRMLoaderPlugin(parser, {
            lookAtPlugin: new THREE.VRMLookAtSmootherLoaderPlugin(parser)
        }));

        const gltf = await loader.loadAsync(url);
        this.vrm = gltf.userData.vrm;
        this.vrm.scene.name = "VRMRoot";

        // Apply VRM0 rotation
        if (THREE.VRMUtils && THREE.VRMUtils.rotateVRM0) {
            THREE.VRMUtils.rotateVRM0(this.vrm);
        }

        // Create animation mixer
        this.mixer = new THREE.AnimationMixer(this.vrm.scene);

        // Initialize emote controller with blinking
        this.emoteController = new ChatVRMFinalEmoteController(this.vrm, this.lookAtTargetParent);

        console.log('VRM loaded with expression manager:', !!this.vrm.expressionManager);
    }

    async loadAnimation(url) {
        if (!this.vrm || !this.mixer) {
            throw new Error("You have to load VRM first");
        }

        try {
            // Load VRMA animation from public assets
            const loader = new THREE.GLTFLoader();
            loader.register((parser) => new THREE.VRMLoaderPlugin(parser));
            
            if (THREE.VRMAnimationLoaderPlugin) {
                loader.register((parser) => new THREE.VRMAnimationLoaderPlugin(parser));
            }

            const gltf = await loader.loadAsync(url);
            
            if (gltf.userData.vrmAnimations && gltf.userData.vrmAnimations.length > 0) {
                const vrmAnimation = gltf.userData.vrmAnimations[0];
                
                if (THREE.createVRMAnimationClip) {
                    const clip = THREE.createVRMAnimationClip(vrmAnimation, this.vrm);
                    const action = this.mixer.clipAction(clip);
                    action.play();
                    console.log('VRMA animation playing');
                }
            }
        } catch (error) {
            console.log('Animation loading failed:', error);
        }
    }

    async speak(buffer, screenplay) {
        this.emoteController?.playEmotion(screenplay.expression);
        
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
            this.emoteController?.lipSync("aa", volume);
        }

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
 * ChatVRM Final Emote Controller (with working blinking)
 */
class ChatVRMFinalEmoteController {
    constructor(vrm, camera) {
        this.expressionController = new ChatVRMFinalExpressionController(vrm, camera);
    }

    playEmotion(preset) {
        this.expressionController.playEmotion(preset);
    }

    lipSync(preset, value) {
        this.expressionController.lipSync(preset, value);
    }

    update(delta) {
        this.expressionController.update(delta);
    }
}

/**
 * ChatVRM Final Expression Controller (exact ChatVRM implementation)
 */
class ChatVRMFinalExpressionController {
    constructor(vrm, camera) {
        this.vrm = vrm;
        this.camera = camera;
        this.expressionManager = vrm.expressionManager;
        this.currentEmotion = "neutral";
        this.currentLipSync = null;

        // Initialize auto look at
        this.autoLookAt = new ChatVRMFinalAutoLookAt(vrm, camera);
        
        // Initialize auto blink with working implementation
        if (this.expressionManager) {
            this.autoBlink = new ChatVRMFinalAutoBlink(this.expressionManager);
            console.log('Auto blink initialized with expression manager');
        } else {
            console.warn('No expression manager found for auto blink');
        }
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

    lipSync(preset, value) {
        if (!this.expressionManager) return;

        if (this.currentLipSync) {
            this.expressionManager.setValue(this.currentLipSync.preset, 0);
        }

        this.currentLipSync = { preset, value };
    }

    update(delta) {
        // Update auto blink (this is the key for blinking)
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
 * ChatVRM Final Auto Blink (exact working implementation)
 */
class ChatVRMFinalAutoBlink {
    constructor(expressionManager) {
        this.expressionManager = expressionManager;
        this.remainingTime = 0;
        this.isOpen = true;
        this.isAutoBlink = true;

        // Exact ChatVRM timing
        this.BLINK_CLOSE_MAX = 0.12;
        this.BLINK_OPEN_MAX = 5;

        console.log('Auto blink system ready');
    }

    setEnable(isAuto) {
        this.isAutoBlink = isAuto;
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
        
        if (this.expressionManager) {
            this.expressionManager.setValue("blink", 1);
        }
    }

    open() {
        this.isOpen = true;
        this.remainingTime = this.BLINK_OPEN_MAX + Math.random() * 3;
        
        if (this.expressionManager) {
            this.expressionManager.setValue("blink", 0);
        }
    }
}

/**
 * ChatVRM Final Auto Look At
 */
class ChatVRMFinalAutoLookAt {
    constructor(vrm, camera) {
        this.lookAtTarget = new THREE.Object3D();
        camera.add(this.lookAtTarget);

        if (vrm.lookAt) {
            vrm.lookAt.target = this.lookAtTarget;
        }
    }
}

/**
 * Basic Lip Sync
 */
class ChatVRMBasicLipSync {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.volume = 0;
    }

    playFromArrayBuffer(buffer, callback) {
        if (callback) callback();
    }

    update() {
        return { volume: this.volume };
    }
}

// Export for global use
window.ChatVRMFinalImplementation = ChatVRMFinalImplementation;