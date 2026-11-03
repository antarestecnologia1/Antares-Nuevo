/**
 * Mapa de rutas de Colombia para la Torre de control (puro: sin DOM ni store).
 *
 * El contorno es el de Colombia de Natural Earth (dominio público), simplificado a ~290 puntos.
 * No hay GPS: cada viaje se dibuja como una curva entre la ciudad de origen y la de destino, y su
 * punto se coloca según el avance por tiempo (recogida → entrega estimada). Es una estimación.
 */

export const COLOMBIA_MAP = Object.freeze({
  width: 386,
  height: 521,
  scale: 30, // unidades de mapa por grado
  lngMin: -79.3762,
  latMax: 12.7839,
  outline: "M241.7 27.6L235.3 30.3L222.5 33.5L213.9 47.6L207.9 50.1L200.6 58.5L195.2 68.8L191.1 89.8L180.3 107.7L181.1 108.5L185.5 107.7L189.6 105.8L191.0 106.3L192.5 109.5L197.3 110.2L201.3 124.7L208.8 132.1L210.4 138.9L210.5 140.9L207.9 144.6L207.2 157.8L209.4 161.1L215.1 162.4L218.7 170.6L221.1 172.5L224.6 173.8L232.7 172.5L247.5 173.9L250.9 173.7L259.1 170.8L269.7 174.3L277.4 174.9L298.4 199.8L300.6 199.1L303.3 200.5L308.6 198.0L313.1 197.6L319.2 198.8L327.2 198.8L343.1 196.3L345.5 194.8L354.3 196.3L356.9 198.1L358.2 202.7L357.1 205.6L354.1 208.5L352.3 212.3L352.0 216.7L350.5 220.1L347.7 222.3L346.5 225.4L347.1 229.5L345.6 248.3L346.8 249.9L347.8 257.6L351.5 267.6L353.2 270.4L356.3 272.8L361.9 281.1L360.6 283.8L346.3 296.7L345.5 299.7L348.3 298.5L352.8 299.7L354.3 302.8L365.0 311.8L364.9 315.3L367.9 322.0L367.3 323.5L374.8 342.8L375.0 346.8L368.8 348.0L368.6 335.1L360.7 320.9L359.2 320.0L354.6 321.3L346.8 329.8L343.3 331.1L340.3 329.9L337.4 324.9L335.5 323.9L333.6 328.1L336.0 331.9L301.7 331.9L295.0 330.3L285.8 332.3L285.7 351.7L301.9 352.0L303.5 353.0L306.4 357.6L306.6 364.2L302.8 364.7L297.1 361.6L287.1 365.3L279.6 366.2L279.2 387.7L283.6 393.0L292.3 398.8L293.6 402.7L292.9 406.4L295.0 411.0L297.8 413.5L297.8 416.3L299.3 419.4L282.3 510.6L276.3 505.0L274.1 500.0L271.1 498.0L265.4 499.5L259.2 497.0L279.1 466.0L278.5 463.3L261.8 455.7L260.1 453.8L252.2 449.7L247.9 450.9L245.4 452.9L239.4 453.5L234.5 450.3L228.7 448.1L221.8 453.3L219.7 453.2L214.7 455.5L209.4 456.4L202.5 454.1L196.9 455.7L193.0 455.3L191.6 453.7L186.6 451.9L186.1 449.7L187.5 445.9L185.4 438.4L184.6 437.1L180.8 437.0L176.4 434.3L175.5 432.7L176.5 429.6L175.6 427.0L171.3 421.0L165.4 419.4L159.6 414.4L153.9 412.6L151.2 409.0L148.7 400.9L142.8 394.6L138.6 392.5L137.2 389.5L133.0 389.2L127.1 385.0L124.5 384.7L122.7 386.7L117.3 384.6L112.8 381.6L108.0 380.8L104.9 379.0L99.3 373.1L93.1 370.3L89.7 371.4L88.5 375.7L86.4 376.5L79.4 375.4L76.4 376.1L67.8 372.9L59.4 371.7L57.3 364.4L51.9 361.8L50.2 358.4L46.4 358.8L31.9 352.1L25.9 347.6L20.9 345.0L15.5 339.9L14.6 337.8L10.5 334.8L12.6 330.9L17.5 328.0L24.0 330.3L24.8 325.8L22.4 321.8L23.6 312.8L25.3 310.8L28.8 309.0L31.0 309.7L32.4 308.2L37.7 308.9L39.3 308.2L43.3 304.6L45.1 301.7L46.9 302.0L48.0 299.9L51.2 297.1L50.5 292.3L54.6 291.2L58.8 283.2L60.6 283.0L61.6 279.3L68.9 266.1L66.3 267.7L63.4 266.7L63.9 262.3L63.0 261.8L60.5 265.2L58.5 261.7L59.0 256.1L55.6 257.2L55.9 255.8L60.7 251.6L62.7 241.8L61.2 238.4L60.1 223.8L59.2 221.0L55.2 217.4L61.6 213.2L63.9 210.1L60.9 203.7L57.2 198.2L57.0 195.0L59.3 195.3L60.2 186.3L58.1 182.8L55.5 182.7L47.2 169.4L44.3 166.6L46.5 160.2L48.9 157.4L48.4 152.6L50.1 152.8L53.7 157.2L55.1 156.5L60.7 152.4L60.9 148.4L65.4 144.3L59.1 130.7L56.9 128.6L59.5 124.2L60.9 124.4L63.4 128.7L67.4 131.5L73.2 139.1L75.7 140.8L73.9 142.5L73.6 144.3L75.3 146.0L77.7 145.5L79.0 143.5L78.1 134.2L76.7 129.6L73.7 126.3L74.7 124.9L80.6 122.7L93.0 113.8L97.2 105.5L100.5 102.5L104.1 100.6L108.6 101.1L112.1 100.0L113.2 97.4L110.8 91.6L113.5 83.7L113.4 79.8L115.2 77.4L114.5 76.4L110.1 79.2L114.7 73.7L117.9 65.2L136.0 50.2L147.7 53.8L151.3 53.6L146.5 55.5L145.8 57.6L147.4 59.9L149.3 60.5L150.8 59.1L154.7 50.3L155.3 45.5L156.9 43.9L159.5 43.3L171.0 45.4L181.9 44.7L199.6 32.2L213.0 26.9L216.4 21.7L217.2 17.8L219.6 16.4L222.2 16.4L223.7 14.2L229.9 10.9L236.4 10.6L243.5 13.5L246.6 18.6L247.1 22.1L241.7 27.6Z"
});

