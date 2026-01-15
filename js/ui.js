/**
 * UI Module
 * Handles DOM manipulation and rendering for all views
 */

import * as store from './store.js';

// DOM Element References
const elements = {
  // Header
  headerTitle: document.getElementById('header-title'),
  backBtn: document.getElementById('back-btn'),
  addBtn: document.getElementById('add-btn'),

  // Views
  viewGroups: document.getElementById('view-groups'),
  viewGroupDetail: document.getElementById('view-group-detail'),
  viewBreeds: document.getElementById('view-breeds'),
  viewBreedDetail: document.getElementById('view-breed-detail'),
  viewSettings: document.getElementById('view-settings'),

  // Groups
  groupsList: document.getElementById('groups-list'),
  groupsEmpty: document.getElementById('groups-empty'),
  groupForm: document.getElementById('group-form'),
  groupId: document.getElementById('group-id'),
  groupName: document.getElementById('group-name'),
  groupDescription: document.getElementById('group-description'),
  groupDeleteBtn: document.getElementById('group-delete-btn'),
  groupBreeds: document.getElementById('group-breeds'),
  groupBreedsList: document.getElementById('group-breeds-list'),

  // Breeds
  breedsList: document.getElementById('breeds-list'),
  breedsEmpty: document.getElementById('breeds-empty'),
  breedForm: document.getElementById('breed-form'),
  breedId: document.getElementById('breed-id'),
  breedName: document.getElementById('breed-name'),
  breedGroup: document.getElementById('breed-group'),
  breedDescription: document.getElementById('breed-description'),
  breedDeleteBtn: document.getElementById('breed-delete-btn'),

  // Settings
  exportBtn: document.getElementById('export-btn'),
  importBtn: document.getElementById('import-btn'),
  importFile: document.getElementById('import-file'),

  // Navigation
  navItems: document.querySelectorAll('.nav-item'),

  // Dialog
  confirmDialog: document.getElementById('confirm-dialog'),
  confirmMessage: document.getElementById('confirm-message'),
  confirmCancel: document.getElementById('confirm-cancel'),
  confirmOk: document.getElementById('confirm-ok')
};

// Current state
let currentView = 'groups';

/**
 * Get DOM elements (for use by other modules)
 * @returns {Object} DOM element references
 */
export function getElements() {
  return elements;
}

/**
 * Hide all views
 */
function hideAllViews() {
  elements.viewGroups.hidden = true;
  elements.viewGroupDetail.hidden = true;
  elements.viewBreeds.hidden = true;
  elements.viewBreedDetail.hidden = true;
  elements.viewSettings.hidden = true;
}

/**
 * Update navigation active state
 * @param {string} route - Active route name
 */
function updateNavActive(route) {
  elements.navItems.forEach(item => {
    const isActive = item.dataset.route === route;
    item.classList.toggle('active', isActive);
  });
}

/**
 * Show header back button
 * @param {boolean} show - Whether to show the back button
 */
export function showBackButton(show) {
  elements.backBtn.hidden = !show;
}

/**
 * Show header add button
 * @param {boolean} show - Whether to show the add button
 */
export function showAddButton(show) {
  elements.addBtn.hidden = !show;
}

/**
 * Set header title
 * @param {string} title - Title text
 */
export function setTitle(title) {
  elements.headerTitle.textContent = title;
}

// ============================================================================
// Groups View
// ============================================================================

/**
 * Render the groups list view
 */
export async function renderGroupsList() {
  currentView = 'groups';
  hideAllViews();
  elements.viewGroups.hidden = false;

  setTitle('Groups');
  showBackButton(false);
  showAddButton(true);
  updateNavActive('groups');

  const groups = await store.getAllGroups();
  const breeds = await store.getAllBreeds();

  elements.groupsList.innerHTML = '';

  if (groups.length === 0) {
    elements.groupsEmpty.hidden = false;
    return;
  }

  elements.groupsEmpty.hidden = true;

  for (const group of groups) {
    const breedCount = breeds.filter(b => b.groupId === group.id).length;
    const li = createGroupListItem(group, breedCount);
    elements.groupsList.appendChild(li);
  }
}

/**
 * Create a group list item element
 * @param {Object} group - Group data
 * @param {number} breedCount - Number of breeds in group
 * @returns {HTMLLIElement} List item element
 */
function createGroupListItem(group, breedCount) {
  const li = document.createElement('li');
  li.className = 'list-item';
  li.dataset.id = group.id;
  li.setAttribute('role', 'listitem');

  li.innerHTML = `
    <div class="list-item-content">
      <span class="list-item-title">${escapeHtml(group.name)}</span>
      <span class="list-item-subtitle">${breedCount} breed${breedCount !== 1 ? 's' : ''}</span>
    </div>
    <svg class="list-item-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  `;

  return li;
}

/**
 * Render the group detail/edit view
 * @param {string|null} groupId - Group ID for editing, null for new
 */
