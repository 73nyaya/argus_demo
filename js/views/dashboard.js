/* global SITES, ASSETS, DEFECTS, renderRiskBadge, renderStatusProgressBar, renderSiteTabs, renderDataTable, renderPagination, showToast, AppState */

function remediationRateClass(rate) {
  if (rate < 30) return 'rate-low';
  if (rate <= 70) return 'rate-medium';
  return 'rate-high';
}

function renderDashboard(container) {
  var sites = typeof SITES !== 'undefined' ? SITES : {};
  var slugOrder = Object.keys(sites);
  var siteCardsHtml = slugOrder.map(function (slug) {
    var site = sites[slug];
    var rate = site.remediationRate;
    var rateClass = remediationRateClass(rate);
    var defectsList = (typeof DEFECTS !== 'undefined' && DEFECTS[slug]) ? DEFECTS[slug] : [];
    var topDefects = defectsList.slice().sort(function (a, b) { return (b.riskScore || 0) - (a.riskScore || 0); }).slice(0, 3);
    var defectRows = topDefects.map(function (d) {
      return '<tr><td><a href="#site/' + slug + '/assets/' + d.assetCode + '" class="defect-link">' + d.id + '</a></td><td>' + (d.type || '') + '</td><td>' + (d.asset || '') + '</td><td>' + renderRiskBadge(d.riskLevel, d.riskScore) + '</td></tr>';
    }).join('');
    return '<div class="site-summary-card">' +
      '<div class="site-summary-header">' +
      '<div class="site-summary-name">' + site.name + '</div>' +
      '<div class="site-summary-actions">' +
      '<div class="year-dropdown">' + (site.year || 2026) + ' <span class="material-icons-outlined">expand_more</span></div>' +
      '<a href="#site/' + slug + '/home" class="arrow-link"><span class="material-icons-outlined">arrow_forward</span></a>' +
      '</div></div>' +
      '<div class="kpi-row">' +
      '<div class="kpi-item"><div class="kpi-label">Remediation Rate</div><div class="kpi-value ' + rateClass + '">' + rate + '%</div></div>' +
      '<div class="kpi-item"><div class="kpi-label">Assets</div><div class="kpi-value">' + (typeof ASSETS !== 'undefined' && ASSETS[slug] ? ASSETS[slug].length : 0) + '</div></div>' +
      '<div class="kpi-item"><div class="kpi-label">Total Defects</div><div class="kpi-value">' + site.totalDefects + '</div></div>' +
      '</div>' +
      '<div class="defects-status">' +
      '<div class="defects-status-header">' +
      '<div class="defects-status-title">Defects Status</div>' +
      '<div class="defects-status-legend">' +
      '<span><span class="legend-dot closed"></span> Closed: ' + site.closedDefects + '</span>' +
      '<span><span class="legend-dot open"></span> Open: ' + site.openDefects + '</span>' +
      '</div></div>' +
      renderStatusProgressBar(rate) +
      '</div>' +
      '<table class="mini-table"><thead><tr><th>Defect ID</th><th>Type</th><th>Asset</th><th>Risk</th></tr></thead><tbody>' + defectRows + '</tbody></table>' +
      '</div>';
  }).join('');

  var tasksSlug = slugOrder[0];
  var defectsForTasks = (typeof DEFECTS !== 'undefined' && DEFECTS[tasksSlug]) ? DEFECTS[tasksSlug] : [];
  var tasksData = defectsForTasks.filter(function (d) { return d.status !== 'Completed/Closed'; });
  var tasksTableId = 'dashboard-tasks-table';

  var html = '<h1 class="page-title">Dashboard</h1>' +
    '<div class="site-summary-grid">' + siteCardsHtml + '</div>' +
    '<div class="tasks-section">' +
    '<div class="tasks-header">' +
    '<div class="tasks-title">Tasks</div>' +
    '<div class="tasks-header-actions">' +
    '<div class="search-compact"><span class="material-icons-outlined">search</span><input type="text" placeholder="Search tasks" id="dashboard-tasks-search" style="border:none;background:transparent;width:100%;"></div>' +
    '<a href="#site/' + tasksSlug + '/tasks" class="arrow-circle-btn"><span class="material-icons-outlined" style="font-size:18px;">arrow_forward</span></a>' +
    '</div></div>' +
    '<div class="mine-tabs" id="dashboard-mine-tabs">' +
    slugOrder.map(function (s, i) {
      return '<div class="mine-tab' + (i === 0 ? ' active' : '') + '" data-dashboard-site="' + s + '">' + (sites[s] && sites[s].name || s) + '</div>';
    }).join('') +
    '</div>' +
    '<div id="' + tasksTableId + '"></div>' +
    '</div>';

  container.innerHTML = html;

  var tableContainer = document.getElementById(tasksTableId);
  var searchInput = document.getElementById('dashboard-tasks-search');
  var currentTasksSlug = tasksSlug;

  function getTasksRows() {
    var list = (typeof DEFECTS !== 'undefined' && DEFECTS[currentTasksSlug] ? DEFECTS[currentTasksSlug] : []).filter(function (d) { return d.status !== 'Completed/Closed'; });
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
      { key: 'id', label: 'Defect ID', sortable: true, format: function (v, row) { return '<a href="#site/' + currentTasksSlug + '/assets/' + row.assetCode + '" class="defect-id-link">' + (v || '') + '</a>'; } },
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
}
</think>
Fixing dashboard.js: removing the duplicate block and using `renderStatusIndicator` from the global scope.
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace