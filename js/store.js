/**
 * Data Store Module
 * Handles localStorage persistence and CRUD operations for breeds and groups
 */

const STORAGE_KEY = 'dog-app-data';

let data = {
  meta: {
    appName: 'dog',
    version: '1.0.0'
  },
  groups: [],
  breeds: []
};

/**
 * Initialize store with data from localStorage or defaults
 * @returns {Promise<void>}
 */
export async function init() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    load();
  } else {
    loadSampleData();
  }
}

/**
 * Load sample data for first-time users
 */
function loadSampleData() {
  const now = new Date().toISOString();

  // Sample groups based on AKC breed groups
  const groups = [
    {
      id: crypto.randomUUID(),
      name: 'Herding',
      description: 'Breeds developed to gather, herd, and protect livestock',
      createdAt: now,
      updatedAt: now
    },
    {
      id: crypto.randomUUID(),
      name: 'Sporting',
      description: 'Naturally active and alert dogs bred to assist hunters',
      createdAt: now,
      updatedAt: now
    },
    {
      id: crypto.randomUUID(),
      name: 'Working',
      description: 'Dogs bred for tasks such as guarding, pulling sleds, and rescue',
      createdAt: now,
      updatedAt: now
    },
    {
      id: crypto.randomUUID(),
      name: 'Terrier',
      description: 'Feisty and energetic dogs originally bred to hunt vermin',
      createdAt: now,
      updatedAt: now
    },
    {
      id: crypto.randomUUID(),
      name: 'Toy',
      description: 'Small companion dogs bred primarily for affection and companionship',
      createdAt: now,
      updatedAt: now
    },
    {
      id: crypto.randomUUID(),
      name: 'Hound',
      description: 'Dogs bred for hunting by scent or sight',
      createdAt: now,
      updatedAt: now
    },
    {
      id: crypto.randomUUID(),
      name: 'Non-Sporting',
      description: 'A diverse group of breeds with varying sizes and personalities',
      createdAt: now,
      updatedAt: now
    }
  ];

  // Sample breeds
  const breeds = [
    // Herding
    { name: 'Border Collie', description: 'Highly intelligent and athletic herding dog known for intense stare', groupIndex: 0 },
    { name: 'German Shepherd', description: 'Versatile working dog known for loyalty and intelligence', groupIndex: 0 },
    { name: 'Australian Shepherd', description: 'Energetic and clever herding dog with striking coat patterns', groupIndex: 0 },
    { name: 'Pembroke Welsh Corgi', description: 'Low-set herding dog with big personality and foxy face', groupIndex: 0 },

    // Sporting
    { name: 'Labrador Retriever', description: 'Friendly and outgoing sporting dog, America\'s most popular breed', groupIndex: 1 },
    { name: 'Golden Retriever', description: 'Intelligent and devoted family dog with beautiful golden coat', groupIndex: 1 },
    { name: 'Cocker Spaniel', description: 'Happy and gentle sporting dog with long, silky ears', groupIndex: 1 },
    { name: 'German Shorthaired Pointer', description: 'Versatile hunting dog with endless energy and enthusiasm', groupIndex: 1 },

    // Working
    { name: 'Siberian Husky', description: 'Athletic sled dog with striking blue eyes and thick coat', groupIndex: 2 },
    { name: 'Boxer', description: 'Fun-loving and loyal guardian with distinctive square jaw', groupIndex: 2 },
    { name: 'Rottweiler', description: 'Confident and powerful guardian with calm demeanor', groupIndex: 2 },
    { name: 'Great Dane', description: 'Gentle giant known as the Apollo of dogs', groupIndex: 2 },

    // Terrier
    { name: 'Jack Russell Terrier', description: 'Energetic and clever small terrier with big attitude', groupIndex: 3 },
    { name: 'Scottish Terrier', description: 'Independent and spirited terrier with distinctive profile', groupIndex: 3 },
    { name: 'Bull Terrier', description: 'Playful and mischievous with unique egg-shaped head', groupIndex: 3 },

    // Toy
    { name: 'Chihuahua', description: 'Tiny but mighty companion with big personality', groupIndex: 4 },
    { name: 'Pomeranian', description: 'Fluffy and vivacious toy breed with foxy face', groupIndex: 4 },
    { name: 'Yorkshire Terrier', description: 'Feisty and affectionate with silky blue and tan coat', groupIndex: 4 },
    { name: 'Pug', description: 'Charming and mischievous with expressive wrinkled face', groupIndex: 4 },

    // Hound
    { name: 'Beagle', description: 'Merry and curious scent hound with soulful eyes', groupIndex: 5 },
    { name: 'Dachshund', description: 'Clever and courageous badger dog with long body', groupIndex: 5 },
    { name: 'Basset Hound', description: 'Low-key scent hound with long ears and sad eyes', groupIndex: 5 },
    { name: 'Greyhound', description: 'Gentle and noble sight hound built for speed', groupIndex: 5 },

    // Non-Sporting
    { name: 'Bulldog', description: 'Calm and courageous with distinctive wrinkled face', groupIndex: 6 },
    { name: 'Poodle', description: 'Exceptionally intelligent and elegant in three sizes', groupIndex: 6 },
    { name: 'Dalmatian', description: 'Dignified coaching dog with unique spotted coat', groupIndex: 6 },
    { name: 'Shiba Inu', description: 'Alert and good-natured Japanese breed with fox-like appearance', groupIndex: 6 }
  ].map(breed => ({
    id: crypto.randomUUID(),
    groupId: groups[breed.groupIndex].id,
    name: breed.name,
    description: breed.description,
    createdAt: now,
    updatedAt: now
  }));

  data = {
    meta: {
      appName: 'dog',
      version: '1.0.0'
    },
    groups,
    breeds
  };

  save();
}

