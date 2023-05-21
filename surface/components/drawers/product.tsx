import { useState, useEffect } from "react"
import {
  Bold,
  Button,
  Text,
  TextInput,
  Flex,
  Icon,
  Divider,
  Title,
} from "@tremor/react"
import classNames from "classnames"
import { Square3Stack3DIcon } from "@heroicons/react/24/outline"

import NumberInput from "../inputs/number"
import { CMLTotalResultsData } from "lib/types/supabase-row.types"

export default ({
  open,
  setOpen,
  defaults,
  onSave,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  defaults: Partial<CMLTotalResultsData> | undefined
  onSave: (value: Partial<CMLTotalResultsData> | undefined) => Promise<void>
}) => {
  const [values, setValues] = useState(defaults)

  const onChange = (key: keyof CMLTotalResultsData, value: any) => {
    const clonedValues = { ...values } ?? {}
    clonedValues[key] = value
    setValues(clonedValues)
  }

  useEffect(() => {
    setValues(defaults)
  }, [defaults])

  return (
    <>
      <div
        id="drawer-contact"
        className={classNames(
          "bg-neutral-50 bg-opacity-70 backdrop-blur-md fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto transition-transform w-80",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        tabIndex={-1}
        aria-labelledby="drawer-contact-label"
      >
        <div className="text-left py-2 relative h-full">
          <Flex justifyContent="justify-start" spaceX="space-x-3">
            <Icon icon={Square3Stack3DIcon} color="indigo" variant="light" />
            <Title>Product</Title>
          </Flex>
          <Divider />
          <Text>
            <Bold>Identifier / SKU *</Bold>
          </Text>
          {defaults?.customer_part_id ? (
            <Text marginTop="mt-1">{defaults?.customer_part_id}</Text>
          ) : (
            <TextInput
              marginTop="mt-1"
              placeholder="SKU-123"
              value={values?.customer_part_id ?? ""}
              onChange={(event) =>
                onChange("customer_part_id", event.target.value)
              }
            />
          )}
          <Text marginTop="mt-4">
            <Bold>Product Name *</Bold>
          </Text>
          <TextInput
            placeholder="Example Widget"
            marginTop="mt-1"
            value={values?.part_description ?? ""}
            onChange={(event) =>
              onChange("part_description", event.target.value)
            }
          />
          <Text marginTop="mt-4">
            <Bold>Declared Unit Weight (Grams) *</Bold>
          </Text>
          <NumberInput
            value={values?.weight_grams ?? 0}
            onValueChange={(value) => onChange("weight_grams", value)}
            hint="grams"
            marginTop="mt-1"
          />
          <div className="absolute bottom-0">
            <Flex spaceX="space-x-4">
              <Button
                text="Save"
                color="indigo"
                onClick={() => onSave(values)}
                disabled={[
                  values?.customer_part_id,
                  values?.part_description,
                  values?.weight_grams,
                ].some((value) => value === undefined)}
              />
              <Button
                text="Cancel"
                variant="light"
                color="indigo"
                onClick={() => setOpen(false)}
              />
            </Flex>
          </div>
        </div>
      </div>
    </>
  )
}
