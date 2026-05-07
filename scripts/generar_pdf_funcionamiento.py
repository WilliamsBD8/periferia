from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parents[1]
SOURCE_MD = ROOT / "docs" / "funcionamiento-sistema.md"
OUTPUT_PDF = ROOT / "docs" / "funcionamiento-sistema.pdf"


def build_pdf() -> None:
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleCustom",
        parent=styles["Title"],
        fontSize=20,
        leading=24,
        spaceAfter=12,
    )
    h2_style = ParagraphStyle(
        "Heading2Custom",
        parent=styles["Heading2"],
        fontSize=14,
        leading=18,
        spaceBefore=10,
        spaceAfter=6,
    )
    h3_style = ParagraphStyle(
        "Heading3Custom",
        parent=styles["Heading3"],
        fontSize=12,
        leading=15,
        spaceBefore=8,
        spaceAfter=4,
    )
    body_style = ParagraphStyle(
        "BodyCustom",
        parent=styles["BodyText"],
        fontSize=10.5,
        leading=15,
        spaceAfter=6,
    )
    bullet_style = ParagraphStyle(
        "BulletCustom",
        parent=body_style,
        leftIndent=12,
        bulletIndent=0,
    )

    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=1.8 * cm,
        bottomMargin=1.8 * cm,
        title="Manual de Funcionamiento del Sistema",
        author="Periferia IT",
    )

    story = []
    lines = SOURCE_MD.read_text(encoding="utf-8").splitlines()

    for line in lines:
        stripped = line.strip()
        if not stripped:
            story.append(Spacer(1, 4))
            continue

        if stripped.startswith("# "):
            text = escape(stripped[2:].strip())
            story.append(Paragraph(text, title_style))
            continue

        if stripped.startswith("## "):
            text = escape(stripped[3:].strip())
            story.append(Paragraph(text, h2_style))
            continue

        if stripped.startswith("### "):
            text = escape(stripped[4:].strip())
            story.append(Paragraph(text, h3_style))
            continue

        if stripped.startswith("- "):
            text = escape(stripped[2:].strip())
            story.append(Paragraph(text, bullet_style, bulletText="•"))
            continue

        text = escape(stripped)
        story.append(Paragraph(text, body_style))

    doc.build(story)


if __name__ == "__main__":
    build_pdf()
    print(f"PDF generado en: {OUTPUT_PDF}")
