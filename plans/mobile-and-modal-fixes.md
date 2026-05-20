# Plan: Mobile & Modal UI Fixes

## Problem Summary

1. **Artists section** — too tall/long on mobile
2. **Artist modal** — long names overflow on desktop; needs a scalable solution for admin-created artists
3. **Contacts section** — too large on mobile, not user-friendly

---

## Issue 1: Artists Section — Mobile Too Long

### Root Cause

In [`ArtistsSection.tsx`](sections/ArtistsSection.tsx:34) the section has `min-h-screen`, and the inner container at line 47 has `min-h-[480px]`. All 5 artists are **absolutely positioned** with `top` calculated as `14 + (index / count) * 68`% — spreading them across ~68% of the container height. On a mobile viewport this creates excessive vertical space.

### Solution: Switch to flex layout on mobile

On mobile, replace the absolute-positioned scattered layout with a simple **flex column** layout. Keep the scattered absolute layout for desktop.

**Changes in [`ArtistsSection.tsx`](sections/ArtistsSection.tsx):**

- Remove `min-h-screen` from the section on mobile; use `md:min-h-screen` instead
- Change the inner container from always-absolute to a **responsive split**:
  - Mobile: `flex flex-col gap-6` — artists stack vertically with controlled spacing
  - Desktop: current absolute positioning preserved
- Each artist button:
  - Mobile: `relative` positioning, no inline `top/left/right` styles
  - Desktop: `absolute` positioning with current inline styles
- Reduce floating animation amplitude on mobile or disable it in flex mode
- The `hoveredId` dimming effect still works in both layouts

**Implementation approach:**

```
Inner container:
  className="relative mx-auto max-w-7xl
             flex flex-col gap-5 pt-2          ← mobile: flex column
             md:min-h-[760px] md:block"       ← desktop: absolute layout

Each artist button:
  className="... relative md:absolute ..."
  style on mobile: no top/left/right
  style on desktop: current top/left/right via inline styles
```

Use a `useMediaQuery('(min-width: 768px)')` or CSS-only approach to conditionally apply absolute positioning. The CSS-only approach is cleaner — use `md:absolute` and only set inline styles when above `md`.

---

## Issue 2: Artist Modal — Name Overflow on Desktop

### Root Cause

In [`ArtistModal.tsx`](components/ArtistModal.tsx:128) the artist name uses `text-5xl sm:text-7xl` — that is 72px on desktop. The name sits inside the photo column which is `0.88fr` of a `max-w-4xl` grid ≈ ~394px minus padding ≈ ~330px available. "FARIK INTERLUDE" at 72px uppercase ≈ 720px — more than double the available width. The text wraps but looks cramped and may clip.

### Solution: Responsive font sizing + text balancing

Make the name font size scale with the container and add proper text-wrap utilities. This handles any future artist name length.

**Changes in [`ArtistModal.tsx`](components/ArtistModal.tsx:128):**

1. Replace fixed `text-5xl sm:text-7xl` with `clamp()`-based sizing:
   ```
   text-[clamp(1.75rem,4.5cqi,4.5rem)]
   ```
   This uses CSS container query inline units so the font scales with the column width.

2. Add `text-balance break-words` to the `<h3>`:
   - `text-balance` — distributes lines evenly when wrapping
   - `break-words` — breaks long unbreakable words

3. Add `@container` support: wrap the modal article in a `@container` context by adding `container-type: inline-size` to the grid parent.

**Fallback if container queries are not available in the Tailwind config:**
Use a simpler clamp: `text-[clamp(1.75rem,5vw,4.5rem)]` — viewport-based but still responsive.

**Additional safety net in [`globals.css`](app/globals.css):**
```css
.artist-modal-name {
  overflow-wrap: break-word;
  word-break: break-word;
  text-wrap: balance;
}
```

---

## Issue 3: Contacts Section — Mobile Too Large

### Root Cause

In [`ContactsSection.tsx`](sections/ContactsSection.tsx:66) the two panels stack vertically on mobile. The booking form has a 4-row textarea, generous padding, and large headings. The contact links panel adds more vertical space below.

### Solution: Tab-based layout on mobile

On mobile, show **one panel at a time** using a tab switcher. This halves the vertical space. On desktop, keep the current side-by-side grid.

**Changes in [`ContactsSection.tsx`](sections/ContactsSection.tsx):**

1. Add a `activeTab` state: `"book" | "contact"`

2. On mobile, render a tab bar above the content:
   ```
   <div className="flex gap-2 mb-4 lg:hidden">
     <button>Book</button>
     <button>Contact</button>
   </div>
   ```

3. Conditionally render panels based on `activeTab` on mobile; show both on desktop:
   ```
   {(activeTab === "book" || isDesktop) && <BookingPanel />}
   {(activeTab === "contact" || isDesktop) && <ContactPanel />}
   ```

4. Additional mobile optimizations within each panel:
   - Reduce textarea `rows` from 4 to 2 on mobile: `rows={2} sm:rows={4}`
   - Reduce heading from `text-2xl` to `text-xl` on mobile: `text-xl sm:text-2xl`
   - Tighten padding: `p-4 sm:p-6 lg:p-8` — already partially done, ensure consistency
   - Reduce spacing between form fields: `mt-5` → `mt-3 sm:mt-5` on mobile
   - Make contact link items more compact: `p-3 sm:p-4 lg:p-5`

5. Use `useMediaQuery` or CSS `lg:hidden` / `lg:block` to handle the tab visibility without JS for the toggle.

**Simpler alternative if tabs feel over-engineered:**
Just compact everything on mobile without tabs:
- `rows={2} sm:rows={4}` on textarea
- Reduce all `mt-*` spacing by one step on mobile
- Smaller heading sizes
- Compact contact link items

---

## Files to Modify

| File | Changes |
|------|---------|
| [`sections/ArtistsSection.tsx`](sections/ArtistsSection.tsx) | Mobile flex layout, remove min-h-screen on mobile |
| [`components/ArtistModal.tsx`](components/ArtistModal.tsx) | Responsive name font sizing, text-balance, break-words |
| [`sections/ContactsSection.tsx`](sections/ContactsSection.tsx) | Mobile tab layout or compacting, reduced textarea rows |
| [`app/globals.css`](app/globals.css) | Optional: artist-modal-name utility class |
| [`lib/useMediaQuery.ts`](lib/useMediaQuery.ts) | Possibly used for tab state in ContactsSection |

---

## Execution Order

1. **ArtistModal name fix** — self-contained, no cross-component impact
2. **ArtistsSection mobile layout** — independent change
3. **ContactsSection mobile compact** — independent change
4. **Visual QA** — check all three on mobile and desktop viewports
