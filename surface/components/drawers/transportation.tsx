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
  Badge,
} from "@tremor/react"
import classNames from "classnames"
import { TruckIcon } from "@heroicons/react/24/outline"
import uniq from "lodash.uniq"

import NumberInput from "@/components/inputs/number"

import transportationTypes from "lib/calculator/transportation"
import { grids, regions } from "lib/calculator/factors"
import { formatNumber } from "lib/utils"
import {
  MaterialCompositionWithDescriptionsData,
  TransportationData,
} from "lib/types/supabase-row.types"

enum DistanceLabel {
  DISTANCE_KM = "Distance (km)",
  ORIGIN_DEST = "Origin and Destination",
}

const locationOptions = uniq([
  ...regions.map((region) => region.name),
  ...grids.map((grid) => grid.name),
])

export default ({
  open,
  setOpen,
  components,
  onSave,
  defaults,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  components?: Array<MaterialCompositionWithDescriptionsData>
  onSave: (value: Partial<TransportationData>) => void
  defaults?: Partial<TransportationData>
}) => {
  const [values, setValues] = useState(defaults)
  const [distanceType, setDistanceType] = useState<DistanceLabel>(
    DistanceLabel.DISTANCE_KM
  )

  const onChange = <T extends NonNullable<typeof values>, K extends keyof T>(
    key: K,
    value: T[K]
  ) => {
    const clonedValues = ({ ...values } ?? {}) as T
    clonedValues[key] = value
    setValues(clonedValues)
  }

  useEffect(() => {
    setValues(defaults)
  }, [defaults])

  const hasOriginDest =
    (values?.origin ?? "") !== "" && (values?.destination ?? "") !== ""
  const hasDistanceKm = (values?.distance_km ?? 0) > 0
  const hasDistanceValue =
    distanceType === DistanceLabel.DISTANCE_KM ? hasDistanceKm : hasOriginDest
  const hasRetakePartId = Boolean(values?.material_composition_id)
  const hasTransportationType = Boolean(values?.transportation_type)

  const isSaveEnabled =
    hasDistanceValue && hasRetakePartId && hasTransportationType

  const selectedComponent = components?.find(
    (component) => component.id === values?.material_composition_id
  )

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
              <Icon icon={TruckIcon} color="indigo" variant="light" />
              <Title>Transport</Title>
            </Flex>
            <Divider />
            <Text>
              <Bold>Transported Part *</Bold>
            </Text>
            <Dropdown
              marginTop="mt-1"
              value={values?.material_composition_id}
              onValueChange={(value) =>
                onChange("material_composition_id", value)
              }
            >
              {
                components?.map((component) =>
                  component.part_description !== null ? (
                    <DropdownItem
                      key={component.id}
                      text={component.part_description}
                      value={component.id}
                    />
                  ) : (
                    <></>
                  )
                ) as any
              }
            </Dropdown>
            <Text marginTop="mt-4">
              <Bold>Transported Part Weight</Bold>
            </Text>
            {selectedComponent?.weight_grams ? (
              <Text marginTop="mt-1">
                {formatNumber(selectedComponent.weight_grams)} grams
              </Text>
            ) : (
              <Badge text="" />
            )}
            <Text marginTop="mt-4">
              <Bold>Measurement Type *</Bold>
            </Text>
            <Dropdown
              marginTop="mt-1"
              value={distanceType}
              onValueChange={(value) => setDistanceType(value)}
            >
              {Object.values(DistanceLabel).map((type) => (
                <DropdownItem key={type} text={type} value={type} />
              ))}
            </Dropdown>
            {distanceType === DistanceLabel.DISTANCE_KM && (
              <>
                <Text marginTop="mt-4">
                  <Bold>Distance (km) *</Bold>
                </Text>
                <NumberInput
                  value={values?.distance_km ?? 0}
                  onValueChange={(value) => onChange("distance_km", value)}
                  marginTop="mt-1"
                />
              </>
            )}
            {distanceType === DistanceLabel.ORIGIN_DEST && (
              <>
                <Text marginTop="mt-4">
                  <Bold>Origin *</Bold>
                </Text>
                <SelectBox
                  marginTop="mt-1"
                  value={values?.origin ?? ""}
                  onValueChange={(value) => onChange("origin", value)}
                >
                  {locationOptions.map((name, index) => (
                    <SelectBoxItem key={index} value={name} text={name} />
                  ))}
                </SelectBox>
                <Text marginTop="mt-4">
                  <Bold>Destination *</Bold>
                </Text>
                <SelectBox
                  marginTop="mt-1"
                  value={values?.destination ?? ""}
                  onValueChange={(value) => onChange("destination", value)}
                >
                  {locationOptions.map((name, index) => (
                    <SelectBoxItem key={index} value={name} text={name} />
                  ))}
                </SelectBox>
              </>
            )}
            <Text marginTop="mt-4">
              <Bold>Transportation Type *</Bold>
            </Text>
            <Dropdown
              marginTop="mt-1"
              value={values?.transportation_type}
              onValueChange={(value) =>
                onChange("transportation_type", value as string)
              }
            >
              {transportationTypes.map(({ name }, index) => (
                <DropdownItem key={index} value={name} text={name} />
              ))}
            </Dropdown>
            <div className="absolute bottom-0">
              <Flex spaceX="space-x-4">
                <Button
                  text="Save"
                  color="indigo"
                  disabled={!isSaveEnabled}
                  onClick={() => {
                    onSave({
                      id: values?.id ?? undefined,
                      material_composition_id:
                        values?.material_composition_id ?? undefined,
                      distance_km: values?.distance_km,
                      origin: values?.origin,
                      destination: values?.destination,
                      transportation_type: values?.transportation_type,
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
