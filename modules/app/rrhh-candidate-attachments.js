/**
 * Adjuntos de candidatos (CV inline) para formularios de contratación.
 * Vive en módulo aparte para no acoplar `gestion-humana.js` (nómina) con contratación.
 * Carga con `defer` después de `app.js`, antes de `contratacion.js`.
 */
const HR_CANDIDATE_CV_INLINE_MAX_BYTES = 1_500_000;

/** Convierte los archivos del formulario RRHH en objetos `cv_blob` para sync con API. */
async function readCandidateHrAttachmentsFromInput(fileInput) {
  if (!fileInput || !fileInput.files?.length) return [];
  const max = HR_CANDIDATE_CV_INLINE_MAX_BYTES;
  const out = [];
  for (const f of [...fileInput.files]) {
    if (f.size > max) {
      notify(
        `"${String(f.name)}" supera ${Math.round(max / 1024 / 1024)} MB. Adjunte un archivo más liviano o reduzca el tamaño.`,
        "error"
      );
      return null;
    }
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = () => reject(new Error("file"));
        fr.readAsDataURL(f);
      });
      const m = typeof dataUrl === "string" ? dataUrl.match(/^data:([^;]+);base64,(.+)$/) : null;
      if (!m) continue;
      out.push({
        kind: "cv_blob",
        name: String(f.name || "archivo").trim().slice(0, 240),
        mime: m[1],
        data: m[2]
      });
    } catch (_e) {
      notify("No se pudo leer un archivo adjunto. Reintente o use otro formato.", "error");
      return null;
    }
  }
  return out;
}
