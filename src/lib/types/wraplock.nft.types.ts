import type {
  Action,
  AssetType,
  BytesType,
  Checksum256Type,
  Float32Type,
  Float64Type,
  Int16Type,
  Int32Type,
  Int64Type,
  Int8Type,
  NameType,
  PublicKeyType,
  SignatureType,
  UInt16Type,
  UInt32Type,
  UInt64Type,
  UInt8Type,
  VarUIntType
} from "@wharfkit/antelope"
import {
  ABI,
  Asset,
  Blob,
  BlockTimestamp,
  Bytes,
  Checksum256,
  Float32,
  Float64,
  Int16,
  Int32,
  Int64,
  Int8,
  Name,
  PublicKey,
  Signature,
  Struct,
  UInt16,
  UInt32,
  UInt64,
  UInt8,
  VarUInt,
  Variant
} from "@wharfkit/antelope"
import type { ActionOptions, ContractArgs, PartialBy, Table } from "@wharfkit/contract"
import { Contract as BaseContract } from "@wharfkit/contract"
export const abiBlob = Blob.from(
  "DmVvc2lvOjphYmkvMS4yDRBBVE9NSUNfQVRUUklCVVRFwgF2YXJpYW50X2ludDhfaW50MTZfaW50MzJfaW50NjRfdWludDhfdWludDE2X3VpbnQzMl91aW50NjRfZmxvYXQzMl9mbG9hdDY0X3N0cmluZ19JTlQ4X1ZFQ19JTlQxNl9WRUNfSU5UMzJfVkVDX0lOVDY0X1ZFQ19VSU5UOF9WRUNfVUlOVDE2X1ZFQ19VSU5UMzJfVkVDX1VJTlQ2NF9WRUNfRkxPQVRfVkVDX0RPVUJMRV9WRUNfU1RSSU5HX1ZFQw1BVFRSSUJVVEVfTUFQHnBhaXJfc3RyaW5nX0FUT01JQ19BVFRSSUJVVEVbXQpET1VCTEVfVkVDCWZsb2F0NjRbXQlGTE9BVF9WRUMJZmxvYXQzMltdCUlOVDE2X1ZFQwdpbnQxNltdCUlOVDMyX1ZFQwdpbnQzMltdCUlOVDY0X1ZFQwdpbnQ2NFtdCElOVDhfVkVDBWJ5dGVzClNUUklOR19WRUMIc3RyaW5nW10KVUlOVDE2X1ZFQwh1aW50MTZbXQpVSU5UMzJfVkVDCHVpbnQzMltdClVJTlQ2NF9WRUMIdWludDY0W10JVUlOVDhfVkVDBWJ5dGVzKQZGT1JNQVQAAgRuYW1lBnN0cmluZwR0eXBlBnN0cmluZwZhY3Rpb24ABAdhY2NvdW50BG5hbWUEbmFtZQRuYW1lDWF1dGhvcml6YXRpb24ScGVybWlzc2lvbl9sZXZlbFtdBGRhdGEFYnl0ZXMLYWN0aW9ucHJvb2YABAZhY3Rpb24GYWN0aW9uB3JlY2VpcHQKYWN0cmVjZWlwdAtyZXR1cm52YWx1ZQVieXRlcwthbXByb29mcGF0aA1jaGVja3N1bTI1NltdCmFjdHJlY2VpcHQABwhyZWNlaXZlcgRuYW1lCmFjdF9kaWdlc3QLY2hlY2tzdW0yNTYPZ2xvYmFsX3NlcXVlbmNlBnVpbnQ2NA1yZWN2X3NlcXVlbmNlBnVpbnQ2NA1hdXRoX3NlcXVlbmNlCWF1dGhzZXFbXQ1jb2RlX3NlcXVlbmNlCXZhcnVpbnQzMgxhYmlfc2VxdWVuY2UJdmFydWludDMyC2FuY2hvcmJsb2NrAAMFYmxvY2sMc2Jsb2NraGVhZGVyDGFjdGl2ZV9ub2Rlcwh1aW50MTZbXQpub2RlX2NvdW50BnVpbnQ2NAhhc3NldHNfcwAICGFzc2V0X2lkBnVpbnQ2NA9jb2xsZWN0aW9uX25hbWUEbmFtZQtzY2hlbWFfbmFtZQRuYW1lC3RlbXBsYXRlX2lkBWludDMyCXJhbV9wYXllcgRuYW1lDWJhY2tlZF90b2tlbnMHYXNzZXRbXRlpbW11dGFibGVfc2VyaWFsaXplZF9kYXRhBWJ5dGVzF211dGFibGVfc2VyaWFsaXplZF9kYXRhBWJ5dGVzB2F1dGhzZXEAAgdhY2NvdW50BG5hbWUIc2VxdWVuY2UGdWludDY0C2Jsb2NraGVhZGVyAAkJdGltZXN0YW1wFGJsb2NrX3RpbWVzdGFtcF90eXBlCHByb2R1Y2VyBG5hbWUJY29uZmlybWVkBnVpbnQxNghwcmV2aW91cwtjaGVja3N1bTI1NhF0cmFuc2FjdGlvbl9tcm9vdAtjaGVja3N1bTI1NgxhY3Rpb25fbXJvb3QLY2hlY2tzdW0yNTYQc2NoZWR1bGVfdmVyc2lvbgZ1aW50MzINbmV3X3Byb2R1Y2VycxJwcm9kdWNlcl9zY2hlZHVsZT8RaGVhZGVyX2V4dGVuc2lvbnMTcGFpcl91aW50MTZfYnl0ZXNbXQdjYW5jZWxhAAMGcHJvdmVyBG5hbWUKYmxvY2twcm9vZgpoZWF2eXByb29mC2FjdGlvbnByb29mC2FjdGlvbnByb29mB2NhbmNlbGIAAwZwcm92ZXIEbmFtZQpibG9ja3Byb29mCmxpZ2h0cHJvb2YLYWN0aW9ucHJvb2YLYWN0aW9ucHJvb2YHZGlzYWJsZQAADGVtaXRlbXBsYXRlcwAED2NvbGxlY3Rpb25fbmFtZQRuYW1lC3RlbXBsYXRlX2lkBWludDMyC3NjaGVtYV9uYW1lBG5hbWUXdGVtcGxhdGVfaW1tdXRhYmxlX2RhdGENQVRUUklCVVRFX01BUAtlbWl0bmZ0eGZlcgABB25mdHhmZXIHbmZ0eGZlcgplbWl0c2NoZW1hAAELc2NoZW1hX2RhdGELZW1pdHNjaGVtYXMLZW1pdHNjaGVtYXMAAw1zY2hlbWFfZm9ybWF0CEZPUk1BVFtdD2NvbGxlY3Rpb25fbmFtZQRuYW1lC3NjaGVtYV9uYW1lBG5hbWUMZW1pdHRlbXBsYXRlAAENdGVtcGxhdGVfZGF0YQxlbWl0ZW1wbGF0ZXMGZW5hYmxlAAAGZ2xvYmFsAAUIY2hhaW5faWQLY2hlY2tzdW0yNTYPYnJpZGdlX2NvbnRyYWN0BG5hbWUPcGFpcmVkX2NoYWluX2lkC2NoZWNrc3VtMjU2F3BhaXJlZF93cmFwbmZ0X2NvbnRyYWN0BG5hbWUHZW5hYmxlZARib29sCmhlYXZ5cHJvb2YABAhjaGFpbl9pZAtjaGVja3N1bTI1NgZoYXNoZXMNY2hlY2tzdW0yNTZbXQxibG9ja3RvcHJvdmULYW5jaG9yYmxvY2sIYmZ0cHJvb2YOc2Jsb2NraGVhZGVyW10IaHBzdHJ1Y3QAAgJpZAZ1aW50NjQCaHAKaGVhdnlwcm9vZgRpbml0AAQIY2hhaW5faWQLY2hlY2tzdW0yNTYPYnJpZGdlX2NvbnRyYWN0BG5hbWUPcGFpcmVkX2NoYWluX2lkC2NoZWNrc3VtMjU2F3BhaXJlZF93cmFwbmZ0X2NvbnRyYWN0BG5hbWUKaW5pdHNjaGVtYQACD2NvbGxlY3Rpb25fbmFtZQRuYW1lC3NjaGVtYV9uYW1lBG5hbWUMaW5pdHRlbXBsYXRlAAIPY29sbGVjdGlvbl9uYW1lBG5hbWULdGVtcGxhdGVfaWQFaW50MzIKbGlnaHRwcm9vZgAECGNoYWluX2lkC2NoZWNrc3VtMjU2BmhlYWRlcgtibG9ja2hlYWRlcgRyb290C2NoZWNrc3VtMjU2C2JtcHJvb2ZwYXRoDWNoZWNrc3VtMjU2W10KbG9ja2VkbmZ0cwADCGFzc2V0X2lkBnVpbnQ2NAtiZW5lZmljaWFyeQRuYW1lBW93bmVyBG5hbWUJbG9ja25mdHJtAAEIYXNzZXRfaWQGdWludDY0CGxwc3RydWN0AAICaWQGdWludDY0AmxwCmxpZ2h0cHJvb2YJbmZ0aWR4ZmVyAAMJYXNzZXRfaWRzCHVpbnQ2NFtdC2JlbmVmaWNpYXJ5BG5hbWUEbWVtbwZzdHJpbmcMbmZ0d2hpdGVsaXN0AAMPY29sbGVjdGlvbl9uYW1lBG5hbWUMdGVtcGxhdGVfaWRzB2ludDMyW10Mc2NoZW1hX25hbWVzBm5hbWVbXQduZnR3bHJtAAEPY29sbGVjdGlvbl9uYW1lBG5hbWUIbmZ0d2xzZXQAAQVuZnR3bAxuZnR3aGl0ZWxpc3QHbmZ0eGZlcgAEBW93bmVyBG5hbWUGYXNzZXRzCmFzc2V0c19zW10LYmVuZWZpY2lhcnkEbmFtZQRtZW1vBnN0cmluZxxwYWlyX3N0cmluZ19BVE9NSUNfQVRUUklCVVRFAAIFZmlyc3QGc3RyaW5nBnNlY29uZBBBVE9NSUNfQVRUUklCVVRFEXBhaXJfdWludDE2X2J5dGVzAAIFZmlyc3QGdWludDE2BnNlY29uZAVieXRlcxBwZXJtaXNzaW9uX2xldmVsAAIFYWN0b3IEbmFtZQpwZXJtaXNzaW9uBG5hbWUJcHJvY2Vzc2VkAAICaWQGdWludDY0DnJlY2VpcHRfZGlnZXN0C2NoZWNrc3VtMjU2DHByb2R1Y2VyX2tleQACDXByb2R1Y2VyX25hbWUEbmFtZRFibG9ja19zaWduaW5nX2tleQpwdWJsaWNfa2V5EXByb2R1Y2VyX3NjaGVkdWxlAAIHdmVyc2lvbgZ1aW50MzIJcHJvZHVjZXJzDnByb2R1Y2VyX2tleVtdDHNibG9ja2hlYWRlcgAEBmhlYWRlcgtibG9ja2hlYWRlchNwcm9kdWNlcl9zaWduYXR1cmVzC3NpZ25hdHVyZVtdD3ByZXZpb3VzX2Jtcm9vdAtjaGVja3N1bTI1NgtibXByb29mcGF0aAh1aW50MTZbXQl3aXRoZHJhd2EAAwZwcm92ZXIEbmFtZQpibG9ja3Byb29mCmhlYXZ5cHJvb2YLYWN0aW9ucHJvb2YLYWN0aW9ucHJvb2YJd2l0aGRyYXdiAAMGcHJvdmVyBG5hbWUKYmxvY2twcm9vZgpsaWdodHByb29mC2FjdGlvbnByb29mC2FjdGlvbnByb29mDwAAAMBEhaZBB2NhbmNlbGEAAAAA4ESFpkEHY2FuY2VsYgAAAABAxWOwSwdkaXNhYmxlAACuWj2vmZ1UC2VtaXRuZnR4ZmVyAACAkaohnJ1UCmVtaXRzY2hlbWEAoLKJVaqcnVQMZW1pdHRlbXBsYXRlAAAAAACoeMxUBmVuYWJsZQAAAAAAAJDddARpbml0AACAkaohnN10CmluaXRzY2hlbWEAoLKJVaqc3XQMaW5pdHRlbXBsYXRlAAAAkDevCRGNCWxvY2tuZnRybQAAAABA3sjzmgduZnR3bHJtAAAAAFnhyPOaCG5mdHdsc2V0AAAAMNzc1LLjCXdpdGhkcmF3YQAAADjc3NSy4wl3aXRoZHJhd2IACYBVNrFKlZ1UA2k2NAAADGVtaXRlbXBsYXRlcwAAAABEc2hkA2k2NAAABmdsb2JhbADAovRWv41qA2k2NAAACGhwc3RydWN0AMCi9NbcmIsDaTY0AAAIbHBzdHJ1Y3QAAM5rJgURjQNpNjQAAApsb2NrZWRuZnRzAAC4avXk8poDaTY0AAAJbmZ0aWR4ZmVykLGLKrvG85oDaTY0AAAMbmZ0d2hpdGVsaXN0AAAA4KrV85oDaTY0AAAHbmZ0eGZlcgAASApjheitA2k2NAAACXByb2Nlc3NlZAAAAAHCAXZhcmlhbnRfaW50OF9pbnQxNl9pbnQzMl9pbnQ2NF91aW50OF91aW50MTZfdWludDMyX3VpbnQ2NF9mbG9hdDMyX2Zsb2F0NjRfc3RyaW5nX0lOVDhfVkVDX0lOVDE2X1ZFQ19JTlQzMl9WRUNfSU5UNjRfVkVDX1VJTlQ4X1ZFQ19VSU5UMTZfVkVDX1VJTlQzMl9WRUNfVUlOVDY0X1ZFQ19GTE9BVF9WRUNfRE9VQkxFX1ZFQ19TVFJJTkdfVkVDFgRpbnQ4BWludDE2BWludDMyBWludDY0BXVpbnQ4BnVpbnQxNgZ1aW50MzIGdWludDY0B2Zsb2F0MzIHZmxvYXQ2NAZzdHJpbmcISU5UOF9WRUMJSU5UMTZfVkVDCUlOVDMyX1ZFQwlJTlQ2NF9WRUMJVUlOVDhfVkVDClVJTlQxNl9WRUMKVUlOVDMyX1ZFQwpVSU5UNjRfVkVDCUZMT0FUX1ZFQwpET1VCTEVfVkVDClNUUklOR19WRUMA"
)
export const abi = ABI.from(abiBlob)
export namespace Types {
  @Variant.type(
    "variant_int8_int16_int32_int64_uint8_uint16_uint32_uint64_float32_float64_string_INT8_VEC_INT16_VEC_INT32_VEC_INT64_VEC_UINT8_VEC_UINT16_VEC_UINT32_VEC_UINT64_VEC_FLOAT_VEC_DOUBLE_VEC_STRING_VEC",
    [
      Int8,
      Int16,
      Int32,
      Int64,
      UInt8,
      UInt16,
      UInt32,
      UInt64,
      Float32,
      Float64,
      "string",
      Bytes,
      { type: Int16, array: true },
      { type: Int32, array: true },
      { type: Int64, array: true },
      Bytes,
      { type: UInt16, array: true },
      { type: UInt32, array: true },
      { type: UInt64, array: true },
      { type: Float32, array: true },
      { type: Float64, array: true },
      "string[]"
    ]
  )
  export class variant_int8_int16_int32_int64_uint8_uint16_uint32_uint64_float32_float64_string_INT8_VEC_INT16_VEC_INT32_VEC_INT64_VEC_UINT8_VEC_UINT16_VEC_UINT32_VEC_UINT64_VEC_FLOAT_VEC_DOUBLE_VEC_STRING_VEC extends Variant {
    declare value:| Int8
    | Int16
    | Int32
    | Int64
    | UInt8
    | UInt16
    | UInt32
    | UInt64
    | Float32
    | Float64
    | string
    | Bytes
    | Int16[]
    | Int32[]
    | Int64[]
    | Bytes
    | UInt16[]
    | UInt32[]
    | UInt64[]
    | Float32[]
    | Float64[]
    | string[]
  }
  @Struct.type("FORMAT")
  export class FORMAT extends Struct {
    @Struct.field("string")
      name!:string

