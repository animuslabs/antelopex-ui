import { deserialize, ObjectSchema } from "atomicassets"
import { Contract as AtomicContract, Types as AtomicTypes } from "lib/types/atomicassets.types"

export async function nftData(asset:AtomicTypes.assets_s, templateRow:AtomicTypes.templates_s, schema:AtomicTypes.FORMAT[]) {
  const format = ObjectSchema(schema)
  const tempImmutable = deserialize(new Uint8Array(templateRow.immutable_serialized_data.map(el => el.toNumber())), format)
  const nftImmutable = deserialize(new Uint8Array(asset.immutable_serialized_data.map(el => el.toNumber())), format)
  const nftmutable = deserialize(new Uint8Array(asset.mutable_serialized_data.map(el => el.toNumber())), format)
  const immutable = { ...tempImmutable, ...nftImmutable }
  return { immutable, nftmutable, tempImmutable }
}
