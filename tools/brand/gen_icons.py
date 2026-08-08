"""Render every raster icon from the brand SVG sources.

Rules applied:
- 16/32/48 use tf-favicon.svg geometry (thicker strokes survive downsampling).
- 180+ use tf-mark.svg geometry.
- apple-touch-icon is full-bleed opaque (iOS applies its own corner mask and
  composites transparency onto white, which would halo the rounded corners).
- maskable icon keeps all glyph content inside the 72% safe zone per the
  brand spec, on a full-bleed gradient so any mask shape reads as intentional.
"""
import io
import os
import cairosvg
from PIL import Image

SRC = "build/brand/logos"
PUB = "build/public"
os.makedirs(PUB, exist_ok=True)


def render(svg_path, size):
    png = cairosvg.svg2png(url=svg_path, output_width=size, output_height=size)
    return Image.open(io.BytesIO(png)).convert("RGBA")


def flatten(img, bg=(0, 0, 0, 255)):
    base = Image.new("RGBA", img.size, bg)
    return Image.alpha_composite(base, img)


# ── Small favicons from the 16px-optimised geometry ─────────────────────────
for size in (16, 32, 48):
    img = render(f"{SRC}/tf-favicon.svg", size)
    img.save(f"{PUB}/favicon-{size}.png")
    print(f"favicon-{size}.png")

# ── Multi-resolution .ico (16/32/48) ───────────────────────────────────────
ico_src = render(f"{SRC}/tf-favicon.svg", 256)
ico_src.save(f"{PUB}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("favicon.ico  (16/32/48)")

# ── apple-touch-icon: full-bleed, opaque, no transparency ──────────────────
apple = render(f"{SRC}/tf-mark.svg", 180)
# Redraw without corner radius by scaling the mark up 1.0 and flattening on
# the gradient's own darkest stop so corners read solid, not black.
apple_full = cairosvg.svg2png(
    bytestring=b"""<svg width="180" height="180" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
    <stop stop-color="#9B8EF0"/><stop offset="1" stop-color="#6B52D6"/></linearGradient></defs>
  <rect width="40" height="40" fill="url(#g)"/>
  <path d="M8 13h24M8 20h16M8 27h10" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>
</svg>""",
    output_width=180, output_height=180,
)
Image.open(io.BytesIO(apple_full)).convert("RGB").save(f"{PUB}/apple-touch-icon.png")
print("apple-touch-icon.png  180x180 opaque")

# ── Android / PWA icons: rounded mark, transparent corners ─────────────────
for size in (192, 512):
    render(f"{SRC}/tf-mark.svg", size).save(f"{PUB}/android-chrome-{size}.png")
    print(f"android-chrome-{size}.png")

# ── Maskable 512: glyph inside the Android safe-zone circle ────────────────
# Android guarantees only the central circle of radius 40% is visible. The
# glyph bounding box (24x14 units) is scaled so its DIAGONAL fits that circle,
# which is the constraint that actually matters -- fitting width alone would
# push the bar ends outside the mask on circular launchers.
GLYPH_W, GLYPH_H = 24.0, 14.0
SAFE_R = 0.40 * 40                      # 16 units
import math
scale = SAFE_R / math.hypot(GLYPH_W / 2, GLYPH_H / 2)
scale = min(scale, 1.10)                # cap so the mark keeps breathing room
tx = 20 - 20 * scale                    # glyph centre is (20, 20) in source
maskable = f"""<svg width="512" height="512" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
    <stop stop-color="#9B8EF0"/><stop offset="1" stop-color="#6B52D6"/></linearGradient></defs>
  <rect width="40" height="40" fill="url(#g)"/>
  <g transform="translate({tx:.4f},{tx:.4f}) scale({scale:.4f})">
    <path d="M8 13h24M8 20h16M8 27h10" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>
  </g>
</svg>"""
png = cairosvg.svg2png(bytestring=maskable.encode(), output_width=512, output_height=512)
Image.open(io.BytesIO(png)).convert("RGB").save(f"{PUB}/icon-maskable-512.png")
print(f"icon-maskable-512.png  512x512 (glyph scale {scale:.3f}, fits safe circle)")

# ── SVG favicon passthrough ───────────────────────────────────────────────
with open(f"{SRC}/tf-favicon.svg") as f:
    svg = f.read()
with open(f"{PUB}/favicon.svg", "w") as f:
    f.write(svg)
print("favicon.svg")

print("\n-- verification --")
for name in sorted(os.listdir(PUB)):
    p = f"{PUB}/{name}"
    if name.endswith(".png") or name.endswith(".ico"):
        im = Image.open(p)
        extra = ""
        if name.endswith(".ico"):
            extra = f" frames={sorted(im.info.get('sizes', []))}"
        print(f"{name:26} {im.size} {im.mode} {os.path.getsize(p):>7}B{extra}")
    else:
        print(f"{name:26} {os.path.getsize(p):>7}B")