    @Struct.field("string")
      type!:string
  }
  @Struct.type("permission_level")
  export class permission_level extends Struct {
    @Struct.field(Name)
      actor!:Name

    @Struct.field(Name)
      permission!:Name
  }
  @Struct.type("action")
  export class action extends Struct {
    @Struct.field(Name)
      account!:Name

    @Struct.field(Name)
      name!:Name

    @Struct.field(permission_level, { array: true })
      authorization!:permission_level[]

    @Struct.field(Bytes)
      data!:Bytes
  }
  @Struct.type("authseq")
  export class authseq extends Struct {
    @Struct.field(Name)
      account!:Name

    @Struct.field(UInt64)
      sequence!:UInt64
  }
  @Struct.type("actreceipt")
  export class actreceipt extends Struct {
    @Struct.field(Name)
      receiver!:Name

    @Struct.field(Checksum256)
      act_digest!:Checksum256

    @Struct.field(UInt64)
      global_sequence!:UInt64

    @Struct.field(UInt64)
      recv_sequence!:UInt64

    @Struct.field(authseq, { array: true })
      auth_sequence!:authseq[]

    @Struct.field(VarUInt)
      code_sequence!:VarUInt

    @Struct.field(VarUInt)
      abi_sequence!:VarUInt
  }
  @Struct.type("actionproof")
  export class actionproof extends Struct {
    @Struct.field(action)
      action!:action

