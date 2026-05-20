# -*- coding: utf-8 -*-
"""Diagramas raster (PNG alta resolución) para documentación cliente / revisión arquitectura."""
from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Rectangle


# Paleta inspirada marca Antares (+ neutros informe corporativo)
C_BRAND = "#377CC0"
C_BRAND_LIGHT = "#83BEE9"
C_SURFACE = "#F4F9FD"
C_TEXT = "#0B2138"
C_ACCENT_GREEN = "#1B8E5F"
C_BORDER = "#9EC8E8"
LW = 1.85


def _rounded_box(ax, x, y, w, h, label, subtitle="", fc="#FFFFFF", ec=C_BRAND, fontsize=10, fontsize_sub=8):
    box = FancyBboxPatch(
        (x, y),
        w,
        h,
        boxstyle="round,pad=0.03,rounding_size=0.12",
        linewidth=LW,
        edgecolor=ec,
        facecolor=fc,
        zorder=2,
    )
    ax.add_patch(box)
    ax.text(x + w / 2, y + h * 0.58, label, ha="center", va="center", fontsize=fontsize, weight="bold", color=C_TEXT, zorder=3)
    if subtitle:
        ax.text(
            x + w / 2,
            y + h * 0.28,
            subtitle,
            ha="center",
            va="center",
            fontsize=fontsize_sub,
            color="#3A5A78",
            zorder=3,
            wrap=False,
        )


def _arrow(ax, xy1, xy2, text="", color=C_BRAND):
    arr = FancyArrowPatch(
        xy1,
        xy2,
        arrowstyle="-|>",
        mutation_scale=16,
        linewidth=LW,
        color=color,
        zorder=1,
        connectionstyle="arc3,rad=0.05",
    )
    ax.add_patch(arr)
    if text:
        mx, my = (xy1[0] + xy2[0]) / 2 + 0.15, (xy1[1] + xy2[1]) / 2 + 0.12
        ax.text(mx, my, text, fontsize=8, color=C_TEXT, bbox=dict(boxstyle="round,pad=0.2", facecolor="white", alpha=0.92, edgecolor=C_BORDER))


