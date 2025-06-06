/**
 * Complete VRM Animation System - Following the Official Guide
 * Implements the 5-step checklist for proper VRMA animation
 */

class VRMAnimationSystem {
    constructor() {
        this.vrm = null;
        this.mixer = null;
        this.loader = null;
        this.clock = new THREE.Clock();
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = null;
        this.currentAction = null;
        this.facialAnimations = null;
        
        // Animation state
        this.isAnimating = false;
        this.animationQueue = [];
        
        this.init();
    }
    
    async init() {
        console.log('Initializing VRM Animation System...');
        
        // Step 1: Register both VRM loader plugins
        this.setupLoader();
        
        // Setup Three.js scene
        this.setupScene();
        
        // Start render loop
        this.startRenderLoop();
    }
    
    // Step 1: Register the two Pixiv loader plugins once
    setupLoader() {
        // Import modules dynamically for compatibility
        this.loader = new THREE.GLTFLoader();
        
        // Register VRM loader plugin
        this.loader.register((parser) => new VRMLoaderPlugin(parser));
        
        // Register VRM Animation loader plugin
        this.loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
        
        console.log('Loader plugins registered:', this.loader.plugins.length);
        
        // Debug: Should list both plugins
        if (this.loader.plugins.length !== 2) {
            console.warn('Expected 2 plugins, got:', this.loader.plugins.length);
        }
    }
    
    setupScene() {
        // Get canvas element
        this.canvas = document.getElementById('vrm-canvas');
        if (!this.canvas) {
            console.error('VRM canvas not found');
            return;
        }
        
        // Setup scene
        this.scene = new THREE.Scene();
        
        // Setup camera
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(30, aspect, 0.1, 20);
        this.camera.position.set(0, 1.4, 2.5);
        this.camera.lookAt(0, 1, 0);
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        console.log('Three.js scene setup complete');
    }
    
