import { useState, useEffect } from "react"
import { Bold, Button, Title, Text, Flex, Divider, Icon } from "@tremor/react"
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline"
import classNames from "classnames"

import NumberInput from "@/components/inputs/number"
import ConnectedCombobox from "@/components/inputs/connectedSelectBox"

import {
  PartsData,
  MaterialCompositionData,
} from "lib/types/supabase-row.types"

type Props = {
  open: boolean
  canSave: boolean
  partsData?: Partial<PartsData>
  materialCompositionData?: Partial<MaterialCompositionData>
  onChangeParts: (data: Partial<PartsData>) => void
  onChangeMaterialComposition: (data: Partial<MaterialCompositionData>) => void
  onSave: () => void
  onDismiss: () => void
  onCreate: () => void
  maxWeight?: number | null
}

export default (props: Props) => {
  const { open: isOpen } = props
  const [drawerHasOpenedOnce, setDrawerHasOpenedOnce] = useState(false)

  const percentWeight = props.maxWeight
    ? ((props.materialCompositionData?.weight_grams || 0) * 100) /
      props.maxWeight
    : 0

  useEffect(() => {
    // On the first render, the "connected" child components will load their data.
    // When this useEffect fires for the first time, the loading will have been initialized.
    // We want to delay loading until the first time the drawer opens, because it's expected
    // that the dataset that will load will be large.

    // We set this flag to false to avoid loading again on subsequent renders.
    // The component would need to be re-mounted to reload data, or more likely we should
    // expect the user to just refresh the page.
    if (isOpen) setDrawerHasOpenedOnce(true)
  }, [isOpen])

  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-contact"
          className={classNames(
            "fixed top-0 -right-96 z-40 h-screen py-4 px-6 overflow-y-auto transition-transform w-96 bg-neutral-50",
            props.open ? "-translate-x-full" : "-translate-x-0"
          )}
          tabIndex={-1}
          aria-labelledby="drawer-contact-label"
        >
          <div className="text-left py-2 relative h-full">
            <Flex justifyContent="justify-start" spaceX="space-x-3">
              <Icon icon={Bars3BottomLeftIcon} color="indigo" variant="light" />
              <Title>Component</Title>
            </Flex>
            <Divider />

            <Flex>
              <Text truncate={true}>
                <Bold>Component *</Bold>
              </Text>
              <Button
                text="Create New"
                variant="light"
                color="indigo"
                onClick={() => {
                  // This is a workaround until we can build a more effective drawer/data abstraction.
                  // When a new part is created, the ConnectedCombobox will be out of date.
                  // The user probably won't know to refresh the page to see the new data, so we'll
                  // manually invalidate the ConnectedCombobox cache here, forcing a reload when they
                  // reopen the component drawer.
                  setDrawerHasOpenedOnce(false)
                  props.onCreate()
                }}
              />
            </Flex>
            {drawerHasOpenedOnce && (
              <ConnectedCombobox
                endpoint="/api/bulk/parts"
                selected={
                  props.partsData?.retake_part_id
                    ? [props.partsData.retake_part_id]
                    : []
                }
                onChange={(value) =>
                  props.onChangeParts({ retake_part_id: value[0] })
                }
                placeholder="Type to search from parts"
                keyField="retake_part_id"
                displayField="part_description"
              />
            )}
            <Text marginTop="mt-4">
              <Bold>Weight (Grams) *</Bold>
            </Text>
            <NumberInput
              marginTop="mt-1"
              value={props.materialCompositionData?.weight_grams ?? 0}
              onValueChange={(value) =>
                props.onChangeMaterialComposition({ weight_grams: value })
              }
              hint={`grams (${Math.round(percentWeight)}%)`}
              maxValue={props.maxWeight ?? undefined}
            />
            <div className="absolute bottom-0">
              <Flex spaceX="space-x-4">
                <Button
                  text="Save"
                  color="indigo"
                  disabled={!props.canSave}
                  onClick={props.onSave}
                />
                <Button
                  text="Cancel"
                  color="indigo"
                  variant="light"
                  onClick={props.onDismiss}
                />
              </Flex>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
