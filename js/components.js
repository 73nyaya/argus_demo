/* global CURRENT_USER, AppState, renderSettings */

// Status → dot class mapping (from brief)
const STATUS_DOT_MAP = {
  'Not Status Set': 'not-set',
  'Not Actioned': 'not-actioned',
  'In Progress': 'in-progress',
  'Work Order Created': 'work-order',
  'Notification Raised': 'in-progress',
  'Work Completed': 'completed',
  'Completed/Closed': 'completed'
};

function renderRiskBadge(riskLevel, riskScore) {
  const label = (riskLevel === 'very-high' ? 'Very High' : riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)) + ' ' + (riskScore != null ? riskScore : '');
  return '<span class="risk-badge ' + riskLevel + '">' + label + '</span>';
}

function renderStatusIndicator(status) {
  const dotClass = STATUS_DOT_MAP[status] || 'not-set';
  return '<span class="status-indicator"><span class="status-dot ' + dotClass + '"></span> ' + (status || '') + '</span>';
}

function renderProgressBar(percent) {
  return '<div class="progress-bar"><div class="progress-fill" style="width:' + Math.min(100, Math.max(0, percent)) + '%"></div></div>';
}

function renderStatusProgressBar(percent) {
  var p = Math.min(100, Math.max(0, percent));
  return '<div class="status-progress-bar"><div class="status-progress-fill" style="width:' + p + '%">' + p + '%</div></div>';
}

function renderMultiProgressBar(segments) {
  // segments: [{ label, percent, class }] e.g. [{ label: '25%', percent: 25, class: 'not-started' }, ...]
  var html = '<div class="multi-progress-bar">';
  segments.forEach(function (s) {
    html += '<div class="multi-progress-segment ' + (s.class || '') + '" style="width:' + (s.percent || 0) + '%">' + (s.label || s.percent + '%') + '</div>';
  });
  html += '</div>';
  return html;
}

function renderEmptyState(icon, title, text, buttonText, buttonAction) {
  var btn = '';
  if (buttonText) {
    var action = buttonAction ? ' onclick="' + buttonAction + '"' : '';
    btn = '<button type="button" class="btn btn-primary"' + action + '>' + buttonText + '</button>';
  }
  return '<div class="empty-state">' +
    '<div class="empty-state-icon"><span class="material-icons-outlined">' + icon + '</span></div>' +
    '<div class="empty-state-title">' + title + '</div>' +
    '<div class="empty-state-text">' + text + '</div>' +
    btn +
    '</div>';
}

function renderSiteTabs(slug, activeTab) {
  var tabs = [
    { id: 'home', label: 'Home' },
    { id: 'assets', label: 'Assets' },
    { id: 'defects', label: 'Defects' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'documents', label: 'Documents' },
    { id: 'analytics', label: 'Analytics' }
  ];
  var html = '<div class="site-tabs">';
  tabs.forEach(function (t) {
    var active = t.id === activeTab ? ' active' : '';
    html += '<a href="#site/' + slug + '/' + t.id + '" class="site-tab' + active + '">' + t.label + '</a>';
  });
  html += '</div>';
  return html;
}

function renderSettingsTabs(activeTab) {
  var tabs = [
    { id: 'account', label: 'My Account' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'users', label: 'User Management' },
    { id: 'billing', label: 'Billing' }
  ];
  var html = '<div class="settings-tabs">';
  tabs.forEach(function (t) {
    var active = t.id === activeTab ? ' active' : '';
    html += '<a href="#settings/' + t.id + '" class="settings-tab' + active + '">' + t.label + '</a>';
  });
  html += '</div>';
  return html;
}

function showToast(type, title, message) {
  var container = document.getElementById('toast-container');
  if (!container) return;
  var icon = type === 'success' ? 'check' : type === 'error' ? 'close' : 'warning';
  var el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.innerHTML = '<div class="toast-icon"><span class="material-icons-outlined">' + icon + '</span></div>' +
    '<div class="toast-content"><div class="toast-title">' + title + '</div><div class="toast-message">' + message + '</div></div>';
  container.appendChild(el);
  setTimeout(function () {
    el.classList.add('toast-exit');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 200);
  }, 3000);
}

