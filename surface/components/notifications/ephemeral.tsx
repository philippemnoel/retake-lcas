import { useEffect, Fragment } from "react"
import { Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/20/solid"
import classNames from "classnames"

export default (props: {
  title: string
  description: string
  icon: (
    props: React.SVGProps<SVGSVGElement> & {
      title?: string | undefined
      titleId?: string | undefined
    }
  ) => JSX.Element
  show: boolean
  setShow: (show: boolean) => void
  color: string
  shouldDisappear?: boolean
}) => {
  const { title, description, show, setShow, color, shouldDisappear } = props

  useEffect(() => {
    if (show && shouldDisappear) {
      const timeout = setTimeout(() => setShow(false), 3000)
      return () => clearTimeout(timeout)
    }
  }, [show])

  return (
    <div
      aria-live="assertive"
      className={classNames(
        show ? "opacity-100" : "opacity-0",
        "z-50 pointer-events-none fixed inset-0 flex items-start px-4 py-6 sm:items-start sm:p-6 duration-1000 border border-white"
      )}
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <Transition
          show={show}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white bg-opacity-95 shadow-lg">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <props.icon
                    className={classNames("h-6 w-6", color)}
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{title}</p>
                  <p className="mt-1 text-sm text-gray-600">{description}</p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => {
                      setShow(false)
                    }}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  )
}
