import { useState, useEffect } from "react"
import {
  Button,
  Text,
  Dropdown,
  DropdownItem,
  Flex,
  Icon,
  Title,
  Divider,
  SelectBox,
  SelectBoxItem,
  Bold,
} from "@tremor/react"
import classNames from "classnames"
import { ArrowPathIcon } from "@heroicons/react/24/outline"
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid"

import NumberInput from "../inputs/number"
import { regions } from "lib/calculator/factors"
import disposal, { Disposal } from "lib/calculator/disposal"
import { EndOfLifeWithImpacts } from "lib/types/calculator.types"

export default ({
  open,
  setOpen,
  onSave,
  defaults,
  totalWeight,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  onSave: (value: Partial<EndOfLifeWithImpacts>) => void
  defaults: Partial<EndOfLifeWithImpacts> | undefined
  totalWeight: number
}) => {
  const [values, setValues] = useState(defaults)
  const [percent, setPercent] = useState(
    ((defaults?.weight_grams ?? 0) * 100) / totalWeight
  )

  const canSave =
    values?.description !== null &&
    percent > 0 &&
    (values?.description === Disposal.GENERAL
      ? (values?.location ?? "") !== ""
      : true)

  const onChange = (key: keyof EndOfLifeWithImpacts, value: any) => {
    setValues({ ...values, [key]: value })
  }

  useEffect(() => {
    setValues(defaults)
    setPercent(((defaults?.weight_grams ?? 0) * 100) / totalWeight)
    if (defaults?.location === undefined) onChange("location", "Global")
  }, [defaults])

  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-contact"
          className={classNames(
            "fixed top-0 -right-96 z-40 h-screen py-4 px-6 overflow-y-auto transition-transform w-96 bg-neutral-50 bg-opacity-70 backdrop-blur-md",
            open ? "-translate-x-full" : "-translate-x-0"
          )}
          tabIndex={-1}
          aria-labelledby="drawer-contact-label"
        >
          <div className="text-left py-2 relative h-full">
            <Flex justifyContent="justify-start" spaceX="space-x-3">
              <Icon icon={ArrowPathIcon} color="indigo" variant="light" />
              <Title>Disposal Activity</Title>
            </Flex>
            <Divider />
            <Text>
              <Flex>
                <Bold>Disposal Type *</Bold>
                <Icon
                  icon={QuestionMarkCircleIcon}
                  color="indigo"
                  variant="simple"
                  tooltip="If unknown, choose 'General Waste / Unknown' and provide a location, and Retake will automatically apply a regional average of disposal types."
                />
              </Flex>
            </Text>
            <Dropdown
              value={values?.description}
              onValueChange={(value) => onChange("description", value)}
            >
              {
                disposal?.map((item, index) => (
                  <DropdownItem
                    text={item.name}
                    value={item.name}
                    key={index}
                  />
                )) as any
              }
            </Dropdown>
            <Text marginTop="mt-4">
              <Bold>Percent Disposed this Way *</Bold>
            </Text>
            <NumberInput
              value={percent}
              onValueChange={(value) => setPercent(value)}
              marginTop="mt-1"
              maxValue={100}
              hint="%"
            />
            <Text marginTop="mt-4">
              <Bold>Disposal Location</Bold>
            </Text>
            <SelectBox
              defaultValue={values?.location}
              marginTop="mt-1"
              value={values?.location}
              onValueChange={(value) => onChange("location", value)}
              placeholder="Type to select from list"
            >
              {
                regions?.map((region, index) => (
                  <SelectBoxItem
                    text={region.name}
                    value={region.name}
                    key={index}
                  />
                )) as any
              }
            </SelectBox>
            <div className="absolute bottom-0">
              <Flex spaceX="space-x-4">
                <Button
                  text="Save"
                  color="indigo"
                  disabled={!canSave}
                  onClick={() => {
                    onSave({
                      ...values,
                      weight_grams: (totalWeight * percent) / 100,
                    })
                    setOpen(false)
                  }}
                />
                <Button
                  text="Cancel"
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
