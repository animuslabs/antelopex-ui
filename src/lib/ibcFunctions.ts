/* eslint-disable no-redeclare */
// @ts-nocheck
import { SerialBuffer, createInitialTypes } from "eosjs/dist/eosjs-serialize"
const types = createInitialTypes()
import hex64 from "hex64"
const axios = require("axios")
const historyProvider = "ship"
import crypto from "crypto"

const eosjsTypes = {
  name: types.get("name"),
  bytes: types.get("bytes"),
  uint8: types.get("uint8"),
  uint16: types.get("uint16"),
  uint32: types.get("uint32"),
  uint64: types.get("uint64"),
  varuint32: types.get("varuint32"),
  checksum256: types.get("checksum256")
}
const { name, uint8, uint64, varuint32, checksum256, bytes } = eosjsTypes

// function payFeeAction() {
//   const payFee = Transfer.from({
//     from: this.user,
//     to: this.fromLink.config.sysContract,
//     quantity: fee.quantity,
//     memo: "ibc order payment"
//   })
//   console.log("payFee", JSON.stringify(payFee, null, 2))
//   const feeAct = makeAction.transfer(payFee, fee.contract, this.fromLink)
// }
const nameToUint64 = (s:string | any[]) => {
  let n = 0n
  let i = 0
  for (; i < 12 && s[i]; i++) n |= BigInt(char_to_symbol(s.charCodeAt(i)) & 0x1f) << BigInt(64 - 5 * (i + 1))
  if (i == 12) n |= BigInt(char_to_symbol(s.charCodeAt(i)) & 0x0f)
  return n.toString()
}

const char_to_symbol = (c:string | number) => {
  if (typeof c == "string") c = c.charCodeAt(0)
  if (c >= "a".charCodeAt(0) && c <= "z".charCodeAt(0)) return c - "a".charCodeAt(0) + 6
  if (c >= "1".charCodeAt(0) && c <= "5".charCodeAt(0)) return c - "1".charCodeAt(0) + 1
  return 0
}

function getActionProof(block_to_prove:any, requested_action_receipt_digest:any) {
  let { action_receipt_digests, action_return_value } = getReceiptDigests(block_to_prove, requested_action_receipt_digest)
  if (action_receipt_digests.length > 1) action_receipt_digests = getProof(createTree(action_receipt_digests), requested_action_receipt_digest)
  return {
    amproofpath: action_receipt_digests,
    returnvalue: action_return_value && action_return_value.length ? action_return_value : ""
  }
}

function getReceiptDigests(block_to_prove:any, action_receipt_digest:any) {
  if (historyProvider === "firehose") return getFirehoseReceiptDigests(block_to_prove, action_receipt_digest)
  else if (historyProvider === "ship") return getShipReceiptDigests(block_to_prove, action_receipt_digest)
  else if (historyProvider === "greymass") return getNodeosReceiptDigests(block_to_prove, action_receipt_digest)
}

function getShipReceiptDigests(block_to_prove:{ transactions:any }, action_receipt_digest:string) {
  let action_return_value
  let action_receipt_digests = []
  let transactions = block_to_prove.transactions
  for (traces of transactions) {
    for (trace of traces.action_traces.sort((a:{ receipt:{ global_sequence:number } }, b:{ receipt:{ global_sequence:number } }) => a.receipt.global_sequence > b.receipt.global_sequence ? 1 : -1)) {
      let receipt_digest = getReceiptDigest(trace.receipt)
      //if this is the trace of the action we are trying to prove, assign the action_return_value from trace result
      if (receipt_digest === action_receipt_digest && trace.return_value) action_return_value = trace.return_value.toString()
      action_receipt_digests.push(receipt_digest)
    }
  }
  return { action_receipt_digests, action_return_value }
}

function getNodeosReceiptDigests(block_to_prove:{ transactions:any }, action_receipt_digest:any) {
  let action_return_value
  let action_receipt_digests = []
  for (traces of block_to_prove.transactions) {
    for (trace of traces.sort((a:{ receipt:{ global_sequence:number } }, b:{ receipt:{ global_sequence:number } }) => a.receipt.global_sequence > b.receipt.global_sequence ? 1 : -1)) {
      //if this is the trace of the action we are trying to prove, assign the action_return_value from trace result
      if (trace.action_receipt_digest === action_receipt_digest && trace.return_value) action_return_value = trace.return_value.toString()
      action_receipt_digests.push(trace.action_receipt_digest)
    }
  }

  return { action_receipt_digests, action_return_value }
}

