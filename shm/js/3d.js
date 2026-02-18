/**
 * 3D Visualization Module
 * Handles Three.js 3D visualization of structural elements
 */

// Global animation tracking
const ANIMATIONS = {};

/**
 * Generate a random ID
 */
function makeId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * 3D Scene Creator Class
 */
class Scene3D {
    constructor(containerId, width = '100%', height = '600px') {
        this.containerId = containerId;
        this.width = width;
        this.height = height;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.nodes = null;
        this.connections = null;
        this.profiles = null;
        this.profileIdByElement = null;
        this.meshes = [];
        this.animationId = null;
        this.materialDictionary = {};
        this.data = null; // For color-coding based on data values
        this.dataArray = null;
        this.raycaster = null;
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null;
        this.selectedObject = null;
        this.onPickCallback = null; // Callback for when an object is picked
        this.originalMaterials = {}; // Store original materials for hover effect
        this.currentIntervalId = null; // For blinking effect
        this.selectMaterial = null; // Material for selected/blinking elements
        this.interactivitySetupAttempts = 0; // Track retry attempts
        this.maxInteractivitySetupAttempts = 100; // Maximum retry attempts
        this.interactivitySetupInterval = 300; // Retry interval in ms
    }

    /**
     * Initialize the 3D scene
     */
    async init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID ${this.containerId} not found`);
            return false;
        }

        // Clear container
        container.innerHTML = '';

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setClearColor(0xffffff);
        container.appendChild(this.renderer.domElement);

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);

        // Create camera (Orthographic for better structural visualization)
        const width = container.clientWidth;
        const height = container.clientHeight;
        this.camera = new THREE.OrthographicCamera(
            width / -2, width / 2,
            height / 2, height / -2,
            0.001, 100000
        );
        this.camera.up.set(0, 0, 1);

        // Create controls
        if (typeof THREE !== 'undefined' && typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.target.set(12500, 12500, 5000);
            this.controls.update();
        } else {
            console.warn('OrbitControls not available, 3D scene will be static');
        }

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xd5d5d5);
        this.scene.add(ambientLight);

        const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
        this.scene.add(hemisphereLight);

        // Add axes helper
        const axesHelper = new THREE.AxesHelper(5000);
        this.scene.add(axesHelper);

        // Initialize raycaster for mouse picking
        this.raycaster = new THREE.Raycaster();
        
        // Create selection material for blinking effect
        this.selectMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffff00, 
            emissive: 0xffff00, 
            emissiveIntensity: 0.8 
        });
        
        // Add mouse event listeners for interactivity with time-based retry
        this.trySetupInteractivity();

        // Handle window resize
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const cr = entry.contentRect;
                if (this.camera.type === 'OrthographicCamera') {
                    this.camera.left = -cr.width / 2;
                    this.camera.right = cr.width / 2;
                    this.camera.top = cr.height / 2;
                    this.camera.bottom = -cr.height / 2;
                }
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(cr.width, cr.height);
            }
        });
        resizeObserver.observe(container);

        // Start animation loop
        this.animationId = makeId(5);
        ANIMATIONS[this.animationId] = { stopAnimation: false };
        this.animate();

        return true;
    }

    /**
     * Try to setup interactivity with time-based retry (similar to shm_webpage Event3D.tryAddingBasicEvents)
     */
    trySetupInteractivity() {
        const parent = this;
        
        setTimeout(() => {
            // Check if meshes are available and renderer is ready
            if (parent.meshes && parent.meshes.length > 0 && parent.renderer && parent.renderer.domElement) {
                parent.setupInteractivity();
            } else if (parent.interactivitySetupAttempts < parent.maxInteractivitySetupAttempts) {
                parent.interactivitySetupAttempts++;
                // Try again after interval
                parent.trySetupInteractivity();
            } else {
                console.warn('Failed to setup interactivity after maximum attempts');
            }
        }, parent.interactivitySetupInterval);
    }

    /**
     * Setup interactivity (mouse hover and click)
     */
    setupInteractivity() {
        if (!this.renderer || !this.renderer.domElement) return;
        
        const onMouseMove = (event) => {
            if (!this.raycaster || !this.camera) return;
            
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.meshes, true);
            
            // Handle hover
            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (this.hoveredObject !== object) {
                    // Reset previous hover
                    if (this.hoveredObject && this.hoveredObject !== this.selectedObject) {
                        this.resetHover(this.hoveredObject);
                    }
                    
                    // Set new hover
                    this.hoveredObject = object;
                    if (this.hoveredObject !== this.selectedObject) {
                        this.setHover(this.hoveredObject);
                    }
                    
                    // Change cursor
                    this.renderer.domElement.style.cursor = 'pointer';
                }
            } else {
                // No intersection - reset hover
                if (this.hoveredObject && this.hoveredObject !== this.selectedObject) {
                    this.resetHover(this.hoveredObject);
                }
                this.hoveredObject = null;
                this.renderer.domElement.style.cursor = 'default';
            }
        };
        
        const onMouseClick = (event) => {
            if (!this.raycaster || !this.camera) return;
            
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.meshes, true);
            
            if (intersects.length > 0) {
                const object = intersects[0].object;
                this.selectObject(object);
            } else {
                // Clicked on empty space - deselect
                this.deselectObject();
            }
        };
        
        this.renderer.domElement.addEventListener('mousemove', onMouseMove);
        this.renderer.domElement.addEventListener('click', onMouseClick);
        
        // Store handlers for cleanup
        this._mouseMoveHandler = onMouseMove;
        this._mouseClickHandler = onMouseClick;
    }
    
    /**
     * Set hover effect on an object
     */
    setHover(object) {
        if (!object || !object.material) return;
        
        // Store original material if not already stored
        if (!this.originalMaterials[object.uuid]) {
            this.originalMaterials[object.uuid] = object.material.clone();
        }
        
        // Create highlight material (brighter/lighter)
        const highlightColor = new THREE.Color(0xffff00); // Yellow highlight
        if (object.material instanceof THREE.MeshLambertMaterial) {
            object.material.emissive = highlightColor;
            object.material.emissiveIntensity = 0.3;
        } else if (object.material instanceof THREE.LineBasicMaterial) {
            object.material.color = highlightColor;
        }
    }
    
    /**
     * Reset hover effect on an object
     */
    resetHover(object) {
        if (!object || !this.originalMaterials[object.uuid]) return;
        
        // Restore original material
        const originalMaterial = this.originalMaterials[object.uuid];
        if (object.material instanceof THREE.MeshLambertMaterial) {
            object.material.emissive.copy(originalMaterial.emissive);
            object.material.emissiveIntensity = originalMaterial.emissiveIntensity;
        } else if (object.material instanceof THREE.LineBasicMaterial) {
            object.material.color.copy(originalMaterial.color);
        }
    }
    
    /**
     * Select an object with blinking effect (similar to shm_webpage Event3D.blinkingElement)
     */
    selectObject(object) {
        // Stop any existing blinking
        this.stopBlinking();
        
        // Reset previous selection
        if (this.selectedObject && this.selectedObject !== object) {
            this.resetHover(this.selectedObject);
        }
        
        // Set new selection
        this.selectedObject = object;
        
        // Start blinking effect
        if (object) {
            this.startBlinking(object);
        }
        
        // Call callback with object data
        if (this.onPickCallback && object && object.userData) {
            this.onPickCallback({
                object: object,
                userData: object.userData
            });
        }
    }
    
    /**
     * Start blinking effect on selected object (similar to shm_webpage Event3D.blinkingElement)
     */
    startBlinking(object) {
        if (!object || !object.material) return;
        
        const parent = this;
        
        // Store original material reference (not a clone, just the reference)
        if (!parent.originalMaterials[object.uuid]) {
            parent.originalMaterials[object.uuid] = object.material;
        }
        
        // Create material dictionary for blinking (like shm_webpage)
        const matDic = {
            0: parent.originalMaterials[object.uuid], // Original material
            1: parent.selectMaterial // Selection material
        };
        
        let index = 0;
        
        // Start blinking interval (300ms like shm_webpage)
        // Replace entire material reference instead of modifying properties
        parent.currentIntervalId = setInterval(() => {
            if (object && object.material) {
                // Replace the material reference (like shm_webpage does)
                // This prevents shared materials from affecting all elements
                object.material = matDic[index];
                
                // Toggle index
                index = index === 0 ? 1 : 0;
            }
        }, 300);
    }
    
    /**
     * Stop blinking effect (similar to shm_webpage Event3D.stopBlinking)
     */
    stopBlinking() {
        if (this.currentIntervalId) {
            clearInterval(this.currentIntervalId);
            this.currentIntervalId = null;
        }
        
        // Restore original material reference (like shm_webpage)
        // Replace the entire material reference instead of modifying properties
        if (this.selectedObject && this.originalMaterials[this.selectedObject.uuid]) {
            this.selectedObject.material = this.originalMaterials[this.selectedObject.uuid];
        }
    }
    
    /**
     * Deselect current object
     */
    deselectObject() {
        // Stop blinking
        this.stopBlinking();
        
        if (this.selectedObject) {
            this.resetHover(this.selectedObject);
            this.selectedObject = null;
        }
        
        // Call callback with null to indicate deselection
        if (this.onPickCallback) {
            this.onPickCallback({
                object: null,
                userData: null
            });
        }
    }
    
    /**
     * Set callback for when an object is picked
     */
    setOnPickCallback(callback) {
        this.onPickCallback = callback;
    }

    /**
     * Animation loop
     */
    animate() {
        if (ANIMATIONS[this.animationId] && !ANIMATIONS[this.animationId].stopAnimation) {
            requestAnimationFrame(() => this.animate());
            if (this.controls) {
                this.controls.update();
            }
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Load nodes and connections data
     * Tries local static folder first, then API endpoints, then remote static files
     */
    async loadStructure() {
        try {
            // Try loading from static files first (local static folder)
            let nodesResult = await this.loadNodesFromFile();
            let connectionsResult = await this.loadConnectionsFromFile();
            let profilesResult = await this.loadProfilesFromFile();
            let profileIdByElementResult = await this.loadProfileIdByElementFromFile();

            // If static files fail, try API endpoints
            if (!nodesResult.success) {
                console.log('Static file failed, trying API endpoint for nodes...');
                nodesResult = await getNodes();
            }

            if (!connectionsResult.success) {
                console.log('Static file failed, trying API endpoint for connections...');
                connectionsResult = await getConnections();
            }

            if (!nodesResult.success) {
                console.error('Failed to load nodes:', nodesResult.error);
                return false;
            }
            this.nodes = nodesResult.data;

            if (!connectionsResult.success) {
                console.error('Failed to load connections:', connectionsResult.error);
                return false;
            }
            this.connections = connectionsResult.data;

            // Profiles are optional - if not available, we'll use simple lines
            if (profilesResult.success) {
                this.profiles = profilesResult.data;
            } else {
                console.log('Profiles not available, will use simple wireframe');
                this.profiles = null;
            }

            if (profileIdByElementResult.success) {
                this.profileIdByElement = profileIdByElementResult.data;
            } else {
                console.log('ProfileIdByElement not available, will use simple wireframe');
                this.profileIdByElement = null;
            }

            return true;
        } catch (error) {
            console.error('Error loading structure:', error);
            return false;
        }
    }

    /**
     * Load nodes from static file
     */
    async loadNodesFromFile() {
        try {
            // Determine base URL from API_BASE_URL
            // If API_BASE_URL is 'https://mincka-shm.com/api', baseUrl should be 'https://mincka-shm.com'
            let baseUrl = '';
            if (window.API_BASE_URL) {
                const url = new URL(window.API_BASE_URL);
                baseUrl = `${url.protocol}//${url.host}`;
            } else {
                // Fallback: use current origin
                baseUrl = window.location.origin;
            }
            
            // Try multiple possible paths (local static folder first, then remote)
            const possiblePaths = [
                './static/Nodes.txt',  // Local static folder
                '/static/Nodes.txt',    // Local static folder (absolute)
                `${baseUrl}/static/Nodes.txt`,  // Remote static folder
                `${baseUrl}/assets/data/Nodes.txt`,  // Remote original path
                `${baseUrl}/data/Nodes.txt`,
                `${baseUrl}/Nodes.txt`
            ];
            
            let nodes = null;
            let lastError = null;
            
            for (const path of possiblePaths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        const text = await response.text();
                        const lines = text.trim().split('\n');
                        nodes = [];
                        
                        lines.forEach(line => {
                            if (line.trim()) {
                                // Handle both tab and space delimiters
                                const parts = line.trim().split(/\s+/);
                                if (parts.length >= 3) {
                                    nodes.push({
                                        x: parseFloat(parts[0]),
                                        y: parseFloat(parts[1]),
                                        z: parseFloat(parts[2])
                                    });
                                }
                            }
                        });
                        
                        console.log(`Successfully loaded nodes from: ${path}`);
                        return { success: true, data: nodes };
                    }
                } catch (error) {
                    lastError = error;
                    continue;
                }
            }
            
            throw lastError || new Error('Failed to load nodes from any path');
        } catch (error) {
            console.error('Error loading nodes from file:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load connections from static file
     */
    async loadConnectionsFromFile() {
        try {
            // Determine base URL from API_BASE_URL
            let baseUrl = '';
            if (window.API_BASE_URL) {
                const url = new URL(window.API_BASE_URL);
                baseUrl = `${url.protocol}//${url.host}`;
            } else {
                // Fallback: use current origin
                baseUrl = window.location.origin;
            }
            
            // Try multiple possible paths (local static folder first, then remote)
            const possiblePaths = [
                './static/Connc.txt',  // Local static folder
                '/static/Connc.txt',    // Local static folder (absolute)
                `${baseUrl}/static/Connc.txt`,  // Remote static folder
                `${baseUrl}/assets/data/Connc.txt`,  // Remote original path
                `${baseUrl}/data/Connc.txt`,
                `${baseUrl}/Connc.txt`
            ];
            
            let connections = null;
            let lastError = null;
            
            for (const path of possiblePaths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        const text = await response.text();
                        const lines = text.trim().split('\n');
                        connections = [];
                        
                        lines.forEach(line => {
                            if (line.trim()) {
                                // Handle comma-separated format: start,end
                                const parts = line.trim().split(',');
                                if (parts.length >= 2) {
                                    connections.push({
                                        start: parseInt(parts[0]),
                                        end: parseInt(parts[1])
                                    });
                                }
                            }
                        });
                        
                        console.log(`Successfully loaded connections from: ${path}`);
                        return { success: true, data: connections };
                    }
                } catch (error) {
                    lastError = error;
                    continue;
                }
            }
            
            throw lastError || new Error('Failed to load connections from any path');
        } catch (error) {
            console.error('Error loading connections from file:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load profiles from static file (Frames-2.json)
     */
    async loadProfilesFromFile() {
        try {
            let baseUrl = '';
            if (window.API_BASE_URL) {
                const url = new URL(window.API_BASE_URL);
                baseUrl = `${url.protocol}//${url.host}`;
            } else {
                baseUrl = window.location.origin;
            }
            
            const possiblePaths = [
                './static/Frames-2.json',
                '/static/Frames-2.json',
                `${baseUrl}/static/Frames-2.json`,
                `${baseUrl}/assets/data/Frames-2.json`,
                `${baseUrl}/data/Frames-2.json`
            ];
            
            let lastError = null;
            
            for (const path of possiblePaths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        const json = await response.json();
                        // Parse profiles into a dictionary keyed by Elementid
                        const profiles = {};
                        if (Array.isArray(json)) {
                            json.forEach(element => {
                                profiles[element.Elementid] = element;
                            });
                        }
                        console.log(`Successfully loaded profiles from: ${path}`);
                        return { success: true, data: profiles };
                    }
                } catch (error) {
                    lastError = error;
                    continue;
                }
            }
            
            throw lastError || new Error('Failed to load profiles from any path');
        } catch (error) {
            console.error('Error loading profiles from file:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load profileIdByElement from static file (Elementid-2.txt)
     */
    async loadProfileIdByElementFromFile() {
        try {
            let baseUrl = '';
            if (window.API_BASE_URL) {
                const url = new URL(window.API_BASE_URL);
                baseUrl = `${url.protocol}//${url.host}`;
            } else {
                baseUrl = window.location.origin;
            }
            
            const possiblePaths = [
                './static/Elementid-2.txt',
                '/static/Elementid-2.txt',
                `${baseUrl}/static/Elementid-2.txt`,
                `${baseUrl}/assets/data/Elementid-2.txt`,
                `${baseUrl}/data/Elementid-2.txt`
            ];
            
            let lastError = null;
            
            for (const path of possiblePaths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        const text = await response.text();
                        const lines = text.trim().split('\n');
                        const elementProfileIndex = {};
                        
                        lines.forEach((data, elementId) => {
                            if (data.trim()) {
                                const parts = data.trim().split(/\s+/);
                                if (parts.length >= 2) {
                                    const profileId = Number(parts[0]);
                                    const rotation = Number(parts[1]) * Math.PI / 180; // Convert to radians
                                    elementProfileIndex[elementId + 1] = { profileId: profileId, rotation: rotation };
                                }
                            }
                        });
                        
                        console.log(`Successfully loaded profileIdByElement from: ${path}`);
                        return { success: true, data: elementProfileIndex };
                    }
                } catch (error) {
                    lastError = error;
                    continue;
                }
            }
            
            throw lastError || new Error('Failed to load profileIdByElement from any path');
        } catch (error) {
            console.error('Error loading profileIdByElement from file:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create 3D structure from nodes and connections
     * Uses profiles if available, otherwise falls back to simple lines
     */
    createStructure() {
        if (!this.nodes || !this.connections) {
            console.error('Nodes or connections not loaded');
            return;
        }

        // Clear existing meshes
        this.meshes.forEach(mesh => {
            this.scene.remove(mesh);
        });
        this.meshes = [];
        this.materialDictionary = {};

        // Check if we have profiles - if so, create extruded shapes
        if (this.profiles && this.profileIdByElement) {
            this.create3DModelWithProfiles();
        } else {
            // Fallback to simple wireframe
            this.createSimpleWireframe();
        }

        // Adjust camera to fit structure
        this.fitCameraToStructure();
        
        // Retry interactivity setup now that meshes are created
        // Reset attempt counter to allow retry
        if (this.meshes.length > 0 && !this._mouseMoveHandler) {
            this.interactivitySetupAttempts = 0;
            this.trySetupInteractivity();
        }
    }

    /**
     * Create simple wireframe (fallback when profiles are not available)
     */
    createSimpleWireframe() {
        // Create lines for each connection
        this.connections.forEach((connection, index) => {
            const startIdx = connection.start - 1;
            const endIdx = connection.end - 1;

            if (startIdx >= 0 && startIdx < this.nodes.length &&
                endIdx >= 0 && endIdx < this.nodes.length) {
                const startNode = this.nodes[startIdx];
                const endNode = this.nodes[endIdx];

                const points = [
                    new THREE.Vector3(startNode.x, startNode.y, startNode.z),
                    new THREE.Vector3(endNode.x, endNode.y, endNode.z)
                ];

                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ color: 0x888888, linewidth: 2 });
                const line = new THREE.Line(geometry, material);
                
                line.userData = { Id: index + 1 };
                
                this.scene.add(line);
                this.meshes.push(line);
            }
        });
    }

    /**
     * Create 3D model with extruded profiles
     */
    create3DModelWithProfiles() {
        this.connections.forEach((connection, index) => {
            const elementId = index + 1;
            const startIdx = connection.start - 1;
            const endIdx = connection.end - 1;

            if (startIdx >= 0 && startIdx < this.nodes.length &&
                endIdx >= 0 && endIdx < this.nodes.length) {
                
                const startNode = this.nodes[startIdx];
                const endNode = this.nodes[endIdx];
                const startPoint = new THREE.Vector3(startNode.x, startNode.y, startNode.z);
                const endPoint = new THREE.Vector3(endNode.x, endNode.y, endNode.z);
                const directionVector = endPoint.clone().sub(startPoint);

                // Get profile info for this element
                const profileInfo = this.profileIdByElement[elementId];
                if (!profileInfo) {
                    // Fallback to simple line if no profile info
                    const geometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
                    const material = new THREE.LineBasicMaterial({ color: 0x888888 });
                    const line = new THREE.Line(geometry, material);
                    line.userData = { Id: elementId };
                    this.scene.add(line);
                    this.meshes.push(line);
                    return;
                }

                const profileId = profileInfo.profileId;
                const rotation = profileInfo.rotation;
                const profile = this.profiles[profileId];

                if (!profile || !profile.Polygon) {
                    // Fallback to simple line if profile not found
                    const geometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
                    const material = new THREE.LineBasicMaterial({ color: 0x888888 });
                    const line = new THREE.Line(geometry, material);
                    line.userData = { Id: elementId };
                    this.scene.add(line);
                    this.meshes.push(line);
                    return;
                }

                // Create shape from profile polygon
                const shape = new THREE.Shape();
                const polygon = profile.Polygon;
                
                polygon.forEach((point, pointIndex) => {
                    // Original uses y, -x for orientation
                    if (pointIndex === 0) {
                        shape.moveTo(point.y, -point.x);
                    } else {
                        shape.lineTo(point.y, -point.x);
                    }
                });
                shape.lineTo(polygon[0].y, -polygon[0].x); // Close the shape

                // Create extrusion path
                const path = new THREE.CatmullRomCurve3([
                    new THREE.Vector3(0, 0, 0),
                    directionVector.clone()
                ]);

                const extrudeSettings = {
                    steps: 1,
                    extrudePath: path
                };

                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

                // Get or create material
                let material;
                if (this.data && this.dataArray) {
                    // Use color based on data value
                    const value = this.data[elementId];
                    if (value !== undefined) {
                        material = this.getMaterialRainbow(value);
                    } else {
                        material = this.getDefaultMaterial(profileId);
                    }
                } else {
                    material = this.getDefaultMaterial(profileId);
                }

                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.copy(startPoint);
                mesh.rotateOnAxis(directionVector.normalize(), rotation);
                mesh.userData = { Id: elementId };

                // Add edges for better visibility
                if (polygon.length < 20 || !profile.Name || !profile.Name.includes('CHS')) {
                    const edges = new THREE.EdgesGeometry(geometry);
                    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x838383 }));
                    mesh.add(line);
                }

                this.scene.add(mesh);
                this.meshes.push(mesh);
            }
        });
    }

    /**
     * Get default material for a profile
     */
    getDefaultMaterial(profileId) {
        if (this.materialDictionary[profileId]) {
            return this.materialDictionary[profileId];
        }
        
        // Create a gray material
        const material = new THREE.MeshLambertMaterial({ color: 0x888888 });
        this.materialDictionary[profileId] = material;
        return material;
    }

    /**
     * Get rainbow material based on value
     */
    getMaterialRainbow(value) {
        if (!this.dataArray) return this.getDefaultMaterial(1);
        
        const maxValue = Math.max(...this.dataArray);
        const minValue = Math.min(...this.dataArray);
        const range = maxValue - minValue || 1;
        
        // Color mapping: blue (low) to red (high)
        const normalizedValue = (value - minValue) / range;
        const hue = (1 - normalizedValue) * 240; // 240 (blue) to 0 (red)
        const color = new THREE.Color().setHSL(hue / 360, 1, 0.5);
        
        return new THREE.MeshLambertMaterial({ color: color });
    }

    /**
     * Get boundary coordinates from nodes (matching shm_webpage logic)
     */
    getBoundaryCoordinates() {
        if (!this.nodes || this.nodes.length === 0) {
            return {
                minCoordinates: { x: 0, y: 0, z: 0 },
                maxCoordinates: { x: 0, y: 0, z: 0 },
                centerCoordinates: { x: 0, y: 0, z: 0 }
            };
        }

        const maxCoordinates = { x: -Infinity, y: -Infinity, z: -Infinity };
        const minCoordinates = { x: Infinity, y: Infinity, z: Infinity };
        const centerCoordinates = { x: 0, y: 0, z: 0 };

        // Find min and max for each axis
        this.nodes.forEach(node => {
            maxCoordinates.x = Math.max(maxCoordinates.x, node.x);
            maxCoordinates.y = Math.max(maxCoordinates.y, node.y);
            maxCoordinates.z = Math.max(maxCoordinates.z, node.z);
            minCoordinates.x = Math.min(minCoordinates.x, node.x);
            minCoordinates.y = Math.min(minCoordinates.y, node.y);
            minCoordinates.z = Math.min(minCoordinates.z, node.z);
        });

        // Calculate center
        Object.keys(centerCoordinates).forEach(axis => {
            centerCoordinates[axis] = (minCoordinates[axis] + maxCoordinates[axis]) / 2;
        });

        return { minCoordinates, maxCoordinates, centerCoordinates };
    }

    /**
     * Configure scene with proper camera position and zoom (matching shm_webpage configScene)
     */
    configScene() {
        if (!this.nodes || this.nodes.length === 0) return;

        const boundaryCoordinates = this.getBoundaryCoordinates();
        const { minCoordinates, maxCoordinates, centerCoordinates } = boundaryCoordinates;

        // Store for later use
        this.boundaryCoordinates = boundaryCoordinates;
        this.centerVector = new THREE.Vector3(
            centerCoordinates.x,
            centerCoordinates.y,
            centerCoordinates.z
        );

        // Set camera position based on boundaries (matching shm_webpage formula)
        this.camera.position.x = (-maxCoordinates.x + minCoordinates.x) * 1 + centerCoordinates.x;
        this.camera.position.y = (-maxCoordinates.y + minCoordinates.y) * 1 + centerCoordinates.y;
        this.camera.position.z = (+maxCoordinates.z - minCoordinates.z) * 1.9 + centerCoordinates.z;
        
        // Look at center
        this.camera.lookAt(this.centerVector);
        
        // Set zoom to 0.02 (matching shm_webpage)
        this.camera.zoom = 0.02;
        this.camera.updateProjectionMatrix();
        
        // Update controls
        if (this.controls) {
            this.controls.target.copy(this.centerVector);
            this.controls.update();
        }
    }

    /**
     * Fit camera to show entire structure (calls configScene for consistency)
     */
    fitCameraToStructure() {
        this.configScene();
    }

    /**
     * Update structure colors based on data values
     */
    updateColors(data, dataKey = 'value') {
        if (!this.meshes || !data) return;

        // Store data for use in material creation
        this.data = {};
        this.dataArray = [];

        // Find min and max values
        let minValue = Infinity;
        let maxValue = -Infinity;

        data.forEach((item, index) => {
            const value = item[dataKey] || item.value || 0;
            this.data[index + 1] = value; // 1-based indexing
            this.dataArray.push(value);
            minValue = Math.min(minValue, value);
            maxValue = Math.max(maxValue, value);
        });

        // Update mesh colors based on data
        this.meshes.forEach(mesh => {
            if (mesh.userData && mesh.userData.Id) {
                const elementId = mesh.userData.Id;
                const value = this.data[elementId];

                if (value !== undefined) {
                    // Color mapping: blue (low) to red (high)
                    const normalizedValue = (value - minValue) / (maxValue - minValue || 1);
                    const hue = (1 - normalizedValue) * 240; // 240 (blue) to 0 (red)
                    const color = new THREE.Color().setHSL(hue / 360, 1, 0.5);
                    
                    // Update material color
                    if (mesh.material) {
                        if (mesh.material instanceof THREE.MeshLambertMaterial) {
                            mesh.material.color = color;
                        } else if (mesh.material instanceof THREE.LineBasicMaterial) {
                            mesh.material.color = color;
                        }
                    }
                }
            }
        });
    }

    /**
     * Clean up and destroy the scene
     */
    destroy() {
        if (this.animationId && ANIMATIONS[this.animationId]) {
            ANIMATIONS[this.animationId].stopAnimation = true;
        }

        // Stop blinking if active
        this.stopBlinking();
        
        // Remove event listeners
        if (this.renderer && this.renderer.domElement) {
            if (this._mouseMoveHandler) {
                this.renderer.domElement.removeEventListener('mousemove', this._mouseMoveHandler);
            }
            if (this._mouseClickHandler) {
                this.renderer.domElement.removeEventListener('click', this._mouseClickHandler);
            }
        }

        if (this.meshes) {
            this.meshes.forEach(mesh => {
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) mesh.material.dispose();
                this.scene.remove(mesh);
            });
        }

        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Clear references
        this.hoveredObject = null;
        this.selectedObject = null;
        this.onPickCallback = null;
        this.originalMaterials = {};
        this.currentIntervalId = null;
        this.selectMaterial = null;
    }
}

