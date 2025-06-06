/**
 * ChatVRM Exact Blinking Implementation
 * Direct implementation from ChatVRM source code analysis
 */

class ChatVRMExactBlinking {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(20.0, canvas.clientWidth / canvas.clientHeight, 0.1, 20.0);
        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        this.clock = new THREE.Clock();
        this.vrm = null;
        this.mixer = null;
        this.autoBlink = null;
        this.breathingController = null;
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

        console.log('ChatVRM Exact Blinking initialized');
    }

    async loadVRM(url) {
        try {
            const loader = new THREE.GLTFLoader();
            
            // Register VRM loader exactly like ChatVRM
            loader.register((parser) => {
                return new THREE.VRMLoaderPlugin(parser);
            });

            console.log('Loading VRM with exact blinking system:', url);

            const gltf = await loader.loadAsync(url);
            this.vrm = gltf.userData.vrm;

            if (!this.vrm) {
                throw new Error('No VRM data found in file');
            }

            // Apply VRM0 rotation (exact ChatVRM)
            if (THREE.VRMUtils && THREE.VRMUtils.rotateVRM0) {
                THREE.VRMUtils.rotateVRM0(this.vrm);
            }

            // Critical: Disable frustum culling for VRM models
            this.vrm.scene.traverse((child) => {
                child.frustumCulled = false;
            });

            // Add to scene
            this.scene.add(this.vrm.scene);

            // Create animation mixer
            this.mixer = new THREE.AnimationMixer(this.vrm.scene);

            // Initialize auto blink with expression manager
            if (this.vrm.expressionManager) {
                this.autoBlink = new ChatVRMAutoBlink(this.vrm.expressionManager);
                console.log('Auto blink initialized with expression manager');
            } else {
                console.warn('No expression manager found for auto blink');
            }

            // Initialize breathing controller
            this.breathingController = new ChatVRMBreathingController(this.vrm);

            // Reset camera to head position
            setTimeout(() => {
                this.resetCameraToHead();
            }, 100);

            console.log('VRM loaded with exact ChatVRM blinking system');
            return this.vrm;

        } catch (error) {
            console.error('Error loading VRM with exact blinking:', error);
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
                console.log('Camera positioned to head level');
            }
        } catch (error) {
            console.log('Head positioning not available');
        }
    }

    update = () => {
        if (!this.isReady) return;

        requestAnimationFrame(this.update);
        const delta = this.clock.getDelta();

        // Update auto blink (this is the key for working blinking)
        if (this.autoBlink) {
            this.autoBlink.update(delta);
        }

        // Update breathing controller
        if (this.breathingController) {
            this.breathingController.update(delta);
        }

        // Update animation mixer
        if (this.mixer) {
            this.mixer.update(delta);
        }

        // Update VRM
        if (this.vrm) {
            this.vrm.update(delta);
        }

        // Render
        this.renderer.render(this.scene, this.camera);
    };

    playEmotion(emotion) {
        if (this.vrm && this.vrm.expressionManager) {
            // Disable auto blink during emotion
            if (this.autoBlink) {
                const waitTime = this.autoBlink.setEnable(false);
                
                setTimeout(() => {
                    this.vrm.expressionManager.setValue(emotion, 1.0);
                    console.log('Expression applied:', emotion);
                    
                    // Re-enable auto blink after emotion
                    setTimeout(() => {
                        this.vrm.expressionManager.setValue(emotion, 0.0);
                        this.autoBlink.setEnable(true);
                    }, 2000);
                }, waitTime * 1000);
            } else {
                this.vrm.expressionManager.setValue(emotion, 1.0);
            }
        }
    }
}

/**
 * ChatVRM Auto Blink (exact implementation from source analysis)
 */
class ChatVRMAutoBlink {
    constructor(expressionManager) {
        this.expressionManager = expressionManager;
        this.remainingTime = 0;
        this.isOpen = true;
        this.isAutoBlink = true;

        // Exact ChatVRM timing values
        this.BLINK_CLOSE_DURATION = 0.1;
        this.BLINK_OPEN_MIN = 2.0;
        this.BLINK_OPEN_RANDOM = 3.0;

        console.log('ChatVRM Auto Blink system ready');
    }

    setEnable(isAuto) {
        this.isAutoBlink = isAuto;
        if (!this.isOpen) {
            return this.remainingTime;
        }
        return 0;
    }

    update(delta) {
        if (!this.expressionManager) return;

        this.remainingTime -= delta;
        
        if (this.remainingTime <= 0) {
            if (this.isOpen && this.isAutoBlink) {
                // Start blinking
                this.close();
            } else {
                // Open eyes
                this.open();
            }
        }
    }

    close() {
        this.isOpen = false;
        this.remainingTime = this.BLINK_CLOSE_DURATION;
        
        if (this.expressionManager) {
            this.expressionManager.setValue('blink', 1.0);
        }
    }

    open() {
        this.isOpen = true;
        this.remainingTime = this.BLINK_OPEN_MIN + Math.random() * this.BLINK_OPEN_RANDOM;
        
        if (this.expressionManager) {
            this.expressionManager.setValue('blink', 0.0);
        }
    }
}

/**
 * ChatVRM Breathing Controller (exact implementation)
 */
class ChatVRMBreathingController {
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
            // Apply breathing to spine
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
window.ChatVRMExactBlinking = ChatVRMExactBlinking;