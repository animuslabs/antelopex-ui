<template lang="pug">
q-page(padding)
  //- .centered
    //- div {{ $user().loggedIn }}
  .centered
    .col-auto(v-for="(chain,name) in $link")
      auth-card(:name="name" :chain="chain" :id="name").non-selectable
</template>

<script lang="ts">
import { LinkSession } from "anchor-link"
import { ChainKey } from "lib/config"
import { LinkManager } from "lib/linkManager"
import AuthCard from "src/components/AuthCard.vue"
import { defineComponent } from "vue"

export default defineComponent({
  setup() {
  },
  data() {
    return {
      sessions: {
        eos: [] as LinkSession[],
        telos: [] as LinkSession[],
        wax: [] as LinkSession[]
      }
    }
  },
  methods: {
    clicked(name:string, chain:LinkManager) {
      console.log("clicked")
      console.log(name)
    }
  },
  async mounted() {
    for (const [name, chain] of Object.entries(this.$link)) {
      console.log(name)
      // let chainName = name as ChainKey
      // const sessions = await chain.getSessions()
      // console.log("sessions:", sessions)
      // //ts-ignore
      // this.sessions[chainName] = sessions
      // chain.try_restore_session()
    }
  },
  computed: {},
  components: { AuthCard }
})
</script>
