<template lang="pug">
div
  .centered.items-center.q-gutter-lg
    .col-auto
      .centered
        h5.text-white Sending
      .centered
        h3.text-white {{ printQuantity }}
    .col-auto
      .centered
        h5.text-white From
      .centered
        h3.text-white {{ printFromChain }}
    .col-auto
      .centered
        h5.text-white To
      .centered
        h3.text-white {{ printToChain }}
  .centered.q-mt-md
    h4.text-grey-2.text-weight-thin Progress
  div(v-if="step==1")
    .centered
      h3.text-white Waiting for Finality
    .centered
      .col-auto.q-ma-md
        p.text-white Time Remaining {{ printTimeUntil }}
        q-linear-progress(:value="libProgress" size="30px" style="width:400px; max-width:90vw" stripe rounded)
        .row.justify-between(style="width:400px; max-width:90vw")
          small.text-white {{ (ibcMeta.trxBlock - 360).toLocaleString() }}
          small.text-white {{ lib.toLocaleString() }}
          small.text-white {{ (ibcMeta.trxBlock).toLocaleString() }}
  div(v-if="step==2")
    .centered
      h3.text-white Waiting for Transaction to be relayed on {{ printToChain }}
    .centered
      q-spinner(size="150px" color="primary")
  div(v-if="step==3")
    .centered.q-mb-md
      h3.text-white Transaction Relayed!
    .centered.q-mb-md
      q-btn(label="view account" type="a" :href="acctLink" target="_blank" color="primary" size="lg")
    //- .centered
    //-   p.text-white querying for transaction details...
    //-   q-spinner(color="primary")

  div(v-if="step==4")
    .centered
      h3.text-white Transaction Relayed!
    .centered
      h3.text-white Relayed By: {{ relayer || "Unknown Account" }}
    .centered.q-pt-lg
      a(:href="exploreLink" target="_blank" class="text-bold text-primary" style="text-decoration:underline")
        p.text-white {{ relayedTrx?.trx_id }}
    .centered(v-if="ibcMeta.sym === 'BOID' && ibcMeta.destinationChain == 'telos'")
      a(class="text-bold text-primary" style="text-decoration:underline" @click="$router.push({name:'unwrap'})").cursor-pointer
        h4.text-white Final Step: Unwrap BOID Tokens


</template>

<script setup lang="ts">

import { configs, type ChainKey } from "lib/config"
import { type IbcMeta } from "lib/types/ibc.types"
import { normalizeRange, printAsset, sleep, throwErr, toObject } from "lib/utils"
import { chainLinks } from "src/boot/boot"
import { chainString } from "src/stores/ibcStore"
import { watch, computed, ref } from "vue"
import prettyms from "pretty-ms"
import { getHypClient } from "lib/hyp"
import { Action } from "@proton/hyperion"
import ms from "ms"
import { ibcTokens } from "lib/ibcTokens"
import { Asset } from "anchor-link"

const props = defineProps<{
  ibcMeta:IbcMeta,
  originChain:ChainKey
}>()

const step = ref(1)
const libProgress = ref(0)
const currentBlock = ref(0)
const lib = ref(0)
const trxLib = ref<number>(0)
const printQuantity = computed(() => printAsset(props.ibcMeta.data.quantity.quantity))
const printFromChain = computed(() => chainString(props.originChain))
const printToChain = computed(() => chainString(props.ibcMeta.destinationChain))
const libTest = ref(0.4)
const printTimeUntil = ref("")
const relayedTrx = ref<Action<any> | null>(null)
const relayer = ref<null | string>(null)
const exploreLink = ref<undefined | string>(undefined)
const acctLink = ref<undefined | string>(undefined)

let step1Interval:any = null

function startStep1() {
  console.log("start step1")

  if (step1Interval) clearInterval(step1Interval)
  step.value = 1
  step1Interval = setInterval(async() => {
    if (step.value != 1) return clearInterval(step1Interval)
    const info = await chainLinks[props.originChain].rpc.get_info()
    trxLib.value = props.ibcMeta.trxBlock + 360
    lib.value = info.last_irreversible_block_num.toNumber()
    currentBlock.value = info.head_block_num.toNumber()
    libProgress.value = normalizeRange(props.ibcMeta.trxBlock - 360, props.ibcMeta.trxBlock, lib.value)
    console.log(props.ibcMeta.trxBlock - lib.value)

    printTimeUntil.value = prettyms(((props.ibcMeta.trxBlock - lib.value) * 0.5) * 1000, { formatSubMilliseconds: false, keepDecimalsOnWholeSeconds: false, compact: true, verbose: true })

    if (props.ibcMeta.trxBlock < lib.value) {
      void startStep2()
      if (step1Interval) clearInterval(step1Interval)
      return
    }
  }, 3000)
}

async function startStep2() {
  console.log("start step 2")
  step.value = 2
  const params = {
    code: props.ibcMeta.destinationContract,
    table: "processed",
    scope: props.ibcMeta.destinationContract,
    reverse: true,
    limit: 1000
  }
  let found = false
  await loop()
  async function loop():Promise<void> {
    if (step.value !== 2) return
    if (found) return
    const digests = await chainLinks[props.ibcMeta.destinationChain].rpc.get_table_rows(params)
    console.log("digests:", digests.rows.length)
    let digestList = digests.rows.map(r => r.receipt_digest)
    found = digestList.includes(props.ibcMeta.digest)
    console.log("found", found)
    await sleep(4000)
    if (!found) {
      await sleep(ms("10s"))
      return loop()
    } else return
  }
  await loop()
  step.value = 3
  acctLink.value = configs[props.ibcMeta.destinationChain].explorer + "/account/" + props.ibcMeta.data.beneficiary
  const hyp = getHypClient(props.ibcMeta.destinationChain)
  // hyp.hypClients[0]?.get_actions({})
  const trx = await getHypClient(props.ibcMeta.destinationChain).getActionsRange(Date.now() - ms("2d"), Date.now() + 1000, "transfer", props.ibcMeta.data.beneficiary.toString(), 10)
  // hyp
  console.log(trx)

  // console.log("loop finished, action found", relayedTrx.value)
}

// async function startStep4() {
//   step.value = 4
//   console.log("start step 4")
//   if (!relayedTrx.value) throwErr("Should never be null here")
//   const trx = await getHypClient(props.ibcMeta.destinationChain).getTrx(relayedTrx.value.trx_id)
//   console.log(trx)

//   const relayed = trx?.actions.find(act => act.act.name === "issuea" || act.act.name === "issueb" || act.act.name === "withdrawa" || act.act.name === "withdrawb")
//   if (!relayed) throwErr("this is never null here")
//   if (relayed.act.authorization.length > 1) {
//     relayer.value = relayed.act.authorization[relayed.act.authorization.length - 1]?.actor || null
//   } else relayer.value = relayed.act.authorization[0]?.actor || null
//   exploreLink.value = configs[props.ibcMeta.destinationChain].explorer + "/transaction/" + relayedTrx.value.trx_id
// }

watch([() => props.ibcMeta], async() => {
  startStep1()
}, { deep: true, immediate: true })


</script>
