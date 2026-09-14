---
name: vibecode-analysis
description: >-
  Finds frontend screens that are hardcoded, mocked, or have no real data, then
  removes unused UI. Use when the user mentions vibe-code, hardcoded UI, mock
  data, placeholder screens, dead features, or asks to clean the frontend so it
  only shows live session/CV/coach data.
---

# Vibe-code analysis

Scan the React Native UI for screens that look finished but are not wired to real data. Prefer deleting unused chrome over inventing more mock data.

## Product truth (Spotter)

These are the only data sources that count:

- Live kinematic engine (`src/cv`, `useLiveTracker`)
- Local session log (`src/storage/workoutStore`)
- Gemini coach (`src/ai`, `backend/`)
- User-chosen lift (`LIFTS` in `src/data.ts`, `setLift`)

If a widget does not read one of those, it is vibe-code.

## Workflow

1. Inventory screens in `src/screens/` and tab routes in `App.tsx` / `src/components/TabBar.tsx`.
2. For each screen, classify every block:
   - **Live** — reads store, tracker, or Gemini
   - **Hardcoded** — numbers, lists, or status copied from a design
   - **Empty / toast stub** — tap does `showToast('…full app')` or similar
   - **Dead** — exported but unused, or a setting that does not change any value
3. Grep for leftover mocks: `TODAY_SETS`, `SESSIONS`, `LIB`, `REPDATA`, `showToast(`, fake scores, fake streaks.
4. Apply this rule:
   - Hardcoded list with a real source → replace with the source, empty state if none
   - Entire screen with no source (Learn-style catalogs) → delete screen, tab, types, icons
   - Control with no effect (units, mute, share) → remove
5. Delete now-unused `data.ts` exports, icon components, and types. Run `npx tsc --noEmit`.

## Do not

- Replace one mock with another mock
- Keep a tab “for later” if it has no data
- Leave `showToast('opens in the full app')` affordances
