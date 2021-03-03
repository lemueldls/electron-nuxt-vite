const production = process.env.NODE_ENV === "production" ? 2 : "off";

/** @type import("eslint").Linter.Config */
module.exports = {
  root: true,

  env: {
    es2021: true,
    browser: true,
    node: true,
  },

  extends: [
    "eslint:recommended",

    "@nuxtjs/eslint-config-typescript",
    "plugin:vue/base",
    "plugin:vue/recommended",

    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",

    // "google",
    "airbnb-base",

    "prettier",
    "plugin:prettier/recommended",
    "plugin:unicorn/recommended",
  ],

  plugins: ["@typescript-eslint", "vue", "vuetify", "prettier", "unicorn"],

  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 12,
    sourceType: "module",
  },

  rules: {
    "prettier/prettier": "warn",

    "arrow-parens": ["warn", "as-needed"],
    curly: ["warn", "multi"],
    "import/no-extraneous-dependencies": "off",
    "no-param-reassign": ["error", { props: false }],
    "no-shadow": "off",
    "require-await": 0,

    "new-cap": "off",
    "no-new": "off",
    "no-plusplus": "off",
    "no-unused-vars": "off",

    "@typescript-eslint/explicit-module-boundary-types": "off",
    "node/no-callback-literal": "off",

    "unicorn/no-null": "off",
    "unicorn/filename-case": [
      "warn",
      {
        cases: {
          camelCase: true,
          pascalCase: true,
        },
      },
    ],
    "unicorn/prevent-abbreviations": [
      "error",
      {
        checkFilenames: false,
      },
    ],

    "global-require": 0,
    "import/no-unresolved": 0,
    "import/extensions": [
      "error",
      "never",
      {
        pattern: {
          json: "always",
          vue: "always",
        },
      },
    ],
    "import/newline-after-import": 0,
    "no-underscore-dangle": 0,

    "no-console": production,
    "no-debugger": production,

    "vue/max-attributes-per-line": "off",
    "vue/singleline-html-element-content-newline": 0,
  },
};
