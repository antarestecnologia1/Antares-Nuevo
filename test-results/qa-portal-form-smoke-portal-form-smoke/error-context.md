# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qa\portal-form-smoke.spec.mjs >> portal form smoke
- Location: qa\portal-form-smoke.spec.mjs:481:1

# Error details

```
Error: [
  {
    "name": "Mis solicitudes:create",
    "ok": true
  },
  {
    "name": "Mis solicitudes:edit",
    "ok": false,
    "error": "Mis solicitudes:edit. Toast: sin toast"
  },
  {
    "name": "Viajes:create",
    "ok": false,
    "error": "Viajes:create. Toast: sin toast"
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
    "error": "Gestión humana:edit employee. Toast: sin toast"
  },
  {
    "name": "Contratación:position-vacancy-candidate-interview",
    "ok": true
  },
  {
    "name": "Cumplimiento laboral y SST:create-edit",
    "ok": true
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
+ Received  + 22

- Array []
+ Array [
+   Object {
+     "error": "Mis solicitudes:edit. Toast: sin toast",
+     "name": "Mis solicitudes:edit",
+     "ok": false,
+   },
+   Object {
+     "error": "Viajes:create. Toast: sin toast",
+     "name": "Viajes:create",
+     "ok": false,
+   },
+   Object {
+     "error": "Camiones:edit. Toast: sin toast",
+     "name": "Camiones:create-edit",
+     "ok": false,
+   },
+   Object {
+     "error": "Gestión humana:edit employee. Toast: sin toast",
+     "name": "Gestión humana:employee-edit-absence",
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
          - heading "Admin QA Perfil" [level=2] [ref=e9]
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
            - paragraph [ref=e131]: "Vista de administrador: todas las notificaciones del sistema."
            - paragraph [ref=e132]: La bandeja se guarda en el servidor y se sincroniza al iniciar sesión; no depende de un archivo local en el navegador.
            - paragraph [ref=e133]: "Registro de preferencias: aún no creado · última actualización: 2026-05-26"
            - status [ref=e134]:
              - strong [ref=e135]: Preferencias activas
              - text: "Avisos emergentes desactivados: no verás ventanas por avisos nuevos y el servidor no creará notificaciones para tu cuenta. El timbre permanece desactivado; al reactivar solo «Avisos», podrás activar el timbre de forma independiente. Use «Avisos» / «Timbre» junto a la campana del menú lateral."
            - generic [ref=e136]:
              - 'button "Avisos emergentes: desactivados" [ref=e137] [cursor=pointer]':
                - img [ref=e138]
                - text: "Avisos emergentes: desactivados"
              - button "Activar timbre" [ref=e141] [cursor=pointer]
              - button "Marcar todas como leídas" [ref=e142] [cursor=pointer]:
                - img [ref=e143]
                - text: Marcar todas como leídas
              - button "Eliminar leídas" [ref=e145] [cursor=pointer]:
                - img [ref=e146]
                - text: Eliminar leídas
              - button "Vaciar bandeja" [ref=e148] [cursor=pointer]:
                - img [ref=e149]
                - text: Vaciar bandeja
            - generic [ref=e151]:
              - article [ref=e152]:
                - img [ref=e155]
                - generic [ref=e158]:
                  - generic [ref=e159]:
                    - generic [ref=e160]: Sistema
                    - generic [ref=e161]: 26/5/2026, 2:07:50 p. m.
                  - heading "Aviso" [level=4] [ref=e162]
                  - paragraph [ref=e163]: Prueba bandeja
                - generic [ref=e164]:
                  - generic [ref=e165]: Leída
                  - button "Eliminar notificación" [ref=e166] [cursor=pointer]:
                    - img [ref=e167]
                    - text: Eliminar
              - article [ref=e169]:
                - img [ref=e172]
                - generic [ref=e175]:
                  - generic [ref=e176]:
                    - generic [ref=e177]: Sistema
                    - generic [ref=e178]: 26/5/2026, 2:07:50 p. m.
                  - heading "Leída" [level=4] [ref=e179]
                  - paragraph [ref=e180]: Prueba leída
                - generic [ref=e181]:
                  - generic [ref=e182]: Leída
                  - button "Eliminar notificación" [ref=e183] [cursor=pointer]:
                    - img [ref=e184]
                    - text: Eliminar
  - generic:
    - generic [ref=e186]: Usuario creado correctamente.
    - generic [ref=e187]: Usuario actualizado correctamente.
    - generic [ref=e188]: Permisos actualizados correctamente.
    - generic [ref=e189]: Autorización aprobada.
    - generic [ref=e190]: Perfil actualizado correctamente.
    - generic [ref=e191]: "Avisos emergentes desactivados: sin ventanas por avisos nuevos ni notificaciones nuevas del servidor. La bandeja conserva el historial ya recibido."
    - generic [ref=e192]: Timbre silenciado (solo audio). Los avisos en pantalla no cambian si los tienes activos.
```

# Test source

