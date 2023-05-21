import { useState, Fragment } from "react"
import { Callout } from "@tremor/react"
import { Transition, Menu } from "@headlessui/react"
import classNames from "classnames"

import { LCAStage } from "lib/types/calculator.types"

import { HelpText } from "@/components/menus/types"

const callout = (type: LCAStage, completed: boolean) => (
  <Callout
    title={`${type} ${completed ? "Complete" : "Incomplete"}`}
    color={completed ? "indigo" : "rose"}
    text={HelpText[type]}
  />
)

export default ({
  type,
  completed,
  show = true,
  right,
  children,
}: {
  type: LCAStage
  completed: boolean
  show?: boolean
  right?: string
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
          {show && (
            <div className="absolute w-full max-w-sm">
              <div
                className={classNames(
                  "w-full absolute z-50",
                  right ? right : "right-20"
                )}
              >
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
                  <div className="absolute z-50 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-3 flex-col space-y-3">
                    <div>{callout(type, completed)}</div>
                  </div>
                </Transition>
              </div>
            </div>
          )}
        </div>
      </Menu>
    </div>
  )
}