function showModal(contentHtml) {
  var backdrop = document.getElementById('modal-backdrop');
  var container = document.getElementById('modal-container');
  if (!backdrop || !container) return;
  container.innerHTML = contentHtml;
  backdrop.style.display = 'flex';
  container.style.display = 'block';
  function close() {
    backdrop.style.display = 'none';
    container.style.display = 'none';
    container.innerHTML = '';
    backdrop.removeEventListener('click', close);
  }
  backdrop.addEventListener('click', close);
  container.addEventListener('click', function (e) { e.stopPropagation(); });
  // Close on Cancel / buttons with data-dismiss="modal"
  container.addEventListener('click', function (e) {
    if (e.target.closest('[data-dismiss="modal"]')) close();
  });
}

function hideModal() {
  var backdrop = document.getElementById('modal-backdrop');
  var container = document.getElementById('modal-container');
  if (backdrop) backdrop.style.display = 'none';
  if (container) {
    container.style.display = 'none';
    container.innerHTML = '';
  }
}

window.showModal = showModal;
window.hideModal = hideModal;

// Create Ticket modal — form for contacting Mincka Engineering
function renderCreateTicketModal() {
  var user = typeof CURRENT_USER !== 'undefined' ? CURRENT_USER : {};
  var fullName = [user.name, user.lastname].filter(Boolean).join(' ') || '';
  var email = user.email || '';

  return '<div class="modal" style="max-width:520px;">' +
    '<div class="modal-header-row" style="padding:20px 24px;border-bottom:1px solid var(--grey-200);">' +
    '<h2 class="modal-title" style="margin:0;font-size:18px;">Contact Mincka Engineering</h2>' +
    '<button type="button" class="modal-close-btn" data-dismiss="modal" aria-label="Close">' +
    '<span class="material-icons-outlined">close</span></button>' +
    '</div>' +
    '<form id="create-ticket-form" class="modal-body" style="padding:24px;">' +
    '<div class="input-group">' +
    '<label class="input-label" for="ticket-name">Your name</label>' +
    '<input type="text" id="ticket-name" name="name" class="input" placeholder="e.g. John Smith" value="' + escapeHtml(fullName) + '" required>' +
    '</div>' +
    '<div class="input-group">' +
    '<label class="input-label" for="ticket-email">Email</label>' +
    '<input type="email" id="ticket-email" name="email" class="input" placeholder="you@company.com" value="' + escapeHtml(email) + '" required>' +
    '</div>' +
    '<div class="input-group">' +
    '<label class="input-label" for="ticket-category">Category</label>' +
    '<select id="ticket-category" name="category" class="input" required>' +
    '<option value="">Select a category</option>' +
    '<option value="support">Technical support</option>' +
    '<option value="bug">Bug report</option>' +
    '<option value="feature">Feature request</option>' +
    '<option value="general">General inquiry</option>' +
    '</select>' +
    '</div>' +
    '<div class="input-group">' +
    '<label class="input-label" for="ticket-subject">Subject</label>' +
    '<input type="text" id="ticket-subject" name="subject" class="input" placeholder="Brief description of your request" required>' +
    '</div>' +
    '<div class="input-group">' +
    '<label class="input-label" for="ticket-message">Message</label>' +
    '<textarea id="ticket-message" name="message" class="input" rows="5" placeholder="Provide more details..." required style="resize:vertical;min-height:100px;"></textarea>' +
    '</div>' +
    '<div style="display:flex;gap:12px;margin-top:24px;">' +
    '<button type="submit" class="btn btn-primary btn-full">Submit ticket</button>' +
    '<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>' +
    '</div>' +
    '</form>' +
    '</div>';
}

