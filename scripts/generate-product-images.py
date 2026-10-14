#!/usr/bin/env python3
"""
Generates local SVG demo product illustrations for the Southern Cross Tools
storefront. Reads the product seeds from lib/demo-data.ts so every SKU gets
an image, plus hero + category artwork in public/images.

Usage:  python3 scripts/generate-product-images.py <project-root>
Output: public/images/products/sku-XXXX.svg
        public/images/categories/<slug>.svg
        public/images/hero-tools.svg
"""
import os, re, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()

INK = "#1f2937"      # dark body
STEEL = "#94a3b8"    # metal
LIGHT = "#e2e8f0"
ORANGE = "#f97316"   # safety accent
YELLOW = "#facc15"
WOOD = "#a16207"
WHITE = "#f8fafc"
BG_HOLE = "#ffffff"

CATEGORY_BG = {
    "Power Tools": ("#dbeafe", "#bfdbfe"),
    "Hand Tools": ("#fef3c7", "#fde68a"),
    "Accessories": ("#ccfbf1", "#99f6e4"),
    "Safety": ("#ffedd5", "#fed7aa"),
    "Measuring": ("#ecfccb", "#d9f99d"),
}

# ---------- tool drawings (each centred on ~200,200) ----------

def drill(c=INK):
    return f'''
    <rect x="112" y="150" width="150" height="66" rx="24" fill="{c}"/>
    <rect x="196" y="206" width="42" height="92" rx="16" fill="{c}" transform="rotate(12 217 252)"/>
    <rect x="252" y="160" width="26" height="46" rx="6" fill="{ORANGE}"/>
    <rect x="278" y="174" width="58" height="18" rx="4" fill="{STEEL}"/>
    <rect x="100" y="205" width="78" height="30" rx="8" fill="{STEEL}"/>
    <rect x="128" y="162" width="76" height="8" rx="4" fill="{LIGHT}" opacity=".35"/>
    <circle cx="138" cy="183" r="7" fill="{ORANGE}"/>'''

def grinder(c=INK):
    return f'''
    <circle cx="150" cy="210" r="92" fill="{STEEL}"/>
    <circle cx="150" cy="210" r="34" fill="{c}"/>
    <path d="M70 160 A110 110 0 0 1 218 112" fill="none" stroke="{c}" stroke-width="16" stroke-linecap="round"/>
    <rect x="200" y="180" width="130" height="40" rx="18" fill="{c}"/>
    <rect x="300" y="170" width="46" height="60" rx="12" fill="{ORANGE}"/>'''

def saw(c=INK):
    teeth = []
    x = 96
    while x < 320:
        teeth.append(f"{x},220 {x+8},250")
        x += 14
    pts = " ".join(f"{p}" for p in teeth)
    return f'''
    <rect x="72" y="150" width="78" height="54" rx="20" fill="{c}"/>
    <rect x="72" y="150" width="34" height="54" rx="12" fill="{ORANGE}"/>
    <path d="M150 196 L330 196 L330 222 L150 222 Z" fill="{STEEL}"/>
    <polyline points="{pts}" fill="none" stroke="{STEEL}" stroke-width="10" stroke-linejoin="miter"/>
    <path d="M96 220 L320 220" stroke="{LIGHT}" stroke-width="3" opacity=".6"/>'''

def hacksaw(c=INK):
    return f'''
    <rect x="70" y="190" width="60" height="26" rx="10" fill="{c}"/>
    <path d="M130 200 L332 200" stroke="{STEEL}" stroke-width="10"/>
    <path d="M130 200 L332 200" stroke="{INK}" stroke-width="2" stroke-dasharray="6 6"/>
    <rect x="316" y="190" width="40" height="22" rx="8" fill="{c}"/>
    <path d="M128 176 L120 166" stroke="{ORANGE}" stroke-width="6"/>'''

