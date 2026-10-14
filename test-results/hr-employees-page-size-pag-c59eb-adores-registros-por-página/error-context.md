# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: hr-employees-page-size.spec.mjs >> paginación de colaboradores: registros por página
- Location: qa\hr-employees-page-size.spec.mjs:136:1

# Error details

```
Error: {"bound":false,"apply":"undefined","selects":[{"value":"10","action":"payroll-employees-page-size","inView":true}],"pageSize":10}

expect(received).toMatchObject(expected)

- Expected  - 2
+ Received  + 2

  Object {
-   "apply": "function",
-   "bound": true,
+   "apply": "undefined",
+   "bound": false,
  }
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - text: “ “ “
  - generic [ref=e3]:
    - navigation [ref=e4]:
      - generic [ref=e6]:
        - generic "Transportes Antares" [ref=e7]:
          - img "Transportes Antares" [ref=e8]
        - button "Contraer menú lateral" [expanded] [ref=e9] [cursor=pointer]:
          - img [ref=e10]
      - navigation "Módulos del portal" [ref=e13]:
        - paragraph [ref=e14]: General
        - button "Dashboard" [ref=e15] [cursor=pointer]:
          - img [ref=e17]
          - generic [ref=e22]: Dashboard
        - button "Mis solicitudes" [ref=e23] [cursor=pointer]:
          - img [ref=e25]
          - generic [ref=e28]: Mis solicitudes
        - paragraph [ref=e29]: Transporte
        - button "Viajes" [ref=e30] [cursor=pointer]:
          - img [ref=e32]
          - generic [ref=e34]: Viajes
        - button "Camiones" [ref=e35] [cursor=pointer]:
          - img [ref=e37]
          - generic [ref=e42]: Camiones
        - button "Conductores" [ref=e43] [cursor=pointer]:
          - img [ref=e45]
          - generic [ref=e48]: Conductores
        - button "Calendario" [ref=e49] [cursor=pointer]:
          - img [ref=e51]
          - generic [ref=e53]: Calendario
        - button "Historial" [ref=e54] [cursor=pointer]:
          - img [ref=e56]
          - generic [ref=e59]: Historial
        - button "Reportería" [ref=e60] [cursor=pointer]:
          - img [ref=e62]
          - generic [ref=e64]: Reportería
        - paragraph [ref=e65]: Recursos humanos
        - button "Gestión humana" [ref=e66] [cursor=pointer]:
          - img [ref=e68]
          - generic [ref=e71]: Gestión humana
        - button "Contratación" [ref=e72] [cursor=pointer]:
          - img [ref=e74]
          - generic [ref=e77]: Contratación
        - button "Cumplimiento laboral y SST" [ref=e78] [cursor=pointer]:
          - img [ref=e80]
          - generic [ref=e83]: Cumplimiento laboral y SST
        - button "Gestión documental" [ref=e84] [cursor=pointer]:
          - img [ref=e86]
          - generic [ref=e88]: Gestión documental
        - button "SARLAFT / PTE" [ref=e89] [cursor=pointer]:
          - img [ref=e91]
          - generic [ref=e95]: SARLAFT / PTE
        - button "Contacto web (B2B)" [ref=e96] [cursor=pointer]:
          - img [ref=e98]
          - generic [ref=e101]: Contacto web (B2B)
        - paragraph [ref=e102]: Sistema
        - button "Usuarios y permisos" [ref=e103] [cursor=pointer]:
          - img [ref=e105]
          - generic [ref=e110]: Usuarios y permisos
        - button "Autorizaciones" [ref=e111] [cursor=pointer]:
          - img [ref=e113]
          - generic [ref=e115]: Autorizaciones
        - group "Notificaciones" [ref=e116]:
          - button "Notificaciones" [ref=e117] [cursor=pointer]:
            - img [ref=e119]
            - generic [ref=e122]: Notificaciones
          - button "Notificaciones activadas. Pulsar para desactivar" [pressed] [ref=e123] [cursor=pointer]:
            - img [ref=e125]
            - generic [ref=e128]: Silenciar alertas
      - generic [ref=e130]:
        - button "Mi perfil Admin Administrador" [ref=e131] [cursor=pointer]:
          - generic [ref=e133]: A
          - generic [ref=e134]:
            - generic [ref=e135]: Mi perfil
            - strong [ref=e136]: Admin
            - generic [ref=e137]: Administrador
          - img [ref=e139]
        - generic [ref=e142]:
          - group "Apariencia del portal" [ref=e143]:
            - button "Modo claro" [ref=e144] [cursor=pointer]:
              - img [ref=e145]
            - button "Modo oscuro" [ref=e148] [cursor=pointer]:
              - img [ref=e149]
          - button "Cerrar sesión" [ref=e151] [cursor=pointer]:
            - img [ref=e153]
            - generic [ref=e156]: Cerrar sesión
    - separator "Redimensionar menú lateral" [ref=e157]
    - main [ref=e158]:
      - heading "Gestión humana" [level=1] [ref=e161]
      - generic [ref=e165]:
        - generic [ref=e167]:
          - generic [ref=e168]:
            - generic [ref=e169]:
              - heading "Empleados" [level=2] [ref=e170]
              - paragraph [ref=e171]: Administra colaboradores y su información
            - tablist "Secciones del módulo Gestión humana" [ref=e173]:
              - tab "Registrar" [ref=e174] [cursor=pointer]:
                - img [ref=e176]
                - generic [ref=e178]: Registrar
              - tab "Consultar" [selected] [ref=e179] [cursor=pointer]:
                - img [ref=e181]
                - generic [ref=e185]: Consultar
          - tablist "Secciones de gestión humana" [ref=e186]:
            - tab "Empleados 24" [active] [selected] [ref=e187] [cursor=pointer]:
              - img [ref=e189]
              - generic [ref=e192]:
                - generic [ref=e193]: Empleados
                - strong [ref=e194]: "24"
            - tab "Ausencias 0" [ref=e195] [cursor=pointer]:
              - img [ref=e197]
              - generic [ref=e199]:
                - generic [ref=e200]: Ausencias
                - strong [ref=e201]: "0"
            - tab "Nómina 0" [ref=e202] [cursor=pointer]:
              - img [ref=e204]
              - generic [ref=e206]:
                - generic [ref=e207]: Nómina
                - strong [ref=e208]: "0"
            - tab "Viajes 0" [ref=e209] [cursor=pointer]:
              - img [ref=e211]
              - generic [ref=e216]:
                - generic [ref=e217]: Viajes
                - strong [ref=e218]: "0"
            - tab "Legal 1" [ref=e219] [cursor=pointer]:
              - img [ref=e221]
              - generic [ref=e223]:
                - generic [ref=e224]: Legal
                - strong [ref=e225]: "1"
          - status "Alertas de contratos" [ref=e227]:
            - generic [ref=e228]:
              - img [ref=e229]
              - text: 24 vencidos
        - tabpanel [ref=e232]:
          - generic [ref=e236]:
            - generic [ref=e238]:
              - generic [ref=e239]:
                - generic [ref=e240]: Buscar
                - img [ref=e241]
                - searchbox "Buscar" [ref=e244]
              - generic [ref=e245]:
                - generic [ref=e246]: Vinculación
                - combobox "Vinculación" [ref=e247]:
                  - option "Activos" [selected]
                  - option "Desvinculados"
                  - option "Todos"
              - generic [ref=e248]:
                - generic [ref=e249]: Contrato
                - combobox "Contrato" [ref=e250]:
                  - option "Todos" [selected]
                  - option "Término fijo"
                  - option "Indefinido"
                  - option "Prestación de servicios"
              - generic [ref=e251]:
                - generic [ref=e252]: Estado
                - combobox "Estado" [ref=e253]:
                  - option "Todos" [selected]
                  - option "Por vencer (30 días)"
                  - option "Vencidos"
                  - option "Vigentes"
              - group [ref=e254]:
                - generic "Más filtros" [ref=e255] [cursor=pointer]:
                  - img [ref=e256]
                  - generic [ref=e258]: Más filtros
                  - img [ref=e259]
                - option "Todos" [selected]
                - option "Camión"
                - option "Turbo"
                - option "Mula"
                - option "Sin categoría"
                - option "Todas" [selected]
                - option "Renuncia voluntaria"
                - option "Despido sin justa causa"
                - option "Despido con justa causa"
                - option "Mutuo acuerdo"
                - option "Vencimiento de contrato"
                - option "Otro"
                - option "Todas" [selected]
                - option "Vence en 30 días"
                - option "Vence este mes"
              - button "Limpiar filtros de búsqueda" [ref=e262] [cursor=pointer]:
                - img [ref=e263]
                - generic [ref=e266]: Limpiar filtros
            - generic [ref=e267]:
              - tablist "Vista de colaboradores" [ref=e268]:
                - tab "Tarjetas" [selected] [ref=e269] [cursor=pointer]:
                  - img [ref=e270]
                  - generic [ref=e275]: Tarjetas
                - tab "Lista" [ref=e276] [cursor=pointer]:
                  - img [ref=e277]
                  - generic [ref=e278]: Lista
              - generic [ref=e279]:
                - generic "Seleccionar todos los colaboradores visibles (página y filtros actuales)" [ref=e280] [cursor=pointer]:
                  - checkbox "Seleccionar todos" [ref=e281]
                  - generic [ref=e282]: Seleccionar todos
                - generic [ref=e283]: 0 seleccionados
                - button "Exportar" [ref=e284] [cursor=pointer]:
                  - img [ref=e285]
                  - text: Exportar
                - button "Desvincular seleccionados" [ref=e288] [cursor=pointer]:
                  - img [ref=e289]
                  - text: Desvincular seleccionados
            - generic [ref=e292]:
              - article [ref=e293]:
                - generic [ref=e295]:
                  - generic [ref=e296]: CQ
                  - generic [ref=e298]: Vencido
                - generic [ref=e300]:
                  - heading "Colaborador QA 1" [level=4] [ref=e301]
                  - paragraph [ref=e302]:
                    - generic "Analista de operaciones" [ref=e303]
                  - paragraph [ref=e304]: CC 1000000001 · Transportes Antares
                - img "Venció hace 271 días" [ref=e305]:
                  - generic [ref=e306]:
                    - strong [ref=e309]: "9"
                    - generic [ref=e310]: meses
                  - list [ref=e311]:
                    - listitem [ref=e312]:
                      - generic [ref=e313]: Contrato
                      - strong [ref=e314]: Término fijo
                    - listitem [ref=e315]:
                      - generic [ref=e316]: Base
                      - strong [ref=e317]: $1,8 M
                    - listitem [ref=e318]:
                      - generic [ref=e319]: Vence
                      - strong [ref=e320]: 15/01/2026
                - paragraph [ref=e321]: Venció hace 271 días
                - generic [ref=e322]:
                  - generic [ref=e323]:
                    - generic "Seleccionar" [ref=e324] [cursor=pointer]:
                      - checkbox "Seleccionar Colaborador QA 1" [ref=e325]
                    - link "+57 300 111 22 33" [ref=e327] [cursor=pointer]:
                      - /url: tel:3001112233
                      - img [ref=e328]
                      - generic [ref=e330]: +57 300 111 22 33
                  - generic [ref=e331]:
                    - button "Ver perfil" [ref=e332] [cursor=pointer]:
                      - img [ref=e333]
                      - generic [ref=e336]: Ver perfil
                    - button "Editar Colaborador QA 1" [ref=e337] [cursor=pointer]:
                      - img [ref=e338]
                    - group [ref=e341]:
                      - generic "Más acciones" [ref=e342] [cursor=pointer]:
                        - img [ref=e343]
              - article [ref=e347]:
                - generic [ref=e349]:
                  - generic [ref=e350]: CQ
                  - generic [ref=e352]: Vencido
                - generic [ref=e354]:
                  - heading "Colaborador QA 2" [level=4] [ref=e355]
                  - paragraph [ref=e356]:
                    - generic "Analista de operaciones" [ref=e357]
                  - paragraph [ref=e358]: CC 1000000002 · Transportes Antares
                - img "Venció hace 271 días" [ref=e359]:
                  - generic [ref=e360]:
                    - strong [ref=e363]: "9"
                    - generic [ref=e364]: meses
                  - list [ref=e365]:
                    - listitem [ref=e366]:
                      - generic [ref=e367]: Contrato
                      - strong [ref=e368]: Término fijo
                    - listitem [ref=e369]:
                      - generic [ref=e370]: Base
                      - strong [ref=e371]: $1,8 M
                    - listitem [ref=e372]:
                      - generic [ref=e373]: Vence
                      - strong [ref=e374]: 15/01/2026
                - paragraph [ref=e375]: Venció hace 271 días
                - generic [ref=e376]:
                  - generic [ref=e377]:
                    - generic "Seleccionar" [ref=e378] [cursor=pointer]:
                      - checkbox "Seleccionar Colaborador QA 2" [ref=e379]
                    - link "+57 300 111 22 33" [ref=e381] [cursor=pointer]:
                      - /url: tel:3001112233
                      - img [ref=e382]
                      - generic [ref=e384]: +57 300 111 22 33
                  - generic [ref=e385]:
                    - button "Ver perfil" [ref=e386] [cursor=pointer]:
                      - img [ref=e387]
                      - generic [ref=e390]: Ver perfil
                    - button "Editar Colaborador QA 2" [ref=e391] [cursor=pointer]:
                      - img [ref=e392]
                    - group [ref=e395]:
                      - generic "Más acciones" [ref=e396] [cursor=pointer]:
                        - img [ref=e397]
              - article [ref=e401]:
                - generic [ref=e403]:
                  - generic [ref=e404]: CQ
                  - generic [ref=e406]: Vencido
                - generic [ref=e408]:
                  - heading "Colaborador QA 3" [level=4] [ref=e409]
                  - paragraph [ref=e410]:
                    - generic "Analista de operaciones" [ref=e411]
                  - paragraph [ref=e412]: CC 1000000003 · Transportes Antares
                - img "Venció hace 271 días" [ref=e413]:
                  - generic [ref=e414]:
                    - strong [ref=e417]: "9"
                    - generic [ref=e418]: meses
                  - list [ref=e419]:
                    - listitem [ref=e420]:
                      - generic [ref=e421]: Contrato
                      - strong [ref=e422]: Término fijo
                    - listitem [ref=e423]:
                      - generic [ref=e424]: Base
                      - strong [ref=e425]: $1,8 M
                    - listitem [ref=e426]:
                      - generic [ref=e427]: Vence
                      - strong [ref=e428]: 15/01/2026
                - paragraph [ref=e429]: Venció hace 271 días
                - generic [ref=e430]:
                  - generic [ref=e431]:
                    - generic "Seleccionar" [ref=e432] [cursor=pointer]:
                      - checkbox "Seleccionar Colaborador QA 3" [ref=e433]
                    - link "+57 300 111 22 33" [ref=e435] [cursor=pointer]:
                      - /url: tel:3001112233
                      - img [ref=e436]
                      - generic [ref=e438]: +57 300 111 22 33
                  - generic [ref=e439]:
                    - button "Ver perfil" [ref=e440] [cursor=pointer]:
                      - img [ref=e441]
                      - generic [ref=e444]: Ver perfil
                    - button "Editar Colaborador QA 3" [ref=e445] [cursor=pointer]:
                      - img [ref=e446]
                    - group [ref=e449]:
                      - generic "Más acciones" [ref=e450] [cursor=pointer]:
                        - img [ref=e451]
              - article [ref=e455]:
                - generic [ref=e457]:
                  - generic [ref=e458]: CQ
                  - generic [ref=e460]: Vencido
                - generic [ref=e462]:
                  - heading "Colaborador QA 4" [level=4] [ref=e463]
                  - paragraph [ref=e464]:
                    - generic "Analista de operaciones" [ref=e465]
                  - paragraph [ref=e466]: CC 1000000004 · Transportes Antares
                - img "Venció hace 271 días" [ref=e467]:
                  - generic [ref=e468]:
                    - strong [ref=e471]: "9"
                    - generic [ref=e472]: meses
                  - list [ref=e473]:
                    - listitem [ref=e474]:
                      - generic [ref=e475]: Contrato
                      - strong [ref=e476]: Término fijo
                    - listitem [ref=e477]:
                      - generic [ref=e478]: Base
                      - strong [ref=e479]: $1,8 M
                    - listitem [ref=e480]:
                      - generic [ref=e481]: Vence
                      - strong [ref=e482]: 15/01/2026
                - paragraph [ref=e483]: Venció hace 271 días
                - generic [ref=e484]:
                  - generic [ref=e485]:
                    - generic "Seleccionar" [ref=e486] [cursor=pointer]:
                      - checkbox "Seleccionar Colaborador QA 4" [ref=e487]
                    - link "+57 300 111 22 33" [ref=e489] [cursor=pointer]:
                      - /url: tel:3001112233
                      - img [ref=e490]
                      - generic [ref=e492]: +57 300 111 22 33
                  - generic [ref=e493]:
                    - button "Ver perfil" [ref=e494] [cursor=pointer]:
                      - img [ref=e495]
                      - generic [ref=e498]: Ver perfil
                    - button "Editar Colaborador QA 4" [ref=e499] [cursor=pointer]:
                      - img [ref=e500]
                    - group [ref=e503]:
                      - generic "Más acciones" [ref=e504] [cursor=pointer]:
                        - img [ref=e505]
              - article [ref=e509]:
                - generic [ref=e511]:
                  - generic [ref=e512]: CQ
                  - generic [ref=e514]: Vencido
                - generic [ref=e516]:
                  - heading "Colaborador QA 5" [level=4] [ref=e517]
                  - paragraph [ref=e518]:
                    - generic "Analista de operaciones" [ref=e519]
                  - paragraph [ref=e520]: CC 1000000005 · Transportes Antares
                - img "Venció hace 271 días" [ref=e521]:
                  - generic [ref=e522]:
                    - strong [ref=e525]: "9"
                    - generic [ref=e526]: meses
                  - list [ref=e527]:
                    - listitem [ref=e528]:
                      - generic [ref=e529]: Contrato
                      - strong [ref=e530]: Término fijo
                    - listitem [ref=e531]:
                      - generic [ref=e532]: Base
                      - strong [ref=e533]: $1,8 M
                    - listitem [ref=e534]:
                      - generic [ref=e535]: Vence
                      - strong [ref=e536]: 15/01/2026
                - paragraph [ref=e537]: Venció hace 271 días
                - generic [ref=e538]:
                  - generic [ref=e539]:
                    - generic "Seleccionar" [ref=e540] [cursor=pointer]:
                      - checkbox "Seleccionar Colaborador QA 5" [ref=e541]
                    - link "+57 300 111 22 33" [ref=e543] [cursor=pointer]:
                      - /url: tel:3001112233
                      - img [ref=e544]
                      - generic [ref=e546]: +57 300 111 22 33
                  - generic [ref=e547]:
                    - button "Ver perfil" [ref=e548] [cursor=pointer]:
                      - img [ref=e549]
                      - generic [ref=e552]: Ver perfil
                    - button "Editar Colaborador QA 5" [ref=e553] [cursor=pointer]:
                      - img [ref=e554]
                    - group [ref=e557]:
                      - generic "Más acciones" [ref=e558] [cursor=pointer]:
                        - img [ref=e559]
              - article [ref=e563]:
                - generic [ref=e565]:
                  - generic [ref=e566]: CQ
                  - generic [ref=e568]: Vencido
                - generic [ref=e570]:
                  - heading "Colaborador QA 6" [level=4] [ref=e571]
                  - paragraph [ref=e572]:
                    - generic "Analista de operaciones" [ref=e573]
                  - paragraph [ref=e574]: CC 1000000006 · Transportes Antares
                - img "Venció hace 271 días" [ref=e575]:
                  - generic [ref=e576]:
                    - strong [ref=e579]: "9"
                    - generic [ref=e580]: meses
                  - list [ref=e581]:
                    - listitem [ref=e582]:
                      - generic [ref=e583]: Contrato
                      - strong [ref=e584]: Término fijo
                    - listitem [ref=e585]:
                      - generic [ref=e586]: Base
                      - strong [ref=e587]: $1,8 M
                    - listitem [ref=e588]:
                      - generic [ref=e589]: Vence
                      - strong [ref=e590]: 15/01/2026
                - paragraph [ref=e591]: Venció hace 271 días
                - generic [ref=e592]:
                  - generic [ref=e593]:
                    - generic "Seleccionar" [ref=e594] [cursor=pointer]:
                      - checkbox "Seleccionar Colaborador QA 6" [ref=e595]
                    - link "+57 300 111 22 33" [ref=e597] [cursor=pointer]:
                      - /url: tel:3001112233
                      - img [ref=e598]
                      - generic [ref=e600]: +57 300 111 22 33
                  - generic [ref=e601]:
                    - button "Ver perfil" [ref=e602] [cursor=pointer]:
                      - img [ref=e603]
                      - generic [ref=e606]: Ver perfil
                    - button "Editar Colaborador QA 6" [ref=e607] [cursor=pointer]:
                      - img [ref=e608]
                    - group [ref=e611]:
                      - generic "Más acciones" [ref=e612] [cursor=pointer]:
                        - img [ref=e613]
              - article [ref=e617]:
                - generic [ref=e619]:
                  - generic [ref=e620]: CQ
                  - generic [ref=e622]: Vencido
                - generic [ref=e624]:
                  - heading "Colaborador QA 7" [level=4] [ref=e625]
                  - paragraph [ref=e626]:
                    - generic "Analista de operaciones" [ref=e627]
                  - paragraph [ref=e628]: CC 1000000007 · Transportes Antares
                - img "Venció hace 271 días" [ref=e629]:
                  - generic [ref=e630]:
                    - strong [ref=e633]: "9"
                    - generic [ref=e634]: meses
                  - list [ref=e635]:
                    - listitem [ref=e636]:
                      - generic [ref=e637]: Contrato
                      - strong [ref=e638]: Término fijo
                    - listitem [ref=e639]:
                      - generic [ref=e640]: Base
                      - strong [ref=e641]: $1,8 M
                    - listitem [ref=e642]:
                      - generic [ref=e643]: Vence
                      - strong [ref=e644]: 15/01/2026
                - paragraph [ref=e645]: Venció hace 271 días
                - generic [ref=e646]:
                  - generic [ref=e647]:
                    - generic "Seleccionar" [ref=e648] [cursor=pointer]:
                      - checkbox "Seleccionar Colaborador QA 7" [ref=e649]
                    - link "+57 300 111 22 33" [ref=e651] [cursor=pointer]:
                      - /url: tel:3001112233
                      - img [ref=e652]
                      - generic [ref=e654]: +57 300 111 22 33
                  - generic [ref=e655]:
                    - button "Ver perfil" [ref=e656] [cursor=pointer]:
                      - img [ref=e657]
                      - generic [ref=e660]: Ver perfil
                    - button "Editar Colaborador QA 7" [ref=e661] [cursor=pointer]:
                      - img [ref=e662]
                    - group [ref=e665]:
                      - generic "Más acciones" [ref=e666] [cursor=pointer]:
                        - img [ref=e667]
              - article [ref=e671]:
                - generic [ref=e673]:
                  - generic [ref=e674]: CQ
                  - generic [ref=e676]: Vencido
                - generic [ref=e678]:
                  - heading "Colaborador QA 8" [level=4] [ref=e679]
                  - paragraph [ref=e680]:
                    - generic "Analista de operaciones" [ref=e681]
                  - paragraph [ref=e682]: CC 1000000008 · Transportes Antares
                - img "Venció hace 271 días" [ref=e683]:
                  - generic [ref=e684]:
                    - strong [ref=e687]: "9"
                    - generic [ref=e688]: meses
                  - list [ref=e689]:
                    - listitem [ref=e690]:
                      - generic [ref=e691]: Contrato
                      - strong [ref=e692]: Término fijo
                    - listitem [ref=e693]:
                      - generic [ref=e694]: Base
                      - strong [ref=e695]: $1,8 M
                    - listitem [ref=e696]:
                      - generic [ref=e697]: Vence
                      - strong [ref=e698]: 15/01/2026
                - paragraph [ref=e699]: Venció hace 271 días
                - generic [ref=e700]:
                  - generic [ref=e701]:
                    - generic "Seleccionar" [ref=e702] [cursor=pointer]:
                      - checkbox "Seleccionar Colaborador QA 8" [ref=e703]
                    - link "+57 300 111 22 33" [ref=e705] [cursor=pointer]:
                      - /url: tel:3001112233
                      - img [ref=e706]
                      - generic [ref=e708]: +57 300 111 22 33
                  - generic [ref=e709]:
                    - button "Ver perfil" [ref=e710] [cursor=pointer]:
                      - img [ref=e711]
                      - generic [ref=e714]: Ver perfil
                    - button "Editar Colaborador QA 8" [ref=e715] [cursor=pointer]:
                      - img [ref=e716]
                    - group [ref=e719]:
                      - generic "Más acciones" [ref=e720] [cursor=pointer]:
                        - img [ref=e721]
              - article [ref=e725]:
                - generic [ref=e727]:
                  - generic [ref=e728]: CQ
                  - generic [ref=e730]: Vencido
                - generic [ref=e732]:
                  - heading "Colaborador QA 9" [level=4] [ref=e733]
                  - paragraph [ref=e734]:
                    - generic "Analista de operaciones" [ref=e735]
                  - paragraph [ref=e736]: CC 1000000009 · Transportes Antares
                - img "Venció hace 271 días" [ref=e737]:
                  - generic [ref=e738]:
                    - strong [ref=e741]: "9"
                    - generic [ref=e742]: meses
                  - list [ref=e743]:
                    - listitem [ref=e744]:
                      - generic [ref=e745]: Contrato
                      - strong [ref=e746]: Término fijo
                    - listitem [ref=e747]:
                      - generic [ref=e748]: Base
                      - strong [ref=e749]: $1,8 M
                    - listitem [ref=e750]:
                      - generic [ref=e751]: Vence
                      - strong [ref=e752]: 15/01/2026
                - paragraph [ref=e753]: Venció hace 271 días
                - generic [ref=e754]:
                  - generic [ref=e755]:
                    - generic "Seleccionar" [ref=e756] [cursor=pointer]:
                      - checkbox "Seleccionar Colaborador QA 9" [ref=e757]
                    - link "+57 300 111 22 33" [ref=e759] [cursor=pointer]:
                      - /url: tel:3001112233
                      - img [ref=e760]
                      - generic [ref=e762]: +57 300 111 22 33
                  - generic [ref=e763]:
                    - button "Ver perfil" [ref=e764] [cursor=pointer]:
                      - img [ref=e765]
                      - generic [ref=e768]: Ver perfil
                    - button "Editar Colaborador QA 9" [ref=e769] [cursor=pointer]:
                      - img [ref=e770]
                    - group [ref=e773]:
                      - generic "Más acciones" [ref=e774] [cursor=pointer]:
                        - img [ref=e775]
              - article [ref=e779]:
                - generic [ref=e781]:
                  - generic [ref=e782]: CQ
                  - generic [ref=e784]: Vencido
                - generic [ref=e786]:
                  - heading "Colaborador QA 10" [level=4] [ref=e787]
                  - paragraph [ref=e788]:
                    - generic "Analista de operaciones" [ref=e789]
                  - paragraph [ref=e790]: CC 1000000010 · Transportes Antares
                - img "Venció hace 271 días" [ref=e791]:
                  - generic [ref=e792]:
                    - strong [ref=e795]: "9"
                    - generic [ref=e796]: meses
                  - list [ref=e797]:
                    - listitem [ref=e798]:
                      - generic [ref=e799]: Contrato
                      - strong [ref=e800]: Término fijo
                    - listitem [ref=e801]:
                      - generic [ref=e802]: Base
                      - strong [ref=e803]: $1,8 M
                    - listitem [ref=e804]:
                      - generic [ref=e805]: Vence
                      - strong [ref=e806]: 15/01/2026
                - paragraph [ref=e807]: Venció hace 271 días
                - generic [ref=e808]:
                  - generic [ref=e809]:
                    - generic "Seleccionar" [ref=e810] [cursor=pointer]:
                      - checkbox "Seleccionar Colaborador QA 10" [ref=e811]
                    - link "+57 300 111 22 33" [ref=e813] [cursor=pointer]:
                      - /url: tel:3001112233
                      - img [ref=e814]
                      - generic [ref=e816]: +57 300 111 22 33
                  - generic [ref=e817]:
                    - button "Ver perfil" [ref=e818] [cursor=pointer]:
                      - img [ref=e819]
                      - generic [ref=e822]: Ver perfil
                    - button "Editar Colaborador QA 10" [ref=e823] [cursor=pointer]:
                      - img [ref=e824]
                    - group [ref=e827]:
                      - generic "Más acciones" [ref=e828] [cursor=pointer]:
                        - img [ref=e829]
            - generic [ref=e833]:
              - paragraph [ref=e834]:
                - text: Mostrando
                - strong [ref=e835]: "1"
                - text: a
                - strong [ref=e836]: "10"
                - text: de
                - strong [ref=e837]: "24"
                - text: colaboradores
              - generic [ref=e838]:
                - combobox [ref=e840]:
                  - option "5 por página"
                  - option "10 por página" [selected]
                  - option "20 por página"
                  - option "50 por página"
                - generic [ref=e841]:
                  - button "Anterior" [disabled] [ref=e842]:
                    - img [ref=e843]
                  - button "Página 1" [ref=e845] [cursor=pointer]: "1"
                  - button "Página 2" [ref=e846] [cursor=pointer]: "2"
                  - button "Página 3" [ref=e847] [cursor=pointer]: "3"
                  - button "Siguiente" [ref=e848] [cursor=pointer]:
                    - img [ref=e849]
```

