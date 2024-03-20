<template lang="pug">
q-card
  .centered.q-ma-md(v-if="nftData.immutable?.img")
    q-img(:src="ipfsUrl(nftData.immutable.img)" loading="eager" :loading-show-delay="1500" )
  .centered
    h5.q-ma-md {{ nftData.immutable?.name }}

</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import { Contract as AtomicContract, Types as AtomicTypes } from "lib/types/atomicassets.types"
import { ChainKey } from "lib/config"
import { useNftStore } from "src/stores/nftStore"
import { ipfsUrl } from "lib/ipfsUtil"

export default defineComponent({
  data() {
    return {
      ipfsUrl,
      nftData: {} as Record<string, any>
    }
  },
  emits: ["name"],
  props: {
    asset: {
      type: Object as PropType<AtomicTypes.assets_s>,
      required: true
    },
    chainKey: {
      type: String as PropType<ChainKey>,
      required: true
    }
  },
  computed: {
    nftStore() {
      return useNftStore(this.chainKey)
    }
  },
  watch: {
    asset: {
      handler: async function(asset) {
        this.nftData = await this.nftStore.nftData(asset)
        const name = this.nftData.immutable?.name
        if (name) this.$emit("name", name)
      },
      immediate: true
    }
  }
})
</script>
