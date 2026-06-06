# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal-form-smoke.spec.mjs >> portal form smoke
- Location: qa\portal-form-smoke.spec.mjs:483:1

# Error details

```
Error: [
  {
    "name": "Mis solicitudes:create",
    "ok": true
  },
  {
    "name": "Mis solicitudes:edit",
    "ok": true
  },
  {
    "name": "Viajes:create",
    "ok": true
  },
  {
    "name": "Viajes:edit",
    "ok": true
  },
  {
    "name": "Camiones:create-edit",
    "ok": false,
    "error": "Camiones:edit. Toast: sin toast"
  },
  {
    "name": "Conductores:edit",
    "ok": true
  },
  {
    "name": "Calendario:navigation",
    "ok": true
  },
  {
    "name": "Historial:fuel-technical",
    "ok": true
  },
  {
    "name": "Reporteria:bi-layout",
    "ok": true
  },
  {
    "name": "Gestión humana:employee-edit-absence",
    "ok": true
  },
  {
    "name": "Contratación:position-vacancy-candidate-interview",
    "ok": false,
    "error": "Contratación:edit position. Toast: sin toast"
  },
  {
    "name": "Cumplimiento laboral y SST:create-edit",
    "ok": false,
    "error": "SST:edit. Toast: sin toast"
  },
  {
    "name": "Contacto web (B2B):access",
    "ok": true
  },
  {
    "name": "Usuarios y permisos:create-edit",
    "ok": false,
    "error": "page.waitForSelector: Timeout 4000ms exceeded.\nCall log:\n\u001b[2m  - waiting for locator('[data-action=\\'toggle-admin-panel\\'][data-panel=\\'create-user\\']')\u001b[22m\n"
  },
  {
    "name": "Autorizaciones:approve",
    "ok": false,
    "error": "page.waitForSelector: Timeout 4000ms exceeded.\nCall log:\n\u001b[2m  - waiting for locator('[data-auth-tab=\\'transport_fleet\\']')\u001b[22m\n"
  },
  {
    "name": "Mi perfil:edit",
    "ok": false,
    "error": "Mi perfil:edit. Toast: sin toast"
  },
  {
    "name": "Notificaciones:alerts-sound",
    "ok": true
  }
]

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 38

- Array []
+ Array [
+   Object {
+     "error": "Camiones:edit. Toast: sin toast",
+     "name": "Camiones:create-edit",
+     "ok": false,
+   },
+   Object {
+     "error": "Contratación:edit position. Toast: sin toast",
+     "name": "Contratación:position-vacancy-candidate-interview",
+     "ok": false,
+   },
+   Object {
+     "error": "SST:edit. Toast: sin toast",
+     "name": "Cumplimiento laboral y SST:create-edit",
+     "ok": false,
+   },
+   Object {
+     "error": "page.waitForSelector: Timeout 4000ms exceeded.
+ Call log:
+   - waiting for locator('[data-action=\\'toggle-admin-panel\\'][data-panel=\\'create-user\\']')
+ ",
+     "name": "Usuarios y permisos:create-edit",
+     "ok": false,
+   },
+   Object {
+     "error": "page.waitForSelector: Timeout 4000ms exceeded.
+ Call log:
+   - waiting for locator('[data-auth-tab=\\'transport_fleet\\']')
+ ",
+     "name": "Autorizaciones:approve",
+     "ok": false,
+   },
+   Object {
+     "error": "Mi perfil:edit. Toast: sin toast",
+     "name": "Mi perfil:edit",
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
          - heading "ADMIN QA PERFIL" [level=2] [ref=e9]
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
      - 'button "Preferencias: avisos emergentes desactivados y timbre silenciado. Use «Avisos» o «Timbre» para activar cada uno. Notificaciones" [ref=e81] [cursor=pointer]':
        - 'generic "Preferencias: avisos emergentes desactivados y timbre silenciado. Use «Avisos» o «Timbre» para activar cada uno." [ref=e82]':
          - img [ref=e84]
          - generic [ref=e87]:
            - generic "Clic para volver a reproducir el timbre al llegar avisos nuevos" [ref=e88]: Sin timbre
            - generic "Clic para volver a recibir avisos emergentes y notificaciones del servidor" [ref=e89]: Sin avisos
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
      - heading "Notificaciones" [level=1] [ref=e103]
      - generic [ref=e106]:
        - generic [ref=e108]:
          - generic [ref=e109]:
            - generic [ref=e110]: Total
            - strong [ref=e111]: "3"
          - generic [ref=e112]:
            - generic [ref=e113]: Sin leer
            - strong [ref=e114]: "0"
          - generic [ref=e115]:
            - generic [ref=e116]: Leidas
            - strong [ref=e117]: "3"
          - generic [ref=e118]:
            - generic [ref=e119]: "% leidas"
            - strong [ref=e120]: 100%
        - generic [ref=e121]:
          - generic [ref=e123]:
            - img [ref=e124]
            - generic [ref=e127]:
              - heading "Notificaciones" [level=2] [ref=e128]
              - paragraph [ref=e129]: 3 mensajes · 0 sin leer
          - generic [ref=e130]:
            - status [ref=e131]:
              - strong [ref=e132]: Preferencias activas
              - text: "Avisos emergentes desactivados: no verás ventanas por avisos nuevos y el servidor no creará notificaciones para tu cuenta. El timbre permanece desactivado; al reactivar solo «Avisos», podrás activar el timbre de forma independiente. Use «Avisos» / «Timbre» junto a la campana del menú lateral."
            - generic [ref=e133]:
              - 'button "Avisos emergentes: desactivados" [ref=e134] [cursor=pointer]':
                - img [ref=e135]
                - text: "Avisos emergentes: desactivados"
              - button "Activar timbre" [ref=e138] [cursor=pointer]
              - button "Marcar todas como leídas" [ref=e139] [cursor=pointer]:
                - img [ref=e140]
                - text: Marcar todas como leídas
              - button "Eliminar todas" [ref=e142] [cursor=pointer]:
                - img [ref=e143]
                - text: Eliminar todas
            - generic [ref=e145]:
              - article [ref=e146]:
                - img [ref=e149]
                - generic [ref=e152]:
                  - generic [ref=e153]:
                    - generic [ref=e154]: Sistema
                    - generic [ref=e155]: 5/6/2026, 8:49:43 p. m.
                  - heading "Viaje asignado" [level=4] [ref=e156]
                  - paragraph [ref=e157]: Se asignó el viaje VIA-000001 a su solicitud SOL-002. Vehículo ABC123 · Conductor Jairo Ruta.
                - generic [ref=e158]:
                  - generic [ref=e159]: Leída
                  - button "Eliminar notificación" [ref=e160] [cursor=pointer]:
                    - img [ref=e161]
                    - text: Eliminar
              - article [ref=e163]:
                - img [ref=e166]
                - generic [ref=e169]:
                  - generic [ref=e170]:
                    - generic [ref=e171]: Sistema
                    - generic [ref=e172]: 5/6/2026, 8:49:23 p. m.
                  - heading "Aviso" [level=4] [ref=e173]
                  - paragraph [ref=e174]: Prueba bandeja
                - generic [ref=e175]:
                  - generic [ref=e176]: Leída
                  - button "Eliminar notificación" [ref=e177] [cursor=pointer]:
                    - img [ref=e178]
                    - text: Eliminar
              - article [ref=e180]:
                - img [ref=e183]
                - generic [ref=e186]:
                  - generic [ref=e187]:
                    - generic [ref=e188]: Sistema
                    - generic [ref=e189]: 5/6/2026, 8:49:23 p. m.
                  - heading "Leída" [level=4] [ref=e190]
                  - paragraph [ref=e191]: Prueba leída
                - generic [ref=e192]:
                  - generic [ref=e193]: Leída
                  - button "Eliminar notificación" [ref=e194] [cursor=pointer]:
                    - img [ref=e195]
                    - text: Eliminar
  - generic:
    - generic [ref=e197]: "Avisos emergentes desactivados: sin ventanas por avisos nuevos ni notificaciones nuevas del servidor. La bandeja conserva el historial ya recibido."
    - generic [ref=e198]: Timbre silenciado (solo audio). Los avisos en pantalla no cambian si los tienes activos.
```