def hammer(c=INK):
    return f'''
    <rect x="186" y="150" width="26" height="210" rx="12" fill="{WOOD}"/>
    <rect x="120" y="112" width="170" height="56" rx="8" fill="{c}"/>
    <rect x="262" y="112" width="30" height="34" rx="6" fill="{STEEL}"/>
    <path d="M120 140 L92 120 L92 150 L120 150 Z" fill="{STEEL}"/>
    <rect x="132" y="120" width="10" height="40" rx="3" fill="{ORANGE}" opacity=".7"/>'''

def wrench(c=INK):
    return f'''
    <g transform="rotate(-38 200 200)">
      <rect x="92" y="184" width="216" height="32" rx="16" fill="{c}"/>
      <circle cx="96" cy="200" r="42" fill="{c}"/>
      <circle cx="96" cy="200" r="18" fill="{BG_HOLE}"/>
      <circle cx="300" cy="200" r="30" fill="{c}"/>
      <rect x="300" y="186" width="34" height="28" fill="{BG_HOLE}"/>
      <rect x="112" y="190" width="150" height="6" rx="3" fill="{ORANGE}" opacity=".8"/>
    </g>'''

def plier(c=INK):
    return f'''
    <path d="M200 210 L122 140" stroke="{c}" stroke-width="26" stroke-linecap="round"/>
    <path d="M200 210 L278 140" stroke="{c}" stroke-width="26" stroke-linecap="round"/>
    <path d="M122 140 L92 96" stroke="{ORANGE}" stroke-width="26" stroke-linecap="round"/>
    <path d="M278 140 L308 96" stroke="{ORANGE}" stroke-width="26" stroke-linecap="round"/>
    <circle cx="200" cy="210" r="16" fill="{STEEL}"/>
    <path d="M160 260 L240 260 L232 300 L168 300 Z" fill="{c}" opacity=".0"/>'''

def screwdriver(c=INK, handle=ORANGE):
    return f'''
    <rect x="96" y="180" width="110" height="42" rx="20" fill="{handle}"/>
    <rect x="100" y="186" width="90" height="8" rx="4" fill="{WHITE}" opacity=".35"/>
    <rect x="206" y="193" width="120" height="16" rx="3" fill="{STEEL}"/>
    <path d="M326 193 L346 201 L326 209 Z" fill="{STEEL}"/>'''

def tape(c=INK):
    ticks = "".join(f'<line x1="{262+i*12}" y1="262" x2="{262+i*12}" y2="{276 if i%5 else 286}" stroke="{INK}" stroke-width="2"/>' for i in range(9))
    return f'''
    <rect x="236" y="250" width="124" height="26" rx="4" fill="{YELLOW}"/>
    {ticks}
    <circle cx="170" cy="200" r="100" fill="{ORANGE}"/>
    <circle cx="170" cy="200" r="62" fill="{c}"/>
    <circle cx="170" cy="200" r="22" fill="{STEEL}"/>
    <rect x="62" y="150" width="60" height="18" rx="6" fill="{c}" opacity="0"/>'''

def level(c=INK):
    return f'''
    <rect x="46" y="172" width="308" height="58" rx="8" fill="{YELLOW}"/>
    <rect x="46" y="172" width="308" height="12" rx="6" fill="{ORANGE}" opacity=".85"/>
    <rect x="150" y="184" width="100" height="34" rx="17" fill="#e0f2fe" stroke="{c}" stroke-width="4"/>
    <circle cx="200" cy="201" r="8" fill="{c}"/>
    <rect x="182" y="150" width="36" height="22" rx="4" fill="{c}"/>
    <line x1="80" y1="210" x2="80" y2="222" stroke="{c}" stroke-width="3"/>
    <line x1="110" y1="210" x2="110" y2="218" stroke="{c}" stroke-width="3"/>
    <line x1="290" y1="210" x2="290" y2="222" stroke="{c}" stroke-width="3"/>'''

