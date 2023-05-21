import { LCAStage } from "lib/types/calculator.types"

const HelpText = {
  [LCAStage.MATERIALS]:
    "Provide subcomponents or materials whose weights total 95-100% of this product's weight.",
  [LCAStage.TRANSPORTATION]:
    "Provide all transportation details for materials to their final point of assembly.",
  [LCAStage.MANUFACTURING]:
    "Provide manufacturing details for every facility that assembles this product.",
  [LCAStage.USE]:
    "Provide use phase details. If there is a relevant use phase, percentages of resources across all locations must total 100%.",
  [LCAStage.DISPOSAL]:
    "Provide end of life details. Percentages of disposal must total 100%.",
}

export { HelpText }
