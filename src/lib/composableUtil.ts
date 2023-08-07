import { Asset } from "anchor-link"
import { defineProps } from "vue"
export const confirmTranferModal = {
  props: defineProps<{
  relayFee:Asset
  fromChainName:string
  toChainName:string
  quantity:Asset
  destinationAccountName:string,
  fromAccountName:string
  }>()
}
export namespace ConfirmTransferModal{
  export type Props = {
  relayFee:Asset
  fromChainName:string
  toChainName:string
  quantity:Asset
  destinationAccountName:string,
  fromAccountName:string
  }

}

