import { useState } from "react"
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
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline"
import classNames from "classnames"

import { useQuery } from "../hooks"
import NumberInput from "../inputs/number"
import { CMLTotalResultsData, PartsData } from "lib/types/supabase-row.types"

export default ({
  open,
  setOpen,
  onSave,
  onCreate,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  onSave: (
    value: Partial<CMLTotalResultsData> & { weight_grams: number }
  ) => void
  onCreate: () => void
}) => {
  const [values, setValues] = useState<PartsData | undefined>(undefined)
  const [weight, setWeight] = useState(0)

  const { data: allMaterials } = useQuery<PartsData>("parts", {
    is_base_material: false,
  })

  const canSave = values !== undefined && weight > 0

  const materialOptions = allMaterials?.filter(
    (material) => material.part_description || material.customer_part_id
  )

  const formatOption = (option: PartsData) => {
    if (option.part_description && option.customer_part_id)
      return `${option.part_description} (${option.customer_part_id})`
    if (option.part_description) return option.part_description
    if (option.customer_part_id) return option.customer_part_id
    return ""
  }

  if (materialOptions === undefined) return <></>

  return (
    <>
      <div className="absolute top-0 right-0">
        <div
          id="drawer-contact"
          className={classNames(
            "fixed top-0 left-0 z-40 h-screen py-4 px-6 overflow-y-auto transition-transform w-80 bg-neutral-50 bg-opacity-70 backdrop-blur-md",
            open ? "translate-x-0" : "-translate-x-full"
          )}
          tabIndex={-1}
          aria-labelledby="drawer-contact-label"
        >
          <div className="text-left py-2 relative h-full">
            <Flex justifyContent="justify-start" spaceX="space-x-3">
              <Icon icon={Bars3BottomLeftIcon} color="indigo" variant="light" />
              <Title>Life Cycle Assessment</Title>
            </Flex>
            <Divider />

            <Text truncate={true}>
              <Flex>
                <Bold>Component *</Bold>
                <Button
                  text="Create New"
                  variant="light"
                  color="indigo"
                  onClick={onCreate}
                />
              </Flex>
            </Text>
            <SelectBox
              marginTop="mt-1"
              onValueChange={(value) =>
                setValues(
                  allMaterials?.find(
                    (material) => material.retake_part_id === value
                  )
                )
              }
              value={values?.retake_part_id}
              placeholder="Type to search components"
            >
              {
                materialOptions.map((material, index) => (
                  <SelectBoxItem
                    text={formatOption(material)}
                    value={material.retake_part_id}
                    key={index}
                  />
                )) as any
              }
            </SelectBox>
            <Text marginTop="mt-4">
              <Bold>Declared Unit Weight (Grams)*</Bold>
            </Text>
            <NumberInput
              marginTop="mt-1"
              value={weight}
              onValueChange={(value) => setWeight(value)}
              hint="grams"
            />
            <div className="absolute bottom-0">
              <Flex spaceX="space-x-4">
                <Button
                  text="Save"
                  color="indigo"
                  disabled={!canSave}
                  onClick={() => {
                    onSave({
                      ...values,
                      weight_grams: weight,
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