function renderCreateTicketSuccessState() {
  return '<div class="modal" style="max-width:520px;">' +
    '<div class="modal-centered-icon">' +
    '<div class="modal-icon-circle" style="background:var(--success-light);">' +
    '<span class="material-icons-outlined" style="color:var(--success);">check_circle</span>' +
    '</div></div>' +
    '<div class="modal-header-centered">' +
    '<h2 class="modal-title">Sent successfully</h2>' +
    '<p class="modal-subtitle">Thank you for contacting Mincka Engineering. We will get back to you shortly.</p>' +
    '</div>' +
    '<div class="modal-footer-stacked">' +
    '<button type="button" class="btn btn-primary btn-full" data-dismiss="modal">Done</button>' +
    '</div>' +
    '</div>';
}

function openCreateTicketModal() {
  var html = renderCreateTicketModal();
  showModal(html);

  var form = document.getElementById('create-ticket-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var container = document.getElementById('modal-container');
      if (container) container.innerHTML = renderCreateTicketSuccessState();
    });
  }
}

window.openCreateTicketModal = openCreateTicketModal;

// Site Comments modal — dummy list + post (demo)
var DUMMY_SITE_COMMENTS = [
  { author: 'Sarah Chen', time: '2 hours ago', text: 'Can we get an update on the inspection schedule for Block B?' },
  { author: 'James Wilson', time: '5 hours ago', text: 'The defect photos from last week have been reviewed. All clear.' },
  { author: 'Maria Garcia', time: 'Yesterday', text: 'Thanks for uploading the new asset list. Much easier to track now.' },
  { author: 'Alex Kim', time: '2 days ago', text: 'Reminder: site walk scheduled for Thursday 9am.' }
];

function renderSiteCommentsModal() {
  var commentsHtml = DUMMY_SITE_COMMENTS.map(function (c) {
    return '<div class="site-comment-item">' +
      '<div class="site-comment-meta">' +
      '<span class="site-comment-author">' + escapeHtml(c.author) + '</span>' +
      '<span class="site-comment-time">' + escapeHtml(c.time) + '</span>' +
      '</div>' +
      '<div class="site-comment-text">' + escapeHtml(c.text) + '</div>' +
      '</div>';
  }).join('');
  return '<div class="modal site-comments-modal" style="max-width:480px;">' +
    '<div class="modal-header-row" style="padding:20px 24px;border-bottom:1px solid var(--grey-200);">' +
    '<h2 class="modal-title" style="margin:0;font-size:18px;">Site Comments</h2>' +
    '<button type="button" class="modal-close-btn" data-dismiss="modal" aria-label="Close">' +
    '<span class="material-icons-outlined">close</span></button>' +
    '</div>' +
    '<div class="site-comments-list" style="max-height:320px;overflow-y:auto;padding:16px 24px;">' + commentsHtml + '</div>' +
    '<div class="site-comments-footer" style="padding:16px 24px;border-top:1px solid var(--grey-200);">' +
    '<textarea id="site-comment-input" class="input" rows="2" placeholder="Write a comment..." style="resize:vertical;min-height:60px;margin-bottom:12px;"></textarea>' +
    '<button type="button" class="btn btn-primary" id="site-comment-post">Post comment</button>' +
    '</div>' +
    '</div>';
}

function openSiteCommentsModal() {
  var html = renderSiteCommentsModal();
  showModal(html);
  var listEl = document.querySelector('.site-comments-list');
  var inputEl = document.getElementById('site-comment-input');
  var postBtn = document.getElementById('site-comment-post');
  if (postBtn && listEl && inputEl) {
    postBtn.addEventListener('click', function () {
      var text = (inputEl.value || '').trim();
      if (!text) {
        if (typeof showToast === 'function') showToast('warning', 'Empty comment', 'Type something to post.');
        return;
      }
      var user = typeof CURRENT_USER !== 'undefined' ? CURRENT_USER : {};
      var author = [user.name, user.lastname].filter(Boolean).join(' ') || 'You';
      var newHtml = '<div class="site-comment-item">' +
        '<div class="site-comment-meta">' +
        '<span class="site-comment-author">' + escapeHtml(author) + '</span>' +
        '<span class="site-comment-time">Just now</span>' +
        '</div>' +
        '<div class="site-comment-text">' + escapeHtml(text) + '</div>' +
        '</div>';
      listEl.insertAdjacentHTML('afterbegin', newHtml);
      inputEl.value = '';
      if (typeof showToast === 'function') showToast('success', 'Comment posted', 'This is a demo — your comment is shown above.');
    });
  }
}