    @Struct.field(actreceipt)
      receipt!:actreceipt

    @Struct.field(Bytes)
      returnvalue!:Bytes

    @Struct.field(Checksum256, { array: true })
      amproofpath!:Checksum256[]
  }
  @Struct.type("producer_key")
  export class producer_key extends Struct {
    @Struct.field(Name)
      producer_name!:Name

    @Struct.field(PublicKey)
      block_signing_key!:PublicKey
  }
  @Struct.type("producer_schedule")
  export class producer_schedule extends Struct {
    @Struct.field(UInt32)
      version!:UInt32

    @Struct.field(producer_key, { array: true })
      producers!:producer_key[]
  }
  @Struct.type("pair_uint16_bytes")
  export class pair_uint16_bytes extends Struct {
    @Struct.field(UInt16)
      first!:UInt16

    @Struct.field(Bytes)
      second!:Bytes
  }
  @Struct.type("blockheader")
  export class blockheader extends Struct {
    @Struct.field(BlockTimestamp)
      timestamp!:BlockTimestamp

    @Struct.field(Name)
      producer!:Name

    @Struct.field(UInt16)
      confirmed!:UInt16

    @Struct.field(Checksum256)
      previous!:Checksum256

    @Struct.field(Checksum256)
      transaction_mroot!:Checksum256

