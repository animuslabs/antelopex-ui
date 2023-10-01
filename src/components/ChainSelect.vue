<template lang="pug">
.centered
  q-item(dense).centered
    .col-auto
      h5.text-weight-light.text-white.q-pb-xs Origin Chain
      q-btn-dropdown( noCaps :label="chainString(props.selectedChain)" size="lg" style=" width:200px; " align="left" split ref="chainMenu" @click="showChainMenu()").cursor-pointer
        q-list(separator padding)
          q-item( v-for="chain of chainArray" clickable v-close-popup @click="chainName = chain.value").q-ma-sm
            q-item-section
              q-item-label(style="font-size: 20px;").text-capitalize {{ chain.label }}
</template>

<script setup lang="ts">
import { type ChainKey } from "lib/config"
import { chainButtons } from "lib/utils"
import { QBtnDropdown } from "quasar"
import { chainString } from "src/stores/ibcStore"
import { onMounted, ref, watchEffect } from "vue"

const chainName = ref<ChainKey>("telos")
const chainMenu = ref<InstanceType<typeof QBtnDropdown> | null>(null)

async function showChainMenu() {
  chainMenu.value?.toggle()
}

const props = defineProps <{
  chainArray:typeof chainButtons,
  selectedChain:ChainKey,
}>()

// onMounted(() => {
//   if (!props.selectedChain) props.selectedChain = "telos"
// })

const emit = defineEmits({
  chainSelected: (chainName:ChainKey) => true
})

watchEffect(() => {
  chainName.value = props.selectedChain
})

watchEffect(() => {
  emit("chainSelected", chainName.value)
})


</script>
