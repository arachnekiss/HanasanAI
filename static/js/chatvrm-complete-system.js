/**
 * Complete ChatVRM Animation System
 * Integrates VRM loading, VRMA animations, facial expressions, and auto-blinking
 * Based on ChatVRM-main implementation
 */

class ChatVRMSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.vrm = null;
        this.mixer = null;
        this.expressionController = null;
        this.currentIdleAction = null;
        this.isInitialized = false;
        
        console.log('ChatVRM System initializing...');
        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(20.0, width / height, 0.1, 20.0);
        this.camera.position.set(0, 1.3, 1.5);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        // Add lighting
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(1.0, 1.0, 1.0).normalize();
        this.scene.add(directionalLight);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        this.isInitialized = true;
        console.log('ChatVRM System initialized');
        
        // Start render loop
        this.animate();
    }

    async loadVRM(url) {
        console.log('Loading VRM with ChatVRM system:', url);
        
        try {
            // Create loader with both VRM and VRM Animation plugins
            const loader = new THREE.GLTFLoader();
            
            // Register VRM loader plugin
            loader.register((parser) => new THREE.VRMLoaderPlugin(parser));
            
            // Register VRM Animation loader plugin if available
            if (THREE.VRMAnimationLoaderPlugin) {
                loader.register((parser) => new THREE.VRMAnimationLoaderPlugin(parser));
            }
            
            console.log('Loader plugins registered:', loader.plugins?.length || 'unknown');
            
            // Load VRM
            const gltf = await loader.loadAsync(url);
            this.vrm = gltf.userData.vrm;
            
            if (!this.vrm) {
                throw new Error('Failed to load VRM from GLTF');
            }
            
            // Apply VRM0 rotation fix
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
            
            // Initialize expression controller with auto-blinking
            if (window.ExpressionController) {
                this.expressionController = new window.ExpressionController(this.vrm, this.camera);
                console.log('Expression controller initialized');
            }
            
            console.log('VRM loaded successfully with expression manager:', !!this.vrm.expressionManager);
            
            // Try to load idle animation
            this.loadIdleAnimation();
            
            return this.vrm;
            
        } catch (error) {
            console.error('Error loading VRM:', error);
            throw error;
        }
    }

    async loadIdleAnimation() {
        if (!this.vrm || !this.mixer) return;
        
        try {
            const loader = new THREE.GLTFLoader();
            loader.register((parser) => new THREE.VRMLoaderPlugin(parser));
            
            if (THREE.VRMAnimationLoaderPlugin) {
                loader.register((parser) => new THREE.VRMAnimationLoaderPlugin(parser));
            }
            
            // Try to load idle animation
            const idleUrl = '/static/vrma/idle_loop.vrma';
            console.log('Loading idle animation:', idleUrl);
            
            const gltf = await loader.loadAsync(idleUrl);
            const vrmAnimations = gltf.userData.vrmAnimations;
            
            if (vrmAnimations && vrmAnimations.length > 0) {
                console.log('VRMA animations found:', vrmAnimations.length);
                
                // Create animation clip using ChatVRM method
                if (THREE.createVRMAnimationClip) {
                    const clip = THREE.createVRMAnimationClip(vrmAnimations[0], this.vrm);
                    if (clip && clip.tracks.length > 0) {
                        this.currentIdleAction = this.mixer.clipAction(clip);
                        this.currentIdleAction.reset().setLoop(THREE.LoopRepeat).play();
                        console.log('Idle animation playing with', clip.tracks.length, 'tracks');
                    } else {
                        console.warn('Animation clip has no tracks');
                    }
                } else {
                    console.warn('createVRMAnimationClip not available');
                }
            } else {
                console.warn('No VRM animations found in VRMA file');
            }
            
        } catch (error) {
            console.log('Idle animation not available:', error.message);
        }
    }

    playEmotion(emotion) {
        if (this.expressionController) {
            const vrmExpression = this.expressionController.getVRMExpression(emotion);
            this.expressionController.playEmotion(vrmExpression);
            console.log('Playing emotion:', emotion, '->', vrmExpression);
        }
    }

    playAnimation(animationUrl, loop = false) {
        if (!this.vrm || !this.mixer) return;
        
        const loader = new THREE.GLTFLoader();
        loader.register((parser) => new THREE.VRMLoaderPlugin(parser));
        
        if (THREE.VRMAnimationLoaderPlugin) {
            loader.register((parser) => new THREE.VRMAnimationLoaderPlugin(parser));
        }
        
        loader.load(animationUrl, (gltf) => {
            const vrmAnimations = gltf.userData.vrmAnimations;
            if (vrmAnimations && vrmAnimations.length > 0) {
                if (THREE.createVRMAnimationClip) {
                    const clip = THREE.createVRMAnimationClip(vrmAnimations[0], this.vrm);
                    if (clip && clip.tracks.length > 0) {
                        const action = this.mixer.clipAction(clip);
                        action.reset()
                              .setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce)
                              .play();
                        
                        if (!loop) {
                            action.clampWhenFinished = true;
                        }
                        
                        console.log('Playing animation:', animationUrl);
                    }
                }
            }
        });
    }

    animate() {
        if (!this.isInitialized) return;
        
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Update animation mixer
        if (this.mixer) {
            this.mixer.update(delta);
        }
        
        // Update VRM
        if (this.vrm) {
            this.vrm.update(delta);
        }
        
        // Update expression controller (handles auto-blinking)
        if (this.expressionController) {
            this.expressionController.update(delta);
        }
        
        // Render
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize(width, height) {
        if (this.camera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
        
        if (this.renderer) {
            this.renderer.setSize(width, height);
        }
    }

    dispose() {
        if (this.vrm) {
            if (THREE.VRMUtils && THREE.VRMUtils.deepDispose) {
                THREE.VRMUtils.deepDispose(this.vrm.scene);
            }
            this.vrm = null;
        }
        
        if (this.mixer) {
            this.mixer.stopAllAction();
            this.mixer = null;
        }
        
        this.expressionController = null;
        this.isInitialized = false;
    }
}

// Export for global use
window.ChatVRMSystem = ChatVRMSystem;