function getFirehoseReceiptDigests(block_to_prove:{ unfilteredTransactionTraces:any[] }, action_receipt_digest:string) {
  let action_return_value
  let action_receipt_digests = []

  let transactions = block_to_prove.unfilteredTransactionTraces.map((item:{ actionTraces:any }) => item.actionTraces)

  for (traces of transactions) {
    for (trace of traces) {
      trace.action.rawData = hex64.toHex(trace.action.rawData)
      let receipt_digest = getReceiptDigest(trace.receipt)
      //if this is the trace of the action we are trying to prove, assign the action_return_value from trace result
      if (receipt_digest === action_receipt_digest && trace.returnValue) action_return_value = hex64.toHex(trace.returnValue)
      action_receipt_digests.push(receipt_digest)
    }
  }
  return { action_receipt_digests, action_return_value }
}
function getBmProof(block_to_prove:number, last_proven_block:number) {
  return new Promise(resolve => {
    const blocksTofetch:any[] = []

    let proofPath = getProofPath(block_to_prove - 1, last_proven_block - 1)
    for (var i = 0; i < proofPath.length; i++) {
      let multiplier = Math.pow(2, i)
      let block_num = (proofPath[i].pairIndex + 1) * multiplier
      if (proofPath[i].pairIndex % 2 == 0) block_num += 1
      block_num = Math.min(block_num, last_proven_block - 1)
      blocksTofetch.push(block_num)
    }

    const uniqueList:number[] = []
    for (let num of blocksTofetch) if (!uniqueList.includes(num)) uniqueList.push(num)

    let result = (await axios(`${process.env.LIGHTPROOF_API}?blocks=${uniqueList.join(",")}`)).data
    let bmproof = []


    for (var i = 0; i < blocksTofetch.length; i++) {
      const block = result.find((r:{ num:any }) => r.num === blocksTofetch[i])
      if (!block) {
        console.log("Error, block not found!", blocksTofetch[i])
        process.exit()
      }
      const path = i == 0 && (block_to_prove - 1) % 2 == 0 ? 1
        : i == 0 && (block_to_prove - 1) % 2 != 0 ? 2
          : proofPath[i].pairIndex % 2 == 0 ? 3
            : 4

      let hash
      if (path == 1) hash = block.id
      else if (path == 2 || path == 3) hash = block.nodes[0]
      else hash = append(block.id, block.nodes, block.num - 1, i).root
      hash = applyMask(hash, proofPath[i].isLeft).toString("hex")
      bmproof.push(hash)
    }
    resolve(bmproof)
  })
}

function append(digest:any, _active_nodes:any[], node_count:number, stop_at_depth = -1) {
  let partial = false
  let max_depth = calculate_max_depth(node_count + 1)
  // var implied_count = next_power_of_2(node_count);

  let current_depth = stop_at_depth == -1 ? max_depth - 1 : stop_at_depth
  let index = node_count
  let top = digest
  let count = 0
  let updated_active_nodes = []

  while (current_depth > 0) {
    if (!(index & 0x1)) {
      if (!partial) updated_active_nodes.push(top)
      top = hashPair(make_canonical_pair(top, top))
      partial = true
    } else {
      let left_value = _active_nodes[count]
      count++
      if (partial) updated_active_nodes.push(left_value)
      top = hashPair(make_canonical_pair(left_value, top))
    }

    current_depth--
    index = index >> 1
  }

  updated_active_nodes.push(top)
  return { nodes: updated_active_nodes, root: top }
}

function merkle(ids:any[]) {
  if (ids.length == 0) return ""

  while (ids.length > 1) {
    if (ids.length % 2) ids.push(ids[ids.length - 1])

    for (let i = 0; i < ids.length / 2; i++) {
      let p = make_canonical_pair(ids[2 * i], ids[(2 * i) + 1])

      let buffLeft = Buffer.from(p.l, "hex")
      let buffRight = Buffer.from(p.r, "hex")

      let buffFinal = Buffer.concat([buffLeft, buffRight])

      let finalHash = crypto.createHash("sha256").update(buffFinal).digest("hex")

      ids[i] = finalHash
    }

    ids = ids.slice(0, ids.length / 2)
  }

  return ids[0]
}