/**
 * Initialize 3D visualization for a section
 */
async function init3DVisualization(containerId, data = null, dataKey = 'value') {
    const scene3D = new Scene3D(containerId);
    
    // Initialize scene
    const initialized = await scene3D.init();
    if (!initialized) {
        return null;
    }

    // Load structure
    const loaded = await scene3D.loadStructure();
    if (!loaded) {
        console.error('Failed to load structure data');
        return null;
    }

        // Create structure
        scene3D.createStructure();

        // Update colors if data is provided
        if (data) {
            scene3D.updateColors(data, dataKey);
        }

        // Configure scene with proper zoom and camera position
        scene3D.configScene();

        return scene3D;
}

/**
 * Initialize 3D visualization with custom node positions (for modal analysis)
 */
async function init3DVisualizationWithNodes(containerId, nodes, data = null, dataKey = 'value') {
    const scene3D = new Scene3D(containerId);
    
    // Initialize scene
    const initialized = await scene3D.init();
    if (!initialized) {
        console.error('Failed to initialize 3D scene');
        return null;
    }

    if (!nodes || nodes.length === 0) {
        console.error('No nodes provided for 3D visualization');
        return null;
    }

    // Set custom nodes as array (matching loadStructure format)
    // Also create dictionary format for compatibility
    scene3D.nodes = nodes;
    scene3D.nodesArray = nodes;

    console.log(`Loading structure with ${nodes.length} nodes`);

    // Load structure data (connections, profiles, etc.) - but not nodes
    const connectionsResult = await scene3D.loadConnectionsFromFile();
    const profilesResult = await scene3D.loadProfilesFromFile();
    const profileIdByElementResult = await scene3D.loadProfileIdByElementFromFile();

    if (!connectionsResult.success) {
        console.error('Failed to load connections:', connectionsResult.error);
        return null;
    }
    scene3D.connections = connectionsResult.data;
    console.log(`Loaded ${scene3D.connections.length} connections`);

    if (profilesResult.success) {
        scene3D.profiles = profilesResult.data;
        console.log('Profiles loaded successfully');
    } else {
        console.log('Profiles not available, will use simple wireframe');
        scene3D.profiles = null;
    }

    if (profileIdByElementResult.success) {
        scene3D.profileIdByElement = profileIdByElementResult.data;
        console.log('ProfileIdByElement loaded successfully');
    } else {
        console.log('ProfileIdByElement not available, will use simple wireframe');
        scene3D.profileIdByElement = null;
    }

    // Create structure with custom nodes
    try {
        scene3D.createStructure();
        console.log('Structure created successfully');
    } catch (error) {
        console.error('Error creating structure:', error);
        return null;
    }

    // Update colors if data is provided
    if (data && data.length > 0) {
        try {
            scene3D.updateColors(data, dataKey);
            console.log('Colors updated successfully');
        } catch (error) {
            console.error('Error updating colors:', error);
        }
    }

    // Configure scene with proper zoom and camera position
    try {
        scene3D.configScene();
        console.log('Scene configured successfully');
    } catch (error) {
        console.error('Error configuring scene:', error);
    }

    return scene3D;
}

// Export for use in other modules
window.Scene3D = Scene3D;
window.init3DVisualization = init3DVisualization;
window.init3DVisualizationWithNodes = init3DVisualizationWithNodes;
