import { defineStore } from "pinia"
import { Asset, LinkSession, NameType, PermissionLevelType } from "anchor-link"
import { UnwrapNestedRefs, reactive, shallowReactive } from "vue"
import { ChainKey, configs } from "lib/config"
import { chainLinks } from "src/boot/boot"
import { ContractMapping, Global } from "lib/types/wraplock.types"
import { FilteredSymbol } from "lib/types/ibc.types"
import { getSymbolList, getTokenList } from "lib/ibcUtil"
import { ibcTokens } from "lib/ibcTokens"

export class TokenBridgeData {
  fromChain:ChainKey = "eos"
  toChain:ChainKey = "telos"
  quantity:number|null = null
  destinationAccount = ""
  selectedToken:FilteredSymbol = "EOS"
}

export class IbcState {
  tknBridge:TokenBridgeData = new TokenBridgeData()
}

export const ibcStore = defineStore({
  id: "ibcStore",
  state: ():UnwrapNestedRefs<IbcState> =>
    (reactive({
      tknBridge: new TokenBridgeData()
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
    loadWraplock(chainId:ChainKey) {
      const link = chainLinks[chainId]
      // const global = link.rpc.get_table_rows({limit:1,})
    }
  }
})
