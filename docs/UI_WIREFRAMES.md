# Diseño visual y wireframes (texto)

## Principios UI/UX
- Estilo moderno, limpio y corporativo.
- Alto contraste, foco visible y navegación por teclado.
- Jerarquía clara: títulos, acciones primarias, estados y feedback.
- Mobile-first con puntos de corte para tablet y desktop.

## Sistema de diseño
- **Tipografía:** Inter, fallback sans-serif.
- **Colores:**
  - Primario: `#42A5F5`
  - Primario oscuro: `#1976D2`
  - Fondo suave: `#E3F2FD`
  - Blanco: `#FFFFFF`
  - Grises para texto y bordes.
- **Componentes base:** botón, input, select, textarea, tarjeta, tabla, badge, modal, toast.

## Wireframe - Sitio público

### Home
1. Navbar fija (logo + menú + botón Login).
2. Hero a pantalla completa:
   - Título fuerte.
   - Subtítulo.
   - CTA "Contáctenos".
3. Sección "Quiénes somos".
4. Flota (3 tarjetas: turbo/camión/tractocamión + ficha técnica).
5. Servicios y ventajas.
6. Cobertura (rutas por ciudad/zona).
7. Formulario B2B.
8. Footer legal + redes + contacto.

## Wireframe - Portal cliente

1. Sidebar/topbar con navegación:
   - Dashboard
   - Solicitudes
   - Notificaciones
2. Dashboard:
   - Cards de métricas (pendientes, aprobadas, en tránsito, completadas).
3. Formulario de nueva solicitud:
   - Bloques origen/destino/carga/temperatura/adjuntos.
4. Tabla/lista de solicitudes:
   - Estado con badge.
   - Acciones según permisos.
5. Modal de detalle de viaje asignado.

## Wireframe - Panel admin

1. Bandeja de pendientes con temporizador.
2. Acciones rápidas:
   - Aprobar + asignar vehículo/conductor.
   - Rechazar con motivo.
   - Editar.
3. Gestión de flota y conductores (tablas CRUD).
4. Historial con filtros por fecha/cliente/estado.
5. Reportes con cards y barras simples.

## Wireframe - Nómina

1. Registro de empleados.
2. Cálculo de liquidación mensual.
3. Historial por empleado.
4. Exportar resumen consolidado.
5. Generar desprendible de pago (vista imprimible).

## Wireframe - Contratación

1. Vacantes (crear/publicar/cerrar).
2. Candidatos (registro + adjuntos).
3. Pipeline por estado.
4. Programación de entrevistas.
5. Contrato generado desde plantilla.

## Accesibilidad (WCAG 2.1 AA)
- Etiquetas semánticas y `aria-*` en componentes interactivos.
- Contraste mínimo AA en textos y controles.
- Estados visibles para hover/focus/disabled.
- Formularios con labels explícitos y mensajes de error claros.
