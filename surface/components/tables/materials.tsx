import { useEffect, useState } from "react"
import {
  MagnifyingGlassIcon,
  TrashIcon,
  Bars3BottomLeftIcon,
  UserCircleIcon,
  Square3Stack3DIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import {
  Text,
  TableHeaderCell,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Flex,
  Button,
  TextInput,
  Badge,
  Bold,
} from "@tremor/react"
import { ChevronRightIcon } from "@heroicons/react/20/solid"
import { useUser } from "@auth0/nextjs-auth0"
import { v4 as uuidv4 } from "uuid"
import sortBy from "lodash.sortby"
import sumBy from "lodash.sumby"

import Menu from "@/components/menus"
import Skeleton from "@/components/skeletons/list"
import SupplierDrawer from "../drawers/supplier"
import MaterialDrawer from "@/components/drawers/materialSelect"
import ComponentDrawer from "@/components/drawers/component"
import ComponentWeightDrawer from "@/components/drawers/componentComposition"
import ComponentDropdownDrawer from "@/components/drawers/componentSelect"
import BreadCrumbs from "@/components/breadcrumbs/materials"
import ImpactBadge from "@/components/badges/impact"
import Empty from "@/components/empty"
import CompletionButton from "@/components/buttons/completion"
import { useNotification, useLCAResults, useQuery } from "@/components/hooks"

import { formatNumber } from "lib/utils"
import {
  upsertMaterialComposition,
  upsertPart,
  upsertSupplier,
} from "lib/api/upsert"
import { updateLCA } from "lib/api/update"
import { isDevelopment } from "lib/utils"
import {
  LCAStage,
  MaterialCompositionWithImpacts,
} from "lib/types/calculator.types"
import { removeMaterialComposition, removePart } from "lib/api/remove"
import { MaterialCompositionDataSchema, PartsDataSchema } from "lib/api/schemas"
import {
  MaterialCompositionData,
  PartsData,
  SupplierData,
} from "lib/types/supabase-row.types"
import { Methodology } from "lib/calculator/methodologies"

export default ({
  lcaID,
  complete,
  refresh,
}: {
  lcaID: string
  complete: boolean
  refresh: () => void
}) => {
  const [materialDrawerOpen, setMaterialDrawerOpen] = useState(false)
  const [componentDrawerOpen, setComponentDrawerOpen] = useState(false)
  const [componentWeightDrawerOpen, setComponentWeightDrawerOpen] =
    useState(false)
  const [componentDropdownOpen, setComponentDropdownOpen] = useState(false)
  const [supplierDrawerOpen, setSupplierDrawerOpen] = useState(false)
  const [isNewComponent, setIsNewComponent] = useState(false)

  const [materialCompositionData, setMaterialCompositionData] =
    useState<Partial<MaterialCompositionData>>()
  const [partsData, setPartsData] = useState<Partial<PartsData>>()
  const [suppliersData, setSuppliersData] = useState<Partial<SupplierData>>()

  const [parent, setParent] = useState<MaterialCompositionWithImpacts>()
  const [treePath, setTreePath] = useState<
    Array<MaterialCompositionWithImpacts>
  >([])

  const { user } = useUser()
  const { withNotification } = useNotification()

  const { data: materialData, refresh: refreshMaterials } =
    useLCAResults<MaterialCompositionWithImpacts>("materials", {
      lca_id: lcaID,
      methodology: Methodology.CML,
    })

  const { data: selectedSuppliers, refresh: refreshSelectedSuppliers } =
    useQuery<SupplierData>("suppliers", {
      id: encodeURIComponent(JSON.stringify(partsData?.supplier_ids ?? [])),
      inFilters: ["id"],
    })

  const rootMaterial = materialData?.find((material) => material?.level === 1)
  const materials = materialData?.filter(
    (material) =>
      material.level === (parent?.level ?? 1) + 1 &&
      material.parent_id === parent?.id
  )
  const sortedMaterials = sortBy(materials, "weight_grams").reverse()
  const totalPercentWeight = Math.round(
    (sumBy(materials, "weight_grams") * 100) / (parent?.weight_grams ?? 1)
  )
  const weightTooLow = totalPercentWeight < 95
  const weightTooHigh = totalPercentWeight > 100
  const canMarkComplete = !weightTooLow && !weightTooHigh

  const withRetakePartId = <
    T extends Record<string, any> & { retake_part_id?: string | null }
  >(
    values?: T
  ): T => ({
    ...(values as T),
    retake_part_id:
      values?.retake_part_id ??
      `${values?.customer_part_id ?? uuidv4()}-${user?.org_id}`,
  })

  const onSaveMaterialComposition = (
    values: Partial<MaterialCompositionWithImpacts>
  ) => {
    values["id"] = values.id ?? uuidv4()
    values["level"] = values?.level ?? (parent?.level ?? 0) + 1
    values["lca_id"] = lcaID
    values["parent_id"] = parent?.id ?? null

    return upsertMaterialComposition([values], user?.org_id)
  }

  const onSaveParts = (values: Partial<PartsData>, calculateEmissions = true) =>
    upsertPart([values], user?.org_id, calculateEmissions)

  const markIncomplete = () =>
    updateLCA({
      lca_id: lcaID,
      org_id: user?.org_id,
      materials_completed: false,
    })

  const openComponentWeightDrawer = (item: MaterialCompositionWithImpacts) => {
    setMaterialCompositionData(
      MaterialCompositionDataSchema.optional().parse(item)
    )
    setPartsData(PartsDataSchema.optional().parse(item))
    setComponentWeightDrawerOpen(!componentWeightDrawerOpen)
  }

  const refreshAll = () => {
    refresh()
    refreshMaterials()
  }

  const onSaveSupplier = async (value?: Partial<SupplierData>) => {
    if (!value) return

    const supplier = {
      ...value,
      ...(value.contacts && {
        contacts: value.contacts.filter((contact) => contact !== ""),
      }),
      id: value.id ?? `${value.name}-${user?.org_id}`,
    }

    await withNotification([upsertSupplier([supplier], user?.org_id)])

    refreshAll()
  }

  const onRemoveMaterial = async (
    value: Partial<MaterialCompositionWithImpacts>
  ) => {
    await withNotification([
      removeMaterialComposition(value.id, lcaID, user?.org_id),
      ...(value.primary_material && !value.customer_part_id
        ? [removePart(value.retake_part_id, user?.org_id)]
        : []),
      markIncomplete(),
    ])
    refreshAll()
  }

  useEffect(() => {
    if (rootMaterial !== undefined && parent === undefined) {
      setParent(rootMaterial)
    }
  }, [rootMaterial])

  useEffect(() => {
    if (parent !== undefined) refreshAll()
  }, [parent])

  useEffect(() => {
    if (parent === undefined) return

    const level = parent.level ?? 1
    let clonedTreePath = [...treePath]

    if (level > treePath.length) {
      setTreePath([...treePath, parent])
    } else {
      clonedTreePath[level - 1] = parent
      clonedTreePath = clonedTreePath.slice(0, level)
      setTreePath(clonedTreePath)
    }
  }, [parent])

  useEffect(() => {
    if (componentWeightDrawerOpen) refreshSelectedSuppliers()
  }, [componentWeightDrawerOpen])

  if (materials === undefined || !user?.org_id)
    return (
      <Card shadow={false}>
        <Skeleton />
      </Card>
    )

  return (
    <Card shadow={false}>
      <SupplierDrawer
        data={suppliersData}
        open={supplierDrawerOpen}
        onChange={(data) => {
          setSuppliersData({ ...suppliersData, ...data })
        }}
        onSave={() => {
          onSaveSupplier(suppliersData)
          setSupplierDrawerOpen(false)
          setSuppliersData(undefined)
        }}
        onDismiss={() => {
          setSupplierDrawerOpen(false)
          setSuppliersData(undefined)
        }}
      />
      <MaterialDrawer
        open={materialDrawerOpen}
        maxWeight={parent?.weight_grams ?? undefined}
        canSave={
          (partsData?.primary_material?.length ?? 0) > 0 &&
          (materialCompositionData?.weight_grams ?? 0) > 0
        }
        onDismiss={() => {
          setPartsData(undefined)
          setMaterialCompositionData(undefined)
          setMaterialDrawerOpen(false)
        }}
        onSave={async () => {
          const partsWithPartId = withRetakePartId(partsData)
          await withNotification([
            onSaveParts(partsWithPartId),
            onSaveMaterialComposition({
              ...materialCompositionData,
              retake_part_id: partsWithPartId.retake_part_id,
              lca_id: lcaID,
              org_id: user?.org_id,
            }),
            markIncomplete(),
          ]).then(refreshAll)
          setMaterialCompositionData(undefined)
          setMaterialDrawerOpen(false)
        }}
        partsData={partsData}
        materialCompositionData={materialCompositionData}
        onChangeMaterialComposition={(data) => {
          setMaterialCompositionData({
            ...materialCompositionData,
            ...data,
          })
        }}
        onChangeParts={(data) => {
          setPartsData({ ...partsData, ...data })
        }}
      />
      <ComponentDrawer
        open={componentDrawerOpen}
        isNewComponent={isNewComponent}
        partsData={partsData}
        materialCompositionData={materialCompositionData}
        maxWeight={parent?.weight_grams ?? undefined}
        onDismiss={() => {
          setMaterialCompositionData(undefined)
          setPartsData(undefined)
          setComponentDrawerOpen(false)
          setIsNewComponent(false)
        }}
        onSave={() => {
          const partsWithRetakeId = withRetakePartId(partsData)

          withNotification([
            onSaveParts(partsWithRetakeId),
            onSaveMaterialComposition({
              ...materialCompositionData,
              retake_part_id: partsWithRetakeId.retake_part_id,
              lca_id: lcaID,
              org_id: user?.org_id,
            }),
            markIncomplete(),
          ]).then(refreshAll)
          setMaterialCompositionData(undefined)
          setPartsData(undefined)
          setComponentDrawerOpen(false)
          setIsNewComponent(false)
        }}
        onChangeMaterialComposition={(data) => {
          setMaterialCompositionData({
            ...materialCompositionData,
            ...data,
          })
        }}
        onChangeParts={(data) => {
          setPartsData({ ...partsData, ...data })
        }}
        onClickCreateSupplier={() => {
          setMaterialCompositionData(undefined)
          setPartsData(undefined)
          setComponentDrawerOpen(false)
          setSupplierDrawerOpen(true)
        }}
      />
      <ComponentWeightDrawer
        open={componentWeightDrawerOpen}
        canSave={
          [
            partsData?.customer_part_id,
            partsData?.part_description,
            materialCompositionData?.weight_grams,
          ].every((value) => value !== undefined) ||
          [
            partsData?.primary_material,
            materialCompositionData?.weight_grams,
          ].every((value) => value !== undefined)
        }
        partsData={partsData}
        materialCompositionData={materialCompositionData}
        supplierData={selectedSuppliers}
        onChangeParts={(data) => {
          setPartsData({ ...partsData, ...data })
        }}
        onChangeMaterialComposition={(data) => {
          setMaterialCompositionData({
            ...materialCompositionData,
            ...data,
          })
        }}
        onSave={() => {
          withNotification([
            onSaveMaterialComposition(materialCompositionData ?? {}),
            onSaveParts(partsData ?? {}),
            markIncomplete(),
          ]).then(refreshAll)
          setMaterialCompositionData(undefined)
          setComponentWeightDrawerOpen(false)
        }}
        onDismiss={() => {
          setComponentWeightDrawerOpen(false)
        }}
        onClickEdit={() => {
          setComponentWeightDrawerOpen(false)
          setComponentDrawerOpen(true)
        }}
        maxWeight={parent?.weight_grams}
      />
      <ComponentDropdownDrawer
        open={componentDropdownOpen}
        canSave={(materialCompositionData?.weight_grams ?? 0) > 0}
        partsData={partsData}
        materialCompositionData={materialCompositionData}
        onChangeParts={(data) => {
          setPartsData({
            ...partsData,
            ...data,
          })
        }}
        onChangeMaterialComposition={(data) => {
          setMaterialCompositionData({
            ...materialCompositionData,
            ...data,
          })
        }}
        onSave={() => {
          const partsWithPartId = withRetakePartId(partsData)
          withNotification([
            onSaveParts(partsWithPartId, false),
            onSaveMaterialComposition({
              ...materialCompositionData,
              retake_part_id: partsWithPartId.retake_part_id,
              lca_id: lcaID,
              org_id: user?.org_id,
            }),
            markIncomplete(),
          ]).then(refreshAll)
          setMaterialCompositionData(undefined)
          setPartsData(undefined)
          setComponentDropdownOpen(false)
        }}
        onCreate={() => {
          setComponentDropdownOpen(false)
          setIsNewComponent(true)
          setComponentDrawerOpen(true)
        }}
        onDismiss={() => {
          setMaterialCompositionData(undefined)
          setPartsData(undefined)
          setComponentDropdownOpen(false)
        }}
        maxWeight={parent?.weight_grams}
      />
      <Flex>
        <TextInput
          placeholder="Search"
          maxWidth="max-w-sm"
          icon={MagnifyingGlassIcon}
        />
        <Flex justifyContent="justify-end" spaceX="space-x-6">
          <Button
            text="Add Component"
            icon={Bars3BottomLeftIcon}
            onClick={() => setComponentDropdownOpen(true)}
            variant="light"
            color="indigo"
          />
          <Button
            text="Add Material"
            icon={Square3Stack3DIcon}
            onClick={() => setMaterialDrawerOpen(true)}
            variant="light"
            color="indigo"
          />
          {isDevelopment && (
            <Button
              text="Assign User"
              icon={UserCircleIcon}
              onClick={undefined}
              variant="light"
              color="indigo"
            />
          )}
          <CompletionButton
            complete={complete}
            canMarkComplete={canMarkComplete}
            lcaID={lcaID}
            stage={LCAStage.MATERIALS}
            onRefresh={refreshAll}
          />
        </Flex>
      </Flex>
      <Card shadow={false} marginTop="mt-6">
        <BreadCrumbs
          items={treePath ?? []}
          onClick={(item) => setParent(item)}
        />
        {sortedMaterials.length > 0 ? (
          <Table marginTop="mt-2">
            <TableHead>
              <TableRow>
                <TableHeaderCell> </TableHeaderCell>
                <TableHeaderCell>Description</TableHeaderCell>
                <TableHeaderCell>Identifier / SKU</TableHeaderCell>
                <TableHeaderCell>Percent of Total Weight</TableHeaderCell>
                <TableHeaderCell>Global Warming</TableHeaderCell>
                <TableHeaderCell> </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Text color="indigo">
                    <Bold>Total ({materials.length})</Bold>
                  </Text>
                </TableCell>
                <TableCell> </TableCell>
                <TableCell> </TableCell>
                <TableCell>
                  {parent?.weight_grams ? (
                    <Flex justifyContent="justify-start" spaceX="space-x-3">
                      <Text>
                        <Bold> {totalPercentWeight}%</Bold>
                      </Text>
                      {weightTooHigh && (
                        <Badge
                          text="Too high"
                          size="xs"
                          color="amber"
                          tooltip="The weight of this product's components cannot exceed 100%."
                          icon={ExclamationTriangleIcon}
                        />
                      )}
                      {weightTooLow && (
                        <Badge
                          text="Too low"
                          size="xs"
                          color="amber"
                          tooltip="The weight of this product's component's must be at least 95% of the parent weight."
                          icon={ExclamationTriangleIcon}
                        />
                      )}
                    </Flex>
                  ) : (
                    <Badge text="" />
                  )}
                </TableCell>
                <TableCell>
                  <Text>
                    <Bold>
                      {formatNumber(
                        sumBy(materials, "total_global_warming") ?? 0
                      )}{" "}
                      kg CO2-Eq
                    </Bold>
                  </Text>
                </TableCell>
                <TableCell> </TableCell>
              </TableRow>
              {
                sortedMaterials?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Menu
                        options={[
                          {
                            name: "Add Subcomponent",
                            icon: Bars3BottomLeftIcon,
                            onClick: () => {
                              setParent(item)
                              setComponentDropdownOpen(true)
                            },
                          },
                          {
                            name: "Add Sub-Material",
                            icon: Bars3BottomLeftIcon,
                            onClick: () => {
                              setParent(item)
                              setMaterialDrawerOpen(true)
                            },
                          },
                          {
                            name: "Remove",
                            icon: TrashIcon,
                            onClick: () => onRemoveMaterial(item),
                          },
                        ]}
                      />
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex space-x-4 cursor-pointer"
                        onClick={() => openComponentWeightDrawer(item)}
                      >
                        {item.part_description && (
                          <Text truncate={true}>{item.part_description}</Text>
                        )}
                        {item.primary_material ? (
                          item.part_description ? (
                            <Badge
                              text={item.primary_material}
                              color="stone"
                              size="xs"
                            />
                          ) : (
                            <Text truncate={true}>{item.primary_material}</Text>
                          )
                        ) : (
                          <></>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex space-x-4 cursor-pointer"
                        onClick={() => openComponentWeightDrawer(item)}
                      >
                        <Text truncate={true}>{item.customer_part_id}</Text>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex space-x-2 cursor-pointer"
                        onClick={() => openComponentWeightDrawer(item)}
                      >
                        {item.weight_grams && parent?.weight_grams && (
                          <Text>
                            {Math.round(
                              (item.weight_grams * 100) / parent.weight_grams
                            )}
                            %
                          </Text>
                        )}
                        <Badge
                          text={
                            item.weight_grams
                              ? `${formatNumber(item.weight_grams)} g`
                              : "Unset"
                          }
                          color="stone"
                          size="xs"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {!item.weight_grams ? (
                        <Badge
                          text="Not Available"
                          tooltip="A weight for this component must be provided for an emissions factor to be calculated."
                          color="stone"
                          size="xs"
                        />
                      ) : (
                        <ImpactBadge
                          activity={item.reference_product_name}
                          database={item.database_name}
                          source={item.impact_source}
                          impact={item.total_global_warming}
                          isLeaf={item.is_leaf}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {!item.is_leaf && (
                        <Button
                          icon={ChevronRightIcon}
                          variant="light"
                          color="stone"
                          onClick={() => {
                            setParent(item)
                          }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )) as any
              }
            </TableBody>
          </Table>
        ) : (
          <div className="pb-12">
            <Empty
              title="No Components or Materials Found"
              description="Add a component or material to get started. A component is a part or assembly specific to your company with an identifier or SKU. 
                A material is a generic raw material (e.g. steel, aluminum, plastic, etc.) that does not have an identifier or SKU."
              buttons={[
                <Button
                  icon={Bars3BottomLeftIcon}
                  text="Add Component"
                  color="indigo"
                  onClick={() => setComponentDropdownOpen(true)}
                  key={0}
                />,
                <Button
                  icon={Square3Stack3DIcon}
                  text="Add Material"
                  color="indigo"
                  variant="light"
                  onClick={() => setMaterialDrawerOpen(true)}
                  key={1}
                />,
              ]}
            />
          </div>
        )}
      </Card>
    </Card>
  )
}