```ts
  1117 |     await ensureAdminPanel("create-user");
  1118 |     const before = await arrayLen(KEYS.users);
  1119 |     await submitForm("#form-admin-user-create", [
  1120 |       ["name", "Usuario Smoke"],
  1121 |       ["email", "usuario.smoke@test.com"],
  1122 |       ["password", "QaPass!2026"],
  1123 |       ["documentType", "CC"],
  1124 |       ["taxId", "7788990011"],
  1125 |       ["phone", "3009990011"],
  1126 |       ["role", "client"],
  1127 |       ["registrationKind", "cliente"],
  1128 |       ["companyId", "co-flores"],
  1129 |       ["twoFactorEnabled", "false"],
  1130 |       ["systemJoinDate", ymd(now)],
  1131 |       ["department", "Bogota"],
  1132 |       ["city", "Bogota D.C."],
  1133 |       ["address", "Carrera smoke"],
  1134 |       ["company", "Flores del Valle"]
  1135 |     ]);
  1136 |     await waitForArrayLength(KEYS.users, before + 1, "Usuarios:create");
  1137 |     await clickDom("[data-action='open-edit-user'][data-id='client-1']");
  1138 |     await page.waitForSelector("#form-admin-user-edit", { state: "attached" });
  1139 |     await submitForm("#form-admin-user-edit", [["phone", "3002223300"]]);
  1140 |     await waitForStore(
  1141 |       (key) => {
  1142 |         const rows = window.AntaresPersistence?.read
  1143 |           ? window.AntaresPersistence.read(key, [])
  1144 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1145 |         return rows.some((row) => row.id === "client-1" && row.phone === "+57 300 222 33 00");
  1146 |       },
  1147 |       KEYS.users,
  1148 |       "Usuarios:edit"
  1149 |     );
  1150 |     await ensureAdminPanel("set-permissions");
  1151 |     await submitForm("#form-admin-user-permissions", [["userId", "client-1"]]);
  1152 |   });
  1153 | 
  1154 |   await record("Autorizaciones:approve", async () => {
  1155 |     await gotoView("authorizations");
  1156 |     await ensureAuthTab("transport_fleet");
  1157 |     const before = await arrayLen(KEYS.approvals);
  1158 |     await clickDom("[data-action='approval-approve'][data-id='app-1']");
  1159 |     await waitForStore(
  1160 |       (key) => {
  1161 |         const rows = window.AntaresPersistence?.read
  1162 |           ? window.AntaresPersistence.read(key, [])
  1163 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1164 |         return rows.some((row) => row.id === "app-1" && row.status === "aprobado");
  1165 |       },
  1166 |       KEYS.approvals,
  1167 |       "Autorizaciones:approve"
  1168 |     );
  1169 |     const after = await arrayLen(KEYS.approvals);
  1170 |     if (after !== before) throw new Error("La fila de aprobación no se conservó tras aprobar");
  1171 |   });
  1172 | 
  1173 |   await record("Mi perfil:edit", async () => {
  1174 |     await gotoView("profile");
  1175 |     await submitForm("#form-profile", [
  1176 |       ["name", "Admin QA Perfil"],
  1177 |       ["phone", "3001112200"],
  1178 |       ["documentType", "CC"],
  1179 |       ["taxId", "1010101010"],
  1180 |       ["birthDate", "1990-01-01"],
  1181 |       ["emergencyContact", "Sofía"],
  1182 |       ["emergencyPhone", "3001112201"],
  1183 |       ["emergencyRelation", "Hermana"],
  1184 |       ["companyId", "co-antares"]
  1185 |     ]);
  1186 |     await waitForStore(
  1187 |       (key) => {
  1188 |         const rows = window.AntaresPersistence?.read
  1189 |           ? window.AntaresPersistence.read(key, [])
  1190 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1191 |         return rows.some((row) => row.id === "admin-1" && row.name === "Admin QA Perfil");
  1192 |       },
  1193 |       KEYS.users,
  1194 |       "Mi perfil:edit"
  1195 |     );
  1196 |   });
  1197 | 
  1198 |   await record("Notificaciones:alerts-sound", async () => {
  1199 |     await gotoView("notifications");
  1200 |     await clickDom("[data-action='notif-toggle-alerts']");
  1201 |     await clickDom("[data-action='notif-toggle-sound']");
  1202 |     await clickDom("[data-action='notif-read-all']");
  1203 |     await waitForStore(
  1204 |       (key) => {
  1205 |         const rows = window.AntaresPersistence?.read
  1206 |           ? window.AntaresPersistence.read(key, [])
  1207 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1208 |         return rows.every((row) => row.readAt);
  1209 |       },
  1210 |       KEYS.notifications,
  1211 |       "Notificaciones:read all"
  1212 |     );
  1213 |   });
  1214 | 
  1215 |   console.log(JSON.stringify(results, null, 2));
  1216 |   const failed = results.filter((item) => !item.ok);
> 1217 |   expect(failed, JSON.stringify(results, null, 2)).toEqual([]);
       |                                                    ^ Error: [
  1218 | });
  1219 | 
```