/**
 * Genera modules/domain/notificaciones.domain.js a partir de cortes actuales de portal-runtime.js.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const prPath = path.join(root, "modules/core/portal-runtime.js");
const lines = fs.readFileSync(prPath, "utf8").split(/\r?\n/);

function slice(a, b) {
  return lines.slice(a - 1, b).join("\n");
}

/** Líneas 1-based inclusivas (portal-runtime.js antes del strip). */
const zoneA = slice(948, 1186);
const helpers = slice(6338, 6369);
const zoneB = slice(6422, 6630);
const zoneC = slice(9238, 9457);

const body = [zoneA, helpers, zoneB, zoneC].join("\n\n");

const header = `/**
 * Dominio de notificaciones del portal: preferencias y audio, bandeja / lectura, polling de campana.
 * Extraído desde modules/core/portal-runtime.js (FASE 7).
 */
import {
  KEYS,
  NOTIF_LIGHT_REFRESH_MIN_MS,
  NOTIF_SILENT_BOOTSTRAP_MIN_MS,
  PERMISSIONS
} from "../core/config.js";
import { read, write, writeAwaitServer } from "../core/data-io.js";
import { state } from "../core/store.js";
import { nowIso } from "../core/utils.js";
import { currentUser, getSession, isAdminActor } from "../core/auth.js";
import {
  applyPortalBootstrapFromApi,
  portalCanRefreshFromApi,
  portalSnapshotIsFresh,
  savePortalSnapshotAfterBootstrap,
  syncSessionProfileSnapshotFromCache
} from "../core/bootstrap.js";

`;

const footer = `
`;

let out = header + body + footer;

/** Reemplazos para ESM y dependencias globales del runtime clásico. */
out = out.replace(/\bfunction getNotificationRecipientId\b/g, "export function getNotificationRecipientId");
out = out.replace(/\bfunction canViewAllNotifications\b/g, "export function canViewAllNotifications");
out = out.replace(/\bfunction notificationTargetsUser\b/g, "function notificationTargetsUser");
out = out.replace(/\bfunction notificationBelongsToUser\b/g, "function notificationBelongsToUser");
out = out.replace(/\bfunction filterNotificationsForUser\b/g, "export function filterNotificationsForUser");

out = out.replace(/\bfunction __notificationPollAgeMs\b/g, "function __notificationPollAgeMs");
out = out.replace(/\bfunction __inboxNotificationIsFreshForPoll\b/g, "function __inboxNotificationIsFreshForPoll");
out = out.replace(/\bfunction ensureInboxNotificationAudioUnlocked\b/g, "export function ensureInboxNotificationAudioUnlocked");
out = out.replace(/\bfunction getNotificationPreferencesNormalized\b/g, "export function getNotificationPreferencesNormalized");
out = out.replace(/\bfunction isSonidoNotificacionesHabilitado\b/g, "export function isSonidoNotificacionesHabilitado");
out = out.replace(/\bfunction isInAppNotificationAlertsEnabled\b/g, "export function isInAppNotificationAlertsEnabled");
out = out.replace(/\bfunction isInboxNotificationSoundEnabled\b/g, "export function isInboxNotificationSoundEnabled");
out = out.replace(/\basync function persistNotificationPreferencesToApi\b/g, "export async function persistNotificationPreferencesToApi");
out = out.replace(/\bfunction setNotificationSoundMuted\b/g, "export function setNotificationSoundMuted");
out = out.replace(/\bfunction setNotificationAlertsEnabled\b/g, "export function setNotificationAlertsEnabled");
out = out.replace(/\bfunction toggleNotificationSoundMuted\b/g, "export function toggleNotificationSoundMuted");
out = out.replace(/\bfunction toggleNotificationAlertsEnabled\b/g, "export function toggleNotificationAlertsEnabled");
out = out.replace(/\bfunction syncNotificationPrefsSidebarUi\b/g, "export function syncNotificationPrefsSidebarUi");
out = out.replace(/\bfunction syncNotificationSoundMutedUi\b/g, "export function syncNotificationSoundMutedUi");
out = out.replace(/\bfunction playInboxNotificationSound\b/g, "export function playInboxNotificationSound");
out = out.replace(/\bfunction primeInboxNotificationAudioFromUserGesture\b/g, "export function primeInboxNotificationAudioFromUserGesture");