    @Struct.field(Checksum256)
      action_mroot!:Checksum256

    @Struct.field(UInt32)
      schedule_version!:UInt32

    @Struct.field(producer_schedule, { optional: true })
      new_producers?:producer_schedule

    @Struct.field(pair_uint16_bytes, { array: true })
      header_extensions!:pair_uint16_bytes[]
  }
  @Struct.type("sblockheader")
  export class sblockheader extends Struct {
    @Struct.field(blockheader)
      header!:blockheader

    @Struct.field(Signature, { array: true })
      producer_signatures!:Signature[]

    @Struct.field(Checksum256)
      previous_bmroot!:Checksum256

    @Struct.field(UInt16, { array: true })
      bmproofpath!:UInt16[]
  }
  @Struct.type("anchorblock")
  export class anchorblock extends Struct {
    @Struct.field(sblockheader)
      block!:sblockheader

    @Struct.field(UInt16, { array: true })
      active_nodes!:UInt16[]

    @Struct.field(UInt64)
      node_count!:UInt64
  }
  @Struct.type("assets_s")
  export class assets_s extends Struct {
    @Struct.field(UInt64)
      asset_id!:UInt64

    @Struct.field(Name)
      collection_name!:Name

    @Struct.field(Name)
      schema_name!:Name

    @Struct.field(Int32)
      template_id!:Int32

