# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: trips-module-smoke.spec.mjs >> transport trips flow smoke
- Location: qa\trips-module-smoke.spec.mjs:199:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.selectOption: Test timeout of 120000ms exceeded.
Call log:
  - waiting for locator('#form-create-trip select[name="vehicleId"]')
    - locator resolved to <select name="vehicleId" data-searchable-select="1" data-searchable-mounted="1" id="create-trip-vehicle-select" data-searchable-placeholder="Placa, tipo o capacidad…" class="create-trip-resource-select searchable-select-native">…</select>
  - attempting select option action
    2 × waiting for element to be visible and enabled
      - element is not visible
    - retrying select option action
    - waiting 20ms
    2 × waiting for element to be visible and enabled
      - element is not visible
    - retrying select option action
      - waiting 100ms
    195 × waiting for element to be visible and enabled
        - element is not visible
      - retrying select option action
        - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - text: “ “ “
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e7]: A
        - generic [ref=e8]:
          - heading "Admin QA" [level=2] [ref=e9]
          - paragraph [ref=e10]: Administrador
      - paragraph [ref=e11]: General
      - button "Dashboard" [ref=e12] [cursor=pointer]:
        - img [ref=e13]
        - text: Dashboard
      - button "Mis solicitudes" [ref=e18] [cursor=pointer]:
        - img [ref=e19]
        - text: Mis solicitudes
      - paragraph [ref=e22]: Transporte
      - button "Viajes" [ref=e23] [cursor=pointer]:
        - img [ref=e24]
        - text: Viajes
      - button "Camiones" [ref=e27] [cursor=pointer]:
        - img [ref=e28]
        - text: Camiones
      - button "Conductores" [ref=e33] [cursor=pointer]:
        - img [ref=e34]
        - text: Conductores
      - button "Calendario" [ref=e39] [cursor=pointer]:
        - img [ref=e40]
        - text: Calendario
      - button "Historial" [ref=e42] [cursor=pointer]:
        - img [ref=e43]
        - text: Historial
      - button "Reportería" [ref=e46] [cursor=pointer]:
        - img [ref=e47]
        - text: Reportería
      - paragraph [ref=e52]: Recursos humanos
      - button "Gestión humana" [ref=e53] [cursor=pointer]:
        - img [ref=e54]
        - text: Gestión humana
      - button "Contratación" [ref=e56] [cursor=pointer]:
        - img [ref=e57]
        - text: Contratación
      - button "Cumplimiento laboral y SST" [ref=e60] [cursor=pointer]:
        - img [ref=e61]
        - text: Cumplimiento laboral y SST
      - button "Contacto web (B2B)" [ref=e64] [cursor=pointer]:
        - img [ref=e65]
        - text: Contacto web (B2B)
      - paragraph [ref=e68]: Sistema
      - button "Usuarios y permisos" [ref=e69] [cursor=pointer]:
        - img [ref=e70]
        - text: Usuarios y permisos
      - button "Autorizaciones" [ref=e72] [cursor=pointer]:
        - img [ref=e73]
        - text: Autorizaciones
      - paragraph [ref=e76]: Mi cuenta
      - button "Mi perfil" [ref=e77] [cursor=pointer]:
        - img [ref=e78]
        - text: Mi perfil
      - button "«Timbre» controla el audio; «Avisos» controla ventanas emergentes y notificaciones nuevas del servidor. Notificaciones" [ref=e81] [cursor=pointer]:
        - generic "«Timbre» controla el audio; «Avisos» controla ventanas emergentes y notificaciones nuevas del servidor." [ref=e82]:
          - img [ref=e84]
          - generic [ref=e87]:
            - generic "Clic para silenciar solo el timbre (la bandeja y los avisos en pantalla siguen igual)" [ref=e88]: Timbre
            - generic "Clic para pausar avisos emergentes y dejar de recibir notificaciones nuevas en el servidor" [ref=e89]: Avisos
        - text: Notificaciones
      - generic [ref=e90]:
        - button "Cerrar sesión" [ref=e91] [cursor=pointer]:
          - img [ref=e92]
          - text: Cerrar sesión
        - generic [ref=e95]:
          - paragraph [ref=e96]: Tema
          - group "Tema portal" [ref=e97]:
            - button "Modo claro" [ref=e98] [cursor=pointer]: ☀️
            - button "Modo oscuro" [ref=e99] [cursor=pointer]: 🌙
    - main [ref=e100]:
      - heading "Transporte · Viajes" [level=1] [ref=e103]
      - generic [ref=e107]:
        - generic [ref=e108]:
          - generic [ref=e110]:
            - generic [ref=e111]:
              - generic [ref=e112]: Viajes
              - strong [ref=e113]: "1"
            - generic [ref=e114]:
              - generic [ref=e115]: Activos
              - strong [ref=e116]: "1"
            - generic [ref=e117]:
              - generic [ref=e118]: Hoy
              - strong [ref=e119]: "0"
            - generic [ref=e120]:
              - generic [ref=e121]: Por asignar
              - strong [ref=e122]: "1"
            - generic [ref=e123]:
              - generic [ref=e124]: Trayectos
              - strong [ref=e125]: "0"
          - tablist "Secciones del módulo Transporte · Viajes" [ref=e127]:
            - tab "Registrar" [selected] [ref=e128] [cursor=pointer]:
              - img [ref=e130]
              - generic [ref=e132]: Registrar
            - tab "Consultar" [ref=e133] [cursor=pointer]:
              - img [ref=e135]
              - generic [ref=e139]: Consultar
        - tabpanel [ref=e141]:
          - generic [ref=e142]:
            - complementary "Flujos de registro" [ref=e143]:
              - generic [ref=e144]: Registrar
              - tablist "Flujos de registro de transporte" [ref=e146]:
                - tab "Asignar viaje" [selected] [ref=e147] [cursor=pointer]
                - tab "Trayecto y tarifa" [ref=e148] [cursor=pointer]
            - article [ref=e151]:
              - generic [ref=e152]:
                - generic [ref=e153]:
                  - img [ref=e155]
                  - heading "Asignar viaje" [level=2] [ref=e161]
                - generic [ref=e162]: 1 disponible · 3 pasos
              - generic "Asignar viaje por pasos" [ref=e166]:
                - generic [ref=e167]:
                  - generic [ref=e168]:
                    - generic [ref=e169]: Operación de transporte
                    - heading "Asignar viaje" [level=3] [ref=e170]
                    - paragraph [ref=e171]: Seleccione la solicitud, asigne vehículo y conductor, y confirme la tarifa pactada para crear el viaje.
                  - generic [ref=e172]:
                    - generic [ref=e173]: 1 disponible
                    - generic [ref=e177]: Paso 1 de 3
                - generic [ref=e178]:
                  - tablist "Secciones del formulario" [ref=e179]:
                    - 'button "Paso 1: solicitud" [ref=e180] [cursor=pointer]':
                      - generic [ref=e181]: "1"
                      - generic [ref=e182]:
                        - generic [ref=e183]: Solicitud
                        - generic [ref=e184]: Pendiente o aprobada
                    - 'button "Paso 2: recursos" [ref=e185] [cursor=pointer]':
                      - generic [ref=e186]: "2"
                      - generic [ref=e187]:
                        - generic [ref=e188]: Recursos
                        - generic [ref=e189]: Camión y conductor
                    - 'button "Paso 3: tarifa" [ref=e190] [cursor=pointer]':
                      - generic [ref=e191]: "3"
                      - generic [ref=e192]:
                        - generic [ref=e193]: Tarifa
                        - generic [ref=e194]: Precio del viaje
                  - group "Solicitud de transporte" [ref=e196]:
                    - generic [ref=e197]:
                      - img [ref=e198]
                      - text: Solicitud de transporte
                    - generic [ref=e201]:
                      - generic [ref=e202]:
                        - generic [ref=e203]:
                          - img [ref=e204]
                          - generic [ref=e207]: Solicitud
                          - generic [ref=e208]: "*"
                        - combobox "Solicitud" [ref=e209]:
                          - option "Seleccione…"
                          - option "SOL-002 · Pendiente · Flores del Valle · Bogota D.C. → Medellin" [selected]
                          - option "SOL-002 · Pendiente · Flores del Valle · Bogota D.C. → Medellin"
                      - generic [ref=e211]:
                        - generic [ref=e212]:
                          - paragraph [ref=e213]:
                            - img [ref=e214]
                            - generic [ref=e217]: Bogota, Bogota D.C. → Antioquia, Medellin
                          - generic [ref=e218]:
                            - generic "Carga seca" [ref=e219]: Seco
                            - generic "Fecha de recogida asignable" [ref=e220]: OK
                        - generic [ref=e221]:
                          - generic [ref=e222]:
                            - term [ref=e223]: Cliente
                            - definition [ref=e224]: Flores del Valle
                          - generic [ref=e225]:
                            - term [ref=e226]: Solicita
                            - definition [ref=e227]: Cliente Demo
                          - generic [ref=e228]:
                            - term [ref=e229]: Camión
                            - definition [ref=e230]: Camión · 0 fuelle(s)
                          - generic [ref=e231]:
                            - term [ref=e232]: Recogida
                            - definition [ref=e233]: 20/6/2026, 6:00:00 a. m.
                          - generic [ref=e234]:
                            - term [ref=e235]: Carga
                            - definition [ref=e236]: Carga general
                - generic [ref=e237]:
                  - generic [ref=e238]:
                    - group "Navegación entre pasos" [ref=e239]:
                      - button "Anterior" [disabled] [ref=e240]:
                        - generic [ref=e241]:
                          - img [ref=e242]
                          - generic [ref=e244]: Anterior
                      - button "Siguiente" [ref=e245] [cursor=pointer]:
                        - generic [ref=e246]:
                          - img [ref=e247]
                          - generic [ref=e249]: Siguiente
                    - paragraph [ref=e250]: Avance hasta el último paso para habilitar guardar.
                  - generic [ref=e252]:
                    - generic [ref=e253]:
                      - button "Minimizar" [expanded] [ref=e254] [cursor=pointer]:
                        - generic [ref=e255]:
                          - img [ref=e256]
                          - generic [ref=e258]: Minimizar
                      - button "Cancelar" [ref=e259] [cursor=pointer]:
                        - generic [ref=e260]:
                          - img [ref=e261]
                          - generic [ref=e264]: Cancelar
                    - button "Crear viaje" [disabled] [ref=e265]:
                      - img
                      - text: Crear viaje