# Test source

```ts
  72  |       documentType: "CC",
  73  |       taxId: "1010101010",
  74  |       phone: "3001112233",
  75  |       department: "Bogota",
  76  |       city: "Bogota D.C.",
  77  |       address: "Cra 1 # 1-1",
  78  |       birthDate: "1990-01-01",
  79  |       permissions: []
  80  |     }
  81  |   ],
  82  |   [KEYS.companies]: [
  83  |     {
  84  |       id: "co-antares",
  85  |       name: "Transportes Antares",
  86  |       taxId: "900000001-0",
  87  |       companyKind: "propia",
  88  |       phone: "6011111111",
  89  |       email: "operaciones@antares.test",
  90  |       contactName: "Operaciones",
  91  |       department: "Bogota",
  92  |       city: "Bogota D.C.",
  93  |       address: "Sede principal"
  94  |     }
  95  |   ],
  96  |   [KEYS.counters]: {},
  97  |   [KEYS.positions]: [
  98  |     {
  99  |       id: "pos-analista",
  100 |       name: "Analista de operaciones",
  101 |       workerRole: "empleado",
  102 |       baseSalary: 1800000,
  103 |       contractTypeDefault: "Termino fijo",
  104 |       workSchedule: "Diurna",
  105 |       arlRiskLevel: "Nivel I",
  106 |       integralSalary: false,
  107 |       legalBasis: "CST",
  108 |       active: true,
  109 |       createdAt: now.toISOString()
  110 |     }
  111 |   ],
  112 |   [KEYS.payrollEmployees]: Array.from({ length: 24 }, (_, i) => makeEmployee(i + 1)),
  113 |   [KEYS.payrollRuns]: [],
  114 |   [KEYS.hrAbsences]: [],
  115 |   [KEYS.session]: {
  116 |     userId: "admin-1",
  117 |     role: "admin",
  118 |     email: "admin.qa@antares.test",
  119 |     lastActivityAt: Date.now(),
  120 |     profileSnapshot: {
  121 |       id: "admin-1",
  122 |       name: "Admin QA",
  123 |       email: "admin.qa@antares.test",
  124 |       role: "admin",
  125 |       requiresDataPolicyAcceptance: false,
  126 |       requiresTermsAcceptance: false,
  127 |       dataPolicyAcceptedAt: now.toISOString(),
  128 |       termsAcceptedAt: now.toISOString(),
  129 |       dataPolicyVersion: "2025-v1",
  130 |       firstName: "Admin"
  131 |     }
  132 |   },
  133 |   [KEYS.payrollWorkspace]: "data"
  134 | };
  135 | 
  136 | test("paginación de colaboradores: registros por página", async ({ page, context }) => {
  137 |   await context.addInitScript((payload) => {
  138 |     const rawKeys = new Set([
  139 |       "antares_portal_data_ver",
  140 |       "antares_users_storage_ver",
  141 |       "antares_hr_payroll_workspace_v1"
  142 |     ]);
  143 |     localStorage.clear();
  144 |     Object.entries(payload).forEach(([key, value]) => {
  145 |       localStorage.setItem(key, rawKeys.has(key) ? String(value) : JSON.stringify(value));
  146 |     });
  147 |   }, seedStore);
  148 | 
  149 |   await page.goto(`${BASE_URL}#portal/payroll`, { waitUntil: "domcontentloaded" });
  150 |   await page.waitForSelector("#payroll-employees-page-size", { timeout: 20000 });
  151 |   await page.locator("[data-action='hr-workspace-tab'][data-module='payroll'][data-tab='data']").click();
  152 |   await page.locator("[data-action='payroll-data-section'][data-section='employees']").click();
  153 |   await page.waitForSelector(".hr-cred-grid .hr-cred, .ag-roster .ag-roster-card", { timeout: 15000 });
  154 | 
  155 |   const countCards = () =>
  156 |     page.locator(".hr-cred-grid .hr-cred, .ag-roster .ag-roster-card").count();
  157 | 
  158 |   await expect(page.locator(".payroll-contracts-pagination__meta")).toContainText("de 24");
  159 |   const initial = await countCards();
  160 |   expect(initial).toBe(10);
  161 | 
  162 |   const debug = await page.evaluate(() => ({
  163 |     bound: Boolean(window.__payrollEmployeesPagingBound),
  164 |     apply: typeof window.__applyPayrollEmployeesPaging,
  165 |     selects: [...document.querySelectorAll("#payroll-employees-page-size")].map((el) => ({
  166 |       value: el.value,
  167 |       action: el.getAttribute("data-action"),
  168 |       inView: Boolean(el.closest("[data-payroll-panel], #portal-view, [data-view-root]"))
  169 |     })),
  170 |     pageSize: window.state?.payrollUi?.employeesPageSize
  171 |   }));
