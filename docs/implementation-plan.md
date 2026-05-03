# Implementation Plan

## Phase 1 — Data & layout foundation

- `src/hooks/usePatches.js` — fetch/create/update/delete patches via API, hold selected patch state
- `src/App.jsx` — two-column layout shell: map area (left) + panel area (right)

## Phase 2 — Garden map & drawing

- `src/utils/coords.js` — percentage↔pixel coordinate conversion utility (reused by drawing, move, and resize)
- `src/components/GardenMap.jsx` — static garden image with absolutely-positioned SVG overlay; mousedown/mousemove/mouseup drawing interaction; click-to-select dispatch
- `src/components/PatchRect.jsx` — renders a single `<rect>`, visually highlights when selected

## Phase 3 — Patch panel

- `src/components/PatchPanel.jsx` — editable fields (member dropdown, description, dates, season) and delete button; empty/placeholder state when nothing is selected
- Wire auto-select: after POST returns the new patch, immediately set it as selected

## Phase 4 — Season filtering

- Add `selectedSeason` state (defaults to current year) to `usePatches.js`; filter the patch list client-side
- Season selector UI in the panel (or header) — a simple dropdown or prev/next year control
- Deselect the current patch when switching seasons (it may not exist in the new season)
- New patches created while a season is active inherit that season value

## Phase 5 — Move & resize

- Add drag handles (corner + edge) to `PatchRect.jsx`, visible only when the patch is selected
- Add move/resize pointer-event logic to `GardenMap.jsx`, using `coords.js` for all coordinate math
- Use a pixel threshold to distinguish a click (select) from a drag (move/resize) before committing

## Notes

- Each phase is independently shippable.
- Phase 4 filters client-side (no extra API call); all patches are fetched once and filtered in memory.
- Phase 5 is fully separable — it does not block anything in Phase 4.
- The `coords.js` extraction in Phase 2 is intentional: inlining the math would require a refactor before Phase 4 can be cleanly added.