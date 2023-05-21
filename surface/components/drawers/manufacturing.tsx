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
  Dropdown,
  DropdownItem,
} from "@tremor/react"
import {
  BuildingOfficeIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline"
import classNames from "classnames"

import NumberInput from "@/components/inputs/number"

import { ManufacturingWithImpacts } from "lib/types/calculator.types"
import { FacilityEnergyWithImpactsData } from "lib/types/supabase-row.types"

type Props = {
  open: boolean
  onDismiss: () => void
  onSave: () => void
  onChange: (value: Partial<ManufacturingWithImpacts>) => void
  onClickCreateNew: () => void
  data?: Partial<ManufacturingWithImpacts>
  facilitiesData?: Array<FacilityEnergyWithImpactsData>
}

export default (props: Props) => {
  const defaultYear = new Date().getFullYear() - 1
  const facility = props.facilitiesData?.find(
    ({ id }) => props.data?.facility_id && id === props.data.facility_id
  )

  const canSave =
    props.data?.facility_id &&
    props.data?.percent_revenue &&
    props.data?.quantity_produced

  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-contact"
          className={classNames(
            "fixed top-0 -right-[50rem] z-40 h-screen py-4 px-6 overflow-y-auto transition-transform w-[50rem] bg-neutral-50",
            props.open ? "-translate-x-full" : "-translate-x-0"
          )}
          tabIndex={-1}
          aria-labelledby="drawer-contact-label"
        >
          <div className="text-left py-2 relative h-full">
            <Flex>
              <Flex justifyContent="justify-start" spaceX="space-x-3">
                <Icon
                  icon={BuildingOfficeIcon}
                  color="indigo"
                  variant="light"
                />
                <Title>Manufacturing</Title>
              </Flex>
              <Button
                icon={PencilSquareIcon}
                text="Create New Facility"
                variant="light"
                color="indigo"
                onClick={props.onClickCreateNew}
              />
            </Flex>
            <Divider />
            <ColGrid numCols={6} gapY="gap-y-6" gapX="gap-x-4">
              <Col numColSpan={4}>
                <Text marginTop="mt-2">
                  <Bold>Facility Name</Bold>
                </Text>
              </Col>
              <Col numColSpan={2}>
                <Dropdown
                  marginTop="mt-1"
                  onValueChange={(value) =>
                    props.onChange({ facility_id: value })
                  }
                  value={props.data?.facility_id ?? null}
                >
                  {
                    (props.facilitiesData ?? []).map((facility) => (
                      <DropdownItem
                        key={facility.id}
                        text={facility.name ?? ""}
                        value={facility.id}
                      />
                    )) as any
                  }
                </Dropdown>
              </Col>
              <Col numColSpan={4}>
                <Text truncate={true} marginTop="mt-0">
                  <Bold>Facility Location</Bold>
                </Text>
              </Col>
              <Col numColSpan={2}>
                <Text>{facility?.location}</Text>
              </Col>
              <Col numColSpan={4}>
                <Text truncate={true} marginTop="mt-2">
                  <Bold>Natural gas</Bold> (MJ) consumed by this facility in{" "}
                  {defaultYear}
                </Text>
              </Col>
              <Col numColSpan={2}>
                <Text marginTop="mt-2">{facility?.quantity_mj}</Text>
              </Col>
              <Col numColSpan={4}>
                <Text truncate={true} marginTop="mt-2">
                  <Bold>Energy</Bold> (kWh) consumed by this facility in{" "}
                  {defaultYear}
                </Text>
              </Col>
              <Col numColSpan={2}>
                <Text marginTop="mt-2">{facility?.quantity_kwh}</Text>
              </Col>
              <Col numColSpan={4}>
                <Text truncate={true} marginTop="mt-2">
                  <Bold>% renewable energy</Bold> (from power purchase agreement
                  or on-site solar)
                </Text>
              </Col>
              <Col numColSpan={2}>
                <Text marginTop="mt-2">
                  {facility?.percent_renewable ?? 0} %
                </Text>
              </Col>
              <Col numColSpan={4}>
                <Text marginTop="mt-2">
                  <Bold>Percent of this facility&apos;s revenue</Bold> from
                  sales of this product in {defaultYear}
                </Text>
              </Col>
              <Col numColSpan={2}>
                <NumberInput
                  value={props.data?.percent_revenue ?? undefined}
                  onValueChange={(value) =>
                    props.onChange({ percent_revenue: value })
                  }
                  maxValue={100}
                  hint="%"
                />
              </Col>
              <Col numColSpan={4}>
                <Text truncate={true} marginTop="mt-2">
                  <Bold>Units of this product</Bold> produced by this facility
                  in {defaultYear}
                </Text>
              </Col>
              <Col numColSpan={2}>
                <NumberInput
                  value={props.data?.quantity_produced ?? undefined}
                  onValueChange={(value) =>
                    props.onChange({ quantity_produced: value })
                  }
                  hint="units"
                />
              </Col>
            </ColGrid>
            <div className="absolute bottom-0">
              <Flex spaceX="space-x-4">
                <Button
                  text="Save"
                  color="indigo"
                  disabled={!canSave}
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