def device(c=INK, mode="beam"):
    beam = ""
    if mode == "beam":
        beam = f'<line x1="300" y1="170" x2="372" y2="150" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/><circle cx="372" cy="150" r="7" fill="#ef4444"/>'
    if mode == "probe":
        beam = f'<rect x="270" y="236" width="18" height="110" rx="8" fill="{STEEL}"/><path d="M270 236 L280 218 L288 236 Z" fill="{STEEL}"/>'
    if mode == "arc":
        beam = f'<path d="M300 170 A62 62 0 0 1 300 290" fill="none" stroke="{ORANGE}" stroke-width="8" stroke-linecap="round"/>'
    return f'''
    <rect x="112" y="120" width="170" height="168" rx="24" fill="{c}"/>
    <rect x="132" y="142" width="130" height="62" rx="8" fill="#67e8f9" opacity=".85"/>
    <text x="197" y="186" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" text-anchor="middle" fill="{INK}">24.7</text>
    <circle cx="150" cy="238" r="12" fill="{ORANGE}"/>
    <circle cx="190" cy="238" r="12" fill="{STEEL}"/>
    <circle cx="230" cy="238" r="12" fill="{STEEL}"/>
    <rect x="150" y="262" width="100" height="10" rx="5" fill="{STEEL}"/>
    {beam}'''

def caliper(c=INK):
    return f'''
    <rect x="50" y="186" width="300" height="28" rx="6" fill="{STEEL}"/>
    <rect x="74" y="152" width="22" height="90" rx="4" fill="{c}"/>
    <rect x="128" y="160" width="14" height="70" rx="3" fill="{c}"/>
    <rect x="236" y="164" width="16" height="62" rx="3" fill="{c}"/>
    <rect x="236" y="130" width="92" height="46" rx="8" fill="{c}"/>
    <rect x="246" y="138" width="72" height="20" rx="4" fill="#67e8f9" opacity=".85"/>
    <rect x="66" y="222" width="268" height="6" rx="3" fill="{ORANGE}" opacity=".8"/>'''

def machine(c=INK):
    return f'''
    <path d="M140 150 Q200 96 260 150" fill="none" stroke="{c}" stroke-width="14" stroke-linecap="round"/>
    <rect x="86" y="150" width="228" height="128" rx="16" fill="{c}"/>
    <rect x="86" y="236" width="228" height="20" rx="6" fill="{ORANGE}"/>
    <circle cx="150" cy="200" r="28" fill="{STEEL}"/>
    <circle cx="150" cy="200" r="10" fill="{c}"/>
    <rect x="200" y="182" width="76" height="16" rx="6" fill="{STEEL}"/>
    <rect x="200" y="206" width="54" height="16" rx="6" fill="{YELLOW}"/>
    <rect x="150" y="278" width="100" height="10" rx="5" fill="{STEEL}"/>'''

def tank(c=INK):
    return f'''
    <rect x="96" y="176" width="210" height="100" rx="48" fill="#dc2626"/>
    <rect x="130" y="176" width="16" height="100" fill="#ffffff" opacity=".12"/>
    <rect x="132" y="130" width="120" height="50" rx="14" fill="{c}"/>
    <circle cx="170" cy="155" r="14" fill="{STEEL}"/>
    <circle cx="214" cy="155" r="14" fill="{STEEL}"/>
    <path d="M306 226 Q340 226 340 264 L340 282" fill="none" stroke="{INK}" stroke-width="10" stroke-linecap="round"/>
    <rect x="100" y="270" width="20" height="36" rx="4" fill="{c}"/>
    <rect x="256" y="270" width="20" height="36" rx="4" fill="{c}"/>'''

