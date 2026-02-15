/* global SITES, ASSETS, DEFECTS, SITES_BY_YEAR, DEFECTS_BY_YEAR, renderRiskBadge, renderStatusIndicator, renderStatusProgressBar, renderSiteTabs, renderDataTable, renderPagination, showToast, AppState */

function remediationRateClass(rate) {
  if (rate < 30) return 'rate-low';
  if (rate <= 70) return 'rate-medium';
  return 'rate-high';
}

function renderDashboard(container) {
  var sites = typeof SITES !== 'undefined' ? SITES : {};
  var sitesByYear = typeof SITES_BY_YEAR !== 'undefined' ? SITES_BY_YEAR : {};
  var defectsByYear = typeof DEFECTS_BY_YEAR !== 'undefined' ? DEFECTS_BY_YEAR : {};
  var slugOrder = Object.keys(sites);
  var years = [2026, 2025, 2024, 2023];

  var siteCardsHtml = slugOrder.map(function (slug) {
    var year = typeof AppState !== 'undefined' && AppState.getDashboardYear ? AppState.getDashboardYear(slug) : 2026;
    var yr = (sitesByYear[year] && sitesByYear[year][slug]) ? year : 2026;
    var site = (sitesByYear[yr] && sitesByYear[yr][slug]) ? sitesByYear[yr][slug] : sites[slug];
    var rate = site.remediationRate;
    var rateClass = remediationRateClass(rate);
    var defectsList = (defectsByYear[yr] && defectsByYear[yr][slug]) ? defectsByYear[yr][slug] : ((typeof DEFECTS !== 'undefined' && DEFECTS[slug]) ? DEFECTS[slug] : []);
    var topDefects = defectsList.slice().sort(function (a, b) { return (b.riskScore || 0) - (a.riskScore || 0); }).slice(0, 3);
    var defectRows = topDefects.map(function (d) {
      return '<tr><td><a href="#site/' + slug + '/defect/' + d.id + '" class="defect-link">' + d.id + '<\/a></td><td>' + (d.type || '') + '<\/td><td>' + (d.asset || '') + '<\/td><td>' + renderRiskBadge(d.riskLevel, d.riskScore) + '<\/td></tr>';
    }).join('');
    var assetCount = site.assetCount != null ? site.assetCount : (typeof ASSETS !== 'undefined' && ASSETS[slug] ? ASSETS[slug].length : 0);
    var yearOptions = years.map(function (y) {
      return '<option value="' + y + '"' + (y === yr ? ' selected' : '') + '>' + y + '<\/option>';
    }).join('');
    return '<div class="site-summary-card" data-site-slug="' + slug + '">' +
      '<div class="site-summary-header">' +
      '<div class="site-summary-name">' + site.name + '<\/div>' +
      '<div class="site-summary-actions">' +
      '<div class="year-dropdown dashboard-year-wrapper">' +
      '<select class="dashboard-year-select" data-site-slug="' + slug + '">' + yearOptions + '<\/select>' +
      '<span class="material-icons-outlined year-dropdown-icon">expand_more</span>' +
      '<\/div>' +
      '<a href="#site/' + slug + '/home" class="arrow-link"><span class="material-icons-outlined">arrow_forward</span></a>' +
      '<\/div></div>' +
      '<div class="kpi-row">' +
      '<div class="kpi-item"><div class="kpi-label">Remediation Rate</div><div class="kpi-value ' + rateClass + '">' + rate + '%</div></div>' +
      '<div class="kpi-item"><div class="kpi-label">Assets</div><div class="kpi-value">' + assetCount + '<\/div></div>' +
      '<div class="kpi-item"><div class="kpi-label">Total Defects</div><div class="kpi-value">' + site.totalDefects + '<\/div></div>' +
      '<\/div>' +
      '<div class="defects-status">' +
      '<div class="defects-status-header">' +
      '<div class="defects-status-title">Defects Status</div>' +
      '<div class="defects-status-legend">' +
      '<span><span class="legend-dot closed"></span> Closed: ' + site.closedDefects + '<\/span>' +
      '<span><span class="legend-dot open"></span> Open: ' + site.openDefects + '<\/span>' +
      '<\/div></div>' +
      renderStatusProgressBar(rate) +
      '<\/div>' +
      '<table class="mini-table"><thead><tr><th>Defect ID</th><th>Type</th><th>Asset</th><th>Risk</th></tr></thead><tbody>' + defectRows + '<\/tbody></table>' +
      '<\/div>';
  }).join('');

  var tasksSlug = slugOrder[0];
  var defectsForTasks = (typeof DEFECTS !== 'undefined' && DEFECTS[tasksSlug]) ? DEFECTS[tasksSlug] : [];
  var tasksData = defectsForTasks.filter(function (d) { return d.status !== 'Completed/Closed'; });
  var tasksTableId = 'dashboard-tasks-table';

  var html = '<h1 class="page-title">Dashboard</h1>' +
    '<div class="site-summary-grid">' + siteCardsHtml + '<\/div>' +
    '<div class="tasks-section">' +
    '<div class="tasks-header">' +
    '<div class="tasks-title">Tasks</div>' +
    '<div class="tasks-header-actions">' +
    '<div class="search-compact"><span class="material-icons-outlined">search</span><input type="text" placeholder="Search tasks" id="dashboard-tasks-search" style="border:none;background:transparent;width:100%;"><\/div>' +
    '<a href="#site/' + tasksSlug + '/tasks" class="arrow-circle-btn"><span class="material-icons-outlined" style="font-size:18px;">arrow_forward</span></a>' +
    '<\/div></div>' +
    '<div class="mine-tabs" id="dashboard-mine-tabs">' +
    slugOrder.map(function (s, i) {
      return '<div class="mine-tab' + (i === 0 ? ' active' : '') + '" data-dashboard-site="' + s + '">' + (sites[s] && sites[s].name || s) + '<\/div>';
    }).join('') +
    '<\/div>' +
    '<div id="' + tasksTableId + '"><\/div>' +
    '<\/div>';

  container.innerHTML = html;

  var tableContainer = document.getElementById(tasksTableId);
  var searchInput = document.getElementById('dashboard-tasks-search');
  var currentTasksSlug = tasksSlug;

  function getTasksRows() {
    var year = AppState && AppState.getDashboardYear ? AppState.getDashboardYear(currentTasksSlug) : 2026;
    var defects = (defectsByYear[year] && defectsByYear[year][currentTasksSlug]) ? defectsByYear[year][currentTasksSlug] : (typeof DEFECTS !== 'undefined' && DEFECTS[currentTasksSlug] ? DEFECTS[currentTasksSlug] : []);
    var list = defects.filter(function (d) { return d.status !== 'Completed/Closed'; });
    var q = (searchInput && searchInput.value || '').toLowerCase();
    if (q) {
      list = list.filter(function (r) {
        return [r.id, r.type, r.asset, r.status].some(function (v) { return v && String(v).toLowerCase().indexOf(q) !== -1; });
      });
    }
    return list;
  }

  function renderTasksTable() {
    var cols = [
      { key: 'id', label: 'Defect ID', sortable: true, format: function (v, row) { return '<a href="#site/' + currentTasksSlug + '/defect/' + (row.id || '') + '" class="defect-id-link">' + (v || '') + '<\/a>'; } },
      { key: 'type', label: 'Type', sortable: true, filterable: true },
      { key: 'asset', label: 'Asset', sortable: true },
      { key: 'riskLevel', label: 'Risk Level', sortable: true, format: function (v, row) { return renderRiskBadge(row.riskLevel, row.riskScore); } },
      { key: 'status', label: 'Status', sortable: true, format: function (v, row) { return renderStatusIndicator(row.status); } },
      { key: 'targetDate', label: 'Target Date', sortable: true }
    ];
    renderDataTable({
      columns: cols,
      data: getTasksRows(),
      pageSize: 5,
      containerId: tasksTableId,
      countLabel: 'Total Task',
      tableToolbar: true,
      tableActions: '<button type="button" class="table-action-btn"><span class="material-icons-outlined">view_column</span> Columns</button>' +
        '<button type="button" class="table-action-btn"><span class="material-icons-outlined">download</span> Download</button>'
    });
    var cont = document.getElementById(tasksTableId);
    if (cont) cont.querySelectorAll('.table-action-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { showToast('warning', 'Coming soon', 'This feature will be available soon'); });
    });
  }

  renderTasksTable();

  document.getElementById('dashboard-mine-tabs').addEventListener('click', function (e) {
    var tab = e.target.closest('.mine-tab');
    if (!tab) return;
    currentTasksSlug = tab.getAttribute('data-dashboard-site');
    document.querySelectorAll('#dashboard-mine-tabs .mine-tab').forEach(function (t) { t.classList.remove('active'); });
    tab.classList.add('active');
    renderTasksTable();
  });

  if (searchInput) {
    searchInput.addEventListener('input', function () { renderTasksTable(); });
  }

  container.querySelectorAll('.dashboard-year-select').forEach(function (sel) {
    sel.addEventListener('change', function () {
      var slug = this.getAttribute('data-site-slug');
      var year = parseInt(this.value, 10);
      if (AppState && AppState.setDashboardYear) AppState.setDashboardYear(slug, year);
      renderDashboard(container);
    });
  });
}

