import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid"
import { Badge } from "@tremor/react"

export default () => {
  return (
    <div className="fixed top-3 w-full lg:w-[calc(100%-20rem)] text-left">
      <Badge
        color="indigo"
        size="xs"
        marginTop="mt-3"
        icon={QuestionMarkCircleIcon}
        text="What is this page for?"
        tooltip="Any product, subcomponent, or material known to your company with an identifier or SKU is listed here. 
            If a product is not listed, you can add it here. 
            If a product is purchased from a supplier, you can use this page to send requests for supplier-specific carbon footprint data."
      />
    </div>
  )
}
