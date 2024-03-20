import { Contract as AtomicContract, Types as AtomicTypes } from "lib/types/atomicassets.types"
import { defineStore } from "pinia"
import { markRaw, reactive, UnwrapNestedRefs } from "vue"

import { APIClient, NameType, UInt32, UInt64 } from "@wharfkit/antelope"
import { deserialize, ObjectSchema } from "atomicassets"
import { ChainKey, chainNames, configs } from "lib/config"
import { makeSeparatedStore } from "lib/storeUtils"
import { sleep, throwErr } from "lib/utils"
import { nftData } from "lib/nftUtil"


export class NftState {
  collectionRows:Record<string, AtomicTypes.collections_s> = {} // key is collection_name
  schemaFormat:Record<string, Record<string, AtomicTypes.FORMAT[]>> = {} // keys are collection_name -> schema_name
  templateRows:Record<number, AtomicTypes.templates_s> = {} // key is template_id
  nftRows:Record<string, Record<string, AtomicTypes.assets_s> > = {} // keys are owner -> asset_id
  nftData:Record<string, Record<string, any>> = {}
  loadingSchemas:string[] = []
  loadingTemplates:number[] = []
  loadingCollections:string[] = []
  loadingAccountNfts:string[] = []
}

export const useNftStore = makeSeparatedStore((chainKey:string) => {
  if (!chainNames.includes(chainKey as ChainKey)) throwErr(`Invalid chainKey: ${chainKey}`)
  const contract = new AtomicContract({ client: new APIClient({ url: configs[chainKey as ChainKey].linkData.nodeUrl }) })
  return defineStore(`nfts/${chainKey}`, {
    state: ():NftState => new NftState(),
    actions: {
      async loadCollection(collectionName:NameType) {
        if (this.loadingCollections.includes(collectionName.toString())) await sleep(1000)
        const coll = collectionName.toString()
        if (this.collectionRows[coll]) return this.collectionRows[coll] as AtomicTypes.collections_s
        this.loadingCollections.push(coll)
        const collectionRow = await contract.table("collections").get(collectionName)
        if (!collectionRow) throwErr(`Collection not found: ${collectionName}`)
        this.collectionRows[coll] = markRaw(collectionRow)
        this.loadingCollections = this.loadingCollections.filter(c => c !== coll)
        return this.collectionRows[coll] as AtomicTypes.collections_s
      },
      async loadSchema(collName:NameType, schemaName:NameType) {
        if (this.loadingSchemas.includes(schemaName.toString())) await sleep(1000)
        const coll = collName.toString()
        const schema = schemaName.toString()
        if (this.schemaFormat[coll]?.[schema]) return this.schemaFormat[coll]![schema] as AtomicTypes.FORMAT[]
        this.loadingSchemas.push(schemaName.toString())
        const schemaRow = await contract.table("schemas").get(schemaName, { scope: collName })
        if (!schemaRow) throwErr(`Schema not found: ${schema} in collection ${coll}`)
        const collection = this.schemaFormat[coll]
        if (!collection) this.schemaFormat[coll] = {}
        this.schemaFormat[coll]![schema] = markRaw(schemaRow.format)
        this.loadingSchemas = this.loadingSchemas.filter(s => s !== schema)
        return this.schemaFormat[coll]![schema] as AtomicTypes.FORMAT[]
      },
      async loadTemplate(collName:NameType, templateId:UInt32) {
        if (this.loadingTemplates.includes(templateId.toNumber())) await sleep(1000)
        // console.log("loadTemplate", collName.toString(), templateId.toString())
        if (this.templateRows[templateId.toNumber()]) return this.templateRows[templateId.toNumber()] as AtomicTypes.templates_s
        this.loadingTemplates.push(templateId.toNumber())
        const templateRow = await contract.table("templates").get(UInt64.from(templateId), { scope: collName })
        if (!templateRow) throwErr(`Template not found: ${templateId}`)
        this.templateRows[templateId.toNumber()] = markRaw(templateRow)
        this.loadingTemplates = this.loadingTemplates.filter(t => t !== templateId.toNumber())
        return this.templateRows[templateId.toNumber()] as AtomicTypes.templates_s
      },
      async loadAccountNfts(owner:NameType) {
        if (this.loadingAccountNfts.includes(owner.toString())) return
        const ownr = owner.toString()
        this.loadingAccountNfts.push(ownr)
        const accountNfts = await contract.table("assets").all({ scope: owner })
        if (accountNfts.length === 0) {
          this.nftRows[ownr] = {}
          return this.nftRows[ownr] as Record<string, AtomicTypes.assets_s>
        }
        const loaded = this.nftRows[ownr]
        if (!loaded) this.nftRows[ownr] = {}
        const acctAssets:Record<string, AtomicTypes.assets_s> = {}
        for (const asset of accountNfts) {
          acctAssets[asset.asset_id.toString()] = markRaw(asset)
        }
        this.nftRows[ownr] = acctAssets
        this.loadingAccountNfts = this.loadingAccountNfts.filter(a => a !== ownr)
        return this.nftRows[ownr] as Record<string, AtomicTypes.assets_s>
      },
      async nftData<T>(asset:AtomicTypes.assets_s) {
        if (this.nftData[asset.asset_id.toString()]) return this.nftData[asset.asset_id.toString()] as T
        const templateRow = await this.loadTemplate(asset.collection_name, asset.template_id)
        const schema = await this.loadSchema(asset.collection_name, templateRow.schema_name)
        const data = nftData(asset, templateRow, schema)
        this.nftData[asset.asset_id.toString()] = markRaw(data)
        return data as T
      }
    }

  })
}
)
