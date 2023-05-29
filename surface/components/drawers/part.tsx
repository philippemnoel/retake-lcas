import { useState, useEffect } from "react"
import {
  Button,
  Title,
  Text,
  Flex,
  TextInput,
  Divider,
  Icon,
  Bold,
  SelectBox,
  SelectBoxItem,
} from "@tremor/react"
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline"
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid"
import classNames from "classnames"

import ConnectedCombobox from "../inputs/connectedSelectBox"
import ConnectedMaterials from "@/components/inputs/connectedMaterials"

import { PartsData } from "lib/types/supabase-row.types"
import { regions } from "lib/calculator/factors"

type Props = {
  open: boolean
  onDismiss: () => void
  onSave: () => void
  data: Partial<PartsData> | undefined
  onChange: (data: Partial<PartsData>) => void
}

export default (props: Props) => {
  const [drawerHasOpenedOnce, setDrawerHasOpenedOnce] = useState(false)

  useEffect(() => {
    if (props.open) setDrawerHasOpenedOnce(true)
  }, [props.open])

  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-contact"
          className={classNames(
            "fixed top-0 left-0 z-40 h-screen py-4 px-6 overflow-y-hidden transition-transform w-80 bg-neutral-50 bg-opacity-70 backdrop-blur-md",
            props.open ? "translate-x-0" : "-translate-x-full"
          )}
          tabIndex={-1}
          aria-labelledby="drawer-contact-label"
        >
          <div className="text-left py-2 relative h-full">
            <div className="flex justify-between">
              <Flex spaceX="space-x-3" justifyContent="justify-start">
                <Icon
                  icon={Bars3BottomLeftIcon}
                  color="indigo"
                  variant="light"
                />
                <Title truncate={true}>New Item</Title>
              </Flex>
            </div>
            <Divider />
            <div className="max-h-[calc(100vh-12rem)] overflow-y-scroll">
              <Text color="indigo">
                <Bold>Required Fields</Bold>
              </Text>
              <Text truncate={true} marginTop="mt-2">
                <Bold>Identifier or SKU *</Bold>
              </Text>
              {props.data?.customer_part_id ? (
                <Text marginTop="mt-1">{props.data?.customer_part_id}</Text>
              ) : (
                <TextInput
                  marginTop="mt-1"
                  value={props.data?.customer_part_id?.toString() ?? ""}
                  onChange={(event) =>
                    props.onChange({ customer_part_id: event.target.value })
                  }
                  placeholder="SKU-123456"
                />
              )}
              <Text marginTop="mt-4">
                <Bold>Description *</Bold>
              </Text>
              <TextInput
                marginTop="mt-1"
                value={props.data?.part_description?.toString() ?? ""}
                onChange={(event) =>
                  props.onChange({ part_description: event.target.value })
                }
                placeholder="Steel Bar"
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
              <Text marginTop="mt-1">
                <Bold>Default Origin</Bold>
              </Text>
              {regions && (
                <SelectBox
                  marginTop="mt-1"
                  value={props.data?.origin}
                  onValueChange={(value) => props.onChange({ origin: value })}
                >
                  {regions?.map((region, index) => (
                    <SelectBoxItem
                      text={region.name}
                      value={region.name}
                      key={index}
                    />
                  ))}
                </SelectBox>
              )}
              <ConnectedMaterials
                data={props.data}
                onChange={props.onChange}
                marginTop="mt-4"
              />

              <Text marginTop="mt-4">
                <Bold>Suppliers</Bold>
              </Text>
              {drawerHasOpenedOnce && (
                <ConnectedCombobox
                  marginTop="mt-1"
                  endpoint="/api/bulk/suppliers"
                  selected={props.data?.supplier_ids ?? []}
                  onChange={(value) => props.onChange({ supplier_ids: value })}
                  keyField="id"
                  displayField="name"
                  placeholder="Type to search from suppliers"
                  multiple={true}
                />
              )}
              <div className="py-16"></div>
            </div>

            <div className="absolute bottom-0">
              <Flex spaceX="space-x-6">
                <Button
                  text="Save"
                  color="indigo"
                  disabled={[
                    props.data?.customer_part_id,
                    props.data?.part_description,
                  ].some((value) => value === undefined)}
                  onClick={() => {
                    props.onSave()
                    props.onDismiss()
                  }}
                />
                <Button
                  text="Close"
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
