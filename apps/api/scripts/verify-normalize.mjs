/**
 * Verificación rápida de normalize-db-text (ejecutar: node scripts/verify-normalize.mjs)
 */
import {
  normalizeDbTextUpper,
  normalizeCatalogText,
  normalizeEmail,
  normalizeFreeTextPayloadRecord,
  isPasswordFieldKey
} from "../dist/common/normalize-db-text.js";

let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed += 1;
  } else {
    console.log("OK:", msg);
  }
}

assert(normalizeDbTextUpper("  José Pérez  ") === "JOSE PEREZ", "mayúsculas y sin tildes");
assert(normalizeCatalogText("Antioquia") === "Antioquia", "catálogo conserva casing");
assert(normalizeEmail("  Admin@Empresa.COM  ") === "admin@empresa.com", "correo minúsculas");

const mixedPayload = {
  firstName: "maría",
  department: "Cundinamarca",
  city: "Bogotá",
  email: "User@Test.com",
  password: "Aa1!secretX",
  passwordHash: "should-not-change",
  satelliteProviderPassword: "Gps#99"
};
const norm = normalizeFreeTextPayloadRecord(mixedPayload);
assert(norm.firstName === "MARIA", "payload firstName upper");
assert(norm.department === "Cundinamarca", "payload department catalog");
assert(norm.city === "Bogota", "payload city sin tilde");
assert(norm.email === "user@test.com", "payload email lower");
assert(norm.password === "Aa1!secretX", "password intacta");
assert(norm.passwordHash === "should-not-change", "passwordHash intacto");
assert(norm.satelliteProviderPassword === "Gps#99", "satellite password intacta");

assert(isPasswordFieldKey("passwordConfirm"), "detecta passwordConfirm");
assert(!isPasswordFieldKey("firstName"), "no marca firstName como password");

if (failed) {
  console.error(`\n${failed} prueba(s) fallaron.`);
  process.exit(1);
}
console.log(`\nTodas las pruebas de normalize-db-text pasaron.`);
