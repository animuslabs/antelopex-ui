import { boot } from "quasar/wrappers"
import { QInput, QBtn, QCard, QRouteTab, QTab } from "quasar"

const setDefault = (component:any, key:string, value:any) => {
  const prop = component.props[key]
  switch (typeof prop) {
    case "object":
      prop.default = value
      break
    case "function":
      component.props[key] = {
        type: prop,
        default: value
      }
      break
    case "undefined":
      throw new Error("unknown prop: " + key)
    default:
      throw new Error("unhandled type: " + typeof prop)
  }
}

export default boot(({ app }) => {
  console.log("component defaults")
  setDefault(QCard, "square", false)
  setDefault(QCard, "flat", true)
  // setDefault(QCard, "bordered", true)

  // setDefault(QInput, "dense", true)
  // setDefault(QInput, "outlined", true)
  setDefault(QInput, "stackLabel", true)
  setDefault(QInput, "hideBottomSpace", true)
  setDefault(QInput, "square", true)

  // setDefault(QBtn, "flat", false)
  // setDefault(QBtn, "unelevated", true)
  // setDefault(QBtn, "stretch", true)
  setDefault(QBtn, "ripple", false)


  setDefault(QRouteTab, "ripple", false)
})