def heatgun(c=INK, nozzle=ORANGE):
    return f'''
    <rect x="98" y="184" width="150" height="56" rx="22" fill="{c}"/>
    <path d="M246 190 L318 200 L318 226 L246 232 Z" fill="{STEEL}"/>
    <rect x="318" y="194" width="34" height="38" rx="6" fill="{nozzle}"/>
    <path d="M140 240 L178 240 L170 300 Q168 310 158 310 L150 310 Q140 310 140 300 Z" fill="{c}"/>
    <rect x="116" y="170" width="46" height="14" rx="5" fill="{ORANGE}" opacity=".9"/>'''

def blower(c=INK):
    return f'''
    <rect x="96" y="180" width="130" height="62" rx="26" fill="{c}"/>
    <rect x="216" y="196" width="150" height="30" rx="10" fill="{c}"/>
    <rect x="352" y="186" width="16" height="50" rx="5" fill="{STEEL}"/>
    <circle cx="150" cy="211" r="22" fill="{STEEL}"/>
    <rect x="130" y="244" width="46" height="22" rx="8" fill="{ORANGE}"/>'''

def sander(c=INK):
    return f'''
    <circle cx="200" cy="230" r="98" fill="{c}"/>
    <circle cx="200" cy="230" r="78" fill="none" stroke="{YELLOW}" stroke-width="16" stroke-dasharray="14 10"/>
    <rect x="164" y="112" width="72" height="62" rx="20" fill="{c}"/>
    <rect x="176" y="118" width="48" height="12" rx="6" fill="{ORANGE}"/>'''

def disc(c=INK, face=STEEL):
    return f'''
    <circle cx="200" cy="200" r="112" fill="{face}"/>
    <circle cx="200" cy="200" r="104" fill="none" stroke="{INK}" stroke-width="2" opacity=".2"/>
    <circle cx="200" cy="200" r="38" fill="{BG_HOLE}"/>
    <circle cx="200" cy="200" r="38" fill="none" stroke="{c}" stroke-width="6"/>
    <path d="M150 120 L250 280" stroke="{ORANGE}" stroke-width="10" opacity=".7"/>'''

def pack(c=INK):
    return f'''
    <rect x="112" y="108" width="176" height="196" rx="14" fill="{ORANGE}"/>
    <rect x="112" y="108" width="176" height="34" rx="14" fill="{c}"/>
    <rect x="132" y="168" width="136" height="90" rx="8" fill="{WHITE}" opacity=".92"/>
    <rect x="146" y="184" width="108" height="10" rx="5" fill="{STEEL}"/>
    <rect x="146" y="204" width="80" height="10" rx="5" fill="{STEEL}"/>
    <rect x="146" y="224" width="96" height="10" rx="5" fill="{STEEL}"/>'''

def bits(c=INK):
    rows = ""
    for r in range(3):
        for col in range(5):
            x = 132 + col * 30
            y = 150 + r * 36
            rows += f'<rect x="{x}" y="{y}" width="8" height="48" rx="3" fill="{STEEL}"/>'
    return f'''
    <rect x="110" y="132" width="180" height="150" rx="14" fill="{c}"/>
    <rect x="120" y="142" width="160" height="130" rx="8" fill="#334155"/>
    {rows}'''

def chuckkey(c=INK):
    return f'''
    <circle cx="170" cy="200" r="46" fill="none" stroke="{c}" stroke-width="24"/>
    <rect x="200" y="188" width="132" height="24" rx="10" fill="{STEEL}"/>
    <rect x="296" y="180" width="36" height="40" rx="8" fill="{ORANGE}"/>'''

def knife(c=INK):
    return f'''
    <rect x="98" y="182" width="150" height="42" rx="14" fill="{YELLOW}"/>
    <rect x="110" y="190" width="126" height="8" rx="4" fill="#fef9c3"/>
    <path d="M246 186 L336 204 L246 218 Z" fill="{STEEL}"/>
    <rect x="236" y="182" width="16" height="42" rx="3" fill="{c}"/>
    <circle cx="130" cy="203" r="8" fill="{INK}" opacity=".4"/>'''