/** [latitud, longitud, nombre para mostrar, ciudad principal (se rotula siempre)] */
const CITIES = [
  [4.711, -74.072, "Bogotá", 1], [6.244, -75.581, "Medellín", 1], [3.451, -76.532, "Cali", 1],
  [10.963, -74.796, "Barranquilla", 1], [10.391, -75.479, "Cartagena", 1], [7.119, -73.123, "Bucaramanga", 1],
  [7.893, -72.508, "Cúcuta", 1], [4.813, -75.696, "Pereira", 0], [5.068, -75.517, "Manizales", 0],
  [4.533, -75.681, "Armenia", 0], [4.438, -75.232, "Ibagué", 0], [2.935, -75.282, "Neiva", 0],
  [11.241, -74.199, "Santa Marta", 0], [4.142, -73.627, "Villavicencio", 0], [1.214, -77.281, "Pasto", 1],
  [2.444, -76.614, "Popayán", 0], [5.535, -73.367, "Tunja", 0], [8.750, -75.881, "Montería", 0],
  [9.305, -75.397, "Sincelejo", 0], [10.477, -73.250, "Valledupar", 0], [11.544, -72.907, "Riohacha", 0],
  [5.337, -72.395, "Yopal", 0], [3.880, -77.031, "Buenaventura", 0], [1.614, -75.606, "Florencia", 0],
  [5.693, -76.658, "Quibdó", 0], [7.085, -70.759, "Arauca", 0], [1.149, -76.647, "Mocoa", 0],
  [4.303, -74.803, "Girardot", 0], [5.827, -73.034, "Duitama", 0], [7.065, -73.854, "Barrancabermeja", 0],
  [5.714, -72.934, "Sogamoso", 0], [5.026, -74.005, "Zipaquirá", 0], [4.579, -74.217, "Soacha", 0],
  [3.539, -76.303, "Palmira", 0], [4.084, -76.195, "Tuluá", 0], [6.170, -75.590, "Envigado", 0],
  [6.155, -75.374, "Rionegro", 0], [7.883, -76.626, "Apartadó", 0], [8.093, -76.728, "Turbo", 0],
  [11.378, -72.239, "Maicao", 0], [8.237, -73.356, "Ocaña", 0], [7.378, -72.648, "Pamplona", 0],
  [5.450, -74.670, "La Dorada", 0], [4.746, -75.912, "Cartago", 0], [4.840, -75.670, "Dosquebradas", 0],
  [3.583, -76.495, "Yumbo", 0], [4.716, -74.210, "Funza", 0], [4.706, -74.230, "Mosquera", 0],
  [4.918, -74.028, "Cajicá", 0], [4.860, -74.060, "Chía", 0], [4.810, -74.356, "Facatativá", 0],
  [4.337, -74.364, "Fusagasugá", 0], [4.150, -74.883, "Espinal", 0], [5.200, -74.740, "Honda", 0],
  [5.970, -74.590, "Puerto Boyacá", 0], [8.310, -73.620, "Aguachica", 0], [9.240, -74.750, "Magangué", 0],
  [10.630, -74.920, "Sabanalarga", 0], [10.920, -74.770, "Soledad", 0], [10.860, -74.780, "Malambo", 0],
  [11.000, -74.250, "Ciénaga", 0], [6.200, -75.570, "Itagüí", 0], [6.337, -75.557, "Bello", 0],
  [7.074, -73.170, "Floridablanca", 0], [7.070, -73.170, "Girón", 0], [6.990, -73.050, "Piedecuesta", 0],
  [3.420, -76.350, "Candelaria", 0], [4.470, -75.730, "Calarcá", 0], [8.600, -76.290, "Caucasia", 0],
  [1.860, -76.050, "Pitalito", 0], [2.200, -75.650, "Garzón", 0], [3.990, -73.760, "Acacías", 0]
];

