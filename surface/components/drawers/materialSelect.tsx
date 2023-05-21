import {
  Button,
  Title,
  Text,
  Flex,
  Divider,
  Icon,
  Bold,
  SelectBox,
  SelectBoxItem,
} from "@tremor/react"
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline"
import classNames from "classnames"

import materials from "lib/calculator/materials"
import NumberInput from "../inputs/number"
import {
  PartsData,
  MaterialCompositionData,
} from "lib/types/supabase-row.types"

type Props = {
  open: boolean
  onDismiss: () => void
  partsData?: Partial<PartsData>
  materialCompositionData?: Partial<MaterialCompositionData>
  maxWeight?: number
  canSave?: boolean | null
  onChangeParts: (data: Partial<PartsData>) => void
  onChangeMaterialComposition: (data: Partial<MaterialCompositionData>) => void
  onSave: () => void
}

export default (props: Props) => {
  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-contact"
          className={classNames(
            "fixed top-0 -right-96 z-40 h-screen py-4 px-6 overflow-y-hidden transition-transform w-96 bg-neutral-50",
            props.open ? "-translate-x-full" : "-translate-x-0"
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
                <Title truncate={true}>Material</Title>
              </Flex>
            </div>
            <Divider />
            <Flex>
              <Text>
                <Bold>Material *</Bold>
              </Text>
              {props.partsData?.primary_material && (
                <Button
                  text="Remove"
                  color="indigo"
                  variant="light"
                  onClick={() =>
                    props.onChangeParts({ primary_material: null })
                  }
                />
              )}
            </Flex>
            <SelectBox
              marginTop="mt-1"
              onValueChange={(value) =>
                props.onChangeParts({ primary_material: value })
              }
              value={props.partsData?.primary_material ?? null}
              placeholder="Type to search materials"
            >
              {
                materials.map((material, index) => (
                  <SelectBoxItem text={material} value={material} key={index} />
                )) as any
              }
            </SelectBox>
            <Text marginTop="mt-4">
              <Bold>Weight (grams) *</Bold>
            </Text>
            <NumberInput
              marginTop="mt-1"
              value={props.materialCompositionData?.weight_grams ?? 0}
              onValueChange={(value) =>
                props.onChangeMaterialComposition({ weight_grams: value })
              }
              hint="grams"
              maxValue={props.maxWeight}
            />
            <div className="absolute bottom-0">
              <Flex spaceX="space-x-6">
                <Button
                  text="Save"
                  color="indigo"
                  disabled={!props.canSave}
                  onClick={props.onSave}
                />
                <Button
                  text="Close"
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
