import { Action, AnyAction, NameType } from "anchor-link"
import { LinkManager } from "lib/linkManager"
import { Notify } from "quasar"
import { Transfer } from "./types/token.types"

export const makeAction = {
  transfer(data:Transfer, contract:NameType, link:LinkManager):AnyAction {
    const authorization = link.session?.auth
    if (!authorization) throw (new Error("auth missing"))
    return Action.from({ name: "transfer", account: contract, data, authorization: [authorization] })
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
