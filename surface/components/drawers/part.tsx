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
  MultiSelectBox,
} from "@tremor/react"
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline"
import classNames from "classnames"

import { PartsData, SupplierData } from "lib/types/supabase-row.types"
import { regions } from "lib/calculator/factors"
import materials from "lib/calculator/materials"

export default ({
  open,
  setOpen,
  onSave,
  data,
  suppliers,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  onSave: (value: Partial<PartsData>) => void
  data: Partial<PartsData> | undefined
  suppliers: Array<SupplierData> | undefined
}) => {
  const [values, setValues] = useState(data)

  const onChange = (key: keyof PartsData, value: any) => {
    const clonedValues = { ...values } ?? {}
    clonedValues[key] = value
    setValues(clonedValues)
  }

  const hasCustomerPartId = !(data?.primary_material && !data?.customer_part_id)

  useEffect(() => {
    setValues(data)
  }, [data])

  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-contact"
          className={classNames(
            "fixed top-0 left-0 z-40 h-screen py-4 px-6 overflow-y-hidden transition-transform w-80 bg-neutral-50 bg-opacity-70 backdrop-blur-md",
            open ? "translate-x-0" : "-translate-x-full"
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
            <Text truncate={true}>
              <Bold>Identifier or SKU *</Bold>
            </Text>
            {data?.customer_part_id ? (
              <Text marginTop="mt-1">{values?.customer_part_id}</Text>
            ) : (
              <TextInput
                marginTop="mt-1"
                value={values?.customer_part_id?.toString() ?? ""}
                onChange={(event) =>
                  onChange("customer_part_id", event.target.value)
                }
                placeholder="SKU-123456"
              />
            )}
            <Text marginTop="mt-4">
              <Bold>Description *</Bold>
            </Text>
            <TextInput
              marginTop="mt-1"
              value={values?.part_description?.toString() ?? ""}
              onChange={(event) =>
                onChange("part_description", event.target.value)
              }
              placeholder="Steel Bar"
            />
            <Text marginTop={hasCustomerPartId ? "mt-4" : "mt-0"}>
              <Bold>Default Origin</Bold>
            </Text>
            {regions && (
              <SelectBox
                marginTop="mt-1"
                value={values?.origin}
                onValueChange={(value) => onChange("origin", value)}
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
            <Text marginTop="mt-4">
              <Flex>
                <Bold>Material</Bold>
                {values?.primary_material && (
                  <Button
                    text="Remove"
                    color="indigo"
                    variant="light"
                    onClick={() => {
                      onChange("primary_material", null)
                    }}
                  />
                )}
              </Flex>
            </Text>
            <SelectBox
              marginTop="mt-1"
              onValueChange={(value) => onChange("primary_material", value)}
              value={values?.primary_material}
              placeholder="Optional"
            >
              {
                materials?.map((material, index) => (
                  <SelectBoxItem text={material} value={material} key={index} />
                )) as any
              }
            </SelectBox>
            {suppliers && (
              <>
                <Text marginTop="mt-4">
                  <Bold>Suppliers</Bold>
                </Text>
                <MultiSelectBox
                  marginTop="mt-1"
                  value={values?.supplier_ids ?? []}
                  onValueChange={(value) => {
                    onChange("supplier_ids", value)
                  }}
                >
                  {
                    suppliers?.map((supplier, index) => (
                      <SelectBoxItem
                        text={supplier.name ?? ""}
                        value={supplier.id}
                        key={index}
                      />
                    )) as any
                  }
                </MultiSelectBox>
              </>
            )}
            <div className="absolute bottom-0">
              <Flex spaceX="space-x-6">
                <Button
                  text="Save"
                  color="indigo"
                  disabled={[
                    values?.customer_part_id,
                    values?.part_description,
                  ].some((value) => value === undefined)}
                  onClick={() => {
                    onSave({
                      ...values,
                    })
                    setOpen(false)
                  }}
                />
                <Button
                  text="Close"
                  color="indigo"
                  variant="light"
                  onClick={() => setOpen(false)}
                />
              </Flex>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
