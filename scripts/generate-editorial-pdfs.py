#!/usr/bin/env python3
"""Build selectable-text A4 editions from the same JSON used by the website.

Requires reportlab and pypdf. Pre-generated PDFs are committed for static hosts;
no Python runtime is required by Astro or the public reading experience.
Run from any directory: python scripts/generate-editorial-pdfs.py
Use --only SLUG for a layout proof, or --check to verify the committed manifest.
The source PDFs are never modified. Audit notes and approval flags are not copy.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import json
import os
import re
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import (
    BaseDocTemplate, CondPageBreak, Flowable, Frame, LongTable, PageBreak,
    PageTemplate, Paragraph, Spacer, TableStyle, Image, KeepTogether,
)
from reportlab.platypus.tableofcontents import TableOfContents

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'src/data/editorial'
DEST = ROOT / 'src/assets/editorial-pdfs'
MANIFEST = ROOT / 'src/data/editorial-pdf-manifest.json'
PHOTOGRAPHY_FILE = ROOT / 'src/data/editorial-photography.json'
SITE = 'https://nexo-previa-20261014.pages.dev'
ORDER = ['relacoes-reciprocidade', 'neurodivergencia-comunicacao',
         'o-que-faz-um-psicologo', 'analise-do-comportamento',
         'escuta-atencao-e-relacoes', 'quem-cuida-de-quem-cuida']
IVORY = colors.HexColor('#F3EFE6')
BLUE = colors.HexColor('#082440')
COPPER = colors.HexColor('#A16850')
SAND = colors.HexColor('#DCCBBC')
GRAPHITE = colors.HexColor('#292D32')
W, H = A4
LEFT, RIGHT, TOP, BOTTOM = 58, 58, 70, 57
TEXT_W = W - LEFT - RIGHT
FONT_NAMES = {}
PHOTOGRAPHY = {}


def edition_photo(slug, asset_id=None):
    if asset_id is None:
        asset_id = PHOTOGRAPHY.get('editions', {}).get(slug, {}).get('cover')
    return PHOTOGRAPHY.get('assets', {}).get(asset_id)


def photo_caption(photo):
    return ' '.join(filter(None, [photo.get('caption'), photo.get('credit')]))


def chapter_photos(slug, section_id):
    entries = PHOTOGRAPHY.get('editions', {}).get(slug, {}).get('chapters', [])
    return [edition_photo(slug, entry['assetId']) for entry in entries
            if entry['sectionId'] == section_id]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def register_fonts():
    custom = os.environ.get('NEXO_PDF_FONTDIR')
    windows = Path(custom or 'C:/Windows/Fonts')
    choices = [
        (windows, {'Serif': 'georgia.ttf', 'SerifBold': 'georgiab.ttf',
                   'SerifItalic': 'georgiai.ttf', 'Sans': 'arial.ttf',
                   'SansBold': 'arialbd.ttf', 'SansItalic': 'ariali.ttf'}),
        (Path('/usr/share/fonts/truetype/dejavu'), {
            'Serif': 'DejaVuSerif.ttf', 'SerifBold': 'DejaVuSerif-Bold.ttf',
            'SerifItalic': 'DejaVuSerif-Italic.ttf', 'Sans': 'DejaVuSans.ttf',
            'SansBold': 'DejaVuSans-Bold.ttf', 'SansItalic': 'DejaVuSans-Oblique.ttf'}),
    ]
    for folder, mapping in choices:
        if all((folder / file).is_file() for file in mapping.values()):
            for name, file in mapping.items():
                pdfmetrics.registerFont(TTFont(name, str(folder / file)))
                FONT_NAMES[name] = file
            pdfmetrics.registerFontFamily('Serif', normal='Serif', bold='SerifBold',
                                         italic='SerifItalic', boldItalic='SerifBold')
            pdfmetrics.registerFontFamily('Sans', normal='Sans', bold='SansBold',
                                         italic='SansItalic', boldItalic='SansBold')
            return
    raise SystemExit('No complete local TTF family found. Set NEXO_PDF_FONTDIR to Georgia/Arial fonts or install DejaVu.')


def clean(text: str) -> str:
    # Keep copy verbatim apart from typographic dash normalization for PDF fonts.
    return str(text).replace('\u2011', '-').replace('\u2013', '-').replace('\u2014', ' - ')


def esc(text: str) -> str:
    return html.escape(clean(text), quote=True)


def styles():
    base = dict(fontName='Serif', fontSize=11.2, leading=17.5,
                textColor=GRAPHITE, spaceAfter=10.8, allowWidows=0,
                allowOrphans=0, splitLongWords=True)
    return {
        'body': ParagraphStyle('Body', **base),
        'list': ParagraphStyle('List', **{**base, 'leftIndent': 14, 'firstLineIndent': -11,
                                         'spaceAfter': 8.5}),
        'quote': ParagraphStyle('Quote', **{**base, 'fontName': 'SerifItalic',
                                          'fontSize': 14.2, 'leading': 21.5,
                                          'textColor': BLUE, 'spaceAfter': 7}),
        'note': ParagraphStyle('Note', **{**base, 'fontName': 'Sans', 'fontSize': 9.5,
                                        'leading': 15.2, 'spaceAfter': 9}),
        'caption': ParagraphStyle('Caption', fontName='Sans', fontSize=8.2, leading=12.4,
                                  textColor=COPPER, spaceAfter=10),
        'section': ParagraphStyle('Chapter', fontName='Serif', fontSize=25.5,
                                  leading=31, textColor=BLUE, spaceAfter=16,
                                  keepWithNext=True, allowWidows=0, allowOrphans=0),
        'kicker': ParagraphStyle('Kicker', fontName='SansBold', fontSize=8.3,
                                 leading=12, textColor=COPPER, spaceAfter=8,
                                 keepWithNext=True),
        'reference': ParagraphStyle('Reference', fontName='Sans', fontSize=8.7,
                                    leading=13.4, textColor=GRAPHITE, spaceAfter=11,
                                    splitLongWords=True),
        'table': ParagraphStyle('Cell', fontName='Sans', fontSize=9.2, leading=14.1,
                                textColor=GRAPHITE, spaceAfter=0),
        'tablehead': ParagraphStyle('CellHead', fontName='SansBold', fontSize=8.7,
                                    leading=13.1, textColor=BLUE, spaceAfter=0),
        'toc': ParagraphStyle('Contents', fontName='Sans', fontSize=9.5,
                              leading=13, textColor=BLUE, spaceBefore=1,
                              spaceAfter=2, rightIndent=20, allowWidows=0,
                              allowOrphans=0),
    }


class Cover(Flowable):
    def __init__(self, article, number):
        super().__init__()
        self.article, self.number = article, number
        self.width, self.height = TEXT_W, H - TOP - BOTTOM - 14

    def draw(self):
        c = self.canv
        c.saveState()
        origin_x, origin_y = c.absolutePosition(0, 0)
        c.translate(-origin_x, -origin_y)
        c.setFillColor(IVORY)
        c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setFillColor(BLUE)
        c.rect(0, H - 159, W, 159, fill=1, stroke=0)
        c.setFillColor(SAND)
        c.setFont('Sans', 8)
        c.drawString(LEFT, H - 40, 'NEXO INTELIGÊNCIA CLÍNICA  /  LEITURAS PARA CONECTAR IDEIAS')
        c.setFillColor(IVORY)
        c.setFont('Serif', 34)
        c.drawString(LEFT, H - 88, 'Psicologia')
        c.drawString(LEFT, H - 128, 'em Pauta')
        c.setFillColor(COPPER)
        c.setFont('SansBold', 9)
        c.drawRightString(W - RIGHT, H - 127, f'EDIÇÃO {self.number:02d}')
        y = H - 202
        kicker = Paragraph(esc(self.article['category'].upper()),
                           ParagraphStyle('CoverCat', fontName='SansBold', fontSize=9,
                                          leading=13, textColor=COPPER))
        _, h = kicker.wrap(TEXT_W, 100)
        kicker.drawOn(c, LEFT, y - h)
        y -= h + 24
        title = Paragraph(esc(self.article['title']),
                          ParagraphStyle('CoverTitle', fontName='Serif', fontSize=38,
                                         leading=44, textColor=BLUE))
        _, h = title.wrap(TEXT_W, 300)
        title.drawOn(c, LEFT, y - h)
        y -= h + 21
        subtitle = Paragraph(esc(self.article['subtitle']),
                             ParagraphStyle('CoverSubtitle', fontName='Sans', fontSize=13,
                                            leading=20, textColor=GRAPHITE))
        _, h = subtitle.wrap(TEXT_W - 27, 150)
        subtitle.drawOn(c, LEFT, y - h)
        y -= h + 25
        c.setStrokeColor(COPPER)
        c.setLineWidth(.8)
        c.line(LEFT, y, LEFT + 78, y)
        y -= 24
        byline = Paragraph('Texto e curadoria de<br/><b>Gabriel Alves Batista</b>',
                           ParagraphStyle('Byline', fontName='Sans', fontSize=9.6,
                                          leading=15, textColor=BLUE))
        _, h = byline.wrap(TEXT_W, 80)
        byline.drawOn(c, LEFT, y - h)
        y -= h + 30
        # Use the same authored photography map as the HTML edition.
        photo_meta = edition_photo(self.article['slug'])
        photo = ROOT / photo_meta['file'] if photo_meta else None
        if photo and photo.is_file() and y > 205:
            c.saveState()
            ph = min(218, y - 145)
            path = c.beginPath()
            path.rect(LEFT, y - ph, TEXT_W, ph)
            c.clipPath(path, stroke=0)
            iw, ih = ImageReader(str(photo)).getSize()
            scale = (min if photo_meta.get('kind') in ('author', 'documentary') else max)(TEXT_W / iw, ph / ih)
            dw, dh = iw * scale, ih * scale
            values = re.findall(r'([\d.]+)%', photo_meta.get('objectPosition', '50% 50%'))
            px, py = ([float(v) / 100 for v in values[:2]] if len(values) >= 2 else [.5, .5])
            c.drawImage(str(photo), LEFT + (TEXT_W - dw) * px,
                        y - ph + (ph - dh) * (1 - py), width=dw, height=dh, mask='auto')
            c.restoreState()
            caption = para(photo_caption(photo_meta), styles()['caption'])
            _, caption_height = caption.wrap(TEXT_W, 50)
            caption.drawOn(c, LEFT, y - ph - caption_height - 6)
        elif y > 235:
            teaser_top = min(302, y - 18)
            c.setFillColor(SAND)
            c.rect(LEFT, 143, TEXT_W, teaser_top - 143, fill=1, stroke=0)
            teaser_y = teaser_top - 17
            c.setFillColor(COPPER)
            c.setFont('SansBold', 8)
            c.drawString(LEFT + 17, teaser_y, 'NESTA EDIÇÃO')
            teaser_y -= 18
            for section in self.article['sections'][:3]:
                teaser = Paragraph(esc(section['title']),
                                   ParagraphStyle('Teaser', fontName='Serif', fontSize=12.2,
                                                  leading=16, textColor=BLUE))
                _, teaser_h = teaser.wrap(TEXT_W - 36, 60)
                if teaser_y - teaser_h < 154:
                    break
                teaser.drawOn(c, LEFT + 17, teaser_y - teaser_h)
                teaser_y -= teaser_h + 10
        c.setFillColor(GRAPHITE)
        c.setFont('Sans', 8)
        c.drawString(LEFT, 90, 'Edição digital em A4  •  Texto selecionável  •  Referências e links')
        c.setFillColor(COPPER)
        c.drawString(LEFT, 72, 'Uma leitura educativa para ampliar perguntas e possibilidades.')
        c.restoreState()


class EditionDoc(BaseDocTemplate):
    def __init__(self, path, article, **kw):
        self.article = article
        super().__init__(str(path), pagesize=A4, leftMargin=LEFT, rightMargin=RIGHT,
                         topMargin=TOP, bottomMargin=BOTTOM,
                         title=f"Psicologia em Pauta | {article['title']}",
                         author='Gabriel Alves Batista',
                         subject=article['description'],
                         pageCompression=1, **kw)
        frame = Frame(LEFT, BOTTOM, TEXT_W, H - TOP - BOTTOM,
                      leftPadding=0, bottomPadding=0, rightPadding=0, topPadding=0)
        self.addPageTemplates([PageTemplate(id='Reading', frames=[frame], onPage=self.decorate)])

    def decorate(self, c: Canvas, doc):
        c.saveState()
        c.setFillColor(IVORY)
        c.rect(0, 0, W, H, fill=1, stroke=0)
        if doc.page > 1:
            c.setFont('SansBold', 7.5)
            c.setFillColor(BLUE)
            c.drawString(LEFT, H - 34, 'PSICOLOGIA EM PAUTA')
            label = self.article['category'].upper()
            c.setFont('Sans', 7.3)
            c.setFillColor(COPPER)
            c.drawRightString(W - RIGHT, H - 34, label)
            c.setStrokeColor(SAND)
            c.setLineWidth(.6)
            c.line(LEFT, H - 44, W - RIGHT, H - 44)
            c.line(LEFT, 40, W - RIGHT, 40)
            c.setFillColor(GRAPHITE)
            c.setFont('Sans', 7)
            c.drawString(LEFT, 26, 'NEXO  /  Texto e curadoria de Gabriel Alves Batista')
            c.setFont('SansBold', 8)
            c.drawRightString(W - RIGHT, 25, f'{doc.page:02d}')
        c.restoreState()

    def afterFlowable(self, f):
        key = getattr(f, '_toc_key', None)
        if key:
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(f.getPlainText(), key, 0, False)
            self.notify('TOCEntry', (0, f.getPlainText(), self.page, key))


def para(text, style):
    return Paragraph(esc(text), style)


def panel(block, st):
    items = []
    if block.get('text'):
        items.append(para(block['text'], st['note']))
    for item in block.get('items', []):
        items.append(para('- ' + item, st['list']))
    box = LongTable([[item] for item in items], colWidths=[TEXT_W - 23])
    box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EBE3D8')),
        ('LINEBEFORE', (0, 0), (0, -1), 1.2, COPPER),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 11),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    box.spaceAfter = 15
    return box


def add_blocks(story, blocks, st):
    for b in blocks:
        kind = b['type']
        labels = {'evidence': 'EVIDÊNCIA CIENTÍFICA',
                  'social': 'ANÁLISE SOCIAL CONTEMPORÂNEA',
                  'reflection': 'REFLEXÃO AUTORAL',
                  'press': 'NA IMPRENSA / REGISTRO CONTEMPORÂNEO'}
        if b.get('kind') in labels:
            story.append(para(labels[b['kind']], st['kicker']))
        if kind == 'p':
            story.append(para(b.get('text', ''), st['body']))
        elif kind == 'quote':
            story.append(Spacer(1, 7))
            story.append(para(b.get('text', ''), st['quote']))
            if b.get('attribution'):
                story.append(para(b['attribution'], st['caption']))
        elif kind in ('note', 'exercise'):
            story.append(panel(b, st))
        elif kind == 'list':
            if b.get('text'):
                story.append(para(b['text'], st['body']))
            story.extend(para('- ' + item, st['list']) for item in b.get('items', []))
        elif kind == 'table':
            if b.get('text'):
                story.append(para(b['text'], st['body']))
            columns, rows = b.get('columns', []), b.get('rows', [])
            n = len(columns) or len(rows[0])
            widths = ([TEXT_W * .29, TEXT_W * .71] if n == 2 else
                      [TEXT_W * .23, TEXT_W * .18, TEXT_W * .59] if n == 3 else
                      [TEXT_W / n] * n)
            data = ([[para(v, st['tablehead']) for v in columns]] if columns else [])
            data.extend([para(v, st['table']) for v in row] for row in rows)
            table = LongTable(data, colWidths=widths, repeatRows=1 if columns else 0,
                              splitByRow=1, hAlign='LEFT')
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), SAND),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [IVORY, colors.HexColor('#EAE5DB')]),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 9),
                ('RIGHTPADDING', (0, 0), (-1, -1), 9),
                ('TOPPADDING', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('LINEBELOW', (0, -1), (-1, -1), .6, SAND),
            ]))
            table.spaceAfter = 16
            story.append(table)
        else:
            raise ValueError(f'Unsupported editorial block type {kind}')


def source_texts(article):
    for section in article['sections']:
        yield section['title']
        for block in section['blocks']:
            if block.get('text'):
                yield block['text']
            yield from block.get('items', [])
            yield from block.get('columns', [])
            for row in block.get('rows', []):
                yield from row
            if block.get('attribution'):
                yield block['attribution']
    for ref in article['references']:
        yield ref['label']


def normalized(text):
    return re.sub(r'\s+', '', clean(text)).casefold()


def validate_pdf(path, article):
    reader = PdfReader(path)
    text = '\n'.join(page.extract_text() or '' for page in reader.pages)
    normalized_pdf = normalized(text)
    missing = [s[:100] for s in source_texts(article) if normalized(s) not in normalized_pdf]
    if missing:
        raise ValueError(f'{path.name}: content missing in selectable text: {missing}')
    if 'TextoecuradoriadeGabrielAlvesBatista'.casefold() not in normalized_pdf:
        raise ValueError(f'{path.name}: byline missing')
    # Verify the source copy is complete; invisible audit metadata is intentionally excluded.
    return len(reader.pages), len(text)


def make_pdf(article, number, path):
    st = styles()
    story = [Cover(article, number), PageBreak(),
             para('GUIA DA EDIÇÃO', st['kicker']),
             para('Entre ideias, histórias e perguntas.', st['section']),
             para(article['description'], st['body']),
             Spacer(1, 7)]
    toc = TableOfContents()
    toc.levelStyles = [st['toc']]
    toc.dotsMinLevel = 0
    story.extend([toc, Spacer(1, 22)])
    article_link = f"{SITE}/psicologia-em-pauta/{article['slug']}/"
    story.append(Paragraph(f'<link href="{article_link}" color="#082440"><u>Continuar a leitura no navegador</u></link>', st['note']))
    if article['slug'] in ('relacoes-reciprocidade', 'escuta-atencao-e-relacoes'):
        story.append(Paragraph(f'<link href="{article_link}?leitura=continua#exercicio-interativo" color="#082440"><u>Responder ao quiz e calcular a pontuação orientativa</u></link>', st['note']))
    story.append(para('A leitura e os exercícios têm finalidade educativa. Exemplos e perguntas ajudam a observar contextos e não substituem avaliação individual.', st['caption']))
    story.append(PageBreak())
    for number, section in enumerate(article['sections'], 1):
        story.append(para(f'CAPÍTULO {number:02d}', st['kicker']))
        title = para(section['title'], st['section'])
        title._toc_key = section['id']
        story.append(title)
        for photo in chapter_photos(article['slug'], section['id']):
            photo_path = ROOT / photo['file']
            iw, ih = ImageReader(str(photo_path)).getSize()
            scale = min(TEXT_W / iw, 270 / ih)
            figure = Image(str(photo_path), width=iw * scale, height=ih * scale, hAlign='CENTER')
            story.append(KeepTogether([figure, Spacer(1, 7), para(photo_caption(photo), st['caption']), Spacer(1, 9)]))
        add_blocks(story, section['blocks'], st)
        if number < len(article['sections']):
            # Short chapters share a page; long chapters get breathing room.
            # Avoid nearly blank pages when a table has continued overleaf.
            story.extend([Spacer(1, 21), CondPageBreak(310)])
    story.append(PageBreak())
    story.append(para('FONTES PARA APROFUNDAR', st['kicker']))
    ref_title = para('Referências da edição.', st['section'])
    ref_title._toc_key = 'referencias'
    story.append(ref_title)
    for ref in article['references']:
        story.append(para(ref['label'], st['reference']))
        if ref.get('url'):
            story.append(Paragraph(f'<link href="{html.escape(ref["url"], quote=True)}" color="#082440"><u>{esc(ref["url"])}</u></link>', st['reference']))
    story.append(Spacer(1, 16))
    story.append(para('Continue a conexão.', st['section']))
    story.append(Paragraph(f'<link href="{article_link}" color="#082440"><u>Abrir esta edição no site da NEXO</u></link>', st['note']))
    story.append(para('Texto e curadoria de Gabriel Alves Batista', st['caption']))
    EditionDoc(path, article).multiBuild(story)
    return validate_pdf(path, article)


def main():
    global PHOTOGRAPHY
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--only', choices=ORDER)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    PHOTOGRAPHY = json.loads(PHOTOGRAPHY_FILE.read_text(encoding='utf-8-sig'))
    photo_hashes = {}
    for photo in PHOTOGRAPHY['assets'].values():
        if not (ROOT / photo['file']).is_file():
            raise SystemExit(f"Missing authorized photography asset: {photo['file']}")
        if not (ROOT / photo['file']).read_bytes().startswith(b'\xff\xd8'):
            raise SystemExit(f"Photography asset is not a JPEG: {photo['file']}")
        photo_hashes[photo['file']] = sha(ROOT / photo['file'])
    if args.check:
        manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
        if manifest.get('photographySha256') != sha(PHOTOGRAPHY_FILE):
            raise SystemExit('Outdated photography in editorial PDFs')
        if manifest.get('photographyAssets') != photo_hashes:
            raise SystemExit('Photography bytes differ from the generated PDF record')
        for item in manifest['editions']:
            src = ROOT / item['source']
            pdf = ROOT / item['file']
            article = json.loads(src.read_text(encoding='utf-8-sig'))
            if sha(src) != item['sourceSha256'] or sha(pdf) != item['pdfSha256']:
                raise SystemExit(f"Outdated edition: {item['slug']}")
            pages, _ = validate_pdf(pdf, article)
            if pages != item['pages']:
                raise SystemExit(f"Page-count mismatch: {item['slug']}")
        print(f"Verified {len(manifest['editions'])} editions: source/PDF hashes and selectable full text.")
        return
    register_fonts()
    DEST.mkdir(parents=True, exist_ok=True)
    records = []
    for number, slug in enumerate(ORDER, 1):
        if args.only and slug != args.only:
            continue
        source = SOURCE / f'{slug}.json'
        article = json.loads(source.read_text(encoding='utf-8-sig'))
        out = DEST / f'{slug}.pdf'
        pages, chars = make_pdf(article, number, out)
        if any(sha(ROOT / file) != digest for file, digest in photo_hashes.items()):
            raise SystemExit('PDF generation changed a source photography asset')
        records.append({'slug': slug, 'source': source.relative_to(ROOT).as_posix(),
                        'sourceSha256': sha(source), 'file': out.relative_to(ROOT).as_posix(),
                        'pdfSha256': sha(out), 'pages': pages, 'selectableCharacters': chars,
                        'url': f'/psicologia-em-pauta/edicoes/{slug}.pdf'})
        print(f'{slug}: {pages} pages, {chars} selectable characters, complete source copy.')
    if not args.only:
        manifest = {'schemaVersion': 1,
                    'generatedAt': datetime.now(ZoneInfo('America/Bahia')).isoformat(timespec='seconds'),
                    'generator': 'scripts/generate-editorial-pdfs.py',
                    'status': 'preview', 'clinicalApproval': False,
                    'paper': 'A4', 'palette': ['#F3EFE6', '#082440', '#A16850', '#DCCBBC', '#292D32'],
                    'embeddedFonts': FONT_NAMES,
                    'photographySha256': sha(PHOTOGRAPHY_FILE),
                    'photographyAssets': photo_hashes,
                    'sourcePolicy': 'Same article JSON and photography map as HTML; original PDFs retained separately. No internal audit notes rendered.',
                    'editions': records}
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