    @Struct.field(Name)
      ram_payer!:Name

    @Struct.field(Asset, { array: true })
      backed_tokens!:Asset[]

    @Struct.field(Bytes)
      immutable_serialized_data!:Bytes

    @Struct.field(Bytes)
      mutable_serialized_data!:Bytes
  }
  @Struct.type("heavyproof")
  export class heavyproof extends Struct {
    @Struct.field(Checksum256)
      chain_id!:Checksum256

    @Struct.field(Checksum256, { array: true })
      hashes!:Checksum256[]

    @Struct.field(anchorblock)
      blocktoprove!:anchorblock

    @Struct.field(sblockheader, { array: true })
      bftproof!:sblockheader[]
  }
  @Struct.type("cancela")
  export class cancela extends Struct {
    @Struct.field(Name)
      prover!:Name

    @Struct.field(heavyproof)
      blockproof!:heavyproof

    @Struct.field(actionproof)
      actionproof!:actionproof
  }
  @Struct.type("lightproof")
  export class lightproof extends Struct {
    @Struct.field(Checksum256)
      chain_id!:Checksum256

    @Struct.field(blockheader)
      header!:blockheader

    @Struct.field(Checksum256)
      root!:Checksum256

    @Struct.field(Checksum256, { array: true })
      bmproofpath!:Checksum256[]
  }
  @Struct.type("cancelb")
  export class cancelb extends Struct {
    @Struct.field(Name)
      prover!:Name

    @Struct.field(lightproof)
      blockproof!:lightproof

    @Struct.field(actionproof)
      actionproof!:actionproof
  }
  @Struct.type("disable")
  export class disable extends Struct {}
  @Struct.type("pair_string_ATOMIC_ATTRIBUTE")
  export class pair_string_ATOMIC_ATTRIBUTE extends Struct {
    @Struct.field("string")
      first!:string

