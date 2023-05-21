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
  Dropdown,
  DropdownItem,
} from "@tremor/react"
import { ArrowPathIcon } from "@heroicons/react/24/outline"
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid"
import classNames from "classnames"
import uniq from "lodash.uniq"

import NumberInput from "../inputs/number"
import { ServiceLifeData } from "lib/types/supabase-row.types"

type Props = {
  open: boolean
  data?: Partial<ServiceLifeData>
  canSave?: boolean
  onChange?: <K extends keyof Partial<ServiceLifeData>>(
    key: K,
    value?: ServiceLifeData[K]
  ) => void
  onSave?: () => void
  onDismiss?: () => void
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
              <Icon icon={ArrowPathIcon} color="indigo" variant="light" />
              <Title>Use Phase</Title>
            </Flex>
            <Divider />
            <Text truncate={true} marginTop="mt-1">
              <Flex>
                <Bold>Has Use Phase *</Bold>
                <Icon
                  icon={QuestionMarkCircleIcon}
                  color="indigo"
                  variant="simple"
                  tooltip="Most products do not have a use phase for an LCA. Answer YES only if this product consumes electricity (i.e. plugs into a wall or uses batteries), gasoline, water, or natural gas during its service life."
                />
              </Flex>
            </Text>
            <Dropdown
              value={data?.has_use_phase ? "Yes" : "No"}
              onValueChange={(value) => {
                props.onChange?.("has_use_phase", value === "Yes")
              }}
            >
              <DropdownItem value={"No"} text="No" />
              <DropdownItem value={"Yes"} text="Yes" />
            </Dropdown>
            {data?.has_use_phase && (
              <>
                <Text marginTop="mt-4">
                  <Bold>Service Life Unit</Bold>
                </Text>
                <SelectBox
                  marginTop="mt-1"
                  onValueChange={(value) => props.onChange?.("unit", value)}
                  value={data?.unit}
                >
                  {
                    uniq([
                      ...(data?.unit ? [data.unit] : []),
                      "Years",
                      "Hours",
                      "Kilometers",
                      "Miles",
                    ]).map((unit, index) => (
                      <SelectBoxItem text={unit} value={unit} key={index} />
                    )) as any
                  }
                </SelectBox>
                <Text truncate={true} marginTop="mt-4">
                  <Bold>Service Life Quantity</Bold>
                </Text>
                <NumberInput
                  value={data?.quantity ?? 0}
                  onValueChange={(value) => props.onChange?.("quantity", value)}
                  marginTop="mt-1"
                  hint={data?.unit ?? ""}
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
