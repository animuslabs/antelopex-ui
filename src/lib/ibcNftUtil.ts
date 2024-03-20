
import { APIClient, Name, NameType, UInt32Type, UInt64 } from "@wharfkit/antelope"

import { ChainKey, configs } from "lib/config"
import { IbcNft } from "lib/types/antelopesys.types"
import { Contract as AtomicContract, Types as AtomicTypes } from "lib/types/atomicassets.types"
import { Contract as NftLock, Types as NftLockTypes } from "lib/types/wraplock.nft.types"
import { Contract as NftWrap, Types as NftWrapTypes } from "lib/types/wraptoken.nft.types"
import { throwErr, toObject } from "lib/utils"
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
  if (!ibcNftCache[fromChainKey]) {
    console.error(`No ibcNftCache loaded for ${fromChainKey}`)
    return false
  }
  const native = ibcNftCache[fromChainKey].find(nft => nft.paired_chain.toString() === toChainKey && nft.native)
  return !!native
}

export async function foreignSchemaDefined(fromChainKey:ChainKey, toChainKey:ChainKey, collectionName:NameType, schemaName:NameType) {
  const fromNative = fromNativeNft(fromChainKey, toChainKey)
  if (!fromNative) return true
  await loadNftMetaMap(toChainKey, fromChainKey)
  const collectionMeta = nftMetaMapCache[toChainKey].find(map => map.foreign_collection_name.toString() === collectionName.toString())
  if (!collectionMeta) throwErr(`No collection meta found for ${collectionName} on ${toChainKey}`)
  const contract = new AtomicContract({ client: new APIClient({ url: configs[toChainKey].linkData.nodeUrl }) })
  const schemaRow = await contract.table("schemas").get(schemaName, { scope: collectionMeta.local_collection_name })
  if (schemaRow) console.log(toObject(schemaRow))
  if (schemaRow) return true
  else return false
}
export async function foreignTemplateDefined(fromChainKey:ChainKey, toChainKey:ChainKey, collectionName:NameType, templateId:UInt32Type) {
  const fromNative = fromNativeNft(fromChainKey, toChainKey)
  if (!fromNative) return true
  await loadNftMetaMap(toChainKey, fromChainKey)
  const collectionMeta = nftMetaMapCache[toChainKey].find(map => map.foreign_collection_name.toString() === collectionName.toString())
  if (!collectionMeta) throwErr(`No collection meta found for ${collectionName} on ${toChainKey}`)
  const acct = await findNftWrapContract(toChainKey, fromChainKey)
  const contract = new NftWrap({ client: new APIClient({ url: configs[toChainKey].linkData.nodeUrl }), account: acct })
  const templateMapRow = await contract.table("templatemap").get(UInt64.from(templateId), { scope: collectionName })
  if (templateMapRow) console.log(toObject(templateMapRow))
  if (templateMapRow) return true
  else return false
}
