/**
 * IO Module
 * Handles import/export file operations
 */

import * as store from './store.js';
import { showConfirmDialog, showToast } from './ui.js';

/**
 * Export data to a JSON file
 * Creates a downloadable file with timestamped filename
 */
export function exportToFile() {
  const jsonString = store.exportData();
  const blob = new Blob([jsonString], { type: 'application/json' });

  const date = new Date().toISOString().split('T')[0];
  const filename = `dog-export-${date}.json`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Setup import file input handler
 * @param {HTMLInputElement} fileInput - The file input element
 * @param {Function} onSuccess - Callback after successful import
 */
export function setupImport(fileInput, onSuccess) {
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset input so same file can be selected again
    fileInput.value = '';

    try {
      const jsonString = await readFile(file);

      // Validate before confirming
      validateImportData(jsonString);

      const confirmed = await showConfirmDialog(
        'This will replace all existing data. Are you sure you want to import?'
      );

      if (!confirmed) return;

      store.importData(jsonString);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      showToast('Import failed: ' + err.message, 'error');
    }
  });
}

/**
 * Read file contents as text
 * @param {File} file - File to read
 * @returns {Promise<string>} File contents
 */
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Validate import data structure before importing
 * @param {string} jsonString - JSON string to validate
 * @throws {Error} If validation fails
 */
function validateImportData(jsonString) {
  let parsed;

  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    throw new Error('Invalid JSON format');
  }

  if (!parsed.meta) {
    throw new Error('Missing meta field');
  }

  if (parsed.meta.appName !== 'dog') {
    throw new Error('Invalid data file: wrong app name');
  }

  if (!Array.isArray(parsed.groups)) {
    throw new Error('Invalid data: groups must be an array');
  }

  if (!Array.isArray(parsed.breeds)) {
    throw new Error('Invalid data: breeds must be an array');
  }

  // Validate group structure
  for (const group of parsed.groups) {
    if (!group.id || !group.name) {
      throw new Error('Invalid group: missing id or name');
    }
  }

  // Validate breed structure
  for (const breed of parsed.breeds) {
    if (!breed.id || !breed.name || !breed.groupId) {
      throw new Error('Invalid breed: missing id, name, or groupId');
    }
  }

  // Validate foreign key integrity
  const groupIds = new Set(parsed.groups.map(g => g.id));
  for (const breed of parsed.breeds) {
    if (!groupIds.has(breed.groupId)) {
      throw new Error(`Invalid breed "${breed.name}": references non-existent group`);
    }
  }
}
