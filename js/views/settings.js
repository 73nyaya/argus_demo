/* global CURRENT_USER, USERS, AppState, renderSettingsTabs, renderDataTable, showModal, hideModal, showToast */

var ROLES = ['Engineer', 'Designer', 'Developer', 'Product Manager', 'UX Researcher', 'Frontend Developer', 'UI Designer', 'Backend Developer', 'Data Analyst', 'Quality Assurance', 'Marketing Specialist'];

function renderSettings(container, tab) {
  tab = tab || 'account';
  var html = renderSettingsTabs(tab) + '<div id="settings-content"></div>';
  container.innerHTML = html;
  var content = document.getElementById('settings-content');
  if (!content) return;

  if (tab === 'account') {
    var twoFa = AppState.twoFactorEnabled;
    content.innerHTML =
      '<div class="settings-section">' +
      '<div class="settings-section-header"><span class="material-icons-outlined">person_outline</span><div class="settings-section-title">My Profile</div></div>' +
      '<div class="profile-image-upload">' +
      '<div class="profile-avatar-large"><div style="width:100%;height:100%;background:var(--grey-300);display:flex;align-items:center;justify-content:center;"><span class="material-icons-outlined" style="color:var(--grey-500);font-size:28px;">person</span></div></div>' +
      '<div><div class="profile-image-actions"><button type="button" class="btn-change-image">+ Change Image</button><button type="button" class="btn-remove-image">Remove Image</button></div>' +
      '<div class="profile-image-hint">We support PNG, JPEG under 2MB</div></div></div>' +
      '<div class="form-grid">' +
      '<div class="floating-input-group"><input type="text" class="floating-input" value="' + (CURRENT_USER.name || '') + '" placeholder=" "><label class="floating-label">First Name</label></div>' +
      '<div class="floating-input-group"><input type="text" class="floating-input" value="' + (CURRENT_USER.lastname || '') + '" placeholder=" "><label class="floating-label">Last Name</label></div>' +
      '<div class="floating-input-group"><input type="text" class="floating-input" value="' + (CURRENT_USER.phone || '') + '" placeholder=" "><label class="floating-label">Phone</label></div>' +
      '<div class="floating-input-group"><input type="text" class="floating-input" value="' + (CURRENT_USER.position || '') + '" placeholder=" "><label class="floating-label">Position</label></div>' +
      '</div></div>' +
      '<div class="settings-divider"></div>' +
      '<div class="settings-section">' +
      '<div class="settings-section-header"><span class="material-icons-outlined">verified_user</span><div class="settings-section-title">Account Security</div></div>' +
      '<div class="settings-row"><div class="settings-row-content"><div style="font-size:14px;color:var(--grey-500);">' + (CURRENT_USER.email || '') + '</div></div><div class="settings-row-action"><a href="#">Change Email</a></div></div>' +
      '<div class="settings-row"><div class="settings-row-content"><div style="font-size:14px;color:var(--grey-500);">••••••••••••</div></div><div class="settings-row-action"><a href="#">Change Password</a></div></div>' +
      '<div class="settings-row"><div class="settings-row-content"><div class="settings-row-label">2-Steps Verification</div><div class="settings-row-description">add an additional layer of security to your account during login.</div></div>' +
      '<div class="settings-row-action"><div class="toggle' + (twoFa ? ' active' : '') + '" id="settings-2fa-toggle"></div></div></div>' +
      '</div>' +
      '<div class="settings-divider"></div>' +
      '<div class="settings-section">' +
      '<div class="settings-section-header"><span class="material-icons-outlined">logout</span><div class="settings-section-title">Access Support</div></div>' +
      '<div class="settings-row"><div class="settings-row-content"><div class="settings-row-label">Log Out of All Devices</div><div class="settings-row-description">Log out of all active sessions on other devices besides this one</div></div><div class="settings-row-action"><a href="#" id="settings-logout">Log Out</a></div></div>' +
      '</div>' +
      '<div class="settings-divider"></div>' +
      '<div class="settings-section">' +
      '<div class="settings-section-header"><span class="material-icons-outlined">notifications_none</span><div class="settings-section-title">Notifications Preference</div></div>' +
      '<div class="settings-row"><div class="settings-row-content"><div class="settings-row-label">Notification Name</div><div class="settings-row-description">Receive email notifications for important updates.</div></div><div class="settings-row-action"><div class="toggle active"></div></div></div>' +
      '</div>' +
      '<div class="settings-save-footer"><button type="button" class="btn btn-primary" id="settings-save-account">Save Changes</button></div>';

    content.querySelector('#settings-2fa-toggle').addEventListener('click', function () {
      AppState.setTwoFactor(!AppState.twoFactorEnabled);
      this.classList.toggle('active');
    });
    content.querySelector('#settings-save-account').addEventListener('click', function () {
      showToast('success', 'Changes saved', 'Your changes have been saved successfully');
    });
    content.querySelectorAll('.settings-row-action a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (this.id === 'settings-logout') showToast('warning', 'Coming soon', 'This feature will be available soon');
        else showToast('warning', 'Coming soon', 'This feature will be available soon');
      });
    });
    content.querySelector('.btn-change-image').addEventListener('click', function () { showToast('warning', 'Coming soon', 'Image upload will be available soon'); });
    content.querySelector('.btn-remove-image').addEventListener('click', function () { showToast('warning', 'Coming soon', 'Image upload will be available soon'); });
  } else if (tab === 'notifications') {
    content.innerHTML = '<div class="settings-section"><p style="color:var(--grey-500);">Notification preferences will be available here.</p></div>';
  } else if (tab === 'users') {
    var tableId = 'settings-users-table';
    content.innerHTML =
      '<div class="user-mgmt-header">' +
      '<div class="user-mgmt-title"><span class="material-icons-outlined">people_outline</span> Active Users</div>' +
      '<div class="user-mgmt-actions">' +
      '<div class="search-compact" style="width:200px;"><span class="material-icons-outlined">search</span><input type="text" placeholder="Search" id="users-search"></div>' +
      '<button type="button" class="add-circle-btn" id="settings-add-member"><span class="material-icons-outlined">add</span></button>' +
      '</div></div>' +
      '<div id="' + tableId + '"></div>' +
      '<div class="settings-save-footer"><button type="button" class="btn btn-primary" id="settings-save-users">Save Changes</button></div>';

    function renderUsersTable() {
      var cols = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'lastname', label: 'Lastname', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'role', label: 'Role', sortable: true },
        { key: 'dateAdded', label: 'Date Added', sortable: true }
      ];
      renderDataTable({
        columns: cols,
        data: USERS.slice(),
        pageSize: 10,
        containerId: tableId,
        countLabel: 'Users',
        tableToolbar: false
      });
    }
    renderUsersTable();
    content.querySelector('#settings-add-member').addEventListener('click', function () {
      var roleOptions = ROLES.map(function (r) { return '<option value="' + r + '">' + r + '</option>'; }).join('');
      var modalHtml =
        '<div class="modal-centered-icon"><div class="modal-icon-circle"><span class="material-icons-outlined">person_add</span></div></div>' +
        '<div class="modal-header-centered"><div class="modal-title">Add a New Member</div><div class="modal-subtitle">Add a new team member with name, email and role.</div></div>' +
        '<div class="modal-body">' +
        '<div class="form-grid-2">' +
        '<div class="floating-input-group"><input type="text" class="floating-input" id="add-member-first" placeholder=" "><label class="floating-label">First Name</label></div>' +
        '<div class="floating-input-group"><input type="text" class="floating-input" id="add-member-last" placeholder=" "><label class="floating-label">Last Name</label></div>' +
        '</div>' +
        '<div class="floating-input-group"><input type="email" class="floating-input" id="add-member-email" placeholder=" "><label class="floating-label">Email</label></div>' +
        '<div class="floating-select-group">' +
        '<select class="floating-select" id="add-member-role">' + roleOptions + '</select>' +
        '<label class="floating-label">Role</label>' +
        '</div>' +
        '<div class="modal-footer-stacked">' +
        '<button type="button" class="btn btn-primary btn-full" id="add-member-submit">Add Member</button>' +
        '<button type="button" class="btn-cancel-text" data-dismiss="modal">Cancel</button>' +
        '</div></div>';
      showModal(modalHtml);
      document.getElementById('add-member-submit').addEventListener('click', function () {
        var first = (document.getElementById('add-member-first').value || '').trim();
        var last = (document.getElementById('add-member-last').value || '').trim();
        var email = (document.getElementById('add-member-email').value || '').trim();
        if (!first || !last || !email) return;
        var role = document.getElementById('add-member-role').value || ROLES[0];
        var today = new Date();
        var dateStr = (today.getDate() < 10 ? '0' : '') + today.getDate() + '/' + ((today.getMonth() + 1) < 10 ? '0' : '') + (today.getMonth() + 1) + '/' + today.getFullYear();
        USERS.push({ name: first, lastname: last, email: email, role: role, dateAdded: dateStr });
        hideModal();
        renderUsersTable();
        showToast('success', 'Member added', 'New team member has been added successfully');
      });
    });
    content.querySelector('#settings-save-users').addEventListener('click', function () {
      showToast('success', 'Changes saved', 'Your changes have been saved successfully');
    });
  } else if (tab === 'billing') {
    content.innerHTML = '<div class="settings-section"><p style="color:var(--grey-500);">Billing information will be available here.</p></div>';
  }
}
