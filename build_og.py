#!/usr/bin/env python3
"""Render Beam's English and Arabic Open Graph preview cards with Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path("assets")
BG, SURFACE, INK = "#f7f5f0", "#fffefa", "#1e2926"
MUTED, ACCENT, MINT, FOREST = "#596661", "#e85d3f", "#e1ebe5", "#203b34"
REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
AR = "/usr/share/fonts/truetype/noto/NotoSansArabic[wdth,wght].ttf"

def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(path, size, layout_engine=ImageFont.Layout.RAQM)
    except OSError:
        return ImageFont.truetype(REG if path == AR else path, size)

def draw_device(draw: ImageDraw.ImageDraw) -> None:
    # Laptop
    draw.rounded_rectangle((660, 240, 1050, 490), radius=22, fill="#34443f")
    draw.rounded_rectangle((675, 255, 1035, 470), radius=14, fill=SURFACE)
    draw.ellipse((692, 269, 701, 278), fill=ACCENT)
    draw.ellipse((708, 269, 717, 278), fill="#e2b44f")
    draw.ellipse((724, 269, 733, 278), fill="#6aa584")
    for y, label, color in ((315, "PDF", ACCENT), (392, "JPG", "#598c76")):
        draw.rounded_rectangle((700, y, 750, y + 58), radius=8, fill=color)
        draw.text((708, y + 20), label, font=font(BOLD, 17), fill="white")
        draw.rounded_rectangle((770, y + 5, 920, y + 12), radius=5, fill="#dfe4dd")
        draw.rounded_rectangle((770, y + 24, 900, y + 31), radius=5, fill="#e8e9e1")
        draw.rounded_rectangle((770, y + 43, 870, y + 50), radius=5, fill="#e8e9e1")
    draw.polygon(((640, 490), (1070, 490), (1100, 515), (610, 515)), fill="#74847c")
    # Phone
    draw.rounded_rectangle((958, 294, 1104, 545), radius=32, fill="#263630")
    draw.rounded_rectangle((970, 307, 1092, 532), radius=25, fill=SURFACE)
    draw.rounded_rectangle((1005, 314, 1059, 322), radius=4, fill="#263630")
    draw.rounded_rectangle((1000, 365, 1063, 428), radius=16, fill=ACCENT)
    draw.text((1021, 367), "↑", font=font(BOLD, 37), fill="white")
    for i, height in enumerate((20, 31, 40, 28, 36, 24, 18)):
        x = 1002 + i * 9
        draw.rounded_rectangle((x, 445 + (40-height)//2, x + 4, 445 + (40+height)//2), radius=3, fill="#598c76")
    draw.line((895, 220, 1010, 220), fill=ACCENT, width=5)
    for x in (912, 946, 980):
        draw.ellipse((x, 212, x + 16, 228), fill=MINT, outline=ACCENT, width=4)

def make(lang: str) -> None:
    image = Image.new("RGB", (1200, 630), BG)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((620, 42, 1158, 588), radius=42, fill=MINT)
    # Beam mark
    draw.rounded_rectangle((78, 76, 138, 136), radius=15, fill=BG, outline=INK, width=3)
    draw.line((92, 123, 116, 86), fill=INK, width=7)
    draw.line((111, 125, 128, 99), fill=INK, width=6)
    draw.ellipse((121, 117, 132, 128), fill=ACCENT)
    draw.text((157, 78), "Beam", font=font(BOLD, 48), fill=INK)
    if lang == "ar":
        title = "انقل ملفاتك بين الهاتف\nوالكمبيوتر عبر الواي فاي"
        subtitle = "المستلم يحتاج إلى المتصفح فقط"
        note = "مجاني ومفتوح المصدر · من دون سحابة"
        rtl = True
    else:
        title = "Share files over Wi-Fi.\nNo receiver app needed."
        subtitle = "Move files between your phone and computer"
        note = "Free and open source · no cloud upload"
        rtl = False
    ftitle = font(AR if rtl else BOLD, 37 if rtl else 35)
    fsub = font(AR if rtl else REG, 22)
    fnote = font(AR if rtl else REG, 17)
    anchor = "ra" if rtl else "la"
    tx = 565 if rtl else 78
    draw.multiline_text((tx, 183), title, font=ftitle, fill=INK, spacing=13, anchor="ra" if rtl else "la", direction="rtl" if rtl else "ltr", align="right" if rtl else "left")
    draw.text((tx, 342), subtitle, font=fsub, fill=MUTED, anchor=anchor, direction="rtl" if rtl else "ltr")
    draw.rounded_rectangle((78, 425, 505, 485), radius=30, fill=FOREST)
    callout = "تنزيل مجاني" if rtl else "Free downloads for desktop + Android"
    draw.text((291, 445), callout, font=font(AR if rtl else BOLD, 19), fill="white", anchor="mm", direction="rtl" if rtl else "ltr")
    draw.text((78, 554), "omdaral.github.io/beam-website", font=font(REG, 16), fill=MUTED)
    draw_device(draw)
    image.save(OUT / ("og-cover-ar.png" if rtl else "og-cover.png"), optimize=True)

make("en")
make("ar")
