import { ChainKey } from "lib/config"
import { ibcSymbols, ibcTokens } from "lib/ibcTokens"
import { FilteredSymbol, FilteredTokens, IbcToken } from "lib/types/ibc.types"

export function getTokenList(originChainName:ChainKey, destinationChainName:ChainKey):FilteredTokens {
  if (originChainName === destinationChainName) return {}
  let tknList:FilteredTokens = {}
  for (const sym of ibcSymbols) {
    const tkn = ibcTokens[sym]
    if (
      tkn.nativeChain == originChainName ||
      !Object.keys(tkn.foreignWraplockContract).includes(destinationChainName)
    ) {
      tknList[sym] = tkn
    }
  }
  return tknList
}
export function getSymbolList(originChainName:ChainKey, destinationChainName:ChainKey):FilteredSymbol[] {
  if (originChainName === destinationChainName) return []
  let symList:FilteredSymbol[] = []
  for (const sym of ibcSymbols) {
    const tkn = ibcTokens[sym]
    if (
      tkn.nativeChain == originChainName ||
      !Object.keys(tkn.foreignWraplockContract).includes(destinationChainName)
    ) {
      symList.push(sym)
    }
  }
  return symList
}
