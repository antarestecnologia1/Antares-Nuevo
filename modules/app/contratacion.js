/**
 * Contratación — adjuntos de candidato y listeners.
 */

/** Normaliza cualquier valor de fecha del formulario a YYYY-MM-DD. */
function vacancyNormalizeYmd(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (typeof normalizePortalDateYmd === "function") {
    const n = String(normalizePortalDateYmd(s) || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(n)) return n;
  }
  const V = window.AntaresValidation;
  if (typeof V?.parseDmyToIsoDate === "function") {
    const dmy = String(V.parseDmyToIsoDate(s) || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(dmy)) return dmy;
  }
  /* MM/DD/AAAA (algunos navegadores) → intentar si el día > 12 no aplica. */
  const slash = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (slash) {
    const a = Number(slash[1]);
    const b = Number(slash[2]);
    const y = Number(slash[3]);
    /* Preferir DD/MM (Colombia): si a>12 es claramente día. */
    let day = a;
    let month = b;
    if (a <= 12 && b > 12) {
      month = a;
      day = b;
    }
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const ymd = `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const probe = new Date(y, month - 1, day);
      if (probe.getFullYear() === y && probe.getMonth() === month - 1 && probe.getDate() === day) return ymd;
    }
  }
  return "";
}

function vacancyYmdValid(s) {
  return Boolean(vacancyNormalizeYmd(s));
}

function vacancyYmdToMidnight(s) {
  const ymd = vacancyNormalizeYmd(s);
  const parts = ymd.split("-");
  if (parts.length !== 3) return NaN;
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
}

/** Lee fecha de campo portal (hidden ISO o visible DMY) ya normalizada. */
function vacancyFormDateYmd(formEl, fieldName, fallbackRaw) {
  if (!formEl || !fieldName) return vacancyNormalizeYmd(fallbackRaw);
  const hidden = formEl.querySelector(
    `input[type="hidden"][name="${fieldName}"][data-portal-date-iso="1"]`
  );
  const fromHidden = vacancyNormalizeYmd(hidden?.value);
  if (fromHidden) return fromHidden;
  const V = window.AntaresValidation;
  if (typeof V?.setPortalFormDateByName === "function" && typeof V?.findPortalDateVisibleInForm === "function") {
    /* noop — solo lectura */
  }
  if (typeof V?.portalDateInputValueIso === "function") {
    const vis =
      formEl.querySelector(`input.portal-date-dmy[data-portal-date-uid]`) &&
      [...formEl.querySelectorAll("input.portal-date-dmy")].find((el) => {
        const h = formEl.querySelector(
          `input[type="hidden"][data-portal-date-iso="1"][data-portal-date-for="${el.dataset.portalDateUid || ""}"]`
        );
        return h && h.name === fieldName;
      });
    if (vis) {
      const iso = vacancyNormalizeYmd(V.portalDateInputValueIso(vis));
      if (iso) return iso;
    }
  }
  const named = formEl.querySelector(`[name="${fieldName}"]`);
  const fromNamed = vacancyNormalizeYmd(named?.value);
  if (fromNamed) return fromNamed;
  return vacancyNormalizeYmd(fallbackRaw);
}

/** Hoy civil Colombia (o local) a medianoche para comparar fechas de vacante. */
function vacancyTodayMidnight() {
  try {
    if (typeof getColombiaDateParts === "function") {
      const p = getColombiaDateParts(new Date());
      if (p?.year && p?.month && p?.day) {
        return new Date(Number(p.year), Number(p.month) - 1, Number(p.day)).getTime();
      }
    }
  } catch (_e) {}
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
}

function vacancyDeadlineIsTodayOrFuture(ymd) {
  const normalized = vacancyNormalizeYmd(ymd);
  if (!normalized) return false;
  const cand = vacancyYmdToMidnight(normalized);
  if (!Number.isFinite(cand)) return false;
  return cand >= vacancyTodayMidnight();
}

/** Reduce flyers grandes antes de subir (evita timeouts / rechazo del servidor). */
async function compressVacancyImageFile(file, maxSide = 1600, quality = 0.86) {
  if (!file || !String(file.type || "").startsWith("image/")) return file;
  if (file.size > 0 && file.size <= 900 * 1024 && !/image\/gif/i.test(file.type)) return file;
  if (typeof createImageBitmap !== "function" && typeof FileReader === "undefined") return file;
  try {
    let bitmap = null;
    if (typeof createImageBitmap === "function") {
      bitmap = await createImageBitmap(file);
    } else {
      const dataUrl = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = () => reject(new Error("No se pudo leer la imagen"));
        r.readAsDataURL(file);
      });
      bitmap = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("No se pudo decodificar la imagen"));
        img.src = dataUrl;
      });
    }
    const w = Number(bitmap.width || 0);
    const h = Number(bitmap.height || 0);
    if (!w || !h) return file;
    const scale = Math.min(1, maxSide / Math.max(w, h));
    const tw = Math.max(1, Math.round(w * scale));
    const th = Math.max(1, Math.round(h * scale));
    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, tw, th);
    if (typeof bitmap.close === "function") {
      try {
        bitmap.close();
      } catch (_e) {}
    }
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) return file;
    const base = String(file.name || "vacante").replace(/\.[^.]+$/, "") || "vacante";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } catch (_e) {
    return file;
  }
}

async function resolveVacancyImageUrl(file) {
  if (!file) return "";
  const api = window.AntaresApi;
  const canUseBackend =
    api &&
    typeof api.postJson === "function" &&
    typeof api.getBase === "function" &&
    api.getBase() &&
    typeof api.isConfigured === "function" &&
    api.isConfigured();

  const prepared = await compressVacancyImageFile(file);
  const rawMime = String(prepared.type || file.type || "image/jpeg").split(";")[0].trim().toLowerCase();
  const contentType =
    !rawMime || rawMime === "image/jpg" || rawMime === "image/pjpeg" ? "image/jpeg" : rawMime;

  if (canUseBackend) {
    /* 1) Presign + PUT directo a Cloudflare R2 (prefijo vacantes/). */
    try {
      const presign = await api.postJson("/uploads/vacancy-image/presign", {
        fileName: String(prepared.name || file.name || "vacante.jpg"),
        contentType
      });
      const uploadUrl = String(presign?.uploadUrl || "").trim();
      const publicFromPresign = String(presign?.publicUrl || "").trim();
      if (uploadUrl && /^https?:\/\//i.test(publicFromPresign)) {
        const resp = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": contentType },
          body: prepared
        });
        if (resp.ok) return publicFromPresign;
        globalThis.devWarn?.("vacancy-image-r2-put-failed", resp.status);
      }
    } catch (err) {
      globalThis.devWarn?.("vacancy-image-presign-failed", err);
    }

    /* 2) Multipart vía API → R2 (evita CORS). */
    try {
      if (typeof api.postFormData === "function") {
        const fd = new FormData();
        fd.append("file", prepared, prepared.name || "vacante.jpg");
        const viaVacancy = await api.postFormData("/uploads/vacancy-image", fd);
        const u = String(viaVacancy?.publicUrl || "").trim();
        if (/^https?:\/\//i.test(u)) return u;
      }
    } catch (err) {
      globalThis.devWarn?.("vacancy-image-api-failed", err);
    }

    /* 3) Fallback genérico /uploads/image. */
    try {
      if (typeof api.postFormData === "function") {
        const fd = new FormData();
        fd.append("file", prepared, prepared.name || "vacante.jpg");
        const viaImage = await api.postFormData("/uploads/image", fd);
        const u = String(viaImage?.publicUrl || "").trim();
        if (/^https?:\/\//i.test(u)) return u;
      }
    } catch (err) {
      globalThis.devWarn?.("vacancy-image-generic-failed", err);
    }

    throw new Error(
      "No se pudo subir la imagen a Cloudflare R2. Revise CF_R2_* y CF_R2_PUBLIC_BASE en el servidor, o intente con un archivo más liviano."
    );
  }

  /* Sin API: solo preview local (no apto para Carreras en producción). */
  const resolveUrl =
    typeof window.resolveEmployeeAvatarUrl === "function"
      ? window.resolveEmployeeAvatarUrl
      : typeof resolveEmployeeAvatarUrl === "function"
        ? resolveEmployeeAvatarUrl
        : null;
  if (!resolveUrl) return "";
  const uploaded = String((await resolveUrl(prepared, "")) || "").trim();
  if (uploaded.startsWith("data:image/") && uploaded.length < 350000) return uploaded;
  return /^https?:\/\//i.test(uploaded) ? uploaded : "";
}

function setVacancyFormPublishingState(formEl, active, progressPct) {
  if (!formEl) return;
  const pct = Math.max(0, Math.min(100, Math.round(Number(progressPct) || 0)));
  formEl.classList.toggle("is-vacancy-publishing", Boolean(active));
  formEl.querySelectorAll("input, select, textarea, button").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    if (el.matches("[data-action='toggle-create-panel'], [data-action='cancel-create-panel']")) return;
    if (active) {
      if (!el.dataset.vacancyPrevDisabled) {
        el.dataset.vacancyPrevDisabled = el.disabled ? "1" : "0";
      }
      if (el.type !== "submit") el.disabled = true;
    } else if (el.dataset.vacancyPrevDisabled != null) {
      el.disabled = el.dataset.vacancyPrevDisabled === "1";
      delete el.dataset.vacancyPrevDisabled;
    }
  });
  const dropzone = formEl.querySelector("[data-vacancy-image-dropzone]");
  if (dropzone) {
    dropzone.classList.toggle("is-disabled", Boolean(active));
    dropzone.setAttribute("aria-disabled", active ? "true" : "false");
  }
  const progressEl = formEl.querySelector("[data-vacancy-publish-progress]");
  const fillEl = formEl.querySelector("[data-vacancy-publish-fill]");
  const barEl = formEl.querySelector("[data-vacancy-publish-bar]");
  if (progressEl) {
    progressEl.hidden = !active;
    progressEl.setAttribute("aria-busy", active ? "true" : "false");
  }
  if (fillEl) fillEl.style.width = active ? `${pct}%` : "0%";
  if (barEl) barEl.setAttribute("aria-valuenow", active ? String(pct) : "0");
}

function parseCandidateAttachmentsForView(raw, opts = {}) {
  const candidateId = String(opts.candidateId || "").trim();
  let experienceFromJson = "";
  /** @type {string[]} */
  const parts = [];

  const safeHttps = (u) => {
    const s = String(u || "").trim();
    return /^https?:\/\/.+/i.test(s) ? s : "";
  };
  /** MIME permitido conservador para armar data: URL desde JSON almacenado. */
  const safeMimeForDataUrl = (m) => {
    const base = String(m || "application/octet-stream")
      .split(";")[0]
      ?.trim()
      .toLowerCase();
    if (/^[\w/+.-]+$/.test(base) && base.length < 96) return base;
    return "application/octet-stream";
  };

  const walk = (arr) => {
    if (!Array.isArray(arr)) return;
    for (const item of arr) {
      if (item == null) continue;
      if (typeof item === "string") {
        const n = String(item).trim();
        if (n) parts.push(`<span class="perm-tag" title="${escapeAttr(n)}">${IC.file}<span>${escapeHtml(n)}</span></span>`);
        continue;
      }
      if (typeof item !== "object") continue;
      const k = String(item.kind || "");
      if (k === "experience_notes" && item.text) {
        experienceFromJson = String(item.text || "").trim();
        continue;
      }
      if (k === "cv_filename" && item.name) {
        const n = escapeHtml(String(item.name).trim());
        parts.push(`<span class="perm-tag">${IC.file}<span>${n}</span></span>`);
        continue;
      }
      if (k === "cv_file") {
        const displayName = escapeHtml(String(item.name || "Hoja de vida").trim());
        const url = safeHttps(item.url);
        if (url) {
          parts.push(
            `<a class="btn btn-sm btn-outline" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" download>${IC.download} Ver / descargar</a> <span class="muted">${displayName}</span>`
          );
        } else if (item.storageKey && candidateId) {
          parts.push(
            `<button type="button" class="btn btn-sm btn-outline" data-action="download-candidate-cv" data-id="${escapeAttr(candidateId)}">${IC.download} Ver / descargar</button> <span class="muted">${displayName}</span>`
          );
        } else if (item.storageKey) {
          parts.push(
            `<span class="perm-tag">${IC.file}<span>${displayName}</span></span> <span class="muted" title="${escapeAttr(String(item.storageKey))}">(CV en almacenamiento; use Descargar CV)</span>`
          );
        } else {
          parts.push(`<span class="perm-tag">${IC.file}<span>${displayName}</span></span>`);
        }
        continue;
      }
      if (k === "cv_blob" && item.data && item.mime) {
        const dn = escapeAttr(String(item.name || "hoja-de-vida").slice(0, 120));
        const mime = safeMimeForDataUrl(item.mime);
        const href = `data:${mime};base64,${String(item.data)}`;
        parts.push(
          `<a class="btn btn-sm btn-outline" href="${escapeAttr(href)}" download="${dn}">${IC.download} Descargar</a> <span class="muted">${escapeHtml(String(item.name || "Adjunto"))}</span>`
        );
        continue;
      }
    }
  };

  if (Array.isArray(raw)) walk(raw);
  else if (raw != null && typeof raw === "object" && typeof raw !== "bigint") walk([raw]);
  else if (typeof raw === "string" && raw.trim()) {
    try {
      walk(JSON.parse(raw));
    } catch (_e) {
      const n = raw.trim();
      parts.push(`<span class="perm-tag">${escapeHtml(n)}</span>`);
    }
  }

  return {
    attachmentsHtml: parts.filter(Boolean).join(" "),
    experienceFromJson
  };
}

