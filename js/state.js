// Manages current UI state. Syncs to localStorage on change.
const AppState = {
  assetsViewMode: localStorage.getItem('argus_assets_view') || 'grid',
  twoFactorEnabled: JSON.parse(localStorage.getItem('argus_2fa') || 'false'),

  setAssetsView(mode) {
    this.assetsViewMode = mode;
    localStorage.setItem('argus_assets_view', mode);
  },

  setTwoFactor(enabled) {
    this.twoFactorEnabled = enabled;
    localStorage.setItem('argus_2fa', JSON.stringify(enabled));
  },

  getTodoState(todoId) {
    return JSON.parse(localStorage.getItem('argus_todo_' + todoId) || 'null');
  },

  setTodoState(todoId, done) {
    localStorage.setItem('argus_todo_' + todoId, JSON.stringify(done));
  },

  getDashboardYear(slug) {
    var y = parseInt(localStorage.getItem('argus_dashboard_year_' + slug), 10);
    return (y >= 2023 && y <= 2026) ? y : 2026;
  },

  setDashboardYear(slug, year) {
    localStorage.setItem('argus_dashboard_year_' + slug, String(year));
  }
};
