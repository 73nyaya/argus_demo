/* global SITES, renderDashboard, renderSiteHome, renderAssets, renderAssetDetail, renderDefectDetail, renderDefects, renderTasks, renderSchedule, renderDocuments, renderAnalytics, renderResources, renderSettings, renderSHM */

function render404(container) {
  container.innerHTML = '<div class="page-title">Page not found</div><p>The requested page could not be found.</p>';
}

function updateSidebarActive(hash) {
  var nav = document.getElementById('sidebar-nav');
  if (!nav) return;
  nav.querySelectorAll('.sidebar-nav-item').forEach(function (el) { el.classList.remove('active'); });
  nav.querySelectorAll('.sidebar-sub-item').forEach(function (el) { el.classList.remove('active'); });
  nav.querySelectorAll('.sidebar-nav-item.expanded').forEach(function (el) { el.classList.remove('expanded'); });

  if (hash === 'dashboard' || hash === '') {
    var dashboard = nav.querySelector('[data-route="dashboard"]');
    if (dashboard) dashboard.classList.add('active');
    return;
  }
  if (hash === 'resources') {
    var resources = nav.querySelector('[data-route="resources"]');
    if (resources) resources.classList.add('active');
    return;
  }
  if (hash.indexOf('settings/') === 0) {
    var settings = nav.querySelector('[data-route="settings"]');
    if (settings) settings.classList.add('active');
    return;
  }
  var siteMatch = hash.match(/^site\/([\w-]+)/);
  if (siteMatch) {
    var slug = siteMatch[1];
    var sitesItem = nav.querySelector('[data-route="sites"]');
    if (sitesItem) {
      sitesItem.classList.add('expanded');
      sitesItem.classList.remove('active');
    }
    var sub = nav.querySelector('.sidebar-sub-item[data-slug="' + slug + '"]');
    if (sub) sub.classList.add('active');
  }
}

function handleRoute() {
  var hash = (location.hash || '#').slice(1) || 'dashboard';
  var main = document.getElementById('main-content');
  var footer = document.getElementById('footer-bar');
  if (!main) return;

  if (footer) footer.style.display = hash.indexOf('site/') === 0 ? 'flex' : 'none';

  updateSidebarActive(hash);

  if (hash === 'dashboard') {
    if (typeof renderDashboard === 'function') {
      renderDashboard(main);
    } else {
      main.innerHTML = '<div class="page-title">Dashboard</div><p>Dashboard could not load. Ensure <code>js/dashboard.js</code> is loading (check Network tab for 404).</p>';
    }
    return;
  }

  var siteMatch = hash.match(/^site\/([\w-]+)\/([\w-]+)(?:\/([\w.]+))?$/);
  if (siteMatch) {
    var slug = siteMatch[1];
    var page = siteMatch[2];
    var param = siteMatch[3];
    var sites = typeof SITES !== 'undefined' ? SITES : {};
    if (!sites[slug]) {
      render404(main);
      return;
    }
    switch (page) {
      case 'home':
        if (typeof renderSiteHome === 'function') {
          renderSiteHome(main, slug);
        } else {
          main.innerHTML = '<div class="page-title">Site Home</div><p>Could not load. Ensure <code>js/views-bundle.js</code> loads (check Network tab for 404).</p>';
        }
        return;
      case 'assets':
        if (param) {
          renderAssetDetail(main, slug, param);
        } else {
          renderAssets(main, slug);
        }
        return;
      case 'defect':
        if (param && typeof renderDefectDetail === 'function') {
          renderDefectDetail(main, slug, param);
        } else {
          render404(main);
        }
        return;
      case 'defects':
        renderDefects(main, slug);
        return;
      case 'defect-analysis':
        if (typeof renderDefectAnalysis === 'function') {
          renderDefectAnalysis(main, slug);
        } else {
          main.innerHTML = '<div class="page-title">Defect Analysis</div><p>Could not load. Ensure <code>js/views/defectAnalysis.js</code> loads (check Network tab for 404).</p>';
        }
        return;
      case 'tasks':
        renderTasks(main, slug);
        return;
      case 'schedule':
        renderSchedule(main, slug);
        return;
      case 'documents':
        renderDocuments(main, slug);
        return;
      case 'analytics':
        if (typeof renderAnalytics === 'function') {
          renderAnalytics(main, slug);
        } else {
          main.innerHTML = '<div class="page-title">Analytics</div><p>Could not load. Ensure <code>js/views-bundle.js</code> loads (check Network tab for 404).</p>';
        }
        return;
      case 'shm':
        if (typeof renderSHM === 'function') {
          renderSHM(main, slug);
        } else {
          main.innerHTML = '<div class="page-title">SHM</div><p>Could not load. Ensure <code>js/views-bundle.js</code> loads (check Network tab for 404).</p>';
        }
        return;
    }
  }

  if (hash === 'resources') {
    if (typeof renderResources === 'function') {
      renderResources(main);
    } else {
      main.innerHTML = '<div class="page-title">Resources</div><p>Could not load. Ensure <code>js/views-bundle.js</code> loads (check Network tab for 404).</p>';
    }
    return;
  }

  var settingsMatch = hash.match(/^settings\/(\w+)$/);
  if (settingsMatch) {
    if (typeof renderSettings === 'function') {
      renderSettings(main, settingsMatch[1]);
    } else {
      main.innerHTML = '<div class="page-title">Settings</div><p>Could not load. Ensure <code>js/views-bundle.js</code> loads (check Network tab for 404).</p>';
    }
    return;
  }

  render404(main);
}

window.addEventListener('hashchange', handleRoute);
window.handleRoute = handleRoute;
