"""Generate the three educational PDFs from the same content used by Astro.

Requires reportlab and pypdf. Run with the Codex bundled Python or another
Python installation providing these packages. No network access is needed.
"""
from __future__ import annotations

import json
import os
from html import escape
from pathlib import Path

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Flowable, Frame, PageBreak, PageTemplate, Paragraph, Spacer,
)

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src/data/learning-guides.json"
OUTPUT = ROOT / "public/materiais/psicologia-em-pauta"
NAVY = colors.HexColor("#0B2635")
INK = colors.HexColor("#234552")
IVORY = colors.HexColor("#F3F0E7")
COPPER = colors.HexColor("#A66D47")
PALE = colors.HexColor("#D7DCD3")
PAGE_W, PAGE_H = A4
MARGIN = 48
CONTENT_W = PAGE_W - MARGIN * 2


def register_fonts() -> None:
    windows = Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts"
    arial = windows / "arial.ttf"
    bold = windows / "arialbd.ttf"
    georgia = windows / "georgia.ttf"
    if arial.is_file() and bold.is_file() and georgia.is_file():
        paths = (arial, bold, georgia)
    else:
        directories = [
            Path("/usr/share/fonts/truetype/dejavu"),
            Path(os.environ.get("NEXO_PDF_FONT_DIR", ".")),
        ]
        found = next((folder for folder in directories if (folder / "DejaVuSans.ttf").is_file()), None)
        if found is None:
            raise FileNotFoundError("Provide Arial/Georgia on Windows or NEXO_PDF_FONT_DIR with DejaVu fonts.")
        paths = (found / "DejaVuSans.ttf", found / "DejaVuSans-Bold.ttf", found / "DejaVuSerif.ttf")
    for name, path in zip(("NexoSans", "NexoSansBold", "NexoSerif"), paths):
        pdfmetrics.registerFont(TTFont(name, str(path)))


class Connections(Flowable):
    def __init__(self, labels: list[str]):
        super().__init__()
        self.width = CONTENT_W
        self.height = 86
        self.labels = labels

    def draw(self) -> None:
        c = self.canv
        gap = 17
        box_w = (self.width - gap * 2) / 3
        y = 13
        for index, label in enumerate(self.labels):
            x = index * (box_w + gap)
            c.setFillColor(NAVY)
            c.roundRect(x, y, box_w, 60, 6, fill=1, stroke=0)
            c.setFillColor(colors.HexColor("#D8AF87"))
            c.setFont("NexoSansBold", 8.5)
            c.drawString(x + 13, y + 42, f"0{index + 1}")
            style = ParagraphStyle("diagram", fontName="NexoSans", fontSize=10.5,
                                   leading=13, textColor=IVORY)
            paragraph = Paragraph(escape(label), style)
            _, height = paragraph.wrap(box_w - 26, 30)
            paragraph.drawOn(c, x + 13, y + 25 - height / 2)
            if index < 2:
                c.setStrokeColor(COPPER)
                c.setLineWidth(1.2)
                start = x + box_w
                c.line(start, y + 30, start + gap, y + 30)
                c.line(start + gap - 4, y + 33, start + gap, y + 30)
                c.line(start + gap - 4, y + 27, start + gap, y + 30)


def frame_page(canvas, doc) -> None:
    canvas.saveState()
    canvas.setFillColor(IVORY)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setStrokeColor(COPPER)
    canvas.setLineWidth(2)
    canvas.line(MARGIN, PAGE_H - 39, MARGIN + 10, PAGE_H - 54)
    canvas.line(MARGIN + 10, PAGE_H - 39, MARGIN, PAGE_H - 54)
    canvas.setFillColor(NAVY)
    canvas.setFont("NexoSansBold", 17)
    canvas.drawString(MARGIN + 23, PAGE_H - 53, "NEXO")
    canvas.setFont("NexoSans", 6.7)
    canvas.drawString(MARGIN + 24, PAGE_H - 64, "INTELIGÊNCIA CLÍNICA")
    canvas.setFont("NexoSans", 8.5)
    canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 53, "PSICOLOGIA EM PAUTA")
    canvas.setStrokeColor(PALE)
    canvas.setLineWidth(.6)
    canvas.line(MARGIN, 57, PAGE_W - MARGIN, 57)
    canvas.setFillColor(INK)
    canvas.setFont("NexoSans", 8)
    canvas.drawString(MARGIN, 39, "Edição educativa - 16 de outubro de 2026")
    canvas.drawRightString(PAGE_W - MARGIN, 39, f"{doc.page} / 2")
    canvas.restoreState()


