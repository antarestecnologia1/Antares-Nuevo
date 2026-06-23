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
    "name": "Camiones:combustible-taller",
    "ok": false,
    "error": "page.waitForSelector: Timeout 4000ms exceeded.\nCall log:\n\u001b[2m  - waiting for locator('[data-action=\\'vehicles-section\\'][data-section=\\'technical\\']')\u001b[22m\n"
  },
  {
    "name": "Historial:trazabilidad",
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
    "error": "Contratación:edit vacancy. Toast: sin toast"
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
    "ok": true
  },
  {
    "name": "Notificaciones:alerts-sound",
    "ok": true
  }
]

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 25

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
+   - waiting for locator('[data-action=\\'vehicles-section\\'][data-section=\\'technical\\']')
+ ",
+     "name": "Camiones:combustible-taller",
+     "ok": false,
+   },
+   Object {
+     "error": "Contratación:edit vacancy. Toast: sin toast",
+     "name": "Contratación:position-vacancy-candidate-interview",
+     "ok": false,
+   },
+   Object {
+     "error": "SST:edit. Toast: sin toast",
+     "name": "Cumplimiento laboral y SST:create-edit",
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
      - generic [ref=e6]:
        - generic "Transportes Antares" [ref=e7]:
          - img "Transportes Antares" [ref=e8]
        - button "Contraer menú lateral" [expanded] [ref=e9] [cursor=pointer]:
          - img [ref=e10]
      - navigation "Módulos del portal" [ref=e12]:
        - paragraph [ref=e13]: General
        - button "Dashboard" [ref=e14] [cursor=pointer]:
          - img [ref=e16]
          - generic [ref=e21]: Dashboard
        - button "Mis solicitudes" [ref=e22] [cursor=pointer]:
          - img [ref=e24]
          - generic [ref=e27]: Mis solicitudes
        - paragraph [ref=e28]: Transporte
        - button "Viajes" [ref=e29] [cursor=pointer]:
          - img [ref=e31]
          - generic [ref=e33]: Viajes
        - button "Camiones" [ref=e34] [cursor=pointer]:
          - img [ref=e36]
          - generic [ref=e41]: Camiones
        - button "Conductores" [ref=e42] [cursor=pointer]:
          - img [ref=e44]
          - generic [ref=e47]: Conductores
        - button "Calendario" [ref=e48] [cursor=pointer]:
          - img [ref=e50]
          - generic [ref=e52]: Calendario
        - button "Historial" [ref=e53] [cursor=pointer]:
          - img [ref=e55]
          - generic [ref=e58]: Historial
        - button "Reportería" [ref=e59] [cursor=pointer]:
          - img [ref=e61]
          - generic [ref=e63]: Reportería
        - paragraph [ref=e64]: Recursos humanos
        - button "Gestión humana" [ref=e65] [cursor=pointer]:
          - img [ref=e67]
          - generic [ref=e70]: Gestión humana
        - button "Contratación" [ref=e71] [cursor=pointer]:
          - img [ref=e73]
          - generic [ref=e76]: Contratación
        - button "Cumplimiento laboral y SST" [ref=e77] [cursor=pointer]:
          - img [ref=e79]
          - generic [ref=e82]: Cumplimiento laboral y SST
        - button "Contacto web (B2B)" [ref=e83] [cursor=pointer]:
          - img [ref=e85]
          - generic [ref=e88]: Contacto web (B2B)
        - paragraph [ref=e89]: Sistema
        - button "Usuarios y permisos" [ref=e90] [cursor=pointer]:
          - img [ref=e92]
          - generic [ref=e97]: Usuarios y permisos
        - button "Autorizaciones" [ref=e98] [cursor=pointer]:
          - img [ref=e100]
          - generic [ref=e102]: Autorizaciones
        - generic [ref=e104]:
          - button "Notificaciones activadas. Pulsar para desactivar" [pressed] [ref=e105] [cursor=pointer]:
            - img [ref=e106]
          - button "Notificaciones" [ref=e109] [cursor=pointer]:
            - img [ref=e111]
            - generic [ref=e114]: Notificaciones
      - generic [ref=e116]:
        - button "Mi perfil ADMIN QA PERFIL Administrador" [ref=e117] [cursor=pointer]:
          - generic [ref=e119]: A
          - generic [ref=e120]:
            - generic [ref=e121]: Mi perfil
            - strong [ref=e122]: ADMIN QA PERFIL
            - generic [ref=e123]: Administrador
          - img [ref=e125]
        - generic [ref=e128]:
          - group "Apariencia del portal" [ref=e129]:
            - button "Modo claro" [ref=e130] [cursor=pointer]:
              - img [ref=e131]
            - button "Modo oscuro" [ref=e134] [cursor=pointer]:
              - img [ref=e135]
          - button "Cerrar sesión" [ref=e137] [cursor=pointer]:
            - img [ref=e139]
            - generic [ref=e142]: Cerrar sesión
    - main [ref=e143]:
      - heading "Notificaciones" [level=1] [ref=e146]
      - generic [ref=e150]:
        - generic [ref=e151]:
          - generic [ref=e152]:
            - paragraph [ref=e153]: Centro de avisos
            - generic [ref=e154]:
              - heading "Notificaciones" [level=2] [ref=e155]
              - button "Notificaciones activadas. Pulsar para desactivar" [pressed] [ref=e156] [cursor=pointer]:
                - img [ref=e157]
            - paragraph [ref=e160]: 2 mensajes · 0 sin leer
          - generic [ref=e161]:
            - generic [ref=e162]:
              - term [ref=e163]: Total
              - definition [ref=e164]: "2"
            - generic [ref=e165]:
              - term [ref=e166]: Sin leer
              - definition [ref=e167]: "0"
            - generic [ref=e168]:
              - term [ref=e169]: Leídas
              - definition [ref=e170]: "2"
            - generic [ref=e171]:
              - term [ref=e172]: "% leídas"
              - definition [ref=e173]: 100%
        - generic [ref=e174]:
          - complementary [ref=e175]:
            - generic [ref=e176]: Filtros
            - navigation "Filtrar notificaciones" [ref=e177]:
              - button "Todas" [pressed] [ref=e178] [cursor=pointer]
              - button "Sin leer" [ref=e179] [cursor=pointer]
              - button "Solicitudes" [ref=e180] [cursor=pointer]
              - button "Autorizaciones" [ref=e181] [cursor=pointer]
              - button "RRHH" [ref=e182] [cursor=pointer]
              - button "Sistema" [ref=e183] [cursor=pointer]
          - generic [ref=e185]:
            - generic [ref=e186]:
              - button "Marcar todas leídas" [disabled] [ref=e187]:
                - img [ref=e188]
                - text: Marcar todas leídas
              - button "Eliminar todas" [ref=e190] [cursor=pointer]:
                - img [ref=e191]
                - text: Eliminar todas
            - region "Hoy" [ref=e193]:
              - heading "Hoy" [level=3] [ref=e194]
              - generic [ref=e195]:
                - article [ref=e196]:
                  - img [ref=e199]
                  - generic [ref=e202]:
                    - generic [ref=e203]:
                      - generic [ref=e204]: Sistema
                      - time [ref=e205]: 22/6/2026, 9:23:51 p. m.
                    - heading "Aviso" [level=3] [ref=e206]
                    - paragraph [ref=e207]: Prueba bandeja
                  - generic [ref=e208]:
                    - generic [ref=e209]: Leída
                    - button "Eliminar notificación" [ref=e210] [cursor=pointer]:
                      - img [ref=e211]
                - article [ref=e213]:
                  - img [ref=e216]
                  - generic [ref=e219]:
                    - generic [ref=e220]:
                      - generic [ref=e221]: Sistema
                      - time [ref=e222]: 22/6/2026, 9:23:51 p. m.
                    - heading "Leída" [level=3] [ref=e223]
                    - paragraph [ref=e224]: Prueba leída
                  - generic [ref=e225]:
                    - generic [ref=e226]: Leída
                    - button "Eliminar notificación" [ref=e227] [cursor=pointer]:
                      - img [ref=e228]
  - generic:
    - status [ref=e230]:
      - img [ref=e233]
      - generic [ref=e236]:
        - paragraph [ref=e237]: Éxito
        - paragraph [ref=e238]: Usuario creado correctamente.
      - button "Cerrar aviso" [ref=e239] [cursor=pointer]:
        - img [ref=e240]
    - status [ref=e244]:
      - img [ref=e247]
      - generic [ref=e250]:
        - paragraph [ref=e251]: Éxito
        - paragraph [ref=e252]: Usuario actualizado correctamente.
      - button "Cerrar aviso" [ref=e253] [cursor=pointer]:
        - img [ref=e254]
    - status [ref=e258]:
      - img [ref=e261]
      - generic [ref=e264]:
        - paragraph [ref=e265]: Éxito
        - paragraph [ref=e266]: Permisos actualizados correctamente.
      - button "Cerrar aviso" [ref=e267] [cursor=pointer]:
        - img [ref=e268]
    - status [ref=e272]:
      - img [ref=e275]
      - generic [ref=e279]:
        - paragraph [ref=e280]: Error
        - paragraph [ref=e281]: Los conductores requieren licencia, categoría y fecha de vencimiento para sincronizar.
      - button "Cerrar aviso" [ref=e282] [cursor=pointer]:
        - img [ref=e283]
    - status [ref=e287]:
      - img [ref=e290]
      - generic [ref=e293]:
        - paragraph [ref=e294]: Éxito
        - paragraph [ref=e295]: Autorización aprobada.
      - button "Cerrar aviso" [ref=e296] [cursor=pointer]:
        - img [ref=e297]
    - status [ref=e301]:
      - img [ref=e304]
      - generic [ref=e307]:
        - paragraph [ref=e308]: Éxito
        - paragraph [ref=e309]: Perfil actualizado correctamente.
      - button "Cerrar aviso" [ref=e310] [cursor=pointer]:
        - img [ref=e311]
    - status [ref=e315]:
      - img [ref=e318]
      - generic [ref=e320]:
        - paragraph [ref=e321]: Aviso
        - paragraph [ref=e322]: Notificaciones desactivadas. La bandeja sigue disponible.
      - button "Cerrar aviso" [ref=e323] [cursor=pointer]:
        - img [ref=e324]
    - status [ref=e328]:
      - img [ref=e331]
      - generic [ref=e333]:
        - paragraph [ref=e334]: Aviso
        - paragraph [ref=e335]: "Notificaciones activadas: avisos y timbre."
      - button "Cerrar aviso" [ref=e336] [cursor=pointer]:
        - img [ref=e337]
```

# Test source

```ts
  1155 |     await submitForm("#form-admin-user-create", [
  1156 |       ["name", "Usuario Smoke"],
  1157 |       ["email", "usuario.smoke@test.com"],
  1158 |       ["password", "QaPass!2026"],
  1159 |       ["documentType", "CC"],
  1160 |       ["taxId", "7788990011"],
  1161 |       ["phone", "3009990011"],
  1162 |       ["role", "client"],
  1163 |       ["registrationKind", "cliente"],
  1164 |       ["companyId", "co-flores"],
  1165 |       ["twoFactorEnabled", "false"],
  1166 |       ["systemJoinDate", ymd(now)],
  1167 |       ["department", "Bogota"],
  1168 |       ["city", "Bogota D.C."],
  1169 |       ["address", "Carrera smoke"],
  1170 |       ["company", "Flores del Valle"]
  1171 |     ]);
  1172 |     await waitForArrayLength(KEYS.users, before + 1, "Usuarios:create");
  1173 |     await clickDom("[data-action='open-edit-user'][data-id='client-1']");
  1174 |     await page.waitForSelector("#form-admin-user-edit", { state: "attached" });
  1175 |     await submitForm("#form-admin-user-edit", [["phone", "3002223300"]]);
  1176 |     await waitForStore(
  1177 |       (key) => {
  1178 |         const rows = window.AntaresPersistence?.read
  1179 |           ? window.AntaresPersistence.read(key, [])
  1180 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1181 |         return rows.some((row) => row.id === "client-1" && row.phone === "+57 300 222 33 00");
  1182 |       },
  1183 |       KEYS.users,
  1184 |       "Usuarios:edit"
  1185 |     );
  1186 |     await ensureAdminPanel("set-permissions");
  1187 |     await submitForm("#form-admin-user-permissions", [["userId", "client-1"]]);
  1188 |   });
  1189 | 
  1190 |   await record("Autorizaciones:approve", async () => {
  1191 |     await gotoView("authorizations");
  1192 |     await ensureAuthTab("transport_fleet");
  1193 |     const before = await arrayLen(KEYS.approvals);
  1194 |     await clickDom("[data-action='approval-approve'][data-id='app-1']");
  1195 |     await waitForStore(
  1196 |       (key) => {
  1197 |         const rows = window.AntaresPersistence?.read
  1198 |           ? window.AntaresPersistence.read(key, [])
  1199 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1200 |         return rows.some((row) => row.id === "app-1" && row.status === "aprobado");
  1201 |       },
  1202 |       KEYS.approvals,
  1203 |       "Autorizaciones:approve"
  1204 |     );
  1205 |     const after = await arrayLen(KEYS.approvals);
  1206 |     if (after !== before) throw new Error("La fila de aprobación no se conservó tras aprobar");
  1207 |   });
  1208 | 
  1209 |   await record("Mi perfil:edit", async () => {
  1210 |     await gotoView("profile");
  1211 |     await submitForm("#form-profile", [
  1212 |       ["name", "Admin QA Perfil"],
  1213 |       ["phone", "3001112200"],
  1214 |       ["documentType", "CC"],
  1215 |       ["taxId", "1010101010"],
  1216 |       ["birthDate", "1990-01-01"],
  1217 |       ["emergencyContact", "Sofía"],
  1218 |       ["emergencyPhone", "3001112201"],
  1219 |       ["emergencyRelation", "Hermana"],
  1220 |       ["companyId", "co-antares"]
  1221 |     ]);
  1222 |     await waitForStore(
  1223 |       (key) => {
  1224 |         const rows = window.AntaresPersistence?.read
  1225 |           ? window.AntaresPersistence.read(key, [])
  1226 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1227 |         return rows.some(
  1228 |           (row) => row.id === "admin-1" && String(row.name || "").toUpperCase() === "ADMIN QA PERFIL"
  1229 |         );
  1230 |       },
  1231 |       KEYS.users,
  1232 |       "Mi perfil:edit"
  1233 |     );
  1234 |   });
  1235 | 
  1236 |   await record("Notificaciones:alerts-sound", async () => {
  1237 |     await gotoView("notifications");
  1238 |     await clickDom("[data-action='notif-toggle-master']");
  1239 |     await clickDom("[data-action='notif-toggle-master']");
  1240 |     await clickDom("[data-action='notif-read-all']");
  1241 |     await waitForStore(
  1242 |       (key) => {
  1243 |         const rows = window.AntaresPersistence?.read
  1244 |           ? window.AntaresPersistence.read(key, [])
  1245 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1246 |         return rows.every((row) => row.readAt);
  1247 |       },
  1248 |       KEYS.notifications,
  1249 |       "Notificaciones:read all"
  1250 |     );
  1251 |   });
  1252 | 
  1253 |   console.log(JSON.stringify(results, null, 2));
  1254 |   const failed = results.filter((item) => !item.ok);
> 1255 |   expect(failed, JSON.stringify(results, null, 2)).toEqual([]);
       |                                                    ^ Error: [
  1256 | });
  1257 | 
```