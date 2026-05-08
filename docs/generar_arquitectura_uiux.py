# -*- coding: utf-8 -*-
"""Genera Antares_Arquitectura_UI_UX.docx (+ PDF opcional): portada institucional, diagramas matplotlib."""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt, RGBColor

_DOCS = Path(__file__).resolve().parent
_ROOT = Path(__file__).resolve().parents[1]
if str(_DOCS) not in sys.path:
    sys.path.insert(0, str(_DOCS))
from antares_diagrams_matplotlib import generate_all_diagrams


def _logo_path_candidates() -> list[Path]:
    return [
        _ROOT / "imagenes empresa" / "Logo.png",
        _ROOT / "imagenes%20empresa" / "Logo.png",
    ]


def add_cover_page(doc: Document) -> Path | None:
    """Primera página: logo corporativo centrado + título de entrega oficial."""
    for _ in range(4):
        doc.add_paragraph()
    logo: Path | None = None
    for p in _logo_path_candidates():
        if p.is_file():
            logo = p
            break
    if logo:
        pg = doc.add_paragraph()
        pg.alignment = WD_ALIGN_PARAGRAPH.CENTER
        pg.paragraph_format.space_after = Pt(12)
        pg.add_run().add_picture(str(logo), width=Inches(3.95))

    p0 = doc.add_paragraph()
    p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r0 = p0.add_run("TRANSPORTES ANTARES S.A.S")
    r0.bold = True
    r0.font.size = Pt(22)

    for text, pt, bold in [
        ("Solución digital — Documento de arquitectura técnica (AS-IS)", 14.5, True),
        ("Vistas contextuales, contenedores, despliegue, dominio datos y sistema de diseño UX/UI", 11.2, False),
        ("Presentación institucional para validación cliente / equipo de arquitectura empresarial", 10.5, False),
    ]:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        rr = p.add_run(text)
        rr.bold = bold
        rr.font.size = Pt(pt)

    for _ in range(2):
        doc.add_paragraph()
    fb = doc.add_paragraph()
    fb.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rfb = fb.add_run("CONFIDENCIAL — Uso corporativo por destinatarios autorizados")
    rfb.bold = True
    rfb.font.size = Pt(11)
    rfb.font.color.rgb = RGBColor(0xD6, 0x28, 0x28)
    fb2 = doc.add_paragraph()
    fb2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rf2 = fb2.add_run("Mayo de 2026 — Versión reproducible automatizada desde repositorio")
    rf2.italic = True
    rf2.font.size = Pt(10)

    doc.add_page_break()
    return logo


def export_pdf_via_word(docx_path: Path, pdf_path: Path) -> tuple[bool, str]:
    """Word de escritorio o docx2pdf — prioriza fidelidad WYSIWYG del DOCX."""
    wd_pdf = 17
    docx_abs = str(docx_path.resolve())
    pdf_abs = str(pdf_path.resolve())
    if pdf_path.is_file():
        pdf_path.unlink()
    trace = ""

    try:
        import win32com.client as win32

        app = win32.DispatchEx("Word.Application")
        app.Visible = False
        app.DisplayAlerts = 0
        d = None
        try:
            d = app.Documents.Open(docx_abs, ReadOnly=True)
            d.SaveAs(pdf_abs, FileFormat=wd_pdf)
        finally:
            if d:
                d.Close(SaveChanges=0)
            app.Quit(SaveChanges=0)
        if pdf_path.is_file():
            return True, "PDF generado mediante Microsoft Word (motor de paginación nativo)."
    except Exception as e:
        trace = str(e)

    try:
        from docx2pdf import convert

        convert(docx_abs, pdf_abs)
        if pdf_path.is_file():
            return True, "PDF generado mediante docx2pdf (requiere Word instalado)."
    except Exception as e:
        trace = f"{trace} · docx2pdf:{e}"

    return False, trace


def export_pdf_via_libreoffice(soffice: str | None, docx_path: Path, pdf_out_dir: Path) -> tuple[bool, str]:
    """Si `soffice` existe, convierte DOCX→PDF sin depender de Microsoft Word."""
    candidates = []
    if soffice:
        candidates.append(Path(soffice))
    candidates.extend([
        Path(r"C:\Program Files\LibreOffice\program\soffice.exe"),
        Path(r"C:\Program Files (x86)\LibreOffice\program\soffice.exe"),
    ])
    exe = next((p for p in candidates if p.is_file()), None)
    if not exe:
        return False, ""

    pdf_out_dir.mkdir(parents=True, exist_ok=True)
    res = subprocess.run(
        [
            str(exe),
            "--headless",
            "--norestore",
            "--nologo",
            "--nolockcheck",
            "--convert-to",
            "pdf",
            "--outdir",
            str(pdf_out_dir.resolve()),
            str(docx_path.resolve()),
        ],
        capture_output=True,
        text=True,
        check=False,
        timeout=180,
        shell=False,
    )
    pdf_name = docx_path.with_suffix(".pdf").name
    target = pdf_out_dir / pdf_name
    if target.is_file():
        return True, f"PDF mediante LibreOffice headless ({exe.name}). Stderr ejemplo: {(res.stderr or '')[:200]}"
    return False, res.stderr.strip()[:400] if res.stderr else ""


