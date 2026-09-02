/**
 * ==========================================================================
 * ARNE 3D SCENE SETUP & WEBGL RENDERER COMPONENT
 * Handles WebGL Canvas initialization, Three.js Scene & Camera setup,
 * responsive resizing with DPR capping (max 2), aspect ratio matrix updates,
 * fallback materials, and WebGL context loss prevention & recovery.
 * ==========================================================================
 */

class ThreeSceneComponent {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = null;
        this.animFrameId = null;
        this.isContextLost = false;
        this.activeMesh = null;
        this.fallbackMaterial = null;
    }

    /**
     * Initialize Three.js WebGL Scene on target canvas
     */
    init(canvasId = 'hero-canvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn(`[ThreeScene] Canvas element "#${canvasId}" not found.`);
            return false;
        }

        const width = window.innerWidth;
        const height = window.innerHeight;

        // 1. Scene Setup
        if (window.THREE) {
            this.scene = new window.THREE.Scene();

            // 2. Camera Setup with dynamic aspect ratio
            this.camera = new window.THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
            this.camera.position.set(0, 0, 5);

            // 3. Fallback Material
            this.fallbackMaterial = window.AssetLoader
                ? window.AssetLoader.getFallbackMaterial(0x00ff88)
                : new window.THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.4 });

            // 4. WebGL Renderer with High-Performance Settings
            try {
                this.renderer = new window.THREE.WebGLRenderer({
                    canvas: this.canvas,
                    alpha: true,
                    antialias: true,
                    powerPreference: 'high-performance',
                    preserveDrawingBuffer: false
                });
            } catch (e) {
                console.warn('[ThreeScene] WebGL initialization failed. Falling back to 2D canvas mode.', e);
                return false;
            }

            // 5. DPR Capping & Initial Sizing to prevent context loss on Retina/Mobile screens
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.renderer.setPixelRatio(dpr);
            this.renderer.setSize(width, height, false);

            // 6. Lighting Setup
            const ambientLight = new window.THREE.AmbientLight(0xffffff, 0.8);
            const directionalLight = new window.THREE.DirectionalLight(0x00ff88, 1.2);
            directionalLight.position.set(5, 5, 5);
            this.scene.add(ambientLight);
            this.scene.add(directionalLight);

            // 7. WebGL Context Loss Prevention Listeners
            this.setupContextLossHandlers();

            // 8. Event Listeners for Responsive Screen Updates
            window.addEventListener('resize', () => this.handleResize(), { passive: true });
            window.addEventListener('orientationchange', () => this.handleResize(), { passive: true });

            return true;
        } else {
            console.warn('[ThreeScene] THREE.js library not loaded globally.');
            return false;
        }
    }

    /**
     * Handles WebGL Context Loss and Restoration
     */
    setupContextLossHandlers() {
        if (!this.canvas) return;

        this.canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            console.warn('[ThreeScene] WebGL context lost. Rendering paused to prevent crash.');
            this.isContextLost = true;
            if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        }, false);

        this.canvas.addEventListener('webglcontextrestored', () => {
            console.log('[ThreeScene] WebGL context restored. Re-building 3D scene renderer.');
            this.isContextLost = false;
            this.init(this.canvas.id);
        }, false);
    }

    /**
     * Dynamic Window Resize Handler
     * Updates camera aspect ratio and renderer viewport bounds across mobile, tablet, & desktop
     */
    handleResize() {
        if (!this.renderer || !this.camera || this.isContextLost) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // 1. Update Camera Aspect Ratio Matrix
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        // 2. Cap Device Pixel Ratio to Max 2 (Mobile & Tablet Protection)
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.renderer.setPixelRatio(dpr);

        // 3. Resize Renderer Viewport
        this.renderer.setSize(width, height, false);
    }

    /**
     * Safely load 3D texture/frame with fallback handling and render mesh
     */
    loadTextureMesh(texturePath) {
        if (!this.scene) return;

        if (window.AssetLoader) {
            window.AssetLoader.loadTexture(
                texturePath,
                (texture) => {
                    const geometry = new window.THREE.PlaneGeometry(3.5, 2.0);
                    let material = null;

                    if (texture && texture.isTexture) {
                        material = new window.THREE.MeshStandardMaterial({
                            map: texture,
                            transparent: true,
                            roughness: 0.2
                        });
                    } else {
                        // Fallback material if texture failed to load
                        material = this.fallbackMaterial;
                    }

                    if (this.activeMesh) this.scene.remove(this.activeMesh);
                    this.activeMesh = new window.THREE.Mesh(geometry, material);
                    this.scene.add(this.activeMesh);
                },
                (err) => {
                    console.warn(`[ThreeScene] Render fallback mesh applied for "${texturePath}"`, err);
                }
            );
        }
    }

    /**
     * Main Render Loop with Context Loss Checking
     */
    render() {
        if (this.isContextLost || !this.renderer || !this.scene || !this.camera) return;

        if (this.activeMesh) {
            this.activeMesh.rotation.y += 0.002;
        }

        this.renderer.render(this.scene, this.camera);
        this.animFrameId = requestAnimationFrame(() => this.render());
    }
}

window.ThreeScene = new ThreeSceneComponent();
