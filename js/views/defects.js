/* global SITES, DEFECTS, renderSiteTabs, renderRiskBadge, renderStatusIndicator, renderDataTable */

function renderDefects(container, slug) {
  var site = SITES[slug];
  if (!site) return;
  var data = DEFECTS[slug] || [];
  var tableId = 'defects-table';

  var cols = [
    { key: 'id', label: 'Defect ID', sortable: true, format: function (v, row) { return '<a href="#site/' + slug + '/assets/' + row.assetCode + '" class="defect-id-link">' + (v || '') + '</a>'; } },
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
