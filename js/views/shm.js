/* global SITES, renderSiteTabs */

/**
 * Render SHM (Structural Health Monitoring) view for a site
 * This embeds the SHM module from shm/ directory
 */
function renderSHM(container, slug) {
  var site = SITES[slug];
  if (!site) return;

  // Render site tabs with SHM active
  var html = renderSiteTabs(slug, 'shm') +
    '<div id="shm-container" style="margin-top: 24px;">' +
    '<div class="loading" style="text-align: center; padding: 40px;">Loading SHM module...</div>' +
    '</div>';

  container.innerHTML = html;

  // Load SHM module dynamically
  loadSHMModule(slug);
}

/**
 * Load and initialize SHM module
 */
function loadSHMModule(siteSlug) {
  var container = document.getElementById('shm-container');
  if (!container) return;

  // Set API base URL for SHM module (can be configured per site)
  // If not set, will default to relative /api path
  if (!window.API_BASE_URL) {
    window.API_BASE_URL = 'https://mincka-shm.com/api';
  }
  
  // Note: The SHM module's static file loaders already try multiple paths including:
  // - ./static/filename (relative to current page)
  // - /static/filename (absolute from root)
  // - ${baseUrl}/static/filename (from API base URL)
  // Since files are in shm/static/, we need to ensure those paths work.
  // The SHM module's fallback logic should handle path resolution.

  // List of SHM JavaScript files to load (in order)
  var shmScripts = [
    'shm/js/api.js',
    'shm/js/quantityColorBar.js',
    'shm/js/3d.js',
    'shm/js/sensors.js',
    'shm/js/stress.js',
    'shm/js/code.js',
    'shm/js/modal.js',
    'shm/js/crack.js',
    'shm/js/main.js'
  ];

  // Check if Three.js and Chart.js are already loaded
  var threeJsLoaded = typeof THREE !== 'undefined';
  var chartJsLoaded = typeof Chart !== 'undefined';

  // Load external dependencies first if needed
  var dependenciesLoaded = Promise.resolve();
  
  if (!threeJsLoaded) {
    dependenciesLoaded = dependenciesLoaded.then(function() {
      return loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r125/three.min.js');
    }).then(function() {
      return loadScript('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r125/examples/js/controls/OrbitControls.js');
    });
  }

  if (!chartJsLoaded) {
    dependenciesLoaded = dependenciesLoaded.then(function() {
      return loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js');
    });
  }

  // Load SHM CSS
  dependenciesLoaded = dependenciesLoaded.then(function() {
    // Use the embedded stylesheet scoped to SHM to avoid leaking styles into the host app
    return loadStylesheet('shm/css/embed.css');
  });

  // Load all SHM scripts sequentially
  dependenciesLoaded.then(function() {
    return loadScriptsSequentially(shmScripts);
  }).then(function() {
    // Patch SHM module's static file path resolution to include shm/static/ paths
    patchSHMPaths();
    // All scripts loaded, now render SHM HTML structure
    renderSHMHTML(container);
  }).catch(function(error) {
    console.error('Error loading SHM module:', error);
    container.innerHTML = '<div class="error" style="padding: 24px; background: var(--error-light); color: #991B1B; border-radius: var(--radius-md); border: 1px solid var(--error);">' +
      '<strong>Error loading SHM module:</strong> ' + (error.message || 'Unknown error') +
      '</div>';
  });
}

/**
 * Load a script dynamically
 */
function loadScript(src) {
  return new Promise(function(resolve, reject) {
    // Check if script is already loaded
    var existing = document.querySelector('script[src="' + src + '"]');
    if (existing) {
      resolve();
      return;
    }

    var script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = function() {
      reject(new Error('Failed to load script: ' + src));
    };
    document.head.appendChild(script);
  });
}

/**
 * Load a stylesheet dynamically
 */
function loadStylesheet(href) {
  return new Promise(function(resolve, reject) {
    // Check if stylesheet is already loaded
    var existing = document.querySelector('link[href="' + href + '"]');
    if (existing) {
      resolve();
      return;
    }

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = function() {
      reject(new Error('Failed to load stylesheet: ' + href));
    };
    document.head.appendChild(link);
  });
}

/**
 * Load scripts sequentially
 */
function loadScriptsSequentially(scripts) {
  return scripts.reduce(function(promise, src) {
    return promise.then(function() {
      return loadScript(src);
    });
  }, Promise.resolve());
}

/**
 * Patch SHM module's path resolution to include shm/static/ paths
 * This ensures static files can be found when SHM is embedded in the main app
 * 
 * Note: The SHM module's static file loaders try multiple paths. Since files are in
 * shm/static/, we need to ensure those paths are tried. The module's existing fallback
 * logic should handle most cases, but we can add shm/static/ paths if needed.
 */