function renderSiteHome(container, slug) {
  var site = SITES[slug];
  if (!site) return;
  var rateClass = remediationRateClass(site.remediationRate);
  var notStarted = site.tasksNotStarted || 0;
  var inProgress = site.tasksInProgress || 0;
  var completed = site.tasksCompleted || 0;
  var totalTasks = notStarted + inProgress + completed;
  var pNot = totalTasks ? Math.round((notStarted / totalTasks) * 100) : 0;
  var pIn = totalTasks ? Math.round((inProgress / totalTasks) * 100) : 0;
  var pDone = totalTasks ? Math.round((completed / totalTasks) * 100) : 0;

  var sitePhoto = typeof SITE_PHOTOS !== 'undefined' && SITE_PHOTOS[slug];
  var heroStyle = sitePhoto
    ? 'background-image:url(public/converted_jpg/' + encodeURIComponent(SITE_PHOTOS[slug]) + ');background-size:cover;background-position:center;'
    : 'background:linear-gradient(135deg, var(--grey-700) 0%, var(--grey-900) 100%);';
  var html = renderSiteTabs(slug, 'home') +
    '<div class="hero-banner site-hero" style="' + heroStyle + '">' +
    '<div class="site-hero-overlay">' +
    '<div class="site-hero-logo"><span>' + (site.customer || '') + '</span></div>' +
    '<div class="site-hero-title">' + site.name + '</div>' +
    '</div></div>' +
    '<div class="kpi-cards-row">' +
    '<div class="kpi-stat-card"><div class="kpi-label">Assets</div><div class="kpi-value">' + (ASSETS[slug] ? ASSETS[slug].length : 0) + '</div></div>' +
    '<div class="kpi-stat-card"><div class="kpi-label">Total Defects</div><div class="kpi-value">' + site.totalDefects + '</div></div>' +
    '<div class="kpi-stat-card"><div class="kpi-label">Remediation Rate</div><div class="kpi-value ' + rateClass + '">' + site.remediationRate + '%</div></div>' +
    '</div>' +
    '<div class="summary-panels">' +
    '<div class="summary-panel">' +
    '<div class="summary-panel-title"><strong>' + site.totalDefects + '</strong> Total Defects</div>' +
    '<div class="summary-stats-row">' +
    '<div class="summary-stat"><div class="summary-stat-label"><span class="summary-stat-dot" style="background:var(--success);"></span> Closed</div><div class="summary-stat-value">' + site.closedDefects + '</div></div>' +
    '<div class="summary-stat"><div class="summary-stat-label"><span class="summary-stat-dot" style="background:var(--grey-400);"></span> Open</div><div class="summary-stat-value">' + site.openDefects + '</div></div>' +
    '</div>' +
    renderStatusProgressBar(site.remediationRate) +
    '</div>' +
    '<div class="summary-panel">' +
    '<div class="summary-panel-title"><strong>' + (site.totalTasks || totalTasks) + '</strong> Total Tasks</div>' +
    '<div class="summary-stats-row">' +
    '<div class="summary-stat"><div class="summary-stat-label"><span class="summary-stat-dot" style="background:var(--grey-400);"></span> Not Started</div><div class="summary-stat-value">' + notStarted + '</div></div>' +
    '<div class="summary-stat"><div class="summary-stat-label"><span class="summary-stat-dot" style="background:var(--warning);"></span> In Progress</div><div class="summary-stat-value">' + inProgress + '</div></div>' +
    '<div class="summary-stat"><div class="summary-stat-label"><span class="summary-stat-dot" style="background:var(--success);"></span> Completed</div><div class="summary-stat-value">' + completed + '</div></div>' +
    '</div>' +
    renderMultiProgressBar([
      { percent: pNot, class: 'not-started', label: pNot + '%' },
      { percent: pIn, class: 'in-progress', label: pIn + '%' },
      { percent: pDone, class: 'completed', label: pDone + '%' }
    ]) +
    '</div></div></div>';

  container.innerHTML = html;
}

/* global SITES, ASSETS, DEFECTS, renderSiteTabs, renderRiskBadge, renderStatusIndicator, renderDataTable, renderEmptyState, showToast, AppState */

function renderAssets(container, slug) {
  var site = SITES[slug];
  if (!site) return;
  var assets = ASSETS[slug] || [];
  var viewMode = AppState.assetsViewMode || 'grid';

  var searchHtml = '<div class="assets-header"><div class="assets-title">Assets</div>' +
    '<div class="assets-header-actions"><div class="search-compact" style="width:220px;"><span class="material-icons-outlined">search</span><input type="text" placeholder="Search assets" id="assets-search"></div></div></div>' +
    '<div class="assets-count">Total Assets: <strong>' + assets.length + '</strong></div>' +
    '<div class="flex justify-between items-center" style="margin-bottom:20px;">' +
    '<div class="view-toggle">' +
    '<button type="button" class="view-toggle-btn' + (viewMode === 'grid' ? ' active' : '') + '" data-view="grid"><span class="material-icons-outlined">grid_view</span></button>' +
    '<button type="button" class="view-toggle-btn' + (viewMode === 'list' ? ' active' : '') + '" data-view="list"><span class="material-icons-outlined">view_list</span></button>' +
    '</div>' +
    '<div class="table-actions">' +
    '<button type="button" class="table-action-btn"><span class="material-icons-outlined">view_column</span> Columns</button>' +
    '<button type="button" class="table-action-btn"><span class="material-icons-outlined">download</span> Download</button>' +
    '</div></div>';

  var gridHtml = '<div class="asset-grid" id="assets-grid">' +
    assets.map(function (a) {
      var photoFile = typeof ASSET_PHOTOS !== 'undefined' && ASSET_PHOTOS[a.code];
      var imgStyle = photoFile
        ? 'background-image:url(public/converted_jpg/' + encodeURIComponent(ASSET_PHOTOS[a.code]) + ');background-size:cover;background-position:center;'
        : 'background:linear-gradient(135deg, var(--grey-600) 0%, var(--grey-800) 100%);';
      return '<div class="asset-card" data-asset-code="' + a.code + '" style="cursor:pointer;">' +
        '<div class="asset-card-image" style="' + imgStyle + '">' +
        '<div class="asset-code-badge">' + a.code + '</div></div>' +
        '<div class="asset-card-body">' +
        '<div class="asset-card-name">' + (a.name || '') + '</div>' +
        '<div class="asset-card-stats">' +
        '<div class="asset-stat"><div class="asset-stat-label">Total Defects</div><div class="asset-stat-value">' + a.totalDefects + '</div></div>' +
        '<div class="asset-stat"><div class="asset-stat-label">Critical</div><div class="asset-stat-value critical">' + (a.critical || 0) + '</div></div>' +
        '</div>' +
        '<div class="asset-remediation"><div class="asset-remediation-label">Remediated</div>' +
        '<div class="asset-progress-bar"><div class="asset-progress-fill" style="width:' + (a.remediated || 0) + '%">' + (a.remediated || 0) + '%</div></div></div>' +
        '</div>' +
        '<div class="asset-card-footer">' +
        '<div class="asset-card-user">' +
        '<div class="asset-card-user-avatar"><span style="display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--grey-500);">' + (a.assignedTo ? a.assignedTo.charAt(0) : '') + '</span></div>' +
        '<span class="asset-card-user-name">' + (a.assignedTo || '') + '</span></div>' +
        '<a href="#site/' + slug + '/assets/' + a.code + '" class="asset-view-3d" data-asset-code="' + a.code + '"><span class="material-icons-outlined">visibility</span> View 3D</a>' +
        '</div></div>';
    }).join('') +
    '</div>';

  var listTableId = 'assets-list-table';
  var listHtml = '<div id="' + listTableId + '"></div>';

  var containerHtml = renderSiteTabs(slug, 'assets') + searchHtml;
  if (viewMode === 'grid') {
    containerHtml += gridHtml;
  } else {
    containerHtml += listHtml;
  }

  container.innerHTML = containerHtml;

  if (viewMode === 'list') {
    var cols = [
      { key: 'code', label: 'Code', sortable: true, format: function (v) { return '<a href="#site/' + slug + '/assets/' + v + '" class="defect-id-link">' + (v || '') + '</a>'; } },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'totalDefects', label: 'Total Defects', sortable: true },
      { key: 'critical', label: 'Critical', sortable: true },
      { key: 'remediated', label: 'Remediated %', sortable: true, format: function (v) { return (v || 0) + '%'; } },
      { key: 'assignedTo', label: 'Assigned', sortable: true }
    ];
    var listData = assets.map(function (a) { return { code: a.code, name: a.name, totalDefects: a.totalDefects, critical: a.critical, remediated: a.remediated, assignedTo: a.assignedTo }; });
    renderDataTable({ columns: cols, data: listData, pageSize: 10, containerId: listTableId, countLabel: 'Total Assets', tableToolbar: false });
  }

  container.querySelectorAll('.view-toggle-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = this.getAttribute('data-view');
      AppState.setAssetsView(mode);
      renderAssets(container, slug);
    });
  });
  container.querySelectorAll('.table-action-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { showToast('warning', 'Coming soon', 'This feature will be available soon'); });
  });
  container.querySelectorAll('.asset-card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var code = card.getAttribute('data-asset-code');
      location.hash = '#site/' + slug + '/assets/' + code;
    });
  });
  container.querySelectorAll('.asset-view-3d').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var code = this.getAttribute('data-asset-code');
      var asset = assets.find(function (x) { return x.code === code; });
      if (asset && !asset.has3DViewer) {
        showToast('warning', 'Not available', '3D model is not available for this asset');
      }
      location.hash = '#site/' + slug + '/assets/' + code;
    });
  });

  var searchEl = document.getElementById('assets-search');
  if (searchEl && viewMode === 'grid') {
    searchEl.addEventListener('input', function () {
      var q = this.value.toLowerCase();
      container.querySelectorAll('.asset-card').forEach(function (card) {
        var name = (card.querySelector('.asset-card-name') || {}).textContent || '';
        var code = card.getAttribute('data-asset-code') || '';
        card.style.display = (!q || name.toLowerCase().indexOf(q) !== -1 || code.toLowerCase().indexOf(q) !== -1) ? '' : 'none';
      });
    });
  }
}

function renderAssetDetail(container, slug, code) {
  var site = SITES[slug];
  var assets = ASSETS[slug] || [];
  var asset = assets.find(function (a) { return a.code === code; });
  if (!site || !asset) {
    container.innerHTML = '<p>Asset not found.</p>';
    return;
  }
  var defects = (DEFECTS[slug] || []).filter(function (d) { return d.assetCode === code; });
  var tableId = 'asset-detail-defects-table';

  var backLink = '<a href="#site/' + slug + '/assets" class="back-link"><span class="material-icons-outlined" style="font-size:18px;">arrow_back</span> Back to Assets</a>';
  var titleHtml = '<h1 class="page-title">' + (asset.name || '') + ' <span class="badge badge-neutral">' + code + '</span></h1>';
  var assetPhotoHtml = '';
  if (typeof ASSET_PHOTOS !== 'undefined' && ASSET_PHOTOS[code]) {
    var photoUrl = 'public/converted_jpg/' + encodeURIComponent(ASSET_PHOTOS[code]);
    assetPhotoHtml = '<div class="asset-detail-hero" style="width:100%;height:280px;border-radius:var(--radius-lg);overflow:hidden;margin-bottom:24px;background:var(--grey-200);background-size:cover;background-position:center;background-image:url(' + photoUrl + ');"></div>';
  }
  var statsRow = '<div class="kpi-row" style="margin-bottom:24px;">' +
    '<div class="kpi-item"><div class="kpi-label">Total Defects</div><div class="kpi-value">' + asset.totalDefects + '</div></div>' +
    '<div class="kpi-item"><div class="kpi-label">Critical</div><div class="kpi-value" style="color:var(--error);">' + (asset.critical || 0) + '</div></div>' +
    '<div class="kpi-item"><div class="kpi-label">Remediated</div><div class="kpi-value">' + (asset.remediated || 0) + '%</div></div>' +
    '</div>';

  var viewerHtml = '<div class="viewer-container" style="margin-bottom:24px;">' +
    '<div class="viewer-toolbar">' +
    '<div class="viewer-toolbar-left">' +
    '<div class="viewer-btn"><span class="material-icons-outlined">zoom_in</span></div>' +
    '<div class="viewer-btn"><span class="material-icons-outlined">zoom_out</span></div>' +
    '<div class="viewer-btn"><span class="material-icons-outlined">3d_rotation</span></div>' +
    '<div class="viewer-btn"><span class="material-icons-outlined">center_focus_strong</span></div>' +
    '</div>' +
    '<div class="viewer-toolbar-right">' +
    '<div class="viewer-btn"><span class="material-icons-outlined">layers</span></div>' +
    '<div class="viewer-btn"><span class="material-icons-outlined">fullscreen</span></div>' +
    '</div></div>' +
    '<div class="viewer-content">' +
    '<iframe id="pointerra-viewer" src="https://app.pointerra.io/embed/Se8dEvjnY2vepMuW8SSdbN/" data-asset-code="' + code + '" style="width:100%;height:650px;border:none;"></iframe>' +
    '</div></div>';

  var tableHtml = '<div id="' + tableId + '"></div>';
  container.innerHTML = backLink + titleHtml + assetPhotoHtml + statsRow + viewerHtml + '<div class="tasks-section" style="margin-top:24px;"><div class="summary-panel-title" style="margin-bottom:16px;">Defects</div>' + tableHtml + '</div>';

  var cols = [
    { key: 'id', label: 'Defect ID', sortable: true, format: function (v, row) { return '<a href="#site/' + slug + '/defect/' + (row.id || '') + '" class="defect-id-link">' + (v || '') + '</a>'; } },
    { key: 'type', label: 'Type', sortable: true, filterable: true },
    { key: 'asset', label: 'Asset', sortable: true },
    { key: 'riskLevel', label: 'Risk', sortable: true, format: function (v, row) { return renderRiskBadge(row.riskLevel, row.riskScore); } },
    { key: 'status', label: 'Status', sortable: true, format: function (v, row) { return renderStatusIndicator(row.status); } },
    { key: 'targetDate', label: 'Target Date', sortable: true }
  ];
  renderDataTable({ columns: cols, data: defects, pageSize: 10, containerId: tableId, countLabel: 'Defects', tableToolbar: false });
}

