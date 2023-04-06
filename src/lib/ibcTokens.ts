import { IbcSymbols, IbcToken } from "lib/types/ibc.types"

export const ibcSymbols = ["EOS", "TLOS", "UX", "UTXRAM"] as const

export const ibcTokens:Record<IbcSymbols, IbcToken> = {
  EOS: {
    nativeChain: "eos",
    precision: 4,
    tokenContract: {
      eos: "eosio.token",
      telos: "ibc.wt.eos",
      ux: "ibc.wt.eos"
    },
    foreignWraplockContract: {
      telos: "ibc.wl.eos",
      ux: "ibc.wl.eos"
    },
    nativeWraplockContract: {
      telos: "ibc.wl.tlos",
      ux: "ibc.wl.ux"
    }
  },
  TLOS: {
    nativeChain: "telos",
    precision: 4,
    tokenContract: {
      eos: "ibc.wt.telos",
      telos: "eosio.token",
      ux: "ibc.wt.tlos"
    },
    foreignWraplockContract: {
      eos: "ibc.wl.tlos",
      ux: "ibc.wl.tlos"
    },
    nativeWraplockContract: {
      ux: "ibc.wl.ux",
      eos: "ibc.wl.eos"
    }
  },
  UX: {
    nativeChain: "ux",
    precision: 4,
    tokenContract: {
      eos: "ibc.wt.ux",
      telos: "ibc.wt.ux",
      ux: "eosio.token"
    },
    foreignWraplockContract: {
      telos: "ibc.wl.ux",
      eos: "ibc.wl.ux"
    },
    nativeWraplockContract: {
      telos: "ibc.wl.tlos",
      eos: "ibc.wl.eos"
    }
  },
  UTXRAM: {
    nativeChain: "ux",
    precision: 4,
    tokenContract: {
      eos: "ibc.wt.ux",
      telos: "ibc.wt.ux",
      ux: "eosio.token"
    },
    foreignWraplockContract: {
      telos: "ibc.wl.ux",
      eos: "ibc.wl.ux"
    },
    nativeWraplockContract: {
      telos: "ibc.wl.tlos",
      eos: "ibc.wl.eos"
    }
  }
}
