# Gestión documental — checklist de verificación manual

Usar tras cada despliegue del rediseño (fases A–D). Marcar cada ítem en escritorio, dark mode y al menos un viewport móvil.

## Fase A — Fundaciones

- [ ] Al abrir el módulo se ve el shell: rail izquierdo + encabezado + área de contenido.
- [ ] Tokens visuales: radios 12–16px, sombras suaves, tipografía Poppins/Montserrat.
- [ ] Skeletons aparecen si el portal aún está hidratando y no hay documentos.
- [ ] Empty states: sin resultados con filtros, expediente vacío, sin permiso (rol restringido).
- [ ] Tooltips accesibles en botones icónicos (hover/focus muestran el globo, no solo `title`).
- [ ] Menú kebab: Abrir con clic; flechas arriba/abajo; Enter activa; Escape cierra.
- [ ] Focus visible (anillo) en botones, checkboxes, enlaces del rail y cabeceras de tabla.
- [ ] `prefers-reduced-motion`: animaciones reducidas o desactivadas.

## Fase B — Datos y vistas

- [ ] Rail: Resumen, Todos, Recientes, Favoritos, Por vencer, Vencidos, Incompletos, Expedientes.
- [ ] Vista **Todos los documentos**: índice transversal de todos los expedientes.
- [ ] Tabla: cabecera sticky, orden por columna (`aria-sort` cambia), checkboxes y select-all indeterminado.
- [ ] Vistas Tarjetas y Lista cambian el layout sin perder filtros.
- [ ] En ≤900px la opción Tabla no se ofrece y el listado se muestra en tarjetas.
- [ ] Búsqueda con debounce (~220 ms) conserva el caret.
- [ ] Filtros avanzados (popover): colaborador, tipo, carpeta, estado, fechas, autor, tamaño, solo versión vigente.
- [ ] Chips de filtro activo; “Limpiar” restablece todo.
- [ ] “Ver más” carga la siguiente ventana de 60 filas.
- [ ] Selección múltiple: barra flotante con ZIP, CSV, Mover, Eliminar.
- [ ] Export CSV del listado filtrado descarga un archivo válido.
- [ ] ZIP de carpetas (modal) y ZIP de una carpeta desde expedientes.

## Fase C — Productividad

- [ ] Clic en fila/tarjeta abre el panel de detalle con los campos: nombre, tipo, categoría, estado, responsable, autor, versión, tamaño, fechas, código, permisos.
- [ ] Botón × del drawer cierra el panel (también Escape).
- [ ] Vista previa (PDF/imagen) y descarga funcionan.
- [ ] Cadena de versiones (mismo colaborador + carpeta + tipo) y documentos relacionados.
- [ ] Actividad del documento (auditoría filtrada por `entityId`).
- [ ] Favoritos: estrella persiste en `localStorage` y alimenta la sección Favoritos.
- [ ] Recientes: abrir/descargar/previsualizar alimenta Recientes y Accesos rápidos del rail.
- [ ] Arrastrar archivos del sistema al área de contenido abre el flujo de subida.
- [ ] Arrastrar una fila sobre una carpeta (en Expedientes) mueve el documento.
- [ ] Menú contextual (kebab) por fila: previsualizar, descargar, editar, mover, eliminar, abrir expediente.

## Fase D — Resumen

- [ ] Sección Resumen: métricas clicables (documentos, por vencer, vencidos, incompletos, cumplimiento, nuevos 30 días).
- [ ] Alertas de vencimiento enlazan al detalle del documento.
- [ ] Lista de expedientes incompletos navega al colaborador.
- [ ] Feed de actividad reciente del módulo.
- [ ] CTA “Subir documento” y “Explorar expedientes”.

## Subida y carpetas

- [ ] Botón Subir abre drawer (no pestaña).
- [ ] Checklist de tipos, dropzone multiarchivo, metadatos opcionales.
- [ ] Crear carpeta / eliminar carpeta (documentos pasan a General).
- [ ] Tras subir, se abre el expediente del colaborador en la carpeta destino.
- [ ] Scrim: clic fuera cierra rail móvil o drawer de subida.

## Responsive

| Ancho | Comprobar |
|------|-----------|
| ≥1440px | Rail expandido, drawer de detalle en columna |
| 1100–1439px | Drawer superpuesto; columnas `p1` ocultas en tabla |
| 900–1099px | Rail colapsable; columnas `p2` ocultas |
| ≤900px | Rail como drawer; sin vista Tabla; toggle de menú visible |
| ≤720px | Drawer y subida como bottom-sheet; targets ≥44px; bulk bar usable |

## Accesibilidad WCAG 2.1 AA

- [ ] Contraste de texto ≥4.5:1 (`--doc-ink-faint` sobre blanco).
- [ ] Estado nunca solo por color (badge con glifo + texto).
- [ ] Navegación completa por teclado (rail, tabla, filtros, drawer, kebab, modales).
- [ ] `aria-live` anuncia el recuento de resultados / selección.
- [ ] Escape cierra: preview → export ZIP → upload → filtros → drawer → rail (en ese orden de prioridad).
- [ ] Lector de pantalla: captions de tabla, labels de checkboxes, tooltips con `aria-describedby`.

## Dark mode

- [ ] Rail, tabla, tarjetas, drawer, bulk bar y overlays legibles con `data-theme="dark"`.
- [ ] Badges de estado y focus ring visibles sobre fondos oscuros.

## Regresión rápida

- [ ] Permisos: sin `document_view` → estado de denegado; sin upload/edit/delete se ocultan las acciones.
- [ ] Cambio de sección persiste al recargar (sección + vista); filtros no persisten.
- [ ] No hay errores en consola al abrir, filtrar, seleccionar y subir.