/**
 * Load data from localStorage
 */
export function load() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.meta && parsed.groups && parsed.breeds) {
        data = parsed;
      }
    } catch (e) {
      console.error('Failed to parse stored data:', e);
    }
  }
}

/**
 * Save current state to localStorage
 */
export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
    throw new Error('Storage quota exceeded or unavailable');
  }
}

// ============================================================================
// Group CRUD Operations
// ============================================================================

/**
 * Get all groups
 * @returns {Promise<Array>} Array of all groups
 */
export async function getAllGroups() {
  return [...data.groups];
}

/**
 * Get a group by ID
 * @param {string} id - Group UUID
 * @returns {Promise<Object|null>} Group object or null if not found
 */
export async function getGroupById(id) {
  const group = data.groups.find(g => g.id === id);
  return group ? { ...group } : null;
}

/**
 * Create a new group
 * @param {Object} group - Group data (name, description)
 * @returns {Promise<Object>} Created group with generated id and timestamps
 */
export async function createGroup(group) {
  const now = new Date().toISOString();
  const newGroup = {
    id: crypto.randomUUID(),
    name: group.name,
    description: group.description || '',
    createdAt: now,
    updatedAt: now
  };
  data.groups.push(newGroup);
  save();
  return { ...newGroup };
}

/**
 * Update an existing group
 * @param {string} id - Group UUID
 * @param {Object} changes - Fields to update
 * @returns {Promise<Object|null>} Updated group or null if not found
 */
export async function updateGroup(id, changes) {
  const index = data.groups.findIndex(g => g.id === id);
  if (index === -1) {
    return null;
  }

  const updated = {
    ...data.groups[index],
    ...changes,
    id: data.groups[index].id,
    createdAt: data.groups[index].createdAt,
    updatedAt: new Date().toISOString()
  };

  data.groups[index] = updated;
  save();
  return { ...updated };
}

/**
 * Delete a group
 * Requires group to have no breeds (Option B cascade behavior)
 * @param {string} id - Group UUID
 * @returns {Promise<boolean>} True if deleted, false if not found
 * @throws {Error} If group has breeds assigned
 */
export async function deleteGroup(id) {
  const index = data.groups.findIndex(g => g.id === id);
  if (index === -1) {
    return false;
  }

  const breedsInGroup = data.breeds.filter(b => b.groupId === id);
  if (breedsInGroup.length > 0) {
    throw new Error(`Cannot delete group: ${breedsInGroup.length} breed(s) assigned. Reassign or delete breeds first.`);
  }

  data.groups.splice(index, 1);
  save();
  return true;
}

// ============================================================================
// Breed CRUD Operations
// ============================================================================

/**
 * Get all breeds
 * @returns {Promise<Array>} Array of all breeds
 */
