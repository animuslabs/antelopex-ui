<template lang="pug">
q-dialog(ref="dialogRef", @hide="onDialogHide")
  q-card.q-dialog-plugin.q-pa-lg(style="max-width:600px; width:95vw; min-width:300px; overflow:visible;").bg-blue-grey-9.text-white.relative-position
    .centered
      h3 Are you sure you want to send
    .centered
      h2 {{ printAsset(props.quantity) }}
    .q-pa-lg.bg-blue-grey-10.relative-position
      img.q-pr-xl(src="/arrow.svg" style="width:100px; right:0px;").absolute-center.gt-xs
      .row.items-center
        .col-auto(style="width:20px")
        .col-auto
          p.block From Chain
          h4 {{ props.fromChainName }}
        .col-grow
        .col-auto(style="width:180px;")
          p.block To Chain
          h4 {{ props.toChainName }}

    //- q-separator(spaced)
    .full-width.q-ma-md
    .q-pa-lg.bg-blue-grey-10.relative-position
      img.q-pr-xl(src="/arrow.svg" style="width:100px; right:0px;").absolute-center.gt-xs
      .row.items-center
        .col-auto(style="width:20px")
        .col-auto
          p.block From Account
          h4 {{ props.fromAccountName }}
        .col-grow
        .col-auto(style="width:180px;").q-mt-md
          p.block To Account
          h4 {{ props.destinationAccountName }}
    .full-width.q-ma-md
      .centered
        h5 IBC Relay Fee: {{printAsset(props.relayFee)}}
    .full-width(style="height:30px;")
    .centered.q-gutter-xl.absolute-bottom(style="bottom:-20px;")
      q-btn(color="positive", label="Confirm", @click="onOKClick" size="lg" rounded)
      q-btn(color="white" label="Cancel", @click="onDialogCancel" size="lg" rounded).text-black
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar"
import { Asset } from "@greymass/eosio"
import { confirmTranferModal } from "lib/composableUtil"
import { printAsset } from "lib/utils"
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const props = defineProps<{
  relayFee:Asset
  fromChainName:string
  toChainName:string
  quantity:Asset
  destinationAccountName:string,
  fromAccountName:string
  }>()

defineEmits([
  ...useDialogPluginComponent.emits
])

function onOKClick() {
  onDialogOK()
}
</script>

