import { Fragment, useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import {
  Bars3Icon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { useUser } from "@auth0/nextjs-auth0"
import { useRouter } from "next/router"
import { Badge, Button, Icon } from "@tremor/react"
import classNames from "classnames"
import { useIntercom } from "react-use-intercom"

import Sidebar from "../navigation/sidebar"
import Logo from "../brand/logo"
import { useAppState } from "../hooks/state"
import Ephemeral from "../notifications/ephemeral"
import Avatar from "../buttons/avatar"

export default ({
  mainNavigation,
  pageNavigation,
  decorations,
  name,
  header,
  children,
}: {
  mainNavigation: Array<{
    name: string
    href: string
    icon: (
      props: React.SVGProps<SVGSVGElement> & {
        title?: string | undefined
        titleId?: string | undefined
      }
    ) => JSX.Element
    subPaths: Array<string>
  }>
  pageNavigation: Array<{ name: string; href: string }> | undefined
  name?: string
  header?: JSX.Element
  decorations?: Array<{ name: string; decoration: string | number }> | undefined
  children?: React.ReactNode
}) => {
  const { user } = useUser()
  const { pathname } = useRouter()
  const { notification, setNotification } = useAppState()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { update } = useIntercom()

  useEffect(() => {
    if (user !== undefined)
      update({ userId: user.sub ?? "", email: user.email ?? "" })
  }, [user])

  return (
    <>
      <div className="fixed flex h-screen w-screen">
        <Ephemeral
          title={notification?.title ?? ""}
          description={notification?.description ?? ""}
          color={
            notification?.type === "success"
              ? "text-green-500"
              : notification?.type === "warning"
              ? "text-red-400"
              : "text-indigo-600"
          }
          icon={
            notification?.type === "success"
              ? CheckCircleIcon
              : notification?.type === "warning"
              ? ExclamationTriangleIcon
              : () => (
                  <Button
                    loading={true}
                    variant="light"
                    size="lg"
                    color="indigo"
                  />
                )
          }
          show={notification !== undefined}
          setShow={(show: boolean) =>
            show === false && setNotification(undefined)
          }
          shouldDisappear={notification?.disappear ?? true}
        />
        <Transition.Root show={mobileMenuOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative lg:hidden"
            onClose={setMobileMenuOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white focus:outline-none">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-12 pt-4">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="pt-5 pb-4">
                    <div className="flex flex-shrink-0 items-center px-4">
                      <Logo width={30} height={30} />
                    </div>
                    <nav aria-label="Sidebar" className="mt-5">
                      <div className="space-y-1 px-2">
                        {mainNavigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="group flex items-center rounded-md p-2 text-base font-medium text-gray-600 hover:bg-neutral-50 hover:text-gray-900"
                          >
                            <item.icon
                              className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                              aria-hidden="true"
                            />
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </nav>
                  </div>
                  <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                    <div className="flex items-center">
                      <Avatar
                        imageUrl={user?.picture}
                        navigation={[
                          {
                            name: "Sign Out",
                            href: "/api/auth/logout",
                          },
                        ]}
                      />
                      <div className="ml-3">
                        <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                          Account Settings
                        </p>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        <div className="hidden lg:flex lg:flex-shrink-0 h-full">
          <div className="flex w-20 flex-col border-r">
            <div className="flex min-h-0 flex-1 flex-col bg-stone-50 relative">
              <div className="flex-1">
                <div className="flex items-center justify-center white py-6">
                  <Logo width={32} height={32} />
                </div>
                <nav
                  aria-label="Sidebar"
                  className="flex flex-col items-center space-y-3 py-6 pt-0"
                >
                  {mainNavigation.map((item) => {
                    const focused =
                      pathname.startsWith(item.href) ||
                      item.subPaths.includes(pathname)
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          "flex items-center rounded-lg p-3 text-gray-500 relative"
                        )}
                      >
                        {decorations?.find(
                          (decoration) => decoration.name === item.name
                        )?.decoration !== undefined && (
                          <div className="absolute top-0 right-0">
                            <Badge
                              size="xs"
                              color="indigo"
                              text={
                                decorations
                                  ?.find(
                                    (decoration) =>
                                      decoration.name === item.name
                                  )
                                  ?.decoration?.toString() ?? "0"
                              }
                            />
                          </div>
                        )}
                        <Icon
                          icon={item.icon}
                          tooltip={item.name}
                          color={focused ? "indigo" : "zinc"}
                          size="md"
                          variant={focused ? "light" : "simple"}
                        />
                      </a>
                    )
                  })}
                </nav>
              </div>
              <div className="pb-5 relative">
                <Avatar
                  imageUrl={user?.picture}
                  navigation={[
                    {
                      name: "Sign Out",
                      href: "/api/auth/logout",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Mobile top navigation */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between bg-white py-2 px-4 sm:px-6 lg:px-8 pt-4">
              <Logo width={30} height={30} />
              <div>
                <button
                  type="button"
                  className="-mr-3 inline-flex h-12 w-12 items-center justify-center rounded-md bg-white text-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <Bars3Icon
                    className="h-6 w-6 text-gray-500"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>

          <main className="flex flex-1 overflow-hidden">
            {/* Primary column */}
            <section
              aria-labelledby="primary-heading"
              className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto lg:order-last"
            >
              <div
                className={classNames(
                  "fixed z-10 bg-stone-50 border-b py-[1.85rem] px-6 w-full lg:w-[calc(100%-17rem)] text-sm font-medium invisible lg:visible flex justify-start text-right space-x-6"
                )}
                style={
                  pageNavigation !== undefined
                    ? { width: "calc(100% - 17rem)" }
                    : { width: "100%" }
                }
              >
                {header}
              </div>
              <div className={classNames("lg:pt-[3.75rem] h-full")}>
                {children}
              </div>
            </section>

            {/* Secondary column (hidden on smaller screens) */}
            {pageNavigation !== undefined && (
              <aside className="hidden lg:order-first lg:block lg:flex-shrink-0 relative h-full">
                <div className="relative flex h-full w-48 flex-col overflow-y-auto border-r border-gray-200">
                  <Sidebar name={name ?? ""} navigation={pageNavigation} />
                </div>
              </aside>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
