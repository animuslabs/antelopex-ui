<template lang="pug">
q-layout
  q-header.header-art
    q-toolbar
      .centered.q-gutter-md.items-center.full-width
        .col-auto
          .centered.items-center
            //- .text-h6.text-teal-12 AntelopeX
            img(src="antelopex-title.webp" style="width:145px")

  q-page-container
    router-view

</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  data() {
    return {

    }
  },
  methods: {

  }
})
</script>
