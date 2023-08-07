import { IbcSymbols, IbcToken } from "lib/types/ibc.types"

// export const ibcSymbols = ["EOS", "TLOS", "WAX", "UX", "UTXRAM", "BOID"] as const
export const ibcSymbols = ["EOS", "TLOS", "WAX", "BOID"] as const

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
      telos: "eosio.token",
      // ux: "ibc.wt.tlos",
      wax: "ibc.wt.tlos"
    },
    wraplockContracts: {
      // ux: "ibc.wl.ux",
      eos: "ibc.wl.eos",
      wax: "ibc.wl.wax"
    }
  },
  WAX: {
    nativeChain: "wax",
    precision: 8,
    tokenContract: {
      eos: "ibc.wt.wax",
      telos: "ibc.wt.wax",
      // ux: "ibc.wt.wax",
      wax: "eosio.token"
    },
    wraplockContracts: {
      // ux: "ibc.wl.ux",
      eos: "ibc.wl.eos",
      telos: "ibc.wl.tlos"
    }
  }
  // UX: {
  //   nativeChain: "ux",
  //   precision: 4,
  //   tokenContract: {
  //     eos: "ibc.wt.ux",
  //     telos: "ibc.wt.ux",
  //     wax: "ibc.wt.ux",
  //     ux: "eosio.token"
  //   },
  //   wraplockContracts: {
  //     telos: "ibc.wl.tlos",
  //     eos: "ibc.wl.eos",
  //     wax: "ibc.wl.wax"
  //   }
  // },
  // UTXRAM: {
  //   nativeChain: "ux",
  //   precision: 4,
  //   tokenContract: {
  //     eos: "ibc.wt.ux",
  //     telos: "ibc.wt.ux",
  //     ux: "eosio.token",
  //     wax: "ibc.wt.ux"
  //   },
  //   wraplockContracts: {
  //     telos: "ibc.wl.tlos",
  //     eos: "ibc.wl.eos",
  //     wax: "ibc.wl.wax"
  //   }
  // }
}
