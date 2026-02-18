/**
 * Modal Analysis Module
 * Handles modal analysis data display
 */

let currentModal3D = null;

/**
 * Initialize modal analysis section
 */
function initModal() {
    const modalModeSelect = document.getElementById('modal-mode');
    if (!modalModeSelect) {
        console.error('Modal mode select element not found');
        return;
    }
    
    modalModeSelect.addEventListener('change', () => {
        loadModalData(modalModeSelect.value);
    });
    
    // Load initial data
    loadModalData(modalModeSelect.value);
}

/**
 * Load modal displacement data from static file
 */
async function loadModalDataFromFile(mode) {
    try {
        // Determine base URL
        let baseUrl = '';
        if (window.API_BASE_URL) {
            const url = new URL(window.API_BASE_URL);
            baseUrl = `${url.protocol}//${url.host}`;
        } else {
            baseUrl = window.location.origin;
        }
        
        // Map mode to filename (Mode1.txt, Mode2.txt)
        // Mode values are "Mode1" or "Mode2" from the select element
        const modeFilename = mode + '.txt';
        
        console.log(`Loading modal data for mode: ${mode}, filename: ${modeFilename}`);
        
        // Try multiple possible paths (prioritize LOCAL paths first since Mode1/Mode2 are only local)
        const possiblePaths = [
            `./shm/static/${modeFilename}`,  // Local shm/static folder (relative)
            `/shm/static/${modeFilename}`,    // Local shm/static folder (absolute)
            `shm/static/${modeFilename}`,     // Local shm/static folder (no leading slash)
            `./static/${modeFilename}`,  // Local static folder
            `/static/${modeFilename}`,    // Local static folder (absolute)
            `./static/${mode}.txt`,  // Fallback: try with original mode value
            `/static/${mode}.txt`,
            `${baseUrl}/shm/static/${modeFilename}`,  // Remote shm/static path (fallback)
            `${baseUrl}/static/${modeFilename}`,  // Remote static folder (fallback)
            `${baseUrl}/static/${mode}.txt`
        ];
        
        let lastError = null;
        
        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    const text = await response.text();
                    const lines = text.trim().split('\n');
                    const modalData = [];
                    
                    lines.forEach(line => {
                        if (line.trim()) {
                            // Handle both space and tab delimiters
                            const parts = line.trim().split(/\s+/);
                            if (parts.length >= 3) {
                                modalData.push({
                                    x: parseFloat(parts[0]),
                                    y: parseFloat(parts[1]),
                                    z: parseFloat(parts[2])
                                });
                            }
                        }
                    });
                    
                    console.log(`Successfully loaded modal data from: ${path}`);
                    return { success: true, data: modalData };
                }
            } catch (error) {
                lastError = error;
                continue;
            }
        }
        
        throw lastError || new Error('Failed to load modal data from any path');
    } catch (error) {
        console.error('Error loading modal data from file:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Load nodes data from static file
 */
async function loadNodesFromFile() {
    try {
        let baseUrl = '';
        if (window.API_BASE_URL) {
            const url = new URL(window.API_BASE_URL);
            baseUrl = `${url.protocol}//${url.host}`;
        } else {
            baseUrl = window.location.origin;
        }
        
        const possiblePaths = [
            './static/Nodes.txt',
            '/static/Nodes.txt',
            `${baseUrl}/static/Nodes.txt`,
            `${baseUrl}/assets/data/Nodes.txt`,
            `${baseUrl}/data/Nodes.txt`
        ];
        
        let lastError = null;
        
        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    const text = await response.text();
                    const lines = text.trim().split('\n');
                    const nodes = [];
                    
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
 * Load modal analysis data
 */
async function loadModalData(mode) {
    console.log(`Loading modal data for mode: ${mode}`);
    const container = document.getElementById('modal-table-container');
    const infoContainer = document.getElementById('modal-info');
    
    // Clear containers (no loading message)
    if (container) container.innerHTML = '';
    if (infoContainer) infoContainer.innerHTML = '';

    // Load from static file instead of API
    const result = await loadModalDataFromFile(mode);
    
    if (!result.success) {
        console.error('Failed to load modal data:', result.error);
        const errorContainer = document.getElementById('modal-info-container') || container;
        if (errorContainer) {
            errorContainer.innerHTML = `<div class="error">Error loading modal data: ${result.error}</div>`;
        }
        return;
    }

    console.log(`Successfully loaded ${result.data.length} modal data points`);

    // Hide table by default (matching shm_webpage behavior)
    // displayModalTable(result.data, mode);
    displayModalInfo(result.data, mode);
    displayModalPSD(mode);
    displayModal3D(result.data, mode);
}

/**
 * Display modal data in a table
 */
function displayModalTable(data, mode) {
    const container = document.getElementById('modal-table-container');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="error">No modal data available</div>';
        return;
    }

    let html = `<h3>${mode} - Node Displacements</h3>`;
    html += '<table><thead><tr>';
    html += '<th>Node ID</th>';
    html += '<th>X (mm)</th>';
    html += '<th>Y (mm)</th>';
    html += '<th>Z (mm)</th>';
    html += '<th>Magnitude (mm)</th>';
    html += '</tr></thead><tbody>';

    data.forEach((item, index) => {
        const x = item.x || 0;
        const y = item.y || 0;
        const z = item.z || 0;
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        
        html += '<tr>';
        html += `<td>${index + 1}</td>`;
        html += `<td>${x.toFixed(3)}</td>`;
        html += `<td>${y.toFixed(3)}</td>`;
        html += `<td>${z.toFixed(3)}</td>`;
        html += `<td>${magnitude.toFixed(3)}</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Display modal analysis information
 */
function displayModalInfo(data, mode) {
    const container = document.getElementById('modal-info');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="error">No modal information available</div>';
        return;
    }

    // Calculate statistics
    const displacements = data.map(item => {
        const x = item.x || 0;
        const y = item.y || 0;
        const z = item.z || 0;
        return Math.sqrt(x * x + y * y + z * z);
    });

    const maxDisplacement = Math.max(...displacements);
    const avgDisplacement = displacements.reduce((a, b) => a + b, 0) / displacements.length;
    const maxIndex = displacements.indexOf(maxDisplacement);
    const maxNode = data[maxIndex];

    let html = '<div class="info-item">';
    html += `<strong>Mode:</strong> ${mode}`;
    html += '</div>';
    
    html += '<div class="info-item">';
    html += `<strong>Total Nodes:</strong> ${data.length}`;
    html += '</div>';
    
    html += '<div class="info-item">';
    html += `<strong>Maximum Displacement:</strong> ${maxDisplacement.toFixed(3)} mm`;
    html += '</div>';
    
    html += '<div class="info-item">';
    html += `<strong>Average Displacement:</strong> ${avgDisplacement.toFixed(3)} mm`;
    html += '</div>';
    
    html += '<div class="info-item">';
    html += `<strong>Node with Max Displacement:</strong> Node ${maxIndex + 1}`;
    html += `<br>X: ${maxNode.x.toFixed(3)} mm, Y: ${maxNode.y.toFixed(3)} mm, Z: ${maxNode.z.toFixed(3)} mm`;
    html += '</div>';

    container.innerHTML = html;
}

/**
 * Display Power Spectral Density chart (matching shm_webpage)
 */
async function displayModalPSD(mode) {
    const canvas = document.getElementById('modal-chart');
    if (!canvas) return;
    
    // Get PSD data
    const result = await getPSDData();
    if (!result.success || !result.data) {
        console.error('Failed to load PSD data:', result.error);
        return;
    }
    
    const psdData = result.data;
    const ctx = canvas.getContext('2d');
    
    // Determine which frequency to use based on mode
    const modeIndex = mode === 'Mode1' ? 0 : 1;
    const frequency = psdData.fre && psdData.fre[modeIndex] ? psdData.fre[modeIndex] : 0;
    const damping = psdData.dampopt && psdData.dampopt[modeIndex] ? psdData.dampopt[modeIndex] : 0;
    
    // Get the data matrix (df)
    const df = psdData.df || psdData;
    if (!df || !Array.isArray(df) || df.length === 0) {
        console.error('Invalid PSD data format');
        return;
    }
    
    // Set canvas size - use container dimensions for responsive sizing
    const container = canvas.parentElement;
    const containerWidth = container ? container.clientWidth : 800;
    const containerHeight = container ? container.clientHeight - 60 : 400; // Subtract space for title
    
    canvas.width = containerWidth;
    canvas.height = Math.max(containerHeight, 300); // Minimum 300px height
    
    const padding = 60;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Extract frequency (first column) and PSD values (other columns)
    const frequencies = df.map(row => row[0]);
    const minFreq = Math.min(...frequencies);
    const maxFreq = Math.max(...frequencies);
    const freqRange = maxFreq - minFreq || 1;
    
    // Find min and max PSD values across all columns
    let minPSD = Infinity;
    let maxPSD = -Infinity;
    
    for (let col = 1; col < df[0].length; col++) {
        df.forEach(row => {
            const psdValue = 10 * Math.log10(Math.max(row[col], 1e-10)); // Convert to dB
            minPSD = Math.min(minPSD, psdValue);
            maxPSD = Math.max(maxPSD, psdValue);
        });
    }
    
    const psdRange = maxPSD - minPSD || 1;
    
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height + padding);
    ctx.lineTo(width + padding, height + padding);
    ctx.stroke();
    
    // Draw grid lines
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width + padding, y);
        ctx.stroke();
    }
    
    // Draw vertical line at frequency
    if (frequency > 0) {
        const freqX = padding + ((frequency - minFreq) / freqRange) * width;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(freqX, padding);
        ctx.lineTo(freqX, height + padding);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Draw PSD traces for each column (sensor)
    const colors = ['#0066cc', '#00cc66', '#cc6600', '#cc0066', '#6600cc', '#00cccc'];
    for (let col = 1; col < Math.min(df[0].length, 7); col++) {
        ctx.strokeStyle = colors[(col - 1) % colors.length];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        let firstPoint = true;
        df.forEach((row, index) => {
            const freq = row[0];
            const psdValue = 10 * Math.log10(Math.max(row[col], 1e-10)); // Convert to dB
            const x = padding + ((freq - minFreq) / freqRange) * width;
            const y = padding + height - ((psdValue - minPSD) / psdRange) * height;
            
            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }
    
    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Frequency [Hz]', width / 2 + padding, height + padding + 30);
    
    ctx.save();
    ctx.translate(15, height / 2 + padding);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('PSD [dB]', 0, 0);
    ctx.restore();
    
    // Title
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    const title = `Frequency ${frequency.toFixed(2)} Hz Damping ${(damping * 100).toFixed(2)} %`;
    ctx.fillText(title, width / 2 + padding, 20);
}

/**
 * Display modal analysis data in 3D
 * Modal data contains the displaced node positions (not displacements to add)
 */
async function displayModal3D(data, mode) {
    console.log(`Displaying modal 3D for mode: ${mode} with ${data.length} data points`);
    
    // Clean up previous 3D scene
    if (currentModal3D) {
        console.log('Destroying previous 3D scene');
        currentModal3D.destroy();
        currentModal3D = null;
    }

    if (!data || data.length === 0) {
        console.error('No modal data provided');
        return;
    }

    // Modal data IS the node positions (already displaced), use directly
    // Convert data array to nodes array format
    const modalNodes = data.map(item => ({
        x: item.x || 0,
        y: item.y || 0,
        z: item.z || 0
    }));

    console.log(`Converted to ${modalNodes.length} nodes, first node:`, modalNodes[0]);

    // Load original nodes to calculate displacement magnitudes for coloring
    const originalNodesResult = await loadNodesFromFile();
    let magnitudeData = null;
    
    if (originalNodesResult.success && originalNodesResult.data) {
        const originalNodes = originalNodesResult.data;
        console.log(`Loaded ${originalNodes.length} original nodes`);
        
        // Calculate displacement magnitudes for coloring
        magnitudeData = modalNodes.map((node, index) => {
            const originalNode = originalNodes[index] || { x: 0, y: 0, z: 0 };
            const dx = node.x - originalNode.x;
            const dy = node.y - originalNode.y;
            const dz = node.z - originalNode.z;
            const magnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);
            return { 
                value: magnitude,
                x: node.x,
                y: node.y,
                z: node.z
            };
        });
        console.log(`Calculated displacement magnitudes, max: ${Math.max(...magnitudeData.map(d => d.value))}`);
    } else {
        console.log('Could not load original nodes for displacement calculation');
    }

    // Initialize 3D visualization with modal nodes (displaced positions)
    try {
        const container = document.getElementById('modal-3d-container');
        if (!container) {
            console.error('Modal 3D container not found');
            return;
        }
        
        // Ensure container is visible and properly sized (matching other sections)
        container.style.display = 'block';
        container.style.width = '100%';
        
        // Wait a bit for layout to settle (matching stress.js pattern)
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Check if container has dimensions
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
            console.warn('Modal 3D container has no dimensions, waiting longer for layout...');
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('Initializing 3D visualization with modal nodes');
        console.log(`Container dimensions: ${container.offsetWidth}x${container.offsetHeight}`);
        console.log(`Modal nodes count: ${modalNodes.length}`);
        
        // Create scene with modal nodes (these are the displaced positions)
        currentModal3D = await init3DVisualizationWithNodes(
            'modal-3d-container', 
            modalNodes,
            magnitudeData,
            'value'
        );
        
        if (currentModal3D) {
            console.log('3D visualization initialized successfully');
            // Force a render to ensure the scene is visible
            if (currentModal3D.renderer && currentModal3D.camera && currentModal3D.scene) {
                currentModal3D.renderer.render(currentModal3D.scene, currentModal3D.camera);
            }
        } else {
            console.error('3D visualization returned null - check console for errors above');
            console.error('This usually means connections failed to load. Check network tab for Connc.txt requests.');
            container.innerHTML = '<div class="error">Failed to initialize 3D visualization. Check console for details.</div>';
        }
    } catch (error) {
        console.error('Error initializing 3D visualization:', error);
        console.error(error.stack);
        const container = document.getElementById('modal-3d-container');
        if (container) {
            container.innerHTML = `<div class="error">Error initializing 3D visualization: ${error.message}</div>`;
        }
    }
}

// Export for use in main.js
window.initModal = initModal;
