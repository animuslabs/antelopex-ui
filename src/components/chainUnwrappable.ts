import { UnwrappableType } from "lib/ibcHubs"
import { computed } from "vue"
import { props } from "./UnwrappableTokens.vue"

export const chainUnwrappable = computed<UnwrappableType[]>(() => unwrappableTokens.filter(el => el.data.hubContract[props.name]))
