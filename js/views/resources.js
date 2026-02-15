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
        if (r) showToast('info', 'Opening resource', (r.title || '') + ' — links can be wired to real URLs or modals.');
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