    @Struct.field(
      variant_int8_int16_int32_int64_uint8_uint16_uint32_uint64_float32_float64_string_INT8_VEC_INT16_VEC_INT32_VEC_INT64_VEC_UINT8_VEC_UINT16_VEC_UINT32_VEC_UINT64_VEC_FLOAT_VEC_DOUBLE_VEC_STRING_VEC
    )
      second!:variant_int8_int16_int32_int64_uint8_uint16_uint32_uint64_float32_float64_string_INT8_VEC_INT16_VEC_INT32_VEC_INT64_VEC_UINT8_VEC_UINT16_VEC_UINT32_VEC_UINT64_VEC_FLOAT_VEC_DOUBLE_VEC_STRING_VEC
  }
  @Struct.type("emitemplates")
  export class emitemplates extends Struct {
    @Struct.field(Name)
      collection_name!:Name

    @Struct.field(Int32)
      template_id!:Int32

    @Struct.field(Name)
      schema_name!:Name

    @Struct.field(pair_string_ATOMIC_ATTRIBUTE, { array: true })
      template_immutable_data!:pair_string_ATOMIC_ATTRIBUTE[]
  }
  @Struct.type("nftxfer")
  export class nftxfer extends Struct {
    @Struct.field(Name)
      owner!:Name

    @Struct.field(assets_s, { array: true })
      assets!:assets_s[]

    @Struct.field(Name)
      beneficiary!:Name

    @Struct.field("string")
      memo!:string
  }
  @Struct.type("emitnftxfer")
  export class emitnftxfer extends Struct {
    @Struct.field(nftxfer)
      nftxfer!:nftxfer
  }
  @Struct.type("emitschemas")
  export class emitschemas extends Struct {
    @Struct.field(FORMAT, { array: true })
      schema_format!:FORMAT[]

    @Struct.field(Name)
      collection_name!:Name

    @Struct.field(Name)
      schema_name!:Name
  }
  @Struct.type("emitschema")
  export class emitschema extends Struct {
    @Struct.field(emitschemas)
      schema_data!:emitschemas
  }
  @Struct.type("emittemplate")
  export class emittemplate extends Struct {
    @Struct.field(emitemplates)
      template_data!:emitemplates
  }
  @Struct.type("enable")
  export class enable extends Struct {}
  @Struct.type("global")
  export class global extends Struct {
    @Struct.field(Checksum256)
      chain_id!:Checksum256

    @Struct.field(Name)
      bridge_contract!:Name

    @Struct.field(Checksum256)
      paired_chain_id!:Checksum256

    @Struct.field(Name)
      paired_wrapnft_contract!:Name

    @Struct.field("bool")
      enabled!:boolean
  }
  @Struct.type("hpstruct")
  export class hpstruct extends Struct {
    @Struct.field(UInt64)
      id!:UInt64

    @Struct.field(heavyproof)
      hp!:heavyproof
  }
  @Struct.type("init")
  export class init extends Struct {
    @Struct.field(Checksum256)
      chain_id!:Checksum256

    @Struct.field(Name)
      bridge_contract!:Name

    @Struct.field(Checksum256)
      paired_chain_id!:Checksum256

    @Struct.field(Name)
      paired_wrapnft_contract!:Name
  }
  @Struct.type("initschema")
  export class initschema extends Struct {
    @Struct.field(Name)
      collection_name!:Name

    @Struct.field(Name)
      schema_name!:Name
  }
  @Struct.type("inittemplate")
  export class inittemplate extends Struct {
    @Struct.field(Name)
      collection_name!:Name

    @Struct.field(Int32)
      template_id!:Int32
  }
  @Struct.type("lockednfts")
  export class lockednfts extends Struct {
    @Struct.field(UInt64)
      asset_id!:UInt64

    @Struct.field(Name)
      beneficiary!:Name

    @Struct.field(Name)
      owner!:Name
  }
  @Struct.type("locknftrm")
  export class locknftrm extends Struct {
    @Struct.field(UInt64)
      asset_id!:UInt64
  }
  @Struct.type("lpstruct")
  export class lpstruct extends Struct {
    @Struct.field(UInt64)
      id!:UInt64

    @Struct.field(lightproof)
      lp!:lightproof
  }
  @Struct.type("nftidxfer")
  export class nftidxfer extends Struct {
    @Struct.field(UInt64, { array: true })
      asset_ids!:UInt64[]

    @Struct.field(Name)
      beneficiary!:Name

    @Struct.field("string")
      memo!:string
  }
  @Struct.type("nftwhitelist")
  export class nftwhitelist extends Struct {
    @Struct.field(Name)
      collection_name!:Name

    @Struct.field(Int32, { array: true })
      template_ids!:Int32[]

