import { boot } from "quasar/wrappers"
import axios, { AxiosInstance } from "axios"
import { ChainKey, configs } from "src/lib/config"
import { LinkManager } from "src/lib/linkManager"
import { userStore } from "src/stores/userStore"

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $axios:AxiosInstance;
    $api:AxiosInstance;
    $link:Record<ChainKey, LinkManager>;
    $user:typeof userStore;
  }
}

export const api = axios.create({ baseURL: "https://api.example.com" })

export const chainLinks:Record<ChainKey, LinkManager> = {
  telos: new LinkManager(configs.telos),
  eos: new LinkManager(configs.eos),
  wax: new LinkManager(configs.wax)
  // ux: new LinkManager(configs.ux)
}

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
  app.config.globalProperties.$link = chainLinks
  app.config.globalProperties.$user = userStore
})
