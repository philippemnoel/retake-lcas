import {
  Button,
  Title,
  Text,
  Flex,
  Bold,
  Divider,
  Icon,
  ColGrid,
  Col,
  TextInput,
  SelectBox,
  SelectBoxItem,
} from "@tremor/react"
import { BuildingOfficeIcon } from "@heroicons/react/24/outline"
import classNames from "classnames"
import uniqBy from "lodash.uniqby"

import { grids } from "lib/calculator/factors"
import NumberInput from "../inputs/number"
import { Database } from "lib/types/database.types"

export type Data =
  Database["public"]["Views"]["cml_facility_energy_with_impacts"]["Row"]

type Props = {
  open: boolean
  data?: Partial<Data>
  canSave: boolean
  onChange: <K extends keyof Partial<Data>>(key: K, value?: Data[K]) => void
  onSave: () => void
  onDismiss: () => void
}

export default (props: Props) => {
  const { data } = props
  const defaultYear = new Date().getFullYear() - 1

  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-facilities"
          className={classNames(
            "fixed top-0 left-0 z-40 h-screen py-4 px-6 overflow-y-auto transition-transform w-[50rem] bg-neutral-50 bg-opacity-70 backdrop-blur-md",
            props.open ? "translate-x-0" : "-translate-x-full"
          )}
          tabIndex={-1}
          aria-labelledby="drawer-facilities-label"
        >
          <div className="text-left py-2 relative h-full">
            <Flex justifyContent="justify-start" spaceX="space-x-3">
              <Icon icon={BuildingOfficeIcon} color="indigo" variant="light" />
              <Title>Facility</Title>
            </Flex>
            <Divider />
            <ColGrid numCols={6} gapY="gap-y-6" gapX="gap-x-4">
              <Col numColSpan={4}>
                <Text marginTop="mt-2">
                  <Bold>Facility Name *</Bold>
                </Text>
              </Col>
              <Col numColSpan={2}>
                <TextInput
                  value={data?.name ?? ""}
                  onChange={(event) =>
                    props.onChange("name", event.target.value)
                  }
                />
              </Col>
              <Col numColSpan={4}>
                <Text truncate={true} marginTop="mt-2.5">
                  <Bold>Facility Location *</Bold>
                </Text>
              </Col>
              <Col numColSpan={2}>
                <SelectBox
                  onValueChange={(value) => props.onChange("location", value)}
                  value={data?.location}
                  placeholder={data?.location ?? undefined}
                >
                  {
                    uniqBy(grids, "name").map((grid, index) => (
                      <SelectBoxItem
                        key={index}
                        text={grid.name}
                        value={grid.name}
                      />
                    )) as any
                  }
                </SelectBox>
              </Col>
              <Col numColSpan={4}>
                <Text truncate={true} marginTop="mt-2">
                  <Bold>Natural gas</Bold> (MJ) consumed by this facility in{" "}
                  {defaultYear}
                </Text>
              </Col>
              <Col numColSpan={2}>
                <NumberInput
                  value={data?.quantity_mj ?? undefined}
                  onValueChange={(value) =>
                    props.onChange("quantity_mj", value)
                  }
                  hint="MJ"
                />
              </Col>
              <Col numColSpan={4}>
                <Text truncate={true} marginTop="mt-2">
                  <Bold>Energy</Bold> (kWh) consumed by this facility in{" "}
                  {defaultYear}
                </Text>
              </Col>
              <Col numColSpan={2}>
                <NumberInput
                  value={data?.quantity_kwh ?? undefined}
                  onValueChange={(value) =>
                    props.onChange("quantity_kwh", value)
                  }
                  hint="kWh"
                />
              </Col>
              <Col numColSpan={4}>
                <Text truncate={true} marginTop="mt-2">
                  <Bold>% renewable energy</Bold> (from power purchase agreement
                  or on-site solar)
                </Text>
              </Col>
              <Col numColSpan={2}>
                <NumberInput
                  value={data?.percent_renewable ?? undefined}
                  onValueChange={(value) =>
                    props.onChange("percent_renewable", value)
                  }
                  hint="%"
                />
              </Col>
            </ColGrid>
            <div className="absolute bottom-0">
              <Flex spaceX="space-x-4">
                <Button
                  text="Save"
                  color="indigo"
                  disabled={!props.canSave}
                  onClick={() => props.onSave()}
                />
                <Button
                  text="Cancel"
                  color="indigo"
                  variant="light"
                  onClick={() => props.onDismiss()}
                />
              </Flex>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
