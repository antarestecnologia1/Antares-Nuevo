/**
 * Animación de éxito de login: una llave entra al contacto de un vehículo y la
 * puerta se abre, antes de mostrar el portal. Autocontenida (CSS inyectado en
 * <style>, sin archivo externo) para no depender del timing de carga del CSS
 * diferido de módulos — este overlay debe estar listo el instante en que el
 * login es exitoso, sin parpadeo sin estilos.
 *
 * Uso: await playLoginSuccessAnimation(); luego proceder a mostrar el portal.
 * Si el usuario tiene `prefers-reduced-motion: reduce`, se resuelve de inmediato
 * sin animar (accesibilidad).
 */

const OVERLAY_ID = "login-success-overlay";
const STYLE_ID = "login-success-overlay-style";
const ANIMATION_TOTAL_MS = 1900;
const FALLBACK_SAFETY_MS = ANIMATION_TOTAL_MS + 600;

let stylesInjected = false;

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
  transition: opacity 0.25s ease;
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
  width: min(320px, 78vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}
#${OVERLAY_ID} .lsa-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}
#${OVERLAY_ID} .lsa-msg {
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  color: #377cc0;
  letter-spacing: 0.01em;
  opacity: 0;
  animation: lsa-msg-fade 0.4s ease forwards;
  animation-delay: 0.15s;
}

/* --- Llave: llega desde afuera y gira dentro de la cerradura --- */
#${OVERLAY_ID} .lsa-key {
  transform-origin: 101px 118px;
  animation:
    lsa-key-approach 0.6s cubic-bezier(0.3, 0.9, 0.5, 1) 0.1s forwards,
    lsa-key-turn 0.3s ease-in-out 0.75s forwards;
  opacity: 0;
}
@keyframes lsa-key-approach {
  0% { opacity: 0; transform: translateX(-58px) rotate(0deg); }
  20% { opacity: 1; }
  100% { opacity: 1; transform: translateX(0) rotate(0deg); }
}
@keyframes lsa-key-turn {
  0% { transform: rotate(0deg); }
  55% { transform: rotate(60deg); }
  100% { transform: rotate(0deg); }
}

/* --- Destello de la cerradura al encender --- */
#${OVERLAY_ID} .lsa-spark {
  opacity: 0;
  transform-origin: 101px 118px;
  animation: lsa-spark-flash 0.55s ease-out 0.72s forwards;
}
@keyframes lsa-spark-flash {
  0% { opacity: 0; transform: scale(0.4); }
  35% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0; transform: scale(1.7); }
}

/* --- Puerta: se separa del cuerpo y gira levemente hacia afuera --- */
#${OVERLAY_ID} .lsa-door {
  transform-origin: 60px 115px;
  animation: lsa-door-open 0.7s cubic-bezier(0.25, 0.75, 0.4, 1) 1.15s forwards;
}
@keyframes lsa-door-open {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(-8px, 14px) rotate(-11deg); }
}

/* --- Carrocería: leve "respiro" para dar sensación de vida --- */
#${OVERLAY_ID} .lsa-body {
  animation: lsa-body-settle 1.9s ease-in-out 0s infinite;
}
@keyframes lsa-body-settle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1.5px); }
}

@keyframes lsa-msg-fade {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  #${OVERLAY_ID} .lsa-key,
  #${OVERLAY_ID} .lsa-spark,
  #${OVERLAY_ID} .lsa-door,
  #${OVERLAY_ID} .lsa-body,
  #${OVERLAY_ID} .lsa-msg {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;
  document.head.appendChild(style);
  stylesInjected = true;
}

