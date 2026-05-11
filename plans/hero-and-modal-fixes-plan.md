# Hero Logo & Artist Modal Fixes Plan

## Overview

Three targeted fixes: logo transparency, logo movement dampening, and artist modal standardization.

---

## Fix 1: Hero Logo — Fully Transparent Except Letters

### Problem
The logo image (`/assets/images/logo.png`) has an opaque background visible behind the letterforms. The letters should appear to float directly on the hero background with no surrounding fill.

### Root Cause
The source PNG file likely contains a solid or semi-opaque background layer instead of being cut out to just the letter shapes.

### Solution — Two-layer approach

**A. CSS blend-mode safeguard (code change in `Logo3D.tsx`)**
Add `mix-blend-mode: screen` to the `<Image>` element. On the dark hero background, this makes black/dark areas fully transparent while preserving white/light letterforms. This works as an immediate CSS-only fix regardless of the source file.

**B. Replace source image (asset change)**
Replace `public/assets/images/logo.png` with a properly exported version that has a truly transparent background — only the letter shapes should be opaque. This is the robust long-term fix.

### File Changes
| File | Change |
|------|--------|
| [`Logo3D.tsx`](components/Logo3D.tsx:53) | Add `mix-blend-mode: screen` to the `<Image>` className or style |
| `public/assets/images/logo.png` | Replace with transparent-background version |

---

## Fix 2: Hero Logo — Less Aggressive Cursor Movement

### Problem
The 3D tilt effect on hover is too aggressive — the logo swings up to ±15° with a stiff, snappy spring, making it feel jittery.

### Current Values in [`Logo3D.tsx`](components/Logo3D.tsx:21)
| Parameter | Current | Issue |
|-----------|---------|-------|
| Max rotation | `x * 15` / `-y * 15` = ±15° | Too much tilt |
| Spring stiffness | `200` | Too snappy |
| Spring damping | `20` | Too bouncy |
| Drop-shadow multiplier | `Math.abs(rotateY) * 2` / `* 3` | Exaggerates the motion visually |

### Proposed Values
| Parameter | New | Rationale |
|-----------|-----|-----------|
| Max rotation | `x * 6` / `-y * 6` = ±6° | Subtle tilt, still perceptible |
| Spring stiffness | `120` | Slower response, less jerky |
| Spring damping | `30` | Settles faster, no wobble |
| Drop-shadow multiplier | `Math.abs(rotateY) * 1` / `* 1.5` | Shadow follows the gentler motion |

### File Changes
| File | Change |
|------|--------|
| [`Logo3D.tsx`](components/Logo3D.tsx:21) | Reduce rotation multipliers from 15→6, adjust spring stiffness 200→120 and damping 20→30, tone down shadow multipliers |

---

## Fix 3: Artist Modals — Standardize All to Pedro Size

### Problem
Artist modals vary in size because:
1. The modal article uses `min-h-[70vh]` with no fixed height — content pushes it taller
2. The photo/placeholder area uses `aspect-[2/3]` with `min-h-[300px]` — no max constraint
3. The right column has `lg:max-h-[70vh]` but the overall modal can grow beyond that
4. Artists with more bio text, portfolio items, or socials create taller modals

Pedro is the reference standard. His modal has: no photo, moderate bio, 2 portfolio items, 2 socials.

### Solution — Fixed modal dimensions

**A. Set a fixed height on the modal article**
Replace `min-h-[70vh]` with a fixed `h-[80vh]` or `h-[75vh]` so every modal is exactly the same pixel height regardless of content.

**B. Fix the photo/placeholder container size**
Replace `min-h-[300px] aspect-[2/3]` with a fixed `h-[340px]` or similar absolute height so the photo area is identical for all artists.

**C. Make the right column scroll within fixed bounds**
The right column already has `lg:max-h-[70vh] overflow-y-auto`. With a fixed modal height, this will consistently scroll when content overflows.

**D. Ensure consistent padding and gap**
The grid layout `lg:grid-cols-[0.88fr_1.12fr]` is already consistent — no change needed there.

### File Changes
| File | Change |
|------|--------|
| [`ArtistModal.tsx`](components/ArtistModal.tsx:71) | Change `min-h-[70vh]` → fixed height like `h-[80vh]` on the `<motion.article>` |
| [`ArtistModal.tsx`](components/ArtistModal.tsx:107) | Change photo container from `min-h-[300px] aspect-[2/3]` → fixed `h-[340px]` |
| [`ArtistModal.tsx`](components/ArtistModal.tsx:132) | Verify right column `lg:max-h-[70vh]` works with new fixed modal height — may need adjustment to `lg:max-h-[80vh]` or similar |

---

## Summary of All File Changes

| # | File | What Changes |
|---|------|-------------|
| 1a | [`components/Logo3D.tsx`](components/Logo3D.tsx:53) | Add `mix-blend-mode: screen` to logo Image |
| 1b | `public/assets/images/logo.png` | Replace with transparent-background PNG |
| 2 | [`components/Logo3D.tsx`](components/Logo3D.tsx:21) | Reduce rotation 15→6, stiffness 200→120, damping 20→30, shadow multipliers |
| 3 | [`components/ArtistModal.tsx`](components/ArtistModal.tsx:71) | Fixed modal height, fixed photo area height, adjust right column max-height |
