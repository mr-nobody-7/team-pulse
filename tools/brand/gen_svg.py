"""Write the canonical TeamFore brand SVG sources.

These are the single source of truth; every PNG/ICO is rendered from them.
Geometry and gradient stops taken verbatim from TeamFore_Asset_Package.html
section 03 (Logo System).
"""
import os
from tfcolor import HEX

OUT = "build/brand/logos"
os.makedirs(OUT, exist_ok=True)

GRAD = """  <defs>
    <linearGradient id="{gid}" x1="0" y1="0" x2="{s}" y2="{s}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#9B8EF0"/>
      <stop offset="1" stop-color="#6B52D6"/>
    </linearGradient>
  </defs>
"""

FILES = {}

# ── tf-mark.svg — 40x40 primary ─────────────────────────────────────────────
FILES["tf-mark.svg"] = f"""<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="TeamFore">
{GRAD.format(gid="tf-mark-grad", s=40)}  <rect width="40" height="40" rx="10" fill="url(#tf-mark-grad)"/>
  <rect x="0" y="0" width="40" height="1.5" rx="0.75" fill="#FFFFFF" fill-opacity="0.25"/>
  <path d="M8 13h24M8 20h16M8 27h10" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>
</svg>
"""

# ── tf-mark-28.svg — nav size, redrawn (not scaled) ─────────────────────────
FILES["tf-mark-28.svg"] = f"""<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="TeamFore">
{GRAD.format(gid="tf-mark-sm", s=28)}  <rect width="28" height="28" rx="8" fill="url(#tf-mark-sm)"/>
  <rect x="0" y="0" width="28" height="1" rx="0.5" fill="#FFFFFF" fill-opacity="0.25"/>
  <path d="M6 9h16M6 14h11M6 19h7" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
</svg>
"""

# ── tf-favicon.svg — 16x16, thicker strokes for small-size legibility ───────
FILES["tf-favicon.svg"] = f"""<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="TeamFore">
{GRAD.format(gid="tf-fav", s=16)}  <rect width="16" height="16" rx="3.5" fill="url(#tf-fav)"/>
  <path d="M3 5h10M3 8h7M3 11h4" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
</svg>
"""

# ── tf-wordmark-h.svg — horizontal lockup, text converted to paths at render
#    time; kept as <text> here for editability in design tools.
FILES["tf-wordmark-h.svg"] = f"""<svg width="176" height="40" viewBox="0 0 176 40" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="TeamFore">
{GRAD.format(gid="tf-wm-grad", s=40)}  <rect width="40" height="40" rx="10" fill="url(#tf-wm-grad)"/>
  <rect x="0" y="0" width="40" height="1.5" rx="0.75" fill="#FFFFFF" fill-opacity="0.25"/>
  <path d="M8 13h24M8 20h16M8 27h10" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>
  <text x="52" y="27" font-family="Geist, ui-sans-serif, system-ui, sans-serif" font-size="20" font-weight="600" letter-spacing="-0.4" fill="#FFFFFF">TeamFore</text>
</svg>
"""

# ── Monochrome variants — for single-colour printing, watermarks, dark/light ─
def mono(color, label):
    return f"""<svg width="176" height="40" viewBox="0 0 176 40" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="TeamFore">
  <rect width="40" height="40" rx="10" fill="none" stroke="{color}" stroke-width="1.5" stroke-opacity="0.45"/>
  <path d="M8 13h24M8 20h16M8 27h10" stroke="{color}" stroke-width="2.8" stroke-linecap="round"/>
  <text x="52" y="27" font-family="Geist, ui-sans-serif, system-ui, sans-serif" font-size="20" font-weight="600" letter-spacing="-0.4" fill="{color}">TeamFore</text>
</svg>
"""

FILES["tf-mono-white.svg"] = mono("#FFFFFF", "white")
FILES["tf-mono-black.svg"] = mono("#000000", "black")
FILES["tf-mono-iris.svg"] = mono(HEX["iris"], "iris")

# ── Glyph only, no container — for maskable icons and large-format use ──────
FILES["tf-glyph.svg"] = """<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="TeamFore">
  <path d="M8 13h24M8 20h16M8 27h10" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>
</svg>
"""

for name, body in FILES.items():
    with open(os.path.join(OUT, name), "w") as f:
        f.write(body)
    print("wrote", os.path.join(OUT, name))
