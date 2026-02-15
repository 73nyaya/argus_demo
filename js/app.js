/* global CURRENT_USER, SITES, handleRoute, showToast */

document.addEventListener('DOMContentLoaded', function () {
  var sidebarNav = document.getElementById('sidebar-nav');
  if (sidebarNav) {
    sidebarNav.innerHTML =
      '<a href="#dashboard" class="sidebar-nav-item" data-route="dashboard">' +
      '<span class="material-icons-outlined">dashboard</span> Dashboard</a>' +
      '<div class="sidebar-nav-item" data-route="sites" id="sidebar-sites">' +
      '<span class="material-icons-outlined">location_on</span> Sites' +
      '<span class="material-icons-outlined expand-icon">expand_more</span></div>' +
      '<div class="sidebar-sub-items" id="sidebar-sub-items"></div>' +
      '<a href="#resources" class="sidebar-nav-item" data-route="resources">' +
      '<span class="material-icons-outlined">folder_open</span> Resources</a>';
    var subContainer = document.getElementById('sidebar-sub-items');
    if (subContainer) {
      var sites = typeof SITES !== 'undefined' ? SITES : (window.SITES || {});
      Object.keys(sites).forEach(function (slug) {
        var site = sites[slug];
        var a = document.createElement('a');
        a.href = '#site/' + slug + '/home';
        a.className = 'sidebar-sub-item';
        a.setAttribute('data-slug', slug);
        a.textContent = site.name;
        subContainer.appendChild(a);
      });
    }
    var sitesItem = document.getElementById('sidebar-sites');
    if (sitesItem) {
      sitesItem.addEventListener('click', function () {
        this.classList.toggle('expanded');
      });
    }
  }

  var userAvatar = document.getElementById('sidebar-user-avatar');
  var userName = document.getElementById('sidebar-user-name');
  var userEmail = document.getElementById('sidebar-user-email');
  if (userAvatar && CURRENT_USER) {
    userAvatar.innerHTML = CURRENT_USER.initials || (CURRENT_USER.name && CURRENT_USER.name.charAt(0)) || '?';
  }
  if (userName && CURRENT_USER) userName.textContent = CURRENT_USER.name + ' ' + (CURRENT_USER.lastname || '');
  if (userEmail && CURRENT_USER) userEmail.textContent = CURRENT_USER.email || '';

  document.getElementById('topbar-create-ticket') && document.getElementById('topbar-create-ticket').addEventListener('click', function () {
    if (typeof openCreateTicketModal === 'function') openCreateTicketModal();
  });
  document.getElementById('footer-comments') && document.getElementById('footer-comments').addEventListener('click', function () {
    if (typeof openSiteCommentsModal === 'function') openSiteCommentsModal();
  });
  document.getElementById('footer-ai') && document.getElementById('footer-ai').addEventListener('click', function () {
    if (typeof openAIAssistantModal === 'function') openAIAssistantModal();
  });

  handleRoute();
});
