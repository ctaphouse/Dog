# CLAUDE.md - PWA Application Template

## Project Overview

This is a Progressive Web Application (PWA) designed to run on iOS devices via Safari "Add to Home Screen". The app is hosted on GitHub Pages and uses local JSON data storage with manual iCloud import/export capability.

**App Name**: dog
**Purpose**: keeps track of breeds and their associated groups
**Primary Entity**: Breed with brief description, Group with brief description, each breed is assigned to a group.

## Architecture Constraints

- **No build step**: Vanilla JavaScript with ES Modules only
- **Static hosting**: GitHub Pages (no server-side processing)
- **Data persistence**: localStorage with JSON import/export
- **Offline capable**: Service worker caches app shell
- **iOS optimized**: Touch-friendly UI, standalone display mode

## Project Structure

```
/
├── index.html              # Single page application entry
├── manifest.json           # PWA manifest for iOS/Android
├── sw.js                   # Service worker for offline support
├── css/
│   └── styles.css          # Mobile-first responsive styles
├── js/
│   ├── app.js              # Application initialization and routing
│   ├── store.js            # Data layer (localStorage + CRUD operations)
│   ├── ui.js               # DOM manipulation and rendering
│   ├── io.js               # Import/export file handlers
│   └── components/         # Optional: reusable UI components
├── data/
│   └── schema.json         # Data structure documentation
└── icons/
    ├── icon-192.png        # PWA icon (192x192)
    └── icon-512.png        # PWA icon (512x512)
```

## Coding Conventions

### JavaScript

- Use ES6+ modules with `type="module"` in script tags
- Prefer `const` over `let`; avoid `var`
- Use async/await for asynchronous operations
- Name files in lowercase with hyphens: `my-component.js`
- Name classes in PascalCase: `DataStore`
- Name functions and variables in camelCase: `getUserData()`
- Export one primary class or function set per module
- Include JSDoc comments for public functions

### CSS

- Mobile-first approach (min-width media queries)
- Use CSS custom properties for theming:
  ```css
  :root {
    --color-primary: #007AFF;
    --color-background: #F2F2F7;
    --spacing-unit: 8px;
  }
  ```
- Follow iOS Human Interface Guidelines for touch targets (minimum 44x44px)
- Use system font stack for native feel

### HTML

- Semantic HTML5 elements
- ARIA labels for accessibility
- Single `index.html` with dynamic content rendering

## Data Layer Pattern (store.js)

The store module must implement this interface:

```javascript
// Initialize with default data if localStorage is empty
init()

// Group CRUD Operations - return promises for consistency
getAllGroups()              // Returns array of all groups
getGroupById(id)            // Returns single group or null
createGroup(group)          // Returns created group with generated id
updateGroup(id, changes)    // Returns updated group
deleteGroup(id)             // Returns boolean; handles orphaned breeds (see below)

// Breed CRUD Operations
getAllBreeds()              // Returns array of all breeds
getBreedById(id)            // Returns single breed or null
getBreedsByGroup(groupId)   // Returns array of breeds in a group
createBreed(breed)          // Returns created breed with generated id
updateBreed(id, changes)    // Returns updated breed
deleteBreed(id)             // Returns boolean success

// Persistence
save()                      // Persist current state to localStorage
load()                      // Load state from localStorage

// Import/Export
exportData()                // Returns JSON string of all data
importData(jsonString)      // Replaces all data, returns boolean success
```

### Cascade Delete Behavior

When a group is deleted:
- Option A: Set orphaned breeds' `groupId` to `null` (soft orphan)
- Option B: Prevent deletion if group has breeds (require empty group)
- Option C: Delete all breeds in the group (cascade delete)

**Default**: Option B - require user to reassign or delete breeds first.

### Data Structure Requirements

- Every item must have a unique `id` field (use `crypto.randomUUID()`)
- Include `createdAt` and `updatedAt` ISO timestamps
- Breeds reference groups via `groupId` foreign key
- Store data with separate collections:
  ```javascript
  {
    "meta": {
      "appName": "dog",
      "version": "1.0.0",
      "exportedAt": "ISO_TIMESTAMP"
    },
    "groups": [
      {
        "id": "uuid",
        "name": "Herding",
        "description": "Breeds developed to herd livestock",
        "createdAt": "ISO_TIMESTAMP",
        "updatedAt": "ISO_TIMESTAMP"
      }
    ],
    "breeds": [
      {
        "id": "uuid",
        "groupId": "uuid",           // Foreign key to groups
        "name": "Border Collie",
        "description": "Highly intelligent herding dog",
        "createdAt": "ISO_TIMESTAMP",
        "updatedAt": "ISO_TIMESTAMP"
      }
    ]
  }
  ```

## Import/Export Pattern (io.js)

