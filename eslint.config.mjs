import globals from "globals";
import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    languageOptions: { 
      globals: {
        ...globals.browser, 
        ...globals.node,
        gsap: "readonly",
        Fuse: "readonly",
        App: "readonly"
      } 
    }
  },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "no-undef": "error",
      "no-inner-declarations": "off",
      "no-empty": ["error", { "allowEmptyCatch": true }]
    }
  }
];