def chisel(c=INK):
    return f'''
    <rect x="108" y="184" width="118" height="30" rx="14" fill="{WOOD}"/>
    <rect x="224" y="190" width="108" height="18" rx="4" fill="{STEEL}"/>
    <path d="M332 190 L352 199 L332 208 Z" fill="{STEEL}"/>
    <rect x="236" y="186" width="6" height="26" fill="{c}" opacity=".3"/>'''

def helmet(c=YELLOW):
    return f'''
    <path d="M104 236 Q104 112 200 112 Q296 112 296 236 Z" fill="{c}"/>
    <path d="M142 150 Q200 128 258 150" fill="none" stroke="#ffffff" stroke-width="10" opacity=".5" stroke-linecap="round"/>
    <rect x="84" y="226" width="232" height="26" rx="13" fill="{c}" stroke="{INK}" stroke-width="3" stroke-opacity=".25"/>
    <rect x="182" y="150" width="36" height="20" rx="6" fill="{INK}" opacity=".15"/>'''

def gloves(c=WOOD):
    fingers = "".join(f'<rect x="{x}" y="{y}" width="24" height="{h}" rx="12" fill="{c}"/>' for x, y, h in [(138,120,96),(168,108,110),(198,112,104),(228,128,88)])
    return f'''
    {fingers}
    <rect x="130" y="196" width="130" height="92" rx="34" fill="{c}"/>
    <rect x="124" y="268" width="142" height="40" rx="14" fill="{INK}"/>
    <path d="M160 230 L200 230" stroke="{INK}" stroke-width="4" opacity=".3"/>'''

def goggles(c=INK):
    return f'''
    <path d="M86 214 Q200 150 314 214" fill="none" stroke="{c}" stroke-width="12" stroke-linecap="round"/>
    <rect x="72" y="182" width="36" height="20" rx="8" fill="{c}"/>
    <rect x="292" y="182" width="36" height="20" rx="8" fill="{c}"/>
    <circle cx="146" cy="210" r="58" fill="{c}"/>
    <circle cx="254" cy="210" r="58" fill="{c}"/>
    <circle cx="146" cy="210" r="44" fill="#bae6fd" opacity=".75"/>
    <circle cx="254" cy="210" r="44" fill="#bae6fd" opacity=".75"/>
    <path d="M122 190 L140 178" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity=".8"/>
    <path d="M230 190 L248 178" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity=".8"/>'''

def earmuff(c=INK):
    return f'''
    <path d="M96 212 Q96 90 200 90 Q304 90 304 212" fill="none" stroke="{c}" stroke-width="16" stroke-linecap="round"/>
    <rect x="72" y="196" width="60" height="92" rx="26" fill="{ORANGE}"/>
    <rect x="268" y="196" width="60" height="92" rx="26" fill="{ORANGE}"/>
    <rect x="84" y="210" width="36" height="64" rx="16" fill="{c}" opacity=".35"/>
    <rect x="280" y="210" width="36" height="64" rx="16" fill="{c}" opacity=".35"/>'''

def vest(c=ORANGE):
    return f'''
    <path d="M136 120 L170 112 Q200 130 230 112 L264 120 L282 298 L118 298 Z" fill="{c}"/>
    <path d="M136 120 L122 180 L150 186 L160 124 Z" fill="{c}" opacity=".9"/>
    <path d="M264 120 L278 180 L250 186 L240 124 Z" fill="{c}" opacity=".9"/>
    <rect x="122" y="214" width="156" height="14" fill="#f8fafc"/>
    <rect x="124" y="250" width="152" height="14" fill="#f8fafc"/>
    <path d="M170 112 Q200 150 230 112" fill="none" stroke="{INK}" stroke-width="6" opacity=".25"/>'''