function buildOverlayMarkup() {
  return `
    <div class="lsa-stage" role="status" aria-live="polite">
      <svg class="lsa-svg" viewBox="0 0 280 190" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g class="lsa-body">
          <ellipse cx="140" cy="163" rx="118" ry="8" fill="#e9edf2" />

          <!-- Carrocería: perfil de auto con techo curvo, capó y maletero -->
          <path d="M26 146
                   L26 118
                   Q26 106 38 101
                   L58 92
                   Q70 68 96 62
                   L172 62
                   Q198 68 210 92
                   L228 100
                   Q252 106 252 124
                   L252 146
                   Z"
                fill="#f5f7fa" stroke="#377cc0" stroke-width="2.5" stroke-linejoin="round" />

          <!-- Parabrisas + luneta (quedan por detrás de la puerta) -->
          <path d="M100 66 L92 96 L136 96 L136 66 Z" fill="#dfe9f5" stroke="#377cc0" stroke-width="1.75" stroke-linejoin="round" />
          <path d="M176 66 L186 96 L226 96 L214 70 Z" fill="#dfe9f5" stroke="#377cc0" stroke-width="1.75" stroke-linejoin="round" />

          <!-- Pilar central fijo (entre las dos ventanas, no forma parte de la puerta) -->
          <rect x="160" y="63" width="10" height="34" fill="#f5f7fa" stroke="#377cc0" stroke-width="2" />

          <!-- Ruedas -->
          <circle cx="82" cy="146" r="16" fill="#2c3440" />
          <circle cx="82" cy="146" r="7" fill="#cfd5dc" />
          <circle cx="206" cy="146" r="16" fill="#2c3440" />
          <circle cx="206" cy="146" r="7" fill="#cfd5dc" />

          <!-- Zócalo inferior -->
          <rect x="40" y="130" width="200" height="9" rx="2" fill="#eef1f5" stroke="#377cc0" stroke-width="1.25" />
        </g>

        <!-- Puerta del conductor: gira hacia afuera desde la bisagra delantera (x=60) -->
        <g class="lsa-door">
          <path d="M60 100 L154 100 L154 130 L60 130 Z" fill="#ffffff" stroke="#377cc0" stroke-width="2.25" stroke-linejoin="round" />
          <rect x="70" y="107" width="56" height="16" rx="2.5" fill="#eaf1fb" stroke="#b9c6d6" stroke-width="1.25" />
          <!-- Manija / cerradura -->
          <rect x="97" y="118" width="14" height="4.5" rx="2.25" fill="#2c3440" />
          <circle cx="101" cy="118" r="2.4" fill="#377cc0" />
        </g>

        <!-- Chispa de encendido sobre la cerradura -->
        <g class="lsa-spark">
          <circle cx="101" cy="118" r="14" fill="#377cc0" opacity="0.32" />
          <circle cx="101" cy="118" r="7" fill="#ffd166" />
        </g>

        <!-- Llave: llega desde la izquierda hacia la cerradura de la puerta -->
        <g class="lsa-key">
          <circle cx="101" cy="118" r="6" fill="none" stroke="#2c3440" stroke-width="3" />
          <rect x="53" y="115.5" width="42" height="5" rx="2" fill="#2c3440" />
          <rect x="60" y="120.5" width="5" height="6" fill="#2c3440" />
          <rect x="70" y="120.5" width="5" height="8" fill="#2c3440" />
        </g>
      </svg>
      <p class="lsa-msg">Iniciando sesión…</p>
    </div>
  `;
}

/**
 * Reproduce la animación de éxito de login y resuelve la Promise cuando termina
 * (o de inmediato si el usuario prefiere movimiento reducido). Nunca rechaza:
 * cualquier error de DOM se captura y se resuelve igual, para no bloquear jamás
 * la entrada al portal por un fallo puramente cosmético.
 */
export function playLoginSuccessAnimation() {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    try {
      const reduceMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        finish();
        return;
      }
      ensureStylesInjected();
      let overlay = document.getElementById(OVERLAY_ID);
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = OVERLAY_ID;
        document.body.appendChild(overlay);
      }
      overlay.innerHTML = buildOverlayMarkup();
      overlay.classList.remove("is-leaving");
      requestAnimationFrame(() => {
        overlay.classList.add("is-visible");
      });

      const safetyTimer = setTimeout(finish, FALLBACK_SAFETY_MS);

      setTimeout(() => {
        overlay.classList.add("is-leaving");
        setTimeout(() => {
          overlay.classList.remove("is-visible");
          overlay.innerHTML = "";
          clearTimeout(safetyTimer);
          finish();
        }, 260);
      }, ANIMATION_TOTAL_MS);
    } catch (_e) {
      /* Cosmético: cualquier fallo aquí nunca debe bloquear el acceso al portal. */
      finish();
    }
  });
}
