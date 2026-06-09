/**
 * Sitio público: captura de nodos de texto, aplicación de idioma/tema y helpers de traducción.
 * El diccionario ES→EN y `translatePublicText` viven en `modules/domain/public-site.i18n.js`.
 */
import { UI_PREFS } from "./config.js";
import { state, nodes } from "./store.js";
import { syncPublicNavDrawer } from "./router.js";
export {
  PUBLIC_ES_EN_DICT,
  normalizePublicKey,
  escapePublicRegexFragment,
  findNormalizedSpan,
  replaceAllNormalizedSpans,
  getPublicTranslationSortedEntries,
  translatePublicText
} from "../domain/public-site.i18n.js";

const publicTextStore = [];
let publicTextCaptured = false;

export function capturePublicTextNodes() {
  if (publicTextCaptured) return;
  const scopes = [
    document.querySelector(".top-nav"),
    document.getElementById("public-app"),
    document.querySelector(".site-footer"),
    document.getElementById("auth-modal")
  ].filter(Boolean);
  scopes.forEach((scope) => {
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current) {
      const original = current.nodeValue;
      if (String(original || "").trim()) {
        publicTextStore.push({ node: current, original });
      }
      current = walker.nextNode();
    }
  });
  publicTextCaptured = true;
}

export const PUBLIC_TEXT_OVERRIDES = {
  es: {
    "#trusted .section-head p":
      "Aliados del sector floricultor, comercializador y exportador que priorizan puntualidad y conservacion de cadena de frio.",
    "#trusted .mini-metric:nth-child(1) p": "Viajes estimados al año.",
    "#trusted .mini-metric:nth-child(2) p": "Clientes satisfechos por nivel de servicio.",
    "#trusted .mini-metric:nth-child(3) p": "Monitoreo de operacion y trazabilidad.",
    "#about .about-grid article:nth-child(1) p":
      "Somos un operador logistico B2B especializado en transporte refrigerado para floricultores, comercializadores y exportadores. Integramos tecnologia, disciplina operativa y servicio cercano para garantizar entregas puntuales.",
    "#hierarchy .section-head p":
      "Liderazgo estrategico y operativo para asegurar excelencia en cada viaje y en toda la cadena de servicio.",
    "#testimonials .section-head p":
      "Experiencias reales de empresas que gestionan volumen, calidad y tiempos exigentes.",
    "#services .section-head p":
      "Soluciones logisticas integrales para el sector floricultor y de exportacion.",
    "#coverage-headline":
      "Ciudades y trayectos con mayor demanda registrada en solicitudes de transporte (se actualiza con los datos del servidor).",
    "#news .section-head p":
      "Cambios recientes en operacion, tecnologia y servicio para mantener a nuestros clientes informados.",
    "#contact .container > article:nth-child(2) .muted":
      "Con el servidor configurado, las solicitudes se registran de forma segura. Sin conexión, la información puede quedar solo en este navegador."
  },
  en: {
    "#trusted .section-head p":
      "Allies across floriculture, trading, and exports who prioritize punctuality and cold-chain integrity.",
    "#trusted .mini-metric:nth-child(1) p": "Estimated trips per year.",
    "#trusted .mini-metric:nth-child(2) p": "Repeat clients driven by service quality.",
    "#trusted .mini-metric:nth-child(3) p": "Operations monitoring and traceability.",
    "#about .about-grid article:nth-child(1) p":
      "We are a B2B logistics operator specialized in refrigerated transport for growers, distributors, and exporters. We combine technology, operational discipline, and close support to ensure on-time deliveries.",
    "#hierarchy .section-head p":
      "Strategic and operational leadership that ensures excellence on every trip and across the full service chain.",
    "#testimonials .section-head p":
      "Real stories from companies managing high volume, strict quality, and demanding timelines.",
    "#services .section-head p": "End-to-end logistics solutions for floriculture and export operations.",
    "#coverage-headline": "Main routes and frequent corridors for floriculture and exports.",
    "#news .section-head p":
      "Recent updates in operations, technology, and service to keep our clients informed.",
    "#contact .container > article:nth-child(2) .muted":
      "With the server configured, requests are stored securely. Without a connection, information may remain only in this browser."
  }
};

export function tPublic(textEs) {
  if (state.publicLang !== "en") return textEs;
  const tr = window.translatePublicText;
  return typeof tr === "function" ? tr(textEs, "en") : textEs;
}

export function setElementTextPreserveChildren(selector, text) {
  const el = document.querySelector(selector);
  if (!el) return;
  const textNodes = [...el.childNodes].filter(
    (node) => node.nodeType === Node.TEXT_NODE && String(node.nodeValue || "").trim()
  );
  if (!textNodes.length) {
    el.appendChild(document.createTextNode(` ${text}`));
    return;
  }
  const target = textNodes[textNodes.length - 1];
  const leading = /^\s/.test(target.nodeValue || "") ? " " : "";
  const trailing = /\s$/.test(target.nodeValue || "") ? " " : "";
  target.nodeValue = `${leading}${text}${trailing}`;
}

