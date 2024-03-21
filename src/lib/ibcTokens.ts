import { ChainKey } from "lib/config"
import { IbcSymbols, IbcToken } from "lib/types/ibc.types"

// export const ibcSymbols = ["EOS", "TLOS", "WAX", "UX", "UTXRAM", "BOID"] as const
export const ibcSymbols = ["EOS", "TLOS", "WAX", "BOID", "BANANA"] as const
export type IBCSymbol = typeof ibcSymbols[number]

export const ibcTokens:Record<IbcSymbols, IbcToken> = {
  BOID: {
    nativeChain: "eos",
    precision: 4,
    tokenContract: {
      eos: "boidcomtoken",
      telos: "wt.boid",
      wax: "wt.boid"
    },
    wraplockContracts: {
      telos: "wl.tlos.boid",
      wax: "wl.wax.boid"
    }
  },
  EOS: {
    nativeChain: "eos",
    precision: 4,
    tokenContract: {
      eos: "eosio.token",
      telos: "ibc.wt.eos",
      // ux: "ibc.wt.eos",
      wax: "ibc.wt.eos"
    },
    wraplockContracts: {
      telos: "ibc.wl.tlos",
      // ux: "ibc.wl.ux",
      wax: "ibc.wl.wax"
    }
  },
  TLOS: {
    nativeChain: "telos",
    precision: 4,
    tokenContract: {
      eos: "ibc.wt.tlos",
      telos: "eosio.token"
      // ux: "ibc.wt.tlos",
      // wax: "ibc.wt.tlos"
    },
    wraplockContracts: {
      // ux: "ibc.wl.ux",
      eos: "ibc.wl.eos"
      // wax: "ibc.wl.wax"
    }
  },
  WAX: {
    nativeChain: "wax",
    precision: 8,
    tokenContract: {
      eos: "ibc.wt.wax",
      // telos: "ibc.wt.wax",
      // ux: "ibc.wt.wax",
      wax: "eosio.token"
    },
    wraplockContracts: {
      // ux: "ibc.wl.ux",
      eos: "ibc.wl.eos"
      // telos: "ibc.wl.tlos"
    }
  },
  BANANA: {
    nativeChain: "eos",
    precision: 4,
    tokenContract: {
      eos: "banana.moon",
      telos: "banana.moon ",
      wax: "banana.moon "
    },
    wraplockContracts: {
      telos: "bananalocked",
      wax: "bananasonwax"
    }
  }
}

// export async function getIBCNft(chain:ChainClient, contract:Name) {
//   const existing = ibcNfts[chain.name][contract.toString()]
//   if (existing) return existing
//   const rows = await chain.getTableRows({ code: chain.config.contracts.system, table: "ibcnfts", upper_bound: contract, lower_bound: contract, limit: 1, type: IbcNft })
//   const row = rows[0]
//   if (!row) throwErr(`Can't find row for ${contract.toString()} on ${chain.config.chain}`)
//   ibcNfts[chain.name][contract.toString()] = row
//   return row
// }



