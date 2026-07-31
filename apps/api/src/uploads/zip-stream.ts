/**
 * Escritor ZIP mínimo (APPNOTE 6.3.2, sin ZIP64) sobre un stream de salida.
 *
 * Se implementa aquí para no añadir dependencias al API: cada entrada se comprime
 * en memoria y se vuelca de inmediato, así solo un archivo ocupa RAM a la vez.
 * Al no usar ZIP64 el archivo resultante debe quedar por debajo de 4 GB y 65535
 * entradas; quien lo use debe imponer esos límites antes de empezar a escribir.
 */
import { deflateRawSync } from "node:zlib";
import type { Writable } from "node:stream";

const LOCAL_HEADER_SIG = 0x04034b50;
const CENTRAL_HEADER_SIG = 0x02014b50;
const END_OF_CENTRAL_DIR_SIG = 0x06054b50;
/** Bit 11: los nombres van en UTF-8 (tildes y ñ del nombre de carpeta). */
const FLAG_UTF8 = 0x0800;
const METHOD_STORE = 0;
const METHOD_DEFLATE = 8;
const VERSION_NEEDED = 20;

/** Formatos ya comprimidos: deflate solo gastaría CPU sin reducir tamaño. */
const ALREADY_COMPRESSED_EXT = new Set([
  "7z",
  "avi",
  "bz2",
  "docx",
  "gif",
  "gz",
  "jpeg",
  "jpg",
  "mkv",
  "mov",
  "mp3",
  "mp4",
  "odt",
  "ogg",
  "png",
  "pptx",
  "rar",
  "webp",
  "xlsx",
  "zip"
]);

const CRC32_TABLE = buildCrc32Table();

function buildCrc32Table(): Uint32Array {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  return table;
}

export function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC32_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date): { time: number; date: number } {
  const year = date.getFullYear();
  if (year < 1980) return { time: 0, date: (1 << 5) | 1 };
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  };
}

function shouldStore(entryName: string): boolean {
  const idx = entryName.lastIndexOf(".");
  if (idx < 0) return false;
  return ALREADY_COMPRESSED_EXT.has(entryName.slice(idx + 1).toLowerCase());
}

type CentralEntry = {
  nameBytes: Buffer;
  method: number;
  crc: number;
  compressedSize: number;
  rawSize: number;
  dosTime: number;
  dosDate: number;
  offset: number;
};

export class ZipStreamWriter {
  private readonly entries: CentralEntry[] = [];
  private offset = 0;
  private finalized = false;

  constructor(private readonly out: Writable) {}

  get entryCount(): number {
    return this.entries.length;
  }

