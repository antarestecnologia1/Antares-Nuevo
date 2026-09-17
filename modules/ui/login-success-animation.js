/**
 * Animación de éxito de login: verificación de seguridad tipo escáner —
 * un anillo gira alrededor de un escudo mientras una línea de escaneo lo
 * recorre; al completarse, el escudo se ilumina con un check. Estética
 * técnica/corporativa (trazos finos, azul de marca sobre blanco), sin
 * elementos figurativos. Autocontenida (CSS inyectado en <style>, sin
 * archivo externo) para no depender del timing de carga del CSS diferido
 * de módulos — este overlay debe estar listo el instante en que el login
 * es exitoso, sin parpadeo sin estilos.
 *
 * API en dos pasos, pensada para eliminar cualquier fotograma intermedio
 * sin cubrir entre el modal de login y el portal:
 *
 *   showLoginSuccessOverlay()               — SÍNCRONA e instantánea. Crea y
 *     muestra el overlay ya opaco (sin fade-in) cubriendo toda la pantalla.
 *     Llamarla ANTES de `hideAuth()`, para que el modal de login desaparezca
 *     directamente sobre el overlay en vez de revelar el sitio público por
 *     debajo durante un instante.
 *
 *   await waitAndDismissLoginSuccessOverlay() — espera lo que falte de la
 *     animación y retira el overlay con un fade-out corto. Llamarla DESPUÉS
 *     de que `renderPortal()` ya haya pintado el portal detrás, para que el
 *     fade-out revele el portal ya listo y no un estado intermedio.
 *
 * Si el usuario tiene `prefers-reduced-motion: reduce`, ambos pasos se
 * resuelven de inmediato sin animar (accesibilidad).
 */

const OVERLAY_ID = "login-success-overlay";
const STYLE_ID = "login-success-overlay-style";
const ANIMATION_TOTAL_MS = 2500;
const FADE_OUT_MS = 260;
const FALLBACK_SAFETY_MS = ANIMATION_TOTAL_MS + 1200;

let stylesInjected = false;
let overlayShownAt = 0;
let reduceMotionCached = null;

function prefersReducedMotion() {
  if (reduceMotionCached !== null) return reduceMotionCached;
  reduceMotionCached =
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reduceMotionCached;
}

function ensureStylesInjected() {
  if (stylesInjected || document.getElementById(STYLE_ID)) {
    stylesInjected = true;
    return;
  }
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
#${OVERLAY_ID} {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  opacity: 0;
  transition: opacity ${FADE_OUT_MS}ms ease;
  pointer-events: none;
}
#${OVERLAY_ID}.is-visible {
  opacity: 1;
  pointer-events: all;
}
#${OVERLAY_ID}.is-leaving {
  opacity: 0;
}
#${OVERLAY_ID} .lsa-stage {
  position: relative;
  width: min(220px, 60vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}
#${OVERLAY_ID} .lsa-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}
#${OVERLAY_ID} .lsa-msg {
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  color: #6b7684;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0;
  animation: lsa-msg-fade 0.35s ease forwards;
  animation-delay: 0.1s;
}

/* --- Anillo giratorio exterior (arco parcial, look técnico) --- */
#${OVERLAY_ID} .lsa-ring {
  transform-origin: 60px 60px;
  animation: lsa-ring-spin 1.1s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
}
@keyframes lsa-ring-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* --- Segundo anillo, contrarrotando más lento para dar profundidad --- */
#${OVERLAY_ID} .lsa-ring-outer {
  transform-origin: 60px 60px;
  animation: lsa-ring-spin-reverse 1.7s linear infinite;
  opacity: 0.45;
}
@keyframes lsa-ring-spin-reverse {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

/* --- Contorno del escudo: se dibuja con stroke-dashoffset --- */
#${OVERLAY_ID} .lsa-shield-outline {
  stroke-dasharray: 132;
  stroke-dashoffset: 132;
  animation: lsa-draw 0.5s cubic-bezier(0.3, 0.1, 0.3, 1) 0.05s forwards;
}
@keyframes lsa-draw {
  to { stroke-dashoffset: 0; }
}

