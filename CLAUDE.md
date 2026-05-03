# Garden Patch Designer Frontend

## Stack

- React 19 + Vite
- Tailwind CSS 4 (via `@tailwindcss/vite`)
- Axios (HTTP client for all API calls)
- Plain SVG overlay for patch labelling (no canvas library)
- JavaScript/JSX (no TypeScript)

## What it does

Single-page app displaying a static garden map image with an SVG overlay. Users can draw, view, edit, and delete rectangular patches on the image. Each patch is linked to a member and tracks what is being grown.

The layout has two areas: the garden map (left/main) and a patch detail panel (right/side). Clicking a patch selects it and populates the panel with editable fields. Creating a new patch auto-selects it, so the user lands directly in the panel with no separate form step. The panel also contains the delete action for the selected patch. Clicking outside any patch deselects and clears the panel.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
npm test         # Vitest unit tests (run once)
```

Unit tests are written with [Vitest](https://vitest.dev/) and live alongside the source files as `*.test.js`. Every utility/helper function in `src/utils/` must have a corresponding test file.

## Architecture

### Image + SVG overlay

The core UI is a static garden image with an `<svg>` element absolutely positioned on top, matching the image dimensions. All patches are rendered as `<rect>` elements inside the SVG.

Patch positions are stored as **percentages of image dimensions** (0–100) so the overlay is resolution-independent and works at any display size.

### Drawing interaction

Mouse events on the SVG handle rectangle drawing:
- `mousedown` — record start point
- `mousemove` — render a preview rect
- `mouseup` — confirm, POST to backend, auto-select the new patch

### Move / resize interaction

Clicking a patch selects it and reveals drag handles (corner/edge `<circle>` or `<rect>` elements). All pointer events use the same percentage coordinate system as drawing:
- **Move**: `mousedown` on the rect body, track `mousemove` delta, `mouseup` to PUT updated position
- **Resize**: `mousedown` on a handle, constrain to the relevant axis, `mouseup` to PUT updated dimensions
- Hit-testing distinguishes a drag from a click (threshold in px before committing to drag mode)

### Key components (suggested structure)

```
src/
├── components/
│   ├── GardenMap.jsx       # Image + SVG overlay, drawing logic, patch selection
│   ├── PatchRect.jsx       # Single <rect> with click-to-select, move/resize handles
│   └── PatchPanel.jsx      # Selected patch detail panel: editable fields + delete
├── hooks/
│   └── usePatches.js       # Fetch/create/update/delete patches via API
├── App.jsx                 # Two-column layout: GardenMap + PatchPanel
└── main.jsx
```

### API

Talks to the Strapi backend via REST. Base URL from `VITE_API_URL` env var.

Relevant endpoints:
- `GET /api/patches?populate=member` — list all patches
- `POST /api/patches` — create patch
- `PUT /api/patches/:id` — update patch
- `DELETE /api/patches/:id` — delete patch
- `GET /api/members` — list members (for owner dropdown)

### Data shape (patch)

```js
{
  x: 12.5,           // % of image width
  y: 34.0,           // % of image height
  width: 20.0,       // % of image width
  height: 15.0,      // % of image height
  season: 2025,      // required
  planted_at: null,  // optional date string
  harvested_at: null,// optional date string
  description: "",
  member: { id, name }
}
```

## Environment

```
VITE_API_URL=http://localhost:1337
```

## Resources

@docs/implementation-plan.md