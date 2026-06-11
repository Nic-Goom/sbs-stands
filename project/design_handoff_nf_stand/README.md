# Handoff: New Forest Show — Step by Step 3D Stand Concept

## Overview
An interactive 3D mock-up of Step by Step's **3×3 m exhibition stand** for the New Forest
Show. It renders a marquee bay with all the kit (banners, tension media wall, screen totem,
pull-up banners, desk, leaflet stand, game, staff area, front curtains) and lets you orbit,
zoom, jump to preset camera angles, and toggle options. It runs entirely in the browser with
[three.js](https://threejs.org/) — no build step, no server, no framework.

This package exists so the design can live in the **`Nic-Goom/sbs-kiosk`** repo and be served
live via GitHub Pages, and so updates can be pushed with git (e.g. from Claude Code).

## About the Design Files
Unlike a typical UI handoff, these files are **the finished artifact, not a reference to
re-implement**. It's plain HTML + JavaScript (three.js via CDN); you deploy it as-is. There is
nothing to port to React/Vue/etc. Two forms are included:

- **`New Forest Stand 3D (standalone).html`** — a single self-contained file (~840 KB) with all
  assets, fonts and code inlined. **This is the one to deploy** — it works offline by
  double-clicking and needs no other files. (three.js still loads from the unpkg CDN, so the
  live page needs internet; that's normal.)
- **Source files** (`New Forest Stand 3D.html` + `stand/*.js` + `assets/` + `fonts/`) — the
  editable version, split for maintainability. Edit these, then re-bundle to regenerate the
  standalone (see "Updating" below).

## Fidelity
**High-fidelity concept.** Colours, type (Veneer + Verdana) and brand assets are the real
Step by Step system. Physical dimensions are modelled to scale in metres (3×3 m pitch). It is a
*concept for discussion*, not a fabrication drawing — treat measurements as indicative.

## Repository layout
```
New Forest Stand 3D.html              # source entry point (loads stand/*.js)
stand/
  textures.js                         # canvas → three.js textures (all printed graphics)
  scene.js                            # builds the 3D scene (units = metres)
  main.js                             # renderer, orbit controls, camera presets, UI wiring
assets/                               # brand PNGs (logos, splashes, strokes, dots, heroes)
fonts/Veneer.otf                      # display font
New Forest Stand 3D (standalone).html # ← deploy THIS
```

## Deploying to GitHub Pages
1. Copy the standalone file into the repo (rename for a clean URL), e.g.:
   ```
   cp "New Forest Stand 3D (standalone).html" /path/to/sbs-kiosk/nf-stand.html
   cd /path/to/sbs-kiosk
   git add nf-stand.html
   git commit -m "Add New Forest Show 3D stand concept"
   git push origin main
   ```
2. In the repo on GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a
   branch → Branch: `main` / `/ (root)`** → Save.
3. Live link: **`https://nic-goom.github.io/sbs-kiosk/nf-stand.html`**
   (Pages can take a minute on first publish.)

If you'd rather commit the editable source instead of the bundle, copy the whole tree
(`New Forest Stand 3D.html`, `stand/`, `assets/`, `fonts/`) into the repo — Pages will serve it
too, as long as the relative paths are preserved.

## Updating the design
The split source is the source of truth. After editing `stand/*.js` or the HTML, regenerate the
single-file bundle so the deployed page reflects the change. The bundle is produced by inlining
every referenced asset/script/font into one HTML file. Any standard HTML "inliner" works
(e.g. an `html-inline` / `inline-source` style tool), or re-export it from the design tool that
created it. Then re-commit the standalone file and push — Pages redeploys automatically.

Workflow each round:
1. Edit `stand/scene.js` (geometry/positions), `stand/textures.js` (printed graphics), or the
   HTML panel (controls/legend).
2. Open `New Forest Stand 3D.html` locally to check it.
3. Re-bundle → overwrite `nf-stand.html` in the repo → `git commit` → `git push`.

## What's in the scene (so an editor knows where to look)
All geometry is in `stand/scene.js`, origin at the centre of the 3×3 m pitch, **+z faces the
visitors' walkway**, units in metres. Numbered items match the on-screen legend:

1. **Hoisted main banner** — free-standing timber frame, banner held high above the bunting.
2. **Tension-fabric media wall** (2.4 m) with LED spotlights; 600 mm access gap on the right;
   doubles as the divider. Moves between the real back wall and the 2 m line via the false-back
   toggle (`refs.displayGroup.position.z` in `main.js`).
3. **Screen on a dressed table** — Mobile Pixels on a 700×700 mm cloth-covered table with a
   printed cut-out surround.
4. **Two pull-up banners** (850 mm) on the left, forward of the wall.
5. **Pop-up desk + donation bucket** at the entry gap.
6. **Single-column leaflet stand** out front near the A-frame.
7. **"Step Up" staircase game** out front.
8. **Staff area** behind the divider — 700×700 table, chair, camping shelving unit (600×970×530).
9. **A-frame** board on the walkway.
   - **Front curtains** — cream tie-back curtains (fixed) with a toggleable cover drape
     (Off / White / Purple). The opening dimension (2.40 m tie-backs only → 2.10 m with a cover
     drape) is computed in `refs.setCurtain()` in `scene.js`.

## Controls / interactions (in `main.js`)
- **Camera presets:** Visitor, On stand, Staff area, Plan, Orbit (`PRESETS` object; eased fly-to).
- **Toggles:** false back + staff area, numbered labels, marquee roof (auto-lifts when looking
  down in plan).
- **Front curtains:** segmented control → `refs.setCurtain('off'|'white'|'purple')`, updates the
  on-floor dimension label and the panel readout.
- Orbit/zoom/pan via three.js `OrbitControls` (drag / scroll / right-drag).

## Design tokens (Step by Step brand)
- **Jacaranda (purple)** `#412576` · **Key Lime Pie (lime)** `#b3d12b` ·
  **Cerise (pink)** `#e60d8c` · **Turbo (yellow)** `#f4e600` · **Black** `#111111` ·
  **White** `#ffffff` · marquee green `#1d7d5c`.
- **Display type:** Veneer (`fonts/Veneer.otf`). **Body:** Verdana.

## Assets
`assets/` holds the Step by Step brand PNGs used to paint the printed graphics (logos, paint
splashes, strokes, halftone dots, hero photo, Be The Hero mark). All originate from the
Step by Step design system. `fonts/Veneer.otf` is the brand display face.

## Dependencies
- three.js **r137** + `OrbitControls`, loaded from the unpkg CDN in the HTML `<head>`. To make
  the page fully offline, download those two scripts into the repo and point the `<script>` tags
  at local copies.
