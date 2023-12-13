import { AccountRAMDelta, Action, GetActions, GetDeltas, JsonRpc, V2_GET_DELTAS } from "@proton/hyperion"
import { parseISOString, pickRand, sleep } from "lib/utils"
import ms from "ms"
import ax from "axios"
import { API, UInt32Type } from "@greymass/eosio"
import { ChainKey, Config, configs } from "lib/config"

export interface Authorization {
    actor:string;
    permission:string;
}
export interface Act<T> {
    account:string;
    name:string;
    authorization:Authorization[];
    data:T;
}

export interface HypAction<T> {
  act:Act<T>
  account_ram_deltas?:AccountRAMDelta[]
  "@timestamp":Date
  block_num:number
  producer:string
  trx_id:string
  parent:number
  global_sequence:number
  notified:string[]
  receipts:object[],
  act_digest:string
}

export interface GetTransaction<T> {
  trx_id:string;
  lib:number;
  actions:HypAction<T>[];
}


export class HyperionClient {
  constructor(chainName:ChainKey) {
    const conf = configs[chainName]
    if (!conf) throw new Error(`Chain ${chainName} is not configured!!`)
    this.config = conf
    if (!this.config.history?.hyperion || this.config.history.hyperion.length == 0) throw (new Error("must configure at least one hyperion endpoint for target chain in .env.json"))
    this.hypClients = this.config.history.hyperion.map(el => new JsonRpc(el))
    this.sysContract = this.config.sysContract
  }

  config:Config
  hypClients:JsonRpc[]
  sysContract:string

  async getActions(params:any, retry = 0):Promise<null | GetActions<any>> {
    if (retry > 5) {
      console.error("too many hyperion errors: " + JSON.stringify(params, params))
      return null
    }
    const hyp = pickRand(this.hypClients)
    try {
      console.info("trying get_action using endpoint:", hyp.endpoint)
      const result = await hyp.get_actions(params["act.account"], params)
      return result
    } catch (error:any) {
      console.error(hyp.endpoint, "retry:", retry, error.toString())
      return this.getActions(params, retry++)
    }
  }

  async getTrx(trxid:string, retry = 0):Promise<null | GetTransaction<unknown>> {
    if (retry > 5) {
      console.error("too many hyperion getTrx errors: " + trxid)
      return null
    }
    const hyp = pickRand(this.hypClients)
    try {
      console.info("trying get_transaction using endpoint:", hyp.endpoint)
      let result = await hyp.get_transaction(trxid)
      return result as GetTransaction<unknown>
    } catch (error:any) {
      console.error(hyp.endpoint, "retry:", retry, JSON.stringify(error, null, 2))
      await sleep(ms("1s"))
      return this.getTrx(trxid, retry += 1)
    }
  }

  async getDeltas(params:any, account = this.sysContract, retry = 0):Promise<null | GetDeltas<any>> {
    if (retry > 5) {
      console.error("too many hyperion errors: " + JSON.stringify(params, params))
      return null
    }
    const hyp = pickRand(this.hypClients)
    try {
      console.info("trying get_deltas using endpoint:", hyp.endpoint)
      const url = hyp.endpoint + V2_GET_DELTAS
      console.info(url)
      const options = {
        method: "GET",
        url,
        params
      }
      console.info(options)
      const result = await ax.request<GetDeltas<any>>(options)
      return result.data
    } catch (error:any) {
      console.error(hyp.endpoint, "retry:", retry, error.toString())
      return this.getDeltas(params, account, retry++)
    }
  }

  async getActionsRange(from:number, until:number, action:string, account:string, limit = 500) {
    console.info("getting actions in range from:", new Date(from).toISOString(), "to:", new Date(until).toISOString(), "for account", account)
    // await sleep(ms("3s"))
    let params:any = {
      "act.name": action,
      "act.account": account,
      limit,
      before: new Date(until).toISOString(),
      after: new Date(from).toISOString(),
      sort: "asc"
    }
    let actions:Record<string, Action<any>> = {}
    // const expected = await getActions(p)
    let previousLast:number
    const loopGetActions = async():Promise<void> => {
      console.info(params)
      const result = await this.getActions(params)
      if (!result) throw (new Error("hyperion query error"))
      if (result.actions.length == 0) return
      result.actions.forEach(el => actions[el.global_sequence.toString()] = el)
      const last = result.actions[result.actions.length - 1]
      if (!last) throw (new Error("no last action"))
      console.log("first:", result.actions[0]?.global_sequence)
      console.log("last:", last.global_sequence)
      console.log("results", result.actions.length)
      if (previousLast == last.global_sequence) return
      previousLast = last.global_sequence
      // @ts-ignore
      params.after = new Date(parseISOString(last["@timestamp"])).toISOString()
      return loopGetActions()
    }
    await loopGetActions()
    console.log("finished!")
    console.log("final saved actions:", Object.keys(actions).length)
    return Object.values(actions)
  }

  async getBlock(block_num:number, retry = 0):Promise<null | API.v1.GetBlockResponse> {
    if (retry > 5) {
      console.error("too many hyperion errors tryin to get block: " + block_num)
      return null
    }
    const hyp = pickRand(this.hypClients)
    try {
      console.info("trying get_block using endpoint:", hyp.endpoint)
      const url = hyp.endpoint + "/v1/chain/get_block"
      console.info(url)

      const options = {
        method: "POST",
        url,
        data: { block_num_or_id: block_num }
      }
      const result = await ax.request<any>(options)
      return API.v1.GetBlockResponse.from(result.data)
    } catch (error:any) {
      console.error(hyp.endpoint, "retry getBlock:", retry, error.toString())
      return this.getBlock(block_num, retry++)
    }
  }
}




export const hypClients:Partial<Record<ChainKey, HyperionClient>> = {}
Object.values(configs).forEach((conf:Config) => hypClients[conf.chain] = new HyperionClient(conf.chain))

export function getHypClient(chain:ChainKey):HyperionClient {
  const client = hypClients[chain]
  if (!client) throw new Error(`No hyperion client for '${chain}'`)
  return client
}

