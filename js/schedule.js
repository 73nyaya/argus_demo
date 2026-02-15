/* global SITES, SCHEDULE_EVENTS, renderSiteTabs, AppState, showToast */

var MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function renderSchedule(container, slug) {
  var site = SITES[slug];
  if (!site) return;
  var events = SCHEDULE_EVENTS[slug] || [];
  var selectedEventId = window.__scheduleSelectedEventId != null ? window.__scheduleSelectedEventId : (events.length ? events[0].id : null);
  var selectedEvent = events.find(function (e) { return e.id === selectedEventId; }) || events[0] || null;
  window.__scheduleSelectedEventId = selectedEvent ? selectedEvent.id : null;

  function getTodoDone(todo) {
    var saved = AppState.getTodoState(todo.id);
    return saved !== null ? saved : todo.done;
  }

  var monthChips = MONTH_NAMES.map(function (name, i) {
    var hasEvents = events.some(function (e) { return e.month === i; });
    var active = selectedEvent && selectedEvent.month === i;
    var cls = 'month-chip' + (active ? ' active' : '') + (!hasEvents ? ' inactive' : '');
    return '<div class="' + cls + '" data-month="' + i + '">' + name + '</div>';
  }).join('');

  var eventCards = events.map(function (ev) {
    var selected = ev.id === (selectedEvent && selectedEvent.id) ? ' selected' : '';
    return '<div class="event-entry">' +
      '<div class="event-date-range">' + ev.startDate + ' - ' + ev.endDate + '</div>' +
      '<div class="event-card' + selected + '" data-event-id="' + ev.id + '">' +
      '<div class="event-card-title">' + ev.title + '</div>' +
      '<div class="event-card-arrow"><span class="material-icons-outlined">arrow_forward</span></div>' +
      '</div></div>';
  }).join('');

  var detailHtml = '';
  if (selectedEvent) {
    var todos = (selectedEvent.todos || []).map(function (t) {
      var done = getTodoDone(t);
      return '<div class="todo-item" data-todo-id="' + t.id + '">' +
        '<div class="checkbox' + (done ? ' checked' : '') + '"><span class="material-icons-outlined">check</span></div>' +
        '<span class="todo-label">' + (t.text || '') + '</span></div>';
    }).join('');
    detailHtml = '<div class="schedule-detail-now">' + (selectedEvent.isCurrent ? 'Now' : '') + '</div>' +
      '<div class="schedule-detail-title">' + selectedEvent.title + '</div>' +
      '<div class="schedule-detail-dates">' + selectedEvent.startDate + ' - ' + selectedEvent.endDate + '</div>' +
      '<div class="schedule-detail-section">' +
      '<div class="schedule-detail-section-title">Description</div>' +
      '<div class="schedule-detail-description">' + (selectedEvent.description || '') + '</div>' +
      '</div>' +
      '<div class="schedule-detail-section">' +
      '<div class="schedule-detail-section-title">To do</div>' +
      '<div class="todo-list" data-event-id="' + selectedEvent.id + '">' + todos + '</div>' +
      '</div>' +
      '<div class="schedule-actions">' +
      '<button type="button" class="btn btn-secondary">Action</button>' +
      '<button type="button" class="btn btn-primary">Action</button>' +
      '</div>';
  } else {
    detailHtml = '<div class="empty-state"><div class="empty-state-title">Select an event</div><div class="empty-state-text">Choose an event from the list to view details.</div></div>';
  }

  var html = renderSiteTabs(slug, 'schedule') +
    '<div class="schedule-layout">' +
    '<div class="schedule-left">' +
    '<div class="schedule-header">' +
    '<div class="schedule-title">Schedule</div>' +
    '<div class="schedule-header-actions">' +
    '<select class="year-select"><option>2026</option><option>2025</option></select>' +
    '<button type="button" class="add-circle-btn" id="schedule-add-btn" style="width:32px;height:32px;"><span class="material-icons-outlined" style="font-size:18px;">add</span></button>' +
    '</div></div>' +
    '<div class="month-grid">' + monthChips + '</div>' +
    '<div class="event-list">' + eventCards + '</div>' +
    '</div>' +
    '<div class="schedule-right" id="schedule-detail-panel">' + detailHtml + '</div>' +
    '</div>';

  container.innerHTML = html;

  container.querySelectorAll('.event-card').forEach(function (card) {
    card.addEventListener('click', function () {
      window.__scheduleSelectedEventId = card.getAttribute('data-event-id');
      renderSchedule(container, slug);
    });
  });

  container.querySelector('#schedule-add-btn') && container.querySelector('#schedule-add-btn').addEventListener('click', function () {
    showToast('warning', 'Coming soon', 'Schedule creation will be available soon');
  });
  container.querySelectorAll('.schedule-actions .btn').forEach(function (btn) {
    btn.addEventListener('click', function () { showToast('warning', 'Coming soon', 'This feature will be available soon'); });
  });

  container.querySelectorAll('.todo-item').forEach(function (item) {
    var todoId = item.getAttribute('data-todo-id');
    var box = item.querySelector('.checkbox');
    if (!box || !todoId) return;
    box.addEventListener('click', function (e) {
      e.preventDefault();
      var checked = box.classList.toggle('checked');
      AppState.setTodoState(todoId, checked);
    });
  });
}
