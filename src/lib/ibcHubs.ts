import { ChainKey } from "lib/config"
import { IbcSymbols, IbcToken } from "lib/types/ibc.types"

interface IbcHubType { hubContract:Partial<Record<ChainKey, string>>, nativeToken:Partial<Record<ChainKey, string>>,}

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
