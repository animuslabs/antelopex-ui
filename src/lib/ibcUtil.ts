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
      !Object.keys(tkn.wraplockContracts).includes(destinationChainName)
    ) {
      tknList[sym] = tkn
    }
  }
  return tknList
}
// export function getSymbolList(originChainName:ChainKey, destinationChainName:ChainKey):FilteredSymbol[] {
//   if (originChainName === destinationChainName) return []
//   let symList:FilteredSymbol[] = []
//   for (const sym of ibcSymbols) {
//     const tkn = ibcTokens[sym]
//     console.log(sym)

//     // console.log(destinationChainName)
//     console.log(Object.keys(tkn.wraplockContracts))

//     console.log(Object.keys(tkn.wraplockContracts).includes(originChainName))

//     if (
//       tkn.nativeChain == originChainName ||
//       Object.keys(tkn.tokenContract).includes(originChainName)
//     ) {
//       symList.push(sym)
//     }
//   }
//   return symList
// }

type IbcSymbols = keyof typeof ibcTokens;


// this function takes (fromChain) and (toChain) and returns a filtered array of valid symbols
// for each token, if the (from) chain is equal to the nativeChain and also the (to) chain is listed under wraplockContracts then token is valid to send
// if the (from) chain is not equal to nativeChain, make sure (from) chain is listed under tokenContract and also (to) chain is listed under wraplockContracts
export function getSymbolList(fromChain:ChainKey, toChain:ChainKey):IbcSymbols[] {
  const tokenList = Object.keys(ibcTokens) as IbcSymbols[]

  return tokenList.filter((symbol) => {
    const originContract = ibcTokens[symbol].tokenContract[fromChain]
    const destinationContract = ibcTokens[symbol].wraplockContracts[toChain]
    const reverseOriginContract = ibcTokens[symbol].tokenContract[toChain]
    return originContract && (destinationContract || reverseOriginContract)
  })
}

// Example usage:
// const originChain = "eos"
// const destinationChain = "telos"
// const transferableTokens = getTokensForTransfer(originChain, destinationChain)
// console.log("Transferable Tokens:", transferableTokens)

