/**
 * ChatVRM Direct Blinking Implementation
 * Focuses purely on VRM internal expression system like ChatVRM-main
 */

class ChatVRMDirectBlinking {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(20.0, canvas.clientWidth / canvas.clientHeight, 0.1, 20.0);
        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        this.clock = new THREE.Clock();
        this.vrm = null;
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

        // VRM-optimized lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);

        this.isReady = true;
        this.clock.start();
        this.update();

        console.log('ChatVRM Direct Blinking initialized');
    }

    async loadVRM(url) {
        try {
            const loader = new THREE.GLTFLoader();
            
            // Register VRM loader exactly like ChatVRM-main
            loader.register((parser) => {
                return new THREE.VRMLoaderPlugin(parser);
            });

            console.log('Loading VRM with direct blinking system:', url);

            const gltf = await loader.loadAsync(url);
            this.vrm = gltf.userData.vrm;

            if (!this.vrm) {
                throw new Error('No VRM data found in file');
            }

            // Apply VRM0 rotation (exact ChatVRM)
            if (THREE.VRMUtils && THREE.VRMUtils.rotateVRM0) {
                THREE.VRMUtils.rotateVRM0(this.vrm);
            }

            // Critical: Disable frustum culling
            this.vrm.scene.traverse((child) => {
                child.frustumCulled = false;
            });

            // Add to scene
            this.scene.add(this.vrm.scene);

            // Initialize direct expression controls
            this.initializeExpressionSystem();

            // Reset camera to head position
            setTimeout(() => {
                this.resetCameraToHead();
            }, 100);

            console.log('VRM loaded with direct expression system');
            return this.vrm;

        } catch (error) {
            console.error('Error loading VRM with direct blinking:', error);
            throw error;
        }
    }

    initializeExpressionSystem() {
        if (!this.vrm || !this.vrm.expressionManager) {
            console.warn('No expression manager available');
            return;
        }

        console.log('Expression manager found:', this.vrm.expressionManager);
        console.log('Available expressions:', Object.keys(this.vrm.expressionManager.expressionMap || {}));

        // Initialize direct auto blink
        this.autoBlink = new ChatVRMDirectAutoBlink(this.vrm.expressionManager);
        
        // Initialize breathing
        this.breathingController = new ChatVRMDirectBreathing(this.vrm);

        // Start blinking after a short delay
        setTimeout(() => {
            if (this.autoBlink) {
                this.autoBlink.startBlinking();
            }
        }, 1000);
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

        // Update auto blink
        if (this.autoBlink) {
            this.autoBlink.update(delta);
        }

        // Update breathing
        if (this.breathingController) {
            this.breathingController.update(delta);
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
                    console.log('Direct expression applied:', emotion);
                    
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
 * ChatVRM Direct Auto Blink (hardcoded into VRM expressions)
 */
class ChatVRMDirectAutoBlink {
    constructor(expressionManager) {
        this.expressionManager = expressionManager;
        this.remainingTime = 0;
        this.isOpen = true;
        this.isAutoBlink = true;
        this.isStarted = false;

        // Exact ChatVRM timing
        this.BLINK_CLOSE_DURATION = 0.1;
        this.BLINK_OPEN_MIN = 2.0;
        this.BLINK_OPEN_RANDOM = 3.0;

        console.log('Direct Auto Blink ready');
    }

    startBlinking() {
        this.isStarted = true;
        this.remainingTime = this.BLINK_OPEN_MIN + Math.random() * this.BLINK_OPEN_RANDOM;
        console.log('Direct auto blinking started');
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
        
        // Try different blink expression names
        const blinkExpressions = ['blink', 'Blink', 'BLINK', 'blinkLeft', 'blinkRight', 'eye_close'];
        
        for (const expr of blinkExpressions) {
            try {
                this.expressionManager.setValue(expr, 1.0);
                console.log('Direct blink closed with:', expr);
                break;
            } catch (error) {
                // Try next expression
            }
        }
    }

    open() {
        this.isOpen = true;
        this.remainingTime = this.BLINK_OPEN_MIN + Math.random() * this.BLINK_OPEN_RANDOM;
        
        // Try different blink expression names
        const blinkExpressions = ['blink', 'Blink', 'BLINK', 'blinkLeft', 'blinkRight', 'eye_close'];
        
        for (const expr of blinkExpressions) {
            try {
                this.expressionManager.setValue(expr, 0.0);
                console.log('Direct blink opened with:', expr);
                break;
            } catch (error) {
                // Try next expression
            }
        }
    }
}

/**
 * ChatVRM Direct Breathing (hardcoded into VRM bones)
 */
class ChatVRMDirectBreathing {
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
            // Try different spine bone names
            const spineNames = ['spine', 'Spine', 'SPINE', 'spine1', 'Spine1'];
            
            for (const spineName of spineNames) {
                try {
                    const spine = this.vrm.humanoid.getNormalizedBoneNode(spineName);
                    if (spine) {
                        spine.scale.y = 1.0 + breathingValue;
                        break;
                    }
                } catch (error) {
                    // Try next spine name
                }
            }
        } catch (error) {
            // Breathing not available for this VRM
        }
    }
}

// Export for global use
window.ChatVRMDirectBlinking = ChatVRMDirectBlinking;