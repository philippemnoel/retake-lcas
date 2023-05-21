import {
  Button,
  Flex,
  BadgeDelta,
  Card,
  Text,
  TextInput,
  Bold,
} from "@tremor/react"

import React from "react"
import { useAppState } from "../hooks/state"

export default ({ button, width }: { button: JSX.Element; width: string }) => {
  const { playgroundOpen: open, setPlaygroundOpen: setOpen } = useAppState()

  return (
    <>
      {/* drawer init and show */}
      <div onClick={() => setOpen(true)}>{button}</div>

      {/* drawer component */}
      <div
        id="drawer-contact"
        className={`bg-transparent fixed bottom-0 left-0 z-40 p-4 transition-transform w-screen h-44 ${
          open ? "translate-y-0" : "translate-y-full"
        } bg-white ${width}`}
        tabIndex={-1}
        aria-labelledby="drawer-contact-label"
      >
        <div className="text-left py-2 relative h-full">
          <Flex>
            <div className="bg-neutral-100 p-4 rounded-lg mx-auto">
              <Card maxWidth="max-w-sm" shadow={false}>
                <Flex justifyContent="justify-start" spaceX="space-x-4">
                  <Text>
                    <Bold>Global Warming Change </Bold>
                  </Text>
                  <BadgeDelta
                    deltaType="unchanged"
                    text="0 kg CO2 eq"
                    size="xs"
                    marginTop="mt-1"
                  />
                </Flex>
                <Flex
                  justifyContent="justify-start"
                  spaceX="space-x-4"
                  marginTop="mt-4"
                >
                  <TextInput
                    placeholder="Scenario Name"
                    defaultValue="Scenario #1"
                    maxWidth="max-w-xs"
                  />
                  <Button text="Save Scenario" color="indigo"></Button>
                </Flex>
              </Card>
            </div>
          </Flex>
        </div>
      </div>
    </>
  )
}
