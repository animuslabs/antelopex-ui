import { Action, AnyAction, AssetType, NameType } from "anchor-link"
import { LinkManager } from "lib/linkManager"
import { Notify } from "quasar"
import { Transfer } from "./types/token.types"
import { Retire } from "lib/types/wraptoken.types"

export const makeAction = {
  transfer(data:{from:NameType, to:NameType, quantity:AssetType, memo:string}, contract:NameType, link:LinkManager):AnyAction {
    const authorization = link.session?.auth
    if (!authorization) throw (new Error("auth missing"))
    return Action.from({ name: "transfer", account: contract, data: Transfer.from(data), authorization: [authorization] })
  },
  retire(data:{owner:NameType, beneficiary:NameType, quantity:AssetType}, contract:NameType, link:LinkManager):AnyAction {
    const authorization = link.session?.auth
    if (!authorization) throw (new Error("auth missing"))
    return Action.from({ name: "retire", account: contract, data: Retire.from(data), authorization: [authorization] })
  }
}

export async function doActions(actions:AnyAction[], link:LinkManager, alert = true) {
  try {
    const result = await link.transact({ actions })
    if (!result) return
    Notify.create({
      message: "Transaction Success",
      color: "positive",
      actions: [
        {
          icon: "link",
          href: link.config.explorer + "/transaction/" + result.transaction.id
        }
      ]
    })
    return result
  } catch (error:any) {
    console.log(error)
    Notify.create({
      message: "Transaction Failed!",
      color: "negative"
    })
  }
}