def add_h(doc: Document, text: str, level: int = 1):
    return doc.add_heading(text, level=level)


def add_p(doc: Document, text: str, bold: bool = False):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = bold


def add_bullets(doc: Document, items: list[str]):
    for item in items:
        doc.add_paragraph(item, style="List Bullet")


def add_mono(doc: Document, text: str, size_pt: int = 9):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = "Consolas"
    run.font.size = Pt(size_pt)


def add_table(doc: Document, headers: list[str], rows: list[list[str]], style: str = "Table Grid"):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = style
    hdr = t.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = str(h)
    for ri, row in enumerate(rows):
        cells = t.rows[ri + 1].cells
        for ci, val in enumerate(row):
            cells[ci].text = str(val)


def add_figure(doc: Document, image_path: Path, caption_es: str, width_in: float = 6.52):
    if not image_path.is_file():
        add_p(doc, f"[Diagrama ausente — {image_path.name}]", bold=True)
        return
    pg = doc.add_paragraph()
    pg.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pg.add_run().add_picture(str(image_path), width=Inches(width_in))
    cap = doc.add_paragraph(caption_es)
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for r in cap.runs:
        r.italic = True
        r.font.size = Pt(9)


def main():
    ap = argparse.ArgumentParser(description="Informe arquitectura Antares → DOCX (y PDF opcional, alta calidad).")
    ap.add_argument("--no-pdf", action="store_true", help="Guardar sólo DOCX.")
    ap.add_argument(
        "--libreoffice-first",
        action="store_true",
        help="Intentar primero LibreOffice headless antes que Microsoft Word.",
    )
    ap.add_argument(
        "--soffice",
        default="",
        metavar="RUTA",
        help="Ruta explícita a soffice.exe (opcional si LibreOffice está en ubicación estándar).",
    )
    args = ap.parse_args()
    fig_dir = _DOCS / "_diagramas_antares_build"
    figs = generate_all_diagrams(fig_dir)
    out = _DOCS / "Antares_Arquitectura_UI_UX.docx"
    pdf_target = out.with_suffix(".pdf")
    doc = Document()
    doc.styles["Normal"].font.name = "Calibri"
    doc.styles["Normal"].font.size = Pt(11)

    logo = add_cover_page(doc)

    add_h(doc, "Hoja de control documental", 1)
    add_table(
        doc,
        ["Campo de control documental", "Valor"],
        [
            ["Clasificación sugerida", "Confidencial — uso cliente y socios tecnológicos bajo acuerdos de confidencialidad aplicables"],
            ["Versión del entregable", "2.1 — portada institucional + vistas gráficas (PNG 220 dpi) + PDF opcional (Word/LibreOffice)"],
            ["Alcance técnico", "Implementación repositorio “Antares Nuevo”"],
            ["Identidad visual (portada)", f"Logo embebido desde {logo.resolve()}" if logo else "(No se ubicó `./imagenes empresa/Logo.png` — revise ruta antes de emitir)"],
            ["Reproductibilidad diagramas / Word", str(_DOCS / "generar_arquitectura_uiux.py")],
        ],
    )
    add_p(
        doc,
        "El cuerpo del informe sintetiza arquitectura AS-IS observable en código fuente (`index.html` / `app.js` / `apps/api`). "
        "Las figuras se generaron con Matplotlib para permitir auditoría reproducible ante comités de revisión tecnológica.",
    )

    doc.add_page_break()
    add_h(doc, "Resumen ejecutivo", 1)
    add_bullets(
        doc,
        [
            "Plataforma monolítica en el lado cliente (`index.html` + `styles.css` + `app.js`) combinando marca pública B2B y portal empresarial con roles.",
            "API REST modular NestJS 10 (`/api`) orquestando autenticación, hidratación/sync de estado y reglas específicas Colombia (liquidación período Bogotá).",
            "Relacional PostgreSQL como fuente autoritativa; contrato físico DDL versionado bajo `BD/postgres/` con opción RLS y Supabase cuando se proyecta.",
            "Capas de seguridad transversales: JWT, hashing bcrypt, CORS parametrizado, cabeceras de endurecimiento, rate limiting y zona horaria de sesión BD `America/Bogota`.",
        ],
    )

    doc.add_page_break()
    add_h(doc, "1. Propósito, audiencia y criterios de revisión", 1)
    add_p(
        doc,
        "Dirigido a perfiles enterprise (arquitectos de solución, líder técnico, CISO funcionales, auditors de integración SaaS): "
        "consolida vistas C4-lite, modelo de información y referencias DDL sin sustituir un ADR formales ni políticas corporativas del cliente.",
    )
    add_h(doc, "1.1 Actores y preocupaciones transversales", 2)
    add_table(
        doc,
        ["Actor / stakehol.", "Interés arquitectónico"],
        [
            ["Negocio logístico", "Continuidad operativa, trazabilidad transporte, cumplimiento cadena de frío."],
            ["RRHH / Nómina", "Homologación periodicidad pago empleado ↔ motor liquidación; cumplimiento normativo CO."],
            ["TI / Seguridad", "Minimizar superficie de ataque, secretos fuera del navegador, observabilidad."],
            ["Marketing / Marca", "Consistencia visual tokens CSS, accesibilidad y rendimiento percepción."],
        ],
    )

    doc.add_page_break()
    add_h(doc, "2. Marcos de referencia (lectura arquitectónica)", 1)
    add_p(
        doc,
        "Las siguientes figuras adoptan el espíritu de modelado en capas (ISO/IEC/IEEE 42010 + prácticas C4 / arc42) sin pretender certificación: "
        "sirven como punta de anclaje para walkthrough con un comité de arquitectura.",
    )
    add_h(doc, "2.1 Vista contextual (C4 Level 1 equivalente)", 2)
    add_figure(
        doc,
        figs["fig_a_contexto_sistema"],
        "Figura A — Actores humanos, sistema digital Antares y sistemas satélite (correo, CAPTCHA, base relacional, almacenamiento opcional).",
    )
    add_p(
        doc,
        "La frontera del sistema recoge explícitamente la dualidad sitio público + portal y el acoplamiento débil vía proveedores "
        "(SMTP, objeto S3-compat, Postgres administrado).",
    )

    add_h(doc, "2.2 Vista de contenedores (lógicos)", 2)
    add_figure(
        doc,
        figs["fig_b_contenedores"],
        "Figura B — Contenedor SPA, infraestructura estática CDN, runtime NestJS, persistencia y object storage opcional.",
    )

    doc.add_page_break()
    add_h(doc, "2.3 Vista de despliegue físico / ambiente típico nube", 2)
    add_figure(
        doc,
        figs["fig_c_despliegue_nube"],
        "Figura C — Separación perímetro público CDN/WAF versus runtime API segregado y cluster Postgres administrado.",
    )
    add_p(
        doc,
        "Este patrón es coherente con despliegues documentados auxiliares (`BD/docs/Manual_Despliegue_Supabase_Cloudflare.docx`): "
        "edge estático, API stateful detrás del perímetro aplicativo y Postgres como servicio administrado.",
    )

    doc.add_page_break()
    add_h(doc, "2.4 Vista de componentes — backend NestJS", 2)
    add_figure(
        doc,
        figs["fig_d_componentes_api"],
        "Figura D — Descomposición AppModule NestJS incluyendo módulos de dominio y cross-cutting infraestructura.",
    )

    add_h(doc, "2.5 Contextos dominio / modelo de información persistido", 2)
    add_figure(
        doc,
        figs["fig_e_contextos_datos"],
        "Figura E — Bounded contexts agrupados según DDL (03–06_*). FKs garantizan coherencia inter-contexto.",
    )

    doc.add_page_break()
    add_h(doc, "2.6 Capas seguridad — defensa en profundidad", 2)
    add_figure(doc, figs["fig_f_capas_seguridad"], "Figura F — Controles distribuidos de borde hasta integridad datos en BD.")

    doc.add_page_break()
    add_h(doc, "3. Atributos de calidad observables en código AS-IS", 1)
    add_table(
        doc,
        ["Atributo ISO 25010 (referencia)", "Evidencias en repos"],
        [
            ["Seguridad", "JWT, bcrypt; Turnstile; CSP; DENY iframe; TZ sesión Postgres Bogotá; Throttler 80 rpm."],
            ["Compatibilidad / i18n", "Toggle ES/en; formato fechas/monetary adaptación regional."],
            ["Mantenibilidad modular API", "Inyección Nest, módulos separados Payroll/Portal/Mail..."],
            ["Portabilidad", "Node PostgreSQL estándares; DDL scriptable migrations."],
        ],
    )

    doc.add_page_break()
    add_h(doc, "4. Sistema de diseño UI/UX institucional", 1)
    add_p(doc, "`styles.css` materializa paleta marca #377CC0 derivados claros/obscuros (`:root`) y modo oscuro vía `data-theme`.")
    add_table(
        doc,
        ["Rol tipográfico", "Implementación"],
        [
            ["Títulos", "Montserrat 600 (--font-display)"],
            ["CTA destacados", "Poppins (--font-secondary)"],
            ["Cuerpo/UI", "Roboto (--font-body)"],
        ],
    )
    add_h(doc, "4.1 Arquitectura de información — página pública", 2)
    add_figure(
        doc,
        figs["fig_g_ia_sitio_publico"],
        "Figura G — Secuencia de anclas sitio marca (orden scroll coherente con menú navegación). Anchors `services` antes `fleet`.",
        width_in=6.92,
    )
    add_p(
        doc,
        "Los patrones táctico UI (hero gradient, glass-cards, navegación sticky blur, portal overlay con backdrop móvil) "
        "se implementan mediante clases reutilizables — no mediante kit de UI comercial cerrado.",
    )

    doc.add_page_break()
    add_h(doc, "5. Sincronización datos portal ↔ servidor", 1)
    add_table(
        doc,
        ["Colección lógica (KEYS.*)", "Persistencia física Postgres"],
        [
            ["users", "usuarios"],
            ["companies", "empresas"],
            ["requests", "solicitudes_transporte"],
            ["vehicles / drivers", "vehiculos / conductores"],
            ["payrollEmployees", "empleados_nomina.periodicidad_pago canónico `payFrequency`"],
            ["payrollRuns", "liquidaciones_nomina (periodos extendidos migr.23)"],
            ["approvals", "solicitudes_autorizacion"],
        ],
    )
    add_p(
        doc,
        "`PortalService.syncPayrollEmployees` normaliza etiquetas periodicidad mediante `canonicalPayFrequencyLabel` "
        "(archivo TS `apps/api/src/payroll/payroll-frequency.ts`) garantizando trazabilidad negocio↔motor liquidación.",
    )

    doc.add_page_break()
    add_h(doc, "6. Modelo físico DDL (extracto)", 1)
    add_bullets(
        doc,
        [
            "01_extensions.sql … 06_sistema.sql: núcleo, transporte, RRHH & sistema.",
            "Migraciones 15–23: registro empresa, políticas cuenta, automatización líquidos, períodos extendidos nómina.",
            "Opcional Supabase — RLS políticas declaradas pero activación dependiente de ambiente cliente.",
        ],
    )

    doc.add_page_break()
    add_h(doc, "7. Supuestos, limitaciones conocidas", 1)
    add_bullets(
        doc,
        [
            "Se documenta SPA raíz dominante (`index.html`): `apps/web` Next coexist sin ser la experiencia canónica hoy día.",
            "Diagramas sintéticos: no muestran despliegue multi-región/geo-HA hasta que proyecto lo compre.",
            "No sustituye pruebas carga PEN nor formal threat modeling — son insumos de arranque comité técnico.",
        ],
    )

    add_h(doc, "8. Glosario", 1)
    add_table(
        doc,
        ["Término", "Sentido proyecto"],
        [
            ["AS-IS / TO-BE", "AS-IS = snapshot fuente disponible."],
            ["KEYS.*", "Estructuras JSON colección UI cache localStorage antes sync."],
            ["Bootstrap portal", "`/portal/bootstrap` hidratar usuario y listas servidor."],
        ],
    )

    add_mono(
        doc,
        f"DOCX: {out.resolve()}\nFIGURAS: {fig_dir.resolve()}\nScript: {_DOCS.resolve() / 'generar_arquitectura_uiux.py'} — PDF se intenta después de cerrar DOCX.",
        size_pt=8,
    )

    doc.save(out)
    print(f"DOCX -> {out.resolve()}")

    if args.no_pdf:
        print("PDF omitido (--no-pdf).")
        return

    slo = args.soffice.strip() or None
    msgs: list[str] = []

    def run_word() -> bool:
        ok, m = export_pdf_via_word(out, pdf_target)
        msgs.append(f"Word:{ok}::{m}")
        return ok and pdf_target.is_file()

    def run_lo() -> bool:
        ok, m = export_pdf_via_libreoffice(slo, out, out.parent)
        msgs.append(f"LibreOffice:{ok}::{m}")
        return ok and pdf_target.is_file()

    if args.libreoffice_first:
        if not run_lo():
            run_word()
    else:
        if not run_word():
            run_lo()

    if pdf_target.is_file():
        print(f"PDF  -> {pdf_target.resolve()} ({pdf_target.stat().st_size // 1024} KB)")
    else:
        print("PDF no generado. Opciones habituales en Windows:")
        print("   pip install pywin32")
        print("   o bien instalar LibreOffice (soffice) y ejecutar de nuevo con --libreoffice-first")
    print("; ".join(msgs))

if __name__ == "__main__":
    main()
