/* global SITES, renderSiteTabs, showToast, escapeHtml */

// API Base URL - can be configured via window.API_BASE_URL or defaults to discovery server
var DEFECT_ANALYSIS_API_BASE = (function() {
  if (typeof window !== 'undefined' && window.API_BASE_URL) {
    console.log('[DEFECT] Using API_BASE_URL from window:', window.API_BASE_URL);
    return window.API_BASE_URL;
  }
  // Default to discovery server
  var defaultUrl = 'https://discovery.mincka-servers.com/api';
  console.log('[DEFECT] Using default API base URL:', defaultUrl);
  return defaultUrl;
})();

function renderDefectAnalysis(container, slug) {
  var site = SITES[slug];
  if (!site) return;

  // Get current user for default inspector
  var currentUser = typeof CURRENT_USER !== 'undefined' ? CURRENT_USER : {};
  var inspectorName = currentUser.name && currentUser.lastname
    ? currentUser.name + ' ' + currentUser.lastname
    : (currentUser.name || 'Inspector Name');

  // Get first asset for default
  var assets = typeof ASSETS !== 'undefined' && ASSETS[slug] ? ASSETS[slug] : [];
  var defaultAsset = assets.length > 0 ? assets[0].code + ' - ' + assets[0].name : '';

  // Generate default job number based on site prefix and date
  var today = new Date();
  var jobNumber = site.prefix + '-' + today.getFullYear().toString().substr(-2) + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(Math.floor(Math.random() * 100)).padStart(3, '0');

  // State
  var state = {
    formState: {
      jobNumber: jobNumber,
      facility: site.name || '',
      asset: defaultAsset,
      component: defaultAsset ? 'Structural Component' : '',
      location: site.name ? 'Site Location' : '',
      inspector: inspectorName,
      responsiblePerson: '',
      reportReference: '',
      inspectionDate: new Date().toISOString().split('T')[0]
    },
    images: [],
    fieldNotes: '',
    isAnalysing: false,
    report: null,
    editedReport: null,
    error: null,
    actionNumber: 'NEW-001'
  };

  function render() {
    var html = renderSiteTabs(slug, 'defect-analysis') +
      '<div class="defect-analysis-container">' +
      renderProjectContextForm() +
      renderImageUploadSection() +
      renderAnalyseButton() +
      (state.report ? renderReport() : '') +
      '</div>';

    container.innerHTML = html;
    attachEventListeners();
  }

  function renderProjectContextForm() {
    var f = state.formState;
    return '<div class="defect-analysis-section">' +
      '<h2 class="defect-analysis-section-title">Project Context</h2>' +
      '<div class="form-grid-3">' +
      '<div class="input-group">' +
      '<label class="input-label" for="da-job-number">Job Number <span class="required">*</span></label>' +
      '<input type="text" id="da-job-number" class="input" value="' + escapeHtml(f.jobNumber) + '" required>' +
      '</div>' +
      '<div class="input-group">' +
      '<label class="input-label" for="da-facility">Facility <span class="required">*</span></label>' +
      '<input type="text" id="da-facility" class="input" value="' + escapeHtml(f.facility) + '" required>' +
      '</div>' +
      '<div class="input-group">' +
      '<label class="input-label" for="da-asset">Asset <span class="required">*</span></label>' +
      '<input type="text" id="da-asset" class="input" value="' + escapeHtml(f.asset) + '" required>' +
      '</div>' +
      '<div class="input-group">' +
      '<label class="input-label" for="da-component">Component <span class="required">*</span></label>' +
      '<input type="text" id="da-component" class="input" value="' + escapeHtml(f.component) + '" required>' +
      '</div>' +
      '<div class="input-group">' +
      '<label class="input-label" for="da-location">Location <span class="required">*</span></label>' +
      '<input type="text" id="da-location" class="input" value="' + escapeHtml(f.location) + '" required>' +
      '</div>' +
      '<div class="input-group">' +
      '<label class="input-label" for="da-inspector">Inspector <span class="required">*</span></label>' +
      '<input type="text" id="da-inspector" class="input" value="' + escapeHtml(f.inspector) + '" required>' +
      '</div>' +
      '<div class="input-group">' +
      '<label class="input-label" for="da-responsible">Responsible Person</label>' +
      '<input type="text" id="da-responsible" class="input" value="' + escapeHtml(f.responsiblePerson) + '">' +
      '</div>' +
      '<div class="input-group">' +
      '<label class="input-label" for="da-report-ref">Report Reference</label>' +
      '<input type="text" id="da-report-ref" class="input" value="' + escapeHtml(f.reportReference) + '">' +
      '</div>' +
      '<div class="input-group">' +
      '<label class="input-label" for="da-inspection-date">Inspection Date <span class="required">*</span></label>' +
      '<input type="date" id="da-inspection-date" class="input" value="' + escapeHtml(f.inspectionDate) + '" required>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function renderImageUploadSection() {
    var imageCount = state.images.length;
    var imagesHtml = state.images.map(function(img, idx) {
      var url = URL.createObjectURL(img);
      return '<div class="defect-analysis-image-item">' +
        '<img src="' + url + '" alt="Uploaded image" class="defect-analysis-image-thumb">' +
        '<button type="button" class="defect-analysis-image-remove" data-image-index="' + idx + '">' +
        '<span class="material-icons-outlined">close</span></button>' +
        '</div>';
    }).join('');

    return '<div class="defect-analysis-section">' +
      '<h2 class="defect-analysis-section-title">Inspection Photos</h2>' +
      '<div class="defect-analysis-upload-area" id="da-upload-area">' +
      '<div class="defect-analysis-upload-content">' +
      '<span class="material-icons-outlined">cloud_upload</span>' +
      '<p>Drag and drop images here, or <span class="defect-analysis-upload-link">click to browse</span></p>' +
      '<p class="defect-analysis-upload-hint">Up to 3 images (JPEG/PNG, max 10MB each)</p>' +
      '</div>' +
      '<input type="file" id="da-file-input" accept="image/jpeg,image/png" multiple style="display:none;">' +
      '</div>' +
      '<div class="defect-analysis-images-preview" id="da-images-preview">' + imagesHtml + '</div>' +
      '<div class="defect-analysis-image-count">' + imageCount + ' of 3 photos uploaded</div>' +
      '<div class="input-group" style="margin-top:20px;">' +
      '<label class="input-label" for="da-field-notes">Field Notes (Optional)</label>' +
      '<textarea id="da-field-notes" class="input" rows="3" placeholder="Add any additional context or observations...">' + escapeHtml(state.fieldNotes) + '</textarea>' +
      '</div>' +
      '</div>';
  }

  function renderAnalyseButton() {
    var canAnalyse = state.images.length > 0 &&
      state.formState.jobNumber &&
      state.formState.facility &&
      state.formState.asset &&
      state.formState.component &&
      state.formState.location &&
      state.formState.inspector &&
      state.formState.inspectionDate;

    return '<div class="defect-analysis-section">' +
      '<button type="button" id="da-analyse-btn" class="btn btn-primary btn-lg" ' +
      (canAnalyse && !state.isAnalysing ? '' : 'disabled') + '>' +
      (state.isAnalysing
        ? '<span class="material-icons-outlined" style="animation:spin 1s linear infinite;">refresh</span> Analysing...'
        : '<span class="material-icons-outlined">search</span> Analyse Defects') +
      '</button>' +
      (state.isAnalysing
        ? '<p class="defect-analysis-loading-text">Analysing inspection photos... This may take 15-30 seconds.</p>'
        : '') +
      (state.error
        ? '<div class="defect-analysis-error">' + (state.error.includes('<br>') ? state.error : escapeHtml(state.error)) + '</div>'
        : '') +
      '</div>';
  }

  function renderReport() {
    if (!state.editedReport) return '';
    var r = state.editedReport;

    return '<div class="defect-analysis-section defect-analysis-report">' +
      '<div class="defect-analysis-report-header">' +
      '<div class="defect-analysis-report-header-row">' +
      '<div><strong>Job Number:</strong> ' + escapeHtml(state.formState.jobNumber) + '</div>' +
      '<div><strong>Facility:</strong> ' + escapeHtml(state.formState.facility) + '</div>' +
      '<div><strong>Asset:</strong> ' + escapeHtml(state.formState.asset) + '</div>' +
      '<div><strong>Component:</strong> ' + escapeHtml(state.formState.component) + '</div>' +
      '<div><strong>Location:</strong> ' + escapeHtml(state.formState.location) + '</div>' +
      '</div>' +
      '<div class="defect-analysis-report-header-row">' +
      '<div><strong>Action Number:</strong> <input type="text" id="da-action-number" class="defect-analysis-inline-input" value="' + escapeHtml(state.actionNumber) + '"></div>' +
      '<div><strong>Inspector:</strong> ' + escapeHtml(state.formState.inspector) + '</div>' +
      '<div><strong>Rec. Timeframe:</strong> ' + renderDropdown('da-timeframe', getTimeframeOptions(), r.recommendedTimeframe || '') + '</div>' +
      '</div>' +
      '</div>' +
      '<div class="defect-analysis-report-section">' +
      '<h3 class="defect-analysis-report-section-title">Action Type</h3>' +
      '<div class="defect-analysis-report-action-type">' + escapeHtml(r.action_type || '') + '</div>' +
      '</div>' +
      '<div class="defect-analysis-report-section">' +
      '<h3 class="defect-analysis-report-section-title">Description of Structural Integrity Issue</h3>' +
      '<textarea id="da-description" class="defect-analysis-textarea">' + escapeHtml(r.description || '') + '</textarea>' +
      '</div>' +
      '<div class="defect-analysis-report-section">' +
      '<h3 class="defect-analysis-report-section-title">Structural Risk Assessment</h3>' +
      '<div class="defect-analysis-risk-grid">' +
      '<div class="defect-analysis-risk-cell">' +
      '<label>Potential Incident</label>' +
      '<textarea id="da-potential-incident" class="defect-analysis-textarea-small">' + escapeHtml(r.potential_incident || '') + '</textarea>' +
      '</div>' +
      '<div class="defect-analysis-risk-cell">' +
      '<label>Failure Mechanism</label>' +
      '<textarea id="da-failure-mechanism" class="defect-analysis-textarea-small">' + escapeHtml(r.failure_mechanism || '') + '</textarea>' +
      '</div>' +
      '<div class="defect-analysis-risk-cell">' +
      '<label>Consequence: Cost</label>' +
      renderDropdown('da-consequence-cost', getConsequenceCostOptions(), r.consequence_cost || '') +
      '</div>' +
      '<div class="defect-analysis-risk-cell">' +
      '<label>Consequence: Safety</label>' +
      renderDropdown('da-consequence-safety', getConsequenceSafetyOptions(), r.consequence_safety || '') +
      '</div>' +
      '<div class="defect-analysis-risk-cell">' +
      '<label>Consequence: Damage</label>' +
      renderDropdown('da-consequence-damage', getConsequenceDamageOptions(), r.consequence_damage || '') +
      '</div>' +
      '<div class="defect-analysis-risk-cell">' +
      '<label>Probability</label>' +
      renderDropdown('da-probability', getProbabilityOptions(), r.probability || '') +
      '</div>' +
      '<div class="defect-analysis-risk-cell">' +
      '<label>Risk Rating</label>' +
      renderDropdown('da-risk-rating', getRiskRatingOptions(), r.risk_rating || '') +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="defect-analysis-report-section">' +
      '<h3 class="defect-analysis-report-section-title">Recommended Action</h3>' +
      '<div class="defect-analysis-action-details">' +
      '<div>' +
      '<label>Action:</label> ' +
      renderDropdown('da-recommended-action', getRecommendedActionOptions(), r.recommended_action || '') +
      '</div>' +
      '<div>' +
      '<label>Est. Cost:</label> ' +
      '<input type="number" id="da-estimated-cost" class="defect-analysis-number-input" value="' + (r.estimated_cost || 0) + '" step="0.01">' +
      ' <span class="defect-analysis-currency">AUD</span>' +
      '</div>' +
      '<div>' +
      '<label>Shutdown Required:</label> ' +
      renderToggle('da-shutdown-required', r.shutdown_required || false) +
      '</div>' +
      '<div>' +
      '<label>Engineering Required:</label> ' +
      renderToggle('da-engineering-required', r.engineering_required || false) +
      '</div>' +
      '<div>' +
      '<label>Overdue:</label> ' +
      renderToggle('da-overdue', r.overdue || false) +
      '</div>' +
      '<div>' +
      '<label>Inspection Date:</label> ' + escapeHtml(state.formState.inspectionDate) +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="defect-analysis-report-section">' +
      '<h3 class="defect-analysis-report-section-title">Action Methodology</h3>' +
      '<div id="da-methodology-list" class="defect-analysis-methodology-list"></div>' +
      '<button type="button" class="btn btn-secondary btn-sm" id="da-add-methodology-step">+ Add Step</button>' +
      '</div>' +
      '<div class="defect-analysis-report-section">' +
      '<h3 class="defect-analysis-report-section-title">Photos</h3>' +
      '<div class="defect-analysis-report-photos">' +
      state.images.map(function(img, idx) {
        var url = URL.createObjectURL(img);
        return '<img src="' + url + '" alt="Inspection photo ' + (idx + 1) + '" class="defect-analysis-report-photo">';
      }).join('') +
      '</div>' +
      '</div>' +
      (r.ai_confidence_notes
        ? '<div class="defect-analysis-report-section">' +
        '<p class="defect-analysis-ai-notes">' + escapeHtml(r.ai_confidence_notes) + '</p>' +
        '</div>'
        : '') +
      '<div class="defect-analysis-report-actions">' +
      '<button type="button" id="da-export-pdf" class="btn btn-primary">' +
      '<span class="material-icons-outlined">picture_as_pdf</span> Export PDF' +
      '</button>' +
      '</div>' +
      '</div>';
  }

  function renderDropdown(id, options, value) {
    var html = '<select id="' + id + '" class="input defect-analysis-select">';
    options.forEach(function(opt) {
      html += '<option value="' + escapeHtml(opt.value) + '"' + (opt.value === value ? ' selected' : '') + '>' +
        escapeHtml(opt.label) + '</option>';
    });
    html += '</select>';
    return html;
  }

  function renderToggle(id, checked) {
    return '<div class="toggle' + (checked ? ' active' : '') + '" id="' + id + '" data-checked="' + checked + '">' +
      '</div>';
  }

  function getTimeframeOptions() {
    return [
      { value: 'Immediate', label: 'Immediate' },
      { value: '3 months', label: '3 months' },
      { value: '6 months', label: '6 months' },
      { value: '12 months', label: '12 months' },
      { value: 'Next scheduled shutdown', label: 'Next scheduled shutdown' }
    ];
  }

  function getConsequenceCostOptions() {
    return [
      { value: 'No loss of production', label: 'No loss of production' },
      { value: 'Loss of production < one day', label: 'Loss of production < one day' },
      { value: 'Loss of production < one week', label: 'Loss of production < one week' },
      { value: 'Loss of production < one month', label: 'Loss of production < one month' },
      { value: 'Loss of production > one month', label: 'Loss of production > one month' }
    ];
  }

  function getConsequenceSafetyOptions() {
    return [
      { value: 'No injury or health effects', label: 'No injury or health effects' },
      { value: 'Minor injuries / first aid', label: 'Minor injuries / first aid' },
      { value: 'Medical treatment injuries', label: 'Medical treatment injuries' },
      { value: 'Permanent total disabilities; single fatality', label: 'Permanent total disabilities; single fatality' },
      { value: 'Multiple fatalities', label: 'Multiple fatalities' }
    ];
  }

  function getConsequenceDamageOptions() {
    return [
      { value: 'No damage', label: 'No damage' },
      { value: 'Minor damage to equipment', label: 'Minor damage to equipment' },
      { value: 'Moderate damage to equipment and / or facility', label: 'Moderate damage to equipment and / or facility' },
      { value: 'Major damage to equipment and / or facility', label: 'Major damage to equipment and / or facility' },
      { value: 'Catastrophic damage / total loss', label: 'Catastrophic damage / total loss' }
    ];
  }

  function getProbabilityOptions() {
    return [
      { value: 'Rare [once per 100 years]', label: 'Rare [once per 100 years]' },
      { value: 'Unlikely [once per 50 years]', label: 'Unlikely [once per 50 years]' },
      { value: 'Could occur at some time [once per 10 years]', label: 'Could occur at some time [once per 10 years]' },
      { value: 'Likely to occur [once per year]', label: 'Likely to occur [once per year]' },
      { value: 'Almost certain [once per month or more]', label: 'Almost certain [once per month or more]' }
    ];
  }

  function getRiskRatingOptions() {
    return [
      { value: 'Low [1-4]', label: 'Low [1-4]' },
      { value: 'Moderate [5-9]', label: 'Moderate [5-9]' },
      { value: 'Significant [10-12]', label: 'Significant [10-12]' },
      { value: 'Major [14-16]', label: 'Major [14-16]' },
      { value: 'Critical [20-25]', label: 'Critical [20-25]' }
    ];
  }

  function getRecommendedActionOptions() {
    return [
      { value: 'REPAIR (Actionable)', label: 'REPAIR (Actionable)' },
      { value: 'REPLACE (Actionable)', label: 'REPLACE (Actionable)' },
      { value: 'MONITOR', label: 'MONITOR' },
      { value: 'ENGINEERING ASSESSMENT REQUIRED', label: 'ENGINEERING ASSESSMENT REQUIRED' }
    ];
  }

  function renderMethodologyList() {
    var list = state.editedReport && state.editedReport.action_methodology
      ? (Array.isArray(state.editedReport.action_methodology)
        ? state.editedReport.action_methodology
        : [state.editedReport.action_methodology])
      : [];
    if (list.length === 0) list = [''];

    var container = document.getElementById('da-methodology-list');
    if (!container) return;

    container.innerHTML = list.map(function(step, idx) {
      return '<div class="defect-analysis-methodology-step">' +
        '<span class="defect-analysis-methodology-number">' + (idx + 1) + '.</span>' +
        '<textarea class="defect-analysis-textarea-small" data-methodology-index="' + idx + '">' +
        escapeHtml(step) + '</textarea>' +
        '<button type="button" class="defect-analysis-methodology-remove" data-methodology-index="' + idx + '">' +
        '<span class="material-icons-outlined">delete</span></button>' +
        '</div>';
    }).join('');
  }

  function attachEventListeners() {
    // Form inputs
    var inputs = ['jobNumber', 'facility', 'asset', 'component', 'location', 'inspector', 'responsiblePerson', 'reportReference', 'inspectionDate'];
    var requiredFields = ['jobNumber', 'facility', 'asset', 'component', 'location', 'inspector', 'inspectionDate'];
    inputs.forEach(function(key) {
      var el = document.getElementById('da-' + key.replace(/([A-Z])/g, '-$1').toLowerCase());
      if (el) {
        el.addEventListener('input', function() {
          state.formState[key] = el.value;
          // Remove error styling when user types
          if (el.classList.contains('input-error')) {
            el.classList.remove('input-error');
          }
          updateAnalyseButton();
        });
        el.addEventListener('blur', function() {
          // Validate required fields on blur
          if (requiredFields.indexOf(key) !== -1 && !el.value.trim()) {
            el.classList.add('input-error');
          }
        });
      }
    });

    // Field notes
    var fieldNotesEl = document.getElementById('da-field-notes');
    if (fieldNotesEl) {
      fieldNotesEl.addEventListener('input', function() {
        state.fieldNotes = fieldNotesEl.value;
      });
    }

    // File upload
    var uploadArea = document.getElementById('da-upload-area');
    var fileInput = document.getElementById('da-file-input');
    if (uploadArea && fileInput) {
      uploadArea.addEventListener('click', function() {
        fileInput.click();
      });
      uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
      });
      uploadArea.addEventListener('dragleave', function() {
        uploadArea.classList.remove('dragover');
      });
      uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
      });
      fileInput.addEventListener('change', function() {
        handleFiles(fileInput.files);
      });
    }

    // Remove image buttons
    container.querySelectorAll('.defect-analysis-image-remove').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.getAttribute('data-image-index'), 10);
        state.images.splice(idx, 1);
        render();
      });
    });

    // Analyse button
    var analyseBtn = document.getElementById('da-analyse-btn');
    if (analyseBtn) {
      analyseBtn.addEventListener('click', function() {
        analyseDefects();
      });
    }

    // Report field listeners
    if (state.report) {
      attachReportListeners();
    }
  }

  function attachReportListeners() {
    // Action number
    var actionNumberEl = document.getElementById('da-action-number');
    if (actionNumberEl) {
      actionNumberEl.addEventListener('input', function() {
        state.actionNumber = actionNumberEl.value;
      });
    }

    // All editable fields
    var editableFields = [
      'description', 'potential-incident', 'failure-mechanism',
      'consequence-cost', 'consequence-safety', 'consequence-damage',
      'probability', 'risk-rating', 'recommended-action',
      'estimated-cost', 'timeframe'
    ];
    editableFields.forEach(function(field) {
      var el = document.getElementById('da-' + field);
      if (el) {
        el.addEventListener('input', function() {
          updateEditedReport();
        });
        el.addEventListener('change', function() {
          updateEditedReport();
        });
      }
    });

    // Toggles
    ['shutdown-required', 'engineering-required', 'overdue'].forEach(function(field) {
      var el = document.getElementById('da-' + field);
      if (el) {
        el.addEventListener('click', function() {
          el.classList.toggle('active');
          el.setAttribute('data-checked', el.classList.contains('active'));
          updateEditedReport();
        });
      }
    });

    // Methodology
    renderMethodologyList();
    var addStepBtn = document.getElementById('da-add-methodology-step');
    if (addStepBtn) {
      addStepBtn.addEventListener('click', function() {
        if (!state.editedReport.action_methodology) {
          state.editedReport.action_methodology = [];
        }
        if (!Array.isArray(state.editedReport.action_methodology)) {
          state.editedReport.action_methodology = [state.editedReport.action_methodology];
        }
        state.editedReport.action_methodology.push('');
        renderMethodologyList();
        attachMethodologyListeners();
      });
    }
    attachMethodologyListeners();

    // PDF Export
    var exportBtn = document.getElementById('da-export-pdf');
    if (exportBtn) {
      exportBtn.addEventListener('click', function() {
        exportPDF();
      });
    }
  }

  function attachMethodologyListeners() {
    container.querySelectorAll('.defect-analysis-methodology-step textarea').forEach(function(textarea) {
      textarea.addEventListener('input', function() {
        var idx = parseInt(textarea.getAttribute('data-methodology-index'), 10);
        if (!state.editedReport.action_methodology) {
          state.editedReport.action_methodology = [];
        }
        if (!Array.isArray(state.editedReport.action_methodology)) {
          state.editedReport.action_methodology = [state.editedReport.action_methodology];
        }
        state.editedReport.action_methodology[idx] = textarea.value;
      });
    });

    container.querySelectorAll('.defect-analysis-methodology-remove').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.getAttribute('data-methodology-index'), 10);
        if (!state.editedReport.action_methodology) return;
        if (!Array.isArray(state.editedReport.action_methodology)) {
          state.editedReport.action_methodology = [state.editedReport.action_methodology];
        }
        state.editedReport.action_methodology.splice(idx, 1);
        renderMethodologyList();
        attachMethodologyListeners();
      });
    });
  }

  function handleFiles(files) {
    Array.from(files).forEach(function(file) {
      if (state.images.length >= 3) {
        showToast('warning', 'Maximum images', 'You can only upload up to 3 images.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showToast('error', 'Invalid file', 'File must be an image (JPEG or PNG).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('error', 'File too large', 'Each image must be under 10MB.');
        return;
      }
      state.images.push(file);
    });
    render();
  }

  function updateAnalyseButton() {
    var btn = document.getElementById('da-analyse-btn');
    if (!btn) return;
    var canAnalyse = state.images.length > 0 &&
      state.formState.jobNumber &&
      state.formState.facility &&
      state.formState.asset &&
      state.formState.component &&
      state.formState.location &&
      state.formState.inspector &&
      state.formState.inspectionDate;
    btn.disabled = !canAnalyse || state.isAnalysing;
  }

  async function analyseDefects() {
    if (state.isAnalysing) return;

    state.isAnalysing = true;
    state.error = null;
    render();

    try {
      var formData = new FormData();
      state.images.forEach(function(file) {
        formData.append('images', file);
      });
      formData.append('field_notes', state.fieldNotes);
      formData.append('project_context', JSON.stringify(state.formState));

      var apiUrl = DEFECT_ANALYSIS_API_BASE + '/defect-analysis';
      console.log('[DEFECT] Calling API:', apiUrl);

      var response;
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          body: formData
        });
      } catch (fetchError) {
        // Network error (CORS, connection refused, etc.)
        console.error('[DEFECT] Network error:', fetchError);
        if (fetchError.message && fetchError.message.includes('NetworkError')) {
          throw new Error('Cannot reach the server. Please check:\n' +
            '1. The backend server is running\n' +
            '2. CORS is configured correctly\n' +
            '3. The API base URL is correct (currently: ' + DEFECT_ANALYSIS_API_BASE + ')');
        }
        throw new Error('Network error: ' + (fetchError.message || 'Cannot connect to server'));
      }

      if (!response.ok) {
        var errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'HTTP ' + response.status + ' ' + response.statusText;
        }
        var errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText || 'Analysis failed' };
        }
        throw new Error(errorData.error || 'Analysis failed. Please try again.');
      }

      var report = await response.json();
      state.report = report;
      state.editedReport = JSON.parse(JSON.stringify(report)); // Deep copy
      if (!state.editedReport.action_methodology) {
        state.editedReport.action_methodology = [];
      }
      if (!Array.isArray(state.editedReport.action_methodology)) {
        state.editedReport.action_methodology = [state.editedReport.action_methodology];
      }

      showToast('success', 'Analysis complete', 'Defect report generated successfully.');
      render();
    } catch (error) {
      console.error('[DEFECT] Analysis error:', error);
      var errorMsg = error.message || 'Analysis failed. Please try again or contact support.';
      
      // Format multi-line error messages
      if (errorMsg.includes('\n')) {
        state.error = errorMsg.replace(/\n/g, '<br>');
      } else {
        state.error = errorMsg;
      }
      
      showToast('error', 'Analysis failed', errorMsg.split('\n')[0]); // Show first line in toast
      render();
    } finally {
      state.isAnalysing = false;
      render();
    }
  }

  function updateEditedReport() {
    if (!state.editedReport) return;

    state.editedReport.description = document.getElementById('da-description')?.value || '';
    state.editedReport.potential_incident = document.getElementById('da-potential-incident')?.value || '';
    state.editedReport.failure_mechanism = document.getElementById('da-failure-mechanism')?.value || '';
    state.editedReport.consequence_cost = document.getElementById('da-consequence-cost')?.value || '';
    state.editedReport.consequence_safety = document.getElementById('da-consequence-safety')?.value || '';
    state.editedReport.consequence_damage = document.getElementById('da-consequence-damage')?.value || '';
    state.editedReport.probability = document.getElementById('da-probability')?.value || '';
    state.editedReport.risk_rating = document.getElementById('da-risk-rating')?.value || '';
    state.editedReport.recommended_action = document.getElementById('da-recommended-action')?.value || '';
    state.editedReport.estimated_cost = parseFloat(document.getElementById('da-estimated-cost')?.value || 0);
    state.editedReport.recommended_timeframe = document.getElementById('da-timeframe')?.value || '';
    state.editedReport.shutdown_required = document.getElementById('da-shutdown-required')?.classList.contains('active');
    state.editedReport.engineering_required = document.getElementById('da-engineering-required')?.classList.contains('active');
    state.editedReport.overdue = document.getElementById('da-overdue')?.classList.contains('active');
  }

  async function exportPDF() {
    // Check if libraries are loaded (jsPDF can be window.jspdf.jsPDF or jsPDF)
    var jsPDFAvailable = typeof window !== 'undefined' && 
      ((typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF !== 'undefined') || 
       typeof jsPDF !== 'undefined');
    var html2canvasAvailable = typeof html2canvas !== 'undefined';
    
    if (!jsPDFAvailable || !html2canvasAvailable) {
      // Load libraries
      if (!jsPDFAvailable) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        // Wait a bit for the library to initialize
        await new Promise(function(resolve) { setTimeout(resolve, 200); });
      }
      if (!html2canvasAvailable) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        // Wait a bit for the library to initialize
        await new Promise(function(resolve) { setTimeout(resolve, 200); });
      }
      
      // Verify they're loaded
      jsPDFAvailable = typeof window !== 'undefined' && 
        ((typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF !== 'undefined') || 
         typeof jsPDF !== 'undefined');
      html2canvasAvailable = typeof html2canvas !== 'undefined';
      
      if (!jsPDFAvailable || !html2canvasAvailable) {
        showToast('error', 'Export failed', 'Could not load PDF libraries. Please refresh the page and try again.');
        return;
      }
    }

    updateEditedReport();
    var reportEl = container.querySelector('.defect-analysis-report');
    if (!reportEl) return;

    try {
      showToast('info', 'Generating PDF', 'Please wait...');

      // Create a temporary container for PDF rendering
      var tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '1200px'; // A4 landscape width
      tempContainer.style.background = 'white';
      document.body.appendChild(tempContainer);

      // Clone and style the report for PDF
      var reportClone = reportEl.cloneNode(true);
      reportClone.style.background = 'white';
      reportClone.style.padding = '40px';
      reportClone.style.width = '1200px';
      tempContainer.appendChild(reportClone);

      // Wait a bit for styles to apply
      await new Promise(function(resolve) { setTimeout(resolve, 100); });

      // Convert blob URLs to data URLs for images
      var images = reportClone.querySelectorAll('.defect-analysis-report-photo');
      for (var i = 0; i < images.length; i++) {
        var img = images[i];
        if (img.src && img.src.startsWith('blob:')) {
          try {
            var response = await fetch(img.src);
            var blob = await response.blob();
            var reader = new FileReader();
            await new Promise(function(resolve, reject) {
              reader.onload = function() {
                img.src = reader.result;
                resolve();
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch (e) {
            console.warn('Could not convert image to data URL:', e);
          }
        }
      }

      var canvas = await html2canvas(reportClone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      var imgData = canvas.toDataURL('image/png', 0.95);
      
      // Get jsPDF constructor (handle both UMD and global versions)
      var jsPDFConstructor = (typeof window !== 'undefined' && window.jspdf && window.jspdf.jsPDF) 
        ? window.jspdf.jsPDF 
        : (typeof jsPDF !== 'undefined' ? jsPDF : null);
      
      if (!jsPDFConstructor) {
        throw new Error('jsPDF library not available');
      }
      
      var pdf = new jsPDFConstructor({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      var imgWidth = 297; // A4 landscape width in mm
      var pageHeight = 210; // A4 landscape height in mm
      var imgHeight = (canvas.height * imgWidth) / canvas.width;
      var heightLeft = imgHeight;
      var position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      var filename = state.formState.jobNumber + '_' +
        (state.editedReport.action_type || 'DEFECT').replace(/\s+/g, '_') + '_' +
        state.actionNumber + '.pdf';
      pdf.save(filename);

      document.body.removeChild(tempContainer);
      showToast('success', 'PDF exported', 'Report saved as ' + filename);
    } catch (error) {
      console.error('PDF export error:', error);
      showToast('error', 'Export failed', 'Could not generate PDF. Please try again.');
    }
  }

  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  render();
}