window.openSiteCommentsModal = openSiteCommentsModal;

// AI Assistant modal — dummy chat (demo)
var AI_SUGGESTIONS = [
  'Summarize defects for this site',
  'What are my next tasks?',
  'Give me a site overview',
  'Help with assets'
];
var AI_DEMO_REPLIES = [
  'This is a demo assistant. In the full version I could summarize defects, filter by status, and suggest priorities based on risk.',
  'I\'d look up your tasks and deadlines. For now, check the Tasks tab on this site for the full list.',
  'I can provide an overview of assets, defects, and schedule once connected to live data. Try the Home tab for a quick summary.',
  'Asset help is coming soon — you can browse and filter assets in the Assets tab in the meantime.'
];

function renderAIAssistantModal() {
  var welcome = 'Hi! I\'m the Argus AI assistant (demo). Try a suggestion below or ask anything — I\'ll give a sample response.';
  var suggestionsHtml = AI_SUGGESTIONS.map(function (s) {
    return '<button type="button" class="ai-suggestion-chip" data-ai-suggestion="' + escapeHtml(s) + '">' + escapeHtml(s) + '</button>';
  }).join('');
  return '<div class="modal ai-assistant-modal" style="max-width:520px;">' +
    '<div class="modal-header-row" style="padding:20px 24px;border-bottom:1px solid var(--grey-200);">' +
    '<h2 class="modal-title" style="margin:0;font-size:18px;">AI Assistance</h2>' +
    '<button type="button" class="modal-close-btn" data-dismiss="modal" aria-label="Close">' +
    '<span class="material-icons-outlined">close</span></button>' +
    '</div>' +
    '<div class="ai-chat-area" id="ai-chat-area" style="max-height:320px;overflow-y:auto;padding:16px 24px;">' +
    '<div class="ai-message ai-message-bot">' +
    '<span class="ai-message-avatar"><span class="material-icons-outlined">smart_toy</span></span>' +
    '<div class="ai-message-bubble">' + escapeHtml(welcome) + '</div>' +
    '</div>' +
    '</div>' +
    '<div class="ai-suggestions" style="padding:0 24px 12px;">' + suggestionsHtml + '</div>' +
    '<div class="ai-input-row" style="padding:12px 24px 24px;display:flex;gap:12px;align-items:flex-end;">' +
    '<textarea id="ai-user-input" class="input" rows="2" placeholder="Ask something..." style="flex:1;resize:vertical;min-height:44px;"></textarea>' +
    '<button type="button" class="btn btn-primary" id="ai-send-btn" style="flex-shrink:0;">Send</button>' +
    '</div>' +
    '</div>';
}

function appendAIMessage(container, isUser, text) {
  if (!container || !text) return;
  var html = isUser
    ? '<div class="ai-message ai-message-user"><div class="ai-message-bubble">' + escapeHtml(text) + '</div></div>'
    : '<div class="ai-message ai-message-bot">' +
      '<span class="ai-message-avatar"><span class="material-icons-outlined">smart_toy</span></span>' +
      '<div class="ai-message-bubble">' + escapeHtml(text) + '</div></div>';
  container.insertAdjacentHTML('beforeend', html);
  container.scrollTop = container.scrollHeight;
}

function getRandomDemoReply() {
  return AI_DEMO_REPLIES[Math.floor(Math.random() * AI_DEMO_REPLIES.length)];
}

