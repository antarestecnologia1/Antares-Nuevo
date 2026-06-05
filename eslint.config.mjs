/**
 * Lint del portal estático (módulos ES en `modules/domain/`, sin Next.js).
 * Ejecutar: npm run lint:portal
 */
export default [
  {
    files: ["modules/domain/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        window: "readonly"
      }
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }]
    }
  }
];
