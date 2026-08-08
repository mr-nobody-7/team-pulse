# Brand asset generation

Source of truth for TeamFore's icons, favicons and social images. The SVGs in
`logos/` are generated too — regenerate rather than hand-editing anything here
or in `apps/web/public/`.

Colours come from `tfcolor.py`, which converts the OKLCH values in
`apps/web/app/globals.css` to sRGB hex, so generated assets match the running
app exactly instead of being eyeballed.

## Scripts

| Script | Writes to | Produces |
|---|---|---|
| `gen_svg.py` | `build/brand/logos/` | The `logos/*.svg` source set |
| `gen_icons.py` | `build/public/` | Favicons, PWA icons, multi-res `.ico` |
| `gen_social.py` | `build/social/` | OG image, X/LinkedIn banners, avatars |

```bash
cd tools/brand
python3 gen_svg.py
python3 gen_icons.py
python3 gen_social.py
```

They write into `build/` rather than straight into the app, so you can diff
before promoting. To publish:

```bash
cp build/public/favicon.ico build/public/favicon.svg build/public/*.png \
   ../../apps/web/public/
cp build/social/og-image.png ../../apps/web/public/
```

Do **not** copy `site.webmanifest` into `apps/web/public/`. Next serves the
manifest from `apps/web/app/manifest.ts` at `/manifest.webmanifest`; a static
one alongside it means two conflicting manifests.

Requirements: `cairosvg`, `Pillow`, and — for `gen_social.py` — Geist, Geist
Mono and Instrument Serif installed system-wide. If the OG headline renders in
a fallback face, the fonts are missing; the script does not fail loudly on that.

## Where the output lives

`apps/web/public/` — served, referenced by `app/layout.tsx` and `app/manifest.ts`:

| File | Purpose |
|---|---|
| `favicon.ico` | 16/32/48 multi-res, legacy browsers |
| `favicon.svg` | Modern browsers, scales cleanly |
| `favicon-16/32/48.png` | Explicit raster fallbacks |
| `apple-touch-icon.png` | 180×180, iOS home screen — opaque, no alpha |
| `android-chrome-192/512.png` | Android and PWA install |
| `icon-maskable-512.png` | Adaptive icon, glyph inside the 72% safe circle |
| `og-image.png` | 1200×630 link previews |

`social/` is for humans, not the build — profile headers and avatars for X,
LinkedIn and similar. Nothing imports it.

## Colour note

The brand docs quote `theme_color: #0f0e18`. The actual token
`--tf-bg: oklch(0.12 0.011 280)` resolves to **`#050509`**, which is what
`manifest.ts` and the `viewport` export use, so the PWA splash screen matches
the app surface. If you prefer the lighter value, change the token in
`globals.css` — not just the manifest, or the seam comes back.

## Icons are configured in `metadata`, not by file convention

`apps/web/app/` deliberately has no `icon.svg` or `opengraph-image.tsx`. Next
gives those file conventions precedence over the `metadata` config, so keeping
them would silently override the generated brand assets below.