out = out.replace(/\basync function refreshContractRenewalNotificationsFromServer\b/g, "export async function refreshContractRenewalNotificationsFromServer");
out = out.replace(/\bfunction scheduleContractRenewalNotificationCheck\b/g, "export function scheduleContractRenewalNotificationCheck");
out = out.replace(/\basync function writeNotificationsAwaitServer\b/g, "export async function writeNotificationsAwaitServer");
out = out.replace(/\bfunction reconcileNotificationsCacheForSession\b/g, "export function reconcileNotificationsCacheForSession");
out = out.replace(/\bfunction __notificationReadAtEpochMs\b/g, "function __notificationReadAtEpochMs");
out = out.replace(/\bfunction notificationIsRead\b/g, "export function notificationIsRead");
out = out.replace(/\bfunction mergeNotificationsListPreserveReadAt\b/g, "export function mergeNotificationsListPreserveReadAt");
out = out.replace(/\basync function persistNotificationsReadState\b/g, "export async function persistNotificationsReadState");
out = out.replace(/\bfunction refreshNotificationsUiAfterReadMutation\b/g, "export function refreshNotificationsUiAfterReadMutation");
out = out.replace(/\bfunction notificationsInboxRenderSignature\b/g, "export function notificationsInboxRenderSignature");
out = out.replace(/\bfunction syncNotificationsInboxRenderSignature\b/g, "export function syncNotificationsInboxRenderSignature");
out = out.replace(/\bfunction scheduleNotificationsViewRenderIfChanged\b/g, "export function scheduleNotificationsViewRenderIfChanged");

out = out.replace(/\bfunction stopNotificationsPolling\b/g, "export function stopNotificationsPolling");
out = out.replace(/\bfunction __notificationsPollIntervalMs\b/g, "function __notificationsPollIntervalMs");
out = out.replace(/\bfunction __onNotificationsVisibilityChange\b/g, "function __onNotificationsVisibilityChange");
out = out.replace(/\bfunction runAsSilentSystemNotifications\b/g, "export function runAsSilentSystemNotifications");
out = out.replace(/\bconst NOTIF_LIGHT_REFRESH_MIN_MS = \d+;\s*\n\/\*\*[\s\S]*?\*\/\s*\nconst NOTIF_SILENT_BOOTSTRAP_MIN_MS = \d+;\s*/g, "");
out = out.replace(/\blet __lastNotificationsLightRefreshWallMs\b/g, "let __lastNotificationsLightRefreshWallMs");
out = out.replace(/\basync function __refreshNotificationsBellIfStale\b/g, "async function __refreshNotificationsBellIfStale");
out = out.replace(/\bfunction __silentFullBootstrapIfStale\b/g, "function __silentFullBootstrapIfStale");
out = out.replace(/\bfunction __tickNotificationsPoll\b/g, "function __tickNotificationsPoll");
out = out.replace(/\bfunction getCurrentNotifications\b/g, "export function getCurrentNotifications");
out = out.replace(/\bfunction updateNotificationBadge\b/g, "export function updateNotificationBadge");
out = out.replace(/\bfunction startNotificationsPolling\b/g, "export function startNotificationsPolling");

out = out.replace(/\bnotify\s*\(/g, "window.notify(");
out = out.replace(/\bscheduleRenderPortalView\s*\(/g, "window.scheduleRenderPortalView(");

const outPath = path.join(root, "modules/domain/notificaciones.domain.js");
fs.writeFileSync(outPath, out);
console.log("Wrote", outPath, "bytes", out.length);