function patchSHMPaths() {
  // The SHM module already has robust path resolution with multiple fallbacks
  // Files in shm/static/ should be accessible via the paths the module tries
  // If files are not found, ensure they're accessible at one of these paths:
  // - ./shm/static/filename (relative from main app)
  // - /shm/static/filename (absolute from root)
  // - shm/static/filename (relative)
  // The module will try these automatically if the standard paths fail
}

/**
 * Render SHM HTML structure (from shm/index.html)
 */
function renderSHMHTML(container) {
  var html = '<div class="shm-wrapper" style="background: white; border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--grey-200);">' +
    '<div class="shm-header" style="margin-bottom: 24px;">' +
    '<nav class="shm-nav" style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">' +
    '<button class="nav-btn active" data-section="sensors">Sensors Status</button>' +
    '<button class="nav-btn" data-section="stress">Stress Analysis</button>' +
    '<button class="nav-btn" data-section="code">Code Compliance</button>' +
    '<button class="nav-btn" data-section="modal">Modal Analysis</button>' +
    '<button class="nav-btn" data-section="crack">Crack Detection</button>' +
    '</nav>' +
    '</div>' +

    '<main class="shm-main">' +
    // Sensors Status Section
    '<section id="sensors" class="content-section active">' +
    '<div id="sensors-data-container" style="display: grid; grid-template-columns: 35% 65%; gap: 24px; margin-top: 24px;">' +
    '<div id="sensors-table-container" style="height: 100%; overflow-y: auto; border: 1px solid var(--grey-200); border-radius: var(--radius-md); padding: 12px; min-height: 400px; background: white;"></div>' +
    '<div id="sensors-3d-container" style="width: 100%; height: 70vh; min-height: 500px; border: 1px solid var(--grey-200); border-radius: var(--radius-md); background: white;"></div>' +
    '</div>' +
    '</section>' +

    // Stress Analysis Section
    '<section id="stress" class="content-section">' +
    '<div id="stress-top-container" style="display: grid; grid-template-columns: 300px 1fr; gap: 24px; margin-bottom: 24px; align-items: stretch;">' +
    '<div class="controls" style="padding: 16px; background: var(--grey-50); border-radius: var(--radius-md); border: 1px solid var(--grey-200); display: flex; flex-direction: column; justify-content: center; margin-bottom: 0;">' +
    '<label for="stress-type" style="margin-right: 8px; font-weight: 600; font-size: 14px; color: var(--grey-700); display: block; margin-bottom: 6px;">Stress Type:</label>' +
    '<select id="stress-type" style="padding: 10px 14px; border: 1px solid var(--grey-300); border-radius: var(--radius-md); font-size: 14px; width: 100%; font-family: inherit; color: var(--grey-900); background: white; cursor: pointer;">' +
    '<option value="Sig_Ax">Axial Stress</option>' +
    '<option value="Sig_Mx">Bending Stress (x)</option>' +
    '<option value="Sig_My">Bending Stress (y)</option>' +
    '<option value="Tau_Vx">Shear Stress (x)</option>' +
    '<option value="Tau_Vy">Shear Stress (y)</option>' +
    '</select>' +
    '</div>' +
    '<div id="stress-findings" style="height: 100%; display: flex; flex-direction: column; justify-content: center; border: 1px solid var(--grey-200); border-radius: var(--radius-md); padding: 16px; background: var(--grey-50);"></div>' +
    '</div>' +
    '<div id="stress-3d-container" style="width: 100%; height: 50vh; min-height: 400px; max-height: 600px; margin-bottom: 24px; border: 1px solid var(--grey-200); border-radius: var(--radius-md); background: white;"></div>' +
    '<div id="stress-table-container" style="display: none;"></div>' +
    '</section>' +

    // Code Compliance Section
    '<section id="code" class="content-section">' +
    '<div id="code-top-row" style="display: grid; grid-template-columns: 300px 1fr; gap: 24px; margin-bottom: 24px; align-items: stretch;">' +
    '<div class="controls" style="padding: 16px; background: var(--grey-50); border-radius: var(--radius-md); border: 1px solid var(--grey-200); display: flex; flex-direction: column; justify-content: center;">' +
    '<label for="code-type" style="margin-right: 8px; font-weight: 600; font-size: 14px; color: var(--grey-700); display: block; margin-bottom: 6px;">Limit State:</label>' +
    '<select id="code-type" style="padding: 10px 14px; border: 1px solid var(--grey-300); border-radius: var(--radius-md); font-size: 14px; width: 100%; font-family: inherit; color: var(--grey-900); background: white; cursor: pointer;">' +
    '<option value="uls">Ultimate Limit State</option>' +
    '<option value="sls">Serviceability Limit State</option>' +
    '</select>' +
    '</div>' +
    '<div id="code-structural-note" style="width: 100%; height: 100%; display: flex; align-items: stretch;"></div>' +
    '</div>' +
    '<div id="code-3d-wrapper" style="display: grid; grid-template-columns: 1fr auto; gap: 24px; margin-bottom: 24px; align-items: start;">' +
    '<div id="code-3d-container" style="width: 100%; height: 50vh; min-height: 400px; max-height: 600px; border: 1px solid var(--grey-200); border-radius: var(--radius-md); background: white;"></div>' +
    '<div id="code-colorbar-container" style="display: flex; align-items: center; justify-content: center; min-width: 200px;"></div>' +
    '</div>' +
    '<div id="code-table-container" style="display: none;"></div>' +
    '</section>' +

    // Modal Analysis Section
    '<section id="modal" class="content-section">' +
    '<div class="controls" style="padding: 16px; background: var(--grey-50); border-radius: var(--radius-md); border: 1px solid var(--grey-200); margin-bottom: 24px;">' +
    '<label for="modal-mode" style="margin-right: 8px; font-weight: 600; font-size: 14px; color: var(--grey-700); display: block; margin-bottom: 6px;">Mode:</label>' +
    '<select id="modal-mode" style="padding: 10px 14px; border: 1px solid var(--grey-300); border-radius: var(--radius-md); font-size: 14px; width: 300px; font-family: inherit; color: var(--grey-900); background: white; cursor: pointer;">' +
    '<option value="Mode1">Mode 1</option>' +
    '<option value="Mode2">Mode 2</option>' +
    '</select>' +
    '</div>' +
    '<div id="modal-3d-container" style="width: 100%; height: 40vh; min-height: 350px; max-height: 500px; margin-bottom: 16px; border: 1px solid var(--grey-200); border-radius: var(--radius-md); background: white;"></div>' +
    '<div id="modal-data-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 16px; height: calc(40vh - 2rem); min-height: 350px; overflow: hidden;">' +
    '<div id="modal-chart-container" style="height: 100%; min-height: 0; max-height: 100%; display: flex; flex-direction: column; border: 1px solid var(--grey-200); border-radius: var(--radius-md); padding: 16px; background: var(--grey-50); overflow: hidden;">' +
    '<h3 style="flex-shrink: 0; margin: 0 0 1rem 0;">Power Spectral Density</h3>' +
    '<canvas id="modal-chart" style="flex: 1; width: 100% !important; height: 100% !important; min-height: 0;"></canvas>' +
    '</div>' +
    '<div id="modal-info-container" style="height: 100%; min-height: 0; max-height: 100%; overflow-y: auto; border: 1px solid var(--grey-200); border-radius: var(--radius-md); padding: 16px; background: var(--grey-50);">' +
    '<h3>Modal Information</h3>' +
    '<div id="modal-info"></div>' +
    '</div>' +
    '</div>' +
    '<div id="modal-table-container" style="display: none;"></div>' +
    '</section>' +

    // Crack Detection Section
    '<section id="crack" class="content-section">' +
    '<div id="crack-3d-container" style="width: 100%; height: 50vh; min-height: 400px; max-height: 600px; margin-bottom: 24px; border: 1px solid var(--grey-200); border-radius: var(--radius-md); background: white;"></div>' +
    '<div id="crack-data-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; height: calc(45vh - 2rem); min-height: 400px;">' +
    '<div id="crack-table-container" style="height: 100%; overflow-y: auto; border: 1px solid var(--grey-200); border-radius: var(--radius-md); padding: 12px; background: white;"></div>' +
    '<div id="crack-info-container" style="height: 100%; overflow-y: auto; border: 1px solid var(--grey-200); border-radius: var(--radius-md); padding: 16px; background: var(--grey-50);">' +
    '<h3>Crack Detection Results</h3>' +
    '<div id="crack-info"></div>' +
    '</div>' +
    '</div>' +
    '</section>' +
    '</main>' +
    '</div>';

  container.innerHTML = html;

  // Initialize SHM navigation immediately after rendering
  // Since DOMContentLoaded already fired, we need to manually initialize
  initializeSHMNavigation();
}

