# Plan: Admin Artist Editor & Modal Consistency Fix

## Problem Statement

Two related issues:

1. **Admin Panel**: The "New Artist" page and "Edit Artist" page already share the same `ArtistForm` component, but the new artist form defaults to empty values that cause rendering issues in the public-facing modal.
2. **ArtistModal**: When a newly created artist is viewed in the modal on the Artists page, it looks broken — empty initials, empty sections with headers but no content.

---

## Current Architecture

```mermaid
flowchart TD
    A[Admin Artists List] -->|+ Add Artist| B[/admin/artists/new]
    A -->|Edit| C[/admin/artists/id/edit]
    B --> D[ArtistForm mode=create]
    C --> E[ArtistForm mode=edit]
    D -->|POST /api/artists| F[db.json]
    E -->|PUT /api/artists/id| F
    F -->|GET /api/artists| G[ArtistsSection]
    G --> H[ArtistModal]
```

### Key Files

| File | Role |
|------|------|
| `components/ArtistForm.tsx` | Shared form for create and edit |
| `components/ArtistModal.tsx` | Public-facing modal on Artists page |
| `sections/ArtistsSection.tsx` | Artists section with floating names |
| `app/admin/artists/new/page.tsx` | New artist page |
| `app/admin/artists/[id]/edit/page.tsx` | Edit artist page |
| `data/db.json` | Database with 5 existing artists |

---

## Root Causes

### Issue 1: New Artist form defaults are incomplete

In `ArtistForm.tsx` line 19-33, the default form state for a new artist:

```ts
const [form, setForm] = useState<Artist>(
  artist ?? {
    id: "",
    name: "",
    origin: "",
    role: "",
    genres: [],
    bio: [""],
    highlights: [],
    portfolio: [],
    socials: [],
    photo: undefined,
    visual: { initials: "", position: "high", tone: "from-stone-300/20" },
  },
);
```

**Problem**: `visual.initials` defaults to `""`. There is no auto-generation from the `name` field. When a user creates an artist and types a name but forgets to fill in initials, the modal will show a blank placeholder.

### Issue 2: ArtistModal does not gracefully handle empty data

In `ArtistModal.tsx`:

- **Line 108**: `{artist.visual.initials}` — renders nothing when empty
- **Lines 131-139**: Genres section renders the wrapper div even with empty array
- **Lines 148-157**: Highlights section renders the grid wrapper even with empty array
- **Lines 159-211**: Portfolio section always renders the "Portfolio" header even with no items
- **Lines 214-230**: Socials section always renders the wrapper even with empty array

---

## Detailed Fix Plan

### Step 1: Create a test artist in `db.json`

Add a 6th artist to `data/db.json` to verify the full admin flow end-to-end. This artist should have minimal data — just the required fields — to simulate what a newly created artist looks like:

```json
{
  "id": "test-dj",
  "name": "Test DJ",
  "origin": "AZ",
  "role": "DJ",
  "genres": ["House"],
  "bio": ["A test artist for verifying the admin flow."],
  "highlights": [],
  "portfolio": [],
  "socials": [],
  "visual": {
    "initials": "TD",
    "position": "middle",
    "tone": "from-stone-300/20"
  }
}
```

### Step 2: Fix `ArtistForm` — auto-generate `visual.initials` from name

In `components/ArtistForm.tsx`:

- Add a `useEffect` or modify the `name` field's `onChange` handler to auto-generate `visual.initials` from the artist name
- Logic: Take the first letter of each word in the name, uppercase them, and join. E.g., "Farik Interlude" → "FI", "Boraa" → "B"
- Only auto-generate when `mode === "create"` OR when `visual.initials` is empty/hasn't been manually edited
- Implementation approach: Track whether initials were manually edited. If not, auto-update on name change.

```
Name: "John Doe" → auto-fills Initials: "JD"
Name: "Boraa" → auto-fills Initials: "B"
```

### Step 3: Fix `ArtistModal` — hide empty sections

In `components/ArtistModal.tsx`, wrap each section with a conditional check:

1. **Genres** (line 131): `{artist.genres.length > 0 && (...)}`
2. **Highlights** (line 148): `{artist.highlights.length > 0 && (...)}`
3. **Portfolio** (line 159): `{artist.portfolio.length > 0 && (...)}`
4. **Socials** (line 214): `{artist.socials.length > 0 && (...)}`

This ensures that when a newly created artist has no portfolio or socials, those sections simply don't appear — matching the clean look of artists that do have data.

### Step 4: Fix `ArtistModal` — fallback initials from `artist.name`

In `components/ArtistModal.tsx` line 108, replace:

```tsx
{artist.visual.initials}
```

with a computed fallback:

```tsx
{artist.visual.initials || artist.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
```

This ensures that even if `visual.initials` is empty, the modal still shows meaningful initials derived from the name.

### Step 5: Verify the full flow

After all fixes:
1. Open `/admin/artists/new` → fill in name → verify initials auto-populate
2. Create a new artist with minimal data → save
3. Go to the public Artists page → click the new artist
4. Verify the modal looks consistent with other artists — no empty sections, initials visible
5. Go back to admin → edit the new artist → add portfolio/socials → save
6. Verify the modal now shows the added sections

---

## Files to Modify

| File | Change |
|------|--------|
| `data/db.json` | Add test artist |
| `components/ArtistForm.tsx` | Auto-generate initials from name |
| `components/ArtistModal.tsx` | Hide empty sections + fallback initials |

---

## Risk Assessment

- **Low risk**: All changes are UI-level and backward-compatible
- Existing artists with populated data will look identical
- The initials auto-generation only affects the form default, not existing data
- Hiding empty sections is purely additive — no layout shift for artists with data
