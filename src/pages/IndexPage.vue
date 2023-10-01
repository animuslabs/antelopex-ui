<template lang="pug">
q-page(padding)
  .centered.relative-position
    .col-auto
      img(src="/bg-logo.svg" style="width:370px; max-width:80vw; top:170px;").absolute-center
  .centered
    h1.text-white IBC Token Bridge
  q-list(padding).lt-sm.full-width.q-pa-lg
    q-item(dense).centered
      .col-auto
        h5.text-weight-light.text-white.q-pb-xs Source Chain
        q-btn-dropdown( noCaps :label="chainFrom" size="lg" style=" width:200px; " align="left" split ref="fromMenu" @click="showFromMenu()").cursor-pointer
          q-list(separator padding)
            q-item( v-for="chain of chainButtons" clickable v-close-popup @click="selectFromChain(chain.value)").q-ma-sm
              q-item-section
                q-item-label(style="font-size: 20px;").text-capitalize {{ chain.label }}
    q-item.centered
      .col-auto.lt-sm
        h5.text-weight-light.text-white Destination Chain
        q-btn-dropdown( noCaps :label="chainTo" size="lg" style=" width:200px; " align="left" split ref="toMenu" @click="showToMenu()").cursor-pointer
          q-list(separator padding)
            q-item( v-for="chain of chainButtons" clickable v-close-popup @click="selectToChain(chain.value)").q-ma-sm
              q-item-section
                q-item-label(style="font-size: 20px;").text-capitalize {{ chain.label }}
  .gt-xs
    .centered
      .centered.bridge-box
        .col-auto(style="max-width:600px;")
          .q-pa-lg
            div
              h5.text-weight-light.text-white.q-pb-xs Source Chain
              q-btn-dropdown( noCaps :label="chainFrom" size="xl" style=" width:200px; " align="left" split ref="fromMenu" @click="showFromMenu()").cursor-pointer
                q-list(separator padding)
                  q-item( v-for="chain of chainButtons" clickable v-close-popup @click="selectFromChain(chain.value)").q-ma-sm
                    q-item-section
                      q-item-label(style="font-size: 25px;").text-capitalize {{ chain.label }}
        .col(style="width:200px; max-width:20vw;").relative-position
          .absolute-center
            img(src="/arrow.svg" style="width:130px; ")
          .absolute-center
            q-btn(flat size="lg" color="grey" style="width:200px;" @click="reverseChains").bg-transparent
        .col-auto
          .q-pa-lg
            div
              h5.text-weight-light.text-white.q-pb-xs Destination Chain
              q-btn-dropdown( noCaps :label="chainTo" size="xl" style=" width:200px; " align="left" split ref="toMenu" @click="showToMenu()").cursor-pointer
                q-list(separator padding)
                  q-item( v-for="chain of chainButtons" clickable v-close-popup @click="selectToChain(chain.value)").q-ma-sm
                    q-item-section
                      q-item-label(style="font-size: 25px;").text-capitalize {{ chain.label }}
  .centered(v-if="chainSelectError").q-pa-md
    .col-auto.warn-box.q-ma-md.q-pa-md
      .centered
        q-icon(name="priority_high" color="amber" size="100px")
      h4.text-white Must select different Source and Destination Chain
  .centered(v-if="chainSelectError2").q-pa-md
    .col-auto.warn-box.q-ma-md.q-pa-md
      .centered
        q-icon(name="priority_high" color="amber" size="100px")
      h4.text-white Chain combination not supported
  .centered(v-if="!chainSelectError && !chainSelectError2").no-wrap
    .outline-box.q-pa-md.q-mt-lg.relative-position(style="width:600px; max-width:80vw;")
      .centered
      .centered.q-pt-sm
        .col-auto
          h5.text-weight-light.text-white.q-pb-xs.text-capitalize  Sending from {{ ibcStore.tknBridge.fromChain }} Account
          //- q-btn-dropdown( transitionDuration="0" noCaps :label="printLoggedIn || '' " size="lg" style=" width:200px; " align="left" split ref="selectAccount" @click="showSelectAccount()")
      .centered
        .col-auto
          auth-card(:chain="fromLink" :name="ibcStore.tknBridge.fromChain").q-pa-sm
      .centered.q-ma-md.no-wrap
        .centered.no-wrap(style="width:380px; max-width:80vw").q-pb-lg
          .col-auto.relative-position
            h6.text-white Quantity
              q-input(
              dark
              labelColor="white"
              filled
              color="white"
              noErrorIcon
              v-model.number="ibcStore.tknBridge.quantity"
              type="number"
              inputStyle="font-size: 25px;"
              style="max-width:235px;"
            )
            p.text-white.q-mt-xs.absolute-bottom(style="width:300px; bottom:-25px;") {{`${user} balance:`}} #[a.text-grey-2(@click="setMaxQuantity()" href="#") {{ tknBal }}]
          .col-auto
            q-btn-dropdown(noCaps square :label="selectedToken" size="lg" style=" width:130px; margin-top:32px; height:56px;" align="left" split ref="selectToken" @click="showSelectToken()").cursor-pointer
              q-list(separator padding)
                q-item( v-for="token of ibcStore.availableSymbols" clickable v-close-popup @click="selectToken(token)").q-ma-sm
                  q-item-section
                    q-item-label(style="font-size: 20px;").text-capitalize {{ token }}
      .q-mt-lg
      .centered
        .col-auto
          h6.text-white {{`Destination Account on ${chainString(ibcStore.tknBridge.toChain)} chain`}}
          q-input(
            filled
            dark
            noErrorIcon
            color="white"
            v-model="ibcStore.tknBridge.destinationAccount"
            debounce="500"
            :error="toAccountValid === false"
            :loading="loadingToAccount"
            style="width:365px; max-width:80vw;"
            inputStyle="font-size: 25px;"

          )
            template(v-slot:error)
              p.text-red {{ toAccountMessage }}
            template(v-slot:hint)
              p.text-white {{ toAccountMessage }}

      .centered.q-mb-md.text-white.q-mt-lg
        h5 Relay Fee: {{ printAsset(relayFee) }}
      //- .centered.q-mb-md.text-white.q-mt-lg
      //-   h5 Service is not yet available
      div(style="height:30px;")
      .centered(style=" bottom:-25px;").absolute-bottom
        //- q-btn(rounded size="lg" :label="`Send ${ibcStore.sendingAsset} to ${ibcStore.tknBridge.destinationAccount} on ${chainString(ibcStore.tknBridge.toChain)}`" @click="sendToken" :disable="true").q-mt-xs.bg-positive.z-top
        q-btn(rounded size="lg" :label="`Send ${ibcStore.sendingAsset} to ${ibcStore.tknBridge.destinationAccount} on ${chainString(ibcStore.tknBridge.toChain)}`" @click="sendToken" :disable="toAccountValid != true").q-mt-xs.bg-positive
    div(style="height:50px;").full-width