/**
 * Initialize SHM navigation manually (since DOMContentLoaded already fired)
 */
function initializeSHMNavigation() {
  // Wait a bit for DOM to be ready
  setTimeout(function() {
    // Try to use the SHM module's initNavigation if available
    if (typeof initNavigation === 'function' && typeof initCurrentSection === 'function') {
      initNavigation();
      initCurrentSection();
    } else {
      // Fallback: manually set up navigation if functions aren't available yet
      setupSHMNavigationManually();
    }
  }, 200);
}

/**
 * Manually set up SHM navigation event listeners
 */
function setupSHMNavigationManually() {
  var container = document.getElementById('shm-container');
  if (!container) {
    setTimeout(setupSHMNavigationManually, 100);
    return;
  }
  
  var navButtons = container.querySelectorAll('.nav-btn');
  var sections = container.querySelectorAll('.content-section');
  
  if (navButtons.length === 0 || sections.length === 0) {
    // Retry if elements aren't ready yet
    setTimeout(setupSHMNavigationManually, 100);
    return;
  }
  
  console.log('Setting up SHM navigation:', navButtons.length, 'buttons,', sections.length, 'sections');
  
  // Function to handle tab switching
  function switchTab(targetSectionId, clickedButton) {
    if (!targetSectionId) {
      console.warn('No target section ID provided');
      return;
    }
    
    console.log('Switching to section:', targetSectionId);
    
    // Re-query to get fresh references
    var allButtons = container.querySelectorAll('.nav-btn');
    var allSections = container.querySelectorAll('.content-section');
    
    console.log('Found', allButtons.length, 'buttons and', allSections.length, 'sections');
    
    // Update all buttons - remove active state
    allButtons.forEach(function(btn) {
      btn.classList.remove('active');
      btn.style.setProperty('background', 'var(--grey-300)', 'important');
      btn.style.setProperty('color', 'var(--grey-700)', 'important');
    });
    
    // Find and activate the button that matches the target section
    var targetButton = null;
    allButtons.forEach(function(btn) {
      if (btn.getAttribute('data-section') === targetSectionId) {
        targetButton = btn;
      }
    });
    
    if (targetButton) {
      targetButton.classList.add('active');
      targetButton.style.setProperty('background', 'var(--primary-600)', 'important');
      targetButton.style.setProperty('color', 'white', 'important');
      console.log('Button active state updated for:', targetSectionId, targetButton);
    } else {
      console.warn('Could not find button for section:', targetSectionId);
      // Fallback: use clicked button if available
      if (clickedButton) {
        clickedButton.classList.add('active');
        clickedButton.style.setProperty('background', 'var(--primary-600)', 'important');
        clickedButton.style.setProperty('color', 'white', 'important');
      }
    }
    
    // Update all sections - hide all first (CSS handles display via .active class)
    allSections.forEach(function(section) {
      section.classList.remove('active');
      // Remove any inline display styles to let CSS handle it
      section.style.removeProperty('display');
    });
    
    // Show the target section
    var targetSection = container.querySelector('#' + targetSectionId);
    if (targetSection) {
      targetSection.classList.add('active');
      // Remove any inline display styles to let CSS handle it
      targetSection.style.removeProperty('display');
      console.log('Section', targetSectionId, 'is now visible');
      
      // Initialize the section
      if (typeof initSection === 'function') {
        console.log('Using initSection for', targetSectionId);
        initSection(targetSectionId);
      } else {
        console.log('Using fallback initialization for', targetSectionId);
        initializeSHMSection(targetSectionId);
      }
    } else {
      console.error('Target section not found:', targetSectionId);
    }
  }
  
  // Attach click handlers to all navigation buttons
  navButtons.forEach(function(button) {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      var targetSectionId = button.getAttribute('data-section');
      if (!targetSectionId) {
        console.warn('Button has no data-section attribute');
        return;
      }
      
      switchTab(targetSectionId, button);
    });
  });
  
  // Set initial button states
  var allButtons = container.querySelectorAll('.nav-btn');
  allButtons.forEach(function(btn) {
    var isActive = btn.classList.contains('active');
    if (isActive) {
      btn.style.setProperty('background', 'var(--primary-600)', 'important');
      btn.style.setProperty('color', 'white', 'important');
    } else {
      btn.style.setProperty('background', 'var(--grey-300)', 'important');
      btn.style.setProperty('color', 'var(--grey-700)', 'important');
    }
  });
  
  // Initialize the default section (sensors)
  var activeSection = container.querySelector('.content-section.active');
  if (activeSection) {
    var sectionId = activeSection.id;
    console.log('Initializing default section:', sectionId);
    if (typeof initSection === 'function') {
      initSection(sectionId);
    } else {
      initializeSHMSection(sectionId);
    }
  }
}

/**
 * Initialize a specific SHM section (fallback if initSection not available)
 */
function initializeSHMSection(sectionId) {
  switch(sectionId) {
    case 'sensors':
      if (typeof initSensors === 'function') {
        initSensors();
      }
      break;
    case 'stress':
      if (typeof initStress === 'function') {
        initStress();
      }
      break;
    case 'code':
      if (typeof initCode === 'function') {
        initCode();
      }
      break;
    case 'modal':
      if (typeof initModal === 'function') {
        initModal();
      }
      break;
    case 'crack':
      if (typeof initCrack === 'function') {
        initCrack();
      }
      break;
  }
}
