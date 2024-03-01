<template lang="pug">
q-page(padding)
  .centered.relative-position
    .col-auto
      img(src="/retry_logo.svg" style="width:370px; max-width:80vw; top:120px; opacity: 1; z-index:-100; ").absolute-center
  .centered.items-center.q-gutter-md
    h1.text-white Retry
  .centered
    h5.text-white(style="max-width:600px;") If an IBC transfer initiated on an external bridge has failed, you can pay a small fee for the AntelopeX workers to complete it.
  .centered.q-pb-md.q-pt-lg
    .col-auto
      ChainSelect(:chainArray="chainButtons" :selectedChain="data.chainName" @chainSelected="(val)=>data.chainName = val")
    .col-auto
      h5.text-weight-light.text-white.q-pb-xs Transaction ID
      q-input(
      dark
      labelColor="white"
      filled
      color="white"
      noErrorIcon
      :loading="data.loadTrx"
      v-model="data.txid"
      inputStyle="font-size: 25px;"
      :error-message="data.txidValid?undefined:'Invalid Transaction ID'"
      :error="data.txidValid == false"
      style="max-width:90vw; width:400px; z-index:1000;"
    )

  .centered(v-if="!data.txidValid && !data.loadTrx")
    h3.text-white Enter the Transaction ID of the failed IBC transfer.
  .centered(v-if="data.loadTrx")
    h3.text-white Loading...
  .centered(v-if="data.relayed")
    h3.text-white Transaction was already relayed!
  .centered(v-if="data.relayed === false")
    h3.text-white Origin transaction found, waiting to be relayed on {{ computed.trxMeta?.destinationChain.toUpperCase() }}
  .centered
    AuthCard(:chain="computed.originChainLink",:name="data.chainName").q-mt-lg
  .centered.q-mt-lg
    q-btn(:label="computed.relayBtnLabel" size="lg" color="info" @click="sendSpecialOrder()" :disable="disableBtn")
  .centered.q-mt-lg
    h3.text-warning.text-weight-bold Warning
  .centered.q-mt-sm
    p.text-white(style="max-width:600px;") Do not use this page if you initiated the transfer using AntelopeX. You already paid the relay fee and the workers will automatically handle it for you.


</template>
<script setup lang="ts">
import ChainSelect from "src/components/ChainSelect.vue"
import { chainButtons, printAsset, sleep, throwErr, toObject } from "lib/utils"
import { computed as compute, reactive, toRefs, watch } from "vue"
import { configs, type ChainKey } from "lib/config"
import { Asset, Checksum256 } from "anchor-link"
import { type GetTransaction, getHypClient } from "lib/hyp"
import { debounce } from "quasar"
import { type IbcMeta } from "lib/types/ibc.types"
import { getReceiptDigest } from "lib/getReceiptDigest"
import { Emitxfer } from "lib/types/wraptoken.types"
import { type IBCSymbol, ibcTokens } from "lib/ibcTokens"
import AuthCard from "src/components/AuthCard.vue"
import { LinkManager } from "lib/linkManager"
import { chainLinks } from "src/boot/boot"
import ms from "ms"
import { ibcStore as SetupIBCStore } from "src/stores/ibcStore"
import { doActions, makeAction, makeSpecialOrderMemo } from "lib/transact"
import { useRouter } from "vue-router"
const router = useRouter()
const ibcStore = SetupIBCStore()
let step1Interval:any = null

const data = reactive({
  chainName: "telos" as ChainKey,
  loadTrx: false,
  txid: null as string | null,
  txidValid: null as boolean | null,
  trx: null as GetTransaction<unknown> | null,
  step: 1 as number,
  relayed: null as boolean | null
})

async function sendSpecialOrder() {
  console.log("order ready")
  if (!computed.trxMeta || !data.txid) return
  const contract = ibcStore.sysConfig[data.chainName]?.min_fee.contract
  if (!contract) return
  const memo = makeSpecialOrderMemo(data.txid, computed.trxMeta.trxBlock)
  const act = makeAction.transfer({
    from: computed.originChainLink.loggedInAccount()?.actor || "",
    to: configs[data.chainName].sysContract,
    quantity: relayFee.value,
    memo
  }, contract, computed.originChainLink
  )
  const result = await doActions([act], computed.originChainLink)
  if (result?.processed) {
    await sleep(ms("3s"))
    await router.push({ name: "status", query: { txid: data.txid, chain: data.chainName, hideDetails: "true" } })
  }
}

