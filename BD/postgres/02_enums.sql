-- Antares BD — Tipos enumerados (nombres en español)
-- Valores alineados con ROLES, ACCOUNT_STATUS, STATUS y estados del portal.

CREATE TYPE rol_usuario AS ENUM (
  'admin',
  'client',
  'rrhh',
  'administracion',
  'auxiliar_administrativo',
  'lider_administrativo',
  'logistica'
);

-- Declaración en el formulario de registro público: cliente externo vs personal interno Antares.
CREATE TYPE tipo_vinculo_registro AS ENUM (
  'cliente',
  'empleado_interno'
);

-- Clasificación comercial/operativa de la fila en empresas: cliente, tercero o empresa propia (Antares).
CREATE TYPE tipo_relacion_empresa AS ENUM (
  'cliente',
  'tercero',
  'propia'
);

CREATE TYPE estado_cuenta_usuario AS ENUM (
  'pendiente',
  'aprobado',
  'rechazado'
);

-- Textos exactos como en STATUS / localStorage (app.js).
CREATE TYPE estado_solicitud_transporte AS ENUM (
  'Pendiente',
  'Aprobada pendiente asignacion',
  'Viaje asignado',
  'En transito',
  'Espera standby',
  'Completada',
  'Cerrada',
  'Cancelada',
  'Rechazada'
);

CREATE TYPE estado_aprobacion AS ENUM (
  'pendiente',
  'aprobado',
  'rechazado'
);

CREATE TYPE estado_vacante AS ENUM (
  'Publicada',
  'Cerrada'
);

-- Tipo de vehículo: VARCHAR en tablas (variantes con/sin tilde en formularios).
