/**
 * Crack Detection Module
 * Handles crack detection data display
 */

/**
 * Initialize crack detection section
 */
async function initCrack() {
    await loadCrackData();
}

/**
 * Load crack detection data
 */
async function loadCrackData() {
    const container = document.getElementById('crack-table-container');
    const infoContainer = document.getElementById('crack-info');
    
    container.innerHTML = '<div class="loading">Loading crack detection data...</div>';
    infoContainer.innerHTML = '';

    const result = await getCrackData();
    
    if (!result.success) {
        container.innerHTML = `<div class="error">Error loading crack data: ${result.error}</div>`;
        return;
    }

    displayCrackTable(result.data);
    displayCrackInfo(result.data);
    displayCrack3D(result.data);
}

/**
 * Display crack detection data in a table
 */
function displayCrackTable(data) {
    const container = document.getElementById('crack-table-container');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="error">No crack detection data available</div>';
        return;
    }

    let html = '<h3>Crack Detection Results</h3>';
    html += '<table><thead><tr>';
    html += '<th>Node ID</th>';
    html += '<th>Type</th>';
    html += '<th>Likelihood</th>';
    html += '<th>Inspection Required</th>';
    html += '<th>Position</th>';
    html += '</tr></thead><tbody>';

    data.forEach((crack) => {
        const position = crack.position || {};
        const positionStr = `X: ${position.x || 0}, Y: ${position.y || 0}, Z: ${position.z || 0}`;
        const inspectionClass = crack['Inspection required'] === 'Yes' ? 'inspection-required' : 'inspection-not-required';
        
        html += `<tr class="${inspectionClass}">`;
        html += `<td>${crack._nodeId || 'N/A'}</td>`;
        html += `<td>${crack.type || 'N/A'}</td>`;
        html += `<td>${crack.likelihood || 'N/A'}</td>`;
        html += `<td>${crack['Inspection required'] || 'N/A'}</td>`;
        html += `<td>${positionStr}</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Display crack detection information
 */
function displayCrackInfo(data) {
    const container = document.getElementById('crack-info');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="error">No crack information available</div>';
        return;
    }

    // Calculate statistics
    const totalCracks = data.length;
    const inspectionRequired = data.filter(c => c['Inspection required'] === 'Yes').length;
    const likelihoodCounts = {};
    
    data.forEach(crack => {
        const likelihood = crack.likelihood || 'Unknown';
        likelihoodCounts[likelihood] = (likelihoodCounts[likelihood] || 0) + 1;
    });

    let html = '<div class="info-item">';
    html += `<strong>Total Potential Cracks:</strong> ${totalCracks}`;
    html += '</div>';
    
    html += '<div class="info-item">';
    html += `<strong>Inspections Required:</strong> ${inspectionRequired}`;
    html += '</div>';
    
    html += '<div class="info-item">';
    html += '<strong>Likelihood Distribution:</strong><ul>';
    Object.keys(likelihoodCounts).forEach(likelihood => {
        html += `<li>${likelihood}: ${likelihoodCounts[likelihood]}</li>`;
    });
    html += '</ul></div>';

    // List cracks requiring inspection
    const criticalCracks = data.filter(c => c['Inspection required'] === 'Yes');
    if (criticalCracks.length > 0) {
        html += '<div class="info-item">';
        html += '<strong>Critical Cracks Requiring Inspection:</strong><ul>';
        criticalCracks.forEach(crack => {
            html += `<li>Node ${crack._nodeId}: ${crack.type} - ${crack.likelihood}</li>`;
        });
        html += '</ul></div>';
    }

    container.innerHTML = html;
}

/**
 * Display crack detection data in 3D
 */
async function displayCrack3D(data) {
    // Clean up previous 3D scene
    if (window.currentCrack3D) {
        window.currentCrack3D.destroy();
        window.currentCrack3D = null;
    }

    if (!data || data.length === 0) {
        return;
    }

    // Initialize 3D visualization with structure
    try {
        const container = document.getElementById('crack-3d-container');
        if (container) {
            container.style.width = '100%';
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // Create 3D scene with structure (no data coloring, just structure)
        window.currentCrack3D = await init3DVisualization('crack-3d-container', null, null);
        
        // Wait a bit for structure to be created, then add cracks
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Add crack spheres to the scene
        if (window.currentCrack3D && window.currentCrack3D.scene) {
            data.forEach((crack) => {
                if (crack.position) {
                    const position = crack.position;
                    const sphereGeometry = new THREE.SphereGeometry(500, 32, 32);
                    
                    // Color based on inspection requirement: red for required, green for not required
                    const color = crack['Inspection required'] === 'Yes' ? 0xff0000 : 0x00ff00;
                    const sphereMaterial = new THREE.MeshBasicMaterial({ color: color });
                    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                    
                    sphere.position.set(
                        position.x || 0,
                        position.y || 0,
                        position.z || 0
                    );
                    
                    sphere.userData = {
                        Id: crack._nodeId || 'N/A',
                        type: crack.type || 'N/A',
                        likelihood: crack.likelihood || 'N/A',
                        inspectionRequired: crack['Inspection required'] || 'N/A'
                    };
                    
                    window.currentCrack3D.scene.add(sphere);
                    if (!window.currentCrack3D.meshes) {
                        window.currentCrack3D.meshes = [];
                    }
                    window.currentCrack3D.meshes.push(sphere);
                }
            });
        }
    } catch (error) {
        console.error('Error initializing crack 3D visualization:', error);
    }
}

// Export for use in main.js
window.initCrack = initCrack;
