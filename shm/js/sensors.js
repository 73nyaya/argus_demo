/**
 * Sensors Status Module
 * Handles sensor status display
 */

let currentSensorId = null;

// 3D visualization variables
let sensors3DScene = null;
let sensorMeshes = {}; // Map of sensor ID to 3D mesh
let sensorsData = null; // Store sensors data with positions
let selectedSensorMesh = null; // Currently selected sensor in 3D

/**
 * Initialize sensors section
 */
async function initSensors() {
    const container = document.getElementById('sensors-table-container');
    container.innerHTML = '<div class="loading">Loading sensors...</div>';

    // Load sensors from static JSON file instead of API
    const result = await loadSensorsFromStatic();
    
    if (!result.success) {
        container.innerHTML = `<div class="error">Error loading sensors: ${result.error}</div>`;
        return;
    }

    sensorsData = result.data;
    
    displaySensorsTable(result.data);
    setupSensorSelection();
    
    // Initialize 3D visualization
    await initSensors3D();
}

/**
 * Display sensors in a table
 */
function displaySensorsTable(sensors) {
    const container = document.getElementById('sensors-table-container');
    
    if (!sensors || sensors.length === 0) {
        container.innerHTML = '<div class="error">No sensor data available</div>';
        return;
    }

    let html = '<table><thead><tr>';
    html += '<th>Sensor ID</th>';
    html += '<th>Status</th>';
    html += '<th>Noise Level</th>';
    html += '<th>Comments</th>';
    html += '</tr></thead><tbody>';

    sensors.forEach(sensor => {
        const statusClass = sensor['Sensor status'] === 'Yes' ? 'status-yes' : 'status-no';
        const noiseClass = `noise-${sensor['Noise Level']?.toLowerCase() || 'unknown'}`;
        
        html += `<tr class="${statusClass} ${noiseClass}" data-sensor-id="${sensor['Sensor id']}">`;
        html += `<td>${sensor['Sensor id'] || 'N/A'}</td>`;
        html += `<td>${sensor['Sensor status'] || 'N/A'}</td>`;
        html += `<td>${sensor['Noise Level'] || 'N/A'}</td>`;
        html += `<td>${sensor['Sensor Comments'] || 'N/A'}</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Setup sensor selection for chart display
 */
function setupSensorSelection() {
    const rows = document.querySelectorAll('#sensors-table-container tbody tr');
    rows.forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', async () => {
            const sensorId = row.getAttribute('data-sensor-id');
            if (sensorId) {
                selectSensor(sensorId);
            }
        });
    });
}

/**
 * Select a sensor (called from both table and 3D view)
 */
function selectSensor(sensorId) {
    currentSensorId = sensorId;
    
    // Highlight selected row in table
    const rows = document.querySelectorAll('#sensors-table-container tbody tr');
    rows.forEach(r => {
        r.classList.remove('selected');
        if (r.getAttribute('data-sensor-id') === sensorId) {
            r.classList.add('selected');
        }
    });
    
    // Highlight selected sensor in 3D
    highlightSensor3D(sensorId);
}


/**
 * Load sensors from static JSON file (instead of API)
 */
async function loadSensorsFromStatic() {
    try {
        // Try multiple possible paths
        const possiblePaths = [
            './static/sensors_p.json',
            '/static/sensors_p.json',
            'static/sensors_p.json'
        ];
        
        let sensorsData = null;
        let lastError = null;
        
        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    sensorsData = await response.json();
                    console.log(`Successfully loaded sensors from: ${path}`);
                    console.log(`Found ${sensorsData.length} sensors in JSON file`);
                    break;
                }
            } catch (error) {
                lastError = error;
                continue;
            }
        }
        
        if (!sensorsData) {
            return { success: false, error: `Could not load sensors from JSON file: ${lastError?.message || 'Unknown error'}` };
        }
        
        // Process sensors: add default status and determine sensor type
        const processedSensors = sensorsData.map(sensor => {
            const sensorId = sensor['Sensor id'];
            const isAccelerometer = sensorId.startsWith('AC-');
            const isStrainGauge = sensorId.startsWith('SG-');
            
            return {
                'Sensor id': sensorId,
                position: sensor.position,
                'Sensor status': 'Yes', // All sensors are functioning by default
                'Noise Level': 'Low', // Default noise level
                'Sensor Comments': isAccelerometer ? 'Accelerometer' : (isStrainGauge ? 'Strain Gauge' : 'Unknown'),
                sensorType: isAccelerometer ? 'accelerometer' : (isStrainGauge ? 'strain_gauge' : 'unknown')
            };
        });
        
        console.log(`Processed ${processedSensors.length} sensors from static file`);
        return { success: true, data: processedSensors };
    } catch (error) {
        console.error('Error loading sensors from static file:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Initialize 3D visualization for sensors
 */
async function initSensors3D() {
    const container = document.getElementById('sensors-3d-container');
    if (!container) {
        console.error('3D container not found');
        return;
    }
    
    // Initialize 3D scene with structure
    sensors3DScene = new Scene3D('sensors-3d-container');
    const initialized = await sensors3DScene.init();
    if (!initialized) {
        console.error('Failed to initialize 3D scene');
        return;
    }
    
    // Load structure
    const loaded = await sensors3DScene.loadStructure();
    if (!loaded) {
        console.error('Failed to load structure data');
        return;
    }
    
    // Create structure
    sensors3DScene.createStructure();
    
    // Add sensors to the scene
    addSensorsToScene();
    
    // Setup click callback for sensors
    sensors3DScene.setOnPickCallback((pickData) => {
        if (pickData && pickData.userData && pickData.userData.sensorId) {
            const sensorId = pickData.userData.sensorId;
            selectSensor(sensorId);
        }
    });
    
    // Configure camera
    sensors3DScene.configScene();
}

/**
 * Add sensor markers to the 3D scene
 */
function addSensorsToScene() {
    if (!sensorsData || !sensors3DScene) {
        console.warn('Sensors data or 3D scene not available');
        return;
    }
    
    // Clear existing sensor meshes
    Object.values(sensorMeshes).forEach(mesh => {
        sensors3DScene.scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
    });
    sensorMeshes = {};
    
    console.log(`Adding ${sensorsData.length} sensors to 3D scene`);
    
    // Track positions to offset overlapping sensors
    const positionMap = new Map();
    
    // Create sensor markers - now using sensorsData which has all sensors from JSON
    sensorsData.forEach((sensor, index) => {
        if (!sensor.position) {
            console.warn(`No position data for sensor ${sensor['Sensor id']}`);
            return;
        }
        
        const pos = sensor.position;
        const sensorId = sensor['Sensor id'];
        const posKey = `${pos.x},${pos.y},${pos.z}`;
        
        // Count how many sensors are at this position
        const countAtPosition = positionMap.get(posKey) || 0;
        positionMap.set(posKey, countAtPosition + 1);
        
        // Determine sensor type and color
        const isAccelerometer = sensorId.startsWith('AC-');
        const isStrainGauge = sensorId.startsWith('SG-');
        
        // Green for accelerometers, blue for strain gauges
        let sensorColor = 0x888888; // Default gray
        if (isAccelerometer) {
            sensorColor = 0x00EA64; // Green
        } else if (isStrainGauge) {
            sensorColor = 0x1e90ff; // Blue
        }
        
        // Create a sphere to represent the sensor
        const geometry = new THREE.SphereGeometry(200, 16, 16); // Radius of 200 units
        const material = new THREE.MeshLambertMaterial({ 
            color: sensorColor,
            emissive: 0x000000,
            emissiveIntensity: 0
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        
        // Offset sensors at the same position so they're all visible
        // Use index to create a small offset pattern
        const offsetX = (countAtPosition % 2) * 300 - 150; // -150 or +150
        const offsetY = Math.floor(countAtPosition / 2) * 300 - 150; // -150 or 0 or +150
        const offsetZ = 0;
        
        sphere.position.set(pos.x + offsetX, pos.y + offsetY, pos.z + offsetZ);
        
        // Store sensor ID in userData for click detection
        sphere.userData = { sensorId: sensorId };
        
        // Add to scene
        sensors3DScene.scene.add(sphere);
        sensorMeshes[sensorId] = sphere;
        
        // Add to meshes array for raycaster
        sensors3DScene.meshes.push(sphere);
        
        console.log(`Added sensor ${sensorId} at position (${pos.x + offsetX}, ${pos.y + offsetY}, ${pos.z + offsetZ}) [original: ${pos.x}, ${pos.y}, ${pos.z}]`);
    });
    
    console.log(`Total sensors rendered: ${Object.keys(sensorMeshes).length}`);
}

/**
 * Highlight a sensor in 3D view
 */
function highlightSensor3D(sensorId) {
    if (!sensors3DScene) return;
    
    // Reset previous selection
    if (selectedSensorMesh) {
        const prevMaterial = sensors3DScene.originalMaterials[selectedSensorMesh.uuid];
        if (prevMaterial) {
            selectedSensorMesh.material.color.copy(prevMaterial.color);
            selectedSensorMesh.material.emissive.copy(prevMaterial.emissive);
            selectedSensorMesh.material.emissiveIntensity = prevMaterial.emissiveIntensity;
        }
    }
    
    // Highlight new selection
    const sensorMesh = sensorMeshes[sensorId];
    if (sensorMesh) {
        // Store original material
        if (!sensors3DScene.originalMaterials[sensorMesh.uuid]) {
            sensors3DScene.originalMaterials[sensorMesh.uuid] = sensorMesh.material.clone();
        }
        
        // Apply highlight (bright yellow/white)
        sensorMesh.material.emissive = new THREE.Color(0xffff00);
        sensorMesh.material.emissiveIntensity = 0.8;
        sensorMesh.material.color = new THREE.Color(0xffff00);
        
        selectedSensorMesh = sensorMesh;
    } else {
        selectedSensorMesh = null;
    }
}

/**
 * Cleanup when leaving sensors section
 */
function cleanupSensors() {
    stopRealTimeUpdate();
    if (currentSensorChart) {
        currentSensorChart.destroy();
        currentSensorChart = null;
    }
    currentSensorId = null;
    dataPoints = [];
    timeLabels = [];
    
    // Cleanup 3D scene
    if (sensors3DScene) {
        sensors3DScene.destroy();
        sensors3DScene = null;
    }
    sensorMeshes = {};
    selectedSensorMesh = null;
    sensorsData = null;
}

// Export for use in main.js
window.initSensors = initSensors;
window.cleanupSensors = cleanupSensors;
