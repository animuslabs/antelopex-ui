<template lang="pug">
q-page(padding)
  .centered
    h2 IBC Token Bridge
  .centered.q-gutter-lg
    q-card.q-pa-md
      .centered
        h3.text-weight-light Source Chain
      .centered.q-ma-md
        q-btn-toggle(
          rounded
          unelevated
          v-model="ibcStore.tknBridge.fromChain"
          toggle-color="primary"
          :options="chainButtons"
        )
    q-card.q-pa-md
      .centered
        h3.text-weight-light Destination Chain
      .centered.q-ma-md
        q-btn-toggle(
          clearable
          rounded
          unelevated
          v-model="ibcStore.tknBridge.toChain"
          toggle-color="primary"
          :options="chainButtons"

        )

  .centered.q-gutter-md
    auth-card(:chain="fromLink" :name="ibcStore.tknBridge.fromChain").q-pa-sm
  .centered.q-gutter-md
    q-card.q-pa-md
      .centered
        h3.text-weight-light Send Token
      .centered.q-ma-md.q-gutter-md.items-center
        .col-auto
          .row.q-gutter-md
            .col-auto
              q-input(
                outlined
                no-error-icon
                v-model.number="ibcStore.tknBridge.quantity"

                label="Quantity"
                type="number"
                :rules="[val => !!val&&val>0 || 'Token quantity is required',val=> val< parseFloat(tknBal.toString())||'Insufficient balance']",
                :suffix="selectedToken"
                :hint="`${user} balance: ${tknBal}`"
              )
            .col-auto
              q-btn-toggle(
                rounded
                unelevated
                v-model="selectedToken"
                toggle-color="primary"
                :options="tokenButtons"
              ).q-mt-sm
          q-input(
            outlined
            no-error-icon
            v-model="ibcStore.tknBridge.destinationAccount"
            :label="`Destination Account on ${ibcStore.tknBridge.toChain}`"
            debounce="500"
            :error="toAccountValid === false"
            :errorMessage="toAccountMessage"
            :hint="toAccountMessage"
            :loading="loadingToAccount"
          ).q-mt-lg

      q-separator(spaced)
      .centered
        q-btn(:label="`Send ${ibcStore.sendingAsset} to ${ibcStore.tknBridge.destinationAccount} on ${ibcStore.tknBridge.toChain}`" @click="sendToken").q-mt-xs
</template>

<script lang="ts">
import { Todo, Meta } from "components/models"
import ExampleComponent from "components/ExampleComponent.vue"
import { defineComponent } from "vue"
import { getTokenList } from "lib/ibcUtil"
import { LinkManager } from "lib/linkManager"
import { ChainKey, chainNames, configs } from "lib/config"
import { ibcStore } from "src/stores/ibcStore"
import { Dialog } from "quasar"
import { FilteredSymbol } from "lib/types/ibc.types"

import AuthCard from "src/components/AuthCard.vue"
import { chainLinks } from "src/boot/boot"
import { Asset, Int64 } from "anchor-link"
import { tknStore } from "src/stores/tokenStore"
import { userStore } from "src/stores/userStore"
import { doActions, makeAction } from "lib/transact"
import { Transfer } from "lib/types/token.types"
import { ibcTokens } from "lib/ibcTokens"

const chainButtons = chainNames.map(name => {
  return {
    label: name,
    value: name
  }
})