function bindHiringPortalControls() {
  if (String(state.currentView || "") !== "hiring" || !nodes.viewRoot) return;

  nodes.viewRoot.querySelectorAll("[data-action='hr-workspace-tab'][data-module='hiring']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = String(btn.dataset.tab || "");
      if (!tab) return;
      const ws = normalizeHrWorkspace("hiring", tab);
      if (!HR_VALID_HIRING_WS.has(ws)) return;
      state.hiringUi = { ...(state.hiringUi || {}), workspace: ws, ...(ws === "operate" ? { dataListSearch: "" } : {}) };
      persistHrWorkspace("hiring", ws);
      if (
        switchHrWorkspacePanels({
          root: nodes.viewRoot,
          moduleId: "hiring",
          workspace: ws,
          panelAttr: "data-hiring-panel"
        })
      ) {
        return;
      }
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-operate-rail-toggle']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.closest(".hiring-operate");
      if (!panel) return;
      const collapsed = panel.classList.toggle("is-rail-collapsed");
      btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      btn.setAttribute("title", collapsed ? "Expandir opciones de trámite" : "Contraer opciones de trámite");
      setOperateRailCollapsed("hiring", collapsed);
    });
  });

  const vacancyForm = document.getElementById("form-vacancy");
  if (vacancyForm) {
    attachDepartmentCitySelects(vacancyForm, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']"
    });
    const positionSelect = vacancyForm.querySelector("select[name='positionId']");
    const titleInput = vacancyForm.querySelector("input[name='title']");
    const salaryOfferInput = vacancyForm.querySelector("#vacancy-salary-offer");
    const vacancySalaryHint = vacancyForm.querySelector("#vacancy-salary-hint");
    const vacancyImageDropzone = vacancyForm.querySelector("[data-vacancy-image-dropzone]");
    const vacancyImageInput = vacancyForm.querySelector("input[name='imageFile']");
    const vacancyImagePreview = vacancyForm.querySelector("[data-vacancy-image-preview]");
    const vacancyImageEmpty = vacancyForm.querySelector("[data-vacancy-image-empty]");
    if (vacancyImageInput && vacancyImageDropzone && vacancyForm.dataset.vacancyImagePreviewWired !== "1") {
      vacancyForm.dataset.vacancyImagePreviewWired = "1";
      let previewBlobUrl = "";
      const setVacancyImagePreview = (url) => {
        const has = Boolean(url);
        if (vacancyImagePreview) {
          if (has) vacancyImagePreview.src = url;
          else vacancyImagePreview.removeAttribute("src");
          vacancyImagePreview.hidden = !has;
        }
        if (vacancyImageEmpty) vacancyImageEmpty.hidden = has;
        vacancyImageDropzone.classList.toggle("has-image", has);
      };
      vacancyImageInput.addEventListener("change", () => {
        const f = vacancyImageInput.files?.[0];
        if (previewBlobUrl && previewBlobUrl.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(previewBlobUrl);
          } catch (_e) {}
          previewBlobUrl = "";
        }
        if (!f || !String(f.type || "").startsWith("image/")) {
          setVacancyImagePreview("");
          return;
        }
        try {
          previewBlobUrl = URL.createObjectURL(f);
        } catch (_e) {
          previewBlobUrl = "";
        }
        setVacancyImagePreview(previewBlobUrl);
      });
    }
    if (positionSelect) {
      const syncFromPosition = () => {
        const position = getPositionById(String(positionSelect.value || ""));
        if (!position) return;
        if (titleInput && !titleInput.value.trim()) titleInput.value = `Vacante ${position.name}`;
        if (salaryOfferInput) {
          salaryOfferInput.min = String(Math.max(CO_HR_RULES.minMonthlySalary, parseNum(position.baseSalary)));
          salaryOfferInput.value = String(parseNum(position.baseSalary));
        }
        if (vacancySalaryHint) {
          const catalog = parseNum(position.baseSalary).toLocaleString("es-CO");
          vacancySalaryHint.textContent = `Cargo «${position.name}»: salario catálogo $${catalog}. Mínimo legal SMMLV $${CO_HR_RULES.minMonthlySalary.toLocaleString("es-CO")}.`;
        }
      };
      positionSelect.addEventListener("change", syncFromPosition);
      syncFromPosition();
    }

    wireFormSubmitGuard(
      vacancyForm,
      async () => {
        /* Leer el formulario ANTES de deshabilitar campos: FormData omite inputs disabled. */
        const data = readFormEntriesNormalized(vacancyForm);
        const positionIdRaw =
          String(data.positionId || "").trim() ||
          String(vacancyForm.querySelector("select[name='positionId']")?.value || "").trim();
        const deadline = vacancyFormDateYmd(vacancyForm, "deadline", data.deadline);
        const pFrom = vacancyFormDateYmd(vacancyForm, "publishedFrom", data.publishedFrom);
        const publishedFromRaw = String(data.publishedFrom || "").trim();
        const imageFile = vacancyForm.querySelector("input[name='imageFile']")?.files?.[0] || null;

        setVacancyFormPublishingState(vacancyForm, true, 12);
        try {
          if (!vacancyDeadlineIsTodayOrFuture(deadline)) {
            failPortalField(vacancyForm, "deadline", userMessage("vacancyDeadlineFuture"));
            notify(userMessage("vacancyDeadlineFuture"), "error");
            return;
          }
          if (publishedFromRaw && !pFrom) {
            failPortalField(vacancyForm, "publishedFrom", "Indique una fecha válida en “Visible en web desde”, o déjela vacía.");
            notify("Indique una fecha válida en “Visible en web desde”, o déjela vacía.", "error");
            return;
          }
          if (pFrom && vacancyYmdToMidnight(pFrom) > vacancyYmdToMidnight(deadline)) {
            failPortalField(vacancyForm, "publishedFrom", "“Visible desde” no puede ser posterior a la fecha límite de postulaciones.");
            notify("“Visible desde” no puede ser posterior a la fecha límite de postulaciones.", "error");
            return;
          }
          const position = getPositionById(positionIdRaw);
          if (!position || position.active === false) {
            failPortalField(vacancyForm, "positionId", userMessage("vacancySelectPosition"));
            notify(userMessage("vacancySelectPosition"), "error");
            return;
          }
          const salaryValidation = validateVacancySalaryOffer(data.salaryOffer, position);
          if (!salaryValidation.ok) {
            failPortalField(vacancyForm, "salaryOffer", salaryValidation.message);
            notify(String(salaryValidation.message || "Revise el salario ofrecido."), "error");
            return;
          }
          const dropzone = vacancyForm.querySelector("[data-vacancy-image-dropzone]");
          dropzone?.classList.remove("is-error");
          let imageUrl = "";
          if (imageFile) {
            if (!String(imageFile.type || "").startsWith("image/")) {
              dropzone?.classList.add("is-error");
              notify("Seleccione una imagen válida (JPG, PNG, WebP o GIF).", "error");
              return;
            }
            setVacancyFormPublishingState(vacancyForm, true, 42);
            try {
              imageUrl = await resolveVacancyImageUrl(imageFile);
            } catch (imgErr) {
              dropzone?.classList.add("is-error");
              notify(String(imgErr?.message || "No se pudo subir la imagen a Cloudflare R2."), "error");
              return;
            }
            if (!imageUrl) {
              dropzone?.classList.add("is-error");
              notify(
                "No se obtuvo una URL pública de la imagen en Cloudflare. Revise CF_R2_PUBLIC_BASE e intente de nuevo.",
                "error"
              );
              return;
            }
          }
          setVacancyFormPublishingState(vacancyForm, true, 78);
          const all = read(KEYS.vacancies, []);
          const createdVacancy = stampCreatedRecord({
            id: newUuidV4(),
            positionId: position.id,
            title: normalizeLatinUpperForDb(data.title || `Vacante ${position.name}`),
            department: normalizeLatinForDb(data.department || ""),
            city: normalizeLatinForDb(data.city || ""),
            modality: normalizeLatinUpperForDb(data.modality || ""),
            workday: normalizeLatinUpperForDb(data.workday || ""),
            deadline,
            publishedFrom: pFrom || "",
            openings: Math.max(1, parseNum(data.openings || 1)),
            salaryOffer: salaryValidation.salaryOffer,
            positionName: position.name,
            workerRole: position.workerRole || "empleado",
            contractTypeDefault: normalizeLatinUpperForDb(
              data.contractTypeDefault || position.contractTypeDefault || "Termino indefinido"
            ),
            requirements: normalizeLatinUpperForDb(data.requirements || ""),
            imageUrl,
            status: "Publicada"
          });
          all.unshift(createdVacancy);
          try {
            const savePromise = writeAwaitServerCreate(KEYS.vacancies, all, createdVacancy);
            const timeoutPromise = new Promise((_, reject) => {
              window.setTimeout(() => {
                reject(
                  new Error(
                    "El servidor tardó demasiado en confirmar la vacante. Verifique la conexión o reinicie la API e intente de nuevo."
                  )
                );
              }, 45000);
            });
            await Promise.race([savePromise, timeoutPromise]);
          } catch (err) {
            /* Si el timeout ganó la carrera, la vacante puede haber quedado solo en memoria local. */
            const stillLocal = read(KEYS.vacancies, []).some((v) => String(v?.id) === String(createdVacancy.id));
            if (stillLocal && /tardó demasiado/i.test(String(err?.message || ""))) {
              notify(
                "La vacante quedó guardada en este navegador, pero el servidor no confirmó a tiempo. Si no aparece en otros equipos, reinicie la API y vuelva a editar/guardar.",
                "warning"
              );
            } else {
              notify(String(err?.message || "No fue posible guardar la vacante en el servidor."), "error");
              return;
            }
          }
          setVacancyFormPublishingState(vacancyForm, true, 100);
          if (createdVacancy) {
            appendPortalEntityAuditLog(
              "create",
              "hiring",
              "Contratación",
              createdVacancy,
              `${String(createdVacancy.city || "Sin ciudad")} · ${String(createdVacancy.status || "Publicada")}`,
              { entityLabel: String(createdVacancy.title || createdVacancy.positionName || "Vacante").trim() }
            );
          }
          state.hiringUi = state.hiringUi || {
            candidateFilter: "active",
            vacancyFilter: "open",
            candidateSort: "recent",
            workspace: "operate"
          };
          state.hiringUi.vacancyFilter = "open";
          state.hiringUi.workspace = "data";
          persistHrWorkspace("hiring", "data");
          collapseCreatePanel("create-vacancy");
          notify(userMessage("vacancyPublishedOk"), "success");
          renderPortalView();
        } catch (err) {
          notify(String(err?.message || err || "No se pudo publicar la vacante."), "error");
          globalThis.devWarn?.("vacancy-publish-failed", err);
        } finally {
          setVacancyFormPublishingState(vacancyForm, false);
        }
      },
      {
        prepareForm: (form) => {
          const fn = window.prepareCreationFormForSubmit;
          const ok = typeof fn !== "function" ? true : fn(form) !== false;
          if (!ok) {
            notify("Revise los campos marcados en rojo antes de publicar la vacante.", "error");
          }
          return ok;
        }
      }
    );
  }

  const positionForm = document.getElementById("form-position");
  if (positionForm) {
    bindPositionCompensationFields(positionForm, {
      basisSelector: "#position-salary-basis",
      salarySelector: "#position-base-salary",
      auxSelector: "#position-transport-allowance",
      hintSelector: "#position-legal-comp-hint"
    });
    /* Si el nombre del cargo es de conductor, preseleccionar el rol «Conductor» para que
       el alta de empleado habilite licencia/exámenes y sincronice con el módulo Conductores. */
    const positionNameInput = positionForm.querySelector("input[name='name']");
    const positionRoleSelect = positionForm.querySelector("select[name='workerRole']");
    if (positionNameInput && positionRoleSelect && positionForm.dataset.roleAutoWired !== "1") {
      positionForm.dataset.roleAutoWired = "1";
      positionNameInput.addEventListener("input", () => {
        if (/conductor/i.test(String(positionNameInput.value || ""))) {
          positionRoleSelect.value = "conductor";
        }
      });
    }
    wireFormSubmitGuard(positionForm, async (event) => {
      const data = readFormEntriesNormalized(positionForm);
      const minSalary = CO_HR_RULES.minMonthlySalary;
      const baseSalary =
        String(data.salaryBasis || "smmlv") === "smmlv" ? minSalary : parseNum(data.baseSalary);
      const comp = validateColombiaPositionCompensation({
        baseSalary,
        integralSalary: String(data.integralSalary || "false") === "true",
        transportAllowance: data.transportAllowance
      });
      if (!comp.ok) {
        failPortalField(positionForm, "baseSalary", comp.message);
        return;
      }
      const all = read(KEYS.positions, []);
      const createdPosition = stampCreatedRecord({
        id: newUuidV4(),
        name: normalizeLatinUpperForDb(String(data.name || "").trim()),
        workerRole: String(data.workerRole || "empleado"),
        baseSalary: comp.baseSalary,
        transportAllowance: comp.transportAllowance,
        contractTypeDefault: normalizeLatinUpperForDb(data.contractTypeDefault || "Termino indefinido"),
        workSchedule: normalizeLatinUpperForDb(data.workSchedule),
        arlRiskLevel: normalizeLatinUpperForDb(data.arlRiskLevel),
        integralSalary: String(data.integralSalary || "false") === "true",
        legalBasis: normalizeLatinUpperForDb(data.legalBasis || "CST art. 45-46 y normatividad laboral vigente"),
        active: true
      });
      all.unshift(createdPosition);
      // optimistic:false → esperamos confirmación del servidor antes de cerrar el panel.
      // Así el cargo queda realmente en la BD (tabla cargos) antes de que cualquier alta de
      // empleado lo referencie por id_cargo, evitando que el colaborador no se guarde por una
      // carrera entre el sync de cargos y el de empleados.
      const ok = await persistPositionsCatalog(all, { optimistic: false, editedRow: createdPosition });
      if (!ok) return;
      if (createdPosition) {
        appendPortalEntityAuditLog(
          "create",
          "hiring",
          "Contratación",
          createdPosition,
          `${String(createdPosition.workerRole || "empleado")} · $${parseNum(createdPosition.baseSalary).toLocaleString("es-CO")}`,
          { entityLabel: String(createdPosition.name || "Cargo").trim() }
        );
      }
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.workspace = "data";
      persistHrWorkspace("hiring", "data");
      collapseCreatePanel("create-position");
      notify(userMessage("positionCreatedOk"), "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='toggle-position']").forEach((btn) => {
    btn.addEventListener("click", () => {
      void runWithBusyButton(btn, async () => {
        const all = read(KEYS.positions, []);
        const target = all.find((p) => p.id === btn.dataset.id);
        if (!target) return;
        const nextPositions = all.map((p) =>
          p.id === target.id ? { ...p, active: target.active === false, updatedAt: nowIso() } : p
        );
        const updatedPosition = nextPositions.find((p) => p.id === target.id);
        const ok = await persistPositionsCatalog(nextPositions, { optimistic: true, editedRow: updatedPosition });
        if (!ok) return;
        if (updatedPosition) {
          logPortalAuditEvent?.("hiring", "update", {
            entityId: String(updatedPosition.id || ""),
            entityLabel: String(updatedPosition.name || "Cargo").trim(),
            summary: updatedPosition.active === false ? "Cargo desactivado" : "Cargo activado"
          });
        }
        notify(target.active === false ? userMessage("positionActivated") : userMessage("positionDeactivated"), "info");
        renderPortalView();
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='close-vacancy']").forEach((btn) => {
    btn.addEventListener("click", () => {
      void runWithBusyButton(btn, async () => {
        const all = read(KEYS.vacancies, []);
        const vacancyId = btn.dataset.id;
        const nextVacancies = all.map((v) =>
          v.id === vacancyId ? { ...v, status: "Cerrada", updatedAt: nowIso() } : v
        );
        try {
          await writeAwaitServerEdit(KEYS.vacancies, nextVacancies, vacancyId);
        } catch (err) {
          notify(String(err?.message || "No fue posible cerrar la vacante en el servidor."), "error");
          return;
        }
        const closedVacancy = nextVacancies.find((v) => String(v.id) === String(vacancyId));
        if (closedVacancy) {
          logPortalAuditEvent?.("hiring", "update", {
            entityId: vacancyId,
            entityLabel: String(closedVacancy.title || closedVacancy.positionName || "Vacante").trim(),
            summary: `Vacante cerrada · ${String(closedVacancy.city || "Sin ciudad")}`
          });
        }
        notify(userMessage("vacancyClosed"), "success");
        renderPortalView();
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='view-vacancy']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = read(KEYS.vacancies, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!v) return;
      const sal = parseNum(v.salaryOffer);
      const reqs = String(v.requirements || "").trim() || "Sin requisitos detallados.";
      const imageUrl = String(v.imageUrl || "").trim();
      const imageHero =
        imageUrl && (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith("data:image/"))
          ? `<div class="vacancy-detail-image"><img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(String(v.title || "Imagen del cargo"))}" loading="lazy" decoding="async" /></div>`
          : "";
      openPortalDetailSheet({
        title: String(v.title || "Vacante"),
        sheetTitle: String(v.title || "Vacante"),
        subtitleHtml: `${IC.briefcase} ${escapeHtml(String(v.positionName || "Cargo"))} · ${escapeHtml(String(v.city || "Ciudad"))}`,
        statusHtml: `<span class="status status-viaje_asignado">${escapeHtml(String(v.status || "Abierta"))}</span>`,
        moduleIcon: "briefcase",
        moduleTone: "green",
        extraHtml: imageHero,
        sections: [
          {
            icon: "briefcase",
            pairs: [
              ["Departamento", escapeHtml(String(v.department || "—"))],
              ["Rol", escapeHtml(String(v.workerRole || "RR.HH."))],
              ["Modalidad", escapeHtml(String(v.modality || "—"))],
              ["Salario ofrecido", `<strong class="detail-view-money">$${sal.toLocaleString("es-CO")}</strong>`, { highlight: true, iconKey: "dollar", tone: "green" }],
              ["Cupos", escapeHtml(String(v.openings ?? v.slots ?? 1))],
              ["Cierre postulaciones", escapeHtml(String(v.deadline || "—"))],
              ["Última actualización", fmtDateOr(v.updatedAt || v.createdAt, "—")]
            ]
          }
        ],
        notesHtml: reqs
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-vacancy']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentUser()?.role !== ROLES.ADMIN) {
        notify(userMessage("adminOnlyModule"), "error");
        return;
      }
      const id = String(btn.dataset.id || "").trim();
      if (!id) return;
      const target = read(KEYS.vacancies, []).find((v) => String(v.id) === id);
      openConfirmModal({
        title: "Eliminar vacante",
        message:
          "Se eliminara la vacante del listado. Esta accion no borra candidatos ya postulados en el pipeline, pero puede dejar registros con referencia huérfana.",
        confirmText: "Eliminar vacante",
        onConfirm: async () => {
          const ok = await removeFromPortalListAwaitServer(KEYS.vacancies, id);
          if (!ok) return;
          appendModuleAuditLog({
            action: "delete",
            moduleId: "hiring",
            moduleLabel: "Contratación",
            entityId: id,
            entityLabel: String(target?.title || target?.positionName || "Vacante").trim() || "Vacante",
            summary: `${String(target?.city || "Sin ciudad")} · ${String(target?.status || "—")}`
          });
          notify(userMessage("vacancyDeletedOk"), "success");
          renderPortalView();
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-candidates-active']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.candidateFilter = "active";
      state.hiringUi.workspace = "data";
      state.hiringUi.dataSection = "candidates";
      persistHrWorkspace("hiring", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-candidates-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.candidateFilter = "all";
      state.hiringUi.workspace = "data";
      state.hiringUi.dataSection = "candidates";
      persistHrWorkspace("hiring", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-candidates-finalized']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.candidateFilter = "finalized";
      state.hiringUi.workspace = "data";
      state.hiringUi.dataSection = "candidates";
      persistHrWorkspace("hiring", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-vacancies-open']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.vacancyFilter = "open";
      state.hiringUi.workspace = "data";
      state.hiringUi.dataSection = "vacancies";
      persistHrWorkspace("hiring", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-vacancies-all']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.vacancyFilter = "all";
      state.hiringUi.workspace = "data";
      state.hiringUi.dataSection = "vacancies";
      persistHrWorkspace("hiring", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-sort-candidates']").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.candidateSort = String(btn.dataset.sort || "recent");
      state.hiringUi.workspace = "data";
      state.hiringUi.dataSection = "candidates";
      persistHrWorkspace("hiring", "data");
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-operate-section']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = normalizeHiringOperateSection(btn.dataset.section);
      const panelId = hiringCreatePanelForSection(section);
      state.hiringUi = { ...(state.hiringUi || {}), operateSection: section, workspace: "operate" };
      state.createPanels = buildHiringCreatePanelsState(section, state.createPanels || {}, { expandActive: true });
      persistHrWorkspace("hiring", "operate");
      switchHrWorkspacePanels({
        root: nodes.viewRoot,
        moduleId: "hiring",
        workspace: "operate",
        panelAttr: "data-hiring-panel"
      });
      if (
        switchModuleTabPanels({
          root: nodes.viewRoot,
          action: "hiring-operate-section",
          activeValue: section,
          panelAttr: "data-hiring-operate-pane",
          tabActiveClass: "is-active"
        })
      ) {
        if (panelId) {
          syncHiringCreatePanelsInDom(nodes.viewRoot, panelId);
          requestAnimationFrame(() => scrollToCreatePanelForm(panelId));
        }
        return;
      }
      renderPortalView();
      if (panelId) {
        requestAnimationFrame(() => scrollToCreatePanelForm(panelId));
      }
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-data-list-search']").forEach((input) => {
    input.addEventListener("input", () => {
      const el = /** @type {HTMLInputElement} */ (input);
      const len = String(el.value || "").length;
      const start = typeof el.selectionStart === "number" ? el.selectionStart : len;
      const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
      state.hiringUi = { ...(state.hiringUi || {}), dataListSearch: String(el.value || ""), workspace: "data" };
      state.__hiringDataListSearchRestore = { start, end };
      renderPortalView();
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='hiring-data-section']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = normalizeHiringDataSection(btn.dataset.section);
      state.hiringUi = { ...(state.hiringUi || {}), dataSection: section, workspace: "data" };
      persistHrWorkspace("hiring", "data");
      switchHrWorkspacePanels({
        root: nodes.viewRoot,
        moduleId: "hiring",
        workspace: "data",
        panelAttr: "data-hiring-panel"
      });
      if (
        switchModuleTabPanels({
          root: nodes.viewRoot,
          action: "hiring-data-section",
          activeValue: section,
          panelAttr: "data-hiring-section",
          tabActiveClass: "is-active"
        })
      ) {
        return;
      }
      renderPortalView();
    });
  });

  const candidateForm = document.getElementById("form-candidate");
  if (candidateForm) {
    window.AntaresValidation?.decorateFormFields?.(candidateForm);
    attachDepartmentCitySelects(candidateForm, {
      departmentSelector: "select[name='department']",
      citySelector: "select[name='city']"
    });
    applyDocumentFieldConstraints(candidateForm);
    const candidateDuplicateDocCheck = wireFormDocDuplicateCheck(candidateForm, {
      storageKey: KEYS.candidates,
      useCompanyScope: false,
      entityLabel: "candidato"
    });
    candidateForm.__antaresDupDocCheck = candidateDuplicateDocCheck;
    bindHrFormWizard(candidateForm);
    wireFormSubmitGuard(candidateForm, async (event) => {
      const data = readFormEntriesNormalized(candidateForm);
      const docValidation = validateColombianDocument(data.documentType, data.idDoc);
      if (!docValidation.ok) {
        failPortalField(candidateForm, "idDoc", docValidation.message);
        return;
      }
      if (!(await candidateDuplicateDocCheck({ forceServer: false, fromSubmit: true }))) {
        /* wireFormDocDuplicateCheck ya notificó y marcó el campo si hay duplicado. */
        return;
      }
      data.idDoc = docValidation.normalized;
      const birthRaw = String(data.birthDate || "").trim().slice(0, 10);
      const candAgeInfo = portalCandidateAgeFromBirthIso(birthRaw);
      if (candAgeInfo.age === null) {
        failPortalField(candidateForm, "birthDate", "Indique una fecha de nacimiento válida.");
        return;
      }
      if (candAgeInfo.age < 18) {
        failPortalField(candidateForm, "birthDate", "El candidato debe ser mayor de 18 años.");
        return;
      }
      const vac = read(KEYS.vacancies, []).find((v) => v.id === data.vacancyId);
      if (!vac) {
        failPortalField(candidateForm, "vacancyId", userMessage("hireSelectVacancy"));
        return;
      }
      if (!isVacancyAcceptingApplications(vac)) {
        failPortalField(candidateForm, "vacancyId", "La vacante seleccionada está cerrada o venció la fecha límite de postulación.");
        return;
      }
      const filesFromInput = await readCandidateHrAttachmentsFromInput(candidateForm.querySelector("input[name='attachments']"));
      if (filesFromInput === null) return;
      const attachmentList =
        filesFromInput.length > 0
          ? filesFromInput
          : [...(candidateForm.querySelector("input[name='attachments']")?.files ?? [])].map((f) => f.name);
      const aspirationCheck = validateColombiaMonthlySalaryCop(data.expectedSalary, "Aspiración salarial");
      if (!aspirationCheck.ok) {
        failPortalField(candidateForm, "expectedSalary", aspirationCheck.message);
        return;
      }
      const expectedSalary = aspirationCheck.amount;
      const offerRef = parseNum(vac.salaryOffer);
      if (offerRef > 0 && expectedSalary < offerRef) {
        failPortalField(
          candidateForm,
          "expectedSalary",
          `La aspiración salarial no puede ser inferior al salario ofrecido en la vacante ($${offerRef.toLocaleString("es-CO")}).`
        );
        return;
      }
      const availabilityTs = new Date(`${String(data.availabilityDate || "")}T12:00:00`).getTime();
      if (!Number.isFinite(availabilityTs) || availabilityTs < new Date(new Date().toDateString()).getTime()) {
        failPortalField(candidateForm, "availabilityDate", userMessage("candidateAvailabilityFuture"));
        return;
      }
      const all = read(KEYS.candidates, []);
      const createdCandidate = stampCreatedRecord({
        id: newUuidV4(),
        name: normalizeLatinUpperForDb(data.name),
        email: normalizeEmail(data.email),
        phone: normalizePortalPhoneForStorage(data.phone),
        documentType: data.documentType,
        idDoc: data.idDoc,
        birthDate: birthRaw,
        department: normalizeLatinForDb(data.department || ""),
        city: normalizeLatinForDb(data.city),
        address: normalizeLatinUpperForDb(data.address),
        educationLevel: normalizeLatinUpperForDb(data.educationLevel || ""),
        experienceYears: Math.max(0, parseNum(data.experienceYears || 0)),
        expectedSalary,
        availabilityDate: data.availabilityDate || "",
        vacancyId: vac.id,
        vacancyTitle: vac.title,
        status: PIPELINE[0],
        attachments: attachmentList,
        source: "Portal RRHH"
      });
      all.unshift(createdCandidate);
      try {
        await writeAwaitServerCreate(KEYS.candidates, all, createdCandidate);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar el candidato en el servidor."), "error");
        return;
      }
      if (createdCandidate) {
        appendPortalEntityAuditLog(
          "create",
          "hiring",
          "Contratación",
          createdCandidate,
          `${String(createdCandidate.status || "En proceso")} · ${String(createdCandidate.vacancyTitle || "Sin vacante")}`,
          { entityLabel: String(createdCandidate.name || "Candidato").trim() }
        );
      }
      sendEmail({ to: data.email, subject: "Registro recibido", body: "Gracias por aplicar." });
      try {
        await writeAwaitServerLatestQueuedEmail();
      } catch (_e) {}
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.candidateFilter = "active";
      state.hiringUi.workspace = "data";
      persistHrWorkspace("hiring", "data");
      collapseCreatePanel("create-candidate");
      notify(userMessage("candidateRegisteredOk"), "success");
      renderPortalView();
    });
  }

  nodes.viewRoot.querySelectorAll("[data-action='candidate-status']").forEach((select) => {
    select.addEventListener("change", async () => {
      const all = read(KEYS.candidates, []);
      const currentCandidate = all.find((c) => c.id === select.dataset.id);
      if (!currentCandidate) return;
      const statusValidation = validateCandidatePipelineTransition(currentCandidate, select.value);
      if (!statusValidation.ok) {
        failPortalField(select.closest("table") || nodes.viewRoot, select, statusValidation.message);
        renderPortalView();
        return;
      }
      const updated = all.map((c) =>
        c.id === select.dataset.id ? { ...c, status: select.value, updatedAt: nowIso() } : c
      );
      try {
        await writeAwaitServerEdit(KEYS.candidates, updated, select.dataset.id);
      } catch (err) {
        notify(String(err?.message || "No fue posible actualizar el candidato en el servidor."), "error");
        renderPortalView();
        return;
      }
      const current = updated.find((c) => c.id === select.dataset.id);
      if (current) {
        logPortalAuditEvent?.("hiring", "update", {
          entityId: String(current.id || ""),
          entityLabel: String(current.name || "Candidato").trim(),
          summary: `Estado del pipeline · ${String(current.status || "En proceso")}`
        });
        sendEmail({
          to: current.email,
          subject: "Actualizacion de proceso",
          body: `Tu estado cambio a: ${current.status}`
        });
        try {
          await writeAwaitServerLatestQueuedEmail();
        } catch (_e) {}
      }
      notify(userMessage("candidateUpdated"), "success");
      renderPortalView();
    });
  });

  const interviewForm = document.getElementById("form-interview");
  if (interviewForm) {
    wireFormSubmitGuard(interviewForm, async (event) => {
      const data = readFormEntriesNormalized(interviewForm);
      const whenRaw = String(data.when || "").trim();
      const interviewTs = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(whenRaw)
        ? new Date(`${whenRaw}:00-05:00`).getTime()
        : new Date(whenRaw).getTime();
      if (!Number.isFinite(interviewTs) || interviewTs < Date.now()) {
        failPortalField(interviewForm, "when", userMessage("interviewScheduleFuture"));
        return;
      }
      const candidate = read(KEYS.candidates, []).find((c) => String(c.id) === String(data.candidateId || ""));
      if (!candidate) {
        failPortalField(interviewForm, "candidateId", userMessage("interviewCandidateMissing"));
        return;
      }
      if (["Descartado", "Contratado"].includes(String(candidate.status || ""))) {
        failPortalField(interviewForm, "candidateId", userMessage("interviewInvalidCandidate"));
        return;
      }
      const all = read(KEYS.interviews, []);
      const createdInterview = stampCreatedRecord({
        id: newUuidV4(),
        candidateId: candidate.id,
        candidateName: candidate.name,
        when: data.when,
        interviewer: normalizeLatinUpperForDb(String(data.interviewer || "").trim()),
        modality: (() => {
          const modeKey = String(data.mode || "").trim().toLowerCase();
          if (modeKey === "virtual") return "Virtual";
          if (modeKey === "telefonica") return "Telefónica";
          return "Presencial";
        })(),
        locationOrLink: normalizeLatinUpperForDb(String(data.place || "").trim()),
        notes: normalizeLatinUpperForDb(String(data.notes || "").trim())
      });
      all.unshift(createdInterview);
      write(KEYS.interviews, all, { skipSyncSchedule: true });
      try {
        await writeAwaitServerCreate(KEYS.interviews, all, createdInterview);
      } catch (err) {
        notify(String(err?.message || "No fue posible guardar la entrevista en el servidor."), "error");
        return;
      }
      const candidateList = read(KEYS.candidates, []);
      const nextCandidates = candidateList.map((item) => {
        if (String(item.id) !== String(candidate.id)) return item;
        const status = String(item.status || "");
        if (["Contratado", "Descartado"].includes(status)) return item;
        if (status === "Entrevistado") return item;
        return stampUpdatedRecord({ ...item, status: "Entrevistado" });
      });
      write(KEYS.candidates, nextCandidates, { skipSyncSchedule: true });
      try {
        await writeAwaitServerEdit(KEYS.candidates, nextCandidates, candidate.id);
      } catch (err) {
        notify(String(err?.message || "Entrevista guardada; no fue posible actualizar el estado del candidato en el servidor."), "error");
        renderPortalView();
        return;
      }
      sendEmail({
        to: candidate.email,
        subject: "Entrevista programada",
        body: `Fecha y hora: ${formatInterviewWhenDisplay(data.when)} (ajuste según su zona horaria).`
      });
      try {
        await writeAwaitServerLatestQueuedEmail();
      } catch (_e) {}
      appendPortalEntityAuditLog(
        "create",
        "hiring",
        "Contratación",
        createdInterview,
        `${String(createdInterview.modality || "Presencial")} · ${formatInterviewWhenDisplay(data.when)}`,
        { entityLabel: String(createdInterview.candidateName || "Entrevista").trim() }
      );
      state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
      state.hiringUi.workspace = "data";
      persistHrWorkspace("hiring", "data");
      collapseCreatePanel("create-interview");
      notify(userMessage("interviewScheduledOk"), "success");
      renderPortalView();
    });
    const applyPendingInterviewCandidate = () => {
      const cid = String(state.hiringUi?.scheduleInterviewOpenForCandidateId || "").trim();
      if (!cid) return;
      state.hiringUi = { ...(state.hiringUi || {}), scheduleInterviewOpenForCandidateId: "" };
      const sel = interviewForm.querySelector('select[name="candidateId"]');
      if (sel && [...sel.options].some((o) => String(o.value) === cid)) {
        sel.value = cid;
      }
      const minWhen = colombiaDatetimeLocalString();
      const whenWrap = interviewForm.querySelector(".portal-datetime-dmy-row");
      const V = window.AntaresValidation;
      if (whenWrap && typeof V?.portalDatetimeInputSetIso === "function") {
        V.portalDatetimeInputSetIso(whenWrap, "");
        const dateVis =
          whenWrap.querySelector(".portal-date-dmy") || whenWrap.querySelector('input[type="date"]');
        if (dateVis) dateVis.min = minWhen.slice(0, 10);
        dateVis?.focus?.();
      } else {
        const whenEl =
          interviewForm.querySelector('input[type="datetime-local"][name="when"]') ||
          interviewForm.querySelector('input[name="when"]');
        if (whenEl) {
          whenEl.setAttribute("min", minWhen);
          whenEl.value = "";
          whenEl.focus();
        }
      }
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(applyPendingInterviewCandidate);
    });
  }

  const contractForm = document.getElementById("form-contract");
  if (contractForm) {
    const syncContractPersonMode = () => {
      const mode = String(contractForm.querySelector("#contract-person-mode")?.value || "employee");
      const empPicker = contractForm.querySelector(".hiring-contract-employee-picker");
      const candPicker = contractForm.querySelector(".hiring-contract-candidate-picker");
      const empSel = contractForm.querySelector("select[name='employeeId']");
      const candSel = contractForm.querySelector("select[name='candidateId']");
      const hint = contractForm.querySelector("#contract-candidate-match-hint");
      const isCandidate = mode === "candidate";
      if (empPicker) {
        empPicker.classList.toggle("hidden", isCandidate);
        empPicker.toggleAttribute("hidden", isCandidate);
      }
      if (candPicker) {
        candPicker.classList.toggle("hidden", !isCandidate);
        candPicker.toggleAttribute("hidden", !isCandidate);
      }
      if (empSel) {
        if (isCandidate) empSel.removeAttribute("required");
        else empSel.setAttribute("required", "required");
      }
      if (candSel) {
        if (isCandidate) candSel.setAttribute("required", "required");
        else candSel.removeAttribute("required");
      }
      if (hint && isCandidate) {
        const cand = read(KEYS.candidates, []).find((c) => String(c.id) === String(candSel?.value || ""));
        const emp = cand ? findPayrollEmployeeByIdDoc(cand.idDoc) : null;
        if (!cand) {
          hint.classList.add("hidden");
          hint.setAttribute("hidden", "hidden");
          hint.textContent = "";
        } else if (emp) {
          hint.classList.remove("hidden");
          hint.removeAttribute("hidden");
          hint.textContent = `Empleado vinculado: ${emp.name} (CC ${emp.idDoc}). Se generará el contrato sobre su ficha.`;
        } else {
          hint.classList.remove("hidden");
          hint.removeAttribute("hidden");
          hint.textContent =
            "Aún no hay empleado con esta cédula. Regístrelo desde «Crear empleado» en el candidato antes de generar el contrato.";
        }
      } else if (hint) {
        hint.classList.add("hidden");
        hint.setAttribute("hidden", "hidden");
      }
    };
    contractForm.querySelector("#contract-person-mode")?.addEventListener("change", syncContractPersonMode);
    contractForm.querySelector("select[name='candidateId']")?.addEventListener("change", () => {
      syncContractPersonMode();
      syncContractFormFromSelection(contractForm);
    });
    syncContractPersonMode();
    const contractFormBusyLockButtons = [
      contractForm.querySelector(".hr-form-wizard-submit"),
      contractForm.querySelector("[data-hr-wizard-next]"),
      contractForm.querySelector("[data-hr-wizard-prev]"),
      contractForm.querySelector("[data-action='cancel-create-panel']"),
      contractForm.querySelector("[data-action='toggle-create-panel']"),
      ...contractForm.querySelectorAll("[data-action='contract-test-docx']")
    ].filter(Boolean);
    contractForm.querySelectorAll("[data-action='contract-test-docx']").forEach((btn) => {
      btn.addEventListener("click", async (event) => {
        event.preventDefault();
        const kind = String(btn.dataset.template || "oficina");
        await runWithBusyButton(
          btn,
          async () => {
            try {
              await generateOfficialWordContract(buildContractDocxTestPayload(kind));
              notify(userMessage("contractTestDownloaded", kind), "success");
            } catch (err) {
              notify(userMessage("contractWordError", String(err?.message || err)), "error");
            }
          },
          { busyText: "Generando…", lockExtraButtons: contractFormBusyLockButtons }
        );
      });
    });
    const templateSelect = contractForm.querySelector("select[name='contractTemplateKind']");
    const employeeSelect = contractForm.querySelector("select[name='employeeId']");
    const signDateEl = contractForm.querySelector("input[name='signDate']");
    const onContractFormSelectionChange = () => syncContractFormFromSelection(contractForm);
    if (employeeSelect) employeeSelect.addEventListener("change", onContractFormSelectionChange);
    if (templateSelect) templateSelect.addEventListener("change", onContractFormSelectionChange);
    if (signDateEl) signDateEl.addEventListener("change", onContractFormSelectionChange);

    bindHrFormWizard(contractForm);

    const applyPendingContractCandidate = () => {
      const cid = String(state.hiringUi?.prefillContractFromCandidateId || "").trim();
      if (!cid) return;
      state.hiringUi = { ...(state.hiringUi || {}), prefillContractFromCandidateId: "" };
      const modeEl = contractForm.querySelector("#contract-person-mode");
      const candSel = contractForm.querySelector("select[name='candidateId']");
      if (modeEl) modeEl.value = "candidate";
      if (candSel && [...candSel.options].some((o) => String(o.value) === cid)) candSel.value = cid;
      syncContractPersonMode();
      syncContractFormFromSelection(contractForm);
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(applyPendingContractCandidate);
    });

    wireFormSubmitGuard(
      contractForm,
      async (event) => {
      const data = readFormEntriesNormalized(contractForm);
      const personMode = String(data.contractPersonMode || "employee");
      let employee = null;
      let linkedCandidate = null;
      if (personMode === "candidate") {
        linkedCandidate = read(KEYS.candidates, []).find((c) => String(c.id) === String(data.candidateId || ""));
        if (!linkedCandidate) {
          failPortalField(contractForm, "candidateId", "Seleccione un candidato válido.");
          return;
        }
        employee = findPayrollEmployeeByIdDoc(linkedCandidate.idDoc);
        if (!employee) {
          notify(
            "Primero registre al candidato como empleado (botón «Empleado» en Consultar o desde el detalle del candidato).",
            "error"
          );
          return;
        }
      } else {
        employee = read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(data.employeeId || ""));
      }
      if (!employee) {
        failPortalField(contractForm, personMode === "candidate" ? "candidateId" : "employeeId", userMessage("contractPickEmployee"));
        return;
      }
      const missing = validateEmployeeContractDocFields(employee);
      if (missing.length) {
        failPortalField(
          contractForm,
          firstEmployeeContractDocFieldFromMissing(missing),
          userMessage("contractEmployeeMissingFields", missing.join(", "))
        );
        return;
      }
      const signDate = String(data.signDate || "").trim();
      if (!signDate) {
        failPortalField(contractForm, "signDate", userMessage("contractSignDateRequired"));
        return;
      }
      const payload = buildEmployeeContractDocxPayload(employee, {
        contractTemplateKind: data.contractTemplateKind,
        signDate
      });
      const contractText =
        `CONTRATO LABORAL\n` +
        `Empleado: ${employee.name}\n` +
        `Cedula: ${employee.idDoc}\n` +
        `Cargo: ${payload.cargo_empleado}\n` +
        `Tipo: ${payload.contractType}\n` +
        `Plantilla: ${payload.contractTemplateKind}\n` +
        `Salario: ${payload.salario}\n` +
        `Firma constancia: ${signDate}\n`;
      try {
        await generateOfficialWordContract(payload);
        const all = read(KEYS.contracts, []);
        const employeeCompany = getCompanyById(String(employee.companyId || ""));
        const employeePosition = getPositionById(String(employee.positionId || ""));
        const empId = String(employee.id || "").trim();
        const empDoc = String(employee.idDoc || "").trim();
        const tplKind = String(payload.contractTemplateKind || "").trim().toLowerCase();
        const matchesExisting = (row) => {
          if (!row) return false;
          const sameEmployee =
            (empId && String(row.employeeId || "") === empId) ||
            (empDoc && String(row.idDocSnapshot || "").trim() === empDoc);
          if (!sameEmployee) return false;
          const sameTemplate =
            String(row.contractTemplateKind || "").trim().toLowerCase() === tplKind;
          const sameStart = String(row.startDate || "").trim() === signDate;
          return sameTemplate && sameStart;
        };
        const existingIdx = all.findIndex(matchesExisting);
        const recordBase = {
          employeeId: employee.id,
          employeeName: employee.name,
          candidateId: linkedCandidate ? String(linkedCandidate.id) : "",
          candidateName: linkedCandidate ? String(linkedCandidate.name || "") : "",
          personType: linkedCandidate ? "Candidato" : "Empleado",
          sourceTag: linkedCandidate ? "Generado desde candidato" : "Generado desde contratación",
          positionId: String(employee.positionId || employeePosition?.id || "").trim(),
          position: payload.cargo_empleado,
          positionName: payload.cargo_empleado,
          companyId: String(employee.companyId || employeeCompany?.id || "").trim(),
          companyName: String(employeeCompany?.name || "").trim(),
          salary: payload.salario,
          transportAllowance: readEmployeeTransportAllowanceCop(employee),
          startDate: signDate,
          contractType: payload.contractType,
          contractTemplateKind: payload.contractTemplateKind,
          templateKind: payload.contractTemplateKind,
          idDocSnapshot: empDoc,
          workerRole: payload.workerRole,
          eps: String(employee.eps || "").trim(),
          pensionFund: String(employee.pensionFund || "").trim(),
          arl: String(employee.arl || "").trim(),
          schedule: String(employee.workSchedule || employeePosition?.workSchedule || "Diurna").trim(),
          source: linkedCandidate ? "Candidato" : "Empleado",
          content: contractText
        };
        let savedContract;
        if (existingIdx >= 0) {
          const previous = all[existingIdx];
          savedContract = stampUpdatedRecord({
            ...previous,
            ...recordBase,
            id: previous.id
          });
          all.splice(existingIdx, 1, savedContract);
          notify("Contrato actualizado (mismo empleado, plantilla y fecha).", "info");
        } else {
          savedContract = stampCreatedRecord({
            id: newUuidV4(),
            ...recordBase
          });
          all.unshift(savedContract);
          notify(userMessage("contractWordSaved"), "success");
        }
        const deduped =
          typeof window.dedupContracts === "function" ? window.dedupContracts(all) : all;
        try {
          await writeAwaitServerCreate(KEYS.contracts, deduped, savedContract);
          appendPortalEntityAuditLog(
            existingIdx >= 0 ? "update" : "create",
            "hiring",
            "Contratación",
            savedContract,
            `${String(savedContract.contractType || "Contrato")} · ${String(savedContract.position || savedContract.positionName || "Sin cargo")}`,
            {
              entityLabel: String(
                savedContract.candidateName || savedContract.employeeName || employee.name || "Contrato"
              ).trim()
            }
          );
          if (linkedCandidate) {
            const statusValidation = validateCandidatePipelineTransition(linkedCandidate, "Contratado");
            if (statusValidation.ok) {
              const nextCandidates = read(KEYS.candidates, []).map((c) =>
                String(c.id) === String(linkedCandidate.id)
                  ? stampUpdatedRecord({ ...c, status: "Contratado", updatedAt: nowIso() })
                  : c
              );
              try {
                await writeAwaitServerEdit(KEYS.candidates, nextCandidates, linkedCandidate.id);
              } catch (_candErr) {
                /* contrato ya guardado */
              }
            }
          }
          state.hiringUi = state.hiringUi || { candidateFilter: "active", vacancyFilter: "open", candidateSort: "recent", workspace: "operate" };
          state.hiringUi.workspace = "data";
          persistHrWorkspace("hiring", "data");
          collapseCreatePanel("create-contract");
        } catch (persistErr) {
          notify(String(persistErr?.message || "No fue posible guardar el contrato en el servidor."), "error");
        }
      } catch (wordErr) {
        notify(userMessage("contractWordError", String(wordErr?.message || "error")), "error");
      }
      renderPortalView();
      },
      {
        busyText: "Generando…",
        submitButton: contractForm.querySelector(".hr-form-wizard-submit"),
        lockExtraButtons: contractFormBusyLockButtons
      }
    );
  }

  const renderDetailRows = portalDetailRenderRows;
  const buildDetailGrid = portalDetailBuildGrid;
  const fmtMoney = (val) => `$${parseNum(val).toLocaleString("es-CO")}`;
  const fmtBool = (val) => (val ? "Sí" : "No");
  const fmtDateOr = (val, fallback = "—") => {
    const y = normalizePortalDateYmd(val);
    return y ? escapeHtml(y) : fallback;
  };
  /* ============= VACANTE: EDITAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='edit-vacancy']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanManageHiring()) return;
      const all = read(KEYS.vacancies, []);
      const target = normalizeVacancyRowForEditor(all.find((v) => String(v.id) === String(btn.dataset.id || "")));
      if (!target) return;
      const positions = getActivePositions();
      const positionOpts = [
        { value: "", label: "Seleccione cargo..." },
        ...positions.map((p) => ({ value: p.id, label: String(p.name || "") }))
      ];
      openEditModal({
        title: "Editar vacante",
        subtitle: String(target.title || ""),
        submitText: "Guardar cambios",
        fields: [
          { name: "title", label: "Título de la vacante", value: target.title || "", required: true },
          { name: "positionId", label: "Cargo base", type: "select", value: target.positionId || "", options: positionOpts, required: true },
          { name: "city", label: "Ciudad", value: target.city || "" },
          { name: "department", label: "Departamento", value: target.department || "" },
          {
            name: "modality",
            label: "Modalidad",
            type: "select",
            value: target.modality || "Presencial",
            options: [
              { value: "Presencial", label: "Presencial" },
              { value: "Remoto", label: "Remoto" },
              { value: "Híbrido", label: "Híbrido" }
            ]
          },
          { name: "openings", label: "Cupos", type: "number", value: parseNum(target.openings || 1), required: true },
          { name: "salaryOffer", label: "Salario ofrecido (COP)", type: "number", value: parseNum(target.salaryOffer || 0), required: true },
          { name: "deadline", label: "Cierre postulaciones", type: "date", value: target.deadline || "", required: true },
          {
            name: "publishedFrom",
            label: "Visible en web desde",
            type: "date",
            value: target.publishedFrom || ""
          },
          { name: "requirements", label: "Requisitos y perfil", type: "textarea", value: target.requirements || "", rows: 4 },
          {
            name: "status",
            label: "Estado",
            type: "select",
            value: target.status || "Publicada",
            options: [
              { value: "Publicada", label: "Publicada" },
              { value: "Cerrada", label: "Cerrada" }
            ]
          },
          {
            type: "custom",
            full: true,
            html: (() => {
              const existing = String(target.imageUrl || "").trim();
              const hasImage =
                existing && (/^https?:\/\//i.test(existing) || existing.startsWith("data:image/"));
              return `<div class="vacancy-image-field">
                <span class="modal-field-label">Imagen del cargo</span>
                <input type="hidden" name="imageUrlExisting" value="${escapeAttr(existing)}" />
                <label class="vacancy-image-dropzone${hasImage ? " has-image" : ""}" data-vacancy-edit-image-dropzone for="vacancy-edit-image-file" title="Clic para cambiar la imagen del cargo">
                  <input type="file" id="vacancy-edit-image-file" name="imageFile" accept="image/jpeg,image/png,image/webp,image/gif" class="vacancy-image-file-input" aria-label="Cambiar imagen del cargo" />
                  <span class="vacancy-image-dropzone__empty" data-vacancy-edit-image-empty${hasImage ? " hidden" : ""}>
                    <span class="vacancy-image-dropzone__icon" aria-hidden="true">${IC.upload}</span>
                    <span class="vacancy-image-dropzone__copy">
                      <span class="vacancy-image-dropzone__title">Elegir imagen del cargo</span>
                      <span class="vacancy-image-dropzone__meta">Opcional · Deje vacío para conservar la actual</span>
                    </span>
                  </span>
                  <img class="vacancy-image-preview" data-vacancy-edit-image-preview src="${hasImage ? escapeAttr(existing) : ""}" alt="" width="640" height="360" decoding="async"${hasImage ? "" : " hidden"} />
                  <span class="vacancy-image-dropzone__overlay" aria-hidden="true"><span>Cambiar imagen</span></span>
                </label>
              </div>`;
            })()
          }
        ],
        afterMount: (formEl) => {
          if (!formEl) return;
          const dropzone = formEl.querySelector("[data-vacancy-edit-image-dropzone]");
          const fileInput = formEl.querySelector("input[name='imageFile']");
          const previewImg = formEl.querySelector("[data-vacancy-edit-image-preview]");
          const emptyEl = formEl.querySelector("[data-vacancy-edit-image-empty]");
          if (!fileInput || !dropzone) return;
          let previewBlobUrl = "";
          fileInput.addEventListener("change", () => {
            const f = fileInput.files?.[0];
            if (previewBlobUrl && previewBlobUrl.startsWith("blob:")) {
              try {
                URL.revokeObjectURL(previewBlobUrl);
              } catch (_e) {}
              previewBlobUrl = "";
            }
            if (!f || !String(f.type || "").startsWith("image/")) return;
            try {
              previewBlobUrl = URL.createObjectURL(f);
            } catch (_e) {
              previewBlobUrl = "";
            }
            if (!previewBlobUrl) return;
            if (previewImg) {
              previewImg.src = previewBlobUrl;
              previewImg.hidden = false;
            }
            if (emptyEl) emptyEl.hidden = true;
            dropzone.classList.add("has-image");
          });
        },
        onSubmit: async (form, formEl) => {
          const position = getPositionById(String(form.positionId || ""));
          const vacancyEditForm = formEl || document.getElementById("crud-form");
          if (!position) {
            failPortalField(vacancyEditForm, "positionId", userMessage("vacancySelectPosition"));
            return false;
          }
          const salaryValidation = validateVacancySalaryOffer(form.salaryOffer, position);
          if (!salaryValidation.ok) {
            failPortalField(vacancyEditForm, "salaryOffer", salaryValidation.message);
            return false;
          }
          const deadline = vacancyFormDateYmd(vacancyEditForm, "deadline", form.deadline);
          if (!vacancyDeadlineIsTodayOrFuture(deadline)) {
            failPortalField(vacancyEditForm, "deadline", userMessage("vacancyDeadlineFuture"));
            notify(userMessage("vacancyDeadlineFuture"), "error");
            return false;
          }
          const pFrom = vacancyFormDateYmd(vacancyEditForm, "publishedFrom", form.publishedFrom);
          if (String(form.publishedFrom || "").trim() && !pFrom) {
            failPortalField(vacancyEditForm, "publishedFrom", "Indique una fecha válida en “Visible en web desde”, o déjela vacía.");
            return false;
          }
          if (pFrom && vacancyYmdToMidnight(pFrom) > vacancyYmdToMidnight(deadline)) {
            failPortalField(vacancyEditForm, "publishedFrom", "“Visible desde” no puede ser posterior a la fecha límite de postulaciones.");
            return false;
          }
          const imageFile = vacancyEditForm?.querySelector?.("input[name='imageFile']")?.files?.[0] || null;
          const editDropzone = vacancyEditForm?.querySelector?.("[data-vacancy-edit-image-dropzone]");
          editDropzone?.classList.remove("is-error");
          let imageUrl = String(form.imageUrlExisting || target.imageUrl || "").trim();
          if (imageFile) {
            if (!String(imageFile.type || "").startsWith("image/")) {
              editDropzone?.classList.add("is-error");
              notify("Seleccione una imagen válida (JPG, PNG, WebP o GIF).", "error");
              return false;
            }
            try {
              const uploaded = await resolveVacancyImageUrl(imageFile);
              if (uploaded) imageUrl = uploaded;
              else {
                editDropzone?.classList.add("is-error");
                notify(
                  "No se obtuvo una URL pública de la imagen en Cloudflare. Se conservará la imagen anterior (si había).",
                  "warning"
                );
              }
            } catch (imgErr) {
              editDropzone?.classList.add("is-error");
              notify(String(imgErr?.message || "No se pudo subir la imagen a Cloudflare R2."), "error");
              return false;
            }
          }
          const freshVacancies = read(KEYS.vacancies, []);
          const nextVacancies = freshVacancies.map((v) =>
            String(v.id) !== String(target.id)
              ? v
              : stampUpdatedRecord({
                  ...v,
                  title: normalizeLatinUpperForDb(String(form.title || "").trim()),
                  positionId: position.id,
                  positionName: position.name,
                  workerRole: position.workerRole || v.workerRole || "empleado",
                  contractTypeDefault: position.contractTypeDefault || v.contractTypeDefault,
                  city: normalizeLatinForDb(String(form.city || "").trim()),
                  department: normalizeLatinForDb(String(form.department || "").trim()),
                  modality: normalizeLatinUpperForDb(String(form.modality || "").trim()),
                  openings: Math.max(1, parseNum(form.openings || 1)),
                  salaryOffer: salaryValidation.salaryOffer,
                  deadline,
                  publishedFrom: pFrom || "",
                  requirements: normalizeLatinUpperForDb(String(form.requirements || "").trim()),
                  imageUrl,
                  status: String(form.status || "Publicada")
                })
          );
          write(KEYS.vacancies, nextVacancies, { skipSyncSchedule: true });
          try {
            await writeAwaitServerEdit(KEYS.vacancies, nextVacancies, target.id);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar la vacante en el servidor."), "error");
            return false;
          }
          const updatedVacancy = nextVacancies.find((v) => String(v.id) === String(target.id));
          if (updatedVacancy) {
            appendPortalEntityAuditLog(
              "update",
              "hiring",
              "Contratación",
              updatedVacancy,
              `${String(updatedVacancy.city || "Sin ciudad")} · ${String(updatedVacancy.status || "Publicada")}`,
              { entityLabel: String(updatedVacancy.title || updatedVacancy.positionName || "Vacante").trim() }
            );
          }
          notify("Vacante actualizada.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  /* ============= CARGO: VER / EDITAR / ELIMINAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-position']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = read(KEYS.positions, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!p) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const sections = [
        {
          icon: "briefcase",
          pairs: [
            ["Nombre", `<strong>${escapeHtml(String(p.name || ""))}</strong>`],
            ["Rol", p.workerRole === "conductor" ? "Conductor" : "Empleado"],
            ["Salario base", fmtMoney(p.baseSalary)],
            ["Auxilio transporte", fmtMoney(readPositionTransportAllowanceCop(p))],
            ["Tipo de contrato", escapeHtml(String(p.contractTypeDefault || "-"))],
            ["Estado", p.active === false ? '<span class="status status-rechazada">Inactivo</span>' : '<span class="status status-viaje_asignado">Activo</span>'],
            ["Jornada", escapeHtml(String(p.workSchedule || "-"))],
            ["Riesgo ARL", escapeHtml(String(p.arlRiskLevel || "-"))],
            ["Salario integral", fmtBool(String(p.integralSalary) === "true" || p.integralSalary === true)],
            ["Base legal", escapeHtml(String(p.legalBasis || "CST"))],
            ["Creado", fmtDateOr(p.createdAt)],
            ["Última actualización", fmtDateOr(p.updatedAt || p.createdAt)]
          ]
        }
      ];
      openPortalDetailSheet({
        title: `Cargo: ${String(p.name || "")}`,
        sheetTitle: `Cargo: ${String(p.name || "")}`,
        subtitleHtml: `${IC.briefcase} ${p.workerRole === "conductor" ? "Conductor" : "Empleado"}`,
        moduleIcon: "briefcase",
        moduleTone: "green",
        sections
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-position']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanManageHiring()) return;
      const all = read(KEYS.positions, []);
      const target = normalizePositionRowForEditor(all.find((p) => String(p.id) === String(btn.dataset.id || "")));
      if (!target) return;
      const contractOpts = editModalCatalogSelectOptions(
        CO_CATALOGS.positionContractTypes,
        target.contractTypeDefault
      );
      const scheduleOpts = editModalCatalogSelectOptions(CO_CATALOGS.workSchedule, target.workSchedule);
      const arlOpts = editModalCatalogSelectOptions(CO_CATALOGS.arlRiskLevels, target.arlRiskLevel);
      openEditModal({
        title: "Editar cargo",
        subtitle: String(target.name || ""),
        submitText: "Guardar cambios",
        fields: [
          { name: "name", label: "Nombre del cargo", value: target.name || "", required: true },
          {
            name: "workerRole",
            label: "Rol del cargo",
            type: "select",
            value: target.workerRole || "empleado",
            options: [
              { value: "empleado", label: "Empleado" },
              { value: "conductor", label: "Conductor" }
            ]
          },
          {
            name: "salaryBasis",
            label: "Referencia salarial",
            type: "select",
            value: positionSalaryUsesSmmlv(target.baseSalary) ? "smmlv" : "custom",
            options: [
              { value: "smmlv", label: "Salario mínimo legal (SMMLV)" },
              { value: "custom", label: "Otro valor (ajustar)" }
            ]
          },
          { name: "baseSalary", label: "Salario base (COP)", type: "number", value: parseNum(target.baseSalary || 0), required: true },
          {
            name: "transportAllowance",
            label: "Auxilio transporte (COP)",
            type: "number",
            value: readPositionTransportAllowanceCop(target),
            required: true
          },
          { name: "contractTypeDefault", label: "Contrato sugerido", type: "select", value: target.contractTypeDefault || "", options: contractOpts },
          { name: "workSchedule", label: "Jornada", type: "select", value: target.workSchedule || "", options: scheduleOpts },
          { name: "arlRiskLevel", label: "Nivel ARL", type: "select", value: target.arlRiskLevel || "", options: arlOpts },
          {
            name: "integralSalary",
            label: "Salario integral",
            type: "select",
            value: String(target.integralSalary) === "true" || target.integralSalary === true ? "true" : "false",
            options: [
              { value: "false", label: "No" },
              { value: "true", label: "Sí" }
            ]
          },
          { name: "legalBasis", label: "Base legal", value: target.legalBasis || "CST art. 45-46 y normatividad laboral vigente" }
        ],
        afterMount: (formEl) => {
          bindPositionCompensationFields(formEl, {
            basisSelector: 'select[name="salaryBasis"]',
            salarySelector: 'input[name="baseSalary"]',
            auxSelector: 'input[name="transportAllowance"]',
            preserveExistingValue: true
          });
        },
        onSubmit: async (form) => {
          const minSalary = CO_HR_RULES.minMonthlySalary;
          const baseSalary =
            String(form.salaryBasis || "smmlv") === "smmlv" ? minSalary : parseNum(form.baseSalary);
          const comp = validateColombiaPositionCompensation({
            baseSalary,
            integralSalary: String(form.integralSalary || "false") === "true",
            transportAllowance: form.transportAllowance
          });
          const positionEditForm = document.getElementById("crud-form");
          if (!comp.ok) {
            failPortalField(positionEditForm, "baseSalary", comp.message);
            return false;
          }
          const freshAll = read(KEYS.positions, []);
          const nextPos = freshAll.map((p) =>
              String(p.id) !== String(target.id)
                ? p
                : stampUpdatedRecord({
                    ...p,
                    name: normalizeLatinUpperForDb(String(form.name || "").trim()),
                    workerRole: String(form.workerRole || "empleado"),
                    baseSalary: comp.baseSalary,
                    transportAllowance: comp.transportAllowance,
                    contractTypeDefault: normalizeLatinUpperForDb(
                      String(form.contractTypeDefault || p.contractTypeDefault || "").trim()
                    ),
                    workSchedule: normalizeLatinUpperForDb(String(form.workSchedule || "").trim()),
                    arlRiskLevel: normalizeLatinUpperForDb(String(form.arlRiskLevel || p.arlRiskLevel || "").trim()),
                    integralSalary: String(form.integralSalary || "false") === "true",
                    legalBasis: normalizeLatinUpperForDb(String(form.legalBasis || p.legalBasis || "").trim())
                  })
            );
          const updatedPosition = nextPos.find((p) => String(p.id) === String(target.id));
          const ok = await persistPositionsCatalog(nextPos, { optimistic: true, editedRow: updatedPosition });
          if (!ok) return false;
          if (updatedPosition) {
            appendPortalEntityAuditLog(
              "update",
              "hiring",
              "Contratación",
              updatedPosition,
              `${String(updatedPosition.workerRole || "empleado")} · $${parseNum(updatedPosition.baseSalary).toLocaleString("es-CO")}`,
              { entityLabel: String(updatedPosition.name || "Cargo").trim() }
            );
          }
          notify("Cargo actualizado.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-position']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const id = String(btn.dataset.id || "");
      const target = read(KEYS.positions, []).find((p) => String(p.id) === id);
      if (!target) return;
      const linkedVacancies = read(KEYS.vacancies, []).filter((v) => String(v.positionId || "") === id).length;
      const linkedContracts = read(KEYS.contracts, []).filter((c) => String(c.positionId || "") === id).length;
      if (linkedVacancies > 0) {
        notify(`No se puede eliminar: hay ${linkedVacancies} vacante(s) que referencian este cargo. Cierra o reasigna primero.`, "error");
        return;
      }
      if (linkedContracts > 0) {
        notify(`No se puede eliminar: hay ${linkedContracts} contrato(s) vinculados a este cargo. Elimine o reasigne esos contratos primero.`, "error");
        return;
      }
      openConfirmModal({
        title: "Eliminar cargo",
        message: `Se eliminará permanentemente el cargo "${String(target.name || "")}" del catálogo. Los empleados en nómina conservan su historial; no se borran contratos ya registrados.`,
        confirmText: "Eliminar cargo",
        onConfirm: async () => {
          const ok = await removeFromPortalListAwaitServer(KEYS.positions, id);
          if (!ok) return;
          appendModuleAuditLog({
            action: "delete",
            moduleId: "hiring",
            moduleLabel: "Contratación",
            entityId: id,
            entityLabel: String(target.name || "Cargo").trim(),
            summary: `${String(target.workerRole || "empleado")} · $${parseNum(target.baseSalary).toLocaleString("es-CO")}`
          });
          notify("Cargo eliminado.", "success");
          renderPortalView();
        }
      });
    });
  });

  /* ============= CANDIDATO: PROGRAMAR ENTREVISTA DESDE TABLA ============= */
  nodes.viewRoot.querySelectorAll("[data-action='schedule-interview-for-candidate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cid = String(btn.dataset.candidateId || "").trim();
      if (!cid) return;
      const cand = read(KEYS.candidates, []).find((c) => String(c.id) === cid);
      if (!cand) {
        notify(userMessage("genericError"), "error");
        return;
      }
      if (["Contratado", "Descartado"].includes(String(cand.status || ""))) {
        notify("Este candidato ya no está en proceso; no se puede agendar entrevista.", "info");
        return;
      }
      state.hiringUi = { ...(state.hiringUi || {}), scheduleInterviewOpenForCandidateId: cid };
      state.hiringUi.workspace = "operate";
      state.hiringUi.operateSection = "interview";
      state.createPanels = buildHiringCreatePanelsState("interview", state.createPanels || {}, { expandActive: true });
      persistHrWorkspace("hiring", "operate");
      renderPortalView();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollToCreatePanelForm("create-interview"));
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='create-employee-from-candidate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanManageHiring()) return;
      const cid = String(btn.dataset.candidateId || "").trim();
      if (!cid) return;
      openPayrollEmployeeFromCandidate(cid);
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='generate-contract-from-candidate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanManageHiring()) return;
      const cid = String(btn.dataset.candidateId || "").trim();
      if (!cid) return;
      const cand = read(KEYS.candidates, []).find((c) => String(c.id) === cid);
      if (!cand) {
        notify(userMessage("genericError"), "error");
        return;
      }
      if (!findPayrollEmployeeByIdDoc(cand.idDoc)) {
        notify("Registre primero al candidato como empleado antes de generar el contrato.", "error");
        openPayrollEmployeeFromCandidate(cid);
        return;
      }
      openHiringContractFromCandidate(cid);
    });
  });

  /* ============= CANDIDATO: VER / EDITAR / ELIMINAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-candidate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = read(KEYS.candidates, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!c) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const { attachmentsHtml: attHtml, experienceFromJson } = parseCandidateAttachmentsForView(c.attachments);
      const experienceSummary = String(c.experienceNotes || experienceFromJson || "").trim();
      const ageDisp = portalCandidateAgeFromBirthIso(c.birthDate);
      const attachmentsInner =
        String(attHtml || "").trim() !== ""
          ? attHtml
          : `<span class="muted">Sin archivos adjuntos registrados para este candidato.</span>`;
      const salaryShow = parseNum(c.expectedSalary ?? c.salaryExpectation ?? c.aspiration ?? 0);
      const availShow = String(c.availabilityDate || c.availableFrom || "").trim();
      const statusShow = String(c.status || c.pipelineStage || "").trim();
      const postulationRows = [
        ["Vacante", escapeHtml(String(c.vacancyTitle || "-"))],
        ["Estado", statusShow ? `<span class="status ${hiringPipelineStatusClass(statusShow)}">${escapeHtml(statusShow)}</span>` : "—"],
        ["Origen", escapeHtml(String(c.source || "Portal"))],
        ["Años de experiencia en el cargo", `${String(parseNum(c.experienceYears || 0))} años`]
      ];
      if (experienceSummary) {
        postulationRows.push(["Experiencia (resumen)", `<p class="detail-note" style="white-space:pre-wrap;margin:0">${escapeHtml(experienceSummary)}</p>`]);
      }
      postulationRows.push(
        ["Aspiración salarial", fmtMoney(salaryShow)],
        ["Disponibilidad", fmtDateOr(availShow)],
        ["Registrado", fmtDateOr(c.createdAt)],
        ["Última actualización", fmtDateOr(c.updatedAt || c.createdAt)]
      );
      const sections = [
        {
          icon: "user",
          pairs: [
            ["Nombre", `<strong>${escapeHtml(String(c.name || ""))}</strong>`],
            ["Documento", `${escapeHtml(String(c.documentType || "-"))} ${escapeHtml(String(c.idDoc || ""))}`],
            ["Fecha de nacimiento", fmtDateOr(ageDisp.birthLabel === "—" ? "" : ageDisp.birthLabel)],
            ["Edad", ageDisp.age != null ? `${String(ageDisp.age)} años` : "—"],
            ["Correo", escapeHtml(String(c.email || "-"))],
            ["Teléfono", escapeHtml(String(c.phone || "-"))],
            ["Ciudad", escapeHtml(String(c.city || "-"))],
            ["Departamento", escapeHtml(String(c.department || "-"))],
            ["Dirección", escapeHtml(String(c.address || "-"))]
          ]
        },
        {
          icon: "briefcase",
          pairs: postulationRows
        },
        {
          icon: "file",
          pairs: [["Adjuntos", `<div class="detail-perms-list">${attachmentsInner}</div>`, { full: true }]]
        }
      ];
      const cvDlModal = extractCandidateCvDownload(c);
      const canDlCvModal = Boolean(cvDlModal?.href) || candidateMayHaveCvInStorage(c);
      const canSchedule = !["Contratado", "Descartado"].includes(String(c.status || ""));
      const employeeMatch = findPayrollEmployeeByIdDoc(c.idDoc);
      const modalActions = [
        `<button type="button" class="btn btn-action"${canDlCvModal ? "" : " disabled"} data-action="download-candidate-cv" data-id="${escapeAttr(String(c.id))}">${IC.download} Descargar CV</button>`,
        canSchedule && canManageHiringModule()
          ? `<button type="button" class="btn btn-action" data-action="schedule-interview-for-candidate" data-candidate-id="${escapeAttr(String(c.id))}">${IC.calendar} Agendar entrevista</button>`
          : "",
        canManageHiringModule()
          ? `<button type="button" class="btn btn-action" data-action="create-employee-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}">${IC.userPlus} Crear empleado</button>`
          : "",
        canManageHiringModule() && employeeMatch
          ? `<button type="button" class="btn btn-primary" data-action="generate-contract-from-candidate" data-candidate-id="${escapeAttr(String(c.id))}">${IC.file} Generar contrato</button>`
          : ""
      ]
        .filter(Boolean)
        .join("");
      openPortalDetailSheet({
        title: String(c.name || "Candidato"),
        sheetTitle: String(c.name || "Candidato"),
        subtitleHtml: `${IC.briefcase} ${escapeHtml(String(c.vacancyTitle || "Sin vacante"))}`,
        statusHtml: statusShow ? `<span class="status ${hiringPipelineStatusClass(statusShow)}">${escapeHtml(statusShow)}</span>` : "",
        moduleIcon: "user",
        moduleTone: "purple",
        sections,
        secondaryActionsHtml: modalActions,
        afterMount: (content) => {
          const cid = String(c.id || "").trim();
          content.querySelector("[data-action='schedule-interview-for-candidate']")?.addEventListener("click", () => {
            if (["Contratado", "Descartado"].includes(String(c.status || ""))) {
              notify("Este candidato ya no está en proceso; no se puede agendar entrevista.", "info");
              return;
            }
            state.hiringUi = { ...(state.hiringUi || {}), scheduleInterviewOpenForCandidateId: cid };
            state.hiringUi.workspace = "operate";
            state.hiringUi.operateSection = "interview";
            state.createPanels = buildHiringCreatePanelsState("interview", state.createPanels || {}, { expandActive: true });
            persistHrWorkspace("hiring", "operate");
            document.getElementById("crud-modal")?.classList.add("hidden");
            renderPortalView();
            requestAnimationFrame(() => {
              requestAnimationFrame(() => scrollToCreatePanelForm("create-interview"));
            });
          });
          content.querySelector("[data-action='create-employee-from-candidate']")?.addEventListener("click", () => {
            if (abortUnlessCanManageHiring()) return;
            document.getElementById("crud-modal")?.classList.add("hidden");
            openPayrollEmployeeFromCandidate(cid);
          });
          content.querySelector("[data-action='generate-contract-from-candidate']")?.addEventListener("click", () => {
            if (abortUnlessCanManageHiring()) return;
            if (!findPayrollEmployeeByIdDoc(c.idDoc)) {
              notify("Registre primero al candidato como empleado antes de generar el contrato.", "error");
              document.getElementById("crud-modal")?.classList.add("hidden");
              openPayrollEmployeeFromCandidate(cid);
              return;
            }
            document.getElementById("crud-modal")?.classList.add("hidden");
            openHiringContractFromCandidate(cid);
          });
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-candidate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanManageHiring()) return;
      const all = read(KEYS.candidates, []);
      const target = all.find((c) => String(c.id) === String(btn.dataset.id || ""));
      if (!target) return;
      const vacancyOpts = [
        { value: "", label: "Seleccione vacante..." },
        ...read(KEYS.vacancies, []).map((v) => ({ value: v.id, label: `${v.title || "Vacante"}${v.positionName ? ` (${v.positionName})` : ""}` }))
      ];
      const docTypeOpts = [
        { value: "", label: "Seleccione..." },
        ...CO_CATALOGS.documentTypes.map((d) => ({ value: d, label: d }))
      ];
      const educationOpts = [
        { value: "", label: "Seleccione..." },
        ...CO_CATALOGS.educationLevel.map((level) => ({ value: level, label: level }))
      ];
      const statusOpts = [...new Set([String(target.status || PIPELINE[0]), ...(PIPELINE_TRANSITIONS[String(target.status || PIPELINE[0])] || [])])].map(
        (s) => ({ value: s, label: s })
      );
      openEditModal({
        title: "Editar candidato",
        subtitle: String(target.name || ""),
        submitText: "Guardar cambios",
        fields: [
          { name: "name", label: "Nombre completo", value: target.name || "", required: true },
          { name: "email", label: "Correo", type: "email", value: target.email || "", required: true },
          { name: "phone", label: "Teléfono", value: target.phone || "" },
          { name: "documentType", label: "Tipo documento", type: "select", value: target.documentType || "CC", options: docTypeOpts, required: true },
          { name: "idDoc", label: "N° documento", value: target.idDoc || "", required: true },
          { name: "birthDate", label: "Fecha de nacimiento", type: "date", value: target.birthDate || "", required: true },
          { name: "city", label: "Ciudad", value: target.city || "" },
          { name: "department", label: "Departamento", value: target.department || "" },
          { name: "address", label: "Dirección", value: target.address || "" },
          { name: "educationLevel", label: "Nivel educativo", type: "select", value: target.educationLevel || "", options: educationOpts },
          { name: "experienceYears", label: "Años de experiencia en el cargo", type: "number", value: parseNum(target.experienceYears || 0), min: 0, max: 65, required: true },
          { name: "expectedSalary", label: "Aspiración salarial", type: "number", value: parseNum(target.expectedSalary || 0) },
          { name: "availabilityDate", label: "Disponibilidad", type: "date", value: target.availabilityDate || "" },
          { name: "vacancyId", label: "Vacante", type: "select", value: target.vacancyId || "", options: vacancyOpts, required: true },
          { name: "status", label: "Estado pipeline", type: "select", value: target.status || PIPELINE[0], options: statusOpts },
          { name: "source", label: "Origen", value: target.source || "Portal RRHH" }
        ],
        afterMount: (formEl) => {
          applyDocumentFieldConstraints(formEl);
          formEl.querySelector("input[name='phone']")?.setAttribute("pattern", "[0-9]{10,15}");
          formEl.querySelector("input[name='phone']")?.setAttribute("minlength", "10");
          formEl.querySelector("input[name='phone']")?.setAttribute("maxlength", "15");
          formEl.querySelector("input[name='phone']")?.setAttribute("inputmode", "tel");
        },
        onSubmit: async (form) => {
          const docValidation = validateColombianDocument(form.documentType, form.idDoc);
          const candidateEditForm = document.getElementById("crud-form");
          if (!docValidation.ok) {
            failPortalField(candidateEditForm, "idDoc", docValidation.message);
            return false;
          }
          const birthCand = String(form.birthDate || "")
            .trim()
            .slice(0, 10);
          const ageCheck = validateWorkerMinimumAge(birthCand, "candidato");
          if (!ageCheck.ok) {
            failPortalField(candidateEditForm, "birthDate", ageCheck.message);
            return false;
          }
          const aspirationCheck = validateColombiaMonthlySalaryCop(form.expectedSalary, "Aspiración salarial");
          if (!aspirationCheck.ok) {
            failPortalField(candidateEditForm, "expectedSalary", aspirationCheck.message);
            return false;
          }
          const expectedSalary = aspirationCheck.amount;
          const vac = read(KEYS.vacancies, []).find((v) => String(v.id) === String(form.vacancyId));
          if (!vac) {
            failPortalField(candidateEditForm, "vacancyId", userMessage("hireSelectVacancy"));
            return false;
          }
          if (
            String(form.vacancyId || "") !== String(target.vacancyId || "") &&
            !isVacancyAcceptingApplications(vac)
          ) {
            failPortalField(candidateEditForm, "vacancyId", "No puede asignar a una vacante cerrada o con fecha límite vencida.");
            return false;
          }
          const offerRef = parseNum(vac.salaryOffer);
          if (offerRef > 0 && expectedSalary < offerRef) {
            failPortalField(
              candidateEditForm,
              "expectedSalary",
              `La aspiración salarial no puede ser inferior al salario ofrecido ($${offerRef.toLocaleString("es-CO")}).`
            );
            return false;
          }
          const nextStatus = String(form.status || target.status || PIPELINE[0]);
          const statusValidation = validateCandidatePipelineTransition(
            { ...target, status: target.status },
            nextStatus
          );
          if (!statusValidation.ok) {
            failPortalField(candidateEditForm, "status", statusValidation.message);
            return false;
          }
          const freshCandidates = read(KEYS.candidates, []);
          const nextCandidates = freshCandidates.map((c) =>
              String(c.id) !== String(target.id)
                ? c
                : stampUpdatedRecord({
                    ...c,
                    name: normalizeLatinUpperForDb(String(form.name || "").trim()),
                    email: normalizeEmail(String(form.email || "").trim()),
                    phone: normalizePortalPhoneForStorage(form.phone),
                    documentType: form.documentType,
                    idDoc: docValidation.normalized,
                    birthDate: birthCand,
                    city: normalizeLatinForDb(String(form.city || "").trim()),
                    department: normalizeLatinForDb(String(form.department || "").trim()),
                    address: normalizeLatinUpperForDb(String(form.address || "").trim()),
                    educationLevel: normalizeLatinUpperForDb(String(form.educationLevel || "").trim()),
                    experienceYears: Math.max(0, parseNum(form.experienceYears || 0)),
                    expectedSalary,
                    availabilityDate: form.availabilityDate || "",
                    vacancyId: vac.id,
                    vacancyTitle: vac.title,
                    status: nextStatus,
                    source: String(form.source || "Portal RRHH")
                  })
            );
          write(KEYS.candidates, nextCandidates, { skipSyncSchedule: true });
          try {
            await writeAwaitServerEdit(KEYS.candidates, nextCandidates, target.id);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar el candidato en el servidor."), "error");
            return false;
          }
          const updatedCandidate = nextCandidates.find((c) => String(c.id) === String(target.id));
          if (updatedCandidate) {
            appendPortalEntityAuditLog(
              "update",
              "hiring",
              "Contratación",
              updatedCandidate,
              `${String(updatedCandidate.status || "En proceso")} · ${String(updatedCandidate.vacancyTitle || "Sin vacante")}`,
              { entityLabel: String(updatedCandidate.name || "Candidato").trim() }
            );
          }
          notify("Candidato actualizado.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-candidate']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const id = String(btn.dataset.id || "");
      const target = read(KEYS.candidates, []).find((c) => String(c.id) === id);
      if (!target) return;
      const linkedInterviews = read(KEYS.interviews, []).filter((i) => String(i.candidateId || "") === id).length;
      openConfirmModal({
        title: "Eliminar candidato",
        message: `Se eliminará al candidato "${String(target.name || "")}" del pipeline${linkedInterviews ? ` y sus ${linkedInterviews} entrevista(s) asociada(s)` : ""}.`,
        confirmText: "Eliminar candidato",
        onConfirm: async () => {
          const interviewIds = read(KEYS.interviews, [])
            .filter((i) => String(i.candidateId || "") === id)
            .map((i) => String(i.id || ""))
            .filter(Boolean);
          const okCandidate = await removeFromPortalListAwaitServer(KEYS.candidates, id);
          if (!okCandidate) return;
          if (interviewIds.length > 0) {
            const prevInterviews = read(KEYS.interviews, []);
            const nextInterviews = prevInterviews.filter((i) => String(i.candidateId || "") !== id);
            const okInterviews = await writePortalListPrunedAwaitServer(
              KEYS.interviews,
              nextInterviews,
              interviewIds,
              { notifyOnFailure: false }
            );
            if (!okInterviews) {
              notify(
                "Candidato eliminado, pero no se pudieron quitar las entrevistas en el servidor. Actualice la página.",
                "error"
              );
              renderPortalView();
              return;
            }
          }
          appendModuleAuditLog({
            action: "delete",
            moduleId: "hiring",
            moduleLabel: "Contratación",
            entityId: id,
            entityLabel: String(target.name || "Candidato").trim(),
            summary: `${String(target.status || "En proceso")}${interviewIds.length ? ` · ${interviewIds.length} entrevista(s)` : ""}`
          });
          notify("Candidato eliminado.", "success");
          renderPortalView();
        }
      });
    });
  });

  /* ============= ENTREVISTA: VER / EDITAR / ELIMINAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-interview']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = read(KEYS.interviews, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!i) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const sections = [
        {
          icon: "calendar",
          pairs: [
            ["Candidato", `<strong>${escapeHtml(String(i.candidateName || "-"))}</strong>`],
            ["Fecha y hora", escapeHtml(formatInterviewWhenDisplay(i.when))],
            ["Entrevistador", escapeHtml(String(i.interviewer || "-"))],
            ["Modalidad", escapeHtml(String(i.modality || "-"))],
            ["Lugar / enlace", escapeHtml(String(i.locationOrLink || "-"))]
          ]
        }
      ];
      openPortalDetailSheet({
        title: `Entrevista · ${String(i.candidateName || "")}`,
        sheetTitle: `Entrevista · ${String(i.candidateName || "")}`,
        subtitleHtml: `${IC.calendar} ${escapeHtml(formatInterviewWhenDisplay(i.when))}`,
        moduleIcon: "calendar",
        moduleTone: "blue",
        sections,
        notesHtml: i.notes ? String(i.notes) : ""
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='edit-interview']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortUnlessCanManageHiring()) return;
      const all = read(KEYS.interviews, []);
      const target = normalizeInterviewRowForEditor(all.find((i) => String(i.id) === String(btn.dataset.id || "")));
      if (!target) return;
      openEditModal({
        title: "Editar entrevista",
        subtitle: String(target.candidateName || ""),
        submitText: "Guardar cambios",
        fields: [
          { name: "when", label: "Fecha y hora", type: "datetime-local", value: target.whenLocal || "", required: true },
          { name: "interviewer", label: "Entrevistador(a)", value: target.interviewer || "", required: true },
          {
            name: "modality",
            label: "Modalidad",
            type: "select",
            value: target.modality || "Presencial",
            options: [
              { value: "Presencial", label: "Presencial" },
              { value: "Virtual", label: "Virtual" },
              { value: "Telefónica", label: "Telefónica" }
            ]
          },
          { name: "locationOrLink", label: "Lugar o enlace", value: target.locationOrLink || "" },
          { name: "notes", label: "Notas", type: "textarea", value: target.notes || "", rows: 3 }
        ],
        onSubmit: async (form) => {
          const ts = new Date(String(form.when || "")).getTime();
          const interviewEditForm = document.getElementById("crud-form");
          if (!Number.isFinite(ts)) {
            failPortalField(interviewEditForm, "when", "Fecha y hora inválidas.");
            return false;
          }
          const freshInterviews = read(KEYS.interviews, []);
          const nextInterviews = freshInterviews.map((i) =>
              String(i.id) !== String(target.id)
                ? i
                : stampUpdatedRecord({
                    ...i,
                    when: form.when,
                    interviewer: normalizeLatinUpperForDb(String(form.interviewer || "").trim()),
                    modality: String(form.modality || ""),
                    locationOrLink: normalizeLatinUpperForDb(String(form.locationOrLink || "").trim()),
                    notes: normalizeLatinUpperForDb(String(form.notes || "").trim())
                  })
            );
          write(KEYS.interviews, nextInterviews, { skipSyncSchedule: true });
          try {
            await writeAwaitServerEdit(KEYS.interviews, nextInterviews, target.id);
          } catch (err) {
            notify(String(err?.message || "No fue posible guardar la entrevista en el servidor."), "error");
            return false;
          }
          const updatedInterview = nextInterviews.find((i) => String(i.id) === String(target.id));
          if (updatedInterview) {
            appendPortalEntityAuditLog(
              "update",
              "hiring",
              "Contratación",
              updatedInterview,
              `${String(updatedInterview.modality || "Presencial")} · ${formatInterviewWhenDisplay(updatedInterview.when)}`,
              { entityLabel: String(updatedInterview.candidateName || "Entrevista").trim() }
            );
          }
          notify("Entrevista actualizada.", "success");
          renderPortalView();
          return true;
        }
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-interview']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const id = String(btn.dataset.id || "");
      const target = read(KEYS.interviews, []).find((i) => String(i.id) === id);
      if (!target) return;
      openConfirmModal({
        title: "Eliminar entrevista",
        message: `Se eliminará la entrevista de "${String(target.candidateName || "")}".`,
        confirmText: "Eliminar entrevista",
        onConfirm: async () => {
          const ok = await removeFromPortalListAwaitServer(KEYS.interviews, id);
          if (!ok) return;
          appendModuleAuditLog({
            action: "delete",
            moduleId: "hiring",
            moduleLabel: "Contratación",
            entityId: id,
            entityLabel: String(target.candidateName || "Entrevista").trim(),
            summary: `${String(target.modality || "Presencial")} · ${String(target.when || "—")}`
          });
          notify("Entrevista eliminada.", "success");
          renderPortalView();
        }
      });
    });
  });

  /* ============= CONTRATO: VER (DETALLE) / ELIMINAR ============= */
  nodes.viewRoot.querySelectorAll("[data-action='view-contract-detail']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = read(KEYS.contracts, []).find((x) => String(x.id) === String(btn.dataset.id || ""));
      if (!c) {
        notify(userMessage("genericError"), "error");
        return;
      }
      const employee = c.employeeId
        ? read(KEYS.payrollEmployees, []).find((e) => String(e.id) === String(c.employeeId))
        : null;
      const sections = [
        {
          icon: "user",
          pairs: [
            ["Nombre", `<strong>${escapeHtml(String(c.candidateName || c.employeeName || employee?.name || "-"))}</strong>`],
            ["Documento", escapeHtml(String(c.idDocSnapshot || employee?.idDoc || "-"))],
            ["Cargo", escapeHtml(String(c.position || c.positionName || employee?.position || "-"))],
            ["Origen", escapeHtml(String(c.source || c.sourceTag || (c.employeeId ? "Empleado" : "Candidato")))]
          ]
        },
        {
          icon: "file",
          pairs: [
            ["Tipo", escapeHtml(String(c.contractType || "-"))],
            ["Plantilla", escapeHtml(String(c.contractTemplateKind || c.templateKind || "-"))],
            ["Salario", fmtMoney(c.salary)],
            ["Inicio", fmtDateOr(c.startDate)],
            ["Fin", fmtDateOr(c.endDate)],
            ["Generado", fmtDateOr(c.createdAt)]
          ]
        }
      ];
      openPortalDetailSheet({
        title: `Contrato · ${String(c.candidateName || c.employeeName || "")}`,
        sheetTitle: `Contrato · ${String(c.candidateName || c.employeeName || "")}`,
        subtitleHtml: `${IC.file} ${escapeHtml(String(c.position || ""))}`,
        moduleIcon: "file",
        moduleTone: "teal",
        sections,
        notesHtml: c.content ? String(c.content) : ""
      });
    });
  });

  nodes.viewRoot.querySelectorAll("[data-action='delete-contract']").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (abortIfNotAdmin()) return;
      const id = String(btn.dataset.id || "");
      const target = read(KEYS.contracts, []).find((c) => String(c.id) === id);
      if (!target) return;
      openConfirmModal({
        title: "Eliminar contrato",
        message: `Se eliminará el registro del contrato de "${String(target.candidateName || target.employeeName || "")}". El archivo Word ya descargado no se borrará automáticamente.`,
        confirmText: "Eliminar contrato",
        onConfirm: async () => {
          const ok = await removeFromPortalListAwaitServer(KEYS.contracts, id);
          if (!ok) return;
          appendModuleAuditLog({
            action: "delete",
            moduleId: "hiring",
            moduleLabel: "Contratación",
            entityId: id,
            entityLabel: String(target.candidateName || target.employeeName || "Contrato").trim(),
            summary: `${String(target.position || target.positionName || "Sin cargo")} · ${String(target.contractType || "Contrato")}`
          });
          notify("Contrato eliminado.", "success");
          renderPortalView();
        }
      });
    });
  });

  const hiringSearchRestore = state.__hiringDataListSearchRestore;
  if (hiringSearchRestore && typeof hiringSearchRestore.start === "number") {
    delete state.__hiringDataListSearchRestore;
    queueMicrotask(() => {
      const root = nodes.viewRoot;
      if (!root || String(state.currentView || "") !== "hiring") return;
      const inp = root.querySelector("[data-action='hiring-data-list-search']");
      if (!inp || typeof inp.focus !== "function") return;
      inp.focus();
      if (typeof inp.setSelectionRange === "function") {
        const n = String(inp.value || "").length;
        const s = Math.max(0, Math.min(hiringSearchRestore.start, n));
        const e = Math.max(0, Math.min(hiringSearchRestore.end ?? hiringSearchRestore.start, n));
        inp.setSelectionRange(s, e);
      }
    });
  }
}
(function registerHiringPortalBinds() {
  "use strict";
  window.__portalModuleAfterRender = window.__portalModuleAfterRender || {};
  window.__portalModuleAfterRender.hiring = bindHiringPortalControls;
})();