/* global SITES, ASSETS, DEFECTS, getDefectMediaPaths, renderSiteTabs, renderRiskBadge, renderStatusIndicator, renderDataTable, showModal */
function openPdfModal(url, title) {
  var show = typeof showModal === 'function' ? showModal : (typeof window !== 'undefined' && window.showModal);
  if (!url || !show) return;
  var html = '<div class="modal-pdf-inner">' +
    '<div class="modal-header-row">' +
    '<h3 class="modal-title">' + (title || 'PDF') + '</h3>' +
    '<button type="button" class="modal-close-btn" data-dismiss="modal" aria-label="Close"><span class="material-icons-outlined">close</span></button>' +
    '</div>' +
    '<iframe class="modal-pdf-iframe" src="' + url + '" title="' + (title || 'PDF') + '"></iframe>' +
    '</div>';
  show(html);
}

function openPhotoModal(photoUrls, initialIndex) {
  var show = typeof showModal === 'function' ? showModal : (typeof window !== 'undefined' && window.showModal);
  if (!photoUrls || !photoUrls.length || !show) return;
  var idx = Math.max(0, Math.min(initialIndex || 0, photoUrls.length - 1));
  var labels = ['General arrangement', 'Close up', 'Detailed photo'];
  var html = '<div class="modal-photo-inner">' +
    '<div class="modal-header-row">' +
    '<h3 class="modal-title defect-photo-modal-title">Inspection photo</h3>' +
    '<span class="defect-photo-counter">' + (idx + 1) + ' of ' + photoUrls.length + '</span>' +
    '<button type="button" class="modal-close-btn" data-dismiss="modal" aria-label="Close"><span class="material-icons-outlined">close</span></button>' +
    '</div>' +
    '<div class="modal-photo-body">' +
    '<button type="button" class="modal-photo-arrow modal-photo-prev" aria-label="Previous"><span class="material-icons-outlined">chevron_left</span></button>' +
    '<img class="defect-photo-modal-img" src="' + escapeAttr(photoUrls[idx]) + '" alt="Inspection photo ' + (idx + 1) + '">' +
    '<button type="button" class="modal-photo-arrow modal-photo-next" aria-label="Next"><span class="material-icons-outlined">chevron_right</span></button>' +
    '</div>' +
    '</div>';
  show(html);
  var modalEl = document.getElementById('modal-container');
  if (!modalEl) return;
  var wrapper = modalEl.querySelector('.modal-photo-inner');
  var imgEl = modalEl.querySelector('.defect-photo-modal-img');
  var counterEl = modalEl.querySelector('.defect-photo-counter');
  if (!wrapper || !imgEl) return;
  var currentIdx = idx;
  wrapper.querySelector('.modal-photo-prev').addEventListener('click', function () {
    currentIdx = (currentIdx - 1 + photoUrls.length) % photoUrls.length;
    imgEl.src = photoUrls[currentIdx];
    imgEl.alt = 'Inspection photo ' + (currentIdx + 1);
    if (counterEl) counterEl.textContent = (currentIdx + 1) + ' of ' + photoUrls.length;
  });
  wrapper.querySelector('.modal-photo-next').addEventListener('click', function () {
    currentIdx = (currentIdx + 1) % photoUrls.length;
    imgEl.src = photoUrls[currentIdx];
    imgEl.alt = 'Inspection photo ' + (currentIdx + 1);
    if (counterEl) counterEl.textContent = (currentIdx + 1) + ' of ' + photoUrls.length;
  });
  document.addEventListener('keydown', function keyHandler(e) {
    var backdrop = document.getElementById('modal-backdrop');
    if (!backdrop || backdrop.style.display !== 'flex') {
      document.removeEventListener('keydown', keyHandler);
      return;
    }
    if (e.key === 'Escape') { backdrop.click(); document.removeEventListener('keydown', keyHandler); }
    if (e.key === 'ArrowLeft') wrapper.querySelector('.modal-photo-prev').click();
    if (e.key === 'ArrowRight') wrapper.querySelector('.modal-photo-next').click();
  });
}
function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderDefectDetail(container, slug, defectId) {
  var site = SITES[slug];
  var defects = DEFECTS[slug] || [];
  var defect = defects.find(function (d) { return d.id === defectId; });
  if (!site || !defect) {
    container.innerHTML = '<p>Defect not found.</p>';
    return;
  }
  var media = typeof getDefectMediaPaths === 'function' ? getDefectMediaPaths(defectId) : null;
  var reportPdf = (media && media.reportPdf) || defect.reportPdf;
  var remedialPdf = (media && media.remedialPdf) || defect.remedialPdf;
  var photoGeneral = (media && media.photoGeneral) || defect.photoGeneral;
  var photoCloseUp = (media && media.photoCloseUp) || defect.photoCloseUp;
  var photoDetailed = (media && media.photoDetailed) || defect.photoDetailed;
  var assets = ASSETS[slug] || [];
  var asset = assets.find(function (a) { return a.code === defect.assetCode; });
  var assetName = (asset && asset.name) ? asset.name : defect.asset || '';
  var mainPhoto = photoCloseUp || photoDetailed || photoGeneral;
  var riskLabel = (defect.riskLevel === 'very-high' ? 'Very High' : (defect.riskLevel || '').charAt(0).toUpperCase() + (defect.riskLevel || '').slice(1));
  var hasReport = !!reportPdf;
  var hasRemedial = !!remedialPdf;
  var closureStatus = defect.closureStatus || (defect.status === 'Completed/Closed' ? 'Closed' : 'Not closed');

  var backLink = '<a href="#site/' + slug + '/assets/' + (defect.assetCode || '') + '" class="back-link"><span class="material-icons-outlined" style="font-size:18px;">arrow_back</span> ' + (assetName ? 'Back to ' + assetName : 'Risk Manag') + '</a>';
  var leftHtml = '<div class="defect-detail-left">' +
    '<div class="defect-detail-id">' + (defect.id || '') + '</div>' +
    (mainPhoto ? '<div class="defect-detail-hero" style="background-image:url(' + mainPhoto + ');"></div>' : '<div class="defect-detail-hero defect-detail-hero-placeholder"><span class="material-icons-outlined">image</span></div>') +
    '</div>';
  var reportBtn = hasReport ? '<button type="button" class="btn btn-secondary btn-sm" data-pdf-url="' + escapeAttr(reportPdf) + '" data-pdf-title="Defect Report">View</button>' : '<span class="defect-detail-muted">No report</span>';
  var remedialBtn = hasRemedial ? '<button type="button" class="btn btn-secondary btn-sm" data-pdf-url="' + escapeAttr(remedialPdf) + '" data-pdf-title="Remedial Procedure">View procedure</button>' : '<span class="defect-detail-muted">No procedure</span>';
  var photoThumbs = [];
  if (photoGeneral) photoThumbs.push('<button type="button" class="defect-detail-thumb" style="background-image:url(' + photoGeneral + ');" data-photo-index="0" data-photo-url="' + escapeAttr(photoGeneral) + '" title="General arrangement"></button>');
  if (photoCloseUp) photoThumbs.push('<button type="button" class="defect-detail-thumb" style="background-image:url(' + photoCloseUp + ');" data-photo-index="1" data-photo-url="' + escapeAttr(photoCloseUp) + '" title="Close up"></button>');
  if (photoDetailed) photoThumbs.push('<button type="button" class="defect-detail-thumb" style="background-image:url(' + photoDetailed + ');" data-photo-index="2" data-photo-url="' + escapeAttr(photoDetailed) + '" title="Detailed photo"></button>');
  var cardsHtml = '<div class="defect-detail-cards">' +
    '<div class="defect-detail-card">' +
    '<div class="defect-detail-card-icon"><span class="material-icons-outlined">description</span></div>' +
    '<div class="defect-detail-card-body"><div class="defect-detail-card-title">Report</div><div class="defect-detail-card-sub">Detailed PDF</div></div>' +
    '<div class="defect-detail-card-action">' + reportBtn + '</div></div>' +
    '<div class="defect-detail-card">' +
    '<div class="defect-detail-card-icon"><span class="material-icons-outlined">place</span></div>' +
    '<div class="defect-detail-card-body"><div class="defect-detail-card-title">Asset Location</div>' +
    '<div class="defect-detail-card-detail">Asset: ' + (defect.assetCode || '') + ' - ' + assetName + '</div>' +
    (defect.area ? '<div class="defect-detail-card-detail">Area: ' + defect.area + '</div>' : '') + '</div></div>' +
    '<div class="defect-detail-card">' +
    '<div class="defect-detail-card-icon defect-detail-card-icon-risk"><span class="material-icons-outlined" style="font-size:14px;">lens</span></div>' +
    '<div class="defect-detail-card-body"><div class="defect-detail-card-title">' + (defect.type || '') + '</div><div class="defect-detail-card-sub">' + riskLabel + ' Risk</div></div>' +
    '<div class="defect-detail-card-badge">' + renderRiskBadge(defect.riskLevel, defect.riskScore) + '</div></div>' +
    '<div class="defect-detail-card defect-detail-card-photos">' +
    '<div class="defect-detail-card-icon"><span class="material-icons-outlined">photo_camera</span></div>' +
    '<div class="defect-detail-card-body"><div class="defect-detail-card-title">Inspection Photos</div></div></div>' +
    '<div class="defect-detail-photos">' +
    photoThumbs.join('') +
    '</div>' +
    '<div class="defect-detail-card">' +
    '<div class="defect-detail-card-icon"><span class="material-icons-outlined">description</span></div>' +
    '<div class="defect-detail-card-body"><div class="defect-detail-card-title">Remedial</div><div class="defect-detail-card-sub">Procedure</div></div>' +
    '<div class="defect-detail-card-action">' + remedialBtn + '</div></div>' +
    '<div class="defect-detail-card">' +
    '<div class="defect-detail-card-icon"><span class="material-icons-outlined">assignment_turned_in</span></div>' +
    '<div class="defect-detail-card-body"><div class="defect-detail-card-title">Closure</div><div class="defect-detail-card-sub">Report</div></div>' +
    '<div class="defect-detail-card-action"><span class="defect-detail-closure">' + closureStatus + '</span></div></div>';
  var rightHtml = '<div class="defect-detail-right">' + cardsHtml + '</div>';
  container.innerHTML = '<div class="defect-detail-header">' + backLink + '</div>' +
    '<div class="defect-detail-layout">' + leftHtml + rightHtml + '</div>';

  function handleDefectModalClick(e) {
    var pdfBtn = e.target.closest('[data-pdf-url]');
    if (pdfBtn && container.contains(pdfBtn)) {
      e.preventDefault();
      e.stopPropagation();
      openPdfModal(pdfBtn.getAttribute('data-pdf-url'), pdfBtn.getAttribute('data-pdf-title') || 'PDF');
      return;
    }
    var thumb = e.target.closest('.defect-detail-thumb[data-photo-url]');
    if (thumb && container.contains(thumb)) {
      e.preventDefault();
      e.stopPropagation();
      var thumbs = container.querySelectorAll('.defect-detail-thumb[data-photo-url]');
      var urls = Array.from(thumbs).map(function (t) { return t.getAttribute('data-photo-url'); }).filter(Boolean);
      var index = parseInt(thumb.getAttribute('data-photo-index'), 10) || 0;
      openPhotoModal(urls, index);
    }
  }
  container.addEventListener('click', handleDefectModalClick);
}

