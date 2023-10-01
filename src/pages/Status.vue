<template lang="pug">
q-page(padding)
  .centered.relative-position
    .col-auto
      img(src="/info_icon.svg" style="width:370px; max-width:80vw; top:120px; opacity: 1; z-index:-100; ").absolute-center
  .centered.items-center.q-gutter-md
    h1.text-white Transaction Status
    q-btn(icon="info" size="md" flat round @click="hideDetails = !hideDetails")
  .centered.q-pb-xl(v-if="!hideDetails")
    .col-auto
      ChainSelect(:chainArray="chainButtons" :selectedChain="chainName" @chainSelected="(val)=>chainName = val")
    .col-auto
      h5.text-weight-light.text-white.q-pb-xs Transaction ID
      q-input(
      dark
      labelColor="white"
      filled
      color="white"
      noErrorIcon
      :loading="loadTrx"
      v-model="txid"
      inputStyle="font-size: 25px;"
      :error-message="txidValid?undefined:'Invalid Transaction ID'"
      :error="txidValid == false"
      style="max-width:90vw; width:400px; z-index:1000;"
    )
  .centered.q-mt-lg(v-if="!trxMeta && txidValid")
    .q-pa-sm.bg-negative.rounded-borders
      h4.text-white Provided Transaction doesn't contain IBC related actions
  .centered(v-else-if="!!trxMeta")
    .col
      StatusProgress(:ibcMeta="trxMeta" :originChain="chainName")
</template>

<script setup lang="ts">
import { type ChainKey, chainNames } from "lib/config"
import ChainSelect from "src/components/ChainSelect.vue"
import { computed, nextTick, onDeactivated, onMounted, onUnmounted, ref, watch, watchEffect } from "vue"
import { useRouter } from "vue-router"
import { chainButtons, deepClone, sleep, stringToBool } from "lib/utils"
import { Checksum256 } from "anchor-link"
import { debounce, throttle } from "quasar"
import { chainLinks } from "src/boot/boot"
import { type GetTransaction, getHypClient } from "lib/hyp"
import { Emitxfer } from "lib/types/wraptoken.types"
import { type IBCSymbol, ibcTokens } from "lib/ibcTokens"
import { type IbcMeta } from "lib/types/ibc.types"
import StatusProgress from "src/components/StatusProgress.vue"

const txid = ref<string | null>(null)
const chainName = ref<ChainKey>("telos")
const router = useRouter()
const txidValid = ref<boolean|null>(null)
const trx = ref<null|GetTransaction<unknown>>(null)
const loadTrx = ref<boolean>(false)
const lib = ref<number>(0)
const hideDetails = ref(false)

onMounted(() => {
  const params = router.currentRoute.value.query
  if (params.chain && typeof params.chain === "string" && chainNames.includes(params.chain as ChainKey)) chainName.value = params.chain as ChainKey
  if (params.txid && typeof params.txid === "string") txid.value = params.txid as string
  if (params.hideDetails && typeof params.hideDetails === "string") hideDetails.value = stringToBool(params.hideDetails) as boolean
})

watch([chainName, txid, hideDetails], () => {
  void router.replace({ path: router.currentRoute.value.path, query: deepClone({ txid: txid.value, chain: chainName.value, hideDetails: hideDetails.value }) } as any)
}, { immediate: false, deep: false })


async function validateTxid(retry = true):Promise<void> {
  try {
    loadTrx.value = false
    console.log(txid.value)
    // throttled()
    if (!txid.value) return
    const validTxid = Checksum256.from(txid.value)
    console.log(validTxid.toString())
    loadTrx.value = true
    trx.value = await getHypClient(chainName.value).getTrx(txid.value)
    txidValid.value = !!trx.value
    loadTrx.value = false
  } catch (error) {
    console.error(error)
    txidValid.value = false
    trx.value = null
    loadTrx.value = false
    if (retry) {
      await sleep(3000)
      return validateTxid(false)
    }
  }
}
let interval:any

// onMounted(() => {
//   interval = setInterval(validateTxid, 10000)
// })

// onUnmounted(() => {
//   console.log("deactivated")
//   if (interval)clearInterval(interval)
// })

const trxMeta = computed<IbcMeta|null>(() => {
  if (!trx.value) return null
  const action = trx.value.actions.find((a) => a.act.name === "emitxfer")
  if (!action) return null
  console.log(action.act.data)

  const data = Emitxfer.from(action.act.data).xfer
  const contract = action.act.account

  const sym:string = data.quantity.quantity.symbol.code.toString()
  const validSym = Object.keys(ibcTokens).includes(sym)
  if (!validSym) return null
  const token = ibcTokens[sym as IBCSymbol]
  const toNative = token.nativeChain != chainName.value
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
  console.log("trxmeta here")
  const returnData:IbcMeta = {
    data,
    sym,
    timestamp: action["@timestamp"],
    destinationChain,
    contract,
    trxBlock: action.block_num,
    lib: trx.value.lib,
    actDigest: action.act_digest,
    globalSequence: action.global_sequence
  }
  return returnData
})


watch([txid], debounce(() => validateTxid(true), 500))


</script>
