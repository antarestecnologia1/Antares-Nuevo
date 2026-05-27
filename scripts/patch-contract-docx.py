#!/usr/bin/env python3
"""Actualiza dirección del empleador y placeholders de ciudad del trabajador en plantillas Word."""
from __future__ import annotations

import re
import sys
import zipfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DOC_DIR = REPO / "documentacion"

NEW_EMPLOYER = "Carrera 20 #6-81 La Ceja, EDS Roscombustible 2do piso"

# Solo sustituciones puntuales; no tocar cláusulas de lugar de trabajo ni demás texto legal.
PATCHES: dict[str, list[tuple[str, str]]] = {
    "CONTRATO_TERMINO_FIJO.docx": [
        (
            "con domicilio en la ciudad de la Ceja, Antioquia, EDS ROSCOMBUSTIBLES 2 PISO,",
            f"con domicilio en {NEW_EMPLOYER},",
        ),
    ],
    "CONTRATO_PRESTACION_DE_SERVICIOS.docx": [
        (
            "con domicilio en  Medellín, Antioquia",
            f"con domicilio en {NEW_EMPLOYER}",
        ),
    ],
    "CONTRATO_ADMINISTRATIVO_OFICINA.docx": [
        (
            "con domicilio en La Ceja, Antioquia,",
            f"con domicilio en {NEW_EMPLOYER},",
        ),
        (
            "con domicilio en la ciudad de La Ceja, Antioquia,",
            "con domicilio en la ciudad de ciudad_empleado,",
        ),
    ],
}


def patch_docx(path: Path, replacements: list[tuple[str, str]]) -> list[str]:
    applied: list[str] = []
    with zipfile.ZipFile(path, "r") as zin:
        names = zin.namelist()
        blobs = {name: zin.read(name) for name in names}
    xml_name = "word/document.xml"
    xml = blobs[xml_name].decode("utf-8")
    for old, new in replacements:
        if old not in xml:
            raise ValueError(f"{path.name}: no se encontró el fragmento esperado: {old[:80]}…")
        xml = xml.replace(old, new, 1)
        applied.append(old[:60])
    blobs[xml_name] = xml.encode("utf-8")
    tmp = path.with_suffix(".docx.tmp")
    with zipfile.ZipFile(tmp, "w", compression=zipfile.ZIP_DEFLATED) as zout:
        for name in names:
            zout.writestr(name, blobs[name])
    tmp.replace(path)
    return applied


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    for fn, reps in PATCHES.items():
        path = DOC_DIR / fn
        if not path.is_file():
            print(f"Falta {path}", file=sys.stderr)
            return 1
        applied = patch_docx(path, reps)
        print(f"OK {fn} ({len(applied)} cambio(s))")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