def draw_context_diagram(out: Path) -> None:
    """Vista contextual (estilo C4-L1 simplificado): actores, sistema, externos."""
    fig, ax = plt.subplots(figsize=(15, 8.8), dpi=220)
    ax.set_facecolor(C_SURFACE)
    fig.patch.set_facecolor(C_SURFACE)
    ax.axis("off")
    ax.set_xlim(0, 15)
    ax.set_ylim(0, 9)

    ax.text(
        7.5,
        8.55,
        "Figura A — Vista contextual del sistema\nPlataforma digital Transportes Antares S.A.S (estado AS-IS código fuente)",
        ha="center",
        va="bottom",
        fontsize=13,
        weight="bold",
        color=C_TEXT,
    )
    ax.text(
        7.5,
        8.1,
        "Los actores utilizan navegadores web; la solución agrupa marca pública + portal operativo sobre la misma base de seguridad.",
        ha="center",
        fontsize=9.2,
        color="#455F78",
        style="italic",
    )

    # Zona etiquetas verticales
    ax.text(2.05, 6.92, "Actores humanos / roles", fontsize=10.5, weight="bold", color=C_BRAND, ha="center")
    _rounded_box(ax, 0.45, 3.95, 3.35, 1.25, "Visitante web / B2B", "Sitio institucional, catálogo, contacto")
    _rounded_box(ax, 0.45, 2.5, 3.35, 1.2, "Usuario empresa (Cliente)", "Solicitudes, seguimiento, documentos")
    _rounded_box(ax, 0.45, 1.05, 3.35, 1.2, "Equipo administración\nRRHH · Operaciones", "Flota, nómina, aprobaciones, RRHH")

    _rounded_box(
        ax,
        4.75,
        1.95,
        6.05,
        4.2,
        "Sistema principal — Plataforma digital Antares",
        "SPA (HTML/CSS/JS) + Portal autenticado + API NestJS `/api`\n\n"
        "• Autenticación JWT · roles y permisos\n"
        "• Sincronización portal ⇄ servidor (PostgreSQL)\n"
        "• Liquidación Colombia (reglas período Bogotá)\n",
        fc="#FFFFFF",
        ec=C_BRAND,
        fontsize=11,
        fontsize_sub=8.35,
    )

    ax.text(12.4, 6.92, "Sistemas externos", fontsize=10.5, weight="bold", color=C_BRAND, ha="center")
    _rounded_box(ax, 10.92, 4.92, 3.82, 0.92, "Motor relacional PostgreSQL", "Ej. Supabase / hosting gestionado", fontsize=9, fontsize_sub=7.8)
    _rounded_box(ax, 10.92, 3.78, 3.82, 0.92, "Correo transaccional", "Plantillas / SMTP (Resend, etc.)", fontsize=9, fontsize_sub=7.8)
    _rounded_box(ax, 10.92, 2.64, 3.82, 0.92, "Cloudflare Turnstile", "Validación CAPTCHA bot en registro/acceso", fontsize=9, fontsize_sub=7.55)
    _rounded_box(ax, 10.92, 1.5, 3.82, 0.92, "Almacén de objetos (opcional)", "S3-compatible (R2) documentos/evidencias", fontsize=9, fontsize_sub=7.55)

    _arrow(ax, (3.82, 4.62), (4.75, 4.55), "")
    _arrow(ax, (3.82, 3.1), (4.75, 3.85), "")
    _arrow(ax, (3.82, 1.65), (4.75, 2.95), "")
    for cy in [5.38, 4.24, 3.09, 1.95]:
        _arrow(ax, (10.74, 3.92), (10.9, cy))

    plt.tight_layout()
    plt.savefig(out, dpi=220, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()


def draw_container_diagram(out: Path) -> None:
    """Vista contenedores: cliente, servidor, datos, proveedores."""
    fig, ax = plt.subplots(figsize=(15, 9.8), dpi=220)
    ax.set_facecolor(C_SURFACE)
    fig.patch.set_facecolor(C_SURFACE)
    ax.axis("off")
    ax.set_xlim(0, 15)
    ax.set_ylim(0, 10)

    ax.text(
        7.5,
        9.65,
        "Figura B — Vista de contenedores (deployment lógico)\nCliente web · Capas de aplicación · Persistencia e integraciones",
        ha="center",
        fontsize=13,
        weight="bold",
        color=C_TEXT,
    )

    # Row: browser
    _rounded_box(ax, 0.5, 7.98, 3.85, 0.92, "Navegador del usuario", "Chrome / Edge / Safari — HTTPS", fontsize=10, fontsize_sub=8.2)

    _rounded_box(
        ax,
        5.05,
        6.92,
        5.95,
        2.68,
        "Contenedor SPA — Frontend Antares",
        "index.html + styles.css + app.js (~17k líneas SPA)\n"
        "Sitio marca + Overlay portal (#portal-app)\n"
        "localStorage KEYS.* + escritura servidor writeAwaitServer\n\n"
        "i18n ES/EN · tema claro/oscuro CSP · Turnstile widget",
        fc="#FFFFFF",
        ec=C_BRAND,
        fontsize=10.8,
        fontsize_sub=8.2,
    )

    ax.add_patch(
        FancyBboxPatch(
            (0.52, 4.92),
            4.82,
            2.82,
            boxstyle="round,pad=0.03,rounding_size=0.12",
            linewidth=LW * 1.08,
            edgecolor=C_ACCENT_GREEN,
            facecolor="#EAF7F2",
            zorder=1,
            linestyle=(0, (4, 2)),
        )
    )
    ax.text(
        2.9,
        7.62,
        "Capa hospedaje estático (CDN / hosting)",
        ha="center",
        fontsize=9.8,
        weight="bold",
        color=C_ACCENT_GREEN,
        zorder=2,
    )
    ax.text(2.9, 5.75, "Vercel / Cloudflare Pages / bucket estático +\nCDN + reglas TLS y WAF opcional.", ha="center", fontsize=8.4, color="#1a5840")

    _rounded_box(
        ax,
        5.6,
        3.92,
        8.82,
        2.92,
        "Contenedor servidor — NestJS v10 (`/api` prefijo)",
        "Módulos: Auth · Portal (sync Bootstrap) · Payroll (schedule America/Bogota)\n"
        "         Files · Uploads · Mail · B2B prospects · Rate limit (Throttler)\n\n"
        "Sesión TZ PostgreSQL · Validación entrada (class-validator)",
        fc="#FFFFFF",
        ec=C_BRAND,
        fontsize=10.85,
        fontsize_sub=8.15,
    )

    _rounded_box(ax, 8.92, 0.92, 3.92, 1.92, "Base de datos relacional PostgreSQL", "DDL versionado BD/postgres/\nSesión TZ America/Bogota", fontsize=10, fontsize_sub=8)
    ax.add_patch(
        Rectangle(
            (12.92, 0.92),
            1.45,
            1.92,
            linewidth=LW,
            edgecolor=C_BORDER,
            facecolor="#EEF5FC",
            zorder=2,
            linestyle="-",
            joinstyle="round",
        )
    )
    ax.text(13.645, 1.82, "Object\nstorage", ha="center", va="center", fontsize=9, weight="bold", color=C_TEXT)
    ax.text(13.645, 1.2, "(opc.)", ha="center", va="center", fontsize=8, color="#3A5A78")

    _arrow(ax, (2.5, 7.98), (5.55, 8.52), "HTTPS")
    _arrow(ax, (2.92, 4.92), (7.82, 7.92), "descarga SPA")
    arr = FancyArrowPatch(
        (8.12, 3.92),
        (10.92, 1.94),
        arrowstyle="-|>",
        mutation_scale=18,
        linewidth=LW,
        color=C_BRAND,
        zorder=1,
    )
    ax.add_patch(arr)
    ax.text(10.92, 2.85, "Conexiones\npg Pool TCP/TLS", fontsize=8, color=C_TEXT)

    plt.tight_layout()
    plt.savefig(out, dpi=220, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()


def draw_deployment_physical(out: Path) -> None:
    """Topología de despliegue simplificada (referencia habitual en la documentación del proyecto)."""
    fig, ax = plt.subplots(figsize=(14.5, 7.9), dpi=220)
    ax.set_facecolor(C_SURFACE)
    fig.patch.set_facecolor(C_SURFACE)
    ax.axis("off")
    ax.set_xlim(0, 14.6)
    ax.set_ylim(0, 8)

    ax.text(
        7.3,
        7.55,
        "Figura C — Topología de despliegue de referencia (nube pública)\nPatrón habitual: CDN/WAF + hospedaje estático + API gestionada + PostgreSQL administrado",
        ha="center",
        fontsize=12.8,
        weight="bold",
        color=C_TEXT,
    )

    ax.add_patch(Rectangle((0.4, 5.92), 13.82, 0.85, linewidth=LW, edgecolor="#B8D4EB", facecolor="#EAF3FB", linestyle=":"))
    ax.text(7.31, 6.72, "Internet — usuarios finales (HTTPS)", ha="center", fontsize=10, weight="bold", color=C_BRAND)

    _rounded_box(ax, 0.55, 3.92, 4.2, 1.85, "DNS / WAF / CDN (Cloudflare u homólogo)", "Terminación TLS, caché SPA, reglas de seguridad opcionales")
    _rounded_box(ax, 5.4, 3.92, 3.65, 1.85, "Hospedaje estático (Edge)", "Vercel · Cloudflare Pages · bucket S3 público")
    _rounded_box(ax, 9.35, 3.92, 4.65, 1.85, "Runtime servidor API gestionado", "Render Fly.io VMs — Node NestJS\nVariables de entorno y secretos fora del navegador")

    _rounded_box(ax, 2.92, 0.92, 4.92, 1.65, "Cluster PostgreSQL administrado", "Supabase Postgres — Render Postgres — DDL versionado en BD/postgres/", fontsize=10, fontsize_sub=8.2)
    _rounded_box(ax, 8.12, 0.92, 3.92, 1.65, "Almacenes auxiliares", "Object storage para documentos • Resend u otro SMTP", fontsize=9.8, fontsize_sub=8.0)

    _arrow(ax, (5.92, 4.92), (5.4, 4.92))
    _arrow(ax, (9.12, 4.92), (9.35, 4.92))
    arr = FancyArrowPatch((11.92, 3.92), (5.4, 2.57), arrowstyle="-|>", mutation_scale=18, linewidth=LW, color=C_BRAND, zorder=1)
    ax.add_patch(arr)
    ax.text(8.92, 2.95, "Conexiones\nseguras JDBC/PG", fontsize=8, ha="center", color=C_TEXT, bbox=dict(boxstyle="round,pad=0.15", fc="white", ec=C_BORDER, alpha=0.96))

    plt.tight_layout()
    plt.savefig(out, dpi=220, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()


def draw_components_api(out: Path) -> None:
    """Módulos servidor NestJS (vista componentes lógica backend)."""
    fig, ax = plt.subplots(figsize=(14.2, 7.85), dpi=220)
    ax.set_facecolor(C_SURFACE)
    fig.patch.set_facecolor(C_SURFACE)
    ax.axis("off")
    ax.set_xlim(0, 14.2)
    ax.set_ylim(0, 8)

    ax.text(
        7.1,
        7.55,
        "Figura D — Componentes servidor (NestJS AppModule)",
        ha="center",
        fontsize=13,
        weight="bold",
        color=C_TEXT,
    )
    core = FancyBboxPatch(
        (0.45, 0.92),
        13.38,
        6.42,
        boxstyle="round,pad=0.02,rounding_size=0.18",
        linewidth=LW * 1.2,
        edgecolor=C_BRAND,
        facecolor="#FFFFFF",
        linestyle="-",
        zorder=1,
    )
    ax.add_patch(core)
    ax.text(7.14, 6.92, "Aplicación servidor — prefijo REST global `/api`", ha="center", fontsize=10.8, weight="bold", color=C_BRAND)

    boxes = [
        (0.75, 4.92, 2.85, 1.55, "AuthModule", "JWT · Passport · Turnstile\nbcrypt · refresh tokens"),
        (3.72, 4.92, 2.95, 1.55, "PortalModule", "Bootstrap · sync-key KEYS.*\noperación transporte · RRHH"),
        (7.12, 4.92, 2.85, 1.55, "PayrollModule", "Liquidación Colombia\nAmerica/Bogotá · cron"),
        (10.52, 4.92, 2.85, 1.55, "Mail · Files · Uploads", "Resend SMTP · R2/S3\npresigned URLs"),
        (0.75, 2.35, 2.85, 1.45, "B2bProspectModule", "Prospectos formulario web"),
        (3.72, 2.35, 3.25, 1.45, "DatabaseModule + Throttler", "Pool PostgreSQL TZ Bogotá\n80 req/min por IP"),
        (7.42, 2.35, 5.95, 1.45, "Cross-cutting", "ConfigModule · ScheduleModule · ValidationPipe · CORS · helmet headers"),
    ]
    for x, y, w, h, label, sub in boxes:
        _rounded_box(ax, x, y, w, h, label, sub, fontsize=9.5, fontsize_sub=7.8)

    plt.tight_layout()
    plt.savefig(out, dpi=220, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()


def draw_domain_bounded_context(out: Path) -> None:
    """Contextos delimitados lógicos (DDD-light) alineados al DDL Postgres."""
    fig, ax = plt.subplots(figsize=(14.6, 7.6), dpi=220)
    ax.set_facecolor(C_SURFACE)
    fig.patch.set_facecolor(C_SURFACE)
    ax.axis("off")
    ax.set_xlim(0, 14.6)
    ax.set_ylim(0, 7.85)

    ax.text(
        7.3,
        7.35,
        "Figura E — Contextos dominio / datos\n(Bounded contexts alineados a scripts BD/postgres/)",
        ha="center",
        fontsize=12.95,
        weight="bold",
        color=C_TEXT,
    )

    _rounded_box(ax, 0.55, 3.92, 3.12, 2.85, "Núcleo identidad\ny empresa", "empresas\nusuarios\npermisos_usuario\nparámetros_sistema")
    _rounded_box(ax, 4.08, 3.92, 3.52, 2.85, "Transporte operativo", "vehículos · conductores\nsolicitudes · viajes\nrutas / tarifas trayecto\ncombustible / logs técnicos")
    _rounded_box(ax, 7.98, 3.92, 3.12, 2.85, "Capital humano", "cargos · vacantes · candidatos\nentrevistas · contratos\nempleados_nomina · liquidaciones\nausencias laborales SST")
    _rounded_box(ax, 11.46, 3.92, 2.75, 2.85, "Plataforma\ntransversal", "notificaciones\ncolas correo · prospectos B2B\naprobaciones · sesiones contadores")

    _arrow(ax, (3.7, 4.95), (4.08, 5.08))
    _arrow(ax, (7.62, 5.08), (7.98, 5.08))
    _arrow(ax, (11.12, 5.08), (11.46, 5.2))

    ax.text(7.3, 1.92, "Nota: FKs físicas garantizan integridad entre contextos — la API Portal consolida la sincronización con el SPA.", fontsize=9.35, ha="center", color="#455F78")

    plt.tight_layout()
    plt.savefig(out, dpi=220, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()


def draw_security_layers(out: Path) -> None:
    """Defensa en profundidad: capas de control."""
    fig, ax = plt.subplots(figsize=(13.9, 7.08), dpi=220)
    ax.set_facecolor(C_SURFACE)
    fig.patch.set_facecolor(C_SURFACE)
    ax.axis("off")
    ax.set_xlim(0, 13.95)
    ax.set_ylim(0, 7.2)

    ax.text(
        6.98,
        6.85,
        "Figura F — Seguridad y cumplimiento (defensa en profundidad)",
        ha="center",
        fontsize=12.95,
        weight="bold",
        color=C_TEXT,
    )

    rows = [
        (4.88, "Perímetro (DNS / CDN / WAF opcional)", "Terminación TLS, ofuscación infraestructura, reglas volumétricas y geo."),
        (3.92, "Navegador (sitio SPA)", "Políticas CSP declarativas meta, saneamiento entrada, aislamiento de marcos externos."),
        (2.94, "Aplicación API (NestJS)", "Cabeceras de endurecimiento HTTP · CORS con allowlist ambiental · límite 80 solicitudes/min IP."),
        (1.94, "Autenticación e integridad de datos", "JWT access · hashing bcrypt · validación entrada DTO · zona horaria de sesión America/Bogotá en Postgres."),
        (1.06, "Terceros de confianza", "Turnstile (challenge anti-bot) · proveedor de correo (Resend) · almacenamiento de objetos S3-compat."),
    ]
    for yy, ttl, bod in rows:
        _rounded_box(ax, 0.55, yy, 12.86, 0.78, ttl, bod, fontsize=10, fontsize_sub=7.92)

    plt.tight_layout()
    plt.savefig(out, dpi=220, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()


def draw_ia_public_sections(out: Path) -> None:
    """Diagrama navegación secciones sitio público (orden scrolling)."""
    fig, ax = plt.subplots(figsize=(15.2, 3.92), dpi=220)
    ax.set_facecolor(C_SURFACE)
    fig.patch.set_facecolor(C_SURFACE)
    ax.axis("off")
    ax.set_xlim(0, 15.2)
    ax.set_ylim(0, 4)

    ax.text(7.6, 3.82, "Figura G — Arquitectura de información · sitio público (anchors index.html)", ha="center", fontsize=12.2, weight="bold", color=C_TEXT)

    nodes = ["#hero", "#about", "#trusted", "#testimonials", "#services", "#fleet", "#process", "#coverage", "#news", "#careers", "#contact"]
    nw = 1.06
    x0 = 0.62
    yb = 1.92
    for i, lbl in enumerate(nodes):
        xx = x0 + i * (nw + 0.085)
        _rounded_box(
            ax, xx, yb, nw + 0.02, 0.68, lbl.replace("#", "").upper(), "", fc="#FFFFFF", ec=C_BRAND, fontsize=7.4, fontsize_sub=8
        )
        if i:
            ax.annotate(
                "",
                xy=(xx + 0.04, yb + 0.34),
                xytext=(xx - (nw + 0.085) + nw + 0.02, yb + 0.34),
                arrowprops=dict(arrowstyle="-|>", color=C_BRAND, lw=LW * 1.08, mutation_scale=12),
            )

    plt.tight_layout()
    plt.savefig(out, dpi=220, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()


def generate_all_diagrams(target_dir: Path) -> dict[str, Path]:
    target_dir.mkdir(parents=True, exist_ok=True)
    paths = {}
    specs = [
        ("fig_a_contexto_sistema.png", draw_context_diagram),
        ("fig_b_contenedores.png", draw_container_diagram),
        ("fig_c_despliegue_nube.png", draw_deployment_physical),
        ("fig_d_componentes_api.png", draw_components_api),
        ("fig_e_contextos_datos.png", draw_domain_bounded_context),
        ("fig_f_capas_seguridad.png", draw_security_layers),
        ("fig_g_ia_sitio_publico.png", draw_ia_public_sections),
    ]
    for name, fn in specs:
        p = target_dir / name
        fn(p)
        paths[name[:-4]] = p
    return paths