function renderDefects(container, slug) {
  var site = SITES[slug];
  if (!site) return;
  var data = DEFECTS[slug] || [];
  var tableId = 'defects-table';

  var cols = [
    { key: 'id', label: 'Defect ID', sortable: true, format: function (v, row) { return '<a href="#site/' + slug + '/defect/' + (row.id || '') + '" class="defect-id-link">' + (v || '') + '</a>'; } },
    { key: 'type', label: 'Type', sortable: true, filterable: true },
    { key: 'asset', label: 'Asset', sortable: true },
    { key: 'riskLevel', label: 'Risk Level', sortable: true, format: function (v, row) { return renderRiskBadge(row.riskLevel, row.riskScore); } },
    { key: 'status', label: 'Status', sortable: true, format: function (v, row) { return renderStatusIndicator(row.status); } },
    { key: 'targetDate', label: 'Target Date', sortable: true }
  ];

  container.innerHTML = renderSiteTabs(slug, 'defects') +
    '<div class="tasks-section">' +
    '<div class="tasks-header"><div class="tasks-title">Defects</div></div>' +
    '<div id="' + tableId + '"></div></div>';

  renderDataTable({
    columns: cols,
    data: data,
    pageSize: 10,
    containerId: tableId,
    countLabel: 'Total',
    tableToolbar: true
  });
}

/* global SITES, DEFECTS, renderSiteTabs, renderRiskBadge, renderStatusIndicator, renderDataTable, showToast */

function renderTasks(container, slug) {
  var site = SITES[slug];
  if (!site) return;
  var data = (DEFECTS[slug] || []).filter(function (d) { return d.status !== 'Completed/Closed'; });
  var tableId = 'tasks-table';

  var cols = [
    { key: 'id', label: 'Defect ID', sortable: true, format: function (v, row) { return '<a href="#site/' + slug + '/defect/' + (row.id || '') + '" class="defect-id-link">' + (v || '') + '</a>'; } },
    { key: 'type', label: 'Type', sortable: true, filterable: true },
    { key: 'asset', label: 'Asset', sortable: true },
    { key: 'riskLevel', label: 'Risk Level', sortable: true, format: function (v, row) { return renderRiskBadge(row.riskLevel, row.riskScore); } },
    { key: 'status', label: 'Status', sortable: true, format: function (v, row) { return renderStatusIndicator(row.status); } },
    { key: 'targetDate', label: 'Target Date', sortable: true }
  ];

  container.innerHTML = renderSiteTabs(slug, 'tasks') +
    '<div class="tasks-section">' +
    '<div class="tasks-header"><div class="tasks-title">Tasks</div></div>' +
    '<div class="table-toolbar"><div class="table-count">Total Task: <strong>' + data.length + '</strong></div>' +
    '<div class="table-actions">' +
    '<button type="button" class="table-action-btn"><span class="material-icons-outlined">view_column</span> Columns</button>' +
    '<button type="button" class="table-action-btn"><span class="material-icons-outlined">download</span> Download</button>' +
    '</div></div>' +
    '<div id="' + tableId + '"></div></div>';

  renderDataTable({
    columns: cols,
    data: data,
    pageSize: 10,
    containerId: tableId,
    countLabel: 'Total Task',
    tableToolbar: false
  });

  container.querySelectorAll('.table-action-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { showToast('warning', 'Coming soon', 'This feature will be available soon'); });
  });
}

/* global SITES, SCHEDULE_EVENTS, renderSiteTabs, AppState, showToast */

var MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function renderSchedule(container, slug) {
  var site = SITES[slug];
  if (!site) return;
  var events = SCHEDULE_EVENTS[slug] || [];
  var selectedEventId = window.__scheduleSelectedEventId != null ? window.__scheduleSelectedEventId : (events.length ? events[0].id : null);
  var selectedEvent = events.find(function (e) { return e.id === selectedEventId; }) || events[0] || null;
  window.__scheduleSelectedEventId = selectedEvent ? selectedEvent.id : null;

  function getTodoDone(todo) {
    var saved = AppState.getTodoState(todo.id);
    return saved !== null ? saved : todo.done;
  }

  var monthChips = MONTH_NAMES.map(function (name, i) {
    var hasEvents = events.some(function (e) { return e.month === i; });
    var active = selectedEvent && selectedEvent.month === i;
    var cls = 'month-chip' + (active ? ' active' : '') + (!hasEvents ? ' inactive' : '');
    return '<div class="' + cls + '" data-month="' + i + '">' + name + '</div>';
  }).join('');

  var eventCards = events.map(function (ev) {
    var selected = ev.id === (selectedEvent && selectedEvent.id) ? ' selected' : '';
    return '<div class="event-entry">' +
      '<div class="event-date-range">' + ev.startDate + ' - ' + ev.endDate + '</div>' +
      '<div class="event-card' + selected + '" data-event-id="' + ev.id + '">' +
      '<div class="event-card-title">' + ev.title + '</div>' +
      '<div class="event-card-arrow"><span class="material-icons-outlined">arrow_forward</span></div>' +
      '</div></div>';
  }).join('');

  var detailHtml = '';
  if (selectedEvent) {
    var todos = (selectedEvent.todos || []).map(function (t) {
      var done = getTodoDone(t);
      return '<div class="todo-item" data-todo-id="' + t.id + '">' +
        '<div class="checkbox' + (done ? ' checked' : '') + '"><span class="material-icons-outlined">check</span></div>' +
        '<span class="todo-label">' + (t.text || '') + '</span></div>';
    }).join('');
    detailHtml = '<div class="schedule-detail-now">' + (selectedEvent.isCurrent ? 'Now' : '') + '</div>' +
      '<div class="schedule-detail-title">' + selectedEvent.title + '</div>' +
      '<div class="schedule-detail-dates">' + selectedEvent.startDate + ' - ' + selectedEvent.endDate + '</div>' +
      '<div class="schedule-detail-section">' +
      '<div class="schedule-detail-section-title">Description</div>' +
      '<div class="schedule-detail-description">' + (selectedEvent.description || '') + '</div>' +
      '</div>' +
      '<div class="schedule-detail-section">' +
      '<div class="schedule-detail-section-title">To do</div>' +
      '<div class="todo-list" data-event-id="' + selectedEvent.id + '">' + todos + '</div>' +
      '</div>' +
      '<div class="schedule-actions">' +
      '<button type="button" class="btn btn-secondary">Action</button>' +
      '<button type="button" class="btn btn-primary">Action</button>' +
      '</div>';
  } else {
    detailHtml = '<div class="empty-state"><div class="empty-state-title">Select an event</div><div class="empty-state-text">Choose an event from the list to view details.</div></div>';
  }

  var html = renderSiteTabs(slug, 'schedule') +
    '<div class="schedule-layout">' +
    '<div class="schedule-left">' +
    '<div class="schedule-header">' +
    '<div class="schedule-title">Schedule</div>' +
    '<div class="schedule-header-actions">' +
    '<select class="year-select"><option>2026</option><option>2025</option></select>' +
    '<button type="button" class="add-circle-btn" id="schedule-add-btn" style="width:32px;height:32px;"><span class="material-icons-outlined" style="font-size:18px;">add</span></button>' +
    '</div></div>' +
    '<div class="month-grid">' + monthChips + '</div>' +
    '<div class="event-list">' + eventCards + '</div>' +
    '</div>' +
    '<div class="schedule-right" id="schedule-detail-panel">' + detailHtml + '</div>' +
    '</div>';

  container.innerHTML = html;

  container.querySelectorAll('.event-card').forEach(function (card) {
    card.addEventListener('click', function () {
      window.__scheduleSelectedEventId = card.getAttribute('data-event-id');
      renderSchedule(container, slug);
    });
  });

  container.querySelector('#schedule-add-btn') && container.querySelector('#schedule-add-btn').addEventListener('click', function () {
    showToast('warning', 'Coming soon', 'Schedule creation will be available soon');
  });
  container.querySelectorAll('.schedule-actions .btn').forEach(function (btn) {
    btn.addEventListener('click', function () { showToast('warning', 'Coming soon', 'This feature will be available soon'); });
  });

  container.querySelectorAll('.todo-item').forEach(function (item) {
    var todoId = item.getAttribute('data-todo-id');
    var box = item.querySelector('.checkbox');
    if (!box || !todoId) return;
    box.addEventListener('click', function (e) {
      e.preventDefault();
      var checked = box.classList.toggle('checked');
      AppState.setTodoState(todoId, checked);
    });
  });
}

/* global SITES, renderSiteTabs, renderEmptyState */

function renderDocuments(container, slug) {
  var site = SITES[slug];
  if (!site) return;
  container.innerHTML = renderSiteTabs(slug, 'documents') +
    '<div class="tasks-section">' +
    renderEmptyState('folder_open', 'No documents uploaded', 'Upload documents for this site.') +
    '</div>';
}

// Risk level order and labels (no severity — only risk)
var RISK_LABELS = ['Very High', 'High', 'Medium', 'Low'];
var RISK_IDS = ['very-high', 'high', 'medium', 'low'];
var COST_PER_RISK = [20000, 12000, 6000, 3000]; // $ per defect by risk level
// Corrective = only Very High, High, Medium. Preventive = only Medium, Low. Medium split between both.
var CORRECTIVE_MEDIUM_SHARE = 0.5; // share of Medium that is corrective (rest preventive)

