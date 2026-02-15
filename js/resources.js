/* global renderEmptyState */

function renderResources(container) {
  container.innerHTML = '<h1 class="page-title">Resources</h1>' +
    '<div class="tasks-section">' +
    renderEmptyState('library_books', 'Resources', 'Shared resources and documentation will be available here.') +
    '</div>';
}
