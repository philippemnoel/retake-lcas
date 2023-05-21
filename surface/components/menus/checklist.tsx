import { useState, Fragment } from "react"
import { Callout } from "@tremor/react"
import { Transition, Menu } from "@headlessui/react"

import { LCAStage } from "lib/types/calculator.types"

import { HelpText } from "@/components/menus/types"

const callout = (type: LCAStage, completed: boolean) => (
  <Callout
    title={`${type} ${completed ? "Complete" : "Incomplete"}`}
    color={completed ? "indigo" : "rose"}
    text={HelpText[type]}
  />
)

const popupBody = (
  materialsCompleted: boolean,
  transportationCompleted: boolean,
  manufacturingCompleted: boolean,
  useCompleted: boolean,
  disposalCompleted: boolean
) => {
  return (
    <div className="absolute z-50 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-3 flex-col space-y-3">
      <div className="whitespace-normal">
        {callout(LCAStage.MATERIALS, materialsCompleted)}
      </div>
      <div className="whitespace-normal">
        {callout(LCAStage.TRANSPORTATION, transportationCompleted)}
      </div>
      <div className="whitespace-normal">
        {callout(LCAStage.MANUFACTURING, manufacturingCompleted)}
      </div>
      <div className="whitespace-normal">
        {callout(LCAStage.USE, useCompleted)}
      </div>
      <div className="whitespace-normal">
        {callout(LCAStage.DISPOSAL, disposalCompleted)}
      </div>
    </div>
  )
}

export default ({
  materialsCompleted,
  transportationCompleted,
  manufacturingCompleted,
  useCompleted,
  disposalCompleted,
  children,
}: {
  materialsCompleted: boolean
  transportationCompleted: boolean
  manufacturingCompleted: boolean
  useCompleted: boolean
  disposalCompleted: boolean
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
      <Menu>
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {children}
          <div className="absolute w-full max-w-sm">
            <div className="w-full absolute right-96 bottom-36 z-50">
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
                {popupBody(
                  materialsCompleted,
                  transportationCompleted,
                  manufacturingCompleted,
                  useCompleted,
                  disposalCompleted
                )}
              </Transition>
            </div>
          </div>
        </div>
      </Menu>
    </div>
  )
}