</template>

<script lang="ts">
import { Asset, NameType } from "anchor-link"
import ConfirmTransferModal from "components/ConfirmTransferModal.vue"
import { ChainKey, chainNames, configs } from "lib/config"
import { ibcTokens } from "lib/ibcTokens"
import { LinkManager } from "lib/linkManager"
import { doActions, makeAction } from "lib/transact"
import { FilteredSymbol } from "lib/types/ibc.types"
import { Transfer } from "lib/types/token.types"
import { Dialog, QBtnDropdown } from "quasar"
import { chainLinks } from "src/boot/boot"
import AuthCard from "src/components/AuthCard.vue"
import { chainString, ibcStore } from "src/stores/ibcStore"
import { TknStore } from "src/stores/tokenStore"
import { userStore } from "src/stores/userStore"
import { defineComponent } from "vue"
import { printAsset, sleep, throwErr } from "lib/utils"
import { ibcHubs } from "lib/ibcHubs"

// type TknStoreType = InstanceType<typeof TknStore>
// let ok:TknStoreType = {}

const chainButtons = chainNames.map(name => {
  return {
    label: chainString(name),
    value: name
  }
})
type modalProps = InstanceType<typeof ConfirmTransferModal>["$props"]

export default defineComponent({
  name: "IndexPage",
  components: { AuthCard },
  data() {
    return {
      printAsset,
      chainString,
      ibcStore: ibcStore(),
      tknStore: TknStore(),
      userStore: userStore(),
      chainButtons,
      loadingToAccount: false,
      toAccountValid: null as boolean | null,
      toAccountMessage: ""
    }
  },
  computed: {
    checkNative():boolean {
      return !!ibcHubs[this.selectedToken]?.nativeToken[this.ibcStore.tknBridge.fromChain]
    },
    printLoggedIn():string|null {
      let val = this.userStore.getLoggedIn
      let selected = null
      if (!val) return null
      const chainId = this.fromLink.link.chains[0]?.chainId
      if (!chainId) return null
      const loggedInId = val.chainId
      if (!loggedInId) return null
      if (loggedInId !== chainId.toString()) return null
      if (!val.auth) return null
      console.log("WATCHER loggedIn:", val.auth.toString())
      selected = val.auth.toString()
      return selected
    },
    chainSelectError():boolean {
      // return false if to and from chains are the same
      return this.ibcStore.tknBridge.toChain === this.ibcStore.tknBridge.fromChain
    },
    chainSelectError2():boolean {
      // return false if to and from chains are telos and wax
      return (this.ibcStore.tknBridge.toChain === "telos" && this.ibcStore.tknBridge.fromChain == "wax") || (this.ibcStore.tknBridge.toChain === "wax" && this.ibcStore.tknBridge.fromChain == "telos")
    },
    relayFee():Asset {
      const fee = this.ibcStore.sysConfig[this.ibcStore.tknBridge.fromChain]?.min_fee.quantity
      return fee || Asset.from("0.0 LOADING")
    },
    user():string {
      const acct = this.userStore.getLoggedIn
      if (!acct || !acct.account) return ""
      else return acct.account.toString()
    },
    chainFrom() {
      return chainString(this.ibcStore.tknBridge.fromChain)
    },
    chainTo() {
      return chainString(this.ibcStore.tknBridge.toChain)
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
        if (this.ibcStore.tknBridge.quantity) {
          let temp = this.ibcStore.tknBridge.quantity
          this.ibcStore.tknBridge.quantity = null
          void this.$nextTick(() => {
            this.ibcStore.tknBridge.quantity = temp
          })
        }
      },
      get():FilteredSymbol {
        return this.ibcStore.tknBridge.selectedToken
      }
    },
    tknBal():Asset {
      console.log("tknBal:", this.tknStore.bridgeTknBal)
      console.log("tknBal:", JSON.stringify(this.tknStore.bridgeTknBal))
      return this.tknStore.bridgeTknBal
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
    async reverseChains() {
      this.ibcStore.swapChains()
    },
    async setMaxQuantity() {
      this.ibcStore.tknBridge.quantity = parseFloat(this.tknBal.toString())
    },
    async selectToken(sym:FilteredSymbol) {
      this.selectedToken = sym
    },
    async showSelectToken() {
      const menu = this.$refs.selectToken as QBtnDropdown
      menu.toggle()
    },
    async showSelectAccount() {
      const menu = this.$refs.selectAccount as QBtnDropdown
      menu.toggle()
    },
    async showFromMenu() {
      const menu = this.$refs.fromMenu as QBtnDropdown
      menu.toggle()
    },
    async showToMenu() {
      const menu = this.$refs.toMenu as QBtnDropdown
      menu.toggle()
    },
    async selectFromChain(chain:ChainKey) {
      this.ibcStore.tknBridge.fromChain = chain
    },
    async selectToChain(chain:ChainKey) {
      this.ibcStore.tknBridge.toChain = chain
    },
    async sendToken() {
      console.log("send token")
      const bridge = this.ibcStore.tknBridge

      const componentProps:modalProps = {
        destinationAccountName: bridge.destinationAccount,
        fromChainName: chainString(bridge.fromChain),
        toChainName: chainString(bridge.toChain),
        quantity: Asset.from(this.ibcStore.sendingAsset.toString()),
        relayFee: this.relayFee,
        fromAccountName: this.printLoggedIn?.split("@")[0] || ""
      }
      console.log("props", componentProps)


      this.$q.dialog(
        {
          component: ConfirmTransferModal,
          componentProps
        }
      ).onOk(async() => {
        try {
          const sym = bridge.selectedToken
          const toChain = bridge.toChain
          const tkn = ibcTokens[sym]
          const sendingFromNative = tkn.nativeChain === bridge.fromChain
          const fee = this.ibcStore.sysConfig[bridge.fromChain]?.min_fee
          if (!fee) throw new Error("no fee config for this chain.")
          const payFee = Transfer.from({
            from: this.user,
            to: this.fromLink.config.sysContract,
            quantity: fee.quantity,
            memo: "ibc order payment"
          })
          console.log("payFee", JSON.stringify(payFee, null, 2))
          const feeAct = makeAction.transfer(payFee, fee.contract, this.fromLink)
          let txid = ""
          if (sendingFromNative) {
            const toAcct = tkn.wraplockContracts[toChain]
            if (!toAcct) throw new Error("No wraplock contract found for this token on this chain")
            const transfer = {
              from: this.user,
              to: toAcct,
              quantity: this.ibcStore.sendingAsset.toString(),
              memo: this.ibcStore.tknBridge.destinationAccount
            }

            const token = ibcTokens[this.ibcStore.tknBridge.selectedToken]
            const tokenContract = token.tokenContract[bridge.fromChain]
            if (!tokenContract) throw new Error("No token contract on this chain found")
            const act = makeAction.transfer(transfer, tokenContract, this.fromLink)
            const result = await doActions([feeAct, act], this.fromLink)
            if (result) txid = result.transaction.id.toString()
          } else {
            const remoteToken = tkn.tokenContract[bridge.fromChain]
            if (!remoteToken) throw new Error("No token contract on this chain found")
            const retireData = {
              owner: this.user,
              beneficiary: this.ibcStore.tknBridge.destinationAccount,
              quantity: this.ibcStore.sendingAsset.toString()
            }
            console.log("retireData:", JSON.stringify(retireData, null, 2))
            const retireAct = makeAction.retire(retireData, remoteToken, this.fromLink)
            console.log("retireAct:", JSON.stringify(retireAct, null, 2))
            let actions = [feeAct, retireAct]
            if (this.checkNative) {
              const nativetkn = ibcHubs[bridge.selectedToken]
              if (!nativetkn) throwErr("No token contract on this chain found")
              const wrapAction = makeAction.transfer({
                from: this.user,
                to: nativetkn.hubContract[bridge.fromChain] as string,
                quantity: this.ibcStore.sendingAsset.toString(),
                memo: `ibc_contract=${remoteToken}  issue_to=${this.user}`
              }, nativetkn.nativeToken[bridge.fromChain] as string, this.fromLink)
              actions.unshift(wrapAction)
            }
            const result = await doActions(actions, this.fromLink)
            if (result) txid = result.transaction.id.toString()
          }
          // Dialog.create({
          //   style: "background-color:white;",
          //   message: "The IBC relay service will take 3 minutes to push your tokens to the destination chain. BOID tokens will need to be unwrapped on the unwrap page when sending to Telos chain.",
          //   ok() {
          //     console.log("dialog closed")
          //   }
          // })
          await sleep(2000)
          await this.$router.push({ name: "status", query: { txid, chain: bridge.fromChain } })
        } catch (error) {
          console.error(error)
        }
      })
    },
    loadBal() {
      const acct = this.userStore.getLoggedIn
      if (!acct || !acct.account) return
      console.log("checkNative", this.checkNative)
      let tknStore = this.tknStore
      const params:Parameters<typeof tknStore.loadNativeBal> = [acct.account, this.ibcStore.tknBridge.fromChain, this.selectedToken] as any
      if (this.checkNative) void this.tknStore.loadNativeBal(...params)
      else void this.tknStore.loadIbcBal(...params)
    }
  },
  watch: {
    selectedToken: {
      handler(val) {
        this.loadBal()
      },
      immediate: false
    },
    "userStore.getLoggedIn": {
      handler(val) {
        this.loadBal()
      },
      immediate: false
    },
    "ibcStore.tknBridge.fromChain": {
      async handler(val:ChainKey, oldVal) {
        // if (val === this.ibcStore.tknBridge.toChain) this.ibcStore.tknBridge.fromChain = oldVal
        await this.fromLink.try_restore_session()
        this.loadBal()
        if (!this.ibcStore.sysConfig[val]) await this.ibcStore.loadSysConfig(val)
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
      immediate: true
    }
  }
})
</script>
