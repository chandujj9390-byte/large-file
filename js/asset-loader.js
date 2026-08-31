/**
 * ==========================================================================
 * ARNE 3D ASSET LOADER COMPONENT
 * Handles path normalization (/public/), Three.js texture & model loading,
 * procedural fallback materials/textures, case sensitivity, and error handling.
 * ==========================================================================
 */

class AssetLoaderComponent {
    constructor() {
        this.cache = new Map();
        this.fallbackTextures = new Map();
    }

    /**
     * Audit and convert relative file paths to root-relative static paths pointing to /public/
     * Examples:
     *   './src/assets/image.png' -> '/public/textures/image.png'
     *   'images/photo.jpg'       -> '/public/images/photo.jpg'
     *   'frames/ezgif-frame-001.png' -> '/public/frames/ezgif-frame-001.png'
     */
    normalizePath(rawPath) {
        if (!rawPath || typeof rawPath !== 'string') return '/public/images/hero_frame.png';

        let path = rawPath.trim();

        // 1. External URLs & data URIs remain untouched
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
            return path;
        }

        // 2. Strip leading ./ or src/assets/ or assets/ prefixes
        path = path.replace(/^\.\//, '');
        path = path.replace(/^src\/assets\//, '');
        path = path.replace(/^assets\//, '');

        // 3. Ensure root-relative static path pointing to /public/
        if (!path.startsWith('/public/') && !path.startsWith('public/')) {
            if (path.startsWith('/')) {
                path = '/public' + path;
            } else {
                path = '/public/' + path;
            }
        } else if (path.startsWith('public/')) {
            path = '/' + path;
        }

        return path;
    }

    /**
     * Generates a procedural canvas fallback texture so WebGL never crashes on missing textures
     */
    getFallbackTexture(width = 512, height = 512, label = 'FALLBACK MATERIAL') {
        const key = `${width}_${height}_${label}`;
        if (this.fallbackTextures.has(key)) return this.fallbackTextures.get(key);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Futuristic dark gradient background
            const grad = ctx.createLinearGradient(0, 0, width, height);
            grad.addColorStop(0, '#030906');
            grad.addColorStop(0.5, '#0a2216');
            grad.addColorStop(1, '#00ff88');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            // Subtle grid design
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
            ctx.lineWidth = 2;
            const step = 32;
            for (let x = 0; x < width; x += step) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
            }
            for (let y = 0; y < height; y += step) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
            }

            // Fallback Label Text
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, width / 2, height / 2);
        }

        let textureResult = null;
        if (window.THREE && typeof window.THREE.CanvasTexture === 'function') {
            textureResult = new window.THREE.CanvasTexture(canvas);
            textureResult.needsUpdate = true;
        } else {
            textureResult = canvas;
        }

        this.fallbackTextures.set(key, textureResult);
        return textureResult;
    }

    /**
     * Fallback material for Three.js meshes when texture fails to load
     */
    getFallbackMaterial(color = 0x00ff88) {
        if (window.THREE && window.THREE.MeshStandardMaterial) {
            return new window.THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.3,
                metalness: 0.7,
                wireframe: false
            });
        }
        return null;
    }

    /**
     * Loads a 3D texture using Three.js TextureLoader with procedural fallback handling
     */
    loadTexture(rawPath, onLoad, onError) {
        const normalizedUrl = this.normalizePath(rawPath);

        if (this.cache.has(normalizedUrl)) {
            const cached = this.cache.get(normalizedUrl);
            if (onLoad) onLoad(cached);
            return cached;
        }

        if (window.THREE && window.THREE.TextureLoader) {
            const loader = new window.THREE.TextureLoader();
            return loader.load(
                normalizedUrl,
                (texture) => {
                    this.cache.set(normalizedUrl, texture);
                    if (onLoad) onLoad(texture);
                },
                undefined,
                (err) => {
                    console.warn(`[AssetLoader] Texture load failed for "${normalizedUrl}". Applying procedural fallback.`, err);
                    const fallbackTex = this.getFallbackTexture(512, 512, 'TEXTURE FALLBACK');
                    this.cache.set(normalizedUrl, fallbackTex);
                    if (onError) onError(err);
                    if (onLoad) onLoad(fallbackTex);
                }
            );
        } else {
            // Standard Image Object Fallback
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                this.cache.set(normalizedUrl, img);
                if (onLoad) onLoad(img);
            };
            img.onerror = (err) => {
                console.warn(`[AssetLoader] Image load failed for "${normalizedUrl}". Using fallback element.`, err);
                const fallbackEl = this.getFallbackTexture(512, 512, 'IMAGE FALLBACK');
                this.cache.set(normalizedUrl, fallbackEl);
                if (onError) onError(err);
                if (onLoad) onLoad(fallbackEl);
            };
            img.src = normalizedUrl;
            return img;
        }
    }

    /**
     * Loads a 3D model (.gltf/.glb) using GLTFLoader with procedural fallback mesh
     */
    loadModel(rawPath, onLoad, onError) {
        const normalizedUrl = this.normalizePath(rawPath);

        if (window.THREE && window.THREE.GLTFLoader) {
            const loader = new window.THREE.GLTFLoader();
            loader.load(
                normalizedUrl,
                (gltf) => {
                    if (onLoad) onLoad(gltf.scene || gltf);
                },
                undefined,
                (err) => {
                    console.warn(`[AssetLoader] 3D Model load failed for "${normalizedUrl}". Creating fallback 3D frame.`, err);
                    const fallbackMesh = this.createFallback3DMesh();
                    if (onError) onError(err);
                    if (onLoad) onLoad(fallbackMesh);
                }
            );
        } else {
            console.warn(`[AssetLoader] THREE.GLTFLoader unavailable. Creating fallback 3D mesh.`);
            const fallbackMesh = this.createFallback3DMesh();
            if (onLoad) onLoad(fallbackMesh);
        }
    }

    /**
     * Creates procedural 3D box frame primitive fallback
     */
    createFallback3DMesh() {
        if (!window.THREE) return null;
        const geometry = new window.THREE.BoxGeometry(2, 2, 0.2);
        const material = this.getFallbackMaterial();
        return new window.THREE.Mesh(geometry, material);
    }
}

window.AssetLoader = new AssetLoaderComponent();
