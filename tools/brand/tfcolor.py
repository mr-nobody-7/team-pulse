"""OKLCH -> sRGB hex, so generated assets match tokens.css exactly."""
import math


def _lin_to_srgb(c):
    if c <= 0.0031308:
        v = 12.92 * c
    else:
        v = 1.055 * (c ** (1 / 2.4)) - 0.055
    return max(0, min(255, round(v * 255)))


def oklch(L, C, H):
    h = math.radians(H)
    a, b = C * math.cos(h), C * math.sin(h)
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return (_lin_to_srgb(r), _lin_to_srgb(g), _lin_to_srgb(bb))


def hexof(L, C, H):
    return "#%02X%02X%02X" % oklch(L, C, H)


# TeamFore token palette (mirrors tokens.css)
TOKENS = {
    "bg":         (0.12, 0.011, 280),
    "surface":    (0.17, 0.014, 280),
    "surface_2":  (0.21, 0.013, 280),
    "surface_3":  (0.25, 0.012, 280),
    "border":     (0.27, 0.014, 280),
    "border_soft":(0.22, 0.012, 280),
    "text":       (0.96, 0.005, 280),
    "text_2":     (0.72, 0.008, 280),
    "text_3":     (0.50, 0.009, 280),
    "iris":       (0.66, 0.17, 285),
    "mint":       (0.80, 0.13, 165),
    "amber":      (0.83, 0.14, 80),
    "coral":      (0.74, 0.16, 25),
    "sky":        (0.78, 0.13, 230),
    "rose":       (0.76, 0.15, 350),
}
RGB = {k: oklch(*v) for k, v in TOKENS.items()}
HEX = {k: hexof(*v) for k, v in TOKENS.items()}

# Logo gradient stops are fixed hex in the brand spec
GRAD_FROM = (0x9B, 0x8E, 0xF0)
GRAD_TO = (0x6B, 0x52, 0xD6)

if __name__ == "__main__":
    for k in TOKENS:
        print(f"{k:12} {HEX[k]}  rgb{RGB[k]}")
