# -*- coding: utf-8 -*-
"""
Extrae vistas legacy de app.js a modules/app/legacy-views/ y recorta el registro central.

Las vistas 11–18 del portal ya están integradas en modules/app/*.js (index.html).
Este script solo sirve si app.js vuelve a contener los rangos listados en BUNDLES
y se desea regenerar copias en legacy-views/.

Ejecutar desde la raíz del repo: python tools/extract_legacy_views.py
"""
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "app.js"
OUT_DIR = ROOT / "modules" / "app" / "legacy-views"

# Rangos inclusivos 1-based (app.js actual). Orden de eliminación: el script ordena por start descendente.
# Dashboard (1): `modules/app/dashboard.js`. Viajes (3): `modules/app/viajes.js`. Mis solicitudes (2): `modules/app/mis-solicitudes.js`. Camiones (4): `modules/app/camiones.js`. Conductores (5): `modules/app/conductores.js`. Calendario (6): `modules/app/calendario.js`. Historial (7): `modules/app/historial.js`. Reportería (8): `modules/app/reporteria.js`. Nómina (9): `gestion-humana.js` + `rrhh-candidate-attachments.js`. Contratación (10): `contratacion.js` — no extraer con este script.
BUNDLES: list[tuple[str, str, list[tuple[int, int]], list[str]]] = [
    (
        "12-contacto-b2b-html.js",
        "Contacto web B2B — prospectos.",
        [(27564, 27665)],
        ["contactLeadsHtml"],
    ),
    (
        "13-usuarios-permisos-html.js",
        "Usuarios y permisos — permisos granulares y administración.",
        [(19213, 20091)],
        ["adminUsersHtml"],
    ),
    (
        "14-autorizaciones-html.js",
        "Centro de aprobaciones / autorizaciones.",
        [(27345, 27563)],
        ["authorizationsHtml", "buildAuthorizationsPortalRegistrationsSection"],
    ),
    (
        "15-mi-perfil-html.js",
        "Mi perfil.",
        [(27196, 27343)],
        ["profileHtml", "profileSystemJoinDateValue"],
    ),
]


def main() -> None:
    lines = APP.read_text(encoding="utf-8").splitlines(keepends=True)
    n = len(lines)

    # Validar rangos
    for fname, _desc, ranges, _exports in BUNDLES:
        for a, b in ranges:
            if a < 1 or b > n or a > b:
                raise SystemExit(f"Rango inválido en {fname}: ({a},{b}) n={n}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for fname, desc, ranges, exports in BUNDLES:
        chunks: list[str] = []
        for a, b in ranges:
            chunks.append("".join(lines[a - 1 : b]))
        body = "\n".join(chunks)
        reg = ", ".join(exports)
        header = (
            "/**\n"
            f" * {desc}\n"
            " * Extraído desde app.js — carga con defer después de app.js.\n"
            " */\n"
        )
        footer = (
            "\n(function registerLegacyViewChunk() {\n"
            "  if (typeof window.registerLegacyPortalViews !== \"function\") return;\n"
            f"  window.registerLegacyPortalViews({{{reg}}});\n"
            "})();\n"
        )
        (OUT_DIR / fname).write_text(header + body + footer, encoding="utf-8")

    # Cumplimiento laboral (11): el archivo canónico vive en legacy-views; si existe payroll/labor-compliance-html.js se copia encima.
    labor_dst = OUT_DIR / "11-cumplimiento-laboral-sst-html.js"
    labor_src = ROOT / "modules" / "payroll" / "labor-compliance-html.js"
    if labor_src.exists():
        shutil.copy(labor_src, labor_dst)
    # Notificaciones: el HTML canónico vive en `modules/app/notificaciones.js` (ya no hay notificaciones-html.js).
    notif_src = ROOT / "modules" / "portal" / "views" / "notificaciones-html.js"
    notif_dst = OUT_DIR / "16-18-notificaciones-timbre-avisos-html.js"
    if notif_src.exists():
        text = notif_src.read_text(encoding="utf-8")
        banner = (
            "/**\n"
            " * Notificaciones, avisos emergentes y timbre (preferencias en esta vista).\n"
            " * Copia de salida del extractor (fuente legacy opcional).\n"
            " */\n"
        )
        notif_dst.write_text(banner + text, encoding="utf-8")

    # Eliminar rangos de app.js: cada (a,b) 1-based inclusive → slice Python lines[a-1:b]
    remove_half_open: list[tuple[int, int]] = []
    for _f, _d, ranges, _e in BUNDLES:
        for a, b in ranges:
            remove_half_open.append((a - 1, b))
    # notificationsHtml duplicado — sustituido por 16-18-notificaciones-*.js
    remove_half_open.append((27121 - 1, 27195))

    remove_half_open.sort(key=lambda x: x[0])
    merged: list[list[int]] = []
    for s, ex in remove_half_open:
        if not merged or s >= merged[-1][1]:
            merged.append([s, ex])
        else:
            merged[-1][1] = max(merged[-1][1], ex)

    new_lines: list[str] = []
    prev = 0
    for s, ex in merged:
        new_lines.extend(lines[prev:s])
        prev = ex
    new_lines.extend(lines[prev:])
    APP.write_text("".join(new_lines), encoding="utf-8")

    # Sustituir bloques registerLegacyPortalViews / AppLegacyViews
    text = APP.read_text(encoding="utf-8")
    new_reg = """if (typeof window.registerLegacyPortalViews === "function") {
  window.registerLegacyPortalViews({
    clientDataScopeBarHtml,
    clientRequestsScopePrimaryLabel,
    isPortalClientUser,
    getClientDataScope
  });
} else {
  window.AppLegacyViews = {
    clientDataScopeBarHtml,
    clientRequestsScopePrimaryLabel,
    isPortalClientUser,
    getClientDataScope
  };
}"""

    pattern = re.compile(
        r"if \(typeof window\.registerLegacyPortalViews === \"function\"\) \{[\s\S]*?\} else \{[\s\S]*?window\.AppLegacyViews = \{[\s\S]*?\};\s*\n\}",
        re.MULTILINE,
    )
    m = pattern.search(text)
    if not m:
        raise SystemExit("No se encontró el bloque registerLegacyPortalViews en app.js")
    text = text[: m.start()] + new_reg + text[m.end() :]
    APP.write_text(text, encoding="utf-8")

    print("OK:", len(BUNDLES), "bundles + labor + notificaciones ->", OUT_DIR)


if __name__ == "__main__":
    main()
