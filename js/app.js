/**
 * App Module
 * Application initialization, routing, and event handling
 */

import * as store from './store.js';
import * as ui from './ui.js';
import { exportToFile, setupImport } from './io.js';

// ============================================================================
// Router
// ============================================================================

const routes = {
  'groups': () => ui.renderGroupsList(),
  'groups/new': () => ui.renderGroupDetail(null),
  'groups/:id': (id) => ui.renderGroupDetail(id),
  'breeds': () => ui.renderBreedsList(),
  'breeds/new': () => ui.renderBreedDetail(null),
  'breeds/:id': (id) => ui.renderBreedDetail(id),
  'settings': () => ui.renderSettings()
};

/**
 * Parse the current hash and return route info
 * @returns {Object} { route: string, param: string|null }
 */
function parseHash() {
  const hash = window.location.hash.slice(2) || 'groups'; // Remove '#/'
  const parts = hash.split('/');

  if (parts.length === 1) {
    return { route: parts[0], param: null };
  }

  if (parts.length === 2) {
    if (parts[1] === 'new') {
      return { route: `${parts[0]}/new`, param: null };
    }
    return { route: `${parts[0]}/:id`, param: parts[1] };
  }

  return { route: 'groups', param: null };
}

/**
 * Navigate to a route
 * @param {string} path - Route path (e.g., 'groups', 'breeds/123')
 */
function navigate(path) {
  window.location.hash = `#/${path}`;
}

/**
 * Handle route changes
 */
async function handleRoute() {
  const { route, param } = parseHash();
  const handler = routes[route];

  if (handler) {
    await handler(param);
  } else {
    // Default to groups list
    navigate('groups');
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  const els = ui.getElements();

  // Hash change routing
  window.addEventListener('hashchange', handleRoute);

  // Back button
  els.backBtn.addEventListener('click', handleBack);

  // Add button
  els.addBtn.addEventListener('click', handleAdd);

  // Bottom navigation
  els.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const route = item.dataset.route;
      navigate(route);
    });
  });

  // Group form submission
  els.groupForm.addEventListener('submit', handleGroupSubmit);

  // Group delete button
  els.groupDeleteBtn.addEventListener('click', handleGroupDelete);

  // Breed form submission
  els.breedForm.addEventListener('submit', handleBreedSubmit);

  // Breed delete button
  els.breedDeleteBtn.addEventListener('click', handleBreedDelete);

  // Group list item clicks
  els.groupsList.addEventListener('click', (e) => {
    const item = e.target.closest('.list-item');
    if (item) {
      navigate(`groups/${item.dataset.id}`);
    }
  });

  // Breed list item clicks (main list)
  els.breedsList.addEventListener('click', (e) => {
    const item = e.target.closest('.list-item');
    if (item) {
      navigate(`breeds/${item.dataset.id}`);
    }
  });

  // Breed list item clicks (in group detail)
  els.groupBreedsList.addEventListener('click', (e) => {
    const item = e.target.closest('.list-item');
    if (item) {
      navigate(`breeds/${item.dataset.id}`);
    }
  });

  // Export button
  els.exportBtn.addEventListener('click', handleExport);

  // Import button
  els.importBtn.addEventListener('click', () => els.importFile.click());

  // Import file selection
  setupImport(els.importFile, async () => {
    ui.showToast('Data imported successfully', 'success');
    await handleRoute(); // Refresh current view
  });
}

/**
 * Handle back button click
 */
function handleBack() {
  const currentView = ui.getCurrentView();

  if (currentView === 'group-detail') {
    navigate('groups');
  } else if (currentView === 'breed-detail') {
    navigate('breeds');
  } else {
    window.history.back();
  }
}

/**
 * Handle add button click
 */
function handleAdd() {
  const currentView = ui.getCurrentView();

  if (currentView === 'groups') {
    navigate('groups/new');
  } else if (currentView === 'breeds') {
    navigate('breeds/new');
  }
}

/**
 * Handle group form submission
 * @param {Event} e - Submit event
 */
async function handleGroupSubmit(e) {
  e.preventDefault();

  const els = ui.getElements();
  const id = els.groupId.value;
  const data = {
    name: els.groupName.value.trim(),
    description: els.groupDescription.value.trim()
  };

  try {
    if (id) {
      await store.updateGroup(id, data);
      ui.showToast('Group updated', 'success');
    } else {
      await store.createGroup(data);
      ui.showToast('Group created', 'success');
    }
    navigate('groups');
  } catch (err) {
    ui.showToast(err.message, 'error');
  }
}

/**
 * Handle group delete button click
 */
async function handleGroupDelete() {
  const els = ui.getElements();
  const id = els.groupId.value;

  if (!id) return;

  const confirmed = await ui.showConfirmDialog(
    'Are you sure you want to delete this group? Groups with breeds cannot be deleted.'
  );

  if (!confirmed) return;

  try {
    await store.deleteGroup(id);
    ui.showToast('Group deleted', 'success');
    navigate('groups');
  } catch (err) {
    ui.showToast(err.message, 'error');
  }
}

/**
 * Handle breed form submission
 * @param {Event} e - Submit event
 */
async function handleBreedSubmit(e) {
  e.preventDefault();

  const els = ui.getElements();
  const id = els.breedId.value;
  const data = {
    name: els.breedName.value.trim(),
    groupId: els.breedGroup.value,
    description: els.breedDescription.value.trim()
  };

  if (!data.groupId) {
    ui.showToast('Please select a group', 'error');
    return;
  }

  try {
    if (id) {
      await store.updateBreed(id, data);
      ui.showToast('Breed updated', 'success');
    } else {
      await store.createBreed(data);
      ui.showToast('Breed created', 'success');
    }
    navigate('breeds');
  } catch (err) {
    ui.showToast(err.message, 'error');
  }
}

/**
 * Handle breed delete button click
 */
async function handleBreedDelete() {
  const els = ui.getElements();
  const id = els.breedId.value;

  if (!id) return;

  const confirmed = await ui.showConfirmDialog(
    'Are you sure you want to delete this breed?'
  );

  if (!confirmed) return;

  try {
    await store.deleteBreed(id);
    ui.showToast('Breed deleted', 'success');
    navigate('breeds');
  } catch (err) {
    ui.showToast(err.message, 'error');
  }
}

/**
 * Handle export button click
 */
function handleExport() {
  try {
    exportToFile();
    ui.showToast('Data exported', 'success');
  } catch (err) {
    ui.showToast('Export failed: ' + err.message, 'error');
  }
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the application
 */
async function init() {
  // Initialize store
  await store.init();

  // Setup event listeners
  setupEventListeners();

  // Handle initial route
  await handleRoute();

  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
    } catch (err) {
      console.error('Service worker registration failed:', err);
    }
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
