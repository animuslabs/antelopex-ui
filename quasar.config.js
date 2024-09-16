const { configure } = require("quasar/wrappers")

module.exports = configure(function (/* ctx */) {
  return {
    eslint: {
      fix: true,
      warnings: false,
      errors: true,
    },
    boot: ["componentDefaults", "boot"],
    css: ["app.sass"],
    extras: ["roboto-font", "material-icons", "fontawesome-v6"],
    build: {
      target: {
        browser: ["es2020", "edge88", "firefox78", "chrome87", "safari13.1"],
        node: "node20",
      },
      extendViteConf(viteConf, { isClient, isServer }) {
        viteConf.plugins.push(
          require("vite-plugin-rewrite-all").default(), // fixes a bug with dots in the url during development
          require("vite-tsconfig-paths").default() // so vite will read custom paths defined in tsconfig.json
        )
      },
      vueRouterMode: "history",
      minify: true,
    },
    devServer: {
      open: false,
    },
    framework: {
      config: {
        ripple: false,
      },
      plugins: ["Notify", "Dialog", "LoadingBar"],
    },
    animations: [],
    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: [
        "render", // keep this as last one
      ],
    },
    pwa: {
      workboxMode: "generateSW", // or 'injectManifest'
      injectPwaMetaTags: true,
      swFilename: "sw.js",
      manifestFilename: "manifest.json",
      useCredentialsForManifestTag: false,
    },
  }
})
