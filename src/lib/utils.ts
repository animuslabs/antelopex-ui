import { Asset } from "anchor-link"

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
