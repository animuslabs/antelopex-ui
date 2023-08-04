module.exports = {
  root: true,

  parserOptions: {
    parser: "@typescript-eslint/parser",
    extraFileExtensions: [".vue", ".json", ".ts", ".js"],
    warnOnUnsupportedTypeScriptVersion: false
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
    "vue/setup-compiler-macros": true
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-strongly-recommended",
    "standard"
  ],

  plugins: [
    "@typescript-eslint",
    "vue"
  ],

  globals: {
    ga: "readonly", // Google Analytics
    cordova: "readonly",
    __statics: "readonly",
    __QUASAR_SSR__: "readonly",
    __QUASAR_SSR_SERVER__: "readonly",
    __QUASAR_SSR_CLIENT__: "readonly",
    __QUASAR_SSR_PWA__: "readonly",
    process: "readonly",
    Capacitor: "readonly",
    chrome: "readonly"
  },

  // add your custom rules here
  rules: {
    "@typescript-eslint/no-floating-promises": ["error"],
    "promise/param-names": "off",
    "generator-star-spacing": "off",
    "arrow-parens": "off",
    "one-var": "off",
    "no-void": "off",
    "multiline-ternary": "off",
    "import/first": "off",
    "import/namespace": "error",
    "import/default": "error",
    "import/export": "error",
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "import/no-extraneous-dependencies": "off",
    "import/named": "off",
    "prefer-promise-reject-errors": "off",
    "no-unused-vars": "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "space-in-parens": [
      "error",
      "never"
    ],
    "no-return-assign": "off",
    eqeqeq: "off",
    "no-empty": "off",
    "no-useless-return": "off",
    "no-unreachable": "off",
    "prefer-const": "off",
    "space-before-function-paren": [
      "error",
      "never"
    ],
    camelcase: "off",
    "no-undef": "off",
    quotes: [
      "error",
      "double"
    ],
    "spaced-comment": "off",
    "key-spacing": [
      "error",
      {
        afterColon: true
      }
    ],
    // TYPESCRIPT
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/type-annotation-spacing": [
      "error",
      {
        after: false
      }
    ],
    // VUE
    "vue/multi-word-component-names": "off"
  }
}
