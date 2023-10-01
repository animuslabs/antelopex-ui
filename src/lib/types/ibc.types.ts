import { ChainKey } from "lib/config"
import { ibcSymbols, ibcTokens } from "lib/ibcTokens"
import { Xfer } from "lib/types/wraptoken.types"

export type IbcSymbols = typeof ibcSymbols[number]
// export type SymbolsObject = {
//   [K in typeof ibcSymbols[number]]:K;
// };
export type FilteredSymbol = typeof ibcSymbols[number];

export type FilteredTokens = Partial<typeof ibcTokens>

export interface IbcToken {
  nativeChain:ChainKey
  precision:number
  img?:string
  tokenContract:Partial<Record<ChainKey, string>>
  wraplockContracts:Partial<Record<ChainKey, string>>
}


export interface IbcMeta {
  data:Xfer
  timestamp:Date
  sym:string
  destinationChain:ChainKey
  contract:string
  trxBlock:number
  lib:number,
  actDigest:string,
  globalSequence:number,
}
