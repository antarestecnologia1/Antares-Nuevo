/**
 * Transporte · Camiones — HTML del formulario de alta (`vehicleCreateFormBodyHtml`).
 * Listeners en `modules/app/camiones.js`.
 */
(function registerVehiclesHtmlModule() {
  if (!window.AppModules) window.AppModules = {};
  if (!window.AppModules.vehicles) window.AppModules.vehicles = {};

  function vehicleWizardTip(title, text) {
    return `<aside class="payroll-wizard-tip vehicles-wizard-tip">
      <span class="payroll-wizard-tip__icon" aria-hidden="true">${IC.alertTriangle}</span>
      <div class="payroll-wizard-tip__copy">
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(text)}</p>
      </div>
    </aside>`;
  }

  /** Cuerpo del formulario de nuevo vehículo (sin envoltorio de pantalla). */
  function vehicleCreateFormBodyHtml(opts = {}) {
    const bodyTypeOptions = String(opts.bodyTypeOptions || "");
    const fuelTypeOptions = String(opts.fuelTypeOptions || "");
    const axleOptions = String(opts.axleOptions || "");
    const colorOptions = String(opts.colorOptions || "");
    const currentYear = Number(opts.currentYear) || new Date().getFullYear();
    return `<form id="form-vehicle" class="p-form p-form-colored hr-form-flow antares-create-form vehicles-create-form" autocomplete="off" novalidate lang="es">
    <div class="hr-form-wizard payroll-wizard vehicles-wizard" data-hr-wizard="vehicle" aria-label="Registro de vehículo por pasos">
      <header class="payroll-wizard__head vehicles-wizard__head">
        <div class="payroll-wizard__head-copy">
          <span class="payroll-wizard__eyebrow">Flota de transporte</span>
          <h3 class="payroll-wizard__title">Ficha técnica del vehículo</h3>
          <p class="payroll-wizard__desc">Complete identificación, características, documentación legal y equipos de trazabilidad. El vehículo quedará disponible para asignación operativa.</p>
        </div>
        <div class="payroll-wizard__progress hr-form-wizard-meta">
          <span class="hr-wizard-progress-label" data-hr-wizard-progress>Paso 1 de 4</span>
          <div class="hr-wizard-progress-track" aria-hidden="true"><span class="hr-wizard-progress-fill" data-hr-wizard-progress-fill style="width:25%"></span></div>
          <span class="payroll-wizard__progress-pct" data-hr-wizard-progress-pct>25% completado</span>
        </div>
      </header>
      <div class="payroll-wizard__layout">
        <nav class="payroll-wizard__steps hr-form-wizard-dots" role="tablist" aria-label="Secciones del formulario">
          <button type="button" class="hr-form-wizard-dot is-active" data-hr-wizard-dot="0" aria-label="Paso 1: identificación"><span class="hr-dot-num">1</span><span><small>Identificación</small><span class="payroll-wizard__step-hint">Placa y datos base</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="1" aria-label="Paso 2: características"><span class="hr-dot-num">2</span><span><small>Características</small><span class="payroll-wizard__step-hint">Carga y motor</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="2" aria-label="Paso 3: documentación"><span class="hr-dot-num">3</span><span><small>Documentación</small><span class="payroll-wizard__step-hint">SOAT y tecnomecánica</span></span></button>
          <button type="button" class="hr-form-wizard-dot" data-hr-wizard-dot="3" aria-label="Paso 4: trazabilidad"><span class="hr-dot-num">4</span><span><small>Trazabilidad</small><span class="payroll-wizard__step-hint">GPS y satélite</span></span></button>
        </nav>
        <div class="payroll-wizard__panels">

      <div class="hr-form-step is-active" data-step-index="0">
        <div class="payroll-wizard__section">
          <h4 class="payroll-wizard__section-title">${IC.truck} Identificación del vehículo</h4>
          <p class="muted form-section-hint">Datos de placa, marca y clasificación para el catálogo de flota.</p>
          <div class="form-section-grid payroll-wizard__section-grid">
            <div class="full vehicles-wizard-tip-row">
              ${vehicleWizardTip(
                "Formato de placa Colombia",
                "Use el formato estándar de 3 letras y 3 números (ej.: ABC123). La placa se guardará en mayúsculas y debe ser única en la flota."
              )}
            </div>
            <label>${fieldLabel(IC.truck, "Placa", { required: true })}<input name="plate" required placeholder="ABC123" data-antares-restrict="alnum-doc" maxlength="6" /></label>
            <label>${fieldLabel(IC.briefcase, "Marca", { required: true })}<input name="brand" required placeholder="Ej.: Kenworth, Chevrolet, Hino" /></label>
            <label>${fieldLabel(IC.grid, "Línea / Modelo", { required: true })}<input name="model" required placeholder="Ej.: T800, NPR" /></label>
            <label>${fieldLabel(IC.calendar, "Año modelo", { required: true })}<input type="number" min="1990" max="2100" name="year" required placeholder="Ej.: ${currentYear}" /></label>
            <label>${fieldLabel(IC.palette, "Color", { required: true })}<select name="color" required>${colorOptions}</select></label>
            <label>${fieldLabel(IC.truck, "Tipo", { required: true })}<select name="type" required><option value="">Seleccione...</option><option>Camion</option><option>Turbo</option><option>Tractomula</option><option>Bus</option></select></label>
          </div>
        </div>
      </div>

      <div class="hr-form-step hidden" data-step-index="1">
        <fieldset class="form-section form-section-violet full">
          <legend>${IC.layers} Características del vehículo</legend>
          <p class="muted form-section-hint">Capacidad de carga, refrigeración y configuración mecánica.</p>
          <div class="form-section-grid">
            <label>${fieldLabel(IC.package, "Tipo de carrocería", { required: true })}<select name="bodyType" required>${bodyTypeOptions}</select></label>
            <label>${fieldLabel(IC.activity, "Termoking (refrigerado)", { required: true })}<select name="refrigerated" required><option value="true">Sí, equipo Termoking</option><option value="false">No, carga seca</option></select></label>
            <label>${fieldLabel(IC.scale, "Capacidad (kg)", { required: true })}<input type="number" min="1" name="capacityKg" required placeholder="Ej.: 18000" /></label>
            <label>${fieldLabel(IC.fuel, "Tipo de combustible", { required: true })}<select name="fuelType" required>${fuelTypeOptions}</select></label>
            <label>${fieldLabel(IC.layers, "Configuración de ejes", { required: true })}<select name="axleConfig" required>${axleOptions}</select></label>
            <label>${fieldLabel(IC.hash, "Número de motor", { required: true })}<input name="engineNumber" required placeholder="Ej.: 6BT5.9" /></label>
            <label class="full">${fieldLabel(IC.hash, "Número de chasis (VIN)", { required: true })}<input name="vin" required maxlength="17" minlength="11" placeholder="17 caracteres alfanuméricos" style="text-transform:uppercase" data-antares-restrict="alnum-doc" /></label>
          </div>
        </fieldset>
      </div>

      <div class="hr-form-step hidden" data-step-index="2">
        <fieldset class="form-section form-section-amber full">
          <legend>${IC.shield} Documentación legal vigente (Colombia)</legend>
          <p class="muted form-section-hint">SOAT, revisión tecnomecánica y pólizas de responsabilidad civil. Si indica solo la fecha de expedición, el vencimiento se calcula a un año.</p>
          <div class="form-section-grid">
            <label>${fieldLabel(IC.card, "Tarjeta de propiedad N°", { required: true })}<input name="ownershipCard" required placeholder="Ej.: 12345678" /></label>
            <label>${fieldLabel(IC.calendar, "Expedición SOAT", { required: true })}<input type="date" name="soatExpeditionDate" required /></label>
            <label>${fieldLabel(IC.calendar, "Vence SOAT", { required: true })}<input type="date" name="soatExpiryDate" required /></label>
            <label>${fieldLabel(IC.calendar, "Expedición tecnomecánica", { required: true })}<input type="date" name="techInspectionExpeditionDate" required /></label>
            <label>${fieldLabel(IC.calendar, "Vence tecnomecánica", { required: true })}<input type="date" name="techInspectionExpiryDate" required /></label>
            <label>${fieldLabel(IC.shield, "Póliza RC contractual N°")}<input name="rcPolicyContract" placeholder="Ej.: 0123456" /></label>
            <label>${fieldLabel(IC.shield, "Póliza RC extracontractual N°")}<input name="rcPolicyExtra" placeholder="Ej.: 0654321" /></label>
            <label>${fieldLabel(IC.calendar, "Vence pólizas RCP")}<input type="date" name="rcPolicyExpiry" /></label>
          </div>
        </fieldset>
      </div>

      <div class="hr-form-step hidden" data-step-index="3">
        <fieldset class="form-section form-section-emerald full">
          <legend>${IC.satellite} Equipos y trazabilidad</legend>
          <p class="muted form-section-hint">GPS satelital y credenciales del proveedor para seguimiento en ruta (opcional).</p>
          <div class="form-section-grid">
            <label>${fieldLabel(IC.satellite, "GPS satelital")}<select name="hasGps"><option value="true">Sí, GPS activo</option><option value="false">Sin GPS</option></select></label>
            <label>${fieldLabel(IC.briefcase, "Proveedor GPS")}<input name="gpsProvider" placeholder="Ej.: Detektor, Skyangel, Geolocator" /></label>
            <label>${fieldLabel(IC.user, "Usuario proveedor satélite")}<input type="text" name="satelliteProviderUser" placeholder="Usuario en el portal del GPS" autocomplete="off" /></label>
            <label>${fieldLabel(IC.lock, "Contraseña proveedor satélite")}<input type="password" name="satelliteProviderPassword" placeholder="Contraseña en el portal del GPS" autocomplete="new-password" /></label>
          </div>
        </fieldset>
      </div>

        </div>
      </div>
      ${renderHrFormWizardFooter(
        "create-vehicle",
        `<button class="btn btn-primary hr-form-wizard-submit antares-create-form__submit" type="submit" disabled aria-disabled="true">${IC.plus} Registrar vehículo</button>`,
        { hint: "Avance hasta el paso de trazabilidad para habilitar el registro." }
      )}
    </div>
  </form>`;
  }

  window.AppModules.vehicles.vehicleCreateFormBodyHtml = vehicleCreateFormBodyHtml;
})();
