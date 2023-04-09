import { Asset } from "anchor-link"
import { ChainKey } from "lib/config"
import { ibcTokens } from "lib/ibcTokens"
import { getSymbolList } from "lib/ibcUtil"
import { Config } from "lib/types/antelopesys.types"
import { FilteredSymbol } from "lib/types/ibc.types"
import { defineStore } from "pinia"
import { chainLinks } from "src/boot/boot"
import { Raw, UnwrapNestedRefs, markRaw, reactive } from "vue"

export class TokenBridgeData {
  fromChain:ChainKey = "eos"
  toChain:ChainKey = "telos"
  quantity:number|null = null
  destinationAccount = ""
  selectedToken:FilteredSymbol = "EOS"
}

export class IbcState {
  tknBridge:TokenBridgeData = new TokenBridgeData()
  sysConfig:Partial<Record<ChainKey, Raw<Config>>> = {}
}

export const ibcStore = defineStore({
  id: "ibcStore",
  state: ():UnwrapNestedRefs<IbcState> =>
    (reactive({
      tknBridge: new TokenBridgeData(),
      sysConfig: {}
    })),
  getters: {
    availableSymbols():FilteredSymbol[] {
      return getSymbolList(this.tknBridge.fromChain, this.tknBridge.toChain)
    },
    sendingAsset():Asset {
      return Asset.from(this.tknBridge.quantity || 0, `${ibcTokens[this.tknBridge.selectedToken].precision},${this.tknBridge.selectedToken}`)
    }
  },
  actions: {
    async loadSysConfig(chainId:ChainKey) {
      const link = chainLinks[chainId]
      const code = link.config.sysContract
      const config = await link.rpc.get_table_rows({ limit: 1, code, table: "config", type: Config })
      if (!config.rows[0]) return console.error("no config for ibc sys contract")
      this.sysConfig[chainId] = markRaw(config.rows[0])
    }
  }
})
