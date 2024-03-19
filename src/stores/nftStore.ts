import { Contract as AtomicContract, Types as AtomicTypes } from "lib/types/atomicassets.types"
import { defineStore } from "pinia"
import { markRaw, reactive, UnwrapNestedRefs } from "vue"

import { APIClient, NameType, UInt32 } from "@wharfkit/antelope"
import { deserialize, ObjectSchema } from "atomicassets"
import { ChainKey, chainNames, configs } from "lib/config"
import { makeSeparatedStore } from "lib/storeUtils"
import { throwErr } from "lib/utils"


export interface NftState {
  collectionRows:Record<string, AtomicTypes.collections_s>
  schemaFormat:Record<string, Record<string, AtomicTypes.FORMAT[]>> // keys are collection_name -> schema_name
  templateRows:Record<number, AtomicTypes.templates_s>, // key is template_id
  nftRows:Record<string, Record<string, AtomicTypes.assets_s> > // keys are owner -> asset_id
}

export const useNftStore = makeSeparatedStore((chainKey:string) => {
  if (!chainNames.includes(chainKey as ChainKey)) throwErr(`Invalid chainKey: ${chainKey}`)
  const contract = new AtomicContract({ client: new APIClient({ url: configs[chainKey as ChainKey].linkData.nodeUrl }) })
  return defineStore(`nfts/${chainKey}`, {
    state: ():UnwrapNestedRefs<NftState> => (reactive({
      collectionRows: {},
      schemaFormat: {},
      templateRows: {},
      nftRows: {}
    })
    ),
    actions: {
      async loadCollection(collectionName:NameType) {
        const coll = collectionName.toString()
        if (this.collectionRows[coll]) return this.collectionRows[coll] as AtomicTypes.collections_s
        const collectionRow = await contract.table("collections").get(collectionName)
        if (!collectionRow) throwErr(`Collection not found: ${collectionName}`)
        this.collectionRows[coll] = markRaw(collectionRow)
        return this.collectionRows[coll] as AtomicTypes.collections_s
      },
      async loadSchema(collName:NameType, schemaName:NameType) {
        const coll = collName.toString()
        const schema = schemaName.toString()
        if (this.schemaFormat[coll]?.[schema]) return this.schemaFormat[coll]![schema] as AtomicTypes.FORMAT[]
        const schemaRow = await contract.table("schemas").get(schemaName, { scope: collName })
        if (!schemaRow) throwErr(`Schema not found: ${schema} in collection ${coll}`)
        const collection = this.schemaFormat[coll]
        if (!collection) this.schemaFormat[coll] = {}
        this.schemaFormat[coll]![schema] = markRaw(schemaRow.format)
        return this.schemaFormat[coll]![schema] as AtomicTypes.FORMAT[]
      },
      async loadTemplate(collName:NameType, templateId:UInt32) {
        if (this.templateRows[templateId.toNumber()]) return this.templateRows[templateId.toNumber()] as AtomicTypes.templates_s
        const templateRow = await contract.table("templates").get(templateId, { scope: collName })
        if (!templateRow) throwErr(`Template not found: ${templateId}`)
        this.templateRows[templateId.toNumber()] = markRaw(templateRow)
        return this.templateRows[templateId.toNumber()] as AtomicTypes.templates_s
      },
      async loadAccountNfts(owner:NameType) {
        const ownr = owner.toString()
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
        return this.nftRows[ownr] as Record<string, AtomicTypes.assets_s>
      },
      async nftData(asset:AtomicTypes.assets_s) {
        const format = ObjectSchema(await this.loadSchema(asset.collection_name, asset.schema_name))
        const templateRow = await this.loadTemplate(asset.collection_name, asset.template_id)
        const tempImmutable = deserialize(new Uint8Array(templateRow.immutable_serialized_data.map(el => el.toNumber())), format)
        const nftImmutable = deserialize(new Uint8Array(asset.immutable_serialized_data.map(el => el.toNumber())), format)
        const nftmutable = deserialize(new Uint8Array(asset.mutable_serialized_data.map(el => el.toNumber())), format)
        const immmutable = { ...tempImmutable, ...nftImmutable }
        return { immmutable, nftmutable, tempImmutable }
      }
    }

  })
}
)
