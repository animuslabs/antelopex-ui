<template lang="pug">
q-page(padding)
  .centered.relative-position
    .col-auto
      img(src="/unwrap-icon.svg" style="width:370px; max-width:80vw; top:170px; opacity:.8; ").absolute-center
  .centered
    h1.text-white Unwrap IBC Token
  .centered
    h5.text-white Some tokens need to be unwrapped on the destination chain after an IBC transfer
  .centered.q-pt-lg
    ChainSelect(:chainArray="chainButtons" :selectedChain="destinationChainName" @chainSelected="(val)=>destinationChainName = val")
  .centered
    .col-auto
      .row.q-pt-lg
        h5.text-weight-light.text-white Target Account
      AuthCard(:chain="destinationChain" :name="destinationChainName").q-pa-sm
  .centered.q-mt-md
    div(style="max-width:400px;")
      .col-auto
        h5.text-weight-light.text-white.q-pb-xs Unwrappable Tokens
      .centered
        unwrappableTokens(v-bind="unwrapProps")

</template>

<script setup lang="ts">
import { chainNames, type ChainKey } from "lib/config"
import type { LinkManager } from "lib/linkManager"
import type { QBtnDropdown } from "quasar"
import { chainLinks } from "src/boot/boot"
import { chainString } from "src/stores/ibcStore"
import { type ExtractPropTypes, watch, computed, reactive, ref, type ComputedRef, onMounted } from "vue"
import AuthCard from "src/components/AuthCard.vue"
import { chainButtons } from "src/lib/utils"
import unwrappableTokens from "src/components/UnwrappableTokens.vue"
import { userStore as UserStore } from "src/stores/userStore"
import ChainSelect from "src/components/ChainSelect.vue"

const userStore = UserStore()

const loggedInUserName = ref<string | undefined>(undefined)
const destinationChainName = ref<ChainKey>("telos")
const destinationChain = computed<LinkManager>(() => chainLinks[destinationChainName.value])

let unwrapProps:ComputedRef<InstanceType<typeof unwrappableTokens>["$props"]> = computed(() => ({
  chain: destinationChain.value,
  chainName: destinationChainName.value,
  targetAccountName: loggedInUserName.value
}))

watch([destinationChain], () => {
  void destinationChain.value.try_restore_session()
}, { immediate: true })

watch([() => userStore.getLoggedIn, destinationChain], () => {
  const loggedIn = userStore.getLoggedIn
  console.log({ loggedIn })

  if (!loggedIn) loggedInUserName.value = undefined
  else {
    const chainId = loggedIn.chainId
    const currentChainId = destinationChain.value.link.chains[0]?.chainId.toString()
    const matching = chainId === currentChainId
    if (matching) loggedInUserName.value = loggedIn.account || undefined
    else loggedInUserName.value = undefined
  }
  console.log(loggedInUserName.value)
}, { deep: true, immediate: true })

</script>
