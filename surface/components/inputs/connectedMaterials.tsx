import { useEffect } from "react"
import {
  Bold,
  Button,
  Text,
  Flex,
  SelectBox,
  SelectBoxItem,
} from "@tremor/react"
import flatten from "lodash.flatten"
import uniq from "lodash.uniq"
import findKey from "lodash.findkey"

import { PartsData } from "lib/types/supabase-row.types"
import materialsMap from "lib/calculator/materials"

type Props = {
  data: Partial<PartsData> | undefined
  onChange: (data: Partial<PartsData>) => void
  marginTop?: string
}

export default (props: Props) => {
  const categories = Object.keys(materialsMap)
  const materials = flatten(Object.values(materialsMap))

  const categoryOptions = uniq([
    ...categories,
    ...(props.data?.category ? [props.data.category] : []),
  ]).sort()

  const materialOptions = uniq([
    ...(props.data?.category && categories.includes(props.data.category)
      ? materialsMap[props.data.category]
      : materials),
    ...(props.data?.primary_material ? [props.data.primary_material] : []),
  ]).sort()

  useEffect(() => {
    if (!props.data?.primary_material) return
    const category = findKey(materialsMap, (value) =>
      value.includes(props.data?.primary_material ?? "")
    )
    if (category) props.onChange({ category })
  }, [props.data?.primary_material])

  return (
    <>
      <Flex marginTop={props.marginTop ? (props.marginTop as any) : "mt-0"}>
        <Text>
          <Bold>Material Category</Bold>
        </Text>
        {props.data?.category && (
          <Button
            text="Remove"
            color="indigo"
            variant="light"
            onClick={() => {
              props.onChange({ category: null })
            }}
          />
        )}
      </Flex>
      <SelectBox
        marginTop="mt-1"
        onValueChange={(value) => props.onChange({ category: value })}
        value={props.data?.category}
        placeholder="Type to filter materials by category"
      >
        {
          categoryOptions.map((category, index) => (
            <SelectBoxItem text={category} value={category} key={index} />
          )) as any
        }
      </SelectBox>
      <Flex marginTop="mt-4">
        <Text>
          <Bold>Material Name</Bold>
        </Text>
        {props.data?.primary_material && (
          <Button
            text="Remove"
            color="indigo"
            variant="light"
            onClick={() => {
              props.onChange({ primary_material: null })
            }}
          />
        )}
      </Flex>
      <SelectBox
        marginTop="mt-1"
        onValueChange={(value) => props.onChange({ primary_material: value })}
        value={props.data?.primary_material}
        placeholder={`Type to search from ${
          props.data?.category ? `"${props.data?.category}"` : "all materials"
        }`}
      >
        {
          materialOptions.map((material, index) => (
            <SelectBoxItem text={material} value={material} key={index} />
          )) as any
        }
      </SelectBox>
    </>
  )
}
