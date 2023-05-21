import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Button, Text, Title, Flex, Icon } from "@tremor/react"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"

export default ({
  open,
  onDismiss,
  onContinue,
}: {
  open: boolean
  onDismiss: () => void
  onContinue: () => void
}) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onDismiss}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Flex justifyContent="justify-start" spaceX="space-x-3">
                  <Icon
                    icon={ExclamationTriangleIcon}
                    variant="light"
                    color="rose"
                  />
                  <Title>Mark As Incomplete</Title>
                </Flex>
                <Text marginTop="mt-4">
                  This section has been marked as complete. By clicking
                  Continue, you are confirming that this section is not yet
                  complete.
                </Text>
                <Button
                  text="Continue"
                  color="rose"
                  marginTop="mt-6"
                  onClick={() => {
                    onContinue()
                    onDismiss()
                  }}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
