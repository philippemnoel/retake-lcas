import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid"
import { Badge } from "@tremor/react"

export default () => {
  return (
    <div className="fixed top-6 w-full lg:w-[calc(100%-20rem)] text-left">
      <Badge
        color="indigo"
        size="xs"
        icon={QuestionMarkCircleIcon}
        text="What is this page for?"
        tooltip="This page is used to create life cycle assessments (LCAs) for products that your company manufactures. 
            If instead you wish to understand the carbon footprint of products purchased from suppliers, use the Inventory section."
      />
    </div>
  )
}