  /** Escribe una entrada completa (cabecera local + datos) y la registra para el índice final. */
  async addFile(name: string, data: Buffer, modifiedAt?: Date): Promise<void> {
    if (this.finalized) throw new Error("El ZIP ya fue cerrado.");
    const nameBytes = Buffer.from(name, "utf8");
    const store = shouldStore(name) || data.length === 0;
    const payload = store ? data : deflateRawSync(data);
    /* Si deflate no aporta, se guarda tal cual para no inflar el archivo. */
    const useStore = store || payload.length >= data.length;
    const body = useStore ? data : payload;
    const checksum = crc32(data);
    const stamp = dosDateTime(modifiedAt instanceof Date && !Number.isNaN(modifiedAt.getTime()) ? modifiedAt : new Date());

    const header = Buffer.alloc(30);
    header.writeUInt32LE(LOCAL_HEADER_SIG, 0);
    header.writeUInt16LE(VERSION_NEEDED, 4);
    header.writeUInt16LE(FLAG_UTF8, 6);
    header.writeUInt16LE(useStore ? METHOD_STORE : METHOD_DEFLATE, 8);
    header.writeUInt16LE(stamp.time, 10);
    header.writeUInt16LE(stamp.date, 12);
    header.writeUInt32LE(checksum, 14);
    header.writeUInt32LE(body.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(nameBytes.length, 26);
    header.writeUInt16LE(0, 28);

    this.entries.push({
      nameBytes,
      method: useStore ? METHOD_STORE : METHOD_DEFLATE,
      crc: checksum,
      compressedSize: body.length,
      rawSize: data.length,
      dosTime: stamp.time,
      dosDate: stamp.date,
      offset: this.offset
    });

    await this.write(header);
    await this.write(nameBytes);
    await this.write(body);
  }

  /** Escribe el directorio central y cierra el archivo. */
  async finalize(): Promise<void> {
    if (this.finalized) return;
    this.finalized = true;
    const centralOffset = this.offset;
    for (const entry of this.entries) {
      const record = Buffer.alloc(46);
      record.writeUInt32LE(CENTRAL_HEADER_SIG, 0);
      record.writeUInt16LE(VERSION_NEEDED, 4);
      record.writeUInt16LE(VERSION_NEEDED, 6);
      record.writeUInt16LE(FLAG_UTF8, 8);
      record.writeUInt16LE(entry.method, 10);
      record.writeUInt16LE(entry.dosTime, 12);
      record.writeUInt16LE(entry.dosDate, 14);
      record.writeUInt32LE(entry.crc, 16);
      record.writeUInt32LE(entry.compressedSize, 20);
      record.writeUInt32LE(entry.rawSize, 24);
      record.writeUInt16LE(entry.nameBytes.length, 28);
      record.writeUInt16LE(0, 30);
      record.writeUInt16LE(0, 32);
      record.writeUInt16LE(0, 34);
      record.writeUInt16LE(0, 36);
      record.writeUInt32LE(0, 38);
      record.writeUInt32LE(entry.offset, 42);
      await this.write(record);
      await this.write(entry.nameBytes);
    }
    const centralSize = this.offset - centralOffset;
    const end = Buffer.alloc(22);
    end.writeUInt32LE(END_OF_CENTRAL_DIR_SIG, 0);
    end.writeUInt16LE(0, 4);
    end.writeUInt16LE(0, 6);
    end.writeUInt16LE(this.entries.length, 8);
    end.writeUInt16LE(this.entries.length, 10);
    end.writeUInt32LE(centralSize, 12);
    end.writeUInt32LE(centralOffset, 16);
    end.writeUInt16LE(0, 20);
    await this.write(end);
  }

  private write(chunk: Buffer): Promise<void> {
    this.offset += chunk.length;
    return new Promise<void>((resolve, reject) => {
      const flushed = this.out.write(chunk, (err) => {
        if (err) reject(err);
      });
      if (flushed) {
        resolve();
        return;
      }
      this.out.once("drain", resolve);
    });
  }
}

/** Nombre de entrada seguro: separadores `/`, sin rutas relativas ni caracteres de control. */
export function sanitizeZipEntryName(raw: string, fallback = "archivo"): string {
  const cleaned = String(raw || "")
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) =>
      segment
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001f\u007f:*?"<>|]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((segment) => segment && segment !== "." && segment !== "..")
    .join("/");
  return cleaned.slice(0, 200) || fallback;
}

/** Añade sufijo incremental para que dos archivos homónimos convivan en el ZIP. */
export function uniqueZipEntryName(name: string, taken: Set<string>): string {
  const key = name.toLowerCase();
  if (!taken.has(key)) {
    taken.add(key);
    return name;
  }
  const dot = name.lastIndexOf(".");
  const slash = name.lastIndexOf("/");
  const hasExt = dot > slash + 1;
  const base = hasExt ? name.slice(0, dot) : name;
  const ext = hasExt ? name.slice(dot) : "";
  for (let i = 2; i < 10000; i += 1) {
    const candidate = `${base} (${i})${ext}`;
    if (!taken.has(candidate.toLowerCase())) {
      taken.add(candidate.toLowerCase());
      return candidate;
    }
  }
  const fallback = `${base}-${Date.now()}${ext}`;
  taken.add(fallback.toLowerCase());
  return fallback;
}
