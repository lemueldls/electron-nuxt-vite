import { NuxtConfig } from "@nuxt/types";

import colors from "vuetify/lib/util/colors";

const config: NuxtConfig = {
  ssr: false,
  target: "static",

  // dev: true,

  // srcDir: RENDERER_PROCESS_DIR,
  // rootDir: RENDERER_PROCESS_DIR,

  // router: {
  //   mode: "hash",
  //   base: isProduction ? "./" : "/"
  // },

  // generate: {
  //   dir: path.join(DIST_DIR, "renderer")
  // },
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: "%s - renderer",
    title: "renderer",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },

  // // Global CSS: https://go.nuxtjs.dev/config-css
  // css: ["@mdi/font/scss/materialdesignicons.scss"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // "nuxt-vite",

    // https://go.nuxtjs.dev/vuetify
    "@nuxtjs/vuetify",
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    "@nuxtjs/axios",
  ],

  // vite: {
  //   root: "./",
  //   base: "./",
  //   publicDir: "./static",
  // },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    // defaultAssets: {
    //   icons: false,
    // },
    customVariables: ["~/assets/variables.scss"],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },
};

export default config;
