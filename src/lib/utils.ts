import { Asset } from "anchor-link"
import { chainNames } from "lib/config"
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
