<template lang="pug">
q-page(padding)
  .centered.relative-position
    .col-auto
      //- img(src="/nft_logo.svg" style="width:370px; max-width:80vw; top:170px;").absolute-center
      img(src="/nft_logo.svg" style="width:370px; max-width:80vw; top:120px; opacity: 1; z-index:-100; ").absolute-center

  .centered
    h1.text-white NFT Bridge
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
  .centered(v-if="!chainSelectError && !chainSelectError2").no-wrap.q-gutter-md.q-pt-lg
    .col-auto
      .outline-box.q-pa-md.q-mt-lg.relative-position(style="min-width:200px; max-width:80vw;")
        .centered
        .centered.q-pt-sm
          .col-auto
            h5.text-weight-light.text-white.q-pb-xs.text-capitalize  Sending from {{ ibcStore.tknBridge.fromChain }} Account
            //- q-btn-dropdown( transitionDuration="0" noCaps :label="printLoggedIn || '' " size="lg" style=" width:200px; " align="left" split ref="selectAccount" @click="showSelectAccount()")
        .centered
          .col-auto
            auth-card(:chain="fromLink" :name="ibcStore.tknBridge.fromChain").q-pa-sm
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
        .centered
          NftCard(:asset="selectedNft" :chainKey="ibcStore.tknBridge.fromChain" style="width:250px;" v-if="selectedNft" @name="selectedNftName = $event")
        div(v-if="!foreignSchemaDefined || !foreignTemplateDefined" style="max-width:350px;").q-ma-md
          p Must prove schema and template before NFTs from this template can be sent. This is a one time process.
        div(style="height:45px;" v-if="!foreignSchemaDefined || !foreignTemplateDefined")
        .centered(style=" bottom:45px;" v-if="!foreignSchemaDefined || !foreignTemplateDefined").absolute-bottom.q-gutter-lg
          q-btn(label="Prove Schema" size="md" :disable="foreignSchemaDefined" @click="proveSchema(slectedNft)")
            q-tooltip(v-if="foreignSchemaDefined")
              p Schema already proven
          q-btn(label="Prove Template" size="md" :disable="foreignTemplateDefined" @click="proveTemplate(selectedNft)")
            q-tooltip(v-if="foreignTemplateDefined")
              p Template already proven
        div(style="height:30px;")
        .centered(style=" bottom:-25px;").absolute-bottom
          q-btn(rounded size="lg" :label="`Send NFT to ${ibcStore.tknBridge.destinationAccount} on ${chainString(ibcStore.tknBridge.toChain)}`" @click="sendToken" :disable="disableSendButton").q-mt-xs.bg-positive
    .col-auto
      .outline-box.q-pa-md.q-mt-lg.relative-position(style="width:800px; max-width:80vw;")
        .centered
        .centered.q-pt-sm.q-pb-md
          .col-auto
            h5.text-weight-light.text-white.q-pb-xs.text-capitalize  Bridgeable NFTs ({{ bridgableNfts.length }})
        .centered.q-gutter-md.q-pa-lg(style="max-height:800px; overflow-y:auto;")
          div(v-for="nft of bridgableNfts" :key="nft.asset_id")
            NftCard(:asset="nft" :chainKey="ibcStore.tknBridge.fromChain" style="width:200px;" :class="{'selected-box':selectedNftId === nft.asset_id.toString()}" @click="selectedNftId = nft.asset_id.toString()").cursor-pointer
            .centered
              //- q-btn(label="Selected" color="positive" v-if="selectedNftId === nft.asset_id.toString()" @click="selectedNftId = ''")
              //- q-btn(label="Select" v-if="selectedNftId != nft.asset_id.toString()" @click="selectedNftId = nft.asset_id.toString()")

  .centered.q-mt-xl
</template>

<script lang="ts">
import { AnyAction, Asset, NameType } from "anchor-link"
import ConfirmNftTransferModal from "components/ConfirmNftTransferModal.vue"
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
import { useNftStore } from "src/stores/nftStore"
import { findNftLockContract, findNftWrapContract, foreignSchemaDefined, foreignTemplateDefined, fromNativeNft, loadIbcNfts, loadNftMetaMap, loadNftWl, nftMetaMapCache, nftWhitelistCache } from "lib/ibcNftUtil"
import NftCard from "src/components/NftCard.vue"
import { useRouter } from "vue-router"
import { Contract as AtomicContract, Types as AtomicTypes } from "lib/types/atomicassets.types"
import { APIClient } from "@wharfkit/antelope"
import { Contract as NftLock, Types as NftLockTypes } from "lib/types/wraplock.nft.types"
import { Contract as NftWrap, Types as NftWrapTypes } from "lib/types/wraptoken.nft.types"


// type TknStoreType = InstanceType<typeof TknStore>
// let ok:TknStoreType = {}

const chainButtons = chainNames.map(name => {
  return {
    label: chainString(name),
    value: name
  }
})
type modalProps = InstanceType<typeof ConfirmNftTransferModal>["$props"]


