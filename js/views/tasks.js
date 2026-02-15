/* global SITES, DEFECTS, renderSiteTabs, renderRiskBadge, renderStatusIndicator, renderDataTable, showToast */

function renderTasks(container, slug) {
  var site = SITES[slug];
  if (!site) return;
  var data = (DEFECTS[slug] || []).filter(function (d) { return d.status !== 'Completed/Closed'; });
  var tableId = 'tasks-table';

  var cols = [
    { key: 'id', label: 'Defect ID', sortable: true, format: function (v, row) { return '<a href="#site/' + slug + '/assets/' + row.assetCode + '" class="defect-id-link">' + (v || '') + '</a>'; } },
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
