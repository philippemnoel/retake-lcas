import { useState, useEffect } from "react"
import {
  Button,
  Title,
  Text,
  Flex,
  TextInput,
  Divider,
  Icon,
  ColGrid,
  Col,
  Bold,
  Card,
  SelectBox,
  SelectBoxItem,
} from "@tremor/react"
import { Bars3BottomLeftIcon, EnvelopeIcon } from "@heroicons/react/24/outline"
import classNames from "classnames"

import ConnectedCombobox from "@/components/inputs/connectedSelectBox"
import { useQuery } from "@/components/hooks"

import { Database } from "lib/types/database.types"
import ImpactBadge from "../badges/impact"
import { regions } from "lib/calculator/factors"
import materials from "lib/calculator/materials"

const defaultsToValues = (
  defaults:
    | Partial<Database["public"]["Views"]["cml_parts_with_impacts"]["Row"]>
    | undefined
): Partial<Database["public"]["Tables"]["parts"]["Row"]> => ({
  retake_part_id: defaults?.retake_part_id ?? undefined,
  customer_part_id: defaults?.customer_part_id ?? undefined,
  part_description: defaults?.part_description ?? undefined,
  origin: defaults?.origin ?? undefined,
  org_id: defaults?.org_id ?? undefined,
  manufacturing_process: defaults?.manufacturing_process ?? undefined,
  primary_material: defaults?.primary_material ?? undefined,
  created_at: defaults?.created_at ?? undefined,
})