def boot(c=INK):
    return f'''
    <path d="M140 108 L212 108 L212 238 L304 258 Q326 264 326 286 L326 300 L140 300 Z" fill="{c}"/>
    <rect x="140" y="278" width="186" height="22" rx="8" fill="{YELLOW}"/>
    <path d="M280 236 Q314 260 326 268" fill="none" stroke="{STEEL}" stroke-width="8" stroke-linecap="round"/>
    <rect x="148" y="120" width="56" height="10" rx="4" fill="{STEEL}"/>'''

def mask(c=WHITE):
    return f'''
    <path d="M110 200 Q200 130 290 200 Q290 262 200 270 Q110 262 110 200 Z" fill="{c}" stroke="{STEEL}" stroke-width="4"/>
    <path d="M140 218 Q200 236 260 218" fill="none" stroke="{STEEL}" stroke-width="5" stroke-linecap="round"/>
    <path d="M118 194 Q90 150 112 110" fill="none" stroke="{ORANGE}" stroke-width="8" stroke-linecap="round"/>
    <path d="M282 194 Q310 150 288 110" fill="none" stroke="{ORANGE}" stroke-width="8" stroke-linecap="round"/>
    <rect x="172" y="232" width="56" height="14" rx="6" fill="{STEEL}"/>'''

def firstaid(c=WHITE):
    return f'''
    <rect x="96" y="130" width="208" height="150" rx="16" fill="{c}" stroke="{STEEL}" stroke-width="5"/>
    <rect x="96" y="130" width="208" height="30" rx="12" fill="#dc2626"/>
    <rect x="182" y="176" width="36" height="92" rx="6" fill="#dc2626"/>
    <rect x="154" y="204" width="92" height="36" rx="6" fill="#dc2626"/>'''

def nop(c=INK):
    return f'<circle cx="200" cy="200" r="100" fill="{c}"/>'

def fan(fn, n, span=36, **kw):
    """Draw n copies of a tool fanned out — used for '... Set' products."""
    parts = []
    start = -span * (n - 1) / 2
    for i in range(n):
        ang = start + i * span
        parts.append(f'<g transform="rotate({ang:.1f} 200 260) translate(0 -20)">{fn(**kw)}</g>')
    return "".join(parts)

# ---------- name -> drawing rules ----------

def pick_drawing(name: str):
    n = name.lower()
    if "chuck key" in n:           return chuckkey()
    if "bit set" in n or "drill bit" in n: return bits()
    if "screwdriver set" in n:     return fan(screwdriver, 3, span=28, handle=ORANGE)
    if "screwdriver" in n:         return screwdriver()
    if "impact driver" in n or "drill" in n: return drill()
    if "grinder" in n and "angle" in n: return grinder()
    if "bench grinder" in n:       return grinder(c=INK)
    if "disc" in n or "wheel" in n or "saw blade" in n: return disc(face=STEEL if "saw blade" not in n else "#cbd5e1")
    if "hacksaw" in n:             return hacksaw()
    if "circular saw" in n or "jigsaw" in n or "reciprocating" in n: return saw()
    if "rotary hammer" in n or "claw hammer" in n: return hammer()
    if "sander" in n:              return sander()
    if "heat gun" in n:            return heatgun()
    if "blower" in n:              return blower()
    if "welding machine" in n:     return machine()
    if "compressor" in n:          return tank()
    if "welding rod" in n or "sandpaper" in n or "dust mask" in n and False: return pack()
    if "wrench set" in n:          return fan(wrench, 3, span=24)
    if "wrench" in n or "hex key" in n: return wrench()
    if "pliers set" in n:          return fan(plier, 2, span=18)
    if "plier" in n:               return plier()
    if "chisel" in n:              return chisel()
    if "utility knife" in n:       return knife()
    if "tape measure" in n or "measuring tape" in n: return tape()
    if "spirit level" in n:        return level()
    if "caliper" in n:             return caliper()
    if "laser" in n:               return device(mode="beam")
    if "thermometer" in n:         return device(mode="probe")
    if "angle finder" in n:        return device(mode="arc")
    if "helmet" in n:              return helmet(YELLOW if "yellow" in n else WHITE)
    if "gloves" in n:              return gloves()
    if "goggles" in n:             return goggles()
    if "ear protection" in n:      return earmuff()
    if "vest" in n:                return vest()
    if "shoes" in n:               return boot()
    if "mask" in n:                return mask()
    if "first aid" in n:           return firstaid()
    if "drill bit" in n or "bit set" in n: return bits()
    return pack()

