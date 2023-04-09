import { ChainKey } from "lib/config"
import { ibcSymbols, ibcTokens } from "lib/ibcTokens"

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
  foreignWraplockContract:Partial<Record<ChainKey, string>>
  nativeWraplockContract:Partial<Record<ChainKey, string>>
}