export async function getAllBreeds() {
  return [...data.breeds];
}

/**
 * Get a breed by ID
 * @param {string} id - Breed UUID
 * @returns {Promise<Object|null>} Breed object or null if not found
 */
export async function getBreedById(id) {
  const breed = data.breeds.find(b => b.id === id);
  return breed ? { ...breed } : null;
}

/**
 * Get all breeds in a specific group
 * @param {string} groupId - Group UUID
 * @returns {Promise<Array>} Array of breeds in the group
 */
export async function getBreedsByGroup(groupId) {
  return data.breeds.filter(b => b.groupId === groupId).map(b => ({ ...b }));
}

/**
 * Create a new breed
 * @param {Object} breed - Breed data (name, description, groupId)
 * @returns {Promise<Object>} Created breed with generated id and timestamps
 * @throws {Error} If groupId is invalid
 */
export async function createBreed(breed) {
  const groupExists = data.groups.some(g => g.id === breed.groupId);
  if (!groupExists) {
    throw new Error('Invalid groupId: group does not exist');
  }

  const now = new Date().toISOString();
  const newBreed = {
    id: crypto.randomUUID(),
    groupId: breed.groupId,
    name: breed.name,
    description: breed.description || '',
    createdAt: now,
    updatedAt: now
  };

  data.breeds.push(newBreed);
  save();
  return { ...newBreed };
}

/**
 * Update an existing breed
 * @param {string} id - Breed UUID
 * @param {Object} changes - Fields to update
 * @returns {Promise<Object|null>} Updated breed or null if not found
 * @throws {Error} If new groupId is invalid
 */
export async function updateBreed(id, changes) {
  const index = data.breeds.findIndex(b => b.id === id);
  if (index === -1) {
    return null;
  }

  if (changes.groupId !== undefined) {
    const groupExists = data.groups.some(g => g.id === changes.groupId);
    if (!groupExists) {
      throw new Error('Invalid groupId: group does not exist');
    }
  }

  const updated = {
    ...data.breeds[index],
    ...changes,
    id: data.breeds[index].id,
    createdAt: data.breeds[index].createdAt,
    updatedAt: new Date().toISOString()
  };

  data.breeds[index] = updated;
  save();
  return { ...updated };
}

/**
 * Delete a breed
 * @param {string} id - Breed UUID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteBreed(id) {
  const index = data.breeds.findIndex(b => b.id === id);
  if (index === -1) {
    return false;
  }

  data.breeds.splice(index, 1);
  save();
  return true;
}

// ============================================================================
// Import/Export Operations
// ============================================================================

/**
 * Export all data as JSON string
 * @returns {string} JSON string of all data with export timestamp
 */
export function exportData() {
  const exportPayload = {
    meta: {
      ...data.meta,
      exportedAt: new Date().toISOString()
    },
    groups: data.groups,
    breeds: data.breeds
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Import data from JSON string
 * @param {string} jsonString - JSON string matching expected schema
 * @returns {boolean} True if import successful
 * @throws {Error} If JSON is invalid or schema doesn't match
 */
export function importData(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    throw new Error('Invalid JSON format');
  }

  if (!parsed.meta || !parsed.groups || !parsed.breeds) {
    throw new Error('Invalid schema: missing required fields (meta, groups, breeds)');
  }

  if (parsed.meta.appName !== 'dog') {
    throw new Error('Invalid data: appName mismatch');
  }

  if (!Array.isArray(parsed.groups) || !Array.isArray(parsed.breeds)) {
    throw new Error('Invalid schema: groups and breeds must be arrays');
  }

  const groupIds = new Set(parsed.groups.map(g => g.id));
  for (const breed of parsed.breeds) {
    if (!groupIds.has(breed.groupId)) {
      throw new Error(`Invalid data: breed "${breed.name}" references non-existent group`);
    }
  }

  data = {
    meta: {
      appName: parsed.meta.appName,
      version: parsed.meta.version || '1.0.0'
    },
    groups: parsed.groups,
    breeds: parsed.breeds
  };

  save();
  return true;
}

/**
 * Clear all data (for testing or reset)
 */
export function clearAll() {
  data = {
    meta: {
      appName: 'dog',
      version: '1.0.0'
    },
    groups: [],
    breeds: []
  };
  save();
}
