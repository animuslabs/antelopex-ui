import { IbcSymbols, IbcToken } from "lib/types/ibc.types"

export const ibcSymbols = ["EOS", "TLOS", "WAX", "UX", "UTXRAM"] as const

export const ibcTokens:Record<IbcSymbols, IbcToken> = {
  EOS: {
    nativeChain: "eos",
    precision: 4,
    tokenContract: {
      eos: "eosio.token",
      telos: "ibc.wt.eos",
      ux: "ibc.wt.eos",
      wax: "ibc.wt.eos"
    },
    foreignWraplockContract: {
      telos: "ibc.wl.eos",
      ux: "ibc.wl.eos",
      wax: "ibc.wl.eos"
    },
    nativeWraplockContract: {
      telos: "ibc.wl.tlos",
      ux: "ibc.wl.ux",
      wax: "ibc.wl.wax"
    }
  },
  TLOS: {
    nativeChain: "telos",
    precision: 4,
    tokenContract: {
      eos: "ibc.wt.telos",
      telos: "eosio.token",
      ux: "ibc.wt.tlos",
      wax: "ibc.wt.tlos"
    },
    foreignWraplockContract: {
      eos: "ibc.wl.tlos",
      ux: "ibc.wl.tlos",
      wax: "ibc.wl.tlos"
    },
    nativeWraplockContract: {
      ux: "ibc.wl.ux",
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
      ux: "ibc.wt.wax",
      wax: "eosio.token"
    },
    foreignWraplockContract: {
      eos: "ibc.wl.wax",
      ux: "ibc.wl.wax",
      telos: "ibc.wl.wax"
    },
    nativeWraplockContract: {
      ux: "ibc.wl.ux",
      eos: "ibc.wl.eos",
      telos: "ibc.wl.telos"
    }
  },
  UX: {
    nativeChain: "ux",
    precision: 4,
    tokenContract: {
      eos: "ibc.wt.ux",
      telos: "ibc.wt.ux",
      wax: "ibc.wt.ux",
      ux: "eosio.token"
    },
    foreignWraplockContract: {
      telos: "ibc.wl.ux",
      eos: "ibc.wl.ux",
      wax: "ibc.wl.ux"
    },
    nativeWraplockContract: {
      telos: "ibc.wl.tlos",
      eos: "ibc.wl.eos",
      wax: "ibc.wl.wax"
    }
  },
  UTXRAM: {
    nativeChain: "ux",
    precision: 4,
    tokenContract: {
      eos: "ibc.wt.ux",
      telos: "ibc.wt.ux",
      ux: "eosio.token",
      wax: "ibc.wt.ux"
    },
    foreignWraplockContract: {
      telos: "ibc.wl.ux",
      eos: "ibc.wl.ux",
      wax: "ibc.wl.ux"
    },
    nativeWraplockContract: {
      telos: "ibc.wl.tlos",
      eos: "ibc.wl.eos",
      wax: "ibc.wl.wax"
    }
  }
}
