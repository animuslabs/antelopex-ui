import { ChainKey } from "lib/config"
import { IbcSymbols, IbcToken } from "lib/types/ibc.types"

export interface IbcHubType { hubContract:Partial<Record<ChainKey, string>>, nativeToken:Partial<Record<ChainKey, string>>,}

export const ibcHubs:Partial<Record<IbcSymbols, IbcHubType>> = {
  BOID: {
    hubContract: {
      telos: "ibchub.boid"
    },
    nativeToken: {
      telos: "token.boid"
    }
  }
}


export interface UnwrappableType { sym:IbcSymbols, data:IbcHubType }

export const unwrappableTokens:UnwrappableType[] = Object.entries(ibcHubs).map(([sym, data]) => {
  return { sym: sym as IbcSymbols, data }
})

export function getChainUnwrapable(chainName:ChainKey) {
  return unwrappableTokens.filter(el => el.data.hubContract[chainName])
}
