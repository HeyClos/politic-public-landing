#!/usr/bin/env python3
"""Build path-only logo assets from editable SVG masters and the licensed font.

Requires fonttools and brotli. The approved Courier drawing is already vectorized
in brand/source; no image-generation service or raster trace is needed to rebuild.
"""
from pathlib import Path
import json
import xml.etree.ElementTree as ET
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/brand'
NS = '{http://www.w3.org/2000/svg}'
ET.register_namespace('', NS[1:-1])
INK, PAPER, GOLD = '#142b36', '#f4f1e8', '#e4b95b'

def artwork(name):
    root = ET.parse(ROOT / 'brand/source' / name).getroot()
    return ''.join(ET.tostring(p, encoding='unicode') for p in root if p.tag not in [NS+'title', NS+'desc'])

full = artwork('courier-master.svg')
small = artwork('courier-small-master.svg')
font = TTFont(ROOT / 'assets/fonts/barlow-condensed-latin-700.woff2')
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
upm = font['head'].unitsPerEm

def lettering(text, x, y, size, tracking=-.55):
    pen = SVGPathPen(glyphs)
    scale = size / upm
    for char in text:
        glyph = glyphs[cmap[ord(char)]]
        glyph.draw(TransformPen(pen, (scale,0,0,-scale,x,y)))
        x += glyph.width*scale + tracking
    return '<path d="'+pen.getCommands()+'"/>'

def save(name, box, contents, color=INK, title='Politic Public'):
    (OUT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{box}" fill="{color}" role="img"><title>{title}</title>{contents}</svg>\n')

for suffix, color in [('',INK),('-paper',PAPER),('-gold',GOLD)]:
    save('mark'+suffix+'.svg', '0 0 900 900', full, color, 'Politic Public — The Courier')
save('mark-small.svg','0 0 68 68','<g transform="translate(1 1)">'+small+'</g>',INK,'Politic Public — Small Courier')
signature = '<g transform="translate(0 0) scale(.155556)">'+full+'</g>'+lettering('politic',158,66,84)+lettering('public',158,130,84)
for suffix, color in [('ink',INK),('paper',PAPER),('gold',GOLD),('green','#47675d')]:
    save('logo-'+suffix+'.svg','0 0 340 140',signature,color)
# A stable gold field keeps the icon legible in light and dark browser chrome.
save('favicon.svg','0 0 72 72',f'<rect width="72" height="72" rx="13" fill="{GOLD}"/><g transform="translate(4 3)">{small}</g>',INK,'Politic Public favicon')
save('apple-touch-icon.svg','0 0 180 180',f'<rect width="180" height="180" fill="{GOLD}"/><g transform="translate(22 20) scale(2.1)">{small}</g>',INK,'Politic Public')
social = f'<rect width="1200" height="630" fill="{PAPER}"/><path d="M64 163H1136" stroke="{INK}" stroke-width="1"/><g transform="translate(60 40) scale(.75)">{signature}</g><g transform="translate(785 202) scale(.42)">{full}</g>'
social += lettering('COME',62,342,170,0)+lettering('PREPARED.',62,493,170,-1)
social += f'<rect x="64" y="540" width="220" height="8" fill="{GOLD}"/>'
social += lettering('Local government, made legible.',64,597,32,0)
save('social-card.svg','0 0 1200 630',social,INK,'Politic Public — Come prepared.')
tokens=json.loads((OUT/'tokens.json').read_text())
tokens['identity']={'name':'The Courier','master':'mark.svg','small':'mark-small.svg','full_mark_minimum_px':48,'clear_space':'One quarter of mark height','signature':'logo-ink.svg','wordmark':'Barlow Condensed 700; outlined paths'}
(OUT/'tokens.json').write_text(json.dumps(tokens,indent=2)+'\n')
print('Built path-only marks, outlined signatures, favicon, touch icon, and social card.')
