<template lang="pug">
q-page(padding)
  .centered
    h2.text-white IBC Token Bridge
  .centered.q-gutter-lg
    q-card.q-pa-md
      .centered
        h3.text-weight-light Source Chain
      .centered.q-ma-md
        q-btn-toggle(
          rounded
          unelevated
          v-model="ibcStore.tknBridge.fromChain"
          toggle-color="secondary"
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
          toggle-color="secondary"
          :options="chainButtons"

        )

  .centered.q-gutter-md
    auth-card(:chain="fromLink" :name="ibcStore.tknBridge.fromChain").q-pa-sm
  .centered
    q-card.q-pa-md
      .centered
        h3.text-weight-light Send Token
      .centered.q-ma-md.q-gutter-md.items-center
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
              toggle-color="secondary"
              :options="tokenButtons"
            ).q-mt-sm
      q-input(
        outlined
        no-error-icon
        v-model="ibcStore.tknBridge.destinationAccount"
        :label="`Destination Account on ${ibcStore.tknBridge.toChain.toLocaleUpperCase()} chain`"
        debounce="500"
        :error="toAccountValid === false"
        :errorMessage="toAccountMessage"
        :hint="toAccountMessage"
        :loading="loadingToAccount"
      ).q-mt-lg
      .centered.q-mb-md
        div relay fee: {{ relayFee.toString() }}
      q-separator(spaced)
      .centered
        q-btn(:label="`Send ${ibcStore.sendingAsset} to ${ibcStore.tknBridge.destinationAccount} on ${ibcStore.tknBridge.toChain}`" @click="sendToken").q-mt-xs
</template>

<script lang="ts">
import { ChainKey, chainNames, configs } from "lib/config"
import { LinkManager } from "lib/linkManager"
import { FilteredSymbol } from "lib/types/ibc.types"
import { ibcStore } from "src/stores/ibcStore"
import { defineComponent } from "vue"

import { Asset } from "anchor-link"
import { ibcTokens } from "lib/ibcTokens"
import { doActions, makeAction } from "lib/transact"
import { Transfer } from "lib/types/token.types"
import { chainLinks } from "src/boot/boot"
import AuthCard from "src/components/AuthCard.vue"
import { tknStore } from "src/stores/tokenStore"
import { userStore } from "src/stores/userStore"

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
    relayFee():Asset {
      const fee = this.ibcStore.sysConfig[this.ibcStore.tknBridge.fromChain]?.min_fee.quantity
      return fee || Asset.from("0.0 LOADING")
    },
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
      console.log("tknBal:", this.tknStore.currentBal)
      console.log("tknBal:", JSON.stringify(this.tknStore.currentBal))
      return this.tknStore.currentBal
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
    async sendToken() {
      console.log("send token")
      const bridge = this.ibcStore.tknBridge
      this.$q.dialog(
        { ok: "Send", cancel: true, message: `You are sending ${this.ibcStore.sendingAsset} to ${this.ibcStore.tknBridge.destinationAccount} on ${this.ibcStore.tknBridge.toChain} Mainnet ` }
      ).onOk(async() => {
        const sym = bridge.selectedToken
        const toChain = bridge.toChain
        const tkn = ibcTokens[sym]
        const sendingFromNative = tkn.nativeChain === bridge.fromChain
        const toAcct = sendingFromNative ? tkn.nativeWraplockContract[toChain] : tkn.foreignWraplockContract[toChain]
        const fee = this.ibcStore.sysConfig[bridge.fromChain]?.min_fee
        if (!fee) throw new Error("no fee config for this chain.")
        if (!toAcct) throw new Error("No wraplock contract found for this token on this chain")
        const payFee = Transfer.from({
          from: this.user,
          to: this.fromLink.config.sysContract,
          quantity: fee.quantity,
          memo: "ibc order payment"
        })
        const feeAct = makeAction.transfer(payFee, fee.contract, this.fromLink)

        const transfer = Transfer.from({
          from: this.user,
          to: toAcct,
          quantity: this.ibcStore.sendingAsset,
          memo: this.ibcStore.tknBridge.destinationAccount
        })

        const token = ibcTokens[this.ibcStore.tknBridge.selectedToken]
        const tokenContract = token.tokenContract[bridge.fromChain]
        if (!tokenContract) throw new Error("No token contract on this chain found")
        const act = makeAction.transfer(transfer, tokenContract, this.fromLink)
        doActions([feeAct, act], this.fromLink)
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
      async handler(val:ChainKey, oldVal) {
        // if (val === this.ibcStore.tknBridge.toChain) this.ibcStore.tknBridge.fromChain = oldVal
        await this.fromLink.try_restore_session()
        this.loadBal()
        if (!this.ibcStore.sysConfig[val]) this.ibcStore.loadSysConfig(val)
      },
      immediate: true
    },
    "ibcStore.tknBridge.toChain": {
      async handler(val, oldVal) {
        // if (val === this.ibcStore.tknBridge.fromChain) this.ibcStore.tknBridge.toChain = oldVal
        // await this.fromLink.try_restore_session()
        // this.loadBal()
      },
      immediate: false
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