# ---------- SVG wrapper ----------

def svg(name_label, brand, category, body, bg_from=None, bg_to=None):
    a, b = CATEGORY_BG.get(category, ("#e5e7eb", "#d1d5db"))
    bg_from = bg_from or a
    bg_to = bg_to or b
    label = (brand or "").replace("&", "&amp;")
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="{name_label}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{bg_from}"/>
      <stop offset="1" stop-color="{bg_to}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <ellipse cx="200" cy="330" rx="130" ry="14" fill="#0f172a" opacity=".12"/>
  {body}
  <text x="24" y="44" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="2" fill="#0f172a" opacity=".55">{label.upper()}</text>
</svg>
'''

def main():
    demo = open(os.path.join(ROOT, "lib", "demo-data.ts"), encoding="utf-8").read()
    seed_block = demo.split("const productSeeds: Seed[] = [", 1)[1].split("];", 1)[0]
    seeds = re.findall(r"\['((?:[^'\\]|\\.)*)',\s*'([^']*)',\s*'([^']*)'", seed_block)
    out_dir = os.path.join(ROOT, "public", "images", "products")
    os.makedirs(out_dir, exist_ok=True)
    for i, (name, category, brand) in enumerate(seeds):
        sku = f"sku-{i+1:04d}"
        body = pick_drawing(name)
        with open(os.path.join(out_dir, f"{sku}.svg"), "w", encoding="utf-8") as f:
            f.write(svg(name, brand, category, body))
    print(f"products: {len(seeds)} svg written")

    # category artwork
    cat_dir = os.path.join(ROOT, "public", "images", "categories")
    os.makedirs(cat_dir, exist_ok=True)
    cats = {
        "power-tools": ("Power Tools", "Power Tools", drill()),
        "hand-tools": ("Hand Tools", "Hand Tools", hammer()),
        "accessories": ("Accessories", "Accessories", disc()),
        "safety": ("Safety", "Safety", helmet(YELLOW)),
        "measuring": ("Measuring", "Measuring", tape()),
    }
    for slug, (label, cat, body) in cats.items():
        with open(os.path.join(cat_dir, f"{slug}.svg"), "w", encoding="utf-8") as f:
            f.write(svg(label, "", cat, body))
    print("categories: 5 svg written")

    # hero collage (dark navy background, composed tools)
    hero = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" role="img" aria-label="Construction tools">
  <defs>
    <linearGradient id="hbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1a2e"/>
      <stop offset="1" stop-color="#1e3a5f"/>
    </linearGradient>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0 L0 0 0 32" fill="none" stroke="#ffffff" stroke-opacity=".05"/>
    </pattern>
  </defs>
  <rect width="640" height="480" fill="url(#hbg)"/>
  <rect width="640" height="480" fill="url(#grid)"/>
  <circle cx="470" cy="200" r="190" fill="#f97316" opacity=".12"/>
  <g transform="translate(-40 60) scale(1.05)">{drill(c="#334155")}</g>
  <g transform="translate(330 40) scale(.62)">{hammer(c="#334155")}</g>
  <g transform="translate(230 290) scale(.7)">{level(c="#0f172a")}</g>
  <g transform="translate(380 230) scale(.55)">{tape(c="#334155")}</g>
</svg>
'''
    with open(os.path.join(ROOT, "public", "images", "hero-tools.svg"), "w", encoding="utf-8") as f:
        f.write(hero)
    print("hero: written")

if __name__ == "__main__":
    main()