    @Struct.field(Name, { array: true })
      schema_names!:Name[]
  }
  @Struct.type("nftwlrm")
  export class nftwlrm extends Struct {
    @Struct.field(Name)
      collection_name!:Name
  }
  @Struct.type("nftwlset")
  export class nftwlset extends Struct {
    @Struct.field(nftwhitelist)
      nftwl!:nftwhitelist
  }
  @Struct.type("processed")
  export class processed extends Struct {
    @Struct.field(UInt64)
      id!:UInt64

    @Struct.field(Checksum256)
      receipt_digest!:Checksum256
  }
  @Struct.type("withdrawa")
  export class withdrawa extends Struct {
    @Struct.field(Name)
      prover!:Name

    @Struct.field(heavyproof)
      blockproof!:heavyproof

    @Struct.field(actionproof)
      actionproof!:actionproof
  }
  @Struct.type("withdrawb")
  export class withdrawb extends Struct {
    @Struct.field(Name)
      prover!:Name

    @Struct.field(lightproof)
      blockproof!:lightproof

    @Struct.field(actionproof)
      actionproof!:actionproof
  }
}
export const TableMap = {
  emitemplates: Types.emitemplates,
  global: Types.global,
  heavyproof: Types.hpstruct,
  lightproof: Types.lpstruct,
  lockednfts: Types.lockednfts,
  nftidxfer: Types.nftidxfer,
  nftwhitelist: Types.nftwhitelist,
  nftxfer: Types.nftxfer,
  processed: Types.processed
}
export interface TableTypes {
  emitemplates:Types.emitemplates
  global:Types.global
  heavyproof:Types.hpstruct
  lightproof:Types.lpstruct
  lockednfts:Types.lockednfts
  nftidxfer:Types.nftidxfer
  nftwhitelist:Types.nftwhitelist
  nftxfer:Types.nftxfer
  processed:Types.processed
}
export type RowType<T> = T extends keyof TableTypes ? TableTypes[T] : any
export type TableNames = keyof TableTypes
export namespace ActionParams {
  export namespace Type {
    export interface heavyproof {
      chain_id:Checksum256Type
      hashes:Checksum256Type[]
      blocktoprove:Type.anchorblock
      bftproof:Type.sblockheader[]
    }
    export interface anchorblock {
      block:Type.sblockheader
      active_nodes:UInt16Type[]
      node_count:UInt64Type
    }
    export interface sblockheader {
      header:Type.blockheader
      producer_signatures:SignatureType[]
      previous_bmroot:Checksum256Type
      bmproofpath:UInt16Type[]
    }
    export interface blockheader {
      timestamp:BlockTimestamp
      producer:NameType
      confirmed:UInt16Type
      previous:Checksum256Type
      transaction_mroot:Checksum256Type
      action_mroot:Checksum256Type
      schedule_version:UInt32Type
      new_producers:Type.producer_schedule
      header_extensions:Type.pair_uint16_bytes[]
    }
    export interface producer_schedule {
      version:UInt32Type
      producers:Type.producer_key[]
    }
    export interface producer_key {
      producer_name:NameType
      block_signing_key:PublicKeyType
    }
    export interface pair_uint16_bytes {
      first:UInt16Type
      second:BytesType
    }
    export interface actionproof {
      action:Type.action
      receipt:Type.actreceipt
      returnvalue:BytesType
      amproofpath:Checksum256Type[]
    }
    export interface action {
      account:NameType
      name:NameType
      authorization:Type.permission_level[]
      data:BytesType
    }
    export interface permission_level {
      actor:NameType
      permission:NameType
    }
    export interface actreceipt {
      receiver:NameType
      act_digest:Checksum256Type
      global_sequence:UInt64Type
      recv_sequence:UInt64Type
      auth_sequence:Type.authseq[]
      code_sequence:VarUIntType
      abi_sequence:VarUIntType
    }
    export interface authseq {
      account:NameType
      sequence:UInt64Type
    }
    export interface lightproof {
      chain_id:Checksum256Type
      header:Type.blockheader
      root:Checksum256Type
      bmproofpath:Checksum256Type[]
    }
    export interface nftxfer {
      owner:NameType
      assets:Type.assets_s[]
      beneficiary:NameType
      memo:string
    }
    export interface assets_s {
      asset_id:UInt64Type
      collection_name:NameType
      schema_name:NameType
      template_id:Int32Type
      ram_payer:NameType
      backed_tokens:AssetType[]
      immutable_serialized_data:BytesType
      mutable_serialized_data:BytesType
    }
    export interface emitschemas {
      schema_format:Type.FORMAT[]
      collection_name:NameType
      schema_name:NameType
    }
    export interface FORMAT {
      name:string
      type:string
    }
    export interface emitemplates {
      collection_name:NameType
      template_id:Int32Type
      schema_name:NameType
      template_immutable_data:Type.pair_string_ATOMIC_ATTRIBUTE[]
    }
    export interface pair_string_ATOMIC_ATTRIBUTE {
      first:string
      second:Type.variant_int8_int16_int32_int64_uint8_uint16_uint32_uint64_float32_float64_string_INT8_VEC_INT16_VEC_INT32_VEC_INT64_VEC_UINT8_VEC_UINT16_VEC_UINT32_VEC_UINT64_VEC_FLOAT_VEC_DOUBLE_VEC_STRING_VEC
    }
    export type variant_int8_int16_int32_int64_uint8_uint16_uint32_uint64_float32_float64_string_INT8_VEC_INT16_VEC_INT32_VEC_INT64_VEC_UINT8_VEC_UINT16_VEC_UINT32_VEC_UINT64_VEC_FLOAT_VEC_DOUBLE_VEC_STRING_VEC =

