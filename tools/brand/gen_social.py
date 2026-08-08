"""Generate the social / OG image set.

Everything is drawn from the token palette in tokens.css so these stay in sync
with the app surface. Copy is lifted from Landing.html so the card matches the
page it links to.
"""
import io
import math
import os
import cairosvg
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from tfcolor import RGB, GRAD_FROM, GRAD_TO

OUT = "build/social"
os.makedirs(OUT, exist_ok=True)
FDIR = os.path.expanduser("~/.fonts")

F = {
    "sans":   f"{FDIR}/Geist-Regular.ttf",
    "medium": f"{FDIR}/Geist-Medium.ttf",
    "semi":   f"{FDIR}/Geist-SemiBold.ttf",
    "mono":   f"{FDIR}/GeistMono-Regular.ttf",
    "monomed":f"{FDIR}/GeistMono-Medium.ttf",
    "serif":  f"{FDIR}/instrument-serif-latin-400-normal.ttf",
    "serifi": f"{FDIR}/instrument-serif-latin-400-italic.ttf",
}
font = lambda k, s: ImageFont.truetype(F[k], s)


def canvas(w, h):
    """Base surface: token bg + the two radial brand glows used app-wide."""
    img = Image.new("RGB", (w, h), RGB["bg"])
    glow = Image.new("RGB", (w, h), RGB["bg"])
    d = ImageDraw.Draw(glow)
    # iris glow, top-left  (mirrors radial-gradient at 5% -5%)
    r = int(w * 0.62)
    d.ellipse([-r // 3, -int(r * 0.72), int(r * 0.85), int(r * 0.62)],
              fill=(60, 45, 130))
    # rose/violet glow, bottom-right
    r2 = int(w * 0.44)
    d.ellipse([w - r2, h - int(r2 * 0.8), w + r2 // 2, h + r2 // 2],
              fill=(52, 30, 78))
    glow = glow.filter(ImageFilter.GaussianBlur(w // 9))
    return Image.blend(img, glow, 0.85)


def paste_mark(img, size, xy):
    png = cairosvg.svg2png(url="build/brand/logos/tf-mark.svg",
                           output_width=size, output_height=size)
    mark = Image.open(io.BytesIO(png)).convert("RGBA")
    img.paste(mark, xy, mark)


def tracked(draw, xy, text, fnt, fill, track=0):
    """Letter-spaced text — the mono eyebrows all use positive tracking."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + track
    return x


def chip(draw, xy, label, color, fnt):
    """Status tag, same geometry as the app's .tag component."""
    x, y = xy
    pad_x, r = 11, 7
    tw = sum(draw.textlength(c, font=fnt) + 0.9 for c in label)
    w, h = tw + pad_x * 2 + 17, 30
    draw.rounded_rectangle([x, y, x + w, y + h], radius=r,
                           fill=(*color, 30), outline=(*color, 110), width=1)
    cy = y + h / 2
    draw.ellipse([x + pad_x, cy - 3, x + pad_x + 6, cy + 3], fill=color)
    tracked(draw, (x + pad_x + 17, y + 8), label, fnt, color, 0.9)
    return x + w + 10


# ════════════════════════════════════════════════════════════════════════════
# og-image.png — 1200x630
# ════════════════════════════════════════════════════════════════════════════
def og_image():
    W, H = 1200, 630
    img = canvas(W, H)                      # RGB: lets ImageDraw alpha-blend
    d = ImageDraw.Draw(img, "RGBA")
    M = 76  # left margin

    # ── header lockup ──
    paste_mark(img, 52, (M, 62))
    d.text((M + 68, 74), "TeamFore", font=font("semi", 30), fill=RGB["text"])

    # ── mono eyebrow ──
    tracked(d, (M, 168), "TEAM AVAILABILITY INTELLIGENCE",
            font("monomed", 14), RGB["text_3"], 2.6)

    # ── headline, Instrument Serif, iris italic on the payoff line ──
    d.text((M, 206), "Know who’s actually available",
           font=font("serif", 74), fill=RGB["text"])
    d.text((M, 292), "before you plan the week.",
           font=font("serifi", 74), fill=RGB["iris"])

    # ── supporting line ──
    d.text((M, 400), "Leave, capacity, and sprint readiness in one calm surface.",
           font=font("sans", 23), fill=RGB["text_2"])

    # ── status chips: the product's actual vocabulary ──
    fm = font("monomed", 12)
    x = M
    for label, col in (("APPROVED", RGB["mint"]),
                       ("PENDING", RGB["amber"]),
                       ("OFF TODAY", RGB["coral"]),
                       ("REMOTE", RGB["sky"])):
        x = chip(d, (x, 470), label, col, fm)

    # ── footer ──
    d.line([(M, 552), (W - M, 552)], fill=RGB["border_soft"], width=1)
    d.text((M, 570), "teamfore.com", font=font("mono", 15), fill=RGB["text_3"])
    right = "Built for engineering managers"
    rw = d.textlength(right, font=font("sans", 15))
    d.text((W - M - rw, 569), right, font=font("sans", 15), fill=RGB["text_3"])

    # ── signature accent bar, iris -> mint (the progress-fill gradient) ──
    bar = Image.new("RGB", (W, 6))
    bd = ImageDraw.Draw(bar)
    for i in range(W):
        t = i / (W - 1)
        bd.line([(i, 0), (i, 6)], fill=tuple(
            round(RGB["iris"][c] + (RGB["mint"][c] - RGB["iris"][c]) * t)
            for c in range(3)))
    img.paste(bar, (0, H - 6))

    out = f"{OUT}/og-image.png"
    img.save(out, optimize=True)
    return out


# ════════════════════════════════════════════════════════════════════════════
# twitter-banner.png — 1500x500  (safe zone: centre, avatar overlaps lower-left)
# ════════════════════════════════════════════════════════════════════════════
def twitter_banner():
    W, H = 1500, 500
    img = canvas(W, H)                      # RGB: lets ImageDraw alpha-blend
    d = ImageDraw.Draw(img, "RGBA")
    cx = W // 2

    txt = "Know who’s actually available"
    f1 = font("serif", 62)
    tw = d.textlength(txt, font=f1)
    d.text((cx - tw / 2, 168), txt, font=f1, fill=RGB["text"])

    txt2 = "before you plan the week."
    f2 = font("serifi", 62)
    tw2 = d.textlength(txt2, font=f2)
    d.text((cx - tw2 / 2, 240), txt2, font=f2, fill=RGB["iris"])

    eb = "TEAM AVAILABILITY INTELLIGENCE"
    few = font("monomed", 13)
    ebw = sum(d.textlength(c, font=few) + 2.8 for c in eb)
    tracked(d, (cx - ebw / 2, 128), eb, few, RGB["text_3"], 2.8)

    paste_mark(img, 44, (cx - 22, 62))
    out = f"{OUT}/twitter-banner.png"
    img.save(out, optimize=True)
    return out


# ════════════════════════════════════════════════════════════════════════════
# linkedin-banner.png — 1128x191  (very short; single line only)
# ════════════════════════════════════════════════════════════════════════════
def linkedin_banner():
    W, H = 1128, 191
    img = canvas(W, H)                      # RGB: lets ImageDraw alpha-blend
    d = ImageDraw.Draw(img, "RGBA")
    paste_mark(img, 40, (56, 76))
    d.text((112, 82), "TeamFore", font=font("semi", 26), fill=RGB["text"])
    line = "Team availability intelligence for engineering managers."
    f1 = font("sans", 19)
    lw = d.textlength(line, font=f1)
    d.text((W - 56 - lw, 88), line, font=f1, fill=RGB["text_2"])
    out = f"{OUT}/linkedin-banner.png"
    img.save(out, optimize=True)
    return out


# ════════════════════════════════════════════════════════════════════════════
# avatar-400.png / avatar-200.png — square + circle-safe
# ════════════════════════════════════════════════════════════════════════════
def avatars():
    outs = []
    for size in (400, 200):
        png = cairosvg.svg2png(bytestring=f"""<svg width="{size}" height="{size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
    <stop stop-color="#9B8EF0"/><stop offset="1" stop-color="#6B52D6"/></linearGradient></defs>
  <rect width="40" height="40" fill="url(#g)"/>
  <g transform="translate(-2,-2) scale(1.1)">
    <path d="M8 13h24M8 20h16M8 27h10" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>
  </g>
</svg>""".encode(), output_width=size, output_height=size)
        p = f"{OUT}/avatar-{size}.png"
        Image.open(io.BytesIO(png)).convert("RGB").save(p, optimize=True)
        outs.append(p)
    return outs


if __name__ == "__main__":
    made = [og_image(), twitter_banner(), linkedin_banner(), *avatars()]
    print("-- generated --")
    for p in made:
        im = Image.open(p)
        print(f"{os.path.basename(p):24} {im.size}  {os.path.getsize(p) / 1024:6.1f} KB")