function riskToIndex(r) {
  var i = RISK_IDS.indexOf(r);
  return i >= 0 ? i : 2;
}

// Build analytics by risk level: quantity and cost datasets (aligned with site, from DEFECTS when available).
function getAnalyticsDataByRisk(slug) {
  var site = SITES[slug];
  var totalDefects = site ? site.totalDefects : 0;
  var list = (typeof DEFECTS !== 'undefined' && DEFECTS[slug]) ? DEFECTS[slug] : [];
  var kpiQty = [0, 0, 0, 0];
  var byAsset = {};
  var byType = {};
  var openQty = [0, 0, 0, 0];
  var completedQty = [0, 0, 0, 0];

  list.forEach(function (d) {
    var idx = riskToIndex(d.riskLevel);
    kpiQty[idx]++;
    var assetKey = (d.assetCode || d.asset || '').trim() || 'Other';
    if (!byAsset[assetKey]) byAsset[assetKey] = { name: d.asset || assetKey, values: [0, 0, 0, 0] };
    byAsset[assetKey].values[idx]++;
    var typeKey = (d.type || 'Other').trim();
    if (!byType[typeKey]) byType[typeKey] = { name: typeKey, values: [0, 0, 0, 0] };
    byType[typeKey].values[idx]++;
    var isClosed = (d.status === 'Completed/Closed' || d.status === 'Work Completed');
    if (isClosed) completedQty[idx]++; else openQty[idx]++;
  });

  // Mines remediate higher risk first: completed skewed VH > H > M > L (very few completed in Low).
  function applyCompletedHighFirst(kpi, completed, open) {
    var totalCompleted = completed.reduce(function (a, b) { return a + b; }, 0);
    if (totalCompleted <= 0) return;
    var share = [0.48, 0.35, 0.15, 0.02]; // VH, H, M, L
    var target = share.map(function (s, i) { return Math.min(kpi[i], Math.round(totalCompleted * s)); });
    var sumTarget = target.reduce(function (a, b) { return a + b; }, 0);
    var diff = totalCompleted - sumTarget;
    if (diff > 0) {
      for (var j = 0; j < 4 && diff > 0; j++) {
        var room = kpi[j] - target[j];
        if (room > 0) { var add = Math.min(diff, room); target[j] += add; diff -= add; }
      }
    } else if (diff < 0) {
      for (var k = 0; k < 4 && diff < 0; k++) {
        if (target[k] > 0) { var sub = Math.min(-diff, target[k]); target[k] -= sub; diff += sub; }
      }
    }
    for (var i = 0; i < 4; i++) {
      completed[i] = Math.min(kpi[i], target[i]);
      open[i] = kpi[i] - completed[i];
    }
  }

  var sumList = kpiQty.reduce(function (a, b) { return a + b; }, 0);
  if (sumList > 0 && totalDefects > 0) {
    var scale = totalDefects / sumList;
    function scaleArr(arr) {
      return arr.map(function (v) { return Math.round(v * scale); });
    }
    kpiQty = scaleArr(kpiQty);
    openQty = scaleArr(openQty);
    completedQty = scaleArr(completedQty);
    applyCompletedHighFirst(kpiQty, completedQty, openQty);
    Object.keys(byAsset).forEach(function (k) {
      byAsset[k].values = scaleArr(byAsset[k].values);
    });
    Object.keys(byType).forEach(function (k) {
      byType[k].values = scaleArr(byType[k].values);
    });
  } else if (totalDefects > 0 && sumList === 0) {
    var base = Math.floor(totalDefects / 4);
    var r = totalDefects - base * 4;
    for (var i = 0; i < 4; i++) kpiQty[i] = base + (i < r ? 1 : 0);
    // Remediation order: complete VH first, then H, M; almost none in L.
    var completedRate = [0.88, 0.78, 0.42, 0.02]; // VH, H, M, L
    completedQty = kpiQty.map(function (q, i) { return Math.min(q, Math.round(q * completedRate[i])); });
    openQty = kpiQty.map(function (q, i) { return q - completedQty[i]; });
    var assets = (typeof ASSETS !== 'undefined' && ASSETS[slug]) ? ASSETS[slug] : [];
    assets.slice(0, 6).forEach(function (a) {
      var v = [0, 0, 0, 0];
      var rem = (a.totalDefects || 10);
      for (var j = 0; j < 4 && rem > 0; j++) {
        v[j] = Math.min(rem, Math.ceil((a.totalDefects || 10) / (4 - j)));
        rem -= v[j];
      }
      byAsset[a.code] = { name: a.name, values: v };
    });
    ['Steel Corrosion', 'Concrete Cracking', 'Concrete Spalling', 'Structural Flaw', 'Weld Defect', 'Other'].forEach(function (t, ti) {
      var v = [0, 0, 0, 0];
      var rem = Math.floor(totalDefects / 6) + (ti < totalDefects % 6 ? 1 : 0);
      for (var j = 0; j < 4 && rem > 0; j++) {
        v[j] = Math.min(rem, Math.ceil(rem / (4 - j)));
        rem -= v[j];
      }
      byType[t] = { name: t, values: v };
    });
  }

  // Corrective: VH, H, M only. Preventive: M, L only. Medium split.
  var correctiveQty = [
    kpiQty[0],
    kpiQty[1],
    Math.round(kpiQty[2] * CORRECTIVE_MEDIUM_SHARE),
    0
  ];
  var preventiveQty = [
    0,
    0,
    kpiQty[2] - correctiveQty[2],
    kpiQty[3]
  ];
  var kpiCost = kpiQty.map(function (q, i) { return q * COST_PER_RISK[i]; });
  var correctiveCost = correctiveQty.map(function (q, i) { return q * COST_PER_RISK[i]; });
  var preventiveCost = preventiveQty.map(function (q, i) { return q * COST_PER_RISK[i]; });
  var openCost = openQty.map(function (q, i) { return q * COST_PER_RISK[i]; });
  var completedCost = completedQty.map(function (q, i) { return q * COST_PER_RISK[i]; });
  var assetData = Object.keys(byAsset).map(function (k) {
    var row = byAsset[k];
    return {
      name: row.name,
      valuesQty: row.values,
      valuesCost: row.values.map(function (v, i) { return v * COST_PER_RISK[i]; })
    };
  });
  var defectTypeData = Object.keys(byType).map(function (k) {
    var row = byType[k];
    return {
      name: row.name,
      valuesQty: row.values,
      valuesCost: row.values.map(function (v, i) { return v * COST_PER_RISK[i]; })
    };
  });

  return {
    quantity: {
      kpiValues: kpiQty,
      correctiveData: correctiveQty,
      preventiveData: preventiveQty,
      assetData: assetData,
      defectTypeData: defectTypeData,
      openData: openQty,
      completedData: completedQty,
      total: kpiQty.reduce(function (a, b) { return a + b; }, 0)
    },
    cost: {
      kpiValues: kpiCost,
      correctiveData: correctiveCost,
      preventiveData: preventiveCost,
      assetData: assetData,
      defectTypeData: defectTypeData,
      openData: openCost,
      completedData: completedCost,
      total: kpiCost.reduce(function (a, b) { return a + b; }, 0)
    }
  };
}

function formatCost(v) {
  if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return '$' + (v / 1000).toFixed(0) + 'k';
  return '$' + Math.round(v);
}

