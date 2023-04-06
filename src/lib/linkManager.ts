import { boot } from "quasar/wrappers"
import { LocalStorage } from "quasar"
import AnchorLink, { LinkChannelSession, APIClient, ChainId, LinkSession, PermissionLevel, TransactArgs, PermissionLevelType, ChainIdType } from "anchor-link"
import AnchorLinkBrowserTransport from "anchor-link-browser-transport"
import { userStore } from "src/stores/userStore"
import { Config } from "src/lib/config"
const client = new APIClient({ url: "https://eos.api.animus.is" })

interface StoredSession {
  auth:{actor:string, permission:string},
  chainId:string
}
export type SessionData = { auth:PermissionLevel; chainId:ChainId; }

export class LinkManager {
  store:typeof userStore
  config:Config
  appName:string
  session:LinkSession | null = null
  transport:AnchorLinkBrowserTransport
  client!:APIClient
  rpc!:typeof client.v1.chain
  link:AnchorLink

  constructor(config:Config) {
    this.config = config
    this.store = userStore
    this.appName = config.linkData.appName
    this.setApi(new APIClient({ url: this.config.linkData.nodeUrl }))
    this.rpc = client.v1.chain
    this.transport = new AnchorLinkBrowserTransport({ storagePrefix: "anchor-" + this.appName, fuelReferrer: "boid" })
    this.link = new AnchorLink({
      transport: this.transport,
      chains: [config.linkData]
    })
    // this.try_restore_session()
  }

  setApi(client:APIClient) {
    this.client = client
    this.rpc = client.v1.chain
  }

  async transact(args:TransactArgs) {
    if (this.session === null) return console.log("no session, login first")
    const res = await this.session.transact(args)
    return res
  }

  async login() {
    const identity = await this.link.login(this.appName)
    if (identity) {
      const { session } = identity
      this.session = session
      this.setApi(this.session.client)
      this.try_restore_session()
      console.log(session.auth)
    }
  }

  async logout() {
    if (this.session) {
      await this.link.removeSession(
        this.appName,
        this.session.auth,
        this.session.chainId
      )
      this.session = null
      this.setApi(this.link.client)
      this.store().setUser(false)
      // this.try_restore_session()
    } else {
      console.log("you can't logout if there is no active session")
    }
  }

  async deleteSession(permissionlevel:PermissionLevel, chainId:ChainId):Promise<void> {
    if (!this.session) return this.link.removeSession(this.appName, permissionlevel, chainId)
    console.log(this.session.auth.equals(permissionlevel))
    console.log(this.session.chainId.equals(chainId))
    if (this.session.auth.equals(permissionlevel) && this.session.chainId.equals(chainId)) {
      console.log("current session")
      this.logout()
    } else {
      await this.link.removeSession(this.appName, permissionlevel, chainId)
    }
  }

  async restore_session(permissionlevel:PermissionLevelType, chainId:ChainIdType):Promise<void> {
    const session = await this.link.restoreSession(
      this.appName,
      permissionlevel,
      chainId
    )
    // console.log(session);
    if (session) {
      this.session = session
      this.setApi(this.session.client)
      this.store().setUser(session)
    }
  }

  async try_restore_session():Promise<false | LinkSession> {
    try {
      const session = await this.link.restoreSession(this.appName)
      if (session) {
        console.log(
          `${session.chainId} session reestablished for ${session.auth}`
        )
        this.session = session
        this.setApi(this.session.client)
        this.store().setUser(session)
        return session
      } else {
        console.log("no saved sessions available")
        this.setApi(this.link.client) // set api to default chain
        return false
      }
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async getSessions():Promise <SessionData[]> {
    const sessions = await this.link.listSessions(this.appName)
    return sessions
  }

  loggedInAccount():PermissionLevelType | null {
    const data = this.store().loggedIn.auth
    return data as PermissionLevelType
  }
}