export default defineComponent({
  name: "IndexPage",
  components: { AuthCard },
  data() {
    return {
      ibcStore: ibcStore(),
      tknStore: tknStore(),
      userStore: userStore(),
      chainButtons,
      loadingToAccount: false,
      toAccountValid: null as boolean | null,
      toAccountMessage: ""
    }
  },
  async mounted() {

  },
  computed: {
    user():string {
      const acct = this.userStore.getLoggedIn
      if (!acct || !acct.account) return ""
      else return acct.account.toString()
    },
    chainButtonsTo() {
      return chainButtons.filter(btn => btn.value !== this.ibcStore.tknBridge.fromChain)
    },
    chainButtonsFrom() {
      return chainButtons.filter(btn => btn.value !== this.ibcStore.tknBridge.toChain)
    },
    selectedToken: {
      set(val:FilteredSymbol) {
        this.ibcStore.tknBridge.selectedToken = val
      },
      get():FilteredSymbol {
        return this.ibcStore.tknBridge.selectedToken
      }
    },
    tknBal():Asset {
      return this.tknStore.currentBal as Asset
    },
    fromLink():LinkManager {
      const link = chainLinks[this.ibcStore.tknBridge.fromChain]
      return link
    },
    fromConfig() {
      return configs[this.ibcStore.tknBridge.fromChain]
    },
    tokenButtons() {
      return this.ibcStore.availableSymbols.map(symbol => {
        return {
          label: symbol,
          value: symbol
        }
      })
    }
  },
  methods: {
    sendToken() {
      console.log("send token")
      this.$q.dialog(
        { ok: "Send", cancel: true, message: `You are sending ${this.ibcStore.sendingAsset} to ${this.ibcStore.tknBridge.destinationAccount} on ${this.ibcStore.tknBridge.toChain} Mainnet` }
      ).onOk(() => {
        const sym = this.ibcStore.tknBridge.selectedToken
        const toChain = this.ibcStore.tknBridge.toChain
        const tkn = ibcTokens[sym]
        const sendingFromNative = tkn.nativeChain === this.ibcStore.tknBridge.fromChain
        const toAcct = sendingFromNative ? tkn.nativeWraplockContract[toChain] : tkn.foreignWraplockContract[toChain]
        if (!toAcct) throw new Error("No wraplock contract found for this token on this chain")

        const transfer = Transfer.from({
          from: this.user,
          to: toAcct,
          quantity: this.ibcStore.sendingAsset,
          memo: this.ibcStore.tknBridge.destinationAccount
        })
        const token = ibcTokens[this.ibcStore.tknBridge.selectedToken]
        const act = makeAction.transfer(transfer, token.tokenContract[this.ibcStore.tknBridge.fromChain], this.fromLink)
        doActions([act], this.fromLink)
      })
    },
    loadBal() {
      const acct = this.userStore.getLoggedIn
      if (!acct || !acct.account) return
      this.tknStore.loadBalance(acct.account, this.ibcStore.tknBridge.fromChain, this.selectedToken)
    }
  },
  watch: {
    selectedToken: {
      handler(val) {
        this.loadBal()
      },
      immediate: true
    },
    "userStore.getLoggedIn": {
      handler(val) {
        this.loadBal()
      },
      immediate: true
    },
    "ibcStore.tknBridge.fromChain": {
      async handler(val, oldVal) {
        if (val === this.ibcStore.tknBridge.toChain) this.ibcStore.tknBridge.fromChain = oldVal
        await this.fromLink.try_restore_session()
        this.loadBal()
      },
      immediate: true
    },
    "ibcStore.tknBridge.toChain": {
      async handler(val, oldVal) {
        if (val === this.ibcStore.tknBridge.fromChain) this.ibcStore.tknBridge.toChain = oldVal
        // await this.fromLink.try_restore_session()
        // this.loadBal()
      },
      immediate: true
    },
    "ibcStore.tknBridge.destinationAccount": {
      async handler(val, oldVal) {
        console.log("dest account", val)
        if (val === "") return
        this.loadingToAccount = true
        const link = chainLinks[this.ibcStore.tknBridge.toChain]
        const result = await link.rpc.get_account(val).catch(console.log)
        console.log(result)
        this.loadingToAccount = false
        if (result) this.toAccountValid = true
        else this.toAccountValid = false
        if (result) this.toAccountMessage = "Valid account"
        else this.toAccountMessage = "Invalid account"
      },
      immediate: false
    }
  }
})
</script>
