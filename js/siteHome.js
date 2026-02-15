/* global SITES, ASSETS, DEFECTS, renderSiteTabs, renderStatusProgressBar, renderMultiProgressBar, remediationRateClass */

function remediationRateClass(rate) {
  if (rate < 30) return 'rate-low';
  if (rate <= 70) return 'rate-medium';
  return 'rate-high';
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
