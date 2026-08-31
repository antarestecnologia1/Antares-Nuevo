/**
 * Aceptación legal: no volver a pedir términos/privacidad en un navegador nuevo
 * si ya constan en el perfil o en el checklist de registro.
 * Ejecutar: node qa/legal-acceptance.test.mjs
 */
import assert from "node:assert/strict";
import {
  DATA_POLICY_VERSION,
  mergeLegalAcceptanceFields,
  userLegalProfileIsHydrated,
  userPendingLegalAcceptances,
  userRequiresDataPolicyAcceptance,
  userRequiresLegalAcceptanceGate,
  userRequiresTermsAcceptance
} from "../modules/core/config.js";

function ok(cond, msg) {
  assert.ok(cond, msg);
}

const acceptedAt = "2026-03-01T15:00:00.000Z";

ok(!userLegalProfileIsHydrated(null), "sin usuario no está hidratado");
ok(!userLegalProfileIsHydrated({ id: "1", email: "a@b.c", name: "a" }), "stub JWT no está hidratado");
ok(userLegalProfileIsHydrated({ id: "1", source: "portal_db" }), "fila de BD está hidratada");
ok(
  userLegalProfileIsHydrated({ id: "1", requiresDataPolicyAcceptance: false, requiresTermsAcceptance: false }),
  "flags explícitos hidratan"
);

ok(
  !userRequiresLegalAcceptanceGate({ id: "1", email: "a@b.c", name: "a" }),
  "stub JWT no abre el modal"
);

const registered = {
  id: "u1",
  source: "portal_db",
  profileQualityChecklist: {
    termsOfUseAccepted: true,
    privacyPolicyAccepted: true,
    habeasDataAcknowledged: true,
    dataPolicyAccepted: true,
    dataPolicyVersion: DATA_POLICY_VERSION,
    acceptedTermsAt: acceptedAt
  }
};
ok(!userRequiresDataPolicyAcceptance(registered), "checklist de registro cubre política de datos");
ok(!userRequiresTermsAcceptance(registered), "checklist de registro cubre términos y privacidad");
ok(!userRequiresLegalAcceptanceGate(registered), "usuario registrado no debe volver a aceptar");

const withDates = {
  id: "u2",
  source: "portal_db",
  dataPolicyAcceptedAt: acceptedAt,
  dataPolicyVersion: DATA_POLICY_VERSION,
  termsAcceptedAt: acceptedAt,
  requiresDataPolicyAcceptance: false,
  requiresTermsAcceptance: false
};
ok(!userRequiresLegalAcceptanceGate(withDates), "fechas en columnas cubren el gate");

const pending = {
  id: "u3",
  source: "portal_db",
  requiresDataPolicyAcceptance: true,
  requiresTermsAcceptance: true
};
const pendingFlags = userPendingLegalAcceptances(pending);
ok(pendingFlags.dataPolicy && pendingFlags.terms, "flags del servidor en true se respetan");
ok(userRequiresLegalAcceptanceGate(pending), "pendiente real sí abre el modal");

const merged = mergeLegalAcceptanceFields(
  { id: "u2", source: "portal_db", dataPolicyAcceptedAt: null, termsAcceptedAt: null },
  { id: "u2", dataPolicyAcceptedAt: acceptedAt, termsAcceptedAt: acceptedAt },
  { id: "u2", dataPolicyAcceptedAt: acceptedAt, termsAcceptedAt: acceptedAt, requiresDataPolicyAcceptance: false }
);
ok(merged.dataPolicyAcceptedAt === acceptedAt, "merge conserva fecha de política");
ok(merged.termsAcceptedAt === acceptedAt, "merge conserva fecha de términos");

const serverPending = mergeLegalAcceptanceFields(
  { id: "u3", requiresDataPolicyAcceptance: true, dataPolicyAcceptedAt: null },
  { id: "u3", requiresDataPolicyAcceptance: false, dataPolicyAcceptedAt: acceptedAt },
  null
);
ok(serverPending.requiresDataPolicyAcceptance === true, "el servidor gana si exige re-aceptación");

console.log("legal-acceptance.test.mjs: ok");
