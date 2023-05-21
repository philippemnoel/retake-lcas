import { Flex, Button, Toggle, ToggleItem, Badge } from "@tremor/react"
import { ChevronLeftIcon } from "@heroicons/react/20/solid"
import { useRouter } from "next/router"

import Playground from "../drawers/playground"
import { useAppState } from "../hooks/state"
import { isDevelopment } from "lib/utils"

export default () => {
  const { playgroundOpen: open, setPlaygroundOpen: setOpen } = useAppState()
  const router = useRouter()

  return (
    <div className="fixed top-3 w-full lg:w-[calc(100%-8rem)]">
      <Flex>
        <Button
          icon={ChevronLeftIcon}
          variant="light"
          color="stone"
          onClick={() => router.push("/data/products")}
          marginTop={isDevelopment ? "mt-0" : "mt-2"}
        >
          Go Back
        </Button>
        {isDevelopment && (
          <Flex justifyContent="justify-end" spaceX="space-x-4">
            {open && (
              <Badge
                text="Scenario Mode"
                color="indigo"
                tooltip="Use Scenario Mode to model hypothetical changes to this
            product&lsquo;s material composition, manufacturing, or lifecycle and see the expected impact."
              />
            )}
            <Toggle color="zinc" defaultValue={false} value={open}>
              <div onClick={() => setOpen(false)}>
                <ToggleItem value={false} text="Live" />
              </div>
              <Playground
                button={<ToggleItem value={true} text="Scenario" />}
                width="w-screen"
              />
            </Toggle>
          </Flex>
        )}
      </Flex>
    </div>
  )
}
