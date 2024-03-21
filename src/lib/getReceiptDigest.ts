import { Name, Asset, UInt64, VarUInt, Checksum256, ABIEncoder, Serializer } from "@greymass/eosio"
import { ABISerializable, Serializer as Serializer2 } from "@wharfkit/antelope"
import { sha256 } from "hash.js"
import { HypAction, getHypClient } from "lib/hyp"
import { Emitxfer } from "lib/types/wraptoken.types"
import { throwErr } from "lib/utils"
import { Contract as AtomicContract, Types as AtomicTypes } from "lib/types/atomicassets.types"
import { Contract as NftLock, Types as NftLockTypes } from "lib/types/wraplock.nft.types"
import { Contract as NftWrap, Types as NftWrapTypes } from "lib/types/wraptoken.nft.types"


export function getReceiptDigest(action:any) {
  const abiEncoder = new ABIEncoder()
  let receipt = action.receipts[0]
  if (!receipt) throwErr("missing receipt")

  if (!receipt?.act_digest) {
    // Luckily, the correct digest is attached to the action
    // but `hex_data` is not and must be computed
    receipt.act_digest = action.act_digest

    // Typed actions helps avoiding to fetch or store the ABI
    const actionData = action.act.data
    let typedAction:any
    if (action.act.name == "emitxfer") {
      typedAction = Emitxfer.from(actionData)
      action.act.hex_data = Serializer.encode({ object: typedAction, type: Emitxfer }).hexString
    } else if (action.act.name == "emitnftxfer") {
      typedAction = NftLockTypes.emitnftxfer.from(actionData)
      action.act.hex_data = Serializer2.encode({ object: typedAction, type: NftLockTypes.emitnftxfer }).hexString
    }
  }
  // console.log()


  const receiverEncoded = Serializer.encode({ object: receipt.receiver, type: Name })
  const digestEncoded = Serializer.encode({ object: receipt.act_digest, type: Checksum256 })
  const globalSequenceEncoded = Serializer.encode({ object: receipt.global_sequence, type: UInt64 })
  const recvSequenceEncoded = Serializer.encode({ object: receipt.recv_sequence, type: UInt64 })

  abiEncoder.writeArray(receiverEncoded.array)
  abiEncoder.writeArray(digestEncoded.array)
  abiEncoder.writeArray(globalSequenceEncoded.array)
  abiEncoder.writeArray(recvSequenceEncoded.array)

  if (receipt.auth_sequence) {
    const authSequenceLengthEncoded = Serializer.encode({ object: receipt.auth_sequence.length, type: VarUInt })
    abiEncoder.writeArray(authSequenceLengthEncoded.array)

    for (const auth of receipt.auth_sequence) {
      const accountNameEncoded = Serializer.encode({ object: auth.account, type: Name })
      const sequenceEncoded = Serializer.encode({ object: auth.sequence, type: UInt64 })
      abiEncoder.writeArray(accountNameEncoded.array)
      abiEncoder.writeArray(sequenceEncoded.array)
    }
  } else {
    abiEncoder.writeVaruint32(0)
  }

  if (action.code_sequence) {
    const codeSequenceEncoded = Serializer.encode({ object: action.code_sequence, type: VarUInt })
    abiEncoder.writeArray(codeSequenceEncoded.array)
  } else {
    abiEncoder.writeVaruint32(0)
  }

  if (action.abi_sequence) {
    const abiSequenceEncoded = Serializer.encode({ object: action.abi_sequence, type: VarUInt })
    abiEncoder.writeArray(abiSequenceEncoded.array)
  } else {
    abiEncoder.writeVaruint32(0)
  }

  const bytes = abiEncoder.getBytes().array
  const digest = sha256().update(bytes).digest("hex")

  return digest
}


// const hyp = getHypClient("telos")
// const trx = hyp.getTrx()