function renderAnalytics(container, slug) {
  var site = SITES[slug];
  if (!site) return;
  var dataByView = getAnalyticsDataByRisk(slug);
  var currentView = 'quantity';

  function valueLabel(val, isCost) {
    return isCost ? formatCost(val) : String(val);
  }

  function renderHbarRows(items, isCost, filters) {
    var key = isCost ? 'valuesCost' : 'valuesQty';
    return items.map(function (item) {
      var vals = item[key];
      var total = vals.reduce(function (a, b) { return a + b; }, 0);
      var filteredTotal = vals.reduce(function (a, v, i) { return a + (filters[i] ? v : 0); }, 0);
      var max = Math.max.apply(null, items.map(function (r) {
        return r[key].reduce(function (a, v, i) { return a + (filters[i] ? v : 0); }, 0);
      })) || 1;
      var scale = 320 / max;
      var segments = vals.map(function (v, i) {
        if (!filters[i] || v === 0) return '';
        var w = Math.max(0, Math.round(v * scale));
        return '<div class="analytics-hbar-segment risk-' + (i + 1) + '" style="width:' + w + 'px" title="' + valueLabel(v, isCost) + '">' + (isCost ? valueLabel(v, true) : v) + '</div>';
      }).join('');
      return '<div class="analytics-bar-row">' +
        '<span class="analytics-bar-label">' + item.name + '</span>' +
        '<div class="analytics-bar-track">' + segments + '</div>' +
        '<span class="analytics-bar-value">' + valueLabel(filteredTotal, isCost) + '</span>' +
        '</div>';
    }).join('');
  }

  function renderStatusBars(openData, completedData, isCost) {
    var maxVal = Math.max.apply(null, openData.concat(completedData)) || 1;
    var openTotal = openData.reduce(function (a, b) { return a + b; }, 0);
    var completedTotal = completedData.reduce(function (a, b) { return a + b; }, 0);
    var openBars = RISK_LABELS.map(function (label, i) {
      var v = openData[i] || 0;
      var pct = (v / maxVal) * 100;
      return '<div class="analytics-status-row">' +
        '<span class="analytics-status-label">' + label + '</span>' +
        '<div class="analytics-status-track"><div class="analytics-status-fill risk-' + (i + 1) + '" style="width:' + pct + '%"></div></div>' +
        '<span class="analytics-status-value">' + valueLabel(v, isCost) + '</span>' +
        '</div>';
    }).join('');
    var completedBars = RISK_LABELS.map(function (label, i) {
      var v = completedData[i] || 0;
      var pct = (v / maxVal) * 100;
      return '<div class="analytics-status-row">' +
        '<span class="analytics-status-label">' + label + '</span>' +
        '<div class="analytics-status-track"><div class="analytics-status-fill risk-' + (i + 1) + '" style="width:' + pct + '%"></div></div>' +
        '<span class="analytics-status-value">' + valueLabel(v, isCost) + '</span>' +
        '</div>';
    }).join('');
    return {
      openHtml: openBars,
      completedHtml: completedBars,
      openTotal: valueLabel(openTotal, isCost),
      completedTotal: valueLabel(completedTotal, isCost)
    };
  }

  function getFilters() {
    var f = [true, true, true, true];
    var checks = container.querySelectorAll('.analytics-filter-item input[type="checkbox"]');
    for (var i = 0; i < 4 && i < checks.length; i++) f[i] = checks[i].checked;
    return f;
  }

  function updateCharts() {
    var isCost = currentView === 'cost';
    var data = dataByView[currentView];
    var filters = getFilters();
    var donutTotal = container.querySelector('#analytics-donut-total');
    if (donutTotal) donutTotal.textContent = valueLabel(data.total, isCost);
    var donutLabel = container.querySelector('#analytics-donut-label');
    if (donutLabel) donutLabel.textContent = isCost ? 'Total Cost' : 'Total Defects';
    container.querySelectorAll('#analytics-donut-legend-1, #analytics-donut-legend-2, #analytics-donut-legend-3, #analytics-donut-legend-4').forEach(function (el, i) {
      if (el) el.textContent = RISK_LABELS[i] + ' (' + valueLabel(data.kpiValues[i], isCost) + ')';
    });
    var maxBar = Math.max.apply(null, data.correctiveData.concat(data.preventiveData)) || 1;
    for (var i = 0; i < 4; i++) {
      var ec = container.querySelector('#analytics-bar-corrective-' + i);
      var ep = container.querySelector('#analytics-bar-preventive-' + i);
      if (ec) { ec.textContent = valueLabel(data.correctiveData[i], isCost); }
      if (ep) { ep.textContent = valueLabel(data.preventiveData[i], isCost); }
      var barC = container.querySelectorAll('.analytics-vbar-groups .analytics-vertical-bar.corrective')[i];
      var barP = container.querySelectorAll('.analytics-vbar-groups .analytics-vertical-bar.preventive')[i];
      if (barC) barC.style.height = ((data.correctiveData[i] || 0) / maxBar) * 140 + 'px';
      if (barP) barP.style.height = ((data.preventiveData[i] || 0) / maxBar) * 140 + 'px';
    }
    var assetContainer = document.getElementById('analytics-asset-bars');
    if (assetContainer) assetContainer.innerHTML = renderHbarRows(data.assetData, isCost, filters);
    var typeContainer = document.getElementById('analytics-type-bars');
    if (typeContainer) typeContainer.innerHTML = renderHbarRows(data.defectTypeData, isCost, filters);
    var status = renderStatusBars(data.openData, data.completedData, isCost);
    var openTotalEl = document.getElementById('analytics-open-total');
    var completedTotalEl = document.getElementById('analytics-completed-total');
    if (openTotalEl) openTotalEl.textContent = status.openTotal + ' Total';
    if (completedTotalEl) completedTotalEl.textContent = status.completedTotal + ' Total';
    var openBarsEl = document.getElementById('analytics-open-bars');
    var completedBarsEl = document.getElementById('analytics-completed-bars');
    if (openBarsEl) openBarsEl.innerHTML = status.openHtml;
    if (completedBarsEl) completedBarsEl.innerHTML = status.completedHtml;
  }

  var data0 = dataByView.quantity;
  var filters = [true, true, true, true];
  var status0 = renderStatusBars(data0.openData, data0.completedData, false);
  var totalCost = dataByView.cost.total;
  var totalCostFmt = totalCost >= 1000000 ? (totalCost / 1000000).toFixed(1) + 'M' : (totalCost / 1000).toFixed(0) + 'k';

  var donutPercents = data0.kpiValues.map(function (v) {
    return (data0.total ? (v / data0.total) * 100 : 0).toFixed(1);
  });
  var conicParts = [];
  var acc = 0;
  donutPercents.forEach(function (p, i) {
    conicParts.push('var(--risk-cat-' + (i + 1) + ') ' + acc + '% ' + (acc + parseFloat(p)) + '%');
    acc += parseFloat(p);
  });
  var conicGradient = 'conic-gradient(' + (conicParts.length ? conicParts.join(', ') : 'var(--grey-200) 0% 100%') + ')';

  var maxBar = Math.max.apply(null, data0.correctiveData.concat(data0.preventiveData)) || 1;
  var barCorrectiveHtml = data0.correctiveData.map(function (v, i) {
    var h = (v / maxBar) * 140;
    return '<div class="analytics-vertical-bar-group"><div class="analytics-vertical-bar corrective" style="height:' + h + 'px"></div><span class="analytics-vbar-value" id="analytics-bar-corrective-' + i + '">' + v + '</span></div>';
  }).join('');
  var barPreventiveHtml = data0.preventiveData.map(function (v, i) {
    var h = (v / maxBar) * 140;
    return '<div class="analytics-vertical-bar-group"><div class="analytics-vertical-bar preventive" style="height:' + h + 'px"></div><span class="analytics-vbar-value" id="analytics-bar-preventive-' + i + '">' + v + '</span></div>';
  }).join('');

  var html = renderSiteTabs(slug, 'analytics') +
    '<div class="analytics-page">' +
    '<div class="analytics-toolbar">' +
    '<div class="analytics-toggle-wrap">' +
    '<span class="analytics-toggle-label">View by</span>' +
    '<div class="analytics-toggle">' +
    '<button type="button" class="analytics-toggle-option active" data-view="quantity">Defect Quantity</button>' +
    '<button type="button" class="analytics-toggle-option" data-view="cost">Defect Cost</button>' +
    '</div></div></div>' +

    '<div class="analytics-grid">' +
    '<div class="analytics-card analytics-donut-card">' +
    '<h2 class="analytics-card-title">Defects by Risk Rating</h2>' +
    '<div class="analytics-donut-wrap">' +
    '<div class="analytics-donut" style="background:' + conicGradient + '"></div>' +
    '<div class="analytics-donut-center"><span id="analytics-donut-total">' + data0.total + '</span><span id="analytics-donut-label">Total Defects</span></div>' +
    '</div>' +
    '<div class="analytics-donut-legend">' +
    '<span id="analytics-donut-legend-1">Very High (' + data0.kpiValues[0] + ')</span>' +
    '<span id="analytics-donut-legend-2">High (' + data0.kpiValues[1] + ')</span>' +
    '<span id="analytics-donut-legend-3">Medium (' + data0.kpiValues[2] + ')</span>' +
    '<span id="analytics-donut-legend-4">Low (' + data0.kpiValues[3] + ')</span>' +
    '</div></div>' +

    '<div class="analytics-card">' +
    '<h2 class="analytics-card-title">Defects by Risk Rating and Task Type</h2>' +
    '<div class="analytics-bar-chart-vertical">' +
    '<div class="analytics-vbar-labels">' + RISK_LABELS.map(function (l) { return '<span>' + l + '</span>'; }).join('') + '</div>' +
    '<div class="analytics-vbar-bars">' +
    '<div class="analytics-vbar-series"><span class="analytics-vbar-legend corrective"></span> Corrective (C) <div class="analytics-vbar-groups">' + barCorrectiveHtml + '</div></div>' +
    '<div class="analytics-vbar-series"><span class="analytics-vbar-legend preventive"></span> Preventive (P) <div class="analytics-vbar-groups">' + barPreventiveHtml + '</div></div>' +
    '</div></div>' +
    '<div class="analytics-filter-row">C = Corrective &nbsp;|&nbsp; P = Preventive</div>' +
    '</div></div>' +

    '<div class="analytics-card full-width">' +
    '<h2 class="analytics-card-title">Defects by Asset (by Risk Rating)</h2>' +
    '<div class="analytics-chart-wrap analytics-bar-chart" id="analytics-asset-bars">' + renderHbarRows(data0.assetData, false, filters) + '</div>' +
    '<div class="analytics-filter-row"><label class="analytics-filter-item"><input type="checkbox" checked data-risk="0"> Very High</label><label class="analytics-filter-item"><input type="checkbox" checked data-risk="1"> High</label><label class="analytics-filter-item"><input type="checkbox" checked data-risk="2"> Medium</label><label class="analytics-filter-item"><input type="checkbox" checked data-risk="3"> Low</label></div>' +
    '</div>' +

    '<div class="analytics-card full-width">' +
    '<h2 class="analytics-card-title">Defects by Defect Type (by Risk Rating)</h2>' +
    '<div class="analytics-chart-wrap analytics-bar-chart" id="analytics-type-bars">' + renderHbarRows(data0.defectTypeData, false, filters) + '</div>' +
    '<div class="analytics-filter-row"><label class="analytics-filter-item"><input type="checkbox" checked data-risk="0"> Very High</label><label class="analytics-filter-item"><input type="checkbox" checked data-risk="1"> High</label><label class="analytics-filter-item"><input type="checkbox" checked data-risk="2"> Medium</label><label class="analytics-filter-item"><input type="checkbox" checked data-risk="3"> Low</label></div>' +
    '</div>' +

    '<div class="analytics-card full-width">' +
    '<h2 class="analytics-card-title">Open vs Completed Defects by Risk Rating</h2>' +
    '<div class="analytics-status-grid">' +
    '<div class="analytics-status-section">' +
    '<div class="analytics-status-header"><span class="analytics-status-title">Open Defects</span><span class="analytics-status-badge open" id="analytics-open-total">' + status0.openTotal + ' Total</span></div>' +
    '<div class="analytics-status-bars" id="analytics-open-bars">' + status0.openHtml + '</div></div>' +
    '<div class="analytics-status-section">' +
    '<div class="analytics-status-header"><span class="analytics-status-title">Completed Defects</span><span class="analytics-status-badge completed" id="analytics-completed-total">' + status0.completedTotal + ' Total</span></div>' +
    '<div class="analytics-status-bars" id="analytics-completed-bars">' + status0.completedHtml + '</div></div>' +
    '</div></div>' +
    '</div></div>';

  container.innerHTML = html;

  container.querySelectorAll('.analytics-toggle-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentView = this.getAttribute('data-view');
      container.querySelectorAll('.analytics-toggle-option').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-view') === currentView); });
      updateCharts();
    });
  });

  container.querySelectorAll('.analytics-filter-item input[type="checkbox"]').forEach(function (cb, i) {
    cb.addEventListener('change', function () {
      var idx = i % 4;
      var all = container.querySelectorAll('.analytics-filter-item input[type="checkbox"]');
      if (i >= 4 && all[idx]) all[idx].checked = this.checked;
      else if (i < 4) { for (var j = 4; j < all.length; j++) { if (j % 4 === idx) all[j].checked = this.checked; } }
      updateCharts();
    });
  });

  updateCharts();
}

/* global RESOURCES, showToast */

var RESOURCE_CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'guide', label: 'Guides', icon: 'menu_book' },
  { id: 'documentation', label: 'Documentation', icon: 'description' },
  { id: 'video', label: 'Videos', icon: 'play_circle' },
  { id: 'quick-reference', label: 'Quick reference', icon: 'keyboard' }
];

function getResourceTypeLabel(type) {
  var t = RESOURCE_CATEGORIES.find(function (c) { return c.id === type; });
  return t ? t.label : type;
}

function renderResourceCard(r) {
  var durationHtml = r.duration ? '<span class="resource-card-duration"><span class="material-icons-outlined" style="font-size:14px;vertical-align:middle;margin-right:2px;">schedule</span>' + r.duration + '</span>' : '';
  return '<div class="resource-card" data-resource-id="' + r.id + '" data-resource-type="' + (r.type || '') + '">' +
    '<div class="resource-card-header">' +
    '<div class="resource-card-icon"><span class="material-icons-outlined">' + (r.icon || 'article') + '</span></div>' +
    '<span class="resource-card-type">' + getResourceTypeLabel(r.type) + '</span>' +
    '</div>' +
    '<div class="resource-card-title">' + (r.title || '') + '</div>' +
    '<div class="resource-card-desc">' + (r.description || '') + '</div>' +
    '<div class="resource-card-meta">' +
    durationHtml +
    '<span class="resource-card-link" data-resource-id="' + r.id + '">View <span class="material-icons-outlined">arrow_forward</span></span>' +
    '</div></div>';
}

