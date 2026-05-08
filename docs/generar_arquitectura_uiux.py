# -*- coding: utf-8 -*-
"""
Genera Antares_Arquitectura_UI_UX.docx — arquitectura, modelo de datos,
sistema de diseño y wireframes alineados al código en index.html, styles.css,
app.js y apps/api + BD/postgres.
"""
from pathlib import Path

from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH


def add_title(doc: Document, text: str, size_pt: int = 18):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(size_pt)


def add_h(doc: Document, text: str, level: int = 1):
    return doc.add_heading(text, level=level)


def add_p(doc: Document, text: str, bold: bool = False):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = bold
    run.font.size = Pt(11)
    return p


def add_mono(doc: Document, text: str, size: int = 9):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = "Consolas"
    run.font.size = Pt(size)
    return p


def add_table2(doc: Document, headers: list[str], rows: list[list[str]]):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = "Table Grid"
    hdr = t.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = h
    for ri, row in enumerate(rows):
        cells = t.rows[ri + 1].cells
        for ci, val in enumerate(row):
            cells[ci].text = val


def main():
    root = Path(__file__).resolve().parents[1]
    out = Path(__file__).resolve().parent / "Antares_Arquitectura_UI_UX.docx"
    doc = Document()
    n = doc.styles["Normal"]
    n.font.name = "Calibri"
    n.font.size = Pt(11)

    add_title(
        doc,
        "Transportes Antares S.A.S\nArquitectura de software — Sistema de diseño UI/UX\nModelo de datos y mockups de referencia",
        17,
    )
    add_p(
        doc,
        "Documento descriptivo del estado actual del repositorio Antares Nuevo "
        "(sitio público SPA, portal operativo integrado y API NestJS). "
        f"Fuente código: `{root}`",
    )
    add_p(doc, "")
    meta = doc.add_paragraph()
    meta.add_run("Versión: 1.0 — referencia técnica y de producto para stakeholders y desarrollo.")

    doc.add_page_break()

    add_h(doc, "1. Alcance del producto", 1)
    add_p(
        doc,
        "Dos caras coherentes sobre la misma identidad corporativa: (a) página de marca y captación "
        "B2B con formulario de contacto y contenido institucional; (b) portal autenticado para clientes "
        "y equipo interno según rol, con flujos operativos (solicitudes de transporte, flota, nómina, RRHH "
        "y aprobaciones). El front principal vive como aplicación contenida en `index.html`, `styles.css` "
        "y `app.js` (~Vanilla JS) con tema claro/oscuro e internacionalización (ES/en). Una API opcional "
        "en `apps/api` (NestJS) persiste contra PostgreSQL (Supabase/Render).",
    )

    add_h(doc, "2. Vista de arquitectura técnica", 1)

    add_h(doc, "2.1 Diagrama lógico (componentes)", 2)
    add_mono(
        doc,
        """  [Visitante / Usuario navegador]
            |  HTTPS + CSP meta (Turnstile, fuentes Google)
            v
      +-----------+       JWT /cookies        +------------------+
      | index.html | <----------------------> | NestJS api (4000)|
      | app.js    |    /api/auth, /portal/... | AppModule       |
      +-----------+                          +--------+---------+
            | POST sync /bootstrap                      |
            | localStorage KEYS.*                       | pg Pool
            v                                           v
      [localStorage borrador ]              [PostgreSQL - esquema public]
                                                       Supabase opcional""",
        10,
    )
    add_p(
        doc,
        "Los datos del portal pueden operar offline-first mediante `localStorage` y escritura al servidor cuando "
        "la API está configurada (`writeAwaitServer`, bootstrap `/portal/sync`). PostgreSQL replica el modelo "
        "de colecciones con comentarios `KEYS.<nombre>` en los scripts SQL.",
    )

    add_h(doc, "2.2 Módulos de la API (NestJS)", 2)
    add_table2(
        doc,
        ["Módulo", "Propósito"],
        [
            ["ConfigModule / Throttler", "Variables `.env`; límite 80 req/min por IP."],
            ["DatabaseModule + pg Pool", "Conexión Postgres; zona horaria de sesión `America/Bogota` donde aplica."],
            ["AuthModule", "JWT (access token), bcrypt, Passport, Turnstile, correo recuperación/aprobación."],
            ["PortalModule", "Bootstrap, sincronización de entidades (empresas, usuarios, nómina, viajes…)."],
            ["PayrollModule", "Liquidación/colombiano, autocorte por periodicidad Bogotá, `@nestjs/schedule`."],
            ["FilesModule / UploadsModule", "Documentos firmados/presigned (ej. R2/S3 según configuración)."],
            ["MailModule", "Resend / alternativas."],
            ["B2bProspectModule", "Prospectos formulario institucional."],
        ],
    )

    add_h(doc, "2.3 Seguridad y cabeceras", 2)
    add_table2(
        doc,
        ["Capa", "Detalle"],
        [
            ["CORS", "Lista explícita dev + dominios prod Antares (*.vercel, pages.dev opcional); credenciales."],
            ["API", "`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, Referrer-Policy."],
            ["Front", "CSP en meta (base-uri, frame-ancestors, form-action), Turnstile anti-bot en auth."],
            ["Validación", "ValidationPipe global Nest (whitelist, forbidNonWhitelisted)."],
        ],
    )

    add_h(doc, "2.4 Front secundario", 2)
    add_p(
        doc,
        "Existe `apps/web` (Next.js + Tailwind) con variables de marca alineadas en `globals.css`. "
        "La experiencia principal documentada aquí corresponde al SPA raíz (`index.html` + `styles.css`).",
    )

    doc.add_page_break()

    add_h(doc, "3. Sistema de diseño UI", 1)
    add_p(
        doc,
        "Las variables CSS en `:root` y `body[data-theme=\"dark\"]` definen el sistema visual: paleta corporativa azul Antares, "
        "elevación de tarjetas, radios y tipografía institucional. No hay librería de componentes tipo Material; los patrones son "
        "clases CSS reutilizables (`.btn`, `.card`, `.glass-card`, secciones hero/section-soft).",
    )

    add_h(doc, "3.1 Tokens de color (modo claro — referencia `:root`)", 2)
    add_table2(
        doc,
        ["Token CSS", "Hex / uso"],
        [
            ["--brand-blue-deep / --primary", "#377CC0 · acento marca, enlaces fuertes, theme-color meta"],
            ["--brand-blue-mid / --accent", "#83BEE9 · acentos suaves"],
            ["--brand-blue-soft", "#CCE5F8 · fondos de módulos"],
            ["--primary-dark / --primary-deeper", "#2A6399 · #1E4A73 · profundidad en gradientes"],
            ["--text / --text-soft", "#0B2138 · #3A5A78"],
            ["--line", "#B8D4EB · bordes"],
            ["--success / --warning / --danger", "#1B8E5F · #F59F00 · #D62828"],
            ["Hero gradient", "linear 135deg: #1E4A73 → #377CC0 → #83BEE9"],
            ["Sombras tarjeta/botón", "rgba(primary-rgb) con radios 16px / 10px"],
        ],
    )

    add_h(doc, "3.2 Modo oscuro", 2)
    add_p(
        doc,
        "Al activar `data-theme=\"dark\"` en `body`, se invierten fondos (base #071824), texto claro, nav translúcida oscura, "
        "y sombras más profundas. La preferencia persiste en `localStorage` (`antares_theme_v1`). El arranque del portal "
        "oculta el sitio público brevemente si hay sesión válida para evitar parpadeo de tema.",
    )

    add_h(doc, "3.3 Tipografía", 2)
    add_table2(
        doc,
        ["Rol", "Familia (Google Fonts)"],
        [
            ["Display / títulos", "Montserrat 600 — variable `--font-display`"],
            ["Énfasis / CTA secundarios", "Poppins 600–700 — `--font-secondary`"],
            ["Cuerpo / formularios", "Roboto 400–500 — `--font-body`"],
        ],
    )
    add_p(doc, "Contenedor principal: `width: min(1180px, 92%)`; barra superior usa hasta 1360px.")

    add_h(doc, "3.4 Componentes y patrones de interfaz", 2)
    add_table2(
        doc,
        ["Patrón", "Comportamiento"],
        [
            ["Barra superior pública", "Sticky, blur, logo PNG, anclas a secciones, hamburguesa móvil, tema, idioma CO/US, CTA Portal"],
            ["Hero", "Imagen de fondo, overlay, siluetas animadas, logo en panel glass, stats en glass-card, botones primary/ghost"],
            ["Secciones", "Ondas SVG entre bloques, grids 2–3 columnas, cards con icono SVG stroke 2px"],
            ["Botones", "`.btn-primary` con sombra de marca; `.btn-ghost-light` sobre hero oscuro"],
            ["Portal", "Contenedor `#portal-app` reemplaza vista pública; backdrop de navegación móvil"],
            ["Notificaciones", "Toasts/aviso coherentes con colores semánticos"],
            ["Formularios RRHH/Nómina", "Catálogo `CO_CATALOGS` (selects coherentes país Colombia): periodicidad, EPS, contrato, etc."],
        ],
    )

    add_h(doc, "3.5 Accesibilidad y UX aplicada", 2)
    add_table2(
        doc,
        ["Tema", "Implementación observable"],
        [
            ["Aria", "Etiquetas en nav, aria-expanded en menú hamburguesa, tema e idioma con role group"],
            ["Contraste", "Texto oscuro sobre fondos claros; en oscuro texto #E8F4FC sobre base profunda"],
            ["Motion", "`scroll-behavior: smooth`; animaciones hero no bloqueantes con `prefers-*` donde aplica"],
            ["Sesión portal", "`antares_session_v2` + `lastActivityAt`; boot guard contra flash UI"],
        ],
    )

    doc.add_page_break()

    add_h(doc, "4. Mapa UX del sitio público (referencia `index.html`)", 1)
    add_mono(
        doc,
        """[#hero]            Marca · propuesta valor · KPIs · CTA contacto / login
[#about]           Quiénes somos · valores · estándar
[#trusted]         Carrusel/logo pills aliados
[#testimonials]    Experiencias
[#services]        Servicios
[#fleet]           Flota
[#process]         Proceso operativo
[#coverage]        Cobertura
[#news]            Actualidad
[#careers]         Carreras · formulario/contacto RH
[#contact]         Formulario institucional B2B""",
        9,
    )

    add_h(doc, "5. Mapa UX del portal (SPA `app.js`)", 1)
    add_p(
        doc,
        "Las vistas renderizadas dependen del rol (`ROLES`): administración usa módulos ampliados; cliente ve solicitudes "
        "y dashboards acotados. Los datos siguen colecciones lógicas mapeadas a tablas Postgres al sincronizar.",
    )
    add_table2(
        doc,
        ["Colección lógica (KEYS.*)", "Tabla Postgres principal"],
        [
            ["users → usuarios", "Perfil portal, estado cuenta, empresa"],
            ["companies → empresas", "NIT, tipo relación, activo"],
            ["requests → solicitudes_transporte", "Flujo cliente-operatorio"],
            ["vehicles / drivers → vehiculos / conductores", "Capacidad, licencias, ocupación sistema"],
            ["payrollEmployees → empleados_nomina", "Incl. periodicidad_pago homologada con formulario alta"],
            ["payrollRuns → liquidaciones_nomina", "Conceptos legales CO, periodos YYYY-MM (+ sufijos cortes migr. 23)"],
            ["hrAbsences → ausencias_laborales", ""],
            ["vacancies → vacantes", ""],
            ["candidates → candidatos", ""],
            ["interviews → entrevistas", ""],
            ["contracts → contratos", ""],
            ["positions → cargos", ""],
            ["approvals → solicitudes_autorizacion", ""],
            ["notifications → notificaciones", ""],
            ["tripRouteRates → tarifas_trayecto", ""],
        ],
    )

    doc.add_page_break()

    add_h(doc, "6. Modelo de datos (PostgreSQL — scripts `BD/postgres`)", 1)
    add_p(
        doc,
        "Los módulos DDL están segregados por dominio. Tipos ENUM en `02_enums.sql`. RLS opcional (`09_rls_tablas.sql`, `10_rls_storage_supabase.sql`). "
        "Comentarios en tablas relacionan cada entidad con la clave en el SPA.",
    )
    add_table2(
        doc,
        ["Archivo base", "Contenido resumido"],
        [
            ["01_extensions.sql", "Extensiones Postgres necesarias"],
            ["02_enums.sql", "Roles, estados solicitud/aprobación, etc."],
            ["03_nucleo_empresa_usuarios.sql", "empresas, usuarios, permisos_usuario, reglas_viatico, parametros_sistema"],
            ["04_transporte.sql", "vehiculos, conductores, tarifas_trayecto, solicitudes_transporte, viajes_transporte, combustible/logs si aplica"],
            ["05_rrhh.sql", "cargos, vacantes, candidatos, entrevistas, contratos, empleados_nomina, liquidaciones_nomina, ausencias, SST"],
            ["06_sistema.sql", "notificaciones, correos_salida, prospectos B2B, contadores_secuencia, solicitudes_autorizacion, sesiones_usuario"],
            ["Migraciones posteriores (15–23)", "Aprobaciones admin, empresa activo tipo relación, columnas usuarios/registro, liquidación automática, periodos extendidos, etc."],
        ],
    )
    add_p(
        doc,
        "Nota: para `periodo_mes` extendido por periodicidad quincenal/semanal, aplicar migración 23 cuando corresponda; "
        "el motor de cortes opera en America/Bogota.",
        bold=False,
    )

    doc.add_page_break()

    add_h(doc, "7. Mockups tipo wireframe (basados en la interfaz vigente)", 1)
    add_p(doc, "Texto monocolumna ASCII; pueden sustituirse en Word por capturas de pantalla reales del mismo layout.")

    add_h(doc, "7.1 Barra pública desktop", 2)
    add_mono(
        doc,
        """ +-----------------------------------------------------------------------------+
 | [PNG Logo Antares …. ]   Inicio Nosotros … Contacto             ☀️ 🌙 🇨🇴 🇺🇸  [ Portal ]
 +-----------------------------------------------------------------------------+
 Fondo blur claro (#fff ~90% opacity), borde inferior sutil marca, links hover con fondo primary 9%.
""",
        9,
    )

    add_h(doc, "7.2 Hero", 2)
    add_mono(
        doc,
        """ +------------------------------------------------------------+
 | ████ foto ruta/flora blur + overlay gradiente marca          |
 |                                                               |
 |  [ Logo grande panel glass ]   Kicker ⚡ texto                |
 |                                 H1 dos líneas + acento cyan   |
 |                                 párrafo                       |
 |     [ Solicitar propuesta ]  [ Ingresar al portal ]          |
 |     +----------+ +----------+ +----------+
 |     | entregas | | cumpl.  | | < 12 min |   (glass cards)
 |     +----------+ +----------+ +----------+
 +----------------------------------------------------------------+""",
        9,
    )

    add_h(doc, "7.3 Sección institucional (grid 3 cards)", 2)
    add_mono(
        doc,
        """ +-----------------+  +-----------------+  +-----------------+
 | [icon línea]    |  | [icon corazón]  |  | [icon escudo]   |
 | H2 Quiénes …    |  | H2 Valores      |  | H2 Estándar     |
 | texto/markdown  |  | lista bullets   |  | párrafo         |
 +-----------------+  +-----------------+  +-----------------+""",
        9,
    )

    add_h(doc, "7.4 Portal autenticado (shell)", 2)
    add_mono(
        doc,
        """ +----------------------------------------------------------+
 | Barra contextual portal (nombre usuario, empresa, logout) |
 +----------+-----------------------------------------------+
 | Nav      | Area contenido: solicitudes | nómina | flota …     |
 | (rol)    | dentro de .module-card / tablas responsive        |
 |          | acciones btn-primary header                       |
 +----------+-----------------------------------------------+
 En móvil: backdrop oscuro cuando nav lateral / drawer abierto.""",
        9,
    )

    add_h(doc, "7.5 Formulario alta empleado (fragmento RRHH)", 2)
    add_mono(
        doc,
        """ +-------------------------------------------------------+
 | Datos personales                                      |
 | nombre | tipo doc | N° doc | fecha nacimiento …       |
 | cargo (select cargos activos) | contrato …            |
 | …                                                      |
 | Nómina: salario | auxilio transporte | Periodicidad ◄──┐
 |    [ Mensual ▼ ][ Quincenal ][ Semanal ][ Catorcenal ]  │
 | EPS | Pensión | ARL | Cesantías | …                    |
 +-------------------------------------------------------+
 El valor canonico en BD tras sync: periodicidad_pago = mismo texto catálogo.
""",
        9,
    )

    doc.add_page_break()

    add_h(doc, "8. Flujos destacados desde UX", 1)
    add_table2(
        doc,
        ["Flujo", "Puntos UI"],
        [
            ["Registro cliente", "Form auth + Turnstile; checklist términos; posible cuenta pendiente de aprobación"],
            ["Nueva solicitud transporte", "Wizard fechas/ciudades/tonelaje; cliente ve estados Pendiente/Aprobado…"],
            ["Aprobación admin", "`solicitudes_autorizacion` + vistas cola bandeja portal"],
            ["Nómina automática", "Cron Bogotá; cortes por periodicidad desde `empleados_nomina.periodicidad_pago`"],
            ["Tema idioma", "Toggle persistente antes de cargar vistas"],
        ],
    )

    add_h(doc, "9. Roadmap técnico sugerido (no implementado fuera de código)", 1)
    add_p(
        doc,
        "(1) Unificar totalmente SPA y `apps/web` o documentar públicamente cuál es canónico. "
        "(2) Storybook o guía CSS de tokens exportados desde `styles.css`. "
        "(3) Capturas profesionales en este documento. "
        "(4) Diagrama ER automatizado desde migraciones. ",
    )

    add_h(doc, "10. Glosario", 1)
    add_table2(
        doc,
        ["Término", "Significado en Antares"],
        [
            ["KEYS.* / localStorage", "Sincronización con filas servidor y caché local"],
            ["Bootstrap portal", "Hidratación inicial desde API después del login"],
            ["periodicity / payFrequency / periodicidad_pago", "Misma nómina: etiquetas Mensual–Catorcenal"],
            ["periodo_mes", "clave periodo fiscal de liquidación incl. sufijos cortes cuando migración 23 aplique"],
            ["Glass card", "Panel semitranslúcido con blur ligero en hero/estadística"],
        ],
    )

    add_p(doc, "")
    add_p(doc, f"Archivo generado automáticamente por `docs/generar_arquitectura_uiux.py` → `{out.name}`.")

    doc.save(out)
    print(out)


if __name__ == "__main__":
    main()
