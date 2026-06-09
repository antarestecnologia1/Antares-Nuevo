# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: hiring-module-validation.spec.mjs >> validate hiring module fields
- Location: qa\hiring-module-validation.spec.mjs:213:1

# Error details

```
Error: [
  {
    "name": "Contratación:create position persists every field",
    "ok": true
  },
  {
    "name": "Contratación:edit position updates modal fields",
    "ok": false,
    "error": "edit position. Toast: sin toast"
  },
  {
    "name": "Contratación:create vacancy persists every field",
    "ok": true
  },
  {
    "name": "Contratación:edit vacancy updates modal fields",
    "ok": false,
    "error": "edit vacancy. Toast: sin toast"
  },
  {
    "name": "Contratación:create candidate persists wizard fields",
    "ok": true
  },
  {
    "name": "Contratación:edit candidate updates modal fields",
    "ok": false,
    "error": "edit candidate. Toast: sin toast"
  },
  {
    "name": "Contratación:create interview persists fields and moves pipeline",
    "ok": false,
    "error": "create interview. Toast: sin toast"
  },
  {
    "name": "Contratación:edit interview updates modal fields",
    "ok": false,
    "error": "edit interview. Toast: sin toast"
  },
  {
    "name": "Contratación:create contract infers template and persists record",
    "ok": true
  }
]

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 27

- Array []
+ Array [
+   Object {
+     "error": "edit position. Toast: sin toast",
+     "name": "Contratación:edit position updates modal fields",
+     "ok": false,
+   },
+   Object {
+     "error": "edit vacancy. Toast: sin toast",
+     "name": "Contratación:edit vacancy updates modal fields",
+     "ok": false,
+   },
+   Object {
+     "error": "edit candidate. Toast: sin toast",
+     "name": "Contratación:edit candidate updates modal fields",
+     "ok": false,
+   },
+   Object {
+     "error": "create interview. Toast: sin toast",
+     "name": "Contratación:create interview persists fields and moves pipeline",
+     "ok": false,
+   },
+   Object {
+     "error": "edit interview. Toast: sin toast",
+     "name": "Contratación:edit interview updates modal fields",
+     "ok": false,
+   },
+ ]
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
      - button "Reporteria" [ref=e46] [cursor=pointer]:
        - img [ref=e47]
        - text: Reporteria
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
        - button "Cerrar sesion" [ref=e91] [cursor=pointer]:
          - img [ref=e92]
          - text: Cerrar sesion
        - generic [ref=e95]:
          - paragraph [ref=e96]: Tema
          - group "Tema portal" [ref=e97]:
            - button "Modo claro" [ref=e98] [cursor=pointer]: ☀️
            - button "Modo oscuro" [ref=e99] [cursor=pointer]: 🌙
    - main [ref=e100]:
      - heading "Contratación" [level=1] [ref=e103]
      - generic [ref=e107]:
        - generic [ref=e108]:
          - generic [ref=e109]:
            - heading "Contratación" [level=2] [ref=e111]
            - list [ref=e112]:
              - generic [ref=e113]:
                - strong [ref=e114]: "2"
                - text: vacantes abiertas
              - generic [ref=e115]:
                - strong [ref=e116]: "2"
                - text: en proceso
              - generic "0 contratados de 2 candidatos registrados" [ref=e117]:
                - strong [ref=e118]: 0%
                - text: contratación
              - generic [ref=e119]:
                - strong [ref=e120]: "1"
                - text: contratos este mes
          - tablist "Secciones del módulo Contratación" [ref=e122]:
            - tab "Registrar Cargos, vacantes y contratos" [ref=e123] [cursor=pointer]:
              - img [ref=e125]
              - generic [ref=e126]:
                - generic [ref=e127]: Registrar
                - generic [ref=e128]: Cargos, vacantes y contratos
            - tab "Consultar Candidatos y seguimiento" [selected] [ref=e129] [cursor=pointer]:
              - img [ref=e131]
              - generic [ref=e134]:
                - generic [ref=e135]: Consultar
                - generic [ref=e136]: Candidatos y seguimiento
        - tabpanel [ref=e138]:
          - generic [ref=e139]:
            - tablist "Consultas de contratación" [ref=e141]:
              - tab "Candidatos 2" [ref=e142] [cursor=pointer]:
                - generic [ref=e143]: Candidatos
                - generic [ref=e144]: "2"
              - tab "Vacantes 2" [ref=e145] [cursor=pointer]:
                - generic [ref=e146]: Vacantes
                - generic [ref=e147]: "2"
              - tab "Entrevistas 2" [selected] [ref=e148] [cursor=pointer]:
                - generic [ref=e149]: Entrevistas
                - generic [ref=e150]: "2"
              - tab "Contratos 1" [ref=e151] [cursor=pointer]:
                - generic [ref=e152]: Contratos
                - generic [ref=e153]: "1"
              - tab "Cargos 3" [ref=e154] [cursor=pointer]:
                - generic [ref=e155]: Cargos
                - generic [ref=e156]: "3"
            - generic [ref=e158]:
              - paragraph [ref=e159]:
                - strong [ref=e160]: "2"
                - text: entrevistas registradas
              - table [ref=e163]:
                - rowgroup [ref=e164]:
                  - row "Candidato Fecha y hora Modalidad / lugar Entrevistador Acciones" [ref=e165]:
                    - columnheader "Candidato" [ref=e166]
                    - columnheader "Fecha y hora" [ref=e167]
                    - columnheader "Modalidad / lugar" [ref=e168]
                    - columnheader "Entrevistador" [ref=e169]
                    - columnheader "Acciones" [ref=e170]
                - rowgroup [ref=e171]:
                  - row "Paula Candidata Entrevista agendada 18/06/26, 1:54 a. m. Presencial - LINA QA Ver Editar Eliminar" [ref=e172]:
                    - cell "Paula Candidata Entrevista agendada" [ref=e173]:
                      - generic [ref=e174]:
                        - strong [ref=e175]: Paula Candidata
                        - generic [ref=e176]: Entrevista agendada
                    - cell "18/06/26, 1:54 a. m." [ref=e177]
                    - cell "Presencial -" [ref=e178]:
                      - text: Presencial
                      - text: "-"
                    - cell "LINA QA" [ref=e179]
                    - cell "Ver Editar Eliminar" [ref=e180]:
                      - generic [ref=e181]:
                        - button "Ver" [ref=e182] [cursor=pointer]:
                          - img [ref=e183]
                          - text: Ver
                        - button "Editar" [ref=e186] [cursor=pointer]:
                          - img [ref=e187]
                          - text: Editar
                        - button "Eliminar" [ref=e190] [cursor=pointer]:
                          - img [ref=e191]
                          - text: Eliminar
                  - row "Paula Candidata Entrevista agendada 16/06/26, 1:52 a. m. Virtual - Lina RRHH Ver Editar Eliminar" [ref=e193]:
                    - cell "Paula Candidata Entrevista agendada" [ref=e194]:
                      - generic [ref=e195]:
                        - strong [ref=e196]: Paula Candidata
                        - generic [ref=e197]: Entrevista agendada
                    - cell "16/06/26, 1:52 a. m." [ref=e198]
                    - cell "Virtual -" [ref=e199]:
                      - text: Virtual
                      - text: "-"
                    - cell "Lina RRHH" [ref=e200]
                    - cell "Ver Editar Eliminar" [ref=e201]:
                      - generic [ref=e202]:
                        - button "Ver" [ref=e203] [cursor=pointer]:
                          - img [ref=e204]
                          - text: Ver
                        - button "Editar" [ref=e207] [cursor=pointer]:
                          - img [ref=e208]
                          - text: Editar
                        - button "Eliminar" [ref=e211] [cursor=pointer]:
                          - img [ref=e212]
                          - text: Eliminar
  - generic [ref=e214]: Contrato Word descargado y registro guardado.
```

