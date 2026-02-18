/**
 * API Utility Functions
 * Handles all API calls to the backend
 */

// Configurable API base URL
// Can be set via:
// 1. window.API_BASE_URL global variable (set before this script loads)
// 2. data-api-base attribute on the <html> or <body> tag
// 3. Default: '/api' (relative path for same-origin)
const API_BASE = (function() {
    // Check for global variable first
    if (typeof window !== 'undefined' && window.API_BASE_URL) {
        console.log('API Base URL set from window.API_BASE_URL:', window.API_BASE_URL);
        return window.API_BASE_URL;
    }
    
    // Check for data attribute on html or body tag
    if (typeof document !== 'undefined') {
        const html = document.documentElement;
        const body = document.body;
        const apiBase = html?.getAttribute('data-api-base') || body?.getAttribute('data-api-base');
        if (apiBase) {
            console.log('API Base URL set from data-api-base attribute:', apiBase);
            return apiBase;
        }
    }
    
    // Default to relative path
    console.log('API Base URL using default:', '/api');
    return '/api';
})();

console.log('Using API Base URL:', API_BASE);

/**
 * Generic fetch function with error handling
 */
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Get sensors status
 */
async function getSensors() {
    return await fetchAPI('/sensors');
}

/**
 * Get sensor data by ID
 */
async function getSensorData(sensorId) {
    return await fetchAPI(`/sensor/${sensorId}`);
}

/**
 * Get stress data by type
 */
async function getStressData(stressType) {
    return await fetchAPI(`/stress/${stressType}`);
}

/**
 * Get code compliance data
 */
async function getCodeData(codeType) {
    return await fetchAPI(`/code/${codeType}`);
}

/**
 * Get modal analysis data
 */
async function getModalData(mode) {
    return await fetchAPI(`/modal/${mode}`);
}

/**
 * Get crack detection data
 */
async function getCrackData() {
    return await fetchAPI('/crack');
}

/**
 * Get risk matrix data
 */
async function getRiskMatrix() {
    return await fetchAPI('/riskmatrix');
}

/**
 * Get Power Spectral Density data (from static file)
 */
async function getPSDData() {
    try {
        // Determine base URL from API_BASE_URL
        let baseUrl = '';
        if (window.API_BASE_URL) {
            const url = new URL(window.API_BASE_URL);
            baseUrl = `${url.protocol}//${url.host}`;
        } else {
            baseUrl = window.location.origin;
        }
        
        // Try multiple possible paths
        const possiblePaths = [
            './static/psd_data.json',
            '/static/psd_data.json',
            `${baseUrl}/static/psd_data.json`
        ];
        
        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    const data = await response.json();
                    return { success: true, data };
                }
            } catch (error) {
                continue;
            }
        }
        
        throw new Error('Failed to load PSD data from any path');
    } catch (error) {
        console.error('Error fetching PSD data:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get nodes data
 */
async function getNodes() {
    return await fetchAPI('/nodes');
}

/**
 * Get connections data
 */
async function getConnections() {
    return await fetchAPI('/connections');
}