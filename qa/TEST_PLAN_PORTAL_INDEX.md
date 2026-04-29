# Test Plan - Index, Traduccion, Tema Oscuro y Modulos

## 1) Smoke tecnico (rapido)
- Ejecutar: `node qa/portal-regression-tests.mjs`
- Resultado esperado: `OK portal-regression-tests`
- Falla si: faltan secciones del index, reglas dark clave, modulos o flujo de contrato por empleado/candidato.

## 2) Index publico (funcional)
- **Navegacion:** cada ancla del header debe llevar a su seccion correcta.
- **Scroll spy:** al hacer scroll, el enlace activo debe cambiar por seccion visible.
- **Hero y CTA:** botones principales visibles, legibles y accionables.
- **Noticias/Testimonios:** media sin recortes fuertes y legible en ambos temas.
- **Contacto B2B wizard:** pasos 1-2-3, validaciones por paso y envio exitoso.

## 3) Traduccion ES/EN (funcional)
- Cambiar idioma varias veces y verificar:
  - no quedan frases mixtas (ES/EN) en la misma seccion.
  - `title` y `meta description` cambian con el idioma.
  - placeholders y labels del formulario cambian de idioma.
- Revisar auth modal (login/register/recover) completo en EN.
- Validar textos con iconos/botones (que no se rompa el layout).

## 4) Tema oscuro (visual + contraste)
- Revisar en dark:
  - header, cards, tablas, formularios, modales, badges, tabs.
  - contraste de texto secundario (`muted`) suficiente.
  - hover/focus visibles en botones y campos.
- Revisar footer en dark (sin bloques claros inesperados).

## 5) Modulos portal (E2E breve)
- **Dashboard:** KPIs y tablas legibles.
- **Mis solicitudes / Solicitudes:** filtros y estados visibles.
- **Transporte:** Solicitudes, Viajes, Camiones, Conductores, Calendario, Historial, Reporteria.
- **Recursos humanos:** Nomina, Contratacion.
- **Sistema:** Usuarios y permisos, Autorizaciones.
- **Mi perfil / Notificaciones / Cerrar sesion:** flujo correcto sin errores visuales.

## 6) Contratacion - caso clave nuevo
- En `Generar contrato`:
  - seleccionar `Candidato` contratado -> generar contrato OK.
  - seleccionar `Empleado` existente -> generar contrato OK.
  - validar autocompletado de cargo/empresa/salario cuando aplica.
  - para rol conductor, validar licencia y vencimiento.

## 7) Criterios de salida
- 0 errores JS en consola durante flujo principal.
- 0 mezclas ES/EN visibles en recorrido completo.
- 0 bloques de bajo contraste en dark en modulos criticos.
- Flujo de contrato funcional para candidato y empleado.
