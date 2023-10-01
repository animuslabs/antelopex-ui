import { Asset, Name } from "anchor-link"
import { AxiosError, AxiosResponse } from "axios"
import { ChainKey, chainNames } from "lib/config"
import { chainLinks } from "src/boot/boot"
import { chainString } from "src/stores/ibcStore"

export function printAsset(asset:Asset):string {
  const assetString = asset.toString()
  const parts = assetString.split(" ")
  const amountString = parts[0]
  if (!amountString) return assetString
  const amount = parseFloat(amountString)
  const currency = parts[1]

  const formattedAmount = amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  })

  return `${formattedAmount} ${currency}`
}

export function deepClone<T>(val:T) {
  val = JSON.parse(JSON.stringify(val))
  return val
}

export function throwErr(...messages:any[]):never {
  const errorMessage = messages.join(" ")
  throw new Error(errorMessage)
}


export const chainButtons = chainNames.map(name => {
  return {
    label: chainString(name),
    value: name
  }
})

// exportfunction normalizeBlockId(lib: number, blockId: number): number {
//     if (lib >= blockId) {
//         return 1.0;
//     } else {
//         return Math.max(0.0, Math.min(1.0, (lib - blockId) / (lib - blockId + 1)));
//     }
// }

export function normalizeRange(min:number, max:number, value:number):number {
  // if (value <= min) {
  //   return 0
  // } else if (value >= max) {
  //   return 1
  // } else {
  //   return (value - min) / (max - min)
  // }
  return (value - min) / (max - min)
}

export function stringToBool(value:string):boolean {
  return value.toLowerCase() === "true"
}


export const sleep = async(ms:number) => new Promise(resolve => setTimeout(resolve, ms))
export const sleepErr = async(ms:number) => new Promise((resolve, reject) => setTimeout(reject, ms))

export function shuffle<T>(array:T[]) {
  let currentIndex = array.length
  let temporaryValue
  let randomIndex
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex] as T
    array[randomIndex] = temporaryValue as T
  }

  return array
}

export async function accountExists(chain:ChainKey, name:string) {
  const validRegex = /(^[a-z1-5.]{0,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-j1-5]$)/
  if (typeof name !== "string") return false
  if (!validRegex.test(name)) return false
  const client = chainLinks[chain]
  if (!client) throw new Error("invalid chain specified: " + chain)
  try {
    const result = await client.rpc.get_account(Name.from(name))
    if (result) return true
    else return false
  } catch (error:any) {
    console.log("can't find account", error.toString())
    return false
  }
}

export function rand(min:number, max:number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function evalTypedEOSIOList(list:any[]):any[] {
  return list.map(el => {
    const result = {}
    Object.entries(el).forEach((item) => {
      const param = item[1] as any
      // @ts-ignore
      result[item[0]] = param.toString()
    })
    return result
  })
}

export function toObject(data:object) {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === "bigint"
      ? value.toString()
      : value // return everything else unchanged
  ))
}

export function pickRand<T>(arr:T[]):T {
  const randomIndex = Math.floor(Math.random() * arr.length)
  return arr[randomIndex] as T
}

export function parseISOString(s:string) {
  let b = s.split(/\D+/)
  return new Date(Date.UTC(b[0] as any, --(b[1] as any), b[2] as any, b[3] as any, b[4] as any, b[5] as any, b[6] as any))
}
export function toDate(string:string) {
  return new Date(parseISOString(string))
}

export function removeDuplicates(arr:any[]) {
  return Array.from(new Set(arr))
}

export async function customRace<T>(requests:Promise<any>[]):Promise<any> {
  let failureCount = 0

  const wrappedRequests = requests.map((request) =>
    request
      .then((response) => {
        // Reject other requests when one request succeeds
        throw new Error("{ success: true, response }")
      })
      .catch((error:AxiosError) => {
        failureCount++
        if (failureCount === requests.length) {
          throw new Error("{ success: false, error: 'All requests failed.' }")
        }
        return error
      })
  )
  return Promise.race(wrappedRequests).catch((result:{ success:boolean; response?:AxiosResponse; error?:string }) => {
    if (result.success) {
      return result.response!
    } else {
      throw new Error(result.error! || "Unknown error")
    }
  })
}