function renderResources(container) {
  var list = typeof RESOURCES !== 'undefined' ? RESOURCES.slice() : [];
  var currentCategory = 'all';
  var searchQuery = '';

  var heroHtml = '<div class="resources-hero">' +
    '<div class="resources-hero-icon"><span class="material-icons-outlined">library_books</span></div>' +
    '<div class="resources-hero-text">' +
    '<div class="resources-hero-title">Guides &amp; materials</div>' +
    '<div class="resources-hero-desc">Find user guides, documentation, videos, and quick references to get the most out of Argus.</div>' +
    '</div></div>';

  var categoryButtons = RESOURCE_CATEGORIES.map(function (c) {
    var active = c.id === currentCategory ? ' active' : '';
    return '<button type="button" class="resources-category-btn' + active + '" data-category="' + c.id + '">' +
      '<span class="material-icons-outlined">' + c.icon + '</span>' + c.label + '</button>';
  }).join('');

  var toolbarHtml = '<div class="resources-toolbar">' +
    '<div class="resources-categories" id="resources-categories">' + categoryButtons + '</div>' +
    '<div class="search-compact" style="width:260px;">' +
    '<span class="material-icons-outlined">search</span>' +
    '<input type="text" id="resources-search" placeholder="Search guides and docs…">' +
    '</div></div>';

  function filterList() {
    var q = searchQuery.toLowerCase().trim();
    var byCategory = currentCategory === 'all' ? list : list.filter(function (r) { return r.type === currentCategory; });
    if (!q) return byCategory;
    return byCategory.filter(function (r) {
      return (r.title && r.title.toLowerCase().indexOf(q) !== -1) ||
        (r.description && r.description.toLowerCase().indexOf(q) !== -1);
    });
  }

  function renderGrid() {
    var filtered = filterList();
    var gridEl = document.getElementById('resources-grid');
    if (!gridEl) return;
    if (filtered.length === 0) {
      gridEl.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">' +
        '<div class="empty-state-icon"><span class="material-icons-outlined">search_off</span></div>' +
        '<div class="empty-state-title">No resources found</div>' +
        '<div class="empty-state-text">Try a different category or search term.</div></div>';
      return;
    }
    gridEl.innerHTML = filtered.map(renderResourceCard).join('');

    gridEl.querySelectorAll('.resource-card-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var id = this.getAttribute('data-resource-id');
        var r = list.find(function (x) { return x.id === id; });
        if (r) showToast('info', 'Opening resource', (r.title || '') + ' - links can be wired to real URLs or modals.');
      });
    });
  }

  var gridHtml = '<div class="resources-grid" id="resources-grid">' +
    list.map(renderResourceCard).join('') +
    '</div>';

  container.innerHTML =
    '<h1 class="page-title">Resources</h1>' +
    '<p class="resources-intro">Guides, documentation, and materials to help you use Argus effectively.</p>' +
    heroHtml +
    toolbarHtml +
    gridHtml;

  document.getElementById('resources-categories').addEventListener('click', function (e) {
    var btn = e.target.closest('.resources-category-btn');
    if (!btn) return;
    currentCategory = btn.getAttribute('data-category');
    container.querySelectorAll('.resources-category-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    renderGrid();
  });

  var searchEl = document.getElementById('resources-search');
  if (searchEl) {
    searchEl.addEventListener('input', function () {
      searchQuery = this.value || '';
      renderGrid();
    });
  }

  renderGrid();
}

/* global CURRENT_USER, USERS, AppState, renderSettingsTabs, renderDataTable, showModal, hideModal, showToast */

var ROLES = ['Engineer', 'Designer', 'Developer', 'Product Manager', 'UX Researcher', 'Frontend Developer', 'UI Designer', 'Backend Developer', 'Data Analyst', 'Quality Assurance', 'Marketing Specialist'];

