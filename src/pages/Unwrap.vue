<template lang="pug">
q-page(padding)
  .centered.relative-position
    .col-auto
      img(src="/unwrap-icon.svg" style="width:370px; max-width:80vw; top:170px; opacity:.4; ").absolute-center
  .centered
    h1.text-white Unwrap IBC Token
  .centered
    h5.text-white Some tokens need to be unwrapped on the destination chain after an IBC transfer
  .centered.q-mt-lg
    q-item(dense).centered
      .col-auto
        h5.text-weight-light.text-white.q-pb-xs Destination Chain
        q-btn-dropdown( noCaps :label="chainString(destinationChainName)" size="lg" style=" width:200px; " align="left" split ref="chainMenu" @click="showChainMenu()").cursor-pointer
          q-list(separator padding)
            q-item( v-for="chain of chainButtons" clickable v-close-popup @click="destinationChainName = chain.value").q-ma-sm
              q-item-section
                q-item-label(style="font-size: 20px;").text-capitalize {{ chain.label }}
  .centered
    .col-auto
      .row.q-pt-lg
        h5.text-weight-light.text-white Target Account
      authCard(:chain="destinationChain" :name="destinationChainName").q-pa-sm
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
import { type ExtractPropTypes, watch, computed, reactive, ref, type ComputedRef } from "vue"
import authCard from "src/components/AuthCard.vue"
import { chainButtons } from "src/lib/utils"
import unwrappableTokens from "src/components/UnwrappableTokens.vue"
import { userStore as UserStore } from "src/stores/userStore"

const userStore = UserStore()
const chainMenu = ref<InstanceType<typeof QBtnDropdown> | null>(null)
const loggedInUserName = ref<string | undefined>(undefined)
const destinationChainName = ref<ChainKey>("telos")
const destinationChain = computed<LinkManager>(() => chainLinks[destinationChainName.value])

let unwrapProps:ComputedRef<InstanceType<typeof unwrappableTokens>["$props"]> = computed(() => ({
  chain: destinationChain.value,
  chainName: destinationChainName.value,
  targetAccountName: loggedInUserName.value
}))


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

async function showChainMenu() {
  chainMenu.value?.toggle()
}

</script>