# Test source

```ts
  572 |     await page.waitForSelector("#crud-modal #crud-form", { state: "attached" });
  573 |     await submitForm("#crud-modal #crud-form", [
  574 |       ["phone", "3007778800"],
  575 |       ["educationLevel", "Posgrado"]
  576 |     ]);
  577 |     await waitForStore(
  578 |       (key) => {
  579 |         const rows = window.AntaresPersistence?.read
  580 |           ? window.AntaresPersistence.read(key, [])
  581 |           : JSON.parse(localStorage.getItem(key) || "[]");
  582 |         return rows.some((row) => row.id === "cand-1" && row.phone === "3007778800" && row.educationLevel === "Posgrado");
  583 |       },
  584 |       KEYS.candidates,
  585 |       "edit candidate"
  586 |     );
  587 |   });
  588 | 
  589 |   await record("Contratación:create interview persists fields and moves pipeline", async () => {
  590 |     await ensureHiringOperateSection("interview");
  591 |     const before = await arrayLen(KEYS.interviews);
  592 |     await submitForm("#form-interview", [
  593 |       ["candidateId", "cand-1"],
  594 |       ["when", ymdhm(plusDays(12))],
  595 |       ["interviewer", "Lina QA"],
  596 |       ["mode", "telefonica"],
  597 |       ["place", "Llamada +57 3000000000"],
  598 |       ["notes", "Entrevista telefónica QA"]
  599 |     ]);
  600 |     await waitForArrayLength(KEYS.interviews, before + 1, "create interview");
  601 |     await waitForStore(
  602 |       ({ interviewsKey, candidatesKey }) => {
  603 |         const interviews = window.AntaresPersistence?.read
  604 |           ? window.AntaresPersistence.read(interviewsKey, [])
  605 |           : JSON.parse(localStorage.getItem(interviewsKey) || "[]");
  606 |         const candidates = window.AntaresPersistence?.read
  607 |           ? window.AntaresPersistence.read(candidatesKey, [])
  608 |           : JSON.parse(localStorage.getItem(candidatesKey) || "[]");
  609 |         return interviews.some((row) => row.interviewer === "Lina QA" && row.modality === "Telefónica" && row.locationOrLink === "Llamada +57 3000000000" && row.notes === "Entrevista telefónica QA")
  610 |           && candidates.some((row) => row.id === "cand-1" && row.status === "Entrevistado");
  611 |       },
  612 |       { interviewsKey: KEYS.interviews, candidatesKey: KEYS.candidates },
  613 |       "create interview"
  614 |     );
  615 |   });
  616 | 
  617 |   await record("Contratación:edit interview updates modal fields", async () => {
  618 |     await ensureHiringDataSection("interviews");
  619 |     await clickVisible("[data-action='edit-interview'][data-id='int-1']");
  620 |     await page.waitForSelector("#crud-modal:not(.hidden)", { timeout: 5000 });
  621 |     await page.waitForSelector("#crud-modal #crud-form", { state: "attached" });
  622 |     await submitForm("#crud-modal #crud-form", [
  623 |       ["interviewer", "Lina QA Edit"],
  624 |       ["modality", "Presencial"],
  625 |       ["locationOrLink", "Sala 2"]
  626 |     ]);
  627 |     await waitForStore(
  628 |       (key) => {
  629 |         const rows = window.AntaresPersistence?.read
  630 |           ? window.AntaresPersistence.read(key, [])
  631 |           : JSON.parse(localStorage.getItem(key) || "[]");
  632 |         return rows.some((row) => row.id === "int-1" && row.interviewer === "Lina QA Edit" && row.modality === "Presencial" && row.locationOrLink === "Sala 2");
  633 |       },
  634 |       KEYS.interviews,
  635 |       "edit interview"
  636 |     );
  637 |   });
  638 | 
  639 |   await record("Contratación:create contract infers template and persists record", async () => {
  640 |     await ensureHiringOperateSection("contract");
  641 |     await setFormFields("#form-contract", [["employeeId", "emp-1"]]);
  642 |     await page.waitForFunction(() => {
  643 |       const field = document.querySelector("#form-contract select[name='contractTemplateKind']");
  644 |       return field && String(field.value || "").trim() === "oficina";
  645 |     });
  646 |     const before = await arrayLen(KEYS.contracts);
  647 |     await submitForm("#form-contract", [
  648 |       ["employeeId", "emp-1"],
  649 |       ["signDate", ymd(plusDays(5))]
  650 |     ]);
  651 |     await waitForArrayLength(KEYS.contracts, before + 1, "create contract");
  652 |     const contracts = await readStore(KEYS.contracts);
  653 |     const created = contracts.find((row) => row.employeeId === "emp-1");
  654 |     if (!created) throw new Error("No se guardó el contrato");
  655 |     expect(created.employeeName).toBe("Carlos Operativo");
  656 |     expect(created.position).toBe("ANALISTA QA EDITADO");
  657 |     expect(created.contractTemplateKind).toBe("oficina");
  658 |     expect(created.contractType).toBe("Termino indefinido");
  659 |     expect(created.startDate).toBe(ymd(plusDays(5)));
  660 |     expect(created.companyId).toBe("co-antares");
  661 |     expect(created.idDocSnapshot).toBe("1234567890");
  662 |     const lastContractPayload = await page.evaluate(() => window.__qaContractCalls.at(-1) || null);
  663 |     if (!lastContractPayload) throw new Error("No se invocó la generación Word stub");
  664 |     expect(lastContractPayload.contractTemplateKind).toBe("oficina");
  665 |     expect(lastContractPayload.nombre_empleado).toBe("Carlos Operativo");
  666 |     expect(lastContractPayload.cedula_empleado).toBe("1234567890");
  667 |     expect(lastContractPayload.signDate).toBe(ymd(plusDays(5)));
  668 |   });
  669 | 
  670 |   console.log(JSON.stringify(results, null, 2));
  671 |   const failed = results.filter((item) => !item.ok);
> 672 |   expect(failed, JSON.stringify(results, null, 2)).toEqual([]);
      |                                                    ^ Error: [
  673 | });
  674 | 
```