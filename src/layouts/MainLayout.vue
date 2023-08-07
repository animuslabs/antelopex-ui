<template lang="pug">
q-layout
  q-header.transparent
    q-toolbar.q-mt-md
      .row.q-gutter-md.items-center.full-width
        .col-auto(style="width:170px;")
          img(src="mainLogo.svg" style="margin:auto;").q-pt-sm
        .col-auto
          p Seamless IBC Service
        //- .col-grow
        .col-auto.bg-yellow.q-pa-md.z-top
          .centered.text-black This Service is in Beta
          .centered.text-black Any issues can be reported on Telegram: #[a(href="https://t.me/antelopex" target="_blank").text-black @AntelopeX].
          //- .centered.text-black BOID tokens on Telos must be wrapped/unwrapped to to be usable
      //- div(style="font-size:40px;").q-mr-md.text-grey-5 |
      //- q-btn(label="login" color="positive" rounded style="width:120px").q-mr-xs

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
