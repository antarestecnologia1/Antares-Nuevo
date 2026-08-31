/**
 * Nucleo de deteccion y reparacion de codificacion.
 *
 * Todo el analisis se hace sobre BYTES. No se asume que Node, la consola o
 * PowerShell hayan leido bien el archivo: esa suposicion es justamente la que
 * produce el dano en primer lugar.
 *
 * encoding-tool:allow-mojibake (los ejemplos en los comentarios son a proposito)
 */

const utf8Strict = new TextDecoder('utf-8', { fatal: true });
const utf8Loose = new TextDecoder('utf-8');
const cp1252Decoder = new TextDecoder('windows-1252');
const utf8Encoder = new TextEncoder();

/**
 * Tabla inversa de windows-1252 (caracter -> byte).
 * Se construye decodificando los 256 bytes posibles, asi la tabla es
 * exactamente la del runtime y no una copia hecha a mano.
 */
const CP1252_FROM_CHAR = (() => {
  const map = new Map();
  const bytes = new Uint8Array(1);
  for (let b = 0; b < 256; b += 1) {
    bytes[0] = b;
    const ch = cp1252Decoder.decode(bytes);
    if (!map.has(ch)) map.set(ch, b);
  }
  return map;
})();

/** Caracteres que suelen encabezar una secuencia de mojibake real. */
const MOJIBAKE_LEAD = /[\u00C2-\u00DF\u00E2\u00C3\u0152\u0161\u00C5]/;

/**
 * Codepages OEM del terminal de Windows (rango 0x80-0xFF). Cuando la salida de
 * una herramienta UTF-8 pasa por la consola y se captura a un archivo, los
 * bytes UTF-8 se releen como cp437/cp850 y aparece mojibake con cajas y griegas.
 * Se prueban las dos porque difieren justo donde cae el dano: cp437 0xE2 es
 * Gamma y cp850 0xE2 es O-circunflejo.
 *
 * Tablas generadas desde System.Text.Encoding.GetEncoding(437|850); no editar a mano.
 */
const CP437_HIGH =
  '\u00c7\u00fc\u00e9\u00e2\u00e4\u00e0\u00e5\u00e7\u00ea\u00eb\u00e8\u00ef\u00ee\u00ec\u00c4\u00c5\u00c9\u00e6\u00c6\u00f4\u00f6\u00f2\u00fb\u00f9\u00ff\u00d6\u00dc\u00a2\u00a3\u00a5\u20a7\u0192\u00e1\u00ed\u00f3\u00fa\u00f1\u00d1\u00aa\u00ba\u00bf\u2310\u00ac\u00bd\u00bc\u00a1\u00ab\u00bb\u2591\u2592\u2593\u2502\u2524\u2561\u2562\u2556\u2555\u2563\u2551\u2557\u255d\u255c\u255b\u2510\u2514\u2534\u252c\u251c\u2500\u253c\u255e\u255f\u255a\u2554\u2569\u2566\u2560\u2550\u256c\u2567\u2568\u2564\u2565\u2559\u2558\u2552\u2553\u256b\u256a\u2518\u250c\u2588\u2584\u258c\u2590\u2580\u03b1\u00df\u0393\u03c0\u03a3\u03c3\u00b5\u03c4\u03a6\u0398\u03a9\u03b4\u221e\u03c6\u03b5\u2229\u2261\u00b1\u2265\u2264\u2320\u2321\u00f7\u2248\u00b0\u2219\u00b7\u221a\u207f\u00b2\u25a0\u00a0';

