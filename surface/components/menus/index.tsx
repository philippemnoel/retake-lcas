import { useState, useRef, useEffect } from "react"
import { Menu, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline"
import classNames from "classnames"

export default ({
  options,
  relative,
  button,
  position,
}: {
  options: Array<{
    name: string
    icon: (
      props: React.SVGProps<SVGSVGElement> & {
        title?: string | undefined
        titleId?: string | undefined
      }
    ) => JSX.Element
    onClick: () => void
  }>
  relative?: boolean
  button?: JSX.Element
  position?: string
}) => {
  const [show, setShow] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (menuRef.current && !(menuRef.current as any).contains(event.target)) {
        setShow(false)
      }
    }
    window.addEventListener("mousedown", handleClickOutside)
    return () => {
      window.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuRef])

  return (
    <Menu as="div">
      <div
        onClick={(event) => {
          event.stopPropagation()
          setShow(!show)
        }}
        className="cursor-pointer"
      >
        {button !== undefined ? (
          button
        ) : (
          <EllipsisVerticalIcon className="w-5 h-5 text-indigo-500" />
        )}
      </div>
      <div
        className={classNames((relative ?? false) && "relative")}
        ref={menuRef}
      >
        <Transition
          show={show}
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            static
            className={classNames(
              "absolute z-50 w-fit min-w-[19rem] origin-bottom-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none align-auto",
              (position ?? "right") === "left" && "-translate-x-56"
            )}
          >
            {options.map((option, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-indigo-500 text-white" : "text-gray-600"
                    } group flex w-full items-center px-4 py-3 rounded text-sm text-left`}
                    onClick={() => {
                      option.onClick()
                      setShow(false)
                    }}
                  >
                    <option.icon className="mr-3 h-4 w-4" aria-hidden="true" />
                    {option.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </div>
    </Menu>
  )
}
