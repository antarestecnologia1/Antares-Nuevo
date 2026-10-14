const SIMIT_RESOURCE_URL = "https://www.datos.gov.co/resource/72nf-y4v3.json";
const SIMIT_PAGE_SIZE = 5000;
const SIMIT_PLATE_BATCH = 40;
const SIMIT_MAX_ROWS = 20000;

function normalizePlate(raw: string): string {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function uniquePlates(plates: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of plates) {
    const plate = normalizePlate(item);
    if (!plate || seen.has(plate)) continue;
    seen.add(plate);
    out.push(plate);
  }
  return out;
}

function sodaQuote(value: string): string {
  return `'${String(value || "").replace(/'/g, "''")}'`;
}

function buildQueryUrl(plates: string[], pendingOnly: boolean, limit: number, offset: number): string {
  const inList = plates.map(sodaQuote).join(",");
  const paidClause = pendingOnly ? " AND upper(pagado_si_no)='NO'" : "";
  const params = new URLSearchParams();
  params.set("$select", "placa,fecha_multa,valor_multa,departamento,ciudad,pagado_si_no,vigencia");
  params.set("$where", `placa in(${inList})${paidClause}`);
  params.set("$limit", String(limit));
  params.set("$offset", String(offset));
  return `${SIMIT_RESOURCE_URL}?${params.toString()}`;
}

function parseDateMs(raw: string): number {
  const m = String(raw || "")
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return 0;
  return Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

function parseRow(row: Record<string, unknown>) {
  const plate = normalizePlate(String(row?.placa || ""));
  const dateLabel = String(row?.fecha_multa || "").trim();
  const value = Number(row?.valor_multa);
  const pending =
    String(row?.pagado_si_no || "")
      .trim()
      .toUpperCase() === "NO";
  return {
    plate,
    dateLabel,
    dateMs: parseDateMs(dateLabel),
    value: Number.isFinite(value) ? value : 0,
    department: String(row?.departamento || "").trim(),
    city: String(row?.ciudad || "").trim(),
    paidLabel: pending ? "Pendiente" : "Pagado",
    pending,
    year: String(row?.vigencia || "").trim()
  };
}

export async function querySimitFinesFromOpenData(platesRaw: string[], pendingOnly: boolean) {
  const unique = uniquePlates(platesRaw);
  if (!unique.length) {
    return { ok: true, rows: [], truncated: false, pendingOnly };
  }
  const rows: ReturnType<typeof parseRow>[] = [];
  let truncated = false;
  for (let i = 0; i < unique.length; i += SIMIT_PLATE_BATCH) {
    const chunk = unique.slice(i, i + SIMIT_PLATE_BATCH);
    let offset = 0;
    for (;;) {
      const url = buildQueryUrl(chunk, pendingOnly, SIMIT_PAGE_SIZE, offset);
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        return {
          ok: false,
          rows: [],
          truncated: false,
          pendingOnly,
          error:
            res.status === 429
              ? "Datos.gov.co limitó las consultas. Espere un momento y vuelva a intentar."
              : "No se pudo consultar el historial SIMIT en datos.gov.co."
        };
      }
      const json = (await res.json()) as unknown;
      if (!Array.isArray(json)) {
        return { ok: false, rows: [], truncated: false, pendingOnly, error: "La respuesta de SIMIT no es válida." };
      }
      for (const item of json) {
        const parsed = parseRow((item || {}) as Record<string, unknown>);
        if (parsed.plate) rows.push(parsed);
      }
      if (json.length < SIMIT_PAGE_SIZE) break;
      offset += SIMIT_PAGE_SIZE;
      if (offset >= SIMIT_MAX_ROWS || rows.length >= SIMIT_MAX_ROWS) {
        truncated = true;
        break;
      }
    }
    if (truncated) break;
  }
  rows.sort((a, b) => (b.dateMs || 0) - (a.dateMs || 0));
  return { ok: true, rows, truncated, pendingOnly };
}
