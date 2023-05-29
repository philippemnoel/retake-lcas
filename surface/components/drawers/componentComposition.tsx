import {
  Bold,
  Button,
  Title,
  Text,
  Flex,
  Divider,
  Icon,
  SelectBox,
  SelectBoxItem,
} from "@tremor/react"
import {
  Bars3BottomLeftIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline"
import classNames from "classnames"

import NumberInput from "@/components/inputs/number"

import {
  PartsData,
  MaterialCompositionData,
  SupplierData,
} from "lib/types/supabase-row.types"

type Props = {
  open: boolean
  canSave: boolean
  partsData?: Partial<PartsData>
  materialCompositionData?: Partial<MaterialCompositionData>
  supplierData?: Array<Partial<SupplierData>>
  onChangeParts: (data: Partial<PartsData>) => void
  onChangeMaterialComposition: (data: Partial<MaterialCompositionData>) => void
  onSave: () => void
  onDismiss: () => void
  onClickEdit: () => void
  maxWeight?: number | null
}

export default (props: Props) => {
  const percentWeight = props.maxWeight
    ? ((props.materialCompositionData?.weight_grams || 0) * 100) /
      props.maxWeight
    : 0

  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-contact"
          className={classNames(
            "fixed top-0 -right-96 z-40 h-screen py-4 px-6 overflow-y-auto transition-transform w-96 bg-neutral-50",
            props.open ? "-translate-x-full" : "-translate-x-0"
          )}
          tabIndex={-1}
          aria-labelledby="drawer-contact-label"
        >
          <div className="text-left py-2 relative h-full">
            <Flex>
              <Flex justifyContent="justify-start" spaceX="space-x-3">
                <Icon
                  icon={Bars3BottomLeftIcon}
                  color="indigo"
                  variant="light"
                />
                <Title>Component</Title>
              </Flex>
              <Button
                text="Edit"
                color="indigo"
                variant="light"
                icon={PencilSquareIcon}
                onClick={props.onClickEdit}
              />
            </Flex>
            <Divider />
            <Text truncate={true}>
              <Bold>Component Description</Bold>
            </Text>
            <Text truncate={true} marginTop="mt-1">
              {props.partsData?.part_description ??
                props.partsData?.primary_material}
            </Text>
            <Text truncate={true} marginTop="mt-4">
              <Bold>Identifier / SKU</Bold>
            </Text>
            <Text marginTop="mt-1">
              {props.partsData?.customer_part_id ?? "Not specified"}
            </Text>
            <Text truncate={true} marginTop="mt-4">
              <Bold>Default Origin</Bold>
            </Text>
            <Text marginTop="mt-1">
              {props.partsData?.origin ?? "Not specified"}
            </Text>
            {props.partsData?.primary_material && (
              <>
                <Text truncate={true} marginTop="mt-4">
                  <Bold>Material</Bold>
                </Text>
                <Text marginTop="mt-1">
                  {props.partsData?.primary_material ?? "Not specified"}
                </Text>
              </>
            )}
            <Text marginTop="mt-4">
              <Bold>Weight (grams) *</Bold>
            </Text>
            <NumberInput
              marginTop="mt-1"
              value={props.materialCompositionData?.weight_grams ?? 0}
              onValueChange={(value) =>
                props.onChangeMaterialComposition({ weight_grams: value })
              }
              hint={`grams (${Math.round(percentWeight)}%)`}
              maxValue={props.maxWeight ?? undefined}
            />
            {props.supplierData && props.supplierData.length > 0 && (
              <>
                <Text marginTop="mt-4">
                  <Flex>
                    <Bold>Supplier</Bold>
                    <Button
                      text="Clear"
                      color="indigo"
                      variant="light"
                      disabled={
                        (props.materialCompositionData?.supplier_id ?? "") ===
                        ""
                      }
                      onClick={() =>
                        props.onChangeMaterialComposition({
                          supplier_id: null,
                        })
                      }
                    />
                  </Flex>
                </Text>
                <SelectBox
                  marginTop="mt-1"
                  placeholder="Type to search suppliers"
                  value={props.materialCompositionData?.supplier_id ?? ""}
                  onValueChange={(value: string) =>
                    props.onChangeMaterialComposition({ supplier_id: value })
                  }
                >
                  {props.supplierData?.map((supplier) => (
                    <SelectBoxItem
                      key={supplier.id}
                      value={supplier.id}
                      text={supplier.name ?? ""}
                    />
                  ))}
                </SelectBox>
              </>
            )}
            <div className="absolute bottom-0">
              <Flex spaceX="space-x-4">
                <Button
                  text="Save"
                  color="indigo"
                  disabled={!props.canSave}
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