function openAIAssistantModal() {
  var html = renderAIAssistantModal();
  showModal(html);
  var chatArea = document.getElementById('ai-chat-area');
  var inputEl = document.getElementById('ai-user-input');
  var sendBtn = document.getElementById('ai-send-btn');

  function sendUserMessage(text) {
    var t = (text || '').trim();
    if (!t) return;
    appendAIMessage(chatArea, true, t);
    if (inputEl) inputEl.value = '';
    // Dummy: show "typing" then a canned reply
    var typing = document.createElement('div');
    typing.className = 'ai-message ai-message-bot ai-typing';
    typing.innerHTML = '<span class="ai-message-avatar"><span class="material-icons-outlined">smart_toy</span></span><div class="ai-message-bubble">Thinking...</div>';
    chatArea.appendChild(typing);
    chatArea.scrollTop = chatArea.scrollHeight;
    setTimeout(function () {
      typing.remove();
      appendAIMessage(chatArea, false, getRandomDemoReply());
    }, 800);
  }

  if (sendBtn && inputEl) {
    sendBtn.addEventListener('click', function () { sendUserMessage(inputEl.value); });
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage(inputEl.value);
      }
    });
  }
  document.querySelectorAll('.ai-suggestion-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      sendUserMessage(this.getAttribute('data-ai-suggestion'));
    });
  });
}

window.openAIAssistantModal = openAIAssistantModal;

// Build pagination HTML (view attaches listeners or uses event delegation)
function renderPagination(currentPage, totalPages, pageSize, total, sizeOptions) {
  sizeOptions = sizeOptions || [5, 10, 25];
  var start = (currentPage - 1) * pageSize + 1;
  var end = Math.min(currentPage * pageSize, total);
  var info = total === 0 ? '0 to 0 of 0' : start + ' to ' + end + ' of ' + total;
  var firstDisabled = currentPage <= 1 ? ' disabled' : '';
  var prevDisabled = currentPage <= 1 ? ' disabled' : '';
  var nextDisabled = currentPage >= totalPages || totalPages === 0 ? ' disabled' : '';
  var lastDisabled = currentPage >= totalPages || totalPages === 0 ? ' disabled' : '';
  var options = sizeOptions.map(function (n) {
    return '<option value="' + n + '"' + (n === pageSize ? ' selected' : '') + '>' + n + '</option>';
  }).join('');
  return '<div class="pagination" data-pagination>'
    + '<div class="pagination-size">'
    + '<span class="pagination-size-label">Page Size:</span>'
    + '<select class="pagination-size-select" data-page-size>' + options + '</select>'
    + '</div>'
    + '<span class="pagination-info">' + info + '</span>'
    + '<div class="pagination-nav">'
    + '<button type="button" class="pagination-nav-btn' + firstDisabled + '" data-page="1" title="First"><span class="material-icons-outlined">first_page</span></button>'
    + '<button type="button" class="pagination-nav-btn' + prevDisabled + '" data-page="' + (currentPage - 1) + '" title="Previous"><span class="material-icons-outlined">chevron_left</span></button>'
    + '<span class="pagination-text">Page ' + currentPage + ' of ' + (totalPages || 1) + '</span>'
    + '<button type="button" class="pagination-nav-btn' + nextDisabled + '" data-page="' + (currentPage + 1) + '" title="Next"><span class="material-icons-outlined">chevron_right</span></button>'
    + '<button type="button" class="pagination-nav-btn' + lastDisabled + '" data-page="' + totalPages + '" title="Last"><span class="material-icons-outlined">last_page</span></button>'
    + '</div>'
    + '</div>';
}

