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
    "ok": false,
    "error": "page.waitForSelector: Timeout 4000ms exceeded.\nCall log:\n\u001b[2m  - waiting for locator('[data-action=\\'hr-workspace-tab\\'][data-module=\\'payroll\\'][data-tab=\\'operate\\']')\u001b[22m\n"
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
    "ok": true
  },
  {
    "name": "Autorizaciones:approve",
    "ok": true
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
+ Received  + 30

- Array []
+ Array [
+   Object {
+     "error": "Camiones:edit. Toast: sin toast",
+     "name": "Camiones:create-edit",
+     "ok": false,
+   },
+   Object {
+     "error": "page.waitForSelector: Timeout 4000ms exceeded.
+ Call log:
+   - waiting for locator('[data-action=\\'hr-workspace-tab\\'][data-module=\\'payroll\\'][data-tab=\\'operate\\']')
+ ",
+     "name": "Gestión humana:employee-edit-absence",
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
      - 'button "Preferencias: avisos emergentes desactivados y timbre silenciado. Use «Avisos» o «Timbre» para activar cada uno. Notificaciones" [ref=e81] [cursor=pointer]':
        - 'generic "Preferencias: avisos emergentes desactivados y timbre silenciado. Use «Avisos» o «Timbre» para activar cada uno." [ref=e82]':
          - img [ref=e84]
          - generic [ref=e87]:
            - generic "Clic para volver a reproducir el timbre al llegar avisos nuevos" [ref=e88]: Sin timbre
            - generic "Clic para volver a recibir avisos emergentes y notificaciones del servidor" [ref=e89]: Sin avisos
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
      - heading "Notificaciones" [level=1] [ref=e103]
      - generic [ref=e106]:
        - generic [ref=e108]:
          - generic [ref=e109]:
            - generic [ref=e110]: Total
            - strong [ref=e111]: "2"
          - generic [ref=e112]:
            - generic [ref=e113]: Sin leer
            - strong [ref=e114]: "0"
          - generic [ref=e115]:
            - generic [ref=e116]: Leidas
            - strong [ref=e117]: "2"
          - generic [ref=e118]:
            - generic [ref=e119]: "% leidas"
            - strong [ref=e120]: 100%
        - generic [ref=e121]:
          - generic [ref=e123]:
            - img [ref=e124]
            - generic [ref=e127]:
              - heading "Notificaciones" [level=2] [ref=e128]
              - paragraph [ref=e129]: 2 mensajes · 0 sin leer
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
                    - generic [ref=e155]: 11/6/2026, 10:50:16 a. m.
                  - heading "Aviso" [level=4] [ref=e156]
                  - paragraph [ref=e157]: Prueba bandeja
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
                    - generic [ref=e172]: 11/6/2026, 10:50:16 a. m.
                  - heading "Leída" [level=4] [ref=e173]
                  - paragraph [ref=e174]: Prueba leída
                - generic [ref=e175]:
                  - generic [ref=e176]: Leída
                  - button "Eliminar notificación" [ref=e177] [cursor=pointer]:
                    - img [ref=e178]
                    - text: Eliminar
  - generic:
    - generic [ref=e180]: "Avisos emergentes desactivados: sin ventanas por avisos nuevos ni notificaciones nuevas del servidor. La bandeja conserva el historial ya recibido."
    - generic [ref=e181]: Timbre silenciado (solo audio). Los avisos en pantalla no cambian si los tienes activos.
```

# Test source

```ts
  1129 |     await ensureAdminPanel("create-user");
  1130 |     const before = await arrayLen(KEYS.users);
  1131 |     await submitForm("#form-admin-user-create", [
  1132 |       ["name", "Usuario Smoke"],
  1133 |       ["email", "usuario.smoke@test.com"],
  1134 |       ["password", "QaPass!2026"],
  1135 |       ["documentType", "CC"],
  1136 |       ["taxId", "7788990011"],
  1137 |       ["phone", "3009990011"],
  1138 |       ["role", "client"],
  1139 |       ["registrationKind", "cliente"],
  1140 |       ["companyId", "co-flores"],
  1141 |       ["twoFactorEnabled", "false"],
  1142 |       ["systemJoinDate", ymd(now)],
  1143 |       ["department", "Bogota"],
  1144 |       ["city", "Bogota D.C."],
  1145 |       ["address", "Carrera smoke"],
  1146 |       ["company", "Flores del Valle"]
  1147 |     ]);
  1148 |     await waitForArrayLength(KEYS.users, before + 1, "Usuarios:create");
  1149 |     await clickDom("[data-action='open-edit-user'][data-id='client-1']");
  1150 |     await page.waitForSelector("#form-admin-user-edit", { state: "attached" });
  1151 |     await submitForm("#form-admin-user-edit", [["phone", "3002223300"]]);
  1152 |     await waitForStore(
  1153 |       (key) => {
  1154 |         const rows = window.AntaresPersistence?.read
  1155 |           ? window.AntaresPersistence.read(key, [])
  1156 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1157 |         return rows.some((row) => row.id === "client-1" && row.phone === "+57 300 222 33 00");
  1158 |       },
  1159 |       KEYS.users,
  1160 |       "Usuarios:edit"
  1161 |     );
  1162 |     await ensureAdminPanel("set-permissions");
  1163 |     await submitForm("#form-admin-user-permissions", [["userId", "client-1"]]);
  1164 |   });
  1165 | 
  1166 |   await record("Autorizaciones:approve", async () => {
  1167 |     await gotoView("authorizations");
  1168 |     await ensureAuthTab("transport_fleet");
  1169 |     const before = await arrayLen(KEYS.approvals);
  1170 |     await clickDom("[data-action='approval-approve'][data-id='app-1']");
  1171 |     await waitForStore(
  1172 |       (key) => {
  1173 |         const rows = window.AntaresPersistence?.read
  1174 |           ? window.AntaresPersistence.read(key, [])
  1175 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1176 |         return rows.some((row) => row.id === "app-1" && row.status === "aprobado");
  1177 |       },
  1178 |       KEYS.approvals,
  1179 |       "Autorizaciones:approve"
  1180 |     );
  1181 |     const after = await arrayLen(KEYS.approvals);
  1182 |     if (after !== before) throw new Error("La fila de aprobación no se conservó tras aprobar");
  1183 |   });
  1184 | 
  1185 |   await record("Mi perfil:edit", async () => {
  1186 |     await gotoView("profile");
  1187 |     await submitForm("#form-profile", [
  1188 |       ["name", "Admin QA Perfil"],
  1189 |       ["phone", "3001112200"],
  1190 |       ["documentType", "CC"],
  1191 |       ["taxId", "1010101010"],
  1192 |       ["birthDate", "1990-01-01"],
  1193 |       ["emergencyContact", "Sofía"],
  1194 |       ["emergencyPhone", "3001112201"],
  1195 |       ["emergencyRelation", "Hermana"],
  1196 |       ["companyId", "co-antares"]
  1197 |     ]);
  1198 |     await waitForStore(
  1199 |       (key) => {
  1200 |         const rows = window.AntaresPersistence?.read
  1201 |           ? window.AntaresPersistence.read(key, [])
  1202 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1203 |         return rows.some((row) => row.id === "admin-1" && row.name === "Admin QA Perfil");
  1204 |       },
  1205 |       KEYS.users,
  1206 |       "Mi perfil:edit"
  1207 |     );
  1208 |   });
  1209 | 
  1210 |   await record("Notificaciones:alerts-sound", async () => {
  1211 |     await gotoView("notifications");
  1212 |     await clickDom("[data-action='notif-toggle-alerts']");
  1213 |     await clickDom("[data-action='notif-toggle-sound']");
  1214 |     await clickDom("[data-action='notif-read-all']");
  1215 |     await waitForStore(
  1216 |       (key) => {
  1217 |         const rows = window.AntaresPersistence?.read
  1218 |           ? window.AntaresPersistence.read(key, [])
  1219 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1220 |         return rows.every((row) => row.readAt);
  1221 |       },
  1222 |       KEYS.notifications,
  1223 |       "Notificaciones:read all"
  1224 |     );
  1225 |   });
  1226 | 
  1227 |   console.log(JSON.stringify(results, null, 2));
  1228 |   const failed = results.filter((item) => !item.ok);
> 1229 |   expect(failed, JSON.stringify(results, null, 2)).toEqual([]);
       |                                                    ^ Error: [
  1230 | });
  1231 | 
```