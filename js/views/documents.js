/* global SITES, renderSiteTabs, renderEmptyState */

function renderDocuments(container, slug) {
  var site = SITES[slug];
  if (!site) return;
  container.innerHTML = renderSiteTabs(slug, 'documents') +
    '<div class="tasks-section">' +
    renderEmptyState('folder_open', 'No documents uploaded', 'Upload documents for this site.') +
    '</div>';
}
