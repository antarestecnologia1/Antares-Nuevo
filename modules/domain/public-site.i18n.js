/**
 * Traducción ES→EN del sitio público (sin DOM ni estado del portal).
 * Cargado vía index.html (módulo) antes de portal-runtime.js.
 */
export function normalizePublicKey(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function escapePublicRegexFragment(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Find [start,end) in haystack such that normalizePublicKey(slice) === normalizePublicKey(needle). */
export function findNormalizedSpan(haystack, needle) {
  const nNorm = normalizePublicKey(needle);
  if (!nNorm) return null;
  for (let i = 0; i < haystack.length; i++) {
    for (let j = i + 1; j <= haystack.length; j++) {
      const sub = haystack.slice(i, j);
      const subNorm = normalizePublicKey(sub);
      if (subNorm === nNorm) return [i, j];
      if (subNorm.length > nNorm.length) break;
    }
  }
  return null;
}

export function replaceAllNormalizedSpans(haystack, needle, replacement) {
  let result = haystack;
  for (let guard = 0; guard < 500; guard++) {
    const span = findNormalizedSpan(result, needle);
    if (!span) break;
    const [a, b] = span;
    result = result.slice(0, a) + replacement + result.slice(b);
  }
  return result;
}

/** Spanish → English strings for the public site (source HTML uses plain ASCII in many words). */
export const PUBLIC_ES_EN_DICT = {
  Inicio: "Home",
  Nosotros: "About",
  Equipo: "Team",
  Empresas: "Companies",
  Testimonios: "Testimonials",
  Aliados: "Partners",
  Actualidad: "News",
  Experiencias: "Client stories",
  Liderazgo: "Leadership",
  Carreras: "Careers",
  "Abrir menu de navegacion": "Open navigation menu",
  Flota: "Fleet",
  Servicios: "Services",
  Cobertura: "Coverage",
  Proceso: "Process",
  Novedades: "Updates",
  "Trabaja con nosotros": "Careers",
  Contacto: "Contact",
  Portal: "Portal",
  Tema: "Theme",
  Idioma: "Language",
  Principal: "Main",
  "Menu de navegacion": "Open navigation menu",
  "Modo claro": "Light mode",
  "Modo oscuro": "Dark mode",
  "Logistica premium para floricultura y exportacion": "Premium logistics for floriculture and exports",
  "Transporte especializado de flores con": "Specialized flower transportation with",
  "trazabilidad total": "full traceability",
  "Operamos una red B2B con turbos, camiones y tractocamiones para movilizar": "We operate a B2B network with turbo trucks, medium trucks, and tractor-trailers to move",
  "flor de exportacion con control de temperatura, seguridad y cumplimiento en toda Colombia.": "export flowers with temperature control, safety, and compliance across Colombia.",
  "Operamos con turbos, camiones y tractocamiones para llevar tu carga": "We operate turbo trucks, medium trucks, and tractor-trailers to move your cargo",
  "con control de temperatura, seguridad y cumplimiento en toda Colombia.": "with temperature control, security, and on-time compliance across Colombia.",
  Contactenos: "Contact us",
  "Solicitar propuesta": "Request proposal",
  "Ingresar al portal": "Enter portal",
  "Entregas mensuales": "Monthly deliveries",
  "Nivel de cumplimiento": "Service compliance",
  "Tiempo de respuesta": "Response time",
  "Quienes somos": "Who we are",
  "Somos una compania con enfoque B2B especializada en logistica de": "We are a B2B-focused company specialized in logistics for",
  "flor. Integramos tecnologia, experiencia operativa y servicio al": "flowers. We combine technology, operational experience, and customer",
  "cliente para garantizar entregas puntuales y seguras.": "service to ensure on-time, secure deliveries.",
  "Somos un operador logistico B2B especializado en transporte de carga terrestre para el sector floricultor, comercializador y exportador. Integramos tecnologia, disciplina operativa y servicio cercano para garantizar entregas puntuales y confiables.":
    "We are a B2B logistics operator specialized in land freight transportation for the floriculture, trading, and export sectors. We combine technology, operational discipline, and close customer service to ensure punctual and reliable deliveries.",
  "Misión": "Mission",
  "Mision": "Mission",
  "Visión": "Vision",
  "En Transportes Antares ofrecemos servicios de transporte terrestre de carga refrigerada y seca con un compromiso firme con la calidad, la seguridad y la puntualidad. Brindamos soluciones logísticas confiables y eficientes, trabajando con disciplina y enfoque en la mejora continua para fortalecer la confianza de nuestros clientes y aportar al desarrollo del sector.":
    "At Transportes Antares we provide refrigerated and dry land freight transportation services with a firm commitment to quality, safety, and punctuality. We deliver reliable and efficient logistics solutions, working with discipline and a focus on continuous improvement to strengthen our clients' trust and contribute to the development of the sector.",
  "En Transportes Antares proyectamos consolidarnos como una empresa líder a nivel nacional en transporte de carga terrestre, especializada en soluciones logísticas con altos estándares de calidad, trazabilidad y seguridad. Buscamos fortalecer nuestra operación mediante la mejora continua y alcanzar la certificación BASC como respaldo de nuestro compromiso con la excelencia y la confianza en la cadena logística.":
    "At Transportes Antares we project ourselves to consolidate as a national leader in land freight transportation, specialized in logistics solutions with the highest standards of quality, traceability, and safety. We aim to strengthen our operations through continuous improvement and to earn the BASC certification as a hallmark of our commitment to excellence and trust in the logistics chain.",
  Valores: "Values",
  "Compromiso con tiempos de entrega.": "Commitment to delivery times.",
  "Calidad operativa y trazabilidad.": "Operational quality and traceability.",
  "Atencion humana y cercana.": "Human, approachable service.",
  "Mejora continua con datos.": "Continuous improvement driven by data.",
  "Equipo directivo": "Leadership team",
  "Liderazgo estrategico y operativo para asegurar excelencia en cada": "Strategic and operational leadership to ensure excellence on every",
  "viaje y en toda la cadena de servicio.": "trip and across the entire service chain.",
  "Foto de prueba (reemplazable)": "Placeholder photo (replaceable)",
  "Direccion general": "Executive leadership",
  "Vision estrategica, alianzas y crecimiento sostenible.": "Strategic vision, partnerships, and sustainable growth.",
  Operacion: "Operations",
  "Ejecucion logistica, eficiencia de flota y cumplimiento.": "Logistics execution, fleet efficiency, and reliability.",
  Administracion: "Administration",
  "Soporte documental, atencion y gestion interna diaria.": "Document support, customer care, and day-to-day internal management.",
  "Auxiliar administrativa": "Administrative assistant",
  "Gestion administrativa": "Business administration",
  "Lider administrativo": "Administrative lead",
  "Control de procesos, coordinacion y mejora continua.": "Process control, coordination, and continuous improvement.",
  "Estandar empresarial": "Enterprise standard",
  "Operamos con procesos definidos, seguimiento documentado, niveles de servicio medibles y una cultura de mejora continua orientada a resultados.": "We operate with defined processes, documented follow-up, measurable service levels, and a results-driven continuous improvement culture.",
  "Empresas que confian en nosotros": "Companies that trust us",
  "Aliados del sector floricultor, comercializador y exportador que": "Allies across floriculture, trading, and exports who",
  "priorizan puntualidad y conservacion de cadena de frio.": "prioritize punctuality and cold-chain integrity.",
  "Viajes estimados al año.": "Estimated trips per year.",
  "Clientes satisfechos por nivel de servicio.": "Customer satisfaction by service level.",
  "Monitoreo de operacion y trazabilidad.": "Operations monitoring and traceability.",
  "Rastrea tu envio": "Track your shipment",
  "Lo que dicen nuestros clientes": "What our clients say",
  "Experiencias reales de empresas que gestionan volumen, calidad y": "Real stories from companies managing volume, quality, and",
  "tiempos exigentes.": "tight timelines.",
  '"Redujimos reprocesos logisticos en un 32% desde que operamos': '"We cut logistics rework by 32% since we started working',
  'con Transportes Antares. Son rapidos, claros y muy confiables."': 'with Transportes Antares. They are fast, clear, and very reliable."',
  "Directora de Operaciones": "Director of Operations",
  "Gerente Logistico": "Logistics Manager",
  "Coordinadora Comercial": "Commercial Coordinator",
  '"La trazabilidad por estado de viaje nos dio control real del': '"Trip-status traceability gave us real control over the',
  'proceso. Excelente coordinacion y cumplimiento."': 'process. Excellent coordination and execution."',
  '"El manejo de cadena de frio y puntualidad en entregas criticas': '"Cold-chain handling and punctuality on critical deliveries',
  'ha sido sobresaliente. Equipo altamente profesional."': 'have been outstanding. A highly professional team."',
  "Nuestra flota": "Our fleet",
  "Vehiculos especializados con control de temperatura para cada necesidad logistica.": "Specialized vehicles with temperature control for every logistics need.",
  "Capacidad:": "Capacity:",
  "Cajas:": "Boxes:",
  "Ideal para rutas urbanas y regionales": "Ideal for urban and regional routes",
  "18 carros turbo en operación": "18 turbo trucks in operation",
  "Unidades livianas para despachos frecuentes y cadena de frío confiable":
    "Lightweight units for frequent dispatches with a dependable cold chain",
  "6 tractomulas en operación": "6 tractor-trailers in operation",
  "Articulados para el mayor volumen por viaje y trazabilidad en corredor":
    "Articulated rigs for maximum load per trip and corridor-level traceability",
  Tractomula: "Articulated fleet",
  Bus: "Bus",
  "Traslados de equipo y corredores entre sedes": "Crew moves and corridor runs between locations",
  Camion: "Truck",
  "Balance entre volumen y eficiencia": "Balance of volume and efficiency",
  Tractocamion: "Tractor-trailer",
  "Alto volumen y larga distancia": "High volume and long distance",
  "Nuestros servicios": "Our services",
  "Soluciones logisticas integrales para el sector floricultor y de exportacion.": "End-to-end logistics solutions for floriculture and exports.",
  "Refrigerado y especializado": "Refrigerated and specialized",
  "Control de temperatura con monitoreo constante para conservar la frescura y calidad de la flor desde el origen hasta el destino.": "Temperature control with continuous monitoring to preserve freshness and flower quality from origin to destination.",
  "Monitoreo operativo": "Operational monitoring",
  "Seguimiento en tiempo real por estado de viaje, notificaciones automaticas y visibilidad completa del proceso logistico.": "Real-time tracking by trip status, automated notifications, and full visibility of the logistics process.",
  "Atencion B2B": "B2B service",
  "Modelo de servicio dedicado para exportadores y comercializadores con acuerdos de servicio personalizados.": "A dedicated service model for exporters and traders with tailored service agreements.",
  "Proceso operativo estandar": "Standard operating process",
  "Un flujo claro de punta a punta para proteger la cadena de frio y asegurar entregas confiables.": "A clear end-to-end flow to protect the cold chain and ensure reliable deliveries.",
  "Planeacion de ruta": "Route planning",
  "Definimos origen, ventanas de cargue, destino y contingencias segun criticidad de la carga.": "We define origin, loading windows, destination, and contingencies according to shipment criticality.",
  "Asignacion de flota": "Fleet assignment",
  "Seleccionamos vehiculo y conductor acorde a volumen, temperatura objetivo y tiempos de entrega.": "We assign the right vehicle and driver based on volume, target temperature, and delivery windows.",
  "Monitoreo en viaje": "In-transit monitoring",
  "Hacemos seguimiento en tiempo real del estado del viaje y puntos criticos de la operacion.": "We track trip status and critical checkpoints in real time.",
  "Cierre y trazabilidad": "Closure and traceability",
  "Registramos novedades, evidencia de entrega y reporte para analisis de cumplimiento.": "We record incidents, proof of delivery, and compliance reporting.",
  "Cobertura nacional": "Nationwide coverage",
  "Rutas principales y corredores frecuentes para el sector floricultor y exportador.": "Main routes and frequent corridors for floriculture and exports.",
  "Principales puntos de recogida y entrega donde hoy concentramos mas operacion.":
    "Main pickup and delivery points where we concentrate the most activity today.",
  "Trayectos entre ciudades que mas se repiten; ida y vuelta del mismo corredor se muestran como un solo movimiento.":
    "Most repeated city-to-city runs; outbound and return on the same corridor are shown as a single movement.",
  "Cargando datos de cobertura...": "Loading coverage data…",
  "Configure la URL del servidor para ver la demanda real en esta seccion.":
    "Configure the server URL to see real demand in this section.",
  "No hay solicitudes suficientes en la ventana analizada; se muestra referencia geografica.":
    "Not enough requests in the analyzed window; showing a geographic reference instead.",
  "No fue posible cargar las estadisticas de cobertura. Se muestra referencia geografica.":
    "Could not load coverage statistics; showing a geographic reference instead.",
  "Rutas principales": "Main routes",
  "Corredores frecuentes": "Frequent corridors",
  Sabana: "Savannah",
  "Sabana de Bogota": "Bogota savannah",
  "Antioquia floricultora": "Flower-growing Antioquia",
  "Puertos de exportacion": "Export ports",
  "Eje cafetero": "Coffee axis",
  "Costa atlantica": "Atlantic coast",
  "Santa Marta": "Santa Marta",
  Barranquilla: "Barranquilla",
  Cartagena: "Cartagena",
  Buenaventura: "Buenaventura",
  "Puerto Antioquia": "Puerto Antioquia",
  Medellin: "Medellin",
  "Oriente Antioqueño": "Eastern Antioquia",
  Bogota: "Bogota",
  "Novedades y mejoras": "News and updates",
  "Cambios recientes en operacion, tecnologia y servicio para mantener a nuestros clientes informados.": "Recent changes in operations, technology, and service to keep our clients informed.",
  "Infraestructura y competitividad": "Infrastructure and competitiveness",
  "COMUNICADO OFICIAL · OPERACIÓN HISTÓRICA": "OFFICIAL STATEMENT · HISTORIC OPERATION",
  "Transportes Antares marca un hito logístico al ser aliado estratégico para transportar el primer contenedor de flor hacia Puerto Antioquia":
    "Transportes Antares marks a logistics milestone as a strategic partner in the first flower container shipment to Puerto Antioquia",
  "Abrimos un nuevo precedente logístico: primera operación de ingreso de contenedor de flor al puerto con unidad propia, consolidando capacidad real para rutas de exportación de alto valor.": "We are opening a new logistics precedent: first entry of a flower container into the port with our own unit, consolidating real capacity for high-value export routes.",
  "Operación documentada en campo": "Field-documented operation",
  "Corredor estratégico de exportación": "Strategic export corridor",
  "Evidencia audiovisual y fotográfica": "Audiovisual and photographic evidence",
  "Hito logístico Transportes Antares": "Transportes Antares logistics milestone",
  "Unidad destacada: JZX522": "Featured unit: JZX522",
  "Primera operación de contenedor de flor en Puerto Antioquia": "First flower container operation at Puerto Antioquia",
  "Fuimos la": "We were the",
  "primera empresa de transporte": "first transport company",
  "en ingresar contenedor de flor a Puerto Antioquia con nuestra tractomula": "entering a flower container into Puerto Antioquia with our tractor-trailer",
  ", marcando un avance clave para la cadena de exportación.": ", marking a key advance for the export chain.",
  "Ventaja competitiva": "Competitive edge",
  "Menor tiempo de conexión portuaria": "Shorter port connection time",
  "Capacidad operativa": "Operational capacity",
  "Operación real en corredor de exportación": "Real operation on an export corridor",
  "Impacto sectorial": "Sector impact",
  "Más confianza para floricultores y comercializadores": "More confidence for growers and traders",
  "Unidad destacada JZX522": "Featured unit JZX522",
  "Registro visual de la tractomula en operación.": "Visual record of the tractor-trailer in operation.",
  "Activo logístico clave": "Key logistics asset",
  "Tractomula JZX522": "Tractor-trailer JZX522",
  "Unidad utilizada en la operación destacada, con soporte fotográfico como respaldo del comunicado institucional.": "Unit used in the highlighted operation, with photographic support backing the institutional announcement.",
  "Timeline del logro": "Milestone timeline",
  "Planeación:": "Planning:",
  "coordinación previa de ventana y documentación.": "prior coordination of loading window and documentation.",
  "Ejecución:": "Execution:",
  "ingreso de contenedor de flor con tractomula": "flower container entry with tractor-trailer",
  "Validación:": "Validation:",
  "cierre operativo y confirmación de hito en puerto.": "operational closure and milestone confirmation at the port.",
  "Ruta de impacto": "Impact route",
  "Mercado internacional": "International market",
  "Corredor estratégico para exportación de flor con trazabilidad continua.": "Strategic corridor for flower export with continuous traceability.",
  "Antes": "Before",
  "Rutas más largas, mayores tiempos y menor control de conexión portuaria.": "Longer routes, longer times, and less control of the port connection.",
  "Ahora con el hito": "Now with the milestone",
  "Operación directa más competitiva, mejor respuesta logística y más confiabilidad para clientes.": "A more competitive direct operation, better logistics response, and greater reliability for customers.",
  "Contexto institucional": "Institutional context",
  "Mensaje oficial de la Gobernación de Antioquia": "Official message from the Government of Antioquia",
  "Mensaje institucional sobre competitividad regional e infraestructura": "Institutional message on regional competitiveness and infrastructure",
  "Fuente oficial: Gobernación de Antioquia (@puerto_antioquia) · Validación operativa interna Transportes Antares · Actualizado: Abril 2026":
    "Official source: Government of Antioquia (@puerto_antioquia) · Transportes Antares internal operational validation · Updated: April 2026",
  "\"Puerto Antioquia en Uraba marca un antes y un despues para la competitividad de Antioquia y del pais. Todos los dias zarpan barcos con productos del campo: 130 mil tallos de flores, cultivados en La Ceja, van rumbo hacia Inglaterra y 23 toneladas de aguacate Hass del Suroeste llegaran a Belgica. En el pasado estas exportaciones salian por Santa Marta, lo que implicaba mayores tiempos y costos. Hoy, el mundo entra y sale por Uraba, generando ahorros logisticos, empleo y nuevas oportunidades.\"": "\"Puerto Antioquia in Urabá marks a before-and-after for competitiveness in Antioquia and the country. Every day, ships sail with products from the countryside: 130,000 flower stems grown in La Ceja bound for England, and 23 tons of Hass avocado from the southwest heading to Belgium. In the past, these exports left through Santa Marta, with longer times and higher costs. Today, the world enters and leaves through Urabá, generating logistics savings, jobs, and new opportunities.\"",
  "GOBERNACIÓN DE ANTIOQUIA": "GOVERNMENT OF ANTIOQUIA",
  "Este resultado posiciona a Transportes Antares como aliado logístico empresarial para operaciones con alta exigencia de cumplimiento y trazabilidad.":
    "This outcome positions Transportes Antares as a business logistics partner for operations with high compliance and traceability requirements.",
  "Puerto Antioquia impulsa exportaciones: nuestra tractomula en operacion": "Puerto Antioquia boosts exports: our tractor-trailer in operation",
  "Nuestra operacion participa en una ruta clave de exportacion de flores y aguacate desde Antioquia hacia mercados internacionales.": "Our operation supports a key export route for flowers and avocado from Antioquia to international markets.",
  "Tu navegador no soporta video HTML5.": "Your browser does not support HTML5 video.",
  "Puerto Antioquia @puerto_antioquia en Uraba marca un antes y un despues para la competitividad de Antioquia y del pais. Todos los dias zarpan barcos con productos del campo: 130 mil tallos de flores, cultivados en La Ceja, van rumbo hacia Inglaterra y 23 toneladas de aguacate Hass del Suroeste llegaran a Belgica. En el pasado estas exportaciones salian por Santa Marta, lo que implicaba mayores tiempos y costos. Hoy, el mundo entra y sale por Uraba, generando ahorros logisticos, empleo y nuevas oportunidades. ¡En Antioquia, la infraestructura se traduce en hechos!": "Puerto Antioquia @puerto_antioquia in Urabá marks a before-and-after for competitiveness in Antioquia and the country. Every day, ships sail with products from the countryside: 130,000 flower stems grown in La Ceja bound for England, and 23 tons of Hass avocado from the southwest headed to Belgium. In the past, these exports left through Santa Marta, meaning longer times and higher costs. Today, the world enters and leaves through Urabá, generating logistics savings, jobs, and new opportunities. In Antioquia, infrastructure becomes concrete results!",
  "Fuente: Gobernacion de Antioquia · Actualizado: Abril 2026": "Source: Government of Antioquia · Updated: April 2026",
  "Imagen operativa en ruta": "Operational image on the road",
  "Nuestra tractomula en escenario real de cargue y despacho.": "Our tractor-trailer in a real loading and dispatch scenario.",
  "Presencia de marca en carretera": "Brand presence on the road",
  "Vehiculos visibles, cuidados y alineados con estandares de servicio.": "Visible, well-maintained vehicles aligned with service standards.",
  Marca: "Brand",
  Calidad: "Quality",
  Plataforma: "Platform",
  "Seguimiento de viajes reforzado": "Enhanced trip tracking",
  "Incorporamos alertas internas para detectar desvíos de ruta y mejorar tiempos de respuesta en incidentes.": "We added internal alerts to detect route deviations and improve incident response times.",
  "Cadena de frio con mayor control": "Stronger cold-chain control",
  "Se ajustaron protocolos de temperatura por tipo de flor y duracion de trayecto para reducir mermas.": "Temperature protocols were tuned by flower type and journey length to reduce shrinkage.",
  "Nuevos contratos Word automatizados": "New automated Word contracts",
  "Al crear empleados se generan contratos en formato Word conservando la estructura oficial de la empresa.": "When creating employees, Word contracts are generated while preserving the company’s official structure.",
  "Actualizado: Abril 2026": "Updated: April 2026",
  "Vacantes publicadas desde nuestro portal de RRHH. Postulate de forma segura; tu hoja de vida llega al modulo de": "Open roles from our HR portal. Apply securely; your résumé goes straight to the",
  Contratacion: "Recruitment",
  "para que el equipo revise tu perfil.": "module so the team can review your profile.",
  "Las vacantes se sincronizan con el mismo equipo que gestiona candidatos en el portal (misma base local del navegador).": "Vacancies sync with the same team that manages candidates in the portal (same local browser database).",
  "Formulario de contacto B2B": "B2B contact form",
  "Cuentanos tu necesidad logistica y te compartimos una propuesta tecnica y comercial.": "Tell us your logistics needs and we will share a technical and commercial proposal.",
  "Cuentanos tu operacion y te proponemos una solucion logistica ajustada a tu nivel de servicio.": "Tell us about your operation and we will propose a logistics solution tailored to your service level.",
  "Respuesta comercial < 2 horas": "Commercial response < 2 hours",
  "Atencion especializada B2B": "Specialized B2B support",
  "Confidencialidad de datos": "Data confidentiality",
  "Al enviar, un asesor B2B te contactara para validar requerimientos tecnicos y comerciales.": "After submitting, a B2B advisor will contact you to validate technical and commercial requirements.",
  "Enviar solicitud B2B": "Send B2B request",
  "Tipo de operacion": "Operation type",
  Exportacion: "Export",
  "Distribucion nacional": "Domestic distribution",
  "Operacion mixta": "Mixed operation",
  "Frecuencia estimada": "Estimated frequency",
  Diaria: "Daily",
  Semanal: "Weekly",
  Quincenal: "Biweekly",
  Mensual: "Monthly",
  "Ventana de inicio": "Start window",
  "Inmediata (0-7 dias)": "Immediate (0-7 days)",
  "Corto plazo (8-30 dias)": "Short term (8-30 days)",
  "Planificada (31+ dias)": "Planned (31+ days)",
  "1. Contacto": "1. Contact",
  "2. Operacion": "2. Operation",
  "3. Requerimiento": "3. Requirements",
  Anterior: "Back",
  Siguiente: "Next",
  "Portal empresarial Transportes Antares": "Transportes Antares enterprise portal",
  "Ingreso seguro para clientes y equipos operativos.": "Secure access for clients and operational teams.",
  Ingresar: "Sign in",
  "Ingreso empresarial seguro": "Secure enterprise access",
  "Accede a tu operacion con trazabilidad, control de permisos y registro de actividad.": "Access your operation with traceability, permission control, and activity records.",
  "Portal disenado para equipos de operaciones, administracion y recursos humanos.": "Portal designed for operations, administration, and HR teams.",
  "Sesion cifrada": "Encrypted session",
  "Historial de cambios": "Change history",
  "Soporte corporativo": "Corporate support",
  "Registro de cliente empresarial": "Enterprise client registration",
  "Completa tu perfil para habilitar aprobacion de acceso y configuracion de servicios.": "Complete your profile to enable access approval and service setup.",
  "Tu solicitud sera revisada por un administrador antes de habilitar acceso al portal.": "Your request will be reviewed by an administrator before portal access is enabled.",
  "Recuperacion de acceso": "Access recovery",
  "Te ayudamos a restablecer el acceso de forma segura con validacion administrativa.": "We help you restore access securely with administrative validation.",
  "Solicitar recuperacion": "Request recovery",
  "Caso de exito · Exportador floricola": "Success case · Floriculture exporter",
  "De 9 incidentes mensuales a 2 con control en ruta": "From 9 monthly incidents down to 2 with route control",
  "Integramos seguimiento por hitos, control de temperatura y alertas tempranas para reducir desviaciones en despachos de alto valor.": "We integrated milestone tracking, temperature control, and early alerts to reduce deviations in high-value dispatches.",
  "incidencias criticas": "critical incidents",
  "visibilidad operativa": "operational visibility",
  "puesta en marcha": "go-live",
  "Caso de exito · Comercializador": "Success case · Distributor",
  "Escalamiento de temporada alta sin perder puntualidad": "Peak-season scaling without losing punctuality",
  "Con planeacion de flota y monitoreo 24/7 mantuvimos continuidad operativa durante picos de demanda y cierres de ventana.": "With fleet planning and 24/7 monitoring, we maintained operational continuity during demand peaks and narrow loading windows.",
  "quiebres de cadena de frio": "cold-chain breaks",
  "capacidad en picos": "peak capacity",
  "entregas en SLA": "SLA deliveries",
  "-18% tiempos de conexion": "-18% connection times",
  "+23% eficiencia logistica": "+23% logistics efficiency",
  "98.7% entregas a tiempo": "98.7% on-time deliveries",
  Nombre: "Name",
  Empresa: "Company",
  "NIT/RUT": "Tax ID",
  Cargo: "Role",
  Telefono: "Phone",
  Correo: "Email",
  "Tipo de servicio": "Service type",
  "Seleccione...": "Select...",
  "Transporte nacional con termoking": "National transport with Thermo King",
  "Transporte nacional sin termoking": "National transport without Thermo King",
  "Transporte nacional": "National transport",
  "Transporte entre sedes del cliente": "Transport between client sites",
  Mensaje: "Message",
  "Enviar solicitud": "Send request",
  Aplicar: "Apply",
  Cierre: "Closing",
  "Sin fecha limite": "Open deadline",
  "No hay vacantes publicadas en este momento. Vuelve pronto o escribenos en Contacto.": "There are no openings right now. Check back soon or reach us via Contact.",
  Direccion: "Address",
  "Las solicitudes se guardan en base de datos local del navegador y": "Requests are stored in the browser’s local database and",
  "generan una notificacion simulada de email.": "trigger a simulated email notification.",
  Legal: "Legal",
  "Politica de privacidad": "Privacy policy",
  "Terminos y condiciones": "Terms and conditions",
  "Redes sociales": "Social media",
  "Transporte especializado de flores para empresas en toda Colombia.": "Specialized flower transport for companies across Colombia.",
  "Camiones y utilización": "Trucks and utilization",
  Nomina: "Payroll",
  "Mi perfil": "My profile",
  Notificaciones: "Notifications",
  "Cerrar sesion": "Sign out",
  "Todos los derechos reservados.": "All rights reserved.",
  WhatsApp: "WhatsApp",
  "Contactar por WhatsApp": "Contact via WhatsApp",
  "Galeria operativa": "Operations gallery",
  "Videos relacionados": "Related videos",
  Claro: "Light",
  Oscuro: "Dark"
};

let publicTranslationSortedEntries = null;
export function getPublicTranslationSortedEntries() {
  if (!publicTranslationSortedEntries) {
    publicTranslationSortedEntries = Object.entries(PUBLIC_ES_EN_DICT).sort((a, b) => b[0].length - a[0].length);
  }
  return publicTranslationSortedEntries;
}

export function translatePublicText(text, lang) {
  if (lang !== "en") return text;
  const raw = String(text || "");
  const leading = raw.match(/^\s*/)?.[0] ?? "";
  const trailing = raw.match(/\s*$/)?.[0] ?? "";
  const collapsed = raw.replace(/\s+/g, " ").trim();
  if (!collapsed) return text;

  const normalizedDict = Object.entries(PUBLIC_ES_EN_DICT).reduce((acc, [es, en]) => {
    acc[normalizePublicKey(es)] = en;
    return acc;
  }, {});

  const fullKey = normalizePublicKey(collapsed);
  let out;
  if (normalizedDict[fullKey]) {
    out = normalizedDict[fullKey];
  } else {
    out = collapsed;
    const phraseThreshold = 14;
    for (const [es, en] of getPublicTranslationSortedEntries()) {
      const src = String(es).replace(/\s+/g, " ").trim();
      if (!src) continue;
      const usePhrase = src.length >= phraseThreshold || /\s/.test(src);
      if (usePhrase) {
        if (out.includes(src)) {
          out = out.split(src).join(en);
        } else if (normalizePublicKey(out).includes(normalizePublicKey(src))) {
          out = replaceAllNormalizedSpans(out, src, en);
        }
      } else {
        const re = new RegExp(`\\b${escapePublicRegexFragment(src)}\\b`, "g");
        let next = out.replace(re, en);
        if (
          next === out &&
          src.length >= 5 &&
          normalizePublicKey(out).includes(normalizePublicKey(src))
        ) {
          next = replaceAllNormalizedSpans(out, src, en);
        }
        out = next;
      }
    }
  }
  return leading + out + trailing;
}