const CP850_HIGH =
  '\u00c7\u00fc\u00e9\u00e2\u00e4\u00e0\u00e5\u00e7\u00ea\u00eb\u00e8\u00ef\u00ee\u00ec\u00c4\u00c5\u00c9\u00e6\u00c6\u00f4\u00f6\u00f2\u00fb\u00f9\u00ff\u00d6\u00dc\u00f8\u00a3\u00d8\u00d7\u0192\u00e1\u00ed\u00f3\u00fa\u00f1\u00d1\u00aa\u00ba\u00bf\u00ae\u00ac\u00bd\u00bc\u00a1\u00ab\u00bb\u2591\u2592\u2593\u2502\u2524\u00c1\u00c2\u00c0\u00a9\u2563\u2551\u2557\u255d\u00a2\u00a5\u2510\u2514\u2534\u252c\u251c\u2500\u253c\u00e3\u00c3\u255a\u2554\u2569\u2566\u2560\u2550\u256c\u00a4\u00f0\u00d0\u00ca\u00cb\u00c8\u0131\u00cd\u00ce\u00cf\u2518\u250c\u2588\u2584\u00a6\u00cc\u2580\u00d3\u00df\u00d4\u00d2\u00f5\u00d5\u00b5\u00fe\u00de\u00da\u00db\u00d9\u00fd\u00dd\u00af\u00b4\u00ad\u00b1\u2017\u00be\u00b6\u00a7\u00f7\u00b8\u00b0\u00a8\u00b7\u00b9\u00b3\u00b2\u25a0\u00a0';

/**
 * Firma del mojibake OEM: los bytes lead de UTF-8 caen sobre caracteres de
 * dibujo de cajas, sombreados o griegos. Verlos pegados a texto normal es
 * practicamente siempre dano, no contenido real.
 */
const OEM_LEAD = /[\u2500-\u257F\u2591-\u2593\u0393\u2310]/;

function buildOemTable(high) {
  const map = new Map();
  for (let b = 0; b < 128; b += 1) map.set(String.fromCharCode(b), b);
  for (let i = 0; i < high.length; i += 1) {
    if (!map.has(high[i])) map.set(high[i], 128 + i);
  }
  return map;
}

const OEM_TABLES = [buildOemTable(CP850_HIGH), buildOemTable(CP437_HIGH)];

/** Corridas de caracteres no-ASCII candidatas a ser mojibake. */
const NON_ASCII_RUN = /[^\u0000-\u007F]+/g;

/**
 * Un archivo con este marcador declara que sus secuencias tipo "A-tilde" son
 * intencionales (tablas de reparacion, ejemplos en documentacion). Se reporta
 * como INTENTIONAL pero nunca se reescribe: "repararlo" lo romperia.
 */
export const IGNORE_PRAGMA = 'encoding-tool:allow-mojibake';

export function hasUtf8Bom(buf) {
  return buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
}

export function detectUtf16(buf) {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) return 'utf-16le';
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) return 'utf-16be';
  return null;
}

export function isValidUtf8(buf) {
  try {
    utf8Strict.decode(buf);
    return true;
  } catch {
    return false;
  }
}

/** Convierte una cadena a bytes con la tabla dada. Null si algun caracter no cabe. */
function encodeWithTable(str, table) {
  const out = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i += 1) {
    const byte = table.get(str[i]);
    if (byte === undefined) return null;
    out[i] = byte;
  }
  return out;
}

/** Rechaza resultados que claramente no son texto util (controles C0/C1). */
function looksLikeSaneText(str) {
  // eslint-disable-next-line no-control-regex
  return !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFD]/.test(str);
}

/**
 * Repara la doble codificacion ("Ã¡" -> "a con tilde") corrida por corrida.
 *
 * No transforma el archivo completo de golpe: eso romperia emojis y simbolos
 * legitimos. Solo sustituye las corridas que, reinterpretadas, producen
 * UTF-8 valido y texto sano.
 */
function repairRuns(text, table, lead) {
  let current = text;
  let totalFixes = 0;

  // Puede haber doble o triple codificacion acumulada por ediciones sucesivas.
  for (let pass = 0; pass < 5; pass += 1) {
    let passFixes = 0;
    const next = current.replace(NON_ASCII_RUN, (run) => {
      if (!lead.test(run)) return run;
      const bytes = encodeWithTable(run, table);
      if (!bytes) return run;
      let decoded;
      try {
        decoded = utf8Strict.decode(bytes);
      } catch {
        return run;
      }
      if (decoded === run) return run;
      if (!looksLikeSaneText(decoded)) return run;
      passFixes += 1;
      return decoded;
    });
    current = next;
    totalFixes += passFixes;
    if (passFixes === 0) break;
  }

  return { text: current, fixes: totalFixes };
}

/** UTF-8 leido como Windows-1252 ("GestiA-tilde-3n"). */
export function demojibake(text) {
  return repairRuns(text, CP1252_FROM_CHAR, MOJIBAKE_LEAD);
}