function createTree(leaves:any, mask = true) {
  let n_leaves = JSON.parse(JSON.stringify(leaves))
  let tree = { leaves, layers: [] }
  let layer_index = 0

  while (n_leaves.length > 1) {
    if (n_leaves.length % 2) n_leaves.push(n_leaves[n_leaves.length - 1])
    tree.layers.push([])

    for (let i = 0; i < n_leaves.length / 2; i++) {
      var leftLeaf
      var rightLeaf

      if (mask) {
        leftLeaf = maskLeft(n_leaves[2 * i])
        rightLeaf = maskRight(n_leaves[2 * i + 1])
      } else {
        leftLeaf = n_leaves[2 * i]
        rightLeaf = n_leaves[2 * i + 1]
      }

      tree.layers[layer_index].push(leftLeaf.toString("hex"))
      tree.layers[layer_index].push(rightLeaf.toString("hex"))

      let hash = crypto.createHash("sha256")
        .update(Buffer.concat([Buffer.from(leftLeaf, "hex"), Buffer.from(rightLeaf, "hex")]))
        .digest("hex")

      n_leaves[i] = hash
    }

    n_leaves = n_leaves.slice(0, n_leaves.length / 2)
    layer_index++
  }

  tree.root = n_leaves[0]
  return tree
}

function verify(proof:string | any[], targetNode:any, root:string, mask = true) {
  let hash_count = 0
  let hash = targetNode

  //console.log("target : ", hash, "\n");

  for (let i = 0; i < proof.length; i++) {
    let node = proof[i]
    //console.log("node : ", node, "\n");

    let isLeft = isLeftNode(proof[i])

    if (mask) {
      node = isLeft ? maskLeft(node) : maskRight(node)
      hash = isLeft ? maskRight(hash) : maskLeft(hash)
    }
    //console.log("canonical node : ", node );
    //console.log("canonical hash : ", hash );

    let buffers = []

    buffers.push(Buffer.from(hash, "hex"))
    buffers[isLeft ? "unshift" : "push"](Buffer.from(node, "hex"))

    let hash_hex = crypto.createHash("sha256").update(Buffer.concat(buffers)).digest("hex")
    //console.log("hash : ", hash_hex, "\n");

    hash_count++
    hash = hash_hex
  }

  return Buffer.compare(Buffer.from(hash, "hex"), Buffer.from(root, "hex")) === 0
}

function getProof(tree:{ leaves:any; layers:any }, leaf:any) {
  let proof = []
  let index = tree.leaves.findIndex((item:any) => item == leaf)

  if (index <= -1) {
    console.log("Couldn't find leaf in tree")
    return []
  }

  for (let i = 0; i < tree.layers.length; i++) {
    const layer = tree.layers[i]

    const isLeft = index % 2
    const pairIndex = isLeft ? index - 1
      : index === layer.length - 1 && i < tree.layers.length - 1 ? index
        : index + 1

    if (pairIndex < layer.length) proof.push(applyMask(layer[pairIndex], isLeft))
    index = (index / 2) | 0
  }

  return proof
}

function getProofPath(index:number, nodes_count:number) {
  let proof = []
  let layers_depth = calculate_max_depth(nodes_count) - 1
  let c_nodes_count = nodes_count

  for (let i = 0; i < layers_depth; i++) {
    if (c_nodes_count % 2) c_nodes_count += 1

    const isLeft = index % 2
    let pairIndex = isLeft ? index - 1
      : index === nodes_count - 1 && i < layers_depth - 1 ? index
        : index + 1

    c_nodes_count /= 2
    if (pairIndex < nodes_count) proof.push({ layer: i, pairIndex, isLeft })

    index = (index / 2) | 0
  }

  return proof
}

//Digests

const receipt = {
  receiver: "ibc.wl.tlos",
  act_digest: "8803991CB25EEA1CE76ACC47B01F25FFE57C48A8BB00841116F702FEA02938D8",
  global_sequence: "359088950174",
  recv_sequence: "775",
  auth_sequence: [
    {
      account: "ibc.wl.tlos",
      sequence: "757"
    }
  ],
  code_sequence: 2,
  abi_sequence: 1
}

