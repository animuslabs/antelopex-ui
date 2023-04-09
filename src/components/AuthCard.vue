<template lang="pug">
div
  q-card.q-ma-md.q-pa-md
    .centered
      h3.text-weight-light(style="text-transform: capitalize;") {{ name.toUpperCase() }} Account
    q-separator(spaced)
    q-list(v-for="account in sessions")
      q-item(clickable tag="label")
        //- div {{ selected }}
        .row.items-center
          .col-auto
            q-radio(v-model="selected" :val="account.auth.toString()")
          .col-auto
            q-avatar
                q-icon(name="account_circle")
          .col-auto
            div {{ account.auth.actor }}
          .col-auto
            div @{{ account.auth.permission }}
    q-separator(spaced)
    .centered
      q-btn(@click="addAccount()").q-mt-xs add account
</template>

<script lang="ts">
import { PermissionLevel } from "anchor-link"
import { LinkManager, SessionData } from "lib/linkManager"
import { LoggedInState, userStore } from "src/stores/userStore"
import { PropType, defineComponent } from "vue"

export default defineComponent({
  props: {
    name: {
      type: String as PropType<string>,
      required: true
    },
    chain: {
      type: Object as PropType<LinkManager>,
      required: true
    }
  },
  data() {
    return {
      userStore: userStore(),
      selected: "" as string|null,
      sessions: [] as SessionData[]
    }
  },
  methods: {
    async addAccount() {
      console.log("add account")
      await this.chain.login()
      await this.loadSessions()
    },
    async loadSessions() {
      console.log("load sessions")
      const sessions = await this.chain.getSessions()
      this.sessions = sessions
      const loggedIn = this.chain.loggedInAccount()
      if (!loggedIn) return
    }
  },
  async mounted() {
    this.loadSessions()
  },
  watch: {
    chain: {
      handler: function(val:any) {
        this.loadSessions()
      },
      deep: false,
      immediate: false
    },
    "userStore.getLoggedIn": {
      handler: function(val:LoggedInState|false) {
        this.selected = null
        if (!val) return
        const chainId = this.chain.link.chains[0]?.chainId
        if (!chainId) return
        const loggedInId = val.chainId
        if (!loggedInId) return
        if (loggedInId !== chainId.toString()) return
        if (!val.auth) return
        console.log("WATCHER loggedIn:", val.auth.toString())
        this.selected = val.auth.toString()
      },
      deep: true,
      immediate: true
    },
    selected(val:string) {
      if (!val) return
      console.log("selected:", val)
      const chainId = this.chain.link.chains[0]?.chainId
      if (!chainId) return
      this.chain.restore_session(PermissionLevel.from(val), chainId)
    }
  }
})
</script>
