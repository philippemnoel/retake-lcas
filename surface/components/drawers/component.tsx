import { useState, useEffect } from "react"
import {
  Bold,
  Button,
  Title,
  Text,
  Flex,
  TextInput,
  Divider,
  Icon,
  SelectBox,
  SelectBoxItem,
} from "@tremor/react"
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline"
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid"
import classNames from "classnames"
import uniq from "lodash.uniq"

import { regions } from "lib/calculator/factors"
import ConnectedCombobox from "../inputs/connectedSelectBox"
import ConnectedMaterials from "../inputs/connectedMaterials"
import NumberInput from "../inputs/number"
import {
  MaterialCompositionData,
  PartsData,
} from "lib/types/supabase-row.types"

type Props = {
  open: boolean
  isNewComponent: boolean
  onDismiss: () => void
  onSave: () => void
  onClickCreateSupplier: () => void
  partsData: Partial<PartsData> | undefined
  materialCompositionData: Partial<MaterialCompositionData> | undefined
  onChangeParts: (data: Partial<PartsData>) => void
  onChangeMaterialComposition: (data: Partial<MaterialCompositionData>) => void
  maxWeight?: number | undefined
}

export default (props: Props) => {
  const [drawerHasOpenedOnce, setDrawerHasOpenedOnce] = useState(false)
  const [partsValues, setPartsValues] = useState(props.partsData)
  const [materialCompositionValues, setMaterialCompositionValues] = useState(
    props.materialCompositionData
  )

  const canSave = partsValues?.is_base_material
    ? (materialCompositionValues?.weight_grams ?? 0) > 0
    : [partsValues?.customer_part_id, partsValues?.part_description].every(
        (value) => value !== undefined
      ) && (materialCompositionValues?.weight_grams ?? 0) > 0

  const regionOptions = uniq([
    ...regions.map((region) => region.name),
    ...(partsValues?.origin ? [partsValues.origin] : []),
  ])

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
    if (props.open) setDrawerHasOpenedOnce(true)
  }, [props.open])

  useEffect(() => {
    setPartsValues(props.partsData)
  }, [props.partsData])

  useEffect(() => {
    setMaterialCompositionValues(props.materialCompositionData)
  }, [props.materialCompositionData])

  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-contact"
          className={classNames(
            "fixed top-0 -right-96 z-40 h-screen py-4 px-6 overflow-y-auto transition-transform w-96 bg-neutral-50 bg-opacity-70 backdrop-blur",
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
            <div className="max-h-[calc(100vh-12rem)] overflow-y-scroll px-1">
              <Text color="indigo">
                <Bold>Required Fields</Bold>
              </Text>
              {!props.partsData?.is_base_material && (
                <>
                  <Text truncate={true} marginTop="mt-2">
                    <Bold>Identifier / SKU *</Bold>
                  </Text>
                  {!props.isNewComponent ? (
                    <Text marginTop="mt-1">
                      {partsValues?.customer_part_id}
                    </Text>
                  ) : (
                    <TextInput
                      marginTop="mt-1"
                      value={partsValues?.customer_part_id?.toString() ?? ""}
                      onChange={(event) =>
                        props.onChangeParts({
                          customer_part_id: event.target.value,
                        })
                      }
                      placeholder="SKU-123456"
                    />
                  )}
                  <Text marginTop="mt-4">
                    <Bold>Description *</Bold>
                  </Text>
                  <TextInput
                    marginTop="mt-1"
                    value={partsValues?.part_description?.toString() ?? ""}
                    onChange={(event) =>
                      props.onChangeParts({
                        part_description: event.target.value,
                      })
                    }
                    placeholder="Widget Subcomponent"
                  />
                </>
              )}
              <Text marginTop="mt-4">
                <Bold>Weight (grams) *</Bold>
              </Text>
              <NumberInput
                marginTop="mt-1"
                value={materialCompositionValues?.weight_grams ?? 0}
                onValueChange={(value) =>
                  props.onChangeMaterialComposition({ weight_grams: value })
                }
                hint={`grams (${Math.round(percentWeight)}%)`}
                maxValue={props.maxWeight}
              />
              <Divider />
              <Text color="indigo">
                <Flex>
                  <Bold>Optional Fields</Bold>
                  <Icon
                    icon={QuestionMarkCircleIcon}
                    color="indigo"
                    variant="simple"
                    tooltip="These fields are not required but will help Retake find a more precise emissions factor."
                  />
                </Flex>
              </Text>
              <ConnectedMaterials
                data={partsValues}
                onChange={props.onChangeParts}
                marginTop="mt-1"
              />
              <Text marginTop="mt-4">
                <Bold>Default Origin</Bold>
              </Text>
              <SelectBox
                marginTop="mt-1"
                onValueChange={(value: string) =>
                  props.onChangeParts({ origin: value })
                }
                value={partsValues?.origin ?? ""}
                placeholder="Type to search from list"
              >
                {
                  regionOptions.map((region, index) => (
                    <SelectBoxItem text={region} value={region} key={index} />
                  )) as any
                }
              </SelectBox>
              <Flex marginTop="mt-4">
                <Text>
                  <Bold>Suppliers</Bold>
                </Text>
                <Button
                  text="Create New Supplier"
                  variant="light"
                  color="indigo"
                  onClick={() => {
                    // This is a workaround until we can build a more effective drawer/data abstraction.
                    // When a new supplier is created, the ConnectedCombobox will be out of date.
                    // The user probably won't know to refresh the page to see the new data, so we'll
                    // manually invalidate the ConnectedCombobox cache here, forcing a reload when they
                    // reopen the component drawer.
                    setDrawerHasOpenedOnce(false)
                    props.onClickCreateSupplier()
                  }}
                />
              </Flex>
              {drawerHasOpenedOnce && (
                <ConnectedCombobox
                  marginTop="mt-1"
                  endpoint="/api/bulk/suppliers"
                  selected={partsValues?.supplier_ids ?? []}
                  onChange={(value) =>
                    props.onChangeParts({ supplier_ids: value })
                  }
                  keyField="id"
                  displayField="name"
                  placeholder="Type to search from suppliers"
                  multiple={true}
                />
              )}
            </div>
            <div className="absolute bottom-0 w-full">
              <Divider />
              <Flex spaceX="space-x-4">
                <Button
                  text="Save"
                  color="indigo"
                  disabled={!canSave}
                  onClick={() => {
                    if (partsValues && materialCompositionValues) {
                      props.onSave()
                      props.onDismiss()
                    }
                  }}
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
