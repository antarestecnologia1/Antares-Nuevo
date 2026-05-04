/**
 * Endurecimiento en navegador: en hosts que no son desarrollo local, neutraliza
 * console.* para que datos o rutas de error no queden accesibles desde DevTools
 * (la depuración sigue en localhost o con window.__ANTARES_DEBUG__ === true antes de cargar scripts).
 */
(function antaresRuntimeSecurity() {
  "use strict";

  function devHost() {
    try {
      var h = String((window.location && window.location.hostname) || "");
      return (
        h === "localhost" ||
        h === "127.0.0.1" ||
        h === "[::1]" ||
        h.endsWith(".localhost")
      );
    } catch (_e) {
      return false;
    }
  }

  function explicitDebug() {
    try {
      return window.__ANTARES_DEBUG__ === true;
    } catch (_e) {
      return false;
    }
  }

  var allow = devHost() || explicitDebug();
  try {
    window.__ANTARES_ALLOW_DEV_CONSOLE__ = allow;
  } catch (_e2) {
    return;
  }

  if (allow) return;

  var noop = function () {};
  var c = window.console;
  if (!c || typeof c !== "object") return;

  var methods = [
    "log",
    "debug",
    "info",
    "trace",
    "dir",
    "dirxml",
    "table",
    "group",
    "groupCollapsed",
    "groupEnd",
    "time",
    "timeEnd",
    "timeStamp",
    "profile",
    "profileEnd",
    "count",
    "assert"
  ];
  for (var i = 0; i < methods.length; i++) {
    try {
      c[methods[i]] = noop;
    } catch (_m) {}
  }
  try {
    c.warn = noop;
    c.error = noop;
  } catch (_e3) {}
})();
