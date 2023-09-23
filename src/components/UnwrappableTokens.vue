<template lang="pug">
div.relative-position
  h5(v-if="!targetAccountName").text-weight-light.text-white.q-pb-xs Select Account
  div(v-else)
    q-list(v-for="token in chainUnwrappable")
      q-item(:clickable="(tknBalances[token.sym]?.value||0) > 0" @click="unwrapToken(token)" :disable="(tknBalances[token.sym]?.value||0) === 0")
        q-tooltip(v-if="(tknBalances[token.sym]?.value||0) > 0")
          p Unwrap {{ token.sym }}
        q-tooltip(v-else)
          p No {{ token.sym }} to unwrap
        .row.items-center.q-gutter-lg
          .col-auto
            h4 {{ token.sym }}
          .col-auto.relative-position
            .row.items-center.q-gutter-md
              .col-auto
                .row
                  h6 {{ ibcTokens[token.sym].tokenContract[chainName] }}
                .row
                  div {{ tknBalances[token.sym] }}
              .col-auto
                q-icon(name="arrow_forward" size="30px").collapse-icon
              .col-auto
                .row
                  h6 {{ token.data.nativeToken[chainName] }}
                .row
                  div {{ nativeBalances[token.sym] }}

  .centered.absolute-center
    q-spinner( color='primary' size='2rem' :thickness='2' v-if="loading")
</template>

<script setup lang="ts">
import { Asset } from "anchor-link"
import { type ChainKey } from "lib/config"
import { getChainUnwrapable, type UnwrappableType } from "lib/ibcHubs"
import { ibcTokens } from "lib/ibcTokens"
import { LinkManager } from "lib/linkManager"
import { doActions, makeAction } from "lib/transact"
import { type IbcSymbols } from "lib/types/ibc.types"
import { throwErr } from "lib/utils"
import { TknStore } from "src/stores/tokenStore"
import { computed, defineProps, reactive, ref, toRefs, watchEffect } from "vue"

let tknStore = TknStore()
type UnwrapableBal = Partial<Record<ChainKey, Partial<Record<IbcSymbols, Asset>>>>
let unwrapableBal:UnwrapableBal = reactive({})
const chainUnwrappable = computed<UnwrappableType[]>(() => getChainUnwrapable(propRefs.chainName.value))
const props = defineProps<{chain:LinkManager, targetAccountName:string|undefined, chainName:ChainKey}>()
const propRefs = toRefs(props)
const loading = ref(false)
// const nativeBalances:Ref<Partial<Record<IbcSymbols, Asset>>> = ref({})

async function unwrapToken(token:UnwrappableType) {
  loading.value = true
  const from = props.targetAccountName
  if (!from) return
  const quantity = tknBalances.value[token.sym]
  if (!quantity || quantity.value <= 0) return console.log("no tokens to unwrap")
  const to = token.data.hubContract[props.chainName]
  if (!to) throwErr("no hubContract for target chain")
  const tokenContract = ibcTokens[token.sym].tokenContract[props.chainName]
  if (!tokenContract) throwErr("missing token contract")
  const action = makeAction.transfer({
    from, to, quantity, memo: `issue_to=${from}`
  }, tokenContract, props.chain)
  await doActions([action], props.chain)
  setTimeout(async() => await loadBalances(), 1000)
  loading.value = false
}

async function loadBalances() {
  await Promise.all([checkUnwrappableBalances(), loadWrappedBalances()])
}
async function checkUnwrappableBalances() {
  if (!props.targetAccountName) return
  console.log("checkUnwrapable")
  for (const tkn of chainUnwrappable.value) {
    await tknStore.loadIbcBal(props.targetAccountName, props.chainName, tkn.sym)
  }
}

async function loadWrappedBalances() {
  if (!props.targetAccountName) return
  console.log("checkUnwrapable")
  for (const tkn of chainUnwrappable.value) {
    await tknStore.loadNativeBal(props.targetAccountName, props.chainName, tkn.sym)
  }
}

const tknBalances = computed(() => {
  let balances:Partial<Record<IbcSymbols, Asset>> = {}
  const acct = props.targetAccountName
  if (!acct) return balances
  chainUnwrappable.value.forEach(el => {
    const symbol = `${ibcTokens[el.sym].precision},${el.sym}`
    const val = tknStore.ibcBal[acct]?.[el.sym]?.[props.chainName]
    balances[el.sym] = Asset.from(val || 0, symbol)
  })
  return balances
})

const nativeBalances = computed(() => {
  let balances:Partial<Record<IbcSymbols, Asset>> = {}
  const acct = props.targetAccountName
  if (!acct) return balances
  chainUnwrappable.value.forEach(el => {
    const symbol = `${ibcTokens[el.sym].precision},${el.sym}`
    const val = tknStore.nativeBal[acct]?.[el.sym]?.[props.chainName]
    balances[el.sym] = Asset.from(val || 0, symbol)
  })
  return balances
})


watchEffect(async() => {
  console.log("props triggered")
  if (!propRefs.targetAccountName.value) return
  loading.value = true
  console.log(propRefs.chain.value.config.explorer)
  console.log("targetAccountName is now available")
  await loadBalances()
  setTimeout(() => loading.value = false, 1000)
})



</script>
