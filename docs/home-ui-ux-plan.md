# Home Screen UI/UX Plan

Focused improvement plan for `app/(tabs)/index.tsx`. No backend or schema rewrite required; all items build on the existing `useKalamText` hook and static data.

## Goal

Make Home language-aware, easier to scan, and quicker to browse, without changing the app's visual identity (green/gold, card-based list).

## Current Pain Points

- Header is tall; content starts late
- No indication of how many kalams are readable in the selected language
- Search ignores English titles/verses
- Cards show title only — no poet, verse count, or favorite shortcut
- No filtering or sorting
- Dead vertical space on first open for most users

## Plan

### 1. Compact header

- Single row: app name + `LangSwitcher` (already the case) — reduce top/bottom padding (`spacing["5xl"]` → smaller)
- Search bar stays directly below, same component
- Remove one decorative circle on small screens if height feels heavy

**Files:** `(tabs)/index.tsx`

### 2. Language-aware availability line

- One line under search: e.g. "47 kalams · English"
- Count = `kalams.filter(availableInLang).length`, recomputed on lang change
- Hidden when count equals total (ur/hi mode)

**Files:** `(tabs)/index.tsx`, reuses `availableInLang` from `src/hooks/useKalamText.ts`

### 3. Search improvements

- Extend matching to `titleEn` and `versesEn`
- Search within the already availability-filtered list (done in current code — keep)
- Empty state: show the query and a clear-search action ("No results for “xyz”")

**Files:** `(tabs)/index.tsx`

### 4. Richer cards (`KalamCard`)

- Title (existing)
- Poet name (localized via `poetName`)
- Verse count of the resolved text
- Favorite heart toggle directly on the card (reuse `FavoritesContext`)
- RTL handling already content-aware via `isRtl(kalam)` — no change

**Files:** `src/components/KalamCard.tsx`

### 5. Category chips (needs decision)

- Chips: All / Naat / Manqabat / Salaam
- **Prerequisite:** `Kalam` has no category field today. Either:
  - (a) add `category?: "naat" | "manqabat" | "salaam"` to `src/types/index.ts` and backfill per file, or
  - (b) defer this phase until data exists
- Recommend (b) until backfill is done; chip UI can ship disabled-ready behind the data check

### 6. Recently viewed section

- Persist last 5 opened kalam IDs in AsyncStorage (`recent-kalams` key)
- Record on detail-screen mount (`app/kalam/[id].tsx`)
- Horizontal scroll row above the list, shown only when non-empty
- Same card style, compact width

**Files:** new `src/hooks/useRecentKalams.ts`, `(tabs)/index.tsx`, `app/kalam/[id].tsx`

## Order of Work

1. Header compaction + availability line (small, visible win)
2. Search fixes (correctness)
3. Card enrichment (biggest visual change)
4. Recently viewed (new persistence)
5. Category chips (blocked on data backfill)

## Acceptance Criteria

- Switching to en/ro shows only translated kalams with an accurate count line
- Searching finds matches across ur/ro/en fields
- Every card shows poet + verse count and toggles favorite inline
- Recent row appears after visiting any kalam and respects availability filter
- `npx tsc --noEmit` and `npm run lint` stay clean
