import { Button } from "@tremor/react"
import { ChevronRightIcon } from "@heroicons/react/20/solid"
import { MaterialCompositionWithImpacts } from "lib/types/calculator.types"

export default ({
  items,
  onClick,
}: {
  items: Array<MaterialCompositionWithImpacts>
  onClick: (item: MaterialCompositionWithImpacts) => void
}) => {
  return (
    <div className="flex space-x-2 justify-start max-w-full overflow-x-scroll">
      {items.map((item, index) => (
        <div className="flex space-x-2" key={index}>
          <Button
            onClick={() => onClick(item)}
            variant="light"
            color={index === items.length - 1 ? "indigo" : "gray"}
            text={
              item.part_description ??
              item.primary_material ??
              "Parent Component"
            }
            size="md"
          />
          <ChevronRightIcon className="h-5 w-5 text-indigo-300 mt-0.5" />
        </div>
      ))}
    </div>
  )
}
