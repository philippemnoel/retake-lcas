import { useState, Fragment } from "react"
import { Menu, Transition } from "@headlessui/react"
import classNames from "classnames"

import Image from "next/image"

export default (props: {
  navigation: Array<{
    name: string
    href: string
  }>
  imageUrl: string | undefined | null
}) => {
  const { navigation, imageUrl } = props
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="ml-3 flex items-center">
      {/* Profile dropdown */}
      <Menu as="div" className="relative ml-3">
        <div>
          <Menu.Button
            onClick={() => setShowMenu(!showMenu)}
            className="flex max-w-xs items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span className="sr-only">Open user menu</span>
            {imageUrl && (
              <Image
                className="h-8 w-8 rounded-full"
                src={imageUrl}
                alt=""
                width={50}
                height={50}
              />
            )}
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          show={showMenu}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="translate-x-16 -translate-y-24 right-0 absolute z-50 mt-2 w-24 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {navigation.map((item) => (
              <Menu.Item key={item.name}>
                {({ active }) => (
                  <a
                    href={item.href}
                    className={classNames(
                      active ? "bg-gray-100" : "",
                      "block py-2 px-4 text-sm text-gray-700"
                    )}
                  >
                    {item.name}
                  </a>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}
