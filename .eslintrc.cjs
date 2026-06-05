/**
 * ESLint raíz: dominio ES del portal (alineado con eslint-config-next / ESLint 8 en apps/web).
 * No incluye `portal-runtime.js` (script clásico muy grande).
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  ignorePatterns: ["node_modules/", "apps/", "dist/", ".next/", "modules/core/portal-runtime.js"],
  overrides: [
    {
      files: ["modules/domain/**/*.js"],
      globals: {
        window: "readonly"
      },
      rules: {
        "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
        "no-undef": "error"
      }
    }
  ]
};
