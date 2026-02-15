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
    { key: 'id', label: 'Defect ID', sortable: true },
    { key: 'type', label: 'Type', sortable: true, filterable: true },
    { key: 'asset', label: 'Asset', sortable: true },
    { key: 'riskLevel', label: 'Risk', sortable: true, format: function (v, row) { return renderRiskBadge(row.riskLevel, row.riskScore); } },
    { key: 'status', label: 'Status', sortable: true, format: function (v, row) { return renderStatusIndicator(row.status); } },
    { key: 'targetDate', label: 'Target Date', sortable: true }
  ];
  renderDataTable({ columns: cols, data: defects, pageSize: 10, containerId: tableId, countLabel: 'Defects', tableToolbar: false });
}
