import {
  Button,
  Title,
  Text,
  Flex,
  Divider,
  Icon,
  SelectBox,
  SelectBoxItem,
  Bold,
} from "@tremor/react"
import { PlusCircleIcon } from "@heroicons/react/24/outline"
import classNames from "classnames"

import NumberInput from "../inputs/number"
import { regions } from "lib/calculator/factors"
import { UseType } from "lib/types/supabase-row.types"
import { UsePhaseWithImpacts } from "lib/types/calculator.types"

const EnergyUseTypes: [string, UseType][] = [
  ["Water", "WATER"],
  ["Petrol / Gasoline", "PETROL"],
  ["Electricity", "ELECTRICITY"],
  ["Natural Gas", "NATURAL_GAS"],
]

const EnergyUseUnits: Record<UseType, string> = {
  WATER: "kg",
  NATURAL_GAS: "MJ",
  PETROL: "kg",
  ELECTRICITY: "kWh",
}

type Props = {
  open: boolean
  data?: Partial<UsePhaseWithImpacts>
  canSave?: boolean
  onChange?: <K extends keyof Partial<UsePhaseWithImpacts>>(
    key: K,
    value?: UsePhaseWithImpacts[K]
  ) => void
  onSave?: () => void
  onDismiss?: () => void
  serviceLifeUnit: string
}

export default (props: Props) => {
  const { data } = props

  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-contact"
          className={classNames(
            "fixed top-0 -right-96 z-40 h-screen py-4 px-6 overflow-y-auto transition-transform w-96 bg-neutral-50 bg-opacity-70 backdrop-blur-md",
            props.open ? "-translate-x-full" : "-translate-x-0"
          )}
          tabIndex={-1}
          aria-labelledby="drawer-contact-label"
        >
          <div className="text-left py-2 relative h-full">
            <Flex justifyContent="justify-start" spaceX="space-x-3">
              <Icon icon={PlusCircleIcon} color="indigo" variant="light" />
              <Title>Use Phase</Title>
            </Flex>
            <Divider />
            <Text truncate={true} marginTop="mt-1">
              <Bold>Resource Consumed *</Bold>
            </Text>
            <SelectBox
              marginTop="mt-1"
              value={data?.use_type ?? null}
              onValueChange={(value) => props.onChange?.("use_type", value)}
            >
              {EnergyUseTypes.map(([label, value]) => (
                <SelectBoxItem text={label} value={value} key={label} />
              ))}
            </SelectBox>
            <Text truncate={true} marginTop="mt-4">
              <Bold>
                {data?.use_type
                  ? `${EnergyUseUnits[data.use_type]} per ${
                      props.serviceLifeUnit
                    } *`
                  : "Quantity *"}
              </Bold>
            </Text>
            <NumberInput
              value={data?.quantity ?? 0}
              onValueChange={(value) => props.onChange?.("quantity", value)}
              marginTop="mt-1"
              maxValue={100}
            />
            <Text marginTop="mt-4">
              <Bold>Location *</Bold>
            </Text>
            <SelectBox
              marginTop="mt-1"
              placeholder={data?.location ?? undefined}
              value={data?.location ?? null}
              onValueChange={(value) => props.onChange?.("location", value)}
            >
              {regions.map(({ name }) => (
                <SelectBoxItem text={name} value={name} key={name} />
              ))}
            </SelectBox>
            {data?.location && data?.location !== "Global" && (
              <>
                <Text marginTop="mt-4">
                  <Bold>Percent Used at This Location</Bold>
                </Text>
                <NumberInput
                  marginTop="mt-1"
                  value={data?.percent_at_location ?? 100}
                  onValueChange={(value) =>
                    props.onChange?.("percent_at_location", value)
                  }
                  hint="%"
                  maxValue={100}
                  placeholder="Default: 100%"
                />
              </>
            )}
            <div className="absolute bottom-0">
              <Flex spaceX="space-x-4">
                <Button
                  text="Save"
                  color="indigo"
                  disabled={!(props.canSave ?? true)}
                  onClick={() => props.onSave?.()}
                />
                <Button
                  text="Cancel"
                  color="indigo"
                  variant="light"
                  onClick={() => props.onDismiss?.()}
                />
              </Flex>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