export default defineComponent({
  components: { AuthCard, NftCard },
  data() {
    return {
      selectedNftId: "",
      selectedNftName: "",
      printAsset,
      chainString,
      ibcStore: ibcStore(),
      tknStore: TknStore(),
      userStore: userStore(),
      chainButtons,
      loadingToAccount: false,
      toAccountValid: null as boolean | null,
      toAccountMessage: "",
      router: useRouter(),
      foreignSchemaDefined: true,
      foreignTemplateDefined: true,
      pendingTemplateProofs: [] as number[],
      pendingSchemaProofs: [] as string[]
    }
  },
  computed: {
    disableSendButton() {
      return !this.toAccountValid || !this.foreignSchemaDefined || !this.foreignTemplateDefined || !this.selectedNft
    },
    fromNative() {
      return fromNativeNft(this.ibcStore.tknBridge.fromChain, this.ibcStore.tknBridge.toChain)
    },
    needTemplateProof() {
      if (!this.fromNative) return false
      else return true
    },
    selectedNft() {
      const asset = this.nftStore.nftRows[this.user]?.[this.selectedNftId]
      if (asset) return asset
      else return null
    },
    bridgableNfts() {
      const acct = this.userStore.getLoggedIn
      if (!acct || !acct.account) return []
      const assets = this.nftStore.nftRows[acct.account]
      if (assets) {
        return Object.values(assets).filter(el => {
          const fromNative = fromNativeNft(this.ibcStore.tknBridge.fromChain, this.ibcStore.tknBridge.toChain)
          if (fromNative) {
            const wl = nftWhitelistCache[this.ibcStore.tknBridge.fromChain].find(el2 => {
              return el2.collection_name.toString() == el.collection_name.toString()
            })
            if (wl) return wl.schema_names.map(el => el.toString()).includes(el.schema_name.toString()) || wl.template_ids.map(el => el.toString()).includes(el.template_id.toString())
            else return false
          } else {
            const mmap = nftMetaMapCache[this.ibcStore.tknBridge.fromChain].find(el2 => {
              return el2.local_collection_name.toString() == el.collection_name.toString()
            })
            if (mmap) return true
            else return false
          }
        })
      } else return []
    },
    checkNative():boolean {
      return !!ibcHubs[this.selectedToken]?.nativeToken[this.ibcStore.tknBridge.fromChain]
    },
    printLoggedIn():string | null {
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
    },
    nftStore() {
      return useNftStore(this.ibcStore.tknBridge.fromChain)
    }
  },
  methods: {
    async proveSchema(nft:AtomicTypes.assets_s) {
    //   alert("prove schema " + nft.schema_name.toString())
    //   if (this.pendingSchemaProofs.includes(nft.schema_name.toString())) return
    //   this.pendingSchemaProofs.push(nft.schema_name.toString())
    //   this.foreignSchemaDefined = true
      if (this.pendingSchemaProofs.includes(nft.schema_name.toString())) return
      const config = configs[this.ibcStore.tknBridge.fromChain]
      const contract = new NftLock({ client: new APIClient({ url: config.linkData.nodeUrl }), account: await findNftLockContract(this.ibcStore.tknBridge.fromChain, this.ibcStore.tknBridge.toChain) })
      const proveSchemaAct = contract.action("initschema", { collection_name: nft.collection_name, schema_name: nft.schema_name })
      const fee = this.ibcStore.sysConfig[this.ibcStore.tknBridge.fromChain]?.min_fee
      if (!fee) throw new Error("no fee config for this chain.")
      const payFee = Transfer.from({
        from: this.user,
        to: this.fromLink.config.sysContract,
        quantity: this.relayFee,
        memo: "ibc order payment"
      })
      console.log("payFee", JSON.stringify(payFee, null, 2))
      const feeAct = makeAction.transfer(payFee, fee?.contract, this.fromLink)
      const result = await doActions([feeAct, proveSchemaAct as unknown as AnyAction], this.fromLink)
      if (result?.processed) {
        this.pendingSchemaProofs.push(nft.schema_name.toString())
        this.foreignSchemaDefined = true
      }
    },
    async proveTemplate(nft:AtomicTypes.assets_s) {
      if (this.pendingTemplateProofs.includes(nft.template_id.toNumber())) return
      const config = configs[this.ibcStore.tknBridge.fromChain]
      const contract = new NftLock({ client: new APIClient({ url: config.linkData.nodeUrl }), account: await findNftLockContract(this.ibcStore.tknBridge.fromChain, this.ibcStore.tknBridge.toChain) })
      const proveTempAct = contract.action("inittemplate", { collection_name: nft.collection_name, template_id: nft.template_id })
      const fee = this.ibcStore.sysConfig[this.ibcStore.tknBridge.fromChain]?.min_fee
      if (!fee) throw new Error("no fee config for this chain.")
      const payFee = Transfer.from({
        from: this.user,
        to: this.fromLink.config.sysContract,
        quantity: this.relayFee,
        memo: "ibc order payment"
      })
      console.log("payFee", JSON.stringify(payFee, null, 2))
      const feeAct = makeAction.transfer(payFee, fee?.contract, this.fromLink)
      const result = await doActions([feeAct, proveTempAct as unknown as AnyAction], this.fromLink)
      if (result?.processed) {
        this.pendingTemplateProofs.push(nft.template_id.toNumber())
        this.foreignTemplateDefined = true
      }
    },
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
      console.log("bridge", this.selectedNftId)
      const componentProps:modalProps = {
        destinationAccountName: bridge.destinationAccount,
        fromChainName: chainString(bridge.fromChain),
        toChainName: chainString(bridge.toChain),
        nftName: this.selectedNftName,
        relayFee: this.relayFee,
        fromAccountName: this.printLoggedIn?.split("@")[0] || ""
      }
      console.log("props", componentProps)


      Dialog.create(
        {
          component: ConfirmNftTransferModal,
          componentProps
        }
      ).onOk(async() => {
        try {
          const sym = bridge.selectedToken
          const toChain = bridge.toChain
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
          const contract = new AtomicContract({ client: new APIClient({ url: configs[this.ibcStore.tknBridge.fromChain].linkData.nodeUrl }) })
          const to = this.fromNative ? await findNftLockContract(this.ibcStore.tknBridge.fromChain, this.ibcStore.tknBridge.toChain) : await findNftWrapContract(this.ibcStore.tknBridge.fromChain, this.ibcStore.tknBridge.toChain)
          const nftTrx = contract.action("transfer", { from: this.user, to, asset_ids: [this.selectedNftId], memo: this.ibcStore.tknBridge.destinationAccount })
          const result = await doActions([feeAct, nftTrx as unknown as AnyAction], this.fromLink)
          if (result?.processed) {
            txid = result.transaction.id.toString()
            await sleep(2000)
            // await this.router.push({ name: "status", query: { txid, chain: bridge.fromChain, hideDetails: "true" } })
            void this.loadAccountNfts()
            this.selectedNftId = ""
            this.selectedNftName = ""
            Dialog.create({
              style: "background-color:white;",
              message: "The IBC relay service will take 3 minutes to push your NFT to the destination chain."
            })
          }
        } catch (error) {
          console.error(error)
        }
      })
    },
    async loadAccountNfts() {
      const acct = this.userStore.getLoggedIn
      if (!acct || !acct.account) return
      await this.nftStore.loadAccountNfts(acct.account)
    },
    async loadNftWl() {
      await loadIbcNfts(this.ibcStore.tknBridge.fromChain)
      const native = fromNativeNft(this.ibcStore.tknBridge.fromChain, this.ibcStore.tknBridge.toChain)
      if (native) {
        await loadNftWl(this.ibcStore.tknBridge.fromChain, this.ibcStore.tknBridge.toChain)
      } else {
        await loadNftMetaMap(this.ibcStore.tknBridge.fromChain, this.ibcStore.tknBridge.toChain)
        // this.selected
      }
    }
  },
  watch: {
    selectedNftId: {
      async handler(val) {
        if (!val || !this.selectedNft) return
        // console.log("selectedNftId", val)
        if (!this.pendingSchemaProofs.includes(this.selectedNft.schema_name.toString())) this.foreignSchemaDefined = await foreignSchemaDefined(this.ibcStore.tknBridge.fromChain, this.ibcStore.tknBridge.toChain, this.selectedNft.collection_name, this.selectedNft.schema_name)
        else this.foreignSchemaDefined = true
        if (!this.pendingTemplateProofs.includes(this.selectedNft.template_id.toNumber())) this.foreignTemplateDefined = await foreignTemplateDefined(this.ibcStore.tknBridge.fromChain, this.ibcStore.tknBridge.toChain, this.selectedNft.collection_name, this.selectedNft.template_id)
        else this.foreignTemplateDefined = true
      },
      immediate: true
    },
    "userStore.getLoggedIn": {
      handler(val) {
        void this.loadAccountNfts()
      },
      immediate: false
    },
    "ibcStore.tknBridge.fromChain": {
      async handler(val:ChainKey, oldVal) {
        // if (val === this.ibcStore.tknBridge.toChain) this.ibcStore.tknBridge.fromChain = oldVal
        await this.fromLink.try_restore_session()
        await this.loadAccountNfts()
        if (!this.ibcStore.sysConfig[val]) await this.ibcStore.loadSysConfig(val)
        await this.loadNftWl()
      },
      immediate: true
    },
    "ibcStore.tknBridge.toChain": {
      async handler(val, oldVal) {
        // if (val === this.ibcStore.tknBridge.fromChain) this.ibcStore.tknBridge.toChain = oldVal
        // await this.fromLink.try_restore_session()
        // this.loadBal()
        await this.loadNftWl()
      },
      immediate: false
    },
    "ibcStore.tknBridge.destinationAccount": {
      async handler(val, oldVal) {
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
