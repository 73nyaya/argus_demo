/**
 * Code Compliance Module
 * Handles code compliance data display
 */

let currentCodeChart = null;
let currentCode3D = null;
let currentCodeColorBar = null;

/**
 * Initialize code compliance section
 */
function initCode() {
    const codeTypeSelect = document.getElementById('code-type');
    codeTypeSelect.addEventListener('change', () => {
        loadCodeData(codeTypeSelect.value);
    });
    
    // Load initial data
    loadCodeData(codeTypeSelect.value);
}

/**
 * Load code compliance data
 */
async function loadCodeData(codeType) {
    const container = document.getElementById('code-table-container');
    container.innerHTML = '';

    const result = await getCodeData(codeType);
    
    if (!result.success) {
        container.innerHTML = `<div class="error">Error loading code compliance data: ${result.error}</div>`;
        return;
    }

    // Hide table by default (matching shm_webpage behavior)
    // displayCodeTable(result.data, codeType);
    // Removed chart - only showing 3D visualization
    displayCodeColorBar(result.data, codeType);
    displayCode3D(result.data, codeType);
    displayCodeStructuralNote(result.data, codeType);
}

/**
 * Display code compliance data in a table
 */
function displayCodeTable(data, codeType) {
    const container = document.getElementById('code-table-container');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="error">No code compliance data available</div>';
        return;
    }

    const dataKey = Object.keys(data[0])[0] || 'value';
    const limitStateName = codeType === 'uls' ? 'Ultimate Limit State' : 'Serviceability Limit State';
    
    let html = `<h3>${limitStateName}</h3>`;
    html += '<table><thead><tr>';
    html += '<th>Element ID</th>';
    html += '<th>Design Ratio</th>';
    html += '<th>Status</th>';
    html += '</tr></thead><tbody>';

    data.forEach((item, index) => {
        const value = item[dataKey] || item.value || 0;
        const status = value < 1.0 ? 'Compliant' : 'Non-Compliant';
        const statusClass = value < 1.0 ? 'compliant' : 'non-compliant';
        
        html += `<tr class="${statusClass}">`;
        html += `<td>${index + 1}</td>`;
        html += `<td>${value.toFixed(3)}</td>`;
        html += `<td>${status}</td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Display structural perspective note for code compliance
 */
function displayCodeStructuralNote(data, codeType) {
    const container = document.getElementById('code-structural-note');
    if (!container) return;
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="error">No code compliance data available</div>';
        return;
    }

    const dataKey = Object.keys(data[0])[0] || 'value';
    const values = data.map(item => item[dataKey] || item.value || 0);
    const nonCompliant = values.filter(v => v >= 1.0).length;
    const compliant = values.filter(v => v < 1.0).length;
    const maxRatio = Math.max(...values);
    const limitStateName = codeType === 'uls' ? 'Ultimate Limit State' : 'Serviceability Limit State';
    
    const compliantPercent = ((compliant / values.length) * 100).toFixed(1);
    const nonCompliantPercent = ((nonCompliant / values.length) * 100).toFixed(1);
    
    let html = '<div class="structural-note">';
    html += '<h3>Structural Perspective</h3>';
    if (nonCompliant > 0) {
        html += `<p>Out of ${values.length} elements assessed for <strong>${limitStateName}</strong>, ${compliant} elements (${compliantPercent}%) are compliant while ${nonCompliant} elements (${nonCompliantPercent}%) exceed the design limit with a maximum design ratio of ${maxRatio.toFixed(3)}.</p>`;
        html += `<p class="warning"><strong>Note:</strong> Non-compliant elements may require structural intervention or further analysis.</p>`;
    } else {
        html += `<p>All ${values.length} elements assessed for <strong>${limitStateName}</strong> are compliant with design requirements, with a maximum design ratio of ${maxRatio.toFixed(3)}.</p>`;
        html += `<p class="success"><strong>Status:</strong> All elements are within acceptable design limits.</p>`;
    }
    html += '</div>';
    
    container.innerHTML = html;
}

/**
 * Display code compliance data as a chart (removed - no longer used)
 */
function displayCodeChart(data, codeType) {
    const canvas = document.getElementById('code-chart');
    const ctx = canvas.getContext('2d');
    
    if (currentCodeChart) {
        currentCodeChart.destroy();
    }

    if (!data || data.length === 0) {
        return;
    }

    // Extract values
    const dataKey = Object.keys(data[0])[0] || 'value';
    const values = data.map(item => item[dataKey] || item.value || 0);

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 400;

    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;

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

    // Draw compliance line at 1.0
    const maxValue = Math.max(...values, 1.0);
    const complianceY = padding + height - (1.0 / maxValue) * height;
    ctx.strokeStyle = '#dc232b';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, complianceY);
    ctx.lineTo(width + padding, complianceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label compliance line
    ctx.fillStyle = '#dc232b';
    ctx.font = '12px Arial';
    ctx.fillText('Compliance Limit (1.0)', width + padding + 10, complianceY);

    // Draw bars
    const barWidth = width / values.length;
    values.forEach((value, index) => {
        const barHeight = (value / maxValue) * height;
        const x = padding + index * barWidth;
        const y = padding + height - barHeight;
        
        // Color based on compliance
        ctx.fillStyle = value < 1.0 ? '#6dab6a' : '#dc232b';
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
    ctx.fillText('Design Ratio', 0, 0);
    ctx.restore();

    // Title
    const limitStateName = codeType === 'uls' ? 'Ultimate Limit State' : 'Serviceability Limit State';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${limitStateName} - Design Ratio`, width / 2 + padding, 20);
}