def build_pdf(guide: dict, position: int) -> dict:
    styles = {
        "eyebrow": ParagraphStyle("eyebrow", fontName="NexoSansBold", fontSize=9,
                                  leading=13, textColor=COPPER, spaceAfter=12),
        "title": ParagraphStyle("title", fontName="NexoSerif", fontSize=28,
                                leading=32, textColor=NAVY, spaceAfter=14),
        "summary": ParagraphStyle("summary", fontName="NexoSans", fontSize=11.5,
                                  leading=17, textColor=INK, spaceAfter=13),
        "heading": ParagraphStyle("heading", fontName="NexoSansBold", fontSize=12,
                                  leading=17, textColor=NAVY, spaceBefore=15,
                                  spaceAfter=8, keepWithNext=True),
        "body": ParagraphStyle("body", fontName="NexoSans", fontSize=10.8,
                               leading=15.7, textColor=INK, spaceAfter=8,
                               alignment=TA_LEFT, allowWidows=0, allowOrphans=0),
        "source": ParagraphStyle("source", fontName="NexoSans", fontSize=9.1,
                                 leading=13.2, textColor=INK, spaceAfter=10),
    }
    output_path = ROOT / "public" / guide["download"].lstrip("/")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(str(output_path), pagesize=A4, leftMargin=MARGIN,
                           rightMargin=MARGIN, topMargin=96, bottomMargin=76,
                           title=guide["title"], author="", subject="Material educativo - NEXO",
                           invariant=1, pageCompression=1)
    frame = Frame(MARGIN, 76, CONTENT_W, PAGE_H - 172,
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates(PageTemplate(id="nexo", frames=[frame], onPage=frame_page))
    story = [
        Paragraph(f"GUIA 0{position} - {escape(guide['eyebrow'].upper())}", styles["eyebrow"]),
        Paragraph(escape(guide["title"]), styles["title"]),
        Paragraph(escape(guide["summary"]), styles["summary"]),
        Connections(guide["diagram"]),
        Spacer(1, 4),
    ]
    for index, section in enumerate(guide["sections"]):
        if index == 2:
            story.extend([
                PageBreak(),
                Paragraph(f"GUIA 0{position} - CONTINUAR A LEITURA", styles["eyebrow"]),
                Paragraph(escape(guide["title"]), styles["title"]),
            ])
        story.append(Paragraph(escape(section["title"]), styles["heading"]))
        for text in section["body"]:
            story.append(Paragraph(escape(text), styles["body"]))
    story.append(Paragraph("Fontes para continuar", styles["heading"]))
    for index, source in enumerate(guide["sources"], 1):
        label = escape(source["label"])
        url = escape(source["url"], quote=True)
        story.append(Paragraph(f'{index}. {label} <link href="{url}" color="#8B5032"><u>Abrir fonte</u></link>.', styles["source"]))
    doc.build(story)
    reader = PdfReader(str(output_path))
    if len(reader.pages) != guide["pages"]:
        raise RuntimeError(f"{output_path.name}: expected {guide['pages']} pages, got {len(reader.pages)}")
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    if "\ufffd" in text:
        raise RuntimeError(f"{output_path.name}: replacement character in extracted text")
    for section in guide["sections"]:
        if section["title"] not in text:
            raise RuntimeError(f"{output_path.name}: missing section {section['title']}")
    return {"file": str(output_path), "pages": len(reader.pages),
            "bytes": output_path.stat().st_size,
            "links": sum(len(page.get("/Annots", [])) for page in reader.pages)}


def main() -> None:
    register_fonts()
    guides = json.loads(DATA.read_text(encoding="utf-8"))
    results = [build_pdf(guide, position) for position, guide in enumerate(guides, 1)]
    for guide, result in zip(guides, results):
        guide["bytes"] = result["bytes"]
    DATA.write_text(json.dumps(guides, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
