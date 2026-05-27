# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qa\portal-form-smoke.spec.mjs >> portal form smoke
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
    "ok": true
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
    "ok": false,
    "error": "Usuarios:create: no cambió la cantidad esperada. Toast: sin toast"
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

- Expected  - 1
+ Received  + 7

- Array []
+ Array [
+   Object {
+     "error": "Usuarios:create: no cambió la cantidad esperada. Toast: sin toast",
+     "name": "Usuarios y permisos:create-edit",
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
                    - generic [ref=e161]: 26/5/2026, 9:09:36 p. m.
                  - heading "Viaje asignado" [level=4] [ref=e162]
                  - paragraph [ref=e163]: Se asignó el viaje VIA-000001 a su solicitud SOL-002. Vehículo ABC123 · Conductor Jairo Ruta.
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
                    - generic [ref=e178]: 26/5/2026, 9:09:14 p. m.
                  - heading "Aviso" [level=4] [ref=e179]
                  - paragraph [ref=e180]: Prueba bandeja
                - generic [ref=e181]:
                  - generic [ref=e182]: Leída
                  - button "Eliminar notificación" [ref=e183] [cursor=pointer]:
                    - img [ref=e184]
                    - text: Eliminar
              - article [ref=e186]:
                - img [ref=e189]
                - generic [ref=e192]:
                  - generic [ref=e193]:
                    - generic [ref=e194]: Sistema
                    - generic [ref=e195]: 26/5/2026, 9:09:14 p. m.
                  - heading "Leída" [level=4] [ref=e196]
                  - paragraph [ref=e197]: Prueba leída
                - generic [ref=e198]:
                  - generic [ref=e199]: Leída
                  - button "Eliminar notificación" [ref=e200] [cursor=pointer]:
                    - img [ref=e201]
                    - text: Eliminar
  - generic:
    - generic [ref=e203]: Autorización aprobada.
    - generic [ref=e204]: Perfil actualizado correctamente.
    - generic [ref=e205]: "Avisos emergentes desactivados: sin ventanas por avisos nuevos ni notificaciones nuevas del servidor. La bandeja conserva el historial ya recibido."
    - generic [ref=e206]: Timbre silenciado (solo audio). Los avisos en pantalla no cambian si los tienes activos.
```

# Test source

```ts
  1122 |     await ensureAdminPanel("create-user");
  1123 |     const before = await arrayLen(KEYS.users);
  1124 |     await submitForm("#form-admin-user-create", [
  1125 |       ["name", "Usuario Smoke"],
  1126 |       ["email", "usuario.smoke@test.com"],
  1127 |       ["password", "QaPass!2026"],
  1128 |       ["documentType", "CC"],
  1129 |       ["taxId", "7788990011"],
  1130 |       ["phone", "3009990011"],
  1131 |       ["role", "client"],
  1132 |       ["registrationKind", "cliente"],
  1133 |       ["companyId", "co-flores"],
  1134 |       ["twoFactorEnabled", "false"],
  1135 |       ["systemJoinDate", ymd(now)],
  1136 |       ["department", "Bogota"],
  1137 |       ["city", "Bogota D.C."],
  1138 |       ["address", "Carrera smoke"],
  1139 |       ["company", "Flores del Valle"]
  1140 |     ]);
  1141 |     await waitForArrayLength(KEYS.users, before + 1, "Usuarios:create");
  1142 |     await clickDom("[data-action='open-edit-user'][data-id='client-1']");
  1143 |     await page.waitForSelector("#form-admin-user-edit", { state: "attached" });
  1144 |     await submitForm("#form-admin-user-edit", [["phone", "3002223300"]]);
  1145 |     await waitForStore(
  1146 |       (key) => {
  1147 |         const rows = window.AntaresPersistence?.read
  1148 |           ? window.AntaresPersistence.read(key, [])
  1149 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1150 |         return rows.some((row) => row.id === "client-1" && row.phone === "+57 300 222 33 00");
  1151 |       },
  1152 |       KEYS.users,
  1153 |       "Usuarios:edit"
  1154 |     );
  1155 |     await ensureAdminPanel("set-permissions");
  1156 |     await submitForm("#form-admin-user-permissions", [["userId", "client-1"]]);
  1157 |   });
  1158 | 
  1159 |   await record("Autorizaciones:approve", async () => {
  1160 |     await gotoView("authorizations");
  1161 |     await ensureAuthTab("transport_fleet");
  1162 |     const before = await arrayLen(KEYS.approvals);
  1163 |     await clickDom("[data-action='approval-approve'][data-id='app-1']");
  1164 |     await waitForStore(
  1165 |       (key) => {
  1166 |         const rows = window.AntaresPersistence?.read
  1167 |           ? window.AntaresPersistence.read(key, [])
  1168 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1169 |         return rows.some((row) => row.id === "app-1" && row.status === "aprobado");
  1170 |       },
  1171 |       KEYS.approvals,
  1172 |       "Autorizaciones:approve"
  1173 |     );
  1174 |     const after = await arrayLen(KEYS.approvals);
  1175 |     if (after !== before) throw new Error("La fila de aprobación no se conservó tras aprobar");
  1176 |   });
  1177 | 
  1178 |   await record("Mi perfil:edit", async () => {
  1179 |     await gotoView("profile");
  1180 |     await submitForm("#form-profile", [
  1181 |       ["name", "Admin QA Perfil"],
  1182 |       ["phone", "3001112200"],
  1183 |       ["documentType", "CC"],
  1184 |       ["taxId", "1010101010"],
  1185 |       ["birthDate", "1990-01-01"],
  1186 |       ["emergencyContact", "Sofía"],
  1187 |       ["emergencyPhone", "3001112201"],
  1188 |       ["emergencyRelation", "Hermana"],
  1189 |       ["companyId", "co-antares"]
  1190 |     ]);
  1191 |     await waitForStore(
  1192 |       (key) => {
  1193 |         const rows = window.AntaresPersistence?.read
  1194 |           ? window.AntaresPersistence.read(key, [])
  1195 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1196 |         return rows.some((row) => row.id === "admin-1" && row.name === "Admin QA Perfil");
  1197 |       },
  1198 |       KEYS.users,
  1199 |       "Mi perfil:edit"
  1200 |     );
  1201 |   });
  1202 | 
  1203 |   await record("Notificaciones:alerts-sound", async () => {
  1204 |     await gotoView("notifications");
  1205 |     await clickDom("[data-action='notif-toggle-alerts']");
  1206 |     await clickDom("[data-action='notif-toggle-sound']");
  1207 |     await clickDom("[data-action='notif-read-all']");
  1208 |     await waitForStore(
  1209 |       (key) => {
  1210 |         const rows = window.AntaresPersistence?.read
  1211 |           ? window.AntaresPersistence.read(key, [])
  1212 |           : JSON.parse(localStorage.getItem(key) || "[]");
  1213 |         return rows.every((row) => row.readAt);
  1214 |       },
  1215 |       KEYS.notifications,
  1216 |       "Notificaciones:read all"
  1217 |     );
  1218 |   });
  1219 | 
  1220 |   console.log(JSON.stringify(results, null, 2));
  1221 |   const failed = results.filter((item) => !item.ok);
> 1222 |   expect(failed, JSON.stringify(results, null, 2)).toEqual([]);
       |                                                    ^ Error: [
  1223 | });
  1224 | 
```