```

# Test source

```ts
  163 |       requiredTruckType: "Camión",
  164 |       tripValue: 1200000,
  165 |       siteContactName: "Cliente 3",
  166 |       siteContactPhone: "3001234569",
  167 |       notes: "Ya asignada",
  168 |       status: "Viaje asignado",
  169 |       trip: {
  170 |         tripNumber: "VIA-001",
  171 |         vehicleId: "veh-1",
  172 |         vehiclePlate: "ABC123",
  173 |         vehicleType: "Camion",
  174 |         driverId: "drv-1",
  175 |         driverName: "Jairo Ruta",
  176 |         driverPhone: "3006667788",
  177 |         etaPickup: `${ymd(nextWeek)}T13:00:00.000Z`,
  178 |         etaDelivery: `${ymd(nextWeek2)}T16:00:00.000Z`,
  179 |         route: "Bogota D.C. - Medellin"
  180 |       },
  181 |       createdAt: now.toISOString()
  182 |     }
  183 |   ],
  184 |   [KEYS.tripRouteRates]: {},
  185 |   [KEYS.session]: {
  186 |     userId: "admin-1",
  187 |     role: "admin",
  188 |     email: "admin.qa@antares.test",
  189 |     lastActivityAt: Date.now(),
  190 |     profileSnapshot: {
  191 |       id: "admin-1",
  192 |       name: "Admin QA",
  193 |       email: "admin.qa@antares.test",
  194 |       role: "admin"
  195 |     }
  196 |   }
  197 | };
  198 | 
  199 | test("transport trips flow smoke", async ({ page, context }) => {
  200 |   await context.addInitScript((payload) => {
  201 |     const rawKeys = new Set(["antares_portal_data_ver", "antares_users_storage_ver"]);
  202 |     localStorage.clear();
  203 |     Object.entries(payload).forEach(([key, value]) => {
  204 |       localStorage.setItem(key, rawKeys.has(key) ? String(value) : JSON.stringify(value));
  205 |     });
  206 |   }, seedStore);
  207 | 
  208 |   const latestToastText = () =>
  209 |     page.evaluate(() => {
  210 |       const items = [...document.querySelectorAll("#toast-container .toast")]
  211 |         .map((node) => String(node.textContent || "").trim())
  212 |         .filter(Boolean);
  213 |       return items.at(-1) || "";
  214 |     });
  215 | 
  216 |   const waitForStore = async (pageFn, arg, label) => {
  217 |     try {
  218 |       await page.waitForFunction(pageFn, arg, { timeout: 10000 });
  219 |     } catch (_error) {
  220 |       const toast = await latestToastText();
  221 |       throw new Error(`${label || "Condición no cumplida"}. Toast: ${toast || "sin toast"}`);
  222 |     }
  223 |   };
  224 | 
  225 |   const gotoView = async (view) => {
  226 |     await page.evaluate((v) => {
  227 |       window.location.hash = `#portal/${v}`;
  228 |       window.dispatchEvent(new HashChangeEvent("hashchange"));
  229 |     }, view);
  230 |     await page.waitForTimeout(450);
  231 |   };
  232 | 
  233 |   const clickDom = async (selector) => {
  234 |     await page.waitForSelector(selector, { state: "attached", timeout: 5000 });
  235 |     await page.evaluate((targetSelector) => {
  236 |       const el = document.querySelector(targetSelector);
  237 |       if (!el) throw new Error(`No se encontró ${targetSelector}`);
  238 |       el.click();
  239 |     }, selector);
  240 |   };
  241 | 
  242 |   const ensureCreatePanelOpen = async (panelId) => {
  243 |     await page.waitForSelector(`[data-action='toggle-create-panel'][data-panel='${panelId}']`, { state: "attached", timeout: 5000 });
  244 |     const isHidden = await page.evaluate((id) => {
  245 |       const panel = document.querySelector(`[data-create-panel="${id}"]`);
  246 |       return !panel || panel.classList.contains("hidden") || panel.hasAttribute("hidden");
  247 |     }, panelId);
  248 |     if (isHidden) await clickDom(`[data-action='toggle-create-panel'][data-panel='${panelId}']`);
  249 |   };
  250 | 
  251 |   await page.goto(BASE_URL, { waitUntil: "networkidle" });
  252 |   await page.waitForSelector("#portal-app", { timeout: 10000 });
  253 | 
  254 |   await gotoView("transport-trips");
  255 |   await ensureCreatePanelOpen("create-trip");
  256 |   await page.locator('#form-create-trip select[name="requestId"]').selectOption("req-trip-create");
  257 |   await page.waitForFunction(() => {
  258 |     const vehicleOptions = [...document.querySelectorAll('#form-create-trip select[name="vehicleId"] option')];
  259 |     const driverOptions = [...document.querySelectorAll('#form-create-trip select[name="driverId"] option')];
  260 |     return vehicleOptions.some((opt) => opt.value === "veh-1" && !opt.disabled)
  261 |       && driverOptions.some((opt) => opt.value === "drv-1" && !opt.disabled);
  262 |   }, { timeout: 10000 });
> 263 |   await page.locator('#form-create-trip select[name="vehicleId"]').selectOption("veh-1");
      |                                                                    ^ Error: locator.selectOption: Test timeout of 120000ms exceeded.
  264 |   await page.locator('#form-create-trip select[name="driverId"]').selectOption("drv-1");
  265 |   await page.locator('#form-create-trip input[name="tripValue"]').fill("1450000");
  266 |   await page.locator('#form-create-trip button[type="submit"]').click();
  267 |   await waitForStore(
  268 |     (key) => {
  269 |       const rows = window.AntaresPersistence?.read
  270 |         ? window.AntaresPersistence.read(key, [])
  271 |         : JSON.parse(localStorage.getItem(key) || "[]");
  272 |       return rows.some((row) => row.id === "req-trip-create" && row.trip && String(row.trip.driverId || "") === "drv-1");
  273 |     },
  274 |     KEYS.requests,
  275 |     "Viajes:create"
  276 |   );
  277 | 
  278 |   await clickDom("[data-action='edit-trip'][data-id='req-trip-edit']");
  279 |   await page.waitForSelector("#crud-form", { state: "attached", timeout: 5000 });
  280 |   await page.locator('#crud-form input[name="tripValue"]').fill("1550000");
  281 |   await page.locator('#crud-form textarea[name="tripNotes"]').fill("Ajuste QA");
  282 |   await page.locator('#crud-form button[type="submit"]').click();
  283 |   await waitForStore(
  284 |     (key) => {
  285 |       const rows = window.AntaresPersistence?.read
  286 |         ? window.AntaresPersistence.read(key, [])
  287 |         : JSON.parse(localStorage.getItem(key) || "[]");
  288 |       return rows.some((row) => row.id === "req-trip-edit" && Number(row.tripValue) === 1550000);
  289 |     },
  290 |     KEYS.requests,
  291 |     "Viajes:edit"
  292 |   );
  293 | 
  294 |   const storedRequests = await page.evaluate((key) => {
  295 |     return window.AntaresPersistence?.read
  296 |       ? window.AntaresPersistence.read(key, [])
  297 |       : JSON.parse(localStorage.getItem(key) || "[]");
  298 |   }, KEYS.requests);
  299 |   expect(storedRequests.find((row) => row.id === "req-trip-create")?.trip?.vehicleId).toBe("veh-1");
  300 |   expect(storedRequests.find((row) => row.id === "req-trip-edit")?.tripValue).toBe(1550000);
  301 | });
  302 | 
```