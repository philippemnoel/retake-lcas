import { LCAStage } from "lib/types/calculator.types"

const HelpText = {
  [LCAStage.MATERIALS]:
    "By clicking Continue, you are confirming that you are finished providing material composition information for this product.",
  [LCAStage.TRANSPORTATION]:
    "By clicking Continue, you are confirming that you are finished providing transportation information for this product.",
  [LCAStage.MANUFACTURING]:
    "By clicking Continue, you are confirming that you are finished providing manufacturing information for this product.",
  [LCAStage.USE]:
    "By clicking Continue, you are confirming that you are finished providing use phase information for this product.",
  [LCAStage.DISPOSAL]:
    "By clicking Continue, you are confirming that you are finished providing end of life information for this product.",
}

export { HelpText }
