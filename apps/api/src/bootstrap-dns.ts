/**
 * Debe importarse antes que el resto de la app: fuerza orden DNS IPv4-primero
 * antes de que Nest/Config carguen (mismo proceso que creará el pool de Postgres).
 */
import * as dns from "node:dns";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}
