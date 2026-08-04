/**
 * Adjuntos de candidatos (CV) para formularios de contratación.
 * Preferencia: POST /uploads/candidate-cv → R2 (`cv_file`);
 * respaldo: base64 inline (`cv_blob`) si la API no está disponible.
 * Carga con `defer` después de `app.js`, antes de `contratacion.js`.
 */
const HR_CANDIDATE_CV_INLINE_MAX_BYTES = 1_500_000;
const HR_CANDIDATE_CV_UPLOAD_MAX_BYTES = 6 * 1024 * 1024;

async function uploadCandidateCvViaApi(file) {
  const api = window.AntaresApi;
  if (!api?.postFormData || !api?.isConfigured?.()) return null;
  const fd = new FormData();
  fd.append("file", file, String(file.name || "hoja-de-vida"));
  const res = await api.postFormData("/uploads/candidate-cv", fd);
  if (!res || typeof res !== "object") return null;
  const kind = String(res.kind || "").trim();
  const name = String(res.name || file.name || "hoja-de-vida").trim().slice(0, 240);
  const mime = String(res.mime || file.type || "application/octet-stream").split(";")[0].trim();
  if (kind === "cv_file" && String(res.storageKey || "").trim()) {
    const out = { kind: "cv_file", name, mime, storageKey: String(res.storageKey).trim() };
    if (res.url && /^https?:\/\//i.test(String(res.url))) out.url = String(res.url);
    return out;
  }
  if (kind === "cv_blob" && res.data && mime) {
    return { kind: "cv_blob", name, mime, data: String(res.data) };
  }
  return null;
}

async function readFileAsCvBlob(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(new Error("file"));
    fr.readAsDataURL(file);
  });
  const m = typeof dataUrl === "string" ? dataUrl.match(/^data:([^;]+);base64,(.+)$/) : null;
  if (!m) return null;
  return {
    kind: "cv_blob",
    name: String(file.name || "archivo").trim().slice(0, 240),
    mime: m[1],
    data: m[2]
  };
}

/** Convierte los archivos del formulario RRHH en objetos `cv_file` / `cv_blob` para sync con API. */
async function readCandidateHrAttachmentsFromInput(fileInput) {
  if (!fileInput || !fileInput.files?.length) return [];
  const out = [];
  const apiReady = Boolean(window.AntaresApi?.isConfigured?.());
  const max = apiReady ? HR_CANDIDATE_CV_UPLOAD_MAX_BYTES : HR_CANDIDATE_CV_INLINE_MAX_BYTES;

  for (const f of [...fileInput.files]) {
    if (f.size > max) {
      notify(
        `"${String(f.name)}" supera ${Math.round(max / 1024 / 1024)} MB. Adjunte un archivo más liviano.`,
        "error"
      );
      return null;
    }
    try {
      if (apiReady) {
        try {
          const uploaded = await uploadCandidateCvViaApi(f);
          if (uploaded) {
            out.push(uploaded);
            continue;
          }
        } catch (err) {
          const msg = String(err?.message || "").trim();
          if (msg && !/failed to fetch/i.test(msg)) {
            notify(msg || "No se pudo subir la hoja de vida.", "error");
            return null;
          }
          globalThis.devWarn?.("candidate-cv-upload-fallback-inline", err);
        }
      }
      if (f.size > HR_CANDIDATE_CV_INLINE_MAX_BYTES) {
        notify(
          `"${String(f.name)}" supera 1,5 MB y no fue posible subirlo al almacenamiento. Reduzca el archivo o verifique la conexión.`,
          "error"
        );
        return null;
      }
      const blob = await readFileAsCvBlob(f);
      if (!blob) continue;
      out.push(blob);
    } catch (_e) {
      notify("No se pudo leer un archivo adjunto. Reintente o use otro formato.", "error");
      return null;
    }
  }
  return out;
}

/** True si el adjunto tiene contenido descargable (R2 key, URL o base64). */
function candidateAttachmentHasDownloadableCv(item) {
  if (item == null || typeof item !== "object") return false;
  const k = String(item.kind || "");
  if (k === "cv_blob" && item.data && item.mime) return true;
  if (k === "cv_file" && (String(item.storageKey || "").trim() || /^https?:\/\//i.test(String(item.url || "")))) {
    return true;
  }
  return false;
}
