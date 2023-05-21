import { useState, Fragment } from "react"
import { Text, Callout, Legend } from "@tremor/react"
import { Transition, Menu } from "@headlessui/react"
import {
  CircleStackIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline"

const popupContent = (text: string, showLegend: boolean) => (
  <div className="absolute whitespace-normal z-50 right-12 max-w-md origin-bottom-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
    <div className="w-full px-4 py-3 text-sm text-left text-gray-600">
      {text}
    </div>
    {showLegend && (
      <div className="group flex w-full items-center px-4 py-3 rounded text-sm text-left space-x-3">
        <Legend
          categories={["From Supplier", "From Database", "Supplier + Database"]}
          colors={["blue", "rose", "purple"]}
        />
      </div>
    )}
  </div>
)

const popupBody = (
  isLeaf: boolean,
  factorNotFound: boolean,
  database?: string | null,
  activity?: string | null,
  source?: string | null
) => {
  if (factorNotFound) {
    return popupContent(
      "No emissions factor was found matching this component's description. Please try adding a more descriptive description or selecting a material type.",
      false
    )
  }

  if (source === "supplier") {
    return popupContent(
      "This component's carbon footprint was provided directly by a supplier and verified by Retake.",
      true
    )
  }

  if (source === "mixed") {
    return popupContent(
      "Some of the carbon footprints of this component's subcomponents were provided by suppliers, while others were estimated from databases.",
      true
    )
  }

  if (database && activity && isLeaf) {
    return (
      <Menu.Items
        static
        className="absolute z-50 right-12 max-w-md origin-bottom-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      >
        <>
          <Menu.Item as="div">
            <div className="group flex w-full items-center px-4 py-3 rounded text-sm text-left">
              <CircleStackIcon className="mr-3 h-4 w-4" aria-hidden="true" />
              <Text truncate>{database}</Text>
            </div>
          </Menu.Item>
          <Menu.Item as="div">
            <div className="group flex w-full items-center px-4 py-3 rounded text-sm text-left space-x-3">
              <Square3Stack3DIcon className="h-4 w-4" aria-hidden="true" />
              <div className="whitespace-normal text-gray-500">{activity}</div>
            </div>
          </Menu.Item>
          <Menu.Item as="div">
            <div className="group flex w-full items-center px-4 py-3 rounded text-sm text-left space-x-3 whitespace-normal">
              <Callout
                color="stone"
                text="Because first-party data for this item or activity is not available, this carbon footprint was obtained from the Ecoinvent Database
                by the description, location (if provided), and material (if provided) of this item or activity."
                title="Note"
              />
            </div>
          </Menu.Item>
          <Menu.Item as="div">
            <div className="group flex w-full items-center px-4 py-3 rounded text-sm text-left space-x-3">
              <Legend
                categories={[
                  "From Supplier",
                  "From Database",
                  "Supplier + Database",
                ]}
                colors={["blue", "rose", "purple"]}
              />
            </div>
          </Menu.Item>
        </>
      </Menu.Items>
    )
  }

  return popupContent(
    "This component's global warming impact was calculated via a weighted sum of its subcomponent's global warming impacts.",
    true
  )
}

export default ({
  database,
  activity,
  source,
  isLeaf,
  factorNotFound,
  children,
}: {
  database?: string | null
  activity?: string | null
  source?: string | null
  isLeaf: boolean
  factorNotFound: boolean
  children: React.ReactNode
}) => {
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  return (
    <div className="w-full">
      <Menu as="div">
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {children}
          <div className="absolute w-full max-w-lg">
            <div className="w-full absolute right-[29rem] bottom-24 z-50">
              <Transition
                show={isHovering}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                {popupBody(isLeaf, factorNotFound, database, activity, source)}
              </Transition>
            </div>
          </div>
        </div>
      </Menu>
    </div>
  )
}
