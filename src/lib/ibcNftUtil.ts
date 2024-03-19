
import { APIClient, Name } from "@wharfkit/antelope"
import { ChainKey, configs } from "lib/config"
import { IbcNft } from "lib/types/antelopesys.types"
import { Contract as AtomicContract, Types as AtomicTypes } from "lib/types/atomicassets.types"
import { Contract as NftLock, Types as NftLockTypes } from "lib/types/wraplock.nft.types"
import { Contract as NftWrap, Types as NftWrapTypes } from "lib/types/wraptoken.nft.types"
import { throwErr } from "lib/utils"
import { chainLinks } from "src/boot/boot"
import { markRaw, reactive } from "vue"

export const ibcNftCache:Record<ChainKey, IbcNft[]> = reactive({
  eos: [],
  telos: [],
  wax: []
})

export async function loadIbcNfts(chainKey:ChainKey) {
  // if (ibcNftCache[chainKey].length > 0) return ibcNftCache[chainKey]
  const config = configs[chainKey]
  const contract = new NftLock({ client: new APIClient({ url: config.linkData.nodeUrl }) })
  const link = chainLinks[chainKey]
  const ibcNfs = await link.rpc.get_table_rows({ code: config.sysContract, scope: config.sysContract, table: "ibcnfts", limit: 1000, type: IbcNft })
  ibcNftCache[chainKey] = markRaw(ibcNfs.rows)
  return ibcNftCache[chainKey]
}

// create a cache for the nftwhitelist data
export const nftWhitelistCache:Record<ChainKey, NftLockTypes.nftwhitelist[]> = reactive({
  eos: [],
  telos: [],
  wax: []
})

// load the nftwhitelist data
export async function loadNftWl(fromChainKey:ChainKey, toChainKey:ChainKey) {
  // if (nftWhitelistCache[fromChainKey].length > 0) return nftWhitelistCache[fromChainKey]
  const config = configs[fromChainKey]
  const nftLockContract = await findNftLockContract(fromChainKey, toChainKey)
  const contract = new NftLock({ client: new APIClient({ url: config.linkData.nodeUrl }), account: nftLockContract })
  const wlRows = await contract.table("nftwhitelist").all()
  nftWhitelistCache[fromChainKey] = markRaw(wlRows)
  return nftWhitelistCache[fromChainKey]
}

async function findNftLockContract(fromChainKey:ChainKey, toChainKey:ChainKey) {
  await loadIbcNfts(fromChainKey)
  const targetContract = ibcNftCache[fromChainKey].find(nft => nft.paired_chain.toString() === toChainKey && nft.native)
  if (!targetContract) throwErr(`No wraplock contract found for ${fromChainKey} -> ${toChainKey}`)
  return targetContract.contract as unknown as Name
}

export const nftMetaMapCache:Record<ChainKey, NftWrapTypes.nftmetamap[]> = reactive({
  eos: [],
  telos: [],
  wax: []
})

// load the nftmetamap from the wraptoken contract
export async function loadNftMetaMap(fromChainKey:ChainKey, toChainKey:ChainKey) {
  // if (nftMetaMapCache[fromChainKey].length > 0) return nftMetaMapCache[fromChainKey]
  const config = configs[fromChainKey]
  const acct = await findNftWrapContract(fromChainKey, toChainKey)
  const contract = new NftWrap({ client: new APIClient({ url: config.linkData.nodeUrl }), account: acct })
  const metaMap = await contract.table("nftmetamap").all()
  nftMetaMapCache[fromChainKey] = markRaw(metaMap)
  return nftMetaMapCache[fromChainKey]
}

async function findNftWrapContract(fromChainKey:ChainKey, toChainKey:ChainKey) {
  await loadIbcNfts(fromChainKey)
  const targetContract = ibcNftCache[fromChainKey].find(nft => nft.paired_chain.toString() === toChainKey && !nft.native)
  if (!targetContract) throwErr(`No wraptoken contract found for ${fromChainKey} -> ${toChainKey}`)
  return targetContract.contract as unknown as Name
}


export function fromNativeNft(fromChainKey:ChainKey, toChainKey:ChainKey) {
  // await loadIbcNfts(fromChainKey)
  const native = ibcNftCache[fromChainKey].find(nft => nft.paired_chain.toString() === toChainKey && nft.native)
  return !!native
}
