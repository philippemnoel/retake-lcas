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
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid"
import classNames from "classnames"

import ConnectedCombobox from "@/components/inputs/connectedSelectBox"
import ImpactBadge from "@/components/badges/impact"

import { regions } from "lib/calculator/factors"
import {
  CMLPartsWithImpactsData,
  PartsData,
} from "lib/types/supabase-row.types"
import ConnectedMaterials from "../inputs/connectedMaterials"

type Props = {
  open: boolean
  partsData: Partial<PartsData> | undefined
  partsWithImpactsData: Partial<CMLPartsWithImpactsData> | undefined
  onDismiss: () => void
  onSave: () => void
  onChangeParts: (data: Partial<PartsData>) => void
  onCreateSupplier: () => void
  onEngageSupplier: () => void
}

export default (props: Props) => {
  const hasCustomerPartId = !(
    props.partsData?.primary_material && !props.partsData?.customer_part_id
  )

  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-contact"
          className={classNames(
            "fixed top-0 left-0 z-40 h-screen py-4 px-6 overflow-y-hidden transition-transform w-[45rem] bg-neutral-50 bg-opacity-70 backdrop-blur-md",
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
                <div className="max-w-xs">
                  <Title truncate={true}>
                    {props.partsData?.part_description ??
                      props.partsData?.customer_part_id ??
                      "Component"}
                  </Title>
                </div>
              </Flex>
              <Button
                text="Request Footprint from Supplier"
                icon={EnvelopeIcon}
                variant="light"
                color="indigo"
                onClick={props.onEngageSupplier}
                disabled={(props.partsData?.supplier_ids ?? []).length === 0}
              />
            </div>
            <Divider />
            <ColGrid numCols={2}>
              <Col numColSpan={1}>
                <Text color="indigo">
                  <Bold>Required Fields</Bold>
                </Text>
                {hasCustomerPartId && (
                  <>
                    <Text truncate={true} marginTop="mt-2">
                      <Bold>Identifier or SKU</Bold>
                    </Text>
                    {props.partsData?.customer_part_id ? (
                      <Text marginTop="mt-1">
                        {props.partsData?.customer_part_id}
                      </Text>
                    ) : (
                      <TextInput
                        marginTop="mt-1"
                        value={
                          props.partsData?.customer_part_id?.toString() ?? ""
                        }
                        onChange={(event) =>
                          props.onChangeParts({
                            customer_part_id: event.target.value,
                          })
                        }
                        placeholder="SKU-123456"
                      />
                    )}
                    <Text marginTop="mt-4">
                      <Bold>Description</Bold>
                    </Text>
                    <TextInput
                      marginTop="mt-1"
                      value={
                        props.partsData?.part_description?.toString() ?? ""
                      }
                      onChange={(event) =>
                        props.onChangeParts({
                          part_description: event.target.value,
                        })
                      }
                      placeholder="Widget Subcomponent"
                    />
                  </>
                )}
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
                    value={props.partsData?.origin}
                    onValueChange={(value) =>
                      props.onChangeParts({ origin: value })
                    }
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
                <ConnectedMaterials
                  data={props.partsData}
                  onChange={props.onChangeParts}
                  marginTop="mt-4"
                />
                <Text marginTop="mt-4">
                  <Flex>
                    <Bold>Suppliers</Bold>
                    <Button
                      text="Create New Supplier"
                      variant="light"
                      color="indigo"
                      onClick={props.onCreateSupplier}
                    />
                  </Flex>
                </Text>
                <ConnectedCombobox
                  endpoint="/api/bulk/suppliers"
                  selected={props.partsData?.supplier_ids ?? []}
                  onChange={(value: any) =>
                    props.onChangeParts({ supplier_ids: value })
                  }
                  keyField="id"
                  displayField="name"
                  multiple={true}
                />
                <div className="absolute bottom-0">
                  <Flex spaceX="space-x-6">
                    <Button
                      text="Save"
                      color="indigo"
                      disabled={[
                        props.partsData?.customer_part_id,
                        props.partsData?.part_description,
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
              </Col>
              <Col numColSpan={1}>
                <div className="p-1 pl-8 h-[calc(100vh-9rem)] overflow-y-scroll">
                  <Card shadow={false}>
                    <Text truncate={true}>
                      <Bold>Global Warming</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={props.partsWithImpactsData?.database_name}
                      activity={props.partsWithImpactsData?.activity_name}
                      source={props.partsWithImpactsData?.impact_source}
                      impact={props.partsWithImpactsData?.global_warming}
                      isLeaf={true}
                      unit="kg CO2-Eq / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Abiotic Depletion</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={props.partsWithImpactsData?.database_name}
                      activity={props.partsWithImpactsData?.activity_name}
                      source={props.partsWithImpactsData?.impact_source}
                      impact={props.partsWithImpactsData?.abiotic_depletion}
                      isLeaf={true}
                      unit="MJ / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Abiotic Depletion (Fossil Fuel)</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={props.partsWithImpactsData?.database_name}
                      activity={props.partsWithImpactsData?.activity_name}
                      source={props.partsWithImpactsData?.impact_source}
                      impact={
                        props.partsWithImpactsData
                          ?.abiotic_depletion_fossil_fuels
                      }
                      isLeaf={true}
                      unit="MJ / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Acidification</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={props.partsWithImpactsData?.database_name}
                      activity={props.partsWithImpactsData?.activity_name}
                      source={props.partsWithImpactsData?.impact_source}
                      impact={props.partsWithImpactsData?.acidification}
                      isLeaf={true}
                      unit="kgSO2e / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Eutrophication</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={props.partsWithImpactsData?.database_name}
                      activity={props.partsWithImpactsData?.activity_name}
                      source={props.partsWithImpactsData?.impact_source}
                      impact={props.partsWithImpactsData?.eutrophication}
                      isLeaf={true}
                      unit="kgPO4e / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Freshwater Ecotoxicity</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={props.partsWithImpactsData?.database_name}
                      activity={props.partsWithImpactsData?.activity_name}
                      source={props.partsWithImpactsData?.impact_source}
                      impact={
                        props.partsWithImpactsData?.freshwater_ecotoxicity
                      }
                      isLeaf={true}
                      unit="kg 1,4-DB e / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Human Toxicity</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={props.partsWithImpactsData?.database_name}
                      activity={props.partsWithImpactsData?.activity_name}
                      source={props.partsWithImpactsData?.impact_source}
                      impact={props.partsWithImpactsData?.human_toxicity}
                      isLeaf={true}
                      unit="kg 1,4-DB e / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Marine Ecotoxicity</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={props.partsWithImpactsData?.database_name}
                      activity={props.partsWithImpactsData?.activity_name}
                      source={props.partsWithImpactsData?.impact_source}
                      impact={props.partsWithImpactsData?.marine_ecotoxicity}
                      isLeaf={true}
                      unit="kg 1,4-DB e / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Ozone Depletion</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={props.partsWithImpactsData?.database_name}
                      activity={props.partsWithImpactsData?.activity_name}
                      source={props.partsWithImpactsData?.impact_source}
                      impact={props.partsWithImpactsData?.ozone_depletion}
                      isLeaf={true}
                      unit="kg CFC-11 e / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Photochemical Ozone Creation</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={props.partsWithImpactsData?.database_name}
                      activity={props.partsWithImpactsData?.activity_name}
                      source={props.partsWithImpactsData?.impact_source}
                      impact={
                        props.partsWithImpactsData?.photochemical_ozone_creation
                      }
                      isLeaf={true}
                      unit="kgC2H4e / kg"
                    />
                    <Text truncate={true} marginTop="mt-4">
                      <Bold>Terrestrial Ecotoxicity</Bold>
                    </Text>
                    <ImpactBadge
                      marginTop="mt-1"
                      database={props.partsWithImpactsData?.database_name}
                      activity={props.partsWithImpactsData?.activity_name}
                      source={props.partsWithImpactsData?.impact_source}
                      impact={
                        props.partsWithImpactsData?.terrestrial_ecotoxicity
                      }
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
