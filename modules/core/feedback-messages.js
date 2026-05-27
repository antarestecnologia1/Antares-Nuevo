/**
 * Textos de interfaz: errores y éxitos homogéneos (es-CO).
 * Uso: notify(AntaresFeedback.clave, "error"|"success"|"info")
 */
(function registerFeedbackMessages() {
  const F = {
    validationStep: "Revise los campos marcados en rojo y corrija la información antes de continuar.",
    authLoginLock: (secs) =>
      `Demasiados intentos fallidos. Espere ${secs} segundos e inténtelo de nuevo.`,
    authProfileLoadFailed:
      "No se pudo cargar su perfil desde el servidor. Cierre sesión e intente nuevamente.",
    authPendingApproval: "Su cuenta está pendiente de aprobación por un administrador.",
    authRejected: "Su solicitud de registro fue rechazada. Contacte a soporte.",
    authInvalidServer: "Credenciales incorrectas o cuenta no habilitada en el servidor.",
    authNoConnection: "No hay conexión con el servidor de autenticación. Compruebe la red e intente de nuevo.",
    authInvalidLocal: "Correo o contraseña incorrectos.",
    registerNamesInvalid: "Ingrese nombres y apellidos válidos.",
    registerPasswordMismatch: "La confirmación de contraseña no coincide.",
    registerPasswordShort: "La contraseña debe cumplir el estándar de seguridad requerido.",
    passwordPolicyLength: "La contraseña debe tener al menos 10 caracteres.",
    passwordPolicyLower: "Incluya al menos una letra minúscula.",
    passwordPolicyUpper: "Incluya al menos una letra mayúscula.",
    passwordPolicyDigit: "Incluya al menos un número.",
    passwordPolicySpecial: "Incluya al menos un carácter especial (símbolo).",
    adminOnlyApprove: "Solo un administrador puede aprobar o rechazar registros de usuario.",
    registerTerms: "Debe aceptar términos y tratamiento de datos para continuar.",
    registerBirthInvalid: "La fecha de nacimiento no es válida.",
    registerMinor: "Debe ser mayor de edad para registrarse.",
    registerServerError: "No se pudo completar el registro en el servidor.",
    registerSuccess:
      "Gracias por registrarse en Transportes Antares. Su solicitud quedó registrada: un administrador validará los datos y aprobará el acceso al portal empresarial. Recibirá un correo con la confirmación y el estado; revise también spam o filtros de su empresa.",
    registerToastSuccess:
      "Solicitud enviada correctamente. Le mostramos un resumen fijo en la pantalla de ingreso; conserve el mensaje en su correo.",
    registerOfflineToast:
      "Registro guardado solo en este equipo. Para un alta corporativa completa debe usarse el servidor; lea el resumen en la pantalla de ingreso.",
    registerEmailExists: "Ya existe un usuario con ese correo.",
    registerDocExists: "Ya hay un registro con ese tipo y número de documento.",
    registerPersonalDocExists:
      "Ya existe un usuario con ese documento personal (cédula). Cada persona solo puede registrarse una vez.",
    recoverNoUser: "No consta ningún usuario registrado con ese correo en el sistema.",
    recoverSent:
      "Si la dirección indicada corresponde a una cuenta registrada, recibirá las instrucciones en su bandeja en los próximos minutos. Si no recibe nada, revise el correo escrito o consulte con el administrador del portal.",
    recoverSentSupabase:
      "Si el correo está asociado a una cuenta autorizada, recibirá un mensaje con un enlace seguro para restablecer su contraseña. Revise la bandeja de entrada y, de ser necesario, la carpeta de correo no deseado o spam.",
    recoverSupabaseError: "No se pudo enviar el correo de recuperación. Intente de nuevo o contacte a soporte.",
    recoverSupabaseUnavailable:
      "No se pudo iniciar la recuperación desde el navegador. Actualice la página y compruebe su conexión, o solicite asistencia a soporte.",
    recoverCompleteSuccess:
      "Contraseña restablecida correctamente. Le mostramos la página principal; use «Portal» para iniciar sesión con su correo y la nueva contraseña.",
    recoverCompleteError: "No se pudo guardar la nueva contraseña.",
    recoverCompleteNeedsApi:
      "Falta la URL de la API del portal en este sitio. Sin ella no se puede sincronizar la contraseña con el servidor.",
    recoverSessionMissing:
      "No hay sesión de recuperación activa. Abra de nuevo el enlace enviado a su correo.",
    recoverLinkInvalidOrExpired:
      "El enlace para restablecer su contraseña ya no es válido o expiró. Use la pestaña «Recuperar», indique su correo corporativo y solicite un enlace nuevo.",
    recoverLinkInvalidOrExpiredEn:
      "This password reset link is invalid or has expired. Open Recover, enter your corporate email, and request a new link.",
    sessionIdle: "Sesión cerrada por 30 minutos de inactividad.",
    invoiceNoTrip: "No hay un viaje disponible para facturar.",
    invoicePopupBlocked: "No se abrió la ventana. Permita ventanas emergentes para este sitio.",
    tripTransitionDenied: (from, to) => `No se puede cambiar de estado: ${from} → ${to}.`,
    noCompatibleResources:
      "No hay camión o conductor compatible y disponible para esta solicitud y horario.",
    scheduleConflict: (resourceLabel, tripNumber, windowLabel) => {
      const base = `Conflicto de horario: el ${resourceLabel} ya tiene programado el viaje ${tripNumber || "-"}`;
      return windowLabel ? `${base} (${windowLabel}).` : `${base}.`;
    },
    reportPdfBlocked: "No se pudo abrir la ventana del reporte. Use Descargar en el catálogo (sin ventanas emergentes).",
    payrollDriverLicenseSync:
      "Los conductores requieren licencia, categoría y fecha de vencimiento para sincronizar.",
    payrollLicenseExpired: "No se puede registrar un conductor con licencia vencida.",
    adminOnlyModule: "Solo el administrador puede editar o eliminar en este módulo.",
    driversManageForbidden:
      "Solo el administrador puede editar conductores en este módulo. La baja se realiza en Gestión humana.",
    driverDeleteUseHr:
      "La baja del conductor se realiza en Gestión humana (empleados con rol conductor). Este módulo no permite eliminar.",
    driverUpdatedHrSynced:
      "Conductor actualizado. Los datos básicos se sincronizaron con Gestión humana.",
    employeeUpdatedDriverSynced:
      "Empleado actualizado. Los cambios se reflejaron en conductores, SST, contratos, viajes y demás registros vinculados.",
    employeeCreatedDriverSynced:
      "Empleado registrado. La ficha se reflejó en conductores, SST, contratos y módulos vinculados.",
    driverUpdatedHrSyncFailed:
      "Conductor actualizado en flota, pero no se pudo sincronizar con Gestión humana. Revise la conexión o edite el empleado allí.",
    userEmailExists: "Ya existe un usuario con ese correo.",
    userSelectCompany: "Seleccione una empresa válida de la lista.",
    userApprovalQueued:
      "La solicitud quedó en bandeja de autorizaciones para aprobación del administrador.",
    userCreated: "Usuario creado correctamente.",
    companyNitInvalid: (msg) => `NIT no válido: ${msg}`,
    companyPhoneInvalid:
      "Si indica teléfono, use solo dígitos (entre 7 y 15). Puede dejarlo en blanco.",
    companyNameTooLong: "La razón social no puede superar 255 caracteres.",
    companyNameDuplicate: "Ya hay una empresa registrada con el mismo nombre o razón social.",
    companyNitDuplicate: "Ese NIT ya está registrado. El NIT debe ser único en el sistema.",
    companyPropiaDuplicate:
      "Ya existe una empresa registrada como operadora propia (Antares). Solo puede haber una en el sistema.",
    companyExists: "Ya existe una empresa con ese NIT o nombre.",
    companyCreated: "Empresa registrada correctamente.",
    companyDeleted: "Empresa eliminada correctamente.",
    companyDeleteBlockedUsers:
      "No se puede eliminar esta empresa mientras tenga usuarios asociados. Reasigne o elimine esos usuarios antes.",
    companyDeleteBlockedHr:
      "No se puede eliminar: hay colaboradores en gestión humana vinculados a esta empresa en el servidor.",
    companyDeactivated: "Empresa desactivada. Ya no aparecerá al crear usuarios nuevos.",
    companyActivated: "Empresa activada de nuevo.",
    userPick: "Seleccione un usuario.",
    permissionsChangedLogout: "Sus permisos cambiaron. Por seguridad, debe iniciar sesión de nuevo.",
    permissionsUpdated: "Permisos actualizados correctamente.",
    userNotFound: "No se encontró el usuario.",
    userEmailDuplicate: "Ya existe otro usuario con ese correo.",
    userUpdated: "Usuario actualizado correctamente.",
    noCompaniesForUser: "No hay empresas registradas. Cree una empresa antes de asociar usuarios.",
    accountApproved: (name) => `Cuenta de ${name} aprobada correctamente.`,
    accountRejected: (name) => `Solicitud de ${name} rechazada.`,
    userSelfDelete: "No puede eliminar su propio usuario.",
    userDeleted: "Usuario eliminado correctamente.",
    requestDatetimeMissing: "Seleccione fecha y hora de recogida y de entrega.",
    requestPastDatetime: "No puede programar solicitudes en fecha u hora ya pasada.",
    requestDeliveryAfterPickup: "La entrega estimada debe ser posterior a la recogida.",
    requestCreateError: "No se pudo registrar la solicitud. Revise los datos o intente más tarde.",
    requestCreated: "Solicitud registrada correctamente.",
    requestEditWithTripDenied:
      "Esta solicitud tiene viaje asignado. Solo usuarios con permiso de gestión de viajes pueden modificarla.",
    requestEditJustificationRequired:
      "Indique la justificación de la modificación (mínimo 10 caracteres). La solicitud ya tiene un viaje asignado.",
    requestEditWithTripLogged: "Solicitud actualizada. La justificación quedó registrada en el historial.",
    observationsUpdated: "Observaciones guardadas correctamente.",
    assignSelectResources: "Seleccione camión y conductor para asignar.",
    assignPriceRequired: "Indique el valor del viaje (COP) para poder asignar.",
    assignResourcesBusy:
      "No puede asignar esos recursos: el vehículo o el conductor no están disponibles u aparecen ocupados en el horario de esta solicitud (se cruza la ventana recogida–entrega estimada con otro viaje activo).",
    assignPastRequestDate:
      "No se puede asignar el viaje: la solicitud tiene fecha de recogida vencida. Solo se permite para el mismo día o fechas futuras.",
    assignBulkPartial: (ok, fail) =>
      `Asignación masiva: ${ok} correctas${fail ? `, ${fail} omitidas por conflicto o datos incompletos.` : "."}`,
    routeRateDeleted: "Tarifa de trayecto eliminada.",
    bulkSelectPending: "Seleccione al menos una solicitud pendiente.",
    bulkRequestMissing: "No se encontró la solicitud seleccionada.",
    tripAssignNoMatch: "No hay camión y conductor compatibles para este viaje.",
    tripAssigned: "Viaje asignado correctamente.",
    routeRateSelectRoute: "Seleccione departamento y ciudad de origen y destino.",
    routeRateInvalidCop: "Indique un valor mayor que cero en pesos colombianos (COP).",
    routeRateSaved: "Tarifa de trayecto guardada correctamente.",
    reportNoPermission: "No tiene permiso para generar este reporte.",
    reportDownloaded: "Reporte descargado correctamente.",
    reportExcelExported: "Reporte Excel descargado correctamente.",
    reportExportError: "No se pudo exportar el reporte. Intente de nuevo.",
    reportPreviewReady: "Vista previa del reporte lista.",
    reportCsvExported: "Reporte exportado en formato Excel (CSV).",
    reportBiExcelExported: "Analítica exportada a Excel con gráficas y estilo corporativo.",
    reportBiExcelChartsPending: "Espere a que carguen las gráficas y vuelva a exportar.",
    reportBiExcelError: "No se pudo generar el Excel de analítica. Intente actualizar el panel.",
    reportBiLayoutSaved: "Vista de analítica actualizada según su selección.",
    reportPdfOk: "Reporte PDF generado correctamente.",
    requestRejected: "Solicitud rechazada correctamente.",
    requestScheduleInvalid: "La fecha de entrega debe ser posterior a la de recogida.",
    requestUpdated: "Solicitud actualizada correctamente.",
    requestDeleted: "Solicitud eliminada correctamente.",
    tripRemoved: "Viaje anulado; la solicitud volvió a pendiente de asignación.",
    vehicleDeleted: "Vehículo eliminado correctamente.",
    driverDeleted: "Conductor eliminado correctamente.",
    vehiclePlateInvalid: "Placa no válida. Use formato colombiano de tres letras y tres números (ej. ABC123).",
    vehicleYearInvalid: "Año de modelo no válido para el vehículo.",
    vehicleRegistered: "Vehículo registrado correctamente.",
    driverPhoneInvalid: "Teléfono del conductor no válido. Use solo dígitos (10 a 15).",
    driverLicenseFuture: "La licencia debe tener vigencia futura.",
    driverApprovalQueued: "Solicitud de alta de conductor enviada para aprobación.",
    driverCreated: "Conductor registrado correctamente.",
    vehicleUpdated: "Vehículo actualizado correctamente.",
    driverUpdated: "Conductor actualizado correctamente.",
    driverLicenseFutureEdit: "La licencia debe tener vigencia futura.",
    fuelSelectBoth: "Seleccione vehículo y conductor válidos.",
    fuelInvalidAmounts: "Litros y costo total deben ser valores válidos.",
    fuelLogged: "Registro de combustible guardado correctamente.",
    technicalLogged: "Registro técnico guardado correctamente.",
    standbySaved: "Standby registrado correctamente.",
    standbyInvoiceReady: "Factura lista para revisión.",
    payrollSaved: "Liquidación guardada correctamente.",
    payrollPaidMarked: "Liquidación marcada como pagada.",
    payrollApprovalQueued: "Solicitud de marcar pago enviada para aprobación.",
    vacancyClosed: "Vacante cerrada.",
    vacancyPublishedOk: "Vacante publicada correctamente.",
    vacancyDeletedOk: "Vacante eliminada correctamente.",
    hireSelectVacancy: "Seleccione una vacante publicada válida.",
    candidateRegisteredOk: "Candidato registrado correctamente.",
    interviewScheduledOk: "Entrevista programada correctamente.",
    interviewCandidateMissing: "Seleccione un candidato válido.",
    absencePickEmployee: "Seleccione un empleado para registrar la ausencia.",
    vacancyDeadlineFuture: "La fecha límite de la vacante debe ser hoy o posterior.",
    vacancySelectPosition: "Seleccione un cargo activo para publicar la vacante.",
    candidateUpdated: "Estado del candidato actualizado.",
    positionToggled: "Cargo actualizado.",
    contractDownloaded: "Contrato generado. Revise la carpeta de descargas.",
    requestApprovedAssigned: "Solicitud aprobada y viaje asignado correctamente.",
    requestApprovedPending: "Solicitud aprobada. Queda pendiente de asignación manual.",
    contractWordError: (msg) => `No se pudo generar el contrato Word: ${msg}`,
    contractTestDownloaded: (kind) => `Archivo de ejemplo descargado (${kind}). Revise la carpeta de descargas.`,
    approvalResolved: "Autorización procesada.",
    companyUpdated: "Empresa actualizada correctamente.",
    genericError: "Ocurrió un error. Intente de nuevo o contacte a soporte.",
    nitInvalidPrefix: "NIT inválido",
    driverLicenseRegister: "La licencia debe tener vigencia futura para registrar un conductor.",
    fuelSelectVehicle: "Seleccione un vehículo válido.",
    recruitSelectActivePosition:
      "Seleccione un cargo activo del catálogo (módulo Contratación).",
    recruitSalaryMinRef: (formatted) =>
      `El salario no puede ser inferior al mínimo legal referenciado (${formatted}).`,
    employeeRequestQueued: "Solicitud de empleado enviada a autorizaciones.",
    employeeDriverFieldsRequired:
      "Para cargo conductor debe indicar licencia, categoría y fecha de vencimiento.",
    employeeCreatedWithContract: "Empleado creado y contrato Word generado.",
    employeeCreatedWordFail: (msg) => `Empleado creado. No se pudo generar Word: ${msg}`,
    employeeCreatedOk: "Empleado registrado correctamente.",
    employeeCreatedDriverSyncFail:
      "El empleado quedó guardado, pero no se pudo sincronizar la ficha de conductor. Revise licencia y conexión, luego edite el empleado.",
    employeeContractWordOk: "Contrato Word generado. Revise la carpeta de descargas.",
    hrAbsenceDeleted: "Ausencia eliminada del expediente digital.",
    payrollRunDeleted: "Liquidacion eliminada del historial.",
    adminOnlyDeleteHrPayrollRecord: "Solo los administradores pueden eliminar esta novedad o liquidacion.",
    employeeUpdatedOk: "Empleado actualizado correctamente.",
    employeeDeletedCascade: "Empleado eliminado en cascada.",
    employeeDeleteNotFound: "No se encontró el empleado a eliminar.",
    employeesBulkSelect: "Seleccione al menos un empleado para eliminar.",
    employeesBulkRemoved: (n) => `Se eliminaron ${n} empleado(s) en cascada.`,
    payrollSelectMonth: "Seleccione un mes válido para liquidar.",
    payrollLegalVigenciaDeleted: (year) => `Vigencia legal ${year} eliminada de la base de datos.`,
    payrollLegalVigenciaDeleteFail: "No fue posible eliminar la vigencia legal.",
    payrollMarkPaidApprovalAdmin:
      "Solicitud de marcar pago enviada para aprobación del administrador.",
    absenceApprovalQueued: "Solicitud de ausencia enviada para aprobación del administrador.",
    absenceDateOrder: "La fecha final debe ser igual o posterior a la de inicio.",
    absenceRecorded: "Ausencia registrada en el expediente digital de RR.HH.",
    absenceRecordedConductorTripPay:
      "Ausencia registrada. Conductor en prestación de servicios: el pago es por viajes liquidados en Nómina → Calcular (viáticos y reembolsos), no por nómina laboral.",
    payrollDraftLinked: "Nómina vinculada con la novedad registrada.",
    payrollConductorTripOnly:
      "Conductor (prestación de servicios): liquide solo viajes del periodo. No aplica salario base ni aportes de nómina.",
    payrollConductorUseDriverForm:
      "Los conductores en prestación de servicios se liquidan en Registrar → Pagos conductores (no en nómina laboral).",
    payrollConductorNoTrips:
      "No hay viajes interdepartamentales ni reembolsos de combustible en el mes seleccionado para liquidar.",
    driverTripPaymentSaved: (grossCop, tripCount, interDept) =>
      `Pago por viajes registrado en servidor: $${Number(grossCop || 0).toLocaleString("es-CO")} (${Number(tripCount || 0)} viaje(s), ${Number(interDept || 0)} interdepartamental(es)).`,
    driverTripPaymentRecalculated: (grossCop) =>
      `Liquidación de viajes recalculada: $${Number(grossCop || 0).toLocaleString("es-CO")}.`,
    recruitPickPosition: "Seleccione un cargo válido.",
    recruitSalaryBelowMin: (formatted) =>
      `Salario inferior al mínimo referenciado (${formatted}).`,
    positionSalaryBaseMin: (formatted) =>
      `El salario base no puede ser inferior al mínimo legal vigente (${formatted}).`,
    positionCreatedOk: "Cargo creado correctamente.",
    positionActivated: "Cargo activado.",
    positionDeactivated: "Cargo desactivado.",
    candidateSalaryAspirationMin: (formatted) =>
      `La aspiración salarial no puede ser menor al mínimo de referencia (${formatted}).`,
    candidateAvailabilityFuture: "La disponibilidad de ingreso debe ser hoy o posterior.",
    interviewScheduleFuture: "La entrevista debe programarse en fecha u hora futura.",
    interviewInvalidCandidate:
      "No puede programar entrevista para un candidato descartado o ya contratado.",
    contractPickEmployee: "Seleccione un empleado válido.",
    contractEmployeeMissingFields: (fields) =>
      `Complete en la ficha del empleado (Gestión humana): ${fields}.`,
    contractSignDateRequired: "Indique la fecha de firma.",
    contractWordSaved: "Contrato Word descargado y registro guardado.",
    sstPickEmployee: "Seleccione un empleado válido para el control.",
    sstDueDateRequired: "Indique la fecha de vencimiento o control.",
    sstRecorded: "Control de cumplimiento / SST registrado.",
    profileUpdatedOk: "Perfil actualizado correctamente.",
    paymentNoSettlement: "Solicitud de pago sin liquidación asociada.",
    settlementNotFound: "No se encontró la liquidación solicitada.",
    approvalLinkedRequestMissing: "No se encontró la solicitud asociada a esta autorización.",
    assignAutoPickResources: "Para asignar automáticamente debe seleccionar camión y conductor.",
    approvalResourcesFailed: "No fue posible aprobar la solicitud con los recursos seleccionados.",
    authApprovalWithTrip: "Solicitud aprobada y viaje asignado correctamente.",
    authApprovalPendingManual:
      "Solicitud aprobada. Queda pendiente de asignación manual de viaje.",
    authApprovalOk: "Autorización aprobada.",
    authRejectOk: "Autorización rechazada.",
    wordTemplatesRedownloaded:
      "Se descargó de nuevo el Word usando las plantillas de documentación.",
    b2bFieldsInvalid: "Revise los campos marcados para enviar su solicitud B2B.",
    b2bContactSent:
      "Solicitud enviada correctamente. El equipo comercial la recibió y se pondrá en contacto con usted en breve. Gracias por confiar en Transportes Antares.",
    b2bServerError: "No se pudo guardar en el servidor. Intente de nuevo o contacte por otro canal.",
    b2bApiMissing:
      "Sin URL de API configurada: defina antares_api_base (o __ANTARES_API_BASE__) para enviar la solicitud al servidor.",
    b2bContactSentLocalOnly:
      "Sin API: los datos quedaron solo en este navegador. Configure la URL del servidor para persistencia segura.",
    vacancyPublicClosed: "Esta vacante ya no está disponible.",
    candidacySentOk: "Candidatura enviada. Revise su correo para la confirmación.",
    tripCreatedAssigned: "Viaje creado y asignado correctamente."
  };

  window.AntaresFeedback = F;
})();