                | Int8Type
                | Int16Type
                | Int32Type
                | Int64Type
                | UInt8Type
                | UInt16Type
                | UInt32Type
                | UInt64Type
                | Float32Type
                | Float64Type
                | string
                | BytesType
                | Int16Type[]
                | Int32Type[]
                | Int64Type[]
                | BytesType
                | UInt16Type[]
                | UInt32Type[]
                | UInt64Type[]
                | Float32Type[]
                | Float64Type[]
                | string[]
                | Types.variant_int8_int16_int32_int64_uint8_uint16_uint32_uint64_float32_float64_string_INT8_VEC_INT16_VEC_INT32_VEC_INT64_VEC_UINT8_VEC_UINT16_VEC_UINT32_VEC_UINT64_VEC_FLOAT_VEC_DOUBLE_VEC_STRING_VEC
    export interface nftwhitelist {
      collection_name:NameType
      template_ids:Int32Type[]
      schema_names:NameType[]
    }
  }
  export interface cancela {
    prover:NameType
    blockproof:Type.heavyproof
    actionproof:Type.actionproof
  }
  export interface cancelb {
    prover:NameType
    blockproof:Type.lightproof
    actionproof:Type.actionproof
  }
  export interface disable {}
  export interface emitnftxfer {
    nftxfer:Type.nftxfer
  }
  export interface emitschema {
    schema_data:Type.emitschemas
  }
  export interface emittemplate {
    template_data:Type.emitemplates
  }
  export interface enable {}
  export interface init {
    chain_id:Checksum256Type
    bridge_contract:NameType
    paired_chain_id:Checksum256Type
    paired_wrapnft_contract:NameType
  }
  export interface initschema {
    collection_name:NameType
    schema_name:NameType
  }
  export interface inittemplate {
    collection_name:NameType
    template_id:Int32Type
  }
  export interface locknftrm {
    asset_id:UInt64Type
  }
  export interface nftwlrm {
    collection_name:NameType
  }
  export interface nftwlset {
    nftwl:Type.nftwhitelist
  }
  export interface withdrawa {
    prover:NameType
    blockproof:Type.heavyproof
    actionproof:Type.actionproof
  }
  export interface withdrawb {
    prover:NameType
    blockproof:Type.lightproof
    actionproof:Type.actionproof
  }
}
export interface ActionNameParams {
  cancela:ActionParams.cancela
  cancelb:ActionParams.cancelb
  disable:ActionParams.disable
  emitnftxfer:ActionParams.emitnftxfer
  emitschema:ActionParams.emitschema
  emittemplate:ActionParams.emittemplate
  enable:ActionParams.enable
  init:ActionParams.init
  initschema:ActionParams.initschema
  inittemplate:ActionParams.inittemplate
  locknftrm:ActionParams.locknftrm
  nftwlrm:ActionParams.nftwlrm
  nftwlset:ActionParams.nftwlset
  withdrawa:ActionParams.withdrawa
  withdrawb:ActionParams.withdrawb
}
export type ActionNames = keyof ActionNameParams
export class Contract extends BaseContract {
  constructor(args:PartialBy<ContractArgs, "abi" | "account">) {
    super({
      client: args.client,
      abi,
      account: args.account || Name.from("unknown")
    })
  }

  action<T extends ActionNames>(
    name:T,
    data:ActionNameParams[T],
    options?:ActionOptions
  ):Action {
    return super.action(name, data, options)
  }

  table<T extends TableNames>(name:T, scope?:NameType):Table<RowType<T>> {
    return super.table(name, scope, TableMap[name])
  }
}