export default ({
  open,
  setOpen,
  onSave,
  onCreateSupplier,
  onEngageSupplier,
  defaults,
  partsWithImpacts,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  onSave: (value: Partial<Database["public"]["Tables"]["parts"]["Row"]>) => void
  defaults:
    | Partial<Database["public"]["Views"]["cml_parts_with_impacts"]["Row"]>
    | undefined
  partsWithImpacts:
    | Partial<Database["public"]["Views"]["cml_parts_with_impacts"]["Row"]>
    | undefined
  onCreateSupplier: () => void
  onEngageSupplier: () => void
}) => {
  const { data: defaultSupplierIds, refresh: refreshDefaultSupplierIds } =
    useQuery<Database["public"]["Tables"]["parts"]["Row"]>("parts", {
      retake_part_id: defaults?.retake_part_id,
    })

  const [values, setValues] = useState(defaultsToValues(defaults))

  const onChange = (
    key: keyof Database["public"]["Tables"]["parts"]["Row"],
    value: any
  ) => {
    const clonedValues = { ...values } ?? {}
    clonedValues[key] = value
    setValues(clonedValues)
  }

  const { data: allSuppliers, refresh: refreshSuppliers } =
    useQuery<Database["public"]["Tables"]["suppliers"]["Row"]>("suppliers")

  const hasCustomerPartId = !(
    defaults?.primary_material && !defaults?.customer_part_id
  )

  useEffect(() => {
    setValues(defaultsToValues(defaults))
    refreshSuppliers()
    refreshDefaultSupplierIds()
  }, [defaults])

  useEffect(() => {
    const supplierIds = defaultSupplierIds?.[0]?.supplier_ids

    if (supplierIds) onChange("supplier_ids", supplierIds)
  }, [defaultSupplierIds])

  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-contact"
          className={classNames(
            "fixed top-0 left-0 z-40 h-screen py-4 px-6 overflow-y-hidden transition-transform w-[45rem] bg-neutral-50 bg-opacity-70 backdrop-blur-md",
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
                <div className="max-w-xs">
                  <Title truncate={true}>
                    {defaults?.part_description ??
                      defaults?.customer_part_id ??
                      "Component"}
                  </Title>
                </div>
              </Flex>
              <Button
                text="Request Footprint from Supplier"
                icon={EnvelopeIcon}
                variant="light"
                color="indigo"
                onClick={onEngageSupplier}
                disabled={defaults?.supplier_id === null}
              />
            </div>
            <Divider />
            <ColGrid numCols={2}>
              <Col numColSpan={1}>
                {hasCustomerPartId && (
                  <>
                    <Text truncate={true}>
                      <Bold>Identifier or SKU</Bold>
                    </Text>
                    {defaults?.customer_part_id ? (
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
                      <Bold>Description</Bold>
                    </Text>
                    <TextInput
                      marginTop="mt-1"
                      value={values?.part_description?.toString() ?? ""}
                      onChange={(event) =>
                        onChange("part_description", event.target.value)
                      }
                      placeholder="Widget Subcomponent"
                    />
                  </>
                )}
                <Text marginTop={hasCustomerPartId ? "mt-4" : "mt-0"}>
                  <Bold>Default Origin</Bold>
                </Text>
                {regions && (
                  <SelectBox
                    marginTop="mt-1"
                    value={values?.origin}
                    onValueChange={(value) => onChange("origin", value)}
                    placeholder="Type to search from list"
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
                  placeholder="Type to search from list"
                >
                  {
                    materials?.map((material, index) => (
                      <SelectBoxItem
                        text={material}
                        value={material}
                        key={index}
                      />
                    )) as any
                  }
                </SelectBox>
                <Text marginTop="mt-4">
                  <Flex>
                    <Bold>Suppliers</Bold>
                    <Button
                      text="Create New Supplier"
                      variant="light"
                      color="indigo"
                      onClick={onCreateSupplier}
                    />
                  </Flex>
                </Text>
                {allSuppliers && (
                  <ConnectedCombobox
                    endpoint="/api/bulk/suppliers"
                    selected={values?.supplier_ids ?? []}
                    onChange={(value: any) => onChange("supplier_ids", value)}
                    keyField="id"
                    displayField="name"
                    multiple={true}
                  />
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
              </Col>
              <Col numColSpan={1}>
                <div className="p-1 pl-8 h-[calc(100vh-9rem)] overflow-y-scroll">
                  <Card shadow={false}>
                    <Text truncate={true}>
                      <Bold>Global Warming</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={partsWithImpacts?.database_name}
                      activity={partsWithImpacts?.activity_name}
                      source={partsWithImpacts?.impact_source}
                      impact={partsWithImpacts?.global_warming}
                      isLeaf={true}
                      unit="kg CO2-Eq / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Abiotic Depletion</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={partsWithImpacts?.database_name}
                      activity={partsWithImpacts?.activity_name}
                      source={partsWithImpacts?.impact_source}
                      impact={partsWithImpacts?.abiotic_depletion}
                      isLeaf={true}
                      unit="MJ / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Abiotic Depletion (Fossil Fuel)</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={partsWithImpacts?.database_name}
                      activity={partsWithImpacts?.activity_name}
                      source={partsWithImpacts?.impact_source}
                      impact={partsWithImpacts?.abiotic_depletion_fossil_fuels}
                      isLeaf={true}
                      unit="MJ / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Acidification</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={partsWithImpacts?.database_name}
                      activity={partsWithImpacts?.activity_name}
                      source={partsWithImpacts?.impact_source}
                      impact={partsWithImpacts?.acidification}
                      isLeaf={true}
                      unit="kgSO2e / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Eutrophication</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={partsWithImpacts?.database_name}
                      activity={partsWithImpacts?.activity_name}
                      source={partsWithImpacts?.impact_source}
                      impact={partsWithImpacts?.eutrophication}
                      isLeaf={true}
                      unit="kgPO4e / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Freshwater Ecotoxicity</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={partsWithImpacts?.database_name}
                      activity={partsWithImpacts?.activity_name}
                      source={partsWithImpacts?.impact_source}
                      impact={partsWithImpacts?.freshwater_ecotoxicity}
                      isLeaf={true}
                      unit="kg 1,4-DB e / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Human Toxicity</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={partsWithImpacts?.database_name}
                      activity={partsWithImpacts?.activity_name}
                      source={partsWithImpacts?.impact_source}
                      impact={partsWithImpacts?.human_toxicity}
                      isLeaf={true}
                      unit="kg 1,4-DB e / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Marine Ecotoxicity</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={partsWithImpacts?.database_name}
                      activity={partsWithImpacts?.activity_name}
                      source={partsWithImpacts?.impact_source}
                      impact={partsWithImpacts?.marine_ecotoxicity}
                      isLeaf={true}
                      unit="kg 1,4-DB e / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Ozone Depletion</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={partsWithImpacts?.database_name}
                      activity={partsWithImpacts?.activity_name}
                      source={partsWithImpacts?.impact_source}
                      impact={partsWithImpacts?.ozone_depletion}
                      isLeaf={true}
                      unit="kg CFC-11 e / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Photochemical Ozone Creation</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={partsWithImpacts?.database_name}
                      activity={partsWithImpacts?.activity_name}
                      source={partsWithImpacts?.impact_source}
                      impact={partsWithImpacts?.photochemical_ozone_creation}
                      isLeaf={true}
                      unit="kgC2H4e / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Terrestrial Ecotoxicity</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={partsWithImpacts?.database_name}
                      activity={partsWithImpacts?.activity_name}
                      source={partsWithImpacts?.impact_source}
                      impact={partsWithImpacts?.terrestrial_ecotoxicity}
                      isLeaf={true}
                      unit="kg 1,4-DB e / kg"
                    />
                  </Card>
                </div>
              </Col>
            </ColGrid>
          </div>
        </div>
      </div>
    </>
  )
}
