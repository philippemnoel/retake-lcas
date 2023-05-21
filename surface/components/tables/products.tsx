import {
  Badge,
  Text,
  TableHeaderCell,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Bold,
  Flex,
  Icon,
  TextInput,
} from "@tremor/react"
import { useState } from "react"
import { PlusIcon, ChevronRightIcon } from "@heroicons/react/20/solid"
import {
  MagnifyingGlassIcon,
  TrashIcon,
  Bars3BottomLeftIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { v4 as uuidv4 } from "uuid"
import uniqBy from "lodash.uniqby"

import Drawer from "../drawers/bom"
import Pagination from "./pagination"
import Skeleton from "../skeletons/list"
import NewComponentDrawer from "../drawers/product"
import ExistingComponentDrawer from "../drawers/lca"
import ImpactBadge from "../badges/impact"
import Empty from "../empty"
import Checklist from "../menus/checklist"

import { useQuery } from "../hooks"
import { useUser } from "@auth0/nextjs-auth0"
import {
  upsertMaterialComposition,
  upsertPart,
  upsertLCA,
} from "lib/api/upsert"
import { useNotification } from "../hooks"
import { formatNumber } from "lib/utils"
import { CMLTotalResultsData } from "lib/types/supabase-row.types"
import { removeLCA } from "lib/api/remove"
import {
  CMLTotalResultsSchema,
  MaterialCompositionDataSchema,
} from "lib/api/schemas"

const impactBadge = (
  materialsCompleted: boolean,
  manufacturingCompleted: boolean,
  transportationCompleted: boolean,
  useCompleted: boolean,
  disposalCompleted: boolean,
  impactSource: string | null,
  impact: number | null
) => {
  if (
    materialsCompleted &&
    manufacturingCompleted &&
    transportationCompleted &&
    useCompleted &&
    disposalCompleted
  )
    return <ImpactBadge source={impactSource} impact={impact} isLeaf={false} />

  return (
    <Checklist
      manufacturingCompleted={manufacturingCompleted}
      transportationCompleted={transportationCompleted}
      materialsCompleted={materialsCompleted}
      useCompleted={useCompleted}
      disposalCompleted={disposalCompleted}
    >
      <Badge text="More Data Required" color="zinc" size="xs" />
    </Checklist>
  )
}

const completionBadge = (
  materialsCompleted: boolean,
  manufacturingCompleted: boolean,
  transportationCompleted: boolean,
  useCompleted: boolean,
  disposalCompleted: boolean
) => {
  if (
    materialsCompleted &&
    manufacturingCompleted &&
    transportationCompleted &&
    useCompleted &&
    disposalCompleted
  )
    return <Badge color="indigo" text="Completed" size="xs" />

  return (
    <Checklist
      manufacturingCompleted={manufacturingCompleted}
      transportationCompleted={transportationCompleted}
      materialsCompleted={materialsCompleted}
      useCompleted={useCompleted}
      disposalCompleted={disposalCompleted}
    >
      <Badge
        color="amber"
        text={`${
          [
            materialsCompleted,
            manufacturingCompleted,
            transportationCompleted,
            useCompleted,
            disposalCompleted,
          ].filter(Boolean).length
        }/5 Complete`}
        size="xs"
      />
    </Checklist>
  )
}
export default () => {
  const [selected, setSelected] = useState<Array<Partial<CMLTotalResultsData>>>(
    []
  )
  const [deleting, setDeleting] = useState(false)
  const [showProductDrawer, setShowProductDrawer] = useState(false)
  const [showLCADrawer, setShowLCADrawer] = useState(false)
  const [defaults, setDefaults] = useState<
    Partial<CMLTotalResultsData> | undefined
  >(undefined)

  const {
    data,
    refresh,
    pagination,
    setPagination,
    searchQuery,
    setSearchQuery,
  } = useQuery<CMLTotalResultsData>(
    "cml_total_results",
    {
      orderAsc: "part_description",
    },
    "part_description"
  )

  const { user } = useUser()
  const { withNotification } = useNotification()

  const addToSelected = (
    item: Partial<CMLTotalResultsData>,
    checked: boolean
  ) => {
    const _selected = selected.slice()
    if (checked) {
      setSelected(uniqBy([...selected, item], "lca_id"))
    } else {
      setSelected(_selected.filter((s) => s.lca_id !== item.lca_id))
    }
  }

  const deleteRows = async () => {
    setDeleting(true)
    await Promise.all(
      selected.map((item) => removeLCA(item.lca_id, user?.org_id))
    )
    setSelected([])
    setDeleting(false)
    refresh()
  }

  const onSave = async (value: Partial<CMLTotalResultsData> | undefined) => {
    const partData = {
      ...value,
      retake_part_id:
        value?.retake_part_id ?? `${value?.customer_part_id}-${user?.org_id}`,
    }

    const materialCompositionData = MaterialCompositionDataSchema.parse({
      ...partData,
      level: 1,
      lca_id: partData?.lca_id ?? uuidv4(),
      id: partData?.material_composition_id ?? uuidv4(),
    })

    const lcaData = CMLTotalResultsSchema.parse({
      ...partData,
      ...materialCompositionData,
      org_id: user?.org_id,
      material_composition_id: materialCompositionData.id,
    })

    await withNotification([
      upsertPart([partData], user?.org_id, false),
      upsertMaterialComposition([materialCompositionData], user?.org_id),
      upsertLCA(lcaData),
    ])

    setShowProductDrawer(false)
    setSelected([])
    refresh()
  }

  if (data === undefined) return <Skeleton />

  return (
    <>
      <NewComponentDrawer
        open={showProductDrawer}
        setOpen={setShowProductDrawer}
        defaults={defaults}
        onSave={onSave}
      />
      <ExistingComponentDrawer
        open={showLCADrawer}
        setOpen={setShowLCADrawer}
        onSave={onSave}
        onCreate={() => {
          setShowLCADrawer(false)
          setShowProductDrawer(true)
        }}
      />
      <div className="fixed w-[calc(100%-3rem)] lg:w-[calc(100%-20rem)] bg-white z-10 top-[3.75rem] py-4">
        <div className="flex justify-between">
          {selected.length === 0 ? (
            <div className="hidden md:block">
              <Flex justifyContent="justify-start" spaceX="space-x-2">
                <Icon
                  icon={Bars3BottomLeftIcon}
                  variant="simple"
                  color="stone"
                />
                <Text>{pagination.rows} life cycle assessments (LCAs)</Text>
              </Flex>
            </div>
          ) : (
            <Flex justifyContent="justify-start" spaceX="space-x-2">
              <Icon icon={Bars3BottomLeftIcon} variant="simple" color="stone" />
              <Text>
                <Bold>{selected.length} selected</Bold>
              </Text>
            </Flex>
          )}
          {selected.length > 0 && (
            <Flex spaceX="space-x-6" justifyContent="justify-end">
              {selected.length === 1 && (
                <Button
                  text="Edit"
                  variant="light"
                  color="indigo"
                  icon={PencilSquareIcon}
                  onClick={() => {
                    setDefaults(selected[0])
                    setShowProductDrawer(!showProductDrawer)
                  }}
                />
              )}
              <Button
                text="Remove"
                variant="light"
                color="indigo"
                icon={TrashIcon}
                onClick={() => deleteRows()}
                loading={deleting}
              />
            </Flex>
          )}
          {selected.length === 0 && (
            <Flex justifyContent="justify-end" spaceX="space-x-6">
              {selected.length > 0 && (
                <Button
                  text={`Delete ${selected.length} LCA(s)`}
                  color="stone"
                  variant="light"
                  onClick={deleteRows}
                  loading={deleting}
                />
              )}
              {selected.length === 0 && (
                <Button
                  text="Create LCA From Scratch"
                  color="indigo"
                  variant="light"
                  onClick={() => {
                    setDefaults(undefined)
                    setShowLCADrawer(!showLCADrawer)
                  }}
                />
              )}
              {selected.length === 0 && (
                <Drawer
                  button={
                    <Button
                      text="Upload From File"
                      icon={PlusIcon}
                      color="indigo"
                      variant="light"
                    />
                  }
                />
              )}
            </Flex>
          )}
        </div>
        <Flex marginTop="mt-4">
          <TextInput
            placeholder="Search"
            maxWidth="max-w-sm"
            icon={MagnifyingGlassIcon}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Flex>
      </div>
      <Table marginTop="mt-24">
        <TableHead>
          <TableRow>
            <TableHeaderCell> </TableHeaderCell>
            <TableHeaderCell>Product Name</TableHeaderCell>
            <TableHeaderCell>Identifier / SKU</TableHeaderCell>
            <TableHeaderCell>Declared Unit</TableHeaderCell>
            <TableHeaderCell>Data Collection</TableHeaderCell>
            <TableHeaderCell>Global Warming / Unit</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded ring-1 ring-gray-300 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  onChange={(event) => {
                    addToSelected(item, event.target.checked)
                  }}
                />
              </TableCell>
              <TableCell>
                <Link href={`/data/products/${item.lca_id}/materials`}>
                  <Text>
                    <Bold>{item.part_description}</Bold>
                  </Text>
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/data/products/${item.lca_id}/materials`}>
                  <Text>{item.customer_part_id}</Text>
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/data/products/${item.lca_id}/materials`}>
                  {item.weight_grams && (
                    <Text>{formatNumber(item.weight_grams)} g</Text>
                  )}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/data/products/${item.lca_id}/materials`}>
                  {completionBadge(
                    item.materials_completed ?? false,
                    item.transportation_completed ?? false,
                    item.manufacturing_completed ?? false,
                    item.use_phase_completed ?? false,
                    item.end_of_life_completed ?? false
                  )}
                </Link>
              </TableCell>
              <TableCell>
                {impactBadge(
                  item.materials_completed ?? false,
                  item.transportation_completed ?? false,
                  item.manufacturing_completed ?? false,
                  item.use_phase_completed ?? false,
                  item.end_of_life_completed ?? false,
                  item.impact_source,
                  item.total_global_warming
                )}
              </TableCell>
              <TableCell>
                <Link href={`/data/products/${item.lca_id}/materials`}>
                  <Button
                    icon={ChevronRightIcon}
                    variant="light"
                    color="stone"
                  ></Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data?.length === 0 && (
        <Empty
          title="No Life Cycle Assessments Found"
          description="Once created, Retake will automatically begin the data collection
            process to perform a life cycle assessment (LCA) on a product."
          buttons={[
            <Button
              text="Create LCA From Scratch"
              color="indigo"
              onClick={() => {
                setDefaults(undefined)
                setShowLCADrawer(!showLCADrawer)
              }}
              key={0}
            />,
            <Drawer
              button={
                <Button
                  text="Upload From File"
                  color="indigo"
                  icon={PlusIcon}
                  variant="light"
                />
              }
              key={1}
            />,
          ]}
        />
      )}
      {pagination !== undefined && (
        <Pagination pagination={pagination} onPageChange={setPagination} />
      )}
    </>
  )
}