### Export Flow
1. Call `store.exportData()` to get JSON string
2. Create Blob with `application/json` MIME type
3. Generate filename with timestamp: `[app-name]-export-2024-01-15.json`
4. Create temporary anchor element with download attribute
5. Trigger click and cleanup

### Import Flow
1. Create hidden file input with `accept=".json"`
2. On file selection, read with FileReader
3. Validate JSON structure matches expected schema
4. Confirm with user before replacing existing data
5. Call `store.importData(jsonString)`
6. Refresh UI

### iCloud Integration Notes
- User manually moves exported files to iCloud Drive
- User manually selects files from iCloud Drive for import
- No direct iCloud API access from PWA

## Service Worker Requirements (sw.js)

Cache these resources for offline use:
- `index.html`
- `manifest.json`
- All CSS files
- All JS files
- App icons

Use cache-first strategy for app shell, network-first for any external resources.

Increment `CACHE_VERSION` constant when deploying updates:
```javascript
const CACHE_NAME = '[app-name]-v1';
```

## PWA Manifest Requirements (manifest.json)

Required fields:
```json
{
  "name": "[Full App Name]",
  "short_name": "[Short Name for Icon]",
  "start_url": "/[repo-name]/",
  "display": "standalone",
  "background_color": "#F2F2F7",
  "theme_color": "#007AFF",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Important**: `start_url` must include the repository name for GitHub Pages subdirectory hosting.

## iOS-Specific Considerations

Add these meta tags to `index.html`:
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="[App Name]">
<link rel="apple-touch-icon" href="icons/icon-192.png">
```

### iOS Limitations to Account For
- Service worker cache is limited (~50MB)
- localStorage is limited (~5MB)
- PWA may be purged if not used for several weeks
- No push notifications in iOS PWAs
- No background sync

## UI Patterns

### Required Views
1. **Groups List**: Display all groups with breed count
2. **Group Detail/Edit**: Full group view with edit capability, shows breeds in group
3. **Breeds List**: Display all breeds with group name
4. **Breed Detail/Edit**: Full breed view with edit capability, group selector
5. **Settings View**: Import/export buttons, app info

### Navigation
- Use a simple state-based router in `app.js`
- Store current view in URL hash for back button support
- Routes:
  - `#/groups` - Groups list (default view)
  - `#/groups/new` - Create new group
  - `#/groups/[id]` - View/edit group
  - `#/breeds` - All breeds list
  - `#/breeds/new` - Create new breed
  - `#/breeds/[id]` - View/edit breed
  - `#/settings` - Settings view
- No external routing libraries

### Touch Interactions
- Swipe actions for delete/archive (optional)
- Pull-to-refresh gesture (optional)
- Long-press for context menu (optional)

## GitHub Pages Deployment

1. Repository Settings → Pages → Source: Deploy from branch `main` (or `gh-pages`)
2. Site will be available at: `https://[username].github.io/[repo-name]/`
3. All asset paths must be relative or include repo name prefix

### Deployment Checklist
- [ ] Update `CACHE_VERSION` in `sw.js`
- [ ] Verify `start_url` in `manifest.json` matches repo path
- [ ] Test on iOS Safari before pushing
- [ ] Clear service worker cache on device after deployment if needed

## Testing Checklist

Before considering a feature complete:
- [ ] Works offline after initial load
- [ ] Data persists after closing and reopening
- [ ] Export produces valid, importable JSON
- [ ] Import correctly replaces existing data
- [ ] UI is usable on iPhone SE (small screen)
- [ ] Touch targets are at least 44x44px
- [ ] No console errors

### Breed/Group Relationship Tests
- [ ] Creating a breed with valid groupId succeeds
- [ ] Creating a breed with invalid groupId fails gracefully
- [ ] Deleting a group with breeds shows appropriate error/confirmation
- [ ] Breeds display their group name correctly
- [ ] Group detail view shows correct breed count
- [ ] Filtering breeds by group returns correct results

## Commands for Claude Code

When working on this project, prefer these approaches:

- **Create new component**: Generate in `js/components/` with corresponding CSS
- **Modify data structure**: Update `store.js` and `data/schema.json` together
- **Add new view**: Update router in `app.js`, add render function in `ui.js`
- **Style changes**: Use CSS custom properties when possible for consistency

## File Generation Order for New App

When scaffolding a new app from this template:
1. `data/schema.json` - Define the data structure first
2. `js/store.js` - Implement data layer
3. `index.html` - Basic HTML structure
4. `js/ui.js` - Rendering functions
5. `js/app.js` - Initialize and wire up
6. `css/styles.css` - Styling
7. `js/io.js` - Import/export
8. `sw.js` - Service worker
9. `manifest.json` - PWA manifest
10. Icons - Generate appropriately sized icons

---

## App-Specific Notes

[Add notes specific to this application here as development progresses]