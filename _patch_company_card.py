# -*- coding: utf-8 -*-
"""
Parche idempotente para la tarjeta de empresas en app.js (por si se aplicó manualmente en el IDE).

Uso (PowerShell):
  python .\\_patch_company_card.py

Comprueba que existan las piezas clave; si falta algo, imprime qué añadir y sale con código 1.
Si todo está aplicado, sale 0.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
APP_JS = ROOT / "app.js"

MARKERS = [
    "function formatPortalPhoneForDisplay(",
    "function companyKindChipShortLabel(",
    "function patchOperatorCompanyKindIfNeeded(",
    "patchOperatorCompanyKindIfNeeded(",
    "escapeHtml(companyKindChipShortLabel(k))",
    "const nit = String(c.taxId || c.nit || \"\").trim();",
    "formatPortalPhoneForDisplay(String(c.phone))",
]


def main() -> int:
    if not APP_JS.is_file():
        print(f"No se encontró app.js en {APP_JS}", file=sys.stderr)
        return 1
    text = APP_JS.read_text(encoding="utf-8")
    missing = [m for m in MARKERS if m not in text]
    if missing:
        print("Faltan fragmentos en app.js (aplique los cambios de tarjeta empresa o vuelva a fusionar la rama):", file=sys.stderr)
        for m in missing:
            print(f"  - {m[:72]}{'…' if len(m) > 72 else ''}", file=sys.stderr)
        return 1
    print("app.js: tarjeta de empresas - marcadores OK (nada que parchear).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