function renderSettings(container, tab) {
  tab = tab || 'account';
  var html = renderSettingsTabs(tab) + '<div id="settings-content"></div>';
  container.innerHTML = html;
  var content = document.getElementById('settings-content');
  if (!content) return;

  if (tab === 'account') {
    var twoFa = AppState.twoFactorEnabled;
    content.innerHTML =
      '<div class="settings-section">' +
      '<div class="settings-section-header"><span class="material-icons-outlined">person_outline</span><div class="settings-section-title">My Profile</div></div>' +
      '<div class="profile-image-upload">' +
      '<div class="profile-avatar-large"><div style="width:100%;height:100%;background:var(--grey-300);display:flex;align-items:center;justify-content:center;"><span class="material-icons-outlined" style="color:var(--grey-500);font-size:28px;">person</span></div></div>' +
      '<div><div class="profile-image-actions"><button type="button" class="btn-change-image">+ Change Image</button><button type="button" class="btn-remove-image">Remove Image</button></div>' +
      '<div class="profile-image-hint">We support PNG, JPEG under 2MB</div></div></div>' +
      '<div class="form-grid">' +
      '<div class="floating-input-group"><input type="text" class="floating-input" value="' + (CURRENT_USER.name || '') + '" placeholder=" "><label class="floating-label">First Name</label></div>' +
      '<div class="floating-input-group"><input type="text" class="floating-input" value="' + (CURRENT_USER.lastname || '') + '" placeholder=" "><label class="floating-label">Last Name</label></div>' +
      '<div class="floating-input-group"><input type="text" class="floating-input" value="' + (CURRENT_USER.phone || '') + '" placeholder=" "><label class="floating-label">Phone</label></div>' +
      '<div class="floating-input-group"><input type="text" class="floating-input" value="' + (CURRENT_USER.position || '') + '" placeholder=" "><label class="floating-label">Position</label></div>' +
      '</div></div>' +
      '<div class="settings-divider"></div>' +
      '<div class="settings-section">' +
      '<div class="settings-section-header"><span class="material-icons-outlined">verified_user</span><div class="settings-section-title">Account Security</div></div>' +
      '<div class="settings-row"><div class="settings-row-content"><div style="font-size:14px;color:var(--grey-500);">' + (CURRENT_USER.email || '') + '</div></div><div class="settings-row-action"><a href="#">Change Email</a></div></div>' +
      '<div class="settings-row"><div class="settings-row-content"><div style="font-size:14px;color:var(--grey-500);">â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢</div></div><div class="settings-row-action"><a href="#">Change Password</a></div></div>' +
      '<div class="settings-row"><div class="settings-row-content"><div class="settings-row-label">2-Steps Verification</div><div class="settings-row-description">add an additional layer of security to your account during login.</div></div>' +
      '<div class="settings-row-action"><div class="toggle' + (twoFa ? ' active' : '') + '" id="settings-2fa-toggle"></div></div></div>' +
      '</div>' +
      '<div class="settings-divider"></div>' +
      '<div class="settings-section">' +
      '<div class="settings-section-header"><span class="material-icons-outlined">logout</span><div class="settings-section-title">Access Support</div></div>' +
      '<div class="settings-row"><div class="settings-row-content"><div class="settings-row-label">Log Out of All Devices</div><div class="settings-row-description">Log out of all active sessions on other devices besides this one</div></div><div class="settings-row-action"><a href="#" id="settings-logout">Log Out</a></div></div>' +
      '</div>' +
      '<div class="settings-divider"></div>' +
      '<div class="settings-section">' +
      '<div class="settings-section-header"><span class="material-icons-outlined">notifications_none</span><div class="settings-section-title">Notifications Preference</div></div>' +
      '<div class="settings-row"><div class="settings-row-content"><div class="settings-row-label">Notification Name</div><div class="settings-row-description">Receive email notifications for important updates.</div></div><div class="settings-row-action"><div class="toggle active"></div></div></div>' +
      '</div>' +
      '<div class="settings-save-footer"><button type="button" class="btn btn-primary" id="settings-save-account">Save Changes</button></div>';

    content.querySelector('#settings-2fa-toggle').addEventListener('click', function () {
      AppState.setTwoFactor(!AppState.twoFactorEnabled);
      this.classList.toggle('active');
    });
    content.querySelector('#settings-save-account').addEventListener('click', function () {
      showToast('success', 'Changes saved', 'Your changes have been saved successfully');
    });
    content.querySelectorAll('.settings-row-action a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (this.id === 'settings-logout') showToast('warning', 'Coming soon', 'This feature will be available soon');
        else showToast('warning', 'Coming soon', 'This feature will be available soon');
      });
    });
    content.querySelector('.btn-change-image').addEventListener('click', function () { showToast('warning', 'Coming soon', 'Image upload will be available soon'); });
    content.querySelector('.btn-remove-image').addEventListener('click', function () { showToast('warning', 'Coming soon', 'Image upload will be available soon'); });
  } else if (tab === 'notifications') {
    var notifList = typeof NOTIFICATIONS !== 'undefined' ? NOTIFICATIONS.slice() : [];
    var notifFilter = 'all';
    var notifSearch = '';
    var expandedIds = {};

    function getNotifTypeLabel(n) {
      if (n.type === 'comment-defect' || n.type === 'reply') return 'Defect';
      if (n.type === 'comment-asset') return 'Asset';
      if (n.type === 'mention') return 'Mention';
      if (n.type === 'status-change') return 'Status';
      return 'Other';
    }
    function getNotifActionText(n) {
      if (n.type === 'comment-defect' || n.type === 'comment-asset') return 'commented on';
      if (n.type === 'mention') return 'mentioned you in';
      if (n.type === 'status-change') return 'updated status for';
      if (n.type === 'reply') return 'replied to';
      return 'updated';
    }
    function filterNotifs() {
      var q = notifSearch.toLowerCase().trim();
      var byFilter = notifFilter === 'all' ? notifList : notifList.filter(function (n) {
        if (notifFilter === 'defects') return n.type === 'comment-defect' || n.type === 'status-change' || n.type === 'reply';
        if (notifFilter === 'assets') return n.type === 'comment-asset';
        if (notifFilter === 'mentions') return n.type === 'mention';
        return true;
      });
      if (!q) return byFilter;
      return byFilter.filter(function (n) {
        var text = (n.userName || '') + ' ' + (n.message || '') + ' ' + (n.defectId || '') + ' ' + (n.assetName || '') + ' ' + (n.defectType || '');
        return text.toLowerCase().indexOf(q) !== -1;
      });
    }
    function getTargetHref(n) {
      if (n.defectId && n.assetCode) return '#site/' + (n.siteSlug || 'el-paso') + '/assets/' + (n.assetCode || '');
      if (n.assetCode) return '#site/' + (n.siteSlug || 'el-paso') + '/assets/' + (n.assetCode || '');
      return '#';
    }
    function getTargetLabel(n) {
      if (n.defectId) return n.defectId + ' (' + (n.defectType || '') + ')';
      if (n.assetCode) return n.assetName + ' (' + n.assetCode + ')';
      return '';
    }
    function renderNotifItem(n) {
      var unread = !n.read ? ' unread' : '';
      var repliesHtml = '';
      if (n.replies && n.replies.length > 0) {
        var expanded = expandedIds[n.id];
        var repliesList = n.replies.map(function (r) {
          return '<div class="notification-reply">' +
            '<div class="notification-reply-avatar">' + (r.userInitials || '') + '</div>' +
            '<div class="notification-reply-body">' +
            '<div class="notification-reply-header">' + (r.userName || '') + '</div>' +
            '<div class="notification-reply-message">' + (r.message || '') + '</div>' +
            '<div class="notification-reply-time">' + (r.timestamp || '') + '</div>' +
            '</div></div>';
        }).join('');
        repliesHtml = '<div class="notification-replies' + (expanded ? '' : '') + '" data-notif-id="' + n.id + '" style="display:' + (expanded ? 'block' : 'none') + '">' + repliesList + '</div>';
      }
      var repliesBadge = n.replies && n.replies.length > 0
        ? "<span class=\"notification-replies-badge\"><span class=\"material-icons-outlined\">reply</span> " + n.replies.length + " reply</span>"
        : "";
      return '<div class="notification-item' + unread + '" data-notif-id="' + n.id + '" data-read="' + n.read + '">' +
        '<div class="notification-avatar">' + (n.userInitials || '') + '</div>' +
        '<div class="notification-body">' +
        '<div class="notification-header">' +
        '<span class="notification-user">' + (n.userName || '') + '</span>' +
        '<span class="notification-action">' + getNotifActionText(n) + '</span>' +
        '<a href="' + getTargetHref(n) + '" class="notification-target" data-notif-id="' + n.id + '">' + getTargetLabel(n) + '</a>' +
        '</div>' +
        '<div class="notification-message">' + (n.message || '') + '</div>' +
        '<div class="notification-meta">' +
        '<span class="notification-time">' + (n.timestamp || '') + '</span>' +
        repliesBadge +
        '</div>' +
        repliesHtml +
        '</div>' +
        '<div class="notification-item-actions">' +
        '<button type="button" class="notification-action-btn" data-notif-id="' + n.id + '" data-action="view"><span class="material-icons-outlined">visibility</span> View</button>' +
        '<button type="button" class="notification-action-btn" data-notif-id="' + n.id + '" data-action="reply"><span class="material-icons-outlined">reply</span> Reply</button>' +
        '</div></div>';
    }

    var heroHtml = '<div class="notifications-hero">' +
      '<div class="notifications-hero-icon"><span class="material-icons-outlined">chat_bubble_outline</span></div>' +
      '<div class="notifications-hero-text">' +
      '<div class="notifications-hero-title">Communications</div>' +
      '<div class="notifications-hero-desc">Comments, mentions, and updates about defects and assets. Stay in sync with your team.</div>' +
      '</div></div>';

    var filterButtons = [
      { id: 'all', label: 'All', icon: 'inbox' },
      { id: 'defects', label: 'Defects', icon: 'warning_amber' },
      { id: 'assets', label: 'Assets', icon: 'view_in_ar' },
      { id: 'mentions', label: 'Mentions', icon: 'alternate_email' }
    ].map(function (f) {
      var active = f.id === notifFilter ? ' active' : '';
      return '<button type="button" class="notifications-filter-btn' + active + '" data-filter="' + f.id + '"><span class="material-icons-outlined">' + f.icon + '</span>' + f.label + '</button>';
    }).join('');

    var toolbarHtml = '<div class="notifications-toolbar">' +
      '<div class="notifications-filters" id="notif-filters">' + filterButtons + '</div>' +
      '<div class="notifications-actions">' +
      '<div class="search-compact" style="width:220px;"><span class="material-icons-outlined">search</span><input type="text" id="notif-search" placeholder="Search communications…"></div>' +
      '<button type="button" class="notifications-mark-read" id="notif-mark-all-read">Mark all as read</button>' +
      '</div></div>';

    function renderFeed() {
      var filtered = filterNotifs();
      var feedEl = document.getElementById('notif-feed');
      if (!feedEl) return;
      if (filtered.length === 0) {
        feedEl.innerHTML = '<div class="empty-state" style="padding:48px 24px;">' +
          '<div class="empty-state-icon"><span class="material-icons-outlined">notifications_none</span></div>' +
          '<div class="empty-state-title">No notifications</div>' +
          '<div class="empty-state-text">Try a different filter or search term.</div></div>';
        return;
      }
      feedEl.innerHTML = filtered.map(renderNotifItem).join('');
      feedEl.querySelectorAll('.notification-item').forEach(function (item) {
        var id = item.getAttribute('data-notif-id');
        item.addEventListener('click', function (e) {
          if (e.target.closest('.notification-action-btn') || e.target.closest('.notification-target')) return;
          var n = notifList.find(function (x) { return x.id === id; });
          if (n) n.read = true;
          item.classList.remove('unread');
          item.setAttribute('data-read', 'true');
          if (n && n.replies && n.replies.length > 0) {
            expandedIds[id] = !expandedIds[id];
            var repliesEl = item.querySelector('.notification-replies');
            if (repliesEl) repliesEl.style.display = expandedIds[id] ? 'block' : 'none';
          }
        });
      });
      feedEl.querySelectorAll('.notification-action-btn[data-action="view"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var id = btn.getAttribute('data-notif-id');
          var n = notifList.find(function (x) { return x.id === id; });
          if (n) {
            n.read = true;
            location.hash = getTargetHref(n);
          }
        });
      });
      feedEl.querySelectorAll('.notification-action-btn[data-action="reply"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var id = btn.getAttribute('data-notif-id');
          var n = notifList.find(function (x) { return x.id === id; });
          if (n) showToast('info', 'Reply', 'Reply will open a modal or inline composer when wired');
        });
      });
      feedEl.querySelectorAll('.notification-target').forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.stopPropagation();
          var id = this.getAttribute('data-notif-id');
          var n = notifList.find(function (x) { return x.id === id; });
          if (n) n.read = true;
        });
      });
    }

    content.innerHTML = heroHtml + toolbarHtml +
      '<div class="tasks-section" style="padding:0;border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--grey-200);">' +
      '<div class="notifications-feed" id="notif-feed">' + filterNotifs().map(renderNotifItem).join('') + '</div></div>';

    document.getElementById('notif-filters').addEventListener('click', function (e) {
      var btn = e.target.closest('.notifications-filter-btn');
      if (!btn) return;
      notifFilter = btn.getAttribute('data-filter');
      content.querySelectorAll('.notifications-filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderFeed();
    });
    var searchEl = document.getElementById('notif-search');
    if (searchEl) searchEl.addEventListener('input', function () { notifSearch = this.value || ''; renderFeed(); });
    document.getElementById('notif-mark-all-read').addEventListener('click', function () {
      notifList.forEach(function (n) { n.read = true; });
      renderFeed();
      showToast('success', 'Marked as read', 'All notifications have been marked as read.');
    });
    renderFeed();
  } else if (tab === 'users') {
    var tableId = 'settings-users-table';
    content.innerHTML =
      '<div class="user-mgmt-header">' +
      '<div class="user-mgmt-title"><span class="material-icons-outlined">people_outline</span> Active Users</div>' +
      '<div class="user-mgmt-actions">' +
      '<div class="search-compact" style="width:200px;"><span class="material-icons-outlined">search</span><input type="text" placeholder="Search" id="users-search"></div>' +
      '<button type="button" class="add-circle-btn" id="settings-add-member"><span class="material-icons-outlined">add</span></button>' +
      '</div></div>' +
      '<div id="' + tableId + '"></div>' +
      '<div class="settings-save-footer"><button type="button" class="btn btn-primary" id="settings-save-users">Save Changes</button></div>';

    function renderUsersTable() {
      var cols = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'lastname', label: 'Lastname', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'role', label: 'Role', sortable: true },
        { key: 'dateAdded', label: 'Date Added', sortable: true }
      ];
      renderDataTable({
        columns: cols,
        data: USERS.slice(),
        pageSize: 10,
        containerId: tableId,
        countLabel: 'Users',
        tableToolbar: false
      });
    }
    renderUsersTable();
    content.querySelector('#settings-add-member').addEventListener('click', function () {
      var roleOptions = ROLES.map(function (r) { return '<option value="' + r + '">' + r + '</option>'; }).join('');
      var modalHtml =
        '<div class="modal-centered-icon"><div class="modal-icon-circle"><span class="material-icons-outlined">person_add</span></div></div>' +
        '<div class="modal-header-centered"><div class="modal-title">Add a New Member</div><div class="modal-subtitle">Add a new team member with name, email and role.</div></div>' +
        '<div class="modal-body">' +
        '<div class="form-grid-2">' +
        '<div class="floating-input-group"><input type="text" class="floating-input" id="add-member-first" placeholder=" "><label class="floating-label">First Name</label></div>' +
        '<div class="floating-input-group"><input type="text" class="floating-input" id="add-member-last" placeholder=" "><label class="floating-label">Last Name</label></div>' +
        '</div>' +
        '<div class="floating-input-group"><input type="email" class="floating-input" id="add-member-email" placeholder=" "><label class="floating-label">Email</label></div>' +
        '<div class="floating-select-group">' +
        '<select class="floating-select" id="add-member-role">' + roleOptions + '</select>' +
        '<label class="floating-label">Role</label>' +
        '</div>' +
        '<div class="modal-footer-stacked">' +
        '<button type="button" class="btn btn-primary btn-full" id="add-member-submit">Add Member</button>' +
        '<button type="button" class="btn-cancel-text" data-dismiss="modal">Cancel</button>' +
        '</div></div>';
      showModal(modalHtml);
      document.getElementById('add-member-submit').addEventListener('click', function () {
        var first = (document.getElementById('add-member-first').value || '').trim();
        var last = (document.getElementById('add-member-last').value || '').trim();
        var email = (document.getElementById('add-member-email').value || '').trim();
        if (!first || !last || !email) return;
        var role = document.getElementById('add-member-role').value || ROLES[0];
        var today = new Date();
        var dateStr = (today.getDate() < 10 ? '0' : '') + today.getDate() + '/' + ((today.getMonth() + 1) < 10 ? '0' : '') + (today.getMonth() + 1) + '/' + today.getFullYear();
        USERS.push({ name: first, lastname: last, email: email, role: role, dateAdded: dateStr });
        hideModal();
        renderUsersTable();
        showToast('success', 'Member added', 'New team member has been added successfully');
      });
    });
    content.querySelector('#settings-save-users').addEventListener('click', function () {
      showToast('success', 'Changes saved', 'Your changes have been saved successfully');
    });
  } else if (tab === 'billing') {
    content.innerHTML = '<div class="settings-section"><p style="color:var(--grey-500);">Billing information will be available here.</p></div>';
  }
}

