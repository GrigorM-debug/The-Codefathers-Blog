import js from "@eslint/js";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

/**@type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mongo,
        ...globals.mocha,
        ...globals.chai,
      },
    },
    rules: {
      indent: ["warn", 4],
    },
  },
  eslintConfigPrettier,
];
