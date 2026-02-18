/**
 * Stress Analysis Module
 * Handles stress data display and visualization
 */

let currentStressChart = null;
let currentStress3D = null;
let currentStressColorBar = null;

/**
 * Initialize stress section
 */
function initStress() {
    const stressTypeSelect = document.getElementById('stress-type');
    stressTypeSelect.addEventListener('change', () => {
        loadStressData(stressTypeSelect.value);
    });
    
    // Load initial data
    loadStressData(stressTypeSelect.value);
}

/**
 * Load stress data
 */
async function loadStressData(stressType) {
    const container = document.getElementById('stress-table-container');
    container.innerHTML = '';

    const result = await getStressData(stressType);
    
    if (!result.success) {
        container.innerHTML = `<div class="error">Error loading stress data: ${result.error}</div>`;
        return;
    }

    // Hide table by default (matching shm_webpage behavior)
    // displayStressTable(result.data, stressType);
    // Removed chart - only showing 3D visualization
    displayStressColorBar(result.data, stressType);
    displayStress3D(result.data, stressType);
    displayStressFindings(result.data, stressType);
}

/**
 * Display stress data in a table
 */
function displayStressTable(data, stressType) {
    const container = document.getElementById('stress-table-container');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="error">No stress data available</div>';
        return;
    }

    // Get the key name from the first item
    const dataKey = Object.keys(data[0])[0] || stressType;
    
    let html = `<h3>${stressType} Data</h3>`;
    html += '<table><thead><tr>';
    html += '<th>Element ID</th>';
    html += `<th>${dataKey} (MPa)</th>`;
    html += '</tr></thead><tbody>';

    data.forEach((item, index) => {
        const value = item[dataKey] || item.value || 0;
        const stressClass = getStressClass(value);
        
        html += `<tr class="${stressClass}">`;
        html += `<td>${index + 1}</td>`;
        html += `<td>${value.toFixed(2)}</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Get CSS class based on stress value
 */
function getStressClass(value) {
    if (value < 50) return 'stress-low';
    if (value < 100) return 'stress-medium';
    if (value < 200) return 'stress-high';
    return 'stress-critical';
}

/**
 * Display stress findings note
 */
function displayStressFindings(data, stressType) {
    const container = document.getElementById('stress-findings');
    if (!container) return;
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="error">No stress data available</div>';
        return;
    }

    const dataKey = Object.keys(data[0])[0] || stressType;
    const values = data.map(item => item[dataKey] || item.value || 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Compact summary format with title
    let html = '<div class="findings-note">';
    html += '<h3>Findings</h3>';
    html += `<p><strong>${stressType}:</strong> Max ${maxValue.toFixed(2)} MPa | Avg ${avgValue.toFixed(2)} MPa | Min ${minValue.toFixed(2)} MPa</p>`;
    html += '</div>';
    
    container.innerHTML = html;
}

/**
 * Display stress data as a chart (removed - no longer used)
 */
function displayStressChart(data, stressType) {
    const canvas = document.getElementById('stress-chart');
    const ctx = canvas.getContext('2d');
    
    // Clear previous chart
    if (currentStressChart) {
        currentStressChart.destroy();
    }

    if (!data || data.length === 0) {
        return;
    }

    // Extract values
    const dataKey = Object.keys(data[0])[0] || stressType;
    const values = data.map(item => item[dataKey] || item.value || 0);

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 400;

    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;

    // Find min/max for scaling
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    // Draw bars
    const barWidth = width / values.length;
    values.forEach((value, index) => {
        const barHeight = ((value - minValue) / range) * height;
        const x = padding + index * barWidth;
        const y = padding + height - barHeight;
        
        // Color based on stress level
        ctx.fillStyle = getStressColor(value);
        ctx.fillRect(x, y, barWidth - 2, barHeight);
    });

    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Element ID', width / 2 + padding, height + padding + 30);
    
    ctx.save();
    ctx.translate(15, height / 2 + padding);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Stress (MPa)', 0, 0);
    ctx.restore();

    // Title
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${stressType} Distribution`, width / 2 + padding, 20);
}

/**
 * Get color based on stress value
 */
function getStressColor(value) {
    if (value < 50) return '#6dab6a'; // green
    if (value < 100) return '#fece00'; // yellow
    if (value < 200) return '#fc831f'; // orange
    return '#dc232b'; // red
}

/**
 * Display stress data in 3D
 */
async function displayStress3D(data, stressType) {
    // Clean up previous 3D scene
    if (currentStress3D) {
        currentStress3D.destroy();
        currentStress3D = null;
    }

    if (!data || data.length === 0) {
        return;
    }

    // Get the data key
    const dataKey = Object.keys(data[0])[0] || stressType;

    // Initialize 3D visualization with 90% width (matching shm_webpage when data is present)
    try {
        const container = document.getElementById('stress-3d-container');
        if (container) {
            container.style.width = '90%';
            // Force a small delay to ensure width is applied before scene initialization
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        currentStress3D = await init3DVisualization('stress-3d-container', data, dataKey);
        
        // Setup interactivity callback
        if (currentStress3D && currentStressColorBar) {
            currentStress3D.setOnPickCallback((eventObject) => {
                if (eventObject.object && eventObject.userData && currentStress3D.data) {
                    // Get the value from stored data in scene
                    const elementId = eventObject.userData.Id;
                    const value = currentStress3D.data[elementId];
                    if (value !== undefined) {
                        currentStressColorBar.changeCurrentMeasure({
                            data: { ...eventObject.userData, Value: value }
                        });
                    }
                } else {
                    currentStressColorBar.removeMeasure();
                }
            });
        }
    } catch (error) {
        console.error('Error initializing 3D visualization:', error);
    }
}

/**
 * Display stress color bar
 */
function displayStressColorBar(data, stressType) {
    // Remove previous color bar
    if (currentStressColorBar) {
        currentStressColorBar.remove();
        currentStressColorBar = null;
    }

    if (!data || data.length === 0) {
        return;
    }

    // Get the data key
    const dataKey = Object.keys(data[0])[0] || stressType;
    const values = data.map(item => item[dataKey] || item.value || 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    // Create color bar
    const container = document.getElementById('stress-3d-container');
    if (container && container.parentElement) {
        const parentContainer = container.parentElement;
        
        // Create wrapper if it doesn't exist
        let wrapper = parentContainer.querySelector('.stress-3d-wrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'stress-3d-wrapper';
            wrapper.style.display = 'flex';
            wrapper.style.width = '100%';
            wrapper.style.gap = '20px';
            
            // Move container into wrapper
            parentContainer.insertBefore(wrapper, container);
            wrapper.appendChild(container);
        }
        
        // Create color bar
        currentStressColorBar = new QuantityColorBar({
            title: `${stressType} (MPa)`,
            max: maxValue,
            min: minValue,
            numberOfSpots: 6
        });
        
        wrapper.appendChild(currentStressColorBar.dom);
    }
}

// Export for use in main.js
window.initStress = initStress;
