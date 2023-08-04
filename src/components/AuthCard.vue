<template lang="pug">
div(v-if="!hide" style="width:380px; max-width:80vw")
  q-list(v-for="account in sessions" :key="account.auth.toString()")
    q-item(clickable tag="label")
      //- div {{ selected }}
      .row.items-center.full-width
        .col-auto
          q-radio(v-model="selected" :val="account.auth.toString()")
        .col-auto
          q-avatar
              q-icon(name="account_circle")
        .col-auto
          div {{ account.auth.actor }}
        .col-auto
          div @{{ account.auth.permission }}
        .col-grow
        .col-auto.q-ml-md.self-end
          q-avatar
            q-btn(icon="delete" flat color="grey-3" size="sm" @click="removeAccount(account.auth.toString())").bg-transparent
  .centered
    q-btn(@click="addAccount()" icon="add" :label="'add '+name +' account'").q-mt-xs.full-width
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
      sessions: [] as SessionData[],
      hide: false
    }
  },
  methods: {
    async removeAccount(account:string) {
      const chainId = this.chain.link.chains[0]?.chainId
      const acct = this.sessions.filter(el => el.auth.toString() === account)?.[0]?.auth as PermissionLevel
      if (!chainId || !acct) return
      await this.chain.deleteSession(acct, chainId)
      this.loadSessions()
    },
    async addAccount() {
      console.log("add account")
      await this.chain.login()
      await this.loadSessions()
    },
    async loadSessions() {
      console.log("load sessions")
      this.sessions = []
      this.$nextTick(async() => {
        const sessions = await this.chain.getSessions()
        this.sessions = sessions
        console.log("force update")
      })
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