const INDEX = new Map();

/** «Bogotá D.C.» → «bogota»; «MEDELLÍN (Antioquia)» → «medellin». */
export function normalizeCity(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/\bd\.?\s?c\.?(?=\s|$)/g, " ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

CITIES.forEach(([lat, lng, label, major]) => INDEX.set(normalizeCity(label), { lat, lng, label, major: Boolean(major) }));
const ALIASES = { "santafe de bogota": "bogota", "cartagena de indias": "cartagena" };

/** Lat/lng → coordenadas del mapa. */
export function projectLatLng(lat, lng) {
  const m = COLOMBIA_MAP;
  return { x: (lng - m.lngMin) * m.scale, y: (m.latMax - lat) * m.scale };
}

export function cityPoint(name) {
  const key = normalizeCity(name);
  const hit = INDEX.get(ALIASES[key] || key);
  if (!hit) return null;
  return { ...projectLatLng(hit.lat, hit.lng), label: hit.label, major: hit.major };
}

/** Punto de una curva cuadrática en t (0–1). */
export function quadPoint(p0, c, p1, t) {
  const u = 1 - t;
  return { x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x, y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y };
}

function hashSign(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0;
  return h % 2 === 0 ? 1 : -1;
}

const r1 = (n) => Math.round(n * 10) / 10;

/**
 * Rutas dibujables a partir de las filas del tablero de hoy (solo viajes en ruta o programados).
 * @returns {{ routes: object[], cities: object[], missing: number, counts: {route:number, late:number, plan:number} }}
 */
export function buildRouteMap(rows) {
  const routes = [];
  const used = new Set();
  let missing = 0;
  (Array.isArray(rows) ? rows : []).forEach((r) => {
    if (r.bucket !== "route" && r.bucket !== "assigned") return;
    const a = cityPoint(r.origin);
    const b = cityPoint(r.destination);
    if (!a || !b) {
      missing += 1;
      return;
    }
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const bend = (dist < 1 ? 0 : 0.2) * hashSign(String(r.id || r.number));
    const c = { x: (a.x + b.x) / 2 - dy * bend, y: (a.y + b.y) / 2 + dx * bend };
    const t = r.bucket === "assigned" || r.progress == null ? 0 : Math.max(0, Math.min(1, r.progress / 100));
    const pos = dist < 1 ? { x: a.x, y: a.y } : quadPoint(a, c, b, t);
    const state = r.delayed ? "late" : r.bucket === "route" ? "route" : "plan";
    used.add(a.label);
    used.add(b.label);
    routes.push({
      id: r.id,
      number: r.number,
      client: r.client,
      plate: r.plate,
      driver: r.driver,
      originLabel: a.label,
      destinationLabel: b.label,
      state,
      progress: r.progress,
      etaLabel: r.etaLabel,
      lateMin: r.lateMin,
      path: dist < 1 ? "" : `M${r1(a.x)} ${r1(a.y)}Q${r1(c.x)} ${r1(c.y)} ${r1(b.x)} ${r1(b.y)}`,
      origin: { x: r1(a.x), y: r1(a.y) },
      destination: { x: r1(b.x), y: r1(b.y) },
      pos: { x: r1(pos.x), y: r1(pos.y) }
    });
  });
  const order = { late: 0, route: 1, plan: 2 };
  routes.sort((x, y) => order[x.state] - order[y.state]);
  const cities = [];
  INDEX.forEach((v) => {
    const p = projectLatLng(v.lat, v.lng);
    const endpoint = used.has(v.label);
    if (v.major || endpoint) cities.push({ label: v.label, x: r1(p.x), y: r1(p.y), endpoint });
  });
  const counts = { route: 0, late: 0, plan: 0 };
  routes.forEach((r) => {
    counts[r.state] += 1;
  });
  return { routes, cities, missing, counts };
}
