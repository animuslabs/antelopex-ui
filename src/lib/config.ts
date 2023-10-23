// type Configs = "telos" | "eos" | "wax"
// export const chainNames = ["telos", "eos", "ux", "wax"] as const
export const chainNames = ["telos", "eos", "wax"] as const
export type ChainKey = typeof chainNames[number]

const sysContract = "antelopexsys"

export type Config = {
  // contracts:Record[st],
  chain:ChainKey,
  linkData:{
    chainId:string
    nodeUrl:string
    appName:string
  },
  explorer:string,
  proofDb:string,
  bridgeContract:string,
  sysContract:string,
  history:{
    hyperion:string[]
  }
}

export const configs:Record<ChainKey, Config> = {
  telos: {
    chain: "telos",
    linkData: {
      chainId: "4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11",
      nodeUrl: "https://telos.api.boid.animus.is",
      // nodeUrl: "https://hyperion.telos-testnet.animus.is",
      // nodeUrl: "https://testnet.telos.net",
      // nodeUrl: "https://testnet.telos.caleos.io",mn
      appName: "AntelopeX.io-telos"
    },
    explorer: "https://explorer.telos.net",
    proofDb: "wss://telos.ibc.animus.is",
    bridgeContract: "ibc.prove",
    history: {
      // hyperion: ["https://hyperion.telos.animus.is"]
      hyperion: ["https://mainnet.telos.net"]
    },
    sysContract
  },
  eos: {
    chain: "eos",
    linkData: {
      chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
      // nodeUrl: "https://eos.api.boid.animus.is",
      nodeUrl: "https://eos.greymass.com",
      appName: "AntelopeX.io-eos"
    },
    explorer: "https://bloks.io",
    proofDb: "wss://eos.ibc.animus.is",
    bridgeContract: "ibc.prove",
    sysContract,
    history: {
      hyperion: ["https://eos.eosusa.io"]
    }
  },
  wax: {
    chain: "wax",
    linkData: {
      chainId: "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4",
      nodeUrl: "https://wax.greymass.com",
      appName: "AntelopeX.io-wax"
    },
    explorer: "https://wax.bloks.io",
    proofDb: "wss://wax.ibc.animus.is",
    bridgeContract: "ibc.prove",
    sysContract,
    history: {
      hyperion: ["https://wax.eosusa.io "]
    }
  }
  // ux: {
  //   linkData: {
  //     chainId: "8fc6dce7942189f842170de953932b1f66693ad3788f766e777b6f9d22335c02",
  //     nodeUrl: "https://api.uxnetwork.io",
  //     appName: "AntelopeX.io-ux"
  //   },
  //   explorer: "https://explorer.uxnetwork.io/tx",
  //   proofDb: "wss://ibc-server.uxnetwork.io/ux",
  //   bridgeContract: "ibc.prove",
  //   sysContract
  // }
}