/**
 * Display code compliance data in 3D
 */
async function displayCode3D(data, codeType) {
    // Clean up previous 3D scene
    if (currentCode3D) {
        currentCode3D.destroy();
        currentCode3D = null;
    }

    if (!data || data.length === 0) {
        return;
    }

    // Get the data key
    const dataKey = Object.keys(data[0])[0] || 'value';

    // Initialize 3D visualization
    try {
        const container = document.getElementById('code-3d-container');
        if (!container) {
            console.error('Code 3D container not found');
            return;
        }
        
        // Ensure container is visible and properly sized
        container.style.display = 'block';
        
        currentCode3D = await init3DVisualization('code-3d-container', data, dataKey);
        
        // Setup interactivity callback
        if (currentCode3D && currentCodeColorBar) {
            currentCode3D.setOnPickCallback((eventObject) => {
                if (eventObject.object && eventObject.userData && currentCode3D.data) {
                    // Get the value from stored data in scene
                    const elementId = eventObject.userData.Id;
                    const value = currentCode3D.data[elementId];
                    if (value !== undefined) {
                        currentCodeColorBar.changeCurrentMeasure({
                            data: { ...eventObject.userData, Value: value }
                        });
                    }
                } else {
                    currentCodeColorBar.removeMeasure();
                }
            });
        }
    } catch (error) {
        console.error('Error initializing 3D visualization:', error);
    }
}

/**
 * Display code compliance color bar
 */
function displayCodeColorBar(data, codeType) {
    // Remove previous color bar
    if (currentCodeColorBar) {
        currentCodeColorBar.remove();
        currentCodeColorBar = null;
    }

    if (!data || data.length === 0) {
        return;
    }

    // Get the data key
    const dataKey = Object.keys(data[0])[0] || 'value';
    const values = data.map(item => item[dataKey] || item.value || 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    // Create color bar - place it in the colorbar container next to 3D container
    const colorbarContainer = document.getElementById('code-colorbar-container');
    
    if (colorbarContainer) {
        // Remove any existing color bar
        const existingColorBar = colorbarContainer.querySelector('.quantityColorBar');
        if (existingColorBar) {
            existingColorBar.remove();
        }
        
        // Clear container
        colorbarContainer.innerHTML = '';
        
        // Create color bar
        const limitStateName = codeType === 'uls' ? 'Ultimate Limit State' : 'Serviceability Limit State';
        currentCodeColorBar = new QuantityColorBar({
            title: 'Design Ratio',
            max: maxValue,
            min: minValue,
            numberOfSpots: 6
        });
        
        // Add color bar to the container (next to 3D container)
        colorbarContainer.appendChild(currentCodeColorBar.dom);
    }
}

// Export for use in main.js
window.initCode = initCode;