/* --- Línea de escaneo horizontal: recorre el escudo repetidamente mientras
   dura la verificación (la duración total ahora es más larga que un solo
   barrido, así que se repite en vaivén para no dejar el escudo "quieto"). --- */
#${OVERLAY_ID} .lsa-scanline {
  opacity: 0;
  animation:
    lsa-scan-in 0.35s ease-out 0.15s forwards,
    lsa-scan-sweep 1.1s ease-in-out 0.15s infinite;
}
@keyframes lsa-scan-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes lsa-scan-sweep {
  0%, 100% { transform: translateY(-24px); }
  50% { transform: translateY(24px); }
}
#${OVERLAY_ID}.is-verified .lsa-scanline {
  animation: lsa-scan-out 0.25s ease-in forwards;
}
@keyframes lsa-scan-out {
  to { opacity: 0; }
}

/* --- Relleno del escudo: se ilumina una vez confirmado el acceso --- */
#${OVERLAY_ID} .lsa-shield-fill {
  opacity: 0;
  transition: opacity 0.3s ease;
}
#${OVERLAY_ID}.is-verified .lsa-shield-fill {
  opacity: 1;
}

/* --- Check interior: se dibuja al confirmarse el acceso --- */
#${OVERLAY_ID} .lsa-check {
  stroke-dasharray: 34;
  stroke-dashoffset: 34;
  transition: stroke-dashoffset 0.32s cubic-bezier(0.2, 0.6, 0.3, 1) 0.12s;
}
#${OVERLAY_ID}.is-verified .lsa-check {
  stroke-dashoffset: 0;
}

/* --- Pulso de confirmación alrededor del escudo --- */
#${OVERLAY_ID} .lsa-pulse {
  transform-origin: 60px 60px;
  opacity: 0;
  transform: scale(0.85);
}
#${OVERLAY_ID}.is-verified .lsa-pulse {
  animation: lsa-pulse-out 0.55s ease-out 0.18s forwards;
}
@keyframes lsa-pulse-out {
  0% { opacity: 0.55; transform: scale(0.85); }
  100% { opacity: 0; transform: scale(1.35); }
}

/* --- Los anillos se detienen suavemente al confirmarse el acceso --- */
#${OVERLAY_ID}.is-verified .lsa-ring,
#${OVERLAY_ID}.is-verified .lsa-ring-outer {
  animation-play-state: paused;
}