async function validateTxid(retry = true):Promise<void> {
  try {
    data.loadTrx = false
    console.log(data.txid)
    // throttled()
    if (!data.txid) return
    const validTxid = Checksum256.from(data.txid)
    console.log(validTxid.toString())
    data.loadTrx = true
    let tx = await getHypClient(data.chainName).getTrx(data.txid)
    if (!tx) return
    let action = tx.actions.find((a) => a.act.name === "emitxfer")
    console.log("act_digest:", action?.act_digest)
    while (!action?.act_digest) {
      console.log("fetching trx again....")
      tx = await getHypClient(data.chainName).getTrx(data.txid)
      if (!tx) return
      action = tx.actions.find((a) => a.act.name === "emitxfer")
      console.log("act_digest:", action?.act_digest)
      // await sleep(1000)
    }
    data.trx = tx
    data.txidValid = !!data.trx
    // data.loadTrx = false
  } catch (error) {
    console.error(error)
    data.txidValid = false
    data.trx = null
    data.loadTrx = false
    if (retry) {
      await sleep(3000)
      return validateTxid(false)
    }
  }
}
const relayFee = compute(() => {
  const fee = ibcStore.sysConfig[data.chainName]?.min_fee.quantity
  return fee || Asset.from("0.0 LOADING")
})
const destinationChainLink = compute<LinkManager>(() => chainLinks[computed.trxMeta?.destinationChain || "telos"])
const disableBtn = compute<boolean>(() => data.relayed != false || !computed.originChainLink.loggedInAccount())
const computed = reactive({
  relayBtnLabel: compute(() => `Pay ${printAsset(relayFee.value)} to retry transfer.`),

  originChainLink: compute<LinkManager>(() => chainLinks[data.chainName]),
  trxMeta: compute<IbcMeta|null>(() => {
    if (!data.trx) return null
    const action = data.trx.actions.find((a) => a.act.name === "emitxfer")
    if (!action) return null
    console.log("action data:", JSON.stringify(action))
    let digest = ""
    if (action.act_digest) digest = getReceiptDigest(action)
    console.log("digest:", digest)
    const xferData = Emitxfer.from(action.act.data).xfer
    const contract = action.act.account
    const sym:string = xferData.quantity.quantity.symbol.code.toString()
    const validSym = Object.keys(ibcTokens).includes(sym)
    if (!validSym) return null
    const token = ibcTokens[sym as IBCSymbol]
    const toNative = token.nativeChain != data.chainName
    let destinationChain:ChainKey
    if (toNative) {
      destinationChain = token.nativeChain
    } else {
      const validDestination = Object.entries(token.wraplockContracts).find(([key, val]) => {
        console.log(val)

        return val === contract
      })
      console.log(validDestination)

      if (!validDestination) return null
      else destinationChain = validDestination[0] as ChainKey
    }
    console.log("token", token)
    console.log("toNative", toNative)

    const destinationContract:string|undefined = toNative ? token.wraplockContracts[data.chainName] : token.tokenContract[destinationChain]
    if (!destinationContract) return throwErr("destination contract is undefined")
    console.log("trxmeta here")
    const returnData:IbcMeta = {
      data: xferData,
      digest,
      sym,
      toNative,
      token,
      timestamp: action["@timestamp"],
      destinationChain,
      contract,
      destinationContract,
      trxBlock: action.block_num,
      lib: data.trx.lib,
      actDigest: action.act_digest,
      globalSequence: action.global_sequence
    }
    return returnData
  })
})


watch(() => computed.trxMeta, (meta) => {
  if (!meta) return
  startStep1()
})


function startStep1() {
  data.loadTrx = true
  console.log("start step1")
  if (step1Interval) clearInterval(step1Interval)
  data.relayed = null
  data.step = 1
  step1Interval = setInterval(async() => {
    if (!computed.trxMeta) return
    if (data.step != 1) return clearInterval(step1Interval)
    const info = await destinationChainLink.value.rpc.get_info()
    const trxLib = computed.trxMeta.trxBlock + 360
    const lib = info.last_irreversible_block_num.toNumber()
    if (computed.trxMeta.trxBlock < lib) {
      void startStep2()
      if (step1Interval) clearInterval(step1Interval)
      return
    }
  }, 1000)
}

async function startStep2() {
  data.loadTrx = true
  console.log("start step 2")
  data.step = 2
  if (!computed.trxMeta) return
  const params = {
    code: computed.trxMeta.destinationContract,
    table: "processed",
    scope: computed.trxMeta.destinationContract,
    reverse: true,
    limit: 1000
  }
  let found = false

  if (!computed.trxMeta) return
  if (data.step !== 2) return
  if (found) return
  const digests = await chainLinks[computed.trxMeta.destinationChain].rpc.get_table_rows(params)
  console.log("digests:", digests.rows.length)
  let digestList = digests.rows.map(r => r.receipt_digest)
  found = digestList.includes(computed.trxMeta.digest)
  console.log("found", found)
  data.relayed = found
  data.loadTrx = false
}



watch(() => data.txid, debounce(() => validateTxid(true), 500))
watch(() => data.chainName, () => ibcStore.loadSysConfig(data.chainName), { immediate: true })





</script>