    // Step 2: Load the VRM model first, then the VRMA clip
    async loadVRM(vrmPath) {
        return new Promise((resolve, reject) => {
            console.log('Loading VRM:', vrmPath);
            
            this.loader.load(
                vrmPath,
                (gltf) => {
                    console.log('VRM loaded successfully');
                    
                    // Extract VRM
                    this.vrm = gltf.userData.vrm;
                    if (!this.vrm) {
                        reject(new Error('No VRM data found in file'));
                        return;
                    }
                    
                    // Add to scene
                    this.scene.add(this.vrm.scene);
                    
                    // Step 2 continued: Create animation mixer
                    this.mixer = new THREE.AnimationMixer(this.vrm.scene);
                    console.log('Animation mixer created');
                    
                    // Initialize facial animations
                    if (window.VRMFacialAnimations) {
                        this.facialAnimations = new window.VRMFacialAnimations(this.vrm);
                        console.log('VRM facial animations initialized');
                    }
                    
                    // Apply initial pose
                    this.applyChatVRMPose();
                    
                    // Expose globally for compatibility
                    window.currentVRM = this.vrm;
                    
                    resolve(this.vrm);
                },
                (progress) => {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`Loading progress: ${percent}%`);
                },
                (error) => {
                    console.error('Failed to load VRM:', error);
                    reject(error);
                }
            );
        });
    }
    
    // Step 3: Transform the VRMA into a normal Three.js clip
    async loadVRMAAnimation(vrmaPath, loop = true) {
        if (!this.vrm || !this.mixer) {
            throw new Error('VRM must be loaded before loading animations');
        }
        
        return new Promise((resolve, reject) => {
            console.log('Loading VRMA:', vrmaPath);
            
            this.loader.load(
                vrmaPath,
                (gltf) => {
                    console.log('VRMA loaded successfully');
                    
                    const vrmAnims = gltf.userData.vrmAnimations;
                    
                    // Debug guard
                    console.assert(vrmAnims && vrmAnims.length, 'no vrmAnimations array');
                    if (!vrmAnims || !vrmAnims.length) {
                        reject(new Error('No VRM animations found in file'));
                        return;
                    }
                    
                    // Create animation clip
                    const clip = createVRMAnimationClip(vrmAnims[0], this.vrm);
                    
                    // Safety check
                    console.assert(clip.tracks.length, 'clip has zero tracks');
                    if (!clip.tracks.length) {
                        reject(new Error('Animation clip has zero tracks'));
                        return;
                    }
                    
                    console.log(`Animation clip created with ${clip.tracks.length} tracks`);
                    
                    // Create and play action
                    const action = this.mixer.clipAction(clip);
                    action.reset();
                    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
                    
                    if (!loop) {
                        action.clampWhenFinished = true;
                    }
                    
                    // Stop current animation if any
                    if (this.currentAction) {
                        this.currentAction.fadeOut(0.2);
                    }
                    
                    // Start new animation
                    action.fadeIn(0.2).play();
                    this.currentAction = action;
                    
                    console.log('Animation started, isRunning:', action.isRunning());
                    
                    resolve(action);
                },
                undefined,
                (error) => {
                    console.error('Failed to load VRMA:', error);
                    reject(error);
                }
            );
        });
    }
    
    // Step 4: Advance animation every frame
    startRenderLoop() {
        const tick = () => {
            requestAnimationFrame(tick);
            const deltaTime = this.clock.getDelta();
            
            // Both updates are mandatory
            if (this.mixer) {
                this.mixer.update(deltaTime);
            }
            
            if (this.vrm) {
                this.vrm.update(deltaTime);
            }
            
            // Render
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        };
        
        tick();
        console.log('Render loop started');
    }
    
    // Step 6: Action clip system
    async playAction(fileName, once = true) {
        const vrmaPath = `/static/vrma/${fileName}`;
        
        try {
            const action = await this.loadVRMAAnimation(vrmaPath, !once);
            
            if (once) {
                // Return to idle after animation finishes
                this.mixer.addEventListener('finished', (event) => {
                    if (event.action === action) {
                        this.playIdleAnimation();
                        this.mixer.removeEventListener('finished', arguments.callee);
                    }
                });
            }
            
            return action;
        } catch (error) {
            console.error(`Failed to play action ${fileName}:`, error);
            throw error;
        }
    }
    
    async playIdleAnimation() {
        try {
            await this.playAction('idle.vrma', false);
        } catch (error) {
            console.warn('Idle animation not available:', error);
        }
    }
    
    // ChatVRM-style pose application
    applyChatVRMPose() {
        if (!this.vrm) return;
        
        console.log('Starting ChatVRM-style pose application...');
        
        // Apply VRM0 specific rotation if needed
        if (this.vrm.meta.metaVersion === '0') {
            this.vrm.scene.rotation.y = Math.PI;
            console.log('Applied VRM0 rotation');
        }
        
        console.log('ChatVRM-style pose application completed');
    }
    
    // Emotion-based animation
    async setEmotion(emotion) {
        const emotionAnimations = {
            'happy': 'happy.vrma',
            'sad': 'sad.vrma',
            'angry': 'angry.vrma',
            'surprised': 'surprised.vrma',
            'excited': 'excited.vrma'
        };
        
        const animationFile = emotionAnimations[emotion.toLowerCase()];
        
        if (animationFile) {
            try {
                await this.playAction(animationFile, true);
            } catch (error) {
                console.warn(`Emotion animation ${emotion} not available:`, error);
            }
        }
        
        // Also use facial animations
        if (this.facialAnimations) {
            this.facialAnimations.setExpression(emotion);
        }
    }
    
    // Chat message reaction
    async reactToMessage(message, isUserMessage = false) {
        if (this.facialAnimations) {
            this.facialAnimations.reactToMessage(message, isUserMessage);
        }
        
        // Trigger subtle animation for AI responses
        if (!isUserMessage) {
            try {
                await this.playAction('speaking.vrma', true);
            } catch (error) {
                console.warn('Speaking animation not available:', error);
            }
        }
    }
    
    // Debugging checklist
    runDiagnostics() {
        console.log('=== VRM Animation System Diagnostics ===');
        console.log('1. Loader plugins:', this.loader?.plugins?.length || 0);
        console.log('2. VRM loaded:', !!this.vrm);
        console.log('3. Mixer created:', !!this.mixer);
        console.log('4. Current action:', this.currentAction?.getClip()?.name || 'none');
        console.log('5. Action running:', this.currentAction?.isRunning() || false);
        console.log('6. Animation time:', this.currentAction?.time || 0);
        console.log('==========================================');
    }
    
    // Cleanup
    destroy() {
        if (this.facialAnimations) {
            this.facialAnimations.destroy();
        }
        
        if (this.mixer) {
            this.mixer.stopAllAction();
        }
        
        if (this.vrm) {
            this.scene.remove(this.vrm.scene);
        }
        
        console.log('VRM Animation System destroyed');
    }
}

// Global instance
let vrmAnimationSystem = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Three.js and VRM libraries to load
    const initWhenReady = () => {
        if (typeof THREE !== 'undefined' && 
            typeof VRMLoaderPlugin !== 'undefined' && 
            typeof VRMAnimationLoaderPlugin !== 'undefined' &&
            typeof createVRMAnimationClip !== 'undefined') {
            
            vrmAnimationSystem = new VRMAnimationSystem();
            window.vrmAnimationSystem = vrmAnimationSystem;
            console.log('VRM Animation System initialized');
        } else {
            setTimeout(initWhenReady, 100);
        }
    };
    
    initWhenReady();
});

// Export for global access
window.VRMAnimationSystem = VRMAnimationSystem;