# Test source

```ts
  1123 |     await ensureAdminPanel("create-user");
  1124 |     const before = await arrayLen(KEYS.users);
  1125 |     await submitForm("#form-admin-user-create", [
  1126 |       ["name", "Usuario Smoke"],
  1127 |       ["email", "usuario.smoke@test.com"],
  1128 |       ["password", "QaPass!2026"],
  1129 |       ["documentType", "CC"],
  1130 |       ["taxId", "7788990011"],
  1131 |       ["phone", "3009990011"],
  1132 |       ["role", "client"],
  1133 |       ["registrationKind", "cliente"],
  1134 |       ["companyId", "co-flores"],
  1135 |       ["twoFactorEnabled", "false"],
  1136 |       ["systemJoinDate", ymd(now)],
  1137 |       ["department", "Bogota"],
  1138 |       ["city", "Bogota D.C."],
  1139 |       ["address", "Carrera smoke"],
  1140 |       ["company", "Flores del Valle"]
  1141 |     ]);
  1142 |     await waitForArrayLength(KEYS.users, before + 1, "Usuarios:create");
  1143 |     await clickDom("[data-action='open-edit-user'][data-id='client-1']");
  1144 |     await page.waitForSelector("#form-admin-user-edit", { state: "attached" });
  1145 |     await submitForm("#form-admin-user-edit", [["phone", "3002223300"]]);
  1146 |     await waitForStore(
  1147 |       (key) => {
  1148 |         const rows = window.AntaresPersistence?.read
  1149 |           ? window.AntaresPersistence.read(key, [])
  1150 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1151 |         return rows.some((row) => row.id === "client-1" && row.phone === "+57 300 222 33 00");
  1152 |       },
  1153 |       KEYS.users,
  1154 |       "Usuarios:edit"
  1155 |     );
  1156 |     await ensureAdminPanel("set-permissions");
  1157 |     await submitForm("#form-admin-user-permissions", [["userId", "client-1"]]);
  1158 |   });
  1159 | 
  1160 |   await record("Autorizaciones:approve", async () => {
  1161 |     await gotoView("authorizations");
  1162 |     await ensureAuthTab("transport_fleet");
  1163 |     const before = await arrayLen(KEYS.approvals);
  1164 |     await clickDom("[data-action='approval-approve'][data-id='app-1']");
  1165 |     await waitForStore(
  1166 |       (key) => {
  1167 |         const rows = window.AntaresPersistence?.read
  1168 |           ? window.AntaresPersistence.read(key, [])
  1169 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1170 |         return rows.some((row) => row.id === "app-1" && row.status === "aprobado");
  1171 |       },
  1172 |       KEYS.approvals,
  1173 |       "Autorizaciones:approve"
  1174 |     );
  1175 |     const after = await arrayLen(KEYS.approvals);
  1176 |     if (after !== before) throw new Error("La fila de aprobación no se conservó tras aprobar");
  1177 |   });
  1178 | 
  1179 |   await record("Mi perfil:edit", async () => {
  1180 |     await gotoView("profile");
  1181 |     await submitForm("#form-profile", [
  1182 |       ["name", "Admin QA Perfil"],
  1183 |       ["phone", "3001112200"],
  1184 |       ["documentType", "CC"],
  1185 |       ["taxId", "1010101010"],
  1186 |       ["birthDate", "1990-01-01"],
  1187 |       ["emergencyContact", "Sofía"],
  1188 |       ["emergencyPhone", "3001112201"],
  1189 |       ["emergencyRelation", "Hermana"],
  1190 |       ["companyId", "co-antares"]
  1191 |     ]);
  1192 |     await waitForStore(
  1193 |       (key) => {
  1194 |         const rows = window.AntaresPersistence?.read
  1195 |           ? window.AntaresPersistence.read(key, [])
  1196 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1197 |         return rows.some((row) => row.id === "admin-1" && row.name === "Admin QA Perfil");
  1198 |       },
  1199 |       KEYS.users,
  1200 |       "Mi perfil:edit"
  1201 |     );
  1202 |   });
  1203 | 
  1204 |   await record("Notificaciones:alerts-sound", async () => {
  1205 |     await gotoView("notifications");
  1206 |     await clickDom("[data-action='notif-toggle-alerts']");
  1207 |     await clickDom("[data-action='notif-toggle-sound']");
  1208 |     await clickDom("[data-action='notif-read-all']");
  1209 |     await waitForStore(
  1210 |       (key) => {
  1211 |         const rows = window.AntaresPersistence?.read
  1212 |           ? window.AntaresPersistence.read(key, [])
  1213 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1214 |         return rows.every((row) => row.readAt);
  1215 |       },
  1216 |       KEYS.notifications,
  1217 |       "Notificaciones:read all"
  1218 |     );
  1219 |   });
  1220 | 
  1221 |   console.log(JSON.stringify(results, null, 2));
  1222 |   const failed = results.filter((item) => !item.ok);
> 1223 |   expect(failed, JSON.stringify(results, null, 2)).toEqual([]);
       |                                                    ^ Error: [
  1224 | });
  1225 | 
```