export async function renderGroupDetail(groupId = null) {
  currentView = 'group-detail';
  hideAllViews();
  elements.viewGroupDetail.hidden = false;

  showBackButton(true);
  showAddButton(false);

  elements.groupForm.reset();
  elements.groupId.value = '';
  elements.groupDeleteBtn.hidden = true;
  elements.groupBreeds.hidden = true;

  if (groupId) {
    setTitle('Edit Group');
    const group = await store.getGroupById(groupId);
    if (group) {
      elements.groupId.value = group.id;
      elements.groupName.value = group.name;
      elements.groupDescription.value = group.description || '';
      elements.groupDeleteBtn.hidden = false;

      // Show breeds in this group
      const breeds = await store.getBreedsByGroup(groupId);
      if (breeds.length > 0) {
        elements.groupBreeds.hidden = false;
        elements.groupBreedsList.innerHTML = '';
        for (const breed of breeds) {
          const li = createBreedListItem(breed, null);
          elements.groupBreedsList.appendChild(li);
        }
      }
    }
  } else {
    setTitle('New Group');
  }
}

// ============================================================================
// Breeds View
// ============================================================================

/**
 * Render the breeds list view
 */
export async function renderBreedsList() {
  currentView = 'breeds';
  hideAllViews();
  elements.viewBreeds.hidden = false;

  setTitle('Breeds');
  showBackButton(false);
  showAddButton(true);
  updateNavActive('breeds');

  const breeds = await store.getAllBreeds();
  const groups = await store.getAllGroups();
  const groupMap = new Map(groups.map(g => [g.id, g.name]));

  elements.breedsList.innerHTML = '';

  if (breeds.length === 0) {
    elements.breedsEmpty.hidden = false;
    return;
  }

  elements.breedsEmpty.hidden = true;

  for (const breed of breeds) {
    const groupName = groupMap.get(breed.groupId) || 'Unknown';
    const li = createBreedListItem(breed, groupName);
    elements.breedsList.appendChild(li);
  }
}

/**
 * Create a breed list item element
 * @param {Object} breed - Breed data
 * @param {string|null} groupName - Group name to display
 * @returns {HTMLLIElement} List item element
 */
function createBreedListItem(breed, groupName) {
  const li = document.createElement('li');
  li.className = 'list-item';
  li.dataset.id = breed.id;
  li.setAttribute('role', 'listitem');

  const subtitle = groupName ? escapeHtml(groupName) : (breed.description || 'No description');

  li.innerHTML = `
    <div class="list-item-content">
      <span class="list-item-title">${escapeHtml(breed.name)}</span>
      <span class="list-item-subtitle">${escapeHtml(subtitle)}</span>
    </div>
    <svg class="list-item-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  `;

  return li;
}

/**
 * Render the breed detail/edit view
 * @param {string|null} breedId - Breed ID for editing, null for new
 */
export async function renderBreedDetail(breedId = null) {
  currentView = 'breed-detail';
  hideAllViews();
  elements.viewBreedDetail.hidden = false;

  showBackButton(true);
  showAddButton(false);

  elements.breedForm.reset();
  elements.breedId.value = '';
  elements.breedDeleteBtn.hidden = true;

  // Populate group dropdown
  await populateGroupDropdown();

  if (breedId) {
    setTitle('Edit Breed');
    const breed = await store.getBreedById(breedId);
    if (breed) {
      elements.breedId.value = breed.id;
      elements.breedName.value = breed.name;
      elements.breedGroup.value = breed.groupId;
      elements.breedDescription.value = breed.description || '';
      elements.breedDeleteBtn.hidden = false;
    }
  } else {
    setTitle('New Breed');
  }
}

/**
 * Populate the group dropdown in breed form
 */
async function populateGroupDropdown() {
  const groups = await store.getAllGroups();

  elements.breedGroup.innerHTML = '<option value="">Select a group</option>';

  for (const group of groups) {
    const option = document.createElement('option');
    option.value = group.id;
    option.textContent = group.name;
    elements.breedGroup.appendChild(option);
  }
}

// ============================================================================
// Settings View
// ============================================================================

/**
 * Render the settings view
 */
export function renderSettings() {
  currentView = 'settings';
  hideAllViews();
  elements.viewSettings.hidden = false;

  setTitle('Settings');
  showBackButton(false);
  showAddButton(false);
  updateNavActive('settings');
}

// ============================================================================
// Dialog
// ============================================================================

/**
 * Show confirmation dialog
 * @param {string} message - Message to display
 * @returns {Promise<boolean>} Resolves to true if confirmed, false if cancelled
 */
export function showConfirmDialog(message) {
  return new Promise((resolve) => {
    elements.confirmMessage.textContent = message;
    elements.confirmDialog.showModal();

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const handleOk = () => {
      cleanup();
      resolve(true);
    };

    const handleBackdrop = (e) => {
      if (e.target === elements.confirmDialog) {
        handleCancel();
      }
    };

    function cleanup() {
      elements.confirmCancel.removeEventListener('click', handleCancel);
      elements.confirmOk.removeEventListener('click', handleOk);
      elements.confirmDialog.removeEventListener('click', handleBackdrop);
      elements.confirmDialog.close();
    }

    elements.confirmCancel.addEventListener('click', handleCancel);
    elements.confirmOk.addEventListener('click', handleOk);
    elements.confirmDialog.addEventListener('click', handleBackdrop);
  });
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'info'
 */
export function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) {
    existing.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'alert');

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-visible');
  });

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Get current view name
 * @returns {string} Current view identifier
 */
export function getCurrentView() {
  return currentView;
}