/** UTF-8 leido como OEM cp850/cp437, tipico de capturar salida de consola. */
export function demojibakeOem(text) {
  let current = text;
  let fixes = 0;
  for (const table of OEM_TABLES) {
    const r = repairRuns(current, table, OEM_LEAD);
    current = r.text;
    fixes += r.fixes;
  }
  return { text: current, fixes };
}

/** Ubica en que lineas aparece un patron, para el reporte. */
function sampleLines(text, pattern, limit = 3) {
  const samples = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length && samples.length < limit; i += 1) {
    if (!pattern.test(lines[i])) continue;
    const trimmed = lines[i].trim();
    samples.push({
      line: i + 1,
      text: trimmed.length > 160 ? `${trimmed.slice(0, 160)}...` : trimmed,
    });
  }
  return samples;
}

/**
 * Clasifica un buffer y devuelve los problemas encontrados.
 * issues puede contener: UTF16, NOT_UTF8, MOJIBAKE, LOST_CHARS, BOM
 */
export function classify(buf) {
  const issues = [];
  let samples = [];

  const utf16 = detectUtf16(buf);
  if (utf16) {
    return { issues: ['UTF16'], samples: [], encoding: utf16 };
  }

  const bom = hasUtf8Bom(buf);
  if (bom) issues.push('BOM');

  const body = bom ? buf.subarray(3) : buf;

  if (!isValidUtf8(body)) {
    issues.push('NOT_UTF8');
    const text = cp1252Decoder.decode(body);
    samples = sampleLines(text, /[^\u0000-\u007F]/);
    return { issues, samples, encoding: 'windows-1252' };
  }

  const text = utf8Loose.decode(body);

  if (text.includes('\uFFFD')) {
    issues.push('LOST_CHARS');
    samples = samples.concat(sampleLines(text, /\uFFFD/));
  }

  const repaired = demojibake(text);
  const oem = demojibakeOem(text);

  if ((repaired.fixes > 0 || oem.fixes > 0) && text.includes(IGNORE_PRAGMA)) {
    issues.push('INTENTIONAL');
  } else {
    if (repaired.fixes > 0) {
      issues.push('MOJIBAKE');
      samples = samples.concat(sampleLines(text, MOJIBAKE_LEAD));
    }
    if (oem.fixes > 0) {
      issues.push('MOJIBAKE_OEM');
      samples = samples.concat(sampleLines(text, OEM_LEAD));
    }
  }

  return { issues, samples, encoding: 'utf-8' };
}

/**
 * Devuelve el contenido corregido de un buffer, o null si no hay nada que hacer.
 * Nunca intenta adivinar caracteres perdidos (U+FFFD).
 */
export function repair(buf) {
  const utf16 = detectUtf16(buf);
  if (utf16) {
    const text = new TextDecoder(utf16).decode(buf).replace(/^\uFEFF/, '');
    return { buffer: Buffer.from(utf8Encoder.encode(text)), action: 'UTF16 -> UTF-8' };
  }

  const bom = hasUtf8Bom(buf);
  const body = bom ? buf.subarray(3) : buf;

  if (!isValidUtf8(body)) {
    const text = cp1252Decoder.decode(body);
    // El archivo estaba en cp1252; tras convertirlo aun puede quedar mojibake previo.
    const fixed = demojibake(text).text;
    return { buffer: Buffer.from(utf8Encoder.encode(fixed)), action: 'windows-1252 -> UTF-8' };
  }

  const text = utf8Loose.decode(body);

  if (text.includes(IGNORE_PRAGMA)) {
    if (!bom) return null;
    return { buffer: Buffer.from(utf8Encoder.encode(text)), action: 'BOM eliminado' };
  }

  // El mojibake OEM se detecta aqui pero NO se reescribe: distinguirlo de un
  // diagrama hecho con caracteres de caja exige criterio. Para repararlo usa
  // scripts/encoding-tool.ps1 -Mode Fix, que reporta cada cambio.
  const { text: fixed, fixes } = demojibake(text);

  if (fixes === 0 && !bom) return null;

  const actions = [];
  if (bom) actions.push('BOM eliminado');
  if (fixes > 0) actions.push(`${fixes} secuencia(s) de mojibake corregidas`);

  return { buffer: Buffer.from(utf8Encoder.encode(fixed)), action: actions.join(' + ') };
}