export function applyPublicLanguage(lang = "es") {
  capturePublicTextNodes();
  publicTextStore.forEach(({ node, original }) => {
    const tr = window.translatePublicText;
    node.nodeValue = lang === "en" && typeof tr === "function" ? tr(original, "en") : original;
  });
  nodes.langButtonsPublic.forEach((btn) => {
    btn.classList.toggle("active", String(btn.dataset.langOption || "") === lang);
  });
  const attrMap = {
    es: {
      "#open-auth": "Portal",
      "#open-auth-hero": "Ingresar al portal",
      "#logout": "Cerrar sesión"
    },
    en: {
      "#open-auth": "Portal",
      "#open-auth-hero": "Enter portal",
      "#logout": "Sign out"
    }
  };
  const attrs = attrMap[lang] || attrMap.es;
  Object.entries(attrs).forEach(([selector, value]) => {
    setElementTextPreserveChildren(selector, value);
  });

  const textOverrides = PUBLIC_TEXT_OVERRIDES[lang] || PUBLIC_TEXT_OVERRIDES.es;
  Object.entries(textOverrides).forEach(([selector, value]) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  });

  const placeholderMap = {
    es: {
      "input[name='name']": "Ej. Laura Castañeda",
      "input[name='company']": "Ej. Comercializadora S.A.S.",
      "input[name='taxId']": "Ej. 900123456-7",
      "input[name='position']": "Ej. Directora de Operaciones",
      "input[name='phone']": "+57 300 000 0000",
      "input[name='email']": "nombre@empresa.com",
      "textarea[name='message']": "Cuentanos origen/destino, volumen aproximado, frecuencia y ventana de entrega."
    },
    en: {
      "input[name='name']": "E.g. Laura Castaneda",
      "input[name='company']": "E.g. Trading Company S.A.S.",
      "input[name='taxId']": "E.g. 900123456-7",
      "input[name='position']": "E.g. Director of Operations",
      "input[name='phone']": "+57 300 000 0000",
      "input[name='email']": "name@company.com",
      "textarea[name='message']":
        "Tell us origin/destination, approximate volume, frequency, and delivery window."
    }
  };
  const placeholders = placeholderMap[lang] || placeholderMap.es;
  Object.entries(placeholders).forEach(([selector, value]) => {
    const el = document.querySelector(`#contact ${selector}`);
    if (el) el.setAttribute("placeholder", value);
  });

  const docLang = lang === "en" ? "en-US" : "es";
  document.documentElement.setAttribute("lang", docLang);

  document.title = lang === "en" ? "Transportes Antares" : "Transportes Antares";
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute(
      "content",
      lang === "en"
        ? "B2B logistics operator specialized in refrigerated transport for floriculture and exports, with traceability, compliance, and 24/7 monitoring across Colombia."
        : "Operador logistico B2B especializado en transporte refrigerado para floricultura y exportacion, con trazabilidad, cumplimiento y monitoreo 24/7 en Colombia."
    );
  }

  const mainNav = document.getElementById("main-nav");
  if (mainNav) mainNav.setAttribute("aria-label", lang === "en" ? "Main" : "Principal");

  const logoMarquee = document.querySelector(".logo-marquee");
  if (logoMarquee) logoMarquee.setAttribute("aria-label", lang === "en" ? "Partner companies" : "Empresas aliadas");

  const waFab = document.querySelector(".whatsapp-fab");
  if (waFab) {
    const waLabel = lang === "en" ? "Contact via WhatsApp" : "Contactar por WhatsApp";
    waFab.setAttribute("aria-label", waLabel);
    waFab.setAttribute("title", waLabel);
  }

  if (nodes.themeTogglePublic) nodes.themeTogglePublic.setAttribute("aria-label", lang === "en" ? "Theme" : "Tema");
  if (nodes.langTogglePublic) nodes.langTogglePublic.setAttribute("aria-label", lang === "en" ? "Language" : "Idioma");

  syncPublicNavDrawer();
}

export function applyTheme(theme = "light") {
  const mode = theme === "dark" ? "dark" : "light";
  document.body.setAttribute("data-theme", mode);
  state.theme = mode;
  localStorage.setItem(UI_PREFS.theme, mode);
  [...nodes.themeButtonsPublic, ...nodes.themeButtonsPortal].forEach((btn) => {
    btn.classList.toggle("active", String(btn.dataset.themeOption || "") === mode);
  });
}
