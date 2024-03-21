<template lang="pug">
q-layout
  q-header.transparent.relative-position
    .q-ma-md
      .row.q-gutter-md.items-center
        .col-auto(style="width:170px;")
          img(src="/mainLogo.svg" style="margin:auto;").q-pt-sm
        .col-auto
          p Seamless IBC Service
    .centered.q-mb-lg(style="width:100%; position:absolute; top:15px;").gt-sm
      .col
        q-tabs(indicatorColor="transparent" activeClass="activeTab")
          q-route-tab(to="/" exact label="Token Bridge").col-auto
          q-route-tab(to="/nft" label="NFT Bridge").col-auto
          q-route-tab(to="/unwrap" exact label="unwrap").col-auto
          q-route-tab(to="/status" label="status").col-auto
          q-route-tab(to="/retry" label="retry").col-auto
    .centered.q-mb-lg(style="width:100%;").lt-md
      .col
        q-tabs(indicatorColor="transparent" activeClass="activeTab" )
          q-route-tab(to="/" exact label="Token Bridge").col-auto
          q-route-tab(to="nft" label="NFT Bridge" ).col-auto
          q-route-tab(to="/unwrap" exact label="unwrap").col-auto
          q-route-tab(to="status" label="status" ).col-auto
          q-route-tab(to="retry" label="retry" ).col-auto
  q-page-container
    router-view.q-mt-lg
  .col.bg-yellow.q-pa-md.z-top
    .centered.text-black This service is in beta
    .centered.text-black Join us on #[a(href="https://t.me/antelopex" target="_blank").text-black.q-mr-xs.q-ml-xs Telegram] for support.

</template>
<style lang="sass">
.activeTab
  background-color: transparentize($primary,0.8)
</style>

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