@keyframes lsa-msg-fade {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  #${OVERLAY_ID} .lsa-ring,
  #${OVERLAY_ID} .lsa-ring-outer,
  #${OVERLAY_ID} .lsa-shield-outline,
  #${OVERLAY_ID} .lsa-scanline,
  #${OVERLAY_ID} .lsa-shield-fill,
  #${OVERLAY_ID} .lsa-check,
  #${OVERLAY_ID} .lsa-pulse,
  #${OVERLAY_ID} .lsa-msg {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
    stroke-dashoffset: 0 !important;
  }
  #${OVERLAY_ID} .lsa-pulse { opacity: 0 !important; }
}
`;
  document.head.appendChild(style);
  stylesInjected = true;
}

function buildOverlayMarkup() {
  return `
    <div class="lsa-stage" role="status" aria-live="polite">
      <svg class="lsa-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <clipPath id="lsa-shield-clip">
            <path d="M60 22 L86 32 V58 C86 76 74 88 60 94 C46 88 34 76 34 58 V32 Z" />
          </clipPath>
        </defs>

        <!-- Anillo exterior, contrarrotando -->
        <g class="lsa-ring-outer">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#377cc0" stroke-width="1" stroke-dasharray="2 6" />
        </g>

        <!-- Anillo principal: arco que gira -->
        <g class="lsa-ring">
          <circle cx="60" cy="60" r="44" fill="none" stroke="#dbe6f2" stroke-width="2.5" />
          <path d="M60 16 A44 44 0 0 1 104 60" fill="none" stroke="#377cc0" stroke-width="2.5" stroke-linecap="round" />
        </g>

        <!-- Pulso de confirmación final -->
        <circle class="lsa-pulse" cx="60" cy="60" r="36" fill="none" stroke="#377cc0" stroke-width="1.5" />

        <!-- Relleno del escudo (se ilumina al confirmar) -->
        <path class="lsa-shield-fill" d="M60 22 L86 32 V58 C86 76 74 88 60 94 C46 88 34 76 34 58 V32 Z" fill="#eaf1fb" />

        <!-- Contorno del escudo (se dibuja) -->
        <path class="lsa-shield-outline" d="M60 22 L86 32 V58 C86 76 74 88 60 94 C46 88 34 76 34 58 V32 Z"
              fill="none" stroke="#2c3440" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />

        <!-- Línea de escaneo, recortada a la silueta del escudo -->
        <g clip-path="url(#lsa-shield-clip)">
          <rect class="lsa-scanline" x="30" y="52" width="60" height="3" fill="#377cc0" />
        </g>

        <!-- Check final -->
        <path class="lsa-check" d="M49 60 L57 68 L74 48" fill="none" stroke="#377cc0" stroke-width="4.5"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <p class="lsa-msg">Verificando acceso</p>
    </div>
  `;
}

/**
 * PASO 1 — síncrona e instantánea. Crea el overlay ya opaco (sin transición
 * de entrada) cubriendo toda la pantalla. Llamar ANTES de ocultar el modal
 * de login, para que no quede ni un fotograma sin cubrir entre ambos.
 * No hace nada si el usuario prefiere movimiento reducido (no hay overlay
 * que mostrar en ese caso).
 */
export function showLoginSuccessOverlay() {
  try {
    if (prefersReducedMotion()) return;
    ensureStylesInjected();
    let overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = OVERLAY_ID;
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = buildOverlayMarkup();
    overlay.classList.remove("is-leaving", "is-verified");
    // Sin transición de entrada: se marca visible en el mismo frame de pintado
    // para que sustituya al modal de login sin ningún hueco entre ambos.
    overlay.style.transition = "none";
    overlay.classList.add("is-visible");
    void overlay.offsetHeight; // fuerza el reflow antes de restaurar la transición
    overlay.style.transition = "";
    overlayShownAt = Date.now();
  } catch (_e) {
    /* Cosmético: un fallo aquí no debe impedir continuar el login. */
  }
}

/**
 * PASO 2 — espera lo que falte de la duración total de la animación y luego
 * retira el overlay con un fade-out corto. Resuelve la Promise cuando el
 * overlay ya quedó completamente removido del DOM. Nunca rechaza. Llamar
 * DESPUÉS de que el portal ya esté pintado detrás (p. ej. tras
 * `renderPortal()`), para que el fade-out revele el portal listo y no un
 * estado intermedio.
 */
export function waitAndDismissLoginSuccessOverlay() {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    try {
      const overlay = document.getElementById(OVERLAY_ID);
      if (prefersReducedMotion() || !overlay) {
        finish();
        return;
      }

      const safetyTimer = setTimeout(finish, FALLBACK_SAFETY_MS);
      const elapsed = overlayShownAt ? Date.now() - overlayShownAt : 0;
      const remaining = Math.max(0, ANIMATION_TOTAL_MS - elapsed);

      // Marca el escudo como verificado (check + pulso) un poco antes de que
      // termine la espera, para que el usuario vea la confirmación antes del
      // fade-out, no un corte abrupto a mitad del escaneo.
      const verifyLeadMs = Math.min(650, remaining);
      setTimeout(() => {
        overlay.classList.add("is-verified");
      }, Math.max(0, remaining - verifyLeadMs));

      setTimeout(() => {
        overlay.classList.add("is-leaving");
        overlay.classList.remove("is-visible");
        setTimeout(() => {
          overlay.innerHTML = "";
          overlay.classList.remove("is-leaving", "is-verified");
          clearTimeout(safetyTimer);
          finish();
        }, FADE_OUT_MS);
      }, remaining);
    } catch (_e) {
      /* Cosmético: nunca debe bloquear la entrada al portal. */
      finish();
    }
  });
}