> 172 |   expect(debug, JSON.stringify(debug)).toMatchObject({ bound: true, apply: "function" });
      |                                        ^ Error: {"bound":false,"apply":"undefined","selects":[{"value":"10","action":"payroll-employees-page-size","inView":true}],"pageSize":10}
  173 | 
  174 |   await page.locator("#payroll-employees-page-size").selectOption("20", { force: true });
  175 |   await page.evaluate(() => {
  176 |     const sel = document.getElementById("payroll-employees-page-size");
  177 |     if (!sel) throw new Error("select missing");
  178 |     sel.value = "20";
  179 |     sel.dispatchEvent(new Event("change", { bubbles: true }));
  180 |   });
  181 |   await expect.poll(async () => page.locator(".payroll-contracts-pagination__meta").textContent()).toMatch(/1 a 20 de 24/);
  182 |   await expect(page.locator("#payroll-employees-page-size")).toHaveValue("20");
  183 |   expect(await countCards()).toBe(20);
  184 | 
  185 |   await page.evaluate(() => {
  186 |     const sel = document.getElementById("payroll-employees-page-size");
  187 |     sel.value = "5";
  188 |     sel.dispatchEvent(new Event("change", { bubbles: true }));
  189 |   });
  190 |   await expect.poll(async () => page.locator(".payroll-contracts-pagination__meta").textContent()).toMatch(/1 a 5 de 24/);
  191 |   await expect(page.locator("#payroll-employees-page-size")).toHaveValue("5");
  192 |   expect(await countCards()).toBe(5);
  193 | });
  194 | 
```