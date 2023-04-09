import { Asset, NameType } from "anchor-link"
import { ChainKey } from "lib/config"
import { ibcTokens } from "lib/ibcTokens"
import { FilteredSymbol } from "lib/types/ibc.types"
import { defineStore } from "pinia"
import { chainLinks } from "src/boot/boot"
import { ibcStore } from "src/stores/ibcStore"
import { userStore } from "src/stores/userStore"
import { Raw, UnwrapNestedRefs, markRaw, reactive } from "vue"

type ChainBal = Partial<Record<ChainKey, number>>
type AcctBal = Partial<Record<FilteredSymbol, ChainBal>>

export const tknStore = defineStore({
  id: "tknStore",
  state: ():UnwrapNestedRefs<{ bal:Record<string, AcctBal> }> =>
    (reactive({ bal: {} })),
  getters: {
    currentBal():Raw<Asset> {
      const acct = userStore().getLoggedIn
      const sym = ibcStore().tknBridge.selectedToken
      const symbol = `${ibcTokens[sym].precision},${ibcStore().tknBridge.selectedToken}`
      const blank = markRaw(Asset.from(0, symbol))
      if (!acct || !acct.account) return blank
      const acctBal = this.bal[acct.account.toString()]
      if (!acctBal) return blank
      const chainBal = acctBal[sym]
      console.log("chainBal", chainBal)
      if (!chainBal) return blank
      const bal = chainBal[ibcStore().tknBridge.fromChain]
      if (!bal) return blank
      return markRaw(Asset.from(bal, symbol))
      // this.bal[acct.account][this.selectedToken][this.ibcStore.]
    }
  },
  actions: {
    async loadBalance(account:NameType, chain:ChainKey, symbol:FilteredSymbol) {
      const link = chainLinks[chain]
      const token = ibcTokens[symbol]
      console.log("loadBalance", account, chain, symbol)
      const tokenContract = token.tokenContract[chain]
      if (!tokenContract) return console.error("ERROR Missing contract", chain, token)
      const bal = await link.rpc.get_currency_balance(tokenContract, account, symbol).catch(console.log)
      if (!bal || !bal[0]) return
      console.log(bal)
      // this.bal[account.toString()]
      this.$patch(
        {
          bal: {
            [account.toString()]: {
              [symbol]: {
                [chain]: bal[0].value
              }
            }
          }
        })
    }
  }
})
