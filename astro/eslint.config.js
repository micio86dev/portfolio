import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import vue from "eslint-plugin-vue";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ["dist/", ".astro/", "node_modules/", "**/*.d.ts"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  ...vue.configs["flat/recommended"],

  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2024,
      },
    },
    rules: {
      // Rich text comes from our own trusted PocketBase backend (note/page
      // bodies), so v-html / set:html is intentional and safe here.
      "vue/no-v-html": "off",
      // Page-section islands (Nav, Hero, etc.) are single-word by design.
      "vue/multi-word-component-names": "off",
      // Allow intentionally-unused args/vars/caught errors when underscore-prefixed.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Vue SFCs use <script setup lang="ts"> — point the SFC's <script> parser
  // at typescript-eslint so TS syntax inside .vue files parses.
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
      },
    },
  },

  // Node-context config files.
  {
    files: ["*.config.{js,mjs,ts}", "astro.config.mjs"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
