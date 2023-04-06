import { defineStore } from "pinia"
import { Asset, LinkSession, NameType, PermissionLevelType } from "anchor-link"
import { UnwrapNestedRefs, reactive, shallowReactive } from "vue"
import { ChainKey, configs } from "lib/config"
import { chainLinks } from "src/boot/boot"
import { ContractMapping, Global } from "lib/types/wraplock.types"
import { getSymbolList, getTokenList } from "lib/ibcUtil"
import { FilteredSymbol } from "lib/types/ibc.types"
import { ibcTokens } from "lib/ibcTokens"
import { userStore } from "src/stores/userStore"
import { ibcStore } from "src/stores/ibcStore"

type ChainBal = Partial<Record<ChainKey, 0>>
type AcctBal = Partial<Record<FilteredSymbol, ChainBal>>

export const tknStore = defineStore({
  id: "tknStore",
  state: ():UnwrapNestedRefs<{ bal:Record<string, AcctBal> }> =>
    (reactive({ bal: {} })),
  getters: {
    currentBal():Asset {
      const acct = userStore().getLoggedIn
      const sym = ibcStore().tknBridge.selectedToken
      const symbol = `${ibcTokens[sym].precision},${ibcStore().tknBridge.selectedToken}`
      const blank = Asset.from(0, symbol)
      if (!acct || !acct.account) return blank
      const acctBal = this.bal[acct.account.toString()]
      if (!acctBal) return blank
      const chainBal = acctBal[sym]
      console.log("chainBal", chainBal)

      if (!chainBal) return blank
      const bal = chainBal[ibcStore().tknBridge.fromChain]
      if (!bal) return blank
      return Asset.from(bal, symbol)
      // this.bal[acct.account][this.selectedToken][this.ibcStore.]
    }
  },
  actions: {
    async loadBalance(account:NameType, chain:ChainKey, symbol:FilteredSymbol) {
      const link = chainLinks[chain]
      const token = ibcTokens[symbol]
      console.log("loadBalance", account, chain, symbol)
      const bal = await link.rpc.get_currency_balance(token.tokenContract[chain], account, symbol).catch(console.log)
      if (!bal) return
      console.log(bal)
      // this.bal[account.toString()]
      this.$patch(
        {
          bal: {
            [account.toString()]: {
              [symbol]: {
                [chain]: bal[0]
              }
            }
          }
        })
    }
  }
})