// Full data table: renders into containerId, supports sort, filter (Type column), pagination, search.
// config: { columns: [{ key, label, sortable?, filterable? }], data: [], pageSize: 5, containerId: string, searchPlaceholder?, countLabel?, onRowClick? }
// filterable column: key used for filter options; filter values derived from data.
function renderDataTable(config) {
  var columns = config.columns || [];
  var data = config.data || [];
  var pageSize = Math.max(1, config.pageSize || 10);
  var containerId = config.containerId;
  var container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return;

  var state = {
    page: 1,
    pageSize: pageSize,
    sortKey: null,
    sortDir: 1,
    search: '',
    typeFilter: null
  };

  function getFilterOptions() {
    var key = columns.find(function (c) { return c.filterable; });
    if (!key) return [];
    key = key.key;
    var set = {};
    data.forEach(function (row) {
      var v = row[key];
      if (v != null && v !== '') set[v] = true;
    });
    return Object.keys(set).sort();
  }

  function filterAndSortRows() {
    var rows = data.slice();
    if (state.search) {
      var q = state.search.toLowerCase();
      rows = rows.filter(function (r) {
        return columns.some(function (col) {
          var v = r[col.key];
          return v != null && String(v).toLowerCase().indexOf(q) !== -1;
        });
      });
    }
    if (state.typeFilter && state.typeFilter.length) {
      var filterCol = columns.find(function (c) { return c.filterable; });
      if (filterCol) {
        var set = {};
        state.typeFilter.forEach(function (v) { set[v] = true; });
        rows = rows.filter(function (r) { return set[r[filterCol.key]]; });
      }
    }
    if (state.sortKey) {
      rows.sort(function (a, b) {
        var va = a[state.sortKey];
        var vb = b[state.sortKey];
        if (va != null && vb != null) {
          if (typeof va === 'number' && typeof vb === 'number') return state.sortDir * (va - vb);
          return state.sortDir * String(va).localeCompare(String(vb));
        }
        return 0;
      });
    }
    return rows;
  }

  function render() {
    container.style.position = 'relative';
    var filtered = filterAndSortRows();
    var total = filtered.length;
    var totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    var start = (state.page - 1) * state.pageSize;
    var pageData = filtered.slice(start, start + state.pageSize);

    var thead = '<thead><tr><th></th>';
    columns.forEach(function (col, i) {
      var sortIcon = col.sortable !== false ? ' <span class="material-icons-outlined sort-icon">swap_vert</span>' : '';
      var filterIcon = col.filterable ? ' <span class="material-icons-outlined filter-icon">filter_list</span>' : '';
      var thClass = col.sortable !== false ? ' sortable' : '';
      var dataKey = col.key;
      thead += '<th class="' + thClass + '" data-sort="' + dataKey + '" data-col-index="' + i + '">' + (col.label || col.key) + sortIcon + filterIcon + '</th>';
    });
    thead += '</tr></thead>';

    var tbody = '<tbody>';
    pageData.forEach(function (row, idx) {
      var rowNum = start + idx + 1;
      tbody += '<tr data-row-index="' + (start + idx) + '">';
      tbody += '<td>' + rowNum + '</td>';
      columns.forEach(function (col) {
        var val = row[col.key];
        var cell = col.format ? col.format(val, row) : (val != null ? escapeHtml(String(val)) : '');
        tbody += '<td>' + cell + '</td>';
      });
      tbody += '</tr>';
    });
    tbody += '</tbody>';

    var tableHtml = '<div class="data-table-wrapper"><table class="data-table">' + thead + tbody + '</table></div>';
    var countLabel = config.countLabel || 'Total';
    var paginationHtml = renderPagination(state.page, totalPages, state.pageSize, total, config.sizeOptions || [5, 10, 25]);
    var filterHtml = '';
    var filterCol = columns.find(function (c) { return c.filterable; });
    if (filterCol) {
      var options = getFilterOptions();
      state.typeFilter = state.typeFilter || options.slice();
      var checkboxes = options.map(function (opt) {
        var checked = state.typeFilter.indexOf(opt) !== -1 ? ' checked' : '';
        return '<div class="column-filter-item" data-filter-value="' + escapeHtml(opt) + '">' +
          '<div class="checkbox' + (checked ? ' checked' : '') + '"><span class="material-icons-outlined">check</span></div>' +
          '<span class="column-filter-item-label">' + escapeHtml(opt) + '</span></div>';
      }).join('');
      filterHtml = '<div class="column-filter-dropdown" id="type-filter-dropdown" style="display:none;">' +
        '<input type="text" class="column-filter-search" placeholder="Search..." data-filter-search>' +
        '<div class="column-filter-label">Filters</div>' +
        '<div class="column-filter-list" data-filter-list>' + checkboxes + '</div>' +
        '<div class="column-filter-reset" data-filter-reset><span class="material-icons-outlined">restart_alt</span> Reset Filters</div>' +
        '</div>';
    }

    container.innerHTML = (config.tableToolbar !== false ? (
      '<div class="table-toolbar">' +
      '<div class="table-count">' + countLabel + ': <strong>' + total + '</strong></div>' +
      (config.tableActions || '') +
      '</div>'
    ) : '') +
      (config.searchHtml || '') +
      tableHtml +
      filterHtml +
      '<div class="pagination-wrap" data-pagination-wrap>' + paginationHtml + '</div>';

    // Attach sort
    container.querySelectorAll('th.sortable').forEach(function (th) {
      th.addEventListener('click', function () {
        var key = th.getAttribute('data-sort');
        if (!key) return;
        if (state.sortKey === key) {
          if (state.sortDir === 1) state.sortDir = -1;
          else { state.sortKey = null; state.sortDir = 1; }
        } else {
          state.sortKey = key;
          state.sortDir = 1;
        }
        state.page = 1;
        render();
      });
    });

    // Attach filter icon click -> show dropdown
    if (filterCol) {
      var filterTh = container.querySelector('th[data-col-index="' + columns.indexOf(filterCol) + '"]');
      if (filterTh) {
        var filterDropdown = container.querySelector('#type-filter-dropdown');
        var filterIcon = filterTh.querySelector('.filter-icon');
        if (filterIcon && filterDropdown) {
          filterIcon.addEventListener('click', function (e) {
            e.stopPropagation();
            var open = filterDropdown.style.display === 'block';
            filterDropdown.style.display = open ? 'none' : 'block';
            filterDropdown.style.position = 'absolute';
            filterDropdown.style.left = filterTh.offsetLeft + 'px';
            filterDropdown.style.top = (filterTh.offsetTop + filterTh.offsetHeight + 4) + 'px';
          });
        }
        document.addEventListener('click', function closeFilter() {
          if (filterDropdown) filterDropdown.style.display = 'none';
        });
      }
      // Filter list item click -> toggle checkbox and apply
      container.querySelector('[data-filter-list]') && container.querySelector('[data-filter-list]').addEventListener('click', function (e) {
        var item = e.target.closest('.column-filter-item');
        if (!item) return;
        var val = item.getAttribute('data-filter-value');
        var box = item.querySelector('.checkbox');
        box.classList.toggle('checked');
        var idx = (state.typeFilter || []).indexOf(val);
        if (box.classList.contains('checked')) {
          if (idx === -1) state.typeFilter.push(val);
        } else {
          if (idx !== -1) state.typeFilter.splice(idx, 1);
        }
        state.page = 1;
        render();
      });
      container.querySelector('[data-filter-reset]') && container.querySelector('[data-filter-reset]').addEventListener('click', function () {
        state.typeFilter = getFilterOptions().slice();
        state.page = 1;
        render();
      });
    }

    // Pagination
    var wrap = container.querySelector('[data-pagination-wrap]');
    if (wrap) {
      wrap.addEventListener('click', function (e) {
        var btn = e.target.closest('.pagination-nav-btn');
        if (btn && !btn.classList.contains('disabled')) {
          var p = parseInt(btn.getAttribute('data-page'), 10);
          if (p >= 1) { state.page = p; render(); }
        }
      });
      var sizeSelect = container.querySelector('.pagination-size-select');
      if (sizeSelect) {
        sizeSelect.addEventListener('change', function () {
          state.pageSize = parseInt(sizeSelect.value, 10);
          state.page = 1;
          render();
        });
      }
    }
  }

  render();
}

function escapeHtml(s) {
  var div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
